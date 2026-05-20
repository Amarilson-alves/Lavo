'use client'

import { useState } from 'react'
import { Plus, Pencil, Trash2, Clock, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePartnerProfile, usePartnerServices, Service } from '@/lib/hooks/usePartnerData'

const CATEGORIES = [
  { value: 'lavagem', label: 'Lavagem' },
  { value: 'polimento', label: 'Polimento' },
  { value: 'higienizacao', label: 'Higienização' },
  { value: 'ceramica', label: 'Cerâmica' },
  { value: 'outros', label: 'Outros' },
]

const VEHICLE_TYPES = [
  { value: 'hatch', label: 'Hatch' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'pickup', label: 'Pickup' },
  { value: 'van', label: 'Van/Furgão' },
  { value: 'motorcycle', label: 'Moto' },
]

const CATEGORY_COLORS: Record<string, string> = {
  lavagem: 'bg-blue-50 text-blue-700',
  polimento: 'bg-amber-50 text-amber-700',
  higienizacao: 'bg-emerald-50 text-emerald-700',
  ceramica: 'bg-violet-50 text-violet-700',
  outros: 'bg-gray-100 text-gray-600',
}

type ServiceForm = Omit<Service, 'id' | 'partner_id'>

const EMPTY_FORM: ServiceForm = {
  name: '',
  description: '',
  category: 'lavagem',
  duration_minutes: 60,
  is_active: true,
  pricing: [{ vehicle_type: 'hatch', price: 0 }],
}

