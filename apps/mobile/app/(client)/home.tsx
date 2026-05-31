import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Search, MapPin, Star, ArrowRight } from 'lucide-react-native'
import { router } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { usePartners, isOpenNow, getMinPrice } from '@/hooks/usePartners'

const CATEGORIES = [
  { id: 'lavagem',      label: 'Lavagem',     emoji: '🚿', color: '#EFF6FF', border: '#BFDBFE' },
  { id: 'polimento',    label: 'Polimento',   emoji: '✨', color: '#FEFCE8', border: '#FDE68A' },
  { id: 'higienizacao', label: 'Higienização',emoji: '🧹', color: '#F0FDF4', border: '#BBF7D0' },
  { id: 'ceramica',     label: 'Cerâmica',    emoji: '🛡️', color: '#FFF7ED', border: '#FED7AA' },
]

const CARD_SHADOW = {
  shadowColor: '#1C1C1E',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 12,
  elevation: 3,
}

function PartnerAvatar({ name }: { name: string }) {
  const colors = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']
  const idx = name.charCodeAt(0) % colors.length
  return (
    <View style={{
      width: 48, height: 48, borderRadius: 14,
      backgroundColor: colors[idx],
      alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  )
}

export default function HomeScreen() {
  const { session } = useAuth()
  const userName = session?.user?.user_metadata?.full_name ?? 'Usuário'
  const firstName = userName.split(' ')[0]
  const initial = firstName.charAt(0).toUpperCase()

  const { data: partners = [], isLoading } = usePartners()
  const nearby = partners.slice(0, 5)

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFD' }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0369A1" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header curvo */}
        <View style={{
          backgroundColor: '#0369A1',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 52,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}>
          {/* Topo: localização + avatar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <View>
              <Text style={{ color: 'rgba(186,230,253,0.7)', fontSize: 12, fontWeight: '500' }}>
                Sua localização
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <MapPin size={13} color="#7DD3FC" />
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>Brasil</Text>
              </View>
            </View>

            <TouchableOpacity
              style={{
                width: 42, height: 42, borderRadius: 21,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center', justifyContent: 'center',
              }}
              onPress={() => router.push('/(client)/profile')}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>{initial}</Text>
            </TouchableOpacity>
          </View>

          {/* Saudação */}
          <Text style={{ color: 'white', fontSize: 24, fontWeight: '800', letterSpacing: -0.3 }}>
            Olá, {firstName}! 👋
          </Text>
          <Text style={{ color: 'rgba(186,230,253,0.8)', fontSize: 14, marginTop: 4 }}>
            Que serviço você precisa hoje?
          </Text>

          {/* Search bar */}
          <TouchableOpacity
            style={{
              backgroundColor: 'white',
              borderRadius: 16, flexDirection: 'row',
              alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14,
              marginTop: 20, gap: 10,
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.12, shadowRadius: 12, elevation: 4,
            }}
            onPress={() => router.push('/(client)/explore')}
            activeOpacity={0.9}
          >
            <Search size={18} color="#9CA3AF" />
            <Text style={{ color: '#9CA3AF', flex: 1, fontSize: 15 }}>
              Buscar lava cars...
            </Text>
          </TouchableOpacity>
        </View>

        {/* Categorias flutuantes */}
        <View style={{ paddingHorizontal: 20, marginTop: -24 }}>
          <View style={{
            backgroundColor: 'white', borderRadius: 20,
            padding: 16, flexDirection: 'row', justifyContent: 'space-between',
            ...CARD_SHADOW,
          }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={{ alignItems: 'center', gap: 8 }}
                onPress={() => router.push(`/(client)/explore?category=${cat.id}`)}
                activeOpacity={0.7}
              >
                <View style={{
                  width: 56, height: 56, borderRadius: 16,
                  backgroundColor: cat.color,
                  borderWidth: 1.5, borderColor: cat.border,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 22 }}>{cat.emoji}</Text>
                </View>
                <Text style={{ fontSize: 10, fontWeight: '600', color: '#4B5563' }}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Disponíveis */}
        <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827', letterSpacing: -0.2 }}>
                Disponíveis agora
              </Text>
              <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>
                Lava cars perto de você
              </Text>
            </View>
            <TouchableOpacity
              style={{
                flexDirection: 'row', alignItems: 'center', gap: 4,
                backgroundColor: '#EFF6FF', paddingHorizontal: 12,
                paddingVertical: 7, borderRadius: 20,
              }}
              onPress={() => router.push('/(client)/explore')}
            >
              <Text style={{ color: '#0EA5E9', fontWeight: '600', fontSize: 12 }}>Ver todos</Text>
              <ArrowRight size={13} color="#0EA5E9" />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <ActivityIndicator color="#0EA5E9" size="large" />
              <Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 13 }}>
                Buscando lava cars...
              </Text>
            </View>
          ) : nearby.length === 0 ? (
            <View style={{
              backgroundColor: 'white', borderRadius: 20,
              padding: 32, alignItems: 'center',
              ...CARD_SHADOW,
            }}>
              <Text style={{ fontSize: 40, marginBottom: 12 }}>🚗</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#374151', textAlign: 'center' }}>
                Nenhum lava car cadastrado ainda
              </Text>
              <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 6, lineHeight: 18 }}>
                Em breve parceiros estarão disponíveis na sua região!
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {nearby.map((partner) => {
                const location = partner.partner_locations?.[0]
                const minPrice = getMinPrice(partner.services)
                const open = location ? isOpenNow(location.working_hours) : false
                return (
                  <TouchableOpacity
                    key={partner.id}
                    style={{
                      backgroundColor: 'white', borderRadius: 20,
                      overflow: 'hidden', ...CARD_SHADOW,
                    }}
                    onPress={() => router.push(`/(client)/partner/${partner.id}`)}
                    activeOpacity={0.85}
                  >
                    {/* Status stripe */}
                    <View style={{
                      height: 3,
                      backgroundColor: open ? '#10B981' : '#E5E7EB',
                    }} />

                    <View style={{ padding: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <PartnerAvatar name={partner.business_name} />

                        <View style={{ flex: 1 }}>
                          <Text style={{ fontWeight: '700', fontSize: 15, color: '#111827' }} numberOfLines={1}>
                            {partner.business_name}
                          </Text>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                            <MapPin size={11} color="#9CA3AF" />
                            <Text style={{ fontSize: 12, color: '#6B7280' }}>
                              {location ? `${location.city}, ${location.state}` : 'Localização não informada'}
                            </Text>
                          </View>
                        </View>

                        <View style={{
                          flexDirection: 'row', alignItems: 'center', gap: 3,
                          backgroundColor: '#FFFBEB', paddingHorizontal: 8,
                          paddingVertical: 5, borderRadius: 10,
                        }}>
                          <Star size={11} color="#F59E0B" fill="#F59E0B" />
                          <Text style={{ fontSize: 12, fontWeight: '700', color: '#B45309' }}>
                            {partner.rating > 0 ? partner.rating.toFixed(1) : 'Novo'}
                          </Text>
                        </View>
                      </View>

                      <View style={{
                        flexDirection: 'row', alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 14, paddingTop: 12,
                        borderTopWidth: 1, borderTopColor: '#F9FAFB',
                      }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          <View style={{
                            width: 7, height: 7, borderRadius: 4,
                            backgroundColor: open ? '#10B981' : '#D1D5DB',
                          }} />
                          <Text style={{ fontSize: 12, color: open ? '#059669' : '#9CA3AF', fontWeight: '500' }}>
                            {open ? 'Aberto agora' : 'Fechado'}
                          </Text>
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
              })}
            </View>
          )}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  )
}
