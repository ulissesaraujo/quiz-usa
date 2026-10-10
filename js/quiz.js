// ========================================
// QUIZ.JS - Mecânica do Jogo
// ========================================

/**
 * Classe que gerencia a mecânica do quiz
 */
export class QuizEngine {
    constructor() {
        this.perguntaAtual = 0;
        this.pontuacaoTotal = 0;
        this.perguntas = [];
        this.salaAtual = null;
        this.respostas = []; // Armazena detalhes de cada resposta
        this.tempoInicio = null;
        this.timerLeitura = null;
        this.timerCronometro = null;
        this.cronometroSegundos = 0;
        this.respondeu = false;
        
        // Configurações
        this.tempoLimite = 10; // 10 segundos para responder
        
        // Callbacks
        this.onPerguntaCarregada = null;
        this.onFaseLeitura = null;
        this.onFaseResposta = null;
        this.onRespostaProcessada = null;
        this.onQuizFinalizado = null;
        this.onPontuacaoAtualizada = null;
        this.onTempoEsgotado = null;
    }

    /**
     * Calcula o bônus de velocidade baseado no tempo de resposta
     * @param {number} tempo - Tempo em segundos
     * @returns {number} - Bônus de pontos
     */
    calcularBonus(tempo) {
        if (tempo <= 1) return 5;
        if (tempo <= 2) return 3;
        if (tempo <= 3) return 2;
        if (tempo <= 4) return 1;
        return 0;
    }

    /**
     * Inicia o quiz com uma sala específica
     * @param {Object} sala - Objeto da sala com perguntas
     */
    iniciar(sala) {
        this.salaAtual = sala;
        this.perguntas = [...sala.perguntas];
        this.perguntaAtual = 0;
        this.pontuacaoTotal = 0;
        this.respostas = [];
        this.respondeu = false;
        
        this.carregarPergunta();
    }

    /**
     * Carrega a pergunta atual e inicia a fase de leitura
     */
    carregarPergunta() {
        if (this.perguntaAtual >= this.perguntas.length) {
            this.finalizar();
            return;
        }

        const pergunta = this.perguntas[this.perguntaAtual];
        this.respondeu = false;
        
        // Notifica que uma pergunta foi carregada
        if (this.onPerguntaCarregada) {
            this.onPerguntaCarregada({
                numero: this.perguntaAtual + 1,
                total: this.perguntas.length,
                pergunta: pergunta
            });
        }

        // Inicia a fase de leitura (3 segundos)
        this.iniciarFaseLeitura();
    }

    /**
     * Inicia a fase de leitura com countdown de 3 segundos
     */
    iniciarFaseLeitura() {
        let contador = 3;
        
        if (this.onFaseLeitura) {
            this.onFaseLeitura({ segundos: contador, ativa: true });
        }

        this.timerLeitura = setInterval(() => {
            contador--;
            
            if (this.onFaseLeitura) {
                this.onFaseLeitura({ segundos: contador, ativa: true });
            }

            if (contador <= 0) {
                clearInterval(this.timerLeitura);
                this.iniciarFaseResposta();
            }
        }, 1000);
    }

    /**
     * Inicia a fase de resposta com cronômetro e limite de tempo
     */
    iniciarFaseResposta() {
        this.tempoInicio = Date.now();
        this.cronometroSegundos = 0;
        
        if (this.onFaseResposta) {
            this.onFaseResposta({ 
                ativa: true, 
                tempo: 0,
                tempoRestante: this.tempoLimite 
            });
        }

        // Inicia cronômetro que atualiza a cada 100ms
        this.timerCronometro = setInterval(() => {
            this.cronometroSegundos = (Date.now() - this.tempoInicio) / 1000;
            const tempoRestante = Math.max(0, this.tempoLimite - this.cronometroSegundos);
            
            if (this.onFaseResposta) {
                this.onFaseResposta({ 
                    ativa: true, 
                    tempo: this.cronometroSegundos,
                    tempoRestante: tempoRestante
                });
            }
            
            // Verifica se o tempo esgotou
            if (this.cronometroSegundos >= this.tempoLimite && !this.respondeu) {
                this.tempoEsgotado();
            }
        }, 100);
    }

