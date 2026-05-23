import { useState } from 'react'
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'
import { ArrowLeft, Star, MapPin, Clock, ChevronRight, Share2, Heart, CheckCircle2 } from 'lucide-react-native'
import { usePartner, isOpenNow } from '@/hooks/usePartners'

const VEHICLE_LABELS: Record<string, string> = {
  hatch: 'Hatch', sedan: 'Sedan', suv: 'SUV',
  pickup: 'Pickup', van: 'Van', motorcycle: 'Moto',
}

const CATEGORY_EMOJI: Record<string, string> = {
  lavagem: '🚿', polimento: '✨', higienizacao: '🧹', ceramica: '🛡️', outros: '🔧',
}

const WEEK_DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const AVATAR_COLORS = ['#0EA5E9', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899']

export default function PartnerDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [favorited, setFavorited] = useState(false)
  const [tab, setTab] = useState<'services' | 'reviews'>('services')

  const { data: partner, isLoading } = usePartner(id)

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </SafeAreaView>
    )
  }

  if (!partner) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <Text style={{ fontSize: 40, marginBottom: 16 }}>😕</Text>
        <Text style={{ color: '#374151', fontWeight: '700', fontSize: 16, textAlign: 'center' }}>
          Parceiro não encontrado
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16, backgroundColor: '#0EA5E9', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14 }}
        >
          <Text style={{ color: 'white', fontWeight: '700' }}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  const location = partner.partner_locations?.[0]
  const open = location ? isOpenNow(location.working_hours) : false
  const activeServices = partner.services.filter(s => s.is_active)
  const service = activeServices.find(s => s.id === selectedService)
  const avatarColor = AVATAR_COLORS[partner.business_name.charCodeAt(0) % AVATAR_COLORS.length]

  function formatWorkingHours() {
    if (!location?.working_hours?.length) return 'Horários não informados'
    const openDays = location.working_hours.filter(h => h.is_open)
    if (!openDays.length) return 'Fechado'
    const first = openDays[0]
    const last = openDays[openDays.length - 1]
    return `${WEEK_DAYS[first.day]}–${WEEK_DAYS[last.day]} · ${first.open}–${first.close}`
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFD' }}>
      <StatusBar barStyle="light-content" />

      {/* Hero */}
      <View style={{
        height: 220, backgroundColor: avatarColor,
        alignItems: 'center', justifyContent: 'center',
      }}>
        {/* Círculos decorativos */}
        <View style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: 100,
          backgroundColor: 'rgba(255,255,255,0.08)',
        }} />
        <View style={{
          position: 'absolute', bottom: -20, left: -30,
          width: 140, height: 140, borderRadius: 70,
          backgroundColor: 'rgba(255,255,255,0.06)',
        }} />

        {/* Logo / inicial */}
        <View style={{
          width: 88, height: 88, borderRadius: 28,
          backgroundColor: 'rgba(255,255,255,0.2)',
          alignItems: 'center', justifyContent: 'center',
          borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
          shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2, shadowRadius: 16,
        }}>
          <Text style={{ color: 'white', fontSize: 36, fontWeight: '800' }}>
            {partner.business_name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Controles do header */}
        <SafeAreaView edges={['top']} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 8 }}>
            <TouchableOpacity
              style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.25)',
                alignItems: 'center', justifyContent: 'center',
              }}
              onPress={() => router.back()}
            >
              <ArrowLeft size={20} color="white" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(0,0,0,0.25)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Share2 size={18} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: favorited ? 'rgba(244,63,94,0.8)' : 'rgba(0,0,0,0.25)',
                  alignItems: 'center', justifyContent: 'center',
                }}
                onPress={() => setFavorited(f => !f)}
              >
                <Heart size={18} color="white" fill={favorited ? 'white' : 'transparent'} />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Card de info */}
        <View style={{
          backgroundColor: 'white',
          borderTopLeftRadius: 28, borderTopRightRadius: 28,
          marginTop: -20, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 8,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#111827', flex: 1, marginRight: 12, letterSpacing: -0.3 }}>
              {partner.business_name}
            </Text>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 5,
              backgroundColor: open ? '#F0FDF4' : '#F3F4F6',
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
            }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: open ? '#10B981' : '#D1D5DB' }} />
              <Text style={{ fontSize: 12, fontWeight: '700', color: open ? '#047857' : '#9CA3AF' }}>
                {open ? 'Aberto agora' : 'Fechado'}
              </Text>
            </View>
          </View>

          {/* Rating */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', gap: 2 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={14} color="#F59E0B"
                  fill={partner.rating > 0 && i <= Math.round(partner.rating) ? '#F59E0B' : 'transparent'} />
              ))}
            </View>
            <Text style={{ fontWeight: '700', color: '#111827', fontSize: 14 }}>
              {partner.rating > 0 ? partner.rating.toFixed(1) : 'Sem avaliações'}
            </Text>
            {partner.total_reviews > 0 && (
              <Text style={{ color: '#9CA3AF', fontSize: 13 }}>({partner.total_reviews} avaliações)</Text>
            )}
          </View>

          {/* Localização e horário */}
          {location && (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <View style={{
                  width: 32, height: 32, borderRadius: 10, backgroundColor: '#EFF6FF',
                  alignItems: 'center', justifyContent: 'center', marginTop: 1,
                }}>
                  <MapPin size={14} color="#0EA5E9" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#374151', fontSize: 13, lineHeight: 20 }}>
                    {location.address}{location.number ? `, ${location.number}` : ''} — {location.city}, {location.state}
                  </Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{
                  width: 32, height: 32, borderRadius: 10, backgroundColor: '#F0FDF4',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Clock size={14} color="#10B981" />
                </View>
                <Text style={{ color: '#374151', fontSize: 13 }}>{formatWorkingHours()}</Text>
              </View>
            </View>
          )}

          {partner.description && (
            <Text style={{ color: '#6B7280', fontSize: 13, lineHeight: 20, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
              {partner.description}
            </Text>
          )}
        </View>

        {/* Tabs */}
        <View style={{ flexDirection: 'row', backgroundColor: 'white', marginTop: 8, paddingHorizontal: 20, gap: 4 }}>
          {(['services', 'reviews'] as const).map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={{
                flex: 1, paddingVertical: 14, alignItems: 'center',
                borderBottomWidth: 2.5,
                borderBottomColor: tab === t ? '#0EA5E9' : 'transparent',
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '700', color: tab === t ? '#0EA5E9' : '#9CA3AF' }}>
                {t === 'services' ? `Serviços (${activeServices.length})` : 'Avaliações'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Serviços */}
        {tab === 'services' && (
          <View style={{ padding: 16, gap: 10 }}>
            {activeServices.length === 0 ? (
              <View style={{ backgroundColor: 'white', borderRadius: 20, padding: 32, alignItems: 'center' }}>
                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Nenhum serviço disponível.</Text>
              </View>
            ) : (
              activeServices.map(s => {
                const selected = selectedService === s.id
                const minPrice = s.pricing.length > 0 ? Math.min(...s.pricing.map(p => p.price)) : 0
                return (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setSelectedService(selected ? null : s.id)}
                    style={{
                      backgroundColor: 'white', borderRadius: 20,
                      borderWidth: 2, borderColor: selected ? '#0EA5E9' : 'transparent',
                      shadowColor: selected ? '#0EA5E9' : '#1C1C1E',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: selected ? 0.15 : 0.07,
                      shadowRadius: 12, elevation: 3,
                      overflow: 'hidden',
                    }}
                    activeOpacity={0.8}
                  >
                    {/* Top color stripe */}
                    <View style={{ height: 3, backgroundColor: selected ? '#0EA5E9' : 'transparent' }} />

                    <View style={{ padding: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                          <View style={{
                            width: 42, height: 42, borderRadius: 14,
                            backgroundColor: selected ? '#EFF6FF' : '#F3F4F6',
                            alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Text style={{ fontSize: 20 }}>{CATEGORY_EMOJI[s.category] ?? '🔧'}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '700', fontSize: 15, color: '#111827' }}>{s.name}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
                              <Clock size={11} color="#9CA3AF" />
                              <Text style={{ fontSize: 12, color: '#9CA3AF' }}>{s.duration_minutes} min</Text>
                            </View>
                          </View>
                        </View>

                        <View style={{ alignItems: 'flex-end', gap: 4 }}>
                          {minPrice > 0 && (
                            <View>
                              <Text style={{ fontSize: 10, color: '#9CA3AF' }}>a partir de</Text>
                              <Text style={{ fontWeight: '800', color: '#0EA5E9', fontSize: 15 }}>
                                R$ {minPrice.toFixed(2).replace('.', ',')}
                              </Text>
                            </View>
                          )}
                          {selected && (
                            <CheckCircle2 size={20} color="#0EA5E9" fill="#EFF6FF" />
                          )}
                        </View>
                      </View>

                      {s.description && (
                        <Text style={{ fontSize: 13, color: '#6B7280', marginTop: 10, lineHeight: 18 }}>
                          {s.description}
                        </Text>
                      )}

                      {selected && s.pricing.length > 0 && (
                        <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
                            Preço por tipo de veículo
                          </Text>
                          <View style={{ gap: 6 }}>
                            {s.pricing.map(p => (
                              <View key={p.vehicle_type} style={{
                                flexDirection: 'row', alignItems: 'center',
                                justifyContent: 'space-between',
                                backgroundColor: '#F8FAFD', paddingHorizontal: 14,
                                paddingVertical: 10, borderRadius: 12,
                              }}>
                                <Text style={{ fontSize: 13, color: '#374151', fontWeight: '500' }}>
                                  {VEHICLE_LABELS[p.vehicle_type] ?? p.vehicle_type}
                                </Text>
                                <Text style={{ fontSize: 14, fontWeight: '700', color: '#111827' }}>
                                  R$ {p.price.toFixed(2).replace('.', ',')}
                                </Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                )
              })
            )}
          </View>
        )}

        {/* Avaliações */}
        {tab === 'reviews' && (
          <View style={{ padding: 16 }}>
            <View style={{
              backgroundColor: 'white', borderRadius: 20, padding: 28,
              alignItems: 'center',
              shadowColor: '#1C1C1E', shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
            }}>
              {partner.total_reviews > 0 ? (
                <>
                  <Text style={{ fontSize: 56, fontWeight: '800', color: '#111827', letterSpacing: -2 }}>
                    {partner.rating.toFixed(1)}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 3, marginTop: 4 }}>
                    {[1, 2, 3, 4, 5].map(i => (
                      <Star key={i} size={20} color="#F59E0B"
                        fill={i <= Math.round(partner.rating) ? '#F59E0B' : 'transparent'} />
                    ))}
                  </View>
                  <Text style={{ fontSize: 13, color: '#9CA3AF', marginTop: 8 }}>
                    Baseado em {partner.total_reviews} avaliações
                  </Text>
                </>
              ) : (
                <>
                  <Text style={{ fontSize: 40, marginBottom: 12 }}>⭐</Text>
                  <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
                    Nenhuma avaliação ainda.{'\n'}Seja o primeiro a avaliar!
                  </Text>
                </>
              )}
            </View>
          </View>
        )}

        <View style={{ height: selectedService ? 130 : 32 }} />
      </ScrollView>

      {/* Botão flutuante de agendar */}
      {selectedService && service && (
        <View style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          backgroundColor: 'white',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          paddingHorizontal: 20, paddingTop: 16, paddingBottom: 36,
          shadowColor: '#000', shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.1, shadowRadius: 24, elevation: 12,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <View>
              <Text style={{ fontWeight: '700', fontSize: 15, color: '#111827' }}>{service.name}</Text>
              <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>
                {service.duration_minutes} min · {CATEGORY_EMOJI[service.category]} {service.category}
              </Text>
            </View>
            {service.pricing.length > 0 && (
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ fontSize: 10, color: '#9CA3AF' }}>a partir de</Text>
                <Text style={{ fontWeight: '800', color: '#0EA5E9', fontSize: 18 }}>
                  R$ {Math.min(...service.pricing.map(p => p.price)).toFixed(2).replace('.', ',')}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: '#0EA5E9', borderRadius: 18,
              paddingVertical: 18, flexDirection: 'row',
              alignItems: 'center', justifyContent: 'center', gap: 8,
              shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
            }}
            onPress={() => router.push({
              pathname: '/(client)/booking/new',
              params: { partnerId: partner.id, serviceId: selectedService },
            })}
            activeOpacity={0.85}
          >
            <Text style={{ color: 'white', fontWeight: '800', fontSize: 16, letterSpacing: 0.2 }}>
              Agendar agora
            </Text>
            <ChevronRight size={18} color="white" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}
