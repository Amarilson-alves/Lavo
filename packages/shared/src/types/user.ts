export type UserRole = 'client' | 'partner' | 'admin'

export interface User {
  id: string
  email: string
  phone: string | null
  full_name: string
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface ClientProfile {
  id: string
  user_id: string
  cpf: string | null
  default_address_id: string | null
  created_at: string
}

export interface PartnerProfile {
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
  asaas_account_id: string | null
  created_at: string
  updated_at: string
}
