# 📦 HANDOFF OFICIAL — ROTA VERDE
## Modelo Definitivo de Deploy, Segurança e Evolução
### MODELO B — CONTAINER IMUTÁVEL (DECISÃO FINAL)

Este documento define a arquitetura final, obrigatória e imutável do sistema Rota Verde.
Ele deve ser seguido à risca, sem improvisações, atalhos ou adaptações “para funcionar”.

Este arquivo será entregue ao Antigravity como fonte única da verdade.

## 1️⃣ OBJETIVO PRINCIPAL (NÃO NEGOCIÁVEL)

Criar um sistema onde:

✅ O que funciona no Servidor de Teste é 100% idêntico ao Servidor Oficial
✅ Deploy é previsível
✅ Rollback é instantâneo
✅ Não existe build em produção
✅ Não existe cache imprevisível
✅ Não existe “tentativa”
✅ Se subir → funciona
❌ Se algo estiver errado → não sobe

Este modelo elimina definitivamente:
*   telas brancas inesperadas
*   erros de build em produção
*   dependência de cache do Railway
*   comportamento diferente entre ambientes

## 2️⃣ DECISÃO ARQUITETURAL FINAL
### 🔒 MODELO ESCOLHIDO: CONTAINER IMUTÁVEL (MODELO B)

**Justificativa técnica:**
*   O ambiente de produção é externo (Railway)
*   Não há controle sobre o host
*   É necessário comportamento determinístico
*   A aplicação não pode “se adaptar” em runtime

**❌ É PROIBIDO EM PRODUÇÃO:**
*   build no Railway
*   migrations automáticas no boot
*   criação de tabelas em runtime
*   seeds automáticos
*   lógica “se não existir, cria”
*   scripts ocultos de correção
*   correções silenciosas

📌 **O container não corrige, não tenta, não improvisa.**
📌 **Ele apenas executa o que já foi validado.**

## 3️⃣ PRINCÍPIO FUNDAMENTAL DO MODELO

Produção não é lugar de tentativa.
Produção é lugar de execução previsível.

Tudo que pode falhar:
*   deve falhar antes
*   deve falhar claramente
*   deve impedir o deploy

## 4️⃣ ARQUITETURA FINAL OBRIGATÓRIA

O sistema é composto por dois containers imutáveis independentes:

### 🔵 FRONTEND — Container Imutável

**Responsabilidade:**
*   Servir a interface do usuário

**Características obrigatórias:**
*   Build feito fora do Railway
*   Contém apenas arquivos estáticos (HTML, CSS, JS)
*   Não executa Node em runtime (exceto para servir arquivos)
*   Não depende do backend para renderizar a UI inicial

**Tecnologia sugerida:**
*   `serve` ou `nginx`

**Variáveis obrigatórias:**
*   `VITE_API_URL` → URL do backend

📌 **Se o backend estiver fora:**
*   o frontend abre
*   exibe erro controlado
*   nunca tela branca

### 🔴 BACKEND — Container Imutável

**Responsabilidade:**
*   API
*   Regras de negócio
*   Autenticação
*   Comunicação com o banco

**Características obrigatórias:**
*   Código já compilado
*   Nenhuma mutação estrutural em runtime
*   Apenas validações no boot
*   Logs claros e explícitos

**Variáveis obrigatórias mínimas:**
*   `DATABASE_URL`
*   `JWT_SECRET`
*   demais ENV críticas definidas no projeto

📌 **Se qualquer ENV estiver ausente → processo encerra**

## 5️⃣ REGRAS ABSOLUTAS DE BOOT (BACKEND)

No startup, o backend **PODE APENAS**:
*   validar variáveis de ambiente
*   testar conexão com o banco
*   validar schema existente
*   responder healthcheck

❌ **O backend NÃO PODE:**
*   criar tabelas
*   rodar migrations
*   seedar dados
*   alterar schema
*   “consertar” banco
*   tentar rodar novamente

📌 **Se algo falhar → container não sobe**

---

## 6️⃣ MIGRAÇÕES DE BANCO DE DADOS (REGRA CRÍTICA)

As migrações de banco são **EXPLICITAMENTE SEPARADAS** do deploy da aplicação.

📌 **PRINCÍPIO**
Deploy de aplicação ≠ alteração de banco

Misturar esses dois processos é a principal causa de:
*   erro silencioso
*   banco inconsistente
*   ambiente quebrado
*   rollback impossível

✅ **COMO MIGRAÇÕES DEVEM FUNCIONAR**
*   Executadas manualmente
*   Ou via job explícito
*   Ou via script controlado
*   Sempre com consciência humana

📌 **Nunca no boot do container**

🔧 **EXEMPLO DE COMANDO (ILUSTRATIVO)**
`npm run db:migrate`
Ou equivalente, dependendo da stack final.

