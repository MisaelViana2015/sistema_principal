"""
Agente Detector de Fraude - Rota Verde
======================================
Testa a REGRA 14: Corridas consecutivas com mesmo valor

Execute: python agente_fraude.py
"""
import requests
import json

OLLAMA_URL = "http://localhost:11434"
MODEL = "mistral"

def analisar_fraude():
    """Envia corridas para Ollama detectar padrões de fraude"""
    
    # Dados de exemplo: Motorista com corridas suspeitas
    corridas_suspeitas = [
        {"hora": "08:15", "valor": 18.50, "tipo": "Particular"},
        {"hora": "08:32", "valor": 22.00, "tipo": "App"},
        {"hora": "09:00", "valor": 15.00, "tipo": "Particular"},
        {"hora": "09:15", "valor": 15.00, "tipo": "Particular"},  # Início do padrão
        {"hora": "09:28", "valor": 15.00, "tipo": "Particular"},
        {"hora": "09:45", "valor": 15.00, "tipo": "Particular"},
        {"hora": "10:02", "valor": 15.00, "tipo": "Particular"},  # 5 corridas R$15,00
        {"hora": "10:30", "valor": 25.00, "tipo": "App"},
        {"hora": "11:00", "valor": 30.00, "tipo": "App"},
    ]
    
    dados_str = json.dumps(corridas_suspeitas, indent=2, ensure_ascii=False)
    
    prompt = f"""Você é um auditor de fraudes do sistema Rota Verde (transporte).

REGRA DE FRAUDE A VERIFICAR:
- REGRA 14: Corridas Consecutivas com Mesmo Valor
- ALERTA se: 4 ou mais corridas consecutivas com exatamente o mesmo valor
- Motivo: Valores iguais repetidos sugerem manipulação ou corridas falsas

DADOS DAS CORRIDAS DO TURNO:
{dados_str}

INSTRUÇÕES:
1. Analise as corridas em ordem cronológica
2. Identifique sequências de 4+ corridas com mesmo valor
3. Se encontrar, aponte: quais corridas, valor repetido, horários
4. Dê um veredito: SUSPEITO ou NORMAL

RESPONDA:"""

    print(f"📤 Enviando {len(corridas_suspeitas)} corridas para análise de fraude...")
    
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.1}
    }
    
    try:
        resp = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=120)
        
        if resp.status_code == 200:
            return resp.json().get("response", "")
        else:
            return f"Erro Ollama: {resp.status_code}"
            
    except Exception as e:
        return f"Erro: {e}"

def main():
    print("=" * 60)
    print("  AGENTE DETECTOR DE FRAUDE - ROTA VERDE")
    print("  Testando REGRA 14: Corridas Consecutivas Mesmo Valor")
    print("=" * 60)
    print()
    
    # 1. Verificar Ollama
    try:
        resp = requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        if resp.status_code != 200:
            print("❌ Ollama não está respondendo!")
            return
        print("✅ Ollama online")
    except:
        print("❌ Ollama offline. Execute: ollama serve")
        return
    
    # 2. Analisar
    print()
    resultado = analisar_fraude()
    
    # 3. Mostrar resultado
    print()
    print("=" * 60)
    print("  RESULTADO DA ANÁLISE DE FRAUDE")
    print("=" * 60)
    print()
    print(resultado)
    print()
    print("=" * 60)

if __name__ == "__main__":
    main()
    print()
    input("Pressione ENTER para fechar...")
