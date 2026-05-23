import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search, MapPin, Star, SlidersHorizontal, X } from 'lucide-react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { usePartners, isOpenNow, getMinPrice } from '@/hooks/usePartners'

const CATEGORIES = [
  { id: '', label: 'Todos' },
  { id: 'lavagem', label: '🚿 Lavagem' },
  { id: 'polimento', label: '✨ Polimento' },
  { id: 'higienizacao', label: '🧹 Higienização' },
  { id: 'ceramica', label: '🛡️ Cerâmica' },
]

const CARD_SHADOW = {
  shadowColor: '#1C1C1E', shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
}

function PartnerAvatar({ name }: { name: string }) {
  const colors = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']
  const idx = name.charCodeAt(0) % colors.length
  return (
    <View style={{
      width: 52, height: 52, borderRadius: 16,
      backgroundColor: colors[idx],
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  )
}

export default function ExploreScreen() {
  const { category: initialCategory = '' } = useLocalSearchParams<{ category?: string }>()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory)

  const { data: partners = [], isLoading } = usePartners(search || undefined, category || undefined)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFD' }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFD" />

      {/* Header */}
      <View style={{
        backgroundColor: 'white', paddingHorizontal: 20,
        paddingTop: 20, paddingBottom: 0,
        shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
      }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.3, marginBottom: 14 }}>
          Explorar
        </Text>

        {/* Search */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <View style={{
            flex: 1, flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#F3F4F6', borderRadius: 16,
            paddingHorizontal: 14, paddingVertical: 12, gap: 10,
          }}>
            <Search size={16} color="#9CA3AF" />
            <TextInput
              style={{ flex: 1, fontSize: 14, color: '#111827' }}
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
          <TouchableOpacity style={{
            width: 46, height: 46, backgroundColor: '#EFF6FF',
            borderRadius: 14, alignItems: 'center', justifyContent: 'center',
            borderWidth: 1.5, borderColor: '#BFDBFE',
          }}>
            <SlidersHorizontal size={18} color="#0EA5E9" />
          </TouchableOpacity>
        </View>

        {/* Categorias */}
        <FlatList
          data={CATEGORIES}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={c => c.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 14 }}
          renderItem={({ item: cat }) => (
            <TouchableOpacity
              onPress={() => setCategory(cat.id)}
              style={{
                paddingHorizontal: 16, paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: category === cat.id ? '#0EA5E9' : '#F3F4F6',
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: '600',
                color: category === cat.id ? 'white' : '#6B7280',
              }}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Resultados */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 13 }}>Buscando parceiros...</Text>
        </View>
      ) : (
        <FlatList
          data={partners}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            partners.length > 0 ? (
              <Text style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 4 }}>
                {partners.length} resultado{partners.length !== 1 ? 's' : ''} encontrado{partners.length !== 1 ? 's' : ''}
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 64 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#374151' }}>
                Nenhum resultado encontrado
              </Text>
              <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>
                Tente outra busca ou categoria
              </Text>
            </View>
          }
          renderItem={({ item: partner }) => {
            const location = partner.partner_locations?.[0]
            const minPrice = getMinPrice(partner.services)
            const open = location ? isOpenNow(location.working_hours) : false
            const categories = [...new Set(partner.services.filter(s => s.is_active).map(s => s.category))]

            return (
              <TouchableOpacity
                style={{ backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', ...CARD_SHADOW }}
                onPress={() => router.push(`/(client)/partner/${partner.id}`)}
                activeOpacity={0.85}
              >
                {/* Status stripe */}
                <View style={{ height: 3, backgroundColor: open ? '#10B981' : '#E5E7EB' }} />

                <View style={{ padding: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <PartnerAvatar name={partner.business_name} />

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ fontWeight: '700', fontSize: 15, color: '#111827', flex: 1, marginRight: 8 }} numberOfLines={1}>
                          {partner.business_name}
                        </Text>
                        <View style={{
                          paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10,
                          backgroundColor: open ? '#F0FDF4' : '#F9FAFB',
                        }}>
                          <Text style={{ fontSize: 11, fontWeight: '600', color: open ? '#047857' : '#9CA3AF' }}>
                            {open ? 'Aberto' : 'Fechado'}
                          </Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 5 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <Star size={11} color="#F59E0B" fill="#F59E0B" />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#B45309' }}>
                            {partner.rating > 0 ? partner.rating.toFixed(1) : 'Novo'}
                          </Text>
                          {partner.total_reviews > 0 && (
                            <Text style={{ fontSize: 11, color: '#9CA3AF' }}>({partner.total_reviews})</Text>
                          )}
                        </View>
                        {location && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                            <MapPin size={11} color="#9CA3AF" />
                            <Text style={{ fontSize: 12, color: '#6B7280' }}>
                              {location.city}, {location.state}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  <View style={{
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                    marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F9FAFB',
                  }}>
                    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1, marginRight: 8 }}>
                      {categories.slice(0, 2).map(cat => (
                        <View key={cat} style={{
                          backgroundColor: '#F3F4F6', paddingHorizontal: 10,
                          paddingVertical: 4, borderRadius: 10,
                        }}>
                          <Text style={{ fontSize: 11, color: '#6B7280', fontWeight: '500', textTransform: 'capitalize' }}>
                            {cat}
                          </Text>
                        </View>
                      ))}
                    </View>
                    {minPrice !== null ? (
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#0EA5E9' }}>
                        A partir de R$ {minPrice.toFixed(2).replace('.', ',')}
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 12, color: '#9CA3AF' }}>Sem serviços</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )
          }}
        />
      )}
    </SafeAreaView>
  )
}
