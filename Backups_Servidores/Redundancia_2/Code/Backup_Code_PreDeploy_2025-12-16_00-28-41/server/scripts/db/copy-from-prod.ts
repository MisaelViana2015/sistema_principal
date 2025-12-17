import "dotenv/config";
import postgres from "postgres";

/**
 * COPIAR DADOS DO BANCO DE PRODUÇÃO PARA HML
 */

async function copyData() {
    // Banco de PRODUÇÃO (Supabase - antigo)
    const prodUrl = "postgresql://postgres:IcSwODHDspcXBNf@db.dnmyuiqbrhaomfliyjrq.supabase.co:5432/postgres";

    // Banco de HML (Railway)
    const hmlUrl = "postgresql://postgres:BDnSvDzpOoQcJsRPSvkZnoDfFOCCwbKR@turntable.proxy.rlwy.net:21162/railway";

    console.log("🔌 Conectando aos bancos de dados...");

    const prodClient = postgres(prodUrl);
    const hmlClient = postgres(hmlUrl);

    try {
        console.log("\n📊 Buscando dados do banco de PRODUÇÃO...");

        // Buscar todos os drivers
        const drivers = await prodClient`SELECT * FROM drivers`;
        console.log(`✅ Encontrados ${drivers.length} motoristas`);

        // Limpar banco HML
        console.log("\n🗑️  Limpando banco HML...");
        await hmlClient`TRUNCATE TABLE sessions CASCADE`;
        await hmlClient`TRUNCATE TABLE drivers CASCADE`;
        console.log("✅ Banco HML limpo");

        // Copiar drivers
        console.log("\n📝 Copiando motoristas...");
        for (const driver of drivers) {
            await hmlClient`
                INSERT INTO drivers (id, nome, email, telefone, senha, role, is_active, created_at, updated_at)
                VALUES (
                    ${driver.id},
                    ${driver.nome},
                    ${driver.email},
                    ${driver.telefone},
                    ${driver.senha},
                    ${driver.role},
                    ${driver.is_active},
                    ${driver.created_at},
                    ${driver.updated_at}
                )
            `;
        }
        console.log(`✅ ${drivers.length} motoristas copiados`);

        // Buscar sessions (se existirem)
        try {
            const sessions = await prodClient`SELECT * FROM sessions`;
            console.log(`\n📝 Copiando ${sessions.length} sessões...`);

            for (const session of sessions) {
                await hmlClient`
                    INSERT INTO sessions (id, driver_id, token, ip_address, user_agent, expires_at, created_at)
                    VALUES (
                        ${session.id},
                        ${session.driver_id},
                        ${session.token},
                        ${session.ip_address},
                        ${session.user_agent},
                        ${session.expires_at},
                        ${session.created_at}
                    )
                `;
            }
            console.log(`✅ ${sessions.length} sessões copiadas`);
        } catch (error) {
            console.log("ℹ️  Nenhuma sessão para copiar");
        }

        console.log("\n✅ DADOS COPIADOS COM SUCESSO!");
        console.log("\n📋 Resumo:");
        console.log(`   Motoristas: ${drivers.length}`);
        console.log("\n🔐 Você pode fazer login com qualquer usuário do banco de produção!");

    } catch (error) {
        console.error("\n❌ Erro ao copiar dados:", error);
        process.exit(1);
    } finally {
        await prodClient.end();
        await hmlClient.end();
    }
}

copyData();
