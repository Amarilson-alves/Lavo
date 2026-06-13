-- ============================================================
-- 008: Capacidade simultânea por serviço
-- Cada serviço define quantos atendimentos simultâneos suporta
-- ============================================================

alter table public.services
  add column capacity integer not null default 1;

-- Atualiza a função de conflito para usar capacity por serviço
-- (substitui a função criada na migration 007)
create or replace function public.check_booking_conflict()
returns trigger
language plpgsql
security definer
as $$
declare
  v_duration      integer;
  v_capacity      integer;
  v_new_end       timestamptz;
  v_overlap_count integer;
begin
  select duration_minutes, capacity
  into   v_duration, v_capacity
  from   public.services
  where  id = NEW.service_id;

  v_new_end := NEW.scheduled_at + (v_duration || ' minutes')::interval;

  -- Conta agendamentos ativos do mesmo parceiro + mesmo serviço que se sobrepõem
  select count(*) into v_overlap_count
  from   public.bookings b
  join   public.services s on s.id = b.service_id
  where  b.id        != NEW.id
    and  b.partner_id = NEW.partner_id
    and  b.service_id = NEW.service_id
    and  b.status    not in ('cancelled', 'completed')
    and  NEW.scheduled_at < (b.scheduled_at + (s.duration_minutes || ' minutes')::interval)
    and  v_new_end        > b.scheduled_at;

  if v_overlap_count >= v_capacity then
    raise exception
      'Horário indisponível: capacidade máxima de % atendimento(s) simultâneo(s) atingida.',
      v_capacity
      using errcode = 'P0001', hint = 'booking_conflict';
  end if;

  return NEW;
end;
$$;
-- O trigger trg_booking_conflict (criado na 007) continua válido —
-- chama a mesma função que acabamos de atualizar.
