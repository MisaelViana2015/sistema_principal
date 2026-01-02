@echo off
echo ========================================
echo   AGENTE IA - ROTA VERDE
echo ========================================
echo.

cd /d c:\dev\agente-ia

:: Verificar se venv existe, se nao criar
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

:: Iniciar painel de controle
echo Iniciando Painel de Controle...
start "Painel IA" python web/app.py

echo.
echo Painel disponivel em: http://localhost:5000
echo.
pause
