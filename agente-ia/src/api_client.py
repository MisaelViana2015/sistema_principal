import requests
import os
import logging

logger = logging.getLogger(__name__)

class ApiClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.token = os.getenv("ROTA_VERDE_AGENT_TOKEN", "")

    def _headers(self):
        h = {"Content-Type": "application/json"}
        if self.token:
            h["Authorization"] = f"Bearer {self.token}"
        return h

    def health(self) -> bool:
        try:
            r = requests.get(f"{self.base_url}/health", timeout=10)
            return r.status_code < 500
        except Exception:
            return False

    def get_open_shifts_summary(self):
        """
        Endpoint sugerido no backend:
        GET /agent/open-shifts-summary
        Retorna: lista de turnos abertos com contagens básicas
        """
        try:
            # TODO: Implementar endpoint real no backend se nao existir
            # Por enquanto, se falhar, retorna None e o prompt sera generico
            r = requests.get(f"{self.base_url}/agent/open-shifts-summary", headers=self._headers(), timeout=20)
            if r.status_code == 200:
                return r.json()
            if r.status_code == 404:
                return None # Endpoint nao existe ainda
            logger.warning(f"open-shifts-summary status={r.status_code}")
            return None
        except Exception as e:
            logger.error(f"Erro get_open_shifts_summary: {e}")
            return None

    def get_recent_fraud_events(self):
        """
        Endpoint sugerido:
        GET /agent/fraud-events?window=60
        """
        try:
            r = requests.get(f"{self.base_url}/agent/fraud-events?window=60", headers=self._headers(), timeout=20)
            if r.status_code == 200:
                return r.json()
            if r.status_code == 404:
                return None
            logger.warning(f"fraud-events status={r.status_code}")
            return None
        except Exception as e:
            logger.error(f"Erro get_recent_fraud_events: {e}")
            return None
