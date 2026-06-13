import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lavo/database'
import { useAuth } from './useAuth'

export type Vehicle = {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  color: string
  type: 'hatch' | 'sedan' | 'suv' | 'pickup' | 'van' | 'motorcycle'
}

type NewVehicle = Omit<Vehicle, 'id'>

async function getClientProfileId(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('client_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()
  return data?.id ?? null
}

export function useVehicles() {
  const { session } = useAuth()
  const userId = session?.user?.id
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['vehicles', userId],
    queryFn: async () => {
      const clientId = await getClientProfileId(userId!)
      if (!clientId) return []
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, plate, brand, model, year, color, type')
        .eq('client_id', clientId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as Vehicle[]
    },
    enabled: !!userId,
  })

  const add = useMutation({
    mutationFn: async (vehicle: NewVehicle) => {
      const clientId = await getClientProfileId(userId!)
      if (!clientId) throw new Error('Perfil de cliente não encontrado')
      const { data, error } = await supabase
        .from('vehicles')
        .insert({ ...vehicle, client_id: clientId })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles', userId] }),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicles').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['vehicles', userId] }),
  })

  return {
    vehicles: query.data ?? [],
    isLoading: query.isLoading,
    add,
    remove,
  }
}
