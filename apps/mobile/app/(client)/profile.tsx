import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, StatusBar, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import {
  User, Car, Bell, Shield, HelpCircle, LogOut,
  ChevronRight, Star, Calendar, Settings, Sparkles,
} from 'lucide-react-native'

const CARD_SHADOW = {
  shadowColor: '#1C1C1E', shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
}

export default function ProfileScreen() {
  const { session, signOut } = useAuth()
  const { profile, isLoading, stats } = useProfile()

  const userName = profile?.full_name ?? session?.user?.user_metadata?.full_name ?? 'Usuário'
  const userEmail = profile?.email ?? session?.user?.email ?? ''
  const firstName = userName.split(' ')[0]
  const initial = firstName.charAt(0).toUpperCase()

  async function handleSignOut() {
    const doSignOut = async () => {
      await signOut()
      router.replace('/(auth)/welcome')
    }

    if (Platform.OS === 'web') {
      if (window.confirm('Deseja mesmo sair da conta?')) await doSignOut()
    } else {
      Alert.alert('Sair da conta', 'Deseja mesmo sair?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: doSignOut },
      ])
    }
  }

  const MENU_SECTIONS = [
    {
      title: 'Minha conta',
      items: [
        { icon: User, label: 'Dados pessoais', desc: 'Nome, e-mail, telefone', color: '#0EA5E9', bg: '#EFF6FF', onPress: () => {} },
        { icon: Car, label: 'Meus veículos', desc: 'Gerenciar veículos cadastrados', color: '#8B5CF6', bg: '#F5F3FF', onPress: () => router.push('/(client)/vehicles') },
        { icon: Bell, label: 'Notificações', desc: 'Alertas e lembretes', color: '#F59E0B', bg: '#FFFBEB', onPress: () => {} },
      ],
    },
    {
      title: 'Suporte',
      items: [
        { icon: HelpCircle, label: 'Central de ajuda', desc: 'Dúvidas e tutoriais', color: '#10B981', bg: '#F0FDF4', onPress: () => {} },
        { icon: Shield, label: 'Privacidade', desc: 'Termos e política de dados', color: '#6B7280', bg: '#F3F4F6', onPress: () => {} },
        { icon: Settings, label: 'Configurações', desc: 'Preferências do app', color: '#6B7280', bg: '#F3F4F6', onPress: () => {} },
      ],
    },
  ]

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFD' }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#0369A1" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header com fundo azul */}
        <View style={{
          backgroundColor: '#0369A1',
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 56,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: 'white', letterSpacing: -0.3, marginBottom: 24 }}>
            Perfil
          </Text>

          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              {/* Avatar */}
              <View style={{
                width: 64, height: 64, borderRadius: 32,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center', justifyContent: 'center',
                borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.4)',
              }}>
                <Text style={{ color: 'white', fontSize: 26, fontWeight: '800' }}>{initial}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '700' }}>{userName}</Text>
                <Text style={{ color: 'rgba(186,230,253,0.8)', fontSize: 13, marginTop: 2 }}>{userEmail}</Text>
                {profile?.phone && (
                  <Text style={{ color: 'rgba(186,230,253,0.6)', fontSize: 12, marginTop: 1 }}>
                    {profile.phone}
                  </Text>
                )}
              </View>
              <TouchableOpacity style={{
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Settings size={16} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Stats flutuantes */}
        <View style={{ paddingHorizontal: 20, marginTop: -32 }}>
          <View style={{
            backgroundColor: 'white', borderRadius: 20,
            padding: 20, flexDirection: 'row', justifyContent: 'space-around',
            ...CARD_SHADOW,
          }}>
            {[
              { icon: Calendar, value: stats?.totalBookings ?? '–', label: 'Lavagens', color: '#0EA5E9', bg: '#EFF6FF' },
              { icon: Star, value: stats?.avgRating !== '0' ? stats?.avgRating : '–', label: 'Avaliação', color: '#F59E0B', bg: '#FFFBEB' },
              { icon: Sparkles, value: stats?.memberSince ?? '–', label: 'Membro desde', color: '#8B5CF6', bg: '#F5F3FF' },
            ].map((stat, i) => {
              const Icon = stat.icon
              return (
                <View key={i} style={{ alignItems: 'center', flex: 1 }}>
                  {i > 0 && (
                    <View style={{
                      position: 'absolute', left: 0, top: '10%', bottom: '10%',
                      width: 1, backgroundColor: '#F3F4F6',
                    }} />
                  )}
                  <View style={{
                    width: 36, height: 36, borderRadius: 12,
                    backgroundColor: stat.bg, alignItems: 'center', justifyContent: 'center',
                    marginBottom: 8,
                  }}>
                    <Icon size={16} color={stat.color} />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: '#111827' }}>{stat.value}</Text>
                  <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{stat.label}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Acesso rápido */}
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1, backgroundColor: '#0EA5E9', borderRadius: 20,
                paddingVertical: 18, alignItems: 'center', gap: 8,
                shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25, shadowRadius: 12, elevation: 5,
              }}
              onPress={() => router.push('/(client)/bookings')}
            >
              <Calendar size={22} color="white" />
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 12 }}>Agendamentos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1, backgroundColor: '#FFFBEB', borderRadius: 20,
                paddingVertical: 18, alignItems: 'center', gap: 8,
                borderWidth: 1.5, borderColor: '#FDE68A',
              }}
            >
              <Star size={22} color="#F59E0B" />
              <Text style={{ color: '#B45309', fontWeight: '700', fontSize: 12 }}>Avaliações</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1, backgroundColor: '#F5F3FF', borderRadius: 20,
                paddingVertical: 18, alignItems: 'center', gap: 8,
                borderWidth: 1.5, borderColor: '#DDD6FE',
              }}
              onPress={() => router.push('/(client)/vehicles')}
            >
              <Car size={22} color="#8B5CF6" />
              <Text style={{ color: '#6D28D9', fontWeight: '700', fontSize: 12 }}>Veículos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu */}
        {MENU_SECTIONS.map(section => (
          <View key={section.title} style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#9CA3AF', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 }}>
              {section.title}
            </Text>
            <View style={{ backgroundColor: 'white', borderRadius: 20, overflow: 'hidden', ...CARD_SHADOW }}>
              {section.items.map((item, i) => {
                const Icon = item.icon
                return (
                  <TouchableOpacity
                    key={item.label}
                    onPress={item.onPress}
                    style={{
                      flexDirection: 'row', alignItems: 'center', gap: 14,
                      paddingHorizontal: 16, paddingVertical: 16,
                      borderTopWidth: i > 0 ? 1 : 0, borderTopColor: '#F9FAFB',
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={{
                      width: 40, height: 40, borderRadius: 12,
                      backgroundColor: item.bg,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={18} color={item.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: '600', color: '#111827', fontSize: 14 }}>{item.label}</Text>
                      <Text style={{ color: '#9CA3AF', fontSize: 12, marginTop: 2 }}>{item.desc}</Text>
                    </View>
                    <ChevronRight size={16} color="#D1D5DB" />
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        ))}

        {/* Sair */}
        <View style={{ paddingHorizontal: 20, marginTop: 24, marginBottom: 40 }}>
          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              gap: 8, backgroundColor: '#FEF2F2', borderRadius: 20, paddingVertical: 16,
              borderWidth: 1.5, borderColor: '#FECACA',
            }}
          >
            <LogOut size={18} color="#EF4444" />
            <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 15 }}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
