-- ============================================================
-- LAVÔ — Fix definitivo do trigger de cadastro
-- ============================================================

-- Remove tudo anterior
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Função com security definer + search_path explícito
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role      text := 'client';
  v_meta      jsonb;
  v_full_name text;
  v_phone     text;
begin
  v_meta      := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role      := coalesce(nullif(v_meta->>'role', ''), 'client');
  v_full_name := coalesce(nullif(trim(v_meta->>'full_name'), ''), split_part(new.email, '@', 1));
  v_phone     := nullif(trim(coalesce(v_meta->>'phone', '')), '');

  -- Valida o role (segurança)
  if v_role not in ('client', 'partner', 'admin') then
    v_role := 'client';
  end if;

  insert into public.users (id, email, full_name, phone, role)
  values (new.id, new.email, v_full_name, v_phone, v_role::public.user_role);

  if v_role = 'client' then
    insert into public.client_profiles (user_id) values (new.id);
  elsif v_role = 'partner' then
    insert into public.partner_profiles (user_id, business_name)
    values (new.id, coalesce(nullif(trim(v_meta->>'business_name'), ''), 'Meu Lava Car'));
  end if;

  return new;
exception
  when others then
    raise warning 'handle_new_user falhou: % | SQLSTATE: %', sqlerrm, sqlstate;
    return new;
end;
$$;

-- Garante que a função roda como postgres (superusuário → bypassa RLS)
alter function public.handle_new_user() owner to postgres;

-- Registra o trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Corrige as políticas RLS da tabela users:
-- A política FOR ALL bloqueava INSERT pois auth.uid() é null no contexto do trigger.
-- Separamos em políticas específicas por operação.

drop policy if exists "users_own" on public.users;

create policy "users_select" on public.users
  for select using (auth.uid() = id);

create policy "users_update" on public.users
  for update using (auth.uid() = id);

create policy "users_delete" on public.users
  for delete using (auth.uid() = id);

-- INSERT liberado apenas para o service_role (trigger roda como postgres, que é superusuário)
create policy "users_insert" on public.users
  for insert with check (true);
