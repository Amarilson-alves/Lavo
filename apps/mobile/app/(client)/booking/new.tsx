import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Car, Calendar, Check, ChevronRight, Plus } from 'lucide-react-native'
import { usePartner } from '@/hooks/usePartners'
import { useVehicles } from '@/hooks/useVehicles'
import { useBookings, usePartnerAvailability } from '@/hooks/useBookings'

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX', emoji: '⚡', description: 'Aprovação instantânea' },
  { id: 'credit_card', label: 'Cartão de crédito', emoji: '💳', description: 'Visa, Master, Elo' },
  { id: 'debit_card', label: 'Cartão de débito', emoji: '💳', description: 'Débito à vista' },
]
const STEPS = ['Veículo', 'Data e hora', 'Pagamento']
const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

const CARD_SHADOW = {
  shadowColor: '#1C1C1E', shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
}

function getDates() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d
  })
}

const PLATFORM_FEE = 0.15

export default function BookingNewScreen() {
  const { partnerId = '', serviceId = '' } = useLocalSearchParams<{ partnerId?: string; serviceId?: string }>()

  const { data: partner } = usePartner(partnerId)
  const { vehicles, isLoading: loadingVehicles } = useVehicles()
  const { create } = useBookings()

  const service = partner?.services.find(s => s.id === serviceId)

  const [step, setStep] = useState(0)
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)

  const { isSlotOccupied, isLoading: loadingAvailability } = usePartnerAvailability(partnerId, selectedDate)

  const vehicle = vehicles.find(v => v.id === selectedVehicle)
  const price = vehicle && service
    ? (service.pricing.find(p => p.vehicle_type === vehicle.type)?.price ?? service.pricing[0]?.price ?? 0)
    : 0
  const platformFee = price * PLATFORM_FEE
  const dates = getDates()

  function canAdvance() {
    if (step === 0) return !!selectedVehicle
    if (step === 1) return !!selectedDate && !!selectedTime
    if (step === 2) return !!selectedPayment
    return false
  }

  async function handleConfirm() {
    if (!vehicle || !selectedDate || !selectedTime || !selectedPayment || !service) return
    const [h, m] = selectedTime.split(':').map(Number)
    const scheduled = new Date(selectedDate)
    scheduled.setHours(h, m, 0, 0)
    const { error } = await create.mutateAsync({
      partnerId, serviceId, vehicleId: vehicle.id,
      scheduledAt: scheduled.toISOString(),
      price, paymentMethod: selectedPayment as 'pix' | 'credit_card' | 'debit_card',
    }).then(data => ({ data, error: null })).catch(err => ({ data: null, error: err }))
    if (error) {
      const msg = error.message ?? ''
      const isConflict = msg.includes('booking_conflict') || msg.includes('indisponível')
      Alert.alert(
        isConflict ? 'Horário indisponível' : 'Erro',
        isConflict
          ? 'Este horário foi reservado agora por outro cliente. Por favor, escolha outro horário.'
          : (msg || 'Não foi possível criar o agendamento.'),
      )
      if (isConflict) setStep(1)
      return
    }
    router.replace('/(client)/booking/success')
  }

  if (!service) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#0EA5E9" size="large" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFD' }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFD" />

      {/* Header */}
      <View style={{
        backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => step === 0 ? router.back() : setStep(s => s - 1)}
            style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={18} color="#374151" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '800', color: '#111827', fontSize: 16 }}>Novo agendamento</Text>
            <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 1 }}>
              {partner?.business_name} • {service.name}
            </Text>
          </View>
        </View>

        {/* Steps */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {STEPS.map((s, i) => (
            <View key={s} style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <View style={{
                width: 28, height: 28, borderRadius: 14,
                backgroundColor: i <= step ? '#0EA5E9' : '#F3F4F6',
                alignItems: 'center', justifyContent: 'center',
              }}>
                {i < step
                  ? <Check size={13} color="white" />
                  : <Text style={{ fontSize: 12, fontWeight: '700', color: i === step ? 'white' : '#9CA3AF' }}>{i + 1}</Text>
                }
              </View>
              <Text style={{ fontSize: 11, fontWeight: '600', marginLeft: 6, color: i === step ? '#0EA5E9' : '#9CA3AF' }}>{s}</Text>
              {i < STEPS.length - 1 && (
                <View style={{ flex: 1, height: 2, marginHorizontal: 8, backgroundColor: i < step ? '#0EA5E9' : '#E5E7EB', borderRadius: 1 }} />
              )}
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, gap: 14 }}>

        {/* STEP 0 — Veículo */}
        {step === 0 && (
          <>
            <Text style={{ fontWeight: '800', color: '#111827', fontSize: 18, marginBottom: 4 }}>Qual veículo?</Text>

            {loadingVehicles ? (
              <ActivityIndicator color="#0EA5E9" />
            ) : vehicles.length === 0 ? (
              <View style={{ backgroundColor: '#FFFBEB', borderRadius: 20, padding: 20, alignItems: 'center', ...CARD_SHADOW }}>
                <Text style={{ color: '#B45309', fontWeight: '600', textAlign: 'center', marginBottom: 12 }}>
                  Você não tem veículos cadastrados.
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#0EA5E9', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 }}
                  onPress={() => router.push('/(client)/vehicles')}
                >
                  <Text style={{ color: 'white', fontWeight: '700' }}>Cadastrar veículo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              vehicles.map(v => (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => setSelectedVehicle(v.id)}
                  style={{
                    backgroundColor: 'white', borderRadius: 20, padding: 16,
                    flexDirection: 'row', alignItems: 'center', gap: 14,
                    borderWidth: 2,
                    borderColor: selectedVehicle === v.id ? '#0EA5E9' : 'transparent',
                    ...CARD_SHADOW,
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{
                    width: 50, height: 50, borderRadius: 15,
                    backgroundColor: selectedVehicle === v.id ? '#EFF6FF' : '#F3F4F6',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Car size={22} color={selectedVehicle === v.id ? '#0EA5E9' : '#9CA3AF'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontWeight: '700', color: '#111827', fontSize: 15 }}>{v.brand} {v.model}</Text>
                    <Text style={{ color: '#6B7280', fontSize: 13, marginTop: 2 }}>{v.plate} • {v.color}</Text>
                  </View>
                  {selectedVehicle === v.id && (
                    <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#0EA5E9', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={14} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}

            <TouchableOpacity
              style={{
                backgroundColor: 'white', borderRadius: 20, padding: 16,
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                borderWidth: 1.5, borderColor: '#BFDBFE', borderStyle: 'dashed',
              }}
              onPress={() => router.push('/(client)/vehicles')}
            >
              <Plus size={16} color="#0EA5E9" />
              <Text style={{ color: '#0EA5E9', fontWeight: '600' }}>Adicionar veículo</Text>
            </TouchableOpacity>

            {vehicle && price > 0 && (
              <View style={{ backgroundColor: '#EFF6FF', borderRadius: 20, padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 13, color: '#374151' }}>{service.name} ({vehicle.model})</Text>
                  <Text style={{ fontWeight: '700', color: '#111827' }}>R$ {price.toFixed(2).replace('.', ',')}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
                  <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Taxa de serviço (15%)</Text>
                  <Text style={{ fontSize: 12, color: '#9CA3AF' }}>R$ {platformFee.toFixed(2).replace('.', ',')}</Text>
                </View>
                <View style={{ borderTopWidth: 1, borderTopColor: '#BFDBFE', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontWeight: '800', color: '#111827' }}>Total</Text>
                  <Text style={{ fontWeight: '800', color: '#0369A1', fontSize: 16 }}>R$ {price.toFixed(2).replace('.', ',')}</Text>
                </View>
              </View>
            )}
          </>
        )}

        {/* STEP 1 — Data e hora */}
        {step === 1 && (
          <>
            <Text style={{ fontWeight: '800', color: '#111827', fontSize: 18, marginBottom: 4 }}>Quando?</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {dates.map((d, i) => {
                const selected = selectedDate?.toDateString() === d.toDateString()
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => { setSelectedDate(d); setSelectedTime(null) }}
                    style={{
                      width: 64, paddingVertical: 14, borderRadius: 20,
                      alignItems: 'center',
                      backgroundColor: selected ? '#0EA5E9' : 'white',
                      ...(!selected ? CARD_SHADOW : {
                        shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.25, shadowRadius: 10, elevation: 5,
                      }),
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: selected ? 'rgba(186,230,253,0.9)' : '#9CA3AF' }}>
                      {i === 0 ? 'Hoje' : WEEK_DAYS[d.getDay()]}
                    </Text>
                    <Text style={{ fontSize: 22, fontWeight: '800', marginVertical: 2, color: selected ? 'white' : '#111827' }}>
                      {d.getDate()}
                    </Text>
                    <Text style={{ fontSize: 11, color: selected ? 'rgba(186,230,253,0.9)' : '#9CA3AF' }}>
                      {MONTHS[d.getMonth()]}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            {selectedDate && (
              <>
                <Text style={{ fontWeight: '700', color: '#374151', fontSize: 14, marginTop: 4 }}>
                  {loadingAvailability ? 'Verificando disponibilidade...' : 'Horários disponíveis'}
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {TIME_SLOTS.map(time => {
                    const occupied = service ? isSlotOccupied(time, service.duration_minutes) : false
                    const selected = selectedTime === time
                    return (
                      <TouchableOpacity
                        key={time}
                        onPress={() => { if (!occupied) setSelectedTime(time) }}
                        disabled={occupied || loadingAvailability}
                        style={{
                          paddingHorizontal: 18, paddingVertical: 12, borderRadius: 14,
                          backgroundColor: occupied ? '#F3F4F6' : selected ? '#0EA5E9' : 'white',
                          opacity: loadingAvailability ? 0.5 : 1,
                          ...(!occupied && !selected ? CARD_SHADOW : {}),
                        }}
                      >
                        <Text style={{
                          fontWeight: '700', fontSize: 14,
                          color: occupied ? '#D1D5DB' : selected ? 'white' : '#374151',
                          textDecorationLine: occupied ? 'line-through' : 'none',
                        }}>
                          {time}
                        </Text>
                        {occupied && (
                          <Text style={{ fontSize: 9, color: '#D1D5DB', textAlign: 'center', marginTop: 2 }}>ocupado</Text>
                        )}
                      </TouchableOpacity>
                    )
                  })}
                </View>
              </>
            )}

            {selectedDate && selectedTime && (
              <View style={{ backgroundColor: '#EFF6FF', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 4 }}>
                <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: '#BFDBFE', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={16} color="#0369A1" />
                </View>
                <View>
                  <Text style={{ fontWeight: '700', color: '#0369A1', fontSize: 14 }}>
                    {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]} às {selectedTime}
                  </Text>
                  <Text style={{ fontSize: 12, color: '#60A5FA', marginTop: 2 }}>
                    Duração estimada: {service.duration_minutes} minutos
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

        {/* STEP 2 — Pagamento */}
        {step === 2 && (
          <>
            <Text style={{ fontWeight: '800', color: '#111827', fontSize: 18, marginBottom: 4 }}>Como vai pagar?</Text>

            {PAYMENT_METHODS.map(pm => (
              <TouchableOpacity
                key={pm.id}
                onPress={() => setSelectedPayment(pm.id)}
                style={{
                  backgroundColor: 'white', borderRadius: 20, padding: 16,
                  flexDirection: 'row', alignItems: 'center', gap: 14,
                  borderWidth: 2,
                  borderColor: selectedPayment === pm.id ? '#0EA5E9' : 'transparent',
                  ...CARD_SHADOW,
                }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 26 }}>{pm.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '700', color: '#111827', fontSize: 15 }}>{pm.label}</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>{pm.description}</Text>
                </View>
                {selectedPayment === pm.id && (
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#0EA5E9', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={14} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Resumo */}
            <View style={{ backgroundColor: '#111827', borderRadius: 24, padding: 20, marginTop: 4 }}>
              <Text style={{ color: '#6B7280', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>
                Resumo do pedido
              </Text>
              <View style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Serviço</Text>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>{service.name}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Veículo</Text>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>{vehicle?.brand} {vehicle?.model}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Data</Text>
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 13 }}>
                    {selectedDate?.getDate()}/{selectedDate ? selectedDate.getMonth() + 1 : ''} às {selectedTime}
                  </Text>
                </View>
                <View style={{ height: 1, backgroundColor: '#374151', marginVertical: 4 }} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ color: 'white', fontWeight: '800', fontSize: 15 }}>Total</Text>
                  <Text style={{ color: '#38BDF8', fontWeight: '800', fontSize: 18 }}>R$ {price.toFixed(2).replace('.', ',')}</Text>
                </View>
              </View>
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Botão avançar/confirmar */}
      <View style={{
        backgroundColor: 'white', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32,
        borderTopWidth: 1, borderTopColor: '#F3F4F6',
      }}>
        <TouchableOpacity
          onPress={step < 2 ? () => setStep(s => s + 1) : handleConfirm}
          disabled={!canAdvance() || create.isPending}
          style={{
            borderRadius: 20, paddingVertical: 16,
            alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
            backgroundColor: canAdvance() && !create.isPending ? '#0EA5E9' : '#E5E7EB',
            ...(canAdvance() && !create.isPending ? {
              shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25, shadowRadius: 12, elevation: 5,
            } : {}),
          }}
        >
          {create.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text style={{ fontWeight: '700', fontSize: 15, color: canAdvance() ? 'white' : '#9CA3AF' }}>
                {step < 2 ? 'Continuar' : 'Confirmar agendamento'}
              </Text>
              {canAdvance() && <ChevronRight size={18} color="white" />}
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
