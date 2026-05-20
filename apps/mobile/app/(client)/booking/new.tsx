import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Car, Calendar, CreditCard, Check, ChevronRight, Plus } from 'lucide-react-native'
import { usePartner } from '@/hooks/usePartners'
import { useVehicles } from '@/hooks/useVehicles'
import { useBookings } from '@/hooks/useBookings'

const TIME_SLOTS = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00']
const PAYMENT_METHODS = [
  { id: 'pix', label: 'PIX', emoji: '⚡', description: 'Aprovação instantânea' },
  { id: 'credit_card', label: 'Cartão de crédito', emoji: '💳', description: 'Visa, Master, Elo' },
  { id: 'debit_card', label: 'Cartão de débito', emoji: '💳', description: 'Débito à vista' },
]
const STEPS = ['Veículo', 'Data e hora', 'Pagamento']
const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

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
      partnerId,
      serviceId,
      vehicleId: vehicle.id,
      scheduledAt: scheduled.toISOString(),
      price,
      paymentMethod: selectedPayment as 'pix' | 'credit_card' | 'debit_card',
    }).then(data => ({ data, error: null })).catch(err => ({ data: null, error: err }))

    if (error) {
      Alert.alert('Erro', error.message ?? 'Não foi possível criar o agendamento.')
      return
    }

    router.replace('/(client)/booking/success')
  }

  if (!service) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator color="#0EA5E9" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 py-4 border-b border-gray-100">
        <View className="flex-row items-center gap-3 mb-4">
          <TouchableOpacity onPress={() => step === 0 ? router.back() : setStep(s => s - 1)}>
            <ArrowLeft size={22} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="font-bold text-gray-900">Novo agendamento</Text>
            <Text className="text-xs text-gray-400">
              {partner?.business_name} • {service.name}
            </Text>
          </View>
        </View>

        {/* Progress steps */}
        <View className="flex-row items-center">
          {STEPS.map((s, i) => (
            <View key={s} className="flex-row items-center flex-1">
              <View className={`w-7 h-7 rounded-full items-center justify-center ${i <= step ? 'bg-primary-500' : 'bg-gray-200'}`}>
                {i < step
                  ? <Check size={14} color="white" />
                  : <Text className={`text-xs font-bold ${i === step ? 'text-white' : 'text-gray-400'}`}>{i + 1}</Text>
                }
              </View>
              <Text className={`text-xs font-medium ml-1.5 ${i === step ? 'text-primary-600' : 'text-gray-400'}`}>{s}</Text>
              {i < STEPS.length - 1 && (
                <View className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-primary-400' : 'bg-gray-200'}`} />
              )}
            </View>
          ))}
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>

        {/* STEP 0 — Veículo */}
        {step === 0 && (
          <View className="gap-3">
            <Text className="font-bold text-gray-900 text-lg mb-2">Qual veículo?</Text>

            {loadingVehicles ? (
              <ActivityIndicator color="#0EA5E9" />
            ) : vehicles.length === 0 ? (
              <View className="bg-amber-50 rounded-2xl p-4 items-center">
                <Text className="text-amber-700 font-medium text-center">
                  Você não tem veículos cadastrados.
                </Text>
                <TouchableOpacity
                  className="mt-3 bg-primary-500 px-5 py-2.5 rounded-xl"
                  onPress={() => router.push('/(client)/vehicles')}
                >
                  <Text className="text-white font-semibold">Cadastrar veículo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              vehicles.map(v => (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => setSelectedVehicle(v.id)}
                  className={`bg-white rounded-2xl p-4 shadow-sm border-2 flex-row items-center gap-3 ${selectedVehicle === v.id ? 'border-primary-400' : 'border-transparent'}`}
                  activeOpacity={0.8}
                >
                  <View className={`w-12 h-12 rounded-xl items-center justify-center ${selectedVehicle === v.id ? 'bg-primary-100' : 'bg-gray-100'}`}>
                    <Car size={22} color={selectedVehicle === v.id ? '#0EA5E9' : '#9CA3AF'} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-gray-900">{v.brand} {v.model}</Text>
                    <Text className="text-gray-500 text-sm">{v.plate} • {v.color}</Text>
                  </View>
                  {selectedVehicle === v.id && (
                    <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
                      <Check size={13} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}

            <TouchableOpacity
              className="bg-white rounded-2xl p-4 shadow-sm border-2 border-dashed border-gray-200 flex-row items-center justify-center gap-2"
              onPress={() => router.push('/(client)/vehicles')}
            >
              <Plus size={16} color="#0EA5E9" />
              <Text className="text-primary-500 font-semibold">Adicionar veículo</Text>
            </TouchableOpacity>

            {vehicle && price > 0 && (
              <View className="bg-primary-50 rounded-2xl p-4 mt-2">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-600">{service.name} ({vehicle.model})</Text>
                  <Text className="font-semibold text-gray-900">R$ {price.toFixed(2).replace('.', ',')}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-400">Taxa de serviço (15%)</Text>
                  <Text className="text-xs text-gray-400">R$ {platformFee.toFixed(2).replace('.', ',')}</Text>
                </View>
                <View className="border-t border-primary-200 mt-2 pt-2 flex-row justify-between">
                  <Text className="font-bold text-gray-900">Total</Text>
                  <Text className="font-bold text-primary-600">R$ {price.toFixed(2).replace('.', ',')}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* STEP 1 — Data e hora */}
        {step === 1 && (
          <View>
            <Text className="font-bold text-gray-900 text-lg mb-4">Quando?</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5 -mx-1">
              {dates.map((d, i) => {
                const selected = selectedDate?.toDateString() === d.toDateString()
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => { setSelectedDate(d); setSelectedTime(null) }}
                    className={`mr-3 w-16 py-3 rounded-2xl items-center ${selected ? 'bg-primary-500' : 'bg-white shadow-sm'}`}
                  >
                    <Text className={`text-xs font-medium ${selected ? 'text-primary-100' : 'text-gray-400'}`}>
                      {i === 0 ? 'Hoje' : WEEK_DAYS[d.getDay()]}
                    </Text>
                    <Text className={`text-xl font-bold mt-0.5 ${selected ? 'text-white' : 'text-gray-900'}`}>
                      {d.getDate()}
                    </Text>
                    <Text className={`text-xs ${selected ? 'text-primary-100' : 'text-gray-400'}`}>
                      {MONTHS[d.getMonth()]}
                    </Text>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>

            {selectedDate && (
              <>
                <Text className="font-semibold text-gray-700 mb-3">Horário disponível</Text>
                <View className="flex-row flex-wrap gap-2">
                  {TIME_SLOTS.map(time => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => setSelectedTime(time)}
                      className={`px-5 py-3 rounded-xl ${selectedTime === time ? 'bg-primary-500' : 'bg-white shadow-sm'}`}
                    >
                      <Text className={`font-semibold ${selectedTime === time ? 'text-white' : 'text-gray-700'}`}>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            {selectedDate && selectedTime && (
              <View className="bg-primary-50 rounded-2xl p-4 mt-5">
                <View className="flex-row items-center gap-2">
                  <Calendar size={16} color="#0EA5E9" />
                  <Text className="text-primary-700 font-semibold">
                    {selectedDate.getDate()} de {MONTHS[selectedDate.getMonth()]} às {selectedTime}
                  </Text>
                </View>
                <Text className="text-xs text-primary-400 mt-1 ml-6">
                  Duração estimada: {service.duration_minutes} minutos
                </Text>
              </View>
            )}
          </View>
        )}

        {/* STEP 2 — Pagamento */}
        {step === 2 && (
          <View className="gap-3">
            <Text className="font-bold text-gray-900 text-lg mb-2">Como vai pagar?</Text>
            {PAYMENT_METHODS.map(pm => (
              <TouchableOpacity
                key={pm.id}
                onPress={() => setSelectedPayment(pm.id)}
                className={`bg-white rounded-2xl p-4 shadow-sm border-2 flex-row items-center gap-3 ${selectedPayment === pm.id ? 'border-primary-400' : 'border-transparent'}`}
                activeOpacity={0.8}
              >
                <Text className="text-2xl">{pm.emoji}</Text>
                <View className="flex-1">
                  <Text className="font-semibold text-gray-900">{pm.label}</Text>
                  <Text className="text-gray-400 text-xs">{pm.description}</Text>
                </View>
                {selectedPayment === pm.id && (
                  <View className="w-6 h-6 bg-primary-500 rounded-full items-center justify-center">
                    <Check size={13} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}

            {/* Resumo */}
            <View className="bg-gray-900 rounded-2xl p-5 mt-2">
              <Text className="text-gray-300 text-xs font-semibold uppercase tracking-wide mb-3">Resumo</Text>
              <View className="gap-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-400 text-sm">Serviço</Text>
                  <Text className="text-white font-medium text-sm">{service.name}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400 text-sm">Veículo</Text>
                  <Text className="text-white font-medium text-sm">{vehicle?.brand} {vehicle?.model}</Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-400 text-sm">Data</Text>
                  <Text className="text-white font-medium text-sm">
                    {selectedDate?.getDate()}/{selectedDate ? selectedDate.getMonth() + 1 : ''} às {selectedTime}
                  </Text>
                </View>
                <View className="border-t border-gray-700 mt-1 pt-3 flex-row justify-between">
                  <Text className="text-white font-bold">Total</Text>
                  <Text className="text-primary-400 font-bold text-lg">R$ {price.toFixed(2).replace('.', ',')}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View className="h-24" />
      </ScrollView>

      {/* Botão avançar/confirmar */}
      <View className="bg-white border-t border-gray-100 px-5 pt-4 pb-8">
        <TouchableOpacity
          onPress={step < 2 ? () => setStep(s => s + 1) : handleConfirm}
          disabled={!canAdvance() || create.isPending}
          className={`rounded-2xl py-4 items-center flex-row justify-center gap-2 ${canAdvance() && !create.isPending ? 'bg-primary-500' : 'bg-gray-200'}`}
        >
          {create.isPending ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className={`font-bold text-base ${canAdvance() ? 'text-white' : 'text-gray-400'}`}>
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
