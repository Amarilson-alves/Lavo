import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Star, MapPin, Clock, ChevronRight, Share2, Heart } from 'lucide-react-native'
import { usePartner, isOpenNow } from '@/hooks/usePartners'

const VEHICLE_LABELS: Record<string, string> = {
  hatch: 'Hatch', sedan: 'Sedan', suv: 'SUV', pickup: 'Pickup', van: 'Van', motorcycle: 'Moto',
}

const CATEGORY_EMOJI: Record<string, string> = {
  lavagem: '🚿', polimento: '✨', higienizacao: '🧹', ceramica: '🛡️', outros: '🔧',
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function PartnerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [favorited, setFavorited] = useState(false)
  const [tab, setTab] = useState<'services' | 'reviews'>('services')

  const { data: partner, isLoading } = usePartner(id)

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </SafeAreaView>
    )
  }

  if (!partner) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center px-6">
        <Text className="text-gray-400 text-center">Parceiro não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-primary-500 font-semibold">Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const location = partner.partner_locations?.[0]
  const open = location ? isOpenNow(location.working_hours) : false
  const activeServices = partner.services.filter(s => s.is_active)
  const service = activeServices.find(s => s.id === selectedService)

  function formatWorkingHours() {
    if (!location?.working_hours?.length) return 'Horários não informados'
    const openDays = location.working_hours.filter(h => h.is_open)
    if (!openDays.length) return 'Fechado'
    const first = openDays[0]
    const last = openDays[openDays.length - 1]
    return `${WEEK_DAYS[first.day]}–${WEEK_DAYS[last.day]} ${first.open}–${first.close}`
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header foto de capa */}
      <View className="relative">
        <View className="h-48 bg-primary-400 items-center justify-center">
          <Text className="text-6xl">🚗</Text>
        </View>
        <View className="absolute top-4 left-4 right-4 flex-row justify-between">
          <TouchableOpacity
            className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <View className="flex-row gap-2">
            <TouchableOpacity className="w-10 h-10 bg-black/30 rounded-full items-center justify-center">
              <Share2 size={18} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 bg-black/30 rounded-full items-center justify-center"
              onPress={() => setFavorited(f => !f)}
            >
              <Heart size={18} color={favorited ? '#F43F5E' : 'white'} fill={favorited ? '#F43F5E' : 'transparent'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Info */}
        <View className="bg-white px-5 py-5 -mt-4 rounded-t-3xl">
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-xl font-bold text-gray-900 flex-1 mr-3">{partner.business_name}</Text>
            <View className={`px-2.5 py-1 rounded-full ${open ? 'bg-emerald-50' : 'bg-gray-100'}`}>
              <Text className={`text-xs font-bold ${open ? 'text-emerald-600' : 'text-gray-400'}`}>
                {open ? 'Aberto agora' : 'Fechado'}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-4 mb-3">
            <View className="flex-row items-center gap-1">
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text className="font-bold text-gray-900 text-sm">
                {partner.rating > 0 ? partner.rating.toFixed(1) : 'Sem avaliações'}
              </Text>
              {partner.total_reviews > 0 && (
                <Text className="text-gray-400 text-sm">({partner.total_reviews} avaliações)</Text>
              )}
            </View>
          </View>

          {location && (
            <>
              <View className="flex-row items-start gap-1.5 mb-2">
                <MapPin size={13} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm flex-1">{location.address}, {location.city} – {location.state}</Text>
              </View>
              <View className="flex-row items-center gap-1.5">
                <Clock size={13} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm">{formatWorkingHours()}</Text>
              </View>
            </>
          )}

          {partner.description && (
            <Text className="text-gray-600 text-sm leading-5 mt-4">{partner.description}</Text>
          )}
        </View>

        {/* Tabs */}
        <View className="flex-row bg-white border-t border-gray-100 mt-2">
          {(['services', 'reviews'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 py-3.5 items-center border-b-2 ${tab === t ? 'border-primary-500' : 'border-transparent'}`}
            >
              <Text className={`font-semibold text-sm ${tab === t ? 'text-primary-600' : 'text-gray-400'}`}>
                {t === 'services' ? `Serviços (${activeServices.length})` : 'Avaliações'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Serviços */}
        {tab === 'services' && (
          <View className="p-4 gap-3">
            {activeServices.length === 0 ? (
              <View className="bg-white rounded-2xl p-6 items-center">
                <Text className="text-gray-400">Nenhum serviço disponível.</Text>
              </View>
            ) : (
              activeServices.map(s => {
                const selected = selectedService === s.id
                const minPrice = s.pricing.length > 0 ? Math.min(...s.pricing.map(p => p.price)) : 0
                return (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setSelectedService(selected ? null : s.id)}
                    className={`bg-white rounded-2xl p-4 shadow-sm border-2 ${selected ? 'border-primary-400' : 'border-transparent'}`}
                    activeOpacity={0.8}
                  >
                    <View className="flex-row items-start justify-between mb-1">
                      <View className="flex-row items-center gap-2 flex-1">
                        <Text className="text-xl">{CATEGORY_EMOJI[s.category] ?? '🔧'}</Text>
                        <Text className="font-bold text-gray-900 flex-1">{s.name}</Text>
                      </View>
                      {minPrice > 0 && (
                        <View className="items-end">
                          <Text className="text-xs text-gray-400">a partir de</Text>
                          <Text className="font-bold text-primary-500 text-sm">
                            R$ {minPrice.toFixed(2).replace('.', ',')}
                          </Text>
                        </View>
                      )}
                    </View>

                    {s.description && (
                      <Text className="text-gray-500 text-sm mb-2">{s.description}</Text>
                    )}

                    <View className="flex-row items-center gap-1">
                      <Clock size={12} color="#9CA3AF" />
                      <Text className="text-gray-400 text-xs">{s.duration_minutes} minutos</Text>
                    </View>

                    {selected && s.pricing.length > 0 && (
                      <View className="mt-3 pt-3 border-t border-gray-100">
                        <Text className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                          Preço por veículo
                        </Text>
                        <View className="gap-1.5">
                          {s.pricing.map(p => (
                            <View key={p.vehicle_type} className="flex-row items-center justify-between bg-gray-50 px-3 py-2 rounded-xl">
                              <Text className="text-sm text-gray-600">{VEHICLE_LABELS[p.vehicle_type] ?? p.vehicle_type}</Text>
                              <Text className="font-semibold text-gray-900 text-sm">
                                R$ {p.price.toFixed(2).replace('.', ',')}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                  </TouchableOpacity>
                )
              })
            )}
          </View>
        )}

        {/* Avaliações */}
        {tab === 'reviews' && (
          <View className="p-4">
            <View className="bg-white rounded-2xl p-5 shadow-sm items-center">
              {partner.total_reviews > 0 ? (
                <>
                  <Text className="text-5xl font-bold text-gray-900">{partner.rating.toFixed(1)}</Text>
                  <View className="flex-row gap-0.5 mt-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={14} color="#F59E0B" fill={i <= Math.round(partner.rating) ? '#F59E0B' : 'transparent'} />
                    ))}
                  </View>
                  <Text className="text-xs text-gray-400 mt-1">{partner.total_reviews} avaliações</Text>
                </>
              ) : (
                <Text className="text-gray-400">Nenhuma avaliação ainda.</Text>
              )}
            </View>
          </View>
        )}

        <View className="h-32" />
      </ScrollView>

      {/* Botão fixo de agendar */}
      {selectedService && service && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 pt-4 pb-8 shadow-2xl">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="font-bold text-gray-900">{service.name}</Text>
              <Text className="text-gray-400 text-xs">{service.duration_minutes} min</Text>
            </View>
            {service.pricing.length > 0 && (
              <Text className="font-bold text-primary-500">
                R$ {Math.min(...service.pricing.map(p => p.price)).toFixed(2).replace('.', ',')}+
              </Text>
            )}
          </View>
          <TouchableOpacity
            className="bg-primary-500 rounded-2xl py-4 items-center flex-row justify-center gap-2"
            onPress={() => router.push({
              pathname: '/(client)/booking/new',
              params: { partnerId: partner.id, serviceId: selectedService },
            })}
          >
            <Text className="text-white font-bold text-base">Agendar agora</Text>
            <ChevronRight size={18} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}
