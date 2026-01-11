
import { db } from "../../core/db/connection.js";
import { costTypes } from "../../../shared/schema.js";
import { eq, isNull, or, sql } from "drizzle-orm";

/**
 * Script de Migração de Dados Visual
 *
 * Objetivo: Preencher campos 'icon' e 'color' para tipos de custo legados
 * que possuem esses campos nulos no banco de dados.
 *
 * A lógica segue o mesmo fallback visual usado no frontend.
 */

async function migrateCostTypesVisuals() {
    console.log("🎨 Iniciando migração visual de tipos de custo...");

    try {
        const allTypes = await db.select().from(costTypes);
        console.log(`📋 Encontrados ${allTypes.length} tipos de custo.`);

        let updatedCount = 0;

        for (const type of allTypes) {
            // Se já tem cor e ícone, pula
            if (type.icon && type.color) continue;

            const lowerName = type.name.toLowerCase();
            let updates: { icon: string, color: string } | null = null;

            if (lowerName.includes('aliment') || lowerName.includes('refei')) {
                updates = { icon: 'utensils', color: 'yellow' };
            } else if (lowerName.includes('combust') || lowerName.includes('abastec') || lowerName.includes('gasolin') || lowerName.includes('etanol') || lowerName.includes('diesel')) {
                updates = { icon: 'fuel', color: 'red' };
            } else if (lowerName.includes('manuten') || lowerName.includes('oficina') || lowerName.includes('pneu') || lowerName.includes('oleo') || lowerName.includes('mecânica')) {
                updates = { icon: 'wrench', color: 'gray' }; // Gray fallback, maybe not available in predefined list but handled
            } else if (lowerName.includes('lavage') || lowerName.includes('limpez')) {
                updates = { icon: 'zap', color: 'cyan' };
            } else if (lowerName.includes('pedág') || lowerName.includes('pedag') || lowerName.includes('estacion')) {
                updates = { icon: 'ticket', color: 'orange' }; // 'ticket' value maps to Tag icon
            } else if (lowerName.includes('recarga') || lowerName.includes('celular') || lowerName.includes('app')) {
                updates = { icon: 'smartphone', color: 'green' };
            } else if (lowerName.includes('teste')) {
                updates = { icon: 'zap', color: 'purple' };
            } else {
                // Default genérico
                updates = { icon: 'dollar-sign', color: 'gray' };
            }

            if (updates) {
                console.log(`🔄 Atualizando: ${type.name} -> Icon: ${updates.icon}, Color: ${updates.color}`);
                await db.update(costTypes)
                    .set(updates)
                    .where(eq(costTypes.id, type.id));
                updatedCount++;
            }
        }

        console.log(`✅ Migração concluída! ${updatedCount} registros atualizados.`);

    } catch (error) {
        console.error("❌ Erro na migração:", error);
    }
}

// Permitir execução direta ou importação
if (process.argv[1] === import.meta.filename) {
    migrateCostTypesVisuals()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

export { migrateCostTypesVisuals };
