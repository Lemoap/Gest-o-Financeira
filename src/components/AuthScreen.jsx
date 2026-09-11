import React, { useState } from 'react'
import { 
  Lock, 
  User, 
  UserPlus, 
  LogIn, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Clock,
  KeyRound,
  FileSpreadsheet,
  ArrowLeft
} from 'lucide-react'
import { loginUser, registerUser, recoverPassword } from '../utils/auth'
import { AppLogo } from './AppLogo'

export function AuthScreen({ onLoginSuccess, appSettings }) {
  const [tab, setTab] = useState('login') // 'login' | 'register' | 'recover'
  
  // Login form
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPassword, setShowLoginPassword] = useState(false)

  // Register form
  const [regName, setRegName] = useState('')
  const [regUsername, setRegUsername] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regConfirm, setRegConfirm] = useState('')
  const [regRecoveryKey, setRegRecoveryKey] = useState('')
  const [regCopyTemplate, setRegCopyTemplate] = useState(false)
  const [showRegPassword, setShowRegPassword] = useState(false)

  // Recovery form
  const [recUsername, setRecUsername] = useState('')
  const [recKey, setRecKey] = useState('')
  const [recNewPassword, setRecNewPassword] = useState('')
  const [recConfirmPassword, setRecConfirmPassword] = useState('')
  const [showRecPassword, setShowRecPassword] = useState(false)

  // Feedback states
  const [error, setError] = useState('')
  const [successInfo, setSuccessInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessInfo('')
    setLoading(true)

    try {
      const user = await loginUser({
        username: loginUsername,
        password: loginPassword
      })
      onLoginSuccess(user)
    } catch (err) {
      setError(err.message || 'Erro ao realizar login.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessInfo('')

    if (regPassword !== regConfirm) {
      setError('As senhas digitadas não coincidem.')
      return
    }

    setLoading(true)
    try {
      const res = await registerUser({
        name: regName,
        username: regUsername,
        password: regPassword,
        recoveryKey: regRecoveryKey,
        copyTemplate: regCopyTemplate
      })

      if (res.pendingApproval) {
        setSuccessInfo(
          `Conta de "${regName}" criada com sucesso! Por segurança, novos usuários necessitam de aprovação do Administrador antes do primeiro acesso.`
        )
        setLoginUsername(regUsername)
        setLoginPassword('')
        setRegName('')
        setRegUsername('')
        setRegPassword('')
        setRegConfirm('')
        setRegRecoveryKey('')
        setTab('login')
      } else {
        onLoginSuccess(res)
      }
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar usuário.')
    } finally {
      setLoading(false)
    }
  }

  const handleRecoverySubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessInfo('')

    if (recNewPassword !== recConfirmPassword) {
      setError('A nova senha e a confirmação não coincidem.')
      return
    }

    setLoading(true)
    try {
      await recoverPassword({
        username: recUsername,
        recoveryKey: recKey,
        newPassword: recNewPassword
      })

      setSuccessInfo('Senha redefinida com sucesso! Você já pode entrar com a sua nova senha.')
      setLoginUsername(recUsername)
      setLoginPassword(recNewPassword)
      setRecUsername('')
      setRecKey('')
      setRecNewPassword('')
      setRecConfirmPassword('')
      setTab('login')
    } catch (err) {
      setError(err.message || 'Erro na recuperação de senha.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemoAccount = () => {
    setLoginUsername('admin')
    setLoginPassword('123456')
    setError('')
    setSuccessInfo('')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-white">
      
      {/* Elementos de fundo decorativos */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-black/40 overflow-hidden relative z-10 transition-all">
        
        {/* Cabeçalho do Card com Logo Customizada */}
        <div className="p-8 pb-6 text-center border-b border-slate-100 dark:border-slate-800">
          <div className="flex justify-center mb-4">
            <AppLogo settings={appSettings} className="w-14 h-14" iconSize="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {appSettings?.appName || 'FinControl'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {appSettings?.appSubtitle || 'Gestão Financeira Pessoal com Controle de Acesso'}
          </p>

          {/* Abas Alternadoras */}
          {tab !== 'recover' ? (
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mt-6 border border-slate-200/60 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); setSuccessInfo('') }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'login'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>

              <button
                type="button"
                onClick={() => { setTab('register'); setError(''); setSuccessInfo('') }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'register'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Criar Conta</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-6 px-1">
              <button
                type="button"
                onClick={() => { setTab('login'); setError(''); setSuccessInfo('') }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao Login</span>
              </button>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" />
                Recuperação de Senha
              </span>
            </div>
          )}
        </div>

        {/* Mensagem de Sucesso / Aviso */}
        {successInfo && (
          <div className="mx-8 mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span>{successInfo}</span>
          </div>
        )}

        {/* Mensagem de Erro */}
        {error && (
          <div className="mx-8 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Formulário: LOGIN */}
        {tab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-8 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Usuário ou E-mail
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Ex: admin ou seu_usuario"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => { setTab('recover'); setError(''); setSuccessInfo(''); setRecUsername(loginUsername) }}
                  className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full text-sm pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Entrando...' : 'Acessar Meu Painel'}</span>
            </button>

            {/* Caixa Informativa com Dados da Planilha */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <p className="font-semibold">Perfil Administrador:</p>
                    <p className="text-[11px] text-slate-400">Usuário: <code className="text-emerald-600 font-mono">admin</code> | Senha: <code className="text-emerald-600 font-mono">123456</code></p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={fillDemoAccount}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
                >
                  Preencher
                </button>
              </div>
            </div>
          </form>
        )}

        {/* 2. Formulário: CADASTRO */}
        {tab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-8 space-y-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>Novos cadastros passam por aprovação prévia de um Administrador.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                placeholder="Ex: João da Silva"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome de Usuário (Login)
              </label>
              <input
                type="text"
                placeholder="Ex: joao"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Senha
                </label>
                <input
                  type={showRegPassword ? "text" : "password"}
                  placeholder="Mínimo 4 dígitos"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Senha
                </label>
                <input
                  type={showRegPassword ? "text" : "password"}
                  placeholder="Repita a senha"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Palavra-chave de Recuperação de Senha
              </label>
              <input
                type="text"
                placeholder="Ex: nome de pet, cidade natal ou palavra secreta"
                value={regRecoveryKey}
                onChange={(e) => setRegRecoveryKey(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Usada para redefinir sua senha caso você a esqueça.
              </span>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={regCopyTemplate}
                  onChange={(e) => setRegCopyTemplate(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 rounded border-slate-300 dark:border-slate-700"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  Carregar modelo da planilha após a aprovação
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 mt-3"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Enviando...' : 'Solicitar Acesso'}</span>
            </button>
          </form>
        )}

        {/* 3. Formulário: RECUPERAÇÃO DE SENHA */}
        {tab === 'recover' && (
          <form onSubmit={handleRecoverySubmit} className="p-8 space-y-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 flex items-center gap-2 text-[11px] text-amber-800 dark:text-amber-300">
              <KeyRound className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Informe seu usuário e sua palavra-chave cadastrada para criar uma nova senha.</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nome de Usuário
              </label>
              <input
                type="text"
                placeholder="Ex: admin ou seu_usuario"
                value={recUsername}
                onChange={(e) => setRecUsername(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Palavra-chave de Recuperação
              </label>
              <input
                type="text"
                placeholder="Sua palavra-chave secreta"
                value={recKey}
                onChange={(e) => setRecKey(e.target.value)}
                className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">
                (Dica da conta admin: <code className="text-amber-600 font-mono">admin123</code>)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nova Senha
                </label>
                <input
                  type={showRecPassword ? "text" : "password"}
                  placeholder="Mínimo 4 dígitos"
                  value={recNewPassword}
                  onChange={(e) => setRecNewPassword(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar Nova
                </label>
                <input
                  type={showRecPassword ? "text" : "password"}
                  placeholder="Repita a senha"
                  value={recConfirmPassword}
                  onChange={(e) => setRecConfirmPassword(e.target.value)}
                  className="w-full text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-600/25 transition-all flex items-center justify-center gap-2 mt-3"
            >
              <KeyRound className="w-4 h-4" />
              <span>{loading ? 'Redefinindo...' : 'Redefinir Senha'}</span>
            </button>
          </form>
        )}

        {/* Rodapé de Segurança */}
        <div className="px-8 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Isolamento total: seus dados financeiros são privados e protegidos por criptografia.</span>
        </div>

      </div>
    </div>
  )
}
