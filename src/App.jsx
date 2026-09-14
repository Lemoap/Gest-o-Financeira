import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { DashboardCards } from './components/DashboardCards'
import { ChartsView } from './components/ChartsView'
import { IncomeSection } from './components/IncomeSection'
import { CreditCardSection } from './components/CreditCardSection'
import { RecurringExpensesSection } from './components/RecurringExpensesSection'
import { DebitExpensesSection } from './components/DebitExpensesSection'
import { AuthScreen } from './components/AuthScreen'
import { UserManagementModal } from './components/UserManagementModal'
import { ProfileModal } from './components/ProfileModal'
import { AppSettingsModal } from './components/AppSettingsModal'
import { initialFinancialData } from './data/initialData'
import { MONTH_NAMES, formatCurrency } from './utils/formatters'
import { initAuth, logoutUser, getUserData, saveUserData, getPendingUsersCount } from './utils/auth'
import { getAppSettings, saveAppSettings, resetAppSettings } from './utils/appSettings'
import {
  propagateNewInstallment,
  updateInstallmentAcrossMonths,
  deleteInstallmentAcrossMonths,
  syncAllInstallments,
  ensureMonthExists
} from './utils/installmentEngine'
import { FileSpreadsheet } from 'lucide-react'

const THEME_KEY = 'fincontrol_theme'

