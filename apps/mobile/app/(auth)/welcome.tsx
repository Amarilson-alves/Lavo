import { View, Text, Image, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function WelcomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-primary-500">
      <View className="flex-1 items-center justify-between px-8 py-12">

        <View className="items-center mt-16">
          <Text className="text-white text-6xl font-bold tracking-tight">Lavô</Text>
          <Text className="text-primary-100 text-lg mt-3 text-center">
            Seu carro limpo, onde você estiver.
          </Text>
        </View>

        <View className="w-full gap-4">
          <TouchableOpacity
            className="bg-white rounded-2xl py-4 items-center"
            onPress={() => router.push('/(auth)/login')}
          >
            <Text className="text-primary-600 font-bold text-base">Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="border-2 border-white rounded-2xl py-4 items-center"
            onPress={() => router.push('/(auth)/register')}
          >
            <Text className="text-white font-bold text-base">Criar conta grátis</Text>
          </TouchableOpacity>

          <Text className="text-primary-200 text-xs text-center mt-2">
            É um lava car?{' '}
            <Text
              className="text-white underline"
              onPress={() => router.push('/(auth)/register?role=partner')}
            >
              Cadastre seu negócio
            </Text>
          </Text>
        </View>

      </View>
    </SafeAreaView>
  )
}
