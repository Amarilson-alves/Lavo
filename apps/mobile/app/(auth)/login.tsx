import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, StatusBar } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native'
import { useAuth } from '@/hooks/useAuth'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
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
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0369A1' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0369A1" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Header azul */}
        <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 36 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 28,
            }}
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>

          <Text style={{ color: 'white', fontSize: 30, fontWeight: '800', letterSpacing: -0.5 }}>
            Bem-vindo de volta!
          </Text>
          <Text style={{ color: 'rgba(186,230,253,0.8)', fontSize: 15, marginTop: 6, lineHeight: 22 }}>
            Entre na sua conta para continuar.
          </Text>
        </View>

        {/* Card branco */}
        <View style={{
          flex: 1,
          backgroundColor: 'white',
          borderTopLeftRadius: 32, borderTopRightRadius: 32,
          paddingHorizontal: 24, paddingTop: 32,
        }}>
          <View style={{ gap: 20 }}>
            {/* E-mail */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                E-mail
              </Text>
              <TextInput
                style={{
                  borderWidth: 1.5, borderColor: '#E5E7EB',
                  borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
                  fontSize: 15, color: '#111827', backgroundColor: '#FAFAFA',
                }}
                placeholder="seu@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Senha */}
            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Senha
              </Text>
              <View style={{ position: 'relative' }}>
                <TextInput
                  style={{
                    borderWidth: 1.5, borderColor: '#E5E7EB',
                    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
                    paddingRight: 48, fontSize: 15, color: '#111827', backgroundColor: '#FAFAFA',
                  }}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPass}
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 14, top: 14 }}
                  onPress={() => setShowPass(v => !v)}
                >
                  {showPass
                    ? <EyeOff size={20} color="#9CA3AF" />
                    : <Eye size={20} color="#9CA3AF" />
                  }
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Login button */}
          <TouchableOpacity
            style={{
              backgroundColor: loading ? '#7DD3FC' : '#0EA5E9',
              borderRadius: 18, paddingVertical: 18,
              alignItems: 'center', marginTop: 32,
              shadowColor: '#0EA5E9',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 6,
            }}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 }}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 24 }}>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>Não tem conta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={{ color: '#0EA5E9', fontWeight: '700', fontSize: 14 }}>Criar conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
