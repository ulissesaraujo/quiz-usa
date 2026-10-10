# Especificação: Quiz USA - Jogo de Quiz com Salas e Ranking

## 1. Visão Geral

Aplicativo web de quiz interativo construído com HTML5, CSS3, JavaScript puro (Vanilla JS) e Firebase. O jogo possui identificação de usuário por nome, sistema de salas com trava (cada sala jogada apenas uma vez), mecânica de revelação de respostas com tempo e ranking global.

**Objetivo inicial:** Projeto de aprendizado para entender o fluxo de desenvolvimento com Kiro.

---

## 2. Funcionalidades Principais

### A. Identificação do Jogador

- Tela inicial com campo para digitar nome/apelido
- Nome salvo no `localStorage` e no Firebase para identificar o jogador
- Sem autenticação complexa nesta fase (melhoria futura)

### B. Hub de Salas com Paginação

- Lista/grade de salas exibidas em páginas (ex: 10 salas por página)
- Navegação "Anterior / Próxima" para ver mais salas
- **Status da Sala:**
  - **Disponível:** Jogador pode clicar e jogar
  - **Concluída:** Indicador visual + desabilitada para replay

### C. Mecânica da Partida

#### Fases por Pergunta:

1. **Fase de Leitura (3 segundos)**
   - Apenas o enunciado é exibido
   - Alternativas ficam ocultas
   - Contador visual de 3 segundos

2. **Fase de Resposta**
   - Alternativas reveladas (2 a 4 opções)
   - Cronômetro inicia e mede o tempo de resposta
   - Jogador clica na resposta escolhida

#### Controle Local de Respostas:

- Durante a partida, todas as respostas são armazenadas **em memória (JavaScript)**
- Nenhuma chamada ao Firebase durante o jogo
- **Somente ao finalizar as 10 perguntas**, o resultado completo é enviado ao Firebase
- Isso garante resiliência a quedas de conexão durante a partida

### D. Sistema de Pontuação

#### Pontos Base
- **Resposta correta:** 10 pontos
- **Resposta errada:** 0 pontos

#### Bônus por Velocidade (apenas para respostas corretas)

| Tempo de Resposta | Bônus |
|-------------------|-------|
| ≤ 1 segundo       | +5 pts |
| ≤ 2 segundos      | +3 pts |
| ≤ 3 segundos      | +2 pts |
| ≤ 4 segundos      | +1 pt  |
| > 4 segundos      | 0 pts  |

#### Pontuação Máxima
- **Por pergunta:** 10 + 5 = **15 pontos**
- **Por sala (10 perguntas):** 10 × 15 = **150 pontos**

### E. Dados Salvos no Firebase

Após finalizar uma sala:

```javascript
{
  jogador: "apelido",
  salaId: "sala_001",
  pontuacaoTotal: 127,        // soma de pontos base + bônus
  acertos: 8,                 // quantidade de respostas corretas
  tempoTotal: 25.4,           // segundos totais gastos
  detalhes: [                 // array com detalhes de cada pergunta
    { tempo: 1.2, correto: true, pontosBase: 10, bonus: 3 },
    { tempo: 3.5, correto: true, pontosBase: 10, bonus: 2 },
    { tempo: 2.1, correto: false, pontosBase: 0, bonus: 0 },
    // ... 10 itens
  ],
  dataHora: "2026-10-08T14:30:00Z" // ISO timestamp para desempate
}
```

### F. Ranking Global

- Tabela comparativa dos melhores jogadores
- **Ordenação:**
  1. **Maior pontuação total** (já inclui bônus de velocidade)
  2. **Data/hora mais antiga** (quem jogou primeiro, em caso de empate)

---

## 3. Arquitetura de Telas (SPA)

| Tela | Descrição |
|------|-----------|
| **1. Login** | Campo de nome + botão "Entrar" |
| **2. Salas** | Grade de salas paginada + botão "Ver Ranking" |
| **3. Quiz** | Pergunta + contador 3s + alternativas + cronômetro |
| **4. Resultado** | Resumo da partida + ranking global |

---

## 4. Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Design responsivo, cards, animações de transição
- **JavaScript (Vanilla)** - Lógica do jogo, estado em memória, timers
- **Firebase Firestore** - Persistência de dados e ranking

---

## 5. Estrutura de Arquivos

```
quiz-usa/
├── index.html          # Estrutura das 4 telas
├── css/
│   └── style.css       # Estilos e responsividade
├── js/
│   ├── app.js          # Lógica principal e navegação
│   ├── firebase-config.js  # Inicialização Firebase
│   ├── quiz.js         # Mecânica do quiz (timers, respostas)
│   └── ranking.js      # Funções de ranking
├── data/
│   └── perguntas.json  # Dados de teste (poucas perguntas)
└── docs/
    └── SPEC.md         # Esta especificação
```

---

## 6. Dados de Teste

Criar 2 salas de exemplo com 10 perguntas cada:

- **Sala 1:** "Geografia dos EUA"
- **Sala 2:** "História dos EUA"

Perguntas simples com 4 alternativas cada.

---

## 7. Melhorias Futuras (Fora do Escopo Inicial)

- [ ] Firebase Authentication (login com Google)
- [ ] Regras de segurança do Firebase
- [ ] Painel admin para cadastrar perguntas
- [ ] Categorias/temas de salas
- [ ] Modo multiplayer em tempo real
- [ ] PWA (Progressive Web App)

---

## 8. Tarefas de Implementação

1. **Setup inicial**
   - Criar estrutura de pastas
   - Configurar Firebase no console
   - Criar `firebase-config.js`

2. **HTML base**
   - Estrutura das 4 telas em `index.html`
   - Importação dos scripts

3. **CSS**
   - Layout responsivo
   - Cards de salas (disponível/concluída)
   - Animações de revelação
   - Tabela de ranking

4. **JavaScript - Navegação**
   - Sistema de troca de telas (SPA)
   - Gerenciamento de estado do usuário

5. **JavaScript - Quiz**
   - Timer de 3 segundos (leitura)
   - Cronômetro de resposta
   - Cálculo de bônus por velocidade
   - Armazenamento em memória
   - Envio ao Firebase no final

6. **JavaScript - Ranking**
   - Buscar dados do Firebase
   - Ordenar por acertos > tempo > data
   - Exibir tabela

7. **Dados de teste**
   - Criar `perguntas.json` com 2 salas
