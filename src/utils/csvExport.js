import { MONTH_NAMES } from './formatters'

/**
 * Escapa um valor para CSV (trata vírgulas, aspas e quebras de linha)
 */
function escapeCsvValue(value) {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"'
  }
  return str
}

/**
 * Formata um valor numérico para o padrão brasileiro (vírgula decimal)
 */
function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) return '0,00'
  return value.toFixed(2).replace('.', ',')
}

/**
 * Gera uma linha CSV a partir de um array de valores
 */
function toCsvRow(values) {
  return values.map(escapeCsvValue).join(';')
}

/**
 * Exporta TODOS os dados financeiros de todos os meses em um único CSV.
 * 
 * Estrutura do CSV:
 * - Uma linha por lançamento (entrada, saída CC, recorrente, débito)
 * - Colunas: Ano, Mês, Tipo, Categoria, Descrição, Valor, Data/Vencimento, Parcela, Status, Cartão
 * 
 * @param {Object} data - Objeto raiz com { months: { "2026-7": { ... }, ... } }
 * @param {string} [appName] - Nome do app para o nome do arquivo
 * @param {string} [username] - Nome do usuário para o nome do arquivo
 */
export function exportAllDataToCsv(data, appName = 'FinControl', username = 'user') {
  if (!data?.months) {
    alert('Não há dados para exportar.')
    return
  }

  const headers = [
    'Ano',
    'Mês',
    'Tipo',
    'Categoria',
    'Descrição',
    'Valor (R$)',
    'Data / Vencimento',
    'Parcela',
    'Status',
    'Cartão',
    'Saldo Inicial',
    'Saldo Estimado'
  ]

  const rows = [toCsvRow(headers)]

  // Ordena as chaves dos meses cronologicamente
  const sortedMonthKeys = Object.keys(data.months).sort((a, b) => {
    const [yA, mA] = a.split('-').map(Number)
    const [yB, mB] = b.split('-').map(Number)
    return yA !== yB ? yA - yB : mA - mB
  })

  for (const monthKey of sortedMonthKeys) {
    const monthData = data.months[monthKey]
    const year = monthData.year ?? monthKey.split('-')[0]
    const monthIdx = monthData.month ?? monthKey.split('-')[1]
    const monthName = MONTH_NAMES[monthIdx] || `Mês ${monthIdx}`

    // --- Entradas (Receitas) ---
    const incomes = monthData.incomes || []
    for (const item of incomes) {
      rows.push(toCsvRow([
        year,
        monthName,
        'Receita',
        item.category || '',
        item.description || '',
        formatNumber(item.amount),
        item.date || '',
        '',
        item.received ? 'Recebido' : 'Pendente',
        '',
        '',
        ''
      ]))
    }

    // --- Cartão de Crédito Sicredi ---
    const ccSicredi = monthData.creditCardSicrediExpenses || []
    for (const item of ccSicredi) {
      rows.push(toCsvRow([
        year,
        monthName,
        'Cartão de Crédito',
        'Parcela CC',
        item.description || '',
        formatNumber(item.amount),
        '',
        item.currentInstallment && item.totalInstallments
          ? `${item.currentInstallment}/${item.totalInstallments}`
          : '',
        '',
        item.card || 'Sicredi',
        '',
        ''
      ]))
    }

    // --- Cartão de Crédito Nubank ---
    const ccNubank = monthData.creditCardNubankExpenses || []
    for (const item of ccNubank) {
      rows.push(toCsvRow([
        year,
        monthName,
        'Cartão de Crédito',
        'Parcela CC',
        item.description || '',
        formatNumber(item.amount),
        '',
        item.currentInstallment && item.totalInstallments
          ? `${item.currentInstallment}/${item.totalInstallments}`
          : '',
        '',
        item.card || 'Nubank',
        '',
        ''
      ]))
    }

    // --- Despesas Recorrentes ---
    const recurring = monthData.recurringExpenses || []
    for (const item of recurring) {
      rows.push(toCsvRow([
        year,
        monthName,
        'Despesa Fixa',
        'Recorrente',
        item.description || '',
        formatNumber(item.amount),
        item.dueDay ? `Dia ${item.dueDay}` : '',
        '',
        item.paid ? 'Pago' : 'Pendente',
        '',
        '',
        ''
      ]))
    }

    // --- Despesas em Débito / À Vista ---
    const debits = monthData.debitExpenses || []
    for (const item of debits) {
      rows.push(toCsvRow([
        year,
        monthName,
        'Despesa Débito',
        item.category || 'Débito',
        item.description || '',
        formatNumber(item.amount),
        item.date || '',
        '',
        '',
        '',
        '',
        ''
      ]))
    }

    // Linha resumo do mês (saldo inicial e estimado)
    rows.push(toCsvRow([
      year,
      monthName,
      '--- RESUMO DO MÊS ---',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      formatNumber(monthData.initialBalance || 0),
      formatNumber(monthData.estimateBalance || 0)
    ]))
  }

  // Monta o CSV com BOM UTF-8 para Excel abrir corretamente com acentos
  const BOM = '\uFEFF'
  const csvContent = BOM + rows.join('\r\n')

  // Cria e dispara o download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const safeName = (appName || 'fincontrol').toLowerCase().replace(/\s+/g, '-')
  const safeUser = (username || 'user').toLowerCase().replace(/\s+/g, '-')
  const dateStr = new Date().toISOString().slice(0, 10)

  link.setAttribute('href', url)
  link.setAttribute('download', `${safeName}-${safeUser}-export-${dateStr}.csv`)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
