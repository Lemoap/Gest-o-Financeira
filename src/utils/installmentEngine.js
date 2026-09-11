import { MONTH_NAMES, generateId } from './formatters'

/**
 * Retorna o próximo ano e mês dados ano e mês atuais
 */
export function getNextMonth(year, monthIndex) {
  if (monthIndex === 11) {
    return { year: year + 1, monthIndex: 0 }
  }
  return { year, monthIndex: monthIndex + 1 }
}

/**
 * Retorna ano e mês somando N meses
 */
export function addMonths(year, monthIndex, count) {
  let y = year
  let m = monthIndex + count
  while (m > 11) {
    y++
    m -= 12
  }
  while (m < 0) {
    y--
    m += 12
  }
  return { year: y, monthIndex: m }
}

/**
 * Retorna o número de meses de diferença entre duas datas (Data2 - Data1)
 */
export function getMonthDiff(y1, m1, y2, m2) {
  return (y2 - y1) * 12 + (m2 - m1)
}

/**
 * Cria a estrutura esqueleto de um mês se ele ainda não existir
 */
export function ensureMonthExists(monthsState, year, monthIndex) {
  const monthKey = `${year}-${monthIndex}`
  if (!monthsState[monthKey]) {
    monthsState[monthKey] = {
      id: monthKey,
      year,
      month: monthIndex,
      name: MONTH_NAMES[monthIndex],
      initialBalance: 0,
      incomes: [],
      creditCardSicrediExpenses: [],
      creditCardNubankExpenses: [],
      recurringExpenses: [],
      debitExpenses: [],
      estimateBalance: 0,
      notes: ''
    }
  }
  return monthsState[monthKey]
}

/**
 * Propaga uma nova compra parcelada para todos os meses futuros restantes
 */
export function propagateNewInstallment(monthsState, startYear, startMonthIndex, purchase, cardKey) {
  const purchaseId = purchase.purchaseId || purchase.id || generateId()
  purchase.purchaseId = purchaseId

  const currentInst = parseInt(purchase.currentInstallment) || 1
  const totalInst = parseInt(purchase.totalInstallments) || 1
  const remaining = totalInst - currentInst

  // 1. Garante inserção no mês de início
  const startKey = `${startYear}-${startMonthIndex}`
  const startMonth = ensureMonthExists(monthsState, startYear, startMonthIndex)
  if (!startMonth[cardKey]) startMonth[cardKey] = []
  
  const existingIndex = startMonth[cardKey].findIndex(e => (e.purchaseId && e.purchaseId === purchaseId) || e.id === purchase.id)
  if (existingIndex >= 0) {
    startMonth[cardKey][existingIndex] = { ...purchase, currentInstallment: currentInst, totalInstallments: totalInst }
  } else {
    startMonth[cardKey].push({ ...purchase, currentInstallment: currentInst, totalInstallments: totalInst })
  }

  // 2. Propaga para os meses seguintes (k = 1 até remaining)
  for (let k = 1; k <= remaining; k++) {
    const { year: targetY, monthIndex: targetM } = addMonths(startYear, startMonthIndex, k)
    const targetKey = `${targetY}-${targetM}`
    const targetMonth = ensureMonthExists(monthsState, targetY, targetM)
    if (!targetMonth[cardKey]) targetMonth[cardKey] = []

    const futureItem = {
      id: generateId(),
      purchaseId: purchaseId,
      description: purchase.description,
      amount: purchase.amount,
      currentInstallment: currentInst + k,
      totalInstallments: totalInst,
      card: purchase.card
    }

    const idx = targetMonth[cardKey].findIndex(e => e.purchaseId === purchaseId)
    if (idx >= 0) {
      targetMonth[cardKey][idx] = futureItem
    } else {
      targetMonth[cardKey].push(futureItem)
    }
  }

  return monthsState
}

/**
 * Atualiza uma compra parcelada no mês atual e sincroniza em todos os meses futuros
 */
export function updateInstallmentAcrossMonths(monthsState, currentYear, currentMonthIndex, updatedPurchase, cardKey) {
  const purchaseId = updatedPurchase.purchaseId || updatedPurchase.id
  updatedPurchase.purchaseId = purchaseId

  const currentInst = parseInt(updatedPurchase.currentInstallment) || 1
  const totalInst = parseInt(updatedPurchase.totalInstallments) || 1

  // Atualiza mês atual
  const currentKey = `${currentYear}-${currentMonthIndex}`
  const curMonth = ensureMonthExists(monthsState, currentYear, currentMonthIndex)
  if (!curMonth[cardKey]) curMonth[cardKey] = []

  curMonth[cardKey] = curMonth[cardKey].map(item => {
    if ((item.purchaseId && item.purchaseId === purchaseId) || item.id === updatedPurchase.id) {
      return { ...item, ...updatedPurchase, currentInstallment: currentInst, totalInstallments: totalInst }
    }
    return item
  })

  // Percorre todos os outros meses cadastrados
  Object.keys(monthsState).forEach(key => {
    const m = monthsState[key]
    const diff = getMonthDiff(currentYear, currentMonthIndex, m.year, m.month)

    // Apenas meses futuros
    if (diff > 0 && m[cardKey]) {
      const calculatedInst = currentInst + diff
      if (calculatedInst <= totalInst) {
        // Atualiza ou insere se ainda está no prazo
        const idx = m[cardKey].findIndex(e => e.purchaseId === purchaseId)
        const updatedItem = {
          id: idx >= 0 ? m[cardKey][idx].id : generateId(),
          purchaseId: purchaseId,
          description: updatedPurchase.description,
          amount: updatedPurchase.amount,
          currentInstallment: calculatedInst,
          totalInstallments: totalInst,
          card: updatedPurchase.card
        }
        if (idx >= 0) {
          m[cardKey][idx] = updatedItem
        } else {
          m[cardKey].push(updatedItem)
        }
      } else {
        // Se a parcela calculada ultrapassou o total (ex: o usuário diminuiu as parcelas totais), remove!
        m[cardKey] = m[cardKey].filter(e => e.purchaseId !== purchaseId)
      }
    }
  })

  // Se o total de parcelas foi aumentado para além dos meses já existentes, cria os meses restantes
  const remaining = totalInst - currentInst
  for (let k = 1; k <= remaining; k++) {
    const { year: targetY, monthIndex: targetM } = addMonths(currentYear, currentMonthIndex, k)
    const targetKey = `${targetY}-${targetM}`
    const targetMonth = ensureMonthExists(monthsState, targetY, targetM)
    if (!targetMonth[cardKey]) targetMonth[cardKey] = []

    const idx = targetMonth[cardKey].findIndex(e => e.purchaseId === purchaseId)
    if (idx < 0) {
      targetMonth[cardKey].push({
        id: generateId(),
        purchaseId: purchaseId,
        description: updatedPurchase.description,
        amount: updatedPurchase.amount,
        currentInstallment: currentInst + k,
        totalInstallments: totalInst,
        card: updatedPurchase.card
      })
    }
  }

  return monthsState
}

