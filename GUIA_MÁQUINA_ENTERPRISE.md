# 📝 GUIA: Workstation Enterprise Rota Verde

Este documento registra a configuração profissional realizada em 19/12/2025 para garantir estabilidade absoluta no desenvolvimento.

## 🛠️ Ferramentas Instaladas
- **Shell:** PowerShell 7 (pwsh) + Windows Terminal
- **Node.js:** NVM-Windows (Gerenciador de versões)
- **Editor:** VS Code
- **Bancos de Dados:** DBeaver Community + PostgreSQL 17 Client
- **API:** Insomnia Core
- **Container:** Docker Desktop
- **Produtividade:** Microsoft PowerToys

## 📂 Nova Estrutura de Trabalho
As pastas de projeto devem residir em: `C:\dev\`
*Exemplo: `C:\dev\rota-verde-railway`*

**POR QUE MUDAR?**
1. **OneDrive:** Sincronização automática causa "lock" em arquivos do `node_modules`, gerando erros de permissão negada.
2. **Caminhos:** Pastas com espaços (ex: "Área de Trabalho") exigem aspas extras e falham em scripts automatizados.
3. **Velocidade:** Discos nativos (`C:`) são mais rápidos que pastas sincronizadas em nuvem.

## 🔐 Segurança (SSH)
Chave pública gerada em: `C:\Users\Misael\.ssh\id_ed25519.pub`
Chave privada em seu perfil para conexões seguras com GitHub e servidores.

---

## 🚀 Status da Migração de Produção
- O servidor está **ONLINE** no Railway.
- As tabelas do banco de produção estão **CRIADAS** e limpas.
- **Próximo passo na volta:** Executar a sincronização de dados do teste para a produção.
