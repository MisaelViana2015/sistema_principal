"""
Agente de Fraude - CONECTADO À API REAL (SEM TOKEN)
====================================================
Usa endpoints /api/agent que não requerem autenticação

Execute: python agente_api_sem_token.py
"""
import requests
import json
from datetime import datetime
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

OLLAMA_URL = "http://localhost:11434"
MODEL = "mistral"

# API do Rota Verde - endpoints públicos do agente
API_URL = "https://endpoint-api-production.up.railway.app/api/agent"

# Email
EMAIL_REMETENTE = "misael1215@gmail.com"
EMAIL_SENHA = "yklboluijtlyszic"
EMAIL_DESTINO = "misael1215@gmail.com"

def testar_conexao():
    """Testa se a API está respondendo"""
    print("📡 Testando conexão com API...")
    try:
        resp = requests.get(f"{API_URL}/health", timeout=10)
        if resp.status_code == 200:
            print(f"   ✅ API online: {resp.json()}")
            return True
        else:
            print(f"   ⚠️ Status: {resp.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return False

def buscar_fraudes_pendentes():
    """Busca eventos de fraude pendentes de análise"""
    print("🔍 Buscando fraudes pendentes...")
    try:
        resp = requests.get(f"{API_URL}/pending-fraud", timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            print(f"   ✅ {data['count']} evento(s) pendente(s)")
            return data['events']
        else:
            print(f"   ⚠️ Status: {resp.status_code}")
            return []
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return []

def buscar_turno(shift_id: str):
    """Busca turno específico com corridas"""
    print(f"📊 Buscando turno {shift_id[:8]}...")
    try:
        resp = requests.get(f"{API_URL}/shift/{shift_id}", timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            print(f"   ✅ Motorista: {data['motorista']}, {data['totalCorridas']} corridas")
            return data
        else:
            print(f"   ⚠️ Status: {resp.status_code}")
            return None
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return None

def analisar_com_mistral(turno: dict):
    """Envia turno para Mistral analisar"""
    
    prompt = f"""Você é auditor de fraudes do sistema Rota Verde.

DADOS DO TURNO:
Motorista: {turno['motorista']}
Veículo: {turno['veiculo']}
Início: {turno['inicio']}
Fim: {turno['fim']}
KM Total: {turno['kmTotal']} km
Receita: R$ {turno['totalBruto']:.2f}
Corridas: {turno['totalCorridas']}

CORRIDAS:
{json.dumps(turno['corridas'], indent=2, ensure_ascii=False)}

ANALISE:
1. Há padrões suspeitos? (valores repetidos, gaps longos)
2. Os indicadores financeiros estão normais?
3. Veredito: SUSPEITO ou NORMAL
4. Justificativa breve

RESPONDA:"""

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.2}
    }
    
    resp = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=180)
    return resp.json().get("response", "Erro") if resp.status_code == 200 else "Erro"

def enviar_email(assunto: str, corpo: str):
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_REMETENTE
        msg['To'] = EMAIL_DESTINO
        msg['Subject'] = assunto
        msg.attach(MIMEText(corpo, 'plain', 'utf-8'))
        
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(EMAIL_REMETENTE, EMAIL_SENHA)
        server.send_message(msg)
        server.quit()
        print("✅ Email enviado!")
        return True
    except Exception as e:
        print(f"⚠️ Erro email: {e}")
        return False

def main():
    print("=" * 65)
    print("  AGENTE IA - CONECTADO À API REAL (SEM TOKEN)")
    print("=" * 65)
    print()
    
    # Verificar Ollama
    try:
        requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        print("✅ Ollama online")
    except:
        print("❌ Ollama offline")
        return
    
    print()
    
    # Testar conexão com API
    if not testar_conexao():
        print()
        print("⚠️ API não respondeu. Aguarde o deploy terminar (~2 min).")
        return
    
    print()
    
    # Buscar fraudes pendentes
    eventos = buscar_fraudes_pendentes()
    
    if not eventos:
        print()
        print("✅ Nenhum evento de fraude pendente!")
        return
    
    # Analisar o primeiro evento
    evento = eventos[0]
    print()
    print(f"📋 Analisando evento: {evento['eventId'][:8]}...")
    print(f"   Motorista: {evento['motorista']}")
    print(f"   Score: {evento['riskScore']} ({evento['riskLevel']})")
    
    # Buscar turno completo
    turno = buscar_turno(evento['shiftId'])
    
    if not turno:
        print("⚠️ Não foi possível buscar o turno")
        return
    
    # Analisar com Mistral
    print()
    print("🤖 Analisando com Mistral...")
    analise = analisar_com_mistral(turno)
    
    # Mostrar resultado
    print()
    print("=" * 65)
    print("  PARECER DO AGENTE IA")
    print("=" * 65)
    print()
    print(analise)
    print()
    print("=" * 65)
    
    # Enviar email
    print()
    enviar_email(
        f"📋 Análise IA - {turno['motorista']} - Score {evento['riskScore']}",
        f"ANÁLISE AUTOMÁTICA DE FRAUDE\n\nMotorista: {turno['motorista']}\nScore: {evento['riskScore']}\n\n{analise}"
    )

if __name__ == "__main__":
    main()
    print()
    input("Pressione ENTER para fechar...")
