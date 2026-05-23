import { useState } from 'react'
import { View, Text, TouchableOpacity, FlatList, Alert, ActivityIndicator, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Calendar, Car, Star, CalendarX } from 'lucide-react-native'
import { router } from 'expo-router'
import { useBookings, BookingWithDetails } from '@/hooks/useBookings'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending:     { label: 'Aguardando',    dot: '#F59E0B', bg: '#FFFBEB', text: '#B45309' },
  confirmed:   { label: 'Confirmado',    dot: '#0EA5E9', bg: '#EFF6FF', text: '#0369A1' },
  in_progress: { label: 'Em andamento', dot: '#8B5CF6', bg: '#F5F3FF', text: '#6D28D9' },
  completed:   { label: 'Concluído',    dot: '#10B981', bg: '#F0FDF4', text: '#047857' },
  cancelled:   { label: 'Cancelado',    dot: '#EF4444', bg: '#FEF2F2', text: '#DC2626' },
  no_show:     { label: 'Não compareceu', dot: '#9CA3AF', bg: '#F9FAFB', text: '#4B5563' },
}

const STATUS_BAR: Record<string, string> = {
  pending: '#F59E0B', confirmed: '#0EA5E9', in_progress: '#8B5CF6',
  completed: '#10B981', cancelled: '#EF4444', no_show: '#9CA3AF',
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
    return format(parseISO(iso), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })
  } catch { return iso }
}

const CARD_SHADOW = {
  shadowColor: '#1C1C1E', shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
}

export default function BookingsScreen() {
  const [tab, setTab] = useState<StatusFilter>('all')
  const { bookings, isLoading, cancel, rate } = useBookings()
  const filtered = tab === 'all' ? bookings : bookings.filter(b => b.status === tab)

  async function handleCancel(booking: BookingWithDetails) {
    Alert.alert('Cancelar agendamento', 'Tem certeza que deseja cancelar?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Cancelar', style: 'destructive',
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
            if (n >= 1 && n <= 5) rate.mutate({ bookingId: booking.id, rating: n })
          },
        },
      ],
      'plain-text'
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFD' }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFD" />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 0, backgroundColor: 'white' }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.3, marginBottom: 16 }}>
          Meus agendamentos
        </Text>

        {/* Tabs */}
        <FlatList
          data={TABS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={t => t.key}
          contentContainerStyle={{ gap: 8, paddingBottom: 12 }}
          renderItem={({ item: t }) => (
            <TouchableOpacity
              onPress={() => setTab(t.key)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: tab === t.key ? '#0EA5E9' : '#F3F4F6',
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: '600',
                color: tab === t.key ? 'white' : '#6B7280',
              }}>
                {t.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={b => b.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 64 }}>
              <View style={{
                width: 72, height: 72, borderRadius: 36,
                backgroundColor: '#EFF6FF',
                alignItems: 'center', justifyContent: 'center', marginBottom: 16,
              }}>
                <CalendarX size={32} color="#93C5FD" />
              </View>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#374151', textAlign: 'center' }}>
                Nenhum agendamento aqui
              </Text>
              <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6, textAlign: 'center' }}>
                Explore lava cars e agende seu próximo serviço
              </Text>
              <TouchableOpacity
                style={{
                  marginTop: 20, backgroundColor: '#0EA5E9',
                  paddingHorizontal: 24, paddingVertical: 13, borderRadius: 16,
                }}
                onPress={() => router.push('/(client)/explore')}
              >
                <Text style={{ color: 'white', fontWeight: '700', fontSize: 14 }}>Agendar agora</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item: booking }) => {
            const status = STATUS_CONFIG[booking.status] ?? STATUS_CONFIG.pending
            const barColor = STATUS_BAR[booking.status] ?? '#9CA3AF'
            return (
              <View style={{ backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', ...CARD_SHADOW }}>
                {/* Status bar colorida */}
                <View style={{ height: 4, backgroundColor: barColor }} />

                <View style={{ padding: 16 }}>
                  {/* Nome + status badge */}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#111827' }}>
                        {booking.partner_profiles.business_name}
                      </Text>
                      <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                        {booking.services.name}
                      </Text>
                    </View>
                    <View style={{
                      flexDirection: 'row', alignItems: 'center', gap: 5,
                      backgroundColor: status.bg,
                      paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
                    }}>
                      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: status.dot }} />
                      <Text style={{ fontSize: 11, fontWeight: '600', color: status.text }}>
                        {status.label}
                      </Text>
                    </View>
                  </View>

                  {/* Info */}
                  <View style={{ gap: 7 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{
                        width: 28, height: 28, borderRadius: 8, backgroundColor: '#F3F4F6',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Calendar size={13} color="#6B7280" />
                      </View>
                      <Text style={{ fontSize: 13, color: '#374151' }}>{formatDate(booking.scheduled_at)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{
                        width: 28, height: 28, borderRadius: 8, backgroundColor: '#F3F4F6',
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Car size={13} color="#6B7280" />
                      </View>
                      <Text style={{ fontSize: 13, color: '#374151' }}>
                        {booking.vehicles.brand} {booking.vehicles.model} • {booking.vehicles.plate}
                      </Text>
                    </View>
                  </View>

                  {/* Rodapé */}
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F9FAFB',
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: '#111827' }}>
                      R$ {Number(booking.price).toFixed(2).replace('.', ',')}
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {booking.status === 'completed' && !booking.rating && (
                        <TouchableOpacity
                          style={{
                            flexDirection: 'row', alignItems: 'center', gap: 5,
                            backgroundColor: '#FFFBEB', paddingHorizontal: 12,
                            paddingVertical: 8, borderRadius: 12,
                          }}
                          onPress={() => handleRate(booking)}
                        >
                          <Star size={13} color="#F59E0B" />
                          <Text style={{ color: '#B45309', fontSize: 12, fontWeight: '600' }}>Avaliar</Text>
                        </TouchableOpacity>
                      )}
                      {booking.status === 'completed' && booking.rating && (
                        <View style={{
                          flexDirection: 'row', alignItems: 'center', gap: 4,
                          backgroundColor: '#FFFBEB', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12,
                        }}>
                          <Star size={13} color="#F59E0B" fill="#F59E0B" />
                          <Text style={{ color: '#B45309', fontSize: 12, fontWeight: '700' }}>
                            {booking.rating}.0
                          </Text>
                        </View>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <TouchableOpacity
                          style={{
                            backgroundColor: '#FEF2F2', paddingHorizontal: 12,
                            paddingVertical: 8, borderRadius: 12,
                          }}
                          onPress={() => handleCancel(booking)}
                        >
                          <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '600' }}>Cancelar</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>

                {/* Progress bar para em andamento */}
                {booking.status === 'in_progress' && (
                  <View style={{ height: 3, backgroundColor: '#EDE9FE' }}>
                    <View style={{ width: '55%', height: '100%', backgroundColor: '#8B5CF6' }} />
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
