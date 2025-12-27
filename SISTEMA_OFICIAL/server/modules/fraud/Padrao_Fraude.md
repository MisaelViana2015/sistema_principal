# 📋 PADRÃO DO MÓDULO ANTIFRAUDE — ESPECIFICAÇÃO TÉCNICA

> **Documento de Referência Obrigatória**  
> Este documento define EXCLUSIVAMENTE a materialização do antifraude já existente.  
> O objetivo é tornar eventos antifraude analisáveis, decidíveis e auditáveis.

---

## 🧱 BLOCO 1/15 — ESCOPO, LIMITES E INVARIANTES (OBRIGATÓRIO)

### 1.1 Escopo deste documento
Este documento define EXCLUSIVAMENTE a materialização do antifraude já existente.
O objetivo é tornar eventos antifraude analisáveis, decidíveis e auditáveis.

Este documento NÃO trata de:
- criação de novas regras
- ajustes matemáticos
- otimização de engine
- machine learning
- heurísticas novas

---

### 1.2 Invariantes (NÃO PODEM SER QUEBRADAS)

As seguintes regras são ABSOLUTAS:

- O arquivo `fraud.engine.ts` NÃO pode ser alterado
- O arquivo `fraud.baseline.ts` NÃO pode ser alterado
- As regras antifraude existentes NÃO podem ser alteradas
- O cálculo de score NÃO pode ser alterado
- O baseline NÃO pode ser recalculado de outra forma
- Nenhuma regra nova pode ser criada
- Nenhuma dependência externa de IA pode ser adicionada

Se qualquer item acima for violado, a execução está ERRADA.

---

### 1.3 Definição de "Evento Antifraude"

Evento Antifraude = registro persistido na tabela `fraud_events` que representa
a análise de um turno específico pelo antifraude.

Um evento antifraude é IMUTÁVEL quanto a:
- regras disparadas
- score calculado
- dados de origem do turno

Um evento antifraude é MUTÁVEL apenas quanto a:
- status
- comentário humano
- data da decisão

---

### 1.4 Ciclo de vida obrigatório do evento

Todo evento antifraude DEVE seguir o ciclo:

1. Criado automaticamente (status = `pendente`)
2. Visualizado por humano
3. Analisado
4. Receber decisão explícita
5. Permanecer como evidência histórica

Eventos sem decisão final são considerados INCOMPLETOS.

---

### 1.5 Fonte da verdade

- A tabela `fraud_events` é a ÚNICA fonte da verdade dos eventos antifraude
- O dashboard NUNCA recalcula fraude
- O frontend NUNCA executa engine
- O PDF NUNCA recalcula dados

Tudo deve ser lido de dados persistidos.

---

### 1.6 Linguagem e padrão

- Backend: TypeScript / Express / Drizzle
- Frontend: React + React Query
- Datas sempre em ISO
- Valores monetários sempre em número bruto
- Nenhuma lógica antifraude no frontend

---

## 🧱 BLOCO 2/15 — MODELO DE DADOS DO EVENTO ANTIFRAUDE

### 2.1 Tipo de Status do Evento

Arquivo a alterar:
```
server/modules/fraud/fraud.types.ts
```

Adicionar o tipo abaixo (SEM remover nada existente):

```ts
export type FraudEventStatus =
  | "pendente"
  | "em_analise"
  | "confirmado"
  | "descartado"
  | "bloqueado";
```

### 2.2 Campos obrigatórios do evento antifraude

A tabela `fraud_events` DEVE conter, no mínimo, os seguintes campos:

- `id` (uuid)
- `shiftId` (string)
- `driverId` (string)
- `vehicleId` (string)
- `riskScore` (number)
- `riskLevel` (string)
- `rules` (jsonb)
- `metadata` (jsonb)
- `status` (FraudEventStatus)
- `comment` (string | null)
- `detectedAt` (timestamp)
- `updatedAt` (timestamp)

### 2.3 Regras de imutabilidade

Após a criação do evento:

**NUNCA podem ser alterados:**
- riskScore
- riskLevel
- rules
- metadata
- shiftId
- driverId
- vehicleId

**PODEM ser alterados:**
- status
- comment
- updatedAt

