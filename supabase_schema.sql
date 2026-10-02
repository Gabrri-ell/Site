-- ============================================================================
-- CHRONOS - SUPABASE SQL SCHEMA MIGRATION
-- Mapeamento completo de Tabelas: TAREFAS, AGENDAS e CHRONOS_USERDATA
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard)
-- ============================================================================

-- 1. TABELA DE TAREFAS (Tasks Relacional)
create table if not exists public.tarefas (
  id text primary key,
  user_id text not null,
  title text not null,
  description text default '',
  time text default '09:00',
  period text default 'manha',             -- 'manha', 'tarde', 'noite'
  category text default 'trabalho',        -- 'trabalho', 'estudos', 'lazer', 'saude', 'pessoal'
  priority text default 'media',           -- 'baixa', 'media', 'alta'
  status text default 'todo',              -- 'todo', 'inprogress', 'done'
  date text,                               -- Formato 'YYYY-MM-DD'
  recurrence text default 'once',          -- 'once', 'weekdays', 'daily', 'weekend', 'weekly'
  subtasks jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. TABELA DE AGENDAS & EVENTOS (Agenda / Planejamento Futuro)
create table if not exists public.agendas (
  id text primary key,
  user_id text not null,
  title text not null,
  description text default '',
  date text not null,                      -- Formato 'YYYY-MM-DD'
  time text default '09:00',
  end_time text,
  category text default 'pessoal',
  priority text default 'media',
  status text default 'scheduled',         -- 'scheduled', 'completed', 'cancelled'
  location text default '',
  recurrence text default 'once',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. TABELA DE COMPATIBILIDADE E BACKUP (chronos_userdata)
create table if not exists public.chronos_userdata (
  user_id text primary key,
  tasks jsonb default '[]'::jsonb,
  habits jsonb default '[]'::jsonb,
  reflections jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- ============================================================================
-- HABILITAÇÃO DE ROW LEVEL SECURITY (RLS) E POLÍTICAS PERMISSIVAS
-- ============================================================================

alter table public.tarefas enable row level security;
alter table public.agendas enable row level security;
alter table public.chronos_userdata enable row level security;

-- Políticas para tarefas
drop policy if exists "Permitir tudo para tarefas" on public.tarefas;
create policy "Permitir tudo para tarefas" on public.tarefas
  for all using (true) with check (true);

-- Políticas para agendas
drop policy if exists "Permitir tudo para agendas" on public.agendas;
create policy "Permitir tudo para agendas" on public.agendas
  for all using (true) with check (true);

-- Políticas para chronos_userdata
drop policy if exists "Permitir tudo para chronos_userdata" on public.chronos_userdata;
create policy "Permitir tudo para chronos_userdata" on public.chronos_userdata
  for all using (true) with check (true);

-- ============================================================================
-- ÍNDICES DE ALTA PERFORMANCE
-- ============================================================================
create index if not exists idx_tarefas_user_id on public.tarefas(user_id);
create index if not exists idx_tarefas_date on public.tarefas(date);
create index if not exists idx_tarefas_status on public.tarefas(status);

create index if not exists idx_agendas_user_id on public.agendas(user_id);
create index if not exists idx_agendas_date on public.agendas(date);

-- ============================================================================
-- TRIGGER AUTOMÁTICO DE UPDATED_AT
-- ============================================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

drop trigger if exists trigger_tarefas_updated_at on public.tarefas;
create trigger trigger_tarefas_updated_at
  before update on public.tarefas
  for each row execute function update_updated_at_column();

drop trigger if exists trigger_agendas_updated_at on public.agendas;
create trigger trigger_agendas_updated_at
  before update on public.agendas
  for each row execute function update_updated_at_column();
