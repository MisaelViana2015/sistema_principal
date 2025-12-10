import MainLayout from "../components/MainLayout";
import { Wallet, Calendar, Download, TrendingUp, TrendingDown, DollarSign, Navigation as NavIcon, User, Clock } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useState } from "react";

export default function CaixaPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [motorista, setMotorista] = useState("all");
    const [periodo, setPeriodo] = useState("dia");
    const [data, setData] = useState("07/12/2025");

    const s = {
        container: { maxWidth: '900px', margin: '0 auto' },
        header: {
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
            borderRadius: '0.75rem'
        },
        title: { fontSize: '1.5rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' },
        subtitle: { fontSize: '0.875rem', color: '#6b7280' },
        card: {
            backgroundColor: isDark ? '#1f2937' : '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        },
        filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' },
        label: { fontSize: '0.875rem', fontWeight: '600', color: isDark ? '#d1d5db' : '#374151', marginBottom: '0.5rem', display: 'block' },
        select: {
            width: '100%',
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
            backgroundColor: isDark ? '#111827' : '#fff',
            color: isDark ? '#fff' : '#111827'
        },
        dateNav: { display: 'flex', alignItems: 'center', gap: '0.5rem' },
        dateBtn: {
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
            backgroundColor: isDark ? '#111827' : '#fff',
            color: isDark ? '#fff' : '#111827',
            cursor: 'pointer'
        },
        turnoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' },
        turnoTitle: { fontSize: '1.125rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' },
        pdfBtn: {
            padding: '0.5rem 1rem',
            backgroundColor: isDark ? '#374151' : '#e5e7eb',
            color: isDark ? '#fff' : '#111827',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '600'
        },
        sectionBadge: {
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            backgroundColor: '#3b82f6',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: '600',
            marginBottom: '1rem'
        },
        rideItem: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem 0',
            borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        },
        totalRow: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 0',
            fontWeight: 'bold',
            fontSize: '1rem'
        },
        resumoCard: (gradient: string) => ({
            background: gradient,
            borderRadius: '12px',
            padding: '1.25rem',
            color: '#fff',
            marginBottom: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }),
        dadoItem: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : '#f9fafb',
            borderRadius: '0.5rem',
            marginBottom: '0.5rem'
        }
    };

    return (
        <MainLayout>
            <div style={s.container}>
                {/* Header */}
                <div style={s.header}>
                    <Wallet style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
                    <div>
                        <h1 style={s.title}>Caixa</h1>
                        <p style={s.subtitle}>Visualize fechamentos de turnos</p>
                    </div>
                </div>

                {/* Filtros */}
                <div style={s.card}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827', marginBottom: '1rem' }}>
                        Filtros
                    </h3>
                    <div style={s.filterGrid}>
                        <div>
                            <label style={s.label}>Motorista</label>
                            <select value={motorista} onChange={(e) => setMotorista(e.target.value)} style={s.select}>
                                <option value="all">Todos os Motoristas</option>
                                <option value="robson">Robson</option>
                            </select>
                        </div>
                        <div>
                            <label style={s.label}>Período</label>
                            <select value={periodo} onChange={(e) => setPeriodo(e.target.value)} style={s.select}>
                                <option value="dia">Dia</option>
                                <option value="semana">Semana</option>
                                <option value="mes">Mês</option>
                            </select>
                        </div>
                    </div>
                    <div style={s.dateNav}>
                        <button style={s.dateBtn}>‹</button>
                        <input type="date" value="2025-12-07" style={{ ...s.select, flex: 1 }} />
                        <button style={s.dateBtn}>›</button>
                    </div>
                </div>

                {/* Turno */}
                <div style={s.card}>
                    <div style={s.turnoHeader}>
                        <div>
                            <h3 style={s.turnoTitle}>Turno de Robson</h3>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                TQQ8A94 — Delphi Mini PT
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                Início: 07/12/2025 às 08:26
                            </p>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                Fim: 07/12/2025 às 16:41
                            </p>
                        </div>
                        <button style={s.pdfBtn}>
                            <Download style={{ width: '16px', height: '16px' }} />
                            Baixar PDF
                        </button>
                    </div>

                    {/* Aplicativo */}
                    <div style={s.sectionBadge}>
                        <NavIcon style={{ width: '16px', height: '16px' }} />
                        Aplicativo
                    </div>
                    {[
                        { num: 1, hora: '08:43', valor: 17.90 },
                        { num: 2, hora: '08:56', valor: 16.60 },
                        { num: 3, hora: '09:17', valor: 23.60 },
                        { num: 4, hora: '09:39', valor: 16.30 },
                        { num: 5, hora: '09:42', valor: 15.00 },
                        { num: 6, hora: '10:00', valor: 14.00 },
                        { num: 7, hora: '12:09', valor: 25.00 },
                    ].map((ride) => (
                        <div key={ride.num} style={s.rideItem}>
                            <span style={{ color: isDark ? '#d1d5db' : '#6b7280', fontSize: '0.875rem' }}>
                                {ride.num} - {ride.hora}
                            </span>
                            <span style={{ fontFamily: 'monospace', fontWeight: '600', color: isDark ? '#fff' : '#111827' }}>
                                R$ {ride.valor.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    ))}
                    <div style={s.totalRow}>
                        <span style={{ color: isDark ? '#fff' : '#111827' }}>Total APP</span>
                        <span style={{ fontFamily: 'monospace', color: isDark ? '#fff' : '#111827' }}>R$ 297,00</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'right' }}>
                        Total Corridas APP: 14
                    </p>

                    {/* Particular */}
                    <div style={{ ...s.sectionBadge, backgroundColor: '#22c55e', marginTop: '1.5rem' }}>
                        <User style={{ width: '16px', height: '16px' }} />
                        Particular
                    </div>
                    {[
                        { num: 1, hora: '10:18', valor: 25.00 },
                        { num: 2, hora: '10:49', valor: 35.00 },
                        { num: 3, hora: '12:49', valor: 16.00 },
                        { num: 4, hora: '13:05', valor: 14.00 },
                    ].map((ride) => (
                        <div key={ride.num} style={s.rideItem}>
                            <span style={{ color: isDark ? '#d1d5db' : '#6b7280', fontSize: '0.875rem' }}>
                                {ride.num} - {ride.hora}
                            </span>
                            <span style={{ fontFamily: 'monospace', fontWeight: '600', color: isDark ? '#fff' : '#111827' }}>
                                R$ {ride.valor.toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    ))}
                    <div style={s.totalRow}>
                        <span style={{ color: isDark ? '#fff' : '#111827' }}>Total Particular</span>
                        <span style={{ fontFamily: 'monospace', color: isDark ? '#fff' : '#111827' }}>R$ 90,00</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'right' }}>
                        Total Corridas Particulares: 4
                    </p>
                </div>

                {/* Resumo Financeiro */}
                <div style={s.card}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827', marginBottom: '1rem' }}>
                        Resumo Financeiro
                    </h3>
                    <div style={s.resumoCard('linear-gradient(to right, #dc2626, #991b1b)')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <DollarSign style={{ width: '24px', height: '24px' }} />
                            <span style={{ fontWeight: '600' }}>Receita Total</span>
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'monospace' }}>R$ 387,00</span>
                    </div>
                    <div style={s.resumoCard('linear-gradient(to right, #b91c1c, #7f1d1d)')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <TrendingDown style={{ width: '24px', height: '24px' }} />
                            <span style={{ fontWeight: '600' }}>Custos</span>
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'monospace' }}>R$ 0,00</span>
                    </div>
                    <div style={s.resumoCard('linear-gradient(to right, #16a34a, #15803d)')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <TrendingUp style={{ width: '24px', height: '24px' }} />
                            <span style={{ fontWeight: '600' }}>Lucro Líquido</span>
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'monospace' }}>R$ 387,00</span>
                    </div>
                    <div style={s.resumoCard('linear-gradient(to right, #2563eb, #1e40af)')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Wallet style={{ width: '24px', height: '24px' }} />
                            <span style={{ fontWeight: '600' }}>Empresa (60%)</span>
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'monospace' }}>R$ 232,20</span>
                    </div>
                    <div style={s.resumoCard('linear-gradient(to right, #9333ea, #7e22ce)')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <User style={{ width: '24px', height: '24px' }} />
                            <span style={{ fontWeight: '600' }}>Motorista (40%)</span>
                        </div>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', fontFamily: 'monospace' }}>R$ 154,80</span>
                    </div>
                </div>

                {/* Dados Operacionais */}
                <div style={s.card}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827', marginBottom: '1rem' }}>
                        Dados Operacionais
                    </h3>
                    <div style={s.dadoItem}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <NavIcon style={{ width: '20px', height: '20px', color: '#fff' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>KM Rodados</p>
                        </div>
                        <span style={{ fontWeight: 'bold', color: isDark ? '#fff' : '#111827' }}>156 km</span>
                    </div>
                    <div style={s.dadoItem}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#eab308', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DollarSign style={{ width: '20px', height: '20px', color: '#fff' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Valor por KM</p>
                        </div>
                        <span style={{ fontWeight: 'bold', color: isDark ? '#fff' : '#111827', fontFamily: 'monospace' }}>R$ 2,48</span>
                    </div>
                    <div style={s.dadoItem}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Calendar style={{ width: '20px', height: '20px', color: '#fff' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total de Corridas</p>
                        </div>
                        <span style={{ fontWeight: 'bold', color: isDark ? '#fff' : '#111827' }}>18</span>
                    </div>
                    <div style={s.dadoItem}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp style={{ width: '20px', height: '20px', color: '#fff' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Ticket Médio Geral</p>
                        </div>
                        <span style={{ fontWeight: 'bold', color: isDark ? '#fff' : '#111827', fontFamily: 'monospace' }}>R$ 21,50</span>
                    </div>
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <Clock style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                        <span style={{ fontSize: '0.875rem', color: '#3b82f6', fontWeight: '600' }}>
                            Duração do Turno: 8h 15min
                        </span>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
