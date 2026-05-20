import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search, MapPin, Star, Clock, SlidersHorizontal, X } from 'lucide-react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { usePartners, isOpenNow, getMinPrice } from '@/hooks/usePartners'

const CATEGORIES = [
  { id: '', label: 'Todos' },
  { id: 'lavagem', label: '🚿 Lavagem' },
  { id: 'polimento', label: '✨ Polimento' },
  { id: 'higienizacao', label: '🧹 Higienização' },
  { id: 'ceramica', label: '🛡️ Cerâmica' },
]

export default function ExploreScreen() {
  const { category: initialCategory = '' } = useLocalSearchParams<{ category?: string }>()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory)

  const { data: partners = [], isLoading } = usePartners(search || undefined, category || undefined)

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-5 pt-4 pb-3 border-b border-gray-100">
        <View className="flex-row items-center gap-3 mb-3">
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-2xl px-4 py-3 gap-2">
            <Search size={16} color="#9CA3AF" />
            <TextInput
              className="flex-1 text-base text-gray-900"
              placeholder="Buscar lava cars..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <X size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity className="w-11 h-11 bg-primary-50 rounded-2xl items-center justify-center">
            <SlidersHorizontal size={18} color="#0EA5E9" />
          </TouchableOpacity>
        </View>

        {/* Categorias */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={c => c.id}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              onPress={() => setCategory(cat.id)}
              className={`mr-2 px-4 py-2 rounded-full ${category === cat.id ? 'bg-primary-500' : 'bg-gray-100'}`}
            >
              <Text className={`text-sm font-medium ${category === cat.id ? 'text-white' : 'text-gray-600'}`}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Resultados */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text className="text-gray-400 mt-3">Buscando parceiros...</Text>
        </View>
      ) : (
        <FlatList
          data={partners}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text className="text-sm text-gray-500 mb-1">
              {partners.length} resultado{partners.length !== 1 ? 's' : ''} encontrado{partners.length !== 1 ? 's' : ''}
            </Text>
          }
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-3">🔍</Text>
              <Text className="text-gray-500 font-medium">Nenhum resultado encontrado</Text>
              <Text className="text-gray-400 text-sm mt-1">Tente outra busca ou categoria</Text>
            </View>
          }
          renderItem={({ item: partner }) => {
            const location = partner.partner_locations?.[0]
            const minPrice = getMinPrice(partner.services)
            const open = location ? isOpenNow(location.working_hours) : false
            const categories = [...new Set(partner.services.filter(s => s.is_active).map(s => s.category))]

            return (
              <TouchableOpacity
                className="bg-white rounded-2xl p-4 shadow-sm"
                onPress={() => router.push(`/(client)/partner/${partner.id}`)}
                activeOpacity={0.8}
              >
                <View className="flex-row items-start gap-3">
                  <View className="w-14 h-14 bg-primary-100 rounded-2xl items-center justify-center">
                    <Text className="text-2xl">🚗</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <Text className="font-bold text-gray-900 flex-1 mr-2" numberOfLines={1}>
                        {partner.business_name}
                      </Text>
                      <View className={`px-2 py-0.5 rounded-full ${open ? 'bg-emerald-50' : 'bg-gray-100'}`}>
                        <Text className={`text-xs font-semibold ${open ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {open ? 'Aberto' : 'Fechado'}
                        </Text>
                      </View>
                    </View>

                    <View className="flex-row items-center gap-3 mt-1">
                      <View className="flex-row items-center gap-1">
                        <Star size={12} color="#F59E0B" fill="#F59E0B" />
                        <Text className="text-xs font-semibold text-amber-700">
                          {partner.rating > 0 ? partner.rating.toFixed(1) : 'Novo'}
                        </Text>
                        {partner.total_reviews > 0 && (
                          <Text className="text-xs text-gray-400">({partner.total_reviews})</Text>
                        )}
                      </View>
                      {location && (
                        <View className="flex-row items-center gap-1">
                          <MapPin size={12} color="#9CA3AF" />
                          <Text className="text-xs text-gray-500">{location.city}, {location.state}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-50">
                  <View className="flex-row gap-1.5 flex-wrap flex-1 mr-2">
                    {categories.slice(0, 2).map(cat => (
                      <View key={cat} className="bg-gray-100 px-2.5 py-1 rounded-full">
                        <Text className="text-xs text-gray-500 capitalize">{cat}</Text>
                      </View>
                    ))}
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
          }}
        />
      )}
    </SafeAreaView>
  )
}
