// ========================================
// APP.JS - Aplicação Principal Quiz USA
// ========================================

import { QuizEngine } from './quiz.js';
import { RankingManager } from './ranking.js';
import { TemasManager } from './temas.js';

// ========================================
// ESTADO DA APLICAÇÃO
// ========================================
const estado = {
    jogador: '',
    carregando: false
};

// Instâncias dos gerenciadores
const quizEngine = new QuizEngine();
const rankingManager = new RankingManager();
const temasManager = new TemasManager();

// ========================================
// ELEMENTOS DO DOM
// ========================================
const elementos = {
    // Telas
    telaLogin: document.getElementById('tela-login'),
    telaTemas: document.getElementById('tela-temas'),
    telaQuiz: document.getElementById('tela-quiz'),
    telaResultado: document.getElementById('tela-resultado'),
    
    // Login
    formLogin: document.getElementById('form-login'),
    inputNome: document.getElementById('nome-jogador'),
    displayJogador: document.getElementById('display-jogador'),
    btnTrocarJogador: document.getElementById('btn-trocar-jogador'),
    
    // Temas
    temasGrid: document.getElementById('temas-grid'),
    btnAleatorio: document.getElementById('btn-aleatorio'),
    btnJogar: document.getElementById('btn-jogar'),
    selecaoInfo: document.getElementById('selecao-info'),
    btnVerRanking: document.getElementById('btn-ver-ranking'),
    
    // Quiz
    quizTemaInfo: document.getElementById('quiz-tema-info'),
    perguntaContador: document.getElementById('pergunta-contador'),
    pontosAtuais: document.getElementById('pontos-atuais'),
    faseLeitura: document.getElementById('fase-leitura'),
    countdownNumero: document.getElementById('countdown-numero'),
    perguntaEnunciado: document.getElementById('pergunta-enunciado'),
    perguntaTema: document.getElementById('pergunta-tema'),
    alternativasContainer: document.getElementById('alternativas-container'),
    cronometroTempo: document.getElementById('cronometro-tempo'),
    alternativas: document.getElementById('alternativas'),
    feedbackContainer: document.getElementById('feedback-container'),
    feedbackIcon: document.getElementById('feedback-icon'),
    feedbackTexto: document.getElementById('feedback-texto'),
    feedbackPontos: document.getElementById('feedback-pontos'),
    feedback: document.getElementById('feedback'),
    
    // Resultado
    resultadoTemas: document.getElementById('resultado-temas'),
    resultadoPontuacao: document.getElementById('resultado-pontuacao'),
    resultadoAcertos: document.getElementById('resultado-acertos'),
    resultadoTempo: document.getElementById('resultado-tempo'),
    detalhesLista: document.getElementById('detalhes-lista'),
    rankingPartidaBody: document.getElementById('ranking-partida-body'),
    btnVoltarTemas: document.getElementById('btn-voltar-temas'),
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
            
            // Carrega histórico do jogador
            await rankingManager.carregarHistorico();
            
            // Atualiza display e vai para seleção de temas
            elementos.displayJogador.textContent = nome;
            await carregarTemas();
            mostrarTela('temas');
        }
    });
}

// ========================================
// TELA DE SELEÇÃO DE TEMAS
// ========================================
async function carregarTemas() {
    estado.carregando = true;
    
    try {
        await temasManager.carregarTemas();
        renderizarTemas();
    } catch (error) {
        console.error('Erro ao carregar temas:', error);
    } finally {
        estado.carregando = false;
    }
}

function renderizarTemas() {
    const temas = temasManager.obterTemas();
    
    elementos.temasGrid.innerHTML = '';
    
    temas.forEach(tema => {
        const selecionado = temasManager.temaSelecionado(tema.id);
        
        const card = document.createElement('div');
        card.className = `tema-card${selecionado ? ' selecionado' : ''}`;
        card.dataset.temaId = tema.id;
        
        card.innerHTML = `
            <span class="tema-icone">${tema.icone}</span>
            <h3 class="tema-nome">${tema.nome}</h3>
            <span class="tema-contador">${tema.totalPerguntas || 0} perguntas</span>
        `;
        
        card.addEventListener('click', () => {
            temasManager.alternarTema(tema.id);
            atualizarUITemas();
        });
        
        elementos.temasGrid.appendChild(card);
    });
    
    atualizarUITemas();
}

