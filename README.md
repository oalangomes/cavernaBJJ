# 🥋 Caverna BJJ - Web App de Treinos Funcionais para Jiu-Jitsu

O **Caverna BJJ** é um app leve, responsivo e offline para gerar treinos funcionais adaptados para praticantes de Jiu-Jitsu. Totalmente baseado no navegador e com armazenamento local, é ideal para treinar em casa, na praça ou na academia, mesmo sem internet.

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

## 🧠 Inspiração

Criado por **Alan Gomes**, faixa branca apaixonado por Jiu-Jitsu, pai e dev autodidata. O app foi idealizado para tornar os treinos mais eficientes, variados e personalizados — mesmo com pouco tempo ou estrutura.

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

Uso pessoal e livre. Modifique como quiser, mas lembre-se de respeitar os vídeos originais usados via YouTube.

---

> "Na caverna que você teme entrar está o treino que pode te transformar."