❌ **PROIBIDO**
*   rodar migration automaticamente
*   rodar migration ao subir container
*   rodar migration “se detectar diferença”
*   rodar migration em produção sem validação

## 7️⃣ PIPELINE CORRETO DE DEPLOY (SEM DESVIO)

Este é o único pipeline permitido:

1.  Código validado localmente
2.  Build de imagem Docker (imutável)
3.  Imagem publicada em registry
4.  Railway apenas executa

📌 **O Railway NÃO:**
*   builda código
*   roda scripts
*   corrige ambiente
*   adapta configuração
*   “tenta novamente”

Se algo estiver errado:
*   o container falha
*   o deploy não sobe
*   o erro fica explícito no log

## 8️⃣ HEALTHCHECK (OBRIGATÓRIO)

Todo container deve expor um healthcheck funcional.

### 🔴 BACKEND
O healthcheck deve validar:
*   aplicação está rodando
*   conexão com banco ok
*   schema compatível

📌 **Se qualquer validação falhar → healthcheck retorna erro**

### 🔵 FRONTEND
O healthcheck valida:
*   arquivos estáticos disponíveis
*   index.html acessível

📌 **Frontend não depende da API para estar saudável**

## 9️⃣ BACKUP OBRIGATÓRIO (AUTOMÁTICO)

### 📁 BACKUP DE CÓDIGO (ESTRUTURAL)
Para Servidor de Teste e Servidor Oficial:
*   ZIP completo da pasta do projeto
*   Manter no mínimo 3 versões
*   Armazenar fora do diretório ativo

📌 **Objetivo: restaurar o sistema exatamente como estava**

### 🗄️ BACKUP DE BANCO DE DADOS (CRÍTICO)
*   Dump automático diário
*   Executado por script
*   Salvo fora do Railway

📌 **Exemplo ilustrativo:**
`pg_dump $DATABASE_URL > backup_YYYY_MM_DD.sql`

📌 **Política mínima**
*   manter últimos 7 backups
*   rotação automática
*   armazenamento externo (ex: cloud storage)

### 🔁 RESTAURAÇÃO DE BANCO (SIMPLIFICADA)
Se necessário restaurar:
`psql $DATABASE_URL < backup_YYYY_MM_DD.sql`

📌 **Processo manual, consciente e reversível**

## 1️⃣0️⃣ SEGURANÇA — CAMADA MÍNIMA OBRIGATÓRIA

Implementar obrigatoriamente:

🔐 **Proteções de API**
*   rate limit em rotas públicas
*   validação de input (anti SQL/NoSQL injection)
*   CORS restrito
*   headers de segurança (helmet ou equivalente)

🔍 **LOGS E AUDITORIA**
*   log de erro estruturado
*   log de tentativas suspeitas
*   log de falha de autenticação
*   log de falha de conexão com banco

📌 **Logs devem ser claros, legíveis e acionáveis**

---

## 1️⃣1️⃣ MONITORAMENTO (OBRIGATÓRIO DESDE JÁ)

O sistema deve ser observável, mesmo sem painel visual avançado.

🎯 **OBJETIVO**
Detectar antes do usuário:
*   queda do serviço
*   falha de banco
*   erro crítico
*   comportamento anômalo

🔍 **MONITORAMENTO MÍNIMO EXIGIDO**
Implementar monitoramento para:
*   status do container
*   healthcheck
*   erros 5xx
*   falhas de conexão com banco
*   crashes de processo
*   reinícios inesperados

📌 **Não é necessário painel gráfico neste momento.**
📌 **Logs + alertas são suficientes.**

## 1️⃣2️⃣ SISTEMA DE ALERTAS (CRÍTICO)

Todo evento crítico deve gerar notificação ativa, não passiva.

🔔 **EVENTOS QUE DEVEM ALERTAR**
*   backend não sobe
*   healthcheck falha
*   erro de banco
*   crash da aplicação
*   loop de restart
*   excesso de tentativas suspeitas

📣 **CANAIS DE NOTIFICAÇÃO (ESCOLHER 1 OU MAIS)**
*   Email
*   Telegram
*   Webhook
*   Slack
*   Discord

📌 **Mensagens devem ser claras, exemplo:**
“❌ Backend Rota Verde não subiu — Falha ao conectar no banco.”

## 1️⃣3️⃣ POLÍTICA DE BLOQUEIO E MITIGAÇÃO

🔐 **BLOQUEIOS AUTOMÁTICOS (MVP)**
*   rate limit em IP
*   bloqueio temporário após excesso de erro
*   proteção contra brute force
*   validação forte de payload

📌 **Não é necessário firewall dedicado agora**
📌 **A camada de aplicação é suficiente no MVP**

## 1️⃣4️⃣ INDEPENDÊNCIA VISUAL DO BANCO (OFICIAL)

**REGRA ABSOLUTA**
O banco NUNCA armazena decisões visuais.

