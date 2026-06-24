import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'

function supabase() {
  return createClient()
}

export type PartnerProfile = {
  id: string
  user_id: string
  business_name: string
  cnpj: string | null
  description: string | null
  logo_url: string | null
  cover_url: string | null
  rating: number
  total_reviews: number
  is_active: boolean
  is_verified: boolean
}

export type PartnerLocation = {
  id: string
  partner_id: string
  address: string
  number: string | null
  complement: string | null
  neighborhood: string | null
  city: string
  state: string
  zip_code: string
  latitude: number
  longitude: number
  working_hours: Array<{ day: number; open: string; close: string; is_open: boolean }>
}

export type Service = {
  id: string
  partner_id: string
  name: string
  description: string | null
  category: string
  duration_minutes: number
  capacity: number
  is_active: boolean
  pricing: Array<{ vehicle_type: string; price: number }>
}

async function getCurrentUserId(): Promise<string | null> {
  const { data } = await supabase().auth.getUser()
  return data.user?.id ?? null
}

export function usePartnerProfile() {
  return useQuery({
    queryKey: ['partner-profile'],
    queryFn: async () => {
      const userId = await getCurrentUserId()
      if (!userId) return null
      const { data, error } = await supabase()
        .from('partner_profiles')
        .select('*')
        .eq('user_id', userId)
        .single()
      if (error) return null
      return data as PartnerProfile
    },
  })
}

export function usePartnerLocation(partnerId: string | undefined) {
  const qc = useQueryClient()
  const query = useQuery({
    queryKey: ['partner-location', partnerId],
    queryFn: async () => {
      const { data } = await supabase()
        .from('partner_locations')
        .select('*')
        .eq('partner_id', partnerId!)
        .maybeSingle()
      return (data ?? null) as PartnerLocation | null
    },
    enabled: !!partnerId,
  })

  const save = useMutation({
    mutationFn: async (values: Omit<PartnerLocation, 'id' | 'partner_id'>) => {
      const existing = query.data
      if (existing) {
        const { error } = await supabase()
          .from('partner_locations')
          .update(values)
          .eq('id', existing.id)
        if (error) throw error
      } else {
        const { error } = await supabase()
          .from('partner_locations')
          .insert({ ...values, partner_id: partnerId! })
        if (error) throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner-location', partnerId] }),
  })

  return { ...query, save }
}

export function usePartnerProfileUpdate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (values: Partial<Pick<PartnerProfile, 'business_name' | 'cnpj' | 'description' | 'logo_url' | 'cover_url' | 'is_active'>>) => {
      const userId = await getCurrentUserId()
      if (!userId) throw new Error('Não autenticado')
      const { error } = await supabase()
        .from('partner_profiles')
        .update(values)
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner-profile'] }),
  })
}

export function usePartnerServices(partnerId: string | undefined) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['partner-services', partnerId],
    queryFn: async () => {
      const { data, error } = await supabase()
        .from('services')
        .select('*')
        .eq('partner_id', partnerId!)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as Service[]
    },
    enabled: !!partnerId,
  })

  const create = useMutation({
    mutationFn: async (values: Omit<Service, 'id' | 'partner_id'>) => {
      const { data, error } = await supabase()
        .from('services')
        .insert({ ...values, partner_id: partnerId! })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner-services', partnerId] }),
  })

  const update = useMutation({
    mutationFn: async ({ id, ...values }: Partial<Service> & { id: string }) => {
      const { error } = await supabase()
        .from('services')
        .update(values)
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner-services', partnerId] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase().from('services').delete().eq('id', id)
      if (error) {
        if (error.code === '23503') {
          throw new Error('Este serviço tem agendamentos vinculados e não pode ser excluído. Desative-o usando o botão de toggle.')
        }
        throw error
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner-services', partnerId] }),
  })

  const toggle = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase()
        .from('services')
        .update({ is_active })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner-services', partnerId] }),
  })

  return { services: query.data ?? [], isLoading: query.isLoading, create, update, remove, toggle }
}

export function usePartnerBookings(partnerId: string | undefined) {
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['partner-bookings', partnerId],
    queryFn: async () => {
      const { data, error } = await supabase()
        .from('bookings')
        .select(`
          id, scheduled_at, status, payment_status, payment_method,
          price, platform_fee, partner_amount, rating, review, created_at,
          services ( name, duration_minutes ),
          vehicles ( plate, brand, model, color, type ),
          client_profiles ( users ( full_name, phone, avatar_url ) )
        `)
        .eq('partner_id', partnerId!)
        .order('scheduled_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: !!partnerId,
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase()
        .from('bookings')
        .update({ status })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['partner-bookings', partnerId] }),
  })

  return { bookings: query.data ?? [], isLoading: query.isLoading, updateStatus }
}

export function usePartnerStats(partnerId: string | undefined) {
  return useQuery({
    queryKey: ['partner-stats', partnerId],
    queryFn: async () => {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString()

      const [
        { data: monthBookings },
        { data: todayBookings },
        { data: profile },
      ] = await Promise.all([
        supabase()
          .from('bookings')
          .select('price, status, partner_amount')
          .eq('partner_id', partnerId!)
          .gte('scheduled_at', startOfMonth)
          .in('status', ['confirmed', 'in_progress', 'completed']),
        supabase()
          .from('bookings')
          .select('id, status, services(name), vehicles(brand, model), client_profiles(users(full_name))')
          .eq('partner_id', partnerId!)
          .gte('scheduled_at', today)
          .lt('scheduled_at', tomorrow)
          .order('scheduled_at'),
        supabase()
          .from('partner_profiles')
          .select('rating, total_reviews')
          .eq('id', partnerId!)
          .single(),
      ])

      const monthRevenue = (monthBookings ?? []).reduce((s, b) => s + Number(b.partner_amount ?? 0), 0)
      const todayCount = (todayBookings ?? []).length
      const pendingCount = (todayBookings ?? []).filter(b => b.status === 'pending').length
      const completedTotal = (monthBookings ?? []).filter(b => b.status === 'completed').length
      const total = (monthBookings ?? []).length
      const completionRate = total > 0 ? Math.round((completedTotal / total) * 100) : 0

      return {
        monthRevenue,
        todayCount,
        pendingCount,
        rating: profile?.rating ?? 0,
        totalReviews: profile?.total_reviews ?? 0,
        completionRate,
        todayBookings: todayBookings ?? [],
      }
    },
    enabled: !!partnerId,
  })
}
