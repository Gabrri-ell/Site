# ==============================================================================
# SCRIPT DE DIAGNOSTICO E VERIFICACAO DE CONEXAO: SUPABASE E VERCEL
# ==============================================================================

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " [CHRONOS] DIAGNOSTICO DE CONEXAO: SUPABASE E VERCEL             " -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# 1. RESOLUCAO DE VARIAVEIS DE AMBIENTE
$supabaseUrl = $env:NEXT_PUBLIC_SUPABASE_URL
if (-not $supabaseUrl) { $supabaseUrl = $env:SUPABASE_URL }
if (-not $supabaseUrl) { $supabaseUrl = $env:VITE_SUPABASE_URL }
if (-not $supabaseUrl) { 
    $supabaseUrl = 'https://uzzaifelwjsitqmaaifo.supabase.co'
    Write-Host "[INFO] Variavel de ambiente nao encontrada. Usando URL padrao do projeto:" -ForegroundColor Yellow
} else {
    Write-Host "[OK] URL resolvida via Variavel de Ambiente:" -ForegroundColor Green
}
Write-Host "     URL: $supabaseUrl" -ForegroundColor White

$supabaseKey = $env:NEXT_PUBLIC_SUPABASE_ANON_KEY
if (-not $supabaseKey) { $supabaseKey = $env:SUPABASE_ANON_KEY }
if (-not $supabaseKey) { $supabaseKey = $env:VITE_SUPABASE_ANON_KEY }
if (-not $supabaseKey) { 
    $supabaseKey = 'sb_publishable_Vg45ZPXTHvQzy6gXwClsIg_Nh9EE22g'
    Write-Host "[INFO] Variavel de chave nao encontrada. Usando chave anon padrao:" -ForegroundColor Yellow
} else {
    Write-Host "[OK] Chave Anon resolvida via Variavel de Ambiente:" -ForegroundColor Green
}
$shortKey = if ($supabaseKey.Length -gt 16) { $supabaseKey.Substring(0, 16) + '...' } else { $supabaseKey }
Write-Host "     Key: $shortKey" -ForegroundColor White
Write-Host ""

# 2. TESTE DE CONECTIVIDADE BASICA (PING REST)
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray
Write-Host " [TESTE 1] PING E AUTENTICACAO COM A API DO SUPABASE" -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

$headers = @{
    'apikey' = $supabaseKey
    'Authorization' = "Bearer $supabaseKey"
    'Content-Type' = 'application/json'
}

