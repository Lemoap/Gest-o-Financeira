import React from 'react'
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  RotateCcw,
  LogOut,
  Users,
  Palette,
  Settings,
  FileSpreadsheet
} from 'lucide-react'
import { MONTH_NAMES } from '../utils/formatters'
import { AppLogo } from './AppLogo'

export function Navbar({ 
  currentUser,
  appSettings,
  onLogout,
  onOpenUserManagement,
  onOpenProfile,
  onOpenAppSettings,
  pendingUsersCount = 0,
  currentMonth, 
  currentYear, 
  onMonthChange, 
  onYearChange, 
  darkMode, 
  onToggleDarkMode,
  onExportData,
  onImportData,
  onResetData,
  onExportCsv
}) {
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      onMonthChange(11)
      onYearChange(currentYear - 1)
    } else {
      onMonthChange(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      onMonthChange(0)
      onYearChange(currentYear + 1)
    } else {
      onMonthChange(currentMonth + 1)
    }
  }

  const isAdmin = currentUser?.role === 'admin' || currentUser?.username === 'admin'

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo Customizada & Título do App */}
          <div className="flex items-center gap-3 shrink-0">
            <AppLogo settings={appSettings} className="h-10 w-10" iconSize="w-5 h-5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  {appSettings?.appName || 'FinControl'}
                </span>
                {appSettings?.appBadge && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 hidden xs:inline-block">
                    {appSettings.appBadge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                {appSettings?.appSubtitle || 'Gestão de Fluxo de Caixa'}
              </p>
            </div>
          </div>

          {/* Seletor de Mês & Ano Central */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 shadow-inner">
            <button 
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400 hidden xs:block" />
              <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 min-w-[70px] sm:min-w-[85px] text-center">
                {MONTH_NAMES[currentMonth]}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {currentYear}
              </span>
            </div>

            <button 
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:shadow-sm transition-all"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Botões de Ação, Painel de Admin, Usuário & Modo Noturno */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Botões Exclusivos do Administrador */}
            {isAdmin && (
              <div className="flex items-center gap-1">
                {/* Personalizar App (Branding & Logo) */}
                <button
                  onClick={onOpenAppSettings}
                  title="Personalizar Nome, Descrições e Logo do Aplicativo"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-900 dark:bg-purple-950/60 dark:hover:bg-purple-900/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 transition-colors text-xs font-semibold"
                >
                  <Palette className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="hidden lg:inline">Personalizar App</span>
                </button>

                {/* Gestão de Usuários */}
                <button
                  onClick={onOpenUserManagement}
                  title="Painel de Aprovações & Gestão de Usuários"
                  className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition-colors text-xs font-semibold"
                >
                  <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="hidden md:inline">Usuários</span>
                  
                  {pendingUsersCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white font-black text-[10px] animate-pulse">
                      {pendingUsersCount}
                    </span>
                  )}
                </button>
              </div>
            )}

            {/* Backup & Ações */}
            <div className="hidden sm:flex items-center gap-1">
              <label 
                title="Importar Backup (JSON)"
                className="cursor-pointer p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={onImportData} 
                />
              </label>

              <button 
                onClick={onExportData}
                title="Exportar Dados (Backup JSON)"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>

              <button 
                onClick={onExportCsv}
                title="Exportar Todos os Dados em CSV (Planilha)"
                className="p-2 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              >
                <FileSpreadsheet className="w-4 h-4" />
              </button>

              <button 
                onClick={onResetData}
                title="Restaurar dados padrão"
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Tema Claro/Escuro */}
            <button 
              onClick={onToggleDarkMode}
              title={darkMode ? "Ativar Modo Claro" : "Ativar Modo Escuro"}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 my-auto mx-1" />

            {/* Usuário Logado & Editar Perfil */}
            {currentUser && (
              <div className="flex items-center gap-1.5 pl-1">
                <button
                  onClick={onOpenProfile}
                  title="Clique para editar seu perfil e trocar senha"
                  className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all text-left group"
                >
                  <div className={`w-6 h-6 rounded-lg text-white flex items-center justify-center font-bold text-[11px] ${isAdmin ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden md:block">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate block leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                      {currentUser.name || currentUser.username}
                    </span>
                    {isAdmin && (
                      <span className="text-[9px] uppercase font-extrabold text-amber-600 dark:text-amber-400 block leading-tight">
                        Admin
                      </span>
                    )}
                  </div>
                  <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 hidden xs:block" />
                </button>

                <button
                  onClick={onLogout}
                  title="Sair da Conta (Logout)"
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  )
}
