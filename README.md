# FinControl - Gestão Financeira Pessoal & Familiar

Software de gestão financeira moderna baseado no modelo de fluxo de caixa da sua planilha.

## 🚀 Como Executar

### Opção 1: Duplo-clique (Mais Fácil)
Basta dar um duplo-clique no arquivo `iniciar.bat` dentro da pasta `gestao-financeira`.

### Opção 2: Pelo Terminal / PowerShell
Abra o terminal nesta pasta e execute:
```powershell
npm.cmd run dev
```
O sistema abrirá automaticamente no seu navegador em: **http://localhost:3000**

---

## 📊 Estrutura e Recursos

1. **Indicadores do Painel**:
   - **Inicial (Sombra)**: `R$ 198,28` (Saldo transportado do mês anterior com edição rápida).
   - **Total Entradas**: `R$ 11.771,65` (Salários e transferências).
   - **Total Saídas**: `R$ 11.840,40` (Soma das 3 categorias de despesa).
   - **Diferença Entradas e Saídas**: `-R$ 68,75` (Resultado operacional do mês).
   - **Saldo do Mês de Agosto**: `R$ 129,53` (Caixa final real acumulado).

2. **Categorização Fiel das Saídas**:
   - **Parcelas de Cartão de Crédito (CC)**: `R$ 4.753,60` com controle de parcelas atuais e totais (ex: 4/10).
   - **Despesas Recorrentes (Fixas)**: `R$ 675,01` com dia de vencimento e checkbox de pagamento.
   - **Despesas Débito / À Vista (Pix)**: `R$ 6.411,79` com categorização por tipo (Alimentação, Transporte, Saúde, etc.).

3. **Análise Visual & Gráficos**:
   - Gráfico de proporção das categorias de despesa.
   - Barra comparativa de Entradas vs Saídas com taxa de comprometimento da renda.
   - Indicador do campo de **Estimativa** da planilha (`-R$ 8.674,62`).

4. **Persistência & Backup**:
   - Salva tudo no seu navegador automaticamente (`LocalStorage`).
   - Botão de **Exportar Backup (JSON)** para guardar cópias de segurança.
   - Botão de **Importar Backup** para restaurar em qualquer momento ou computador.
   - Suporte a **Modo Escuro (Dark Mode)** e Modo Claro.
