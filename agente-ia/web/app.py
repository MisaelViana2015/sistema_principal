"""
Painel de Controle Web (Flask Tradicional)
"""
from flask import Flask, render_template, jsonify, request
import os
import sys

# Ajuste robusto de path para encontrar o src
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "src"))
sys.path.insert(0, SRC_DIR)

from agent_controller import agent

app = Flask(__name__)
app.config['SECRET_KEY'] = 'rota-verde-agente-secret'

@app.route('/')
def dashboard():
    return render_template('dashboard.html')

@app.route('/api/status')
def get_status():
    return jsonify(agent.get_status())

@app.route('/api/start', methods=['POST'])
def start_agent():
    success = agent.start()
    return jsonify({"success": success})

@app.route('/api/stop', methods=['POST'])
def stop_agent():
    success = agent.stop()
    return jsonify({"success": success})

@app.route('/api/pause', methods=['POST'])
def pause_agent():
    success = agent.pause()
    return jsonify({"success": success})

@app.route('/api/resume', methods=['POST'])
def resume_agent():
    success = agent.resume()
    return jsonify({"success": success})

@app.route('/api/add-task', methods=['POST'])
def add_task():
    data = request.json or {}
    prompt = data.get("prompt")
    if not prompt:
        return jsonify({"success": False, "error": "prompt obrigatório"}), 400

    agent.task_queue.add_task(
        name=data.get('name', 'Manual Task'),
        prompt=prompt,
        priority=int(data.get('priority', 5))
    )
    return jsonify({"success": True})

if __name__ == '__main__':
    print("🚀 Painel de Controle: http://localhost:5000")
    # Execucao padrao do Flask (dev server)
    app.run(host='0.0.0.0', port=5000, debug=False)
