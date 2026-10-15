// ============================================
// DADOS GLOBAIS
// ============================================

let clientes = [];
let servicos = [];
let agendamentos = [];
let configuracoes = {
    nomeOficina: "Minha Oficina",
    corPrimaria: "#ff6b35",
    corSecundaria: "#1a1a1a",
    logo: null
};

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    carregarDados();
    inicializarEventos();
    atualizarPagina();
    aplicarConfiguracao();
});

function inicializarEventos() {
    // Navegação
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            mostrarPagina(e.target.dataset.page);
        });
    });

    // Formulários
    document.getElementById('formCliente').addEventListener('submit', adicionarCliente);
    document.getElementById('formServico').addEventListener('submit', adicionarServico);
    document.getElementById('formAgendamento').addEventListener('submit', adicionarAgendamento);

    // Pesquisa
    document.getElementById('searchCliente').addEventListener('input', filtrarClientes);
    document.getElementById('searchServico').addEventListener('input', filtrarServicos);

    // Upload de logo
    document.getElementById('logoUpload').addEventListener('change', processarLogo);

    // Importar dados
    document.getElementById('importFile').addEventListener('change', processarImportacao);
}

// ============================================
// NAVEGAÇÃO
// ============================================

function mostrarPagina(nomePagina) {
    // Remover active de todas as páginas
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Remover active de todos os botões
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Adicionar active para a página selecionada
    document.getElementById(nomePagina).classList.add('active');

    // Marcar botão como active
    document.querySelector(`[data-page="${nomePagina}"]`).classList.add('active');

    // Atualizar dados
    atualizarPagina();
}

// ============================================
// CLIENTES
// ============================================

function abrirFormularioCliente() {
    document.getElementById('formCliente').reset();
    document.getElementById('modalCliente').style.display = 'block';
}

function adicionarCliente(e) {
    e.preventDefault();

    const cliente = {
        id: Date.now(),
        nome: document.getElementById('nomeCliente').value,
        telefone: document.getElementById('telefoneCliente').value,
        email: document.getElementById('emailCliente').value,
        carro: document.getElementById('carroCliente').value,
        placa: document.getElementById('placaCliente').value,
        observacoes: document.getElementById('observacaoCliente').value,
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
        ultimaVisita: '-'
    };

    clientes.push(cliente);
    salvarDados();
    atualizarPagina();
    fecharModal('modalCliente');
    mostrarNotificacao('✅ Cliente adicionado com sucesso!', 'sucesso');
}

function filtrarClientes() {
    const termo = document.getElementById('searchCliente').value.toLowerCase();
    const tabelaCorpo = document.getElementById('tabelaClientes');
    
    const clientesFiltrados = clientes.filter(cliente =>
        cliente.nome.toLowerCase().includes(termo) ||
        cliente.telefone.includes(termo) ||
        cliente.carro.toLowerCase().includes(termo)
    );

    renderizarClientes(clientesFiltrados);
}

