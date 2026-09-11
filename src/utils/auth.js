import { initialFinancialData } from '../data/initialData'

const USERS_STORAGE_KEY = 'fincontrol_users_v1'
const SESSION_STORAGE_KEY = 'fincontrol_session_v1'
const USER_DATA_PREFIX = 'fincontrol_data_user_'

/**
 * Gera hash SHA-256 seguro da string usando a Crypto API nativa do navegador
 */
export async function hashPassword(text) {
  if (!text) return ''
  const encoder = new TextEncoder()
  const data = encoder.encode(text.trim())
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Retorna todos os usuários cadastrados
 */
export function getAllUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Erro ao ler usuários', e)
  }
  return []
}

/**
 * Salva a lista de usuários
 */
export function saveAllUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
}

/**
 * Inicializa a conta padrão 'admin' caso nenhuma conta exista ainda.
 */
export async function initAuth() {
  let users = getAllUsers()

  if (users.length === 0) {
    const adminHash = await hashPassword('123456')
    const adminRecoveryHash = await hashPassword('admin123')

    const defaultUser = {
      id: 'usr_admin',
      name: 'Administrador (Planilha)',
      username: 'admin',
      passwordHash: adminHash,
      recoveryKeyHash: adminRecoveryHash,
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString()
    }
    users = [defaultUser]
    saveAllUsers(users)

    // Se já existiam dados salvos nas chaves antigas, migra para este usuário
    let legacyData = null
    try {
      const v2 = localStorage.getItem('fincontrol_data_v2')
      const v1 = localStorage.getItem('fincontrol_data_v1')
      if (v2) legacyData = JSON.parse(v2)
      else if (v1) legacyData = JSON.parse(v1)
    } catch (err) {
      console.warn('Erro ao carregar dados antigos para migração', err)
    }

    const dataToSave = legacyData || initialFinancialData
    saveUserData(defaultUser.id, dataToSave)
  } else {
    // Garante compatibilidade retroativa com campos role, status e recoveryKey
    let updated = false
    for (const u of users) {
      if (!u.role) {
        u.role = u.username === 'admin' ? 'admin' : 'user'
        updated = true
      }
      if (!u.status) {
        u.status = 'active'
        updated = true
      }
      if (!u.recoveryKeyHash) {
        u.recoveryKeyHash = await hashPassword('admin123')
        updated = true
      }
    }
    if (updated) saveAllUsers(users)
  }

  // Verifica se já há uma sessão salva válida e ativa
  try {
    const sessionRaw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (sessionRaw) {
      const sessionUser = JSON.parse(sessionRaw)
      const found = users.find(u => u.id === sessionUser.id)
      if (found && found.status === 'active') {
        return {
          id: found.id,
          name: found.name,
          username: found.username,
          role: found.role,
          status: found.status
        }
      } else {
        clearSession()
      }
    }
  } catch (e) {
    console.error('Erro ao ler sessão', e)
  }

  return null
}

/**
 * Registra um novo usuário (sempre pending até aprovação do admin).
 */
