# 🚀 GUIA DE INÍCIO RÁPIDO - ROTA VERDE

## ⚡ Começar em 5 minutos

### 1️⃣ Instalar Dependências

```bash
cd rota-verde-novo
npm install
```

⏱️ Tempo estimado: 2-3 minutos

---

### 2️⃣ Configurar Banco de Dados

**Opção A: Usar Railway (Recomendado para produção)**

1. Acesse o Railway e copie a `DATABASE_URL` do PostgreSQL
2. Edite o arquivo `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:senha@host.railway.app:5432/railway
   ```

**Opção B: Usar PostgreSQL Local (Desenvolvimento)**

1. Instale PostgreSQL localmente
2. Crie um banco chamado `rota_verde`
3. Configure no `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:suasenha@localhost:5432/rota_verde
   ```

---

### 3️⃣ Criar Tabelas no Banco

```bash
npm run db:push
```

Isso criará as tabelas `drivers` e `sessions` no banco.

---

### 4️⃣ Criar Usuário Admin

```bash
npm run db:seed
```

Quando perguntar, digite `s` para confirmar.

**Credenciais criadas:**
- Email: `admin@rotaverde.com`
- Senha: `admin`

⚠️ **Altere a senha após primeiro login!**

---

### 5️⃣ Iniciar o Sistema

**Opção A: Iniciar tudo de uma vez (Recomendado)**

```bash
npm run dev
```

**Opção B: Iniciar separadamente**

Terminal 1 - Backend:
```bash
npm run dev
```

Terminal 2 - Frontend (em outro terminal):
```bash
cd rota-verde-novo
npx vite
```

---

### 6️⃣ Acessar o Sistema

Abra o navegador em: **http://localhost:5173**

Faça login com:
- Email: `admin@rotaverde.com`
- Senha: `admin`

---

## ✅ Verificações

### Backend funcionando?
Acesse: http://localhost:5000/health

Deve retornar:
```json
{
  "success": true,
  "message": "Sistema Rota Verde - API funcionando",
  "timestamp": "...",
  "environment": "development"
}
```

### Banco conectado?
No terminal do backend, deve aparecer:
```
✅ Conexão com banco de dados estabelecida
✅ Teste de conexão bem-sucedido
```

### Frontend funcionando?
Acesse: http://localhost:5173

Deve aparecer a tela de login.

---

## 🐛 Problemas Comuns

### Erro: "DATABASE_URL não definida"
**Solução:** Configure o `.env` com a URL do banco

### Erro: "Cannot connect to database"
**Solução:** 
1. Verifique se o PostgreSQL está rodando
2. Verifique se a URL está correta
3. Teste a conexão manualmente

### Erro: "Port 5000 already in use"
**Solução:** 
1. Mude a porta no `.env`: `PORT=5001`
2. Ou mate o processo: `npx kill-port 5000`

### Erro: "Module not found"
**Solução:** Execute `npm install` novamente

---

## 📝 Comandos Úteis

```bash
# Instalar dependências
npm install

# Iniciar desenvolvimento
npm run dev

# Criar/atualizar tabelas
npm run db:push

# Criar admin
npm run db:seed

# Ver estrutura do banco (Drizzle Studio)
npm run db:studio

# Build para produção
npm run build

# Iniciar produção
npm start
```

---

## 🎯 Próximos Passos

Após o login funcionar:

1. ✅ Alterar senha do admin
2. ⏳ Implementar módulo de veículos
3. ⏳ Implementar módulo de turnos
4. ⏳ Implementar módulo de corridas
5. ⏳ Deploy no Railway

---

## 🆘 Precisa de Ajuda?

1. Verifique `README.md`
2. Consulte `docs/status/STATUS_PROJETO.md`
3. Leia `PADRAO_SISTEMA_ROTA_VERDE.MD`

---

**Boa sorte! 🚀**
