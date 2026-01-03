"""
Cliente para Ollama - LLM Local
"""
import requests
import logging
import json

logger = logging.getLogger(__name__)

class OllamaClient:
    def __init__(self, config):
        self.config = config
        self.base_url = config.get("ollama_url", "http://localhost:11434")
        self.model = config.get("ollama_model", "mistral")
        self.message_count = 0
        self.max_messages = 100

    def start(self):
        """Inicia verificacao do Ollama"""
        logger.info(f"🤖 (V3) Iniciando conexao Ollama: {self.model}")
        
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            if response.status_code == 200:
                logger.info("✅ Ollama detectado e online")
            else:
                logger.warning(f"⚠️ Ollama respondeu status {response.status_code}")
        except Exception as e:
            logger.error(f"❌ Falha ao conectar Ollama: {e}")
            raise

    def send_message(self, message: str) -> str:
        logger.info(f"📤 Enviando prompt ({len(message)} chars)")
        if self.message_count == 0:
             system_prompt = self.config.get("system_prompt", "Você é um analista de fraude experiente.")
             # No Ollama, geralmente passamos o sistema no proprio prompt ou parametro system, 
             # mas para simplicidade vamos concatenar se for chat.
             # Aqui usamos endpoint /generate que é raw completion ou /chat que é chat.
             # Vamos usar /generate para compatibilidade simples por enquanto.
        
        payload = {
            "model": self.model,
            "prompt": message,
            "stream": False,
            "options": {
                "temperature": 0.3
            }
        }

        try:
            response = requests.post(f"{self.base_url}/api/generate", json=payload, timeout=300)
            if response.status_code == 200:
                resp_json = response.json()
                text = resp_json.get("response", "")
                self.message_count += 1
                return text
            else:
                return f"Erro Ollama: {response.text}"
        except Exception as e:
            return f"Erro exception: {e}"

    def should_rotate(self) -> bool:
        return False

    def rotate_conversation(self):
        pass
