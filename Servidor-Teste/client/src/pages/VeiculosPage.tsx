import MainLayout from "../components/MainLayout";
import { Car, Plus, CheckCircle, AlertCircle, Wrench, Gauge } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

export default function VeiculosPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const veiculos = [
        { placa: 'ABC-1234', modelo: 'Fiat Uno', status: 'Disponível', km: 45000, proximaRevisao: 50000 },
        { placa: 'DEF-5678', modelo: 'Chevrolet Onix', status: 'Em Uso', km: 32000, proximaRevisao: 40000 },
        { placa: 'GHI-9012', modelo: 'Volkswagen Gol', status: 'Manutenção', km: 78000, proximaRevisao: 80000 },
    ];

    const s = {
        container: { maxWidth: '1024px', margin: '0 auto' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
        title: { fontSize: '1.5rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' },
        addButton: {
            padding: '0.75rem 1.5rem',
            backgroundColor: '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' },
        statCard: (color: string) => ({
            padding: '1rem',
            borderRadius: '0.75rem',
            backgroundColor: isDark ? '#1f2937' : '#fff',
            border: `2px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        }),
        vehicleCard: {
            backgroundColor: isDark ? '#1f2937' : '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        badge: (status: string) => {
            const colors = {
                'Disponível': { bg: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7', text: '#16a34a', border: '#22c55e' },
                'Em Uso': { bg: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe', text: '#2563eb', border: '#3b82f6' },
                'Manutenção': { bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2', text: '#dc2626', border: '#ef4444' }
            };
            const color = colors[status as keyof typeof colors];
            return {
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: color.bg,
                color: color.text,
                border: `1px solid ${color.border}`
            };
        }
    };

    return (
        <MainLayout>
            <div style={s.container}>
                {/* Header */}
                <div style={s.header}>
                    <h1 style={s.title}>Veículos</h1>
                    <button style={s.addButton}>
                        <Plus style={{ width: '20px', height: '20px' }} />
                        Adicionar Novo Veículo
                    </button>
                </div>

                {/* Estatísticas */}
                <div style={s.stats}>
                    <div style={s.statCard('#22c55e')}>
                        <CheckCircle style={{ width: '32px', height: '32px', color: '#22c55e' }} />
                        <div>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Disponíveis</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' }}>1</p>
                        </div>
                    </div>
                    <div style={s.statCard('#3b82f6')}>
                        <Car style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
                        <div>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Em Uso</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' }}>1</p>
                        </div>
                    </div>
                    <div style={s.statCard('#ef4444')}>
                        <AlertCircle style={{ width: '32px', height: '32px', color: '#ef4444' }} />
                        <div>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Manutenção</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' }}>1</p>
                        </div>
                    </div>
                </div>

                {/* Lista de Veículos */}
                {veiculos.map((veiculo, i) => (
                    <div key={i} style={s.vehicleCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827', fontFamily: 'monospace' }}>
                                    {veiculo.placa}
                                </h3>
                                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{veiculo.modelo}</p>
                            </div>
                            <span style={s.badge(veiculo.status)}>{veiculo.status}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Gauge style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Quilometragem</p>
                                    <p style={{ fontWeight: '600', color: isDark ? '#fff' : '#111827', fontFamily: 'monospace' }}>
                                        {veiculo.km.toLocaleString()} km
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Wrench style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Próxima Revisão</p>
                                    <p style={{ fontWeight: '600', color: isDark ? '#fff' : '#111827', fontFamily: 'monospace' }}>
                                        {veiculo.proximaRevisao.toLocaleString()} km
                                    </p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <AlertCircle style={{ width: '20px', height: '20px', color: veiculo.proximaRevisao - veiculo.km < 5000 ? '#ef4444' : '#22c55e' }} />
                                <div>
                                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Faltam</p>
                                    <p style={{ fontWeight: '600', color: veiculo.proximaRevisao - veiculo.km < 5000 ? '#ef4444' : '#22c55e', fontFamily: 'monospace' }}>
                                        {(veiculo.proximaRevisao - veiculo.km).toLocaleString()} km
                                    </p>
                                </div>
                            </div>
                        </div>

                        {veiculo.proximaRevisao - veiculo.km < 5000 && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                backgroundColor: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2',
                                border: '1px solid #ef4444',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <AlertCircle style={{ width: '20px', height: '20px', color: '#dc2626' }} />
                                <span style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: '600' }}>
                                    Revisão próxima! Agende a manutenção.
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </MainLayout>
    );
}
