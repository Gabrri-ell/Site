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
  SESSION: 'chronos_current_user_session',
  SUPABASE_CONFIG: 'chronos_supabase_config'
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
    if (window.chronosCloud) window.chronosCloud.queueAutoSync();
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
    if (window.chronosCloud) window.chronosCloud.queueAutoSync();
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
    if (window.chronosCloud) window.chronosCloud.queueAutoSync();
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
      if (Array.isArray(data.tasks)) this.saveTasks(data.tasks);
      if (Array.isArray(data.habits)) this.saveHabits(data.habits);
      if (data.currentReflection) this.saveCurrentReflection(data.currentReflection);
      if (Array.isArray(data.reflections)) {
        const prefix = this.getUserPrefix();
        localStorage.setItem(prefix + 'reflections', JSON.stringify(data.reflections));
      }
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

  updateUserPassword(email, newPassword) {
    const users = this.getRegisteredUsers();
    const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return { success: false, message: 'Usuário não encontrado.' };
    }
    user.password = btoa(newPassword);
    this.saveRegisteredUsers(users);
    this.setCurrentSession({ id: user.id, name: user.name, email: user.email });
    return { success: true, user };
  }
}

// ==========================================================================
// MÓDULO: SINCRONIZAÇÃO EM NUVEM (SUPABASE) & BACKUP
// ==========================================================================
class ChronosCloudManager {
  constructor(store) {
    this.store = store;
    this.client = null;
    this.isConfigured = false;
    this.isSyncing = false;
    this.syncTimeout = null;
    this.hasRelationalTables = false;
    this.init();
  }

