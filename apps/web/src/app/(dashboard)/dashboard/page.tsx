'use client'

import { TrendingUp, CalendarCheck, Star, DollarSign, Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { usePartnerProfile, usePartnerStats } from '@/lib/hooks/usePartnerData'

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-amber-50 text-amber-700',
  confirmed:   'bg-primary-50 text-primary-700',
  in_progress: 'bg-violet-50 text-violet-700',
  completed:   'bg-emerald-50 text-emerald-700',
  cancelled:   'bg-red-50 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando', confirmed: 'Confirmado',
  in_progress: 'Em andamento', completed: 'Concluído', cancelled: 'Cancelado',
}

function formatTime(iso: string) {
  try { return format(parseISO(iso), 'HH:mm') } catch { return '' }
}

export default function DashboardPage() {
  const { data: partner } = usePartnerProfile()
  const { data: stats, isLoading } = usePartnerStats(partner?.id)

  const profileLoading = !partner && isLoading

  if (profileLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mb-6">
          <CalendarCheck size={36} className="text-primary-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Configure seu negócio</h2>
        <p className="text-gray-500 max-w-sm mb-6">
          Seu perfil de parceiro ainda não foi configurado. Acesse as configurações para começar.
        </p>
        <a
          href="/dashboard/settings"
          className="bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors"
        >
          Configurar agora
        </a>
      </div>
    )
  }

  if (isLoading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    )
  }

  const STAT_CARDS = [
    {
      label: 'Faturamento (mês)',
      value: `R$ ${stats.monthRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      change: 'Sua parte líquida (85%)',
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Agendamentos hoje',
      value: stats.todayCount.toString(),
      change: stats.pendingCount > 0 ? `${stats.pendingCount} pendente${stats.pendingCount > 1 ? 's' : ''} de confirmação` : 'Tudo confirmado',
      icon: CalendarCheck,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
    {
      label: 'Avaliação média',
      value: stats.rating > 0 ? `${stats.rating.toFixed(1)} ★` : 'Sem avaliações',
      change: stats.totalReviews > 0 ? `Baseado em ${stats.totalReviews} avaliações` : 'Nenhuma avaliação ainda',
      icon: Star,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      label: 'Taxa de conclusão',
      value: `${stats.completionRate}%`,
      change: 'Agendamentos concluídos este mês',
      icon: TrendingUp,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Olá, {partner?.business_name ?? 'Parceiro'} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {STAT_CARDS.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-gray-500">{card.label}</p>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
                  <Icon size={18} className={card.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.change}</p>
            </div>
          )
        })}
      </div>

      {/* Agendamentos de hoje */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Agendamentos de hoje</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {stats.todayCount === 0 ? 'Nenhum agendamento hoje' : `${stats.todayCount} agendamento${stats.todayCount > 1 ? 's' : ''}`}
          </p>
        </div>

        {stats.todayBookings.length === 0 ? (
          <div className="p-12 text-center">
            <CalendarCheck size={36} className="text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400">Nenhum agendamento para hoje</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Horário</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Cliente</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Serviço</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Veículo</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(stats.todayBookings as any[]).map((booking: any) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{formatTime(booking.scheduled_at)}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {booking.client_profiles?.users?.full_name ?? 'Cliente'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {booking.services?.name ?? '—'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {booking.vehicles ? `${booking.vehicles.brand} ${booking.vehicles.model} • ${booking.vehicles.color}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[booking.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[booking.status] ?? booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
