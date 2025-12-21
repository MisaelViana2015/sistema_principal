# Rota Verde - Monorepo

## Estrutura do Projeto

- `/client`: Frontend (React + Vite + Nixpacks)
- `/server`: Backend (Node.js + Express + Drizzle + Docker)
- `/shared`: Schemas e tipos compartilhados
- `/tools`: Scripts operacionais e utilitários de deploy
- `/docs`: Documentação técnica e logs do sistema
- `/backups`: Backups de banco de dados e arquivos críticos

## Como Desenvolver Localmente

1. Entre na pasta desejada (`client` ou `server`)
2. Execute `npm install`
3. Use os scripts definidos no `package.json` de cada pasta.

## Deploy no Railway

O sistema está configurado para dois serviços distintos:
1. **API (Backend)**: Root Directory `/server`, usa `Dockerfile`.
2. **App (Frontend)**: Root Directory `/client`, usa `Nixpacks`.

## Documentação Principal
Consulte o arquivo `PADRAO_SISTEMA_ROTA_VERDE.MD` na raiz para diretrizes detalhadas.