  getConfig() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUPABASE_CONFIG));
      if (saved && saved.url && saved.key) return saved;
    } catch {}

    // 1. Detecção automática de variáveis de ambiente (Vercel ou window.ENV)
    const envUrl = window.NEXT_PUBLIC_SUPABASE_URL ||
                   window.SUPABASE_URL ||
                   (window.ENV && (window.ENV.NEXT_PUBLIC_SUPABASE_URL || window.ENV.SUPABASE_URL));

    const envKey = window.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                   window.SUPABASE_ANON_KEY ||
                   (window.ENV && (window.ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY || window.ENV.SUPABASE_ANON_KEY));

    if (envUrl && envKey) {
      return { url: envUrl.trim(), key: envKey.trim() };
    }

    // 2. Credenciais padrão da nuvem Supabase
    return {
      url: 'https://uzzaifelwjsitqmaaifo.supabase.co',
      key: 'sb_publishable_Vg45ZPXTHvQzy6gXwClsIg_Nh9EE22g'
    };
  }

  setConfig(url, key) {
    if (url && key) {
      localStorage.setItem(STORAGE_KEYS.SUPABASE_CONFIG, JSON.stringify({ url: url.trim(), key: key.trim() }));
      this.init();
    } else {
      localStorage.removeItem(STORAGE_KEYS.SUPABASE_CONFIG);
      this.client = null;
      this.isConfigured = false;
      this.updateStatusUI();
    }
  }

  init() {
    const config = this.getConfig();
    if (config && config.url && config.key && window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        this.client = window.supabase.createClient(config.url, config.key);
        this.isConfigured = true;

        // Listener de eventos de autenticação (recuperação de senha e sessões)
        this.client.auth.onAuthStateChange((event, session) => {
          if (event === 'PASSWORD_RECOVERY') {
            if (typeof openResetPasswordModal === 'function') {
              openResetPasswordModal();
            }
          }
        });
      } catch (err) {
        console.warn('Erro ao inicializar cliente Supabase:', err);
        this.client = null;
        this.isConfigured = false;
      }
    } else {
      this.client = null;
      this.isConfigured = false;
    }
    this.updateStatusUI();
  }

  async checkInitialSession() {
    if (!this.client || !this.isConfigured) return;
    try {
      const { data, error } = await this.client.auth.getSession();
      if (error) {
        console.warn('Erro ao checar sessão Supabase:', error);
        return;
      }
      if (data && data.session && data.session.user) {
        const u = data.session.user;
        const userName = u.user_metadata?.name || u.email.split('@')[0];
        const userObj = {
          id: u.id,
          name: userName,
          email: u.email,
          isCloud: true
        };
        this.store.setCurrentSession(userObj);
        updateUserSessionUI();
        await this.pullFromCloud();
        refreshActivePage();
      }
    } catch (err) {
      console.warn('Falha ao verificar sessão inicial do Supabase:', err);
    }
  }

  async pushToCloud() {
    if (!this.client || !this.isConfigured) return;
    const session = this.store.getCurrentSession();
    if (!session || !session.id) return;

    try {
      this.isSyncing = true;
      this.updateStatusUI('syncing');

      const tasks = this.store.getTasks();
      const habits = this.store.getHabits();
      const reflections = this.store.getPastReflections();

      // 1. Sincronização Principal na Tabela chronos_userdata (Compatibilidade e Backup)
      const payload = {
        user_id: session.id,
        tasks: tasks,
        habits: habits,
        reflections: reflections,
        updated_at: new Date().toISOString()
      };

      const { error } = await this.client
        .from('chronos_userdata')
        .upsert(payload, { onConflict: 'user_id' });

      // 2. Mapeamento das tabelas individuais relacionais (tarefas e agendas)
      try {
        if (tasks && tasks.length > 0) {
          const tarefasPayload = tasks.map(t => ({
            id: t.id,
            user_id: session.id,
            title: t.title || '',
            description: t.description || '',
            time: t.time || '09:00',
            period: t.period || 'manha',
            category: t.category || 'trabalho',
            priority: t.priority || 'media',
            status: t.status || 'todo',
            date: t.date || null,
            recurrence: t.recurrence || 'once',
            subtasks: t.subtasks || []
          }));
          await this.client.from('tarefas').upsert(tarefasPayload, { onConflict: 'id' });
        }
      } catch (errRelational) {
        // Tabela tarefas ainda não criada no Supabase - fallback para chronos_userdata ativo
      }

      if (error) {
        console.warn('Erro no upload para Supabase:', error);
        this.updateStatusUI('error');
      } else {
        this.updateStatusUI('online');
      }
    } catch (err) {
      console.warn('Exceção ao subir dados para Supabase:', err);
      this.updateStatusUI('error');
    } finally {
      this.isSyncing = false;
    }
  }

  async pullFromCloud() {
    if (!this.client || !this.isConfigured) return false;
    const session = this.store.getCurrentSession();
    if (!session || !session.id) return false;

    try {
      this.isSyncing = true;
      this.updateStatusUI('syncing');

      // Tentar carregar da tabela chronos_userdata
      const { data, error } = await this.client
        .from('chronos_userdata')
        .select('*')
        .eq('user_id', session.id)
        .maybeSingle();

      if (error) {
        console.warn('Erro no download do Supabase:', error);
        this.updateStatusUI('error');
        return false;
      }

      if (data) {
        if (Array.isArray(data.tasks)) this.store.saveTasks(data.tasks);
        if (Array.isArray(data.habits)) this.store.saveHabits(data.habits);
        if (Array.isArray(data.reflections)) {
          const prefix = this.store.getUserPrefix();
          localStorage.setItem(prefix + 'reflections', JSON.stringify(data.reflections));
        }
        this.updateStatusUI('online');
        return true;
      } else {
        // Usuário novo na nuvem: envia dados existentes
        await this.pushToCloud();
        return true;
      }
    } catch (err) {
      console.warn('Exceção ao puxar dados da nuvem:', err);
      this.updateStatusUI('error');
      return false;
    } finally {
      this.isSyncing = false;
    }
  }

  queueAutoSync() {
    if (!this.client || !this.isConfigured) return;
    const session = this.store.getCurrentSession();
    if (!session || !session.id) return;

    if (this.syncTimeout) clearTimeout(this.syncTimeout);
    this.syncTimeout = setTimeout(() => {
      this.pushToCloud();
    }, 1500);
  }

  // RECUPERAÇÃO DE SENHA VIA E-MAIL (SUPABASE AUTH)
  async sendPasswordRecoveryEmail(email) {
    if (!this.client || !this.isConfigured) {
      return { success: false, message: 'Supabase não conectado.' };
    }
    try {
      // Redireciona o usuário de volta para a aplicação após clicar no link do e-mail
      const redirectUrl = window.location.origin + window.location.pathname;
      const { data, error } = await this.client.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl
      });
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // ATUALIZAÇÃO DA SENHA DO USUÁRIO NA NUVEM
  async updateUserPassword(newPassword) {
    if (!this.client || !this.isConfigured) {
      return { success: false, message: 'Supabase não conectado.' };
    }
    try {
      const { data, error } = await this.client.auth.updateUser({
        password: newPassword
      });
      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // VALIDAÇÃO DO CÓDIGO NUMÉRICO DE 6 DÍGITOS (OTP) NO SUPABASE
  async verifyRecoveryOtp(email, token) {
    if (!this.client || !this.isConfigured) {
      return { success: false, message: 'Supabase não conectado.' };
    }
    try {
      const cleanToken = token.trim().replace(/\s+/g, '');
      let { data, error } = await this.client.auth.verifyOtp({
        email: email.trim(),
        token: cleanToken,
        type: 'recovery'
      });

      // Fallback para type: 'email' caso configurado com template padrão
      if (error && error.message && (error.message.toLowerCase().includes('type') || error.message.toLowerCase().includes('invalid'))) {
        const res2 = await this.client.auth.verifyOtp({
          email: email.trim(),
          token: cleanToken,
          type: 'email'
        });
        if (!res2.error) {
          data = res2.data;
          error = null;
        }
      }

      if (error) {
        return { success: false, message: error.message };
      }
      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.message };
    }
  }

  // DIAGNÓSTICO EM TEMPO REAL (SUPABASE & VERCEL)
  async runDiagnostic() {
    const config = this.getConfig();
    const result = {
      url: config.url,
      hasKey: !!config.key,
      ping: false,
      latency: 0,
      userdataTable: false,
      tarefasTable: false,
      agendasTable: false,
      canWrite: false,
      timestamp: new Date().toLocaleTimeString()
    };

    if (!config.url || !config.key) return result;

    const t0 = performance.now();
    try {
      const res = await fetch(`${config.url}/rest/v1/chronos_userdata?select=user_id&limit=1`, {
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`
        }
      });
      result.latency = Math.round(performance.now() - t0);
      result.ping = res.ok;
      result.userdataTable = res.ok;
    } catch {
      result.ping = false;
    }

    try {
      const resT = await fetch(`${config.url}/rest/v1/tarefas?limit=1`, {
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`
        }
      });
      result.tarefasTable = resT.ok;
    } catch {}

    try {
      const resA = await fetch(`${config.url}/rest/v1/agendas?limit=1`, {
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`
        }
      });
      result.agendasTable = resA.ok;
    } catch {}

    try {
      const testId = 'diag_write_' + Date.now();
      const testRes = await fetch(`${config.url}/rest/v1/chronos_userdata`, {
        method: 'POST',
        headers: {
          'apikey': config.key,
          'Authorization': `Bearer ${config.key}`,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates'
        },
        body: JSON.stringify({
          user_id: testId,
          tasks: [],
          updated_at: new Date().toISOString()
        })
      });
      if (testRes.ok) {
        result.canWrite = true;
        fetch(`${config.url}/rest/v1/chronos_userdata?user_id=eq.${testId}`, {
          method: 'DELETE',
          headers: {
            'apikey': config.key,
            'Authorization': `Bearer ${config.key}`
          }
        }).catch(() => {});
      }
    } catch {}

    return result;
  }

  updateStatusUI(state = null) {
    const dot = document.getElementById('cloud-status-dot');
    const text = document.getElementById('cloud-status-text');
    const desc = document.getElementById('cloud-status-desc');
    const card = document.getElementById('cloud-status-card');
    const disconnectBtn = document.getElementById('btn-cloud-disconnect');
    const navCloudBtn = document.getElementById('btn-cloud-sync');

    if (!dot || !text) return;

    if (this.isConfigured) {
      if (disconnectBtn) disconnectBtn.style.display = 'inline-flex';
      if (card) {
        card.classList.remove('error');
        card.classList.add('connected');
      }

      if (state === 'syncing') {
        dot.className = 'cloud-status-dot syncing';
        text.textContent = 'Sincronizando com a Nuvem...';
        if (desc) desc.textContent = 'Gravando alterações no seu banco PostgreSQL do Supabase.';
      } else if (state === 'error') {
        dot.className = 'cloud-status-dot';
        dot.style.background = 'var(--accent-rose)';
        dot.style.boxShadow = '0 0 8px var(--accent-rose)';
        if (card) {
          card.classList.remove('connected');
          card.classList.add('error');
        }
        text.textContent = 'Erro ao Sincronizar na Nuvem';
        if (desc) desc.textContent = 'Atenção: Verifique se executou o script SQL no Supabase SQL Editor para criar a tabela.';
      } else {
        dot.className = 'cloud-status-dot online';
        dot.style.background = '';
        dot.style.boxShadow = '';
        text.textContent = '🟢 Nuvem Conectada (Supabase Ativo)';
        if (desc) desc.textContent = 'Seus dados e sessões estão salvos na nuvem e sincronizam em qualquer computador ou celular.';
      }

      if (navCloudBtn) {
        navCloudBtn.style.borderColor = 'var(--accent-emerald)';
        navCloudBtn.style.color = 'var(--accent-emerald)';
      }
    } else {
      if (disconnectBtn) disconnectBtn.style.display = 'none';
      if (card) {
        card.classList.remove('connected', 'error');
      }
      dot.className = 'cloud-status-dot';
      dot.style.background = '';
      dot.style.boxShadow = '';
      text.textContent = '🟡 Modo Local (Armazenado no Navegador)';
      if (desc) desc.textContent = 'Seus dados estão salvos apenas neste navegador. Conecte ao Supabase para acessar a mesma conta em qualquer celular ou computador.';

      if (navCloudBtn) {
        navCloudBtn.style.borderColor = '';
        navCloudBtn.style.color = '';
      }
    }
  }
}

// Instância global do banco local e do gerenciador na nuvem
const store = new ChronosStore();
const chronosCloud = new ChronosCloudManager(store);
window.chronosCloud = chronosCloud;

// ==========================================================================
// MÓDULO: ÁUDIO SINTETIZADO NATIVO (WEB AUDIO API) COM LIMPEZA DE MEMÓRIA
// ==========================================================================
const ChronosAudio = {
  ctx: null,
  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  playSuccessChime() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(587.33, now); // D5
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

      osc2.frequency.setValueAtTime(880, now);
      osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.15); // D6

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.48);
      osc2.stop(now + 0.48);

      // Desconecta e libera nós do Web Audio graph após o término
      setTimeout(() => {
        try {
          osc1.disconnect();
          osc2.disconnect();
          gain.disconnect();
        } catch {}
      }, 550);
    } catch {}
  },
  playPop() {
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') this.ctx.resume();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);

      setTimeout(() => {
        try {
          osc.disconnect();
          gain.disconnect();
        } catch {}
      }, 150);
    } catch {}
  }
};
window.ChronosAudio = ChronosAudio;

// ==========================================================================
// MÓDULO: EXPLOSÃO CELEBRATÓRIA DE CONFETES EM CANVAS (COM LIBERAÇÃO DE VRAM)
// ==========================================================================
let _confettiAnimId = null;
function triggerConfetti(originX, originY) {
  let canvas = document.getElementById('confetti-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'confetti-canvas';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const startX = originX !== undefined ? originX : window.innerWidth / 2;
  const startY = originY !== undefined ? originY : window.innerHeight * 0.4;

  const colors = ['#38bdf8', '#6366f1', '#a855f7', '#10b981', '#fbbf24', '#f43f5e', '#34d399'];
  const particles = [];
  const count = 50;

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 8;
    particles.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3.5,
      size: 4 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12,
      shape: Math.random() > 0.4 ? 'rect' : 'circle',
      gravity: 0.22 + Math.random() * 0.1
    });
  }

  if (_confettiAnimId) {
    cancelAnimationFrame(_confettiAnimId);
    _confettiAnimId = null;
  }

  function updateConfetti() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.rotation += p.rotationSpeed;
      p.alpha -= 0.016;

      if (p.alpha > 0) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }

    if (active) {
      _confettiAnimId = requestAnimationFrame(updateConfetti);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (_confettiAnimId) cancelAnimationFrame(_confettiAnimId);
      _confettiAnimId = null;
      // Libera memória de bitmap da GPU
      canvas.width = 0;
      canvas.height = 0;
      canvas.remove();
    }
  }

  _confettiAnimId = requestAnimationFrame(updateConfetti);
}
window.triggerConfetti = triggerConfetti;

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

// --- RELÓGIO & DATA EM TEMPO REAL COM PREVENÇÃO DE INTERVALOS MÚLTIPLOS ---
let _realtimeClockInterval = null;
function initRealtimeClock() {
  const dateEl = document.getElementById('nav-live-date');
  const timeEl = document.getElementById('nav-live-time');
  const greetingEl = document.getElementById('hero-greeting-text');

  function update() {
    const now = new Date();
    
    // Formata data pt-BR: "Quinta, 24 de Set."
    const optionsDate = { weekday: 'short', day: '2-digit', month: 'short' };
    const dateFormatted = now.toLocaleDateString('pt-BR', optionsDate);
    
    // Formata hora: "19:54"
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
  if (_realtimeClockInterval) {
    clearInterval(_realtimeClockInterval);
  }
  _realtimeClockInterval = setInterval(update, 1000);
}

// --- CONTROLE DO MODAL DE TAREFA ---
let currentEditingTaskId = null;

function openTaskModal(taskId = null, prefillDate = null) {
  const modal = document.getElementById('task-modal');
  if (!modal) return;

  const form = document.getElementById('task-form');
  const modalTitle = document.getElementById('modal-title-text');
  currentEditingTaskId = taskId;

  const todayStr = getLocalDateStr(new Date());
  const dateInput = document.getElementById('task-date-input');

  const recurrenceSelect = document.getElementById('task-recurrence-select');

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
      if (recurrenceSelect) recurrenceSelect.value = task.recurrence || 'none';
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
    if (recurrenceSelect) recurrenceSelect.value = 'none';
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
  const date = (dateInput && dateInput.value) ? dateInput.value : getLocalDateStr(new Date());
  const recurrenceSelect = document.getElementById('task-recurrence-select');
  const recurrence = (recurrenceSelect && recurrenceSelect.value) ? recurrenceSelect.value : 'none';
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
    recurrence,
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

  // 2. Renderizar Timeline do Dia
  renderTimelineSection(tasks);

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

// --- HELPER DE DATAS LOCAIS (FUSO HORÁRIO LOCAL CORRETO) ---
function getLocalDateStr(dateObj = new Date()) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// --- FILTRO DE DATA DA TIMELINE DO DASHBOARD ---
let dashTimelineSelectedDate = getLocalDateStr(new Date());

function switchDashboardTimelineDate(modeOrDate) {
  const today = new Date();
  if (modeOrDate === 'today') {
    dashTimelineSelectedDate = getLocalDateStr(today);
  } else if (modeOrDate === 'tomorrow') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dashTimelineSelectedDate = getLocalDateStr(tomorrow);
  } else if (modeOrDate) {
    dashTimelineSelectedDate = modeOrDate;
  }

  // Atualizar visual dos botões
  const todayStr = getLocalDateStr(new Date());
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = getLocalDateStr(tomorrowObj);

  const btnToday = document.getElementById('btn-timeline-today');
  const btnTomorrow = document.getElementById('btn-timeline-tomorrow');
  const customDateInput = document.getElementById('dash-timeline-custom-date');

  if (btnToday) btnToday.classList.toggle('active', dashTimelineSelectedDate === todayStr);
  if (btnTomorrow) btnTomorrow.classList.toggle('active', dashTimelineSelectedDate === tomorrowStr);
  if (customDateInput) customDateInput.value = dashTimelineSelectedDate;

  renderDashboard();
}

function openTaskModalForCurrentTimeline() {
  openTaskModal(null, dashTimelineSelectedDate);
}

// Verifica se uma tarefa é aplicável a uma data considerando recorrências
function isTaskScheduledForDate(task, dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const targetDate = new Date(y, m - 1, d);
  const dayOfWeek = targetDate.getDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sáb

  const taskDate = task.date || (task.createdAt ? task.createdAt.slice(0, 10) : null);

  // Recorrências:
  if (task.recurrence === 'weekdays') {
    // Segunda (1) a Sexta (5)
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }
  if (task.recurrence === 'daily') {
    // Todos os dias
    return true;
  }
  if (task.recurrence === 'weekend') {
    // Fins de semana (0=Dom, 6=Sáb)
    return dayOfWeek === 0 || dayOfWeek === 6;
  }
  if (task.recurrence === 'weekly' && taskDate) {
    // Mesmo dia da semana em que foi criada
    const [ty, tm, td] = taskDate.split('-').map(Number);
    const originDay = new Date(ty, tm - 1, td).getDay();
    return dayOfWeek === originDay;
  }

  // Sem recorrência (data única)
  if (!task.date) {
    // Legado sem data: exibe apenas no dia de hoje
    const todayStr = getLocalDateStr(new Date());
    return dateStr === todayStr;
  }

  return task.date === dateStr;
}

// 2. Renderizar Timeline do Dia (Manhã, Tarde, Noite)
function renderTimelineSection(tasks) {
  const targetDateStr = dashTimelineSelectedDate || getLocalDateStr(new Date());
  const todayStr = getLocalDateStr(new Date());
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = getLocalDateStr(tomorrowObj);

  // Subtítulo descritivo da data da Timeline
  const subTitleEl = document.getElementById('timeline-subtitle-date');
  if (subTitleEl) {
    const [y, m, d] = targetDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const dateFormatted = dateObj.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    if (targetDateStr === todayStr) {
      subTitleEl.textContent = `Hoje (${dateFormatted}) — Suas atividades diárias e fixas`;
    } else if (targetDateStr === tomorrowStr) {
      subTitleEl.textContent = `Amanhã (${dateFormatted}) — Planejamento antecipado`;
    } else {
      subTitleEl.textContent = `Exibindo atividades de ${dateFormatted}`;
    }
  }

  // Filtrar tarefas aplicáveis para a data selecionada
  const activeTasks = tasks.filter(t => isTaskScheduledForDate(t, targetDateStr));

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

  const morningTasks = activeTasks.filter(t => resolvePeriod(t) === 'manha');
  const afternoonTasks = activeTasks.filter(t => resolvePeriod(t) === 'tarde');
  const nightTasks = activeTasks.filter(t => resolvePeriod(t) === 'noite');

  if (countMorning) countMorning.textContent = morningTasks.length;
  if (countAfternoon) countAfternoon.textContent = afternoonTasks.length;
  if (countNight) countNight.textContent = nightTasks.length;

  if (morningContainer) {
    morningContainer.innerHTML = buildTimelineItemsHtml(morningTasks);
    setupTimelineDropZone(morningContainer, 'manha');
  }
  if (afternoonContainer) {
    afternoonContainer.innerHTML = buildTimelineItemsHtml(afternoonTasks);
    setupTimelineDropZone(afternoonContainer, 'tarde');
  }
  if (nightContainer) {
    nightContainer.innerHTML = buildTimelineItemsHtml(nightTasks);
    setupTimelineDropZone(nightContainer, 'noite');
  }
}

function setupTimelineDropZone(container, period) {
  container.ondragover = (e) => {
    e.preventDefault();
    container.classList.add('drag-over-active');
  };
  container.ondragleave = () => {
    container.classList.remove('drag-over-active');
  };
  container.ondrop = (e) => {
    e.preventDefault();
    container.classList.remove('drag-over-active');
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      store.updateTask(taskId, { period: period });
      if (window.ChronosAudio) window.ChronosAudio.playPop();
      const periodName = period === 'manha' ? 'Manhã' : period === 'tarde' ? 'Tarde' : 'Noite';
      showToast(`Tarefa movida para o período da ${periodName}!`, 'info');
      renderDashboard();
      setupCardMouseGlow();
    }
  };
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

    let recBadge = '';
    if (task.recurrence === 'weekdays') {
      recBadge = `<span class="recurrence-badge" title="Repete toda semana de Segunda a Sexta">🔄 Seg-Sex</span>`;
    } else if (task.recurrence === 'daily') {
      recBadge = `<span class="recurrence-badge" title="Repete todos os dias">🔁 Diário</span>`;
    } else if (task.recurrence === 'weekly') {
      recBadge = `<span class="recurrence-badge" title="Repete toda semana no mesmo dia">📆 Semanal</span>`;
    } else if (task.recurrence === 'weekend') {
      recBadge = `<span class="recurrence-badge" title="Repete nos finais de semana">🏖️ Fim de Semana</span>`;
    }

    return `
      <div class="task-item task-card-draggable ${isCompleted ? 'completed' : ''}" 
           id="timeline-item-${task.id}"
           draggable="true"
           ondragstart="handleDragStart(event, '${task.id}')"
           ondragend="handleDragEnd(event)">
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
              ${recBadge}
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
    const el = document.getElementById(`timeline-item-${id}`);
    if (updated.status === 'done') {
      showToast('Tarefa concluída! Parabéns! 🎉', 'success');
      if (window.ChronosAudio) window.ChronosAudio.playSuccessChime();
      if (el) {
        el.classList.add('task-just-completed');
        const rect = el.getBoundingClientRect();
        triggerConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2);
      } else {
        triggerConfetti();
      }
    } else {
      showToast('Tarefa reaberta.', 'info');
      if (window.ChronosAudio) window.ChronosAudio.playPop();
    }
    setTimeout(() => {
      refreshActivePage();
      setupCardMouseGlow();
    }, 280);
  }
}
window.toggleTask = toggleTask;
window.toggleTaskFromAnywhere = toggleTask;

function deleteTaskItem(id) {
  if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
    store.deleteTask(id);
    if (window.ChronosAudio) window.ChronosAudio.playPop();
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

// Suporte para Drag and Drop Fluido no Kanban
function handleDragStart(e, taskId) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', taskId);
  e.target.classList.add('is-dragging');
}

function handleDragEnd(e) {
  if (e.target) e.target.classList.remove('is-dragging');
  document.querySelectorAll('.kanban-column, .timeline-period-group').forEach(el => {
    el.classList.remove('drag-over-active');
  });
}
window.handleDragStart = handleDragStart;
window.handleDragEnd = handleDragEnd;

function setupKanbanDragDrop() {
  const columns = document.querySelectorAll('.kanban-column');
  columns.forEach(col => {
    col.ondragover = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      col.classList.add('drag-over-active');
    };
    col.ondragleave = () => {
      col.classList.remove('drag-over-active');
    };
    col.ondrop = (e) => {
      e.preventDefault();
      col.classList.remove('drag-over-active');
      const taskId = e.dataTransfer.getData('text/plain');
      const targetStatus = col.dataset.status;
      if (taskId && targetStatus) {
        store.updateTask(taskId, { status: targetStatus });
        if (targetStatus === 'done') {
          showToast('Tarefa concluída! Parabéns! 🎉', 'success');
          if (window.ChronosAudio) window.ChronosAudio.playSuccessChime();
          triggerConfetti(e.clientX, e.clientY);
        } else {
          showToast(`Status atualizado para: ${getStatusLabel(targetStatus)}`, 'info');
          if (window.ChronosAudio) window.ChronosAudio.playPop();
        }
        renderTasksPage();
        setupCardMouseGlow();
      }
    };
  });
}

