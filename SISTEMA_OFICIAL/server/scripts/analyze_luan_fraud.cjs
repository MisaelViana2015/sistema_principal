
const { PrismaClient } = require('@prisma/client');
const { format } = require('date-fns');

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando análise de fraude - 05/12/2025 (JS Mode)...');

    // 05/12 as 08:00 até 06/12 as 02:00
    const startDate = new Date('2025-12-05T08:00:00.000-03:00');
    const endDate = new Date('2025-12-06T02:00:00.000-03:00');

    console.log(`Buscando turnos entre ${startDate.toISOString()} e ${endDate.toISOString()}`);

    const shifts = await prisma.shift.findMany({
        where: {
            OR: [
                { inicio: { gte: startDate, lte: endDate } },
                { fim: { gte: startDate, lte: endDate } }
            ]
        },
        include: {
            driver: true,
            rides: { orderBy: { hora: 'asc' } }
        }
    });

    console.log(`Encontrados ${shifts.length} turnos.`);

    const targetDrivers = ['Luan', 'Felipe', 'Misael', 'Robson', 'Gustavo'];

    const analysis = shifts
        .filter(s => targetDrivers.some(name => s.driver.name.includes(name)))
        .map(s => ({
            driver: s.driver.name,
            start: s.inicio,
            end: s.fim,
            rideCount: s.rides.length,
            rides: s.rides.map(r => ({
                time: r.hora,
                value: Number(r.valor),
                type: r.tipo
            }))
        }));

    console.log('\n=== RELATÓRIO DE CONFRONTO (19:08 - 19:26) ===');

    analysis.forEach(driverData => {
        console.log(`\n--------------------------------------------------`);
        console.log(`MOTORISTA: ${driverData.driver}`);
        console.log(`Turno: ${new Date(driverData.start).toLocaleTimeString()} - ${driverData.end ? new Date(driverData.end).toLocaleTimeString() : 'Em andamento'}`);
        console.log(`Total Corridas: ${driverData.rideCount}`);

        // Intervalo crítico: 18:50 até 19:40 para dar contexto
        const criticalRides = driverData.rides.filter(r => {
            const t = new Date(r.time);
            const h = t.getUTCHours() - 3; // Ajuste manual fuso se precisar, mas vamos usargetHours local do server
            // Vamos usar timestamp para ser preciso
            // 19:08 dia 05 = 
            // Vamos pegar tudo entre 18:30 e 20:00
            const rangeStart = new Date('2025-12-05T18:30:00.000-03:00').getTime();
            const rangeEnd = new Date('2025-12-05T20:00:00.000-03:00').getTime();
            const rTime = new Date(r.time).getTime();
            return rTime >= rangeStart && rTime <= rangeEnd;
        });

        if (criticalRides.length === 0) {
            console.log('  [ ! ] SEM ATIVIDADE REGISTRADA ENTRE 18:30 E 20:00');
        } else {
            criticalRides.forEach(r => {
                // Ajustar timezone para display (-3h) se o server estiver em UTC
                const dt = new Date(r.time);
                // Assumindo que o server roda em UTC, subtrair 3h para display BRT se necessário, 
                // ou confiar no localeString se o server tiver locale configurado.
                // Melhor garantir:
                const timeStr = dt.toISOString().substr(11, 8); // Pega HH:mm:ss do UTC
                // Se o dado no banco já tem offset, o new Date() lida. Vamos imprimir raw e tentar converter

                console.log(`  -> ${dt.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })} | R$ ${r.value.toFixed(2)} | ${r.type}`);
            });
        }
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
