<div align="center">

# 🚗 LAVÔ

**Marketplace de Lava Rápido com Agendamento em Tempo Real**

[![CI](https://github.com/Amarilson-alves/Lavo/actions/workflows/ci.yml/badge.svg)](https://github.com/Amarilson-alves/Lavo/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9-f69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Expo SDK](https://img.shields.io/badge/Expo-51-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com/)

<br/>

> Conecte donos de veículos aos melhores lava cars da região.  
> Agendamento em tempo real, pagamentos integrados e dashboard completo para parceiros.

</div>

---

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados](#banco-de-dados)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Deploy](#deploy)
- [Roadmap](#roadmap)
- [Contribuição](#contribuição)
- [Licença](#licença)

---

## Visão Geral

**Lavô** é um marketplace SaaS que conecta clientes que precisam lavar o carro a parceiros (lava cars) próximos. Funciona como um "iFood para lava cars" — o cliente descobre parceiros, escolhe o serviço, agenda e paga pelo app. O parceiro gerencia tudo pelo dashboard web.

O modelo de negócio cobra uma **taxa de plataforma de 15%** sobre cada transação. O parceiro recebe 85% do valor do serviço.

---

## Funcionalidades

### Para Clientes (App Mobile)
- Registro e login com e-mail/senha
- Busca e exploração de lava cars próximos
- Visualização de perfil, serviços e horários do parceiro
- Cadastro e gerenciamento de veículos
- Agendamento de serviços com seleção de data e horário
- Acompanhamento de status dos agendamentos em tempo real
- Avaliação e review após conclusão do serviço

### Para Parceiros (Dashboard Web)
- Registro e login dedicado
- Dashboard com KPIs: faturamento do mês, agendamentos do dia, avaliação média, taxa de conclusão
- Gerenciamento de serviços (CRUD com preço por tipo de veículo)
- Lista de agendamentos com filtros por status e busca por cliente
- Confirmação, início e conclusão de serviços
- Configurações: informações do negócio, localização com coordenadas, horários de funcionamento
- Análises e relatórios financeiros *(em desenvolvimento)*

---

## Stack Tecnológica

| Camada        | Tecnologia                                                    |
|---------------|---------------------------------------------------------------|
| Mobile        | Expo SDK 51, Expo Router v3, React Native 0.74, NativeWind 4 |
| Web           | Next.js 14 (App Router), Tailwind CSS, Sonner, Recharts      |
| State / Data  | TanStack Query v5, Zustand                                    |
| Forms         | React Hook Form + Zod                                         |
| Backend / DB  | Supabase (PostgreSQL 15, PostGIS, Auth, RLS, Storage)         |
| Pagamentos    | Asaas *(integração planejada)*                                |
| Monorepo      | pnpm Workspaces + Turborepo                                   |
| Tipagem       | TypeScript 5.4 strict mode                                    |
| CI/CD         | GitHub Actions                                                |
| Icons         | Lucide React / Lucide React Native                            |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENTES                           │
│               App Mobile (Expo / RN)                    │
│         iOS  ·  Android  ·  Web (preview)               │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    SUPABASE                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │   Auth   │  │PostgREST │  │  Storage │             │
│  │  (JWT)   │  │   API    │  │ (avatars)│             │
│  └──────────┘  └──────────┘  └──────────┘             │
│                                                         │
│  PostgreSQL 15 + PostGIS + RLS                         │
│  users · partner_profiles · partner_locations           │
│  services · vehicles · bookings · payments              │
│  partner_balances · withdrawals · notifications         │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    PARCEIROS                            │
│          Dashboard Web (Next.js 14)                     │
│    /dashboard · /bookings · /services · /settings       │
└─────────────────────────────────────────────────────────┘
```

**Modelo de dados simplificado:**

```
auth.users ──── users ──┬── client_profiles ──── vehicles
                        │                   └── bookings ──── services
                        └── partner_profiles ─── partner_locations
                                            └── services
```

**Segurança:** Row Level Security habilitado em todas as tabelas. Cada usuário acessa apenas os dados para os quais tem permissão por política explícita.

---

## Estrutura do Projeto

```
lavo/
├── apps/
│   ├── mobile/                    # App React Native (Expo)
│   │   ├── app/
│   │   │   ├── (auth)/            # Login, registro, boas-vindas
│   │   │   └── (client)/          # Tabs: home, explorar, agendamentos, perfil
│   │   │       ├── booking/       # Novo agendamento, sucesso
│   │   │       ├── partner/[id]   # Perfil do parceiro
│   │   │       └── vehicles.tsx   # Gerenciamento de veículos
│   │   └── src/hooks/             # useAuth, useBookings, usePartners, useVehicles, useProfile
│   │
│   └── web/                       # Dashboard Next.js 14 (App Router)
│       └── src/
│           ├── app/
│           │   ├── (auth)/login   # Login do parceiro
│           │   └── (dashboard)/   # Dashboard, agendamentos, serviços, configurações
│           └── lib/
│               ├── hooks/         # usePartnerData (React Query)
│               └── supabase/      # client.ts, server.ts
│
├── packages/
│   ├── database/
│   │   ├── migrations/            # SQL migrations (001–005)
│   │   └── src/                   # Supabase client tipado
│   └── shared/
│       └── src/
│           ├── types/             # booking.ts, user.ts, service.ts, payment.ts
│           └── constants/         # PLATFORM_FEE_PERCENT = 0.15
│
├── .github/
│   ├── workflows/ci.yml           # GitHub Actions: lint + typecheck + build
│   ├── ISSUE_TEMPLATE/            # Bug report e feature request
│   └── pull_request_template.md
│
├── .env.example                   # Template de variáveis de ambiente
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

---

## Pré-requisitos

- **Node.js** 20+
- **pnpm** 9+ (`npm install -g pnpm`)
- **Conta Supabase** — [supabase.com](https://supabase.com)
- **Expo CLI** para desenvolvimento mobile (`npm install -g expo-cli`)
- **Expo Go** no celular ou emulador configurado

---

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/Amarilson-alves/Lavo.git
cd Lavo
```

### 2. Instale as dependências

```bash
pnpm install
```

> No Windows ou se houver erros de módulos não encontrados no Expo, o projeto já possui `.npmrc` com `shamefully-hoist=true` para resolver isolamento do pnpm com React Native.

### 3. Configure as variáveis de ambiente

```bash
# Dashboard web
cp apps/web/.env.example apps/web/.env.local

# App mobile
cp apps/mobile/.env.example apps/mobile/.env.local
```

Preencha os valores no Supabase Dashboard → Settings → API.

### 4. Configure o banco de dados

Execute as migrations em ordem no **SQL Editor do Supabase**:

```
packages/database/migrations/001_initial_schema.sql
packages/database/migrations/002_auth_trigger.sql
packages/database/migrations/003_fix_auth_trigger.sql
packages/database/migrations/004_fix_trigger_final.sql
packages/database/migrations/005_fix_rls_policies.sql
```

### 5. Inicie o desenvolvimento

```bash
# Tudo ao mesmo tempo (recomendado)
pnpm dev

# Ou separado:
pnpm web     # Dashboard: http://localhost:3000
pnpm mobile  # App Expo: QR code no terminal
```

---

## Variáveis de Ambiente

### `apps/web/.env.local`

| Variável | Descrição | Obrigatório |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave service role — **somente server-side** | Sim |
| `ASAAS_API_KEY` | Chave da API Asaas para pagamentos | Quando ativado |
| `ASAAS_ENV` | `sandbox` ou `production` | Quando ativado |
| `GOOGLE_MAPS_API_KEY` | Chave do Google Maps | Não |

### `apps/mobile/.env.local`

| Variável | Descrição | Obrigatório |
|---|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Sim |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon) do Supabase | Sim |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | Chave do Google Maps | Não |

> **Segurança:** A `SUPABASE_SERVICE_ROLE_KEY` tem acesso total ao banco — nunca use no cliente (mobile ou browser). Apenas server-side Next.js.

---

## Banco de Dados

### Tabelas principais

| Tabela | Descrição |
|--------|-----------|
| `users` | Estende `auth.users` com role (client/partner/admin) |
| `client_profiles` | Perfil do cliente com CPF |
| `partner_profiles` | Perfil do lava car com rating e dados do negócio |
| `partner_locations` | Endereço + coordenadas + horários de funcionamento (PostGIS) |
| `services` | Serviços ofertados com pricing por tipo de veículo (JSONB) |
| `vehicles` | Veículos dos clientes |
| `bookings` | Agendamentos com status, preço e taxas |
| `payments` | Integração Asaas com PIX e cartão |
| `partner_balances` | Saldo disponível e a sacar do parceiro |
| `withdrawals` | Histórico de saques |
| `notifications` | Notificações push in-app |

### RLS (Row Level Security)

Todas as tabelas têm RLS habilitado. As políticas garantem:
- Clientes acessam apenas seus próprios dados (veículos, agendamentos, perfil)
- Parceiros acessam apenas seus serviços, localização e agendamentos recebidos
- Perfis de parceiros e localizações são públicos para leitura (clientes precisam visualizar)
- Dados sensíveis (saldos, saques, pagamentos) acessíveis apenas pelo próprio titular

---

## Scripts Disponíveis

```bash
pnpm dev           # Inicia todos os apps (Turborepo)
pnpm build         # Build de produção de todos os apps
pnpm lint          # ESLint em todos os packages
pnpm type-check    # TypeScript check em todos os packages
pnpm web           # Inicia apenas o dashboard Next.js
pnpm mobile        # Inicia apenas o app Expo
pnpm db:types      # Gera tipos TypeScript a partir do schema Supabase
```

### Mobile específico

```bash
# A partir de apps/mobile:
pnpm android       # Abre no emulador Android
pnpm ios           # Abre no simulador iOS
pnpm build:android # EAS Build para Android
pnpm build:ios     # EAS Build para iOS
```

---

## Deploy

### Dashboard Web — Vercel (recomendado)

1. Importe o repositório no [Vercel](https://vercel.com)
2. Defina o **Root Directory** como `apps/web`
3. Adicione as variáveis de ambiente no painel da Vercel
4. Deploy automático a cada push em `main`

### App Mobile — EAS Build

```bash
cd apps/mobile
npx eas login
npx eas build --platform all
npx eas submit     # Submete para App Store e Play Store
```

### Checklist pré-deploy

- [ ] Todas as variáveis de ambiente configuradas
- [ ] Migrations executadas no banco de produção
- [ ] `ASAAS_ENV=production` configurado
- [ ] `NEXT_PUBLIC_APP_URL` apontando para o domínio de produção
- [ ] RLS policies verificadas
- [ ] Backups do banco habilitados no Supabase

---

## Roadmap

### MVP (em andamento)
- [x] Autenticação de clientes e parceiros
- [x] CRUD de serviços no dashboard
- [x] Agendamento completo pelo app mobile
- [x] Gerenciamento de agendamentos pelo parceiro
- [x] Configurações de localização e horários
- [ ] Testes completos ponta-a-ponta

### Fase 2 — Pagamentos
- [ ] Integração Asaas (PIX e cartão de crédito)
- [ ] Split automático de pagamentos (85/15)
- [ ] Saques para parceiros via Asaas

### Fase 3 — Crescimento
- [ ] Notificações push (Expo Notifications)
- [ ] Busca por geolocalização (PostGIS `ST_DWithin`)
- [ ] Análises avançadas para parceiros
- [ ] Sistema de cupons e promoções
- [ ] Painel administrativo

### Fase 4 — Escala
- [ ] App para iOS e Android nas stores
- [ ] Programa de fidelidade
- [ ] Agendamento recorrente

---

## Contribuição

Leia o [CONTRIBUTING.md](CONTRIBUTING.md) para entender o fluxo de contribuição, convenção de commits e estratégia de branches.

---

## Segurança

Veja [SECURITY.md](SECURITY.md) para reportar vulnerabilidades de forma responsável.

---

## Licença

MIT © 2025 [Amarilson Alves](https://github.com/Amarilson-alves)

---

<div align="center">
  Desenvolvido com TypeScript, Expo e Supabase
</div>
