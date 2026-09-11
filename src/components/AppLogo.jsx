import React from 'react'
import { 
  Wallet, 
  PiggyBank, 
  Sprout, 
  Building2, 
  Coins, 
  TrendingUp, 
  Shield 
} from 'lucide-react'

export const AVAILABLE_ICONS = [
  { id: 'Wallet', label: 'Carteira', icon: Wallet },
  { id: 'PiggyBank', label: 'Cofre', icon: PiggyBank },
  { id: 'Sprout', label: 'Agro / Fazenda', icon: Sprout },
  { id: 'Building2', label: 'Empresa', icon: Building2 },
  { id: 'Coins', label: 'Moedas', icon: Coins },
  { id: 'TrendingUp', label: 'Crescimento', icon: TrendingUp },
  { id: 'Shield', label: 'Segurança', icon: Shield },
]

export function AppLogo({ settings, className = "h-10 w-10", iconSize = "w-5 h-5" }) {
  if (settings?.logoType === 'image' && settings?.logoImage) {
    return (
      <div className={`${className} rounded-xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-md bg-white dark:bg-slate-800 flex items-center justify-center shrink-0`}>
        <img 
          src={settings.logoImage} 
          alt={settings.appName || 'Logo'} 
          className="h-full w-full object-contain p-1"
        />
      </div>
    )
  }

  // Se for ícone
  const iconId = settings?.logoIcon || 'Wallet'
  const matched = AVAILABLE_ICONS.find(item => item.id === iconId) || AVAILABLE_ICONS[0]
  const IconComponent = matched.icon

  return (
    <div className={`${className} rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0`}>
      <IconComponent className={iconSize} />
    </div>
  )
}
