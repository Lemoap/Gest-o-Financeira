// 1. Importa e inicializa o Supabase com suas credenciais
const SUPABASE_URL = 'https://iloemhdreqiuihvvsrbr.supabase.co'; // Ex: https://xyzcompany.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlsb2VtaGRyZXFpdWlodnZzcmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNDAxOTYsImV4cCI6MjEwNDcxNjE5Nn0.3sqUMYXxAa24Afj3xfbQWtQhxmpFlLOESI6TwalulOM';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Função simples para testar a conexão e buscar dados
async function testarConexao() {
    console.log("Conectando ao Supabase...");

    try {
        // Teste: Busca todos os usuários (ajuste para sua tabela)
        // Se não tiver tabela de usuários, pode testar com outra tabela existente ou criar uma.
        // Para este exemplo, vamos assumir que você tenha uma tabela chamada 'usuarios' ou 'profiles'.
        // Se não tiver, comente esta linha e use apenas console.log.

        // Exemplo com tabela 'usuarios':
        const { data, error } = await _supabase
            .from('usuarios')
            .select('*')
            .limit(5);

        if (error) throw error;

        console.log("Conexão bem-sucedida! Dados recebidos:", data);
    } catch (error) {
        console.error("Erro ao conectar com o Supabase:", error.message);
    }
}

// Chama a função para testar
testarConexao();

async function inserirUsuario() {
    console.log("Tentando inserir novo usuário...");

    const novoUsuario = {
        nome: "Maria Teste",
        email: "[EMAIL_ADDRESS]", // Email único é importante
        senha: "[PASSWORD]",
        role: "user",
        status: "active"
    };

    try {
        const { data, error } = await _supabase
            .from('usuarios')
            .insert([novoUsuario]);

        if (error) throw error;

        console.log("Usuário inserido com sucesso! ID:", data[0].id);
        return data[0].id;
    } catch (error) {
        console.error("Erro ao inserir usuário:", error.message);
    }
}

// Chama a função para testar
inserirUsuario();

async function adicionarTransacao(descricao, valor, tipo, data) {
    const { data: resposta, error } = await _supabase
        .from('transacoes') // Nome da tabela que criamos
        .insert([
            { descricao: descricao, valor: valor, tipo: tipo, data: data }
        ]);

    if (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro ao salvar transação!');
    } else {
        console.log('Salvo com sucesso!', resposta);
        alert('Transação cadastrada!');
    }
}

// Exemplo de uso testando a função:
// adicionarTransacao('Supermercado', 150.50, 'despesa', '2026-06-07');

async function buscarTransacoes() {
    const { data: transacoes, error } = await _supabase
        .from('transacoes')
        .select('*'); // Pega todas as colunas

    if (error) {
        console.error('Erro ao buscar dados:', error);
    } else {
        console.log('Minhas transações:', transacoes);

        // Aqui você faria um loop para exibir na tela do HTML
        // Exemplo: transacoes.forEach(t => console.log(t.descricao));
    }
}
buscarTransacoes();

