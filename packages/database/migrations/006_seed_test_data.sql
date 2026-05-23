-- ============================================================
-- LAVÔ — Seed: 20 parceiros + 5 clientes para teste
-- Senha única para todos: Lavo@2026
-- Rodar no Supabase SQL Editor
-- ============================================================

create extension if not exists pgcrypto;

do $$
declare
  -- Senha computada uma vez (bcrypt cost 6 = rápido para seed)
  _pwd  text        := crypt('Lavo@2026', gen_salt('bf', 6));
  _inst uuid        := '00000000-0000-0000-0000-000000000000';
  _app  jsonb       := '{"provider":"email","providers":["email"]}';
  _now  timestamptz := now();

  -- Padrões de horário de funcionamento
  _wh_padrao jsonb := '[
    {"day":0,"open":"08:00","close":"18:00","is_open":false},
    {"day":1,"open":"08:00","close":"18:00","is_open":true},
    {"day":2,"open":"08:00","close":"18:00","is_open":true},
    {"day":3,"open":"08:00","close":"18:00","is_open":true},
    {"day":4,"open":"08:00","close":"18:00","is_open":true},
    {"day":5,"open":"08:00","close":"18:00","is_open":true},
    {"day":6,"open":"08:00","close":"13:00","is_open":true}
  ]';

  _wh_estendido jsonb := '[
    {"day":0,"open":"08:00","close":"16:00","is_open":true},
    {"day":1,"open":"07:30","close":"19:00","is_open":true},
    {"day":2,"open":"07:30","close":"19:00","is_open":true},
    {"day":3,"open":"07:30","close":"19:00","is_open":true},
    {"day":4,"open":"07:30","close":"19:00","is_open":true},
    {"day":5,"open":"07:30","close":"19:00","is_open":true},
    {"day":6,"open":"08:00","close":"16:00","is_open":true}
  ]';

  _wh_semana jsonb := '[
    {"day":0,"open":"08:00","close":"14:00","is_open":false},
    {"day":1,"open":"08:00","close":"17:30","is_open":true},
    {"day":2,"open":"08:00","close":"17:30","is_open":true},
    {"day":3,"open":"08:00","close":"17:30","is_open":true},
    {"day":4,"open":"08:00","close":"17:30","is_open":true},
    {"day":5,"open":"08:00","close":"17:30","is_open":true},
    {"day":6,"open":"08:00","close":"12:00","is_open":true}
  ]';

