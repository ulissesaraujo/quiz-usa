# 🇺🇸 Quiz USA

Jogo de quiz interativo com temas variados, sistema de pontuação por velocidade e ranking global.

## 🎮 Jogar Agora

**[Acessar o Quiz](https://ulissesaraujo.github.io/quiz-usa)**

## 📋 Funcionalidades

- ✅ 13 temas diferentes (Geografia, História, Ciência, Cinema, Música, etc.)
- ✅ Modo aleatório (mistura todos os temas)
- ✅ Sistema de pontuação com bônus por velocidade
- ✅ Ranking global
- ✅ 10 perguntas por partida
- ✅ Painel admin para adicionar perguntas

## 🎯 Como Jogar

1. Digite seu nome
2. Escolha um ou mais temas (ou clique em "Aleatório")
3. Clique em "Jogar"
4. Leia a pergunta durante os 3 segundos iniciais
5. Responda o mais rápido possível para ganhar bônus
6. Veja sua pontuação e posição no ranking

## 📊 Sistema de Pontuação

| Resultado | Pontos |
|-----------|--------|
| Resposta correta | 10 pts |
| Bônus ≤ 1 segundo | +5 pts |
| Bônus ≤ 2 segundos | +3 pts |
| Bônus ≤ 3 segundos | +2 pts |
| Bônus ≤ 4 segundos | +1 pt |

**Pontuação máxima:** 150 pontos (15 pts × 10 perguntas)

## 🛠️ Tecnologias

- HTML5 / CSS3 / JavaScript (ES6 Modules)
- Firebase Firestore

## 📁 Estrutura

```
quiz-usa/
├── index.html          # Quiz principal
├── admin.html          # Painel para adicionar perguntas
├── css/style.css       # Estilos
├── js/
│   ├── app.js          # Lógica principal
│   ├── firebase-config.js
│   ├── temas.js
│   ├── quiz.js
│   └── ranking.js
└── docs/SPEC.md        # Documentação completa
```

## 🔗 Links

- [Jogar Quiz](https://ulissesaraujo.github.io/quiz-usa)
- [Painel Admin](https://ulissesaraujo.github.io/quiz-usa/admin.html)
- [Documentação](docs/SPEC.md)

---

Desenvolvido como projeto de aprendizado com [Kiro](https://kiro.dev).
