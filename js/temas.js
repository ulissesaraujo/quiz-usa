// ========================================
// TEMAS.JS - Gerenciador de Seleção de Temas
// ========================================

import { 
    TEMAS_DISPONIVEIS, 
    buscarTemas, 
    buscarPerguntasPorTemas, 
    buscarPerguntasAleatorias,
    buscarTemaPorId
} from './firebase-config.js';

/**
 * Classe que gerencia a seleção de temas do quiz
 */
export class TemasManager {
    constructor() {
        this.temas = [];
        this.temasSelecionados = new Set();
        this.modoAleatorio = false;
        this.carregando = false;
        
        // Callbacks
        this.onTemasCarregados = null;
        this.onSelecaoAlterada = null;
        this.onPerguntasCarregadas = null;
        this.onErro = null;
    }

    /**
     * Carrega os temas disponíveis do Firebase
     */
    async carregarTemas() {
        this.carregando = true;
        
        try {
            this.temas = await buscarTemas();
            
            if (this.onTemasCarregados) {
                this.onTemasCarregados(this.temas);
            }
            
            console.log(`✅ ${this.temas.length} temas carregados`);
            return this.temas;
        } catch (error) {
            console.error('Erro ao carregar temas:', error);
            // Fallback para temas estáticos
            this.temas = TEMAS_DISPONIVEIS.map(t => ({ ...t, totalPerguntas: 0 }));
            
            if (this.onErro) {
                this.onErro('Não foi possível carregar a contagem de perguntas');
            }
            
            return this.temas;
        } finally {
            this.carregando = false;
        }
    }

    /**
     * Retorna os temas disponíveis
     */
    obterTemas() {
        return this.temas;
    }

    /**
     * Retorna um tema específico por ID
     */
    obterTemaPorId(temaId) {
        return this.temas.find(t => t.id === temaId) || buscarTemaPorId(temaId);
    }

    /**
     * Alterna a seleção de um tema
     * @param {string} temaId - ID do tema
     */
    alternarTema(temaId) {
        // Se estava em modo aleatório, desativa
        if (this.modoAleatorio) {
            this.modoAleatorio = false;
        }
        
        if (this.temasSelecionados.has(temaId)) {
            this.temasSelecionados.delete(temaId);
        } else {
            this.temasSelecionados.add(temaId);
        }
        
        this.notificarSelecaoAlterada();
    }

    /**
     * Seleciona um tema específico
     * @param {string} temaId - ID do tema
     */
    selecionarTema(temaId) {
        if (this.modoAleatorio) {
            this.modoAleatorio = false;
        }
        
        this.temasSelecionados.add(temaId);
        this.notificarSelecaoAlterada();
    }

    /**
     * Remove a seleção de um tema
     * @param {string} temaId - ID do tema
     */
    deselecionarTema(temaId) {
        this.temasSelecionados.delete(temaId);
        this.notificarSelecaoAlterada();
    }

    /**
     * Ativa/desativa o modo aleatório
     */
    alternarModoAleatorio() {
        this.modoAleatorio = !this.modoAleatorio;
        
        if (this.modoAleatorio) {
            // Limpa seleções específicas quando ativa aleatório
            this.temasSelecionados.clear();
        }
        
        this.notificarSelecaoAlterada();
    }

    /**
     * Define o modo aleatório
     * @param {boolean} ativo - Se deve ativar o modo aleatório
     */
    setModoAleatorio(ativo) {
        this.modoAleatorio = ativo;
        
        if (ativo) {
            this.temasSelecionados.clear();
        }
        
        this.notificarSelecaoAlterada();
    }

    /**
     * Verifica se um tema está selecionado
     * @param {string} temaId - ID do tema
     * @returns {boolean}
     */
    temaSelecionado(temaId) {
        return this.temasSelecionados.has(temaId);
    }

    /**
     * Verifica se o modo aleatório está ativo
     * @returns {boolean}
     */
    isModoAleatorio() {
        return this.modoAleatorio;
    }