function moveTask(id, targetStatus) {
  store.updateTask(id, { status: targetStatus });
  if (targetStatus === 'done') {
    showToast('Tarefa concluída! Parabéns! 🎉', 'success');
    if (window.ChronosAudio) window.ChronosAudio.playSuccessChime();
    triggerConfetti();
  } else {
    showToast(`Tarefa movida para: ${getStatusLabel(targetStatus)}`, 'info');
    if (window.ChronosAudio) window.ChronosAudio.playPop();
  }
  renderTasksPage();
  setupCardMouseGlow();
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
// MÓDULO: TEMAS VISUAIS & MODO ESCURO / CLARO NATIVO
// ==========================================================================
function initThemeMode() {
  const savedMode = localStorage.getItem('chronos_mode') || 
    (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  setThemeMode(savedMode, false);
}

function toggleDarkLightMode() {
  const current = document.documentElement.getAttribute('data-mode') || 'dark';
  const newMode = current === 'dark' ? 'light' : 'dark';
  setThemeMode(newMode, true);
  if (window.ChronosAudio) window.ChronosAudio.playPop();
}

function setThemeMode(mode, showNotice = true) {
  document.documentElement.setAttribute('data-mode', mode);
  localStorage.setItem('chronos_mode', mode);

  const iconSun = document.getElementById('theme-toggle-icon-sun');
  const iconMoon = document.getElementById('theme-toggle-icon-moon');
  if (iconSun && iconMoon) {
    if (mode === 'light') {
      iconSun.style.display = 'none';
      iconMoon.style.display = 'block';
    } else {
      iconSun.style.display = 'block';
      iconMoon.style.display = 'none';
    }
  }

  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', mode === 'light' ? '#f8fafc' : '#090d16');
  }

  if (showNotice) {
    showToast(`Modo ${mode === 'light' ? 'Claro ☀️' : 'Escuro 🌙'} ativado!`, 'info');
  }
}
window.initThemeMode = initThemeMode;
window.toggleDarkLightMode = toggleDarkLightMode;
window.setThemeMode = setThemeMode;

function initThemePicker() {
  const current = store.getTheme();
  document.documentElement.setAttribute('data-theme', current);
  document.documentElement.setAttribute('data-accent', current);
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.theme === current);
  });
}

