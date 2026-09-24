/**
 * ==========================================================================
 * CHRONOS / AURA ROUTINE - APPLICATION CORE (VANILLA JS)
 * Gerenciamento de Tarefas, Hábitos Diários, Reflexão e Sincronização LocalStorage
 * ==========================================================================
 */

// Chaves do LocalStorage
const STORAGE_KEYS = {
  TASKS: 'chronos_tasks_data',
  HABITS: 'chronos_habits_data',
  REFLECTIONS: 'chronos_reflections_data',
  CURRENT_REFLECTIONS: 'chronos_current_reflection',
  INITIALIZED: 'chronos_is_initialized'
};

// --- DADOS INICIAIS (MOCK DATA) ---
const INITIAL_TASKS = [
  {
    id: 'task-1',
    title: 'Alongamento matinal & hidratação (500ml)',
    category: 'saude',
    priority: 'alta',
    period: 'manha',
    time: '07:30',
    status: 'done',
    description: 'Alongamento corporal completo e beber água fresca para despertar.'
  },
  {
    id: 'task-2',
    title: 'Daily Meeting & alinhamento de sprint',
    category: 'trabalho',
    priority: 'alta',
    period: 'manha',
    time: '09:30',
    status: 'done',
    description: 'Alinhar entregas da semana e revisar pendências do time de engenharia.'
  },
  {
    id: 'task-3',
    title: 'Revisão da arquitetura CSS e Refatoração de Componentes',
    category: 'trabalho',
    priority: 'media',
    period: 'tarde',
    time: '14:00',
    status: 'inprogress',
    description: 'Padronizar variáveis do design system e tokens de cores no repositório.'
  },
  {
    id: 'task-4',
    title: 'Estudo: Módulos avançados de JavaScript & Performance',
    category: 'estudos',
    priority: 'alta',
    period: 'tarde',
    time: '16:30',
    status: 'todo',
    description: 'Capítulo sobre Event Loop, Microtasks e renderização do DOM.'
  },
  {
    id: 'task-5',
    title: 'Sessão de Games / Leitura de Ficção Científica',
    category: 'lazer',
    priority: 'baixa',
    period: 'noite',
    time: '20:30',
    status: 'todo',
    description: 'Momento de desconectar de telas de trabalho e relaxar a mente.'
  },
  {
    id: 'task-6',
    title: 'Organizar planejamento da semana seguinte',
    category: 'pessoal',
    priority: 'media',
    period: 'noite',
    time: '21:45',
    status: 'todo',
    description: 'Checar compromissos, compras e prioridades pessoais.'
  }
];

const INITIAL_HABITS = [
  {
    id: 'habit-1',
    name: 'Beber 2.5L de água',
    category: 'saude',
    frequency: 'Diário',
    days: [true, true, true, true, false, false, false],
    streak: 12
  },
  {
    id: 'habit-2',
    name: 'Leitura focada (20 minutos)',
    category: 'estudos',
    frequency: 'Diário',
    days: [true, true, true, false, false, false, false],
    streak: 5
  },
  {
    id: 'habit-3',
    name: 'Treino ou Caminhada 45min',
    category: 'saude',
    frequency: '5x/semana',
    days: [true, false, true, true, false, false, false],
    streak: 8
  },
  {
    id: 'habit-4',
    name: 'Pausa para Respiração & Meditação',
    category: 'pessoal',
    frequency: 'Diário',
    days: [true, true, false, true, false, false, false],
    streak: 4
  },
  {
    id: 'habit-5',
    name: 'Sem telas 30min antes de dormir',
    category: 'saude',
    frequency: 'Diário',
    days: [false, true, true, false, false, false, false],
    streak: 2
  }
];

const INITIAL_REFLECTION = {
  mood: 'produtivo',
  wins: 'Concluí a reestruturação da interface principal.\nMantive o foco por 3 blocos de Pomodoro contínuos.\nBebi toda a água da meta.',
  improvements: 'Fazer mais pausas ativas à tarde para descansar a vista.',
  notes: 'Dia bastante proveitoso. A mente esteve clara e o ritmo de código fluiu muito bem.',
  savedAt: 'Hoje às 18:30'
};

// --- DATA STORE MANAGER ---
class ChronosStore {
  constructor() {
    this.initStore();
  }

