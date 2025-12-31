import { Router } from "express";
import { recalculateAllShifts } from "../scripts/recalculate-shifts.js";
import path from "path";
import { fileURLToPath } from "url";

import { requireAuth, requireAdmin } from "../core/middlewares/authMiddleware.js";

const router = Router();

// 🔒 PROTEGER TODAS AS ROTAS DE FERRAMENTAS ADMINISTRATIVAS
router.use(requireAuth, requireAdmin);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Página HTML para executar o recálculo
 */
router.get("/recalculate-page", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recalcular Turnos - Rota Verde</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #333; margin-bottom: 10px; font-size: 28px; }
        p { color: #666; margin-bottom: 30px; line-height: 1.6; }
        button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        button:disabled { background: #ccc; cursor: not-allowed; }
        #result {
            margin-top: 20px;
            padding: 20px;
            border-radius: 10px;
            display: none;
        }
        #result.success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; }
        #result.error { background: #f8d7da; border: 1px solid #f5c6cb; color: #721c24; }
        #result.loading { background: #d1ecf1; border: 1px solid #bee5eb; color: #0c5460; }
        .spinner {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid rgba(255,255,255,.3);
            border-radius: 50%;
            border-top-color: white;
            animation: spin 1s ease-in-out infinite;
            margin-right: 10px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔄 Recalcular Totais dos Turnos</h1>
        <p>Este script irá recalcular os totais de <strong>todos os turnos finalizados</strong> no banco de dados.</p>
        <p><strong>⚠️ Atenção:</strong> Este processo pode levar alguns segundos.</p>
        
        <button id="recalcBtn" onclick="recalculate()">Executar Recálculo</button>
        
        <div id="result"></div>
    </div>

    <script>
        async function recalculate() {
            const btn = document.getElementById('recalcBtn');
            const result = document.getElementById('result');
            
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Recalculando...';
            
            result.className = 'loading';
            result.style.display = 'block';
            result.innerHTML = '⏳ Processando turnos... Por favor, aguarde.';
            
            try {
                const response = await fetch('/api/admin-tools/recalculate-shifts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    result.className = 'success';
                    result.innerHTML = \`
                        <h3>✅ Recálculo Concluído com Sucesso!</h3>
                        <p><strong>Total de turnos:</strong> \${data.total}</p>
                        <p><strong>Atualizados:</strong> \${data.updated}</p>
                        <p><strong>Erros:</strong> \${data.errors}</p>
                    \`;
                } else {
                    throw new Error(data.message || 'Erro desconhecido');
                }
            } catch (error) {
                result.className = 'error';
                result.innerHTML = \`<h3>❌ Erro</h3><p>\${error.message}</p>\`;
            } finally {
                btn.disabled = false;
                btn.innerHTML = 'Executar Recálculo Novamente';
            }
        }
    </script>
</body>
</html>
    `);
});

/**
 * Endpoint para recalcular todos os turnos
 */
router.post("/recalculate-shifts", async (req, res) => {
    try {
        console.log("🚀 Iniciando recálculo de turnos via API...");
        const result = await recalculateAllShifts();
        res.json({
            success: true,
            message: "Recálculo concluído!",
            ...result
        });
    } catch (error: any) {
        console.error("Erro ao recalcular turnos:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Erro ao recalcular turnos"
        });
    }
});

/**
 * Endpoint para recalcular UM turno específico (TEMPORÁRIO)
 */
import { recalculateShiftTotals } from "../modules/shifts/shifts.service.js";

router.get("/recalculate-shift/:id", async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🔄 Recalculando turno específico: ${id}`);
        const result = await recalculateShiftTotals(id);
        res.json({
            success: true,
            message: `Turno ${id} recalculado!`,
            data: result
        });
    } catch (error: any) {
        console.error("Erro ao recalcular turno:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Erro ao recalcular turno"
        });
    }
});

export default router;
