// ========================================
// APP.JS - Aplicação Principal Quiz USA
// ========================================

import { QuizEngine } from './quiz.js';
import { RankingManager } from './ranking.js';

// ========================================
// ESTADO DA APLICAÇÃO
// ========================================
const estado = {
    jogador: '',
    salas: [],
    paginaAtual: 1,
    salasPorPagina: 6,
    salaAtual: null
};

// Instâncias dos gerenciadores
const quizEngine = new QuizEngine();
const rankingManager = new RankingManager();

// ========================================
// ELEMENTOS DO DOM
// ========================================
const elementos = {
    // Telas
    telaLogin: document.getElementById('tela-login'),
    telaSalas: document.getElementById('tela-salas'),
    telaQuiz: document.getElementById('tela-quiz'),
    telaResultado: document.getElementById('tela-resultado'),
    
    // Login
    formLogin: document.getElementById('form-login'),
    inputNome: document.getElementById('nome-jogador'),
    displayJogador: document.getElementById('display-jogador'),
    btnTrocarJogador: document.getElementById('btn-trocar-jogador'),
    
    // Salas
    salasGrid: document.getElementById('salas-grid'),
    btnAnterior: document.getElementById('btn-anterior'),
    btnProxima: document.getElementById('btn-proxima'),
    paginaInfo: document.getElementById('pagina-info'),
    btnVerRanking: document.getElementById('btn-ver-ranking'),
    
    // Quiz
    quizSalaNome: document.getElementById('quiz-sala-nome'),
    perguntaContador: document.getElementById('pergunta-contador'),
    pontosAtuais: document.getElementById('pontos-atuais'),
    faseLeitura: document.getElementById('fase-leitura'),
    countdownNumero: document.getElementById('countdown-numero'),
    perguntaEnunciado: document.getElementById('pergunta-enunciado'),
    alternativasContainer: document.getElementById('alternativas-container'),
    cronometroTempo: document.getElementById('cronometro-tempo'),
    alternativas: document.getElementById('alternativas'),
    feedbackContainer: document.getElementById('feedback-container'),
    feedbackIcon: document.getElementById('feedback-icon'),
    feedbackTexto: document.getElementById('feedback-texto'),
    feedbackPontos: document.getElementById('feedback-pontos'),
    feedback: document.getElementById('feedback'),
    
    // Resultado
    salaFinalizada: document.getElementById('sala-finalizada'),
    resultadoPontuacao: document.getElementById('resultado-pontuacao'),
    resultadoAcertos: document.getElementById('resultado-acertos'),
    resultadoTempo: document.getElementById('resultado-tempo'),
    detalhesLista: document.getElementById('detalhes-lista'),
    rankingSalaBody: document.getElementById('ranking-sala-body'),
    btnVoltarSalas: document.getElementById('btn-voltar-salas'),
    btnRankingGlobal: document.getElementById('btn-ranking-global'),
    
    // Modal
    modalRanking: document.getElementById('modal-ranking'),
    modalFechar: document.getElementById('modal-fechar'),
    rankingGlobalBody: document.getElementById('ranking-global-body')
};

// ========================================
// NAVEGAÇÃO ENTRE TELAS
// ========================================
function mostrarTela(telaNome) {
    // Oculta todas as telas
    document.querySelectorAll('.tela').forEach(tela => {
        tela.classList.remove('ativa');
    });
    
    // Mostra a tela selecionada
    const tela = document.getElementById(`tela-${telaNome}`);
    if (tela) {
        tela.classList.add('ativa');
    }
}

// ========================================
// CARREGAMENTO DE DADOS
// ========================================
async function carregarPerguntas() {
    try {
        const response = await fetch('data/perguntas.json');
        const data = await response.json();
        estado.salas = data.salas;
        console.log('Perguntas carregadas:', estado.salas.length, 'salas');
    } catch (error) {
        console.error('Erro ao carregar perguntas:', error);
        estado.salas = [];
    }
}