❌ **Não armazenar:**
*   ícones
*   cores (hex)
*   paths de imagem
*   nomes de componentes
*   SVGs ou PNGs

✅ **Armazenar apenas:**
*   chaves semânticas
*   tipos de negócio
*   categorias estáveis

📌 **O frontend resolve apresentação via mapas centralizados**

## 1️⃣5️⃣ EVOLUÇÃO PARA APLICATIVO (GARANTIR AGORA)

A arquitetura deve permitir evolução sem refatoração estrutural.

🟢 **CAMINHO OFICIAL**
*   Web (atual)
*   PWA
*   App híbrido (Capacitor / Ionic)

📱 **REGRAS PARA NÃO TRAVAR O APP**
*   autenticação via token
*   nada dependente de sessão de browser
*   API stateless
*   layout responsivo
*   backend totalmente desacoplado

📌 **O backend não muda ao virar app**

## 1️⃣6️⃣ DOCUMENTAÇÃO — FONTE ÚNICA DA VERDADE

Tudo deve ser documentado em:
*   `PADRAO_SISTEMA_ROTA_VERDE.MD`
*   `MASTER_RESTART_GUIDE.md`

❌ **Proibido:**
*   configuração não documentada
*   ajuste “só no servidor”
*   dependência de conhecimento oral

## 1️⃣7️⃣ CRITÉRIOS DE ACEITAÇÃO FINAL

O sistema só é considerado aprovado se:
*   um deploy novo subir sem erro
*   rollback funcionar
*   backend não tentar alterar banco
*   frontend abrir mesmo com API fora
*   logs forem claros
*   alertas forem disparados corretamente
*   nenhuma etapa depender de cache

---

## 1️⃣8️⃣ PADRÃO DE EXECUÇÃO (OBRIGATÓRIO)

Toda execução do trabalho deve seguir estritamente a ordem abaixo.
Não é permitido “pular etapa”.

**ORDEM CORRETA**
1.  Validar código localmente
2.  Buildar imagem imutável
3.  Publicar imagem
4.  Configurar ENV no Railway
5.  Executar deploy
6.  Verificar healthcheck
7.  Validar logs
8.  Confirmar frontend acessível
9.  Confirmar backend operacional

📌 **Se falhar em qualquer ponto → parar imediatamente**

## 1️⃣9️⃣ POLÍTICA DE FALHA (SEM TENTATIVA)

**REGRA**
Falhou = não sobe

❌ **Não tentar:**
*   “rodar de novo”
*   “limpar cache”
*   “adaptar config”
*   “colocar fallback silencioso”

📌 **Falha deve ser:**
*   explícita
*   visível
*   rastreável

## 2️⃣0️⃣ ROLLBACK (OBRIGATÓRIO)

Rollback deve ser possível sem rebuild.

**COMO FUNCIONA**
1.  selecionar imagem anterior
2.  redeploy
3.  sistema volta ao estado anterior

📌 **Banco não é alterado durante rollback**

## 2️⃣1️⃣ RESPONSABILIDADES CLARAS

**BACKEND**
*   validar
*   executar
*   responder

**FRONTEND**
*   renderizar
*   tratar erro
*   não depender de backend para abrir

**RAILWAY**
*   executar containers
*   expor logs
*   reiniciar se necessário

📌 **Railway não decide nada**

## 2️⃣2️⃣ PROIBIÇÕES FINAIS (NÃO NEGOCIÁVEL)

É expressamente proibido:
*   alterar banco no boot
*   criar tabela em produção
*   seed automático
*   build em runtime
*   corrigir erro silenciosamente
*   “fazer funcionar depois”

📌 **Se não funciona → não sobe**

## 2️⃣3️⃣ COMANDO FINAL AO ANTIGRAVITY

Executar este plano exatamente como descrito.
Não improvisar.
Não adaptar.
Não simplificar.
Não “dar um jeitinho”.

Se qualquer item:
*   não estiver claro
*   não for possível
*   gerar dúvida

👉 **PARAR e REPORTAR antes de continuar**

## 2️⃣4️⃣ ESTADO FINAL ESPERADO

Ao final da execução:
*   o deploy é previsível
*   o sistema sobe ou falha claramente
*   rollback é instantâneo
*   frontend nunca mostra tela branca
*   backend nunca altera banco
*   logs explicam qualquer falha
*   ambiente de teste = ambiente oficial

📌 **Este é o estado profissional mínimo aceitável.**

## 2️⃣5️⃣ ENCERRAMENTO

Este documento passa a ser a:
**FONTE ÚNICA DA VERDADE DO DEPLOY ROTA VERDE**

Qualquer decisão futura deve:
*   respeitar este modelo
*   ou atualizar este documento oficialmente

Nada fora dele é considerado válido.

---

## ANEXO A — DETALHES TÉCNICOS DE IMPLEMENTAÇÃO

