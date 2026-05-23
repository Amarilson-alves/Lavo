import { View, Text, TouchableOpacity, StatusBar } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CheckCircle2, Calendar, Home } from 'lucide-react-native'

export default function BookingSuccessScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFD' }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFD" />

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>

        {/* Ícone de sucesso */}
        <View style={{
          width: 100, height: 100, borderRadius: 50,
          backgroundColor: '#F0FDF4',
          alignItems: 'center', justifyContent: 'center',
          marginBottom: 28,
          shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.2, shadowRadius: 20, elevation: 8,
        }}>
          <CheckCircle2 size={56} color="#10B981" />
        </View>

        <Text style={{ fontSize: 26, fontWeight: '800', color: '#111827', textAlign: 'center', marginBottom: 10, letterSpacing: -0.3 }}>
          Agendamento{'\n'}confirmado!
        </Text>
        <Text style={{ color: '#6B7280', textAlign: 'center', lineHeight: 22, fontSize: 14 }}>
          Seu agendamento foi realizado com sucesso. Você receberá uma notificação de confirmação em breve.
        </Text>

        {/* Card resumo */}
        <View style={{
          backgroundColor: 'white', borderRadius: 24, padding: 20, width: '100%', marginTop: 32,
          shadowColor: '#1C1C1E', shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Parceiro</Text>
            <Text style={{ fontWeight: '700', color: '#111827', fontSize: 13 }}>Lava Car Premium</Text>
          </View>
          <View style={{ height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Serviço</Text>
            <Text style={{ fontWeight: '700', color: '#111827', fontSize: 13 }}>Lavagem Completa</Text>
          </View>
          <View style={{ height: 1, backgroundColor: '#F3F4F6', marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#9CA3AF', fontSize: 13 }}>Código</Text>
            <Text style={{ fontWeight: '700', color: '#0EA5E9', fontSize: 13 }}>#LV-2026-001</Text>
          </View>
        </View>

        {/* Botões */}
        <View style={{ width: '100%', gap: 12, marginTop: 28 }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#0EA5E9', borderRadius: 20, paddingVertical: 16,
              alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
              shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.25, shadowRadius: 12, elevation: 5,
            }}
            onPress={() => router.replace('/(client)/bookings')}
          >
            <Calendar size={18} color="white" />
            <Text style={{ color: 'white', fontWeight: '700', fontSize: 15 }}>Ver meus agendamentos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: 'white', borderRadius: 20, paddingVertical: 16,
              alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 8,
              borderWidth: 1.5, borderColor: '#E5E7EB',
            }}
            onPress={() => router.replace('/(client)/home')}
          >
            <Home size={18} color="#6B7280" />
            <Text style={{ color: '#374151', fontWeight: '600', fontSize: 15 }}>Voltar ao início</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