function atualizarUITemas() {
    // Atualiza cards de temas
    document.querySelectorAll('.tema-card').forEach(card => {
        const temaId = card.dataset.temaId;
        if (temasManager.temaSelecionado(temaId)) {
            card.classList.add('selecionado');
        } else {
            card.classList.remove('selecionado');
        }
    });
    
    // Atualiza botão aleatório
    if (temasManager.isModoAleatorio()) {
        elementos.btnAleatorio.classList.add('ativo');
    } else {
        elementos.btnAleatorio.classList.remove('ativo');
    }
    
    // Atualiza info de seleção
    const descricao = temasManager.gerarDescricaoSelecao();
    const totalPerguntas = temasManager.totalPerguntasDisponiveis();
    
    if (temasManager.podeIniciar()) {
        elementos.selecaoInfo.textContent = `${descricao} (${totalPerguntas} perguntas disponíveis)`;
        elementos.btnJogar.disabled = false;
    } else {
        elementos.selecaoInfo.textContent = 'Selecione um ou mais temas para jogar';
        elementos.btnJogar.disabled = true;
    }
}

function inicializarTemas() {
    // Botão aleatório - já inicia o jogo direto
    elementos.btnAleatorio.addEventListener('click', async () => {
        temasManager.setModoAleatorio(true);
        await iniciarQuiz();
    });
    
    // Botão jogar
    elementos.btnJogar.addEventListener('click', async () => {
        if (!temasManager.podeIniciar()) return;
        await iniciarQuiz();
    });
    
    // Botão trocar jogador
    elementos.btnTrocarJogador.addEventListener('click', () => {
        mostrarTela('login');
    });
    
    // Botão ver ranking
    elementos.btnVerRanking.addEventListener('click', () => {
        mostrarRankingGlobal();
    });
    
    // Callback quando seleção muda
    temasManager.onSelecaoAlterada = () => {
        atualizarUITemas();
    };
}

// ========================================
// TELA DE QUIZ
// ========================================
async function iniciarQuiz() {
    estado.carregando = true;
    elementos.btnJogar.disabled = true;
    elementos.btnJogar.textContent = 'Carregando...';
    
    try {
        // Busca perguntas
        const perguntas = await temasManager.buscarPerguntas(10);
        
        if (perguntas.length === 0) {
            alert('Não há perguntas disponíveis para os temas selecionados.');
            return;
        }
        
        // Prepara configuração dos temas
        const configTemas = temasManager.serializarParaResultado();
        
        // Atualiza UI
        elementos.quizTemaInfo.textContent = configTemas.descricao;
        elementos.pontosAtuais.textContent = '0';
        
        // Configura callbacks do quiz engine
        configurarCallbacksQuiz();
        
        // Inicia o quiz
        quizEngine.iniciar(perguntas, configTemas);
        
        // Mostra tela do quiz
        mostrarTela('quiz');
    } catch (error) {
        console.error('Erro ao iniciar quiz:', error);
        alert('Erro ao carregar perguntas. Tente novamente.');
    } finally {
        estado.carregando = false;
        elementos.btnJogar.disabled = false;
        elementos.btnJogar.textContent = 'Jogar';
    }
}