// ========================================
// TELA DE LOGIN
// ========================================
function inicializarLogin() {
    // Verifica se já existe um jogador salvo
    const jogadorSalvo = localStorage.getItem('quiz_jogador');
    if (jogadorSalvo) {
        estado.jogador = jogadorSalvo;
        rankingManager.setJogador(jogadorSalvo);
        elementos.inputNome.value = jogadorSalvo;
    }
    
    elementos.formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = elementos.inputNome.value.trim();
        
        if (nome.length >= 2) {
            estado.jogador = nome;
            localStorage.setItem('quiz_jogador', nome);
            rankingManager.setJogador(nome);
            
            // Carrega salas jogadas pelo jogador
            await rankingManager.carregarSalasJogadas();
            
            // Atualiza display e vai para seleção de salas
            elementos.displayJogador.textContent = nome;
            renderizarSalas();
            mostrarTela('salas');
        }
    });
}

// ========================================
// TELA DE SALAS
// ========================================
function renderizarSalas() {
    const inicio = (estado.paginaAtual - 1) * estado.salasPorPagina;
    const fim = inicio + estado.salasPorPagina;
    const salasPagina = estado.salas.slice(inicio, fim);
    
    elementos.salasGrid.innerHTML = '';
    
    salasPagina.forEach(sala => {
        const jaJogada = rankingManager.salaJaJogada(sala.id);
        
        const card = document.createElement('div');
        card.className = `sala-card${jaJogada ? ' concluida' : ''}`;
        card.innerHTML = `
            <span class="sala-icone">${sala.icone}</span>
            <h3 class="sala-nome">${sala.nome}</h3>
            <p class="sala-descricao">${sala.descricao}</p>
        `;
        
        if (!jaJogada) {
            card.addEventListener('click', () => iniciarQuiz(sala));
        }
        
        elementos.salasGrid.appendChild(card);
    });
    
    // Atualiza paginação
    const totalPaginas = Math.ceil(estado.salas.length / estado.salasPorPagina);
    elementos.paginaInfo.textContent = `Página ${estado.paginaAtual} de ${totalPaginas}`;
    elementos.btnAnterior.disabled = estado.paginaAtual <= 1;
    elementos.btnProxima.disabled = estado.paginaAtual >= totalPaginas;
}

function inicializarSalas() {
    elementos.btnAnterior.addEventListener('click', () => {
        if (estado.paginaAtual > 1) {
            estado.paginaAtual--;
            renderizarSalas();
        }
    });
    
    elementos.btnProxima.addEventListener('click', () => {
        const totalPaginas = Math.ceil(estado.salas.length / estado.salasPorPagina);
        if (estado.paginaAtual < totalPaginas) {
            estado.paginaAtual++;
            renderizarSalas();
        }
    });
    
    elementos.btnTrocarJogador.addEventListener('click', () => {
        mostrarTela('login');
    });
    
    elementos.btnVerRanking.addEventListener('click', () => {
        mostrarRankingGlobal();
    });
}

// ========================================
// TELA DE QUIZ
// ========================================
function iniciarQuiz(sala) {
    estado.salaAtual = sala;
    
    // Atualiza UI
    elementos.quizSalaNome.textContent = sala.nome;
    elementos.pontosAtuais.textContent = '0';
    
    // Configura callbacks do quiz engine
    configurarCallbacksQuiz();
    
    // Inicia o quiz
    quizEngine.iniciar(sala);
    
    // Mostra tela do quiz
    mostrarTela('quiz');
}

