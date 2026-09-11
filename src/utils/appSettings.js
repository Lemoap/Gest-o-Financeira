const APP_SETTINGS_STORAGE_KEY = 'fincontrol_app_settings_v1'

export const defaultAppSettings = {
  appName: 'FinControl',
  appBadge: 'Planilha Pro',
  appSubtitle: 'Gestão de Fluxo de Caixa',
  bannerTitle: 'Painel Financeiro & Fluxo de Caixa',
  bannerDescription: 'Controle individualizado com cartões separados (Sicredi e Nubank), despesas fixas recorrentes, saídas em débito e saldo sombra.',
  logoType: 'icon', // 'icon' | 'image'
  logoIcon: 'Wallet', // 'Wallet' | 'PiggyBank' | 'Sprout' | 'Building2' | 'Coins' | 'TrendingUp' | 'Shield'
  logoImage: null // Base64 data URL
}

/**
 * Lê as configurações da marca do aplicativo salvas no navegador
 */
export function getAppSettings() {
  try {
    const raw = localStorage.getItem(APP_SETTINGS_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...defaultAppSettings, ...parsed }
    }
  } catch (err) {
    console.error('Erro ao ler configurações do app', err)
  }
  return { ...defaultAppSettings }
}

/**
 * Salva as configurações da marca do aplicativo
 */
export function saveAppSettings(settings) {
  try {
    localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  } catch (err) {
    console.error('Erro ao salvar configurações do app', err)
  }
}

/**
 * Restaura as configurações originais padrão
 */
export function resetAppSettings() {
  localStorage.removeItem(APP_SETTINGS_STORAGE_KEY)
  return { ...defaultAppSettings }
}
