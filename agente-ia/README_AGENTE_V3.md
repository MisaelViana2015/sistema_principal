# Agente IA Rota Verde (Versão Local V3)

Este agente roda localmente usando Ollama (LLM) para analisar fraudes e validar cálculos.

## Pré-requisitos
1. **Ollama** instalado e rodando (`ollama serve`).
2. Modelo **Mistral** baixado (`ollama pull mistral`).
3. Endpoint API Backend Rota Verde acessível (se for usar dados reais).

## Como Iniciar (Forma Correta)
Sempre use o script de limpeza para garantir que não haja processos presos:

1. Feche terminais antigos.
2. Execute:
   ```cmd
   c:\dev\agente-ia\start_agent_clean.bat
   ```
3. A interface abrirá em: `http://localhost:5000`

## Comandos Úteis
- **Verificar Status:** `http://localhost:5000/api/status`
- **Logs:** Verifique a janela do terminal ou o arquivo `logs/agent.log`.

## Notas Técnicas
- O código fonte principal é `src/agent_manager.py`.
- O cliente LLM é `src/ollama_client.py`.
- **NÃO** existe mais automação de browser (Selenium/Playwright). Tudo é via API Ollama.