function configurarCallbacksQuiz() {
    quizEngine.onPerguntaCarregada = ({ numero, total, pergunta }) => {
        elementos.perguntaContador.textContent = `${numero}/${total}`;
        elementos.perguntaEnunciado.textContent = pergunta.enunciado;
        
        // Reseta estados visuais
        elementos.feedbackContainer.classList.add('oculto');
        elementos.alternativasContainer.classList.add('oculto');
    };
    
    quizEngine.onFaseLeitura = ({ segundos, ativa }) => {
        if (ativa) {
            elementos.faseLeitura.classList.remove('oculto');
            elementos.countdownNumero.textContent = segundos;
        } else {
            elementos.faseLeitura.classList.add('oculto');
        }
    };
    
    quizEngine.onFaseResposta = ({ ativa, tempo }) => {
        if (ativa) {
            elementos.faseLeitura.classList.add('oculto');
            elementos.alternativasContainer.classList.remove('oculto');
            elementos.cronometroTempo.textContent = `${tempo.toFixed(1)}s`;
            
            // Renderiza alternativas apenas uma vez
            if (elementos.alternativas.children.length === 0 || 
                elementos.alternativas.dataset.perguntaId !== quizEngine.perguntas[quizEngine.perguntaAtual].id.toString()) {
                renderizarAlternativas();
            }
        }
    };
    
    quizEngine.onPontuacaoAtualizada = (pontuacao) => {
        elementos.pontosAtuais.textContent = pontuacao;
    };
    
    quizEngine.onRespostaProcessada = (resultado) => {
        mostrarFeedback(resultado);
    };
    
    quizEngine.onQuizFinalizado = (resultado) => {
        mostrarResultado(resultado);
    };
}

function renderizarAlternativas() {
    const pergunta = quizEngine.perguntas[quizEngine.perguntaAtual];
    elementos.alternativas.innerHTML = '';
    elementos.alternativas.dataset.perguntaId = pergunta.id;
    
    pergunta.alternativas.forEach((texto, indice) => {
        const btn = document.createElement('button');
        btn.className = 'alternativa-btn';
        btn.textContent = texto;
        btn.addEventListener('click', () => {
            quizEngine.responder(indice);
        });
        elementos.alternativas.appendChild(btn);
    });
}

function mostrarFeedback(resultado) {
    const { correta, indiceCorreto, indiceEscolhido, pontosGanhos, bonus } = resultado;
    
    // Destaca a alternativa correta/errada
    const botoes = elementos.alternativas.querySelectorAll('.alternativa-btn');
    botoes.forEach((btn, i) => {
        btn.disabled = true;
        if (i === indiceCorreto) {
            btn.classList.add('correta');
        }
        if (i === indiceEscolhido && !correta) {
            btn.classList.add('errada');
        }
    });
    
    // Mostra feedback
    elementos.feedback.className = `feedback ${correta ? 'correto' : 'errado'}`;
    elementos.feedbackIcon.textContent = correta ? '✓' : '✗';
    elementos.feedbackTexto.textContent = correta ? 'Correto!' : 'Errado!';
    
    if (correta) {
        const bonusTexto = bonus > 0 ? ` (+${bonus} bônus)` : '';
        elementos.feedbackPontos.textContent = `+${pontosGanhos} pts${bonusTexto}`;
    } else {
        elementos.feedbackPontos.textContent = '0 pts';
    }
    
    elementos.feedbackContainer.classList.remove('oculto');
    
    // Avança para próxima pergunta após 1.5 segundos
    setTimeout(() => {
        quizEngine.proximaPergunta();
    }, 1500);
}

// ========================================
// TELA DE RESULTADO
// ========================================
async function mostrarResultado(resultado) {
    // Adiciona jogador ao resultado
    resultado.jogador = estado.jogador;
    
    // Salva no Firebase
    await rankingManager.salvarResultadoPartida(resultado);
    
    // Atualiza UI
    elementos.salaFinalizada.textContent = resultado.salaNome;
    elementos.resultadoPontuacao.textContent = resultado.pontuacaoTotal;
    elementos.resultadoAcertos.textContent = `${resultado.acertos}/${resultado.totalPerguntas}`;
    elementos.resultadoTempo.textContent = rankingManager.formatarTempo(resultado.tempoTotal);
    
    // Renderiza detalhes por pergunta
    elementos.detalhesLista.innerHTML = '';
    resultado.detalhes.forEach((detalhe, index) => {
        const item = document.createElement('div');
        item.className = `detalhe-item ${detalhe.correto ? 'correto' : 'errado'}`;
        item.innerHTML = `
            <span class="detalhe-numero">#${index + 1}</span>
            <span class="detalhe-tempo">${detalhe.tempo}s</span>
            <span class="detalhe-pontos">${detalhe.pontosTotais} pts</span>
        `;
        elementos.detalhesLista.appendChild(item);
    });
    
    // Carrega ranking da sala
    await carregarRankingSala(resultado.salaId);
    
    // Mostra tela de resultado
    mostrarTela('resultado');
}

