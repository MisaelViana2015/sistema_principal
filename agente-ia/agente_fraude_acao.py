"""
Agente Detector de Fraude - COM AÇÃO PRÁTICA
=============================================
Detecta fraude e SALVA resultado em arquivo JSON

Execute: python agente_fraude_acao.py
"""
import requests
import json
from datetime import datetime
import os

OLLAMA_URL = "http://localhost:11434"
MODEL = "mistral"

def analisar_e_salvar():
    """Detecta fraude e salva resultado"""
    
    # Dados de exemplo
    motorista = "Carlos Silva"
    turno_id = "T2024-0103-001"
    
    corridas = [
        {"hora": "08:15", "valor": 18.50, "tipo": "Particular"},
        {"hora": "08:32", "valor": 22.00, "tipo": "App"},
        {"hora": "09:00", "valor": 15.00, "tipo": "Particular"},
        {"hora": "09:15", "valor": 15.00, "tipo": "Particular"},
        {"hora": "09:28", "valor": 15.00, "tipo": "Particular"},
        {"hora": "09:45", "valor": 15.00, "tipo": "Particular"},
        {"hora": "10:02", "valor": 15.00, "tipo": "Particular"},
        {"hora": "10:30", "valor": 25.00, "tipo": "App"},
    ]
    
    prompt = f"""Analise as corridas e responda em JSON:
    
REGRA: 4+ corridas consecutivas com mesmo valor = FRAUDE

CORRIDAS:
{json.dumps(corridas, indent=2)}

Responda APENAS com JSON no formato:
{{"suspeito": true/false, "motivo": "...", "corridas_flagradas": [...]}}"""

    print(f"📤 Analisando corridas de {motorista}...")
    
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.1}
    }
    
    resp = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=120)
    resposta_llm = resp.json().get("response", "") if resp.status_code == 200 else "Erro"
    
    # Criar resultado
    resultado = {
        "timestamp": datetime.now().isoformat(),
        "motorista": motorista,
        "turno_id": turno_id,
        "total_corridas": len(corridas),
        "analise_ia": resposta_llm,
        "status": "PROCESSADO"
    }
    
    # AÇÃO PRÁTICA: Salvar em arquivo
    os.makedirs("resultados", exist_ok=True)
    arquivo = f"resultados/fraude_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    with open(arquivo, "w", encoding="utf-8") as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False)
    
    return resultado, arquivo

def main():
    print("=" * 60)
    print("  AGENTE COM AÇÃO PRÁTICA - SALVA RESULTADO")
    print("=" * 60)
    print()
    
    # Verificar Ollama
    try:
        requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        print("✅ Ollama online")
    except:
        print("❌ Ollama offline")
        return
    
    print()
    resultado, arquivo = analisar_e_salvar()
    
    print()
    print("=" * 60)
    print("  RESULTADO")
    print("=" * 60)
    print()
    print(f"📋 Motorista: {resultado['motorista']}")
    print(f"🔢 Turno: {resultado['turno_id']}")
    print(f"📊 Corridas analisadas: {resultado['total_corridas']}")
    print()
    print("🤖 Análise da IA:")
    print("-" * 40)
    print(resultado['analise_ia'])
    print("-" * 40)
    print()
    print(f"💾 ARQUIVO SALVO: {arquivo}")
    print()
    print("=" * 60)

if __name__ == "__main__":
    main()
    print()
    input("Pressione ENTER para fechar...")