Esta seção complementa o documento principal com especificações técnicas concretas para executar o Modelo B corretamente.

### A. INFRAESTRUTURA E DEPLOY

#### A1. CORS_ORIGIN (Obrigatório)

**Problema:** Frontend e Backend em domínios diferentes causam bloqueio do navegador.

**Solução:**
- Adicionar variável `CORS_ORIGIN` no Backend (ex: `https://app.rotaverde.com`)
- Configurar CORS no Express/Fastify para aceitar apenas essa origem
- Em desenvolvimento local: `http://localhost:5173` (ou porta do Vite)

**Validação:** Abrir DevTools → Network → Ver se requests retornam `Access-Control-Allow-Origin`

#### A2. Monorepo no Railway (Dois Serviços)

**Configuração:**
1. Criar **dois serviços** no mesmo projeto Railway
2. Ambos conectados ao mesmo repositório GitHub
3. **Serviço 1 (Backend):**
   - Source: **Docker Image** (Registry) ou GitHub Repo (Backup)
   - Dockerfile: `SISTEMA_OFICIAL/server/Dockerfile`
   - Start Command: `npm start`
4. **Serviço 2 (Frontend):**
   - Source: **Docker Image** (Registry) ou GitHub Repo (Backup)
   - Dockerfile: `SISTEMA_OFICIAL/client/Dockerfile`
   - Runtime: **Nginx** (Obrigatório)


