export const PLATFORM_FEE_PERCENT = 0.15  // 15% para a plataforma

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  hatch: 'Hatch',
  sedan: 'Sedan',
  suv: 'SUV',
  pickup: 'Pickup',
  van: 'Van/Furgão',
  motorcycle: 'Moto',
}

export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  lavagem: 'Lavagem',
  polimento: 'Polimento',
  higienizacao: 'Higienização',
  ceramica: 'Cerâmica',
  outros: 'Outros',
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
  pending: 'Aguardando',
  confirmed: 'Confirmado',
  in_progress: 'Em andamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  no_show: 'Não compareceu',
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de Crédito',
  debit_card: 'Cartão de Débito',
}
