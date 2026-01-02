import json
import time
import threading
import logging
from pathlib import Path
from datetime import datetime
import os
import sys
from croniter import croniter

# Adicionar diretorio atual ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from chatgpt_automation import ChatGPTAutomation
from task_queue import TaskQueue
from api_client import ApiClient

# Criar diretorio de logs se nao existir
os.makedirs('logs', exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('logs/agent.log', encoding="utf-8"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AgentController:
    def __init__(self):
        self.config = self._load_config()
        self.is_running = False
        self.is_paused = False
        self.chatgpt = None
        self.task_queue = TaskQueue()
        self.current_task = None

        self.api = ApiClient(self.config.get("rota_verde_api", ""))

        self.stats = {
            "started_at": None,
            "tasks_completed": 0,
            "conversations_rotated": 0,
            "last_activity": None,
            "last_scheduler_tick": None
        }

        # agenda cron -> next_run
        self._cron_state = {}

    def _load_config(self):
        # Tentar carregar da raiz do projeto (c:\dev\agente-ia\config.json)
        config_path = Path("config.json")
        if not config_path.exists():
             # Fallback para parente do src (se rodando de src/)
             config_path = Path(__file__).parent.parent / "config.json"
             
        try:
            with open(config_path, 'r', encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            # Fallback CP1252 se UTF-8 falhar
            try:
                with open(config_path, 'r') as f:
                    return json.load(f)
            except:
                logger.error(f"Erro CRITICO ao carregar config: {e}")
                return {}

    def start(self):
        if self.is_running:
            logger.warning("Agente já está rodando")
            return False

        logger.info("🚀 Iniciando Agente IA...")
        self.is_running = True
        self.stats["started_at"] = datetime.now().isoformat()

        try:
            self.chatgpt = ChatGPTAutomation(self.config)
            self.chatgpt.start_browser()

            self._init_cron_state()

            # Iniciar loop principal
            self.main_thread = threading.Thread(target=self._main_loop, daemon=True)
            self.main_thread.start()

            logger.info("✅ Agente iniciado com sucesso!")
            return True
        except Exception as e:
            logger.error(f"Falha ao iniciar agente: {e}")
            self.is_running = False
            return False

    def stop(self):
        logger.info("🛑 Parando Agente IA...")
        self.is_running = False

        if self.chatgpt:
            try:
                self.chatgpt.close_browser()
            except:
                pass

        logger.info("✅ Agente parado com sucesso!")
        return True

    def pause(self):
        self.is_paused = True
        logger.info("⏸️ Agente pausado")
        return True

    def resume(self):
        self.is_paused = False
        logger.info("▶️ Agente retomado")
        return True

    def get_status(self):
        return {
            "is_running": self.is_running,
            "is_paused": self.is_paused,
            "current_task": self.current_task,
            "stats": self.stats,
            "queue_size": self.task_queue.size()
        }

    def _init_cron_state(self):
        now = datetime.now()
        for t in self.config.get("tasks", []):
            name = t["name"]
            cron = t.get("cron")
            enabled = bool(t.get("enabled", False))
            if not cron or not enabled:
                continue
            
            try:
                it = croniter(cron, now)
                self._cron_state[name] = {
                    "cron": cron,
                    "next_run": it.get_next(datetime)
                }
                logger.info(f"📅 Tarefa '{name}' agendada para: {self._cron_state[name]['next_run']}")
            except Exception as e:
                logger.error(f"Erro ao agendar tarefa {name}: {e}")

    def _scheduler_tick(self):
        now = datetime.now()
        self.stats["last_scheduler_tick"] = now.isoformat()

        for t in self.config.get("tasks", []):
            if not t.get("enabled", False):
                continue

            name = t["name"]
            state = self._cron_state.get(name)
            if not state:
                continue

            if now >= state["next_run"]:
                prompt = self._build_task_prompt(name)
                # Prioridade 3 (media) para tarefas agendadas
                self.task_queue.add_task(name=name, prompt=prompt, priority=3)
                
                # calcula próximo
                it = croniter(state["cron"], now)
                state["next_run"] = it.get_next(datetime)
                logger.info(f"🧩 Task agendada disparada: {name} (próximo: {state['next_run']})")

    def _build_task_prompt(self, name: str) -> str:
        # Tenta puxar contexto do Railway pra prompt ficar “rico”
        if name == "analise_fraude":
            ctx = self.api.get_recent_fraud_events()
            context_str = json.dumps(ctx, ensure_ascii=False, indent=2) if ctx else 'Sem dados (endpoint não disponível ou vazio).'
            return (
                "ATUE COMO: Auditor Sênior do sistema Rota Verde.\n"
                "TAREFA: Analisar sinais de fraude recentes e sugerir ações.\n\n"
                f"CONTEXTO (Últimos Eventos):\n{context_str}\n\n"
                "SAÍDA ESPERADA:\n"
                "Lista priorizada (TOP 5) com: Motorista/Turno | Regra Violada | Evidência | Ação Recomendada."
            )
            
        if name == "validacao_calculos":
            ctx = self.api.get_open_shifts_summary()
            context_str = json.dumps(ctx, ensure_ascii=False, indent=2) if ctx else 'Sem dados (endpoint não disponível ou vazio).'
            return (
                "ATUE COMO: Revisor Técnico Financeiro.\n"
                "TAREFA: Validar consistência de cálculos dos turnos abertos.\n\n"
                f"CONTEXTO (Turnos Abertos):\n{context_str}\n\n"
                "SAÍDA ESPERADA:\n"
                "Aponte quaisquer inconsistências financeiras ou operacionais detectadas. Se tudo estiver OK, confirme."
            )

        return f"Tarefa Agendada: {name}. Por favor, gere um checklist de execução e validação para esta rotina."

    def _main_loop(self):
        check_interval = int(self.config.get("check_interval_seconds", 300))

        while self.is_running:
            try:
                if self.is_paused:
                    time.sleep(1)
                    continue

                # tick do scheduler interno
                self._scheduler_tick()

                task = self.task_queue.get_next()
                if task:
                    self._execute_task(task)
                else:
                    # Sleep menor para nao bloquear o scheduler
                    time.sleep(min(5, check_interval))

            except Exception as e:
                logger.error(f"Erro no loop principal: {e}")
                time.sleep(10)

    def _execute_task(self, task):
        self.current_task = task["name"]
        self.stats["last_activity"] = datetime.now().isoformat()
        logger.info(f"📋 Executando tarefa: {task['name']}")

        try:
            response = self.chatgpt.send_message(task["prompt"])
            
            # Salvar log da resposta
            log_filename = f"logs/{task['name']}_{int(time.time())}.txt"
            with open(log_filename, "w", encoding="utf-8") as f:
                f.write(f"--- PROMPT ---\n{task['prompt']}\n\n--- RESPOSTA ---\n{response}")

            logger.info(f"✅ Tarefa concluída: {task['name']}")
            self.stats["tasks_completed"] += 1

            if self.chatgpt.should_rotate():
                self.chatgpt.rotate_conversation()
                self.stats["conversations_rotated"] += 1

        except Exception as e:
            logger.error(f"Erro na tarefa {task['name']}: {e}")
        finally:
            self.current_task = None

# Singleton global para importacao
agent = AgentController()