**Variáveis de Ambiente:**
- Backend: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`
- Frontend: `VITE_API_URL` (URL pública do Backend)

#### A3. Ordem de Deploy (Backend → Frontend)

**Regra:**
1. Deploy Backend primeiro
2. Aguardar healthcheck passar
3. Deploy Frontend

**Por quê:** Evita que Frontend novo tente chamar endpoint inexistente enquanto Backend antigo ainda roda.

**Implementação no Railway:** Deploy manual de cada serviço na ordem, ou usar CI/CD workflow com dependência explícita.

#### A5. Arquivo .dockerignore (Obrigatório)

**Problema:** Sem isso, `docker build` copia `node_modules` locais (lentos e incompatíveis) para o container.

**Ação:** Criar `.dockerignore` na raiz com o conteúdo mínimo:
```text
node_modules
dist
.git
.env
npm-debug.log
```
📌 **Isso impede que lixo local contamine o container de produção.**


#### A4. Bootstrap Inicial do Banco (Primeira Vez)

**Procedimento para ambiente novo (zerado):**

1. **Conectar via CLI local:**
   ```bash
   railway connect
   export DATABASE_URL=$(railway variables get DATABASE_URL)
   ```

2. **Rodar migrations iniciais:**
   ```bash
   npm run db:migrate
   # ou drizzle-kit push (se usando Drizzle)
   ```

3. **Validar schema:**
   ```bash
   psql $DATABASE_URL -c "\dt"
   # Deve listar todas as tabelas esperadas
   ```

4. **Apenas depois:** Deploy da aplicação

📌 **Nunca deployar aplicação em banco vazio sem schema pronto**

---

### B. BANCO DE DADOS

#### B1. Healthcheck Profundo (SELECT 1)

**Problema:** Healthcheck que só retorna 200 sem testar DB pode enganar (conexão travada).

**Solução no código (Node.js):**
```javascript
app.get('/health', async (req, res) => {
  try {
    // Testa conexão real com query simples
    await db.execute('SELECT 1');
    res.status(200).json({ status: 'healthy', db: 'ok' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', db: 'failed', error: error.message });
  }
});
```

📌 **Se o banco estiver travado, o healthcheck falha explicitamente**

#### B2. Pooling e Timeouts

**Problema:** Conexões sem limite ou timeout causam travamento silencioso.

**Configuração obrigatória (exemplo Postgres):**
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                    // Máximo 10 conexões simultâneas
  idleTimeoutMillis: 30000,   // Fechar conexões ociosas após 30s
  connectionTimeoutMillis: 5000, // Timeout de 5s para conectar
  query_timeout: 10000        // Timeout de 10s para queries
});
```

**Railway Postgres:** Usar `?connection_limit=10` na `DATABASE_URL` se necessário.

#### B3. Migrations: Lock + Backup Obrigatório

**Regra:**
1. **Sempre fazer backup antes de migrar:**
   ```bash
   pg_dump $DATABASE_URL > backup_pre_migration_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Garantir execução única (lock):**
   - Usar lock de migração do ORM (Drizzle/Prisma tem nativo)
   - Ou garantir manualmente (via script de CI/CD com flag `--lock`)

3. **Validar schema depois:**
   ```bash
   npm run db:validate-schema
   # Confirmar que todas as tabelas esperadas existem
   ```

6. **Healthcheck "Config as Code":**
   Definir healthcheckPath via arquivo de configuração (ex: `railway.toml`) para garantir que o Railway use `/health` sem depender de configuração manual no painel.

#### B4. Backup: RPO/RTO Definidos


**Definições:**
- **RPO (Recovery Point Objective):** Quanto de dado aceita perder → **24 horas**
- **RTO (Recovery Time Objective):** Tempo para restaurar → **30 minutos**

**Implementação:**
- Backup diário automático (cron job ou Railway cron)
- Manter últimos 7 backups
- Manter últimos 7 backups
- **Teste de Restore Mensal (Obrigatório):** Restaurar um dump em banco "scratch" e validar login/tabelas. Backup sem teste é placebo.


**Exemplo de cron job:**
0 3 * * * pg_dump $DATABASE_URL | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz && find /backups -mtime +7 -delete
```

#### A6. Formato de Logs (JSON)

**Problema:** Logs de texto (`console.log`) quebram em múltiplas linhas (stack traces) e são ilegíveis no painel do Railway.

**Solução:** Utilizar log estruturado em JSON (ex: `pino` ou `winston`).

**Formato esperado:**
```json
{"level": "error", "message": "Falha no banco", "timestamp": "...", "service": "backend"}
```
📌 **JSON facilita a criação de alertas automáticos e filtros.**

#### A7. Política "Build UMA vez, Promove a mesma imagem"

**Regra de Ouro:** Teste e Produção rodam o **mesmo tag/digest** (sem rebuild).

**Release Manifest:**
Criar `releases/manifest-YYYYMMDD-HHMM.json` contendo:
```json
{
  "frontend_image": "ghcr.io/org/frontend:sha-123",
  "backend_image": "ghcr.io/org/backend:sha-123",
  "commit_sha": "abc1234",
  "db_schema_version": "20251220_init"
}
```
**Rollback:** Apontar Railway para o tag/digest anterior do manifesto.

#### A8. Config as Code (Sem Painel Mágico)
**Regra:** Configurações de serviço (healthcheck, start cmd, ports) devem ser versionadas em arquivo `railway.json` ou `railway.toml` sempre que possível, evitando dependência de cliques manuais no dashboard.



---

### C. SEGURANÇA

#### C1. Gestão de Secrets (Rotação Planejada)

**Impacto:** Trocar `JWT_SECRET` invalida todos os tokens de usuários logados.

**Regra:**
- Rotação de secret = **evento planejado**
- Comunicar usuários (ex: "Manutenção de segurança - login necessário")
- Executar fora de horário de pico

**Procedimento:**
1. Agendar janela de manutenção
2. Atualizar `JWT_SECRET` no Railway
3. Redeploy do Backend
4. Confirmar que novos logins funcionam

📌 **Para MVP: aceitar logout de todos. Para produção avançada: considerar transição com dois secrets simultâneos (complexo).**

#### C2. Headers de Segurança (Helmet)

**Implementação obrigatória:** App deve usar `helmet()` para prevenir XSS e injects.

**⚠️ A Pegadinha do CSP (Content Security Policy):**
O Helmet ativa CSP por padrão, bloqueando imagens externas (S3, etc) e scripts inline.

**Configuração com Whitelist:**
```javascript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "https://*.s3.amazonaws.com", "data:"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // Ajustar conforme necessidade
      },
    },
  })
);
```

```javascript
import helmet from 'helmet';
app.use(helmet());
```

**Headers críticos:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy` (CSP básica)

#### C3. Rate Limiting Expandido

**Proteção em camadas:**

1. **Global (IP-based):**
   ```javascript
   import rateLimit from 'express-rate-limit';
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutos
     max: 100 // 100 requests por IP
   });
   app.use(limiter);
   ```

2. **Login/Auth específico:**
   ```javascript
   const authLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 5, // Apenas 5 tentativas de login em 15min
     message: 'Muitas tentativas. Aguarde 15 minutos.'
   });
   app.use('/api/auth/login', authLimiter);
   ```

---

### D. OBSERVABILIDADE

#### D1. Logs: Retenção e Exportação

**Política:**
- Logs no Railway: retidos por X dias (verificar plano)
- **Backup de logs críticos:** Exportar semanalmente (via Railway CLI ou API)

**Exemplo de exportação:**
```bash
railway logs --service backend --since 7d > logs_backend_$(date +%Y%m%d).txt
```

**Futura evolução (sem custo agora):** Logtail, Datadog, ou similar.

#### D2. Alertas: Playbook de Resposta

**Criar playbook simples (exemplo):**

| Alerta | Ação Imediata | Investigação | Resolução |
|--------|---------------|--------------|-----------|
| Healthcheck falhou | Ver logs do container | Conectividade DB? Crash? | Rollback ou fix + redeploy |
| Aumento de 401/403 | Ver logs de auth | IPs suspeitos? Padrão de ataque? | Ativar rate limit / block IP |
| Erro de banco | Ver conexões ativas | Pool esgotado? Query lenta? | Restart pool / Kill queries / Rollback migration |
| Loop de restart | Ver logs de startup | ENV faltando? Crash no boot? | Corrigir ENV ou código + redeploy |

📌 **Este playbook deve estar em um documento separado acessível 24/7**

---

### E. EVOLUÇÃO

#### E1. Versionamento de API (/v1/)

**Implementação mínima:**
```javascript
// Todas as rotas começam com /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rides', ridesRoutes);
app.use('/api/v1/shifts', shiftsRoutes);
```

**Vantagem:** Se um dia surgir v2, pode coexistir:
- `/api/v1/...` (versão antiga)
- `/api/v2/...` (versão nova)
- Frontend novo usa v2, Frontend antigo continua em v1 por período de transição

#### E2. Storage Externo (Uploads Futuros)

**Regra:**
- **Containers são efêmeros** → Arquivos de usuário **não podem ficar dentro**

**Quando houver uploads (fotos, PDFs, etc):**
1. Usar serviço de storage externo (S3, Cloudinary, Railway Volumes)
2. Backend salva URL no banco, não o arquivo
3. Frontend acessa arquivo via URL pública

📌 **Documentar agora, implementar quando necessário**

---

## ANEXO B — PRIORIDADES IMEDIATAS (MVP)

Dos 15 pontos acima, os **5 mais críticos para deploy funcional agora**:

1. **Bootstrap Inicial do Banco** → Sem isso, não sobe
2. **CORS_ORIGIN Obrigatório** → Sem isso, Frontend não conecta
3. **Healthcheck Profundo (SELECT 1)** → Sem isso, falhas de DB passam despercebidas
4. **Ordem de Deploy (Backend → Frontend)** → Sem isso, deploy quebra intermitentemente
5. **Backup com RPO/RTO** → Sem isso, não há garantia de recuperação

Os outros 10 pontos são importantes para **estabilidade e evolução**, mas os 5 acima são **bloqueantes para o primeiro deploy funcional**.

---

## ANEXO C — PREVENÇÃO DE RISCOS DE RUNTIME

Esta seção cobre as "Unknown Unknowns" - peculiaridades de infraestrutura real que podem sabotar deploys mesmo quando a lógica está correta.

### C1. Cache Zumbi no Navegador (Frontend)

**O Risco:**
Frontend imutável ≠ Navegador imutável. Usuário que acessou ontem pode ter `index.html` v1 em cache. Deploy novo (v2) sobe, mas navegador do usuário:
1. Carrega `index.html` v1 (do cache)
2. `index.html` v1 pede `app.old.js`
3. `app.old.js` chama API v2 com schema incompatível
4. **Erro silencioso até Ctrl+F5**

**A Solução (Recomendada):**
Trocar o runtime do Frontend de `serve` para **Nginx** com configuração de headers por tipo de arquivo.

**Arquivos necessários:**
1. `client/Dockerfile` (multi-stage: build com Vite → serve com Nginx)
2. `client/nginx.conf` (regras de cache por localização)

**Configuração de Headers:**
```nginx
# index.html: NUNCA cachear
location = /index.html {
  add_header Cache-Control "no-cache, no-store, must-revalidate" always;
}

