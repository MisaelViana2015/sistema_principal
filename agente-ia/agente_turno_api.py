"""
Agente de Fraude - BUSCA TURNO REAL DA API
==========================================
Conecta na API, busca o turno do Gustavo e analisa com Mistral

Execute: python agente_turno_api.py
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

# Token JWT com payload correto: {userId, email, role}
API_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhZ2VudC0wMDEiLCJlbWFpbCI6ImFnZW50ZUByb3RhdmVyZGUuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY3NDYwNjM2LCJleHAiOjE3Njc1NDcwMzZ9.MOpnzGXm_47F_OubxvkkEZRo2-fU_5NC5xi20rt3I-g"

# ID do turno para análise
SHIFT_ID = "f61bf051-9b32-413e-8019-070eb5c5fc83"

# Email
EMAIL_REMETENTE = "misael1215@gmail.com"
EMAIL_SENHA = "yklboluijtlyszic"
EMAIL_DESTINO = "misael1215@gmail.com"

def get_headers():
    return {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_TOKEN}"
    }

def buscar_turno():
    """Busca turno específico da API"""
    print(f"📡 Buscando turno {SHIFT_ID[:8]}... da API")
    
    try:
        resp = requests.get(f"{API_URL}/shifts/{SHIFT_ID}", headers=get_headers(), timeout=15)
        print(f"   Status: {resp.status_code}")
        
        if resp.status_code == 200:
            turno = resp.json()
            print(f"   ✅ Turno encontrado!")
            return turno
        elif resp.status_code == 401:
            print(f"   ❌ Token inválido ou expirado")
            return None
        elif resp.status_code == 404:
            print(f"   ❌ Turno não encontrado")
            return None
        else:
            print(f"   ⚠️ Erro: {resp.text[:100]}")
            return None
            
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return None

def buscar_corridas(shift_id: str):
    """Busca corridas do turno"""
    print(f"📊 Buscando corridas do turno...")
    
    try:
        resp = requests.get(f"{API_URL}/rides?shiftId={shift_id}", headers=get_headers(), timeout=15)
        
        if resp.status_code == 200:
            data = resp.json()
            if isinstance(data, list):
                corridas = data
            elif isinstance(data, dict):
                corridas = data.get("data", data.get("rides", []))
            else:
                corridas = []
            print(f"   ✅ {len(corridas)} corridas encontradas")
            return corridas
        else:
            print(f"   ⚠️ Status: {resp.status_code}")
            return []
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return []

def buscar_evento_fraude(event_id: str = "8c3eed5a-7a2b-4b37-89f0-f44edcaebe06"):
    """Busca evento de fraude existente"""
    print(f"🔍 Buscando evento de fraude...")
    
    try:
        resp = requests.get(f"{API_URL}/fraud/{event_id}", headers=get_headers(), timeout=15)
        
        if resp.status_code == 200:
            print(f"   ✅ Evento encontrado!")
            return resp.json()
        else:
            print(f"   ⚠️ Status: {resp.status_code}")
            return None
    except Exception as e:
        print(f"   ❌ Erro: {e}")
        return None

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
    
    # Calcular métricas
    receita_total = sum(c["valor"] for c in corridas_fmt)
    total_corridas = len(corridas_fmt)
    
    prompt = f"""Você é um auditor sênior de fraudes do sistema Rota Verde.

TAREFA: Analise este turno buscado diretamente da API de produção.

=== DADOS DO TURNO ===
Motorista: {motorista}
Início: {turno.get('inicio', 'N/A')}
Fim: {turno.get('fim', 'N/A')}
Total Corridas: {total_corridas}
Receita Total: R$ {receita_total:.2f}

=== CORRIDAS DO TURNO ===
{json.dumps(corridas_fmt, indent=2, ensure_ascii=False)}

=== INSTRUÇÕES ===
1. Identifique padrões suspeitos:
   - 4+ corridas consecutivas com mesmo valor
   - Gaps longos entre corridas (>30min)
   - Valores muito repetidos

2. Dê um VEREDITO: SUSPEITO ou NORMAL

3. Justifique sua análise

RESPONDA:"""

    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.2}
    }
    
    print(f"🤖 Analisando com Mistral...")
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
    print("  AGENTE IA - CONECTANDO NA API REAL")
    print("  Turno: f61bf051... (Gustavo)")
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
    
    # 1. Buscar turno
    turno = buscar_turno()
    
    if not turno:
        print()
        print("⚠️ Não foi possível buscar o turno da API.")
        print("   Verifique se o token é válido para produção.")
        return
    
    # Mostrar dados do turno
    print()
    print("📋 DADOS DO TURNO (da API):")
    print(f"   Motorista: {turno.get('driverName', turno.get('driver', {}).get('nome', '?'))}")
    print(f"   Início: {turno.get('inicio', 'N/A')}")
    print(f"   Fim: {turno.get('fim', 'N/A')}")
    
    # 2. Buscar corridas
    corridas = buscar_corridas(SHIFT_ID)
    
    if not corridas:
        print("⚠️ Sem corridas para analisar")
        return
    
    # 3. Analisar
    print()
    analise = analisar_com_mistral(turno, corridas)
    
    # 4. Mostrar resultado
    print()
    print("=" * 65)
    print("  PARECER DO AGENTE IA")
    print("=" * 65)
    print()
    print(analise)
    print()
    print("=" * 65)
    
    # 5. Enviar email
    print()
    enviar_email(
        f"📋 Análise API Real - Turno Gustavo",
        f"ANÁLISE DE TURNO DA API REAL\n\n{analise}"
    )

if __name__ == "__main__":
    main()
    print()
    input("Pressione ENTER para fechar...")
