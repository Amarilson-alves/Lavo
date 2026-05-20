import { Redirect } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { ActivityIndicator, View } from 'react-native'

export default function Index() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    )
  }

  if (!session) return <Redirect href="/(auth)/welcome" />
  return <Redirect href="/(client)/home" />
}
