@echo off
:: ============================================
:: AGENTE IA - ROTA VERDE - AUTO START
:: Este script inicia o agente automaticamente
:: ============================================

cd /d c:\dev\agente-ia

:: Verificar se venv existe
if not exist venv (
    echo Criando ambiente virtual...
    python -m venv venv
    call venv\Scripts\activate
    echo Instalando dependencias...
    pip install -r requirements.txt
    playwright install chromium
) else (
    call venv\Scripts\activate
)

:: Iniciar painel de controle em segundo plano
echo Iniciando Painel de Controle...
start /min "" pythonw web/app.py

:: Aguardar o servidor subir
timeout /t 5 /nobreak >nul

:: Fazer o agente iniciar automaticamente via API
echo Iniciando Agente automaticamente...
curl -s -X POST http://localhost:5000/api/start >nul 2>&1

echo.
echo ========================================
echo   AGENTE IA INICIADO AUTOMATICAMENTE
echo   Painel: http://localhost:5000
echo ========================================

exit
