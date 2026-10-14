// ========================================
// FIREBASE-CONFIG.JS - Configuração Firebase
// ========================================

// Flag para verificar se Firebase está disponível
let firebaseDisponivel = false;
let db = null;

// Temas disponíveis no quiz (ordem alfabética)
// Subtemas são opcionais - quando presentes, aparecem como acordeão
export const TEMAS_DISPONIVEIS = [
    { id: 'arte', nome: 'Arte', icone: '🎨' },
    { id: 'ciencia', nome: 'Ciência', icone: '🔬' },
    { 
        id: 'cinema-series', 
        nome: 'Cinema e Séries', 
        icone: '🎬',
        subtemas: [
            { id: 'harry-potter', nome: 'Harry Potter', icone: '⚡' },
            { id: 'chaves', nome: 'Chaves', icone: '🪣' }
        ]
    },
    { id: 'comidas-bebidas', nome: 'Comidas e Bebidas', icone: '🍔' },
    { 
        id: 'criancas', 
        nome: 'Crianças', 
        icone: '🧒',
        subtemas: [
            { id: 'ingles', nome: 'Inglês', icone: '🇺🇸' },
            { id: 'desenhos', nome: 'Desenhos Animados', icone: '🎬' },
            { id: 'matematica', nome: 'Matemática Divertida', icone: '🔢' },
            { id: 'adivinhas', nome: 'Adivinhas', icone: '🧩' },
            { id: 'planeta', nome: 'Planeta Terra', icone: '🌍' },
            { id: 'corpo', nome: 'Corpo Humano', icone: '🧬' },
            { id: 'musicas', nome: 'Músicas Infantis', icone: '🎵' },
            { id: 'superherois', nome: 'Super-heróis', icone: '🦸' },
            { id: 'espaco', nome: 'Espaço', icone: '🚀' },
            { id: 'alimentos', nome: 'Alimentação Saudável', icone: '🥗' },
            { id: 'contos', nome: 'Contos de Fadas', icone: '🏰' }
        ]
    },
    { id: 'curiosidades', nome: 'Curiosidades', icone: '💡' },
    { 
        id: 'esportes', 
        nome: 'Esportes', 
        icone: '⚽',
        subtemas: [
            { id: 'futebol', nome: 'Futebol', icone: '⚽' },
            { id: 'tenis', nome: 'Tênis', icone: '🎾' },
            { id: 'natacao', nome: 'Natação', icone: '🏊' },
            { id: 'f1', nome: 'F1', icone: '🏎️' },
            { id: 'volei', nome: 'Vôlei', icone: '🏐' },
            { id: 'basquete', nome: 'Basquete', icone: '🏀' },
            { id: 'flamengo', nome: 'Flamengo', icone: '🔴⚫' },
            { id: 'vasco', nome: 'Vasco', icone: '⚫⚪' },
            { id: 'olimpiadas', nome: 'Olimpíadas', icone: '🏅' },
            { id: 'copa-do-mundo', nome: 'Copa do Mundo', icone: '🏆' }
        ]
    },
    { id: 'geografia', nome: 'Geografia', icone: '🗺️' },
    { 
        id: 'historia', 
        nome: 'História', 
        icone: '📜',
        subtemas: [
            { id: 'politica-brasileira', nome: 'Política Brasileira', icone: '🇧🇷' }
        ]
    },
    { id: 'literatura', nome: 'Literatura', icone: '📚' },
    { id: 'mitos-verdades', nome: 'Mitos ou Verdades', icone: '🤔' },
    { id: 'games', nome: 'Mundo dos Games', icone: '🎮' },
    { 
        id: 'musica', 
        nome: 'Música', 
        icone: '🎵',
        subtemas: [
            { id: 'musica-pop', nome: 'Pop', icone: '🎤' },
            { id: 'musica-rock', nome: 'Rock', icone: '🎸' },
            { id: 'musica-sertanejo', nome: 'Sertanejo', icone: '🤠' },
            { id: 'musica-olivia-rodrigo', nome: 'Olivia Rodrigo', icone: '💜' },
            { id: 'musica-taylor-swift', nome: 'Taylor Swift', icone: '✨' },
            { id: 'musica-ed-sheeran', nome: 'Ed Sheeran', icone: '🎸' }
        ]
    },
    { id: 'nostalgia', nome: 'Nostalgia', icone: '📼' },
    { id: 'z-testes', nome: 'Z-Testes', icone: '🧪' }
];

