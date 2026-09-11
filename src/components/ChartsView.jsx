import React from 'react'
import { PieChart, BarChart3, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { formatCurrency } from '../utils/formatters'

export function ChartsView({ 
  totalIncomes, 
  ccSicrediTotal = 0,
  ccNubankTotal = 0,
  recTotal = 0, 
  debTotal = 0, 
  totalExpenses,
  estimateBalance,
  onUpdateEstimateBalance
}) {
  const diff = totalIncomes - totalExpenses
  const ccTotal = ccSicrediTotal + ccNubankTotal
  
  // Percentuais de despesas por categoria
  const pSicredi = totalExpenses > 0 ? (ccSicrediTotal / totalExpenses) * 100 : 0
  const pNubank = totalExpenses > 0 ? (ccNubankTotal / totalExpenses) * 100 : 0
  const pRec = totalExpenses > 0 ? (recTotal / totalExpenses) * 100 : 0
  const pDeb = totalExpenses > 0 ? (debTotal / totalExpenses) * 100 : 0

  // Comprometimento da Renda (Saídas / Entradas)
  const commitmentRatio = totalIncomes > 0 ? (totalExpenses / totalIncomes) * 100 : 0
  
  const isHealthy = commitmentRatio <= 90

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* 1. Gráfico Visual de Distribuição de Despesas */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Distribuição das Saídas
            </h3>
          </div>
          <span className="text-xs text-slate-400">Total: {formatCurrency(totalExpenses)}</span>
        </div>

        {/* Barra de Proporção Colorida */}
        <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden mb-6 shadow-inner">
          <div 
            style={{ width: `${pSicredi}%` }} 
            className="bg-emerald-500 hover:opacity-90 transition-all cursor-pointer" 
            title={`Cartão Sicredi: ${pSicredi.toFixed(1)}%`}
          />
          <div 
            style={{ width: `${pNubank}%` }} 
            className="bg-purple-500 hover:opacity-90 transition-all cursor-pointer" 
            title={`Cartão Nubank: ${pNubank.toFixed(1)}%`}
          />
          <div 
            style={{ width: `${pRec}%` }} 
            className="bg-amber-500 hover:opacity-90 transition-all cursor-pointer" 
            title={`Recorrentes: ${pRec.toFixed(1)}%`}
          />
          <div 
            style={{ width: `${pDeb}%` }} 
            className="bg-blue-500 hover:opacity-90 transition-all cursor-pointer" 
            title={`Débito/Pix: ${pDeb.toFixed(1)}%`}
          />
        </div>

        {/* Legenda Detalhada */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Cartão CC - Sicredi</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(ccSicrediTotal)}</span>
              <span className="text-slate-400 ml-1.5 font-medium">({pSicredi.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Cartão CC - Nubank</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(ccNubankTotal)}</span>
              <span className="text-slate-400 ml-1.5 font-medium">({pNubank.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Despesas Recorrentes</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(recTotal)}</span>
              <span className="text-slate-400 ml-1.5 font-medium">({pRec.toFixed(1)}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Débito / À Vista (Pix)</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-800 dark:text-slate-100">{formatCurrency(debTotal)}</span>
              <span className="text-slate-400 ml-1.5 font-medium">({pDeb.toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Comparativo Entradas vs Saídas & Taxa de Comprometimento */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Fluxo Operacional
            </h3>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            isHealthy 
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400' 
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-400'
          }`}>
            {commitmentRatio.toFixed(1)}% Comprometido
          </span>
        </div>

        {/* Barras de Comparação */}
        <div className="space-y-4 mb-5">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Entradas Realizadas</span>
              <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncomes)}</span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              <span>Saídas Totais</span>
              <span className="text-rose-600 dark:text-rose-400">{formatCurrency(totalExpenses)}</span>
            </div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${commitmentRatio > 100 ? 'bg-rose-600' : 'bg-rose-500'}`} 
                style={{ width: `${Math.min(100, commitmentRatio)}%` }} 
              />
            </div>
          </div>
        </div>

        <div className={`p-3 rounded-xl flex items-start gap-2.5 text-xs ${
          diff >= 0 
            ? 'bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50' 
            : 'bg-rose-50 text-rose-900 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50'
        }`}>
          {diff >= 0 ? (
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          )}
          <p>
            {diff >= 0 
              ? `Você encerrou com saldo positivo de ${formatCurrency(diff)}. Excelente gestão!` 
              : `As saídas superaram as receitas em ${formatCurrency(Math.abs(diff))}. O saldo transportado cobriu esta diferença.`
            }
          </p>
        </div>
      </div>

      {/* 3. Estimativa & Projeção Futura (Presente na Planilha) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                Estimativa & Projeção
              </h3>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Planilha
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 mb-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 block mb-1">
              Estimativa / Balanço Projetado
            </span>
            <div className="text-xl font-black text-slate-800 dark:text-slate-100">
              {formatCurrency(estimateBalance)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Valor correspondente ao campo <strong>Estimativa</strong> registrado na planilha original.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            const val = prompt('Atualizar Estimativa / Balanço Projetado:', estimateBalance)
            if (val !== null) {
              const num = parseFloat(val.replace(',', '.'))
              if (!isNaN(num)) onUpdateEstimateBalance(num)
            }
          }}
          className="w-full py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors text-center"
        >
          Editar Valor de Estimativa
        </button>
      </div>

    </div>
  )
}
