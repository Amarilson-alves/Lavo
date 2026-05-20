import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import {
  User, Car, Bell, Shield, HelpCircle, LogOut,
  ChevronRight, Star, Calendar, Settings,
} from 'lucide-react-native'

export default function ProfileScreen() {
  const { session, signOut } = useAuth()
  const { profile, isLoading, stats } = useProfile()

  const userName = profile?.full_name ?? session?.user?.user_metadata?.full_name ?? 'Usuário'
  const userEmail = profile?.email ?? session?.user?.email ?? ''
  const initial = userName.charAt(0).toUpperCase()

  async function handleSignOut() {
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair', style: 'destructive',
        onPress: async () => {
          await signOut()
          router.replace('/(auth)/welcome')
        },
      },
    ])
  }

  const MENU_SECTIONS = [
    {
      title: 'Conta',
      items: [
        { icon: User, label: 'Dados pessoais', desc: 'Nome, e-mail, telefone', onPress: () => {} },
        { icon: Car, label: 'Meus veículos', desc: profile ? `${stats?.totalBookings ?? 0} uso(s) registrado(s)` : 'Carrregando...', onPress: () => router.push('/(client)/vehicles') },
        { icon: Bell, label: 'Notificações', desc: 'Alertas e lembretes', onPress: () => {} },
      ],
    },
    {
      title: 'Suporte',
      items: [
        { icon: HelpCircle, label: 'Central de ajuda', desc: 'Dúvidas e tutoriais', onPress: () => {} },
        { icon: Shield, label: 'Privacidade', desc: 'Termos e política de dados', onPress: () => {} },
        { icon: Settings, label: 'Configurações', desc: 'Preferências do app', onPress: () => {} },
      ],
    },
  ]

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="bg-white px-5 pt-6 pb-6">
          <Text className="text-xl font-bold text-gray-900 mb-5">Perfil</Text>

          {isLoading ? (
            <ActivityIndicator color="#0EA5E9" />
          ) : (
            <View className="flex-row items-center gap-4">
              <View className="w-16 h-16 bg-primary-500 rounded-full items-center justify-center">
                <Text className="text-white font-bold text-2xl">{initial}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-lg">{userName}</Text>
                <Text className="text-gray-500 text-sm">{userEmail}</Text>
                {profile?.phone && (
                  <Text className="text-gray-400 text-xs mt-0.5">{profile.phone}</Text>
                )}
              </View>
              <TouchableOpacity className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center">
                <Settings size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>
          )}

          {/* Stats reais */}
          <View className="flex-row bg-gray-50 rounded-2xl p-4 mt-5 justify-around">
            <View className="items-center">
              <Text className="font-bold text-gray-900 text-lg">{stats?.totalBookings ?? '–'}</Text>
              <Text className="text-gray-400 text-xs mt-0.5">Lavagens</Text>
            </View>
            <View className="items-center border-l border-gray-200 pl-6">
              <Text className="font-bold text-gray-900 text-lg">
                {stats?.avgRating !== '0' ? stats?.avgRating : '–'}
              </Text>
              <Text className="text-gray-400 text-xs mt-0.5">Avaliação média</Text>
            </View>
            <View className="items-center border-l border-gray-200 pl-6">
              <Text className="font-bold text-gray-900 text-lg">{stats?.memberSince ?? '–'}</Text>
              <Text className="text-gray-400 text-xs mt-0.5">Desde</Text>
            </View>
          </View>
        </View>

        {/* Acesso rápido */}
        <View className="px-5 mt-4">
          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 bg-primary-500 rounded-2xl p-4 items-center gap-1.5"
              onPress={() => router.push('/(client)/bookings')}
            >
              <Calendar size={22} color="white" />
              <Text className="text-white font-semibold text-sm">Agendamentos</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-1 bg-amber-50 rounded-2xl p-4 items-center gap-1.5">
              <Star size={22} color="#F59E0B" />
              <Text className="text-amber-700 font-semibold text-sm">Avaliações</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 bg-gray-100 rounded-2xl p-4 items-center gap-1.5"
              onPress={() => router.push('/(client)/vehicles')}
            >
              <Car size={22} color="#6B7280" />
              <Text className="text-gray-600 font-semibold text-sm">Veículos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu */}
        {MENU_SECTIONS.map(section => (
          <View key={section.title} className="mt-5 px-5">
            <Text className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {section.title}
            </Text>
            <View className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {section.items.map((item, i) => {
                const Icon = item.icon
                return (
                  <TouchableOpacity
                    key={item.label}
                    onPress={item.onPress}
                    className={`flex-row items-center gap-3 px-4 py-4 ${i > 0 ? 'border-t border-gray-50' : ''}`}
                    activeOpacity={0.7}
                  >
                    <View className="w-9 h-9 bg-gray-100 rounded-xl items-center justify-center">
                      <Icon size={17} color="#6B7280" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-medium text-gray-900 text-sm">{item.label}</Text>
                      <Text className="text-gray-400 text-xs mt-0.5">{item.desc}</Text>
                    </View>
                    <ChevronRight size={16} color="#D1D5DB" />
                  </TouchableOpacity>
                )
              })}
            </View>
          </View>
        ))}

        {/* Sair */}
        <View className="px-5 mt-5 mb-8">
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-red-50 rounded-2xl py-4 flex-row items-center justify-center gap-2"
          >
            <LogOut size={18} color="#EF4444" />
            <Text className="text-red-500 font-semibold">Sair da conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