### 2.4 Valor padrão

Ao criar um evento antifraude:
```
status = "pendente"
comment = null
updatedAt = detectedAt
```

### 2.5 Comentário humano

O campo `comment`:
- É opcional
- Só pode ser alterado junto com mudança de status
- Deve armazenar justificativa humana da decisão

### 2.6 Versionamento (não implementar agora)

Não implementar versionamento de eventos.
Cada evento representa a ÚLTIMA análise válida do turno.

### 2.7 Fonte do score

O score armazenado em `fraud_events`:
- É SEMPRE o score retornado pelo engine
- Nunca recalculado
- Nunca reponderado
- Nunca reinterpretado

---

## 🧱 BLOCO 3/15 — BACKEND: CONSULTA DE EVENTO ANTIFRAUDE

### 3.1 Endpoint: Buscar evento antifraude por ID

Criar endpoint HTTP:
```
GET /api/fraud/event/:id
```

---

### 3.2 Responsabilidade do endpoint

Este endpoint DEVE:
- Buscar o evento na tabela `fraud_events`
- Buscar o turno relacionado (`shifts`)
- NÃO executar engine
- NÃO recalcular score
- NÃO alterar nada no banco

Este endpoint é SOMENTE leitura.

---

### 3.3 Dados retornados

Formato da resposta:

```json
{
  "event": {
    "id": "uuid",
    "status": "pendente",
    "riskScore": 65,
    "riskLevel": "high",
    "rules": [],
    "metadata": {},
    "comment": null,
    "detectedAt": "2025-01-01T10:00:00Z",
    "updatedAt": "2025-01-01T10:00:00Z"
  },
  "shift": {
    "id": "shiftId",
    "driverId": "driverId",
    "vehicleId": "vehicleId",
    "inicio": "ISO",
    "fim": "ISO",
    "kmInicial": 1000,
    "kmFinal": 1100,
    "totalBruto": 450,
    "totalCorridas": 12,
    "duracaoMin": 480
  }
}
```

### 3.4 Erros

- Se evento não existir → 404
- Se ID inválido → 400
- Qualquer erro inesperado → 500

### 3.5 Arquivos a alterar/criar

- Alterar: `fraud.controller.ts`
- Alterar ou criar método no: `fraud.repository.ts`

Criar método:
```
getEventById(eventId: string)
```

### 3.6 Regras de segurança

- Não expor dados sensíveis fora do evento e turno
- Não permitir filtro por query
- Apenas ID direto

### 3.7 Performance

- Query única por tabela
- NÃO carregar listas
- NÃO carregar relações extras

---

## 🧱 BLOCO 4/15 — BACKEND: ATUALIZAÇÃO DE STATUS DO EVENTO

### 4.1 Endpoint: Atualizar status do evento

Criar endpoint HTTP:
```
POST /api/fraud/event/:id/status
```

---

### 4.2 Payload obrigatório

Formato do body:

```json
{
  "status": "em_analise" | "confirmado" | "descartado" | "bloqueado",
  "comment": "string opcional"
}
```

### 4.3 Regras de validação

- `status` é obrigatório
- `status` NÃO pode ser `pendente`
- `comment` é opcional
- Se status = `confirmado` ou `bloqueado`, comment é RECOMENDADO (não obrigatório)

### 4.4 Regras de negócio

- Status inicial do evento é sempre `pendente`
- Status pode ser alterado múltiplas vezes
- Cada alteração:
  - atualiza `status`
  - atualiza `comment`
  - atualiza `updatedAt`

NÃO alterar:
- score
- regras
- metadata

### 4.5 Persistência

Atualizar apenas os campos:
- `status`
- `comment`
- `updatedAt`

### 4.6 Resposta do endpoint

Retornar o evento atualizado:

```json
{
  "id": "uuid",
  "status": "confirmado",
  "comment": "Fraude confirmada após análise",
  "updatedAt": "ISO"
}
```

### 4.7 Erros

- Evento não encontrado → 404
- Status inválido → 400
- Tentativa de alterar campos proibidos → 400
- Erro interno → 500

### 4.8 Arquivos a alterar

- `fraud.controller.ts`
- `fraud.repository.ts`