function switchTheme(theme) {
  store.setTheme(theme);
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-accent', theme);
  document.querySelectorAll('.theme-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.theme === theme);
  });
  if (window.ChronosAudio) window.ChronosAudio.playPop();
  showToast(`Cor de destaque: ${theme.toUpperCase()}`, 'info');
}
window.initThemePicker = initThemePicker;
window.switchTheme = switchTheme;

// Mouse follower glow nos cards interativos com Event Delegation única e RAF Throttling
let _mouseGlowDelegated = false;
function setupCardMouseGlow() {
  if (_mouseGlowDelegated) return;
  _mouseGlowDelegated = true;

  let rafGlow = null;
  document.addEventListener('mousemove', (e) => {
    if (rafGlow) return;
    rafGlow = requestAnimationFrame(() => {
      rafGlow = null;
      const target = e.target;
      if (!target || !target.closest) return;
      const card = target.closest('.card, .task-item, .kanban-card, .welcome-card, .calendar-card, .stat-card');
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
      }
    });
  }, { passive: true });
}
window.setupCardMouseGlow = setupCardMouseGlow;

// DIAGNÓSTICO EM TEMPO REAL SUPABASE NO MODAL
async function runLiveCloudDiagnostic() {
  const btn = document.getElementById('btn-run-cloud-diag');
  const pingBadge = document.getElementById('diag-ping-badge');
  const userdataBadge = document.getElementById('diag-userdata-badge');
  const tarefasBadge = document.getElementById('diag-tarefas-badge');
  const agendasBadge = document.getElementById('diag-agendas-badge');

  if (btn) {
    btn.disabled = true;
    btn.textContent = '⏳ Executando Diagnóstico...';
  }

  showToast('Iniciando teste de conectividade e tabelas...', 'info');
  const diag = await chronosCloud.runDiagnostic();

  if (pingBadge) {
    if (diag.ping) {
      pingBadge.className = 'diag-badge ok';
      pingBadge.textContent = `🟢 Online (${diag.latency}ms)`;
    } else {
      pingBadge.className = 'diag-badge error';
      pingBadge.textContent = `🔴 Offline (Sem resposta)`;
    }
  }

  if (userdataBadge) {
    if (diag.userdataTable && diag.canWrite) {
      userdataBadge.className = 'diag-badge ok';
      userdataBadge.textContent = `🟢 Ativa (Leitura & Escrita OK)`;
    } else if (diag.userdataTable) {
      userdataBadge.className = 'diag-badge ok';
      userdataBadge.textContent = `🟢 Conectada (Leitura OK)`;
    } else {
      userdataBadge.className = 'diag-badge warn';
      userdataBadge.textContent = `🟡 Não detectada`;
    }
  }

  if (tarefasBadge) {
    if (diag.tarefasTable) {
      tarefasBadge.className = 'diag-badge ok';
      tarefasBadge.textContent = `🟢 Criada & Mapeada`;
    } else {
      tarefasBadge.className = 'diag-badge warn';
      tarefasBadge.textContent = `🟡 Pronta no SQL (Fallback Ativo)`;
    }
  }

  if (agendasBadge) {
    if (diag.agendasTable) {
      agendasBadge.className = 'diag-badge ok';
      agendasBadge.textContent = `🟢 Criada & Mapeada`;
    } else {
      agendasBadge.className = 'diag-badge warn';
      agendasBadge.textContent = `🟡 Pronta no SQL (Fallback Ativo)`;
    }
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = '🔄 Repetir Teste';
  }

  if (diag.ping) {
    showToast(`Diagnóstico concluído! Latência: ${diag.latency}ms. Banco 100% pronto!`, 'success');
    if (window.ChronosAudio) window.ChronosAudio.playSuccessChime();
  } else {
    showToast('Falha ao conectar com o Supabase. Verifique a URL e Chave.', 'error');
  }
}
window.runLiveCloudDiagnostic = runLiveCloudDiagnostic;

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
// MÓDULO: GERENCIAMENTO DE AUTENTICAÇÃO & RECUPERAÇÃO DE SENHA (COM CÓDIGO OTP)
// ==========================================================================
let currentAuthTab = 'login'; // 'login' | 'register' | 'forgot'
let recoveryStep = 1; // 1 = solicitar código | 2 = validar código de 6 dígitos
let pendingRecoveryEmail = '';
let currentResetEmail = null;