async function carregarRankingSala(salaId) {
    const ranking = await rankingManager.obterRankingSala(salaId);
    
    elementos.rankingSalaBody.innerHTML = '';
    
    if (ranking.length === 0) {
        elementos.rankingSalaBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #9ca3af;">
                    Nenhum resultado ainda
                </td>
            </tr>
        `;
        return;
    }
    
    ranking.forEach((item, index) => {
        const isJogadorAtual = item.jogador === estado.jogador;
        const tr = document.createElement('tr');
        tr.className = isJogadorAtual ? 'destaque' : '';
        tr.innerHTML = `
            <td>${index + 1}º</td>
            <td>${item.jogador}${isJogadorAtual ? ' (você)' : ''}</td>
            <td>${item.pontuacaoTotal}</td>
            <td>${item.acertos}/${item.totalPerguntas || 10}</td>
            <td>${rankingManager.formatarTempo(item.tempoTotal)}</td>
        `;
        elementos.rankingSalaBody.appendChild(tr);
    });
}

function inicializarResultado() {
    elementos.btnVoltarSalas.addEventListener('click', () => {
        renderizarSalas();
        mostrarTela('salas');
    });
    
    elementos.btnRankingGlobal.addEventListener('click', () => {
        mostrarRankingGlobal();
    });
}

// ========================================
// MODAL DE RANKING GLOBAL
// ========================================
async function mostrarRankingGlobal() {
    const ranking = await rankingManager.obterRankingGlobal();
    
    elementos.rankingGlobalBody.innerHTML = '';
    
    if (ranking.length === 0) {
        elementos.rankingGlobalBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; color: #9ca3af;">
                    Nenhum resultado ainda
                </td>
            </tr>
        `;
    } else {
        ranking.forEach((item, index) => {
            const isJogadorAtual = item.jogador === estado.jogador;
            const tr = document.createElement('tr');
            tr.className = isJogadorAtual ? 'destaque' : '';
            tr.innerHTML = `
                <td>${index + 1}º</td>
                <td>${item.jogador}${isJogadorAtual ? ' (você)' : ''}</td>
                <td>${item.salaNome || item.salaId}</td>
                <td>${item.pontuacaoTotal}</td>
                <td>${item.acertos}/${item.totalPerguntas || 10}</td>
                <td>${rankingManager.formatarTempo(item.tempoTotal)}</td>
            `;
            elementos.rankingGlobalBody.appendChild(tr);
        });
    }
    
    elementos.modalRanking.classList.remove('oculto');
}

function inicializarModal() {
    elementos.modalFechar.addEventListener('click', () => {
        elementos.modalRanking.classList.add('oculto');
    });
    
    elementos.modalRanking.addEventListener('click', (e) => {
        if (e.target === elementos.modalRanking) {
            elementos.modalRanking.classList.add('oculto');
        }
    });
}

// ========================================
// INICIALIZAÇÃO
// ========================================
async function init() {
    console.log('🇺🇸 Quiz USA - Iniciando...');
    
    // Carrega dados
    await carregarPerguntas();
    
    // Inicializa módulos
    inicializarLogin();
    inicializarSalas();
    inicializarResultado();
    inicializarModal();
    
    // Verifica se existe jogador salvo
    const jogadorSalvo = localStorage.getItem('quiz_jogador');
    if (jogadorSalvo && estado.salas.length > 0) {
        estado.jogador = jogadorSalvo;
        rankingManager.setJogador(jogadorSalvo);
        await rankingManager.carregarSalasJogadas();
        elementos.displayJogador.textContent = jogadorSalvo;
        elementos.inputNome.value = jogadorSalvo;
    }
    
    console.log('✅ Quiz USA - Pronto!');
}

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
