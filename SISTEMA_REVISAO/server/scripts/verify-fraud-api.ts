
import jwt from "jsonwebtoken";
// Use fetch API (node 18+ has it built-in)

const SECRET = "dev_secret_123";
const API_URL = "http://localhost:5000/api";

// 1. Generate Token (Admin)
// Payload needs to match what verifyToken expects and what system uses
// authMiddleware req.user = payload.
// If code uses req.user.id or req.user.role...
const token = jwt.sign(
    {
        id: "admin-verification-script",
        role: "admin",
        name: "Admin Script"
    },
    SECRET,
    { expiresIn: "1h" }
);

console.log("🔑 Token gerado (Admin).");

async function run() {
    try {
        // 2. Buscar Turnos Finalizados
        console.log("📡 Buscando turnos finalizados...");
        const shiftsRes = await fetch(`${API_URL}/shifts?status=finalizado`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!shiftsRes.ok) {
            throw new Error(`Falha ao buscar turnos: ${shiftsRes.status} ${shiftsRes.statusText}`);
        }

        const shifts = await shiftsRes.json();
        // Shifts list might be wrapped or array
        const shiftList = Array.isArray(shifts) ? shifts : (shifts.data || []);

        console.log(`📦 Encontrados ${shiftList.length} turnos.`);

        // Pegar os últimos 5
        // (Assuming API returns sorted or random, we map them)
        // If API doesn't support filter by status, we filter manually
        const finishedShifts = shiftList.filter((s: any) => s.status === 'finalizado').slice(0, 5);

        if (finishedShifts.length === 0) {
            console.log("⚠️ Nenhum turno finalizado encontrado na listagem.");
            return;
        }

        // 3. Trigger Analysis
        for (const shift of finishedShifts) {
            console.log(`▶️ Disparando análise para turno ${shift.id}...`);
            const analyzeRes = await fetch(`${API_URL}/fraud/analyze/${shift.id}`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (analyzeRes.ok) {
                const json = await analyzeRes.json();
                console.log("   ✅ Resultado:", JSON.stringify(json, null, 2));
            } else {
                console.error("   ❌ Falha na análise:", await analyzeRes.text());
            }
            console.log("---");
        }

    } catch (err) {
        console.error("❌ Erro fatal:", err);
    }
}

run();