    /**
     * Retorna os IDs dos temas selecionados
     * @returns {Array}
     */
    obterTemasSelecionados() {
        return [...this.temasSelecionados];
    }

    /**
     * Retorna os objetos dos temas selecionados
     * @returns {Array}
     */
    obterTemasObjetos() {
        return this.temas.filter(t => this.temasSelecionados.has(t.id));
    }

    /**
     * Limpa todas as seleções
     */
    limparSelecao() {
        this.temasSelecionados.clear();
        this.modoAleatorio = false;
        this.notificarSelecaoAlterada();
    }

    /**
     * Verifica se pode iniciar o quiz (tem algo selecionado)
     * @returns {boolean}
     */
    podeIniciar() {
        return this.modoAleatorio || this.temasSelecionados.size > 0;
    }

    /**
     * Retorna o total de perguntas disponíveis para a seleção atual
     * @returns {number}
     */
    totalPerguntasDisponiveis() {
        if (this.modoAleatorio) {
            return this.temas.reduce((acc, t) => acc + (t.totalPerguntas || 0), 0);
        }
        
        return this.temas
            .filter(t => this.temasSelecionados.has(t.id))
            .reduce((acc, t) => acc + (t.totalPerguntas || 0), 0);
    }

    /**
     * Busca as perguntas para o quiz baseado na seleção
     * @param {number} quantidade - Quantidade de perguntas
     * @returns {Promise<Array>}
     */
    async buscarPerguntas(quantidade = 10) {
        this.carregando = true;
        
        try {
            let perguntas;
            
            if (this.modoAleatorio) {
                perguntas = await buscarPerguntasAleatorias(quantidade);
            } else {
                const temas = this.obterTemasSelecionados();
                perguntas = await buscarPerguntasPorTemas(temas, quantidade);
            }
            
            if (this.onPerguntasCarregadas) {
                this.onPerguntasCarregadas(perguntas);
            }
            
            return perguntas;
        } catch (error) {
            console.error('Erro ao buscar perguntas:', error);
            
            if (this.onErro) {
                this.onErro('Não foi possível carregar as perguntas');
            }
            
            return [];
        } finally {
            this.carregando = false;
        }
    }

    /**
     * Gera uma descrição textual da seleção atual
     * @returns {string}
     */
    gerarDescricaoSelecao() {
        if (this.modoAleatorio) {
            return 'Temas Aleatórios';
        }
        
        const temasObjs = this.obterTemasObjetos();
        
        if (temasObjs.length === 0) {
            return 'Nenhum tema selecionado';
        }
        
        if (temasObjs.length === 1) {
            return temasObjs[0].nome;
        }
        
        if (temasObjs.length <= 3) {
            return temasObjs.map(t => t.nome).join(', ');
        }
        
        return `${temasObjs.length} temas selecionados`;
    }

    /**
     * Gera um ID único para a sessão de quiz
     * @returns {string}
     */
    gerarSessaoId() {
        const temas = this.modoAleatorio ? 'aleatorio' : this.obterTemasSelecionados().sort().join('-');
        const timestamp = Date.now();
        return `quiz_${temas}_${timestamp}`;
    }

    /**
     * Notifica sobre alteração na seleção
     */
    notificarSelecaoAlterada() {
        if (this.onSelecaoAlterada) {
            this.onSelecaoAlterada({
                temasSelecionados: this.obterTemasSelecionados(),
                modoAleatorio: this.modoAleatorio,
                podeIniciar: this.podeIniciar(),
                totalPerguntas: this.totalPerguntasDisponiveis(),
                descricao: this.gerarDescricaoSelecao()
            });
        }
    }

    /**
     * Serializa o estado atual para salvar junto com o resultado
     * @returns {Object}
     */
    serializarParaResultado() {
        return {
            temas: this.modoAleatorio ? ['aleatorio'] : this.obterTemasSelecionados(),
            temasNomes: this.modoAleatorio ? ['Aleatório'] : this.obterTemasObjetos().map(t => t.nome),
            modoAleatorio: this.modoAleatorio,
            descricao: this.gerarDescricaoSelecao()
        };
    }
}