export async function registerUser({ name, username, password, recoveryKey, copyTemplate = false }) {
  const cleanUsername = username.trim().toLowerCase()
  const cleanName = name.trim()

  if (!cleanName) throw new Error('O nome é obrigatório.')
  if (!cleanUsername) throw new Error('O nome de usuário é obrigatório.')
  if (!password || password.length < 4) throw new Error('A senha deve ter pelo menos 4 caracteres.')

  const users = getAllUsers()
  if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
    throw new Error('Este nome de usuário já está em uso. Escolha outro.')
  }

  const passwordHash = await hashPassword(password)
  const recoveryKeyHash = await hashPassword(recoveryKey && recoveryKey.trim() ? recoveryKey.trim() : '123456')

  const newUser = {
    id: 'usr_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
    name: cleanName,
    username: cleanUsername,
    passwordHash,
    recoveryKeyHash,
    role: 'user',
    status: 'pending', // Exige aprovação de administrador
    createdAt: new Date().toISOString()
  }

  users.push(newUser)
  saveAllUsers(users)

  // Inicializa base financeira isolada
  let initialUserFinancialData
  if (copyTemplate) {
    initialUserFinancialData = JSON.parse(JSON.stringify(initialFinancialData))
  } else {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const monthKey = `${currentYear}-${currentMonth}`

    initialUserFinancialData = {
      selectedYear: currentYear,
      selectedMonth: currentMonth,
      months: {
        [monthKey]: {
          id: monthKey,
          year: currentYear,
          month: currentMonth,
          name: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][currentMonth],
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
    }
  }

  saveUserData(newUser.id, initialUserFinancialData)

  return {
    pendingApproval: true,
    user: {
      id: newUser.id,
      name: newUser.name,
      username: newUser.username,
      status: newUser.status
    }
  }
}

/**
 * Autentica o usuário pelo login e senha
 */
export async function loginUser({ username, password }) {
  const cleanUsername = username.trim().toLowerCase()
  const users = getAllUsers()
  const user = users.find(u => u.username.toLowerCase() === cleanUsername)

  if (!user) {
    throw new Error('Usuário ou senha inválidos.')
  }

  const inputHash = await hashPassword(password)
  if (user.passwordHash !== inputHash) {
    throw new Error('Usuário ou senha inválidos.')
  }

  if (user.status === 'pending') {
    throw new Error('Sua conta foi cadastrada, mas está aguardando aprovação do Administrador antes do primeiro acesso.')
  }

  if (user.status === 'blocked') {
    throw new Error('Esta conta foi desativada ou suspensa pelo Administrador.')
  }

  const sessionObj = {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role || 'user',
    status: user.status || 'active'
  }
  setSession(sessionObj)
  return sessionObj
}

/**
 * Atualiza o perfil do próprio usuário
 */
export async function updateProfile(userId, { name, currentPassword, newPassword, recoveryKey }) {
  const users = getAllUsers()
  const user = users.find(u => u.id === userId)
  if (!user) throw new Error('Usuário não encontrado.')

  // Se for alterar a senha, valida a senha atual
  if (newPassword && newPassword.trim()) {
    if (!currentPassword) {
      throw new Error('Digite sua senha atual para confirmar a alteração de senha.')
    }
    const currentHash = await hashPassword(currentPassword)
    if (user.passwordHash !== currentHash) {
      throw new Error('Senha atual incorreta.')
    }
    if (newPassword.trim().length < 4) {
      throw new Error('A nova senha deve ter pelo menos 4 caracteres.')
    }
    user.passwordHash = await hashPassword(newPassword.trim())
  }

  // Altera o nome se fornecido
  if (name && name.trim()) {
    user.name = name.trim()
  }

  // Altera a chave de recuperação se fornecida
  if (recoveryKey && recoveryKey.trim()) {
    user.recoveryKeyHash = await hashPassword(recoveryKey.trim())
  }

  saveAllUsers(users)

  const sessionObj = {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role || 'user',
    status: user.status || 'active'
  }
  setSession(sessionObj)
  return sessionObj
}

/**
 * Concede ou revoga cargo de Administrador para um usuário
 */
export function setUserRole(userId, newRole) {
  const users = getAllUsers()
  const user = users.find(u => u.id === userId)
  if (!user) throw new Error('Usuário não encontrado.')

  if (user.username === 'admin' && newRole !== 'admin') {
    throw new Error('O Administrador principal não pode ser rebaixado.')
  }

  user.role = newRole === 'admin' ? 'admin' : 'user'
  saveAllUsers(users)
  return users
}

/**
 * Atualiza nome de usuário pelo administrador
 */
export function adminUpdateUserName(userId, newName) {
  const users = getAllUsers()
  const user = users.find(u => u.id === userId)
  if (!user) throw new Error('Usuário não encontrado.')

  user.name = newName.trim()
  saveAllUsers(users)
  return users
}

