import React from 'react'
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Wallet, 
  PiggyBank, 
  Scale, 
  TrendingDown, 
  TrendingUp,
  Edit2
} from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

export function DashboardCards({ 
  initialBalance, 
  totalIncomes, 
  totalExpenses, 
  monthName,
  estimateBalance,
  onUpdateInitialBalance,
  onUpdateEstimateBalance
}) {
  const difference = totalIncomes - totalExpenses
  const finalBalance = initialBalance + difference
  const isDiffPositive = difference >= 0
  const isFinalPositive = finalBalance >= 0

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      
      {/* 1. Saldo Inicial (Sombra do Mês Anterior) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Inicial (Sombra)
          </span>
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(initialBalance)}
          </div>
          <button 
            onClick={() => {
              const val = prompt('Alterar Saldo Inicial (Sombra mês anterior):', initialBalance)
              if (val !== null) {
                const num = parseFloat(val.replace(',', '.'))
                if (!isNaN(num)) onUpdateInitialBalance(num)
              }
            }}
            title="Editar saldo inicial transportado"
            className="opacity-0 group-hover:opacity-100 text-xs text-slate-400 hover:text-blue-600 transition-opacity p-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          Transportado do mês anterior
        </p>
      </div>

      {/* 2. Total Entradas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Total Entradas
          </span>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl lg:text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
          {formatCurrency(totalIncomes)}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Salários e contribuições
        </p>
      </div>

      {/* 3. Total Saídas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Total Saídas
          </span>
          <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
            <ArrowDownRight className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl lg:text-2xl font-bold text-rose-600 dark:text-rose-400 tracking-tight">
          {formatCurrency(totalExpenses)}
        </div>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
          Cartão, fixas e débito
        </p>
      </div>

      {/* 4. Diferença Entradas e Saídas (Resultado do Mês) */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow ${
        isDiffPositive 
          ? 'border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-b from-white to-emerald-50/20 dark:from-slate-900 dark:to-emerald-950/10' 
          : 'border-rose-200 dark:border-rose-900/50 bg-gradient-to-b from-white to-rose-50/20 dark:from-slate-900 dark:to-rose-950/10'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Diferença no Mês
          </span>
          <div className={`p-2 rounded-xl ${
            isDiffPositive 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300' 
              : 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
          }`}>
            {isDiffPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          </div>
        </div>
        <div className={`text-xl lg:text-2xl font-bold tracking-tight ${
          isDiffPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
        }`}>
          {formatCurrency(difference)}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          {isDiffPositive ? 'Superávit operacional' : 'Déficit no mês corrente'}
        </p>
      </div>

      {/* 5. Saldo Final do Mês (Saldo Inicial + Diferença) */}
      <div className={`rounded-2xl p-5 border shadow-sm hover:shadow-md transition-shadow ${
        isFinalPositive
          ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-transparent'
          : 'bg-gradient-to-br from-rose-600 to-red-700 text-white border-transparent'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">
            Saldo Mês de {monthName}
          </span>
          <div className="p-2 rounded-xl bg-white/20 text-white">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl lg:text-2xl font-extrabold tracking-tight text-white">
          {formatCurrency(finalBalance)}
        </div>
        <p className="text-[11px] text-white/80 mt-1">
          Saldo real disponível em caixa
        </p>
      </div>

    </div>
  )
}
