# Contributing to Lavô

Thank you for your interest in contributing! This guide covers everything you need to know.

## Prerequisites

- Node.js 20+
- pnpm 9+
- Git

## Development Setup

```bash
git clone https://github.com/Amarilson-alves/Lavo.git
cd Lavo
pnpm install
cp .env.example .env.local        # root (optional)
cp apps/web/.env.example apps/web/.env.local
cp apps/mobile/.env.example apps/mobile/.env.local
# Fill in your Supabase credentials
```

## Branch Strategy

| Branch    | Purpose                                  |
|-----------|------------------------------------------|
| `main`    | Production-ready code                    |
| `develop` | Integration branch — PRs target here    |
| `feat/*`  | New features                             |
| `fix/*`   | Bug fixes                                |
| `chore/*` | Maintenance, deps, configs               |
| `docs/*`  | Documentation only                       |

## Commit Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

Scopes: `mobile`, `web`, `database`, `shared`, `auth`, `bookings`, `payments`

**Examples:**
```
feat(mobile): add vehicle management screen
fix(web): resolve RLS policy for partner locations
chore(deps): upgrade Expo SDK to 52
docs(readme): add deployment section
```

## Pull Request Process

1. Branch off `develop`
2. Write focused, atomic commits
3. Open a PR against `develop`
4. Fill in the PR template completely
5. Ensure all CI checks pass
6. Request a review from a maintainer

## Code Style

- TypeScript strict mode throughout
- No `any` types (use `unknown` + narrowing)
- No `console.log` in production code
- Prefer named exports over default where it makes sense
- Follow existing patterns in each app

## Running Locally

```bash
# All apps simultaneously
pnpm dev

# Web dashboard only
pnpm web

# Mobile only (opens Expo)
pnpm mobile

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Questions?

Open a [Discussion](https://github.com/Amarilson-alves/Lavo/discussions) or email a.alves74525@gmail.com.
