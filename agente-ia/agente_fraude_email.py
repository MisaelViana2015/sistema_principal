"""
Agente Detector de Fraude - REGRA 14 + EMAIL
=============================================
Detecta corridas consecutivas mesmo valor e ENVIA POR EMAIL

Execute: python agente_fraude_email.py
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

# ========== CONFIGURAÇÃO DE EMAIL ==========
EMAIL_REMETENTE = "misael1215@gmail.com"
EMAIL_SENHA = "yklboluijtlyszic"  # Senha de App do Gmail
EMAIL_DESTINO = "misael1215@gmail.com"
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
# ============================================

def enviar_email(assunto: str, corpo: str) -> bool:
    """Envia email com resultado da análise"""
    try:
        msg = MIMEMultipart()
        msg['From'] = EMAIL_REMETENTE
        msg['To'] = EMAIL_DESTINO
        msg['Subject'] = assunto
        
        msg.attach(MIMEText(corpo, 'plain', 'utf-8'))
        
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(EMAIL_REMETENTE, EMAIL_SENHA)
        server.send_message(msg)
        server.quit()
        
        print("✅ Email enviado com sucesso!")
        return True
    except Exception as e:
        print(f"⚠️ Erro ao enviar email: {e}")
        print("   (Configure EMAIL_REMETENTE, EMAIL_SENHA e EMAIL_DESTINO no código)")
        return False

def analisar_regra_14():
    """Aplica REGRA 14: Corridas consecutivas mesmo valor"""
    
    motorista = "Carlos Silva"
    turno_id = "T2024-0103-001"
    data_turno = "03/01/2026"
    
    # Corridas com padrão suspeito (5x R$15,00 seguidas)
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
    
    prompt = f"""Você é auditor de fraudes. Aplique a REGRA 14:

REGRA 14 - CORRIDAS CONSECUTIVAS MESMO VALOR:
- ALERTA se: 4 ou mais corridas consecutivas com exatamente o mesmo valor
- Indica possível manipulação ou corridas falsas

MOTORISTA: {motorista}
DATA: {data_turno}
CORRIDAS:
{json.dumps(corridas, indent=2)}

Analise e responda:
1. Há violação da REGRA 14? (SIM/NÃO)
2. Se SIM: Quais corridas? Qual valor repetido?
3. Veredito: SUSPEITO ou NORMAL
4. Recomendação de ação"""

    print(f"📤 Analisando REGRA 14 para {motorista}...")
    
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.1}
    }
    
    resp = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=120)
    analise = resp.json().get("response", "Erro na análise") if resp.status_code == 200 else "Erro"
    
    return {
        "motorista": motorista,
        "turno_id": turno_id,
        "data": data_turno,
        "regra": "REGRA 14 - Corridas Consecutivas Mesmo Valor",
        "analise": analise,
        "timestamp": datetime.now().strftime("%d/%m/%Y %H:%M:%S")
    }

def main():
    print("=" * 60)
    print("  AGENTE FRAUDE - REGRA 14 + ENVIO EMAIL")
    print("=" * 60)
    print()
    
    # Verificar Ollama
    try:
        requests.get(f"{OLLAMA_URL}/api/tags", timeout=5)
        print("✅ Ollama online")
    except:
        print("❌ Ollama offline")
        return
    
    # Analisar
    print()
    resultado = analisar_regra_14()
    
    # Mostrar resultado
    print()
    print("=" * 60)
    print("  RESULTADO DA ANÁLISE")
    print("=" * 60)
    print()
    print(f"📋 Motorista: {resultado['motorista']}")
    print(f"📅 Data: {resultado['data']}")
    print(f"🔍 Regra: {resultado['regra']}")
    print()
    print("🤖 Análise da IA:")
    print("-" * 40)
    print(resultado['analise'])
    print("-" * 40)
    
    # Salvar arquivo
    os.makedirs("resultados", exist_ok=True)
    arquivo = f"resultados/regra14_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(arquivo, "w", encoding="utf-8") as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False)
    print()
    print(f"💾 Salvo: {arquivo}")
    
    # Enviar email
    print()
    print("📧 Enviando email...")
    
    assunto = f"⚠️ ALERTA FRAUDE - {resultado['motorista']} - {resultado['data']}"
    corpo = f"""
ALERTA DE FRAUDE - SISTEMA ROTA VERDE
======================================

Motorista: {resultado['motorista']}
Turno: {resultado['turno_id']}
Data: {resultado['data']}
Regra Violada: {resultado['regra']}

ANÁLISE DA IA:
{resultado['analise']}

---
Gerado automaticamente em {resultado['timestamp']}
Agente IA Rota Verde
"""
    
    enviar_email(assunto, corpo)
    
    print()
    print("=" * 60)

if __name__ == "__main__":
    main()
    print()
    input("Pressione ENTER para fechar...")