    /**
     * Chamado quando o tempo de resposta esgota
     */
    tempoEsgotado() {
        if (this.respondeu) return;
        
        this.respondeu = true;
        clearInterval(this.timerCronometro);
        
        const pergunta = this.perguntas[this.perguntaAtual];
        
        // Registra como resposta errada (tempo esgotado)
        const detalheResposta = {
            perguntaId: pergunta.id,
            tempo: this.tempoLimite,
            correto: false,
            pontosBase: 0,
            bonus: 0,
            pontosTotais: 0,
            respostaEscolhida: -1, // -1 indica tempo esgotado
            respostaCorreta: pergunta.correta,
            tempoEsgotado: true
        };
        
        this.respostas.push(detalheResposta);
        
        // Notifica que o tempo esgotou
        if (this.onTempoEsgotado) {
            this.onTempoEsgotado({
                indiceCorreto: pergunta.correta,
                pontuacaoTotal: this.pontuacaoTotal
            });
        }
        
        // Também notifica via onRespostaProcessada para manter compatibilidade
        if (this.onRespostaProcessada) {
            this.onRespostaProcessada({
                correta: false,
                indiceCorreto: pergunta.correta,
                indiceEscolhido: -1,
                tempo: this.tempoLimite,
                pontosBase: 0,
                bonus: 0,
                pontosGanhos: 0,
                pontuacaoTotal: this.pontuacaoTotal,
                tempoEsgotado: true
            });
        }
    }

    /**
     * Processa a resposta do jogador
     * @param {number} indiceEscolhido - Índice da alternativa escolhida
     */
    responder(indiceEscolhido) {
        if (this.respondeu) return;
        
        this.respondeu = true;
        
        // Para o cronômetro
        clearInterval(this.timerCronometro);
        
        const tempoResposta = (Date.now() - this.tempoInicio) / 1000;
        const pergunta = this.perguntas[this.perguntaAtual];
        const estaCorreta = indiceEscolhido === pergunta.correta;
        
        // Calcula pontuação
        let pontosBase = 0;
        let bonus = 0;
        
        if (estaCorreta) {
            pontosBase = 10;
            bonus = this.calcularBonus(tempoResposta);
        }
        
        const pontosGanhos = pontosBase + bonus;
        this.pontuacaoTotal += pontosGanhos;
        
        // Registra a resposta
        const detalheResposta = {
            perguntaId: pergunta.id,
            tempo: Math.round(tempoResposta * 10) / 10, // Arredonda para 1 casa decimal
            correto: estaCorreta,
            pontosBase: pontosBase,
            bonus: bonus,
            pontosTotais: pontosGanhos,
            respostaEscolhida: indiceEscolhido,
            respostaCorreta: pergunta.correta,
            tempoEsgotado: false
        };
        
        this.respostas.push(detalheResposta);
        
        // Notifica atualização de pontuação
        if (this.onPontuacaoAtualizada) {
            this.onPontuacaoAtualizada(this.pontuacaoTotal);
        }
        
        // Notifica que a resposta foi processada
        if (this.onRespostaProcessada) {
            this.onRespostaProcessada({
                correta: estaCorreta,
                indiceCorreto: pergunta.correta,
                indiceEscolhido: indiceEscolhido,
                tempo: tempoResposta,
                pontosBase: pontosBase,
                bonus: bonus,
                pontosGanhos: pontosGanhos,
                pontuacaoTotal: this.pontuacaoTotal,
                tempoEsgotado: false
            });
        }
    }

    /**
     * Avança para a próxima pergunta
     */
    proximaPergunta() {
        this.perguntaAtual++;
        this.carregarPergunta();
    }

    /**
     * Finaliza o quiz e prepara o resultado
     */
    finalizar() {
        // Limpa timers
        clearInterval(this.timerLeitura);
        clearInterval(this.timerCronometro);
        
        // Calcula estatísticas finais
        const acertos = this.respostas.filter(r => r.correto).length;
        const tempoTotal = this.respostas.reduce((acc, r) => acc + r.tempo, 0);
        
        const resultado = {
            jogador: '', // Será preenchido pelo app.js
            salaId: this.salaAtual.id,
            salaNome: this.salaAtual.nome,
            pontuacaoTotal: this.pontuacaoTotal,
            acertos: acertos,
            totalPerguntas: this.perguntas.length,
            tempoTotal: Math.round(tempoTotal * 10) / 10,
            detalhes: this.respostas
        };
        
        if (this.onQuizFinalizado) {
            this.onQuizFinalizado(resultado);
        }
        
        return resultado;
    }

    /**
     * Reseta o estado do quiz
     */
    resetar() {
        clearInterval(this.timerLeitura);
        clearInterval(this.timerCronometro);
        
        this.perguntaAtual = 0;
        this.pontuacaoTotal = 0;
        this.perguntas = [];
        this.salaAtual = null;
        this.respostas = [];
        this.tempoInicio = null;
        this.cronometroSegundos = 0;
        this.respondeu = false;
    }
}
