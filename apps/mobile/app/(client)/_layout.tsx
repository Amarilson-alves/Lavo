import { useEffect } from 'react'
import { Tabs, router } from 'expo-router'
import { Home, Search, CalendarCheck, User } from 'lucide-react-native'
import { View, Platform } from 'react-native'
import { useAuth } from '@/hooks/useAuth'

function TabIcon({ Icon, color, focused }: { Icon: any; color: string; focused: boolean }) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 30,
        borderRadius: 15,
        backgroundColor: focused ? '#E0F2FE' : 'transparent',
      }}
    >
      <Icon size={20} color={color} strokeWidth={focused ? 2.5 : 2} />
    </View>
  )
}

export default function ClientLayout() {
  const { session, loading } = useAuth()

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/(auth)/welcome')
    }
  }, [session, loading])

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0EA5E9',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 0,
          paddingBottom: Platform.OS === 'ios' ? 24 : 10,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 82 : 68,
          backgroundColor: '#FFFFFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.06,
          shadowRadius: 16,
          elevation: 12,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginTop: 3 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Home} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={Search} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Agendamentos',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={CalendarCheck} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => <TabIcon Icon={User} color={color} focused={focused} />,
        }}
      />
      {/* Rotas sem tab */}
      <Tabs.Screen name="vehicles" options={{ href: null }} />
      <Tabs.Screen name="partner/[id]" options={{ href: null }} />
      <Tabs.Screen name="booking/new" options={{ href: null }} />
      <Tabs.Screen name="booking/success" options={{ href: null }} />
    </Tabs>
  )
}
