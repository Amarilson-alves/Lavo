export type VehicleType = 'hatch' | 'sedan' | 'suv' | 'pickup' | 'van' | 'motorcycle'

export type ServiceCategory = 'lavagem' | 'polimento' | 'higienizacao' | 'ceramica' | 'outros'

export interface ServicePricing {
  vehicle_type: VehicleType
  price: number
}

export interface Service {
  id: string
  partner_id: string
  name: string
  description: string | null
  category: ServiceCategory
  duration_minutes: number
  is_active: boolean
  pricing: ServicePricing[]
  created_at: string
  updated_at: string
}

export interface WorkingHours {
  day: 0 | 1 | 2 | 3 | 4 | 5 | 6  // 0 = domingo
  open: string    // "08:00"
  close: string   // "18:00"
  is_open: boolean
}

export interface PartnerLocation {
  id: string
  partner_id: string
  address: string
  city: string
  state: string
  zip_code: string
  latitude: number
  longitude: number
  working_hours: WorkingHours[]
}
