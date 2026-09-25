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
  INITIALIZED: 'chronos_is_initialized',
  THEME: 'chronos_active_theme',
  USERS: 'chronos_registered_users',
  SESSION: 'chronos_current_user_session'
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

  getUserPrefix() {
    const session = this.getCurrentSession();
    return session && session.id ? `chronos_${session.id}_` : 'chronos_guest_';
  }

  initStore() {
    const prefix = this.getUserPrefix();
    if (!localStorage.getItem(prefix + 'initialized')) {
      localStorage.setItem(prefix + 'tasks', JSON.stringify(INITIAL_TASKS));
      localStorage.setItem(prefix + 'habits', JSON.stringify(INITIAL_HABITS));
      localStorage.setItem(prefix + 'current_reflection', JSON.stringify(INITIAL_REFLECTION));
      localStorage.setItem(prefix + 'reflections', JSON.stringify([
        {
          date: 'Ontem',
          mood: 'excelente',
          wins: 'Finalizei protótipo Figma e corri 5km no parque.',
          savedAt: 'Ontem às 21:00'
        }
      ]));
      localStorage.setItem(prefix + 'initialized', 'true');
    }
  }

  // TAREFAS
  getTasks() {
    try {
      this.initStore();
      const prefix = this.getUserPrefix();
      return JSON.parse(localStorage.getItem(prefix + 'tasks')) || [];
    } catch {
      return [];
    }
  }

  saveTasks(tasks) {
    const prefix = this.getUserPrefix();
    localStorage.setItem(prefix + 'tasks', JSON.stringify(tasks));
  }

  addTask(taskData) {
    const tasks = this.getTasks();
    const newTask = {
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString(),
      status: taskData.status || 'todo',
      subtasks: taskData.subtasks || [],
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

  toggleSubtask(taskId, subtaskIdx) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task && task.subtasks && task.subtasks[subtaskIdx] !== undefined) {
      task.subtasks[subtaskIdx].done = !task.subtasks[subtaskIdx].done;
      this.saveTasks(tasks);
      return task;
    }
    return null;
  }

  // HÁBITOS
  getHabits() {
    try {
      this.initStore();
      const prefix = this.getUserPrefix();
      return JSON.parse(localStorage.getItem(prefix + 'habits')) || [];
    } catch {
      return [];
    }
  }

  saveHabits(habits) {
    const prefix = this.getUserPrefix();
    localStorage.setItem(prefix + 'habits', JSON.stringify(habits));
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
      this.initStore();
      const prefix = this.getUserPrefix();
      return JSON.parse(localStorage.getItem(prefix + 'current_reflection')) || {
        mood: 'produtivo', wins: '', improvements: '', notes: '', savedAt: ''
      };
    } catch {
      return { mood: 'produtivo', wins: '', improvements: '', notes: '', savedAt: '' };
    }
  }

  saveCurrentReflection(data) {
    const prefix = this.getUserPrefix();
    localStorage.setItem(prefix + 'current_reflection', JSON.stringify(data));
  }

  getPastReflections() {
    try {
      this.initStore();
      const prefix = this.getUserPrefix();
      return JSON.parse(localStorage.getItem(prefix + 'reflections')) || [];
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
    const prefix = this.getUserPrefix();
    localStorage.setItem(prefix + 'reflections', JSON.stringify(list.slice(0, 10)));
  }

  // BACKUP EXPORT & IMPORT
  exportBackupData() {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tasks: this.getTasks(),
      habits: this.getHabits(),
      currentReflection: this.getCurrentReflection(),
      reflections: this.getPastReflections()
    }, null, 2);
  }

  importBackupData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.tasks) this.saveTasks(data.tasks);
      if (data.habits) this.saveHabits(data.habits);
      if (data.currentReflection) this.saveCurrentReflection(data.currentReflection);
      if (data.reflections) localStorage.setItem(STORAGE_KEYS.REFLECTIONS, JSON.stringify(data.reflections));
      return true;
    } catch {
      return false;
    }
  }

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.HABITS);
    localStorage.removeItem(STORAGE_KEYS.REFLECTIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_REFLECTIONS);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    this.initStore();
  }

  // TEMA DE ACENTO
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'cyan';
  }

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  // AUTENTICAÇÃO COM E-MAIL E SENHA
  getRegisteredUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    } catch {
      return [];
    }
  }

  saveRegisteredUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getCurrentSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSION)) || null;
    } catch {
      return null;
    }
  }

  setCurrentSession(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  }

  registerUser(name, email, password) {
    const users = this.getRegisteredUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, message: 'Este e-mail já está cadastrado.' };
    }

    const newUser = {
      id: 'user-' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: btoa(password), // Codificação base64 para segurança básica local
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    this.saveRegisteredUsers(users);
    this.setCurrentSession({ id: newUser.id, name: newUser.name, email: newUser.email });
    return { success: true, user: newUser };
  }

  loginUser(email, password) {
    const users = this.getRegisteredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user || user.password !== btoa(password)) {
      return { success: false, message: 'E-mail ou senha incorretos.' };
    }

    this.setCurrentSession({ id: user.id, name: user.name, email: user.email });
    return { success: true, user };
  }

  logoutUser() {
    this.setCurrentSession(null);
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

    // Saudação contextual no Dashboard com o nome do usuário ativo
    if (greetingEl) {
      const h = now.getHours();
      let greeting = 'Bom dia';
      if (h >= 12 && h < 18) greeting = 'Boa tarde';
      else if (h >= 18 || h < 5) greeting = 'Boa noite';
      
      const session = store.getCurrentSession();
      const userName = session && session.name ? session.name : 'Visitante';
      greetingEl.textContent = `${greeting}, ${userName}!`;
    }
  }

  update();
  setInterval(update, 1000);
}

