
import { Router } from "express";
import postgres from "postgres";

const router = Router();

import { migrationController } from "./migration.controller.js";
router.get("/migrate-emergency", migrationController.runMigration);

router.post("/sync-data", async (req, res) => {
    const { secret, testDbUrl } = req.body;

    if (secret !== process.env.JWT_SECRET) {
        return res.status(403).json({ error: "Acesso negado" });
    }

    if (!testDbUrl) {
        return res.status(400).json({ error: "URL do banco de teste necessária" });
    }

    // Usar a URL local do ambiente (Produção)
    const prodDbUrl = process.env.DATABASE_URL;
    if (!prodDbUrl) {
        return res.status(500).json({ error: "DATABASE_URL de produção não definida" });
    }

    console.log("🔄 INICIANDO SINCRONIZAÇÃO VIA API");

    const sqlTest = postgres(testDbUrl);
    const sqlProd = postgres(prodDbUrl);

    try {
        // 1. Limpar tabela destino
        const tables = ['expenses', 'rides', 'shifts', 'vehicles', 'fixed_costs', 'cost_types', 'drivers'];
        for (const table of tables) {
            await sqlProd.unsafe(`DELETE FROM ${table}`);
        }

        // 2. Copiar dados
        const copyOrder = ['drivers', 'cost_types', 'fixed_costs', 'vehicles', 'shifts', 'rides', 'expenses'];

        let report: string[] = [];

        for (const table of copyOrder) {
            const rows = await sqlTest.unsafe(`SELECT * FROM ${table}`);

            if (rows.length > 0) {
                await sqlProd.begin(async sql => {
                    for (const row of rows) {
                        await sql.unsafe(`INSERT INTO ${table} ${sqlProd(row)}`);
                    }
                });
                report.push(`${table}: ${rows.length} registros`);
            } else {
                report.push(`${table}: 0 registros`);
            }
        }

        res.json({ success: true, report });
    } catch (error: any) {
        console.error("Erro na sincronização:", error);
        res.status(500).json({ error: error.message });
    } finally {
        await sqlTest.end();
        await sqlProd.end();
    }
});


export default router;