// Tenta inicializar o Firebase
async function inicializarFirebase() {
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
        const { 
            getFirestore, 
            collection, 
            addDoc, 
            getDocs, 
            getDoc,
            doc,
            setDoc,
            updateDoc,
            deleteDoc,
            query, 
            orderBy, 
            where,
            limit,
            writeBatch
        } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js");

        const firebaseConfig = {
            apiKey: "AIzaSyD_fPui3UT7BCSqUlLzl3E5TDWFkTkkU2I",
            authDomain: "jogo-da-velha-usa.firebaseapp.com",
            databaseURL: "https://jogo-da-velha-usa-default-rtdb.firebaseio.com",
            projectId: "jogo-da-velha-usa",
            storageBucket: "jogo-da-velha-usa.firebasestorage.app",
            messagingSenderId: "371808043984",
            appId: "1:371808043984:web:88e772bae13b93b881efd5"
        };

        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        firebaseDisponivel = true;
        
        // Armazena as funções do Firestore globalmente
        window._firestore = { 
            collection, addDoc, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc,
            query, orderBy, where, limit, writeBatch, db 
        };
        
        console.log('✅ Firebase inicializado com sucesso!');
        return true;
    } catch (error) {
        console.warn('⚠️ Firebase não disponível, usando modo offline:', error.message);
        firebaseDisponivel = false;
        return false;
    }
}

// Inicializa ao carregar
const firebasePromise = inicializarFirebase();

// ========================================
// FUNÇÕES DE TEMAS
// ========================================

/**
 * Busca todos os temas disponíveis
 * Retorna os temas estáticos + contagem de perguntas do Firebase
 * Para temas com subtemas, soma a contagem de todos os subtemas
 */
export async function buscarTemas() {
    await firebasePromise;
    
    // Função auxiliar para contar perguntas de um tema/subtema
    async function contarPerguntas(temaId) {
        if (!firebaseDisponivel || !window._firestore) return 0;
        try {
            const { collection, getDocs, query, where, db } = window._firestore;
            const q = query(collection(db, "perguntas"), where("tema", "==", temaId));
            const snapshot = await getDocs(q);
            return snapshot.size;
        } catch {
            return 0;
        }
    }
    
    // Retorna temas estáticos com contagem se possível
    if (!firebaseDisponivel || !window._firestore) {
        return TEMAS_DISPONIVEIS.map(t => ({ ...t, totalPerguntas: 0 }));
    }
    
    try {
        // Busca contagem de perguntas por tema (incluindo subtemas)
        const temasComContagem = await Promise.all(
            TEMAS_DISPONIVEIS.map(async (tema) => {
                // Conta perguntas do tema principal
                let totalPerguntas = await contarPerguntas(tema.id);
                
                // Se tem subtemas, conta também e adiciona contagem a cada subtema
                let subtemasComContagem = null;
                if (tema.subtemas && tema.subtemas.length > 0) {
                    subtemasComContagem = await Promise.all(
                        tema.subtemas.map(async (subtema) => {
                            const subCount = await contarPerguntas(subtema.id);
                            totalPerguntas += subCount;
                            return { ...subtema, totalPerguntas: subCount };
                        })
                    );
                }
                
                return { 
                    ...tema, 
                    totalPerguntas,
                    subtemas: subtemasComContagem || tema.subtemas
                };
            })
        );
        
        return temasComContagem;
    } catch (error) {
        console.error("Erro ao buscar temas:", error);
        return TEMAS_DISPONIVEIS.map(t => ({ ...t, totalPerguntas: 0 }));
    }
}

