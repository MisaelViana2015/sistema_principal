import fs from "fs";
import "dotenv/config";

// Load data
const data = JSON.parse(fs.readFileSync("neon_17.json", "utf-8"));
const { drivers, shifts, rides } = data;

// We need to map Driver IDs (Old -> New)
// Ideally we fetch current drivers from Target to do this, but we can't connect easily.
// Checking fetch_migration_data.ts, we fetched source drivers.
// We accepted we might need to map them dynamically.
// IF we can't connect to Target to get IDs, we are stuck.
// BUT `psql` connection might work.

// STRATEGY:
// 1. Generate a SQL that attempts to look up drivers by name OR uses a placeholder.
// Actually, SQL `DO $$ ... END $$` block can look up IDs.

let sql = `
DO $$
DECLARE
    r_shift RECORD;
    r_ride RECORD;
    v_driver_id TEXT;
    v_shift_id TEXT;
BEGIN
    RAISE NOTICE 'Starting Import...';
`;

// Helper to escape strings
const esc = (val: any) => (val === null || val === undefined) ? 'NULL' : `'${val.toString().replace(/'/g, "''")}'`;
const escNum = (val: any) => (val === null || val === undefined) ? '0' : val;

// Map Source Driver ID -> Name
const sourceDriverNames = new Map<string, string>();
drivers.forEach((d: any) => {
    sourceDriverNames.set(d.id, d.nome || d.name);
});

shifts.forEach((s: any) => {
    const driverName = sourceDriverNames.get(s.driver_id);

    // SQL to find driver ID
    sql += `
    -- Shift for ${driverName} at ${s.inicio}
    SELECT id INTO v_driver_id FROM drivers WHERE LOWER(TRIM(nome)) = LOWER(TRIM(${esc(driverName)}));

    IF v_driver_id IS NOT NULL THEN
        -- Check duplicate
        IF NOT EXISTS (SELECT 1 FROM shifts WHERE driver_id = v_driver_id AND inicio = ${esc(s.inicio)}) THEN
            INSERT INTO shifts (
                id, driver_id, vehicle_id, inicio, fim,
                km_inicial, km_final, status,
                total_app, total_particular, total_bruto,
                total_custos, liquido, repasse_empresa, repasse_motorista,
                total_corridas, duracao_min, valor_km
            ) VALUES (
                gen_random_uuid(), v_driver_id, ${esc(s.vehicle_id)}, ${esc(s.inicio)}, ${esc(s.fim)},
                ${escNum(s.km_inicial)}, ${escNum(s.km_final)}, ${esc(s.status)},
                ${escNum(s.total_app)}, ${escNum(s.total_particular)}, ${escNum(s.total_bruto)},
                ${escNum(s.total_custos)}, ${escNum(s.liquido)}, ${escNum(s.repasse_empresa)}, ${escNum(s.repasse_motorista)},
                ${escNum(s.total_corridas)}, ${escNum(s.duracao_min)}, ${escNum(s.valor_km)}
            ) RETURNING id INTO v_shift_id;

            RAISE NOTICE 'Inserted Shift %', v_shift_id;

            -- INSERT RIDES
            `;

    // Filter rides for this shift
    const myRides = rides.filter((r: any) => r.shift_id === s.id);
    myRides.forEach((r: any) => {
        sql += `
            INSERT INTO rides (id, shift_id, tipo, valor, hora) VALUES (gen_random_uuid(), v_shift_id, ${esc(r.tipo)}, ${escNum(r.valor)}, ${esc(r.hora)});`;
    });

    sql += `
        ELSE
            RAISE NOTICE 'Skipping Duplicate Shift for % at %', ${esc(driverName)}, ${esc(s.inicio)};
        END IF;
    ELSE
        RAISE NOTICE 'Driver NOT FOUND: %', ${esc(driverName)};
    END IF;
    `;
});

sql += `
END $$;
`;

fs.writeFileSync("neon_migration.sql", sql);
console.log("Generated neon_migration.sql");
