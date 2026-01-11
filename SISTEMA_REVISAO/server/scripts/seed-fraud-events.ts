
import { db } from "../core/db/connection.js";
import { fraudEvents, shifts } from "../../shared/schema.js";
import { randomUUID } from "node:crypto";
import { desc } from "drizzle-orm";

async function seedFraudEvents() {
    console.log("🌱 Iniciando seed de eventos antifraude...");

    // Buscar turnos recentes para associar
    const recentShifts = await db.query.shifts.findMany({
        orderBy: (s, { desc }) => desc(s.inicio),
        limit: 20
    });

    if (recentShifts.length === 0) {
        console.error("❌ Nenhum turno encontrado para associar eventos.");
        process.exit(1);
    }

    const eventsToCreate = [];

    // Helpers
    const getRandomShift = () => recentShifts[Math.floor(Math.random() * recentShifts.length)];

    // Gerar eventos fake
    const levels = ['low', 'medium', 'high', 'critical'];
    const counts = { low: 3, medium: 3, high: 3, critical: 3 };

    for (const level of levels) {
        for (let i = 0; i < counts[level as keyof typeof counts]; i++) {
            const shift = getRandomShift();
            let score = 0;
            const reasons = [];

            switch (level) {
                case 'low':
                    score = Math.floor(Math.random() * 30);
                    reasons.push({ code: 'RULE_01', label: 'Horário Atípico', description: 'Início fora do padrão', severity: 'low', score: 10 });
                    break;
                case 'medium':
                    score = 30 + Math.floor(Math.random() * 30);
                    reasons.push({ code: 'RULE_02', label: 'Eficiência Baixa', description: 'Receita por KM abaixo do esperado', severity: 'medium', score: 40 });
                    break;
                case 'high':
                    score = 60 + Math.floor(Math.random() * 20);
                    reasons.push({ code: 'RULE_03', label: 'Desvio de Rota', description: 'KM muito acima do padrão', severity: 'high', score: 70 });
                    break;
                case 'critical':
                    score = 80 + Math.floor(Math.random() * 20);
                    reasons.push({ code: 'RULE_04', label: 'Inconsistência Grave', description: 'Valores não batem com hodômetro', severity: 'critical', score: 90 });
                    break;
            }

            eventsToCreate.push({
                shiftId: shift.id,
                driverId: shift.driverId,
                vehicleId: shift.vehicleId,
                riskScore: score,
                riskLevel: level,
                rules: reasons,
                details: { reasons }, // Padrao pede details.reasons
                metadata: { seed: true },
                status: 'pendente',
                detectedAt: new Date(),
                updatedAt: new Date()
            });
        }
    }

    // Inserir
    for (const event of eventsToCreate) {
        await db.insert(fraudEvents).values({
            id: randomUUID(),
            ...event,
            status: event.status as any
        });
    }

    console.log(`✅ ${eventsToCreate.length} eventos antifraude inseridos com sucesso!`);
    process.exit(0);
}

seedFraudEvents().catch((err) => {
    console.error("❌ Erro fatal:", err);
    process.exit(1);
});
