"""
Agente Validador de Cálculos - Rota Verde
==========================================
Busca turnos do backend e pede ao Mistral para validar os cálculos.

Execute: python agente_validador.py
"""
import requests
import json

# Configurações
OLLAMA_URL = "http://localhost:11434"
MODEL = "mistral"
API_URL = "https://endpoint-api-production.up.railway.app/api"

def buscar_turnos():
    """Busca turnos recentes do backend"""
    print("📊 Buscando turnos do Rota Verde...")
    
    try:
        # Tenta buscar turnos abertos ou recentes
        resp = requests.get(f"{API_URL}/shifts", timeout=10)
        
        if resp.status_code == 200:
            data = resp.json()
            # Pode ser array direto ou objeto com data/shifts
            if isinstance(data, list):
                turnos = data[:5]  # Últimos 5
            elif isinstance(data, dict):
                turnos = data.get("data", data.get("shifts", []))[:5]
            else:
                turnos = []
            
            print(f"✅ {len(turnos)} turnos encontrados")
            return turnos
        else:
            print(f"⚠️ API retornou status {resp.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erro ao buscar turnos: {e}")
        return None

def analisar_com_ollama(turnos):
    """Envia turnos para Ollama analisar"""
    
    if not turnos:
        # Usar dados de exemplo para teste
        print("⚠️ Usando dados de exemplo para demonstração...")
        turnos = [
            {
                "id": 1,
                "motorista": "João Silva",
                "totalBruto": 450.00,
                "totalCustos": 85.00,
                "liquido": 365.00,
                "repasseEmpresa": 146.00,
                "repasseMotorista": 219.00,
                "totalCorridas": 12
            },
            {
                "id": 2,
                "motorista": "Maria Santos",
                "totalBruto": 320.00,
                "totalCustos": 45.00,
                "liquido": 275.00,
                "repasseEmpresa": 110.00,
                "repasseMotorista": 165.00,
                "totalCorridas": 8
            }
        ]
    
    # Formatar dados para o prompt
    dados_str = json.dumps(turnos, indent=2, ensure_ascii=False)
    
    prompt = f"""Você é um auditor financeiro do sistema Rota Verde (transporte).

TAREFA: Validar os cálculos dos turnos abaixo.

REGRAS DE NEGÓCIO:
1. Líquido = Total Bruto - Total Custos
2. Repasse Empresa = 40% do Líquido
3. Repasse Motorista = 60% do Líquido
4. Repasse Empresa + Repasse Motorista = Líquido

DADOS DOS TURNOS:
{dados_str}

INSTRUÇÕES:
- Para cada turno, verifique se os cálculos estão corretos
- Se encontrar erro, mostre o valor esperado vs valor encontrado
- Seja breve e objetivo

RESPONDA:"""

    print(f"📤 Enviando {len(turnos)} turnos para análise...")
    
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
    print("=" * 55)
    print("  AGENTE VALIDADOR DE CÁLCULOS - ROTA VERDE")
    print("=" * 55)
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
    
    # 2. Buscar turnos
    turnos = buscar_turnos()
    
    # 3. Analisar com Ollama
    print()
    resultado = analisar_com_ollama(turnos)
    
    # 4. Mostrar resultado
    print()
    print("=" * 55)
    print("  RESULTADO DA VALIDAÇÃO")
    print("=" * 55)
    print()
    print(resultado)
    print()
    print("=" * 55)

if __name__ == "__main__":
    main()
    print()
    input("Pressione ENTER para fechar...")
