@echo off
echo Parando Agente IA...
for /f "tokens=2" %%a in ('tasklist ^| findstr /i "python.exe"') do (
  echo Tentando finalizar PID %%a (pode requerer confirmacao manual se for processo critico)...
)
echo.
echo ========================================================
echo ATENCAO: Este script apenas lista os processos Python.
echo Para parar o agente, use o botao STOP no painel web.
echo Se o painel travou, feche a janela do console onde ele esta rodando.
echo ========================================================
echo.
echo Pressione qualquer tecla para sair...
pause
