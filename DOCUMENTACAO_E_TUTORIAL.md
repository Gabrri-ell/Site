# 🌟 CHRONOS — Guia Completo da Aplicação & Tutorial de Uso

Bem-vindo ao **Chronos**, sua plataforma completa de produtividade pessoal, gestão de hábitos, rotina e agendamento inteligente. Este documento detalha **todas as funcionalidades criadas no projeto** e apresenta um **passo a passo prático de como utilizar o sistema**.

---

## 📋 Sumário
1. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
2. [O Que Foi Desenvolvido no Projeto](#o-que-foi-desenvolvido-no-projeto)
   - [1. Sistema de Contas Gratuitas (Multi-usuário Local)](#1-sistema-de-contas-gratuitas-multi-usuário-local)
   - [2. Dashboard Interativo & Timeline Inteligente](#2-dashboard-interativo--timeline-inteligente)
   - [3. Tarefas Fixas e Recorrência (Segunda a Sexta, Diário, etc.)](#3-tarefas-fixas-e-recorrência)
   - [4. Novo Calendário & Agenda Mensal](#4-novo-calendário--agenda-mensal)
   - [5. Gerenciador Avançado de Tarefas & Quadro Kanban](#5-gerenciador-avançado-de-tarefas--quadro-kanban)
   - [6. Hábitos Diários & Diário Reflexivo](#6-hábitos-diários--diário-reflexivo)
   - [7. Timer Pomodoro com Som Sintetizado](#7-timer-pomodoro-com-som-sintetizado)
   - [8. Design System, Temas de Cores e Responsividade Mobile](#8-design-system-temas-de-cores-e-responsividade-mobile)
3. [Tutorial de Uso Passo a Passo](#tutorial-de-uso-passo-a-passo)
   - [Como Criar sua Conta e Alternar Perfis](#como-criar-sua-conta-e-alternar-perfis)
   - [Como Criar Tarefas Fixas de Segunda a Sexta](#como-criar-tarefas-fixas-de-segunda-a-sexta)
   - [Como Navegar entre Hoje e Amanhã na Timeline](#como-navegar-entre-hoje-e-amanhã-na-timeline)
   - [Como Agendar Compromissos Futuros (Médico, Encontros) no Calendário](#como-agendar-compromissos-futuros-no-calendário)
   - [Como Usar o Quadro Kanban](#como-usar-o-quadro-kanban)
   - [Como Acompanhar seus Hábitos Diários](#como-acompanhar-seus-hábitos-diários)
   - [Atalhos de Teclado Rápidos](#atalhos-de-teclado-rápidos)

---

## 🛠️ Visão Geral da Arquitetura

- **Tecnologias:** HTML5 semântico, Vanilla CSS3 moderno (Glassmorphism, CSS Variables, Flexbox/Grid) e JavaScript puro (ES6+).
- **Sem custos ou dependências pagas:** O sistema não necessita de servidores pagos nem de bibliotecas pesadas.
- **Armazenamento:** `localStorage` nativo do navegador com isolamento por usuário.
- **PWA (Progressive Web App):** Instalável no computador ou celular com suporte offline via Service Worker (`sw.js` e `manifest.json`).

---

## 🚀 O Que Foi Desenvolvido no Projeto

### 1. Sistema de Contas Gratuitas (Multi-usuário Local)
- **100% gratuito e privado:** Cada pessoa pode criar uma conta usando seu e-mail e senha.
- **Isolamento de dados:** O sistema cria um prefixo exclusivo para cada conta. As tarefas, hábitos e reflexões do usuário "A" não se misturam com as do usuário "B".
- **Identificação no Dashboard:** O painel dá as boas-vindas contextuais com o nome do usuário cadastrado (ex: *"Boa noite, Alex!"*).

### 2. Dashboard Interativo & Timeline Inteligente
- **Gráfico Radial de Conclusão:** Exibe a porcentagem do dia concluída com cálculo em tempo real.
- **Distribuição de Tempo:** Barra proporcional dividida entre Trabalho, Estudos, Lazer e Saúde/Pessoal.
- **Timeline do Dia (Manhã, Tarde, Noite):**
  - Segmentação automática com base no horário:
    - `05:00` às `11:59` $\rightarrow$ **Manhã**
    - `12:00` às `17:59` $\rightarrow$ **Tarde**
    - `18:00` às `04:59` $\rightarrow$ **Noite** (corrigindo a categorização de tarefas noturnas como 22:00).
  - **Filtro de Data (Hoje / Amanhã / Data Personalizada):** Permite inspecionar a rotina de hoje ou dar uma espiada no que está programado para amanhã com apenas 1 clique.

### 3. Tarefas Fixas e Recorrência
- Opção de repetição configurável na criação de tarefas:
  - **Segunda a Sexta (Dias úteis):** Perfeito para trabalho, rotinas de estudo ou expedientes fixos.
  - **Todos os dias (Diário):** Ideal para almoço, descanso ou rotinas essenciais.
  - **Finais de Semana:** Para lazer e descanso.
  - **Semanal:** Repete no mesmo dia da semana em que foi criada.
  - **Única:** Aplica-se apenas à data agendada.
- As tarefas recorrentes exibem uma etiqueta destacada (ex: `🔄 Seg-Sex`) e entram automaticamente na Timeline do dia correspondente sem que você precise recriá-las.

### 4. Novo Calendário & Agenda Mensal (`calendario.html`)
- **Visual Clássico e Limpo (Estilo Google/Apple Calendar):**
  - Grade mensal com 7 colunas perfeitamente alinhadas aos dias da semana (`DOM`, `SEG`, `TER`, `QUA`, `QUI`, `SEX`, `SÁB`).
  - Navegação entre meses (`◀` e `▶`) e atalho rápido para o mês atual (`Hoje`).
  - Marcadores sutis e coloridos para cada categoria de evento.
- **Agendamento Futuro com Entrada Automática:**
  - Permite agendar eventos para qualquer data e mês futuro (ex: consulta médica dia 15 do próximo mês, viagem ou encontro).
  - Quando a data do compromisso chega, ele **entra automaticamente na Timeline do Dashboard**.
- **Painel Lateral do Dia:** Clique em qualquer data da grade para ver detalhadamente a lista de compromissos programados para aquele dia.

### 5. Gerenciador Avançado de Tarefas & Quadro Kanban (`tarefas.html`)
- **Visão em Lista e Kanban:** Alterne entre lista detalhada e quadro interativo por colunas (*A Fazer*, *Em Andamento*, *Concluído*).
- **Drag & Drop:** Arraste tarefas entre as colunas do Kanban com animações suaves.
- **Filtros e Busca em Tempo Real:** Pesquise por texto e filtre por categoria, prioridade ou status.
- **Subtarefas (Checklist):** Adicione etapas dentro de uma mesma tarefa com contagem de progresso.

### 6. Hábitos Diários & Diário Reflexivo (`rotina.html`)
- **Controle Semanal:** Grade de 7 dias (Seg a Dom) para marcar hábitos cumpridos.
- **Sequência de Dias (Streak 🔥):** Gamificação que incentiva a consistência diária.
- **Diário de Reflexão:** Registre seu humor diário e anote vitórias e lições do dia para arquivamento histórico.

### 7. Timer Pomodoro com Som Sintetizado
- **Técnica Pomodoro Integrada:** 25 minutos de foco e 5 minutos de pausa com controle no topo da tela.
- **Áudio Nativo (Web Audio API):** Gera bipes suaves sintetizados de alarme sem precisar baixar arquivos de áudio externos.

### 8. Design System, Temas de Cores e Responsividade Mobile
- **Barra de Navegação Otimizada:** Relógio compacto em tempo real (`🟢 21:45`), links diretos e botão de perfil.
- **Seletor de Temas (5 Cores):** Ciano, Roxo, Esmeralda, Âmbar e Rosa.
- **100% Responsivo:** O layout se adapta dinamicamente para celular, tablet, notebooks e desktops amplos com menu drawer lateral.

---

## 📖 Tutorial de Uso Passo a Passo

### Como Criar sua Conta e Alternar Perfis
1. Na barra superior do site, clique no botão **"Entrar"**.
2. Clique na aba **"Criar Nova Conta"**.
3. Digite seu **Nome**, seu **E-mail** e uma **Senha** (mínimo 6 caracteres).
4. Clique em **"Criar Conta Gratuita"**.
5. O sistema salvará seu perfil e exibirá suas iniciais no canto superior. Para sair ou trocar de conta, basta clicar no seu nome e confirmar.

---

### Como Criar Tarefas Fixas de Segunda a Sexta
1. Clique no botão azul **"+ Nova Tarefa"** (na barra superior ou na Timeline).
2. Preencha o **Título** (ex: *"Trabalho no escritório"*).
3. Selecione a **Categoria** (*Trabalho*) e a **Prioridade**.
4. No campo **Repetição / Recorrência 🔄**, selecione:
   - **`📅 Segunda a Sexta (Dias úteis)`**.
5. Defina o **Horário Previsto** (ex: `09:00`). O período será configurado automaticamente como **Manhã**.
6. Clique em **"Salvar Tarefa"**.
7. Pronto! A tarefa aparecerá de segunda a sexta-feira automaticamente na sua rotina.

---

### Como Navegar entre Hoje e Amanhã na Timeline
1. Acesse o **Dashboard** (`index.html`).
2. No bloco central **"Timeline do Dia"**, observe os botões logo acima da lista:
   - Clique em **`[ Hoje ]`**: Veja tudo o que tem para fazer hoje.
   - Clique em **`[ Amanhã ]`**: Veja antecipadamente tudo o que está programado para o dia seguinte (incluindo as tarefas fixas de Seg-Sex).
   - Use o campo de data ao lado para inspecionar qualquer dia específico.
   - Para cadastrar uma tarefa diretamente para o dia de amanhã, clique em **`[ Amanhã ]`** e depois em **`+ Nova Tarefa`**. A data de amanhã já virá pré-selecionada!

---

### Como Agendar Compromissos Futuros no Calendário
1. No menu superior, clique em **"Calendário & Agenda"** (`calendario.html`).
2. Use as setas `◀` e `▶` para navegar até o mês desejado (ou clique em `Hoje` para voltar).
3. **Clique no dia exato do mês** em que deseja agendar (ex: dia 18 do mês seguinte).
4. No painel lateral direito, clique no botão azul **"+ Agendar"**.
5. Dê o nome ao evento (ex: *"Consulta com Cardiologista"* ou *"Jantar com a namorada"*), categoria (*Saúde* ou *Lazer*) e defina o horário.
6. Clique em **"Salvar Agendamento"**.
7. O dia no calendário exibirá um ponto colorido da categoria. Quando esse dia chegar no mundo real, o compromisso aparecerá automaticamente no seu **Dashboard diário**!

---

### Como Usar o Quadro Kanban
1. No menu superior, clique em **"Tarefas & Kanban"** (`tarefas.html`).
2. No topo direito, clique no botão **"Quadro Kanban"**.
3. Suas atividades estarão distribuídas em 3 colunas:
   - **A Fazer**
   - **Em Andamento**
   - **Concluído**
4. Para mover uma tarefa, clique nela, **segure e arraste** para a coluna desejada (ou clique no ícone de lápis para editar o status manualmente).

---

### Como Acompanhar seus Hábitos Diários
1. No menu superior, clique em **"Hábitos & Rotina"** (`rotina.html`).
2. Para cada hábito cadastrado (ex: *Beber 2.5L de água* ou *Leitura*), clique no círculo correspondente ao dia da semana que você completou.
3. O contador de sequência (**🔥 Streak**) subirá automaticamente a cada dia mantido.
4. Para criar novos hábitos, clique no botão **"+ Novo Hábito"** no topo da página.

---

### ⌨️ Atalhos de Teclado Rápidos
Você pode controlar o sistema sem tirar as mãos do teclado:
- Aperte **`N`**: Abre a janela para criar uma nova tarefa imediatamente.
- Aperte **`P`**: Inicia ou pausa o Timer Pomodoro.
- Aperte **`/`**: Foca diretamente na barra de busca de tarefas.
- Aperte **`ESC`**: Fecha qualquer janela ou modal aberto.
- Aperte **`?`**: Abre a tela com a lista de todos os atalhos.

---

*Chronos — Desenvolvido com foco em velocidade, autonomia e design moderno.*
