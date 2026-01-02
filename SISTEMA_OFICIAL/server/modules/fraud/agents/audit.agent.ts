
import { db } from '../../../core/db/connection.js';
import { entityHistory, rides } from '../../../../shared/schema.js';
import { eq, and, gte, sql } from 'drizzle-orm';
import type { FraudAgent, AgentContext } from './index.js';
import type { FraudRuleHit } from '../fraud.types.js';

export const AuditAgent: FraudAgent = {
    name: 'AuditAgent',
    description: 'Detecta manipulação via logs de auditoria',
    runOn: 'both',
    priority: 1,

    async analyze(ctx: AgentContext): Promise<FraudRuleHit[]> {
        const hits: FraudRuleHit[] = [];

        // REGRA 1: POST_CLOSE_EDIT (edição após fechamento)
        if (!ctx.isOpen && ctx.shiftEnd) {
            const tolerance = 5 * 60 * 1000; // 5 minutos
            const cutoff = new Date(ctx.shiftEnd.getTime() + tolerance);

            const postCloseEdits = await db
                .select()
                .from(entityHistory)
                .where(
                    and(
                        eq(entityHistory.entity, 'rides'),
                        gte(entityHistory.createdAt, cutoff)
                    )
                )
                .innerJoin(rides, eq(rides.id, entityHistory.entityId))
                .where(eq(rides.shiftId, ctx.shiftId));

            if (postCloseEdits.length > 0) {
                hits.push({
                    code: 'POST_CLOSE_EDIT',
                    label: 'Edição após fechamento do turno',
                    description: `${postCloseEdits.length} alterações em corridas após o turno fechar`,
                    severity: 'critical',
                    score: 40,
                    confidence: 0.95,
                    data: {
                        editCount: postCloseEdits.length,
                        shiftClosedAt: ctx.shiftEnd.toISOString(),
                        edits: postCloseEdits.slice(0, 5).map(e => ({
                            editedAt: e.entity_history.createdAt,
                            operation: e.entity_history.operation,
                            actorType: e.entity_history.actorType,
                        })),
                    },
                });
            }
        }

        // REGRA 2: BATCH_ENTRY (muitos inserts em pouco tempo)
        const rideInserts = await db
            .select({
                insertedAt: entityHistory.createdAt,
                rideId: entityHistory.entityId,
            })
            .from(entityHistory)
            .innerJoin(rides, eq(rides.id, entityHistory.entityId))
            .where(
                and(
                    eq(entityHistory.entity, 'rides'),
                    eq(entityHistory.operation, 'INSERT'),
                    eq(rides.shiftId, ctx.shiftId)
                )
            );

        if (rideInserts.length >= 8) {
            const times = rideInserts.map(r => new Date(r.insertedAt!).getTime()).sort((a, b) => a - b);
            const insertSpanMin = (times[times.length - 1] - times[0]) / 60000;

            // Comparar com spread de ride.hora
            const rideTimes = ctx.rides.map(r => r.hora.getTime()).sort((a, b) => a - b);
            const rideTimeSpanMin = rideTimes.length > 1
                ? (rideTimes[rideTimes.length - 1] - rideTimes[0]) / 60000
                : 0;

            if (insertSpanMin <= 10 && rideTimeSpanMin >= 120) {
                hits.push({
                    code: 'BATCH_ENTRY',
                    label: 'Entrada em lote suspeita',
                    description: `${rideInserts.length} corridas inseridas em ${insertSpanMin.toFixed(0)} min, mas com timestamps espalhados por ${rideTimeSpanMin.toFixed(0)} min`,
                    severity: 'high',
                    score: 30,
                    confidence: 0.9,
                    data: {
                        insertCount: rideInserts.length,
                        insertSpanMin,
                        rideTimeSpanMin,
                    },
                });
            }
        }

        // REGRA 3: DELETE_RECREATE (deletar e recriar corrida)
        // ADJUSTMENT 1: Always filter by shiftId
        const deleteOps = await db
            .select({
                entityId: entityHistory.entityId,
                actorId: entityHistory.actorId,
                createdAt: entityHistory.createdAt,
            })
            .from(entityHistory)
            .innerJoin(rides, eq(rides.id, entityHistory.entityId))
            .where(
                and(
                    eq(entityHistory.entity, 'rides'),
                    eq(entityHistory.operation, 'DELETE'),
                    eq(rides.shiftId, ctx.shiftId)  // <-- CRITICAL FIX APPLIED
                )
            );

        for (const del of deleteOps) {
            const recreate = await db
                .select()
                .from(entityHistory)
                .innerJoin(rides, eq(rides.id, entityHistory.entityId))
                .where(
                    and(
                        eq(entityHistory.entity, 'rides'),
                        eq(entityHistory.operation, 'INSERT'),
                        eq(entityHistory.actorId, del.actorId),
                        gte(entityHistory.createdAt, del.createdAt!),
                        eq(rides.shiftId, ctx.shiftId)
                    )
                )
                .limit(1);

            if (recreate.length > 0) {
                const gap = (new Date(recreate[0].entity_history.createdAt!).getTime() - new Date(del.createdAt!).getTime()) / 60000;
                if (gap <= 5) {
                    hits.push({
                        code: 'DELETE_RECREATE',
                        label: 'Padrão deletar/recriar corrida',
                        description: `Corrida deletada e outra criada ${gap.toFixed(0)} min depois pelo mesmo ator`,
                        severity: 'high',
                        score: 25,
                        confidence: 0.9,
                        data: {
                            deletedRideId: del.entityId,
                            recreatedAt: recreate[0].entity_history.createdAt,
                            gapMinutes: gap,
                            actorId: del.actorId,
                        },
                    });
                    break; // Só reportar 1 vez por turno
                }
            }
        }

        return hits;
    },
};