function openAuthModal(tab = 'login') {
  if (tab !== 'forgot') recoveryStep = 1;
  setAuthTab(tab);
  const modal = document.getElementById('auth-modal');
  if (modal) {
    modal.classList.add('open');
    const errBox = document.getElementById('auth-error-box');
    const succBox = document.getElementById('auth-success-box');
    if (errBox) errBox.style.display = 'none';
    if (succBox) succBox.style.display = 'none';
  }
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('open');
}

function resetRecoveryFlow() {
  recoveryStep = 1;
  setAuthTab('forgot');
  const emailInput = document.getElementById('auth-email-input');
  if (emailInput) {
    emailInput.disabled = false;
    emailInput.focus();
  }
}

async function resendRecoveryCode() {
  if (!pendingRecoveryEmail) return;
  showToast('Reenviando código de 6 dígitos...', 'info');
  if (chronosCloud && chronosCloud.isConfigured && chronosCloud.client) {
    const res = await chronosCloud.sendPasswordRecoveryEmail(pendingRecoveryEmail);
    if (res.success) {
      showToast('Novo código enviado para seu e-mail!', 'success');
      if (window.ChronosAudio) window.ChronosAudio.playPop();
    } else {
      showAuthError('Erro ao reenviar: ' + res.message);
    }
  } else {
    showToast('Novo código gerado!', 'success');
  }
}

