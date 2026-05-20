import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search, MapPin, Star, Clock } from 'lucide-react-native'
import { router } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { usePartners, isOpenNow, getMinPrice } from '@/hooks/usePartners'

const CATEGORIES = [
  { id: 'lavagem', label: 'Lavagem', emoji: '🚿' },
  { id: 'polimento', label: 'Polimento', emoji: '✨' },
  { id: 'higienizacao', label: 'Higienização', emoji: '🧹' },
  { id: 'ceramica', label: 'Cerâmica', emoji: '🛡️' },
]

export default function HomeScreen() {
  const { session } = useAuth()
  const userName = session?.user?.user_metadata?.full_name ?? 'Usuário'
  const initial = userName.charAt(0).toUpperCase()

  const { data: partners = [], isLoading } = usePartners()
  const nearby = partners.slice(0, 5)

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View className="bg-primary-500 px-6 pt-6 pb-12">
          <View className="flex-row items-center justify-between mb-1">
            <View>
              <Text className="text-primary-100 text-sm">Sua localização</Text>
              <View className="flex-row items-center gap-1 mt-0.5">
                <MapPin size={14} color="white" />
                <Text className="text-white font-semibold">Brasil</Text>
              </View>
            </View>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-primary-400 items-center justify-center"
              onPress={() => router.push('/(client)/profile')}
            >
              <Text className="text-white font-bold text-base">{initial}</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-white text-2xl font-bold mt-4">
            Olá, {userName.split(' ')[0]}! 👋
          </Text>
          <Text className="text-primary-100 mt-1">Que serviço você precisa hoje?</Text>

          <TouchableOpacity
            className="bg-white rounded-2xl flex-row items-center px-4 py-3.5 mt-5"
            onPress={() => router.push('/(client)/explore')}
          >
            <Search size={18} color="#9CA3AF" />
            <Text className="text-gray-400 ml-3 flex-1 text-base">Buscar lava cars...</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View className="px-6 -mt-6">
          <View className="bg-white rounded-2xl p-4 shadow-sm flex-row justify-between">
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className="items-center gap-2"
                onPress={() => router.push(`/(client)/explore?category=${cat.id}`)}
              >
                <View className="w-14 h-14 bg-primary-50 rounded-2xl items-center justify-center">
                  <Text className="text-2xl">{cat.emoji}</Text>
                </View>
                <Text className="text-xs font-medium text-gray-600">{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nearby */}
        <View className="px-6 mt-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">Disponíveis</Text>
            <TouchableOpacity onPress={() => router.push('/(client)/explore')}>
              <Text className="text-primary-500 font-medium text-sm">Ver todos</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View className="items-center py-10">
              <ActivityIndicator color="#0EA5E9" />
              <Text className="text-gray-400 mt-3 text-sm">Buscando lava cars...</Text>
            </View>
          ) : nearby.length === 0 ? (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Text className="text-3xl mb-2">🚗</Text>
              <Text className="text-gray-500 font-medium text-center">
                Nenhum lava car cadastrado ainda.
              </Text>
              <Text className="text-gray-400 text-xs text-center mt-1">
                Em breve parceiros estarão disponíveis na sua região!
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {nearby.map((partner) => {
                const location = partner.partner_locations?.[0]
                const minPrice = getMinPrice(partner.services)
                const open = location ? isOpenNow(location.working_hours) : false
                return (
                  <TouchableOpacity
                    key={partner.id}
                    className="bg-white rounded-2xl p-4 shadow-sm"
                    onPress={() => router.push(`/(client)/partner/${partner.id}`)}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="font-bold text-gray-900 text-base">{partner.business_name}</Text>
                        <View className="flex-row items-center gap-1 mt-1">
                          <MapPin size={12} color="#6B7280" />
                          <Text className="text-gray-500 text-xs">
                            {location ? `${location.city}, ${location.state}` : 'Localização não informada'}
                          </Text>
                        </View>
                      </View>
                      <View className="flex-row items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                        <Text className="text-amber-700 font-semibold text-xs">
                          {partner.rating > 0 ? partner.rating.toFixed(1) : 'Novo'}
                        </Text>
                        {partner.total_reviews > 0 && (
                          <Text className="text-amber-600 text-xs">({partner.total_reviews})</Text>
                        )}
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
                      <View className="flex-row items-center gap-1">
                        <Clock size={12} color={open ? '#10B981' : '#9CA3AF'} />
                        <Text className={`text-xs ${open ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {open ? 'Aberto agora' : 'Fechado'}
                        </Text>
                      </View>
                      {minPrice !== null ? (
                        <Text className="text-primary-500 font-bold text-sm">
                          A partir de R$ {minPrice.toFixed(2).replace('.', ',')}
                        </Text>
                      ) : (
                        <Text className="text-gray-400 text-xs">Sem serviços</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  )
}
