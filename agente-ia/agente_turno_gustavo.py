"""
Agente de Fraude - TESTE COM TURNO REAL DO GUSTAVO
===================================================
Analisa o turno f61bf051 com score 105 (crítico)

Execute: python agente_turno_gustavo.py
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

# Email
EMAIL_REMETENTE = "misael1215@gmail.com"
EMAIL_SENHA = "yklboluijtlyszic"
EMAIL_DESTINO = "misael1215@gmail.com"

# DADOS REAIS DO TURNO - Gustavo (31/12/2025)
TURNO_REAL = {
    "event_id": "8c3eed5a-7a2b-4b37-89f0-f44edcaebe06",
    "shift_id": "f61bf051-9b32-413e-8019-070eb5c5fc83",
    "motorista": "Gustavo",
    "veiculo": "Dolphi Mini BR - TQU0H17",
    "data": "31/12/2025",
    "inicio": "06:48:58",
    "fim": "20:15:15",
    "duracao_horas": 13.44,
    "km_inicial": 22266,
    "km_final": 22424,
    "km_total": 158,
    "receita_total": 453.56,
    "total_corridas": 24,
    "ticket_medio": 18.90,
    "produtividade": 1.8,  # corridas/hora
    "receita_km": 2.87,
    "receita_hora": 33.75,
    "corridas_app": 13,
    "receita_app": 261.56,
    "corridas_particular": 11,
    "receita_particular": 192.00,
    "share_particular": 42.3,
    
    # GAPS DETECTADOS PELO SISTEMA
    "gaps_detectados": [
        {"inicio": "07:22:03", "fim": "07:52:21", "duracao": "30 min"},
        {"inicio": "07:52:21", "fim": "08:25:31", "duracao": "33 min"},
        {"inicio": "08:25:31", "fim": "09:32:59", "duracao": "67 min"},
        {"inicio": "09:32:59", "fim": "11:13:02", "duracao": "100 min"},  # 1h40!
        {"inicio": "11:13:02", "fim": "11:34:59", "duracao": "22 min"},
        {"inicio": "12:10:21", "fim": "12:52:18", "duracao": "42 min"},
        {"inicio": "12:52:18", "fim": "14:04:01", "duracao": "72 min"},  # 1h12!
        {"inicio": "14:22:31", "fim": "14:47:45", "duracao": "25 min"},
        {"inicio": "14:47:45", "fim": "15:31:15", "duracao": "44 min"},
        {"inicio": "15:31:15", "fim": "16:18:31", "duracao": "47 min"},
        {"inicio": "16:18:31", "fim": "17:36:38", "duracao": "78 min"},  # 1h18!
        {"inicio": "17:36:38", "fim": "18:14:03", "duracao": "37 min"},
        {"inicio": "18:14:03", "fim": "18:36:52", "duracao": "23 min"},
        {"inicio": "18:36:52", "fim": "18:58:29", "duracao": "22 min"},
        {"inicio": "19:19:01", "fim": "19:40:41", "duracao": "22 min"},
        {"inicio": "19:40:41", "fim": "20:10:14", "duracao": "30 min"},
    ],
    
    # Score original do sistema
    "score_sistema": 105,
    "nivel_risco": "critical",
    "regras_disparadas": [
        {"regra": "Gap de tempo injustificado", "severidade": "medium", "pontos": 90},
        {"regra": "Seleção suspeita de corridas", "severidade": "medium", "pontos": 15}
    ]
}

def analisar_com_mistral():
    """Envia turno real para Mistral analisar"""
    
    dados = TURNO_REAL
    
    prompt = f"""Você é um auditor sênior de fraudes do sistema Rota Verde (transporte urbano).

TAREFA: Analise este turno e dê seu parecer técnico.

=== DADOS DO TURNO ===
Motorista: {dados['motorista']}
Veículo: {dados['veiculo']}
Data: {dados['data']} ({dados['inicio']} a {dados['fim']})
Duração: {dados['duracao_horas']} horas

