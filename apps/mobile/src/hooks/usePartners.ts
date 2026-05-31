import { useQuery } from '@tanstack/react-query'
import { supabase } from '@lavo/database'

export type NearbyPartner = {
  partner_id: string
  business_name: string
  rating: number
  total_reviews: number
  address: string
  city: string
  state: string
  latitude: number
  longitude: number
  distance_km: number
  services: Array<{
    id: string
    name: string
    category: string
    pricing: Array<{ vehicle_type: string; price: number }>
  }>
}

export function useNearbyPartners(
  coords: { latitude: number; longitude: number } | null,
  radiusKm: number,
  category?: string,
) {
  return useQuery({
    queryKey: ['nearby-partners', coords?.latitude, coords?.longitude, radiusKm, category],
    enabled: !!coords,
    queryFn: async () => {
      const { data, error } = await supabase.rpc('search_nearby_partners', {
        user_lat: coords!.latitude,
        user_lng: coords!.longitude,
        radius_km: radiusKm,
        category: category || null,
      })
      if (error) throw error
      return (data ?? []) as NearbyPartner[]
    },
  })
}

export function getNearbyMinPrice(services: NearbyPartner['services']): number | null {
  if (!services.length) return null
  const prices = services.flatMap(s => s.pricing.map(p => p.price))
  return prices.length > 0 ? Math.min(...prices) : null
}

export type PartnerWithDetails = {
  id: string
  business_name: string
  description: string | null
  logo_url: string | null
  cover_url: string | null
  rating: number
  total_reviews: number
  is_active: boolean
  partner_locations: {
    address: string
    number?: string
    city: string
    state: string
    latitude: number
    longitude: number
    working_hours: Array<{ day: number; open: string; close: string; is_open: boolean }>
  }[]
  services: {
    id: string
    name: string
    description: string | null
    category: string
    duration_minutes: number
    pricing: Array<{ vehicle_type: string; price: number }>
    is_active: boolean
  }[]
}

export function usePartners(search?: string, category?: string) {
  return useQuery({
    queryKey: ['partners', search, category],
    queryFn: async () => {
      let query = supabase
        .from('partner_profiles')
        .select(`
          id, business_name, description, logo_url, cover_url,
          rating, total_reviews, is_active,
          partner_locations ( address, city, state, latitude, longitude, working_hours ),
          services ( id, name, description, category, duration_minutes, pricing, is_active )
        `)
        .eq('is_active', true)
        .order('rating', { ascending: false })

      if (search) {
        query = query.ilike('business_name', `%${search}%`)
      }

      const { data, error } = await query
      if (error) throw error

      let partners = (data ?? []) as PartnerWithDetails[]

      if (category) {
        partners = partners.filter(p =>
          p.services.some(s => s.category === category && s.is_active)
        )
      }

      return partners
    },
  })
}

export function usePartner(id: string) {
  return useQuery({
    queryKey: ['partner', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partner_profiles')
        .select(`
          id, business_name, description, logo_url, cover_url,
          rating, total_reviews, is_active,
          partner_locations ( address, city, state, latitude, longitude, working_hours ),
          services ( id, name, description, category, duration_minutes, pricing, is_active )
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data as PartnerWithDetails
    },
    enabled: !!id,
  })
}

export function isOpenNow(
  workingHours: Array<{ day: number; open: string; close: string; is_open: boolean }>
): boolean {
  if (!workingHours?.length) return false
  const now = new Date()
  const day = now.getDay()
  const hh = now.getHours().toString().padStart(2, '0')
  const mm = now.getMinutes().toString().padStart(2, '0')
  const currentTime = `${hh}:${mm}`
  const todayHours = workingHours.find(h => h.day === day)
  if (!todayHours?.is_open) return false
  return currentTime >= todayHours.open && currentTime <= todayHours.close
}

export function getMinPrice(
  services: PartnerWithDetails['services']
): number | null {
  const active = services.filter(s => s.is_active)
  if (!active.length) return null
  const prices = active.flatMap(s => s.pricing.map(p => p.price))
  return prices.length > 0 ? Math.min(...prices) : null
}
