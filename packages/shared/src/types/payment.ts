export interface AsaasPayment {
  id: string
  booking_id: string
  asaas_id: string
  amount: number
  net_amount: number
  status: 'PENDING' | 'RECEIVED' | 'CONFIRMED' | 'OVERDUE' | 'REFUNDED'
  billing_type: 'PIX' | 'CREDIT_CARD' | 'DEBIT_CARD'
  pix_qr_code: string | null
  pix_expiry: string | null
  invoice_url: string | null
  created_at: string
}

export interface PartnerBalance {
  partner_id: string
  total_earned: number
  total_withdrawn: number
  available_balance: number
  pending_balance: number
}

export interface Withdrawal {
  id: string
  partner_id: string
  amount: number
  status: 'pending' | 'processing' | 'done' | 'failed'
  asaas_transfer_id: string | null
  created_at: string
}
