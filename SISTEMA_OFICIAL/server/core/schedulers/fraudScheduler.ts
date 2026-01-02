import cron from "node-cron";
import { FraudService } from "../../modules/fraud/fraud.service.js";

/**
 * FRAUD ANALYSIS SCHEDULER
 * 
 * Executa análise de fraude em turnos abertos automaticamente.
 * Isso permite detecção em tempo real, não apenas quando o turno finaliza.
 * 
 * Frequência: A cada 15 minutos
 */

let isRunning = false;

async function runOpenShiftAnalysis() {
    if (isRunning) {
        console.log("[FRAUD_SCHEDULER] Análise já em execução, pulando...");
        return;
    }

    isRunning = true;
    console.log(`[FRAUD_SCHEDULER] Iniciando análise de turnos abertos: ${new Date().toISOString()}`);

    try {
        const results = await FraudService.analyzeTodayOpenShifts();

        // Contar alertas gerados
        const alertsGenerated = results.filter((r: any) => r.score.totalScore > 0).length;
        const criticalAlerts = results.filter((r: any) => r.score.level === 'critical' || r.score.level === 'high').length;

        console.log(`[FRAUD_SCHEDULER] Análise concluída: ${results.length} turnos analisados, ${alertsGenerated} alertas, ${criticalAlerts} críticos/altos`);

        // Log summary for monitoring
        if (criticalAlerts > 0) {
            console.warn(`[FRAUD_SCHEDULER] ⚠️ ATENÇÃO: ${criticalAlerts} alertas críticos/altos detectados em turnos ABERTOS!`);
        }

    } catch (error) {
        console.error("[FRAUD_SCHEDULER] Erro na análise automática:", error);
    } finally {
        isRunning = false;
    }
}

export function startFraudScheduler() {
    // Executa a cada 15 minutos: "*/15 * * * *"
    // Para produção, pode ajustar para a cada 30 min se necessário
    const schedule = process.env.FRAUD_ANALYSIS_CRON || "*/15 * * * *";

    console.log(`[FRAUD_SCHEDULER] Iniciando scheduler de análise de fraude: ${schedule}`);

    cron.schedule(schedule, runOpenShiftAnalysis, {
        timezone: "America/Sao_Paulo"
    });

    // Também executa uma vez ao iniciar o servidor (após 30 segundos para dar tempo de estabilizar)
    setTimeout(() => {
        console.log("[FRAUD_SCHEDULER] Executando análise inicial...");
        runOpenShiftAnalysis();
    }, 30000);

    console.log("[FRAUD_SCHEDULER] ✅ Scheduler de fraude ativo!");
}
