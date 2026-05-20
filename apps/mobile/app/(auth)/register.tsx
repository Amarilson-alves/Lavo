import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/hooks/useAuth'

export default function RegisterScreen() {
  const { role = 'client' } = useLocalSearchParams<{ role?: string }>()
  const isPartner = role === 'partner'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()

  async function handleRegister() {
    if (!fullName || !email || !password) {
      Alert.alert('Atenção', 'Preencha nome, e-mail e senha.')
      return
    }
    if (password.length < 6) {
      Alert.alert('Atenção', 'A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (isPartner && !businessName) {
      Alert.alert('Atenção', 'Informe o nome do seu estabelecimento.')
      return
    }

    setLoading(true)
    const { error } = await signUp(email, password, fullName, {
      role,
      phone,
      business_name: isPartner ? businessName : undefined,
    })
    setLoading(false)

    if (error) {
      Alert.alert('Erro ao criar conta', error.message)
      return
    }

    Alert.alert(
      'Conta criada!',
      'Verifique seu e-mail para confirmar o cadastro.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
          <View className="flex-1 px-8 pt-8 pb-12">
            <TouchableOpacity onPress={() => router.back()} className="mb-8">
              <Text className="text-primary-500 text-base">← Voltar</Text>
            </TouchableOpacity>

            <Text className="text-3xl font-bold text-gray-900 mb-2">
              {isPartner ? 'Cadastre seu negócio' : 'Criar conta'}
            </Text>
            <Text className="text-gray-500 mb-8">
              {isPartner
                ? 'Comece a receber agendamentos hoje mesmo.'
                : 'Encontre o melhor lava car perto de você.'}
            </Text>

            {/* Tipo de conta */}
            <View className="flex-row bg-gray-100 rounded-2xl p-1 mb-6">
              <TouchableOpacity
                onPress={() => router.setParams({ role: 'client' })}
                className={`flex-1 py-2.5 rounded-xl items-center ${!isPartner ? 'bg-white shadow-sm' : ''}`}
              >
                <Text className={`font-semibold text-sm ${!isPartner ? 'text-primary-600' : 'text-gray-500'}`}>
                  Sou cliente
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.setParams({ role: 'partner' })}
                className={`flex-1 py-2.5 rounded-xl items-center ${isPartner ? 'bg-white shadow-sm' : ''}`}
              >
                <Text className={`font-semibold text-sm ${isPartner ? 'text-primary-600' : 'text-gray-500'}`}>
                  Sou parceiro
                </Text>
              </TouchableOpacity>
            </View>

            <View className="gap-4">
              {isPartner && (
                <View>
                  <Text className="text-sm font-medium text-gray-700 mb-2">Nome do estabelecimento</Text>
                  <TextInput
                    className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900"
                    placeholder="Ex: Auto Spa Premium"
                    value={businessName}
                    onChangeText={setBusinessName}
                  />
                </View>
              )}

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  {isPartner ? 'Seu nome completo' : 'Nome completo'}
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900"
                  placeholder="João Silva"
                  autoCapitalize="words"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

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
                <Text className="text-sm font-medium text-gray-700 mb-2">WhatsApp</Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900"
                  placeholder="(11) 99999-9999"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">Senha</Text>
                <TextInput
                  className="border border-gray-300 rounded-xl px-4 py-3.5 text-base text-gray-900"
                  placeholder="Mínimo 6 caracteres"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
            </View>

            <TouchableOpacity
              className="bg-primary-500 rounded-2xl py-4 items-center mt-8"
              onPress={handleRegister}
              disabled={loading}
            >
              <Text className="text-white font-bold text-base">
                {loading ? 'Criando conta...' : 'Criar conta'}
              </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center mt-6">
              <Text className="text-gray-500">Já tem conta? </Text>
              <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                <Text className="text-primary-500 font-semibold">Entrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