// --- CONTROLE DO MODAL DE TAREFA ---
let currentEditingTaskId = null;

function openTaskModal(taskId = null, prefillDate = null) {
  const modal = document.getElementById('task-modal');
  if (!modal) return;

  const form = document.getElementById('task-form');
  const modalTitle = document.getElementById('modal-title-text');
  currentEditingTaskId = taskId;

  const todayStr = new Date().toISOString().slice(0, 10);
  const dateInput = document.getElementById('task-date-input');

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
      if (dateInput) dateInput.value = task.date || todayStr;
      document.getElementById('task-status-select').value = task.status || 'todo';
      document.getElementById('task-tags-input').value = (task.tags || []).join(', ');
      document.getElementById('task-desc-input').value = task.description || '';
      renderModalSubtasksList(task.subtasks || []);
    }
  } else {
    modalTitle.textContent = 'Nova Tarefa';
    form.reset();
    document.getElementById('task-time-input').value = '10:00';
    if (dateInput) dateInput.value = prefillDate || todayStr;
    renderModalSubtasksList([]);
  }

  modal.classList.add('open');
  document.getElementById('task-title-input').focus();

  // Sincronizar período automaticamente com o horário
  const timeInput = document.getElementById('task-time-input');
  if (timeInput) {
    timeInput.oninput = () => {
      const val = timeInput.value;
      if (val && val.includes(':')) {
        const hour = parseInt(val.split(':')[0], 10);
        const periodSelect = document.getElementById('task-period-select');
        if (periodSelect && !isNaN(hour)) {
          if (hour >= 5 && hour < 12) periodSelect.value = 'manha';
          else if (hour >= 12 && hour < 18) periodSelect.value = 'tarde';
          else periodSelect.value = 'noite';
        }
      }
    };
  }
}

function closeTaskModal() {
  const modal = document.getElementById('task-modal');
  if (modal) {
    modal.classList.remove('open');
    currentEditingTaskId = null;
  }
}

// Subtarefas no Modal
let currentSubtasksInMemory = [];

function renderModalSubtasksList(subtasks = []) {
  currentSubtasksInMemory = [...subtasks];
  const container = document.getElementById('modal-subtasks-list');
  if (!container) return;

  container.innerHTML = currentSubtasksInMemory.map((st, idx) => `
    <div class="subtask-item-row">
      <input type="checkbox" ${st.done ? 'checked' : ''} onchange="toggleMemorySubtask(${idx})" />
      <span style="flex:1; font-size:0.85rem; ${st.done ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">${escapeHtml(st.title)}</span>
      <button type="button" class="action-btn-subtle delete" onclick="removeMemorySubtask(${idx})">✕</button>
    </div>
  `).join('');
}

