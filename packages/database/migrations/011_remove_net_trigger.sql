-- ============================================================
-- 011: Remove trigger notify_on_booking
--
-- O trigger usava net.http_post() da extensão pg_net que não
-- está habilitada no projeto, causando erro 400 em todo UPDATE
-- de agendamentos (confirmar, cancelar, concluir).
--
-- Notificações push serão enviadas via Database Webhook
-- configurado no painel do Supabase → Database → Webhooks,
-- apontando para a Edge Function send-push — sem depender de pg_net.
-- ============================================================

drop trigger if exists notify_on_booking on public.bookings;
drop function if exists public.trigger_send_push();
