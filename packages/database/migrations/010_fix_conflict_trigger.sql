-- ============================================================
-- 010: Corrige trigger de conflito de agendamentos
--
-- O trigger trg_booking_conflict disparava também em updates de
-- `status`, causando erro 400 ao parceiro confirmar/cancelar.
-- O check de conflito só faz sentido em INSERT ou quando o
-- horário/serviço muda — não em mudanças de status.
-- ============================================================

drop trigger if exists trg_booking_conflict on public.bookings;

create trigger trg_booking_conflict
  before insert or update of scheduled_at, service_id
  on public.bookings
  for each row
  execute function public.check_booking_conflict();
