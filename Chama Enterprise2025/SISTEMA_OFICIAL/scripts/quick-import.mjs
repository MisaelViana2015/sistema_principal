import { db } from './server/core/db/connection.js';
import { drivers, vehicles, shifts, rides } from './shared/schema.js';
import { eq } from 'drizzle-orm';

const data = [
  { driver: 'Robson', vehicle: 'TQQ0A94', date: '2025-12-16', start: '09:14', end: '14:31', km: 65, rides: [
    { time: '09:44', value: 14.40, type: 'Aplicativo' }, { time: '10:06', value: 18.00, type: 'Aplicativo' },
    { time: '11:09', value: 12.90, type: 'Aplicativo' }, { time: '11:36', value: 24.20, type: 'Aplicativo' },
    { time: '12:40', value: 15.80, type: 'Aplicativo' }, { time: '12:51', value: 14.00, type: 'Aplicativo' },
    { time: '13:07', value: 15.00, type: 'Particular' }, { time: '13:22', value: 15.00, type: 'Aplicativo' }
  ]},
  { driver: 'Misael', vehicle: 'TQQ0A07', date: '2025-12-16', start: '19:49', end: '20:04', km: 0, rides: [
    { time: '19:50', value: 25.00, type: 'Aplicativo' }
  ]},
  { driver: 'Luan', vehicle: 'TQS4C30', date: '2025-12-16', start: '06:44', end: '20:21', km: 229, rides: [
    { time: '06:56', value: 11.70, type: 'Aplicativo' }, { time: '07:22', value: 21.90, type: 'Aplicativo' },
    { time: '08:27', value: 10.30, type: 'Aplicativo' }, { time: '08:44', value: 14.00, type: 'Aplicativo' },
    { time: '08:57', value: 14.10, type: 'Aplicativo' }, { time: '09:17', value: 15.00, type: 'Particular' },
    { time: '09:44', value: 33.10, type: 'Aplicativo' }, { time: '10:03', value: 13.90, type: 'Aplicativo' },
    { time: '10:15', value: 14.20, type: 'Aplicativo' }, { time: '11:23', value: 10.80, type: 'Aplicativo' },
    { time: '12:05', value: 12.60, type: 'Aplicativo' }, { time: '12:31', value: 12.00, type: 'Particular' },
    { time: '12:40', value: 12.70, type: 'Aplicativo' }, { time: '13:00', value: 17.00, type: 'Particular' },
    { time: '13:35', value: 12.77, type: 'Aplicativo' }, { time: '13:45', value: 11.40, type: 'Aplicativo' },
    { time: '14:27', value: 15.00, type: 'Particular' }, { time: '15:32', value: 19.00, type: 'Aplicativo' },
    { time: '15:44', value: 16.10, type: 'Aplicativo' }, { time: '16:04', value: 14.30, type: 'Aplicativo' },
    { time: '16:32', value: 12.00, type: 'Particular' }, { time: '18:05', value: 19.77, type: 'Aplicativo' },
    { time: '18:32', value: 35.00, type: 'Aplicativo' }, { time: '18:52', value: 15.40, type: 'Aplicativo' },
    { time: '19:08', value: 13.60, type: 'Aplicativo' }, { time: '19:30', value: 14.70, type: 'Aplicativo' },
    { time: '20:20', value: 13.10, type: 'Aplicativo' }
  ]}
];

for (const s of data) {
  const [d] = await db.select().from(drivers).where(eq(drivers.nome, s.driver));
  const [v] = await db.select().from(vehicles).where(eq(vehicles.plate, s.vehicle));
  if (!d || !v) { console.log('Skip', s.driver); continue; }
  
  const tApp = s.rides.filter(r => r.type === 'Aplicativo').reduce((a,r) => a + r.value, 0);
  const tPart = s.rides.filter(r => r.type === 'Particular').reduce((a,r) => a + r.value, 0);
  const tBruto = tApp + tPart;
  
  const [ns] = await db.insert(shifts).values({
    driverId: d.id, vehicleId: v.id,
    inicio: new Date(${s.date}T:00-03:00),
    fim: new Date(${s.date}T:00-03:00),
    status: 'finalizado', kmInicial: 0, kmFinal: s.km,
    totalApp: tApp, totalParticular: tPart, totalBruto: tBruto,
    totalCustos: 0, liquido: tBruto,
    repasseEmpresa: tBruto * 0.6, repasseMotorista: tBruto * 0.4
  }).returning();
  
  for (const r of s.rides) {
    await db.insert(rides).values({
      shiftId: ns.id, tipo: r.type, valor: r.value,
      hora: new Date(${s.date}T:00-03:00)
    });
  }
  console.log('✅', d.nome, v.plate, s.date);
}
console.log('Done!');
process.exit(0);
