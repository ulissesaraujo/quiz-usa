// ========================================
// RANKING.JS - Funções de Ranking
// ========================================

// Importações do Firebase com fallback
let salvarResultado, buscarRanking, buscarRankingPorTemas, buscarHistoricoJogador;

try {
    const firebaseModule = await import('./firebase-config.js');
    salvarResultado = firebaseModule.salvarResultado;
    buscarRanking = firebaseModule.buscarRanking;
    buscarRankingPorTemas = firebaseModule.buscarRankingPorTemas;
    buscarHistoricoJogador = firebaseModule.buscarHistoricoJogador;
} catch (error) {
    console.warn('Firebase não carregado, usando modo offline:', error);
    // Funções fallback
    salvarResultado = async () => null;
    buscarRanking = async () => [];
    buscarRankingPorTemas = async () => [];
    buscarHistoricoJogador = async () => [];
}

/**
 * Classe que gerencia o ranking do quiz
 */
export class RankingManager {
    constructor() {
        this.jogadorAtual = '';
        this.historicoPartidas = [];
    }

    /**
     * Define o jogador atual
     * @param {string} nome - Nome do jogador
     */
    setJogador(nome) {
        this.jogadorAtual = nome;
    }

    /**
     * Carrega o histórico de partidas do jogador atual
     */
    async carregarHistorico() {
        if (!this.jogadorAtual) return [];
        
        try {
            this.historicoPartidas = await buscarHistoricoJogador(this.jogadorAtual);
            return this.historicoPartidas;
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            // Fallback para localStorage
            const historicoLocal = localStorage.getItem(`quiz_historico_${this.jogadorAtual}`);
            if (historicoLocal) {
                this.historicoPartidas = JSON.parse(historicoLocal);
            }
            return this.historicoPartidas;
        }
    }

    /**
     * Salva o resultado de uma partida
     * @param {Object} resultado - Dados do resultado
     * @returns {Promise}
     */
    async salvarResultadoPartida(resultado) {
        // Adiciona o nome do jogador
        resultado.jogador = this.jogadorAtual;
        
        // Adiciona ao histórico local
        this.historicoPartidas.unshift(resultado);
        
        // Salva localmente como backup
        this.salvarHistoricoLocal();
        
        try {
            await salvarResultado(resultado);
            console.log('✅ Resultado salvo com sucesso!');
            return true;
        } catch (error) {
            console.error('Erro ao salvar resultado:', error);
            return false;
        }
    }

    /**
     * Salva histórico localmente (backup)
     */
    salvarHistoricoLocal() {
        const key = `quiz_historico_${this.jogadorAtual}`;
        // Mantém apenas as últimas 50 partidas localmente
        const historicoLimitado = this.historicoPartidas.slice(0, 50);
        localStorage.setItem(key, JSON.stringify(historicoLimitado));
    }

    /**
     * Busca o ranking global
     * @param {number} limite - Quantidade máxima de resultados
     * @returns {Promise<Array>}
     */
    async obterRankingGlobal(limite = 50) {
        try {
            const ranking = await buscarRanking(limite);
            return ranking;
        } catch (error) {
            console.error('Erro ao buscar ranking global:', error);
            return [];
        }
    }

    /**
     * Busca o ranking filtrado por temas
     * @param {Array} temas - IDs dos temas para filtrar
     * @param {number} limite - Quantidade máxima de resultados
     * @returns {Promise<Array>}
     */
    async obterRankingPorTemas(temas, limite = 20) {
        try {
            const ranking = await buscarRankingPorTemas(temas, limite);
            return ranking;
        } catch (error) {
            console.error('Erro ao buscar ranking por temas:', error);
            return [];
        }
    }

    /**
     * Busca o histórico do jogador atual
     * @param {number} limite - Quantidade máxima de resultados
     * @returns {Promise<Array>}
     */
    async obterHistoricoJogador(limite = 20) {
        try {
            const historico = await buscarHistoricoJogador(this.jogadorAtual, limite);
            return historico;
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            return this.historicoPartidas.slice(0, limite);
        }
    }

