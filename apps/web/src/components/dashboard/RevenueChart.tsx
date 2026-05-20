'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const DATA = [
  { day: '1', value: 320 },
  { day: '3', value: 480 },
  { day: '5', value: 150 },
  { day: '7', value: 620 },
  { day: '9', value: 430 },
  { day: '11', value: 780 },
  { day: '13', value: 540 },
  { day: '15', value: 890 },
  { day: '17', value: 670 },
  { day: '19', value: 940 },
  { day: '21', value: 820 },
  { day: '23', value: 1100 },
  { day: '25', value: 960 },
  { day: '27', value: 1250 },
  { day: '30', value: 1080 },
]

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={DATA}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
        <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v}`} />
        <Tooltip
          formatter={(v: number) => [`R$ ${v.toFixed(2).replace('.', ',')}`, 'Faturamento']}
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 13 }}
        />
        <Area type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#revenueGradient)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