/**
 * O Administrador redefine a senha de um usuário diretamente
 */
export async function adminResetPassword(userId, newPassword) {
  if (!newPassword || newPassword.trim().length < 4) {
    throw new Error('A nova senha deve ter pelo menos 4 caracteres.')
  }

  const users = getAllUsers()
  const user = users.find(u => u.id === userId)
  if (!user) throw new Error('Usuário não encontrado.')

  user.passwordHash = await hashPassword(newPassword.trim())
  saveAllUsers(users)
  return true
}

/**
 * Recuperação de senha autônoma pelo usuário
 */
export async function recoverPassword({ username, recoveryKey, newPassword }) {
  const cleanUsername = username.trim().toLowerCase()
  if (!cleanUsername) throw new Error('Informe o nome de usuário.')
  if (!recoveryKey || !recoveryKey.trim()) throw new Error('Informe a palavra-chave de recuperação.')
  if (!newPassword || newPassword.trim().length < 4) throw new Error('A nova senha deve ter no mínimo 4 caracteres.')

  const users = getAllUsers()
  const user = users.find(u => u.username.toLowerCase() === cleanUsername)
  if (!user) {
    throw new Error('Usuário não localizado.')
  }

  const inputKeyHash = await hashPassword(recoveryKey.trim())
  if (user.recoveryKeyHash !== inputKeyHash) {
    throw new Error('Palavra-chave de recuperação incorreta. Contate um Administrador se não lembrar.')
  }

  user.passwordHash = await hashPassword(newPassword.trim())
  saveAllUsers(users)
  return true
}

/**
 * Aprova um usuário pendente
 */
export function approveUser(userId) {
  const users = getAllUsers()
  const updated = users.map(u => {
    if (u.id === userId) {
      return { ...u, status: 'active' }
    }
    return u
  })
  saveAllUsers(updated)
  return updated
}

/**
 * Alterna status do usuário (ativo / bloqueado)
 */
export function toggleUserStatus(userId) {
  const users = getAllUsers()
  const updated = users.map(u => {
    if (u.id === userId) {
      if (u.username === 'admin') throw new Error('Não é possível suspender o Administrador principal.')
      const nextStatus = u.status === 'active' ? 'blocked' : 'active'
      return { ...u, status: nextStatus }
    }
    return u
  })
  saveAllUsers(updated)
  return updated
}

/**
 * Exclui um usuário e seus dados financeiros
 */
export function deleteUser(userId) {
  const users = getAllUsers()
  const target = users.find(u => u.id === userId)
  if (target?.username === 'admin') {
    throw new Error('A conta do Administrador principal não pode ser excluída.')
  }

  const updated = users.filter(u => u.id !== userId)
  saveAllUsers(updated)
  localStorage.removeItem(USER_DATA_PREFIX + userId)
  return updated
}

/**
 * Retorna contagem de aprovações pendentes
 */
export function getPendingUsersCount() {
  const users = getAllUsers()
  return users.filter(u => u.status === 'pending').length
}

/**
 * Grava a sessão ativa
 */
export function setSession(user) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))
}

/**
 * Limpa a sessão ativa (Logout)
 */
export function logoutUser() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY)
}

/**
 * Lê os dados financeiros isolados do usuário
 */
export function getUserData(userId) {
  try {
    const raw = localStorage.getItem(USER_DATA_PREFIX + userId)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (e) {
    console.error('Erro ao ler dados do usuário', e)
  }
  return null
}

/**
 * Salva os dados financeiros isolados do usuário
 */
export function saveUserData(userId, data) {
  if (!userId) return
  try {
    localStorage.setItem(USER_DATA_PREFIX + userId, JSON.stringify(data))
  } catch (e) {
    console.error('Erro ao salvar dados do usuário', e)
  }
}