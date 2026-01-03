"""
Agente de Fraude - CONECTADO À API REAL
========================================
Busca turnos reais do Rota Verde e analisa com Mistral

Execute: python agente_api_real.py
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

# API do Rota Verde
API_URL = "https://endpoint-api-production.up.railway.app/api"

# Token de autenticação (gerado para teste)
API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbi1hZ2VudCIsImlkIjoiYWdlbnQtMDAxIiwibm9tZSI6IkFnZW50ZSBJQSIsImVtYWlsIjoiYWdlbnRlQHJvdGF2ZXJkZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3Njc0NTg2ODYsImV4cCI6MTc3MDA1MDY4Nn0.OWyTg6-r_KW0RBu9Nw389kgUIExFTkJQ3GkPBW4u2Q0"

# Email
EMAIL_REMETENTE = "misael1215@gmail.com"
EMAIL_SENHA = "yklboluijtlyszic"
EMAIL_DESTINO = "misael1215@gmail.com"

def buscar_turnos_reais():
    """Busca turnos reais da API"""
    print("📡 Conectando à API Rota Verde...")
    
    headers = {"Content-Type": "application/json"}
    if API_TOKEN:
        headers["Authorization"] = f"Bearer {API_TOKEN}"
        print("🔑 Usando token de autenticação")
    else:
        print("⚠️ Sem token - tentando acesso público")
    
    try:
        # Tentar endpoint de shifts
        resp = requests.get(f"{API_URL}/shifts", headers=headers, timeout=15)
        
        print(f"📥 Status: {resp.status_code}")
        
        if resp.status_code == 200:
            data = resp.json()
            # Pode ser array direto ou objeto com data
            if isinstance(data, list):
                turnos = data
            elif isinstance(data, dict):
                turnos = data.get("data", data.get("shifts", []))
            else:
                turnos = []
            
            print(f"✅ {len(turnos)} turnos encontrados!")
            return turnos[:5]  # Pegar últimos 5
            
        elif resp.status_code == 401:
            print("❌ Não autorizado - precisa de token válido")
            return None
        else:
            print(f"⚠️ Erro: {resp.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ Erro de conexão: {e}")
        return None

def buscar_corridas_turno(shift_id: str):
    """Busca corridas de um turno específico"""
    headers = {"Content-Type": "application/json"}
    if API_TOKEN:
        headers["Authorization"] = f"Bearer {API_TOKEN}"
    
    try:
        resp = requests.get(f"{API_URL}/rides?shiftId={shift_id}", headers=headers, timeout=15)
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list):
                return data
            elif isinstance(data, dict):
                return data.get("data", data.get("rides", []))
        return []
    except:
        return []

def analisar_com_mistral(turno: dict, corridas: list):
    """Envia para Mistral analisar"""
    
    motorista = turno.get("driverName", turno.get("driver", {}).get("nome", "Desconhecido"))
    
    # Formatar corridas
    corridas_fmt = []
    for c in corridas:
        hora = c.get("hora", c.get("createdAt", ""))
        if hora:
            try:
                dt = datetime.fromisoformat(hora.replace("Z", "+00:00"))
                hora = dt.strftime("%H:%M")
            except:
                pass
        corridas_fmt.append({
            "hora": hora,
            "valor": float(c.get("valor", 0)),
            "tipo": c.get("tipo", "App")
        })
    
    prompt = f"""Você é auditor de fraudes do sistema Rota Verde.

REGRA 14 - CORRIDAS CONSECUTIVAS MESMO VALOR:
- ALERTA se: 4 ou mais corridas consecutivas com exatamente o mesmo valor
- Indica possível manipulação

MOTORISTA: {motorista}
CORRIDAS DO TURNO:
{json.dumps(corridas_fmt, indent=2)}

Analise e responda:
1. Há violação da REGRA 14?
2. Se SIM: Detalhe as corridas suspeitas
3. Veredito: SUSPEITO ou NORMAL"""

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.1}
    }
    
    resp = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=120)
    return resp.json().get("response", "Erro") if resp.status_code == 200 else "Erro"

def enviar_email(assunto: str, corpo: str):
    """Envia email de alerta"""
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
    print("=" * 60)
    print("  AGENTE FRAUDE - API REAL ROTA VERDE")
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
    
    # Buscar turnos reais
    turnos = buscar_turnos_reais()
    
    if not turnos:
        print()
        print("=" * 60)
        print("  ⚠️ SEM DADOS REAIS")
        print("=" * 60)
        print()
        print("Para conectar à API real, você precisa de um token.")
        print("Configure a variável API_TOKEN no código ou")
        print("defina ROTA_VERDE_AGENT_TOKEN no ambiente.")
        print()
        input("Pressione ENTER para fechar...")
        return
    
    # Analisar cada turno
    print()
    print("=" * 60)
    print("  ANÁLISE DOS TURNOS REAIS")
    print("=" * 60)
    
    alertas = []
    
    for turno in turnos:
        turno_id = turno.get("id", "?")
        motorista = turno.get("driverName", turno.get("driver", {}).get("nome", "?"))
        
        print()
        print(f"📋 Analisando turno {turno_id} - {motorista}...")
        
        # Buscar corridas do turno
        corridas = buscar_corridas_turno(turno_id)
        
        if not corridas:
            print(f"   ⚠️ Sem corridas neste turno")
            continue
        
        print(f"   📊 {len(corridas)} corridas encontradas")
        
        # Analisar com Mistral
        analise = analisar_com_mistral(turno, corridas)
        
        if "SUSPEITO" in analise.upper():
            print(f"   🚨 SUSPEITO!")
            alertas.append({
                "motorista": motorista,
                "turno_id": turno_id,
                "analise": analise
            })
        else:
            print(f"   ✅ Normal")
    
    # Enviar alertas por email
    if alertas:
        print()
        print(f"🚨 {len(alertas)} turno(s) suspeito(s) encontrado(s)!")
        
        corpo = f"""ALERTA DE FRAUDE - ANÁLISE AUTOMÁTICA
Data: {datetime.now().strftime("%d/%m/%Y %H:%M")}

"""
        for a in alertas:
            corpo += f"""
----------------------------------------
MOTORISTA: {a['motorista']}
TURNO: {a['turno_id']}

ANÁLISE:
{a['analise']}
"""
        
        print()
        enviar_email(f"🚨 ALERTA: {len(alertas)} suspeita(s) detectada(s)", corpo)
    else:
        print()
        print("✅ Nenhum turno suspeito encontrado!")
    
    print()
    print("=" * 60)

if __name__ == "__main__":
    main()
    print()
    input("Pressione ENTER para fechar...")
