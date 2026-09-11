import React, { useState } from 'react'
import { Plus, Trash2, Edit2, CheckCircle2, Circle, RefreshCw, AlertTriangle, BadgeAlert } from 'lucide-react'
import { formatCurrency, generateId } from '../utils/formatters'

export function RecurringExpensesSection({ expenses, onUpdateExpenses, currentMonth, currentYear }) {
  const [isAdding, setIsAdding] = useState(false)
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDay, setDueDay] = useState('10')

  const total = expenses.reduce((acc, item) => acc + (item.amount || 0), 0)

  // --- Overdue detection ---
  const now = new Date()
  const todayYear = now.getFullYear()
  const todayMonth = now.getMonth() // 0-based
  const todayDay = now.getDate()

  const isCurrentMonth = (currentYear === todayYear && currentMonth === todayMonth)
  const isPastMonth = (currentYear < todayYear || (currentYear === todayYear && currentMonth < todayMonth))

  const isOverdue = (item) => {
    if (item.paid) return false
    if (isCurrentMonth) return (item.dueDay || 10) < todayDay
    if (isPastMonth) return true
    return false
  }

  const getDaysLate = (item) => {
    if (isCurrentMonth) return todayDay - (item.dueDay || 10)
    if (isPastMonth) {
      const dueDate = new Date(currentYear, currentMonth, item.dueDay || 10)
      return Math.floor((now - dueDate) / 86400000)
    }
    return 0
  }

  const overdueItems = expenses.filter(isOverdue)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!description.trim() || !amount) return
    const numAmount = parseFloat(amount.toString().replace(',', '.'))
    if (isNaN(numAmount) || numAmount <= 0) return
    const newItem = { id: generateId(), description: description.trim(), amount: numAmount, dueDay: parseInt(dueDay) || 10, paid: true }
    onUpdateExpenses([...expenses, newItem])
    setDescription('')
    setAmount('')
    setIsAdding(false)
  }

  const handleDelete = (id) => {
    if (confirm('Deseja excluir esta despesa recorrente?')) {
      onUpdateExpenses(expenses.filter(e => e.id !== id))
    }
  }

  const handleTogglePaid = (id) => {
    onUpdateExpenses(expenses.map(item => item.id === id ? { ...item, paid: !item.paid } : item))
  }

  const handleConfirmPayment = (id) => {
    onUpdateExpenses(expenses.map(item => item.id === id ? { ...item, paid: true } : item))
  }

  const handleSaveEdit = (id, newDesc, newAmount, newDueDay) => {
    const num = parseFloat(newAmount.toString().replace(',', '.'))
    if (isNaN(num)) return
    onUpdateExpenses(expenses.map(item =>
      item.id === id ? { ...item, description: newDesc.trim(), amount: num, dueDay: parseInt(newDueDay) || item.dueDay } : item
    ))
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">

      {/* Cabecalho */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base flex items-center gap-2">
              Despesas Recorrentes (Fixas)
              {overdueItems.length > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 animate-pulse">
                  <BadgeAlert className="w-3 h-3" />
                  {overdueItems.length} VENCIDA{overdueItems.length > 1 ? 'S' : ''}
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Contas mensais, concessionarias (luz, agua) e assinaturas
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 dark:text-amber-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Fechar' : 'Nova Recorrente'}</span>
        </button>
      </div>

      {/* Banner de alerta */}
      {overdueItems.length > 0 && (
        <div className="mx-4 mt-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-rose-700 dark:text-rose-300">
              {overdueItems.length === 1 ? '1 despesa vencida sem pagamento confirmado' : `${overdueItems.length} despesas vencidas sem pagamento confirmado`}
            </p>
            <ul className="mt-1.5 space-y-0.5">
              {overdueItems.map(item => (
                <li key={item.id} className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold">{item.description}</span>
                  <span className="text-rose-400">-</span>
                  <span>venceu dia {item.dueDay}</span>
                  {getDaysLate(item) > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-rose-200 dark:bg-rose-900/60 rounded text-[10px] font-bold text-rose-700 dark:text-rose-300">
                      {getDaysLate(item)} dia{getDaysLate(item) > 1 ? 's' : ''} em atraso
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Formulario de Inclusao */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-4 bg-amber-50/40 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/40 flex flex-wrap gap-3 items-end mt-3 mx-4 rounded-xl">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Descricao da Conta</label>
            <input type="text" placeholder="Ex: Energia Eletrica, Internet..." value={description} onChange={e => setDescription(e.target.value)}
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500" required />
          </div>
          <div className="w-24">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Dia Venc.</label>
            <input type="number" min="1" max="31" value={dueDay} onChange={e => setDueDay(e.target.value)}
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500" required />
          </div>
          <div className="w-32">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Valor (R$)</label>
            <input type="number" step="0.01" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)}
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500" required />
          </div>
          <button type="submit" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors">Adicionar</button>
        </form>
      )}

      {/* Lista */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-3">
        {expenses.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">Nenhuma despesa recorrente cadastrada neste mes.</div>
        ) : (
          expenses.map((item) => {
            const overdue = isOverdue(item)
            const daysLate = overdue ? getDaysLate(item) : 0
            return (
              <div key={item.id} className={`px-5 py-3.5 flex items-center justify-between transition-colors group ${overdue ? 'bg-rose-50/60 dark:bg-rose-950/20 border-l-4 border-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'}`}>
                <div className="flex items-center gap-3">
                  <button onClick={() => handleTogglePaid(item.id)} title={item.paid ? 'Conta paga' : 'Marcar como paga'} className="text-slate-400 hover:text-amber-600 transition-colors">
                    {item.paid ? (
                      <CheckCircle2 className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Circle className={`w-5 h-5 ${overdue ? 'text-rose-400' : ''}`} />
                    )}
                  </button>
                  <div>
                    <p className={`text-sm font-semibold ${item.paid ? 'text-slate-800 dark:text-slate-100' : overdue ? 'text-rose-700 dark:text-rose-300' : 'text-slate-500'}`}>
                      {item.description}
                      {overdue && (
                        <span className="ml-2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300 align-middle">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          VENCIDA
                        </span>
                      )}
                    </p>
                    <span className={`text-[11px] ${overdue ? 'text-rose-500 dark:text-rose-400 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                      Vencimento dia {item.dueDay || '10'}{overdue && daysLate > 0 ? ` - ${daysLate} dia${daysLate > 1 ? 's' : ''} em atraso` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${overdue ? 'text-rose-600 dark:text-rose-400' : 'text-amber-700 dark:text-amber-300'}`}>
                    {formatCurrency(item.amount)}
                  </span>
                  {overdue && (
                    <button onClick={() => handleConfirmPayment(item.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-sm transition-colors whitespace-nowrap"
                      title="Confirmar pagamento">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Pagar
                    </button>
                  )}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => {
                      const newDesc = prompt('Alterar descricao:', item.description)
                      if (newDesc !== null) {
                        const newAmt = prompt('Alterar valor (R$):', item.amount)
                        if (newAmt !== null) {
                          const newDay = prompt('Alterar dia de vencimento:', item.dueDay)
                          handleSaveEdit(item.id, newDesc, newAmt, newDay)
                        }
                      }
                    }} title="Editar conta" className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(item.id)} title="Excluir conta" className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Rodape Total */}
      <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Total Despesas Recorrentes</span>
        <span className="text-base font-extrabold text-amber-700 dark:text-amber-300">{formatCurrency(total)}</span>
      </div>

    </div>
  )
}