KM Percorrido: {dados['km_total']} km
Receita Total: R$ {dados['receita_total']}
Total Corridas: {dados['total_corridas']}

Corridas App: {dados['corridas_app']} (R$ {dados['receita_app']})
Corridas Particular: {dados['corridas_particular']} (R$ {dados['receita_particular']})

Receita por KM: R$ {dados['receita_km']}/km
Receita por Hora: R$ {dados['receita_hora']}/h
Ticket Médio: R$ {dados['ticket_medio']}
Produtividade: {dados['produtividade']} corridas/hora

=== ALERTAS DO SISTEMA ===
O sistema detectou {len(dados['gaps_detectados'])} intervalos SEM CORRIDA acima de 20 minutos:

{json.dumps(dados['gaps_detectados'], indent=2, ensure_ascii=False)}

Gaps mais críticos:
- 09:32 a 11:13 = 100 minutos (1h40 sem corrida!)
- 16:18 a 17:36 = 78 minutos  
- 12:52 a 14:04 = 72 minutos

Score do Sistema: {dados['score_sistema']} (Nível: {dados['nivel_risco']})

=== CONTEXTO ===
- Faixa normal de Receita/KM: R$ 2,00 a R$ 3,30/km
- Turnos normais: máximo 30min de gap entre corridas
- Motorista teve 42% de corridas particulares (típico de quem escolhe corridas)

=== INSTRUÇÕES ===
1. Avalie os indicadores financeiros
2. Analise os gaps de tempo (são justificáveis?)
3. Identifique padrões suspeitos
4. Dê um VEREDITO: FRAUDE PROVÁVEL, SUSPEITO, ou NORMAL
5. Recomende ações

RESPONDA DE FORMA TÉCNICA E OBJETIVA:"""

    print(f"📤 Enviando turno do {dados['motorista']} para análise...")
    print(f"   Score original do sistema: {dados['score_sistema']} ({dados['nivel_risco']})")
    print()
    
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0.2}
    }
    
    resp = requests.post(f"{OLLAMA_URL}/api/generate", json=payload, timeout=180)
    return resp.json().get("response", "Erro") if resp.status_code == 200 else "Erro na análise"

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
    print("=" * 65)
    print("  AGENTE IA - ANÁLISE DO TURNO GUSTAVO (31/12/2025)")
    print("  Score Sistema: 105 | Nível: CRÍTICO")
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
    
    # Analisar
    analise = analisar_com_mistral()
    
    # Mostrar resultado
    print()
    print("=" * 65)
    print("  PARECER DO AGENTE IA (MISTRAL)")
    print("=" * 65)
    print()
    print(analise)
    print()
    print("=" * 65)
    
    # Salvar resultado
    resultado = {
        "timestamp": datetime.now().isoformat(),
        "turno": TURNO_REAL,
        "analise_ia": analise
    }
    
    os.makedirs("resultados", exist_ok=True)
    arquivo = f"resultados/gustavo_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(arquivo, "w", encoding="utf-8") as f:
        json.dump(resultado, f, indent=2, ensure_ascii=False)
    print(f"💾 Salvo: {arquivo}")
    
    # Enviar email
    print()
    print("📧 Enviando parecer por email...")
    
    corpo = f"""PARECER DE AUDITORIA - AGENTE IA ROTA VERDE
============================================

TURNO ANALISADO:
Motorista: {TURNO_REAL['motorista']}
Veículo: {TURNO_REAL['veiculo']}
Data: {TURNO_REAL['data']}
Score Sistema: {TURNO_REAL['score_sistema']} ({TURNO_REAL['nivel_risco']})

PARECER DA IA:
{analise}

---
Gerado: {datetime.now().strftime("%d/%m/%Y %H:%M")}
"""
    
    enviar_email(
        f"📋 Parecer IA - {TURNO_REAL['motorista']} - Score {TURNO_REAL['score_sistema']}",
        corpo
    )
    
    print()
    print("=" * 65)

if __name__ == "__main__":
    main()
    print()
    input("Pressione ENTER para fechar...")
