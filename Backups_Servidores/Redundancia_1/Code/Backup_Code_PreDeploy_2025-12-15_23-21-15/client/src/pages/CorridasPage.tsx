import { useState } from "react";
import MainLayout from "../components/MainLayout";
import { Calendar, Clock, Car, User, Filter } from "lucide-react";

type PeriodType = "dia" | "semana" | "mes" | "ano" | "total";

const mockRides = [
    { id: "1", data: "07/12/2025", hora: "13:46", veiculo: "TQ54C38", modelo: "Delphi Mini BR", valor: 18.00, tipo: "app", motorista: "Felipe Robson" },
    { id: "2", data: "07/12/2025", hora: "13:41", veiculo: "TQQ8A94", modelo: "Delphi Mini PT", valor: 31.00, tipo: "app", motorista: "Felipe Robson" },
];

const ridesByDate = mockRides.reduce((acc, ride) => {
    if (!acc[ride.data]) acc[ride.data] = [];
    acc[ride.data].push(ride);
    return acc;
}, {} as Record<string, typeof mockRides>);

const s = {
    card: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e5e7eb' },
    title: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827' },
    select: { width: '100%', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '1rem' },
    btn: (active: boolean) => ({ padding: '0.5rem 1rem', margin: '0.25rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', backgroundColor: active ? '#111' : '#f3f4f6', color: active ? '#fff' : '#111' }),
    rideCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '0.5rem', marginBottom: '0.5rem' }
};

export default function CorridasPage() {
    const [periodType, setPeriodType] = useState<PeriodType>("semana");
    const [selectedDriver, setSelectedDriver] = useState("all");

    return (
        <MainLayout>
            <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
                <h1 style={s.title}>Minhas Corridas</h1>

                <div style={s.card}>
                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                        <User style={{ width: '16px', height: '16px', display: 'inline', marginRight: '0.5rem' }} />
                        Motorista
                    </label>
                    <select value={selectedDriver} onChange={(e) => setSelectedDriver(e.target.value)} style={s.select}>
                        <option value="all">Todos os motoristas</option>
                        <option value="1">Felipe Robson</option>
                    </select>

                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block' }}>
                        <Filter style={{ width: '16px', height: '16px', display: 'inline', marginRight: '0.5rem' }} />
                        Período
                    </label>
                    <div>
                        {(["dia", "semana", "mes", "ano", "total"] as PeriodType[]).map((p) => (
                            <button key={p} onClick={() => setPeriodType(p)} style={s.btn(periodType === p)}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {Object.keys(ridesByDate).map((data) => {
                    const rides = ridesByDate[data];
                    const total = rides.reduce((sum, r) => sum + r.valor, 0);

                    return (
                        <div key={data} style={{ ...s.card, padding: 0, overflow: 'hidden' }}>
                            <div style={{ background: 'linear-gradient(to right, #3b82f6, #a855f7)', padding: '1rem', color: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <Calendar style={{ width: '24px', height: '24px' }} />
                                        <div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>{data}</div>
                                            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{rides[0].motorista}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>{rides.length} corridas</div>
                                        <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.25rem' }}>
                                            R$ {total.toFixed(2).replace(".", ",")}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1rem' }}>
                                {rides.map((ride) => (
                                    <div key={ride.id} style={s.rideCard}>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <div style={{ backgroundColor: '#3b82f6', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>D</div>
                                            <div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <Clock style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                                                    <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>{ride.hora}</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.25rem' }}>
                                                    <Car style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontFamily: 'monospace' }}>{ride.veiculo} - {ride.modelo}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.125rem' }}>
                                                R$ {ride.valor.toFixed(2).replace(".", ",")}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Aplicativo</div>
                                        </div>
                                    </div>
                                ))}

                                <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '1rem', paddingTop: '1rem' }}>
                                    <div style={{ ...s.rideCard, backgroundColor: '#fff' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <div style={{ backgroundColor: '#3b82f6', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>D</div>
                                            <span style={{ fontWeight: '600' }}>Total Aplicativo</span>
                                        </div>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.125rem' }}>
                                            R$ {total.toFixed(2).replace(".", ",")}
                                        </span>
                                    </div>
                                    <div style={{ ...s.rideCard, backgroundColor: '#eef2ff' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <div style={{ backgroundColor: '#6366f1', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Calendar style={{ width: '16px', height: '16px' }} />
                                            </div>
                                            <span style={{ fontWeight: 'bold' }}>Total</span>
                                        </div>
                                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.25rem' }}>
                                            R$ {total.toFixed(2).replace(".", ",")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div style={{ background: 'linear-gradient(to bottom right, #eab308, #f59e0b)', ...s.card, color: '#fff' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Resumo Total</h2>
                    <div style={{ borderTop: '2px dashed rgba(255,255,255,0.3)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[
                            { label: 'Total Aplicativo', value: 'R$ 576,35', icon: 'D', bg: '#3b82f6' },
                            { label: 'Total Particular', value: 'R$ 90,00', icon: 'P', bg: '#22c55e' }
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ backgroundColor: item.bg, width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{item.icon}</div>
                                    <span style={{ fontWeight: '600' }}>{item.label}</span>
                                </div>
                                <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.25rem' }}>{item.value}</span>
                            </div>
                        ))}
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <div style={{ backgroundColor: '#6366f1', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Calendar style={{ width: '16px', height: '16px' }} />
                                </div>
                                <span style={{ fontWeight: 'bold', fontSize: '1.125rem' }}>Total</span>
                            </div>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.5rem' }}>R$ 666,35</span>
                        </div>
                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '0.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                <div style={{ backgroundColor: '#a855f7', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>L</div>
                                <span style={{ fontWeight: 'bold' }}>Lucro Motorista (40%)</span>
                            </div>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.25rem' }}>R$ 266,54</span>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