function addMemorySubtask() {
  const input = document.getElementById('new-subtask-input');
  if (!input || !input.value.trim()) return;
  currentSubtasksInMemory.push({ title: input.value.trim(), done: false });
  input.value = '';
  renderModalSubtasksList(currentSubtasksInMemory);
}

function toggleMemorySubtask(idx) {
  if (currentSubtasksInMemory[idx]) {
    currentSubtasksInMemory[idx].done = !currentSubtasksInMemory[idx].done;
    renderModalSubtasksList(currentSubtasksInMemory);
  }
}

function removeMemorySubtask(idx) {
  currentSubtasksInMemory.splice(idx, 1);
  renderModalSubtasksList(currentSubtasksInMemory);
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
  let period = document.getElementById('task-period-select').value;
  const time = document.getElementById('task-time-input').value;
  const dateInput = document.getElementById('task-date-input');
  const date = (dateInput && dateInput.value) ? dateInput.value : new Date().toISOString().slice(0, 10);
  const status = document.getElementById('task-status-select').value;
  const rawTags = (document.getElementById('task-tags-input')?.value || '').split(',').map(t => t.trim()).filter(Boolean);
  const description = document.getElementById('task-desc-input').value.trim();

  // Se houver horário definido, infere o período correto para evitar discrepâncias (ex: 22:00 deve ser Noite)
  if (time && time.includes(':')) {
    const hour = parseInt(time.split(':')[0], 10);
    if (!isNaN(hour)) {
      if (hour >= 5 && hour < 12) period = 'manha';
      else if (hour >= 12 && hour < 18) period = 'tarde';
      else period = 'noite';
    }
  }

  const taskPayload = { 
    title, 
    category, 
    priority, 
    period, 
    time, 
    date,
    status, 
    tags: rawTags,
    subtasks: currentSubtasksInMemory,
    description 
  };

  if (currentEditingTaskId) {
    store.updateTask(currentEditingTaskId, taskPayload);
    showToast('Tarefa atualizada com sucesso!', 'success');
  } else {
    store.addTask(taskPayload);
    showToast('Nova tarefa agendada com sucesso!', 'success');
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
  } else if (document.body.dataset.page === 'calendar') {
    renderCalendarPage();
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
  // Tarefas do dia: ou tem a data de hoje, ou não têm data definida (legado)
  const todayStr = new Date().toISOString().slice(0, 10);
  const todaysTasks = tasks.filter(t => !t.date || t.date === todayStr);

  const morningContainer = document.getElementById('timeline-morning-list');
  const afternoonContainer = document.getElementById('timeline-afternoon-list');
  const nightContainer = document.getElementById('timeline-night-list');

  const countMorning = document.getElementById('count-morning');
  const countAfternoon = document.getElementById('count-afternoon');
  const countNight = document.getElementById('count-night');

  function resolvePeriod(t) {
    if (t.time && t.time.includes(':')) {
      const h = parseInt(t.time.split(':')[0], 10);
      if (!isNaN(h)) {
        if (h >= 5 && h < 12) return 'manha';
        if (h >= 12 && h < 18) return 'tarde';
        return 'noite';
      }
    }
    return t.period || 'manha';
  }

  const morningTasks = todaysTasks.filter(t => resolvePeriod(t) === 'manha');
  const afternoonTasks = todaysTasks.filter(t => resolvePeriod(t) === 'tarde');
  const nightTasks = todaysTasks.filter(t => resolvePeriod(t) === 'noite');

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
    if (updated.status === 'done') {
      showToast('Tarefa concluída! Parabéns!', 'success');
      triggerConfetti();
    } else {
      showToast('Tarefa reaberta.', 'info');
    }
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
            
            ${task.subtasks && task.subtasks.length > 0 ? `
              <div class="subtask-progress-mini">
                <span>☑️ ${task.subtasks.filter(s => s.done).length}/${task.subtasks.length} etapas</span>
                <div class="subtask-progress-bar">
                  <div class="subtask-progress-fill" style="width: ${Math.round((task.subtasks.filter(s => s.done).length / task.subtasks.length) * 100)}%;"></div>
                </div>
              </div>
            ` : ''}

            <div class="task-meta-row">
              <span class="badge ${catClass}">${catLabel}</span>
              ${(task.tags || []).map(t => `<span class="custom-tag-pill">#${escapeHtml(t)}</span>`).join('')}
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

// ==========================================================================
// MÓDULO: TIMER POMODORO & WEB AUDIO API (SOM NATIVO SEM ARQUIVOS EXTERNOS)
// ==========================================================================
const Pomodoro = {
  mode: 'focus', // 'focus' (25 min) | 'short' (5 min) | 'long' (15 min)
  durations: { focus: 25 * 60, short: 5 * 60, long: 15 * 60 },
  timeLeft: 25 * 60,
  timerInterval: null,
  isRunning: false,
  cyclesCompleted: 0,

  init() {
    this.updateDisplay();
  },

  setMode(mode) {
    this.pause();
    this.mode = mode;
    this.timeLeft = this.durations[mode];
    document.querySelectorAll('.pomodoro-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.mode === mode);
    });
    this.updateDisplay();
  },

  toggle() {
    if (this.isRunning) {
      this.pause();
    } else {
      this.start();
    }
  },

  start() {
    this.isRunning = true;
    const btn = document.getElementById('pomodoro-toggle-btn');
    if (btn) btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pausar`;

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.updateDisplay();
      if (this.timeLeft <= 0) {
        this.completeCycle();
      }
    }, 1000);
  },

  pause() {
    this.isRunning = false;
    clearInterval(this.timerInterval);
    const btn = document.getElementById('pomodoro-toggle-btn');
    if (btn) btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> Iniciar`;
  },

  reset() {
    this.pause();
    this.timeLeft = this.durations[this.mode];
    this.updateDisplay();
  },

  updateDisplay() {
    const min = Math.floor(this.timeLeft / 60);
    const sec = this.timeLeft % 60;
    const formatted = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
    const el = document.getElementById('pomodoro-timer-text');
    if (el) el.textContent = formatted;
  },

  completeCycle() {
    this.pause();
    this.playBeepSound();
    
    if (this.mode === 'focus') {
      this.cyclesCompleted++;
      const cycleEl = document.getElementById('pomodoro-cycles-val');
      if (cycleEl) cycleEl.textContent = this.cyclesCompleted;
      triggerConfetti();
      sendNativeNotification('Pomodoro Concluído!', 'Parabéns! Bloco de foco finalizado. Hora de fazer uma pausa!');
      showToast('Pomodoro finalizado! Descanse alguns minutos.', 'success');
      this.setMode('short');
    } else {
      sendNativeNotification('Pausa Concluída!', 'Hora de voltar ao foco!');
      showToast('Pausa finalizada! Pronto para o próximo bloco?', 'info');
      this.setMode('focus');
    }
  },

  // Gerador de Som Nativo via Web Audio API (Bip e Ruído Ambiente de Foco)
  ambientAudioCtx: null,
  ambientNode: null,
  ambientGain: null,
  isAmbientPlaying: false,

  toggleAmbientSound() {
    if (this.isAmbientPlaying) {
      this.stopAmbientSound();
    } else {
      this.startAmbientSound();
    }
  },

  startAmbientSound() {
    try {
      this.ambientAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const bufferSize = this.ambientAudioCtx.sampleRate * 2;
      const buffer = this.ambientAudioCtx.createBuffer(1, bufferSize, this.ambientAudioCtx.sampleRate);
      const data = buffer.getChannelData(0);

      // Gera Pink Noise (ruído suave de chuva/foco)
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
        b6 = white * 0.115926;
      }

      this.ambientNode = this.ambientAudioCtx.createBufferSource();
      this.ambientNode.buffer = buffer;
      this.ambientNode.loop = true;

      this.ambientGain = this.ambientAudioCtx.createGain();
      this.ambientGain.gain.setValueAtTime(0.3, this.ambientAudioCtx.currentTime);

      this.ambientNode.connect(this.ambientGain);
      this.ambientGain.connect(this.ambientAudioCtx.destination);
      this.ambientNode.start(0);

      this.isAmbientPlaying = true;
      const btn = document.getElementById('pomodoro-ambient-btn');
      if (btn) {
        btn.classList.add('active');
        btn.innerHTML = '🌧️ Foco Ativo';
      }
      showToast('Som suave de chuva ativado!', 'info');
    } catch {
      showToast('Áudio não suportado neste navegador.', 'info');
    }
  },

  stopAmbientSound() {
    if (this.ambientNode) {
      try {
        this.ambientNode.stop();
        this.ambientNode.disconnect();
      } catch {}
    }
    this.isAmbientPlaying = false;
    const btn = document.getElementById('pomodoro-ambient-btn');
    if (btn) {
      btn.classList.remove('active');
      btn.innerHTML = '🌧️ Som Chuva';
    }
    showToast('Som ambiente desativado.', 'info');
  },

  playBeepSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {
      // Navegador sem suporte a Web Audio
    }
  }
};