  initStore() {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(INITIAL_TASKS));
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(INITIAL_HABITS));
      localStorage.setItem(STORAGE_KEYS.CURRENT_REFLECTIONS, JSON.stringify(INITIAL_REFLECTION));
      localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify([
        {
          date: 'Ontem',
          mood: 'excelente',
          wins: 'Finalizei protótipo Figma e corri 5km no parque.',
          savedAt: 'Ontem às 21:00'
        }
      ]));
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  }

  // TAREFAS
  getTasks() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS)) || [];
    } catch {
      return [];
    }
  }

  saveTasks(tasks) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  addTask(taskData) {
    const tasks = this.getTasks();
    const newTask = {
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: taskData.status || 'todo',
      ...taskData
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  updateTask(id, updatedFields) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updatedFields };
      this.saveTasks(tasks);
      return tasks[index];
    }
    return null;
  }

  deleteTask(id) {
    const tasks = this.getTasks().filter(t => t.id !== id);
    this.saveTasks(tasks);
    return true;
  }

  toggleTaskStatus(id) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = task.status === 'done' ? 'todo' : 'done';
      this.saveTasks(tasks);
      return task;
    }
    return null;
  }

  // HÁBITOS
  getHabits() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.HABITS)) || [];
    } catch {
      return [];
    }
  }

  saveHabits(habits) {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }

  addHabit(habitData) {
    const habits = this.getHabits();
    const newHabit = {
      id: 'habit-' + Date.now(),
      days: [false, false, false, false, false, false, false],
      streak: 0,
      ...habitData
    };
    habits.push(newHabit);
    this.saveHabits(habits);
    return newHabit;
  }

  toggleHabitDay(habitId, dayIndex) {
    const habits = this.getHabits();
    const habit = habits.find(h => h.id === habitId);
    if (habit && habit.days && dayIndex >= 0 && dayIndex < 7) {
      habit.days[dayIndex] = !habit.days[dayIndex];
      // recalcula streak simples
      const totalChecked = habit.days.filter(Boolean).length;
      habit.streak = Math.max(1, totalChecked * 2);
      this.saveHabits(habits);
      return habit;
    }
    return null;
  }

  deleteHabit(id) {
    const habits = this.getHabits().filter(h => h.id !== id);
    this.saveHabits(habits);
    return true;
  }

  // REFLEXÃO & DIÁRIO
  getCurrentReflection() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_REFLECTIONS)) || {
        mood: 'produtivo', wins: '', improvements: '', notes: '', savedAt: ''
      };
    } catch {
      return { mood: 'produtivo', wins: '', improvements: '', notes: '', savedAt: '' };
    }
  }

  saveCurrentReflection(data) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_REFLECTIONS, JSON.stringify(data));
  }

  getPastReflections() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.REFLECTIONS)) || [];
    } catch {
      return [];
    }
  }

  archiveCurrentReflection(reflection) {
    const list = this.getPastReflections();
    list.unshift({
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      ...reflection
    });
    localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(list.slice(0, 10)));
  }
}

// Instância global do banco local
const store = new ChronosStore();

