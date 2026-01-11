# Padrão de Segurança do Sistema Rota Verde
**Versão:** 1.2.0
**Status:** Ativo

Este documento define os padrões de segurança obrigatórios para o desenvolvimento e manutenção do sistema Rota Verde.

---

## 1. Princípios Fundamentais
1.  **Negue por Padrão:** Todo acesso é bloqueado a menos que explicitamente permitido.
2.  **Defesa em Profundidade:** Múltiplas camadas de proteção (Frontend, Gateway, Controller, Banco).
3.  **Privilégio Mínimo:** Usuários e serviços têm apenas as permissões essenciais.

---

## 2. Autenticação e Sessão
- **JWT:** Uso obrigatório de `Authorization: Bearer <token>`.
- **Validade:** Token de acesso curto (ex: 2h) e Refresh Token rotativo (14 dias).
- **Bloqueio:** Usuários com `isActive: false` devem ser bloqueados imediatamente, inclusive se o token ainda for válido (verificado via middleware).
- **Anti-Automação:** Rate limit rigoroso no login (5 req/min ou similar) e Idempotency Key em POSTs críticos.

> **📌 Nota Arquitetural (isActive Check):**
> O check de `isActive` ocorre em TODA requisição autenticada via `authMiddleware`.
> Impacto de performance aceitável (consulta simples por PK, ~1-5ms).
> Pode ser otimizado com cache curto (ex: 60s em Redis) no futuro se necessário.

---

## 3. Controle de Acesso (Authorization)
- **RBAC:** Uso estrito de Roles (`admin`, `driver`, `supervisor`).
- **Ownership:** Usuários só podem acessar/modificar recursos que lhes pertencem (`driverId` deve vir do Token, nunca do Body).
- **Proteção de Dados:**
    - Lista de Motoristas: Apenas Admin.
    - Detalhes Financeiros: Apenas Dono ou Admin.

> **📌 Nota sobre Ownership Middleware:**
> O middleware `requireShiftOwner` NÃO substitui a validação de existência do recurso.
> Controllers que dependem de ownership DEVEM validar a presença e existência do recurso obrigatoriamente.

---

## 4. Proteção de Dados e Privacidade
- **Senhas:** Hashing com Bcrypt (mínimo 10 rounds).
- **Logs:**
    - **Obrigatório:** Logar `userId`, `IP`, `action`, `payloadHash` de operações financeiras.
    - **payloadHash:** `sha256(body)` para rastreabilidade sem expor PII.
    - **Proibido:** Logar senhas, tokens ou body completo com dados sensíveis.
- **Payload:**
    - Limite global: `10kb` para operações normais.
    - Exceção: `50mb` **somente** em rotas admin de restore, **com** `requireAdmin` + rate-limit específico + timeout de request.

---

## 5. Desenvolvimento Seguro
- **Transações:** Todas as operações que afetam mais de uma tabela (ex: finalizar turno + atualizar veículo) devem ser atômicas.
- **Validação:** Zod schemas para TODAS as entradas.
    - **Dinheiro:** `.min(0.01)` — zero não é permitido em valores monetários.
    - **Kilometragem:** `.min(0)` — zero é permitido.
- **SQL Injection:** Proibido concatenação de strings em queries. Uso obrigatório de ORM (Drizzle) ou Prepared Statements.

---

## 6. Auditoria
- O sistema deve manter um rastro de auditoria (`auditLogger`) para todas as operações de escrita (`POST`, `PUT`, `DELETE`) em módulos críticos.
- **Ações Semânticas:** Usar nomes de ação claros como `CREATE_EXPENSE`, `FINISH_SHIFT`, `DELETE_RIDE`.

---

## 7. Anti-Replay (Idempotência)
POSTs críticos devem usar o middleware `preventReplay` para bloquear requisições duplicadas em janela de 5 minutos.

**Endpoints obrigatórios:**
- `POST /financial/expenses`
- `POST /rides`
- `POST /shifts/start` (via `/shifts` POST)
- `POST /shifts/:id/finish`

> **⚠️ Nota de Produção:**
> A implementação atual usa Map em memória e NÃO é adequada para:
> - Múltiplas instâncias (horizontal scaling)
> - Ambientes com restart frequente
>
> Para produção multi-instance, substituir por Redis ou store compartilhado.

---

## 8. Checklist de Deploy (Security Gate)
Antes de qualquer subida para produção:
- [ ] Rodar `tools/security-gate.ps1` e garantir exit 0.
- [ ] Verificar se novas rotas têm `requireAuth` e `permission check`.
- [ ] Confirmar se migrações de banco não expõem dados.
- [ ] Validar que operações financeiras possuem `auditLog`.
- [ ] Verificar ownership em rotas que manipulam recursos de usuário.

---
**Documento mantido pelo time de Segurança / AI Agent.**
**Última atualização:** 31/12/2025
