import React, { useState } from 'react'
import { Plus, Trash2, Edit2, CreditCard, Clock, CalendarDays } from 'lucide-react'
import { formatCurrency, generateId } from '../utils/formatters'

export function CreditCardSection({ 
  title = "Parcelas de Cartão de Crédito (CC)", 
  subtitle = "Compras parceladas e faturas",
  cardBrand = "Sicredi", // "Sicredi" ou "Nubank"
  theme = "emerald", // "emerald" ou "purple"
  expenses = [], 
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onUpdateExpenses 
}) {
  const [isAdding, setIsAdding] = useState(false)
  
  // Form states
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [currentInst, setCurrentInst] = useState(1)
  const [totalInst, setTotalInst] = useState(10)

  // Item selecionado para confirmação de exclusão
  const [deleteModalItem, setDeleteModalItem] = useState(null)

  const isPurple = theme === 'purple'

  const total = expenses.reduce((acc, item) => acc + (item.amount || 0), 0)

  const handleAdd = (e) => {
    e.preventDefault()
    if (!description.trim() || !amount) return

    const numAmount = parseFloat(amount.toString().replace(',', '.'))
    if (isNaN(numAmount) || numAmount <= 0) return

    const uniquePurchaseId = generateId()
    const newItem = {
      id: generateId(),
      purchaseId: uniquePurchaseId,
      description: description.trim(),
      amount: numAmount,
      currentInstallment: parseInt(currentInst) || 1,
      totalInstallments: parseInt(totalInst) || 1,
      card: cardBrand
    }

    if (onAddExpense) {
      onAddExpense(newItem)
    } else if (onUpdateExpenses) {
      onUpdateExpenses([...expenses, newItem])
    }

    setDescription('')
    setAmount('')
    setIsAdding(false)
  }

  const handleConfirmDelete = (deleteFuture) => {
    if (!deleteModalItem) return

    const targetId = deleteModalItem.purchaseId || deleteModalItem.id
    if (onDeleteExpense) {
      onDeleteExpense(targetId, deleteFuture)
    } else if (onUpdateExpenses) {
      onUpdateExpenses(expenses.filter(e => e.id !== deleteModalItem.id))
    }
    setDeleteModalItem(null)
  }

  const handleSaveEdit = (item, newDesc, newAmount, newCurrent, newTotal) => {
    const num = parseFloat(newAmount.toString().replace(',', '.'))
    if (isNaN(num)) return

    const updatedItem = {
      ...item,
      description: newDesc.trim(),
      amount: num,
      currentInstallment: parseInt(newCurrent) || item.currentInstallment,
      totalInstallments: parseInt(newTotal) || item.totalInstallments
    }

    if (onEditExpense) {
      onEditExpense(updatedItem)
    } else if (onUpdateExpenses) {
      onUpdateExpenses(expenses.map(i => i.id === item.id ? updatedItem : i))
    }
  }

  // Estilos temáticos dinâmicos
  const iconBg = isPurple 
    ? 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400' 
    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'

  const btnHeader = isPurple
    ? 'bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:hover:bg-purple-900/60 dark:text-purple-300'
    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 dark:text-emerald-300'

  const formBg = isPurple
    ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/40'
    : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/40'

  const focusRing = isPurple ? 'focus:ring-purple-500' : 'focus:ring-emerald-500'

  const submitBtn = isPurple
    ? 'bg-purple-600 hover:bg-purple-700 text-white'
    : 'bg-emerald-600 hover:bg-emerald-700 text-white'

  const instBadge = isPurple
    ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-100 dark:border-purple-900/40 text-purple-600 dark:text-purple-400'
    : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-100 dark:border-emerald-900/40 text-emerald-600 dark:text-emerald-400'

  const cardTag = isPurple
    ? 'bg-purple-100/70 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
    : 'bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'

  const totalText = isPurple
    ? 'text-purple-700 dark:text-purple-300'
    : 'text-emerald-700 dark:text-emerald-300'

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors relative">
      
      {/* Cabeçalho da Seção */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${iconBg}`}>
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-800 dark:text-slate-100 text-base">
                {title}
              </h2>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cardTag}`}>
                {cardBrand}
              </span>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${btnHeader}`}
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Fechar' : 'Nova Parcela'}</span>
        </button>
      </div>

      {/* Formulário Rápido de Inclusão com Projeção Automática */}
      {isAdding && (
        <form onSubmit={handleAdd} className={`p-4 border-b flex flex-wrap gap-3 items-end ${formBg}`}>
          <div className="flex-1 min-w-[170px]">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Descrição da Compra
            </label>
            <input 
              type="text" 
              placeholder={`Ex: Compra ${cardBrand}...`} 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={`w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${focusRing}`}
              required
            />
          </div>

          <div className="w-24">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Parcela Atual
            </label>
            <input 
              type="number" 
              min="1"
              value={currentInst}
              onChange={e => setCurrentInst(e.target.value)}
              className={`w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${focusRing}`}
              required
            />
          </div>

          <div className="w-24">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Total Parcelas
            </label>
            <input 
              type="number" 
              min="1"
              value={totalInst}
              onChange={e => setTotalInst(e.target.value)}
              className={`w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${focusRing}`}
              required
            />
          </div>

          <div className="w-32">
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Valor Parcela (R$)
            </label>
            <input 
              type="number" 
              step="0.01"
              placeholder="0,00" 
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`w-full text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 ${focusRing}`}
              required
            />
          </div>

          <button
            type="submit"
            className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm transition-colors ${submitBtn}`}
          >
            Adicionar & Projetar
          </button>
        </form>
      )}

      {/* Lista de Parcelas */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {expenses.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">
            Nenhuma parcela registrada no {cardBrand} para este mês.
          </div>
        ) : (
          expenses.map((item) => {
            const isFinished = item.currentInstallment >= item.totalInstallments
            const remainingMonths = Math.max(0, item.totalInstallments - item.currentInstallment)

            return (
              <div 
                key={item.id} 
                className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-[11px] font-bold ${instBadge}`}>
                    {item.currentInstallment}/{item.totalInstallments}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {item.description}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${cardTag}`}>
                        {cardBrand}
                      </span>
                      {isFinished ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Última Parcela deste mês!
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <CalendarDays className="w-3 h-3 text-slate-400" />
                          Restam {remainingMonths} {remainingMonths === 1 ? 'mês' : 'meses'} subsequentes
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-sm font-bold ${totalText}`}>
                    {formatCurrency(item.amount)}
                  </span>
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        const newDesc = prompt('Alterar descrição da compra:', item.description)
                        if (newDesc !== null) {
                          const newAmt = prompt('Alterar valor da parcela (R$):', item.amount)
                          if (newAmt !== null) {
                            const newCur = prompt('Parcela atual no mês:', item.currentInstallment)
                            const newTot = prompt('Total de parcelas da compra:', item.totalInstallments)
                            handleSaveEdit(item, newDesc, newAmt, newCur, newTot)
                          }
                        }
                      }}
                      title="Editar parcela (sincroniza meses futuros)"
                      className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeleteModalItem(item)}
                      title="Excluir parcela"
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Rodapé com Total */}
      <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Total {title}
        </span>
        <span className={`text-base font-extrabold ${totalText}`}>
          {formatCurrency(total)}
        </span>
      </div>

      {/* Modal / Diálogo de Confirmação de Exclusão com Opções */}
      {deleteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Excluir compra parcelada
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Você está excluindo <strong>"{deleteModalItem.description}"</strong> ({deleteModalItem.currentInstallment}/{deleteModalItem.totalInstallments}).
              Como deseja aplicar a exclusão?
            </p>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => handleConfirmDelete(true)}
                className="w-full py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors text-center"
              >
                Excluir deste e de TODOS os meses futuros
              </button>

              <button
                type="button"
                onClick={() => handleConfirmDelete(false)}
                className="w-full py-2 px-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl transition-colors text-center"
              >
                Excluir APENAS deste mês
              </button>

              <button
                type="button"
                onClick={() => setDeleteModalItem(null)}
                className="w-full py-1.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-center"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