// --- NOTIFICAÇÕES TOAST ELEGANTE ---
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success'
    ? `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`
    : `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// --- RELÓGIO & DATA EM TEMPO REAL ---
function initRealtimeClock() {
  const dateEl = document.getElementById('nav-live-date');
  const timeEl = document.getElementById('nav-live-time');
  const greetingEl = document.getElementById('hero-greeting-text');

  function update() {
    const now = new Date();
    
    // Formata data pt-BR: "Quinta, 24 de Set."
    const optionsDate = { weekday: 'short', day: '2-digit', month: 'short' };
    const dateFormatted = now.toLocaleDateString('pt-BR', optionsDate);
    
    // Formata hora: "19:54:12"
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeFormatted = `${hours}:${minutes}`;

    if (dateEl) dateEl.textContent = dateFormatted.charAt(0).toUpperCase() + dateFormatted.slice(1);
    if (timeEl) timeEl.textContent = timeFormatted;

    // Saudação contextual no Dashboard
    if (greetingEl) {
      const h = now.getHours();
      let greeting = 'Bom dia';
      if (h >= 12 && h < 18) greeting = 'Boa tarde';
      else if (h >= 18 || h < 5) greeting = 'Boa noite';
      greetingEl.textContent = `${greeting}, Alex!`;
    }
  }

  update();
  setInterval(update, 1000);
}

// --- CONTROLE DO MODAL DE TAREFA ---
let currentEditingTaskId = null;

function openTaskModal(taskId = null) {
  const modal = document.getElementById('task-modal');
  if (!modal) return;

  const form = document.getElementById('task-form');
  const modalTitle = document.getElementById('modal-title-text');
  currentEditingTaskId = taskId;

  if (taskId) {
    const tasks = store.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      modalTitle.textContent = 'Editar Tarefa';
      document.getElementById('task-title-input').value = task.title;
      document.getElementById('task-category-select').value = task.category;
      document.getElementById('task-priority-select').value = task.priority;
      document.getElementById('task-period-select').value = task.period || 'manha';
      document.getElementById('task-time-input').value = task.time || '09:00';
      document.getElementById('task-status-select').value = task.status || 'todo';
      document.getElementById('task-desc-input').value = task.description || '';
    }
  } else {
    modalTitle.textContent = 'Nova Tarefa';
    form.reset();
    document.getElementById('task-time-input').value = '10:00';
  }

  modal.classList.add('open');
  document.getElementById('task-title-input').focus();
}

function closeTaskModal() {
  const modal = document.getElementById('task-modal');
  if (modal) {
    modal.classList.remove('open');
    currentEditingTaskId = null;
  }
}

function handleTaskFormSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('task-title-input').value.trim();
  if (!title) {
    showToast('Por favor, informe o título da tarefa.', 'info');
    return;
  }

  const category = document.getElementById('task-category-select').value;
  const priority = document.getElementById('task-priority-select').value;
  const period = document.getElementById('task-period-select').value;
  const time = document.getElementById('task-time-input').value;
  const status = document.getElementById('task-status-select').value;
  const description = document.getElementById('task-desc-input').value.trim();

  const taskPayload = { title, category, priority, period, time, status, description };

  if (currentEditingTaskId) {
    store.updateTask(currentEditingTaskId, taskPayload);
    showToast('Tarefa atualizada com sucesso!', 'success');
  } else {
    store.addTask(taskPayload);
    showToast('Nova tarefa criada com sucesso!', 'success');
  }

  closeTaskModal();
  refreshActivePage();
}

// --- ATUALIZA A PÁGINA ATIVA ---
function refreshActivePage() {
  if (document.body.dataset.page === 'dashboard') {
    renderDashboard();
  } else if (document.body.dataset.page === 'tasks') {
    renderTasksPage();
  } else if (document.body.dataset.page === 'routine') {
    renderRoutinePage();
  }
}

// ==========================================================================
// PÁGINA 1: DASHBOARD (INDEX.HTML)
// ==========================================================================
function renderDashboard() {
  const tasks = store.getTasks();
  const habits = store.getHabits();

  // 1. Cálculos de Estatísticas Gerais
  const total = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done');
  const completed = completedTasks.length;
  const pending = total - completed;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  // Atualiza círculo radial de progresso
  const circleBar = document.getElementById('dash-progress-circle');
  const pctText = document.getElementById('dash-progress-pct');
  const ratioText = document.getElementById('dash-progress-ratio');

  if (circleBar && pctText) {
    pctText.textContent = pct;
    if (ratioText) ratioText.textContent = `${completed} de ${total} tarefas finalizadas`;
    // Raio = 60, Circunferência = 2 * PI * 60 = 377
    const circumference = 377;
    const offset = circumference - (pct / 100) * circumference;
    circleBar.style.strokeDashoffset = offset;
  }

  // Cards de Estatísticas Rápidas
  const elPending = document.getElementById('stat-pending-count');
  const elCompleted = document.getElementById('stat-done-count');
  const elHabitRate = document.getElementById('stat-habit-rate');

  if (elPending) elPending.textContent = pending;
  if (elCompleted) elCompleted.textContent = completed;

  // Cálculo da distribuição de foco (Trabalho vs Lazer vs Estudos vs Outros)
  const workCount = tasks.filter(t => t.category === 'trabalho').length;
  const leisureCount = tasks.filter(t => t.category === 'lazer').length;
  const studyCount = tasks.filter(t => t.category === 'estudos').length;
  const otherCount = tasks.filter(t => ['saude', 'pessoal'].includes(t.category)).length;

  const segWork = document.getElementById('ratio-seg-work');
  const segLeisure = document.getElementById('ratio-seg-leisure');
  const segStudy = document.getElementById('ratio-seg-study');
  const segOther = document.getElementById('ratio-seg-other');

  if (total > 0 && segWork && segLeisure && segStudy) {
    segWork.style.width = `${(workCount / total) * 100}%`;
    segLeisure.style.width = `${(leisureCount / total) * 100}%`;
    segStudy.style.width = `${(studyCount / total) * 100}%`;
    if (segOther) segOther.style.width = `${(otherCount / total) * 100}%`;
  }

  // Estatística de hábitos de hoje (Dia atual da semana: 0=Dom, 1=Seg, ..., 6=Sáb)
  // Usamos índice 0=Segunda ... 6=Domingo
  const now = new Date();
  const dayOfWeek = (now.getDay() + 6) % 7; // converte Dom=0 para Dom=6, Seg=0
  const habitsDoneToday = habits.filter(h => h.days && h.days[dayOfWeek]).length;
  if (elHabitRate) {
    elHabitRate.textContent = `${habitsDoneToday}/${habits.length}`;
  }

  // 2. Renderizar Timeline do Dia (Manhã, Tarde, Noite)
  const morningContainer = document.getElementById('timeline-morning-list');
  const afternoonContainer = document.getElementById('timeline-afternoon-list');
  const nightContainer = document.getElementById('timeline-night-list');

  const countMorning = document.getElementById('count-morning');
  const countAfternoon = document.getElementById('count-afternoon');
  const countNight = document.getElementById('count-night');

  const morningTasks = tasks.filter(t => t.period === 'manha');
  const afternoonTasks = tasks.filter(t => t.period === 'tarde');
  const nightTasks = tasks.filter(t => t.period === 'noite');

  if (countMorning) countMorning.textContent = morningTasks.length;
  if (countAfternoon) countAfternoon.textContent = afternoonTasks.length;
  if (countNight) countNight.textContent = nightTasks.length;

  if (morningContainer) morningContainer.innerHTML = buildTimelineItemsHtml(morningTasks);
  if (afternoonContainer) afternoonContainer.innerHTML = buildTimelineItemsHtml(afternoonTasks);
  if (nightContainer) nightContainer.innerHTML = buildTimelineItemsHtml(nightTasks);

  // 3. Mini Habit List no Widget lateral do Dashboard
  const miniHabitContainer = document.getElementById('mini-habits-list');
  if (miniHabitContainer) {
    if (habits.length === 0) {
      miniHabitContainer.innerHTML = `<div class="empty-state" style="padding:1rem;"><p class="empty-state-title">Nenhum hábito cadastrado</p></div>`;
    } else {
      miniHabitContainer.innerHTML = habits.slice(0, 4).map(habit => {
        const isDoneToday = habit.days && habit.days[dayOfWeek];
        return `
          <div class="mini-habit-row">
            <div class="mini-habit-name">
              <span class="custom-checkbox" onclick="toggleHabitFromDash('${habit.id}', ${dayOfWeek})">
                <input type="checkbox" ${isDoneToday ? 'checked' : ''} />
                <div class="checkbox-visual">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </span>
              <span>${escapeHtml(habit.name)}</span>
            </div>
            <span class="habit-streak-badge">
              🔥 ${habit.streak || 0}d
            </span>
          </div>
        `;
      }).join('');
    }
  }
}

function buildTimelineItemsHtml(tasksList) {
  if (!tasksList || tasksList.length === 0) {
    return `<div style="padding: 0.75rem 1rem; color: var(--text-muted); font-size: 0.85rem; font-style: italic;">Nenhuma tarefa programada para este período.</div>`;
  }

  return tasksList.map(task => {
    const isCompleted = task.status === 'done';
    const catLabel = getCategoryLabel(task.category);
    const catClass = `badge-${task.category}`;
    const priorityClass = `priority-${task.priority}`;

    return `
      <div class="task-item ${isCompleted ? 'completed' : ''}" id="timeline-item-${task.id}">
        <div class="task-left">
          <label class="custom-checkbox" title="${isCompleted ? 'Marcar como pendente' : 'Marcar como concluída'}">
            <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleTask('${task.id}')" />
            <div class="checkbox-visual">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </label>
          <div class="task-details">
            <span class="task-text-title">${escapeHtml(task.title)}</span>
            <div class="task-meta-row">
              <span class="badge ${catClass}">${catLabel}</span>
              <span class="priority-pill ${priorityClass}" title="Prioridade: ${task.priority}"></span>
              <span class="task-time-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${task.time || '--:--'}
              </span>
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="action-btn-subtle" title="Editar" onclick="openTaskModal('${task.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn-subtle delete" title="Excluir" onclick="deleteTaskItem('${task.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Quick Actions Dashboard
function toggleTask(id) {
  const updated = store.toggleTaskStatus(id);
  if (updated) {
    showToast(updated.status === 'done' ? 'Tarefa concluída! Parabéns!' : 'Tarefa reaberta.', 'success');
    refreshActivePage();
  }
}

