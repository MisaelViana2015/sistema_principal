import { useEffect, useState } from "react";
import { shiftsService, PaginatedResponse } from "./shifts.service";
import { driversService } from "../drivers/drivers.service";
import { vehiclesService } from "../vehicles/vehicles.service";
import { Shift, Driver, Vehicle } from "../../../../shared/schema";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, Loader2, AlertTriangle, Filter } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

import { EditShiftModal } from "./EditShiftModal";

export default function ShiftsList() {
    const [data, setData] = useState<PaginatedResponse<Shift> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);

    // Edit Modal State
    const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        driverId: 'todos',
        vehicleId: 'todos',
        status: 'todos',
        period: 'mes',
        month: new Date().toISOString().slice(0, 7) // YYYY-MM
    });
    const [page, setPage] = useState(1);
    const limit = 50;

    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        loadDependencies();
    }, []);

    useEffect(() => {
        loadShifts();
    }, [page, filters]);

    async function loadDependencies() {
        try {
            const [d, v] = await Promise.all([
                driversService.getAll(),
                vehiclesService.getAll()
            ]);
            setDrivers(d);
            setVehicles(v);
        } catch (e) {
            console.error("Failed to load dependencies", e);
        }
    }

    async function loadShifts() {
        setIsLoading(true);
        try {
            // Calculate date range based on period
            let startDate = undefined;
            let endDate = undefined;
            const now = new Date();

            if (filters.period === 'hoje') {
                startDate = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            } else if (filters.period === 'semana') {
                const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                startDate = lastWeek.toISOString();
            } else if (filters.period === 'mes') {
                const [y, m] = filters.month.split('-').map(Number);
                startDate = new Date(y, m - 1, 1).toISOString();
                endDate = new Date(y, m, 0, 23, 59, 59).toISOString();
            }

            const response = await shiftsService.getAll({
                page,
                limit,
                driverId: filters.driverId,
                vehicleId: filters.vehicleId,
                status: filters.status,
                startDate,
                endDate
            });
            setData(response);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    const s = {
        container: { maxWidth: '100%', margin: '0 auto' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
        title: { fontSize: '1.5rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' },
        filters: {
            display: 'flex', gap: '1rem', flexWrap: 'wrap' as const, marginBottom: '1.5rem',
            padding: '1rem', backgroundColor: isDark ? '#1f2937' : '#fff', borderRadius: '0.5rem', border: isDark ? '1px solid #374151' : '1px solid #e5e7eb'
        },
        select: {
            padding: '0.5rem', borderRadius: '0.375rem', border: isDark ? '1px solid #4b5563' : '1px solid #d1d5db',
            backgroundColor: isDark ? '#374151' : '#fff', color: isDark ? '#fff' : '#000'
        },
        card: {
            backgroundColor: isDark ? '#1f2937' : '#fff', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem',
            border: isDark ? '1px solid #374151' : '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
        },
        pagination: {
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem'
        },
        btn: {
            padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #d1d5db', cursor: 'pointer',
            backgroundColor: isDark ? '#374151' : '#fff', color: isDark ? '#fff' : '#000', display: 'flex', alignItems: 'center', gap: '0.5rem'
        }
    };

    return (
        <div style={s.container}>
            <div style={s.header}>
                <h1 style={s.title}>Gestão de Turnos (Paginação)</h1>

            </div>

            {/* Filters */}
            <div style={s.filters}>
                <select style={s.select} value={filters.period} onChange={e => setFilters({ ...filters, period: e.target.value })}>
                    <option value="hoje">Hoje</option>
                    <option value="semana">Semana</option>
                    <option value="mes">Mês</option>
                    <option value="todos">Todos</option>
                </select>
                {filters.period === 'mes' && (
                    <input type="month" style={s.select} value={filters.month} onChange={e => setFilters({ ...filters, month: e.target.value })} />
                )}
                <select style={s.select} value={filters.driverId} onChange={e => setFilters({ ...filters, driverId: e.target.value })}>
                    <option value="todos">Todos Motoristas</option>
                    {drivers.map(d => <option key={d.id} value={d.id}>{d.nome}</option>)}
                </select>
                <select style={s.select} value={filters.vehicleId} onChange={e => setFilters({ ...filters, vehicleId: e.target.value })}>
                    <option value="todos">Todos Veículos</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.modelo}</option>)}
                </select>
                <select style={s.select} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                    <option value="todos">Status: Todos</option>
                    <option value="em_andamento">Aberto</option>
                    <option value="concluido">Fechado</option>
                </select>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="text-center p-10"><Loader2 className="animate-spin mx-auto" /></div>
            ) : !data ? (
                <div className="text-center p-10 text-red-500">Erro ao carregar dados ou nenhum dado encontrado.</div>
            ) : (
                <div className="flex flex-col gap-4">
                    {data.data?.map((shift: any) => (
                        <div key={shift.id} style={s.card}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-lg dark:text-white">{shift.motorista}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${shift.status === 'em_andamento' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                            {shift.status === 'em_andamento' ? 'Aberto' : 'Fechado'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {shift.veiculo} - {shift.veiculoModelo}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {new Date(shift.inicio).toLocaleString("pt-BR")}
                                        {shift.fim && ` - ${new Date(shift.fim).toLocaleString("pt-BR")}`}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <div className="px-2 py-1 rounded bg-blue-900/30 border border-blue-800 text-blue-300 text-xs font-mono font-medium">
                                            {shift.totalCorridasApp || 0} App • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(shift.totalApp || 0))}
                                        </div>
                                        <div className="px-2 py-1 rounded bg-green-900/30 border border-green-800 text-green-300 text-xs font-mono font-medium">
                                            {shift.totalCorridasParticular || 0} Particular • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(shift.totalParticular || 0))}
                                        </div>
                                        <div className="px-2 py-1 rounded bg-gray-800 border border-gray-700 text-gray-300 text-xs font-mono font-bold">
                                            Total: {shift.totalCorridas || 0} • {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(shift.totalBruto || 0))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="p-1.5 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                                        title="Editar Turno"
                                        onClick={() => {
                                            setSelectedShiftId(shift.id);
                                            setIsEditModalOpen(true);
                                        }}
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        className="p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
                                        title="Excluir Turno"
                                        onClick={async () => {
                                            if (!confirm(`Tem certeza que deseja excluir o turno de ${new Date(shift.inicio).toLocaleDateString()}?\nEssa ação não pode ser desfeita.`)) return;
                                            try {
                                                await shiftsService.delete(shift.id);
                                                loadShifts();
                                            } catch (error) {
                                                console.error("Erro ao excluir turno", error);
                                                alert("Erro ao excluir turno. Verifique o console.");
                                            }
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Detalhes Financeiros (Sempre Visíveis) */}
                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                <div>
                                    <div className="text-xs text-gray-500">KM Inicial</div>
                                    <div className="font-mono font-bold dark:text-gray-200">{shift.kmInicial}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">KM Final</div>
                                    <div className="font-mono font-bold dark:text-gray-200">{shift.kmFinal || '-'}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Custos</div>
                                    <div className="font-mono font-bold text-red-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(shift.totalCustos || 0))}</div>
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500">Líquido</div>
                                    <div className="font-mono font-bold text-green-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(shift.liquido || 0))}</div>
                                </div>

                                {/* Repasses em destaque */}
                                <div className="col-span-2 md:col-span-2 mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg flex justify-between items-center border border-gray-100 dark:border-gray-700">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase font-bold">Empresa (60%)</div>
                                        <div className="font-mono font-bold text-blue-400 text-lg">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(shift.repasseEmpresa || 0))}</div>
                                    </div>
                                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-600 mx-4"></div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 uppercase font-bold">Motorista (40%)</div>
                                        <div className="font-mono font-bold text-purple-400 text-lg">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(shift.repasseMotorista || 0))}</div>
                                    </div>
                                </div>

                                {/* Estatísticas Extras */}
                                <div className="col-span-2 md:col-span-2 mt-2 flex justify-between items-center px-2">
                                    <div>
                                        <div className="text-xs text-gray-500">Média/KM</div>
                                        <div className="font-mono text-gray-400">
                                            {shift.kmFinal ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((Number(shift.totalBruto || 0) / (Number(shift.kmFinal) - Number(shift.kmInicial))) || 0) : '-'} / km
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {data && (
                <div style={s.pagination}>
                    <button
                        style={{ ...s.btn, opacity: data.pagination.page === 1 ? 0.5 : 1 }}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={data.pagination.page === 1}
                    >
                        <ChevronLeft size={16} /> Anterior
                    </button>
                    <span className="text-sm dark:text-gray-300">
                        Página {data.pagination.page} de {data.pagination.totalPages}
                    </span>
                    <button
                        style={{ ...s.btn, opacity: data.pagination.page === data.pagination.totalPages ? 0.5 : 1 }}
                        onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                        disabled={data.pagination.page === data.pagination.totalPages}
                    >
                        Próxima <ChevronRight size={16} />
                    </button>
                </div>
            )}

            <EditShiftModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                shiftId={selectedShiftId}
                onSuccess={() => {
                    loadShifts();
                }}
            />
        </div>
    );
}

