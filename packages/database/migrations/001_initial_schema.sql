-- ============================================================
-- LAVÔ — Schema inicial do banco de dados
-- Supabase / PostgreSQL
-- ============================================================

-- Habilitar extensões necessárias
create extension if not exists "uuid-ossp";
create extension if not exists "postgis";  -- para geolocalização

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role as enum ('client', 'partner', 'admin');
create type vehicle_type as enum ('hatch', 'sedan', 'suv', 'pickup', 'van', 'motorcycle');
create type service_category as enum ('lavagem', 'polimento', 'higienizacao', 'ceramica', 'outros');
create type booking_status as enum ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
create type payment_status as enum ('pending', 'paid', 'refunded', 'failed');
create type payment_method as enum ('pix', 'credit_card', 'debit_card');
create type withdrawal_status as enum ('pending', 'processing', 'done', 'failed');

-- ============================================================
-- USERS (estende auth.users do Supabase)
-- ============================================================

create table public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  phone       text,
  full_name   text not null,
  avatar_url  text,
  role        user_role not null default 'client',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ============================================================
-- CLIENT PROFILES
-- ============================================================

create table public.client_profiles (
  id                  uuid primary key default uuid_generate_v4(),
  user_id             uuid not null references public.users(id) on delete cascade,
  cpf                 text,
  default_address_id  uuid,
  created_at          timestamptz not null default now(),
  unique(user_id)
);

-- ============================================================
-- PARTNER PROFILES (lava cars)
-- ============================================================

create table public.partner_profiles (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references public.users(id) on delete cascade,
  business_name    text not null,
  cnpj             text,
  description      text,
  logo_url         text,
  cover_url        text,
  rating           numeric(3,2) not null default 0,
  total_reviews    integer not null default 0,
  is_active        boolean not null default false,
  is_verified      boolean not null default false,
  asaas_account_id text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique(user_id)
);

-- ============================================================
-- PARTNER LOCATIONS
-- ============================================================