export default function App() {
  // Usuário autenticado na sessão
  const [currentUser, setCurrentUser] = useState(null)
  const [authChecking, setAuthChecking] = useState(true)

  // Configurações visuais e de marca do App
  const [appSettings, setAppSettings] = useState(getAppSettings)

  // Atualiza título da aba do navegador
  useEffect(() => {
    document.title = appSettings?.appName || 'FinControl - Gestão Financeira'
  }, [appSettings?.appName])

  // Modais
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isAppSettingsOpen, setIsAppSettingsOpen] = useState(false)
  const [pendingUsersCount, setPendingUsersCount] = useState(0)

  // Modo escuro
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem(THEME_KEY) === 'dark' ||
      (!localStorage.getItem(THEME_KEY) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem(THEME_KEY, 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem(THEME_KEY, 'light')
    }
  }, [darkMode])

  const refreshPendingCount = () => {
    setPendingUsersCount(getPendingUsersCount())
  }

  // Inicializa autenticação
  useEffect(() => {
    async function loadAuth() {
      try {
        const sessionUser = await initAuth()
        if (sessionUser) {
          setCurrentUser(sessionUser)
        }
        refreshPendingCount()
      } catch (err) {
        console.error('Erro na inicialização de autenticação', err)
      } finally {
        setAuthChecking(false)
      }
    }
    loadAuth()
  }, [])

  // Atualiza contagem de aprovações pendentes se admin
  useEffect(() => {
    if (currentUser?.role === 'admin' || currentUser?.username === 'admin') {
      refreshPendingCount()
    }
  }, [currentUser])

  // Dados financeiros isolados do usuário logado
  const [data, setData] = useState(() => {
    const initialClone = JSON.parse(JSON.stringify(initialFinancialData))
    if (initialClone.months) {
      syncAllInstallments(initialClone.months)
    }
    return initialClone
  })

  // Sempre que o currentUser mudar, recarrega os dados exclusivos dele e garante propagação
  useEffect(() => {
    if (currentUser?.id) {
      const realMonth = new Date().getMonth()     // mês real atual (0-based)
      const realYear = new Date().getFullYear()

      const userSpecificData = getUserData(currentUser.id)
      if (userSpecificData && userSpecificData.months) {
        syncAllInstallments(userSpecificData.months)
        // Garante que o mês atual exista, propagando recorrentes do anterior
        const key = `${realYear}-${realMonth}`
        if (!userSpecificData.months[key]) {
          let prevM = realMonth - 1, prevY = realYear
          if (prevM < 0) { prevM = 11; prevY = realYear - 1 }
          const prevData = userSpecificData.months[`${prevY}-${prevM}`]
          if (prevData?.recurringExpenses?.length) {
            ensureMonthExists(userSpecificData.months, realYear, realMonth)
            userSpecificData.months[key] = {
              ...userSpecificData.months[key],
              recurringExpenses: prevData.recurringExpenses.map(i => ({ ...i, paid: false }))
            }
          }
        }
        setData(userSpecificData)
        setCurrentYear(realYear)
        setCurrentMonth(realMonth)
      } else {
        const fresh = JSON.parse(JSON.stringify(initialFinancialData))
        syncAllInstallments(fresh.months)
        saveUserData(currentUser.id, fresh)
        setData(fresh)
        setCurrentYear(realYear)
        setCurrentMonth(realMonth)
      }
    }
  }, [currentUser?.id])

  // Salva no LocalStorage isolado daquele usuário
  useEffect(() => {
    if (currentUser?.id && data) {
      saveUserData(currentUser.id, data)
    }
  }, [data, currentUser?.id])

  const [currentYear, setCurrentYear] = useState(2026)
  const [currentMonth, setCurrentMonth] = useState(8) // 8 = Setembro

  // Logout seguro
  const handleLogout = () => {
    if (confirm(`Deseja sair da conta ${currentUser?.name || currentUser?.username}?`)) {
      logoutUser()
      setCurrentUser(null)
    }
  }

  // Chave do mês atual (ex: "2026-7")
  const monthKey = `${currentYear}-${currentMonth}`

  // Garante que o mês exista na estrutura de dados
  const currentMonthData = data.months?.[monthKey] || {
    id: monthKey,
    year: currentYear,
    month: currentMonth,
    name: MONTH_NAMES[currentMonth],
    initialBalance: 0,
    incomes: [],
    creditCardSicrediExpenses: [],
    creditCardNubankExpenses: [],
    recurringExpenses: [],
    debitExpenses: [],
    estimateBalance: 0
  }

  const sicrediExpenses = currentMonthData.creditCardSicrediExpenses || []
  const nubankExpenses = currentMonthData.creditCardNubankExpenses || []

  // Propaga despesas recorrentes do mês anterior para um mês novo (com paid=false)
  const propagateRecurringToNewMonth = (monthsCopy, year, month) => {
    const key = `${year}-${month}`
    if (monthsCopy[key]) return // Mês já existe, não sobrescreve

    // Busca mês anterior
    let prevMonth = month - 1
    let prevYear = year
    if (prevMonth < 0) { prevMonth = 11; prevYear = year - 1 }
    const prevKey = `${prevYear}-${prevMonth}`
    const prevData = monthsCopy[prevKey]

    const recurringFromPrev = prevData?.recurringExpenses
      ? prevData.recurringExpenses.map(item => ({ ...item, paid: false }))
      : []

    ensureMonthExists(monthsCopy, year, month)
    if (recurringFromPrev.length > 0) {
      monthsCopy[key] = { ...monthsCopy[key], recurringExpenses: recurringFromPrev }
    }
  }

  // Ao mudar de mês na Navbar
  const handleMonthChange = (newMonth) => {
    setData(prev => {
      const monthsCopy = { ...prev.months }
      propagateRecurringToNewMonth(monthsCopy, currentYear, newMonth)
      ensureMonthExists(monthsCopy, currentYear, newMonth)
      syncAllInstallments(monthsCopy)
      return { ...prev, months: monthsCopy }
    })
    setCurrentMonth(newMonth)
  }

  const handleYearChange = (newYear) => {
    setData(prev => {
      const monthsCopy = { ...prev.months }
      propagateRecurringToNewMonth(monthsCopy, newYear, currentMonth)
      ensureMonthExists(monthsCopy, newYear, currentMonth)
      syncAllInstallments(monthsCopy)
      return { ...prev, months: monthsCopy }
    })
    setCurrentYear(newYear)
  }

  // Atualização genérica de propriedades do mês ativo (ex: Entradas, Fixas, Débito)
  const updateCurrentMonth = (updater) => {
    setData(prev => {
      const monthsCopy = { ...prev.months }
      const existing = monthsCopy[monthKey] || ensureMonthExists(monthsCopy, currentYear, currentMonth)
      const updated = typeof updater === 'function' ? updater(existing) : { ...existing, ...updater }
      monthsCopy[monthKey] = updated
      syncAllInstallments(monthsCopy)
      return { ...prev, months: monthsCopy }
    })
  }

  // --- Handlers Específicos para Propagação Automática de Cartão de Crédito ---
  const handleAddCreditCardExpense = (cardKey, newPurchase) => {
    setData(prev => {
      const monthsCopy = { ...prev.months }
      propagateNewInstallment(monthsCopy, currentYear, currentMonth, newPurchase, cardKey)
      syncAllInstallments(monthsCopy)
      return { ...prev, months: monthsCopy }
    })
  }

  const handleEditCreditCardExpense = (cardKey, updatedPurchase) => {
    setData(prev => {
      const monthsCopy = { ...prev.months }
      updateInstallmentAcrossMonths(monthsCopy, currentYear, currentMonth, updatedPurchase, cardKey)
      syncAllInstallments(monthsCopy)
      return { ...prev, months: monthsCopy }
    })
  }

  const handleDeleteCreditCardExpense = (cardKey, purchaseId, deleteFuture) => {
    setData(prev => {
      const monthsCopy = { ...prev.months }
      deleteInstallmentAcrossMonths(monthsCopy, currentYear, currentMonth, purchaseId, cardKey, deleteFuture)
      syncAllInstallments(monthsCopy)
      return { ...prev, months: monthsCopy }
    })
  }

  // Cálculos consolidados
  const totalIncomes = (currentMonthData.incomes || []).reduce((acc, i) => acc + (i.amount || 0), 0)
  const ccSicrediTotal = sicrediExpenses.reduce((acc, i) => acc + (i.amount || 0), 0)
  const ccNubankTotal = nubankExpenses.reduce((acc, i) => acc + (i.amount || 0), 0)
  const ccTotal = ccSicrediTotal + ccNubankTotal
  const recTotal = (currentMonthData.recurringExpenses || []).reduce((acc, i) => acc + (i.amount || 0), 0)
  const debTotal = (currentMonthData.debitExpenses || []).reduce((acc, i) => acc + (i.amount || 0), 0)
  const totalExpenses = ccTotal + recTotal + debTotal

  // Exportar Backup JSON individual do usuário
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `${appSettings?.appName?.toLowerCase().replace(/\s+/g, '-') || 'fincontrol'}-${currentUser?.username || 'user'}-backup-${new Date().toISOString().slice(0, 10)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Importar Backup JSON
  const handleImportData = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (parsed && parsed.months) {
          syncAllInstallments(parsed.months)
          setData(parsed)
          alert('Dados da sua conta restaurados com sucesso!')
        } else {
          alert('Arquivo de backup inválido.')
        }
      } catch (err) {
        alert('Erro ao ler o arquivo selecionado.')
      }
    }
    reader.readAsText(file)
  }

  // Restaurar dados da planilha com recálculo de propagação
  const handleResetData = () => {
    if (confirm('Deseja recarregar o modelo padrão da planilha para a sua conta?')) {
      const fresh = JSON.parse(JSON.stringify(initialFinancialData))
      syncAllInstallments(fresh.months)
      setData(fresh)
      setCurrentYear(2026)
      setCurrentMonth(7)
    }
  }

  const handleSaveAppSettings = (updated) => {
    setAppSettings(updated)
    saveAppSettings(updated)
  }

  const handleResetAppSettings = () => {
    const def = resetAppSettings()
    setAppSettings(def)
  }

  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <AuthScreen
        onLoginSuccess={(user) => { setCurrentUser(user); refreshPendingCount() }}
        appSettings={appSettings}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors pb-16">

      {/* Topo Navegação */}
      <Navbar
        currentUser={currentUser}
        appSettings={appSettings}
        onLogout={handleLogout}
        onOpenUserManagement={() => setIsUserManagementOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenAppSettings={() => setIsAppSettingsOpen(true)}
        pendingUsersCount={pendingUsersCount}
        currentMonth={currentMonth}
        currentYear={currentYear}
        onMonthChange={handleMonthChange}
        onYearChange={handleYearChange}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
      />

      {/* Modal de Edição de Perfil */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        currentUser={currentUser}
        onProfileUpdated={(updated) => setCurrentUser(updated)}
      />

      {/* Modal Administrativo de Gerenciamento e Aprovação de Usuários */}
      <UserManagementModal
        isOpen={isUserManagementOpen}
        onClose={() => setIsUserManagementOpen(false)}
        onUsersChanged={refreshPendingCount}
      />

      {/* Modal de Personalização do App (Nome, Descrições e Logo) */}
      <AppSettingsModal
        isOpen={isAppSettingsOpen}
        onClose={() => setIsAppSettingsOpen(false)}
        settings={appSettings}
        onSave={handleSaveAppSettings}
        onReset={handleResetAppSettings}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* Banner Informativo */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-teal-900/10 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md mb-3 border border-white/20">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Painel de {currentUser.name || currentUser.username} • {MONTH_NAMES[currentMonth]}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {appSettings?.bannerTitle || 'Painel Financeiro & Fluxo de Caixa'}
              </h1>
              <p className="text-white/80 text-sm mt-1 max-w-xl">
                {appSettings?.bannerDescription || 'Controle individualizado com cartões separados (Sicredi e Nubank), despesas fixas recorrentes, saídas em débito e saldo sombra.'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shrink-0 min-w-[220px]">
              <span className="text-xs font-medium text-white/80 block">Resultado Operacional:</span>
              <div className="text-2xl font-black mt-0.5">
                {formatCurrency(totalIncomes - totalExpenses)}
              </div>
              <span className="text-[11px] text-white/70 block mt-1">
                Saldo Acumulado: {formatCurrency(currentMonthData.initialBalance + (totalIncomes - totalExpenses))}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Indicadores Principais (Cards) */}
        <DashboardCards
          initialBalance={currentMonthData.initialBalance || 0}
          totalIncomes={totalIncomes}
          totalExpenses={totalExpenses}
          monthName={MONTH_NAMES[currentMonth]}
          estimateBalance={currentMonthData.estimateBalance || 0}
          onUpdateInitialBalance={(newVal) => updateCurrentMonth({ initialBalance: newVal, isShadowAuto: false })}
          onUpdateEstimateBalance={(newVal) => updateCurrentMonth({ estimateBalance: newVal })}
        />

        {/* 2. Análise Gráfica & Projeções com Sicredi e Nubank */}
        <ChartsView
          totalIncomes={totalIncomes}
          ccSicrediTotal={ccSicrediTotal}
          ccNubankTotal={ccNubankTotal}
          recTotal={recTotal}
          debTotal={debTotal}
          totalExpenses={totalExpenses}
          estimateBalance={currentMonthData.estimateBalance || 0}
          onUpdateEstimateBalance={(newVal) => updateCurrentMonth({ estimateBalance: newVal })}
        />

        {/* 3. Seções de Lançamento */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Coluna 1: Entradas e Contas Fixas */}
          <div className="space-y-8">
            <IncomeSection
              incomes={currentMonthData.incomes || []}
              onUpdateIncomes={(newIncomes) => updateCurrentMonth({ incomes: newIncomes })}
            />

            <RecurringExpensesSection
              expenses={currentMonthData.recurringExpenses || []}
              onUpdateExpenses={(newRec) => updateCurrentMonth({ recurringExpenses: newRec })}
              currentMonth={currentMonth}
              currentYear={currentYear}
            />

            <DebitExpensesSection
              expenses={currentMonthData.debitExpenses || []}
              onUpdateExpenses={(newDeb) => updateCurrentMonth({ debitExpenses: newDeb })}
            />
          </div>

          {/* Coluna 2: Cartões de Crédito com Propagação Automática */}
          <div className="space-y-8">
            {/* 1. Cartão Sicredi */}
            <CreditCardSection
              title="Parcelas de Cartão de Crédito (CC) - Sicredi"
              subtitle="Compras parceladas e faturas no Cartão Sicredi"
              cardBrand="Sicredi"
              theme="emerald"
              expenses={sicrediExpenses}
              onAddExpense={(newPurchase) => handleAddCreditCardExpense('creditCardSicrediExpenses', newPurchase)}
              onEditExpense={(updatedPurchase) => handleEditCreditCardExpense('creditCardSicrediExpenses', updatedPurchase)}
              onDeleteExpense={(purchaseId, deleteFuture) => handleDeleteCreditCardExpense('creditCardSicrediExpenses', purchaseId, deleteFuture)}
            />

            {/* 2. Cartão Nubank */}
            <CreditCardSection
              title="Parcelas de Cartão de Crédito (CC) - Nubank"
              subtitle="Compras parceladas e faturas no Cartão Nubank"
              cardBrand="Nubank"
              theme="purple"
              expenses={nubankExpenses}
              onAddExpense={(newPurchase) => handleAddCreditCardExpense('creditCardNubankExpenses', newPurchase)}
              onEditExpense={(updatedPurchase) => handleEditCreditCardExpense('creditCardNubankExpenses', updatedPurchase)}
              onDeleteExpense={(purchaseId, deleteFuture) => handleDeleteCreditCardExpense('creditCardNubankExpenses', purchaseId, deleteFuture)}
            />
          </div>

        </div>

      </main>
    </div>
  )
}
// 1. Configuração do Supabase (substitua pelos seus dados reais)
const SUPABASE_URL = 'SUA_URL_DO_PROJETO';
const SUPABASE_ANON_KEY = 'SUA_CHAVE_ANON_AQUI';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. Ouvinte de envio do formulário
const form = document.getElementById('form-transacao');

form.addEventListener('submit', async function (evento) {
  evento.preventDefault(); // Impede a página de recarregar sozinha

  // Pega os valores digitados nos inputs da tela
  const descricao = document.getElementById('desc').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const tipo = document.getElementById('tipo').value;
  const data = document.getElementById('data').value;

  // Envia para o Supabase (a nossa tabela 'transacoes')
  const { error } = await _supabase
    .from('transacoes')
    .insert([{ descricao, valor, tipo, data }]);

  if (error) {
    console.error('Erro ao salvar:', error);
    alert('Erro ao salvar transação!');
  } else {
    alert('Transação salva com sucesso!');
    form.reset(); // Limpa os campos do formulário
    buscarTransacoes(); // Atualiza a lista na tela
  }
});

// 3. Função para buscar e exibir as transações na tela
async function buscarTransacoes() {
  const listaEl = document.getElementById('lista-transacoes');
  listaEl.innerHTML = 'Carregando...';

  const { data: transacoes, error } = await _supabase
    .from('transacoes')
    .select('*');

  if (error) {
    console.error('Erro ao buscar:', error);
    listaEl.innerHTML = 'Erro ao carregar dados.';
    return;
  }

  // Limpa a lista visual antes de preencher
  listaEl.innerHTML = '';

  // Desenha cada item na tela
  transacoes.forEach(t => {
    const item = document.createElement('li');
    item.textContent = `${t.data} - ${t.descricao}: R$ ${t.valor} (${t.tipo})`;
    listaEl.appendChild(item);
  });
}

// Executa a busca assim que a página abre para trazer os dados salvos
buscarTransacoes();

async function buscarTransacoes() {
  const tbodyEl = document.querySelector('#tabela-transacoes tbody');
  tbodyEl.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';

  // Busca as transações ordenando da mais recente para a mais antiga
  const { data: transacoes, error } = await _supabase
    .from('transacoes')
    .select('*')
    .order('data', { ascending: false });

  if (error) {
    console.error('Erro ao buscar:', error);
    tbodyEl.innerHTML = '<tr><td colspan="4">Erro ao carregar dados.</td></tr>';
    return;
  }

  // Limpa a tabela antes de preencher
  tbodyEl.innerHTML = '';

  if (transacoes.length === 0) {
    tbodyEl.innerHTML = '<tr><td colspan="4">Nenhuma transação cadastrada.</td></tr>';
    return;
  }

  // Cria uma linha (tr) para cada transação encontrada no Supabase
  transacoes.forEach(t => {
    const linha = document.createElement('tr');

    // Formata o valor com duas casas decimais
    const valorFormatado = parseFloat(t.valor).toFixed(2);

    linha.innerHTML = `
            <td>${t.data}</td>
            <td>${t.descricao}</td>
            <td>${t.tipo}</td>
            <td>R$ ${valorFormatado}</td>
        `;

    tbodyEl.appendChild(linha);
  });
}