# 🇺🇸 Quiz USA

Jogo de quiz interativo sobre os Estados Unidos, construído com HTML5, CSS3, JavaScript puro e Firebase.

## 🎮 Funcionalidades

- **Sistema de Salas:** Múltiplas salas temáticas (Geografia, História, etc.)
- **Mecânica de Tempo:** 3 segundos para ler a pergunta, depois cronômetro para responder
- **Pontuação com Bônus:** Respostas rápidas ganham pontos extras
- **Ranking Global:** Compare sua pontuação com outros jogadores
- **Trava de Sala:** Cada sala só pode ser jogada uma vez por jogador

## 🏆 Sistema de Pontuação

| Resposta | Pontos Base | Bônus (≤1s) | Bônus (≤2s) | Bônus (≤3s) | Bônus (≤4s) |
|----------|-------------|-------------|-------------|-------------|-------------|
| Correta  | 10 pts      | +5 pts      | +3 pts      | +2 pts      | +1 pt       |
| Errada   | 0 pts       | -           | -           | -           | -           |

**Pontuação máxima por sala:** 150 pontos (10 perguntas × 15 pts)

## 🛠️ Tecnologias

- HTML5
- CSS3
- JavaScript (Vanilla)
- Firebase Firestore

## 🚀 Como Executar

1. Clone o repositório
2. Abra o `index.html` com Live Server ou qualquer servidor local
3. Ou acesse via GitHub Pages: [link será adicionado]

## 📁 Estrutura

```
quiz-usa/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── quiz.js
│   ├── ranking.js
│   └── firebase-config.js
├── data/
│   └── perguntas.json
└── docs/
    └── SPEC.md
```

## 📝 Licença

Este projeto é para fins de aprendizado.
