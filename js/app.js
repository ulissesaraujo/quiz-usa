// ========================================
// APP.JS - Aplicação Principal Quizlândia
// ========================================

import { QuizEngine } from './quiz.js';
import { RankingManager } from './ranking.js';
import { TemasManager } from './temas.js';
import { buscarPerguntasPorIds } from './firebase-config.js';
import { Anunciador, GerenciadorFoco, NavegacaoTeclado } from './acessibilidade.js';

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
    badgeSelecionados: document.getElementById('badge-selecionados'),
    selecaoInfo: document.getElementById('selecao-info'),
    btnVerRankingSalas: document.getElementById('btn-ver-ranking-salas'),
    btnVerRankingGeral: document.getElementById('btn-ver-ranking-geral'),
    
    // Quiz
    quizTemaInfo: document.getElementById('quiz-tema-info'),
    perguntaContador: document.getElementById('pergunta-contador'),
    pontosAtuais: document.getElementById('pontos-atuais'),
    faseLeitura: document.getElementById('fase-leitura'),
    countdownNumero: document.getElementById('countdown-numero'),
    perguntaEnunciado: document.getElementById('pergunta-enunciado'),
    perguntaTema: document.getElementById('pergunta-tema'),
    alternativasContainer: document.getElementById('alternativas-container'),
    cronometro: document.getElementById('cronometro'),
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
    resultadoMensagem: document.getElementById('resultado-mensagem'),
    detalhesLista: document.getElementById('detalhes-lista'),
    rankingPartidaBody: document.getElementById('ranking-partida-body'),
    btnVoltarTemas: document.getElementById('btn-voltar-temas'),
    btnRankingGlobal: document.getElementById('btn-ranking-global'),
    
    // Modal Ranking por Sala
    modalRanking: document.getElementById('modal-ranking'),
    modalFechar: document.getElementById('modal-fechar'),
    rankingGlobalBody: document.getElementById('ranking-global-body'),
    
    // Modal Ranking Geral
    modalRankingGeral: document.getElementById('modal-ranking-geral'),
    modalFecharGeral: document.getElementById('modal-fechar-geral'),
    rankingGeralBody: document.getElementById('ranking-geral-body')
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
        
        // Gerencia foco para acessibilidade
        GerenciadorFoco.moverFoco(`tela-${telaNome}`);
        
        // Anuncia mudança de tela para leitores de tela
        const titulosTelas = {
            'login': 'Tela de login',
            'temas': 'Seleção de temas',
            'quiz': 'Quiz iniciado',
            'resultado': 'Resultado da partida'
        };
        
        if (titulosTelas[telaNome]) {
            Anunciador.anunciar(titulosTelas[telaNome]);
        }
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
    
    temas.forEach((tema, index) => {
        const selecionado = temasManager.temaSelecionado(tema.id);
        
        const card = document.createElement('div');
        card.className = `tema-card${selecionado ? ' selecionado' : ''}`;
        card.dataset.temaId = tema.id;
        
        // Atributos de acessibilidade
        card.setAttribute('role', 'checkbox');
        card.setAttribute('aria-checked', selecionado ? 'true' : 'false');
        card.setAttribute('aria-label', `${tema.nome}, ${tema.totalPerguntas || 0} perguntas${selecionado ? ', selecionado' : ''}`);
        card.setAttribute('tabindex', '0');
        
        card.innerHTML = `
            <span class="tema-icone" aria-hidden="true">${tema.icone}</span>
            <h3 class="tema-nome">${tema.nome}</h3>
            <span class="tema-contador">${tema.totalPerguntas || 0} perguntas</span>
        `;
        
        // Click handler
        card.addEventListener('click', () => {
            temasManager.alternarTema(tema.id);
            atualizarUITemas();
        });
        
        // Keyboard handler para ativar com Enter ou Space
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                temasManager.alternarTema(tema.id);
                atualizarUITemas();
            }
        });
        
        elementos.temasGrid.appendChild(card);
    });
    
    atualizarUITemas();
}

