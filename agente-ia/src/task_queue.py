import queue
import threading
from datetime import datetime

class TaskQueue:
    def __init__(self):
        self._queue = queue.PriorityQueue()
        self._lock = threading.Lock()

    def add_task(self, name: str, prompt: str, priority: int = 5, meta: dict | None = None):
        task = {
            "name": name,
            "prompt": prompt,
            "priority": priority,
            "meta": meta or {},
            "created_at": datetime.now().isoformat()
        }
        # PriorityQueue ordena pelo primeiro elemento da tupla (priority).
        # Adicionamos timestamp para garantir ordem de chegada em prioridades iguais.
        self._queue.put((priority, datetime.now().timestamp(), task))

    def get_next(self):
        try:
            _, _, task = self._queue.get_nowait()
            return task
        except queue.Empty:
            return None

    def size(self) -> int:
        return self._queue.qsize()

    def clear(self):
        with self._lock:
            while not self._queue.empty():
                try:
                    self._queue.get_nowait()
                except queue.Empty:
                    break
