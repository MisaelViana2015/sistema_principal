import requests
import json
import sys

print("=== TESTE DE CONEXÃO OLLAMA ===")

try:
    print("Tentando conectar em http://localhost:11434/api/tags ...")
    r = requests.get("http://localhost:11434/api/tags", timeout=5)
    print(f"Status Code: {r.status_code}")
    
    if r.status_code == 200:
        data = r.json()
        models = [m['name'] for m in data.get('models', [])]
        print(f"Modelos encontrados: {models}")
        
        if any('mistral' in m for m in models):
            print("✅ Modelo Mistral encontrado!")
            
            print("\nTentando gerar resposta simples...")
            payload = {
                "model": "mistral",
                "prompt": "Say Hello",
                "stream": False
            }
            r2 = requests.post("http://localhost:11434/api/generate", json=payload, timeout=30)
            if r2.status_code == 200:
                 resp = r2.json().get('response', '')
                 print(f"✅ Resposta do Ollama: {resp}")
            else:
                 print(f"❌ Erro na geração: {r2.text}")
        else:
            print("❌ Modelo Mistral NÃO encontrado na lista.")
    else:
        print("❌ Erro ao listar modelos.")

except Exception as e:
    print(f"❌ EXCEÇÃO FATAL: {e}")
    print("Verifique se 'ollama serve' está rodando.")

print("=== FIM DO TESTE ===")