Criar método no repositório:

```ts
updateEventStatus(
  eventId: string,
  status: FraudEventStatus,
  comment?: string
)
```

### 4.9 Auditoria mínima

Não implementar histórico agora.
Último estado é suficiente para MVP.

---

## 🧱 BLOCO 5/15 — BACKEND: GERAÇÃO DE PDF DO EVENTO ANTIFRAUDE

### 5.1 Endpoint de geração de PDF

Criar endpoint HTTP:
```
GET /api/fraud/event/:id/pdf
```

---

### 5.2 Responsabilidade do endpoint

Este endpoint DEVE:
- Buscar o evento antifraude pelo ID
- Buscar o turno associado
- NÃO executar engine
- NÃO recalcular score
- NÃO alterar dados
- Gerar PDF SERVER-SIDE
- Retornar o PDF como download

---

### 5.3 Header de resposta

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="fraud-event-<eventId>.pdf"
```

### 5.4 Estrutura fixa do PDF (ordem obrigatória)

#### 1. Cabeçalho
- Título: Relatório de Análise Antifraude
- Event ID
- Shift ID
- Data de detecção

#### 2. Resumo de Risco
- Risk Score (numérico)
- Risk Level
- Status atual
- Data da última decisão

#### 3. Identificação
- Driver ID
- Vehicle ID

#### 4. Dados do Turno
- KM inicial
- KM final
- KM total
- Receita total
- Receita por KM
- Receita por Hora
- Total de corridas
- Duração do turno (horas)

#### 5. Baseline (se existir)
- Médias históricas do motorista
- Comparação percentual com o turno analisado

Se baseline não existir:
> Exibir texto: `Baseline insuficiente para este motorista`

#### 6. Regras Disparadas
Para cada regra:
- Código
- Label
- Descrição
- Severidade
- Pontuação
- Dados utilizados

#### 7. Decisão Humana
- Status final
- Comentário
- Data da decisão

### 5.5 Formatação

- PDF simples
- Texto legível
- Sem gráficos
- Sem imagens
- Foco em auditoria

### 5.6 Biblioteca

Usar biblioteca server-side já disponível ou de baixo impacto:
- `pdfkit` OU equivalente

Não usar:
- soluções client-side
- serviços externos

### 5.7 Arquivos a alterar/criar

- Alterar: `fraud.controller.ts`
- Criar util: `server/modules/fraud/fraud.pdf.ts` (ou similar)

### 5.8 Erros

- Evento não encontrado → 404
- Erro na geração → 500

---

## 🧱 BLOCO 6/15 — FRONTEND: ROTEAMENTO E ESTRUTURA BASE

### 6.1 Nova rota obrigatória

Adicionar rota no módulo de Fraud:
```
/fraude/evento/:id
```

Essa rota DEVE carregar a tela de detalhe do evento antifraude.

---

### 6.2 Arquivo da página

Criar arquivo:
```
client/src/modules/Fraud/pages/FraudEventDetail.tsx
```

Este arquivo é responsável por:
- Buscar o evento pelo ID
- Renderizar todos os dados do evento
- Permitir ações de decisão
- Permitir geração de PDF

---

### 6.3 Fonte de dados

A tela DEVE consumir exclusivamente:
```
GET /api/fraud/event/:id
```

Regras:
- NÃO recalcular nada no frontend
- NÃO inferir score
- NÃO inferir severidade
- Apenas renderizar dados recebidos

---

### 6.4 Gerenciamento de estado

- Usar `@tanstack/react-query`
- Query key: `fraud-event-{id}`
- Cache padrão
- Invalidar cache após mudança de status

---

### 6.5 Estados obrigatórios da tela

A tela DEVE tratar explicitamente:
- Loading
- Error (404)
- Error (500)
- Evento encontrado

Tela não pode "quebrar silenciosamente".

---

### 6.6 Navegação

A partir do dashboard:
- O botão **"Ver Detalhes"** DEVE navegar para esta rota

---

### 6.7 Permissões (não implementar agora)

Não implementar controle de permissão neste momento.
Assumir usuário autorizado.

---

## 🧱 BLOCO 7/15 — FRONTEND: CONTEÚDO DA TELA (RESUMO + TURNO)

### 7.1 Seção: Resumo do Evento

A tela DEVE exibir no topo:
- Event ID
- Status atual (badge visual)
- Risk Score (numérico)
- Risk Level (texto)
- Data de detecção
- Última atualização

Regras:
- Status com cores distintas
- Risk Level NÃO deve ser recalculado

---

### 7.2 Seção: Identificação

Exibir:
- Shift ID
- Driver ID
- Vehicle ID

---

### 7.3 Seção: Dados do Turno

Exibir os seguintes campos:
- KM inicial
- KM final
- KM total
- Receita total
- Receita por KM
- Receita por hora
- Total de corridas
- Duração do turno (em horas)

Todos os valores DEVEM vir da API.
Nenhum cálculo deve ser feito no frontend.

---

### 7.4 Formatação

- Valores monetários com 2 casas decimais
- Datas em formato legível
- Campos ausentes devem exibir "—"

---

### 7.5 Layout

- Layout em cards
- Sem gráficos
- Sem comparações visuais ainda

---

## 🧱 BLOCO 8/15 — FRONTEND: REGRAS DISPARADAS E BASELINE

### 8.1 Seção: Regras Disparadas

A tela DEVE listar TODAS as regras presentes em `event.rules`.

Para cada regra, exibir:
- Código (`code`)
- Label
- Descrição
- Severidade
- Pontuação individual

---

### 8.2 Ordenação das regras

As regras DEVEM ser exibidas:
- Em ordem decrescente de pontuação
- Empates mantêm a ordem original

---

### 8.3 Destaque visual

- Severidade `critical`: destaque vermelho
- Severidade `high`: destaque laranja
- Severidade `medium`: destaque amarelo
- Severidade `low`: destaque azul ou neutro

Nenhuma regra deve ser ocultada.

---

### 8.4 Dados técnicos da regra

Se `rule.data` existir:
- Exibir em formato key → value
- Sem interpretação
- Sem normalização

---

### 8.5 Seção: Baseline do Motorista

Se o baseline estiver disponível no evento:

Exibir:
- Sample size
- Receita média por KM
- Receita média por hora
- Corridas por hora
- Ticket médio
- KM médio por turno
- Duração média do turno

---

### 8.6 Baseline ausente

Se baseline NÃO existir:
Exibir texto fixo:
```
Baseline histórico insuficiente para este motorista.
```

Não ocultar a seção.

---

### 8.7 Comparação simples

Exibir apenas:
- Valor do turno
- Valor médio histórico
- Diferença percentual (se possível)

Nenhum gráfico é obrigatório nesta etapa.

---

## 🧱 BLOCO 9/15 — FRONTEND: AÇÕES, STATUS E PDF

### 9.1 Seção: Ações do Evento

A tela DEVE conter uma seção fixa de ações com os botões:

- Marcar como **EM ANÁLISE**
- Marcar como **CONFIRMADO**
- Marcar como **DESCARTADO**
- Marcar como **BLOQUEADO**
- **Gerar PDF**

---

### 9.2 Comportamento dos botões de status

Ao clicar em qualquer botão de status:

- Abrir confirmação simples
- Enviar request para:
```
POST /api/fraud/event/:id/status
```
- Payload:
```json
{
  "status": "<novo_status>",
  "comment": "<string opcional>"
}
```

### 9.3 Atualização de estado

Após sucesso:
- Invalidar query `fraud-event-{id}`
- Atualizar status visível na tela
- NÃO redirecionar automaticamente

### 9.4 Validação mínima no frontend

- Impedir envio se status for igual ao atual
- Permitir comentário vazio
- Não validar lógica antifraude

### 9.5 Botão Gerar PDF

Ao clicar:
- Abrir nova aba ou iniciar download
- Chamar:
```
GET /api/fraud/event/:id/pdf
```

Não usar geração client-side.

### 9.6 Estados de erro

Exibir mensagem simples se:
- Falhar atualização de status
- Falhar geração de PDF

---

## 🧱 BLOCO 10/15 — DASHBOARD: LISTAGEM E KPI

### 10.1 Listagem de Alertas

Arquivo:
```
client/src/modules/Fraud/FraudDashboard.tsx
```

A lista de alertas DEVE:
- Exibir o **status** do evento
- Exibir **riskScore** e **riskLevel**
- Exibir **data**
- Exibir **Shift ID**
- Exibir botão **Ver Detalhes** (link obrigatório)

---

### 10.2 Filtro por status

Adicionar filtro simples (client-side):
- Todos
- Pendentes
- Em análise
- Confirmados
- Descartados
- Bloqueados

Filtro NÃO recalcula dados, apenas filtra array recebido.

---

### 10.3 KPI: Alertas Ativos

Definição obrigatória:
```
Alertas Ativos =
eventos com status "pendente" OU "em_analise"
```

NÃO incluir:
- confirmados
- descartados
- bloqueados

---

### 10.4 KPI: Score Geral

O KPI "Score Geral" DEVE ser calculado a partir:
- TODOS os eventos retornados pela API
- Média simples de `riskScore`

NÃO recalcular score.
NÃO ponderar por status.

---

### 10.5 KPI: Motoristas em Risco

Definição:
- Quantidade de eventos com `riskLevel = high` OU `critical`
- Independente do status

---

### 10.6 Navegação

O botão **Ver Detalhes** DEVE navegar para:
```
/fraude/evento/:id
```

---

## 🧱 BLOCO 11/15 — HEATMAP: AJUSTES BACKEND E FRONTEND

### 11.1 Backend — Ajuste do endpoint de heatmap

Endpoint existente:
```
GET /api/fraud/heatmap
```

Este endpoint DEVE passar a retornar, por dia:
- data
- quantidade de eventos
- score médio do dia

Formato de resposta:

```json
[
  {
    "date": "YYYY-MM-DD",
    "count": 5,
    "avgScore": 42.3
  }
]
```

### 11.2 Regra de cálculo

- `count` = total de eventos no dia
- `avgScore` = média simples de riskScore dos eventos do dia
- NÃO filtrar por status
- NÃO recalcular score

### 11.3 Frontend — Uso do avgScore

Arquivo:
```
client/src/modules/Fraud/FraudHeatmap.tsx
```

A cor do bloco DEVE ser baseada em `avgScore`, não em `count`.

Sugestão fixa (não ajustar dinamicamente):
- avgScore = 0 → cinza
- avgScore 1–20 → verde
- avgScore 21–50 → amarelo
- avgScore > 50 → vermelho

### 11.4 Tooltip do heatmap

Ao passar o mouse, exibir:
- Data
- Quantidade de eventos
- Score médio do dia

### 11.5 Regras

- NÃO adicionar drill-down no heatmap
- NÃO adicionar clique
- Heatmap é apenas visual de contexto

---

## 🧱 BLOCO 12/15 — SCRIPT DE SEED / DADOS DE SIMULAÇÃO

### 12.1 Objetivo do seed

Criar dados artificiais para:
- Popular o dashboard
- Validar visualmente o antifraude
- Permitir teste das telas e PDF
- Evitar antifraude "vazio"

---

### 12.2 Arquivo do script

Criar arquivo:
```
server/scripts/seed-fraud-events.ts
```

Este script PODE ser executado manualmente.

---

### 12.3 Comportamento do script

O script DEVE:
- Buscar turnos existentes
- Gerar eventos antifraude artificiais
- NÃO executar engine
- Inserir direto em `fraud_events`

---

### 12.4 Tipos de eventos a gerar

Gerar pelo menos:
- 3 eventos `low`
- 3 eventos `medium`
- 3 eventos `high`
- 3 eventos `critical`

Cada evento com:
- riskScore coerente
- riskLevel correspondente
- status variado (`pendente`, `em_analise`, `confirmado`)
- rules simuladas (mock simples)

---

### 12.5 Metadados

Preencher `metadata` com:
- kmTotal
- revenueTotal
- revenuePerKm
- date

---

### 12.6 Segurança

- Script NÃO deve rodar automaticamente
- Apenas ambiente de dev / staging
- Não incluir no build de produção

---

## 🧱 BLOCO 13/15 — CONSISTÊNCIA, ERROS E CONTRATOS

### 13.1 Fonte única da verdade

Regras obrigatórias:
- `fraud_events` é a única fonte de verdade do antifraude
- Nenhuma tela recalcula score
- Nenhum endpoint reexecuta engine para exibição
- PDF usa EXATAMENTE os mesmos dados da tela

---

### 13.2 Contrato de API (imutável)

Uma vez criado um evento:
- riskScore NÃO muda
- riskLevel NÃO muda
- rules NÃO mudam
- metadata NÃO muda

Se qualquer um desses mudar → **BUG CRÍTICO**.

---

### 13.3 Tratamento de erros — Backend

Todos os endpoints antifraude DEVEM:
- Retornar JSON padronizado em erro
- Não expor stacktrace
- Logar erro com prefixo `[FRAUD]`

Exemplo:
```json
{
  "error": "Descrição curta do erro"
}
```

### 13.4 Tratamento de erros — Frontend

Frontend DEVE:
- Exibir erro visível ao usuário
- Não silenciar falhas
- Não deixar tela em loading infinito

### 13.5 Consistência visual

- Status exibido no dashboard e na tela de detalhe DEVEM ser iguais
- Mudança de status reflete imediatamente após invalidate do React Query

### 13.6 Concurrency (não resolver agora)

Não tratar concorrência de múltiplos usuários.
Última escrita vence.
Registrar apenas estado final.

---

## 🧱 BLOCO 14/15 — CRITÉRIO DE ACEITE TÉCNICO E VALIDAÇÃO

### 14.1 Backend — Aceite

Considerar BACKEND aprovado quando:
- `GET /api/fraud/event/:id` retorna evento + turno corretamente
- `POST /api/fraud/event/:id/status` altera SOMENTE status/comment
- `GET /api/fraud/event/:id/pdf` gera PDF válido
- Nenhum endpoint recalcula score
- Nenhum endpoint executa engine fora do fluxo existente

---

### 14.2 Frontend — Aceite

Considerar FRONTEND aprovado quando:
- Dashboard lista eventos com status correto
- Botão "Ver Detalhes" abre a tela do evento
- Tela do evento mostra TODOS os dados:
  - resumo
  - turno
  - regras
  - baseline
- Status pode ser alterado pela UI
- PDF pode ser gerado pela UI

---

### 14.3 UX mínima obrigatória

- Não existir tela vazia
- Não existir botão sem ação
- Não existir dado "inventado"
- Estados de loading e erro visíveis

---

### 14.4 Dados simulados

- Dashboard NÃO pode ficar vazio em ambiente de teste
- Script de seed executável e funcional

---

### 14.5 Prova final

Um usuário NÃO TÉCNICO deve conseguir:

1. Abrir dashboard
2. Abrir um evento
3. Entender por que foi gerado
4. Tomar decisão
5. Gerar PDF
6. Encerrar análise

Se qualquer passo falhar → **NÃO APROVADO**.

---

## 🧱 BLOCO 15/15 — ORDEM DE EXECUÇÃO E CHECKLIST FINAL

### 15.1 Ordem correta de implementação

Executar EXATAMENTE nesta ordem:

1. Criar tipos e status
2. Criar endpoints de leitura do evento
3. Criar endpoint de atualização de status
4. Criar geração de PDF
5. Criar tela de detalhe do evento
6. Ajustar dashboard
7. Ajustar heatmap
8. Criar script de seed
9. Validar critérios de aceite

---

### 15.2 Checklist final (marcar tudo)

- [ ] Evento antifraude possui status editável
- [ ] Tela de detalhe existe
- [ ] Dados exibidos batem com banco
- [ ] Regras são visíveis
- [ ] Baseline é exibido
- [ ] PDF é gerado
- [ ] Dashboard reflete status
- [ ] Heatmap usa score médio
- [ ] Seed populou dados
- [ ] Nenhuma regra antifraude foi alterada

---

### 15.3 Condição de encerramento

Este MD é considerado CONCLUÍDO quando:
- Todos os itens do checklist estiverem verdadeiros
- Não houver divergência entre backend, frontend e PDF

Após isso:
- O antifraude passa a ser considerado **produto validável**
- Evoluções futuras devem partir deste estado

---

**FIM DO DOCUMENTO**
