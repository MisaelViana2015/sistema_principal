import time
import logging
from playwright.sync_api import sync_playwright, TimeoutError as PwTimeout

logger = logging.getLogger(__name__)

class ChatGPTAutomation:
    def __init__(self, config):
        self.config = config
        self.playwright = None
        self.context = None
        self.page = None
        self.message_count = 0
        self.max_messages = max(8, config.get("max_tokens_before_rotate", 8000) // 500)

    def start_browser(self):
        logger.info("🌐 Iniciando browser (perfil persistente)...")
        self.playwright = sync_playwright().start()

        # Tentar pegar do config ou usar padrao
        user_data_dir = self.config.get("chrome_profile_dir") 
        if not user_data_dir:
             # Fallback inteligente para Windows
             import os
             user_data_dir = os.path.expanduser("~") + r"\AppData\Local\Google\Chrome\User Data"

        self.context = self.playwright.chromium.launch_persistent_context(
            user_data_dir=user_data_dir,
            headless=False,
            channel="chrome",
            viewport={"width": 1280, "height": 800},
             args=["--disable-blink-features=AutomationControlled"]
        )

        self.page = self.context.new_page()
        self.page.goto(self.config["chatgpt_url"], wait_until="domcontentloaded")
        time.sleep(4)
        logger.info("✅ Browser pronto (confira se está logado).")

    def close_browser(self):
        try:
            if self.context:
                self.context.close()
        finally:
            if self.playwright:
                self.playwright.stop()
        logger.info("Browser fechado")

    def _find_input(self):
        # Tenta achar textarea visível (mais robusto que seletor fixo)
        candidates = self.page.locator("textarea")
        count = candidates.count()
        for i in range(count):
            el = candidates.nth(i)
            try:
                if el.is_visible() and el.is_enabled():
                    return el
            except Exception:
                continue
        return None

    def send_message(self, message: str) -> str:
        logger.info(f"💬 Enviando mensagem ({len(message)} chars)")

        input_el = None
        try:
            # Espera generica por qualquer textarea
            self.page.wait_for_selector("textarea", timeout=15000)
            input_el = self._find_input()
        except PwTimeout:
            input_el = None

        if not input_el:
            raise RuntimeError("Não encontrei o campo de mensagem do ChatGPT (textarea).")

        # Focus e escrever
        input_el.click()
        input_el.fill(message)
        time.sleep(0.5)

        # Enviar: tentar botão, fallback Enter
        sent = False
        try:
            btn = self.page.locator('button[data-testid="send-button"]')
            if btn.count() > 0 and btn.first.is_visible():
                btn.first.click()
                sent = True
        except Exception:
            sent = False

        if not sent:
            logger.info("Botão enviar não encontrado, usando ENTER")
            self.page.keyboard.press("Enter")

        # Esperar resposta: pega último bloco de assistant
        self._wait_response_finish()

        response_text = self._get_last_assistant_message()
        self.message_count += 1
        logger.info(f"✅ Resposta recebida ({len(response_text)} chars)")
        return response_text

    def _get_last_assistant_message(self) -> str:
        # Seletor padrao atual do ChatGPT para mensagens do assistente
        loc = self.page.locator('[data-message-author-role="assistant"]')
        if loc.count() == 0:
            return ""
        return loc.nth(loc.count() - 1).inner_text()

    def _wait_response_finish(self):
        # Espera aparecer pelo menos 1 resposta de assistant nova
        try:
            self.page.wait_for_selector('[data-message-author-role="assistant"]', timeout=30000)
        except:
            logger.warning("Timeout aguardando inicio da resposta")
            return

        time.sleep(2)

        # Espera "parar de mudar" por alguns ciclos
        last = ""
        stable = 0
        for _ in range(60):  # ~60*1.5s = 90s
            cur = self._get_last_assistant_message()
            if cur and cur == last and len(cur) > 0:
                stable += 1
            else:
                stable = 0
                last = cur
            
            # Se ficou estavel por 3 checks (4.5s), assume que acabou
            if stable >= 3:
                return
            time.sleep(1.5)

    def should_rotate(self) -> bool:
        return self.message_count >= self.max_messages

    def rotate_conversation(self):
        logger.info("🔄 Rotacionando conversa...")
        # Forma mais estável: abrir nova página / navegar pro root
        try:
            self.page.goto(self.config["chatgpt_url"], wait_until="domcontentloaded")
            time.sleep(3)
        except Exception:
            pass
        self.message_count = 0
        logger.info("✅ Nova conversa iniciada (rota).")
