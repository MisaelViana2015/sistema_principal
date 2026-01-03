import sys
sys.path.insert(0, "c:\\dev\\agente-ia\\src")

from playwright.sync_api import sync_playwright

print("Testando Playwright com Chrome...")

try:
    pw = sync_playwright().start()
    ctx = pw.chromium.launch_persistent_context(
        "c:\\dev\\agente-ia\\chrome_profile",
        headless=False,
        channel="chrome"
    )
    print("OK - Chrome abriu!")
    page = ctx.new_page()
    page.goto("https://chat.openai.com")
    print("Navegou para ChatGPT!")
    input("Pressione ENTER para fechar...")
    ctx.close()
    pw.stop()
except Exception as e:
    print(f"ERRO: {e}")
    import traceback
    traceback.print_exc()
