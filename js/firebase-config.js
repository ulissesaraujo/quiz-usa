// ========================================
// FIREBASE-CONFIG.JS - Configuração Firebase
// ========================================

// Flag para verificar se Firebase está disponível
let firebaseDisponivel = false;
let db = null;

// Temas disponíveis no quiz
export const TEMAS_DISPONIVEIS = [
    { id: 'geografia', nome: 'Geografia', icone: '🗺️' },
    { id: 'historia', nome: 'História', icone: '📜' },
    { id: 'ciencia', nome: 'Ciência', icone: '🔬' },
    { id: 'arte', nome: 'Arte', icone: '🎨' },
    { id: 'literatura', nome: 'Literatura', icone: '📚' },
    { id: 'cinema-series', nome: 'Cinema e Séries', icone: '🎬' },
    { id: 'musica', nome: 'Música', icone: '🎵' },
    { id: 'games', nome: 'Mundo dos Games', icone: '🎮' },
    { id: 'mitos-verdades', nome: 'Mitos ou Verdades', icone: '🤔' },
    { id: 'comidas-bebidas', nome: 'Comidas e Bebidas', icone: '🍔' },
    { id: 'nostalgia', nome: 'Nostalgia', icone: '📼' },
    { id: 'esportes', nome: 'Esportes', icone: '⚽' },
    { id: 'curiosidades', nome: 'Curiosidades', icone: '💡' }
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
 */
export async function buscarTemas() {
    await firebasePromise;
    
    // Retorna temas estáticos com contagem se possível
    if (!firebaseDisponivel || !window._firestore) {
        return TEMAS_DISPONIVEIS.map(t => ({ ...t, totalPerguntas: 0 }));
    }
    
    try {
        const { collection, getDocs, query, where, db } = window._firestore;
        
        // Busca contagem de perguntas por tema
        const temasComContagem = await Promise.all(
            TEMAS_DISPONIVEIS.map(async (tema) => {
                try {
                    const q = query(
                        collection(db, "perguntas"),
                        where("tema", "==", tema.id)
                    );
                    const snapshot = await getDocs(q);
                    return { ...tema, totalPerguntas: snapshot.size };
                } catch {
                    return { ...tema, totalPerguntas: 0 };
                }
            })
        );
        
        return temasComContagem;
    } catch (error) {
        console.error("Erro ao buscar temas:", error);
        return TEMAS_DISPONIVEIS.map(t => ({ ...t, totalPerguntas: 0 }));
    }
}

/**
 * Busca informações de um tema específico
 */
export function buscarTemaPorId(temaId) {
    return TEMAS_DISPONIVEIS.find(t => t.id === temaId) || null;
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
    
    try {
        const { collection, getDocs, db } = window._firestore;
        const perguntasCollection = collection(db, "perguntas");
        
        const snapshot = await getDocs(perguntasCollection);
        const todasPerguntas = [];
        
        snapshot.forEach((doc) => {
            todasPerguntas.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Embaralha e seleciona
        const perguntasSorteadas = embaralharArray(todasPerguntas).slice(0, quantidade);
        
        console.log(`✅ ${perguntasSorteadas.length} perguntas aleatórias sorteadas`);
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
 * Aguarda o Firebase inicializar
 */
export async function aguardarFirebase() {
    return firebasePromise;
}

export { db, firebaseDisponivel };