# Assets com hash (app.a8z9.js): cache eterno
location /assets/ {
  add_header Cache-Control "public, max-age=31536000, immutable" always;
}
```

**Regra:**
- `index.html`: **Nunca** cachear
- Assets com hash (`app.a8z9.js`): Cachear **para sempre**

📌 **Arquivos de implementação criados em `SISTEMA_OFICIAL/client/`**

### C2. ENV de Build vs Runtime (Frontend)

**O Risco:**
Variáveis `VITE_*` são **embutidas no código** durante `npm run build`. Se mudar `VITE_API_URL` no Railway e apenas reiniciar o container, **nada acontece** - a URL antiga está hardcoded no JS compilado.

**A Solução (MVP):**
Documentar claramente que mudança de ENV no Frontend exige **REBUILD completo**, não apenas restart.

**Regra Operacional:**
```
Mudou VITE_API_URL → Rebuild + Redeploy (não é só restart)
```

**Solução Avançada (Futuro):**
Runtime config via `window.ENV` injetado no `index.html` durante boot do container (permite mudar URL sem rebuild).

### C3. Graceful Shutdown (SIGTERM)

**O Risco:**
Railway envia `SIGTERM` ao mover container ou fazer redeploy. Se não tratar, Node morre bruscamente:
- Request cortado no meio
- Transação de banco corrompida

**A Solução:**
Implementar handler de shutdown gracioso no backend:

```javascript
// No final de server/index.ts
process.on('SIGTERM', () => {
  console.info('⚠️  SIGTERM recebido. Iniciando shutdown gracioso...');
  
  // 1. Para de aceitar novos requests
  server.close(() => {
    console.log('✅ Servidor HTTP fechado');
    
    // 2. Fecha pool de conexões do banco
    db.end(() => {
      console.log('✅ Conexões DB finalizadas');
      process.exit(0);
    });
  });
  
  // Timeout de segurança (força shutdown após 30s)
  setTimeout(() => {
    console.error('❌ Shutdown forçado (timeout)');
    process.exit(1);
  }, 30000);
});
```

**Validação:**
Localmente: `docker stop <container>` deve mostrar logs de shutdown gracioso.

### C4. Cold Start e Conexão Fantasma

**O Risco:**
- Planos Trial/Hobby hibernam → Primeiro request leva 10-15s → Frontend dá timeout
- Banco reinicia → Pool Node segura socket morto → Primeiro request pós-falha falha

**A Solução:**

**Infraestrutura:**
- Usar plano que não hiberne (produção séria)
- Ou implementar "keep-alive ping" (cron job que chama `/health` a cada 5min)

**Código:**
Configuração robusta de pool (já em ANEXO A - B2), garantindo:
- `idleTimeoutMillis` baixo (30s)
- Auto-reconnect habilitado

**Frontend:**
Aumentar timeout de requests para 30s (para sobreviver a cold starts):
```javascript
axios.defaults.timeout = 30000; // 30 segundos
```

### C5. Timezone Hell (UTC Obrigatório)

**O Risco:**
- Container Railway: UTC
- Navegador do usuário: America/Sao_Paulo (UTC-3)
- Banco: UTC
- Código faz `new Date()`: Pega hora do container (UTC)
- **Resultado:** Agendamentos aparecem com 3h de diferença

**A Solução:**

**Regra Global:**
1. **Banco e Backend:** Sempre operam em UTC (Zulu time)
2. **Frontend:** Converte para timezone local **apenas na exibição**

**Implementação:**

**Dockerfile (Backend):**
```dockerfile
ENV TZ=UTC
```

**Código (Backend):**
```javascript
// Forçar UTC em todo o processo Node
process.env.TZ = 'UTC';
```

**Código (Frontend):**
```javascript
// Salvar no banco em UTC
const utcDate = new Date().toISOString();