/**
 * Busca informações de um tema específico (incluindo subtemas)
 */
export function buscarTemaPorId(temaId) {
    // Primeiro busca nos temas principais
    const temaPrincipal = TEMAS_DISPONIVEIS.find(t => t.id === temaId);
    if (temaPrincipal) return temaPrincipal;
    
    // Se não encontrou, busca nos subtemas
    for (const tema of TEMAS_DISPONIVEIS) {
        if (tema.subtemas) {
            const subtema = tema.subtemas.find(s => s.id === temaId);
            if (subtema) return { ...subtema, temaPai: tema.id };
        }
    }
    
    return null;
}

/**
 * Retorna todos os IDs de temas relacionados (tema + subtemas)
 * Útil para buscar perguntas quando um tema pai é selecionado
 */
export function obterTodosIdsTema(temaId) {
    const tema = TEMAS_DISPONIVEIS.find(t => t.id === temaId);
    if (!tema) return [temaId];
    
    const ids = [temaId];
    if (tema.subtemas) {
        tema.subtemas.forEach(s => ids.push(s.id));
    }
    return ids;
}

// ========================================
// FUNÇÕES DE PERGUNTAS
// ========================================

/**
 * Busca perguntas por temas selecionados
 * @param {Array} temas - Array de IDs de temas (ex: ['geografia', 'historia'])
 * @param {number} quantidade - Quantidade de perguntas para sortear
 * @returns {Promise<Array>} - Array de perguntas sorteadas
 */
export async function buscarPerguntasPorTemas(temas, quantidade = 10) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        console.log('Firebase offline - não é possível buscar perguntas');
        return [];
    }
    
    try {
        const { collection, getDocs, query, where, db } = window._firestore;
        const perguntasCollection = collection(db, "perguntas");
        
        let todasPerguntas = [];
        
        // Busca perguntas de cada tema
        for (const temaId of temas) {
            const q = query(
                perguntasCollection,
                where("tema", "==", temaId)
            );
            
            const snapshot = await getDocs(q);
            snapshot.forEach((doc) => {
                todasPerguntas.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
        }
        
        // Embaralha e seleciona a quantidade desejada
        const perguntasSorteadas = embaralharArray(todasPerguntas).slice(0, quantidade);
        
        console.log(`✅ ${perguntasSorteadas.length} perguntas sorteadas de ${temas.length} tema(s)`);
        return perguntasSorteadas;
    } catch (error) {
        console.error("Erro ao buscar perguntas:", error);
        return [];
    }
}

/**
 * Busca perguntas aleatórias de todos os temas
 * @param {number} quantidade - Quantidade de perguntas
 * @returns {Promise<Array>}
 */
export async function buscarPerguntasAleatorias(quantidade = 10) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        return [];
    }
    
    // Temas excluídos do modo aleatório (não afetam ranking geral)
    const temasExcluidos = ['criancas', 'z-testes'];
    
    try {
        const { collection, getDocs, db } = window._firestore;
        const perguntasCollection = collection(db, "perguntas");
        
        const snapshot = await getDocs(perguntasCollection);
        const todasPerguntas = [];
        
        snapshot.forEach((doc) => {
            const pergunta = { id: doc.id, ...doc.data() };
            // Filtra temas excluídos
            if (!temasExcluidos.includes(pergunta.tema)) {
                todasPerguntas.push(pergunta);
            }
        });
        
        // Embaralha e seleciona
        const perguntasSorteadas = embaralharArray(todasPerguntas).slice(0, quantidade);
        
        console.log(`✅ ${perguntasSorteadas.length} perguntas aleatórias sorteadas (excluídos: ${temasExcluidos.join(', ')})`);
        return perguntasSorteadas;
    } catch (error) {
        console.error("Erro ao buscar perguntas aleatórias:", error);
        return [];
    }
}

