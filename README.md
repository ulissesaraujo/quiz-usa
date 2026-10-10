# 🏰 Quizlândia

Jogo de quiz interativo com temas variados, sistema de pontuação por velocidade, ranking global e sistema de desafios.

## 🎮 Jogar Agora

**[Acessar o Quizlândia](https://ulissesaraujo.github.io/quizlandia)**

## 📋 Funcionalidades

- ✅ 13 temas diferentes (Geografia, História, Ciência, Cinema, Música, etc.)
- ✅ Modo aleatório (mistura todos os temas)
- ✅ Sistema de pontuação com bônus por velocidade
- ✅ Limite de 10 segundos por pergunta
- ✅ Ranking por Sala (agrupado por sessão de perguntas)
- ✅ Ranking Geral (lista simples por pontuação)
- ✅ Sistema de desafio (jogue com as mesmas perguntas de outro jogador)
- ✅ 10 perguntas por partida

## 🎯 Como Jogar

1. Digite seu nome
2. Escolha um ou mais temas (ou clique em "Temas Aleatórios")
3. Clique em "Jogar"
4. Leia a pergunta durante os 3 segundos iniciais
5. Responda o mais rápido possível para ganhar bônus (limite: 10s)
6. Veja sua pontuação e posição no ranking
7. Desafie outros jogadores clicando em "⚔️ Desafiar" ou "⚔️ Entrar"

## 📊 Sistema de Pontuação

| Resultado | Pontos |
|-----------|--------|
| Resposta correta | 10 pts |
| Bônus ≤ 1 segundo | +5 pts |
| Bônus ≤ 2 segundos | +3 pts |
| Bônus ≤ 3 segundos | +2 pts |
| Bônus ≤ 4 segundos | +1 pt |
| Tempo esgotado (>10s) | 0 pts |

**Pontuação máxima:** 150 pontos (15 pts × 10 perguntas)

## 🛠️ Tecnologias

- HTML5 / CSS3 / JavaScript (ES6 Modules)
- Firebase Firestore

## 📁 Estrutura

```
quizlandia/
├── index.html          # Quiz principal
├── css/style.css       # Estilos
├── js/
│   ├── app.js          # Lógica principal
│   ├── firebase-config.js
│   ├── temas.js
│   ├── quiz.js
│   └── ranking.js
├── data/               # Arquivos JSON com perguntas
└── docs/SPEC.md        # Documentação completa
```

## 🔗 Links

- [Jogar Quiz](https://ulissesaraujo.github.io/quizlandia)
- [Documentação](docs/SPEC.md)

---

Desenvolvido como projeto de aprendizado com [Kiro](https://kiro.dev).
