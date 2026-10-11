/**
 * Módulo de Acessibilidade
 * Gerencia anúncios para leitores de tela, foco e navegação por teclado
 */

// ========================================
// ANUNCIADOR PARA LEITORES DE TELA
// ========================================

const Anunciador = {
    // Elementos de anúncio
    _regiaoPadrao: null,
    _regiaoUrgente: null,
    _filaAnuncios: [],
    _processando: false,

    /**
     * Inicializa os elementos de anúncio
     */
    init() {
        this._regiaoPadrao = document.getElementById('aria-announcer');
        this._regiaoUrgente = document.getElementById('aria-announcer-urgent');
        
        // Criar elementos se não existirem
        if (!this._regiaoPadrao) {
            this._regiaoPadrao = this._criarRegiao('aria-announcer', 'polite');
        }
        if (!this._regiaoUrgente) {
            this._regiaoUrgente = this._criarRegiao('aria-announcer-urgent', 'assertive');
        }
    },

    /**
     * Cria uma região de anúncio
     */
    _criarRegiao(id, prioridade) {
        const div = document.createElement('div');
        div.id = id;
        div.className = 'sr-only';
        div.setAttribute('role', prioridade === 'assertive' ? 'alert' : 'status');
        div.setAttribute('aria-live', prioridade);
        div.setAttribute('aria-atomic', 'true');
        document.body.insertBefore(div, document.body.firstChild);
        return div;
    },

    /**
     * Anuncia uma mensagem para leitores de tela
     * @param {string} mensagem - Texto a ser anunciado
     * @param {object} opcoes - Opções de anúncio
     * @param {boolean} opcoes.urgente - Se true, usa aria-live="assertive"
     * @param {number} opcoes.atraso - Atraso em ms antes do anúncio
     * @param {boolean} opcoes.limpar - Se true, limpa após anunciar
     */
    anunciar(mensagem, opcoes = {}) {
        const { urgente = false, atraso = 100, limpar = true } = opcoes;
        
        this._filaAnuncios.push({ mensagem, urgente, atraso, limpar });
        
        if (!this._processando) {
            this._processarFila();
        }
    },

    /**
     * Processa a fila de anúncios
     */
    async _processarFila() {
        this._processando = true;
        
        while (this._filaAnuncios.length > 0) {
            const { mensagem, urgente, atraso, limpar } = this._filaAnuncios.shift();
            const regiao = urgente ? this._regiaoUrgente : this._regiaoPadrao;
            
            // Limpar antes de anunciar (força re-leitura)
            regiao.textContent = '';
            
            await this._aguardar(atraso);
            
            regiao.textContent = mensagem;
            
            if (limpar) {
                await this._aguardar(1000);
                regiao.textContent = '';
            }
        }
        
        this._processando = false;
    },

    /**
     * Aguarda um tempo em ms
     */
    _aguardar(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Anúncios específicos do quiz
     */
    anunciarPergunta(numero, total, enunciado, tema) {
        const msg = `Pergunta ${numero} de ${total}. Tema: ${tema}. ${enunciado}`;
        this.anunciar(msg, { urgente: true, atraso: 200, limpar: false });
    },

    anunciarTempoRestante(segundos) {
        // Anuncia apenas em momentos críticos para não poluir
        if (segundos === 5) {
            this.anunciar('5 segundos restantes', { urgente: true });
        } else if (segundos === 3) {
            this.anunciar('3 segundos', { urgente: true });
        } else if (segundos === 1) {
            this.anunciar('1 segundo', { urgente: true });
        }
    },

    anunciarRespostaCorreta(pontos, bonus) {
        let msg = `Correto! Você ganhou ${pontos} pontos.`;
        if (bonus > 0) {
            msg += ` Incluindo ${bonus} pontos de bônus por velocidade.`;
        }
        this.anunciar(msg, { urgente: true, limpar: false });
    },

    anunciarRespostaErrada(respostaCorreta) {
        const msg = `Incorreto. A resposta correta era: ${respostaCorreta}`;
        this.anunciar(msg, { urgente: true, limpar: false });
    },

    anunciarTempoEsgotado(respostaCorreta) {
        const msg = `Tempo esgotado! A resposta correta era: ${respostaCorreta}`;
        this.anunciar(msg, { urgente: true, limpar: false });
    },

    anunciarInicioContagem(segundos) {
        this.anunciar(`Leia a pergunta. Você terá ${segundos} segundos para responder.`, { urgente: true });
    },

    anunciarAlternativasDisponiveis(quantidade) {
        this.anunciar(`${quantidade} alternativas disponíveis. Use as teclas 1, 2, 3 ou 4 para responder rapidamente, ou navegue com Tab.`);
    },

    anunciarFimPartida(pontuacao, acertos, total) {
        const msg = `Partida finalizada! Você fez ${pontuacao} pontos com ${acertos} acertos de ${total} perguntas.`;
        this.anunciar(msg, { urgente: true, limpar: false });
    },

    anunciarTelaTrocada(nomeTela) {
        this.anunciar(`Navegou para: ${nomeTela}`);
    },

    anunciarTemaSelecionado(nomeTema, selecionado) {
        const estado = selecionado ? 'selecionado' : 'desmarcado';
        this.anunciar(`Tema ${nomeTema} ${estado}`);
    },

    anunciarModoAleatorio(ativo) {
        const msg = ativo 
            ? 'Modo aleatório ativado. Perguntas serão de todos os temas.'
            : 'Modo aleatório desativado.';
        this.anunciar(msg);
    }
};


// ========================================
// GERENCIADOR DE FOCO
// ========================================

const GerenciadorFoco = {
    _ultimoFoco: null,
    _focusTrapAtivo: false,
    _elementosTrap: [],

    /**
     * Move o foco para um elemento
     * @param {string|HTMLElement} seletor - Seletor CSS ou elemento
     * @param {object} opcoes - Opções
     */
    moverFoco(seletor, opcoes = {}) {
        const { atraso = 100, anunciar = true } = opcoes;
        
        setTimeout(() => {
            const elemento = typeof seletor === 'string' 
                ? document.querySelector(seletor) 
                : seletor;
            
            if (elemento) {
                // Salva foco anterior
                this._ultimoFoco = document.activeElement;
                
                // Garante que elemento pode receber foco
                if (!elemento.hasAttribute('tabindex') && !this._eFocavel(elemento)) {
                    elemento.setAttribute('tabindex', '-1');
                }
                
                elemento.focus();
            }
        }, atraso);
    },

    /**
     * Restaura o foco anterior
     */
    restaurarFoco() {
        if (this._ultimoFoco && document.contains(this._ultimoFoco)) {
            this._ultimoFoco.focus();
        }
    },

    /**
     * Verifica se elemento é naturalmente focável
     */
    _eFocavel(elemento) {
        const focaveis = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
        return focaveis.includes(elemento.tagName) && !elemento.disabled;
    },

    /**
     * Ativa focus trap em um container (para modais)
     */
    ativarFocusTrap(container) {
        this._ultimoFoco = document.activeElement;
        this._focusTrapAtivo = true;
        
        const focaveis = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        this._elementosTrap = Array.from(focaveis).filter(el => !el.disabled);
        
        if (this._elementosTrap.length > 0) {
            this._elementosTrap[0].focus();
        }
        
        // Listener para trap
        container.addEventListener('keydown', this._handleTrapKeydown.bind(this));
    },

    /**
     * Desativa focus trap
     */
    desativarFocusTrap(container) {
        this._focusTrapAtivo = false;
        container.removeEventListener('keydown', this._handleTrapKeydown.bind(this));
        this.restaurarFoco();
    },

    /**
     * Handler de teclado para focus trap
     */
    _handleTrapKeydown(e) {
        if (!this._focusTrapAtivo || e.key !== 'Tab') return;
        
        const primeiro = this._elementosTrap[0];
        const ultimo = this._elementosTrap[this._elementosTrap.length - 1];
        
        if (e.shiftKey && document.activeElement === primeiro) {
            e.preventDefault();
            ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
            e.preventDefault();
            primeiro.focus();
        }
    },

    /**
     * Move foco ao trocar de tela
     */
    focarTela(telaId) {
        const tela = document.getElementById(telaId);
        if (!tela) return;
        
        // Busca primeiro heading ou elemento focável
        const heading = tela.querySelector('h1, h2, [tabindex="-1"]');
        if (heading) {
            this.moverFoco(heading, { atraso: 300 });
        }
    }
};


// ========================================
// NAVEGAÇÃO POR TECLADO
// ========================================

const NavegacaoTeclado = {
    _callbacks: {},

    /**
     * Inicializa atalhos de teclado
     */
    init() {
        document.addEventListener('keydown', this._handleKeydown.bind(this));
    },

    /**
     * Handler global de teclado
     */
    _handleKeydown(e) {
        // Ignora se está em input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Atalhos numéricos para alternativas (1-4)
        if (['1', '2', '3', '4'].includes(e.key)) {
            const indice = parseInt(e.key) - 1;
            const alternativa = document.querySelector(
                `#alternativas .alternativa-btn:nth-child(${indice + 1}):not(:disabled)`
            );
            if (alternativa) {
                alternativa.click();
                e.preventDefault();
            }
        }

        // ESC para fechar modais
        if (e.key === 'Escape') {
            const modalAberto = document.querySelector('.modal:not(.oculto)');
            if (modalAberto) {
                const btnFechar = modalAberto.querySelector('.modal-fechar');
                if (btnFechar) btnFechar.click();
                e.preventDefault();
            }
        }

        // Callback personalizado
        if (this._callbacks[e.key]) {
            this._callbacks[e.key](e);
        }
    },

    /**
     * Registra callback para tecla
     */
    registrarTecla(tecla, callback) {
        this._callbacks[tecla] = callback;
    },

    /**
     * Remove callback de tecla
     */
    removerTecla(tecla) {
        delete this._callbacks[tecla];
    }
};


// ========================================
// INICIALIZAÇÃO
// ========================================

function initAcessibilidade() {
    Anunciador.init();
    NavegacaoTeclado.init();
    
    console.log('♿ Módulo de acessibilidade inicializado');
}

// Auto-inicializa quando DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAcessibilidade);
} else {
    initAcessibilidade();
}


// ========================================
// EXPORTS
// ========================================

export { 
    Anunciador, 
    GerenciadorFoco, 
    NavegacaoTeclado,
    initAcessibilidade 
};
