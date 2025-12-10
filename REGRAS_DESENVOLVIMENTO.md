# ⚠️ REGRAS DE DESENVOLVIMENTO - LEIA ANTES DE QUALQUER ALTERAÇÃO

**Data:** 07/12/2025  
**Autor:** Misael Viana  
**Status:** REGRAS OBRIGATÓRIAS

---

## 🎯 REGRA #1: NÃO EXTRAPOLAR

### ❌ O QUE NÃO FAZER:

- ❌ **NÃO** mexer em arquivos não relacionados à tarefa
- ❌ **NÃO** trocar senhas sem autorização
- ❌ **NÃO** renomear servidores
- ❌ **NÃO** mudar 999 arquivos para fazer 1 coisa
- ❌ **NÃO** refatorar código que já funciona
- ❌ **NÃO** "melhorar" coisas que não foram pedidas

### ✅ O QUE FAZER:

- ✅ **APENAS** o que foi pedido
- ✅ **MÍNIMO** de arquivos modificados
- ✅ **CIRÚRGICO** - mexer só no necessário
- ✅ **PERGUNTAR** se não tiver certeza

---

## 📂 REGRA #2: ESTRUTURA DE TRABALHO

### 🔧 SERVIDOR-TESTE (Base de Trabalho)

```
Pasta: Servidor-Teste
Uso: DESENVOLVIMENTO E TESTES
Deploy: Railway HML
URL: https://servidor-teste-production-54fe.up.railway.app
```

**AQUI você:**
- ✅ Desenvolve novas funcionalidades
- ✅ Testa localmente
- ✅ Faz experimentos
- ✅ Pode quebrar sem problemas

### 🟢 SISTEMA_ROTA_VERDE_06_12_25 (Produção)

```
Pasta: Sistema_Rota_Verde_06_12_25
Uso: CÓDIGO VALIDADO
Deploy: Railway PROD
URL: https://rt-frontend.up.railway.app
```

**AQUI vai:**
- ✅ Código testado e aprovado
- ✅ Funcionalidades 100% funcionando
- ✅ Versão estável
- ❌ NUNCA código não testado

---

## 🔄 REGRA #3: WORKFLOW OBRIGATÓRIO

### Passo 1: Desenvolver em Servidor-Teste
```bash
cd Servidor-Teste
# Fazer alterações
# Testar localmente
```

### Passo 2: Validar
```bash
# Testar TUDO
# Garantir que funciona 100%
# Sem erros, sem bugs
```

### Passo 3: Copiar para Produção (SE APROVADO)
```bash
cd ..
robocopy "Servidor-Teste" "Sistema_Rota_Verde_06_12_25" /E /XD ".git" "node_modules" "dist"
```

### Passo 4: Deploy
```bash
cd Sistema_Rota_Verde_06_12_25
git add .
git commit -m "feat: funcionalidade validada"
git push origin main
```

---

## 📋 REGRA #4: EXEMPLO PRÁTICO

### ❌ ERRADO:

**Tarefa:** Criar menu de navegação

**O que NÃO fazer:**
- ❌ Mexer no sistema de autenticação
- ❌ Mudar cores do tema
- ❌ Refatorar componentes existentes
- ❌ Criar 50 arquivos novos
- ❌ Mudar estrutura do banco
- ❌ Alterar variáveis de ambiente

### ✅ CORRETO:

**Tarefa:** Criar menu de navegação

**O que fazer:**
- ✅ Criar `Navigation.tsx` (1 arquivo)
- ✅ Criar `MainLayout.tsx` (1 arquivo)
- ✅ Atualizar `App.tsx` (adicionar rotas)
- ✅ **PRONTO!** Apenas 3 arquivos modificados

---

## 🎯 REGRA #5: PRINCÍPIO DO MÍNIMO

### Sempre pergunte:

1. **Preciso MESMO mexer neste arquivo?**
2. **Existe uma forma MAIS SIMPLES?**
3. **Estou fazendo APENAS o que foi pedido?**
4. **Quantos arquivos vou modificar?** (quanto menos, melhor)

### Limites:

- ✅ **1-3 arquivos:** OK, provavelmente está certo
- ⚠️ **4-10 arquivos:** Cuidado, pode estar extrapolando
- ❌ **10+ arquivos:** PARE! Você está fazendo errado

---

## 📝 REGRA #6: DOCUMENTAÇÃO

### Sempre documentar:

- ✅ O que foi feito
- ✅ Quais arquivos foram modificados
- ✅ Por que foram modificados
- ✅ Como testar

### Formato:

```markdown
## Tarefa: [Nome da tarefa]

### Arquivos Modificados:
1. arquivo1.tsx - Motivo
2. arquivo2.tsx - Motivo

### Como Testar:
1. Passo 1
2. Passo 2

### Resultado:
- ✅ Funciona
- ❌ Não funciona
```

---

## ⚠️ REGRA #7: QUANDO TIVER DÚVIDA

### SEMPRE:

1. **PARE**
2. **PERGUNTE**
3. **AGUARDE CONFIRMAÇÃO**
4. **SÓ ENTÃO FAÇA**

### NUNCA:

1. ❌ "Vou fazer e depois pergunto"
2. ❌ "Vou melhorar isso também"
3. ❌ "Vou refatorar enquanto estou aqui"
4. ❌ "Vou mudar isso que está 'errado'"

---