// Exibir para usuário em horário local
const localDate = new Date(utcDate).toLocaleString('pt-BR', {
  timeZone: 'America/Sao_Paulo'
});
```

### C6. Limite de Payload (DoS via JSON Gigante)

**O Risco:**
Usuário malicioso (ou bug no frontend) envia JSON de 50MB. Node trava a thread ou estoura memória.

**A Solução:**
Configurar limites estritos no body parser:

```javascript
import express from 'express';

app.use(express.json({ 
  limit: '100kb',  // Máximo 100KB de JSON
  strict: true     // Apenas JSON válido
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '100kb' 
}));
```

**Para uploads de arquivo (futuro):**
- Usar `multipart/form-data`
- Stream direto para storage (S3/Cloudinary)
- **Nunca** carregar arquivo inteiro em memória

**Validação:**
Testar com `curl -X POST -d @huge.json` para confirmar rejeição de payloads grandes.

### C7. Healthcheck: Liveness vs Readiness

**O Risco:**
Se validar serviços externos (SendGrid, AWS S3) no `/health` principal e a AWS piscar, Railway acha que container está morto e reinicia tudo.

**A Solução:**
Separar dois tipos de healthcheck:

**`/health` (Liveness - Usado pelo Railway):**
Validação mínima para decidir se reinicia:
```javascript
app.get('/health', async (req, res) => {
  try {
    await db.execute('SELECT 1'); // Apenas DB crítico
    res.status(200).json({ status: 'alive' });
  } catch (error) {
    res.status(503).json({ status: 'dead', error: error.message });
  }
});
```

**`/health/ready` (Readiness - Monitoramento/Alertas):**
Validação completa, incluindo serviços externos:
```javascript
app.get('/health/ready', async (req, res) => {
  const checks = {
    db: await checkDatabase(),
    email: await checkSendGrid(),
    storage: await checkS3()
  };
  
  const allReady = Object.values(checks).every(c => c.ok);
  
  res.status(allReady ? 200 : 503).json({
    status: allReady ? 'ready' : 'degraded',
    checks
  });
});
```

**Configuração Railway:**
- Healthcheck Path: `/health` (liveness)
- Monitoramento externo: `/health/ready` (observabilidade)

---

## RESUMO EXECUTIVO - ANEXO C

| Risco | Impacto se Ignorado | Solução (1 linha) |
|-------|---------------------|-------------------|
| Cache Zumbi | Usuários veem versão antiga do site | `Cache-Control: no-cache` no `index.html` |
| ENV Build/Runtime | Mudou URL e nada acontece | Rebuild obrigatório ao mudar `VITE_*` |
| SIGTERM não tratado | Requests cortados, DB corrompido | Handler de `process.on('SIGTERM')` |
| Cold Start | Timeout no primeiro acesso | Aumentar timeout frontend + keep-alive |
| Timezone | Horários errados em 3h | Forçar `TZ=UTC` no container |
| Payload gigante | DoS fácil (Node trava) | `express.json({ limit: '100kb' })` |
| Healthcheck suicida | AWS falha → container reinicia | `/health` (liveness) separado de `/health/ready` |

📌 **Todos os 7 pontos devem ser implementados antes do primeiro deploy de produção real.**

---

---

## ANEXO D — PLAYBOOKS DE INCIDENTES (OPERACIONAL)

Procedimentos padrão para reação a alertas. Devem ser seguidos antes de escalar para desenvolvimento.

### 🟥 D1. Incidente: "Backend não responde" (/health falhou)
**Sintoma:** Monitoramento (UptimeRobot) alerta down ou dashboard Railway mostra "Crashed".

**Procedimento:**
1.  **Verificar Logs do Railway:**
    - Acessar Dashboard > Service `endpoint-api` > Logs.
    - Procurar por "Error", "Exception" ou "Panic" nos últimos 5 minutos.
2.  **Checar Conexão com Banco:**
    - Se logs mostram `Connection refused` ou `timeout`:
    - Acessar aba "Variables" > Confirmar `DATABASE_URL`.
    - Verificar status do serviço PostgreSQL no Railway.
3.  **Ação de Recuperação:**
    - **Se for erro transitório:** Clicar em "Restart" no serviço `endpoint-api`.
    - **Se for erro de código:** Identificar commit problemático e executar **Rollback** no Railway (Menu Deployments > "Redeploy" na versão anterior).
    - **Se for banco corrompido:** Executar script de Restore do Banco (`psql < backup.sql`).

### 🟨 D2. Incidente: "Tela Branca" ou Erro 404 no Frontend
**Sintoma:** Usuário acessa e vê nada, ou console mostra erro ao baixar JS.

**Procedimento:**
1.  **Validar Versão da API:**
    - Se o frontend pede `/api/v2` e o backend está na `v1`, houve descompasso de deploy.
    - **Ação:** Verificar se o deploy do Backend finalizou com sucesso.
2.  **Forçar Rebuild do Frontend:**
    - Acessar Dashboard > Service `client-web` > Settings > **Deploy** (Trigger New Build).
    - Isso garante que o `VITE_API_URL` seja re-injetado corretamente.
3.  **Validar Cache Zumbi:**
    - Abrir site em aba anônima. Se funcionar, é cache do navegador do usuário.
    - **Ação:** Solicitar limpeza de cache ou aguardar (headers `no-cache` previnem isso no futuro).

### 🟧 D3. Incidente: Erro de Login (401/403) em Massa
**Sintoma:** Múltiplos usuários reclamando que não logan, mesmo com senha certa.

**Procedimento:**
1.  **Checar `JWT_SECRET`:**
    - Alguém rotacionou o segredo? Se sim, todos os tokens antigos são inválidos.
    - **Ação:** Comunicar usuários para fazer login novamente.
2.  **Verificar Relógio (Timezone):**
    - Se o container reiniciou sem `TZ=UTC`, tokens podem estar sendo gerados "no passado" ou "no futuro".
    - **Ação:** Verificar variável `TZ` no Railway.

---

## ANEXO E — CHEATSHEET DE COMANDOS (PARA O ANTIGRAVITY)

Comandos oficiais para operação e manutenção do sistema.

### E1. Build & Teste Local (Obrigatório antes de push)
```bash
# 1. Limpar e Instalar
npm ci

