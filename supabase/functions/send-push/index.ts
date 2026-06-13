import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

type WebhookPayload = {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: Record<string, any>
  old_record: Record<string, any> | null
}

const STATUS_MESSAGES: Record<string, { title: string; body: string }> = {
  confirmed:   { title: 'Agendamento confirmado!', body: 'O parceiro confirmou seu horário. Até lá!' },
  in_progress: { title: 'Serviço iniciado!', body: 'Seu veículo está sendo lavado agora.' },
  completed:   { title: 'Serviço concluído!', body: 'Como foi? Abra o app e avalie o atendimento.' },
  cancelled:   { title: 'Agendamento cancelado', body: 'Seu agendamento foi cancelado.' },
}

serve(async (req) => {
  const payload: WebhookPayload = await req.json()

  if (payload.table !== 'bookings') return new Response('ok')

  try {
    if (payload.type === 'INSERT') {
      await notifyPartner(payload.record)
    } else if (payload.type === 'UPDATE') {
      const statusChanged = payload.old_record?.status !== payload.record.status
      if (statusChanged) await notifyClient(payload.record)
    }
  } catch (err) {
    console.error('send-push error:', err)
  }

  return new Response('ok', { headers: { 'Content-Type': 'text/plain' } })
})

async function notifyPartner(booking: Record<string, any>) {
  const { data: partner } = await supabase
    .from('partner_profiles')
    .select('users(push_token)')
    .eq('id', booking.partner_id)
    .single()

  const token = (partner?.users as any)?.push_token
  if (!token?.startsWith('ExponentPushToken')) return

  const { data: details } = await supabase
    .from('bookings')
    .select('services(name), vehicles(brand, model)')
    .eq('id', booking.id)
    .single()

  const service = (details?.services as any)?.name ?? 'Serviço'
  const vehicle = `${(details?.vehicles as any)?.brand} ${(details?.vehicles as any)?.model}`
  const time = new Date(booking.scheduled_at)
    .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })

  await sendExpo(token, 'Novo agendamento!', `${service} — ${vehicle} às ${time}`, { screen: 'partner' })
}

async function notifyClient(booking: Record<string, any>) {
  const msg = STATUS_MESSAGES[booking.status]
  if (!msg) return

  const { data: client } = await supabase
    .from('client_profiles')
    .select('users(push_token)')
    .eq('id', booking.client_id)
    .single()

  const token = (client?.users as any)?.push_token
  if (!token?.startsWith('ExponentPushToken')) return

  await sendExpo(token, msg.title, msg.body, { screen: 'bookings', bookingId: booking.id })
}

async function sendExpo(to: string, title: string, body: string, data: Record<string, any>) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ to, title, body, data, sound: 'default', priority: 'high' }),
  })
}
