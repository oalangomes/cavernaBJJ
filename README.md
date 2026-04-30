# 🏋️ Caverna BJJ - Web App de Treinos Funcionais

O **Caverna BJJ** é um app leve, responsivo e offline para gerar treinos funcionais. Embora tenha nascido focado em Jiu-Jitsu, hoje contempla um conjunto mais amplo de exercícios gerais. Totalmente baseado no navegador e com armazenamento local, é ideal para treinar em casa, na praça ou na academia, mesmo sem internet.

---

## 🚀 Funcionalidades

- 👤 **Perfil Personalizado**
  - Nome, locais de treino, equipamentos e objetivos
  - Personalização afeta diretamente os treinos sugeridos

- 🧠 **Sugestão Inteligente de Grupos Musculares**
  - Algoritmo com cooldown de 2 dias
  - Balanceamento automático por intensidade, tempo e volume

- 🏋️ **Geração de Treino do Dia**
- Variação de exercícios com base no histórico
- Evita repetição dos mesmos movimentos no mesmo dia
- Respeita exercícios marcados como exclusivos de academia de acordo com seu perfil

- 📋 **Checklist interativo**
  - Marcação de exercícios feitos
  - Somente treinos com execuções são registrados

- 💾 **Histórico de Treinos**
  - Tabela com filtros por data, grupo, objetivo e intensidade
  - Exportação em `.csv`

- 📈 **Análise de Evolução**
  - Tempo total, dias de treino e maior sequência
  - Painel visual com resumo diário

- 📹 **Modal com vídeo e descrição**
  - Clique no nome do exercício para ver instruções e vídeo
  - Links seguros do YouTube em modal externa

- 📱 **Instalável como Web App (PWA)**
  - Pode ser adicionado à tela inicial no celular
  - Funciona offline com dados salvos no dispositivo

- 🔄 **Modo Retorno/Beginner**
  - Ative no perfil para focar em exercícios leves e de reabilitação
  - Seleciona apenas movimentos com `subgrupo` "reabilitação" ou `peso` ≤ 2
  - Ao manter constância (5 treinos na semana) o app sugere mais tempo e intensidade

---

## 🧩 Tecnologias

- HTML5 + CSS3
- JavaScript (Vanilla)
- `localStorage` para persistência
- PWA com manifest.json (ícone e instalação)

---

## 📁 Estrutura do Projeto

```plaintext
cavernaBJJ/
├── index.html             # Página principal
├── app.js                 # Lógica de treino, histórico e perfil
├── dados.js               # Banco de dados de exercícios com descrição e vídeo
├── style.css              # Estilização responsiva
├── manifest.json          # Arquivo PWA
├── icon-192.png           # Ícone do app
```

---

## 🛠️ Como usar

1. Clone ou baixe os arquivos
2. Abra o `index.html` no navegador
3. Configure seu perfil e comece a treinar! 💪

---

## 🔄 Modo Retorno/Beginner

No cartão de perfil há uma opção **Retorno/Beginner**. Quando ativada:

1. O gerador considera apenas exercícios com `subgrupo` "reabilitação" ou com `peso` menor ou igual a 2.
2. Mantendo constância (5 treinos registrados nos últimos 7 dias), o app aumenta automaticamente a intensidade (até o limite "intensa") e adiciona 15 minutos ao tempo, limitado a 60 min.

Esse modo facilita o retorno gradual após pausas ou lesões.

---

## 🧠 Inspiração

Criado por **Alan Gomes**, faixa branca apaixonado por Jiu-Jitsu, pai e dev autodidata. O app foi idealizado para tornar os treinos mais eficientes, variados e personalizados — mesmo com pouco tempo ou estrutura — e hoje atende também quem busca condicionamento geral.

---

## 🧪 Em breve

- [ ] Compartilhamento de treinos
- [ ] Avaliação de performance por músculo
- [ ] Análise por IA com base nas lutas (futuro)

---

## 📷 Capturas de tela

| Treino do Dia            | Modal de Exercício          | Histórico de Treinos          |
|--------------------------|-----------------------------|--------------------------------|
| ![treino](screens/treino.png) | ![modal](screens/modal.png) | ![historico](screens/historico.png) |

---

## 📜 Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

> "Na caverna que você teme entrar está o treino que pode te transformar."


## Convenção de imagens de exercícios

- Campo opcional no `exercicios.json`: `imagem`.
- Aceita caminho relativo (ex.: `assets/exercicios/rosca-scott-maquina.jpg`) ou URL externa.
- Padrão recomendado para arquivos locais: `assets/exercicios/<slug-do-exercicio>.jpg`.
