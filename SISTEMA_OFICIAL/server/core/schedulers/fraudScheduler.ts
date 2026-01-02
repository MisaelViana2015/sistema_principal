import cron from "node-cron";
import { db } from "../../core/db/connection.js";
import { shifts } from "../../../shared/schema.js";
import { eq, sql } from "drizzle-orm";
import { FraudService } from "../../modules/fraud/fraud.service.js";
import { FraudRepository } from "../../modules/fraud/fraud.repository.js";
import { runFraudOrchestrator } from "../../modules/fraud/fraud.orchestrator.js";

/**
 * FRAUD ANALYSIS SCHEDULER
 * 
 * Executa análise de fraude em turnos abertos automaticamente.
 * Isso permite detecção em tempo real, não apenas quando o turno finaliza.
 * 
 * Frequência: A cada 15 minutos
 */

// Chave única para o advisory lock (inteiro arbitrário)
const LOCK_KEY = 938472105;

let isRunning = false;

async function acquireLock(): Promise<boolean> {
    try {
        const result = await db.execute(sql`SELECT pg_try_advisory_lock(${LOCK_KEY}) as locked`);
        return result.rows[0]?.locked === true;
    } catch (error) {
        console.error("[FRAUD_SCHEDULER] Erro ao adquirir lock:", error);
        return false;
    }
}

async function releaseLock(): Promise<void> {
    try {
        await db.execute(sql`SELECT pg_advisory_unlock(${LOCK_KEY})`);
    } catch (error) {
        console.error("[FRAUD_SCHEDULER] Erro ao liberar lock:", error);
    }
}

async function runOpenShiftAnalysis() {
    if (isRunning) {
        console.log("[FRAUD_SCHEDULER] Análise já em execução local, pulando...");
        return;
    }

    // Tentar adquirir lock global (Railway multi-instância)
    const lockAcquired = await acquireLock();
    if (!lockAcquired) {
        console.log("[FRAUD_SCHEDULER] Outra instância já possui o lock, pulando...");
        return;
    }

    isRunning = true;
    console.log(`[FRAUD_SCHEDULER] Iniciando análise de turnos abertos: ${new Date().toISOString()}`);

    try {
        // Buscar turnos abertos
        const openShifts = await db
            .select({ id: shifts.id })
            .from(shifts)
            .where(eq(shifts.status, 'em_andamento'));

        console.log(`[FRAUD_SCHEDULER] ${openShifts.length} turnos abertos para analisar`);

        let alertsGenerated = 0;
        let criticalAlerts = 0;

        for (const shift of openShifts) {
            try {
                const analysis = await runFraudOrchestrator(shift.id);

                // ADJUSTMENT 5: Dedupe de regras por janela de tempo (Implemented in Repository, called here)
                await FraudRepository.saveFraudEvent(analysis);

                if (analysis.score.totalScore > 0) alertsGenerated++;
                if (analysis.score.level === 'critical' || analysis.score.level === 'high') criticalAlerts++;
            } catch (err) {
                console.error(`[FRAUD_SCHEDULER] Erro no turno ${shift.id}:`, err);
            }
        }

        console.log(`[FRAUD_SCHEDULER] Concluído: ${alertsGenerated} alertas, ${criticalAlerts} críticos/altos`);

        if (criticalAlerts > 0) {
            console.warn(`[FRAUD_SCHEDULER] ⚠️ ATENÇÃO: ${criticalAlerts} alertas críticos/altos!`);
        }

    } catch (error) {
        console.error("[FRAUD_SCHEDULER] Erro na análise automática:", error);
    } finally {
        isRunning = false;
        await releaseLock();
    }
}

export function startFraudScheduler() {
    const schedule = process.env.FRAUD_ANALYSIS_CRON || "*/15 * * * *";
    console.log(`[FRAUD_SCHEDULER] Iniciando scheduler: ${schedule}`);

    cron.schedule(schedule, runOpenShiftAnalysis, {
        timezone: "America/Sao_Paulo"
    });

    // Executar após 30 segundos do boot
    setTimeout(() => {
        console.log("[FRAUD_SCHEDULER] Executando análise inicial...");
        runOpenShiftAnalysis();
    }, 30000);

    console.log("[FRAUD_SCHEDULER] ✅ Scheduler de fraude ativo com advisory lock!");
}