# 2. Build de Produção
npm run build

# 3. Build Containers (Prova real)
docker build -t rv-client -f SISTEMA_OFICIAL/client/Dockerfile SISTEMA_OFICIAL
docker build -t rv-server -f SISTEMA_OFICIAL/server/Dockerfile SISTEMA_OFICIAL
```

### E2. Backup Manual de Emergência
```powershell
# Banco de Dados
railway run pg_dump $env:DATABASE_URL > "C:\Backups\RotaVerde\DB\manual_$(get-date -f yyyyMMdd).sql"

# Código Fonte
Compress-Archive -Path "C:\dev\rota-verde-railway\SISTEMA_OFICIAL" -DestinationPath "C:\Backups\RotaVerde\Codigo\manual_$(get-date -f yyyyMMdd).zip"
```

---

✅ **FIM DO DOCUMENTO (COM ANEXOS A, B, C, D, E)**

📅 **Documento finalizado em:** 2025-12-20
📦 **Modelo adotado:**
- **Frontend:** Container Nginx servindo estáticos (Buildado com Vite)
- **Backend:** Container Node.js (API REST)
🧠 **Status:** Congelado para execução
📋 **Anexos:**
- A: Detalhes Técnicos
- B: Prioridades MVP
- C: Prevenção de Riscos Runtime
- D: Playbooks de Incidentes

