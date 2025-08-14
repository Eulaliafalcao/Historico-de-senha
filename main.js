// Elementos do DOM
const numeroSenha = document.querySelector('.parametro-senha__texto');
const campoSenha = document.querySelector('#campo-senha');
const botoes = document.querySelectorAll('.parametro-senha__botao');
const checkbox = document.querySelectorAll('.checkbox');
const forcaSenha = document.querySelector('.forca');
const botaoCopiar = document.querySelector('#copiar-senha');
const botaoGerarNova = document.querySelector('#gerar-nova-senha');
const botaoLimparHistorico = document.querySelector('#limpar-historico');
const botaoExportarHistorico = document.querySelector('#exportar-historico');
const historicoLista = document.querySelector('#historico-lista');
const modal = document.querySelector('#modal-confirmacao');
const modalCancelar = document.querySelector('#modal-cancelar');
const modalConfirmar = document.querySelector('#modal-confirmar');

// Variáveis globais
let tamanhoSenha = 12;
numeroSenha.textContent = tamanhoSenha;

// Caracteres para geração de senhas
const letrasMaiusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const letrasMinusculas = 'abcdefghijklmnopqrstuvwxyz';
const numeros = '0123456789';
const simbolos = '!@%*?';

// Array para armazenar o histórico de senhas
let historicoSenhas = JSON.parse(localStorage.getItem('historicoSenhas')) || [];

// Event listeners
botoes[0].onclick = diminuiTamanho;
botoes[1].onclick = aumentaTamanho;
botaoCopiar.onclick = copiarSenha;
botaoGerarNova.onclick = gerarNovaSenha;
botaoLimparHistorico.onclick = mostrarModalLimpar;
botaoExportarHistorico.onclick = exportarHistorico;
modalCancelar.onclick = fecharModal;
modalConfirmar.onclick = confirmarLimparHistorico;

// Event listener para fechar modal clicando fora
modal.onclick = function(event) {
    if (event.target === modal) {
        fecharModal();
    }
};

// Event listeners para checkboxes
for (let i = 0; i < checkbox.length; i++) {
    checkbox[i].onclick = geraSenha;
}

// Funções para controle do tamanho da senha
function diminuiTamanho() {
    if (tamanhoSenha > 1) {
        tamanhoSenha--;
    }
    numeroSenha.textContent = tamanhoSenha;
    geraSenha();
}

function aumentaTamanho() {
    if (tamanhoSenha < 20) {
        tamanhoSenha++;
    }
    numeroSenha.textContent = tamanhoSenha;
    geraSenha();
}

// Função principal para gerar senha
function geraSenha() {
    let alfabeto = '';
    if (checkbox[0].checked) {
        alfabeto = alfabeto + letrasMaiusculas;
    }
    if (checkbox[1].checked) {
        alfabeto = alfabeto + letrasMinusculas;
    }
    if (checkbox[2].checked) {
        alfabeto = alfabeto + numeros;
    }
    if (checkbox[3].checked) {
        alfabeto = alfabeto + simbolos;
    }
  
    let senha = '';
    for (let i = 0; i < tamanhoSenha; i++) {
        let numeroAleatorio = Math.random() * alfabeto.length;
        numeroAleatorio = Math.floor(numeroAleatorio);
        senha = senha + alfabeto[numeroAleatorio];
    }
    campoSenha.value = senha;
    classificaSenha(alfabeto.length);
}

// Função para classificar a força da senha
function classificaSenha(tamanhoAlfabeto) {
    let entropia = tamanhoSenha * Math.log2(tamanhoAlfabeto);
    forcaSenha.classList.remove('fraca', 'media', 'forte');
    
    if (entropia > 57) {
        forcaSenha.classList.add('forte');
    } else if (entropia > 35 && entropia <= 57) {
        forcaSenha.classList.add('media');
    } else if (entropia <= 35) {
        forcaSenha.classList.add('fraca');
    }
    
    const valorEntropia = document.querySelector('.entropia');
    valorEntropia.textContent = "Um computador pode levar até " + Math.floor(2**entropia/(100e6*60*60*24)) + " dias para descobrir essa senha.";
}

// Função para copiar senha atual
function copiarSenha() {
    if (campoSenha.value) {
        navigator.clipboard.writeText(campoSenha.value).then(() => {
            mostrarNotificacao('Senha copiada!');
        }).catch(() => {
            // Fallback para navegadores mais antigos
            campoSenha.select();
            document.execCommand('copy');
            mostrarNotificacao('Senha copiada!');
        });
    }
}