## 🚨 REGRA #8: CÓDIGO QUE FUNCIONA

### REGRA DE OURO:

> **"Se está funcionando, NÃO MEXA!"**

### Exceções:

- ✅ Bug crítico
- ✅ Solicitação explícita
- ✅ Segurança
- ❌ "Acho que poderia ser melhor"
- ❌ "Não está no padrão que eu gosto"
- ❌ "Vou otimizar"

---

## 📊 REGRA #9: PRIORIDADES

### Ordem de Importância:

1. **FUNCIONAR** (mais importante)
2. **SIMPLES** (segundo mais importante)
3. **RÁPIDO** (terceiro)
4. **BONITO** (último)

### NÃO:

1. ❌ Bonito mas quebrado
2. ❌ Complexo mas "perfeito"
3. ❌ Lento mas "otimizado"

---

## ✅ REGRA #10: CHECKLIST ANTES DE QUALQUER ALTERAÇÃO

Antes de modificar QUALQUER arquivo, responda:

- [ ] Isso foi pedido explicitamente?
- [ ] É o MÍNIMO necessário?
- [ ] Vou mexer em MENOS de 5 arquivos?
- [ ] Sei EXATAMENTE o que estou fazendo?
- [ ] Testei localmente?
- [ ] Documentei as mudanças?

**Se qualquer resposta for NÃO, PARE e PERGUNTE!**

---

## 🎯 RESUMO EXECUTIVO

### Base de Trabalho:
```
Servidor-Teste → Desenvolver e Testar
Sistema_Rota_Verde_06_12_25 → Código Validado
```

### Regras Principais:
1. ✅ **NÃO EXTRAPOLAR**
2. ✅ **MÍNIMO DE ARQUIVOS**
3. ✅ **APENAS O PEDIDO**
4. ✅ **TESTAR ANTES**
5. ✅ **PERGUNTAR SE TIVER DÚVIDA**

---

## 📞 QUANDO PRECISAR DE AJUDA

**SEMPRE pergunte se:**
- Não tiver certeza
- Precisar mexer em mais de 5 arquivos
- For mudar algo que já funciona
- Tiver qualquer dúvida

**NUNCA:**
- Faça algo "por conta própria"
- Mude coisas sem autorização
- Refatore código funcionando
- Extrapole a tarefa

---

## 🏷️ REGRA #11: VERSIONAMENTO DE COMMITS (OBRIGATÓRIO)

### Formato do Commit:

```
[TIPO] v[VERSÃO] - [DESCRIÇÃO] | Arquivos: [LISTA]
```

### Exemplo:

```bash
git commit -m "feat: v1.1 - Menu de navegação implementado | Arquivos: Navigation.tsx, MainLayout.tsx, App.tsx"
```

### Componentes Obrigatórios:

1. **[TIPO]:** 
   - `feat:` - Nova funcionalidade
   - `fix:` - Correção de bug
   - `docs:` - Documentação
   - `style:` - Formatação
   - `refactor:` - Refatoração
   - `test:` - Testes

2. **v[VERSÃO]:**
   - Formato: `v1.0`, `v1.1`, `v2.0`
   - Incrementar a cada deploy
   - Manter histórico

3. **[DESCRIÇÃO]:**
   - Breve e clara
   - O que foi feito

4. **Arquivos:**
   - Lista de TODOS os arquivos modificados
   - Separados por vírgula
   - Apenas o nome do arquivo (sem path completo)

### Exemplos Corretos:

```bash
# Nova funcionalidade
git commit -m "feat: v1.2 - Sistema de login | Arquivos: LoginPage.tsx, api.ts, auth.service.ts"

# Correção de bug
git commit -m "fix: v1.3 - Corrigido erro 500 no login | Arquivos: auth.controller.ts"

# Múltiplos arquivos
git commit -m "feat: v1.4 - Dashboard completo | Arquivos: DashboardPage.tsx, Header.tsx, Stats.tsx, api.ts"
```

### Exemplos ERRADOS:

```bash
# ❌ Sem versão
git commit -m "feat: Menu implementado"

# ❌ Sem arquivos
git commit -m "feat: v1.2 - Menu implementado"

# ❌ Sem tipo
git commit -m "v1.2 - Menu implementado | Arquivos: Navigation.tsx"

# ❌ Genérico demais
git commit -m "feat: v1.2 - Alterações | Arquivos: vários"
```

### Por Que Isso é Importante:

1. ✅ **Rastreabilidade:** Saber exatamente o que mudou
2. ✅ **Versionamento:** Controle de versões claro
3. ✅ **Debugging:** Fácil identificar quando algo quebrou
4. ✅ **Rollback:** Reverter para versão específica
5. ✅ **Auditoria:** Histórico completo de mudanças

### Como Verificar se o Arquivo Subiu:

1. Ver o commit no GitHub
2. Verificar a versão no commit
3. Confirmar que os arquivos listados estão lá
4. Comparar com o deploy no Railway

### Checklist Antes do Commit:

- [ ] Listei TODOS os arquivos modificados?
- [ ] Incrementei a versão corretamente?
- [ ] A descrição está clara?
- [ ] O tipo está correto (feat, fix, etc)?
- [ ] Testei localmente antes?

---

**Última atualização:** 07/12/2025 09:18  
**Autor:** Misael Viana  
**Status:** ⚠️ OBRIGATÓRIO - LEIA SEMPRE ANTES DE COMEÇAR