function atualizarUITemas() {
    const temas = temasManager.obterTemas();
    const temasSelecionados = temasManager.obterTemasSelecionados();
    const numSelecionados = temasSelecionados.length;
    const modoAleatorio = temasManager.isModoAleatorio();
    
    // Atualiza cards de temas
    document.querySelectorAll('.tema-card').forEach(card => {
        const temaId = card.dataset.temaId;
        const selecionado = temasManager.temaSelecionado(temaId);
        const tema = temas.find(t => t.id === temaId);
        
        if (selecionado) {
            card.classList.add('selecionado');
        } else {
            card.classList.remove('selecionado');
        }
        
        // Atualiza ARIA
        card.setAttribute('aria-checked', selecionado ? 'true' : 'false');
        if (tema) {
            card.setAttribute('aria-label', `${tema.nome}, ${tema.totalPerguntas || 0} perguntas${selecionado ? ', selecionado' : ''}`);
        }
    });
    
    // Atualiza botão aleatório
    if (modoAleatorio) {
        elementos.btnAleatorio.classList.add('ativo');
        elementos.btnAleatorio.setAttribute('aria-pressed', 'true');
    } else {
        elementos.btnAleatorio.classList.remove('ativo');
        elementos.btnAleatorio.setAttribute('aria-pressed', 'false');
    }
    
    // Atualiza badge do botão jogar
    if (numSelecionados > 0 && !modoAleatorio) {
        elementos.badgeSelecionados.textContent = numSelecionados;
        elementos.badgeSelecionados.classList.remove('oculto');
    } else {
        elementos.badgeSelecionados.classList.add('oculto');
    }
    
    // Atualiza estado do botão jogar
    const podeIniciar = temasManager.podeIniciar();
    elementos.btnJogar.disabled = !podeIniciar;
    elementos.btnJogar.setAttribute('aria-disabled', !podeIniciar ? 'true' : 'false');
    
    // Atualiza info de seleção (mais discreto)
    const totalPerguntas = temasManager.totalPerguntasDisponiveis();
    if (podeIniciar) {
        const descricao = temasManager.gerarDescricaoSelecao();
        elementos.selecaoInfo.textContent = `${descricao} • ${totalPerguntas} perguntas`;
    } else {
        elementos.selecaoInfo.textContent = '';
    }
}

