-- ============================================================
-- LAVÔ — Corrige policies RLS faltando
-- Rodar no Supabase SQL Editor após 001 e 004
-- ============================================================

-- Partner locations: leitura pública (clientes precisam ver endereço/horários)
create policy "partner_locations_read" on public.partner_locations
  for select using (true);

-- Partner locations: parceiro gerencia a própria localização
create policy "partner_locations_write" on public.partner_locations
  for all using (
    auth.uid() = (select user_id from public.partner_profiles where id = partner_id)
  );

-- Partner balances: parceiro pode ver o próprio saldo
create policy "partner_balances_write" on public.partner_balances
  for all using (
    auth.uid() = (select user_id from public.partner_profiles where id = partner_id)
  );

-- Withdrawals: parceiro gerencia os próprios saques
create policy "withdrawals_own" on public.withdrawals
  for all using (
    auth.uid() = (select user_id from public.partner_profiles where id = partner_id)
  );

-- Payments: partes envolvidas no agendamento podem ver
create policy "payments_read" on public.payments
  for select using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id
      and (
        auth.uid() = (select user_id from public.client_profiles where id = b.client_id)
        or auth.uid() = (select user_id from public.partner_profiles where id = b.partner_id)
      )
    )
  );

-- Services: parceiro vê todos os próprios (inclusive inativos)
create policy "services_partner_all" on public.services
  for select using (
    auth.uid() = (select user_id from public.partner_profiles where id = partner_id)
  );

-- Bookings: garante que parceiro pode atualizar status
create policy "bookings_partner_status" on public.bookings
  for update using (
    auth.uid() = (select user_id from public.partner_profiles where id = partner_id)
  );

-- Vehicles: qualquer usuário autenticado pode ler info básica do veículo
-- (necessário para parceiros verem dados do veículo nos agendamentos)
create policy "vehicles_read_authenticated" on public.vehicles
  for select using (auth.uid() is not null);

-- Client profiles: parceiros precisam ver perfil do cliente em agendamentos
create policy "client_profiles_read_authenticated" on public.client_profiles
  for select using (auth.uid() is not null);
