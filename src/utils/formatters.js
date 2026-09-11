/**
 * Formata um número para moeda Real Brasileiro (R$)
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return 'R$ 0,00'
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/**
 * Converte string digitada pelo usuário ou valor float em número limpo
 */
export function parseCurrencyInput(value) {
  if (typeof value === 'number') return isNaN(value) ? 0 : value
  if (!value) return 0
  
  // Limpa caracteres que não sejam dígitos, vírgula ou ponto
  const cleaned = value.toString().replace(/[^\d.,-]/g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Retorna o nome do mês em português
 */
export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

/**
 * Gera um ID único simples para novos registros
 */
export function generateId() {
  return 'id_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
}
