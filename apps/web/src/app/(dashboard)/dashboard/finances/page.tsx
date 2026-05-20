import { DollarSign, TrendingUp, ArrowDownCircle, Clock } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const BALANCE = {
  available: 3240.50,
  pending: 1580.00,
  total_month: 4820.50,
  platform_fee_month: 723.07,
}

const TRANSACTIONS = [
  { id: '1', description: 'Lavagem Completa — João Silva', date: '17/05/2026', amount: 76.42, type: 'credit' },
  { id: '2', description: 'Polimento — Maria Santos', date: '17/05/2026', amount: 212.42, type: 'credit' },
  { id: '3', description: 'Saque realizado', date: '15/05/2026', amount: 1200.00, type: 'debit' },
  { id: '4', description: 'Higienização — Pedro Costa', date: '14/05/2026', amount: 127.42, type: 'credit' },
  { id: '5', description: 'Cerâmica — Carlos Mendes', date: '13/05/2026', amount: 424.92, type: 'credit' },
]

export default function FinancesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
        <p className="text-gray-500 mt-1">Acompanhe seus ganhos e solicite saques</p>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="col-span-2 bg-primary-500 rounded-2xl p-6 text-white">
          <p className="text-primary-100 text-sm">Saldo disponível para saque</p>
          <p className="text-4xl font-bold mt-2">{formatCurrency(BALANCE.available)}</p>
          <button className="mt-4 bg-white text-primary-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-primary-50 transition-colors">
            Solicitar saque
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 mb-3">
            <Clock size={16} />
            <span className="text-sm font-medium">Saldo pendente</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(BALANCE.pending)}</p>
          <p className="text-xs text-gray-400 mt-1">Aguardando compensação</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 mb-3">
            <TrendingUp size={16} />
            <span className="text-sm font-medium">Ganhos do mês</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(BALANCE.total_month)}</p>
          <p className="text-xs text-gray-400 mt-1">Taxa plataforma: {formatCurrency(BALANCE.platform_fee_month)}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Últimas transações</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="px-6 py-4 flex items-center gap-4">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {tx.type === 'credit'
                  ? <DollarSign size={16} className="text-emerald-600" />
                  : <ArrowDownCircle size={16} className="text-red-500" />
                }
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">{tx.description}</p>
                <p className="text-xs text-gray-400">{tx.date}</p>
              </div>
              <p className={`font-bold ${tx.type === 'credit' ? 'text-emerald-600' : 'text-red-500'}`}>
                {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
