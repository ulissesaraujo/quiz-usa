// ========================================
// FIREBASE-CONFIG.JS - Configuração Firebase
// ========================================

// Flag para verificar se Firebase está disponível
let firebaseDisponivel = false;
let db = null;

// Tenta inicializar o Firebase
async function inicializarFirebase() {
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js");
        const { 
            getFirestore, 
            collection, 
            addDoc, 
            getDocs, 
            query, 
            orderBy, 
            where,
            limit 
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
        window._firestore = { collection, addDoc, getDocs, query, orderBy, where, limit, db };
        
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
        // Se for erro de índice, mostra instruções
        if (error.message && error.message.includes('index')) {
            console.log('⚠️ É necessário criar um índice no Firebase. Verifique o link acima.');
        }
        return [];
    }
}

/**
 * Busca o ranking de uma sala específica
 */
export async function buscarRankingSala(salaId, limite = 20) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        return [];
    }
    
    try {
        const { collection, getDocs, query, orderBy, where, limit: limitFn, db } = window._firestore;
        const quizResultsCollection = collection(db, "quiz-results");
        
        const q = query(
            quizResultsCollection,
            where("salaId", "==", salaId),
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
        console.error("Erro ao buscar ranking da sala:", error);
        return [];
    }
}

/**
 * Busca as salas já jogadas por um jogador
 */
export async function buscarSalasJogadas(jogador) {
    await firebasePromise;
    
    if (!firebaseDisponivel || !window._firestore) {
        return [];
    }
    
    try {
        const { collection, getDocs, query, where, db } = window._firestore;
        const quizResultsCollection = collection(db, "quiz-results");
        
        const q = query(
            quizResultsCollection,
            where("jogador", "==", jogador)
        );
        
        const snapshot = await getDocs(q);
        const salasJogadas = [];
        
        snapshot.forEach((doc) => {
            salasJogadas.push(doc.data().salaId);
        });
        
        return salasJogadas;
    } catch (error) {
        console.error("Erro ao buscar salas jogadas:", error);
        return [];
    }
}

export { db, firebaseDisponivel };
