# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 0.x.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, **do not open a public GitHub issue**.

Please report it privately to: **a.alves74525@gmail.com**

Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within **72 hours** and work with you to resolve the issue before public disclosure.

## Security Practices

- All secrets are stored in `.env.local` files which are **gitignored**
- Supabase Row Level Security (RLS) is enabled on all tables
- The `service_role` key is server-side only and never exposed to clients
- Authentication is handled entirely by Supabase Auth (JWT)
- All database queries are subject to RLS policies
- SQL injection is prevented by Supabase PostgREST parameterized queries
