# RELATÓRIO TÉCNICO DE REVISÃO DO SISTEMA ROTA VERDE

**Data:** 25/12/2025
**Escopo:** Análise estática da cópia do sistema (`SISTEMA_REVISAO`) focada em diagnóstico técnico sem alterações.

---

## 1. Arquitetura

### Diagnóstico
A arquitetura do projeto segue um modelo monorepo contendo Frontend (React/Vite) e Backend (Node/Express) na mesma estrutura. A organização de pastas reflete uma tentativa de modularização (`server/modules`, `client/src/modules`), o que é positivo. No entanto, existem inconsistências e dívidas técnicas visíveis.

**Problemas Encontrados:**
*   **Monolito com Acoplamento Implícito:** Embora haja separação de pastas `client` e `server`, o deploy parece tratar tudo como uma unidade única (vide `Dockerfile` na raiz), o que pode dificultar o escalonamento independente.
*   **Dependência de Scripts manuais:** A existência de muitos scripts na raiz (`scripts/`, `tools/`) e arquivos `.mjs` soltos sugere que processos de migração, backup e manutenção dependem excessivamente de execução manual ou scripts ad-hoc, em vez de pipelines de CI/CD padronizados.
*   **Mistura de Padrões:** Arquivos como `PADRAO_SISTEMA_ROTA_VERDE.MD` definem regras rígidas ("Regra Suprema"), mas a presença de scripts de "fix" (`fix-maintenance-railway.js`, `fix-turnos-railway.js`) indica que a integridade arquitetural foi violada frequentemente, exigindo correções posteriores.
*   **Complexidade de Configuração:** A presença de múltiplos arquivos de configuração e documentação extensa (`PADRAO_SISTEMA_ROTA_VERDE.MD` tem mais de 20 blocos) sugere uma curva de aprendizado alta e risco de "doc drift" (código desatualizado em relação à documentação).

### Impacto Prático
A complexidade aumenta o tempo de on-boarding de novos desenvolvedores e o risco de erros em deploys manuais. A dependência de scripts de correção indica fragilidade na persistência de dados.

---

## 2. Segurança

### Diagnóstico
A análise superficial do código e estrutura revela pontos de atenção crítica.

**Problemas Encontrados:**
*   **Exposição de Scripts Sensíveis:** Scripts como `tools/fix_db_standalone.ts` ou `server/run_sql_migration.ps1` na árvore do código fonte podem ser perigosos se executados inadvertidamente ou se acessíveis em ambiente de produção indevidamente.
*   **Hardcoded Secrets em Scripts (Potencial):** Scripts de migração ou correção rápida (`fix-maintenance-railway.js`) frequentemente contêm credenciais ou tokens "temporários" que acabam sendo commitados. *Nota: Verificar se arquivos `.env` ou credenciais foram commitados no histórico.*
*   **Autenticação e Sessão:** O uso de `session` com `cookie` (mencionado no `app.ts` do padrão) requer configuração cuidadosa de `secure`, `httpOnly` e `sameSite`, especialmente em deploys cross-domain ou proxy reverso (Railway). Configurações incorretas aqui são comuns.

### Impacto Prático
Risco de vazamento de dados ou acesso administrativo não autorizado via scripts esquecidos. Problemas de login (loops de redirecionamento) se a configuração de cookies não estiver perfeitamente alinhada com o domínio do Railway.

---

## 3. Performance

### Diagnóstico
A performance do sistema pode ser afetada por decisões de implementação no backend e frontend.

**Problemas Encontrados:**
*   **Bundle Size do Frontend:** O frontend React parece ser servido pelo backend em produção (`app.use(express.static)`). Se não houver cache headers corretos (CDN/Nginx), o carregamento inicial será lento.
*   **Consultas de Banco (N+1):** O padrão de "loops" em scripts de correção (`fix-maintenance-name.mjs` itera e corrige) sugere que o código principal pode sofrer de problemas de performance em operações em lote se não usar transactions ou queries otimizadas.
*   **Processos Node.js Bloqueantes:** Scripts de manutenção rodando no mesmo servidor da API podem bloquear o Event Loop, causando lentidão na API para usuários finais durante execuções administrativas.

### Impacto Prático
Lentidão perceptível para o usuário final, especialmente em conexões móveis (devido ao bundle) ou durante horários de manutenção (scripts rodando).

---

## 4. Manutenibilidade

### Diagnóstico
A manutenibilidade é o ponto mais crítico observado.

**Problemas Encontrados:**
*   **Excesso de "Scripts de Correção":** A raiz do projeto está poluída com scripts (`fix-*.js`, `check-*.js`, `migrate-*.mjs`). Isso indica que bugs não são resolvidos na raiz (código principal), mas sim "remendados" posteriormente no banco de dados. Isso cria uma dívida técnica eterna.
*   **Documentação vs. Realidade:** O arquivo `PADRAO_SISTEMA_ROTA_VERDE.MD` é extremamente detalhado e prescritivo ("Regras Supremas", "Proibições"). Geralmente, sistemas com esse nível de burocracia documental indicam que o código não é auto-explicativo ou que as regras são frequentemente quebradas, exigindo "leis" mais duras.
*   **Arquivos Gigantes:** A estrutura sugere que a lógica de negócio pode estar centralizada em poucos arquivos grandes (Controllers/Services monolíticos) ou espalhada em scripts soltos, dificultando a refatoração.

### Impacto Prático
Qualquer alteração simples exige leitura de extensa documentação para não "quebrar o padrão". A existência de scripts de correção torna difícil confiar no estado atual do banco de dados (é o schema original ou o corrigido?).

---

## 5. Risco Operacional

### Diagnóstico
O risco operacional refere-se à estabilidade e recuperação do sistema.

**Problemas Encontrados:**
*   **Deploy Manual/Frágil:** A dependência de botões manuais ou scripts locais (`btn-dump-deploy.bat` mencionado na doc) para deploy aumenta drasticamente o risco de erro humano (deploy da versão errada, esquecer migration).
*   **Dependência de "Estado Mágico":** Se o sistema depende de scripts como `init-vehicle-maintenances.mjs` para funcionar corretamente após um deploy, um novo ambiente limpo (disaster recovery) não funcionará apenas com `npm start`.
*   **Backup e Restore:** Embora haja scripts de backup, a restauração parece manual e dependente de ferramentas externas (`psql` via CLI). Em uma emergência real, o tempo de recuperação (RTO) pode ser alto.

### Impacto Prático
Alta probabilidade de *downtime* prolongado em caso de falha crítica ou erro humano durante deploy. Dificuldade em replicar o ambiente de produção para testes (o ambiente de dev nunca está igual ao de prod devido aos scripts de correção manuais).

---

## Conclusão

O sistema `SISTEMA_REVISAO` (cópia do Oficial) apresenta uma base funcional, mas sofre de "Síndrome de Correção Pós-Deploy". Em vez de corrigir a causa raiz dos bugs no código principal, foram criados inúmeros scripts periféricos para limpar dados ou ajustar estados.

**Recomendação Imediata (Próximos Passos):**
1.  **Congelar Scripts de Correção:** Proibir a criação de novos `fix-*.js`.
2.  **Incorporar Lógica:** Mover a lógica desses scripts para dentro das *migrations* oficiais ou do código da aplicação (Services), garantindo que os dados sejam corrigidos na entrada, não a posteriori.
3.  **Limpeza:** Arquivar scripts antigos que já cumpriram seu propósito para limpar a raiz do projeto.
