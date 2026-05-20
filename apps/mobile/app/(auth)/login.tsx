import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/hooks/useAuth'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha e-mail e senha.')
      return
    }
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) Alert.alert('Erro ao entrar', error.message)
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <View className="flex-1 px-8 pt-12">
          <TouchableOpacity onPress={() => router.back()} className="mb-8">
            <Text className="text-primary-500 text-base">← Voltar</Text>
          </TouchableOpacity>

          <Text className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</Text>
          <Text className="text-gray-500 mb-8">Entre na sua conta para continuar.</Text>

          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">E-mail</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900"
                placeholder="seu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Senha</Text>
              <TextInput
                className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900"
                placeholder="••••••••"
                secureTextEntry
                autoComplete="password"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text className="text-primary-500 text-sm text-right">Esqueceu a senha?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="bg-primary-500 rounded-2xl py-4 items-center mt-8"
            onPress={handleLogin}
            disabled={loading}
          >
            <Text className="text-white font-bold text-base">
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-500">Não tem conta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text className="text-primary-500 font-semibold">Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
