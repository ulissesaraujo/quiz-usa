# Especificação: Quiz USA - Jogo de Quiz com Temas Dinâmicos

## 🎮 Acesso ao Jogo

- **Quiz:** https://ulissesaraujo.github.io/quiz-usa
- **Painel Admin:** https://ulissesaraujo.github.io/quiz-usa/admin.html
- **Repositório:** https://github.com/ulissesaraujo/quiz-usa

---

## 1. Visão Geral

Aplicativo web de quiz interativo construído com HTML5, CSS3, JavaScript puro (Vanilla JS) e Firebase. O jogo possui identificação de usuário por nome, sistema de temas com seleção múltipla ou aleatório, mecânica de revelação de respostas com tempo e ranking global.

**Objetivo:** Projeto de aprendizado para entender o fluxo de desenvolvimento com Kiro.

---

## 2. Funcionalidades Principais

### A. Identificação do Jogador

- Tela inicial com campo para digitar nome/apelido
- Nome salvo no `localStorage`
- Sem autenticação complexa nesta fase

### B. Seleção de Temas

O jogador pode escolher como jogar:

- **Temas Aleatórios:** Sistema sorteia 10 perguntas de qualquer tema
- **Temas Específicos:** Seleciona um ou mais temas para jogar

#### Temas Disponíveis (13)

| ID | Nome | Ícone |
|----|------|-------|
| `geografia` | Geografia | 🗺️ |
| `historia` | História | 📜 |
| `ciencia` | Ciência | 🔬 |
| `arte` | Arte | 🎨 |
| `literatura` | Literatura | 📚 |
| `cinema-series` | Cinema e Séries | 🎬 |
| `musica` | Música | 🎵 |
| `games` | Mundo dos Games | 🎮 |
| `mitos-verdades` | Mitos ou Verdades | 🤔 |
| `comidas-bebidas` | Comidas e Bebidas | 🍔 |
| `nostalgia` | Nostalgia | 📼 |
| `esportes` | Esportes | ⚽ |
| `curiosidades` | Curiosidades | 💡 |

### C. Mecânica da Partida

#### Fases por Pergunta:

1. **Fase de Leitura (3 segundos)**
   - Apenas o enunciado é exibido
   - Alternativas ficam ocultas
   - Contador visual de 3 segundos

2. **Fase de Resposta**
   - Alternativas reveladas (4 opções)
   - Cronômetro inicia e mede o tempo de resposta
   - Jogador clica na resposta escolhida

#### Controle Local de Respostas:

- Durante a partida, todas as respostas são armazenadas **em memória (JavaScript)**
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
- **Por partida (10 perguntas):** 10 × 15 = **150 pontos**

### E. Dados Salvos no Firebase (Firestore)

Após finalizar uma partida:

```javascript
{
  jogador: "apelido",
  sessaoId: "quiz_1696789123456_abc123",
  temas: ["geografia", "historia"],
  temasNomes: ["Geografia", "História"],
  modoAleatorio: false,
  descricaoTemas: "Geografia, História",
  pontuacaoTotal: 127,
  acertos: 8,
  totalPerguntas: 10,
  tempoTotal: 25.4,
  detalhes: [
    { perguntaId: "abc123", tema: "geografia", tempo: 1.2, correto: true, pontosBase: 10, bonus: 3 },
    // ... 10 itens
  ],
  dataHora: "2026-10-08T14:30:00Z"
}
```

### F. Ranking Global

- Tabela comparativa dos melhores jogadores
- Exibe temas jogados por cada jogador
- **Ordenação:**
  1. **Maior pontuação total** (inclui bônus de velocidade)
  2. **Data/hora mais antiga** (quem jogou primeiro, em caso de empate)

### G. Painel Administrativo

O painel admin (`admin.html`) permite:

- **Adicionar perguntas** uma a uma
- **Visualizar todas as perguntas** cadastradas
- **Filtrar por tema**
- **Excluir perguntas**
- **Exportar** todas as perguntas para JSON
- **Importar** perguntas de um arquivo JSON

---

## 3. Arquitetura de Telas (SPA)

| Tela | Descrição |
|------|-----------|
| **1. Login** | Campo de nome + botão "Entrar" |
| **2. Temas** | Grid de temas + botão aleatório + "Ver Ranking" |
| **3. Quiz** | Pergunta + contador 3s + alternativas + cronômetro |
| **4. Resultado** | Resumo da partida + ranking |

---

## 4. Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Design responsivo, cards, animações de transição
- **JavaScript (ES6 Modules)** - Lógica do jogo, estado em memória, timers
- **Firebase Firestore** - Persistência de perguntas e resultados

---

## 5. Estrutura de Arquivos

```
quiz-usa/
├── index.html              # Aplicação principal (4 telas)
├── admin.html              # Painel administrativo
├── css/
│   └── style.css           # Estilos e responsividade
├── js/
│   ├── app.js              # Lógica principal e navegação
│   ├── firebase-config.js  # Configuração Firebase + funções de dados
│   ├── temas.js            # Gerenciador de seleção de temas
│   ├── quiz.js             # Mecânica do quiz (timers, respostas)
│   └── ranking.js          # Funções de ranking
├── data/
│   ├── perguntas.json          # Dados antigos (deprecated)
│   └── perguntas-iniciais.json # 96 perguntas para importar
└── docs/
    └── SPEC.md             # Esta especificação
```

---

## 6. Coleções no Firebase (Firestore)

### Coleção: `perguntas`

```javascript
{
  tema: "geografia",
  enunciado: "Qual é a capital dos EUA?",
  alternativas: ["Nova York", "Los Angeles", "Washington D.C.", "Chicago"],
  correta: 2,
  criadoEm: "2026-10-09T10:00:00Z"
}
```

### Coleção: `quiz-results`

Armazena os resultados de todas as partidas jogadas.

---

## 7. Como Usar

### Jogar

1. Acesse https://ulissesaraujo.github.io/quiz-usa
2. Digite seu nome
3. Escolha temas ou clique em "Aleatório"
4. Clique em "Jogar"
5. Responda as 10 perguntas
6. Veja seu resultado e posição no ranking

### Adicionar Perguntas

1. Acesse https://ulissesaraujo.github.io/quiz-usa/admin.html
2. Preencha o formulário com tema, enunciado e alternativas
3. Marque a alternativa correta
4. Clique em "Salvar Pergunta"

### Importar Perguntas em Lote

1. Acesse o painel admin
2. Clique em "Importar JSON"
3. Selecione um arquivo JSON com o formato:

```json
{
  "perguntas": [
    {
      "tema": "geografia",
      "enunciado": "Pergunta aqui?",
      "alternativas": ["A", "B", "C", "D"],
      "correta": 0
    }
  ]
}
```

---

## 8. Melhorias Futuras

- [ ] Firebase Authentication (login com Google)
- [ ] Regras de segurança mais restritivas no Firebase
- [ ] Níveis de dificuldade por pergunta
- [ ] Perguntas com imagens
- [ ] Modo multiplayer em tempo real
- [ ] PWA (Progressive Web App)
- [ ] Estatísticas do jogador (histórico de partidas)
