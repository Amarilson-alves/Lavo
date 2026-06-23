import { createClient as _createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  ''

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  ''

// Lazy singleton — o _createClient chama URL.protocol internamente.
// Inicializar no nível do módulo crashava no Hermes (implementação parcial de URL)
// antes do polyfill do index.js ter chance de rodar.
// Com lazy init o cliente só é criado quando o primeiro componente acessa `supabase`,
// momento em que o polyfill já está instalado.
let _client: SupabaseClient | null = null

function getClient(): SupabaseClient {
  if (!_client) _client = _createClient(supabaseUrl, supabaseAnonKey)
  return _client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get: (_, prop) => Reflect.get(getClient(), prop as string),
})

export function createServerClient(serviceRoleKey: string) {
  return _createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
