import React, { useState } from 'react'
import { Plus, Trash2, Edit2, ShoppingBag, Tag } from 'lucide-react'
import { formatCurrency, generateId } from '../utils/formatters'

const CATEGORIES = [
  'Alimentação', 'Supermercado', 'Transporte', 'Saúde', 'Casa', 'Lazer', 'Educação', 'Outros'
]

export function DebitExpensesSection({ expenses, onUpdateExpenses }) {
  const [isAdding, setIsAdding] = useState(false)
  
  // Form states
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Alimentação')

  const total = expenses.reduce((acc, item) => acc + (item.amount || 0), 0)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!description.trim() || !amount) return

    const numAmount = parseFloat(amount.toString().replace(',', '.'))
    if (isNaN(numAmount) || numAmount <= 0) return

    const newItem = {
      id: generateId(),
      description: description.trim(),
      amount: numAmount,
      category: category || 'Outros',
      date: new Date().toISOString().split('T')[0]
    }

    onUpdateExpenses([...expenses, newItem])
    setDescription('')
    setAmount('')
    setIsAdding(false)
  }

  const handleDelete = (id) => {
    if (confirm('Deseja excluir esta despesa de débito?')) {
      onUpdateExpenses(expenses.filter(e => e.id !== id))
    }
  }

  const handleSaveEdit = (id, newDesc, newAmount, newCat) => {
    const num = parseFloat(newAmount.toString().replace(',', '.'))
    if (isNaN(num)) return

    onUpdateExpenses(expenses.map(item => {
      if (item.id === id) {
        return { 
          ...item, 
          description: newDesc.trim(), 
          amount: num,
          category: newCat || item.category
        }
      }
      return item
    }))
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      
      {/* Cabeçalho da Seção */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">
              Despesas em Débito / À Vista (Pix)
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Compras à vista, mercado, alimentação, combustíveis e saídas diárias
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 dark:text-blue-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Fechar' : 'Nova Despesa'}</span>
        </button>
      </div>

      {/* Formulário Rápido de Inclusão */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-4 bg-blue-50/40 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-900/40 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[170px]">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Descrição do Gasto
            </label>
            <input 
              type="text" 
              placeholder="Ex: Supermercado, Almoço..." 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="w-36">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Categoria
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full text-sm px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Valor (R$)
            </label>
            <input 
              type="number" 
              step="0.01"
              placeholder="0,00" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Adicionar
          </button>
        </form>
      )}

      {/* Lista de Despesas de Débito */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {expenses.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">
            Nenhuma despesa em débito registrada neste mês.
          </div>
        ) : (
          expenses.map((item) => (
            <div 
              key={item.id} 
              className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                  <Tag className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {item.description}
                  </p>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {item.category || 'Geral'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(item.amount)}
                </span>
                
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      const newDesc = prompt('Alterar descrição:', item.description)
                      if (newDesc !== null) {
                        const newAmt = prompt('Alterar valor (R$):', item.amount)
                        if (newAmt !== null) {
                          const newCat = prompt('Alterar categoria:', item.category)
                          handleSaveEdit(item.id, newDesc, newAmt, newCat)
                        }
                      }
                    }}
                    title="Editar gasto"
                    className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Excluir gasto"
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
          Total Despesas Débito
        </span>
        <span className="text-base font-extrabold text-blue-700 dark:text-blue-300">
          {formatCurrency(total)}
        </span>
      </div>

    </div>
  )
}
