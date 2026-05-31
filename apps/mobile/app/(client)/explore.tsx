import { useState, useEffect } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  FlatList, ActivityIndicator, StatusBar, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search, MapPin, Star, Navigation, X } from 'lucide-react-native'
import { router, useLocalSearchParams } from 'expo-router'
import * as Location from 'expo-location'
import {
  useNearbyPartners, usePartners,
  getNearbyMinPrice, getMinPrice, isOpenNow,
  NearbyPartner, PartnerWithDetails,
} from '@/hooks/usePartners'

const CATEGORIES = [
  { id: '', label: 'Todos' },
  { id: 'lavagem', label: '🚿 Lavagem' },
  { id: 'polimento', label: '✨ Polimento' },
  { id: 'higienizacao', label: '🧹 Higienização' },
  { id: 'ceramica', label: '🛡️ Cerâmica' },
]

const RADIUS_OPTIONS = [
  { km: 5, label: '5 km' },
  { km: 10, label: '10 km' },
  { km: 20, label: '20 km' },
  { km: 50, label: '50 km' },
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

function NearbyCard({ partner }: { partner: NearbyPartner }) {
  const categories = [...new Set(partner.services.map(s => s.category))]
  const minPrice = getNearbyMinPrice(partner.services)

  return (
    <TouchableOpacity
      style={{ backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', ...CARD_SHADOW }}
      onPress={() => router.push(`/(client)/partner/${partner.partner_id}`)}
      activeOpacity={0.85}
    >
      <View style={{ height: 3, backgroundColor: '#0EA5E9' }} />
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
                backgroundColor: '#EFF6FF', flexDirection: 'row', alignItems: 'center', gap: 3,
              }}>
                <Navigation size={10} color="#0EA5E9" />
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#0369A1' }}>
                  {partner.distance_km} km
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <MapPin size={11} color="#9CA3AF" />
                <Text style={{ fontSize: 12, color: '#6B7280' }}>
                  {partner.city}, {partner.state}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F9FAFB',
        }}>
          <View style={{ flexDirection: 'row', gap: 6, flex: 1, marginRight: 8 }}>
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
}

function FallbackCard({ partner }: { partner: PartnerWithDetails }) {
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
          <View style={{ flexDirection: 'row', gap: 6, flex: 1, marginRight: 8 }}>
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
}

export default function ExploreScreen() {
  const { category: initialCategory = '' } = useLocalSearchParams<{ category?: string }>()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState(initialCategory)
  const [radiusKm, setRadiusKm] = useState(10)
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationDenied, setLocationDenied] = useState(false)
  const [locationLoading, setLocationLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        setLocationDenied(true)
        setLocationLoading(false)
        return
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })
      setCoords(loc.coords)
      setLocationLoading(false)
    })()
  }, [])

  const nearby = useNearbyPartners(coords, radiusKm, category || undefined)
  const fallback = usePartners(search || undefined, category || undefined)

  const usingNearby = !!coords
  const isLoading = locationLoading || (usingNearby ? nearby.isLoading : fallback.isLoading)
  const nearbyData = nearby.data ?? []
  const fallbackData = fallback.data ?? []

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
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', letterSpacing: -0.3 }}>
            Explorar
          </Text>
          {usingNearby && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5,
              backgroundColor: '#F0FDF4', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 }}>
              <Navigation size={12} color="#059669" />
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#059669' }}>GPS ativo</Text>
            </View>
          )}
        </View>

        {/* Busca por nome (só no modo fallback) */}
        {!usingNearby && (
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
          </View>
        )}

        {/* Filtro de raio (só com GPS) */}
        {usingNearby && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
            {RADIUS_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.km}
                onPress={() => setRadiusKm(opt.km)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
                  backgroundColor: radiusKm === opt.km ? '#0369A1' : '#F3F4F6',
                  flexDirection: 'row', alignItems: 'center', gap: 5,
                }}
              >
                <MapPin size={12} color={radiusKm === opt.km ? 'white' : '#9CA3AF'} />
                <Text style={{
                  fontSize: 13, fontWeight: '600',
                  color: radiusKm === opt.km ? 'white' : '#6B7280',
                }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Filtro de categorias */}
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
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
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

      {/* Conteúdo */}
      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0EA5E9" />
          <Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 13 }}>
            {locationLoading ? 'Obtendo localização...' : 'Buscando parceiros...'}
          </Text>
        </View>
      ) : locationDenied ? (
        /* Fallback: busca por nome sem GPS */
        <FlatList
          data={fallbackData}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 8,
              backgroundColor: '#FFF7ED', borderRadius: 14,
              padding: 12, marginBottom: 8,
            }}>
              <MapPin size={16} color="#D97706" />
              <Text style={{ fontSize: 12, color: '#92400E', flex: 1, fontWeight: '500' }}>
                Localização não autorizada. Busca por nome disponível.
              </Text>
            </View>
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 64 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🔍</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#374151' }}>Nenhum resultado</Text>
              <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>Tente outra busca ou categoria</Text>
            </View>
          }
          renderItem={({ item }) => <FallbackCard partner={item} />}
        />
      ) : (
        /* Modo principal: ordenado por distância */
        <FlatList
          data={nearbyData}
          keyExtractor={item => item.partner_id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            nearbyData.length > 0 ? (
              <Text style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 4 }}>
                {nearbyData.length} parceiro{nearbyData.length !== 1 ? 's' : ''} em até {radiusKm} km
              </Text>
            ) : null
          }
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 64 }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>📍</Text>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#374151' }}>
                Nenhum lava car encontrado
              </Text>
              <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 6 }}>
                Tente aumentar o raio de busca
              </Text>
            </View>
          }
          renderItem={({ item }) => <NearbyCard partner={item} />}
        />
      )}
    </SafeAreaView>
  )
}
