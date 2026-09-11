import React, { useState } from 'react'
import { 
  X, 
  User, 
  Lock, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react'
import { updateProfile } from '../utils/auth'

export function ProfileModal({ isOpen, onClose, currentUser, onProfileUpdated }) {
  const [name, setName] = useState(currentUser?.name || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [recoveryKey, setRecoveryKey] = useState('')
  const [showPasswords, setShowPasswords] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!isOpen) return null

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword && newPassword !== confirmPassword) {
      setError('A nova senha e a confirmação não coincidem.')
      return
    }

    setLoading(true)
    try {
      const updatedUser = await updateProfile(currentUser.id, {
        name,
        currentPassword,
        newPassword,
        recoveryKey
      })

      setSuccess('Perfil atualizado com sucesso!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setRecoveryKey('')
      if (onProfileUpdated) onProfileUpdated(updatedUser)
      
      setTimeout(() => {
        onClose()
      }, 1200)
    } catch (err) {
      setError(err.message || 'Erro ao atualizar perfil.')
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = currentUser?.role === 'admin' || currentUser?.username === 'admin'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl text-white ${isAdmin ? 'bg-amber-600' : 'bg-emerald-600'}`}>
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Editar Meu Perfil
                </h2>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isAdmin 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}>
                  {isAdmin ? 'Administrador' : 'Usuário'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Altere seus dados cadastrais, senha e chave de recuperação
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

        {/* Mensagens de Alerta */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* Nome e Login */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome de Usuário (Login)
            </label>
            <input
              type="text"
              value={`@${currentUser?.username}`}
              disabled
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-500 cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nome Completo
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Troca de Senha */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Alterar Senha (Opcional)
              </span>
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1"
              >
                {showPasswords ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showPasswords ? 'Ocultar' : 'Exibir'}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                  Senha Atual (obrigatória se for alterar a senha)
                </label>
                <input
                  type={showPasswords ? "text" : "password"}
                  placeholder="••••••"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                    Nova Senha
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    placeholder="Mínimo 4 dígitos"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                    Confirmar Nova Senha
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    placeholder="Repita a senha"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Palavra-chave de Recuperação */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mb-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Palavra-chave de Recuperação de Senha
            </span>
            <p className="text-[11px] text-slate-400 mb-2">
              Esta palavra-chave secreta permite redefinir sua senha na tela de login caso você a esqueça.
            </p>
            <input
              type="text"
              placeholder="Ex: nome do primeiro pet ou frase secreta..."
              value={recoveryKey}
              onChange={e => setRecoveryKey(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Salvando...' : 'Salvar Alterações do Perfil'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
