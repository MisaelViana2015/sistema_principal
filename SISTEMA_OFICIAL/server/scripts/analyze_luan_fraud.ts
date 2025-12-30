
import { PrismaClient } from '@prisma/client';
import { startOfDay, endOfDay, addDays, format, isWithinInterval, parseISO } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
    console.log('Iniciando análise de fraude - 05/12/2025...');

    // Definir intervalo de tempo (Turno do Luan começou 08:01 do dia 05 e foi até 01:14 do dia 06)
    const startDate = new Date('2025-12-05T08:00:00.000-03:00');
    const endDate = new Date('2025-12-06T02:00:00.000-03:00');

    console.log(`Buscando turnos entre ${startDate.toISOString()} e ${endDate.toISOString()}`);

    // Buscar turnos que coincidem com esse período
    const shifts = await prisma.shift.findMany({
        where: {
            OR: [
                {
                    inicio: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                {
                    fim: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            ]
        },
        include: {
            driver: true,
            rides: {
                orderBy: {
                    hora: 'asc'
                }
            }
        }
    });

    console.log(`Encontrados ${shifts.length} turnos.`);

    // Motoristas de interesse
    const targetDrivers = ['Luan', 'Felipe', 'Misael', 'Robson', 'Gustavo'];

    // Filtrar e processar dados
    const analysis = shifts
        .filter(s => targetDrivers.some(name => s.driver.name.includes(name)))
        .map(s => {
            return {
                driver: s.driver.name,
                start: s.inicio,
                end: s.fim,
                rideCount: s.rides.length,
                rides: s.rides.map(r => ({
                    time: r.hora,
                    value: r.valor,
                    type: r.tipo
                }))
            };
        });

    // Gerar Relatório Cronológico
    console.log('\n=== RELATÓRIO CRONOLÓGICO (19:00 - 20:00) ===');
    console.log('Comparativo hora a hora no horário suspeito (19:08 - 19:26)');

    analysis.forEach(driverData => {
        console.log(`\nMotorista: ${driverData.driver} (${driverData.rideCount} corridas)`);

        // Filtrar corridas entre 18:00 e 21:00 para foco
        const focusRides = driverData.rides.filter(r => {
            const h = new Date(r.time).getHours();
            return h >= 18 && h <= 21;
        });

        if (focusRides.length === 0) {
            console.log('  -> Nenhuma corrida registrada entre 18h e 21h.');
        } else {
            focusRides.forEach(r => {
                const timeStr = format(new Date(r.time), 'HH:mm:ss');
                console.log(`  -> ${timeStr} | R$ ${r.value.toFixed(2)} | ${r.type}`);
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
