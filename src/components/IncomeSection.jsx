import React, { useState } from 'react'
import { Plus, Trash2, Edit2, CheckCircle2, Circle, TrendingUp } from 'lucide-react'
import { formatCurrency, generateId } from '../utils/formatters'

export function IncomeSection({ incomes, onUpdateIncomes }) {
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  // Form states
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Salário')

  const total = incomes.reduce((acc, item) => acc + (item.amount || 0), 0)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!description.trim() || !amount) return

    const numAmount = parseFloat(amount.toString().replace(',', '.'))
    if (isNaN(numAmount) || numAmount <= 0) return

    const newItem = {
      id: generateId(),
      description: description.trim(),
      amount: numAmount,
      category: category.trim() || 'Geral',
      received: true
    }

    onUpdateIncomes([...incomes, newItem])
    setDescription('')
    setAmount('')
    setIsAdding(false)
  }

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir esta entrada?')) {
      onUpdateIncomes(incomes.filter(i => i.id !== id))
    }
  }

  const handleToggleReceived = (id) => {
    onUpdateIncomes(incomes.map(item => {
      if (item.id === id) {
        return { ...item, received: !item.received }
      }
      return item
    }))
  }

  const handleSaveEdit = (id, newDesc, newAmount) => {
    const num = parseFloat(newAmount.toString().replace(',', '.'))
    if (isNaN(num)) return

    onUpdateIncomes(incomes.map(item => {
      if (item.id === id) {
        return { ...item, description: newDesc.trim(), amount: num }
      }
      return item
    }))
    setEditingId(null)
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      
      {/* Cabeçalho da Seção */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              Entradas (Receitas)
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Fontes de renda, salários e transferências familiares
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Fechar' : 'Nova Entrada'}</span>
        </button>
      </div>

      {/* Formulário Rápido de Inclusão */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-4 bg-emerald-50/40 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900/40 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Descrição / Fonte
            </label>
            <input 
              type="text" 
              placeholder="Ex: Salário, Mãe, Freelance..." 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div className="w-36">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Valor (R$)
            </label>
            <input 
              type="number" 
              step="0.01"
              placeholder="0,00" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Adicionar
          </button>
        </form>
      )}

      {/* Lista de Entradas */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {incomes.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">
            Nenhuma entrada registrada para este mês.
          </div>
        ) : (
          incomes.map((item) => (
            <div 
              key={item.id} 
              className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleReceived(item.id)}
                  title={item.received ? "Marcado como recebido" : "Marcar como recebido"}
                  className="text-slate-400 hover:text-emerald-600 transition-colors"
                >
                  {item.received ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </button>
                <div>
                  <p className={`text-sm font-semibold ${item.received ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 line-through'}`}>
                    {item.description}
                  </p>
                  {item.category && (
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {item.category}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(item.amount)}
                </span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      const newDesc = prompt('Alterar descrição:', item.description)
                      if (newDesc !== null) {
                        const newAmt = prompt('Alterar valor (R$):', item.amount)
                        if (newAmt !== null) {
                          handleSaveEdit(item.id, newDesc, newAmt)
                        }
                      }
                    }}
                    title="Editar entrada"
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Excluir entrada"
                    className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rodapé com Total */}
      <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Total Entradas
        </span>
        <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
          {formatCurrency(total)}
        </span>
      </div>

    </div>
  )
}
