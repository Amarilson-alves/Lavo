-- ============================================================
-- LAVÔ — Corrige o trigger de cadastro (substitui o 002)
-- ============================================================

-- Remove o trigger e função anteriores
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Versão corrigida: trata metadados nulos e erros de cast
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role      user_role := 'client';
  v_meta      jsonb;
  v_full_name text;
  v_phone     text;
  v_role_str  text;
begin
  -- Garante que meta nunca é null
  v_meta := coalesce(new.raw_user_meta_data, '{}'::jsonb);

  -- Lê role com proteção contra valor inválido
  v_role_str := v_meta->>'role';
  if v_role_str in ('client', 'partner', 'admin') then
    v_role := v_role_str::user_role;
  end if;

  v_full_name := coalesce(
    nullif(trim(v_meta->>'full_name'), ''),
    split_part(new.email, '@', 1)
  );
  v_phone := nullif(trim(coalesce(v_meta->>'phone', '')), '');

  -- Cria registro na tabela users
  insert into public.users (id, email, full_name, phone, role)
  values (new.id, new.email, v_full_name, v_phone, v_role);

  -- Cria perfil conforme o role
  if v_role = 'client' then
    insert into public.client_profiles (user_id) values (new.id);
  elsif v_role = 'partner' then
    insert into public.partner_profiles (user_id, business_name)
    values (
      new.id,
      coalesce(nullif(trim(v_meta->>'business_name'), ''), 'Meu Lava Car')
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Reregistra o trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
