# 🏰 Quizlândia

Jogo de quiz interativo com temas variados, sistema de pontuação por velocidade, ranking global, sistema de desafios e ajudas especiais.

## 🎮 Jogar Agora

**[Acessar o Quizlândia](https://ulissesaraujo.github.io/quizlandia)**

## 📋 Funcionalidades

### Temas e Conteúdo
- ✅ Múltiplos temas (Geografia, História, Ciência, Cinema, Música, Esportes, etc.)
- ✅ Temas escolares com subtemas (Matemática, Física, Química, Biologia, Português)
- ✅ Temas infantis com subtemas (Desenhos, Jogos, Brinquedos, Animais)
- ✅ Modo aleatório (mistura todos os temas)
- ✅ 10 perguntas por partida (configurável no admin)

### Sistema de Jogo
- ✅ Fase de leitura (3 segundos para ler a pergunta)
- ✅ Fase de resposta (10 segundos para responder)
- ✅ Pontuação com bônus por velocidade

### Ajudas Disponíveis
- ⏰ **Mais Tempo** - Adiciona segundos extras ao cronômetro
- 🚫 **Eliminar** - Remove 2 alternativas erradas
- ⏭️ **Pular** - Troca a pergunta por outra (não disponível em desafios)

> 💡 A quantidade de ajudas varia conforme os temas escolhidos:
> - Temas escolares: 3x tempo extra (cada uso adiciona +10s ao invés de +5s)
> - Temas infantis: 3x eliminar alternativas

### Rankings e Competição
- ✅ Ranking por Sala (agrupado por sessão de perguntas)
- ✅ Ranking Geral (lista completa por pontuação)
- ✅ Histórico pessoal de partidas
- ✅ Sistema de desafio (jogue com as mesmas perguntas de outro jogador)

### Qualidade do Conteúdo
- ✅ Botão para destacar perguntas excelentes (⭐)
- ✅ Botão para reportar perguntas com erros (⚠️)
- ✅ Painel admin para revisão de perguntas marcadas
- ✅ Filtro no admin para ver destaques e perguntas para revisão
- ✅ Geração de perguntas por IA com distribuição equilibrada

### Acessibilidade
- ✅ Navegação por teclado
- ✅ Suporte a leitores de tela (ARIA)
- ✅ Skip links e focus trap em modais
- ✅ Atalhos de teclado (1-4 para alternativas)

## 🎯 Como Jogar

1. Digite seu nome na tela inicial
2. Escolha um ou mais temas (ou clique em **🎲 Aleatório**)
3. Clique em **▶ Jogar** para iniciar
4. **Fase de leitura:** 3 segundos para ler a pergunta
5. **Fase de resposta:** Responda o mais rápido possível (limite: 10s)
6. Use as ajudas disponíveis se precisar
7. Veja sua pontuação e posição no ranking
8. Desafie outros jogadores clicando em **⚔️ Desafiar**

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

> 🏆 Temas escolares: a ajuda de tempo adiciona **+10 segundos** ao invés de +5s!

## ⚔️ Sistema de Desafios

O sistema de desafios permite competir diretamente com outros jogadores:

1. Após completar uma partida, ela fica disponível para desafio
2. Outros jogadores podem clicar em **⚔️ Desafiar** no ranking
3. O desafiante joga com **exatamente as mesmas perguntas**
4. Compare as pontuações para ver quem se saiu melhor!

> ⚠️ No modo desafio, a ajuda "Pular" não está disponível (perguntas são fixas)

## 🛠️ Tecnologias

- HTML5 / CSS3 / JavaScript (ES6 Modules)
- Firebase Firestore (banco de dados)
- GitHub Pages (hospedagem)

## 📁 Estrutura do Projeto

```
quizlandia/
├── index.html          # Quiz principal
├── admin.html          # Painel administrativo
├── css/
│   └── style.css       # Estilos
├── js/
│   ├── app.js          # Lógica principal e UI
│   ├── quiz.js         # Engine do quiz
│   ├── temas.js        # Gerenciamento de temas
│   ├── ranking.js      # Sistema de ranking
│   └── firebase-config.js  # Configuração Firebase
├── data/               # Arquivos JSON (backup)
└── docs/
    └── SPEC.md         # Especificação técnica
```

## 🔧 Painel Administrativo

O painel admin (`admin.html`) permite:

- 📝 Cadastrar e editar perguntas manualmente
- 🤖 Gerar perguntas com IA (20 por vez, distribuição equilibrada)
- 📊 Gerenciar temas e subtemas
- ⚙️ Configurar parâmetros do jogo (tempo, quantidade, ajudas)
- ⚠️ Revisar perguntas reportadas pelos usuários
- 📤 Exportar/importar perguntas (JSON)
- 🗑️ Limpar partidas antigas do ranking

## 🔗 Links

- [Jogar Quiz](https://ulissesaraujo.github.io/quizlandia)
- [Painel Admin](https://ulissesaraujo.github.io/quizlandia/admin.html)
- [Documentação Técnica](docs/SPEC.md)

---

Desenvolvido com [Kiro](https://kiro.dev) - AI-powered IDE.
