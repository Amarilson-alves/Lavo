import { useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '@lavo/database'

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signUp(email: string, password: string, fullName: string, extra?: Record<string, unknown>) {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, ...extra } },
    })
  }

  async function signOut() {
    return supabase.auth.signOut()
  }

  return { session, loading, signIn, signUp, signOut }
}