function setAuthTab(tab) {
  currentAuthTab = tab;
  document.getElementById('auth-tab-login')?.classList.toggle('active', tab === 'login');
  document.getElementById('auth-tab-register')?.classList.toggle('active', tab === 'register');
  document.getElementById('auth-tab-forgot')?.classList.toggle('active', tab === 'forgot');
  
  const nameField = document.getElementById('auth-name-group');
  const emailGroup = document.getElementById('auth-email-group');
  const emailInput = document.getElementById('auth-email-input');
  const passwordGroup = document.getElementById('auth-password-group');
  const passwordInput = document.getElementById('auth-password-input');
  const otpGroup = document.getElementById('auth-otp-group');
  const forgotInfo = document.getElementById('auth-forgot-info');
  const submitBtn = document.getElementById('auth-submit-btn');
  const modalTitle = document.getElementById('auth-modal-title');
  const errorBox = document.getElementById('auth-error-box');
  const successBox = document.getElementById('auth-success-box');
  const altActionText = document.getElementById('auth-alt-action-text');

  if (errorBox) errorBox.style.display = 'none';
  if (successBox) successBox.style.display = 'none';

  if (tab === 'login') {
    recoveryStep = 1;
    if (nameField) nameField.style.display = 'none';
    if (emailGroup) emailGroup.style.display = 'block';
    if (emailInput) emailInput.disabled = false;
    if (passwordGroup) passwordGroup.style.display = 'block';
    if (passwordInput) passwordInput.required = true;
    if (otpGroup) otpGroup.style.display = 'none';
    if (forgotInfo) forgotInfo.style.display = 'none';
    if (submitBtn) submitBtn.textContent = 'Entrar na Conta';
    if (modalTitle) modalTitle.textContent = 'Acessar sua Conta';
    if (altActionText) altActionText.innerHTML = 'Não tem conta? <a href="javascript:void(0)" onclick="setAuthTab(\'register\')" style="color:var(--accent-cyan); font-weight:600;">Criar agora</a>';
  } else if (tab === 'register') {
    recoveryStep = 1;
    if (nameField) nameField.style.display = 'block';
    if (emailGroup) emailGroup.style.display = 'block';
    if (emailInput) emailInput.disabled = false;
    if (passwordGroup) passwordGroup.style.display = 'block';
    if (passwordInput) passwordInput.required = true;
    if (otpGroup) otpGroup.style.display = 'none';
    if (forgotInfo) forgotInfo.style.display = 'none';
    if (submitBtn) submitBtn.textContent = 'Criar Conta Gratuita';
    if (modalTitle) modalTitle.textContent = 'Cadastrar Nova Conta';
    if (altActionText) altActionText.innerHTML = 'Já possui conta? <a href="javascript:void(0)" onclick="setAuthTab(\'login\')" style="color:var(--accent-cyan); font-weight:600;">Entrar</a>';
  } else if (tab === 'forgot') {
    if (nameField) nameField.style.display = 'none';
    if (passwordGroup) passwordGroup.style.display = 'none';
    if (passwordInput) passwordInput.required = false;

    if (recoveryStep === 1) {
      if (emailGroup) emailGroup.style.display = 'block';
      if (emailInput) emailInput.disabled = false;
      if (otpGroup) otpGroup.style.display = 'none';
      if (forgotInfo) {
        forgotInfo.style.display = 'block';
        forgotInfo.innerHTML = '<strong>✉️ Recuperação com Código de 6 Dígitos:</strong><br>Digite seu e-mail cadastrado. Enviaremos um código numérico de 6 dígitos para você redefinir sua senha com facilidade, sem depender de links externos.';
      }
      if (submitBtn) submitBtn.textContent = '📧 Enviar Código de 6 Dígitos';
      if (modalTitle) modalTitle.textContent = 'Recuperar Senha por Código';
    } else {
      // recoveryStep === 2
      if (emailGroup) emailGroup.style.display = 'block';
      if (emailInput) {
        emailInput.value = pendingRecoveryEmail;
        emailInput.disabled = true;
      }
      if (otpGroup) otpGroup.style.display = 'block';
      if (forgotInfo) {
        forgotInfo.style.display = 'block';
        forgotInfo.innerHTML = `<strong>📬 Código enviado para seu e-mail!</strong><br>Localize o código de 6 dígitos que enviamos para <strong>${escapeHtml(pendingRecoveryEmail)}</strong> (cheque a caixa de entrada e spam) e digite abaixo:`;
      }
      if (submitBtn) submitBtn.textContent = '🔐 Validar Código e Redefinir';
      if (modalTitle) modalTitle.textContent = 'Inserir Código de Verificação';
      setTimeout(() => document.getElementById('auth-otp-input')?.focus(), 150);
    }
    if (altActionText) altActionText.innerHTML = 'Lembrou sua senha? <a href="javascript:void(0)" onclick="setAuthTab(\'login\')" style="color:var(--accent-cyan); font-weight:600;">Voltar ao Login</a>';
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('auth-email-input');
  const passwordInput = document.getElementById('auth-password-input');
  const otpInput = document.getElementById('auth-otp-input');
  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';
  const otpCode = otpInput ? otpInput.value.trim().replace(/\D/g, '') : '';
  const errorBox = document.getElementById('auth-error-box');
  const successBox = document.getElementById('auth-success-box');
  const submitBtn = document.getElementById('auth-submit-btn');

  if (errorBox) errorBox.style.display = 'none';
  if (successBox) successBox.style.display = 'none';

  // --- ABA RECUPERAR SENHA (FLUXO EM 2 ETAPAS COM CÓDIGO) ---
  if (currentAuthTab === 'forgot') {
    if (recoveryStep === 1) {
      if (!email) {
        showAuthError('Por favor, informe seu endereço de e-mail cadastrado.');
        return;
      }

      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando código...';
      }

      try {
        if (chronosCloud && chronosCloud.isConfigured && chronosCloud.client) {
          const res = await chronosCloud.sendPasswordRecoveryEmail(email);
          if (!res.success) {
            showAuthError('Falha ao enviar e-mail: ' + res.message);
            return;
          }
          pendingRecoveryEmail = email;
          recoveryStep = 2;
          setAuthTab('forgot');
          showAuthSuccess(`✅ Código de verificação enviado para <strong>${escapeHtml(email)}</strong>!<br>Copie o código numérico de 6 dígitos recebido por e-mail e digite abaixo:`);
          if (window.ChronosAudio) window.ChronosAudio.playPop();
          showToast('Código enviado para seu e-mail!', 'success');
        } else {
          // Modo local
          const localUsers = store.getRegisteredUsers();
          const user = localUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
          if (!user) {
            showAuthError('Nenhuma conta local encontrada com este e-mail.');
            return;
          }
          const mockCode = String(Math.floor(100000 + Math.random() * 900000));
          localStorage.setItem('chronos_mock_otp_' + email.toLowerCase(), mockCode);
          pendingRecoveryEmail = email;
          recoveryStep = 2;
          setAuthTab('forgot');
          showAuthSuccess(`✅ Código local gerado para teste: <strong style="font-size:1.15rem; color:var(--accent-cyan); letter-spacing:2px;">${mockCode}</strong><br>Digite este código abaixo para prosseguir.`);
          if (window.ChronosAudio) window.ChronosAudio.playPop();
          showToast(`Código de teste: ${mockCode}`, 'info');
        }
      } catch (err) {
        showAuthError('Erro ao solicitar código: ' + err.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
      return;
    } else {
      // recoveryStep === 2: Validação do código OTP de 6 dígitos
      if (!otpCode || otpCode.length < 6) {
        showAuthError('Por favor, digite o código numérico de 6 dígitos recebido por e-mail.');
        return;
      }

      const originalText = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Validando código...';
      }

      try {
        if (chronosCloud && chronosCloud.isConfigured && chronosCloud.client) {
          const res = await chronosCloud.verifyRecoveryOtp(pendingRecoveryEmail, otpCode);
          if (!res.success) {
            showAuthError('Código inválido ou expirado. Verifique os números ou clique em "Reenviar código".');
            return;
          }

          showToast('Código validado com sucesso! Crie sua nova senha.', 'success');
          if (window.ChronosAudio) window.ChronosAudio.playSuccessChime();
          closeAuthModal();
          recoveryStep = 1;
          openResetPasswordModal(pendingRecoveryEmail);
        } else {
          // Validação local
          const savedMockCode = localStorage.getItem('chronos_mock_otp_' + pendingRecoveryEmail.toLowerCase());
          if (savedMockCode !== otpCode) {
            showAuthError('Código incorreto. Digite o código de 6 dígitos gerado.');
            return;
          }
          localStorage.removeItem('chronos_mock_otp_' + pendingRecoveryEmail.toLowerCase());
          showToast('Código validado com sucesso! Crie sua nova senha.', 'success');
          if (window.ChronosAudio) window.ChronosAudio.playSuccessChime();
          closeAuthModal();
          recoveryStep = 1;
          openResetPasswordModal(pendingRecoveryEmail);
        }
      } catch (err) {
        showAuthError('Erro ao validar código: ' + err.message);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      }
      return;
    }
  }

  // --- VALIDAÇÕES DE LOGIN E CADASTRO ---
  if (!email || !password) {
    showAuthError('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  if (password.length < 6) {
    showAuthError('A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  // --- SE ESTIVER CONECTADO AO SUPABASE ---
  if (chronosCloud && chronosCloud.isConfigured && chronosCloud.client) {
    const originalText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processando na nuvem...';
    }

    try {
      if (currentAuthTab === 'register') {
        const name = document.getElementById('auth-name-input').value.trim();
        if (!name) {
          showAuthError('Por favor, informe seu nome completo ou apelido.');
          return;
        }

        const { data, error } = await chronosCloud.client.auth.signUp({
          email: email,
          password: password,
          options: { data: { name: name } }
        });

        if (error) {
          showAuthError(error.message);
          return;
        }

        const userObj = {
          id: data.user.id,
          name: name,
          email: email,
          isCloud: true
        };
        store.setCurrentSession(userObj);
        await chronosCloud.pushToCloud();
        showToast(`Bem-vindo(a), ${name}! Conta criada na nuvem com sucesso.`, 'success');
        closeAuthModal();
        updateUserSessionUI();
        refreshActivePage();
        triggerConfetti();
      } else {
        const { data, error } = await chronosCloud.client.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) {
          showAuthError('E-mail ou senha incorretos na nuvem Supabase.');
          return;
        }

        const u = data.user;
        const userName = u.user_metadata?.name || email.split('@')[0];
        const userObj = {
          id: u.id,
          name: userName,
          email: u.email,
          isCloud: true
        };
        store.setCurrentSession(userObj);
        await chronosCloud.pullFromCloud();
        showToast(`Olá novamente, ${userName}! Dados sincronizados da nuvem.`, 'success');
        closeAuthModal();
        updateUserSessionUI();
        refreshActivePage();
      }
    } catch (err) {
      showAuthError('Falha de conexão com a nuvem: ' + err.message);
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    }
    return;
  }

  // --- SE ESTIVER EM MODO LOCAL ---
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

    showToast(`Bem-vindo(a), ${res.user.name}! Conta criada localmente. (Clique em ☁️ para nuvem)`, 'success');
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

    showToast(`Olá novamente, ${res.user.name}! Login local realizado.`, 'success');
    closeAuthModal();
    updateUserSessionUI();
    refreshActivePage();
  }
}

function showAuthError(msg) {
  const errorBox = document.getElementById('auth-error-box');
  const successBox = document.getElementById('auth-success-box');
  if (successBox) successBox.style.display = 'none';
  if (errorBox) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
  }
}

function showAuthSuccess(htmlMsg) {
  const successBox = document.getElementById('auth-success-box');
  const errorBox = document.getElementById('auth-error-box');
  if (errorBox) errorBox.style.display = 'none';
  if (successBox) {
    successBox.innerHTML = htmlMsg;
    successBox.style.display = 'block';
  }
}

// ==========================================================================
// MÓDULO: REDEFINIÇÃO DE SENHA (MODAL & FORÇA DE SENHA)
// ==========================================================================
function openResetPasswordModal(email = null) {
  currentResetEmail = email;
  const modal = document.getElementById('reset-password-modal');
  if (modal) {
    modal.classList.add('open');
    const errBox = document.getElementById('reset-error-box');
    if (errBox) errBox.style.display = 'none';
    const form = document.getElementById('reset-password-form');
    if (form) form.reset();
    const bar = document.getElementById('reset-strength-bar');
    const text = document.getElementById('reset-strength-text');
    if (bar) bar.style.width = '0%';
    if (text) text.textContent = '';
  }
}

