export const initialFinancialData = {
  // Configurações do ano
  selectedYear: 2026,
  selectedMonth: 8, // 0 = Jan, 8 = Setembro

  // Meses cadastrados
  months: {
    // AGOSTO (Índice 7) - Dados fiéis da planilha
    "2026-7": {
      id: "2026-7",
      year: 2026,
      month: 7,
      name: "Agosto",
      // Sombra mês anterior (saldo transportado)
      initialBalance: 198.28,
      
      // Entradas (Receitas)
      incomes: [
        { id: "inc_1", description: "Salário (varia)", category: "Trabalho", amount: 3410.37, date: "2026-08-05", received: true },
        { id: "inc_2", description: "Mãe", category: "Família", amount: 833.00, date: "2026-08-10", received: true },
        { id: "inc_3", description: "Vó Vera", category: "Família", amount: 630.00, date: "2026-08-10", received: true },
        { id: "inc_4", description: "Claudia", category: "Família / Outros", amount: 900.00, date: "2026-08-15", received: true },
        { id: "inc_5", description: "Dona Maria", category: "Contratos / Outros", amount: 5800.00, date: "2026-08-20", received: true },
      ],

      // Saídas: 1. Parcelas de Cartão de Crédito (CC) - Sicredi (Subtotal: R$ 2.103,60)
      creditCardSicrediExpenses: [
        { id: "cc_sic_1", description: "Seguro / Manutenção Anual", currentInstallment: 5, totalInstallments: 5, amount: 850.00, card: "Sicredi" },
        { id: "cc_sic_2", description: "Móveis e Utilidades Casa", currentInstallment: 3, totalInstallments: 8, amount: 653.60, card: "Sicredi" },
        { id: "cc_sic_3", description: "Tratamentos & Farmácia", currentInstallment: 2, totalInstallments: 3, amount: 600.00, card: "Sicredi" },
      ],

      // Saídas: 2. Parcelas de Cartão de Crédito (CC) - Nubank (Subtotal: R$ 2.650,00)
      // Total CC Somados = R$ 2.103,60 + R$ 2.650,00 = R$ 4.753,60 (Total exato da planilha)
      creditCardNubankExpenses: [
        { id: "cc_nub_1", description: "Compras Gerais / Eletrônicos", currentInstallment: 4, totalInstallments: 10, amount: 1250.00, card: "Nubank" },
        { id: "cc_nub_2", description: "Manutenção Carro", currentInstallment: 1, totalInstallments: 4, amount: 980.00, card: "Nubank" },
        { id: "cc_nub_3", description: "Vestuário e Calçados", currentInstallment: 2, totalInstallments: 6, amount: 420.00, card: "Nubank" },
      ],

      // Saídas: 3. Despesas Recorrentes (Total: R$ 675,01)
      recurringExpenses: [
        { id: "rec_1", description: "Energia Elétrica", dueDay: 10, amount: 285.11, paid: true },
        { id: "rec_2", description: "Internet Fibra Residencial", dueDay: 15, amount: 149.90, paid: true },
        { id: "rec_3", description: "Água e Esgoto", dueDay: 12, amount: 95.00, paid: true },
        { id: "rec_4", description: "Assinaturas de Streaming", dueDay: 5, amount: 85.00, paid: true },
        { id: "rec_5", description: "Plano Celular", dueDay: 20, amount: 60.00, paid: true },
      ],

      // Saídas: 4. Despesas Débito / À Vista (Total: R$ 6.411,79)
      debitExpenses: [
        { id: "deb_1", description: "Supermercado Mensal", category: "Alimentação", amount: 2450.00, date: "2026-08-03" },
        { id: "deb_2", description: "Alimentação / Restaurantes / Feira", category: "Alimentação", amount: 1120.50, date: "2026-08-11" },
        { id: "deb_3", description: "Combustível e Transporte", category: "Transporte", amount: 880.00, date: "2026-08-14" },
        { id: "deb_4", description: "Farmácia e Medicamentos", category: "Saúde", amount: 345.00, date: "2026-08-18" },
        { id: "deb_5", description: "Pequenos Reparos e Manutenção", category: "Casa", amount: 560.00, date: "2026-08-22" },
        { id: "deb_6", description: "Lazer e Passeios", category: "Lazer", amount: 450.00, date: "2026-08-25" },
        { id: "deb_7", description: "Despesas Diversas & Pix", category: "Outros", amount: 606.29, date: "2026-08-28" },
      ],

      // Estimativas adicionais presentes na planilha
      estimateBalance: -8674.62,
      notes: "Controle financeiro mensal espelhado na planilha com separação dos cartões Sicredi e Nubank."
    },

    // SETEMBRO (Índice 8)
    "2026-8": {
      id: "2026-8",
      year: 2026,
      month: 8,
      name: "Setembro",
      initialBalance: 0,
      incomes: [
        { id: "inc_sep_1", description: "Salário (varia)", category: "Trabalho", amount: 3410.37, date: "2026-09-05", received: true },
      ],
      creditCardSicrediExpenses: [],
      creditCardNubankExpenses: [],

      // Algumas despesas NÃO pagas para demonstrar os banners de vencimento
      recurringExpenses: [
        { id: "rec_sep_1", description: "Energia Elétrica", dueDay: 5, amount: 285.11, paid: false },
        { id: "rec_sep_2", description: "Internet Fibra Residencial", dueDay: 8, amount: 149.90, paid: false },
        { id: "rec_sep_3", description: "Água e Esgoto", dueDay: 7, amount: 95.00, paid: true },
        { id: "rec_sep_4", description: "Assinaturas de Streaming", dueDay: 3, amount: 85.00, paid: false },
        { id: "rec_sep_5", description: "Plano Celular", dueDay: 20, amount: 60.00, paid: false },
      ],

      debitExpenses: [],
      estimateBalance: 0,
      notes: ""
    }
  }
}