/**
 * Exclui uma parcela do mês atual e, opcionalmente, de todos os meses futuros
 */
export function deleteInstallmentAcrossMonths(monthsState, currentYear, currentMonthIndex, purchaseId, cardKey, deleteFuture = true) {
  // 1. Remove do mês atual
  const currentKey = `${currentYear}-${currentMonthIndex}`
  if (monthsState[currentKey]?.[cardKey]) {
    monthsState[currentKey][cardKey] = monthsState[currentKey][cardKey].filter(
      e => (e.purchaseId !== purchaseId && e.id !== purchaseId)
    )
  }

  // 2. Remove dos meses futuros se deleteFuture for true
  if (deleteFuture) {
    Object.keys(monthsState).forEach(key => {
      const m = monthsState[key]
      const diff = getMonthDiff(currentYear, currentMonthIndex, m.year, m.month)
      if (diff > 0 && m[cardKey]) {
        m[cardKey] = m[cardKey].filter(e => (e.purchaseId !== purchaseId && e.id !== purchaseId))
      }
    })
  }

  return monthsState
}

/**
 * Propaga automaticamente todas as parcelas ativas de Agosto (ou de meses anteriores)
 * para os meses subsequentes do ano e início do próximo ano.
 */
export function syncAllInstallments(monthsState) {
  const sortedKeys = Object.keys(monthsState).sort((a, b) => {
    const [yA, mA] = a.split('-').map(Number)
    const [yB, mB] = b.split('-').map(Number)
    return yA !== yB ? yA - yB : mA - mB
  })

  // Varre os meses em ordem cronológica
  sortedKeys.forEach(key => {
    const monthObj = monthsState[key]
    const { year, month } = monthObj

    ;['creditCardSicrediExpenses', 'creditCardNubankExpenses'].forEach(cardKey => {
      if (Array.isArray(monthObj[cardKey])) {
        monthObj[cardKey].forEach(purchase => {
          if (!purchase.purchaseId) {
            purchase.purchaseId = purchase.id || generateId()
          }
          const cur = parseInt(purchase.currentInstallment) || 1
          const tot = parseInt(purchase.totalInstallments) || 1
          const remaining = tot - cur

          if (remaining > 0) {
            for (let k = 1; k <= remaining; k++) {
              const { year: nextY, monthIndex: nextM } = addMonths(year, month, k)
              const nextMonth = ensureMonthExists(monthsState, nextY, nextM)
              if (!nextMonth[cardKey]) nextMonth[cardKey] = []

              const exists = nextMonth[cardKey].some(e => e.purchaseId === purchase.purchaseId)
              if (!exists) {
                nextMonth[cardKey].push({
                  id: generateId(),
                  purchaseId: purchase.purchaseId,
                  description: purchase.description,
                  amount: purchase.amount,
                  currentInstallment: cur + k,
                  totalInstallments: tot,
                  card: purchase.card
                })
              }
            }
          }
        })
      }
    })
  })

  // Sincroniza também o Saldo Inicial Sombra sequencialmente
  for (let i = 0; i < sortedKeys.length - 1; i++) {
    const curKey = sortedKeys[i]
    const nextKey = sortedKeys[i + 1]
    const curM = monthsState[curKey]
    const nextM = monthsState[nextKey]

    const diff = getMonthDiff(curM.year, curM.month, nextM.year, nextM.month)
    if (diff === 1) {
      // É exatamente o mês seguinte: calcula o saldo final do curM e transporta
      const incomes = (curM.incomes || []).reduce((acc, x) => acc + (x.amount || 0), 0)
      const ccSic = (curM.creditCardSicrediExpenses || []).reduce((acc, x) => acc + (x.amount || 0), 0)
      const ccNub = (curM.creditCardNubankExpenses || []).reduce((acc, x) => acc + (x.amount || 0), 0)
      const rec = (curM.recurringExpenses || []).reduce((acc, x) => acc + (x.amount || 0), 0)
      const deb = (curM.debitExpenses || []).reduce((acc, x) => acc + (x.amount || 0), 0)
      const totalExp = ccSic + ccNub + rec + deb
      const finalBal = (curM.initialBalance || 0) + (incomes - totalExp)

      // Se o nextM não teve saldo inicial alterado manualmente, herda a sombra exata
      if (nextM.initialBalance === 0 || nextM.isShadowAuto !== false) {
        nextM.initialBalance = Number(finalBal.toFixed(2))
        nextM.isShadowAuto = true
      }
    }
  }

  return monthsState
}