function closeResetPasswordModal() {
  const modal = document.getElementById('reset-password-modal');
  if (modal) modal.classList.remove('open');
  currentResetEmail = null;
}

function checkResetPasswordStrength(password) {
  const bar = document.getElementById('reset-strength-bar');
  const text = document.getElementById('reset-strength-text');
  if (!bar || !text) return;

  if (!password) {
    bar.style.width = '0%';
    text.textContent = '';
    return;
  }

  let score = 0;
  if (password.length >= 6) score += 25;
  if (password.length >= 10) score += 25;
  if (/[A-Z]/.test(password)) score += 20;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;

  bar.style.width = `${Math.min(100, score)}%`;

  if (score < 40) {
    bar.style.background = 'var(--accent-rose)';
    text.textContent = 'Fraca';
    text.style.color = 'var(--accent-rose)';
  } else if (score < 75) {
    bar.style.background = 'var(--accent-amber)';
    text.textContent = 'Média';
    text.style.color = 'var(--accent-amber)';
  } else {
    bar.style.background = 'var(--accent-emerald)';
    text.textContent = 'Forte';
    text.style.color = 'var(--accent-emerald)';
  }
}

async function handleResetPasswordSubmit(e) {
  e.preventDefault();
  const newPass = document.getElementById('reset-new-password').value;
  const confirmPass = document.getElementById('reset-confirm-password').value;
  const submitBtn = document.getElementById('btn-submit-reset-password');

  if (!newPass || !confirmPass) {
    showResetError('Por favor, preencha todos os campos obrigatórios.');
    return;
  }

  if (newPass.length < 6) {
    showResetError('A nova senha deve conter pelo menos 6 caracteres.');
    return;
  }

  if (newPass !== confirmPass) {
    showResetError('As senhas digitadas não coincidem.');
    return;
  }

  const originalText = submitBtn ? submitBtn.textContent : '';
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Gravando nova senha...';
  }

  try {
    if (chronosCloud && chronosCloud.isConfigured && chronosCloud.client) {
      const res = await chronosCloud.updateUserPassword(newPass);
      if (!res.success) {
        showResetError(res.message);
        return;
      }
      showToast('🎉 Senha redefinida na nuvem com sucesso!', 'success');
    } else if (currentResetEmail) {
      const res = store.updateUserPassword(currentResetEmail, newPass);
      if (!res.success) {
        showResetError(res.message);
        return;
      }
      showToast('🎉 Senha local redefinida com sucesso!', 'success');
    } else {
      showResetError('Sessão expirada. Solicite um novo link de recuperação por e-mail.');
      return;
    }

    if (window.ChronosAudio) window.ChronosAudio.playSuccessChime();
    triggerConfetti();
    closeResetPasswordModal();
    updateUserSessionUI();
    refreshActivePage();
  } catch (err) {
    showResetError('Falha ao atualizar senha: ' + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  }
}

function showResetError(msg) {
  const errBox = document.getElementById('reset-error-box');
  if (errBox) {
    errBox.textContent = msg;
    errBox.style.display = 'block';
  }
}

async function handleUserLogout() {
  if (confirm('Deseja realmente sair da sua conta?')) {
    if (chronosCloud && chronosCloud.isConfigured && chronosCloud.client) {
      try {
        await chronosCloud.client.auth.signOut();
      } catch (err) {
        console.warn('Erro ao deslogar do Supabase:', err);
      }
    }
    store.logoutUser();
    showToast('Você saiu da sua conta.', 'info');
    updateUserSessionUI();
    refreshActivePage();
  }
}

// ==========================================================================
// FUNÇÕES DE INTERFACE: MODAL DE NUVEM & BACKUP
// ==========================================================================
function openCloudModal() {
  const modal = document.getElementById('cloud-modal');
  if (!modal) return;

  const config = chronosCloud.getConfig();
  const urlInput = document.getElementById('cloud-supabase-url');
  const keyInput = document.getElementById('cloud-supabase-key');

  if (urlInput && config) urlInput.value = config.url || '';
  if (keyInput && config) keyInput.value = config.key || '';

  // Verificar se há conta local para oferecer migração imediata
  const migrateCard = document.getElementById('cloud-migrate-card');
  const migrateEmail = document.getElementById('migrate-user-email');
  const session = store.getCurrentSession();
  const localUsers = store.getRegisteredUsers();

  if (migrateCard) {
    if (session && !session.isCloud) {
      migrateCard.style.display = 'block';
      if (migrateEmail) migrateEmail.textContent = session.email || session.name;
    } else if (!session && localUsers.length > 0) {
      migrateCard.style.display = 'block';
      if (migrateEmail) migrateEmail.textContent = localUsers[localUsers.length - 1].email;
    } else {
      migrateCard.style.display = 'none';
    }
  }

  chronosCloud.updateStatusUI();
  modal.classList.add('open');
}

async function migrateLocalAccountToCloud() {
  if (!chronosCloud.isConfigured || !chronosCloud.client) {
    showToast('Configure a URL e a Anon Key do Supabase acima e clique em "Salvar & Conectar" primeiro.', 'error');
    return;
  }

  const localUsers = store.getRegisteredUsers();
  let session = store.getCurrentSession();
  let localUser = null;

  if (session && !session.isCloud) {
    localUser = localUsers.find(u => u.id === session.id || u.email === session.email);
  }
  if (!localUser && localUsers.length > 0) {
    localUser = localUsers[localUsers.length - 1];
  }

  if (!localUser) {
    showToast('Nenhum cadastro local encontrado para migrar.', 'error');
    return;
  }

  let rawPassword = '';
  try {
    rawPassword = atob(localUser.password);
  } catch (e) {
    rawPassword = '';
  }

  if (!rawPassword) {
    const promptPass = prompt(`Digite a senha da conta ${localUser.email} para salvar na nuvem:`);
    if (!promptPass) return;
    rawPassword = promptPass;
  }

  showToast('Migrando conta e tarefas para o Supabase...', 'info');

  try {
    const { data, error } = await chronosCloud.client.auth.signUp({
      email: localUser.email,
      password: rawPassword,
      options: { data: { name: localUser.name } }
    });

    let userId = data?.user?.id;

    if (error) {
      const loginRes = await chronosCloud.client.auth.signInWithPassword({
        email: localUser.email,
        password: rawPassword
      });
      if (loginRes.error) {
        showToast('Erro ao criar conta na nuvem: ' + (error.message || loginRes.error.message), 'error');
        return;
      }
      userId = loginRes.data.user.id;
    }

    if (!userId) {
      showToast('Conta criada! Verifique se seu projeto do Supabase exige confirmação de e-mail.', 'info');
      return;
    }

    const newSession = {
      id: userId,
      name: localUser.name,
      email: localUser.email,
      isCloud: true
    };
    store.setCurrentSession(newSession);

    // Envia todas as tarefas, hábitos e reflexões locais para a nuvem
    await chronosCloud.pushToCloud();

    showToast(`Parabéns! Sua conta (${localUser.email}) e suas tarefas foram migradas para a nuvem!`, 'success');
    closeCloudModal();
    updateUserSessionUI();
    refreshActivePage();
    triggerConfetti();
  } catch (err) {
    showToast('Falha na migração: ' + err.message, 'error');
  }
}

function closeCloudModal() {
  const modal = document.getElementById('cloud-modal');
  if (modal) modal.classList.remove('open');
}

