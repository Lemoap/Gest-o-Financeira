import React, { useState } from 'react'
import { 
  X, 
  Palette, 
  Upload, 
  RotateCcw, 
  CheckCircle2, 
  Image as ImageIcon, 
  Sparkles,
  Layers,
  FileText,
  Eye
} from 'lucide-react'
import { AppLogo, AVAILABLE_ICONS } from './AppLogo'
import { defaultAppSettings } from '../utils/appSettings'

export function AppSettingsModal({ isOpen, onClose, settings, onSave, onReset }) {
  const [appName, setAppName] = useState(settings?.appName || defaultAppSettings.appName)
  const [appBadge, setAppBadge] = useState(settings?.appBadge || defaultAppSettings.appBadge)
  const [appSubtitle, setAppSubtitle] = useState(settings?.appSubtitle || defaultAppSettings.appSubtitle)
  const [bannerTitle, setBannerTitle] = useState(settings?.bannerTitle || defaultAppSettings.bannerTitle)
  const [bannerDescription, setBannerDescription] = useState(settings?.bannerDescription || defaultAppSettings.bannerDescription)
  const [logoType, setLogoType] = useState(settings?.logoType || 'icon')
  const [logoIcon, setLogoIcon] = useState(settings?.logoIcon || 'Wallet')
  const [logoImage, setLogoImage] = useState(settings?.logoImage || null)

  const [feedback, setFeedback] = useState(null)

  if (!isOpen) return null

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      setLogoImage(event.target.result)
      setLogoType('image')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setLogoImage(null)
    setLogoType('icon')
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    const updated = {
      appName: appName.trim() || 'FinControl',
      appBadge: appBadge.trim() || '',
      appSubtitle: appSubtitle.trim() || '',
      bannerTitle: bannerTitle.trim() || 'Painel Financeiro',
      bannerDescription: bannerDescription.trim() || '',
      logoType,
      logoIcon,
      logoImage
    }

    onSave(updated)
    setFeedback({ type: 'success', text: 'Identidade e configurações do aplicativo atualizadas com sucesso!' })
    setTimeout(() => {
      onClose()
    }, 1100)
  }

  const handleResetDefaults = () => {
    if (confirm('Deseja restaurar o nome, descrições e logotipo originais do sistema?')) {
      onReset()
      setAppName(defaultAppSettings.appName)
      setAppBadge(defaultAppSettings.appBadge)
      setAppSubtitle(defaultAppSettings.appSubtitle)
      setBannerTitle(defaultAppSettings.bannerTitle)
      setBannerDescription(defaultAppSettings.bannerDescription)
      setLogoType('icon')
      setLogoIcon('Wallet')
      setLogoImage(null)
      setFeedback({ type: 'info', text: 'Configurações restauradas para os padrões originais.' })
    }
  }

  // Objeto temporário para o preview
  const previewSettings = {
    appName,
    appBadge,
    appSubtitle,
    logoType,
    logoIcon,
    logoImage
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Cabeçalho */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
              <Palette className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Personalizar Aplicativo (Branding)
              </h2>
              <p className="text-xs text-slate-400">
                Exclusivo para Administradores: altere nome, descrições e logotipo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mx-6 mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200' 
              : 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback.text}</span>
          </div>
        )}

        {/* Formulário com Scroll */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Caixa de Pré-visualização Ao Vivo */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5">
              <Eye className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pré-visualização do Cabeçalho</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-sm">
              <AppLogo settings={previewSettings} className="h-10 w-10" iconSize="w-5 h-5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
                    {appName || 'Nome do App'}
                  </span>
                  {appBadge && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                      {appBadge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {appSubtitle || 'Subtítulo da aplicação'}
                </p>
              </div>
            </div>
          </div>

          {/* 1. Logotipo do App */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Logotipo do Aplicativo
            </label>

            {/* Alternador Imagem vs Ícone */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-3 border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setLogoType('icon')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  logoType === 'icon' 
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Galeria de Ícones
              </button>
              <button
                type="button"
                onClick={() => setLogoType('image')}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  logoType === 'image' 
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                Upload de Imagem Própria
              </button>
            </div>

            {/* Opção A: Galeria de Ícones */}
            {logoType === 'icon' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AVAILABLE_ICONS.map(item => {
                  const isSelected = logoIcon === item.id
                  const IconComp = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLogoIcon(item.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                        isSelected 
                          ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20' 
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Opção B: Upload de Imagem */}
            {logoType === 'image' && (
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center space-y-3">
                {logoImage ? (
                  <div className="flex flex-col items-center gap-2">
                    <img 
                      src={logoImage} 
                      alt="Logo carregada" 
                      className="h-16 w-auto max-w-[200px] object-contain rounded-lg border border-slate-200 dark:border-slate-700 p-1 bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors">
                        Substituir Imagem
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleImageUpload} 
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 text-xs font-semibold text-rose-600 transition-colors"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block py-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                      Clique para selecionar a imagem da logo
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Recomendado: PNG ou SVG com fundo transparente (até 2MB)
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageUpload} 
                    />
                  </label>
                )}
              </div>
            )}
          </div>

          {/* 2. Textos do Cabeçalho e Marca */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Nomes e Identificadores do Sistema
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Nome do Aplicativo
                </label>
                <input
                  type="text"
                  placeholder="Ex: FinControl, Gestão Fazenda..."
                  value={appName}
                  onChange={e => setAppName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Badge de Destaque
                </label>
                <input
                  type="text"
                  placeholder="Ex: Planilha Pro, Corporativo, etc."
                  value={appBadge}
                  onChange={e => setAppBadge(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Subtítulo do Cabeçalho
              </label>
              <input
                type="text"
                placeholder="Ex: Gestão de Fluxo de Caixa & Despesas"
                value={appSubtitle}
                onChange={e => setAppSubtitle(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 3. Textos do Banner da Página Principal */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Banner Principal da Tela
            </label>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Título do Banner
              </label>
              <input
                type="text"
                placeholder="Ex: Painel Financeiro & Fluxo de Caixa"
                value={bannerTitle}
                onChange={e => setBannerTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Descrição do Banner
              </label>
              <textarea
                rows={2}
                placeholder="Texto explicativo exibido no cartão verde superior..."
                value={bannerDescription}
                onChange={e => setBannerDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Ações do Formulário */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Padrões</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