// Função para gerar nova senha e salvar no histórico
function gerarNovaSenha() {
    const senhaAnterior = campoSenha.value;
    geraSenha();
    
    if (senhaAnterior && senhaAnterior !== campoSenha.value) {
        salvarNoHistorico(senhaAnterior);
    }
}

// Função para salvar senha no histórico
function salvarNoHistorico(senha) {
    const agora = new Date();
    const novaEntrada = {
        id: Date.now(),
        senha: senha,
        data: agora.toLocaleString('pt-BR'),
        timestamp: agora.getTime()
    };
    
    // Evitar duplicatas
    if (!historicoSenhas.some(item => item.senha === senha)) {
        historicoSenhas.unshift(novaEntrada);
        
        // Limitar histórico a 50 senhas
        if (historicoSenhas.length > 50) {
            historicoSenhas = historicoSenhas.slice(0, 50);
        }
        
        localStorage.setItem('historicoSenhas', JSON.stringify(historicoSenhas));
        atualizarHistoricoUI();
    }
}

// Função para atualizar a interface do histórico
function atualizarHistoricoUI() {
    if (historicoSenhas.length === 0) {
        historicoLista.innerHTML = '<p class="historico-vazio">Nenhuma senha gerada ainda.</p>';
        return;
    }
    
    let html = '';
    historicoSenhas.forEach(item => {
        html += `
            <div class="historico-item" data-id="${item.id}">
                <span class="historico-senha">${item.senha}</span>
                <span class="historico-data">${item.data}</span>
                <div class="historico-acoes">
                    <button class="botao-copiar-historico" onclick="copiarDoHistorico('${item.senha}')">Copiar</button>
                    <button class="botao-remover" onclick="removerDoHistorico(${item.id})">Remover</button>
                </div>
            </div>
        `;
    });
    
    historicoLista.innerHTML = html;
}

// Função para copiar senha do histórico
function copiarDoHistorico(senha) {
    navigator.clipboard.writeText(senha).then(() => {
        mostrarNotificacao('Senha copiada do histórico!');
    }).catch(() => {
        // Fallback para navegadores mais antigos
        const tempInput = document.createElement('input');
        tempInput.value = senha;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        mostrarNotificacao('Senha copiada do histórico!');
    });
}

// Função para remover senha do histórico
function removerDoHistorico(id) {
    historicoSenhas = historicoSenhas.filter(item => item.id !== id);
    localStorage.setItem('historicoSenhas', JSON.stringify(historicoSenhas));
    atualizarHistoricoUI();
    mostrarNotificacao('Senha removida do histórico!');
}

// Função para mostrar modal de confirmação
function mostrarModalLimpar() {
    if (historicoSenhas.length === 0) {
        mostrarNotificacao('Histórico já está vazio!');
        return;
    }
    modal.style.display = 'block';
}

// Função para fechar modal
function fecharModal() {
    modal.style.display = 'none';
}

// Função para confirmar limpeza do histórico
function confirmarLimparHistorico() {
    historicoSenhas = [];
    localStorage.removeItem('historicoSenhas');
    atualizarHistoricoUI();
    fecharModal();
    mostrarNotificacao('Histórico limpo com sucesso!');
}

// Função para exportar histórico
function exportarHistorico() {
    if (historicoSenhas.length === 0) {
        mostrarNotificacao('Histórico vazio! Nada para exportar.');
        return;
    }
    
    let conteudo = 'Histórico de Senhas\n';
    conteudo += '==================\n\n';
    
    historicoSenhas.forEach((item, index) => {
        conteudo += `${index + 1}. Senha: ${item.senha}\n`;
        conteudo += `   Data: ${item.data}\n\n`;
    });
    
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_senhas_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    mostrarNotificacao('Histórico exportado com sucesso!');
}

// Função para mostrar notificações
function mostrarNotificacao(mensagem) {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.textContent = mensagem;
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #00FF85;
        color: #239089;
        padding: 12px 24px;
        border-radius: 4px;
        font-weight: bold;
        z-index: 1001;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(notificacao);
    
    // Remover após 3 segundos
    setTimeout(() => {
        if (document.body.contains(notificacao)) {
            document.body.removeChild(notificacao);
        }
    }, 3000);
}

// Inicialização
geraSenha();
atualizarHistoricoUI();