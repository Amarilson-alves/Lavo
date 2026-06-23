-- ============================================================
-- 009: Push token para notificações
-- ============================================================

alter table public.users add column push_token text;