/**
 * Busca perguntas específicas por IDs (para modo Desafio)
 * @param {Array} perguntasIds - Array de IDs das perguntas
 * @returns {Promise<Array>} - Array de perguntas na mesma ordem dos IDs
 */
export async function buscarPerguntasPorIds(perguntasIds) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        console.log('Firebase offline - não é possível buscar perguntas');
        return [];
    }
    
    if (!perguntasIds || perguntasIds.length === 0) {
        return [];
    }
    
    try {
        const { doc, getDoc, db } = window._firestore;
        
        const perguntas = [];
        
        // Busca cada pergunta pelo ID
        for (const perguntaId of perguntasIds) {
            const docRef = doc(db, "perguntas", perguntaId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
                perguntas.push({
                    id: docSnap.id,
                    ...docSnap.data()
                });
            } else {
                console.warn(`Pergunta não encontrada: ${perguntaId}`);
            }
        }
        
        console.log(`✅ ${perguntas.length} perguntas carregadas para desafio`);
        return perguntas;
    } catch (error) {
        console.error("Erro ao buscar perguntas por IDs:", error);
        return [];
    }
}

/**
 * Busca uma partida específica pelo sessaoId
 * @param {string} sessaoId - ID da sessão/partida
 * @returns {Promise<Object|null>}
 */
export async function buscarPartidaPorSessaoId(sessaoId) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        return null;
    }
    
    try {
        const { collection, getDocs, query, where, db } = window._firestore;
        const resultsCollection = collection(db, "quiz-results");
        
        const q = query(
            resultsCollection,
            where("sessaoId", "==", sessaoId)
        );
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            return null;
        }
        
        // Retorna o primeiro resultado (deve ser único)
        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    } catch (error) {
        console.error("Erro ao buscar partida:", error);
        return null;
    }
}

/**
 * Busca ranking de uma partida específica (todos que jogaram a mesma sessão)
 * @param {string} sessaoId - ID da sessão original
 * @param {number} limite - Quantidade máxima de resultados
 * @returns {Promise<Array>}
 */
export async function buscarRankingPorSessao(sessaoId, limite = 50) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        return [];
    }
    
    try {
        const { collection, getDocs, query, where, orderBy, limit: limitFn, db } = window._firestore;
        const resultsCollection = collection(db, "quiz-results");
        
        // Busca todos que jogaram esta sessão ou desafiaram ela
        const q = query(
            resultsCollection,
            where("sessaoOriginalId", "==", sessaoId),
            orderBy("pontuacaoTotal", "desc"),
            limitFn(limite)
        );
        
        const snapshot = await getDocs(q);
        const ranking = [];
        
        snapshot.forEach((doc) => {
            ranking.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return ranking;
    } catch (error) {
        console.error("Erro ao buscar ranking da sessão:", error);
        // Se der erro de índice, tenta busca simples
        return [];
    }
}

/**
 * Adiciona uma nova pergunta ao Firebase
 * @param {Object} pergunta - Dados da pergunta
 */
export async function adicionarPergunta(pergunta) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        throw new Error('Firebase não disponível');
    }
    
    try {
        const { collection, addDoc, db } = window._firestore;
        const perguntasCollection = collection(db, "perguntas");
        
        const docRef = await addDoc(perguntasCollection, {
            ...pergunta,
            criadoEm: new Date().toISOString()
        });
        
        console.log("✅ Pergunta adicionada com ID:", docRef.id);
        return docRef;
    } catch (error) {
        console.error("Erro ao adicionar pergunta:", error);
        throw error;
    }
}

/**
 * Adiciona múltiplas perguntas em lote
 * @param {Array} perguntas - Array de perguntas
 */