// ==========================================================================
// MÓDULO: CONFETES NATIVOS COM CANVAS (GAMIFICAÇÃO SEM BIBLIOTECAS)
// ==========================================================================
function triggerConfetti() {
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#38bdf8', '#6366f1', '#a855f7', '#10b981', '#fbbf24', '#f43f5e'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.7) * 16,
      gravity: 0.35,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  let animationFrame;
  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotSpeed;
      p.opacity -= 0.012;

      if (p.opacity > 0) {
        alive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      }
    });

    if (alive) {
      animationFrame = requestAnimationFrame(updateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  updateConfetti();
}

// ==========================================================================
// MÓDULO: NOTIFICAÇÕES NATIVAS DO NAVEGADOR (NOTIFICATION API)
// ==========================================================================
function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        showToast('Notificações do sistema ativadas!', 'success');
      }
    });
  }
}

function sendNativeNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: 'icon-192.png'
      });
    } catch {
      // Fallback
    }
  }
}

// ==========================================================================
// MÓDULO: EXPORTAR & IMPORTAR BACKUP (JSON) & RESET
// ==========================================================================
function exportUserDataBackup() {
  const jsonStr = store.exportBackupData();
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `chronos-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Backup exportado com sucesso!', 'success');
}

function importUserDataBackup(fileInput) {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const success = store.importBackupData(e.target.result);
    if (success) {
      showToast('Dados restaurados com sucesso!', 'success');
      setTimeout(() => location.reload(), 600);
    } else {
      showToast('Arquivo de backup inválido.', 'info');
    }
  };
  reader.readAsText(file);
}

function resetAllDataFactory() {
  if (confirm('Atenção: Isso irá resetar todas as tarefas e hábitos para os dados de demonstração iniciais. Continuar?')) {
    store.resetAllData();
    showToast('Dados reiniciados com sucesso.', 'info');
    setTimeout(() => location.reload(), 500);
  }
}

// ==========================================================================
// MÓDULO: TEMAS VISUAIS DE ACENTO
// ==========================================================================
function initThemePicker() {
  const current = store.getTheme();
  document.documentElement.setAttribute('data-theme', current);
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.theme === current);
  });
}

function switchTheme(theme) {
  store.setTheme(theme);
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.theme === theme);
  });
  showToast(`Tema alterado para: ${theme.toUpperCase()}`, 'info');
}

// ==========================================================================
// MÓDULO: MODAL DE ATALHOS DE TECLADO
// ==========================================================================
function openShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) modal.classList.add('open');
}

function closeShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) modal.classList.remove('open');
}

function setupKeyboardShortcuts() {
  window.addEventListener('keydown', (e) => {
    // Ignorar se estiver digitando em um input ou textarea
    const tag = document.activeElement.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
      if (e.key === 'Escape') {
        closeTaskModal();
        closeHabitModal?.();
        closeShortcutsModal();
      }
      return;
    }

    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      openTaskModal();
    } else if (e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      Pomodoro.toggle();
    } else if (e.key === '?') {
      e.preventDefault();
      openShortcutsModal();
    } else if (e.key === 'Escape') {
      closeTaskModal();
      closeHabitModal?.();
      closeShortcutsModal();
    } else if (e.key === '/') {
      const searchInput = document.getElementById('task-search-input');
      if (searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
    }
  });
}

// ==========================================================================
// REGISTRO DE SERVICE WORKER (PWA)
// ==========================================================================
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      // Execução sem suporte a SW no contexto atual
    });
  }
}

// ==========================================================================
// MÓDULO: GERENCIAMENTO DE AUTENTICAÇÃO (UI, LOGIN, CADASTRO, SESSÃO)
// ==========================================================================
let currentAuthTab = 'login'; // 'login' | 'register'

function openAuthModal(tab = 'login') {
  setAuthTab(tab);
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.add('open');
    document.getElementById('auth-error-box').style.display = 'none';
  }
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('open');
}

function setAuthTab(tab) {
  currentAuthTab = tab;
  document.getElementById('auth-tab-login')?.classList.toggle('active', tab === 'login');
  document.getElementById('auth-tab-register')?.classList.toggle('active', tab === 'register');
  
  const nameField = document.getElementById('auth-name-group');
  const submitBtn = document.getElementById('auth-submit-btn');
  const modalTitle = document.getElementById('auth-modal-title');
  const errorBox = document.getElementById('auth-error-box');

  if (errorBox) errorBox.style.display = 'none';

  if (tab === 'login') {
    if (nameField) nameField.style.display = 'none';
    if (submitBtn) submitBtn.textContent = 'Entrar na Conta';
    if (modalTitle) modalTitle.textContent = 'Acessar sua Conta';
  } else {
    if (nameField) nameField.style.display = 'flex';
    if (submitBtn) submitBtn.textContent = 'Criar Conta Gratuita';
    if (modalTitle) modalTitle.textContent = 'Cadastrar Nova Conta';
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email-input').value.trim();
  const password = document.getElementById('auth-password-input').value;
  const errorBox = document.getElementById('auth-error-box');

  if (!email || !password) {
    showAuthError('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  if (password.length < 6) {
    showAuthError('A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  if (currentAuthTab === 'register') {
    const name = document.getElementById('auth-name-input').value.trim();
    if (!name) {
      showAuthError('Por favor, informe seu nome completo ou apelido.');
      return;
    }

    const res = store.registerUser(name, email, password);
    if (!res.success) {
      showAuthError(res.message);
      return;
    }

    showToast(`Bem-vindo(a), ${res.user.name}! Conta criada com sucesso.`, 'success');
    closeAuthModal();
    updateUserSessionUI();
    refreshActivePage();
    triggerConfetti();
  } else {
    const res = store.loginUser(email, password);
    if (!res.success) {
      showAuthError(res.message);
      return;
    }

    showToast(`Olá novamente, ${res.user.name}! Login realizado.`, 'success');
    closeAuthModal();
    updateUserSessionUI();
    refreshActivePage();
  }
}

function showAuthError(msg) {
  const errorBox = document.getElementById('auth-error-box');
  if (errorBox) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
  }
}

function handleUserLogout() {
  if (confirm('Deseja realmente sair da sua conta?')) {
    store.logoutUser();
    showToast('Você saiu da sua conta.', 'info');
    updateUserSessionUI();
    refreshActivePage();
  }
}

function updateUserSessionUI() {
  const session = store.getCurrentSession();
  const profileContainer = document.getElementById('nav-user-profile');
  const greetingEl = document.getElementById('hero-greeting-text');

  if (profileContainer) {
    if (session) {
      const initial = (session.name || session.email).charAt(0).toUpperCase();
      profileContainer.innerHTML = `
        <div class="user-profile-badge" onclick="handleUserLogout()" title="Logado como ${escapeHtml(session.email)} (Clique para sair)">
          <div class="user-avatar-circle">${initial}</div>
          <span style="max-width:100px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${escapeHtml(session.name || session.email)}</span>
          <span style="font-size:0.7rem; color:var(--text-muted);">▼</span>
        </div>
      `;
    } else {
      profileContainer.innerHTML = `
        <button class="btn btn-secondary btn-sm" onclick="openAuthModal('login')">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          Entrar
        </button>
      `;
    }
  }

  if (greetingEl) {
    const now = new Date();
    const h = now.getHours();
    let greeting = 'Bom dia';
    if (h >= 12 && h < 18) greeting = 'Boa tarde';
    else if (h >= 18 || h < 5) greeting = 'Boa noite';
    const userName = session && session.name ? session.name : 'Visitante';
    greetingEl.textContent = `${greeting}, ${userName}!`;
  }
}

// ==========================================================================
// PÁGINA 4: CALENDÁRIO & AGENDAMENTO FUTURO (CALENDARIO.HTML)
// ==========================================================================
let calendarCurrentDate = new Date();
let calendarSelectedDateStr = new Date().toISOString().slice(0, 10);

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

function changeCalendarMonth(delta) {
  calendarCurrentDate.setMonth(calendarCurrentDate.getMonth() + delta);
  renderCalendarPage();
}

function resetCalendarToToday() {
  calendarCurrentDate = new Date();
  calendarSelectedDateStr = new Date().toISOString().slice(0, 10);
  renderCalendarPage();
}

function selectCalendarDay(dateStr) {
  calendarSelectedDateStr = dateStr;
  renderCalendarPage();
}

function openTaskModalForDate(dateStr) {
  openTaskModal(null, dateStr || calendarSelectedDateStr);
}

function renderCalendarPage() {
  const currentMonth = calendarCurrentDate.getMonth();
  const currentYear = calendarCurrentDate.getFullYear();

  // 1. Atualizar Título do Mês
  const titleEl = document.getElementById('calendar-month-title');
  if (titleEl) {
    titleEl.textContent = `${MONTH_NAMES[currentMonth]} ${currentYear}`;
  }

  // 2. Coletar Tarefas
  const tasks = store.getTasks();

  // Mapear tarefas por data (YYYY-MM-DD)
  const tasksByDate = {};
  tasks.forEach(t => {
    const d = t.date || new Date(t.createdAt || Date.now()).toISOString().slice(0, 10);
    if (!tasksByDate[d]) tasksByDate[d] = [];
    tasksByDate[d].push(t);
  });

  // 3. Gerar Grid do Mês
  const gridEl = document.getElementById('calendar-days-grid');
  if (gridEl) {
    // Primeiro dia da semana do mês (0=Dom, 1=Seg, ..., 6=Sáb)
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    // Quantos dias tem o mês atual
    const lastDateOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    // Quantos dias tinha o mês anterior
    const prevMonthLastDate = new Date(currentYear, currentMonth, 0).getDate();

    const todayStr = new Date().toISOString().slice(0, 10);
    let cellsHtml = '';

    // Dias do mês anterior para completar o grid
    for (let i = firstDayIndex; i > 0; i--) {
      const dayNum = prevMonthLastDate - i + 1;
      const prevDate = new Date(currentYear, currentMonth - 1, dayNum);
      const dStr = prevDate.toISOString().slice(0, 10);
      const dayTasks = tasksByDate[dStr] || [];
      cellsHtml += `
        <div class="calendar-day-cell other-month" onclick="selectCalendarDay('${dStr}')">
          <span class="calendar-day-num">${dayNum}</span>
          ${renderCalendarDayEvents(dayTasks)}
        </div>
      `;
    }

    // Dias do mês atual
    for (let day = 1; day <= lastDateOfMonth; day++) {
      const curDate = new Date(currentYear, currentMonth, day);
      // Formata YYYY-MM-DD no horário local
      const y = curDate.getFullYear();
      const m = String(curDate.getMonth() + 1).padStart(2, '0');
      const d = String(day).padStart(2, '0');
      const dStr = `${y}-${m}-${d}`;

      const isToday = dStr === todayStr;
      const isSelected = dStr === calendarSelectedDateStr;
      const dayTasks = tasksByDate[dStr] || [];

      cellsHtml += `
        <div class="calendar-day-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" onclick="selectCalendarDay('${dStr}')" title="${day} de ${MONTH_NAMES[currentMonth]}${isToday ? ' (Hoje)' : ''}">
          <span class="calendar-day-num">${day}</span>
          ${renderCalendarDayEvents(dayTasks)}
        </div>
      `;
    }

    // Dias do próximo mês para fechar a última linha
    const totalRendered = firstDayIndex + lastDateOfMonth;
    const nextDays = (7 - (totalRendered % 7)) % 7;
    for (let day = 1; day <= nextDays; day++) {
      const nextDate = new Date(currentYear, currentMonth + 1, day);
      const dStr = nextDate.toISOString().slice(0, 10);
      const dayTasks = tasksByDate[dStr] || [];
      cellsHtml += `
        <div class="calendar-day-cell other-month" onclick="selectCalendarDay('${dStr}')">
          <span class="calendar-day-num">${day}</span>
          ${renderCalendarDayEvents(dayTasks)}
        </div>
      `;
    }

    gridEl.innerHTML = cellsHtml;
  }

  // 4. Renderizar painel lateral do dia selecionado
  renderCalendarSelectedDayPanel(tasksByDate);
}

function renderCalendarDayEvents(dayTasks) {
  if (!dayTasks || dayTasks.length === 0) return '';
  const displayTasks = dayTasks.slice(0, 4);
  const dotsHtml = displayTasks.map(t => {
    let catClass = '';
    if (t.category === 'lazer') catClass = 'lazer';
    else if (t.category === 'saude') catClass = 'saude';
    else if (t.category === 'pessoal') catClass = 'pessoal';
    else if (t.category === 'trabalho') catClass = 'trabalho';
    return `<span class="calendar-dot-marker ${catClass}"></span>`;
  }).join('');

  return `<div class="calendar-dots-wrap" title="${dayTasks.length} compromisso(s)">${dotsHtml}</div>`;
}

function renderCalendarSelectedDayPanel(tasksByDate) {
  const panelTitle = document.getElementById('selected-day-title');
  const panelSub = document.getElementById('selected-day-sub');
  const panelList = document.getElementById('selected-day-tasks-list');
  const addBtn = document.getElementById('btn-add-for-selected-day');

  if (!calendarSelectedDateStr) {
    calendarSelectedDateStr = new Date().toISOString().slice(0, 10);
  }

  const [year, month, day] = calendarSelectedDateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);

  const formattedDate = dateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  if (panelTitle) panelTitle.textContent = `Agenda: ${day} de ${MONTH_NAMES[month - 1]}`;
  if (panelSub) panelSub.textContent = formattedDate;

  if (addBtn) {
    addBtn.onclick = () => openTaskModalForDate(calendarSelectedDateStr);
  }

  const dayTasks = tasksByDate[calendarSelectedDateStr] || [];
  if (panelList) {
    if (dayTasks.length === 0) {
      panelList.innerHTML = `
        <div class="empty-state" style="padding:2rem 1rem;">
          <div class="empty-state-icon">📅</div>
          <p class="empty-state-title">Nenhum compromisso agendado</p>
          <p class="empty-state-desc">Você pode agendar consultas médicas, saídas, viagens ou compromissos futuros para este dia.</p>
          <button class="btn btn-primary btn-sm" onclick="openTaskModalForDate('${calendarSelectedDateStr}')" style="margin-top:0.75rem;">
            + Agendar para esta data
          </button>
        </div>
      `;
    } else {
      panelList.innerHTML = dayTasks.map(t => {
        const isDone = t.status === 'done';
        return `
          <div class="task-card-item ${isDone ? 'completed' : ''}" style="margin-bottom:0.75rem;">
            <div class="task-card-inner">
              <span class="custom-checkbox" onclick="toggleTaskFromAnywhere('${t.id}')">
                <input type="checkbox" ${isDone ? 'checked' : ''} />
                <div class="checkbox-visual">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </span>
              <div class="task-content">
                <h4 class="task-title-text" style="${isDone ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">${escapeHtml(t.title)}</h4>
                <div class="task-meta-row" style="margin-top:0.25rem;">
                  <span class="category-badge cat-${t.category || 'trabalho'}">${formatCategoryName(t.category)}</span>
                  ${t.time ? `<span class="time-tag">⏰ ${escapeHtml(t.time)}</span>` : ''}
                  <span class="priority-badge p-${t.priority || 'media'}">${formatPriorityName(t.priority)}</span>
                </div>
                ${t.description ? `<p style="font-size:0.8rem; color:var(--text-muted); margin-top:0.4rem;">${escapeHtml(t.description)}</p>` : ''}
              </div>
              <div class="task-actions-wrap">
                <button class="action-btn-subtle" onclick="openTaskModal('${t.id}')" title="Editar">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="action-btn-subtle delete" onclick="deleteTaskFromAnywhere('${t.id}')" title="Excluir">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }
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
  initThemePicker();
  setupKeyboardShortcuts();
  registerServiceWorker();
  Pomodoro.init();

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

    const shortcutsModal = document.getElementById('shortcuts-modal');
    if (e.target === shortcutsModal) closeShortcutsModal();
  });

  // Setup de Drag & Drop no Kanban
  if (document.body.dataset.page === 'tasks') {
    setupKanbanDragDrop();
  }

  // Listener do form de autenticação
  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', handleAuthSubmit);
  }

  // Atualizar estado de sessão do usuário
  updateUserSessionUI();

  // Render inicial de acordo com a página atual
  refreshActivePage();
});
