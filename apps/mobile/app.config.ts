import type { ConfigContext, ExpoConfig } from 'expo/config'

const variant = (process.env.APP_VARIANT ?? 'production') as 'development' | 'preview' | 'production'

const APP_ID: Record<typeof variant, string> = {
  development: 'com.lavo.app.dev',
  preview: 'com.lavo.app.preview',
  production: 'com.lavo.app',
}

const APP_NAME: Record<typeof variant, string> = {
  development: 'Lavô Dev',
  preview: 'Lavô Preview',
  production: 'Lavô',
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_NAME[variant],
  android: {
    ...config.android,
    package: APP_ID[variant],
  },
  ios: {
    ...config.ios,
    bundleIdentifier: APP_ID[variant],
  },
})
