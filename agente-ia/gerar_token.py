import jwt
from datetime import datetime, timezone, timedelta

JWT_SECRET = "dev_secret_123"

payload = {
    "sub": "admin-agent",
    "id": "agent-001",
    "nome": "Agente IA",
    "email": "agente@rotaverde.com",
    "role": "admin",
    "iat": datetime.now(timezone.utc),
    "exp": datetime.now(timezone.utc) + timedelta(days=30)
}

token = jwt.encode(payload, JWT_SECRET, algorithm="HS256")

# Salvar token em arquivo
with open("token_gerado.txt", "w") as f:
    f.write(token)

print(f"Token salvo em token_gerado.txt")
print(f"Token: {token[:50]}...")
