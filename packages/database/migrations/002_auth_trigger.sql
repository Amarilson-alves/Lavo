-- ============================================================
-- LAVÔ — Trigger: cria perfil automaticamente no cadastro
-- Rodar DEPOIS da migration 001
-- ============================================================

-- Função chamada quando um novo usuário se cadastra no Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role user_role;
begin
  -- Lê o role do metadata enviado no cadastro (default: 'client')
  v_role := coalesce(
    (new.raw_user_meta_data->>'role')::user_role,
    'client'
  );

  -- Insere na tabela users
  insert into public.users (id, email, full_name, phone, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone',
    v_role
  );

  -- Cria o perfil correto conforme o role
  if v_role = 'client' then
    insert into public.client_profiles (user_id) values (new.id);
  elsif v_role = 'partner' then
    insert into public.partner_profiles (user_id, business_name)
    values (
      new.id,
      coalesce(new.raw_user_meta_data->>'business_name', 'Meu Lava Car')
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Registra o trigger no auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
