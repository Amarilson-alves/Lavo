import { useEffect, useRef } from 'react'
import * as Notifications from 'expo-notifications'
import { router } from 'expo-router'
import { Platform } from 'react-native'
import { supabase } from '@lavo/database'
import { useAuth } from './useAuth'

const EXPO_PROJECT_ID = '9b434177-ac29-4624-a4cb-61be271c4b7f'

// Controla como notificações aparecem quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

async function registerPushToken(userId: string) {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Lavô',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0EA5E9',
    })
  }

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }
  if (finalStatus !== 'granted') return

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId: EXPO_PROJECT_ID })

  await supabase
    .from('users')
    .update({ push_token: tokenData.data })
    .eq('id', userId)
}

export function useNotifications() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const notifListener = useRef<Notifications.Subscription | null>(null)
  const responseListener = useRef<Notifications.Subscription | null>(null)

  useEffect(() => {
    if (!userId) return

    registerPushToken(userId)

    // Notificação chega com app aberto (foreground)
    notifListener.current = Notifications.addNotificationReceivedListener(() => {
      // Handler acima já exibe automaticamente
    })

    // Usuário toca na notificação
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as { screen?: string }
      if (data?.screen === 'bookings' || !data?.screen) {
        router.push('/(client)/bookings')
      }
    })

    return () => {
      if (notifListener.current) Notifications.removeNotificationSubscription(notifListener.current)
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current)
    }
  }, [userId])
}
