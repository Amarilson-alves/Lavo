import { View, Text, TouchableOpacity, StatusBar } from 'react-native'
import { router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Droplets } from 'lucide-react-native'

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0C4A6E' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0C4A6E" />

      {/* Círculos decorativos de fundo */}
      <View style={{
        position: 'absolute', top: -100, right: -80,
        width: 320, height: 320, borderRadius: 160,
        backgroundColor: 'rgba(255,255,255,0.05)',
      }} />
      <View style={{
        position: 'absolute', top: 160, left: -90,
        width: 220, height: 220, borderRadius: 110,
        backgroundColor: 'rgba(255,255,255,0.04)',
      }} />
      <View style={{
        position: 'absolute', bottom: 180, right: -50,
        width: 160, height: 160, borderRadius: 80,
        backgroundColor: 'rgba(14,165,233,0.15)',
      }} />

      <View style={{ flex: 1, paddingHorizontal: 28, justifyContent: 'space-between', paddingTop: 48, paddingBottom: 40 }}>

        {/* Hero */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {/* Logo animada */}
          <View style={{
            width: 140, height: 140, borderRadius: 70,
            backgroundColor: 'rgba(255,255,255,0.12)',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 36,
            shadowColor: '#0EA5E9',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.3,
            shadowRadius: 24,
          }}>
            <View style={{
              width: 108, height: 108, borderRadius: 54,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Droplets size={52} color="#7DD3FC" strokeWidth={1.5} />
            </View>
          </View>

          <Text style={{
            color: 'white', fontSize: 56, fontWeight: '800',
            letterSpacing: -2, lineHeight: 60,
          }}>
            Lavô
          </Text>

          <Text style={{
            color: 'rgba(186, 230, 253, 0.85)',
            fontSize: 17, marginTop: 12,
            textAlign: 'center', lineHeight: 26,
            fontWeight: '400',
          }}>
            Seu carro brilhando,{'\n'}quando e onde você quiser.
          </Text>

          {/* Indicadores de benefício */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 40 }}>
            {['Agendamento fácil', 'Pagamento seguro', 'Avaliado'].map(item => (
              <View key={item} style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                paddingHorizontal: 12, paddingVertical: 6,
                borderRadius: 20, borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.15)',
              }}>
                <Text style={{ color: 'rgba(186,230,253,0.9)', fontSize: 11, fontWeight: '500' }}>
                  {item}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Botões */}
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: 'white',
              borderRadius: 20, paddingVertical: 18,
              alignItems: 'center',
              shadowColor: '#0EA5E9',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 8,
            }}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={{ color: '#0369A1', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 }}>
              Entrar na conta
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 20, paddingVertical: 18,
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: 'rgba(255,255,255,0.25)',
            }}
            onPress={() => router.push('/(auth)/register')}
            activeOpacity={0.85}
          >
            <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 }}>
              Criar conta grátis
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ paddingVertical: 14, alignItems: 'center' }}
            onPress={() => router.push('/(auth)/register?role=partner')}
          >
            <Text style={{ color: 'rgba(186,230,253,0.75)', fontSize: 13 }}>
              É um lava car?{' '}
              <Text style={{ color: '#7DD3FC', fontWeight: '600', textDecorationLine: 'underline' }}>
                Cadastre seu negócio
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}