async function saveCloudConfig() {
  const urlInput = document.getElementById('cloud-supabase-url');
  const keyInput = document.getElementById('cloud-supabase-key');

  const url = urlInput ? urlInput.value.trim() : '';
  const key = keyInput ? keyInput.value.trim() : '';

  if (!url || !key) {
    showToast('Preencha a URL e a Anon Key do Supabase.', 'error');
    return;
  }

  if (!url.startsWith('http')) {
    showToast('A URL deve começar com https://', 'error');
    return;
  }

  chronosCloud.setConfig(url, key);

  if (chronosCloud.isConfigured) {
    showToast('Conectando ao Supabase...', 'info');
    const session = store.getCurrentSession();
    if (session) {
      await chronosCloud.pushToCloud();
    }
    showToast('Nuvem Supabase conectada com sucesso!', 'success');
  } else {
    showToast('Não foi possível conectar. Verifique as credenciais.', 'error');
  }
}

function disconnectCloudConfig() {
  if (confirm('Deseja desconectar da nuvem Supabase? Os dados continuarão salvos no navegador.')) {
    chronosCloud.setConfig('', '');
    const urlInput = document.getElementById('cloud-supabase-url');
    const keyInput = document.getElementById('cloud-supabase-key');
    if (urlInput) urlInput.value = '';
    if (keyInput) keyInput.value = '';
    showToast('Nuvem desconectada. Modo local ativo.', 'info');
  }
}

async function triggerManualCloudSync() {
  if (!chronosCloud.isConfigured) {
    showToast('Configure a URL e a Anon Key do Supabase primeiro.', 'error');
    return;
  }
  showToast('Sincronizando com a nuvem...', 'info');
  await chronosCloud.pushToCloud();
  await chronosCloud.pullFromCloud();
  refreshActivePage();
  showToast('Sincronização concluída com sucesso!', 'success');
}

function copyCloudSql() {
  const sql = `create table if not exists chronos_userdata (
  user_id text primary key,
  tasks jsonb default '[]'::jsonb,
  habits jsonb default '[]'::jsonb,
  reflections jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);
alter table chronos_userdata enable row level security;
create policy "Allow all operations for users" on chronos_userdata for all using (true) with check (true);`;

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(sql).then(() => {
      showToast('Código SQL copiado! Cole no SQL Editor do Supabase.', 'success');
    }).catch(() => {
      fallbackCopyText(sql);
    });
  } else {
    fallbackCopyText(sql);
  }
}

function fallbackCopyText(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
  showToast('Código SQL copiado para a área de transferência!', 'success');
}

function exportBackupFile() {
  const dataStr = store.exportBackupData();
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `chronos_backup_${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Backup (.json) baixado com sucesso! Guarde seu arquivo.', 'success');
}

function importBackupFromFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const content = e.target.result;
    const success = store.importBackupData(content);
    if (success) {
      showToast('Backup restaurado com sucesso!', 'success');
      closeCloudModal();
      refreshActivePage();
      if (chronosCloud && chronosCloud.isConfigured) {
        chronosCloud.pushToCloud();
      }
    } else {
      showToast('Arquivo de backup inválido ou corrompido.', 'error');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
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

  // Helper para obter tarefas de um dia específico (considerando tarefas fixas / recorrentes)
  function getTasksForDate(dStr) {
    return tasks.filter(t => isTaskScheduledForDate(t, dStr));
  }

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
      const dayTasks = getTasksForDate(dStr);
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
      const dayTasks = getTasksForDate(dStr);

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
      const dayTasks = getTasksForDate(dStr);
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
  renderCalendarSelectedDayPanel(getTasksForDate(calendarSelectedDateStr));
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

  const dayTasks = Array.isArray(tasksByDate) ? tasksByDate : (tasksByDate[calendarSelectedDateStr] || []);
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
  initThemeMode();
  initThemePicker();
  setupKeyboardShortcuts();
  registerServiceWorker();
  Pomodoro.init();
  setupCardMouseGlow();

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

    const cloudModal = document.getElementById('cloud-modal');
    if (e.target === cloudModal) closeCloudModal();

    const authModal = document.getElementById('auth-modal');
    if (e.target === authModal) closeAuthModal();

    const resetModal = document.getElementById('reset-password-modal');
    if (e.target === resetModal) closeResetPasswordModal();
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

  // Listener do form de redefinição de senha
  const resetForm = document.getElementById('reset-password-form');
  if (resetForm) {
    resetForm.addEventListener('submit', handleResetPasswordSubmit);
  }

  // Atualizar estado de sessão do usuário
  updateUserSessionUI();

  // Inicializar e checar nuvem Supabase
  if (window.chronosCloud) {
    window.chronosCloud.updateStatusUI();
    window.chronosCloud.checkInitialSession();
  }

  // Checar se o usuário abriu a página vindo de um link de recuperação de e-mail do Supabase
  if (window.location.hash.includes('type=recovery') || window.location.hash.includes('access_token')) {
    setTimeout(() => {
      openResetPasswordModal();
    }, 450);
  }

  // Render inicial de acordo com a página atual
  refreshActivePage();
  setupCardMouseGlow();
});

// ==========================================================================
// EXPORTAÇÃO GLOBAL EXPLÍCITA PARA BOTÕES E MICRO-INTERAÇÕES
// ==========================================================================
window.store = store;
window.chronosCloud = chronosCloud;
window.Pomodoro = Pomodoro;
window.ChronosAudio = ChronosAudio;
window.triggerConfetti = triggerConfetti;
window.showToast = showToast;
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;
window.openHabitModal = openHabitModal;
window.closeHabitModal = closeHabitModal;
window.openShortcutsModal = openShortcutsModal;
window.closeShortcutsModal = closeShortcutsModal;
window.openCloudModal = openCloudModal;
window.closeCloudModal = closeCloudModal;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.setAuthTab = setAuthTab;
window.openResetPasswordModal = openResetPasswordModal;
window.closeResetPasswordModal = closeResetPasswordModal;
window.checkResetPasswordStrength = checkResetPasswordStrength;
window.handleResetPasswordSubmit = handleResetPasswordSubmit;
window.resendRecoveryCode = resendRecoveryCode;
window.resetRecoveryFlow = resetRecoveryFlow;
window.handleUserLogout = handleUserLogout;
window.migrateLocalAccountToCloud = migrateLocalAccountToCloud;
window.toggleDarkLightMode = toggleDarkLightMode;
window.switchTheme = switchTheme;
window.toggleMobileMenu = toggleMobileMenu;
window.toggleTask = toggleTask;
window.toggleTaskFromAnywhere = toggleTask;
window.deleteTaskItem = deleteTaskItem;
window.deleteTaskFromAnywhere = deleteTaskItem;
window.handleToggleHabit = handleToggleHabit;
window.handleDeleteHabit = handleDeleteHabit;
window.toggleHabitFromDash = toggleHabitFromDash;
window.saveReflection = saveReflection;
window.selectMood = selectMood;
window.changeCalendarMonth = changeCalendarMonth;
window.resetCalendarToToday = resetCalendarToToday;
window.selectCalendarDay = selectCalendarDay;
window.openTaskModalForDate = openTaskModalForDate;
window.openTaskModalForCurrentTimeline = openTaskModalForCurrentTimeline;
window.switchDashboardTimelineDate = switchDashboardTimelineDate;
window.setViewMode = setViewMode;
window.moveTask = moveTask;
window.cycleTaskStatus = cycleTaskStatus;
window.addMemorySubtask = addMemorySubtask;
window.removeMemorySubtask = removeMemorySubtask;
window.toggleMemorySubtask = toggleMemorySubtask;
window.exportUserDataBackup = exportUserDataBackup;
window.importUserDataBackup = importUserDataBackup;
window.exportBackupFile = exportBackupFile;
window.importBackupFromFile = importBackupFromFile;
window.resetAllDataFactory = resetAllDataFactory;
window.saveCloudConfig = saveCloudConfig;
window.disconnectCloudConfig = disconnectCloudConfig;
window.triggerManualCloudSync = triggerManualCloudSync;
window.runLiveCloudDiagnostic = runLiveCloudDiagnostic;
window.copyCloudSql = copyCloudSql;
window.requestNotificationPermission = requestNotificationPermission;
window.handleDragStart = handleDragStart;
window.handleDragEnd = handleDragEnd;
window.setupCardMouseGlow = setupCardMouseGlow;


