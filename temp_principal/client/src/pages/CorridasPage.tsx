import { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import { Calendar, Clock, Car, User, Filter, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { ridesService, RideWithDetails } from "../modules/rides/rides.service";
import { driversService } from "../modules/drivers/drivers.service";
import { Driver } from "../../../shared/schema";
import { useAuth } from "../contexts/AuthContext";

// Date helpers
const startOfDay = (d: Date) => { const n = new Date(d); n.setHours(0, 0, 0, 0); return n; };
const endOfDay = (d: Date) => { const n = new Date(d); n.setHours(23, 59, 59, 999); return n; };
const startOfMonth = (d: Date) => { const n = new Date(d); n.setDate(1); n.setHours(0, 0, 0, 0); return n; };
const endOfMonth = (d: Date) => { const n = new Date(d); n.setMonth(n.getMonth() + 1); n.setDate(0); n.setHours(23, 59, 59, 999); return n; };
const startOfYear = (d: Date) => { const n = new Date(d); n.setMonth(0, 1); n.setHours(0, 0, 0, 0); return n; };
const endOfYear = (d: Date) => { const n = new Date(d); n.setMonth(11, 31); n.setHours(23, 59, 59, 999); return n; };
const startOfWeek = (d: Date) => {
    const n = new Date(d);
    const day = n.getDay(); // 0 (Sun) to 6 (Sat)
    const diff = n.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    // If we want Sunday as start: const diff = n.getDate() - day;
    // Brazil usually treats Sunday as start, or Monday. Let's assume Monday as start for Work weeks?
    // Actually date-fns startOfWeek default is Sunday. Locales change it. pt-BR is Monday?
    // Let's stick to Sunday as start to be safe or Monday.
    // Let's use Sunday based start for now to be simple.
    const diffSunday = n.getDate() - day;
    n.setDate(diffSunday);
    n.setHours(0, 0, 0, 0);
    return n;
};
const endOfWeek = (d: Date) => {
    const n = startOfWeek(d);
    n.setDate(n.getDate() + 6);
    n.setHours(23, 59, 59, 999);
    return n;
};

type PeriodType = "dia" | "semana" | "mes" | "ano" | "total";

const s = {
    card: { backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e5e7eb' },
    title: { fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    select: { width: '100%', padding: '0.75rem', border: '1px solid #374151', borderRadius: '0.5rem', marginBottom: '1rem', backgroundColor: '#1f2937', color: '#fff', outline: 'none' },
    btn: (active: boolean) => ({
        padding: '0.5rem 1rem',
        margin: '0.25rem',
        border: active ? '1px solid #10b981' : '1px solid #374151',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        backgroundColor: active ? '#10b981' : '#1f2937',
        color: active ? '#fff' : '#9ca3af',
        fontWeight: active ? '600' : '400',
        transition: 'all 0.2s'
    }),
    rideCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '0.5rem', marginBottom: '0.5rem' }
};

export default function CorridasPage() {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [periodType, setPeriodType] = useState<PeriodType>("semana");
    const [selectedDriver, setSelectedDriver] = useState(isAdmin ? "todos" : String(user?.id || ""));
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [rides, setRides] = useState<RideWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    // Initial Load
    useEffect(() => {
        if (isAdmin) {
            loadDrivers();
        }
    }, [isAdmin]);

    // Load rides when filters change
    useEffect(() => {
        setPage(1);
        loadRides(1);
    }, [selectedDriver, periodType]);

    // Load rides when page changes (skip if triggered by filter change to avoid double fetch)
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        loadRides(newPage);
    };

    const loadDrivers = async () => {
        try {
            const data = await driversService.getAll();
            setDrivers(data);
        } catch (error) {
            console.error("Erro ao carregar motoristas", error);
        }
    };

    const loadRides = async (currentPage: number) => {
        setLoading(true);
        try {
            const dateRange = getDateRange(periodType);
            const data = await ridesService.getAll({
                page: currentPage,
                limit: 20, // More items per page since cards are compact
                driverId: selectedDriver !== "todos" ? selectedDriver : undefined,
                startDate: dateRange.startDate?.toISOString(),
                endDate: dateRange.endDate?.toISOString()
            });

            setRides(data.data);
            setTotalPages(data.pagination.totalPages);
            setTotalItems(data.pagination.totalItems);
        } catch (error) {
            console.error("Erro ao carregar corridas", error);
        } finally {
            setLoading(false);
        }
    };

    const getDateRange = (period: PeriodType) => {
        const now = new Date();
        switch (period) {
            case "dia":
                return { startDate: startOfDay(now), endDate: endOfDay(now) };
            case "semana":
                return { startDate: startOfWeek(now), endDate: endOfWeek(now) };
            case "mes":
                return { startDate: startOfMonth(now), endDate: endOfMonth(now) };
            case "ano":
                return { startDate: startOfYear(now), endDate: endOfYear(now) };
            default: // total
                return { startDate: undefined, endDate: undefined };
        }
    };

    const formatCurrency = (val: string | number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val));
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Calculate totals for current view
    const totalView = rides.reduce((acc, ride) => acc + Number(ride.valor), 0);
    const totalApp = rides.filter(r => ['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || '')).reduce((acc, ride) => acc + Number(ride.valor), 0);
    const totalParticular = rides.filter(r => !['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || '')).reduce((acc, ride) => acc + Number(ride.valor), 0);

    return (
        <MainLayout>
            <div style={{ maxWidth: '1024px', margin: '0 auto', color: '#fff' }}>
                <h1 style={{ ...s.title, color: '#fff' }}>Minhas Corridas</h1>

                {/* Filters */}
                <div style={{ ...s.card, backgroundColor: '#111827', borderColor: '#374151' }}>
                    {/* Filtro de Motorista - Apenas para Admin */}
                    {isAdmin && (
                        <>
                            <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#9ca3af' }}>
                                <User style={{ width: '16px', height: '16px', display: 'inline', marginRight: '0.5rem' }} />
                                Motorista
                            </label>
                            <select
                                value={selectedDriver}
                                onChange={(e) => setSelectedDriver(e.target.value)}
                                style={s.select}
                            >
                                <option value="todos">Todos os motoristas</option>
                                {drivers.map(d => (
                                    <option key={d.id} value={d.id}>{d.nome}</option>
                                ))}
                            </select>
                        </>
                    )}

                    <label style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', color: '#9ca3af' }}>
                        <Filter style={{ width: '16px', height: '16px', display: 'inline', marginRight: '0.5rem' }} />
                        Período
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {(["dia", "semana", "mes", "ano", "total"] as PeriodType[]).map((p) => (
                            <button key={p} onClick={() => setPeriodType(p)} style={s.btn(periodType === p)}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                    </div>
                )}

                {/* List */}
                {!loading && (
                    <div style={{ ...s.card, backgroundColor: '#111827', borderColor: '#374151', padding: '1rem' }}>
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-700">
                            <div>
                                <h2 className="text-xl font-bold">{rides.length} corridas</h2>
                                <p className="text-sm text-gray-400">Exibindo de {rides.length} registros</p>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-green-400">{formatCurrency(totalView)}</div>
                                <div className="text-xs text-gray-500">Total nesta página</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {rides.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    Nenhuma corrida encontrada para este período.
                                </div>
                            ) : (
                                rides.map(ride => {
                                    const isApp = ['APP', 'APLICATIVO'].includes(ride.tipo?.toUpperCase() || '');
                                    return (
                                        <div key={ride.id} style={s.rideCard}>
                                            <div className="flex items-center gap-4">
                                                <div style={{
                                                    backgroundColor: isApp ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                                                    color: isApp ? '#60a5fa' : '#34d399',
                                                    width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {isApp ? <Clock size={20} /> : <Calendar size={20} />}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-white">{formatDate(new String(ride.hora).toString())}</div>
                                                    <div className="text-sm text-gray-400 flex items-center gap-2">
                                                        <Car size={14} />
                                                        {ride.vehiclePlate || 'N/A'} - {ride.driverName}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg text-white">{formatCurrency(ride.valor)}</div>
                                                <div style={{
                                                    fontSize: '0.75rem',
                                                    color: isApp ? '#60a5fa' : '#34d399',
                                                    textTransform: 'uppercase',
                                                    fontWeight: '600'
                                                }}>
                                                    {ride.tipo}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer Totals */}
                        {rides.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-700 grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                                    <div className="text-xs text-gray-400 mb-1">Total App</div>
                                    <div className="text-lg font-bold text-blue-400">{formatCurrency(totalApp)}</div>
                                </div>
                                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                                    <div className="text-xs text-gray-400 mb-1">Total Particular</div>
                                    <div className="text-lg font-bold text-green-400">{formatCurrency(totalParticular)}</div>
                                </div>
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
                                <button
                                    onClick={() => handlePageChange(page - 1)}
                                    disabled={page === 1}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} /> Anterior
                                </button>
                                <span className="text-sm text-gray-400">Página {page} de {totalPages}</span>
                                <button
                                    onClick={() => handlePageChange(page + 1)}
                                    disabled={page === totalPages}
                                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Próxima <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
