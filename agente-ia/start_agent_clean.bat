@echo off
echo ========================================
echo   LIMPEZA E START - AGENTE IA
echo ========================================
echo.

cd /d c:\dev\agente-ia

echo Matando processos Python presos...
taskkill /IM python.exe /F 2>nul

echo Limpando cache compilado (.pyc)...
del /S /Q *.pyc 2>nul
rmdir /S /Q src\__pycache__ 2>nul
rmdir /S /Q web\__pycache__ 2>nul

echo.
echo ========================================
echo   INICIANDO NOVO AGENTE (OLLAMA)
echo ========================================
echo.

if not exist venv (
    echo Criando VENV...
    python -m venv venv
    call venv\Scripts\activate
    pip install -r requirements.txt
) else (
    call venv\Scripts\activate
)

echo Iniciando Painel...
python web/app.py

pause