function deleteTaskItem(id) {
  if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
    store.deleteTask(id);
    showToast('Tarefa excluída com sucesso.', 'info');
    refreshActivePage();
  }
}

function toggleHabitFromDash(habitId, dayIndex) {
  store.toggleHabitDay(habitId, dayIndex);
  showToast('Hábito atualizado!', 'success');
  renderDashboard();
}

// ==========================================================================
// PÁGINA 2: TAREFAS (TAREFAS.HTML) - LISTA & KANBAN
// ==========================================================================
let currentViewMode = 'list'; // 'list' | 'kanban'

function setViewMode(mode) {
  currentViewMode = mode;
  document.getElementById('btn-view-list')?.classList.toggle('active', mode === 'list');
  document.getElementById('btn-view-kanban')?.classList.toggle('active', mode === 'kanban');
  
  const listViewWrap = document.getElementById('tasks-list-container');
  const kanbanViewWrap = document.getElementById('tasks-kanban-container');

  if (listViewWrap) listViewWrap.style.display = mode === 'list' ? 'flex' : 'none';
  if (kanbanViewWrap) kanbanViewWrap.style.display = mode === 'kanban' ? 'grid' : 'none';

  renderTasksPage();
}

function renderTasksPage() {
  const allTasks = store.getTasks();

  // Obter valores dos filtros
  const searchTerm = (document.getElementById('task-search-input')?.value || '').toLowerCase().trim();
  const filterCat = document.getElementById('filter-category')?.value || 'all';
  const filterPri = document.getElementById('filter-priority')?.value || 'all';
  const filterStatus = document.getElementById('filter-status')?.value || 'all';

  // Aplica filtros
  const filteredTasks = allTasks.filter(task => {
    const matchSearch = task.title.toLowerCase().includes(searchTerm) || 
                        (task.description && task.description.toLowerCase().includes(searchTerm));
    const matchCat = filterCat === 'all' || task.category === filterCat;
    const matchPri = filterPri === 'all' || task.priority === filterPri;
    const matchStatus = filterStatus === 'all' || task.status === filterStatus;

    return matchSearch && matchCat && matchPri && matchStatus;
  });

  const countDisplay = document.getElementById('filtered-tasks-count');
  if (countDisplay) {
    countDisplay.textContent = `${filteredTasks.length} ${filteredTasks.length === 1 ? 'tarefa encontrada' : 'tarefas encontradas'}`;
  }

  if (currentViewMode === 'list') {
    renderTasksListView(filteredTasks);
  } else {
    renderTasksKanbanView(filteredTasks);
  }
}

