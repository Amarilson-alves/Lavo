-- ============================================================
-- 007: Prevenção de conflito de agendamentos
-- Impede que o mesmo parceiro receba 2 agendamentos sobrepostos
-- ============================================================

create or replace function public.check_booking_conflict()
returns trigger
language plpgsql
security definer
as $$
declare
  v_duration integer;
  v_new_end  timestamptz;
begin
  -- Busca duração do serviço sendo agendado
  select duration_minutes into v_duration
  from public.services
  where id = NEW.service_id;

  -- Calcula o fim do novo agendamento
  v_new_end := NEW.scheduled_at + (v_duration || ' minutes')::interval;

  -- Verifica sobreposição com agendamentos ativos do mesmo parceiro
  if exists (
    select 1
    from public.bookings b
    join public.services s on s.id = b.service_id
    where b.id         != NEW.id
      and b.partner_id  = NEW.partner_id
      and b.status     not in ('cancelled', 'completed')
      -- Condição de sobreposição: novo começa antes do existente acabar
      -- E novo termina depois do existente começar
      and NEW.scheduled_at < (b.scheduled_at + (s.duration_minutes || ' minutes')::interval)
      and v_new_end        > b.scheduled_at
  ) then
    raise exception 'Horário indisponível: o parceiro já possui um agendamento neste período.'
      using errcode = 'P0001', hint = 'booking_conflict';
  end if;

  return NEW;
end;
$$;

-- Dispara antes de insert ou update nos campos relevantes
create trigger trg_booking_conflict
  before insert or update of scheduled_at, service_id, status
  on public.bookings
  for each row
  execute function public.check_booking_conflict();