create table public.partner_locations (
  id            uuid primary key default uuid_generate_v4(),
  partner_id    uuid not null references public.partner_profiles(id) on delete cascade,
  address       text not null,
  number        text,
  complement    text,
  neighborhood  text,
  city          text not null,
  state         text not null,
  zip_code      text not null,
  latitude      double precision not null,
  longitude     double precision not null,
  geom          geography(Point, 4326),  -- para busca por proximidade
  working_hours jsonb not null default '[]',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Índice espacial para busca por proximidade
create index partner_locations_geom_idx on public.partner_locations using gist(geom);

-- Trigger para atualizar geom automaticamente
create or replace function update_partner_location_geom()
returns trigger as $$
begin
  new.geom = st_makepoint(new.longitude, new.latitude)::geography;
  return new;
end;
$$ language plpgsql;

create trigger trg_partner_location_geom
  before insert or update on public.partner_locations
  for each row execute function update_partner_location_geom();

-- ============================================================
-- SERVICES
-- ============================================================

create table public.services (
  id               uuid primary key default uuid_generate_v4(),
  partner_id       uuid not null references public.partner_profiles(id) on delete cascade,
  name             text not null,
  description      text,
  category         service_category not null,
  duration_minutes integer not null,
  is_active        boolean not null default true,
  pricing          jsonb not null default '[]',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================
-- VEHICLES (dos clientes)
-- ============================================================

create table public.vehicles (
  id        uuid primary key default uuid_generate_v4(),
  client_id uuid not null references public.client_profiles(id) on delete cascade,
  plate     text not null,
  brand     text not null,
  model     text not null,
  year      integer not null,
  color     text not null,
  type      vehicle_type not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- BOOKINGS (agendamentos)
-- ============================================================

create table public.bookings (
  id               uuid primary key default uuid_generate_v4(),
  client_id        uuid not null references public.client_profiles(id),
  partner_id       uuid not null references public.partner_profiles(id),
  service_id       uuid not null references public.services(id),
  vehicle_id       uuid not null references public.vehicles(id),
  scheduled_at     timestamptz not null,
  status           booking_status not null default 'pending',
  payment_status   payment_status not null default 'pending',
  payment_method   payment_method,
  price            numeric(10,2) not null,
  platform_fee     numeric(10,2) not null,
  partner_amount   numeric(10,2) not null,
  notes            text,
  asaas_payment_id text,
  rating           smallint check (rating between 1 and 5),
  review           text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index bookings_client_idx on public.bookings(client_id);
create index bookings_partner_idx on public.bookings(partner_id);
create index bookings_scheduled_at_idx on public.bookings(scheduled_at);

-- ============================================================
-- PAYMENTS
-- ============================================================

create table public.payments (
  id           uuid primary key default uuid_generate_v4(),
  booking_id   uuid not null references public.bookings(id),
  asaas_id     text not null unique,
  amount       numeric(10,2) not null,
  net_amount   numeric(10,2) not null,
  status       text not null default 'PENDING',
  billing_type text not null,
  pix_qr_code  text,
  pix_expiry   timestamptz,
  invoice_url  text,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- PARTNER BALANCES
-- ============================================================

create table public.partner_balances (
  partner_id        uuid primary key references public.partner_profiles(id),
  total_earned      numeric(10,2) not null default 0,
  total_withdrawn   numeric(10,2) not null default 0,
  available_balance numeric(10,2) not null default 0,
  pending_balance   numeric(10,2) not null default 0,
  updated_at        timestamptz not null default now()
);

-- ============================================================
-- WITHDRAWALS (saques dos parceiros)
-- ============================================================

create table public.withdrawals (
  id                  uuid primary key default uuid_generate_v4(),
  partner_id          uuid not null references public.partner_profiles(id),
  amount              numeric(10,2) not null,
  status              withdrawal_status not null default 'pending',
  asaas_transfer_id   text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table public.notifications (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references public.users(id) on delete cascade,
  title      text not null,
  body       text not null,
  type       text not null,
  data       jsonb,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id, created_at desc);

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function update_updated_at();

create trigger trg_partner_profiles_updated_at
  before update on public.partner_profiles
  for each row execute function update_updated_at();

create trigger trg_bookings_updated_at
  before update on public.bookings
  for each row execute function update_updated_at();

create trigger trg_services_updated_at
  before update on public.services
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table public.users enable row level security;
alter table public.client_profiles enable row level security;
alter table public.partner_profiles enable row level security;
alter table public.partner_locations enable row level security;
alter table public.services enable row level security;
alter table public.vehicles enable row level security;
alter table public.bookings enable row level security;
alter table public.payments enable row level security;
alter table public.partner_balances enable row level security;
alter table public.withdrawals enable row level security;
alter table public.notifications enable row level security;

-- Users: vê apenas o próprio perfil
create policy "users_own" on public.users
  for all using (auth.uid() = id);

-- Client profiles: cliente vê o próprio
create policy "client_profiles_own" on public.client_profiles
  for all using (auth.uid() = user_id);

-- Partner profiles: público para leitura, parceiro edita o próprio
create policy "partner_profiles_read" on public.partner_profiles
  for select using (true);

create policy "partner_profiles_write" on public.partner_profiles
  for all using (auth.uid() = user_id);

-- Services: público para leitura
create policy "services_read" on public.services
  for select using (is_active = true);

create policy "services_write" on public.services
  for all using (
    auth.uid() = (select user_id from public.partner_profiles where id = partner_id)
  );

-- Vehicles: apenas o próprio cliente
create policy "vehicles_own" on public.vehicles
  for all using (
    auth.uid() = (select user_id from public.client_profiles where id = client_id)
  );

-- Bookings: cliente vê os próprios, parceiro vê os que recebe
create policy "bookings_client" on public.bookings
  for all using (
    auth.uid() = (select user_id from public.client_profiles where id = client_id)
  );

create policy "bookings_partner" on public.bookings
  for select using (
    auth.uid() = (select user_id from public.partner_profiles where id = partner_id)
  );

create policy "bookings_partner_update" on public.bookings
  for update using (
    auth.uid() = (select user_id from public.partner_profiles where id = partner_id)
  );

-- Notifications: apenas o próprio usuário
create policy "notifications_own" on public.notifications
  for all using (auth.uid() = user_id);

-- Partner balances: apenas o próprio parceiro
create policy "partner_balances_own" on public.partner_balances
  for select using (
    auth.uid() = (select user_id from public.partner_profiles where id = partner_id)
  );
