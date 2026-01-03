"""
Teste de diagnóstico do Playwright - para identificar problema em abrir o Chrome
"""
import sys
import os

# Adicionar path para imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("=" * 50)
print("DIAGNÓSTICO DO PLAYWRIGHT")
print("=" * 50)

# 1. Verificar se Playwright está instalado
print("\n[1] Verificando Playwright...")
try:
    from playwright.sync_api import sync_playwright
    print("✅ Playwright importado com sucesso")
except ImportError as e:
    print(f"❌ ERRO: Playwright não instalado: {e}")
    sys.exit(1)

# 2. Verificar instalação do Chromium
print("\n[2] Verificando navegadores instalados...")
try:
    import subprocess
    result = subprocess.run(
        [sys.executable, "-m", "playwright", "install", "--dry-run"],
        capture_output=True, text=True
    )
    if "chromium" in result.stdout.lower():
        print("✅ Chromium disponível")
    else:
        print("⚠️ Pode ser necessário instalar: playwright install chromium")
except Exception as e:
    print(f"⚠️ Não foi possível verificar: {e}")

# 3. Tentar abrir o browser
print("\n[3] Tentando abrir Chrome...")
profile_dir = r"c:\dev\agente-ia\chrome_profile"
print(f"   Perfil: {profile_dir}")

try:
    pw = sync_playwright().start()
    print("   Playwright iniciado...")
    
    ctx = pw.chromium.launch_persistent_context(
        user_data_dir=profile_dir,
        headless=False,
        channel="chrome",
        timeout=30000,  # 30 segundos
        args=["--start-maximized"]
    )
    print("✅ Chrome abriu com sucesso!")
    
    page = ctx.new_page()
    print("   Nova página criada...")
    
    page.goto("https://chat.openai.com", timeout=30000)
    print("✅ Navegou para ChatGPT!")
    
    print("\n" + "=" * 50)
    print("SUCESSO! Pressione ENTER para fechar...")
    print("=" * 50)
    input()
    
    ctx.close()
    pw.stop()
    
except Exception as e:
    print(f"\n❌ ERRO DETECTADO:")
    print(f"   Tipo: {type(e).__name__}")
    print(f"   Mensagem: {e}")
    
    import traceback
    print("\n   Traceback completo:")
    traceback.print_exc()
    
    print("\n[POSSÍVEIS SOLUÇÕES]")
    print("1. Verificar se Chrome está instalado: C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")
    print("2. Executar: playwright install chrome")
    print("3. Fechar todas as instâncias do Chrome antes")
    print("4. O perfil pode estar corrompido - deletar c:\\dev\\agente-ia\\chrome_profile")
