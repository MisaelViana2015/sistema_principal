"""
Agente Ollama Ultra-Minimal (Teste Isolado)
Execute diretamente: python run_ollama_agent.py
"""
import requests
import time

OLLAMA_URL = "http://localhost:11434"
MODEL = "mistral"

def check_ollama():
    """Verifica se Ollama está online"""
    try:
        resp = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if resp.status_code == 200:
            models = resp.json().get("models", [])
            print(f"✅ Ollama ONLINE - {len(models)} modelos disponíveis")
            for m in models:
                print(f"   - {m.get('name')}")
            return True
        else:
            print(f"❌ Ollama retornou status {resp.status_code}")
            return False
    except Exception as e:
        print(f"❌ Ollama OFFLINE: {e}")
        return False

def send_prompt(prompt: str) -> str:
    """Envia prompt para Ollama e retorna resposta"""
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.3}
    }
    
    print(f"📤 Enviando prompt ({len(prompt)} chars)...")
    start = time.time()
    
    try:
        resp = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=300)
        elapsed = time.time() - start
        
        if resp.status_code == 200:
            text = resp.json().get("response", "")
            print(f"✅ Resposta recebida em {elapsed:.1f}s ({len(text)} chars)")
            return text
        else:
            return f"Erro: {resp.status_code} - {resp.text}"
    except Exception as e:
        return f"Erro de conexão: {e}"

def main():
    print("=" * 50)
    print("  AGENTE OLLAMA - TESTE ULTRA-MINIMAL")
    print("=" * 50)
    print()
    
    if not check_ollama():
        print("\n⚠️ Por favor, inicie o Ollama antes de continuar.")
        print("   Execute: ollama serve")
        return
    
    print()
    print("🤖 Agente pronto! Digite prompts abaixo.")
    print("   (Digite 'sair' para encerrar)")
    print()
    
    while True:
        try:
            prompt = input("Você: ").strip()
            if prompt.lower() in ["sair", "exit", "quit"]:
                print("Até logo!")
                break
            
            if not prompt:
                continue
            
            response = send_prompt(prompt)
            print()
            print("🤖 Agente:")
            print("-" * 40)
            print(response)
            print("-" * 40)
            print()
            
        except KeyboardInterrupt:
            print("\n\nInterrompido pelo usuário.")
            break

if __name__ == "__main__":
    main()