function renderizarClientes(listClientes = clientes) {
    const tbody = document.getElementById('tabelaClientes');
    tbody.innerHTML = '';

    listClientes.forEach(cliente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${cliente.nome}</strong></td>
            <td>${cliente.telefone}</td>
            <td>${cliente.carro}</td>
            <td>${cliente.placa}</td>
            <td>${cliente.ultimaVisita}</td>
            <td>
                <button class="btn btn-primary btn-small" onclick="editarCliente(${cliente.id})">✏️ Editar</button>
                <button class="btn btn-danger btn-small" onclick="deletarCliente(${cliente.id})">🗑️ Deletar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    // Atualizar options nos formulários
    atualizarSelectClientes();
}

function editarCliente(id) {
    const cliente = clientes.find(c => c.id === id);
    if (cliente) {
        document.getElementById('nomeCliente').value = cliente.nome;
        document.getElementById('telefoneCliente').value = cliente.telefone;
        document.getElementById('emailCliente').value = cliente.email;
        document.getElementById('carroCliente').value = cliente.carro;
        document.getElementById('placaCliente').value = cliente.placa;
        document.getElementById('observacaoCliente').value = cliente.observacoes;
        
        clientes = clientes.filter(c => c.id !== id);
        salvarDados();
        atualizarPagina();
        document.getElementById('modalCliente').style.display = 'block';
    }
}

function deletarCliente(id) {
    if (confirm('Tem certeza que deseja deletar este cliente?')) {
        clientes = clientes.filter(c => c.id !== id);
        salvarDados();
        atualizarPagina();
        mostrarNotificacao('🗑️ Cliente deletado', 'aviso');
    }
}

// ============================================
// SERVIÇOS
// ============================================

function abrirFormularioServico() {
    document.getElementById('formServico').reset();
    document.getElementById('modalServico').style.display = 'block';
}

function adicionarServico(e) {
    e.preventDefault();

    const servico = {
        id: Date.now(),
        clienteId: document.getElementById('clienteServico').value,
        descricao: document.getElementById('descricaoServico').value,
        valor: parseFloat(document.getElementById('valorServico').value),
        data: document.getElementById('dataServico').value || new Date().toISOString().split('T')[0],
        status: document.getElementById('statusServico').value
    };

    servicos.push(servico);
    
    // Atualizar última visita do cliente
    const cliente = clientes.find(c => c.id == servico.clienteId);
    if (cliente) {
        cliente.ultimaVisita = new Date().toLocaleDateString('pt-BR');
    }

    salvarDados();
    atualizarPagina();
    fecharModal('modalServico');
    mostrarNotificacao('✅ Serviço registrado!', 'sucesso');
}

function filtrarServicos() {
    const termo = document.getElementById('searchServico').value.toLowerCase();
    const servicosFiltrados = servicos.filter(s => {
        const cliente = clientes.find(c => c.id == s.clienteId);
        return (cliente && cliente.nome.toLowerCase().includes(termo)) ||
               s.descricao.toLowerCase().includes(termo);
    });

    renderizarServicos(servicosFiltrados);
}

function renderizarServicos(listServicos = servicos) {
    const tbody = document.getElementById('tabelaServicos');
    tbody.innerHTML = '';

    listServicos.forEach(servico => {
        const cliente = clientes.find(c => c.id == servico.clienteId);
        const statusEmoji = servico.status === 'concluído' ? '✅' : 
                           servico.status === 'pendente' ? '⏳' : '🔧';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${cliente ? cliente.nome : 'Cliente removido'}</td>
            <td>${servico.descricao}</td>
            <td>R$ ${servico.valor.toFixed(2)}</td>
            <td>${servico.data}</td>
            <td>${statusEmoji} ${servico.status}</td>
            <td>
                <button class="btn btn-danger btn-small" onclick="deletarServico(${servico.id})">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function deletarServico(id) {
    if (confirm('Deletar este serviço?')) {
        servicos = servicos.filter(s => s.id !== id);
        salvarDados();
        atualizarPagina();
    }
}

// ============================================
// AGENDAMENTOS
// ============================================

function abrirFormularioAgendamento() {
    document.getElementById('formAgendamento').reset();
    document.getElementById('modalAgendamento').style.display = 'block';
}

function adicionarAgendamento(e) {
    e.preventDefault();

    const agendamento = {
        id: Date.now(),
        clienteId: document.getElementById('clienteAgendamento').value,
        data: document.getElementById('dataAgendamento').value,
        hora: document.getElementById('horaAgendamento').value,
        servico: document.getElementById('servicoAgendamento').value,
        status: 'agendado'
    };

    agendamentos.push(agendamento);
    salvarDados();
    atualizarPagina();
    fecharModal('modalAgendamento');
    mostrarNotificacao('✅ Agendamento realizado!', 'sucesso');
}

function renderizarAgendamentos() {
    const tbody = document.getElementById('tabelaAgendamentos');
    tbody.innerHTML = '';

    agendamentos.sort((a, b) => new Date(a.data + ' ' + a.hora) - new Date(b.data + ' ' + b.hora))
        .forEach(agendamento => {
            const cliente = clientes.find(c => c.id == agendamento.clienteId);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cliente ? cliente.nome : 'Cliente removido'}</td>
                <td>${agendamento.data}</td>
                <td>${agendamento.hora}</td>
                <td>${agendamento.servico || '-'}</td>
                <td>📅 ${agendamento.status}</td>
                <td>
                    <button class="btn btn-primary btn-small" onclick="concluirAgendamento(${agendamento.id})">✅</button>
                    <button class="btn btn-danger btn-small" onclick="deletarAgendamento(${agendamento.id})">🗑️</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
}

function concluirAgendamento(id) {
    const agendamento = agendamentos.find(a => a.id === id);
    if (agendamento) {
        agendamento.status = 'concluído';
        salvarDados();
        atualizarPagina();
        mostrarNotificacao('✅ Agendamento concluído!', 'sucesso');
    }
}

function deletarAgendamento(id) {
    if (confirm('Deletar este agendamento?')) {
        agendamentos = agendamentos.filter(a => a.id !== id);
        salvarDados();
        atualizarPagina();
    }
}

// ============================================
// RELATÓRIOS
// ============================================

function atualizarRelatorios() {
    document.getElementById('totalClientes').textContent = clientes.length;

    const agora = new Date();
    const mesAtual = agora.getMonth();
    const anoAtual = agora.getFullYear();

    const servicosMes = servicos.filter(s => {
        const data = new Date(s.data);
        return data.getMonth() === mesAtual && data.getFullYear() === anoAtual;
    });

    document.getElementById('servicosAnoMes').textContent = servicosMes.length;

    const faturamento = servicosMes.reduce((total, s) => total + s.valor, 0);
    document.getElementById('faturamento').textContent = 'R$ ' + faturamento.toFixed(2).replace('.', ',');

    const clientesComRetorno = clientes.filter(c => c.ultimaVisita !== '-').length;
    const taxaRetorno = clientes.length > 0 ? 
        Math.round((clientesComRetorno / clientes.length) * 100) : 0;
    document.getElementById('taxaRetorno').textContent = taxaRetorno + '%';
}

// ============================================
// CONFIGURAÇÕES
// ============================================

function salvarConfiguracoes() {
    configuracoes.nomeOficina = document.getElementById('nomeOficina').value;
    configuracoes.corPrimaria = document.getElementById('corPrincipal').value;
    configuracoes.corSecundaria = document.getElementById('corSecundaria').value;

    localStorage.setItem('configuracoesCRM', JSON.stringify(configuracoes));
    aplicarConfiguracao();
    mostrarNotificacao('✅ Configurações salvas!', 'sucesso');
}

function aplicarConfiguracao() {
    document.documentElement.style.setProperty('--cor-primaria', configuracoes.corPrimaria);
    document.documentElement.style.setProperty('--cor-secundaria', configuracoes.corSecundaria);
    document.getElementById('nomeOficina').value = configuracoes.nomeOficina;
    document.getElementById('corPrincipal').value = configuracoes.corPrimaria;
    document.getElementById('corSecundaria').value = configuracoes.corSecundaria;
}

function processarLogo(e) {
    const arquivo = e.target.files[0];
    if (arquivo && arquivo.size < 2000000) {
        const leitor = new FileReader();
        leitor.onload = (evento) => {
            configuracoes.logo = evento.target.result;
            document.getElementById('logoImg').src = configuracoes.logo;
            localStorage.setItem('configuracoesCRM', JSON.stringify(configuracoes));
            mostrarNotificacao('✅ Logo alterada!', 'sucesso');
        };
        leitor.readAsDataURL(arquivo);
    } else {
        mostrarNotificacao('❌ Arquivo muito grande (máx 2MB)', 'erro');
    }
}

// ============================================
// IMPORTAR/EXPORTAR
// ============================================

function exportarDados() {
    const dados = {
        clientes,
        servicos,
        agendamentos,
        configuracoes,
        dataExportacao: new Date().toLocaleString('pt-BR')
    };

    const json = JSON.stringify(dados, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-crm-${Date.now()}.json`;
    link.click();

    mostrarNotificacao('📥 Dados exportados!', 'sucesso');
}

function importarDados() {
    document.getElementById('importFile').click();
}

function processarImportacao(e) {
    const arquivo = e.target.files[0];
    if (arquivo) {
        const leitor = new FileReader();
        leitor.onload = (evento) => {
            try {
                const dados = JSON.parse(evento.target.result);
                clientes = dados.clientes || [];
                servicos = dados.servicos || [];
                agendamentos = dados.agendamentos || [];
                configuracoes = dados.configuracoes || configuracoes;

                salvarDados();
                aplicarConfiguracao();
                atualizarPagina();
                mostrarNotificacao('📤 Dados importados com sucesso!', 'sucesso');
            } catch (erro) {
                mostrarNotificacao('❌ Erro ao importar arquivo', 'erro');
            }
        };
        leitor.readAsText(arquivo);
    }
}

// ============================================
// UTILITÁRIOS
// ============================================

function atualizarSelectClientes() {
    const selects = document.querySelectorAll('#clienteServico, #clienteAgendamento');
    selects.forEach(select => {
        const valor = select.value;
        select.innerHTML = '<option value="">Selecione um cliente</option>';
        clientes.forEach(cliente => {
            const option = document.createElement('option');
            option.value = cliente.id;
            option.textContent = cliente.nome;
            select.appendChild(option);
        });
        select.value = valor;
    });
}

function atualizarPagina() {
    renderizarClientes();
    renderizarServicos();
    renderizarAgendamentos();
    atualizarRelatorios();
    atualizarSelectClientes();
}

function fecharModal(idModal) {
    document.getElementById(idModal).style.display = 'none';
}

// Fechar modal ao clicar fora
window.onclick = (evento) => {
    const modais = document.querySelectorAll('.modal');
    modais.forEach(modal => {
        if (evento.target === modal) {
            modal.style.display = 'none';
        }
    });
};

function mostrarNotificacao(mensagem, tipo) {
    const notif = document.createElement('div');
    notif.textContent = mensagem;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: bold;
        z-index: 2000;
        animation: slideIn 0.3s ease;
    `;

    if (tipo === 'sucesso') {
        notif.style.backgroundColor = '#4caf50';
    } else if (tipo === 'aviso') {
        notif.style.backgroundColor = '#ff9800';
    } else {
        notif.style.backgroundColor = '#f44336';
    }

    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// ============================================
// ARMAZENAMENTO LOCAL
// ============================================

function salvarDados() {
    localStorage.setItem('clientesCRM', JSON.stringify(clientes));
    localStorage.setItem('servicosCRM', JSON.stringify(servicos));
    localStorage.setItem('agendamentosCRM', JSON.stringify(agendamentos));
}

function carregarDados() {
    clientes = JSON.parse(localStorage.getItem('clientesCRM')) || [];
    servicos = JSON.parse(localStorage.getItem('servicosCRM')) || [];
    agendamentos = JSON.parse(localStorage.getItem('agendamentosCRM')) || [];
    const config = JSON.parse(localStorage.getItem('configuracoesCRM'));
    if (config) {
        configuracoes = config;
    }
}

// Animação CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);