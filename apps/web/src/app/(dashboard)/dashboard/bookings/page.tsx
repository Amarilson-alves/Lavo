'use client'

import { useState } from 'react'
import { CalendarCheck, Filter, Search, Loader2, Check, Play, X } from 'lucide-react'
import { toast } from 'sonner'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { usePartnerProfile, usePartnerBookings } from '@/lib/hooks/usePartnerData'

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-amber-50 text-amber-700',
  confirmed:   'bg-primary-50 text-primary-700',
  in_progress: 'bg-violet-50 text-violet-700',
  completed:   'bg-emerald-50 text-emerald-700',
  cancelled:   'bg-red-50 text-red-700',
  no_show:     'bg-gray-100 text-gray-600',
}

const STATUS_LABELS: Record<string, string> = {
  pending:     'Aguardando',
  confirmed:   'Confirmado',
  in_progress: 'Em andamento',
  completed:   'Concluído',
  cancelled:   'Cancelado',
  no_show:     'Não compareceu',
}

const STATUS_TABS = [
  { key: 'all', label: 'Todos' },
  { key: 'pending', label: 'Aguardando' },
  { key: 'confirmed', label: 'Confirmados' },
  { key: 'in_progress', label: 'Em andamento' },
  { key: 'completed', label: 'Concluídos' },
]

function formatDate(iso: string) {
  try {
    return format(parseISO(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
  } catch {
    return iso
  }
}

export default function BookingsPage() {
  const { data: partner } = usePartnerProfile()
  const { bookings, isLoading, updateStatus } = usePartnerBookings(partner?.id)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = bookings.filter(b => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    const clientName = (b as any).client_profiles?.users?.full_name ?? ''
    const matchSearch = !search || clientName.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  async function handleStatus(id: string, status: string) {
    await updateStatus.mutateAsync({ id, status })
      .then(() => toast.success(`Status atualizado: ${STATUS_LABELS[status]}`))
      .catch(err => toast.error(err.message))
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-500 mt-1">Gerencie todos os seus agendamentos</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              placeholder="Buscar cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 w-64"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit mb-6">
        {STATUS_TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setStatusFilter(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === t.key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-500" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <CalendarCheck size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nenhum agendamento encontrado</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Cliente / Veículo</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Serviço</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Data e Hora</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Valor</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-6 py-4">Status</th>
                <th className="px-6 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((booking: any) => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 text-sm">
                      {booking.client_profiles?.users?.full_name ?? 'Cliente'}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      {booking.vehicles?.brand} {booking.vehicles?.model} • {booking.vehicles?.plate}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{booking.services?.name}</span>
                    <div className="text-xs text-gray-400 mt-0.5">{booking.services?.duration_minutes} min</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">{formatDate(booking.scheduled_at)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-900 text-sm">
                      R$ {Number(booking.partner_amount ?? booking.price).toFixed(2).replace('.', ',')}
                    </span>
                    <div className="text-xs text-gray-400">(85%)</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[booking.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {STATUS_LABELS[booking.status] ?? booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 justify-end">
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleStatus(booking.id, 'confirmed')}
                          className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <Check size={12} />
                          Confirmar
                        </button>
                      )}
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleStatus(booking.id, 'in_progress')}
                          className="flex items-center gap-1 bg-violet-50 text-violet-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-violet-100 transition-colors"
                        >
                          <Play size={12} />
                          Iniciar
                        </button>
                      )}
                      {booking.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatus(booking.id, 'completed')}
                          className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <Check size={12} />
                          Concluir
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(booking.status) && (
                        <button
                          onClick={() => handleStatus(booking.id, 'cancelled')}
                          className="flex items-center gap-1 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          <X size={12} />
                          Cancelar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
