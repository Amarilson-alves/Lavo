'use client'

import { useState, useEffect } from 'react'
import { Save, Camera, MapPin, Clock, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePartnerProfile, usePartnerProfileUpdate, usePartnerLocation } from '@/lib/hooks/usePartnerData'

const DAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS',
  'MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC',
  'SP','SE','TO',
]

type WorkingDay = { day: number; is_open: boolean; open: string; close: string }

const DEFAULT_HOURS: WorkingDay[] = DAYS.map((_, day) => ({
  day,
  is_open: day >= 1 && day <= 6,
  open: '08:00',
  close: day === 6 ? '13:00' : '18:00',
}))

export default function SettingsPage() {
  const { data: partner, isLoading: loadingProfile } = usePartnerProfile()
  const { data: location, isLoading: loadingLocation, save: saveLocation } = usePartnerLocation(partner?.id)
  const updateProfile = usePartnerProfileUpdate()

  const [profileForm, setProfileForm] = useState({
    business_name: '',
    description: '',
    cnpj: '',
  })

  const [locationForm, setLocationForm] = useState({
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    zip_code: '',
    latitude: -23.5505,
    longitude: -46.6333,
  })

  const [hours, setHours] = useState<WorkingDay[]>(DEFAULT_HOURS)
  const [saving, setSaving] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)

  async function handleCepBlur(cep: string) {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (data.erro) { setCepLoading(false); return }

      setLocationForm(f => ({
        ...f,
        address: data.logradouro || f.address,
        neighborhood: data.bairro || f.neighborhood,
        city: data.localidade || f.city,
        state: data.uf || f.state,
      }))

      const query = encodeURIComponent(`${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}, Brasil`)
      const geo = await fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`)
      const geoData = await geo.json()
      if (geoData[0]) {
        setLocationForm(f => ({
          ...f,
          latitude: parseFloat(geoData[0].lat),
          longitude: parseFloat(geoData[0].lon),
        }))
      }
    } catch {
    } finally {
      setCepLoading(false)
    }
  }

  useEffect(() => {
    if (partner) {
      setProfileForm({
        business_name: partner.business_name ?? '',
        description: partner.description ?? '',
        cnpj: partner.cnpj ?? '',
      })
    }
  }, [partner])

  useEffect(() => {
    if (location) {
      setLocationForm({
        address: location.address ?? '',
        number: location.number ?? '',
        complement: location.complement ?? '',
        neighborhood: location.neighborhood ?? '',
        city: location.city ?? '',
        state: location.state ?? 'SP',
        zip_code: location.zip_code ?? '',
        latitude: location.latitude ?? -23.5505,
        longitude: location.longitude ?? -46.6333,
      })
      if (location.working_hours?.length > 0) {
        setHours(location.working_hours.map((h: WorkingDay) => ({ ...h })))
      }
    }
  }, [location])

  function updateHour(day: number, field: keyof WorkingDay, value: string | boolean) {
    setHours(h => h.map(d => d.day === day ? { ...d, [field]: value } : d))
  }

  async function handleSave() {
    if (!profileForm.business_name.trim()) {
      toast.error('Informe o nome do estabelecimento.')
      return
    }

    setSaving(true)
    try {
      const hasLocation = !!(locationForm.address && locationForm.city && locationForm.latitude && locationForm.longitude)

      await updateProfile.mutateAsync({
        ...profileForm,
        ...(hasLocation ? { is_active: true } : {}),
      })

      if (hasLocation) {
        await saveLocation.mutateAsync({
          ...locationForm,
          working_hours: hours,
        })
      }

      toast.success('Configurações salvas com sucesso!')
    } catch (err: any) {
      toast.error(err.message ?? 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (loadingProfile || loadingLocation) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500 mt-1">Gerencie as informações do seu negócio</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Camera size={18} className="text-primary-500" />
          Identidade visual
        </h2>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-500 font-bold text-2xl">
              {profileForm.business_name.charAt(0) || '?'}
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center shadow">
              <Camera size={12} className="text-white" />
            </button>
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm">Logo do negócio</p>
            <p className="text-gray-400 text-xs mt-1">PNG ou JPG, máx. 2MB — em breve</p>
          </div>
        </div>
      </div>

      {/* Informações do negócio */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <FileText size={18} className="text-primary-500" />
          Informações do negócio
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome do estabelecimento *</label>
            <input
              value={profileForm.business_name}
              onChange={e => setProfileForm(f => ({ ...f, business_name: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Lava Car Premium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
            <textarea
              value={profileForm.description}
              onChange={e => setProfileForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="Conte um pouco sobre o seu negócio..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">CNPJ</label>
            <input
              value={profileForm.cnpj}
              onChange={e => setProfileForm(f => ({ ...f, cnpj: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="00.000.000/0001-00"
            />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <MapPin size={18} className="text-primary-500" />
          Localização
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Endereço (rua/avenida)</label>
            <input
              value={locationForm.address}
              onChange={e => setLocationForm(f => ({ ...f, address: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Av. Paulista"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Número</label>
            <input
              value={locationForm.number}
              onChange={e => setLocationForm(f => ({ ...f, number: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="1000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Complemento</label>
            <input
              value={locationForm.complement}
              onChange={e => setLocationForm(f => ({ ...f, complement: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Sala 1, Loja A..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bairro</label>
            <input
              value={locationForm.neighborhood}
              onChange={e => setLocationForm(f => ({ ...f, neighborhood: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Bela Vista"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              CEP {cepLoading && <span className="text-primary-500 text-xs ml-1">buscando...</span>}
            </label>
            <input
              value={locationForm.zip_code}
              onChange={e => setLocationForm(f => ({ ...f, zip_code: e.target.value }))}
              onBlur={e => handleCepBlur(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="01310-100"
              maxLength={9}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Cidade</label>
            <input
              value={locationForm.city}
              onChange={e => setLocationForm(f => ({ ...f, city: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="São Paulo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
            <select
              value={locationForm.state}
              onChange={e => setLocationForm(f => ({ ...f, state: e.target.value }))}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
            >
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            {locationForm.latitude && locationForm.longitude ? (
              <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                📍 Coordenadas obtidas automaticamente: {locationForm.latitude.toFixed(5)}, {locationForm.longitude.toFixed(5)}
              </p>
            ) : (
              <p className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                📍 Digite o CEP e saia do campo — endereço e coordenadas serão preenchidos automaticamente.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Horários */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Clock size={18} className="text-primary-500" />
          Horário de funcionamento
        </h2>
        <div className="space-y-3">
          {hours.map(day => (
            <div key={day.day} className="flex items-center gap-4">
              <div className="w-24">
                <span className="text-sm font-medium text-gray-700">{DAYS[day.day]}</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={day.is_open}
                  onChange={e => updateHour(day.day, 'is_open', e.target.checked)}
                  className="w-4 h-4 rounded accent-primary-500"
                />
                <span className="text-sm text-gray-500">{day.is_open ? 'Aberto' : 'Fechado'}</span>
              </label>
              {day.is_open && (
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="time"
                    value={day.open}
                    onChange={e => updateHour(day.day, 'open', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-gray-400 text-sm">até</span>
                  <input
                    type="time"
                    value={day.close}
                    onChange={e => updateHour(day.day, 'close', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary-500 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </button>
      </div>
    </div>
  )
}