function configurarCallbacksQuiz() {
    quizEngine.onPerguntaCarregada = ({ numero, total, pergunta, tema }) => {
        elementos.perguntaContador.textContent = `${numero}/${total}`;
        elementos.perguntaEnunciado.textContent = pergunta.enunciado;
        
        // Mostra o tema da pergunta se disponível
        if (elementos.perguntaTema && tema) {
            const temaObj = temasManager.obterTemaPorId(tema);
            if (temaObj) {
                elementos.perguntaTema.textContent = `${temaObj.icone} ${temaObj.nome}`;
                elementos.perguntaTema.classList.remove('oculto');
            }
        }
        
        // Reseta estados visuais
        elementos.feedbackContainer.classList.add('oculto');
        elementos.alternativasContainer.classList.add('oculto');
        
        // Limpa alternativas anteriores para forçar nova renderização
        elementos.alternativas.innerHTML = '';
        elementos.alternativas.dataset.perguntaId = '';
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
            const perguntaAtual = quizEngine.perguntas[quizEngine.perguntaAtual];
            if (elementos.alternativas.children.length === 0 || 
                elementos.alternativas.dataset.perguntaId !== perguntaAtual.id) {
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
    elementos.resultadoTemas.textContent = resultado.descricaoTemas;
    elementos.resultadoPontuacao.textContent = resultado.pontuacaoTotal;
    elementos.resultadoAcertos.textContent = `${resultado.acertos}/${resultado.totalPerguntas}`;
    elementos.resultadoTempo.textContent = rankingManager.formatarTempo(resultado.tempoTotal);
    
    // Renderiza detalhes por pergunta
    elementos.detalhesLista.innerHTML = '';
    resultado.detalhes.forEach((detalhe, index) => {
        const item = document.createElement('div');
        item.className = `detalhe-item ${detalhe.correto ? 'correto' : 'errado'}`;
        
        // Busca info do tema
        let temaInfo = '';
        if (detalhe.tema) {
            const temaObj = temasManager.obterTemaPorId(detalhe.tema);
            if (temaObj) {
                temaInfo = `<span class="detalhe-tema">${temaObj.icone}</span>`;
            }
        }
        
        item.innerHTML = `
            <span class="detalhe-numero">#${index + 1}</span>
            ${temaInfo}
            <span class="detalhe-tempo">${detalhe.tempo}s</span>
            <span class="detalhe-pontos">${detalhe.pontosTotais} pts</span>
        `;
        elementos.detalhesLista.appendChild(item);
    });
    
    // Carrega ranking
    await carregarRankingPartida(resultado.temas);
    
    // Mostra tela de resultado
    mostrarTela('resultado');
}

async function carregarRankingPartida(temas) {
    const ranking = await rankingManager.obterRankingGlobal(20);
    
    elementos.rankingPartidaBody.innerHTML = '';
    
    if (ranking.length === 0) {
        elementos.rankingPartidaBody.innerHTML = `
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
        
        const temasDisplay = rankingManager.formatarTemas(item.temasNomes || item.temas);
        
        tr.innerHTML = `
            <td>${index + 1}º</td>
            <td>${item.jogador}${isJogadorAtual ? ' (você)' : ''}</td>
            <td>${temasDisplay}</td>
            <td>${item.pontuacaoTotal}</td>
            <td>${item.acertos}/${item.totalPerguntas || 10}</td>
        `;
        elementos.rankingPartidaBody.appendChild(tr);
    });
}

function inicializarResultado() {
    elementos.btnVoltarTemas.addEventListener('click', () => {
        temasManager.limparSelecao();
        renderizarTemas();
        mostrarTela('temas');
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
            
            const temasDisplay = rankingManager.formatarTemas(item.temasNomes || item.temas);
            
            tr.innerHTML = `
                <td>${index + 1}º</td>
                <td>${item.jogador}${isJogadorAtual ? ' (você)' : ''}</td>
                <td>${temasDisplay}</td>
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
    
    // Inicializa módulos
    inicializarLogin();
    inicializarTemas();
    inicializarResultado();
    inicializarModal();
    
    // Verifica se existe jogador salvo
    const jogadorSalvo = localStorage.getItem('quiz_jogador');
    if (jogadorSalvo) {
        estado.jogador = jogadorSalvo;
        rankingManager.setJogador(jogadorSalvo);
        await rankingManager.carregarHistorico();
        elementos.displayJogador.textContent = jogadorSalvo;
        elementos.inputNome.value = jogadorSalvo;
    }
    
    console.log('✅ Quiz USA - Pronto!');
}

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
