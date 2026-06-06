import { useEffect, Component, ReactNode } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { View, Text, ScrollView } from 'react-native'
import '../global.css'

SplashScreen.preventAutoHideAsync()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5 },
  },
})

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  render() {
    if (this.state.error) {
      const err = this.state.error as Error
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 60 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#dc2626', marginBottom: 12 }}>
            Erro ao iniciar o app
          </Text>
          <Text style={{ fontSize: 13, color: '#374151', marginBottom: 8 }}>
            {err.message}
          </Text>
          <Text style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>
            {err.stack}
          </Text>
        </ScrollView>
      )
    }
    return this.props.children
  }
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync()
  }, [])

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(client)" />
            <Stack.Screen name="+not-found" />
          </Stack>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  )
}