export async function adicionarPerguntasEmLote(perguntas) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        throw new Error('Firebase não disponível');
    }
    
    try {
        const { collection, writeBatch, doc, db } = window._firestore;
        const batch = writeBatch(db);
        const perguntasCollection = collection(db, "perguntas");
        
        perguntas.forEach((pergunta) => {
            const novoDoc = doc(perguntasCollection);
            batch.set(novoDoc, {
                ...pergunta,
                criadoEm: new Date().toISOString()
            });
        });
        
        await batch.commit();
        console.log(`✅ ${perguntas.length} perguntas adicionadas em lote`);
        return true;
    } catch (error) {
        console.error("Erro ao adicionar perguntas em lote:", error);
        throw error;
    }
}

/**
 * Busca todas as perguntas (para o painel admin)
 */
export async function buscarTodasPerguntas() {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        return [];
    }
    
    try {
        const { collection, getDocs, query, orderBy, db } = window._firestore;
        const perguntasCollection = collection(db, "perguntas");
        
        const q = query(perguntasCollection, orderBy("criadoEm", "desc"));
        const snapshot = await getDocs(q);
        
        const perguntas = [];
        snapshot.forEach((doc) => {
            perguntas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return perguntas;
    } catch (error) {
        console.error("Erro ao buscar todas as perguntas:", error);
        return [];
    }
}

/**
 * Exclui uma pergunta
 * @param {string} perguntaId - ID da pergunta
 */
export async function excluirPergunta(perguntaId) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        throw new Error('Firebase não disponível');
    }
    
    try {
        const { doc, deleteDoc, db } = window._firestore;
        await deleteDoc(doc(db, "perguntas", perguntaId));
        console.log("✅ Pergunta excluída:", perguntaId);
        return true;
    } catch (error) {
        console.error("Erro ao excluir pergunta:", error);
        throw error;
    }
}

/**
 * Atualiza uma pergunta existente
 * @param {string} perguntaId - ID da pergunta
 * @param {Object} dados - Dados a atualizar
 */
export async function atualizarPergunta(perguntaId, dados) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        throw new Error('Firebase não disponível');
    }
    
    try {
        const { doc, updateDoc, db } = window._firestore;
        await updateDoc(doc(db, "perguntas", perguntaId), dados);
        console.log("✅ Pergunta atualizada:", perguntaId);
        return true;
    } catch (error) {
        console.error("Erro ao atualizar pergunta:", error);
        throw error;
    }
}

/**
 * Busca perguntas por tema específico
 * @param {string} tema - ID do tema
 * @returns {Promise<Array>} - Array de perguntas com id
 */
export async function buscarPerguntasPorTema(tema) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        return [];
    }
    
    try {
        const { collection, query, where, getDocs, db } = window._firestore;
        const perguntasRef = collection(db, "perguntas");
        const q = query(perguntasRef, where("tema", "==", tema));
        const snapshot = await getDocs(q);
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Erro ao buscar perguntas por tema:", error);
        return [];
    }
}

// ========================================
// FUNÇÕES DE RESULTADO/RANKING
// ========================================

/**
 * Salva o resultado de uma partida no Firebase
 */
export async function salvarResultado(resultado) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        console.log('Firebase offline - resultado salvo apenas localmente');
        return null;
    }
    
    try {
        const { collection, addDoc, db } = window._firestore;
        const quizResultsCollection = collection(db, "quiz-results");
        
        const docRef = await addDoc(quizResultsCollection, {
            ...resultado,
            dataHora: new Date().toISOString()
        });
        console.log("✅ Resultado salvo no Firebase com ID:", docRef.id);
        return docRef;
    } catch (error) {
        console.error("Erro ao salvar resultado:", error);
        throw error;
    }
}

/**
 * Busca o ranking global ordenado por pontuação
 */
