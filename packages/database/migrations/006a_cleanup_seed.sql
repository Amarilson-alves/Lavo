-- ============================================================
-- LAVÔ — Limpeza do seed de teste
-- Rodar ANTES de repetir o 006_seed_test_data.sql
-- ============================================================

-- Serviços dos parceiros de teste
delete from public.services s
using public.partner_profiles pp
join public.users u on u.id = pp.user_id
where s.partner_id = pp.id and u.email like '%@lavo.test';

-- Localizações dos parceiros de teste
delete from public.partner_locations pl
using public.partner_profiles pp
join public.users u on u.id = pp.user_id
where pl.partner_id = pp.id and u.email like '%@lavo.test';

-- Perfis de parceiro
delete from public.partner_profiles pp
using public.users u
where pp.user_id = u.id and u.email like '%@lavo.test';

-- Perfis de cliente
delete from public.client_profiles cp
using public.users u
where cp.user_id = u.id and u.email like '%@lavo.test';

-- Usuários públicos
delete from public.users where email like '%@lavo.test';

-- Identidades de auth (necessário para login funcionar)
delete from auth.identities where email like '%@lavo.test';

-- Usuários de auth
delete from auth.users where email like '%@lavo.test';
