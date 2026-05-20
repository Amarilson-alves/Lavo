import type { VehicleType } from './service'

export type BookingStatus =
  | 'pending'       // aguardando confirmação do parceiro
  | 'confirmed'     // parceiro confirmou
  | 'in_progress'   // serviço em andamento
  | 'completed'     // serviço finalizado
  | 'cancelled'     // cancelado
  | 'no_show'       // cliente não apareceu

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'failed'

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card'

export interface Vehicle {
  id: string
  client_id: string
  plate: string
  brand: string
  model: string
  year: number
  color: string
  type: VehicleType
}

export interface Booking {
  id: string
  client_id: string
  partner_id: string
  service_id: string
  vehicle_id: string
  scheduled_at: string
  status: BookingStatus
  payment_status: PaymentStatus
  payment_method: PaymentMethod | null
  price: number
  platform_fee: number
  partner_amount: number
  notes: string | null
  asaas_payment_id: string | null
  rating: number | null
  review: string | null
  created_at: string
  updated_at: string
}

export interface BookingWithDetails extends Booking {
  service: { name: string; duration_minutes: number }
  vehicle: { plate: string; brand: string; model: string; color: string }
  client: { full_name: string; avatar_url: string | null; phone: string | null }
  partner: { business_name: string; address: string }
}
