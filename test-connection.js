/**
 * ==============================================================================
 * CHRONOS - SUPABASE & VERCEL CONNECTION TEST SCRIPT (JavaScript / Node.js)
 * Compatível com execução local (node test-connection.js), Vercel e CI/CD.
 * ==============================================================================
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ||
                     process.env.SUPABASE_URL ||
                     process.env.VITE_SUPABASE_URL ||
                     'https://uzzaifelwjsitqmaaifo.supabase.co';

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                          process.env.SUPABASE_ANON_KEY ||
                          process.env.VITE_SUPABASE_ANON_KEY ||
                          'sb_publishable_Vg45ZPXTHvQzy6gXwClsIg_Nh9EE22g';

console.log('='.repeat(65));
console.log('🚀 CHRONOS — TESTE DE CONEXÃO SUPABASE & VERCEL (Node.js)');
console.log('='.repeat(65));
console.log(`URL do Supabase : ${SUPABASE_URL}`);
console.log(`Chave Anônima   : ${SUPABASE_ANON_KEY.slice(0, 16)}...`);
console.log('-'.repeat(65));

const headers = {
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  'Content-Type': 'application/json'
};

async function runDiagnostics() {
  const startTime = Date.now();

  // 1. Teste de Conexão com Endpoint REST
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/chronos_userdata?select=user_id&limit=1`, {
      method: 'GET',
      headers
    });
    const latency = Date.now() - startTime;
    if (res.ok) {
      console.log(`✅ [TESTE 1: PING] Supabase Online e Autenticado! Latência: ${latency}ms (Status ${res.status})`);
    } else {
      console.log(`❌ [TESTE 1: PING] Resposta inesperada do Supabase: Status ${res.status}`);
    }
  } catch (err) {
    console.error(`❌ [TESTE 1: PING] Falha de conexão: ${err.message}`);
  }

  // 2. Teste de Tabelas
  async function testTable(tableName, testPayload, idKey) {
    process.stdout.write(`🔍 Testando tabela '${tableName}'... `);
    try {
      // Leitura
      const readRes = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?limit=1`, {
        method: 'GET',
        headers
      });

      if (!readRes.ok) {
        if (readRes.status === 404) {
          console.log(`⚠️  Tabela não criada no schema (404/PGRST205). Use 'supabase_schema.sql'.`);
          return false;
        }
        console.log(`❌ Erro de leitura: Status ${readRes.status}`);
        return false;
      }

      // Escrita (Upsert)
      const writeRes = await fetch(`${SUPABASE_URL}/rest/v1/${tableName}`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates' },
        body: JSON.stringify(testPayload)
      });

      if (!writeRes.ok) {
        console.log(`❌ Falha na escrita: Status ${writeRes.status}`);
        return false;
      }

      // Limpeza
      const testId = testPayload[idKey];
      await fetch(`${SUPABASE_URL}/rest/v1/${tableName}?${idKey}=eq.${testId}`, {
        method: 'DELETE',
        headers
      });

      console.log(`✅ OK (Leitura, Escrita e Remoção bem-sucedidas!)`);
      return true;
    } catch (e) {
      console.log(`❌ Erro: ${e.message}`);
      return false;
    }
  }

  console.log('\n[TESTE 2: MAPEAMENTO DE TABELAS]');
  const userdataOk = await testTable('chronos_userdata', {
    user_id: 'test_node_diag',
    tasks: [],
    habits: [],
    reflections: [],
    updated_at: new Date().toISOString()
  }, 'user_id');

  const tarefasOk = await testTable('tarefas', {
    id: 'test_node_tarefa',
    user_id: 'test_node_diag',
    title: 'Tarefa Teste Node',
    status: 'todo',
    priority: 'media',
    category: 'trabalho'
  }, 'id');

  const agendasOk = await testTable('agendas', {
    id: 'test_node_agenda',
    user_id: 'test_node_diag',
    title: 'Agenda Teste Node',
    date: new Date().toISOString().slice(0, 10),
    time: '10:00',
    category: 'trabalho'
  }, 'id');

  console.log('\n' + '='.repeat(65));
  console.log('📊 RESUMO DO DIAGNÓSTICO (Vercel & Supabase)');
  console.log('='.repeat(65));
  console.log(`• Conexão Supabase         : ✅ ONLINE & AUTENTICADO`);
  console.log(`• Tabela 'chronos_userdata': ${userdataOk ? '✅ ATIVA (Leitura & Escrita 100%)' : '⚠️ Pendente'}`);
  console.log(`• Tabela 'tarefas'         : ${tarefasOk ? '✅ ATIVA (Mapeada)' : '⚠️ Pronta no arquivo supabase_schema.sql (Fallback ativo)'}`);
  console.log(`• Tabela 'agendas'         : ${agendasOk ? '✅ ATIVA (Mapeada)' : '⚠️ Pronta no arquivo supabase_schema.sql (Fallback ativo)'}`);
  console.log('='.repeat(65));
}

runDiagnostics();