    /**
     * Calcula estatísticas do jogador
     * @returns {Object}
     */
    calcularEstatisticas() {
        if (this.historicoPartidas.length === 0) {
            return {
                totalPartidas: 0,
                pontuacaoMedia: 0,
                melhorPontuacao: 0,
                totalAcertos: 0,
                totalPerguntas: 0,
                taxaAcerto: 0,
                tempoMedio: 0
            };
        }
        
        const totalPartidas = this.historicoPartidas.length;
        const pontuacaoTotal = this.historicoPartidas.reduce((acc, p) => acc + p.pontuacaoTotal, 0);
        const melhorPontuacao = Math.max(...this.historicoPartidas.map(p => p.pontuacaoTotal));
        const totalAcertos = this.historicoPartidas.reduce((acc, p) => acc + p.acertos, 0);
        const totalPerguntas = this.historicoPartidas.reduce((acc, p) => acc + p.totalPerguntas, 0);
        const tempoTotal = this.historicoPartidas.reduce((acc, p) => acc + p.tempoTotal, 0);
        
        return {
            totalPartidas,
            pontuacaoMedia: Math.round(pontuacaoTotal / totalPartidas),
            melhorPontuacao,
            totalAcertos,
            totalPerguntas,
            taxaAcerto: totalPerguntas > 0 ? Math.round((totalAcertos / totalPerguntas) * 100) : 0,
            tempoMedio: Math.round((tempoTotal / totalPartidas) * 10) / 10
        };
    }

    /**
     * Formata o tempo para exibição
     * @param {number} segundos - Tempo em segundos
     * @returns {string}
     */
    formatarTempo(segundos) {
        if (segundos < 60) {
            return `${segundos.toFixed(1)}s`;
        }
        const minutos = Math.floor(segundos / 60);
        const segs = (segundos % 60).toFixed(1);
        return `${minutos}m ${segs}s`;
    }

    /**
     * Formata a data para exibição
     * @param {string} isoString - Data em formato ISO
     * @returns {string}
     */
    formatarData(isoString) {
        const data = new Date(isoString);
        return data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Formata lista de temas para exibição
     * @param {Array} temasNomes - Array de nomes de temas
     * @returns {string}
     */
    formatarTemas(temasNomes) {
        if (!temasNomes || temasNomes.length === 0) {
            return 'Não especificado';
        }
        
        if (temasNomes.length === 1) {
            return temasNomes[0];
        }
        
        if (temasNomes.length <= 2) {
            return temasNomes.join(' e ');
        }
        
        return `${temasNomes.slice(0, 2).join(', ')} +${temasNomes.length - 2}`;
    }

    /**
     * Encontra a posição do jogador atual no ranking
     * @param {Array} ranking - Lista de ranking
     * @returns {number} - Posição (1-indexed) ou -1 se não encontrado
     */
    encontrarPosicaoJogador(ranking) {
        for (let i = 0; i < ranking.length; i++) {
            if (ranking[i].jogador === this.jogadorAtual) {
                return i + 1;
            }
        }
        return -1;
    }

    /**
     * Agrupa o ranking por temas para exibição
     * @param {Array} ranking - Lista de ranking
     * @returns {Object} - Ranking agrupado por tema
     */
    agruparPorTemas(ranking) {
        const grupos = {};
        
        ranking.forEach(item => {
            const temas = item.temas || ['outros'];
            temas.forEach(tema => {
                if (!grupos[tema]) {
                    grupos[tema] = [];
                }
                grupos[tema].push(item);
            });
        });
        
        // Ordena cada grupo por pontuação
        Object.keys(grupos).forEach(tema => {
            grupos[tema].sort((a, b) => b.pontuacaoTotal - a.pontuacaoTotal);
        });
        
        return grupos;
    }
}
