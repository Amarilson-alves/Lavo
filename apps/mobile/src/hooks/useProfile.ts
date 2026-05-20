import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lavo/database'
import { useAuth } from './useAuth'

export function useProfile() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId!)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })

  const update = useMutation({
    mutationFn: async (values: { full_name?: string; phone?: string; avatar_url?: string }) => {
      const { data, error } = await supabase
        .from('users')
        .update(values)
        .eq('id', userId!)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile', userId] }),
  })

  const stats = useQuery({
    queryKey: ['profile-stats', userId],
    queryFn: async () => {
      const { data: clientProfile } = await supabase
        .from('client_profiles')
        .select('id')
        .eq('user_id', userId!)
        .single()

      if (!clientProfile) return { totalBookings: 0, avgRating: 0, memberSince: '' }

      const { data: bookings } = await supabase
        .from('bookings')
        .select('rating, created_at')
        .eq('client_id', clientProfile.id)
        .eq('status', 'completed')

      const total = bookings?.length ?? 0
      const ratings = (bookings ?? []).filter(b => b.rating).map(b => b.rating as number)
      const avg = ratings.length > 0
        ? (ratings.reduce((s, r) => s + r, 0) / ratings.length).toFixed(1)
        : '0'
      const firstDate = (bookings ?? [])[0]?.created_at
      const year = firstDate ? new Date(firstDate).getFullYear().toString() : new Date().getFullYear().toString()

      return { totalBookings: total, avgRating: avg, memberSince: year }
    },
    enabled: !!userId,
  })

  return { profile: query.data, isLoading: query.isLoading, update, stats: stats.data }
}
