import MainLayout from "../../../components/MainLayout";
import { TrendingUp, Calendar, Smartphone, User, Clock, Briefcase, DollarSign, Zap, Trophy, Wallet } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useState } from "react";

export default function PerformancePage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [periodo, setPeriodo] = useState<"dia" | "semana" | "mes">("semana");

    const s = {
        container: { maxWidth: '900px', margin: '0 auto' },
        header: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: isDark ? '#1f2937' : '#f3f4f6',
            borderRadius: '0.75rem'
        },
        titleSection: { display: 'flex', alignItems: 'center', gap: '1rem' },
        title: { fontSize: '1.5rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' },
        subtitle: { fontSize: '0.875rem', color: '#6b7280' },
        filterBtns: { display: 'flex', gap: '0.5rem' },
        filterBtn: (active: boolean) => ({
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            backgroundColor: active ? (isDark ? '#111827' : '#111827') : (isDark ? '#374151' : '#e5e7eb'),
            color: active ? '#fff' : (isDark ? '#9ca3af' : '#6b7280'),
            transition: 'all 0.2s'
        }),
        navCard: {
            backgroundColor: isDark ? '#1f2937' : '#fff',
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1.5rem',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        navBtn: {
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
            backgroundColor: isDark ? '#111827' : '#fff',
            color: isDark ? '#fff' : '#111827',
            cursor: 'pointer',
            fontSize: '0.875rem'
        },
        grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
        grid3: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
        statCard: (color: string) => ({
            background: color,
            borderRadius: '12px',
            padding: '1.5rem',
            color: '#fff'
        }),
        statValue: { fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' },
        statLabel: { fontSize: '0.875rem', opacity: 0.9 },
        chartCard: {
            backgroundColor: isDark ? '#1f2937' : '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        },
        chartTitle: { fontSize: '1rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827', marginBottom: '1rem' },
        rankCard: (rank: number) => {
            const colors = ['#fef3c7', '#e0e7ff', '#ffe4e6'];
            return {
                backgroundColor: isDark ? '#1f2937' : colors[rank - 1],
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1rem',
                border: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            };
        }
    };

    return (
        <MainLayout>
            <div style={s.container}>
                {/* Header */}
                <div style={s.header}>
                    <div style={s.titleSection}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <TrendingUp style={{ width: '24px', height: '24px', color: '#fff' }} />
                        </div>
                        <div>
                            <h1 style={s.title}>Desempenho</h1>
                            <p style={s.subtitle}>Estatísticas da semana</p>
                        </div>
                    </div>
                    <div style={s.filterBtns}>
                        <button onClick={() => setPeriodo("dia")} style={s.filterBtn(periodo === "dia")}>Dia</button>
                        <button onClick={() => setPeriodo("semana")} style={s.filterBtn(periodo === "semana")}>Semana</button>
                        <button onClick={() => setPeriodo("mes")} style={s.filterBtn(periodo === "mes")}>Mês</button>
                    </div>
                </div>

                {/* Navegação de Período */}
                <div style={s.navCard}>
                    <button style={s.navBtn}>‹ Anterior</button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                        <span style={{ fontWeight: '600', color: isDark ? '#fff' : '#111827' }}>29/11 - 6/12</span>
                    </div>
                    <button style={s.navBtn}>Próxima ›</button>
                </div>

                {/* Corridas da Semana */}
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827', marginBottom: '1rem' }}>
                    Corridas da Semana
                </h3>
                <div style={s.grid4}>
                    <div style={s.statCard('linear-gradient(135deg, #3b82f6, #2563eb)')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Smartphone style={{ width: '20px', height: '20px' }} />
                            <span style={{ fontSize: '0.875rem' }}>App</span>
                        </div>
                        <div style={s.statValue}>74</div>
                        <div style={s.statLabel}>corridas</div>
                    </div>
                    <div style={s.statCard('linear-gradient(135deg, #16a34a, #15803d)')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <User style={{ width: '20px', height: '20px' }} />
                            <span style={{ fontSize: '0.875rem' }}>Particular</span>
                        </div>
                        <div style={s.statValue}>88</div>
                        <div style={s.statLabel}>corridas</div>
                    </div>
                    <div style={s.statCard('linear-gradient(135deg, #9333ea, #7e22ce)')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Clock style={{ width: '20px', height: '20px' }} />
                            <span style={{ fontSize: '0.875rem' }}>Horas</span>
                        </div>
                        <div style={s.statValue}>97.1h</div>
                        <div style={s.statLabel}>trabalhadas</div>
                    </div>
                    <div style={s.statCard('linear-gradient(135deg, #dc2626, #991b1b)')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Briefcase style={{ width: '20px', height: '20px' }} />
                            <span style={{ fontSize: '0.875rem' }}>Turnos</span>
                        </div>
                        <div style={s.statValue}>8</div>
                        <div style={s.statLabel}>realizados</div>
                    </div>
                </div>

                {/* Receitas da Semana */}
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827', marginBottom: '1rem', marginTop: '2rem' }}>
                    Receitas da Semana
                </h3>
                <div style={s.grid3}>
                    <div style={s.statCard('linear-gradient(135deg, #dc2626, #991b1b)')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <DollarSign style={{ width: '20px', height: '20px' }} />
                            <span style={{ fontSize: '0.875rem' }}>Receita App</span>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', fontFamily: 'monospace' }}>R$ 1.067,03</div>
                    </div>
                    <div style={s.statCard('linear-gradient(135deg, #16a34a, #15803d)')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <Wallet style={{ width: '20px', height: '20px' }} />
                            <span style={{ fontSize: '0.875rem' }}>Receita Particular</span>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', fontFamily: 'monospace' }}>R$ 1.578,00</div>
                    </div>
                    <div style={s.statCard('linear-gradient(135deg, #3b82f6, #2563eb)')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                            <TrendingUp style={{ width: '20px', height: '20px' }} />
                            <span style={{ fontSize: '0.875rem' }}>Receita Total</span>
                        </div>
                        <div style={{ fontSize: '1.75rem', fontWeight: 'bold', fontFamily: 'monospace' }}>R$ 2.645,03</div>
                    </div>
                </div>

                {/* Valor por Hora */}
                <div style={{ ...s.statCard('linear-gradient(135deg, #f97316, #ea580c)'), marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                        <Zap style={{ width: '24px', height: '24px' }} />
                        <span style={{ fontSize: '1rem' }}>Valor por Hora (R$/h)</span>
                    </div>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>R$ 27,24</div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>Receita total: R$ 2.645,03 / 97.1h</div>
                </div>

                {/* Desempenho Semanal */}
                <div style={s.chartCard}>
                    <h3 style={s.chartTitle}>Desempenho Semanal</h3>
                    <div>
                        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((dia, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : '#f9fafb', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: '600', color: isDark ? '#fff' : '#111827' }}>{dia}</span>
                                <span style={{ color: '#6b7280' }}>{[45, 52, 38, 61, 58, 42, 35][i]} corridas</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comparativo Mensal */}
                <div style={s.chartCard}>
                    <h3 style={s.chartTitle}>
                        <TrendingUp style={{ width: '20px', height: '20px', display: 'inline', marginRight: '0.5rem', color: '#f59e0b' }} />
                        Comparativo Mensal
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : '#f9fafb', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: isDark ? '#fff' : '#111827' }}>Este Mês</span>
                        <span style={{ fontWeight: 'bold', color: isDark ? '#fff' : '#111827' }}>342 corridas</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: isDark ? 'rgba(55, 65, 81, 0.5)' : '#f9fafb', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ color: '#6b7280' }}>Mês Anterior</span>
                        <span style={{ color: '#6b7280' }}>305 corridas</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', backgroundColor: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7', border: `1px solid #22c55e`, borderRadius: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold', color: '#16a34a' }}>Crescimento</span>
                        <span style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#16a34a' }}>↑ 12%</span>
                    </div>
                </div>

                {/* Metas do Mês */}
                <div style={s.chartCard}>
                    <h3 style={s.chartTitle}>
                        <Trophy style={{ width: '20px', height: '20px', display: 'inline', marginRight: '0.5rem', color: '#ec4899' }} />
                        Metas do Mês
                    </h3>
                    <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', color: isDark ? '#d1d5db' : '#6b7280' }}>Corridas (350)</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#22c55e' }}>97%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '97%', height: '100%', background: 'linear-gradient(to right, #22c55e, #16a34a)', borderRadius: '4px' }} />
                        </div>
                    </div>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.875rem', color: isDark ? '#d1d5db' : '#6b7280' }}>Receita (R$ 10k)</span>
                            <span style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#3b82f6' }}>32%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', backgroundColor: isDark ? '#374151' : '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                            <div style={{ width: '32%', height: '100%', background: 'linear-gradient(to right, #3b82f6, #2563eb)', borderRadius: '4px' }} />
                        </div>
                    </div>
                </div>

                {/* Rankings */}
                <div style={s.chartCard}>
                    <h3 style={s.chartTitle}>
                        <Trophy style={{ width: '20px', height: '20px', display: 'inline', marginRight: '0.5rem', color: '#eab308' }} />
                        Rankings de Desempenho - Semana
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>Top 3 Motoristas</p>

                    {[
                        { rank: 1, nome: 'Gustavo', turnos: 8, horas: '97.0h', receita: 'R$ 2.645,03', valorHora: 'R$ 27,26/h', ticket: 'R$ 16,33', corridasTurno: '20.3', participacao: '34.25%', score: '100.8' },
                        { rank: 2, nome: 'Motorista D', turnos: 5, horas: '78.0h', receita: 'R$ 2.176,06', valorHora: 'R$ 27,89/h', ticket: 'R$ 18,44', corridasTurno: '23.6', participacao: '28.18%', score: '82.6' },
                        { rank: 3, nome: 'Motorista B', turnos: 5, horas: '63.8h', receita: 'R$ 1.501,68', valorHora: 'R$ 23,53/h', ticket: 'R$ 15,02', corridasTurno: '20.0', participacao: '19.44%', score: '71.2' }
                    ].map((m) => (
                        <div key={m.rank} style={s.rankCard(m.rank)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {m.rank === 1 && <Trophy style={{ width: '24px', height: '24px', color: '#eab308' }} />}
                                    {m.rank === 2 && <Trophy style={{ width: '24px', height: '24px', color: '#9ca3af' }} />}
                                    {m.rank === 3 && <Trophy style={{ width: '24px', height: '24px', color: '#f97316' }} />}
                                    <div style={{ width: '32px', height: '32px', borderRadius: '0.5rem', backgroundColor: isDark ? '#374151' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>
                                        #{m.rank}
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ fontWeight: 'bold', fontSize: '1.125rem', color: isDark ? '#fff' : '#111827' }}>{m.nome}</p>
                                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                        {m.turnos} turnos • {m.horas} • {m.receita} • {m.valorHora}
                                    </p>
                                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                        Ticket: {m.ticket} • Corridas/turno: {m.corridasTurno} • Participação: {m.participacao}
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Score</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' }}>{m.score}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
}
