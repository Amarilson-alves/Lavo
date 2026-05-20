import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { CheckCircle2, Calendar, Home } from 'lucide-react-native'

export default function BookingSuccessScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white items-center justify-center px-8">
      <View className="items-center">
        <View className="w-24 h-24 bg-primary-50 rounded-full items-center justify-center mb-6">
          <CheckCircle2 size={56} color="#0EA5E9" />
        </View>

        <Text className="text-2xl font-bold text-gray-900 text-center mb-2">
          Agendamento confirmado!
        </Text>
        <Text className="text-gray-500 text-center leading-6">
          Seu agendamento foi realizado com sucesso. Você receberá uma notificação de confirmação em breve.
        </Text>

        <View className="bg-gray-50 rounded-2xl p-5 w-full mt-8 gap-3">
          <View className="flex-row justify-between">
            <Text className="text-gray-500 text-sm">Local</Text>
            <Text className="font-semibold text-gray-900 text-sm">Lava Car Premium</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-500 text-sm">Serviço</Text>
            <Text className="font-semibold text-gray-900 text-sm">Lavagem Completa</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-500 text-sm">Código</Text>
            <Text className="font-semibold text-primary-500 text-sm">#LV-2026-001</Text>
          </View>
        </View>

        <View className="w-full gap-3 mt-8">
          <TouchableOpacity
            className="bg-primary-500 rounded-2xl py-4 items-center flex-row justify-center gap-2"
            onPress={() => router.replace('/(client)/bookings')}
          >
            <Calendar size={18} color="white" />
            <Text className="text-white font-bold text-base">Ver meus agendamentos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border border-gray-200 rounded-2xl py-4 items-center flex-row justify-center gap-2"
            onPress={() => router.replace('/(client)/home')}
          >
            <Home size={18} color="#6B7280" />
            <Text className="text-gray-600 font-semibold text-base">Voltar ao início</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
