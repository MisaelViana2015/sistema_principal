
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando análise de fraude - 05/12/2025 (Root CJS Mode)...');

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
        console.log(`Turno: ${new Date(driverData.start).toLocaleString('pt-BR')} - ${driverData.end ? new Date(driverData.end).toLocaleString('pt-BR') : 'Em andamento'}`);
        console.log(`Total Corridas: ${driverData.rideCount}`);

        // Intervalo crítico: 18:30 até 20:00
        const criticalRides = driverData.rides.filter(r => {
            const rangeStart = new Date('2025-12-05T18:30:00.000-03:00').getTime();
            const rangeEnd = new Date('2025-12-05T20:00:00.000-03:00').getTime();
            const rTime = new Date(r.time).getTime();
            return rTime >= rangeStart && rTime <= rangeEnd;
        });

        if (criticalRides.length === 0) {
            console.log('  [ ! ] SEM ATIVIDADE REGISTRADA ENTRE 18:30 E 20:00');
        } else {
            criticalRides.forEach(r => {
                const dt = new Date(r.time);
                console.log(`  -> ${dt.toISOString()} | R$ ${r.value.toFixed(2)} | ${r.type}`);
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
