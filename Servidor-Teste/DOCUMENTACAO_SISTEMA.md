# DOCUMENTAÇÃO GERAL - SISTEMA ROTA VERDE

**Bem-vindo à documentação unificada do Sistema Rota Verde.**

---

## 📌 REGRA DE OURO - AMBIENTE DE DESENVOLVIMENTO

**⚠️ ATENÇÃO:**
Todo e qualquer desenvolvimento, correção ou manutenção deve ser realizado EXCLUSIVAMENTE dentro do diretório:
`.../Servidor-Teste`

**NÃO** crie arquivos na raiz do repositório (fora desta pasta).
**NÃO** modifique arquivos de backup sem autorização explícita.

---

## 🚀 GUIA DE DEPLOY (RAILWAY)

### ⚠️ Configuração Crítica do Railway

Para que o Railway encontre os arquivos corretamente, a configuração **ROOT DIRECTORY** deve ser definida corretamente nas configurações do serviço.

**Configuração Correta:**
- **Root Directory:** `/Servidor-Teste`

**Motivo:** O repositório contém o projeto dentro de uma subpasta. Se deixar vazio, o Railway não encontra o `package.json`.

### Build e Comandos
O projeto utiliza `nixpacks` configurado na raiz (`nixpacks.toml`):
- **Install:** `npm ci`
- **Build:** `npm run build`
- **Start:** `npm start`

---

## 📊 STATUS DO PROJETO

**Última atualização:** 10/12/2025

### ✅ Implementado (Funcionando)
- **Estrutura:** Typescript, Vite, Express, Drizzle ORM.
- **Autenticação:** Login funcional (JWT), hash de senha (bcrypt), proteção de rotas.
- **Frontend:** Dashboard, Página de Veículos (com correções de crash), Integração API.
- **Deploy:** Configurado e operante no Railway.

### 🚧 Em Andamento / Pendente
1. **Validação de Produção:** Testar conexão com banco de produção e verificar dados reais.
2. **Módulos Core:** Finalizar integração de Turnos, Corridas e Manutenções.
3. **Admin Legacy:** Migração completa das funcionalidades legadas.

---

## 🛠️ COMANDOS ÚTEIS

### Desenvolvimento Local
```bash
# Iniciar servidor e cliente simultaneamente
npm run dev

# Apenas servidor
node --loader ts-node/esm server/index.ts

# Apenas cliente
npm run dev:client
```

### Banco de Dados
```bash
# Enviar schema para o banco (Drizzle)
npm run db:push

# Popular banco com dados iniciais
npm run db:seed
```

### Build
```bash
# Compilar projeto para produção
npm run build
```

---

## 📝 HISTÓRICO RECENTE
- **10/12/2025:** Correção da tela branca em "Veículos" (auth check). Configuração de Deploy Railway (Nixpacks + Root Directory Fix). Unificação da documentação.
