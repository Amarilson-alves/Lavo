'use client'

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const DATA = [
  { name: 'Concluídos', value: 68, color: '#10b981' },
  { name: 'Confirmados', value: 18, color: '#0ea5e9' },
  { name: 'Pendentes', value: 10, color: '#f59e0b' },
  { name: 'Cancelados', value: 4, color: '#ef4444' },
]

export function BookingStatusChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={DATA}
          cx="50%"
          cy="45%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
        >
          {DATA.map((entry, i) => (
            <Cell key={i} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => [`${v}%`, '']}
          contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 13 }}
        />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  )
}