function renderTasksListView(tasks) {
  const container = document.getElementById('tasks-list-container');
  if (!container) return;

  if (tasks.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <p class="empty-state-title">Nenhuma tarefa encontrada</p>
        <p style="font-size:0.85rem;">Tente ajustar os filtros ou adicione uma nova tarefa.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = tasks.map(task => {
    const isCompleted = task.status === 'done';
    const catLabel = getCategoryLabel(task.category);
    const catClass = `badge-${task.category}`;
    const priorityClass = `priority-${task.priority}`;
    const statusLabel = getStatusLabel(task.status);

    return `
      <div class="task-item ${isCompleted ? 'completed' : ''}">
        <div class="task-left">
          <label class="custom-checkbox">
            <input type="checkbox" ${isCompleted ? 'checked' : ''} onchange="toggleTask('${task.id}')" />
            <div class="checkbox-visual">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </label>
          <div class="task-details">
            <span class="task-text-title">${escapeHtml(task.title)}</span>
            ${task.description ? `<p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.2rem;">${escapeHtml(task.description)}</p>` : ''}
            <div class="task-meta-row">
              <span class="badge ${catClass}">${catLabel}</span>
              <span class="badge" style="background:var(--bg-surface-elevated); color:var(--text-secondary); border:1px solid var(--border-strong);">
                ${statusLabel}
              </span>
              <span class="priority-pill ${priorityClass}" title="Prioridade: ${task.priority}"></span>
              <span class="task-time-tag">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                ${task.time || '--:--'} • ${getPeriodLabel(task.period)}
              </span>
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="action-btn-subtle" title="Mudar Status" onclick="cycleTaskStatus('${task.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
          <button class="action-btn-subtle" title="Editar" onclick="openTaskModal('${task.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="action-btn-subtle delete" title="Excluir" onclick="deleteTaskItem('${task.id}')">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function renderTasksKanbanView(tasks) {
  const colTodo = document.getElementById('kanban-cards-todo');
  const colProgress = document.getElementById('kanban-cards-progress');
  const colDone = document.getElementById('kanban-cards-done');

  const countTodo = document.getElementById('kcount-todo');
  const countProgress = document.getElementById('kcount-progress');
  const countDone = document.getElementById('kcount-done');

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const progressTasks = tasks.filter(t => t.status === 'inprogress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  if (countTodo) countTodo.textContent = todoTasks.length;
  if (countProgress) countProgress.textContent = progressTasks.length;
  if (countDone) countDone.textContent = doneTasks.length;

  if (colTodo) colTodo.innerHTML = buildKanbanColumnHtml(todoTasks, 'todo');
  if (colProgress) colProgress.innerHTML = buildKanbanColumnHtml(progressTasks, 'inprogress');
  if (colDone) colDone.innerHTML = buildKanbanColumnHtml(doneTasks, 'done');
}

function buildKanbanColumnHtml(taskList, columnStatus) {
  if (taskList.length === 0) {
    return `<div style="padding: 1.5rem 0.5rem; text-align: center; color: var(--text-muted); font-size: 0.8rem; font-style: italic;">Nenhuma tarefa nesta etapa</div>`;
  }

  return taskList.map(task => {
    const catLabel = getCategoryLabel(task.category);
    const catClass = `badge-${task.category}`;
    const priorityClass = `priority-${task.priority}`;

    return `
      <div class="kanban-card" draggable="true" ondragstart="handleDragStart(event, '${task.id}')">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.5rem;">
          <span class="badge ${catClass}">${catLabel}</span>
          <span class="priority-pill ${priorityClass}" title="Prioridade: ${task.priority}"></span>
        </div>
        <h4 class="kanban-card-title">${escapeHtml(task.title)}</h4>
        ${task.description ? `<p class="kanban-card-desc">${escapeHtml(task.description)}</p>` : ''}
        
        <div class="kanban-card-footer">
          <span class="task-time-tag">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${task.time || '--:--'}
          </span>
          <div class="kanban-move-controls">
            ${columnStatus !== 'todo' ? `
              <button class="action-btn-subtle" title="Mover para esquerda" onclick="moveTask('${task.id}', '${getPreviousStatus(columnStatus)}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            ` : ''}
            <button class="action-btn-subtle" title="Editar" onclick="openTaskModal('${task.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="action-btn-subtle delete" title="Excluir" onclick="deleteTaskItem('${task.id}')">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
            ${columnStatus !== 'done' ? `
              <button class="action-btn-subtle" title="Avançar etapa" onclick="moveTask('${task.id}', '${getNextStatus(columnStatus)}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Suporte para Drag and Drop no Kanban
function handleDragStart(e, taskId) {
  e.dataTransfer.setData('text/plain', taskId);
  e.target.classList.add('dragging');
}

function setupKanbanDragDrop() {
  const columns = document.querySelectorAll('.kanban-column');
  columns.forEach(col => {
    col.addEventListener('dragover', e => {
      e.preventDefault();
      col.style.borderColor = 'var(--accent-cyan)';
    });
    col.addEventListener('dragleave', () => {
      col.style.borderColor = 'var(--border-subtle)';
    });
    col.addEventListener('drop', e => {
      e.preventDefault();
      col.style.borderColor = 'var(--border-subtle)';
      const taskId = e.dataTransfer.getData('text/plain');
      const targetStatus = col.dataset.status;
      if (taskId && targetStatus) {
        store.updateTask(taskId, { status: targetStatus });
        showToast(`Status atualizado para: ${getStatusLabel(targetStatus)}`, 'success');
        renderTasksPage();
      }
    });
  });
}

function moveTask(id, targetStatus) {
  store.updateTask(id, { status: targetStatus });
  showToast(`Tarefa movida para: ${getStatusLabel(targetStatus)}`, 'success');
  renderTasksPage();
}

function cycleTaskStatus(id) {
  const task = store.getTasks().find(t => t.id === id);
  if (!task) return;
  const next = getNextStatus(task.status);
  store.updateTask(id, { status: next });
  showToast(`Status alterado: ${getStatusLabel(next)}`, 'success');
  renderTasksPage();
}

function getNextStatus(current) {
  if (current === 'todo') return 'inprogress';
  if (current === 'inprogress') return 'done';
  return 'todo';
}

function getPreviousStatus(current) {
  if (current === 'done') return 'inprogress';
  if (current === 'inprogress') return 'todo';
  return 'todo';
}

// ==========================================================================
// PÁGINA 3: ROTINA & HÁBITOS (ROTINA.HTML)
// ==========================================================================
function renderRoutinePage() {
  const habits = store.getHabits();
  const tableBody = document.getElementById('habit-table-body');
  const avgRateEl = document.getElementById('habit-avg-completion');
  const bestHabitEl = document.getElementById('habit-best-streak');

  if (tableBody) {
    if (habits.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="10" style="padding: 2.5rem 1rem; text-align: center; color: var(--text-muted);">
            Nenhum hábito cadastrado no momento. Clique em "+ Novo Hábito" para começar!
          </td>
        </tr>
      `;
    } else {
      let totalChecks = 0;
      let maxPossible = habits.length * 7;
      let bestStreak = 0;
      let bestHabitName = '-';

      tableBody.innerHTML = habits.map(habit => {
        const days = habit.days || [false, false, false, false, false, false, false];
        const checkedCount = days.filter(Boolean).length;
        const progressPct = Math.round((checkedCount / 7) * 100);

        totalChecks += checkedCount;
        if ((habit.streak || 0) > bestStreak) {
          bestStreak = habit.streak;
          bestHabitName = habit.name;
        }

        const catClass = `badge-${habit.category || 'saude'}`;

        return `
          <tr>
            <td class="td-habit-name">
              <div class="habit-name-box">
                <span class="habit-label-text">${escapeHtml(habit.name)}</span>
                <span class="habit-sub-badge">
                  <span class="badge ${catClass}" style="font-size:0.68rem; padding:0.1rem 0.45rem;">${getCategoryLabel(habit.category || 'saude')}</span>
                  • ${habit.frequency || 'Diário'}
                </span>
              </div>
            </td>
            ${days.map((isChecked, dayIdx) => `
              <td>
                <button type="button" class="habit-day-toggle ${isChecked ? 'checked' : ''}" 
                  onclick="handleToggleHabit('${habit.id}', ${dayIdx})"
                  title="Alterar dia">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
                </button>
              </td>
            `).join('')}
            <td>
              <div class="habit-row-progress">
                <div class="habit-bar-track">
                  <div class="habit-bar-fill" style="width: ${progressPct}%;"></div>
                </div>
                <span class="habit-pct-text">${progressPct}%</span>
              </div>
            </td>
            <td>
              <span class="habit-streak-badge">🔥 ${habit.streak || 0}d</span>
            </td>
            <td>
              <button class="action-btn-subtle delete" title="Excluir Hábito" onclick="handleDeleteHabit('${habit.id}')">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </td>
          </tr>
        `;
      }).join('');

      if (avgRateEl) {
        const avg = maxPossible === 0 ? 0 : Math.round((totalChecks / maxPossible) * 100);
        avgRateEl.textContent = `${avg}%`;
      }
      if (bestHabitEl) {
        bestHabitEl.textContent = `${bestHabitName} (${bestStreak} dias)`;
      }
    }
  }

  // Preenche Bloco de Reflexão do Dia
  loadReflectionFields();
  renderPastReflections();
}

function handleToggleHabit(habitId, dayIndex) {
  store.toggleHabitDay(habitId, dayIndex);
  renderRoutinePage();
}

function handleDeleteHabit(id) {
  if (confirm('Deseja realmente remover este hábito do seu rastreador?')) {
    store.deleteHabit(id);
    showToast('Hábito removido com sucesso.', 'info');
    renderRoutinePage();
  }
}

// Modal de Criação de Hábito
function openHabitModal() {
  const modal = document.getElementById('habit-modal');
  if (modal) {
    document.getElementById('habit-form').reset();
    modal.classList.add('open');
    document.getElementById('habit-name-input').focus();
  }
}

function closeHabitModal() {
  const modal = document.getElementById('habit-modal');
  if (modal) modal.classList.remove('open');
}

function handleHabitFormSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('habit-name-input').value.trim();
  if (!name) {
    showToast('Informe o nome do hábito.', 'info');
    return;
  }
  const category = document.getElementById('habit-category-select').value;
  const frequency = document.getElementById('habit-freq-select').value;

  store.addHabit({ name, category, frequency });
  showToast('Novo hábito adicionado ao seu rastreador!', 'success');
  closeHabitModal();
  renderRoutinePage();
}

// Reflexão Diária
let activeMood = 'produtivo';

function selectMood(mood) {
  activeMood = mood;
  document.querySelectorAll('.mood-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mood === mood);
  });
}

function loadReflectionFields() {
  const current = store.getCurrentReflection();
  selectMood(current.mood || 'produtivo');
  const winsEl = document.getElementById('journal-wins');
  const impEl = document.getElementById('journal-improvements');
  const notesEl = document.getElementById('journal-notes');
  const statusEl = document.getElementById('journal-save-status');

  if (winsEl) winsEl.value = current.wins || '';
  if (impEl) impEl.value = current.improvements || '';
  if (notesEl) notesEl.value = current.notes || '';
  if (statusEl && current.savedAt) {
    statusEl.innerHTML = `<span class="save-status-indicator saved">● Salvo em: ${current.savedAt}</span>`;
  }
}

function saveReflection() {
  const wins = document.getElementById('journal-wins')?.value || '';
  const improvements = document.getElementById('journal-improvements')?.value || '';
  const notes = document.getElementById('journal-notes')?.value || '';

  const now = new Date();
  const savedAt = `Hoje às ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const payload = { mood: activeMood, wins, improvements, notes, savedAt };
  store.saveCurrentReflection(payload);
  store.archiveCurrentReflection(payload);

  const statusEl = document.getElementById('journal-save-status');
  if (statusEl) {
    statusEl.innerHTML = `<span class="save-status-indicator saved">● Salvo em: ${savedAt}</span>`;
  }

  showToast('Reflexão do dia salva com sucesso!', 'success');
  renderPastReflections();
}

function renderPastReflections() {
  const container = document.getElementById('past-reflections-list');
  if (!container) return;

  const past = store.getPastReflections();
  if (past.length === 0) {
    container.innerHTML = `<p style="font-size:0.8rem; color:var(--text-muted); font-style:italic;">Nenhuma reflexão anterior registrada.</p>`;
    return;
  }

  container.innerHTML = past.slice(0, 3).map(item => `
    <div class="history-item">
      <div class="history-item-top">
        <span>📅 ${item.date || 'Data'}</span>
        <span>${getMoodEmoji(item.mood)} ${item.mood || ''}</span>
      </div>
      <p style="color:var(--text-secondary); white-space:pre-line;">${escapeHtml(item.wins || item.notes || 'Sem anotações.')}</p>
    </div>
  `).join('');
}

// --- UTILS & HELPERS ---
function getCategoryLabel(cat) {
  const map = {
    trabalho: '💼 Trabalho',
    lazer: '🎮 Lazer',
    estudos: '📚 Estudos',
    saude: '🏃 Saúde',
    pessoal: '🏠 Pessoal'
  };
  return map[cat] || cat;
}

function getPriorityLabel(pri) {
  const map = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
  return map[pri] || pri;
}

function getPeriodLabel(period) {
  const map = { manha: 'Manhã', tarde: 'Tarde', noite: 'Noite' };
  return map[period] || 'Manhã';
}

function getStatusLabel(status) {
  const map = {
    todo: 'A Fazer',
    inprogress: 'Em Andamento',
    done: 'Concluído'
  };
  return map[status] || status;
}

function getMoodEmoji(mood) {
  const map = {
    excelente: '🤩',
    produtivo: '⚡',
    calmo: '🌿',
    cansado: '😴',
    desafiador: '🎯'
  };
  return map[mood] || '✨';
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// --- MENU MOBILE RESPONSIVO ---
function toggleMobileMenu() {
  const drawer = document.getElementById('mobile-drawer');
  if (drawer) {
    drawer.classList.toggle('open');
  }
}

// --- INICIALIZAÇÃO NO CARREGAMENTO DO DOM ---
document.addEventListener('DOMContentLoaded', () => {
  initRealtimeClock();

  // Listener do form de tarefas
  const taskForm = document.getElementById('task-form');
  if (taskForm) {
    taskForm.addEventListener('submit', handleTaskFormSubmit);
  }

  // Listener do form de hábitos
  const habitForm = document.getElementById('habit-form');
  if (habitForm) {
    habitForm.addEventListener('submit', handleHabitFormSubmit);
  }

  // Listeners de filtros na página de tarefas
  document.getElementById('task-search-input')?.addEventListener('input', () => renderTasksPage());
  document.getElementById('filter-category')?.addEventListener('change', () => renderTasksPage());
  document.getElementById('filter-priority')?.addEventListener('change', () => renderTasksPage());
  document.getElementById('filter-status')?.addEventListener('change', () => renderTasksPage());

  // Fechar modal ao clicar fora
  window.addEventListener('click', (e) => {
    const taskModal = document.getElementById('task-modal');
    if (e.target === taskModal) closeTaskModal();

    const habitModal = document.getElementById('habit-modal');
    if (e.target === habitModal) closeHabitModal();
  });

  // Setup de Drag & Drop no Kanban
  if (document.body.dataset.page === 'tasks') {
    setupKanbanDragDrop();
  }

  // Render inicial de acordo com a página atual
  refreshActivePage();
});
