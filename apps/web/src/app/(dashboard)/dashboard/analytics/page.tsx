'use client'

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { TrendingUp, TrendingDown, Users, Star, Repeat, DollarSign } from 'lucide-react'

const REVENUE_BY_WEEK = [
  { week: 'Sem 1', receita: 980, meta: 1000 },
  { week: 'Sem 2', receita: 1240, meta: 1000 },
  { week: 'Sem 3', receita: 870, meta: 1000 },
  { week: 'Sem 4', receita: 1730, meta: 1000 },
]

const BY_SERVICE = [
  { name: 'Lavagem Simples', value: 1820, fill: '#0ea5e9' },
  { name: 'Lavagem Completa', value: 2340, fill: '#8b5cf6' },
  { name: 'Polimento', value: 980, fill: '#f59e0b' },
  { name: 'Higienização', value: 560, fill: '#10b981' },
  { name: 'Cerâmica', value: 499, fill: '#ec4899' },
]

const BY_DAY = [
  { day: 'Dom', agendamentos: 2 },
  { day: 'Seg', agendamentos: 8 },
  { day: 'Ter', agendamentos: 11 },
  { day: 'Qua', agendamentos: 9 },
  { day: 'Qui', agendamentos: 13 },
  { day: 'Sex', agendamentos: 15 },
  { day: 'Sáb', agendamentos: 17 },
]

const BY_VEHICLE = [
  { name: 'Hatch', value: 38, fill: '#0ea5e9' },
  { name: 'Sedan', value: 28, fill: '#8b5cf6' },
  { name: 'SUV', value: 22, fill: '#f59e0b' },
  { name: 'Outros', value: 12, fill: '#e5e7eb' },
]

const MONTHS = [
  { mes: 'Jan', valor: 3200 },
  { mes: 'Fev', valor: 2800 },
  { mes: 'Mar', valor: 3900 },
  { mes: 'Abr', valor: 4200 },
  { mes: 'Mai', valor: 4820 },
]

const KPI = [
  { label: 'Novos clientes', value: '23', change: '+18%', up: true, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50' },
  { label: 'Clientes recorrentes', value: '67%', change: '+5%', up: true, icon: Repeat, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { label: 'Ticket médio', value: 'R$ 94', change: '+8%', up: true, icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'Avaliação média', value: '4.8', change: '-0.1', up: false, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
]

export default function AnalyticsPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Desempenho dos últimos 30 dias</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {KPI.map(k => {
          const Icon = k.icon
          return (
            <div key={k.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className={`${k.bg} p-2.5 rounded-xl`}>
                  <Icon size={18} className={k.color} />
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${k.up ? 'text-emerald-600' : 'text-red-500'}`}>
                  {k.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {k.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{k.value}</p>
              <p className="text-sm text-gray-500 mt-0.5">{k.label}</p>
            </div>
          )
        })}
      </div>

      {/* Faturamento mensal + Por serviço */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-gray-900">Faturamento mensal</h2>
            <span className="text-xs text-gray-400">últimos 5 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHS}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} />
              <Tooltip formatter={(v: number) => [`R$ ${v.toFixed(2).replace('.', ',')}`, 'Faturamento']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 13 }} />
              <Area type="monotone" dataKey="valor" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#grad)" dot={{ r: 4, fill: '#0ea5e9' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-5">Por tipo de veículo</h2>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={BY_VEHICLE} cx="50%" cy="50%" outerRadius={60} dataKey="value" paddingAngle={3}>
                {BY_VEHICLE.map((e, i) => <Cell key={i} fill={e.fill} strokeWidth={0} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`]} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {BY_VEHICLE.map(v => (
              <div key={v.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: v.fill }} />
                  <span className="text-sm text-gray-600">{v.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{v.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Por serviço + Por dia da semana + Semanas vs meta */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-5">Receita por serviço</h2>
          <div className="space-y-3">
            {BY_SERVICE.map(s => {
              const max = Math.max(...BY_SERVICE.map(x => x.value))
              const pct = (s.value / max) * 100
              return (
                <div key={s.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600 truncate">{s.name}</span>
                    <span className="text-sm font-semibold text-gray-900 ml-2">R$ {s.value.toFixed(0)}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: s.fill }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-5">Agendamentos por dia</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={BY_DAY} barSize={22}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 13 }} />
              <Bar dataKey="agendamentos" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-5">Faturamento vs meta semanal</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REVENUE_BY_WEEK} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
              <Tooltip formatter={(v: number) => [`R$ ${v.toFixed(2).replace('.', ',')}`, '']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 13 }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="receita" name="Receita" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meta" name="Meta" fill="#e0f2fe" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
