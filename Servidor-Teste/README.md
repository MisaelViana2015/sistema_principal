# Sistema Rota Verde - Railway Deploy ✅

Sistema de Gestão de Frota **deployado com sucesso** no Railway.

## 🌐 Acessos Rápidos

- **Aplicação:** https://rt-frontend.up.railway.app
- **GitHub:** https://github.com/MisaelViana2015/rota-verde-06-12-25
- **Documentação Completa:** [DEPLOY_RAILWAY_SUCESSO.md](./DEPLOY_RAILWAY_SUCESSO.md)

## 🔐 Login Padrão

- **Email:** admin@rotaverde.com
- **Senha:** admin *(trocar após primeiro login)*

---

## 🚀 Como Usar

### Desenvolvimento Local
```bash
npm install
npm run dev          # Backend (porta 5000)
npx vite            # Frontend (porta 5173)
```

### Deploy
```bash
git add .
git commit -m "Sua mensagem"
git push            # Deploy automático no Railway
```

### Backup do Banco
```bash
npm run db:backup   # Cria backup em /backups
```

---

## 📚 Documentos Importantes

1. **[DEPLOY_RAILWAY_SUCESSO.md](./DEPLOY_RAILWAY_SUCESSO.md)** - Documentação completa do deploy
2. **[DOCUMENTACAO_FINAL_E_BACKUP.md](./DOCUMENTACAO_FINAL_E_BACKUP.md)** - Documentação do sistema
3. **[LEIA_PRIMEIRO_MISAEL.md](./LEIA_PRIMEIRO_MISAEL.md)** - Guia de início rápido

---

## 🛠️ Scripts Úteis

```bash
npm run dev         # Desenvolvimento
npm run build       # Build produção
npm start           # Inicia produção

npm run db:push     # Atualiza schema do banco
npm run db:studio   # Abre Drizzle Studio
npm run db:seed     # Popula banco (interativo)
npm run db:backup   # Backup do banco
```

---

## 📞 Suporte

- **Logs:** `railway logs --service rota-verde`
- **Status:** https://rt-frontend.up.railway.app/api/health
- **Issues:** https://github.com/MisaelViana2015/rota-verde-06-12-25/issues

---

**Deploy realizado em:** 06/12/2024  
**Status:** ✅ Operacional
