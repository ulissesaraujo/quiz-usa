// ========================================
// RANKING.JS - Funções de Ranking
// ========================================

// Funções do Firebase (serão carregadas dinamicamente)
let firebaseFunctions = null;

/**
 * Inicializa as funções do Firebase
 */
async function initFirebase() {
    if (firebaseFunctions) return firebaseFunctions;
    
    try {
        const module = await import('./firebase-config.js');
        firebaseFunctions = {
            salvarResultado: module.salvarResultado,
            buscarRanking: module.buscarRanking,
            buscarRankingSala: module.buscarRankingSala,
            buscarSalasJogadas: module.buscarSalasJogadas
        };
        console.log('✅ Firebase carregado no ranking.js');
    } catch (error) {
        console.warn('⚠️ Firebase não disponível, usando modo offline:', error.message);
        firebaseFunctions = {
            salvarResultado: async () => null,
            buscarRanking: async () => [],
            buscarRankingSala: async () => [],
            buscarSalasJogadas: async () => []
        };
    }
    return firebaseFunctions;
}

/**
 * Classe que gerencia o ranking do quiz
 */
export class RankingManager {
    constructor() {
        this.jogadorAtual = '';
        this.salasJogadas = new Set();
    }

    /**
     * Define o jogador atual
     * @param {string} nome - Nome do jogador
     */
    setJogador(nome) {
        this.jogadorAtual = nome;
    }

    /**
     * Carrega as salas já jogadas pelo jogador atual
     */
    async carregarSalasJogadas() {
        if (!this.jogadorAtual) return;
        
        try {
            const fb = await initFirebase();
            const salas = await fb.buscarSalasJogadas(this.jogadorAtual);
            this.salasJogadas = new Set(salas);
            return this.salasJogadas;
        } catch (error) {
            console.error('Erro ao carregar salas jogadas:', error);
            // Fallback para localStorage
            const salasLocal = localStorage.getItem(`quiz_salas_${this.jogadorAtual}`);
            if (salasLocal) {
                this.salasJogadas = new Set(JSON.parse(salasLocal));
            }
            return this.salasJogadas;
        }
    }

    /**
     * Verifica se uma sala já foi jogada
     * @param {string} salaId - ID da sala
     * @returns {boolean}
     */
    salaJaJogada(salaId) {
        return this.salasJogadas.has(salaId);
    }

    /**
     * Marca uma sala como jogada
     * @param {string} salaId - ID da sala
     */
    marcarSalaJogada(salaId) {
        this.salasJogadas.add(salaId);
        // Salva também no localStorage como backup
        localStorage.setItem(
            `quiz_salas_${this.jogadorAtual}`,
            JSON.stringify([...this.salasJogadas])
        );
    }

    /**
     * Salva o resultado de uma partida
     * @param {Object} resultado - Dados do resultado
     * @returns {Promise}
     */
    async salvarResultadoPartida(resultado) {
        // Adiciona o nome do jogador
        resultado.jogador = this.jogadorAtual;
        
        // Marca a sala como jogada
        this.marcarSalaJogada(resultado.salaId);
        
        try {
            const fb = await initFirebase();
            await fb.salvarResultado(resultado);
            console.log('Resultado salvo com sucesso!');
            return true;
        } catch (error) {
            console.error('Erro ao salvar resultado:', error);
            // Salva localmente como backup
            this.salvarResultadoLocal(resultado);
            return false;
        }
    }

    /**
     * Salva resultado localmente (backup)
     * @param {Object} resultado - Dados do resultado
     */
    salvarResultadoLocal(resultado) {
        const key = `quiz_resultado_${resultado.salaId}_${this.jogadorAtual}`;
        localStorage.setItem(key, JSON.stringify(resultado));
    }

    /**
     * Busca o ranking global
     * @param {number} limite - Quantidade máxima de resultados
     * @returns {Promise<Array>}
     */
    async obterRankingGlobal(limite = 50) {
        try {
            const fb = await initFirebase();
            const ranking = await fb.buscarRanking(limite);
            return ranking;
        } catch (error) {
            console.error('Erro ao buscar ranking global:', error);
            return [];
        }
    }

    /**
     * Busca o ranking de uma sala específica
     * @param {string} salaId - ID da sala
     * @param {number} limite - Quantidade máxima de resultados
     * @returns {Promise<Array>}
     */
    async obterRankingSala(salaId, limite = 20) {
        try {
            const fb = await initFirebase();
            const ranking = await fb.buscarRankingSala(salaId, limite);
            return ranking;
        } catch (error) {
            console.error('Erro ao buscar ranking da sala:', error);
            return [];
        }
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
     * Encontra a posição do jogador atual no ranking
     * @param {Array} ranking - Lista de ranking
     * @param {string} salaId - ID da sala (opcional)
     * @returns {number} - Posição (1-indexed) ou -1 se não encontrado
     */
    encontrarPosicaoJogador(ranking, salaId = null) {
        for (let i = 0; i < ranking.length; i++) {
            const item = ranking[i];
            if (item.jogador === this.jogadorAtual) {
                if (!salaId || item.salaId === salaId) {
                    return i + 1;
                }
            }
        }
        return -1;
    }
}
