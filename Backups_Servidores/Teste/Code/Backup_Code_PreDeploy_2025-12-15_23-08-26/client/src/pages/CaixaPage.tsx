import MainLayout from "../components/MainLayout";
import { Wallet, Calendar, Download, TrendingUp, TrendingDown, DollarSign, Navigation as NavIcon, User, Clock, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { shiftsService } from "../modules/shifts/shifts.service";
import { ridesService } from "../modules/rides/rides.service";
import { api } from "../lib/api";

export default function CaixaPage() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const isDark = theme === 'dark';

    // State
    const [shifts, setShifts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedDriverId, setSelectedDriverId] = useState("all");

    useEffect(() => {
        loadShifts();
    }, [startDate, selectedDriverId]);

    async function loadShifts() {
        setLoading(true);
        try {
            // Fetch finished shifts
            // Assuming we have an endpoint or needing to filter client side if API doesn't support complex filters yet.
            // Using existing list endpoint
            const allShifts = await shiftsService.getAll(); // This needs to be improved in backend to support filters, but using what we have.

            let filtered = allShifts.filter((s: any) => s.status === 'finalizado');

            // Filter by date (approximate based on start time)
            if (startDate) {
                filtered = filtered.filter((s: any) => s.inicio.startsWith(startDate));
            }

            // Filter by driver
            if (selectedDriverId !== 'all') {
                filtered = filtered.filter((s: any) => s.driverId === selectedDriverId);
            } else if (user?.role === 'driver') {
                filtered = filtered.filter((s: any) => s.driverId === user.id);
            }

            // For each shift, we might need rides details if not included. 
            // The screenshots show rides lists inside the shift card. 
            // We'll simplisticly fetch rides for the shifts or assume 'getAll' returns enough info or we load on demand.
            // Current 'activeShift' in TurnoPage had totals. Let's assume shifts have totals.
            // For the "List of Rides" inside the card, we might need to fetch them.
            // For now, let's display the Totals which are verified to be in the `shifts` table.

            setShifts(filtered);
        } catch (error) {
            console.error("Erro ao carregar caixa:", error);
        } finally {
            setLoading(false);
        }
    }

    // Styles
    const s = {
        container: { maxWidth: '900px', margin: '0 auto', paddingBottom: '80px' },
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
        sectionBadge: {
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.5rem 1rem', borderRadius: '9999px',
            fontSize: '0.875rem', fontWeight: '600', marginBottom: '1rem', color: '#fff'
        },
        totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', fontWeight: 'bold', fontSize: '1rem', color: isDark ? '#fff' : '#111827' }
    };

    return (
        <MainLayout>
            <div style={s.container}>
                {/* Header */}
                <div style={s.header}>
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Wallet style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                    </div>
                    <div>
                        <h1 style={s.title}>Caixa</h1>
                        <p style={s.subtitle}>Visualize fechamentos de turnos</p>
                    </div>
                </div>

                {/* Filtros */}
                <div style={s.card}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827', marginBottom: '1rem' }}>Filtros</h3>
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1 text-gray-500">Data</label>
                            <div className="flex gap-2">
                                <button onClick={() => {
                                    const d = new Date(startDate);
                                    d.setDate(d.getDate() - 1);
                                    setStartDate(d.toISOString().split('T')[0]);
                                }} className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-white">
                                    <ChevronLeft size={20} />
                                </button>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="flex-1 p-2 border rounded dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                                />
                                <button onClick={() => {
                                    const d = new Date(startDate);
                                    d.setDate(d.getDate() + 1);
                                    setStartDate(d.toISOString().split('T')[0]);
                                }} className="p-2 border rounded hover:bg-gray-100 dark:hover:bg-gray-800 dark:border-gray-700 dark:text-white">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? <div className="text-center p-8 text-gray-500">Carregando...</div> :
                    shifts.length === 0 ? <div className="text-center p-8 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">Nenhum turno encontrado nesta data.</div> :
                        shifts.map(shift => {
                            // Calculations
                            const totalReceita = shift.totalBruto || 0;
                            const totalCustos = shift.totalCustos || 0;
                            const lucroLiquido = totalReceita - totalCustos;
                            const kmRodados = (shift.kmFinal && shift.kmInicial) ? shift.kmFinal - shift.kmInicial : 0;
                            const totalCorridas = (shift.totalCorridasApp || 0) + (shift.totalCorridasParticular || 0);
                            const ticketMedio = totalCorridas > 0 ? totalReceita / totalCorridas : 0;
                            const valorPorKm = kmRodados > 0 ? totalReceita / kmRodados : 0;

                            // Duration
                            const start = new Date(shift.inicio);
                            const end = shift.fim ? new Date(shift.fim) : new Date();
                            const diffMs = end.getTime() - start.getTime();
                            const diffMins = Math.round(diffMs / 60000);
                            const durationStr = `${Math.floor(diffMins / 60)}h ${diffMins % 60}min`;

                            return (
                                <div key={shift.id} style={s.card}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1.5rem' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' }}>
                                                Turno de {user?.role === 'admin' ? (shift.driverName || 'Motorista') : 'Mim'}
                                            </h3>
                                            <div className="text-sm text-gray-500 mt-1">
                                                Início: {new Date(shift.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Fim: {shift.fim ? new Date(shift.fim).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Em andamento'}
                                            </div>
                                        </div>
                                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
                                            <Download size={16} /> PDF
                                        </button>
                                    </div>

                                    {/* App Summary */}
                                    <div className="mb-6 p-4 border rounded-xl border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-2 mb-3 text-blue-600 font-bold uppercase text-xs tracking-wider">
                                            <Wallet size={16} /> Aplicativo
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="text-2xl font-bold dark:text-white">R$ {(shift.totalApp || 0).toFixed(2).replace('.', ',')}</div>
                                            <div className="text-sm text-gray-500">{shift.totalCorridasApp || 0} corridas</div>
                                        </div>
                                    </div>

                                    {/* Particular Summary */}
                                    <div className="mb-8 p-4 border rounded-xl border-gray-100 dark:border-gray-700 bg-orange-50 dark:bg-orange-900/10">
                                        <div className="flex items-center gap-2 mb-3 text-orange-600 font-bold uppercase text-xs tracking-wider">
                                            <User size={16} /> Particular
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="text-2xl font-bold dark:text-white">R$ {(shift.totalParticular || 0).toFixed(2).replace('.', ',')}</div>
                                            <div className="text-sm text-gray-500">{shift.totalCorridasParticular || 0} corridas</div>
                                        </div>
                                    </div>

                                    {/* Financial Bars */}
                                    <h3 className="font-bold mb-4 text-lg dark:text-white">Resumo Financeiro</h3>
                                    <div className="space-y-3 mb-8">
                                        <div style={{ background: '#9a3412', color: 'white' }} className="rounded-lg p-3 flex justify-between items-center shadow-sm">
                                            <div className="flex items-center gap-3 font-bold"><DollarSign size={18} /> Receita Total</div>
                                            <div className="text-lg font-bold">R$ {totalReceita.toFixed(2).replace('.', ',')}</div>
                                        </div>
                                        <div style={{ background: '#dc2626', color: 'white' }} className="rounded-lg p-3 flex justify-between items-center shadow-sm">
                                            <div className="flex items-center gap-3 font-bold"><TrendingDown size={18} /> Custos</div>
                                            <div className="text-lg font-bold">R$ {totalCustos.toFixed(2).replace('.', ',')}</div>
                                        </div>
                                        <div style={{ background: '#16a34a', color: 'white' }} className="rounded-lg p-3 flex justify-between items-center shadow-sm">
                                            <div className="flex items-center gap-3 font-bold"><TrendingUp size={18} /> Lucro Líquido</div>
                                            <div className="text-lg font-bold">R$ {lucroLiquido.toFixed(2).replace('.', ',')}</div>
                                        </div>
                                        <div style={{ background: '#2563eb', color: 'white' }} className="rounded-lg p-3 flex justify-between items-center shadow-sm">
                                            <div className="flex items-center gap-3 font-bold"><Wallet size={18} /> Empresa (60%)</div>
                                            <div className="text-lg font-bold">R$ {(shift.repasseEmpresa || 0).toFixed(2).replace('.', ',')}</div>
                                        </div>
                                        <div style={{ background: '#9333ea', color: 'white' }} className="rounded-lg p-3 flex justify-between items-center shadow-sm">
                                            <div className="flex items-center gap-3 font-bold"><User size={18} /> Motorista (40%)</div>
                                            <div className="text-lg font-bold">R$ {(shift.repasseMotorista || 0).toFixed(2).replace('.', ',')}</div>
                                        </div>
                                    </div>

                                    {/* Operational Stats */}
                                    <h3 className="font-bold mb-4 text-lg dark:text-white">Dados Operacionais</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">KM Rodados</div>
                                            <div className="font-bold text-lg dark:text-white">{kmRodados} km</div>
                                        </div>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Valor por KM</div>
                                            <div className="font-bold text-lg dark:text-white">R$ {valorPorKm.toFixed(2).replace('.', ',')}</div>
                                        </div>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Ticket Médio</div>
                                            <div className="font-bold text-lg dark:text-white">R$ {ticketMedio.toFixed(2).replace('.', ',')}</div>
                                        </div>
                                        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="text-xs text-gray-500 uppercase font-bold mb-1">Duração</div>
                                            <div className="font-bold text-lg dark:text-white">{durationStr}</div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                }
            </div>
        </MainLayout>
    );
}