export default function ServicesPage() {
  const { data: partner } = usePartnerProfile()
  const { services, isLoading, create, update, remove, toggle } = usePartnerServices(partner?.id)

  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM)
  const [expanded, setExpanded] = useState<string | null>(null)

  function openNew() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setShowModal(true)
  }

  function openEdit(service: Service) {
    setEditing(service)
    setForm({
      name: service.name,
      description: service.description ?? '',
      category: service.category,
      duration_minutes: service.duration_minutes,
      is_active: service.is_active,
      pricing: service.pricing,
    })
    setShowModal(true)
  }

  async function saveService() {
    if (!form.name.trim()) return
    if (editing) {
      await update.mutateAsync({ id: editing.id, ...form })
        .then(() => { setShowModal(false); toast.success('Serviço atualizado!') })
        .catch(err => toast.error(err.message))
    } else {
      await create.mutateAsync(form)
        .then(() => { setShowModal(false); toast.success('Serviço criado!') })
        .catch(err => toast.error(err.message))
    }
  }

  async function deleteService(id: string) {
    await remove.mutateAsync(id)
      .then(() => toast.success('Serviço removido.'))
      .catch(err => toast.error(err.message))
  }

  async function toggleActive(id: string, current: boolean) {
    await toggle.mutateAsync({ id, is_active: !current })
      .catch(err => toast.error(err.message))
  }

  function addPricing() {
    const used = form.pricing.map(p => p.vehicle_type)
    const next = VEHICLE_TYPES.find(v => !used.includes(v.value))
    if (!next) return
    setForm(f => ({ ...f, pricing: [...f.pricing, { vehicle_type: next.value, price: 0 }] }))
  }

  function updatePricing(index: number, field: 'vehicle_type' | 'price', value: string | number) {
    setForm(f => ({
      ...f,
      pricing: f.pricing.map((p, i) => i === index ? { ...p, [field]: value } : p),
    }))
  }

  function removePricing(index: number) {
    setForm(f => ({ ...f, pricing: f.pricing.filter((_, i) => i !== index) }))
  }

  const active = services.filter(s => s.is_active).length

  if (!partner) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-primary-500 mx-auto mb-3" size={32} />
          <p className="text-gray-500">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
          <p className="text-gray-500 mt-1">
            {isLoading ? 'Carregando...' : `${active} ativo${active !== 1 ? 's' : ''} de ${services.length} serviços cadastrados`}
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-600 transition-colors"
        >
          <Plus size={18} />
          Novo serviço
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary-500" size={32} />
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">🛠️</p>
          <p className="text-gray-500 font-medium mb-2">Nenhum serviço cadastrado</p>
          <p className="text-gray-400 text-sm mb-5">Adicione os serviços que você oferece para aparecer no app.</p>
          <button onClick={openNew} className="bg-primary-500 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-600 transition-colors">
            Adicionar primeiro serviço
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map(service => (
            <div key={service.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden transition-all ${!service.is_active ? 'opacity-60' : ''}`}>
              <div className="p-5 flex items-center gap-4">
                <button onClick={() => toggleActive(service.id, service.is_active)} className="shrink-0">
                  {service.is_active
                    ? <ToggleRight size={28} className="text-primary-500" />
                    : <ToggleLeft size={28} className="text-gray-300" />}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[service.category]}`}>
                      {CATEGORIES.find(c => c.value === service.category)?.label}
                    </span>
                    {!service.is_active && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">Inativo</span>
                    )}
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-500 mt-0.5 truncate">{service.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 text-gray-500 shrink-0">
                  <Clock size={14} />
                  <span className="text-sm">{service.duration_minutes} min</span>
                </div>

                {service.pricing.length > 0 && (
                  <div className="text-right shrink-0">
                    <p className="text-xs text-gray-400">a partir de</p>
                    <p className="font-bold text-gray-900">
                      R$ {Math.min(...service.pricing.map(p => p.price)).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => setExpanded(expanded === service.id ? null : service.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {expanded === service.id
                      ? <ChevronUp size={16} className="text-gray-400" />
                      : <ChevronDown size={16} className="text-gray-400" />}
                  </button>
                  <button onClick={() => openEdit(service)} className="p-2 hover:bg-primary-50 rounded-lg transition-colors">
                    <Pencil size={16} className="text-primary-500" />
                  </button>
                  <button onClick={() => deleteService(service.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} className="text-red-400" />
                  </button>
                </div>
              </div>

              {expanded === service.id && (
                <div className="px-5 pb-5 border-t border-gray-50 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Preços por tipo de veículo</p>
                  <div className="grid grid-cols-3 gap-2">
                    {service.pricing.map(p => (
                      <div key={p.vehicle_type} className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
                        <span className="text-sm text-gray-600">{VEHICLE_TYPES.find(v => v.value === p.vehicle_type)?.label}</span>
                        <span className="font-semibold text-gray-900 text-sm">R$ {p.price.toFixed(2).replace('.', ',')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal novo/editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? 'Editar serviço' : 'Novo serviço'}
              </h2>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do serviço</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ex: Lavagem Completa"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Descreva o que inclui este serviço..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Duração (minutos)</label>
                  <input
                    type="number"
                    value={form.duration_minutes}
                    onChange={e => setForm(f => ({ ...f, duration_minutes: Number(e.target.value) }))}
                    min={5}
                    step={5}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Preços por tipo de veículo</label>
                  {form.pricing.length < VEHICLE_TYPES.length && (
                    <button onClick={addPricing} className="text-xs text-primary-500 font-semibold hover:underline flex items-center gap-1">
                      <Plus size={13} /> Adicionar
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {form.pricing.map((p, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <select
                        value={p.vehicle_type}
                        onChange={e => updatePricing(i, 'vehicle_type', e.target.value)}
                        className="flex-1 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      >
                        {VEHICLE_TYPES.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                      </select>
                      <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                        <input
                          type="number"
                          value={p.price}
                          onChange={e => updatePricing(i, 'price', Number(e.target.value))}
                          min={0}
                          step={0.01}
                          className="w-full border border-gray-300 rounded-xl pl-8 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                      {form.pricing.length > 1 && (
                        <button onClick={() => removePricing(i)} className="p-2 hover:bg-red-50 rounded-lg">
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveService}
                disabled={!form.name.trim() || create.isPending || update.isPending}
                className="flex-1 bg-primary-500 text-white font-semibold py-3 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {(create.isPending || update.isPending) && <Loader2 size={16} className="animate-spin" />}
                {editing ? 'Salvar alterações' : 'Criar serviço'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
