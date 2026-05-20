import { useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Calendar, Clock, ChevronRight, Star } from 'lucide-react-native'
import { router } from 'expo-router'
import { useBookings, BookingWithDetails } from '@/hooks/useBookings'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:     { label: 'Aguardando',  color: 'text-amber-700',   bg: 'bg-amber-50' },
  confirmed:   { label: 'Confirmado',  color: 'text-primary-700', bg: 'bg-primary-50' },
  in_progress: { label: 'Em andamento', color: 'text-violet-700', bg: 'bg-violet-50' },
  completed:   { label: 'Concluído',   color: 'text-emerald-700', bg: 'bg-emerald-50' },
  cancelled:   { label: 'Cancelado',   color: 'text-red-600',     bg: 'bg-red-50' },
  no_show:     { label: 'Não compareceu', color: 'text-gray-600', bg: 'bg-gray-100' },
}

const TABS: { key: StatusFilter; label: string }[] = [
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

export default function BookingsScreen() {
  const [tab, setTab] = useState<StatusFilter>('all')
  const { bookings, isLoading, cancel, rate } = useBookings()

  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab)

  async function handleCancel(booking: BookingWithDetails) {
    Alert.alert('Cancelar agendamento', 'Tem certeza que deseja cancelar?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Cancelar agendamento', style: 'destructive',
        onPress: () => cancel.mutate(booking.id),
      },
    ])
  }

  async function handleRate(booking: BookingWithDetails) {
    Alert.prompt?.(
      'Avaliar serviço',
      'Digite uma nota de 1 a 5:',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: (val) => {
            const n = parseInt(val ?? '0')
            if (n >= 1 && n <= 5) {
              rate.mutate({ bookingId: booking.id, rating: n })
            }
          },
        },
      ],
      'plain-text'
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="bg-white px-5 pt-5 pb-0 border-b border-gray-100">
        <Text className="text-xl font-bold text-gray-900 mb-4">Meus agendamentos</Text>

        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={t => t.key}
          renderItem={({ item: t }) => (
            <TouchableOpacity
              onPress={() => setTab(t.key)}
              className={`mr-4 pb-3 border-b-2 ${tab === t.key ? 'border-primary-500' : 'border-transparent'}`}
            >
              <Text className={`text-sm font-semibold ${tab === t.key ? 'text-primary-600' : 'text-gray-400'}`}>
                {t.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={b => b.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-5xl mb-3">📅</Text>
              <Text className="text-gray-500 font-medium">Nenhum agendamento aqui</Text>
              <TouchableOpacity
                className="mt-4 bg-primary-500 px-6 py-3 rounded-2xl"
                onPress={() => router.push('/(client)/explore')}
              >
                <Text className="text-white font-semibold">Agendar agora</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item: booking }) => {
            const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending
            return (
              <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <View className="p-4">
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1 mr-3">
                      <Text className="font-bold text-gray-900">{booking.partner_profiles.business_name}</Text>
                      <Text className="text-gray-500 text-sm mt-0.5">{booking.services.name}</Text>
                    </View>
                    <View className={`px-2.5 py-1 rounded-full ${status.bg}`}>
                      <Text className={`text-xs font-semibold ${status.color}`}>{status.label}</Text>
                    </View>
                  </View>

                  <View className="gap-1.5 mb-3">
                    <View className="flex-row items-center gap-2">
                      <Calendar size={13} color="#9CA3AF" />
                      <Text className="text-gray-500 text-sm">{formatDate(booking.scheduled_at)}</Text>
                    </View>
                    <View className="flex-row items-center gap-2">
                      <Clock size={13} color="#9CA3AF" />
                      <Text className="text-gray-500 text-sm">
                        {booking.vehicles.brand} {booking.vehicles.model} • {booking.vehicles.plate}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between pt-3 border-t border-gray-50">
                    <Text className="font-bold text-gray-900">
                      R$ {Number(booking.price).toFixed(2).replace('.', ',')}
                    </Text>

                    <View className="flex-row gap-2">
                      {booking.status === 'completed' && !booking.rating && (
                        <TouchableOpacity
                          className="flex-row items-center gap-1 bg-amber-50 px-3 py-2 rounded-xl"
                          onPress={() => handleRate(booking)}
                        >
                          <Star size={13} color="#F59E0B" />
                          <Text className="text-amber-700 text-xs font-semibold">Avaliar</Text>
                        </TouchableOpacity>
                      )}
                      {booking.status === 'completed' && booking.rating && (
                        <View className="flex-row items-center gap-1 bg-amber-50 px-3 py-2 rounded-xl">
                          <Star size={13} color="#F59E0B" fill="#F59E0B" />
                          <Text className="text-amber-700 text-xs font-semibold">{booking.rating}.0</Text>
                        </View>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <TouchableOpacity
                          className="bg-red-50 px-3 py-2 rounded-xl"
                          onPress={() => handleCancel(booking)}
                        >
                          <Text className="text-red-500 text-xs font-semibold">Cancelar</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity className="bg-gray-100 px-3 py-2 rounded-xl flex-row items-center gap-1">
                        <Text className="text-gray-600 text-xs font-semibold">Detalhes</Text>
                        <ChevronRight size={13} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {booking.status === 'in_progress' && (
                  <View className="h-1 bg-gray-100">
                    <View className="h-full bg-violet-400 w-1/2" />
                  </View>
                )}
              </View>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}