export async function buscarRanking(limite = 50) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        console.log('Firebase offline - ranking não disponível');
        return [];
    }
    
    try {
        const { collection, getDocs, query, orderBy, limit: limitFn, db } = window._firestore;
        const quizResultsCollection = collection(db, "quiz-results");
        
        const q = query(
            quizResultsCollection,
            orderBy("pontuacaoTotal", "desc"),
            orderBy("dataHora", "asc"),
            limitFn(limite)
        );
        
        const snapshot = await getDocs(q);
        const ranking = [];
        
        snapshot.forEach((doc) => {
            ranking.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return ranking;
    } catch (error) {
        console.error("Erro ao buscar ranking:", error);
        if (error.message && error.message.includes('index')) {
            console.log('⚠️ É necessário criar um índice no Firebase. Verifique o link acima.');
        }
        return [];
    }
}

/**
 * Busca o ranking filtrado por temas
 */
export async function buscarRankingPorTemas(temas, limite = 20) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        return [];
    }
    
    try {
        const { collection, getDocs, query, orderBy, where, limit: limitFn, db } = window._firestore;
        const quizResultsCollection = collection(db, "quiz-results");
        
        // Firestore tem limitação com array-contains-any, então fazemos uma busca mais ampla
        const q = query(
            quizResultsCollection,
            orderBy("pontuacaoTotal", "desc"),
            orderBy("dataHora", "asc"),
            limitFn(limite * 2) // Busca mais para filtrar depois
        );
        
        const snapshot = await getDocs(q);
        const ranking = [];
        
        snapshot.forEach((doc) => {
            const data = doc.data();
            // Filtra pelos temas se especificado
            if (temas && temas.length > 0) {
                const temasPartida = data.temas || [];
                const temIntersecao = temas.some(t => temasPartida.includes(t));
                if (temIntersecao) {
                    ranking.push({ id: doc.id, ...data });
                }
            } else {
                ranking.push({ id: doc.id, ...data });
            }
        });
        
        return ranking.slice(0, limite);
    } catch (error) {
        console.error("Erro ao buscar ranking por temas:", error);
        return [];
    }
}

/**
 * Busca histórico de partidas de um jogador
 */
export async function buscarHistoricoJogador(jogador, limite = 20) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        return [];
    }
    
    try {
        const { collection, getDocs, query, where, orderBy, limit: limitFn, db } = window._firestore;
        const quizResultsCollection = collection(db, "quiz-results");
        
        const q = query(
            quizResultsCollection,
            where("jogador", "==", jogador),
            orderBy("dataHora", "desc"),
            limitFn(limite)
        );
        
        const snapshot = await getDocs(q);
        const historico = [];
        
        snapshot.forEach((doc) => {
            historico.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        return historico;
    } catch (error) {
        console.error("Erro ao buscar histórico:", error);
        return [];
    }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Embaralha um array usando Fisher-Yates
 */
function embaralharArray(array) {
    const novoArray = [...array];
    for (let i = novoArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [novoArray[i], novoArray[j]] = [novoArray[j], novoArray[i]];
    }
    return novoArray;
}

/**
 * Verifica se o Firebase está disponível
 */
export function isFirebaseDisponivel() {
    return firebaseDisponivel;
}

/**
 * Exclui todas as partidas (resultados) do Firebase
 * @returns {Promise<number>} - Número de partidas excluídas
 */
export async function excluirTodasPartidas() {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        throw new Error('Firebase não disponível');
    }
    
    const { collection, getDocs, deleteDoc, doc, db } = window._firestore;
    
    try {
        const resultadosRef = collection(db, 'quiz-results');
        const snapshot = await getDocs(resultadosRef);
        
        let count = 0;
        const deletePromises = [];
        
        snapshot.forEach((documento) => {
            deletePromises.push(deleteDoc(doc(db, 'quiz-results', documento.id)));
            count++;
        });
        
        await Promise.all(deletePromises);
        
        console.log(`✅ ${count} partidas excluídas`);
        return count;
    } catch (error) {
        console.error("Erro ao excluir partidas:", error);
        throw error;
    }
}

/**
 * Aguarda o Firebase inicializar
 */
export async function aguardarFirebase() {
    return firebasePromise;
}

export { db, firebaseDisponivel };
