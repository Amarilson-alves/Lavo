import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lavo/database'
import { useAuth } from './useAuth'
import { PLATFORM_FEE_PERCENT } from '@lavo/shared'

export type BookingWithDetails = {
  id: string
  scheduled_at: string
  status: string
  payment_status: string
  payment_method: string | null
  price: number
  rating: number | null
  review: string | null
  created_at: string
  services: { name: string; duration_minutes: number }
  vehicles: { plate: string; brand: string; model: string; color: string; type: string }
  partner_profiles: { business_name: string }
}

type CreateBookingParams = {
  partnerId: string
  serviceId: string
  vehicleId: string
  scheduledAt: string
  price: number
  paymentMethod: 'pix' | 'credit_card' | 'debit_card'
}

async function getClientProfileId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('client_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()
  return data?.id ?? null
}

export function useBookings() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['bookings', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id, scheduled_at, status, payment_status, payment_method,
          price, rating, review, created_at,
          services ( name, duration_minutes ),
          vehicles ( plate, brand, model, color, type ),
          partner_profiles ( business_name )
        `)
        .order('scheduled_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as BookingWithDetails[]
    },
    enabled: !!userId,
  })

  const create = useMutation({
    mutationFn: async (params: CreateBookingParams) => {
      const clientId = await getClientProfileId(userId!)
      if (!clientId) throw new Error('Perfil de cliente não encontrado')

      const platformFee = params.price * PLATFORM_FEE_PERCENT
      const partnerAmount = params.price - platformFee

      const { data, error } = await supabase
        .from('bookings')
        .insert({
          client_id: clientId,
          partner_id: params.partnerId,
          service_id: params.serviceId,
          vehicle_id: params.vehicleId,
          scheduled_at: params.scheduledAt,
          price: params.price,
          platform_fee: platformFee,
          partner_amount: partnerAmount,
          payment_method: params.paymentMethod,
          status: 'pending',
          payment_status: 'pending',
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings', userId] }),
  })

  const cancel = useMutation({
    mutationFn: async (bookingId: string) => {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings', userId] }),
  })

  const rate = useMutation({
    mutationFn: async (params: { bookingId: string; rating: number; review?: string }) => {
      const { error } = await supabase
        .from('bookings')
        .update({ rating: params.rating, review: params.review ?? null })
        .eq('id', params.bookingId)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['bookings', userId] }),
  })

  return {
    bookings: query.data ?? [],
    isLoading: query.isLoading,
    create,
    cancel,
    rate,
  }
}
