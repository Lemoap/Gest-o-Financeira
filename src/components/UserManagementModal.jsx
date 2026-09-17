import React, { useState, useEffect } from 'react'
import { 
  X, 
  Users, 
  UserCheck, 
  UserX, 
  Trash2, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  Search,
  Shield,
  Key,
  Edit2
} from 'lucide-react'
import { 
  getAllUsers, 
  approveUser, 
  toggleUserStatus, 
  deleteUser,
  setUserRole,
  adminResetPassword,
  adminUpdateUserName
} from '../utils/auth'

export function UserManagementModal({ isOpen, onClose, onUsersChanged }) {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState(null)

  const reloadUsers = async () => {
    const list = await getAllUsers()
    setUsers(list)
    if (onUsersChanged) onUsersChanged()
  }

  useEffect(() => {
    if (isOpen) {
      reloadUsers()
      setMessage(null)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleApprove = async (userId, name) => {
    await approveUser(userId)
    await reloadUsers()
    setMessage({ type: 'success', text: `O usuário ${name} foi aprovado com sucesso!` })
  }

  const handleToggle = async (userId, name, currentStatus) => {
    try {
      await toggleUserStatus(userId)
      await reloadUsers()
      const nextText = currentStatus === 'active' ? 'suspenso' : 'reativado'
      setMessage({ type: 'info', text: `O acesso de ${name} foi ${nextText}.` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  const handleRoleToggle = async (userId, name, currentRole) => {
    const targetRole = currentRole === 'admin' ? 'user' : 'admin'
    const roleName = targetRole === 'admin' ? 'Administrador' : 'Usuário Comum'
    
    if (confirm(`Deseja alterar o cargo de ${name} para ${roleName}?`)) {
      try {
        await setUserRole(userId, targetRole)
        await reloadUsers()
        setMessage({ type: 'success', text: `O cargo de ${name} agora é: ${roleName}.` })
      } catch (err) {
        setMessage({ type: 'error', text: err.message })
      }
    }
  }

  const handleResetPassword = async (userId, name) => {
    const newPass = prompt(`Digite a nova senha provisória para o usuário "${name}": (mínimo 4 caracteres)`)
    if (newPass !== null) {
      if (newPass.trim().length < 4) {
        alert('A senha deve ter no mínimo 4 caracteres.')
        return
      }
      try {
        await adminResetPassword(userId, newPass.trim())
        setMessage({ type: 'success', text: `Senha do usuário ${name} redefinida com sucesso para: "${newPass.trim()}".` })
      } catch (err) {
        setMessage({ type: 'error', text: err.message })
      }
    }
  }

  const handleEditName = async (userId, currentName) => {
    const newName = prompt('Novo nome para o usuário:', currentName)
    if (newName !== null && newName.trim()) {
      try {
        await adminUpdateUserName(userId, newName.trim())
        await reloadUsers()
        setMessage({ type: 'success', text: `Nome do usuário atualizado para: ${newName.trim()}` })
      } catch (err) {
        setMessage({ type: 'error', text: err.message })
      }
    }
  }

  const handleDelete = async (userId, name) => {
    if (confirm(`Tem certeza que deseja excluir o usuário ${name} e todos os seus dados? Esta ação não pode ser desfeita.`)) {
      try {
        await deleteUser(userId)
        await reloadUsers()
        setMessage({ type: 'success', text: `Usuário ${name} excluído.` })
      } catch (err) {
        setMessage({ type: 'error', text: err.message })
      }
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const pendingCount = users.filter(u => u.status === 'pending').length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  Gerenciamento de Usuários & Permissões
                </h2>
                {pendingCount > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 animate-pulse">
                    {pendingCount} {pendingCount === 1 ? 'pendente' : 'pendentes'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Aprovação, concessão de acesso de administrador, redefinição de senhas e edição
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
        {message && (
          <div className={`mx-6 mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200' 
              : message.type === 'error'
              ? 'bg-rose-50 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-200'
              : 'bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-200'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Barra de Busca */}
        <div className="px-6 pt-4 pb-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou usuário..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Lista de Usuários */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">
              Nenhum usuário encontrado.
            </div>
          ) : (
            filteredUsers.map(user => {
              const isPrimaryAdmin = user.username === 'admin'
              const isAdmin = user.role === 'admin'
              const isPending = user.status === 'pending'
              const isActive = user.status === 'active'

              return (
                <div 
                  key={user.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-3 ${
                    isPending 
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50' 
                      : 'bg-white dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isPending
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                        : isAdmin
                        ? 'bg-amber-600 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}>
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                          {user.name}
                        </span>
                        
                        {/* Tag de Role */}
                        {isAdmin ? (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {isPrimaryAdmin ? 'Admin Principal' : 'Administrador'}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                            Usuário
                          </span>
                        )}

                        <button 
                          onClick={() => handleEditName(user.id, user.name)}
                          title="Editar nome"
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                        <span className="font-mono">@{user.username}</span>
                        <span>•</span>
                        <span>
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                              <Clock className="w-3 h-3" /> Pendente de Aprovação
                            </span>
                          ) : isActive ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" /> Acesso Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                              <UserX className="w-3 h-3" /> Acesso Bloqueado
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Ações Administrativas */}
                  <div className="flex flex-wrap items-center gap-1.5 self-end lg:self-center">
                    
                    {/* Botão de Aprovação (se pendente) */}
                    {isPending && (
                      <button
                        onClick={() => handleApprove(user.id, user.name)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Aprovar</span>
                      </button>
                    )}

                    {/* Conceder / Revogar cargo de Administrador */}
                    {!isPrimaryAdmin && (
                      <button
                        onClick={() => handleRoleToggle(user.id, user.name, user.role)}
                        title={isAdmin ? "Rebaixar para usuário comum" : "Conceder privilégios de Administrador"}
                        className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-colors flex items-center gap-1.5 ${
                          isAdmin 
                            ? 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100' 
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-600" />
                        <span>{isAdmin ? 'Remover Admin' : 'Tornar Admin'}</span>
                      </button>
                    )}

                    {/* Redefinir Senha do Usuário pelo Administrador */}
                    <button
                      onClick={() => handleResetPassword(user.id, user.name)}
                      title="Definir nova senha para este usuário"
                      className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                    >
                      <Key className="w-3.5 h-3.5 text-blue-600" />
                      <span>Trocar Senha</span>
                    </button>

                    {/* Suspender / Reativar */}
                    {!isPrimaryAdmin && !isPending && (
                      <button
                        onClick={() => handleToggle(user.id, user.name, user.status)}
                        className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                          isActive 
                            ? 'bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-rose-950/60 dark:hover:text-rose-300' 
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                      >
                        {isActive ? 'Suspender' : 'Reativar'}
                      </button>
                    )}

                    {/* Excluir Usuário */}
                    {!isPrimaryAdmin && (
                      <button
                        onClick={() => handleDelete(user.id, user.name)}
                        title="Excluir usuário e dados"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Total cadastrado: {users.length} usuários</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  )
}