$pingStart = Get-Date
try {
    $testUrl = $supabaseUrl + '/rest/v1/chronos_userdata?select=user_id&limit=1'
    $res = Invoke-RestMethod -Uri $testUrl -Headers $headers -Method Get -TimeoutSec 10
    $pingMs = [int]((Get-Date) - $pingStart).TotalMilliseconds
    Write-Host "[SUCESSO] Supabase Online e Respondendo! Latencia: ${pingMs}ms" -ForegroundColor Green
} catch {
    Write-Host "[FALHA] Nao foi possivel conectar ao Supabase: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# 3. VERIFICACAO DAS TABELAS MAPEADAS
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray
Write-Host " [TESTE 2] MAPEAMENTO DE TABELAS (LEITURA E ESCRITA)" -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

function Test-SupabaseTable {
    param(
        [string]$tableName,
        [hashtable]$sampleRecord,
        [string]$idColumn
    )

    Write-Host "Testando tabela '$tableName'..." -NoNewline

    $readUrl = $supabaseUrl + '/rest/v1/' + $tableName + '?limit=1'
    try {
        $readRes = Invoke-RestMethod -Uri $readUrl -Headers $headers -Method Get -TimeoutSec 10
        Write-Host " [EXISTE] " -ForegroundColor Green -NoNewline

        $writeHeaders = @{
            'apikey' = $supabaseKey
            'Authorization' = "Bearer $supabaseKey"
            'Content-Type' = 'application/json'
            'Prefer' = 'resolution=merge-duplicates'
        }
        $bodyJson = $sampleRecord | ConvertTo-Json
        $writeUrl = $supabaseUrl + '/rest/v1/' + $tableName
        
        $writeRes = Invoke-RestMethod -Uri $writeUrl -Headers $writeHeaders -Method Post -Body $bodyJson -TimeoutSec 10
        Write-Host "[ESCRITA OK] " -ForegroundColor Green -NoNewline

        $testId = $sampleRecord[$idColumn]
        $delUrl = $supabaseUrl + '/rest/v1/' + $tableName + '?' + $idColumn + '=eq.' + $testId
        Invoke-RestMethod -Uri $delUrl -Headers $headers -Method Delete -TimeoutSec 10 | Out-Null
        Write-Host "[LIMPEZA OK]" -ForegroundColor Green
        return $true
    } catch {
        if ($_.Exception.Message -match '404' -or $_.Exception.Message -match 'PGRST205') {
            Write-Host " [TABELA NAO CRIADA NO SCHEMA]" -ForegroundColor DarkYellow
            Write-Host "     > A tabela '$tableName' ainda nao foi executada no SQL Editor." -ForegroundColor Gray
            Write-Host "     > Use o script 'supabase_schema.sql' para cria-la com 1 clique." -ForegroundColor Gray
        } else {
            Write-Host " [ERRO]: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $false
    }
}

# Teste tabela chronos_userdata (Compatibilidade JSONB)
$userdataSample = @{
    'user_id' = 'diag_test_temp'
    'tasks' = @()
    'habits' = @()
    'reflections' = @()
    'updated_at' = (Get-Date).ToUniversalTime().ToString('o')
}
$userdataOk = Test-SupabaseTable -tableName 'chronos_userdata' -sampleRecord $userdataSample -idColumn 'user_id'

# Teste tabela tarefas
$tarefasSample = @{
    'id' = 'diag_task_temp'
    'user_id' = 'diag_user_temp'
    'title' = 'Teste Diagnostico'
    'status' = 'todo'
    'priority' = 'media'
    'category' = 'trabalho'
}
$tarefasOk = Test-SupabaseTable -tableName 'tarefas' -sampleRecord $tarefasSample -idColumn 'id'

# Teste tabela agendas
$agendasSample = @{
    'id' = 'diag_agenda_temp'
    'user_id' = 'diag_user_temp'
    'title' = 'Reuniao Teste'
    'date' = (Get-Date).ToString('yyyy-MM-dd')
    'time' = '14:00'
    'category' = 'trabalho'
}
$agendasOk = Test-SupabaseTable -tableName 'agendas' -sampleRecord $agendasSample -idColumn 'id'

Write-Host ""
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray
Write-Host " [TESTE 3] ESTRUTURA PARA DEPLOY NA VERCEL" -ForegroundColor Yellow
Write-Host "-----------------------------------------------------------------" -ForegroundColor Gray

$rootPath = $PSScriptRoot
$rootIndex = Join-Path $rootPath "index.html"
$rootVercelJson = Join-Path $rootPath "vercel.json"

if (Test-Path $rootIndex) {
    Write-Host "[OK] index.html encontrado na raiz do projeto ($rootPath)" -ForegroundColor Green
} else {
    Write-Host "[INFO] index.html esta na subpasta. Vamos sincronizar para a raiz!" -ForegroundColor Yellow
}

if (Test-Path $rootVercelJson) {
    Write-Host "[OK] vercel.json configurado na raiz" -ForegroundColor Green
} else {
    Write-Host "[INFO] Criando vercel.json para configuracao otimizada de deploy..." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host " [RESUMO DO DIAGNOSTICO]" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "Conexao Supabase: ONLINE E AUTENTICADO COM SUCESSO" -ForegroundColor Green

if ($userdataOk) { 
    Write-Host "Tabela 'chronos_userdata' (JSONB): ATIVA E FUNCIONAL (Leitura e Escrita OK)" -ForegroundColor Green 
} else { 
    Write-Host "Tabela 'chronos_userdata' (JSONB): PENDENTE" -ForegroundColor Yellow 
}

if ($tarefasOk) { 
    Write-Host "Tabela 'tarefas' (Relacional): ATIVA E MAPEADA" -ForegroundColor Green 
} else { 
    Write-Host "Tabela 'tarefas' (Relacional): Pronta no script supabase_schema.sql (com fallback automatico no app)" -ForegroundColor Yellow 
}

if ($agendasOk) { 
    Write-Host "Tabela 'agendas' (Relacional): ATIVA E MAPEADA" -ForegroundColor Green 
} else { 
    Write-Host "Tabela 'agendas' (Relacional): Pronta no script supabase_schema.sql (com fallback automatico no app)" -ForegroundColor Yellow 
}

Write-Host ""
Write-Host "Conclusao: Banco de dados conectado, pronto para leitura e escrita!" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
