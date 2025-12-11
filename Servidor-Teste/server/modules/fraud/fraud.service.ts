
import * as repository from "./fraud.repository.js";

export async function getAllEvents() {
    return await repository.findAllFraudEvents();
}

export async function getStats() {
    const rawStats = await repository.getFraudStats();

    // Transform into consumption-friendly format
    const totalEvents = rawStats.reduce((acc, curr) => acc + Number(curr.count), 0);
    const sus = rawStats.find(s => s.severity === 'suspeito')?.count || 0;
    const crit = rawStats.find(s => s.severity === 'critico')?.count || 0;

    return {
        totalEvents,
        suspeitos: Number(sus),
        criticos: Number(crit),
        ranking: [] // populated via separate call if needed, or we implement getFullDashboard here
    };
}

export async function getRanking() {
    const ranking = await repository.getDriverRiskRanking();
    return ranking.map(r => ({
        ...r,
        nivel: Number(r.maxScore) > 70 ? 'critico' : (Number(r.maxScore) > 30 ? 'suspeito' : 'ok')
    }));
}