function inicializarTemas() {
    // Botão aleatório - vai direto para o jogo com temas aleatórios
    elementos.btnAleatorio.addEventListener('click', async () => {
        temasManager.setModoAleatorio(true);
        atualizarUITemas();
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
    
    // Botão ver ranking por sala (agrupado)
    elementos.btnVerRankingSalas.addEventListener('click', () => {
        mostrarRankingGlobal();
    });
    
    // Botão ver ranking geral (lista simples)
    elementos.btnVerRankingGeral.addEventListener('click', () => {
        mostrarRankingGeral();
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

/**
 * Inicia um desafio - joga com as mesmas perguntas de outro jogador
 * @param {Object} partidaOriginal - Dados da partida a ser desafiada
 */
async function iniciarDesafio(partidaOriginal) {
    // Determina o ID da sessão original (pode ser a própria sessão ou uma sessão que ela desafiou)
    const sessaoOriginalId = partidaOriginal.sessaoOriginalId || partidaOriginal.sessaoId;
    
    // Verifica se o jogador já jogou esta sessão
    if (rankingManager.jaJogouSessao(sessaoOriginalId)) {
        alert('Você já jogou este desafio! Não é possível jogar novamente as mesmas perguntas.');
        return;
    }
    
    // Verifica se a partida tem os IDs das perguntas
    if (!partidaOriginal.perguntasIds || partidaOriginal.perguntasIds.length === 0) {
        alert('Esta partida não suporta desafio (formato antigo).');
        return;
    }
    
    estado.carregando = true;
    
    try {
        // Fecha o modal se estiver aberto
        elementos.modalRanking.classList.add('oculto');
        
        // Busca as perguntas específicas pelo ID
        const perguntas = await buscarPerguntasPorIds(partidaOriginal.perguntasIds);
        
        if (perguntas.length === 0) {
            alert('Não foi possível carregar as perguntas do desafio.');
            return;
        }
        
        // Prepara configuração do desafio
        const configDesafio = {
            temas: partidaOriginal.temas || [],
            temasNomes: partidaOriginal.temasNomes || [],
            modoAleatorio: partidaOriginal.modoAleatorio || false,
            descricao: `⚔️ Desafio: ${partidaOriginal.jogador}`,
            modoDesafio: true,
            sessaoOriginalId: sessaoOriginalId,
            jogadorDesafiado: partidaOriginal.jogador
        };
        
        // Atualiza UI
        elementos.quizTemaInfo.textContent = configDesafio.descricao;
        elementos.pontosAtuais.textContent = '0';
        
        // Configura callbacks do quiz engine
        configurarCallbacksQuiz();
        
        // Inicia o quiz em modo desafio
        quizEngine.iniciar(perguntas, configDesafio);
        
        console.log(`⚔️ Desafio iniciado contra ${partidaOriginal.jogador}`);
        
        // Mostra tela do quiz
        mostrarTela('quiz');
    } catch (error) {
        console.error('Erro ao iniciar desafio:', error);
        alert('Erro ao carregar o desafio. Tente novamente.');
    } finally {
        estado.carregando = false;
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
            elementos.cronometro.classList.remove('oculto');
            elementos.cronometroTempo.textContent = `${tempo.toFixed(1)}s`;
            
            // Muda cor do cronômetro conforme o tempo
            elementos.cronometroTempo.classList.remove('alerta', 'critico');
            if (tempo >= 8) {
                elementos.cronometroTempo.classList.add('critico');
            } else if (tempo >= 6) {
                elementos.cronometroTempo.classList.add('alerta');
            }
            
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
    
    // Letras das alternativas para anúncios
    const letras = ['A', 'B', 'C', 'D'];
    
    pergunta.alternativas.forEach((texto, indice) => {
        const btn = document.createElement('button');
        btn.className = 'alternativa-btn';
        btn.textContent = texto;
        
        // Atributos de acessibilidade
        btn.setAttribute('aria-label', `Alternativa ${letras[indice]}: ${texto}. Pressione ${indice + 1} para selecionar.`);
        btn.setAttribute('data-indice', indice);
        
        btn.addEventListener('click', () => {
            quizEngine.responder(indice);
        });
        elementos.alternativas.appendChild(btn);
    });
    
    // Ativa navegação por teclado (1-4) para alternativas
    NavegacaoTeclado.ativarAtalhos(elementos.alternativas, (indice) => {
        const btn = elementos.alternativas.querySelector(`[data-indice="${indice}"]`);
        if (btn && !btn.disabled) {
            quizEngine.responder(indice);
        }
    });
}

function mostrarFeedback(resultado) {
    const { correta, indiceCorreto, indiceEscolhido, pontosGanhos, bonus, tempoEsgotado, tempo } = resultado;
    
    // Oculta o cronômetro durante o feedback
    elementos.cronometro.classList.add('oculto');
    
    // Destaca a alternativa correta/errada
    const botoes = elementos.alternativas.querySelectorAll('.alternativa-btn');
    botoes.forEach((btn, i) => {
        btn.disabled = true;
        if (i === indiceCorreto) {
            btn.classList.add('correta');
        }
        if (i === indiceEscolhido && !correta && indiceEscolhido >= 0) {
            btn.classList.add('errada');
        }
    });
    
    // Mostra feedback
    elementos.feedback.className = `feedback ${correta ? 'correto' : 'errado'}`;
    
    // Formata o tempo
    const tempoFormatado = tempo ? `${tempo.toFixed(1)}s` : '';
    
    if (tempoEsgotado) {
        elementos.feedbackIcon.textContent = '⏱️';
        elementos.feedbackTexto.textContent = 'Tempo esgotado!';
        elementos.feedbackPontos.textContent = '0 pts';
    } else if (correta) {
        elementos.feedbackIcon.textContent = '✓';
        elementos.feedbackTexto.textContent = 'Correto!';
        const bonusTexto = bonus > 0 ? ` (+${bonus} bônus)` : '';
        elementos.feedbackPontos.textContent = `+${pontosGanhos} pts${bonusTexto} • ${tempoFormatado}`;
    } else {
        elementos.feedbackIcon.textContent = '✗';
        elementos.feedbackTexto.textContent = 'Errado!';
        elementos.feedbackPontos.textContent = `0 pts • ${tempoFormatado}`;
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
    
    // Calcula percentual de acerto e mostra mensagem motivacional
    const percentualAcerto = (resultado.acertos / resultado.totalPerguntas) * 100;
    elementos.resultadoMensagem.innerHTML = obterMensagemMotivacional(percentualAcerto);
    
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
    // Busca histórico de partidas do jogador atual
    const historico = await rankingManager.obterHistoricoJogador(20);
    
    elementos.rankingPartidaBody.innerHTML = '';
    
    if (historico.length === 0) {
        elementos.rankingPartidaBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: #9ca3af;">
                    Nenhuma partida ainda
                </td>
            </tr>
        `;
        return;
    }
    
    // A primeira partida (mais recente) é a que acabou de jogar
    historico.forEach((item, index) => {
        const isPartidaAtual = index === 0; // Primeira é a mais recente
        const tr = document.createElement('tr');
        tr.className = isPartidaAtual ? 'destaque partida-atual' : '';
        
        const temasDisplay = rankingManager.formatarTemas(item.temasNomes || item.temas);
        
        // Formata a data
        let dataDisplay = '—';
        const dataHora = item.dataHora || item.timestamp;
        if (dataHora) {
            const data = dataHora.toDate ? dataHora.toDate() : new Date(dataHora);
            dataDisplay = data.toLocaleDateString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        
        tr.innerHTML = `
            <td>${index + 1}º</td>
            <td>${temasDisplay}</td>
            <td>${item.pontuacaoTotal}</td>
            <td>${item.acertos}/${item.totalPerguntas || 10}</td>
            <td>${dataDisplay}</td>
        `;
        
        elementos.rankingPartidaBody.appendChild(tr);
        
        // Scroll para a partida atual (primeira linha)
        if (isPartidaAtual) {
            tr.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

/**
 * Retorna mensagem motivacional baseada no percentual de acerto
 */
function obterMensagemMotivacional(percentual) {
    if (percentual === 100) {
        return '<span class="mensagem-icone">🏆</span> <strong>Perfeito!</strong> Você é um mestre!';
    } else if (percentual >= 80) {
        return '<span class="mensagem-icone">🎉</span> <strong>Parabéns!</strong> Excelente desempenho!';
    } else if (percentual >= 60) {
        return '<span class="mensagem-icone">👍</span> <strong>Muito bem!</strong> Continue assim!';
    } else if (percentual >= 40) {
        return '<span class="mensagem-icone">💪</span> <strong>Bom esforço!</strong> Quase lá!';
    } else if (percentual >= 30) {
        return '<span class="mensagem-icone">📚</span> <strong>Continue praticando!</strong>';
    } else {
        return '<span class="mensagem-icone">🎯</span> <strong>Você pode melhorar!</strong> Tente novamente!';
    }
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

/**
 * Agrupa os resultados por sessão original
 * @param {Array} ranking - Lista de resultados
 * @returns {Array} - Array de grupos, cada um com sessaoId, info e resultados ordenados
 */
function agruparPorSessao(ranking) {
    const grupos = new Map();
    
    ranking.forEach(item => {
        const sessaoId = item.sessaoOriginalId || item.sessaoId || 'sem-sessao';
        
        if (!grupos.has(sessaoId)) {
            // Usa temasNomes para descrição (ignora descricaoTemas que pode ser "Desafio: jogador")
            const descricaoTemas = item.temasNomes && item.temasNomes.length > 0
                ? rankingManager.formatarTemas(item.temasNomes)
                : (item.temas && item.temas.length > 0 
                    ? rankingManager.formatarTemas(item.temas)
                    : 'Aleatório');
            
            grupos.set(sessaoId, {
                sessaoId: sessaoId,
                temas: item.temasNomes || item.temas || [],
                descricao: descricaoTemas,
                modoDesafio: item.modoDesafio || false,
                perguntasIds: item.perguntasIds || [],
                dataHora: item.dataHora || null, // Data da primeira partida do grupo
                resultados: []
            });
        }
        
        // Atualiza a data para a mais antiga (data de criação da sessão)
        const grupo = grupos.get(sessaoId);
        if (item.dataHora && (!grupo.dataHora || item.dataHora < grupo.dataHora)) {
            grupo.dataHora = item.dataHora;
        }
        
        grupo.resultados.push(item);
    });
    
    // Converte para array e ordena cada grupo por pontuação
    const gruposArray = Array.from(grupos.values());
    gruposArray.forEach(grupo => {
        grupo.resultados.sort((a, b) => {
            // Primeiro por pontuação (maior primeiro)
            if (b.pontuacaoTotal !== a.pontuacaoTotal) {
                return b.pontuacaoTotal - a.pontuacaoTotal;
            }
            // Empate: menor tempo primeiro
            return a.tempoTotal - b.tempoTotal;
        });
    });
    
    // Ordena grupos pela data mais recente primeiro
    gruposArray.sort((a, b) => {
        if (a.dataHora && b.dataHora) {
            return new Date(b.dataHora) - new Date(a.dataHora);
        }
        // Grupos sem data vão para o final
        if (!a.dataHora) return 1;
        if (!b.dataHora) return -1;
        return 0;
    });
    
    return gruposArray;
}

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
        // Agrupa por sessão
        const grupos = agruparPorSessao(ranking);
        
        grupos.forEach((grupo, grupoIndex) => {
            // Linha de cabeçalho do grupo (sessão)
            const trHeader = document.createElement('tr');
            trHeader.className = 'grupo-sessao-header';
            
            const temParticipantes = grupo.resultados.length > 1;
            const icone = temParticipantes ? '⚔️' : '🎮';
            const participantesText = `${grupo.resultados.length} jogador${grupo.resultados.length > 1 ? 'es' : ''}`;
            
            // Formata a data da sessão
            let dataText = '';
            if (grupo.dataHora) {
                const data = new Date(grupo.dataHora);
                dataText = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
            }
            
            // Verifica se o jogador atual pode desafiar este grupo
            const jaJogou = rankingManager.jaJogouSessao(grupo.sessaoId);
            const jogadorNoGrupo = grupo.resultados.some(r => r.jogador === estado.jogador);
            const podeDesafiar = !jaJogou && !jogadorNoGrupo && grupo.perguntasIds && grupo.perguntasIds.length > 0;
            
            let btnDesafiarGrupoHtml = '';
            if (jaJogou || jogadorNoGrupo) {
                // Já jogou esta sessão (seja como criador ou desafiante)
                btnDesafiarGrupoHtml = `<span class="badge-jogado">✓ Jogado</span>`;
            } else if (podeDesafiar) {
                btnDesafiarGrupoHtml = `<button class="btn-desafiar btn-desafiar-grupo" data-grupo="${grupoIndex}">⚔️ Entrar</button>`;
            } else {
                // Sessão antiga sem perguntasIds
                btnDesafiarGrupoHtml = `<span class="badge-antigo">—</span>`;
            }
            
            trHeader.innerHTML = `
                <td class="grupo-col-icone">${icone}</td>
                <td class="grupo-col-info" colspan="3">
                    <strong>${grupo.descricao}</strong>
                    <span class="grupo-meta">${participantesText}${dataText ? ' • ' + dataText : ''}</span>
                </td>
                <td></td>
                <td class="grupo-col-acao">${btnDesafiarGrupoHtml}</td>
            `;
            elementos.rankingGlobalBody.appendChild(trHeader);
            
            // Linhas dos resultados do grupo
            grupo.resultados.forEach((item, posicao) => {
                const isJogadorAtual = item.jogador === estado.jogador;
                const tr = document.createElement('tr');
                tr.className = `grupo-sessao-item${isJogadorAtual ? ' destaque' : ''}`;
                
                // Medalha para os 3 primeiros do grupo
                let medalha = '';
                if (posicao === 0) medalha = '🥇';
                else if (posicao === 1) medalha = '🥈';
                else if (posicao === 2) medalha = '🥉';
                else medalha = `${posicao + 1}º`;
                
                tr.innerHTML = `
                    <td class="posicao-grupo">${medalha}</td>
                    <td>${item.jogador}${isJogadorAtual ? ' <span class="tag-voce">(você)</span>' : ''}</td>
                    <td>${item.pontuacaoTotal} pts</td>
                    <td>${item.acertos}/${item.totalPerguntas || 10}</td>
                    <td>${rankingManager.formatarTempo(item.tempoTotal)}</td>
                    <td></td>
                `;
                elementos.rankingGlobalBody.appendChild(tr);
            });
        });
        
        // Event listeners para botões de desafiar grupo
        elementos.rankingGlobalBody.querySelectorAll('.btn-desafiar-grupo').forEach(btn => {
            btn.addEventListener('click', () => {
                const grupoIndex = parseInt(btn.dataset.grupo);
                const grupo = grupos[grupoIndex];
                // Usa o primeiro resultado do grupo como base para o desafio
                iniciarDesafio(grupo.resultados[0]);
            });
        });
    }
    
    abrirModal(elementos.modalRanking, elementos.btnVerRankingSalas);
}

/**
 * Mostra o ranking geral - lista simples ordenada por pontuação
 */
async function mostrarRankingGeral() {
    const ranking = await rankingManager.obterRankingGlobal(100);
    
    elementos.rankingGeralBody.innerHTML = '';
    
    if (ranking.length === 0) {
        elementos.rankingGeralBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: #9ca3af;">
                    Nenhum resultado ainda
                </td>
            </tr>
        `;
    } else {
        // Ordena por pontuação (maior primeiro), desempate por tempo (menor primeiro)
        const rankingOrdenado = [...ranking].sort((a, b) => {
            if (b.pontuacaoTotal !== a.pontuacaoTotal) {
                return b.pontuacaoTotal - a.pontuacaoTotal;
            }
            return a.tempoTotal - b.tempoTotal;
        });
        
        rankingOrdenado.forEach((item, index) => {
            const isJogadorAtual = item.jogador === estado.jogador;
            const tr = document.createElement('tr');
            tr.className = isJogadorAtual ? 'destaque' : '';
            
            const temasDisplay = rankingManager.formatarTemas(item.temasNomes || item.temas);
            
            // Medalhas para top 3
            let posicao = '';
            if (index === 0) posicao = '🥇';
            else if (index === 1) posicao = '🥈';
            else if (index === 2) posicao = '🥉';
            else posicao = `${index + 1}º`;
            
            // Determina se pode desafiar esta partida
            const sessaoId = item.sessaoOriginalId || item.sessaoId;
            const jaJogou = sessaoId ? rankingManager.jaJogouSessao(sessaoId) : true;
            const temPerguntasIds = item.perguntasIds && item.perguntasIds.length > 0;
            
            let btnDesafiarHtml = '';
            if (temPerguntasIds) {
                // Se é o próprio jogador OU já jogou essa sessão, mostra "Jogado"
                if (isJogadorAtual || jaJogou) {
                    btnDesafiarHtml = `<button class="btn-desafiar disabled" disabled title="Você já jogou este desafio">✓ Jogado</button>`;
                } else {
                    btnDesafiarHtml = `<button class="btn-desafiar" data-index="${index}" title="Jogar com as mesmas perguntas">⚔️ Desafiar</button>`;
                }
            } else {
                btnDesafiarHtml = `<span class="desafiar-info">—</span>`;
            }
            
            tr.innerHTML = `
                <td>${posicao}</td>
                <td>${item.jogador}${isJogadorAtual ? ' <span class="tag-voce">(você)</span>' : ''}</td>
                <td>${temasDisplay}</td>
                <td>${item.pontuacaoTotal}</td>
                <td>${item.acertos}/${item.totalPerguntas || 10}</td>
                <td>${rankingManager.formatarTempo(item.tempoTotal)}</td>
                <td class="td-desafiar">${btnDesafiarHtml}</td>
            `;
            
            elementos.rankingGeralBody.appendChild(tr);
        });
        
        // Adiciona event listeners para os botões de desafio
        elementos.rankingGeralBody.querySelectorAll('.btn-desafiar:not(.disabled)').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                // Fecha o modal geral
                fecharModal(elementos.modalRankingGeral);
                iniciarDesafio(rankingOrdenado[index]);
            });
        });
    }
    
    abrirModal(elementos.modalRankingGeral, elementos.btnVerRankingGeral);
}

function inicializarModal() {
    // Modal Ranking por Sala
    elementos.modalFechar.addEventListener('click', () => {
        fecharModal(elementos.modalRanking);
    });
    
    elementos.modalRanking.addEventListener('click', (e) => {
        if (e.target === elementos.modalRanking) {
            fecharModal(elementos.modalRanking);
        }
    });
    
    // Modal Ranking Geral
    elementos.modalFecharGeral.addEventListener('click', () => {
        fecharModal(elementos.modalRankingGeral);
    });
    
    elementos.modalRankingGeral.addEventListener('click', (e) => {
        if (e.target === elementos.modalRankingGeral) {
            fecharModal(elementos.modalRankingGeral);
        }
    });
    
    // Ativa ESC para fechar modais
    NavegacaoTeclado.ativarEscParaFechar(() => {
        if (!elementos.modalRanking.classList.contains('oculto')) {
            fecharModal(elementos.modalRanking);
            return true;
        }
        if (!elementos.modalRankingGeral.classList.contains('oculto')) {
            fecharModal(elementos.modalRankingGeral);
            return true;
        }
        return false;
    });
}

/**
 * Abre um modal com focus trap para acessibilidade
 * @param {HTMLElement} modal - Elemento do modal
 * @param {HTMLElement} botaoAbertura - Botão que abriu o modal (para retorno do foco)
 */
function abrirModal(modal, botaoAbertura) {
    modal.classList.remove('oculto');
    
    // Ativa focus trap
    GerenciadorFoco.ativarFocusTrap(modal);
    
    // Move foco para o modal
    const modalContent = modal.querySelector('.modal-content');
    if (modalContent) {
        modalContent.focus();
    }
    
    // Salva referência do botão para retornar foco ao fechar
    modal.dataset.botaoOrigem = botaoAbertura ? botaoAbertura.id : '';
    
    Anunciador.anunciar('Modal de ranking aberto. Pressione Escape para fechar.');
}

/**
 * Fecha um modal e retorna o foco
 * @param {HTMLElement} modal - Elemento do modal
 */
function fecharModal(modal) {
    modal.classList.add('oculto');
    
    // Desativa focus trap
    GerenciadorFoco.desativarFocusTrap();
    
    // Retorna foco ao botão que abriu
    const botaoOrigemId = modal.dataset.botaoOrigem;
    if (botaoOrigemId) {
        const botaoOrigem = document.getElementById(botaoOrigemId);
        if (botaoOrigem) {
            botaoOrigem.focus();
        }
    }
    
    Anunciador.anunciar('Modal fechado.');
}

// ========================================
// INICIALIZAÇÃO
// ========================================
async function init() {
    console.log('🏰 Quizlândia - Iniciando...');
    
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
    
    console.log('✅ Quizlândia - Pronto!');
}

// Inicia a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', init);