begin

  -- ============================================================
  -- 1. PARCEIROS — auth.users
  -- ============================================================
  insert into auth.users (
    id, instance_id, aud, role,
    email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_super_admin
  ) values
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro01@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Lava Car Premium SP","full_name":"Lava Car Premium SP"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro02@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Auto Spa Elite RJ","full_name":"Auto Spa Elite RJ"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro03@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Clean Motors BH","full_name":"Clean Motors BH"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro04@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Brilho Total Curitiba","full_name":"Brilho Total Curitiba"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro05@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Lavagem Express POA","full_name":"Lavagem Express POA"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro06@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Auto Clean Master","full_name":"Auto Clean Master"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro07@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Detalhamento Pro BSB","full_name":"Detalhamento Pro BSB"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro08@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"EcoLavagem Salvador","full_name":"EcoLavagem Salvador"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro09@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Shine Car Fortaleza","full_name":"Shine Car Fortaleza"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro10@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"AutoSpa Premium Recife","full_name":"AutoSpa Premium Recife"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro11@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Car Detail Center ABC","full_name":"Car Detail Center ABC"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro12@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Lava Car Express Floripa","full_name":"Lava Car Express Floripa"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro13@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Auto Brilho Manaus","full_name":"Auto Brilho Manaus"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro14@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Prime Detail Goiânia","full_name":"Prime Detail Goiânia"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro15@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Lava & Brilha Belém","full_name":"Lava & Brilha Belém"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro16@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Auto Spa Niterói","full_name":"Auto Spa Niterói"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro17@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Premium Detail Santos","full_name":"Premium Detail Santos"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro18@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Car Wash Vitória","full_name":"Car Wash Vitória"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro19@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Lava Car Natal","full_name":"Lava Car Natal"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'parceiro20@lavo.test', _pwd, _now, _app, '{"role":"partner","business_name":"Clean Auto JP","full_name":"Clean Auto JP"}'::jsonb, _now, _now, false);

  -- ============================================================
  -- 2. CLIENTES — auth.users
  -- ============================================================
  insert into auth.users (
    id, instance_id, aud, role,
    email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at, is_super_admin
  ) values
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'joao@lavo.test',   _pwd, _now, _app, '{"role":"client","full_name":"João Silva"}'::jsonb,     _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'maria@lavo.test',  _pwd, _now, _app, '{"role":"client","full_name":"Maria Santos"}'::jsonb,   _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'pedro@lavo.test',  _pwd, _now, _app, '{"role":"client","full_name":"Pedro Oliveira"}'::jsonb, _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'ana@lavo.test',    _pwd, _now, _app, '{"role":"client","full_name":"Ana Costa"}'::jsonb,      _now, _now, false),
    (gen_random_uuid(), _inst, 'authenticated', 'authenticated', 'carlos@lavo.test', _pwd, _now, _app, '{"role":"client","full_name":"Carlos Lima"}'::jsonb,    _now, _now, false);

  -- ============================================================
  -- 3. LOCALIZAÇÕES (trigger já criou partner_profiles)
  --    Busca partner_id via JOIN com public.users pelo email
  -- ============================================================

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Paulista', '1000', 'Bela Vista', 'São Paulo', 'SP', '01310-100', -23.5629, -46.6544, _wh_estendido
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro01@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Atlântica', '2000', 'Copacabana', 'Rio de Janeiro', 'RJ', '22021-001', -22.9667, -43.1742, _wh_padrao
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro02@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Afonso Pena', '3000', 'Centro', 'Belo Horizonte', 'MG', '30130-009', -19.9167, -43.9345, _wh_padrao
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro03@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Rua XV de Novembro', '500', 'Centro', 'Curitiba', 'PR', '80020-310', -25.4290, -49.2671, _wh_semana
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro04@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Ipiranga', '1200', 'Azenha', 'Porto Alegre', 'RS', '90160-093', -30.0346, -51.2177, _wh_padrao
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro05@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Brasil', '800', 'Jardim Guanabara', 'Campinas', 'SP', '13073-178', -22.9056, -47.0608, _wh_estendido
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro06@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'SHN Quadra 2', '300', 'Asa Norte', 'Brasília', 'DF', '70702-905', -15.7801, -47.9292, _wh_padrao
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro07@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Sete de Setembro', '700', 'Barris', 'Salvador', 'BA', '40060-001', -12.9714, -38.5014, _wh_semana
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro08@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Beira Mar', '400', 'Meireles', 'Fortaleza', 'CE', '60165-121', -3.7172, -38.5433, _wh_padrao
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro09@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Boa Viagem', '1500', 'Boa Viagem', 'Recife', 'PE', '51011-000', -8.1206, -34.9007, _wh_estendido
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro10@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Industrial', '250', 'Jardim', 'Santo André', 'SP', '09080-500', -23.6639, -46.5383, _wh_padrao
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro11@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Beira Mar Norte', '600', 'Agronômica', 'Florianópolis', 'SC', '88015-200', -27.5954, -48.5480, _wh_semana
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro12@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Eduardo Ribeiro', '900', 'Centro', 'Manaus', 'AM', '69010-001', -3.1019, -60.0250, _wh_padrao
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro13@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Goiás', '1100', 'Setor Central', 'Goiânia', 'GO', '74015-010', -16.6869, -49.2648, _wh_estendido
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro14@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Nazaré', '350', 'Nazaré', 'Belém', 'PA', '66035-170', -1.4558, -48.5044, _wh_padrao
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro15@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Rua da Conceição', '200', 'Centro', 'Niterói', 'RJ', '24020-084', -22.8969, -43.1043, _wh_padrao
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro16@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Ana Costa', '750', 'Gonzaga', 'Santos', 'SP', '11060-002', -23.9608, -46.3336, _wh_semana
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro17@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Jerônimo Monteiro', '400', 'Centro', 'Vitória', 'ES', '29010-002', -20.3155, -40.3128, _wh_padrao
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro18@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Prudente de Morais', '1300', 'Lagoa Nova', 'Natal', 'RN', '59020-405', -5.7945, -35.2110, _wh_estendido
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro19@lavo.test';

  insert into partner_locations (partner_id, address, number, neighborhood, city, state, zip_code, latitude, longitude, working_hours)
  select pp.id, 'Av. Epitácio Pessoa', '1800', 'Tambaú', 'João Pessoa', 'PB', '58039-000', -7.1195, -34.8450, _wh_padrao
  from partner_profiles pp join public.users u on u.id = pp.user_id where u.email = 'parceiro20@lavo.test';

  -- ============================================================
  -- 4. SERVIÇOS
  --    Variados por categoria e faixa de preço (Budget / Mid / Premium)
  -- ============================================================

  -- ── Lavagem Simples: todos os 20 parceiros ──
  insert into services (partner_id, name, description, category, duration_minutes, is_active, pricing)
  select pp.id,
    'Lavagem Simples',
    'Lavagem externa completa com shampoo automotivo',
    'lavagem', 30, true,
    '[{"vehicle_type":"hatch","price":30},{"vehicle_type":"sedan","price":40},{"vehicle_type":"suv","price":52},{"vehicle_type":"pickup","price":58}]'::jsonb
  from partner_profiles pp join public.users u on u.id = pp.user_id
  where u.email like 'parceiro0%@lavo.test' and u.email <= 'parceiro05@lavo.test';

  insert into services (partner_id, name, description, category, duration_minutes, is_active, pricing)
  select pp.id,
    'Lavagem Simples',
    'Lavagem externa completa com shampoo automotivo',
    'lavagem', 30, true,
    '[{"vehicle_type":"hatch","price":38},{"vehicle_type":"sedan","price":48},{"vehicle_type":"suv","price":62},{"vehicle_type":"pickup","price":68}]'::jsonb
  from partner_profiles pp join public.users u on u.id = pp.user_id
  where u.email like 'parceiro%@lavo.test'
    and u.email >= 'parceiro06@lavo.test' and u.email <= 'parceiro14@lavo.test';

  insert into services (partner_id, name, description, category, duration_minutes, is_active, pricing)
  select pp.id,
    'Lavagem Simples',
    'Lavagem externa completa com shampoo automotivo',
    'lavagem', 30, true,
    '[{"vehicle_type":"hatch","price":45},{"vehicle_type":"sedan","price":58},{"vehicle_type":"suv","price":75},{"vehicle_type":"pickup","price":82}]'::jsonb
  from partner_profiles pp join public.users u on u.id = pp.user_id
  where u.email like 'parceiro%@lavo.test' and u.email >= 'parceiro15@lavo.test';

  -- ── Lavagem Completa: parceiros 01-19 (exceto 05, 12 — só simples) ──
  insert into services (partner_id, name, description, category, duration_minutes, is_active, pricing)
  select pp.id,
    'Lavagem Completa',
    'Lavagem externa + limpeza interna, aspiração e perfume',
    'lavagem', 60, true,
    '[{"vehicle_type":"hatch","price":65},{"vehicle_type":"sedan","price":80},{"vehicle_type":"suv","price":100},{"vehicle_type":"pickup","price":110}]'::jsonb
  from partner_profiles pp join public.users u on u.id = pp.user_id
  where u.email like 'parceiro%@lavo.test'
    and u.email not in ('parceiro05@lavo.test','parceiro12@lavo.test','parceiro20@lavo.test');

  -- ── Higienização Interna: parceiros 01-04, 06-11, 13, 16, 17, 19 ──
  insert into services (partner_id, name, description, category, duration_minutes, is_active, pricing)
  select pp.id,
    'Higienização Interna',
    'Limpeza profunda de tapetes, bancos, teto e painéis com extratora',
    'higienizacao', 180, true,
    '[{"vehicle_type":"hatch","price":180},{"vehicle_type":"sedan","price":220},{"vehicle_type":"suv","price":290},{"vehicle_type":"pickup","price":320}]'::jsonb
  from partner_profiles pp join public.users u on u.id = pp.user_id
  where u.email in (
    'parceiro01@lavo.test','parceiro02@lavo.test','parceiro03@lavo.test','parceiro04@lavo.test',
    'parceiro06@lavo.test','parceiro07@lavo.test','parceiro08@lavo.test','parceiro09@lavo.test',
    'parceiro10@lavo.test','parceiro11@lavo.test','parceiro13@lavo.test',
    'parceiro16@lavo.test','parceiro17@lavo.test','parceiro19@lavo.test'
  );

  -- ── Polimento: parceiros premium e mid ──
  insert into services (partner_id, name, description, category, duration_minutes, is_active, pricing)
  select pp.id,
    'Polimento Técnico',
    'Correção de pintura com máquina orbital e selante de proteção',
    'polimento', 240, true,
    '[{"vehicle_type":"hatch","price":280},{"vehicle_type":"sedan","price":350},{"vehicle_type":"suv","price":450},{"vehicle_type":"pickup","price":500}]'::jsonb
  from partner_profiles pp join public.users u on u.id = pp.user_id
  where u.email in (
    'parceiro01@lavo.test','parceiro02@lavo.test','parceiro04@lavo.test',
    'parceiro07@lavo.test','parceiro10@lavo.test','parceiro11@lavo.test',
    'parceiro14@lavo.test','parceiro15@lavo.test','parceiro16@lavo.test',
    'parceiro17@lavo.test','parceiro18@lavo.test'
  );

  -- ── Cristalização: parceiros premium ──
  insert into services (partner_id, name, description, category, duration_minutes, is_active, pricing)
  select pp.id,
    'Cristalização de Vidros',
    'Tratamento hidrofóbico nos vidros para melhor visibilidade na chuva',
    'polimento', 90, true,
    '[{"vehicle_type":"hatch","price":120},{"vehicle_type":"sedan","price":140},{"vehicle_type":"suv","price":170},{"vehicle_type":"pickup","price":185}]'::jsonb
  from partner_profiles pp join public.users u on u.id = pp.user_id
  where u.email in (
    'parceiro01@lavo.test','parceiro07@lavo.test',
    'parceiro10@lavo.test','parceiro17@lavo.test','parceiro14@lavo.test'
  );

  -- ── Cerâmica: apenas parceiros top ──
  insert into services (partner_id, name, description, category, duration_minutes, is_active, pricing)
  select pp.id,
    'Revestimento Cerâmico',
    'Proteção cerâmica profissional com durabilidade de 2 a 5 anos',
    'ceramica', 480, true,
    '[{"vehicle_type":"hatch","price":1200},{"vehicle_type":"sedan","price":1500},{"vehicle_type":"suv","price":1900},{"vehicle_type":"pickup","price":2100}]'::jsonb
  from partner_profiles pp join public.users u on u.id = pp.user_id
  where u.email in (
    'parceiro01@lavo.test','parceiro07@lavo.test',
    'parceiro10@lavo.test','parceiro17@lavo.test'
  );

  -- ── PPF (Proteção de Pintura): top premium ──
  insert into services (partner_id, name, description, category, duration_minutes, is_active, pricing)
  select pp.id,
    'PPF — Película Protetora',
    'Film de poliuretano autorreparável protegendo a pintura de riscos e pedras',
    'ceramica', 720, true,
    '[{"vehicle_type":"hatch","price":3500},{"vehicle_type":"sedan","price":4500},{"vehicle_type":"suv","price":6000},{"vehicle_type":"pickup","price":6800}]'::jsonb
  from partner_profiles pp join public.users u on u.id = pp.user_id
  where u.email in ('parceiro01@lavo.test','parceiro17@lavo.test');

  -- ============================================================
  -- 5. ATIVA todos os parceiros e define ratings realistas
  -- ============================================================
  update partner_profiles pp
  set
    is_active = true,
    rating = case
      when u.email in ('parceiro01@lavo.test','parceiro07@lavo.test','parceiro10@lavo.test') then 4.9
      when u.email in ('parceiro02@lavo.test','parceiro04@lavo.test','parceiro17@lavo.test') then 4.7
      when u.email in ('parceiro03@lavo.test','parceiro11@lavo.test','parceiro14@lavo.test') then 4.5
      when u.email in ('parceiro06@lavo.test','parceiro09@lavo.test','parceiro16@lavo.test') then 4.3
      when u.email in ('parceiro08@lavo.test','parceiro13@lavo.test','parceiro19@lavo.test') then 4.1
      else 3.8
    end,
    total_reviews = case
      when u.email in ('parceiro01@lavo.test','parceiro07@lavo.test') then 142
      when u.email in ('parceiro02@lavo.test','parceiro10@lavo.test') then 98
      when u.email in ('parceiro03@lavo.test','parceiro04@lavo.test') then 67
      when u.email in ('parceiro11@lavo.test','parceiro17@lavo.test') then 45
      else floor(random() * 30 + 5)::int
    end
  from public.users u
  where u.id = pp.user_id
    and u.email like 'parceiro%@lavo.test';

end;
$$;
