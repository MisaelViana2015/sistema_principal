# Relatórios de Migração e Estado Atual - Rota Verde
**Data:** 17 de Dezembro de 2025

---

## 1. O que foi realizado nesta sessão
Realizamos uma migração crítica para colocar o **Servidor Principal** operacional e sincronizado com o **Servidor de Teste**.

### Ações Técnicas:
- **Resolução de Deploy**: Abandonamos o Railpack/Nixpacks (que travava o arquivo `.vite`) e implementamos um **Dockerfile profissional multi-stage**. Isso resolveu definitivamente os erros de build no Railway.
- **Sincronização de Código**: O código do `Servidor-Teste` (com todas as melhorias de cálculos financeiros, categorização de corridas e UI) foi espelhado para o repositório principal.
- **Resgate de Dados**: 
    - Identificamos uma disparidade de dados (Produção com 98 páginas, Teste com 150).
    - Criamos um endpoint temporário de emergência `/api/restore/restore-from-backup`.
    - Executamos a restauração total dos dados do teste para a produção, processando **5.285 statements SQL**.
    - **Resultado**: Ambos os servidores estão agora 100% sincronizados em código e dados.

---

## 2. Estado Atual dos Ambientes

### **Servidor de Teste (HML)**
- **URL**: `https://servidor-teste-production-54fe.up.railway.app`
- **Status**: Operacional, dados completos (150 páginas).
- **Repositório**: `MisaelViana2015/Servidor-Teste`

### **Servidor Principal (PROD)**
- **URL**: `https://rt-frontend.up.railway.app`
- **Status**: **ACTIVE** e Operacional.
- **Dados**: Sincronizados com o teste via script de resgate.
- **Repositório**: `MisaelViana2015/Rota-Verde-Servidor-Principal` (alias de `rota-verde-06-12-25`)

---

## 3. "Dívida Técnica" e Próximos Passos (O que vamos resolver diferente)
Como discutido, o processo atual contém "remendos" que precisam ser removidos para seguir o `PADRAO_SISTEMA_ROTA_VERDE.MD` com rigor:

### Tarefas Pendentes de Limpeza:
1.  **Remover Endpoint de Risco**: Apagar `server/routes/restore.routes.ts` e sua referência no `app.ts`. É perigoso manter uma rota que pode sobrescrever o banco via API.
2.  **Limpeza do Repositório**: Deletar o arquivo `restore_production.sql` (1.4MB) do Git. Dados de banco não devem estar no controle de versão.
3.  **Unificação de Dockerfile**: Garantir que o Dockerfile seja o mesmo para ambos, diferenciando apenas via Variáveis de Ambiente.
4.  **Fluxo de Trabalho Git**: Implementar a estrutura de branches (`develop` -> `main`) para evitar a cópia manual de pastas entre diretórios locais.

---

## 4. Notas para a Retomada
- O banco de dados de produção agora é considerado **SAGRADO**.
- O sistema está "Inquebrável" no momento, mas com arquivos "lixo" (o SQL de restore) que serão os primeiros a serem removidos na volta.

**O sistema está pronto para você reiniciar e atualizar. Tudo salvo e com commit no GitHub em ambos os lados.**
