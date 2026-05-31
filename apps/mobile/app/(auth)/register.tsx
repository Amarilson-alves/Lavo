import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ArrowLeft } from 'lucide-react-native'
import { useAuth } from '@/hooks/useAuth'

const field = {
  borderWidth: 1.5, borderColor: '#E5E7EB',
  borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14,
  fontSize: 15, color: '#111827', backgroundColor: '#FAFAFA',
} as const

export default function RegisterScreen() {
  const { role = 'client' } = useLocalSearchParams<{ role?: string }>()
  const isPartner = role === 'partner'

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { signUp } = useAuth()

  async function handleRegister() {
    setErrorMsg('')
    if (!fullName || !email || !password) {
      setErrorMsg('Preencha nome, e-mail e senha.')
      return
    }
    if (password.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (isPartner && !businessName) {
      setErrorMsg('Informe o nome do seu estabelecimento.')
      return
    }
    setLoading(true)
    const { error } = await signUp(email.trim(), password, fullName.trim(), {
      role,
      phone,
      business_name: isPartner ? businessName.trim() : undefined,
    })
    setLoading(false)
    if (error) {
      setErrorMsg(
        error.message.includes('already registered')
          ? 'Este e-mail já está cadastrado.'
          : error.message
      )
      return
    }
    router.replace('/(client)/home')
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0369A1' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0369A1" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>

        {/* Header */}
        <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 28 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center', marginBottom: 24,
            }}
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>

          <Text style={{ color: 'white', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>
            {isPartner ? 'Cadastre seu negócio' : 'Criar conta'}
          </Text>
          <Text style={{ color: 'rgba(186,230,253,0.8)', fontSize: 14, marginTop: 6 }}>
            {isPartner
              ? 'Comece a receber agendamentos hoje mesmo.'
              : 'Encontre o melhor lava car perto de você.'}
          </Text>
        </View>

        {/* Card branco */}
        <ScrollView
          style={{ flex: 1, backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32 }}
          contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Tipo de conta */}
          <View style={{
            flexDirection: 'row', backgroundColor: '#F3F4F6',
            borderRadius: 16, padding: 4, marginBottom: 24,
          }}>
            {[
              { key: 'client', label: 'Sou cliente' },
              { key: 'partner', label: 'Sou parceiro' },
            ].map(opt => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => router.setParams({ role: opt.key })}
                style={{
                  flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center',
                  backgroundColor: role === opt.key ? 'white' : 'transparent',
                  shadowColor: role === opt.key ? '#000' : 'transparent',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: role === opt.key ? 2 : 0,
                }}
              >
                <Text style={{
                  fontSize: 13, fontWeight: '600',
                  color: role === opt.key ? '#0369A1' : '#9CA3AF',
                }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ gap: 16 }}>
            {isPartner && (
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Nome do estabelecimento
                </Text>
                <TextInput style={field} placeholder="Ex: Auto Spa Premium" placeholderTextColor="#9CA3AF"
                  value={businessName} onChangeText={setBusinessName} />
              </View>
            )}

            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                {isPartner ? 'Seu nome completo' : 'Nome completo'}
              </Text>
              <TextInput style={field} placeholder="João Silva" placeholderTextColor="#9CA3AF"
                autoCapitalize="words" value={fullName} onChangeText={setFullName} />
            </View>

            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>E-mail</Text>
              <TextInput style={field} placeholder="seu@email.com" placeholderTextColor="#9CA3AF"
                keyboardType="email-address" autoCapitalize="none" autoComplete="email"
                value={email} onChangeText={setEmail} />
            </View>

            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>WhatsApp</Text>
              <TextInput style={field} placeholder="(11) 99999-9999" placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
            </View>

            <View>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                Senha <Text style={{ color: '#9CA3AF', fontWeight: '400' }}>(mín. 6 caracteres)</Text>
              </Text>
              <TextInput style={field} placeholder="••••••••" placeholderTextColor="#9CA3AF"
                secureTextEntry value={password} onChangeText={setPassword} />
            </View>
          </View>

          {errorMsg ? (
            <View style={{
              backgroundColor: '#FEF2F2', borderRadius: 12,
              padding: 14, marginTop: 16, borderWidth: 1, borderColor: '#FECACA',
            }}>
              <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '500', textAlign: 'center' }}>
                {errorMsg}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={{
              backgroundColor: loading ? '#7DD3FC' : '#0EA5E9',
              borderRadius: 18, paddingVertical: 18,
              alignItems: 'center', marginTop: 28,
              shadowColor: '#0EA5E9', shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.3, shadowRadius: 16, elevation: 6,
            }}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700' }}>
              {loading ? 'Criando conta...' : 'Criar conta'}
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 20 }}>
            <Text style={{ color: '#6B7280', fontSize: 14 }}>Já tem conta? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={{ color: '#0EA5E9', fontWeight: '700', fontSize: 14 }}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
