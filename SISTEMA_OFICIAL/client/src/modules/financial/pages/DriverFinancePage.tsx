import { useState, useEffect } from "react";
import MainLayout from "../../../components/MainLayout";
import { Wallet, Calendar, Download, TrendingUp, TrendingDown, DollarSign, User, Clock, ChevronLeft, ChevronRight, Loader2, FileDown, Gauge, Calculator, Car, Ticket } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { shiftsService } from "../../shifts/shifts.service";
import { ridesService, RideWithDetails } from "../../rides/rides.service";
import { driversService } from "../../drivers/drivers.service";
import { Driver } from "../../../../../shared/schema";

// Date helpers 
const startOfDay = (d: Date) => { const n = new Date(d); n.setHours(0, 0, 0, 0); return n; };
const endOfDay = (d: Date) => { const n = new Date(d); n.setHours(23, 59, 59, 999); return n; };
const startOfMonth = (d: Date) => { const n = new Date(d); n.setDate(1); n.setHours(0, 0, 0, 0); return n; };
const endOfMonth = (d: Date) => { const n = new Date(d); n.setMonth(n.getMonth() + 1); n.setDate(0); n.setHours(23, 59, 59, 999); return n; };
const startOfYear = (d: Date) => { const n = new Date(d); n.setMonth(0, 1); n.setHours(0, 0, 0, 0); return n; };
const endOfYear = (d: Date) => { const n = new Date(d); n.setMonth(11, 31); n.setHours(23, 59, 59, 999); return n; };
const startOfWeek = (d: Date) => {
    const n = new Date(d);
    const day = n.getDay();
    const diff = n.getDate() - day; // Sunday start
    n.setDate(diff);
    n.setHours(0, 0, 0, 0);
    return n;
};
const endOfWeek = (d: Date) => {
    const n = startOfWeek(d);
    n.setDate(n.getDate() + 6);
    n.setHours(23, 59, 59, 999);
    return n;
};

type PeriodType = "dia" | "semana" | "mes" | "ano";

interface ShiftWithDetails {
    id: string;
    motorista: string;
    driverId: string;
    veiculo: string;
    veiculoModelo: string;
    inicio: string;
    fim: string;
    status: string;
    kmRodado: number;
    kmInicial: number;
    receita: number;
    totalApp: number;
    totalParticular: number;
    totalCorridas: number;
    totalCorridasApp: number;
    totalCorridasParticular: number;
    liquido?: number;    // Ensure these exist if backend returns them, otherwise calc
    totalCustos?: number;
    totalCustosParticular?: number;
    repasseEmpresa?: number;
    repasseMotorista?: number;
}

export default function DriverFinancePage() {
    const { theme } = useTheme();
    const { user, isAdmin } = useAuth(); // isAdmin is available in context
    const isDark = theme === 'dark';

    // State
    const [shifts, setShifts] = useState<ShiftWithDetails[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [selectedDriver, setSelectedDriver] = useState("todos");
    const [periodType, setPeriodType] = useState<PeriodType>("dia");
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        if (isAdmin) {
            loadDrivers();
        } else if (user?.id) {
            // Se for motorista, fixa o filtro no próprio ID (para UI apenas, backend já força)
            setSelectedDriver(user.id);
        }
    }, [isAdmin, user]);

    useEffect(() => {
        if (!isAdmin && selectedDriver === "todos" && user) {
            // Aguarda selectedDriver atualizar se for motorista
            // Mas user.id já deve ter disparado o useEffect acima.
            // Garantir que não chame com "todos" se não for admin
            return;
        }
        loadShifts();
    }, [selectedDriver, periodType, currentDate, isAdmin]); // Added isAdmin dep to prevent early fetch

    const loadDrivers = async () => {
        try {
            const data = await driversService.getAll();
            setDrivers(data);
        } catch (error) {
            console.error("Erro ao carregar motoristas", error);
        }
    };

    const loadShifts = async () => {
        setLoading(true);
        try {
            const dateRange = getDateRange(periodType, currentDate);

            // Filter logic
            let driverFilter = selectedDriver;
            if (!isAdmin && user) {
                driverFilter = user.id; // Ensure consistent filter frontend-side
            }
            // If "todos" and admin, send undefined or 'todos' depending on backend. Service sends 'driverId' param if defined.
            // Service Logic: if (filters?.driverId && filters.driverId !== 'todos') params.append...

            const response = await shiftsService.getAll({
                driverId: driverFilter !== "todos" ? driverFilter : undefined,
                startDate: dateRange.startDate.toISOString(),
                endDate: dateRange.endDate.toISOString(),
                limit: 50,
            });

            setShifts(response.data as unknown as ShiftWithDetails[]);
        } catch (error) {
            console.error("Erro ao carregar turnos:", error);
        } finally {
            setLoading(false);
        }
    };
    /* ... helper functions same ... */
    const getDateRange = (period: PeriodType, date: Date) => {
        switch (period) {
            case "dia":
                return { startDate: startOfDay(date), endDate: endOfDay(date) };
            case "semana":
                return { startDate: startOfWeek(date), endDate: endOfWeek(date) };
            case "mes":
                return { startDate: startOfMonth(date), endDate: endOfMonth(date) };
            case "ano":
                return { startDate: startOfYear(date), endDate: endOfYear(date) };
        }
    };

    const handlePrevDate = () => {
        const newDate = new Date(currentDate);
        if (periodType === 'dia') newDate.setDate(newDate.getDate() - 1);
        if (periodType === 'semana') newDate.setDate(newDate.getDate() - 7);
        if (periodType === 'mes') newDate.setMonth(newDate.getMonth() - 1);
        if (periodType === 'ano') newDate.setFullYear(newDate.getFullYear() - 1);
        setCurrentDate(newDate);
    };

    const handleNextDate = () => {
        const newDate = new Date(currentDate);
        if (periodType === 'dia') newDate.setDate(newDate.getDate() + 1);
        if (periodType === 'semana') newDate.setDate(newDate.getDate() + 7);
        if (periodType === 'mes') newDate.setMonth(newDate.getMonth() + 1);
        if (periodType === 'ano') newDate.setFullYear(newDate.getFullYear() + 1);
        setCurrentDate(newDate);
    };

    const formatDateDisplay = () => {
        if (periodType === 'dia') return currentDate.toLocaleDateString('pt-BR');
        if (periodType === 'mes') return currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        if (periodType === 'ano') return currentDate.getFullYear().toString();

        const range = getDateRange('semana', currentDate);
        return `${range.startDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${range.endDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
    };

    // Styles
    const s = {
        container: { maxWidth: '1024px', margin: '0 auto', color: isDark ? '#fff' : '#1f2937' },
        header: { marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' },
        title: { fontSize: '1.5rem', fontWeight: 'bold' },
        subtitle: { fontSize: '0.875rem', color: '#6b7280' },
        card: {
            backgroundColor: isDark ? '#1f2937' : '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        },
        select: {
            padding: '0.5rem',
            borderRadius: '0.5rem',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            backgroundColor: isDark ? '#111827' : '#fff',
            color: isDark ? '#fff' : '#1f2937',
            width: '100%'
        }
    };

    return (
        <MainLayout>
            <div style={s.container}>
                {/* Header */}
                <div style={s.header}>
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                        <DollarSign className="w-6 h-6 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                        <h1 style={s.title}>Caixa</h1>
                        <p style={s.subtitle}>Visualize fechamentos de turnos</p>
                    </div>
                </div>

                {/* Filters */}
                <div style={s.card}>
                    <h3 className="text-sm font-bold mb-4">Filtros</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

                        {/* Driver Select - Only Show for Admin */}
                        {isAdmin && (
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Motorista</label>
                                <select
                                    value={selectedDriver}
                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                    style={s.select}
                                >
                                    <option value="todos">Todos os Motoristas</option>
                                    {drivers.map(d => (
                                        <option key={d.id} value={d.id}>{d.nome}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* If Driver, Show Name but Disabled */}
                        {!isAdmin && user && (
                            <div>
                                <label className="text-xs text-gray-500 mb-1 block">Motorista</label>
                                <div style={{ ...s.select, opacity: 0.7, cursor: 'not-allowed' }}>
                                    {user.nome || 'Você'}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Período</label>
                            <select
                                value={periodType}
                                onChange={(e) => setPeriodType(e.target.value as PeriodType)}
                                style={s.select}
                            >
                                <option value="dia">Dia</option>
                                <option value="semana">Semana</option>
                                <option value="mes">Mês</option>
                                <option value="ano">Ano</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
                        <button onClick={handlePrevDate} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                            <ChevronLeft size={20} />
                        </button>
                        <div className="flex items-center gap-2 font-medium">
                            <Calendar size={18} />
                            {formatDateDisplay()}
                        </div>
                        <button onClick={handleNextDate} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Shifts List */}
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                    </div>
                ) : shifts.length === 0 ? (
                    <div style={{ ...s.card, textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
                        Nenhum turno encontrado nesta data.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {shifts.map(shift => (
                            <ShiftCard key={shift.id} shift={shift} isDark={isDark} />
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}


import { financialService, Expense } from "../../financial/financial.service";


function ShiftCard({ shift, isDark }: { shift: ShiftWithDetails, isDark: boolean }) {
    const { isAdmin } = useAuth();
    const [rides, setRides] = useState<RideWithDetails[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]); // New state
    const [loadingRides, setLoadingRides] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [ridesData, expensesData] = await Promise.all([
                    ridesService.getAll({ shiftId: shift.id, limit: 100 }),
                    financialService.getExpenses(shift.id) // Fetch expenses
                ]);
                setRides(ridesData.data);
                setExpenses(expensesData as any);
            } catch (error) {
                console.error("Erro ao buscar dados do turno", error);
            } finally {
                setLoadingRides(false);
            }
        }
        fetchData();
    }, [shift.id]);

    const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

    // Recalculate based on shift data
    const totalReceita = Number(shift.receita || 0);
    const totalCustos = Number(shift.totalCustos || 0);
    const totalCustosParticular = Number(shift.totalCustosParticular || 0);
    const lucroLiquido = totalReceita - totalCustos; // Custos já inclui particular no backend? Sim, no meu edit fiz soma.

    // Se quiser exibir Liquido Real DA FROTA (excluindo particular), teria que subtrair diferente.
    // Mas vamos seguir o padrão atual.
    const repasseEmpresa = Number(shift.repasseEmpresa || lucroLiquido * 0.6);
    const repasseMotorista = Number(shift.repasseMotorista || lucroLiquido * 0.4);

    const kmRodados = (shift.kmRodado || 0);
    const totalCorridas = (shift.totalCorridasApp || 0) + (shift.totalCorridasParticular || 0);
    const ticketMedio = totalCorridas > 0 ? totalReceita / totalCorridas : 0;
    const valorPorKm = kmRodados > 0 ? totalReceita / kmRodados : 0;

    // Duration
    const start = new Date(shift.inicio);
    const end = shift.fim ? new Date(shift.fim) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const durationStr = `${hours}h ${mins}min`;

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return `${d.toLocaleDateString('pt-BR')} às ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    }

    return (
        <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} overflow-hidden shadow-sm`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold mb-1">Turno de {shift.motorista}</h3>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{shift.veiculo} — {shift.veiculoModelo || 'Veículo'}</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                        Início: {formatDate(shift.inicio)}
                        <br />
                        Fim: {shift.fim ? formatDate(shift.fim) : 'Em andamento'}
                    </div>
                </div>
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors">
                    <FileDown size={16} /> Baixar PDF
                </button>
            </div>

            <div className="p-4">
                {/* Rides List - App */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Wallet size={16} />
                        </div>
                        <h4 className="font-bold">Aplicativo</h4>
                    </div>

                    {loadingRides ? <div className="p-2 text-sm text-gray-500">Carregando corridas...</div> : (
                        <div className="space-y-1 pl-10 mb-2">
                            {rides.filter(r => ['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || '')).map((ride, idx) => (
                                <div key={ride.id} className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                    <div className="text-gray-500 font-mono">
                                        {idx + 1} - {new Date(ride.hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="font-mono font-medium">{formatCurrency(Number(ride.valor))}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pl-10 flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col">
                            <span className="font-bold text-lg">{formatCurrency(Number(shift.totalApp))}</span>
                            <span className="text-xs text-gray-500">Total Corridas APP</span>
                        </div>
                        <span className="text-sm font-medium text-gray-500">{shift.totalCorridasApp}</span>
                    </div>
                </div>

                {/* Rides List - Particular */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <User size={16} />
                        </div>
                        <h4 className="font-bold">Particular</h4>
                    </div>

                    {loadingRides ? <div className="p-2 text-sm text-gray-500">Carregando corridas...</div> : (
                        <div className="space-y-1 pl-10 mb-2">
                            {rides.filter(r => !['APP', 'APLICATIVO'].includes(r.tipo?.toUpperCase() || '')).map((ride, idx) => (
                                <div key={ride.id} className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                    <div className="text-gray-500 font-mono">
                                        {idx + 1} - {new Date(ride.hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="font-mono font-medium">{formatCurrency(Number(ride.valor))}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pl-10 flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col">
                            <span className="font-bold text-lg">{formatCurrency(Number(shift.totalParticular))}</span>
                            <span className="text-xs text-gray-500">Total Corridas Particulares</span>
                        </div>
                        <span className="text-sm font-medium text-gray-500">{shift.totalCorridasParticular}</span>
                    </div>
                </div>

                {/* Costs List - Custos */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                            <DollarSign size={16} />
                        </div>
                        <h4 className="font-bold">Custos</h4>
                    </div>

                    {loadingRides ? <div className="p-2 text-sm text-gray-500">Carregando custos...</div> : (
                        <div className="space-y-1 pl-10 mb-2">
                            {/* Renderizar lista de despesas aqui */}
                            {expenses.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">Nenhum custo registrado.</p>
                            ) : (
                                expenses.map((expense, idx) => (
                                    <div key={expense.id} className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                        <div className="text-gray-500 font-mono flex flex-col">
                                            <span>{idx + 1} - {expense.tipo || 'Outros'}</span>
                                            {(expense as any).isSplitCost && (
                                                <span className="text-[10px] text-gray-400 pl-2">↳ Dividido (50/50)</span>
                                            )}
                                        </div>
                                        <div className="font-mono font-medium text-red-400">{formatCurrency(Number(expense.valor))}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    <div className="pl-10 flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex flex-col">
                            <span className="font-bold text-lg text-red-500">{formatCurrency(Number(shift.totalCustos))}</span>
                            <span className="text-xs text-gray-500">Total Custos</span>
                        </div>
                        <span className="text-sm font-medium text-gray-500">{expenses.length}</span>
                    </div>
                </div>

                {/* Summary */}
                <h4 className="font-bold mb-4">Resumo Financeiro</h4>
                <div className="space-y-3 mb-8">
                    <SummaryCard
                        label="Receita Total"
                        value={formatCurrency(totalReceita)}
                        icon={<DollarSign size={18} />}
                        bg="#7f1d1d" // Darker red/brown from screenshot
                    />
                    <SummaryCard
                        label="Custos"
                        value={formatCurrency(totalCustos)}
                        icon={<TrendingDown size={18} />}
                        bg="#991b1b"
                    />
                    {totalCustosParticular > 0 && (
                        <SummaryCard
                            label="Custos Particulares"
                            value={formatCurrency(totalCustosParticular)}
                            icon={<User size={18} />}
                            bg="#c2410c" // Orange-700
                        />
                    )}
                    <SummaryCard
                        label="Lucro Líquido"
                        value={formatCurrency(lucroLiquido)}
                        icon={<TrendingUp size={18} />}
                        bg="#065f46" // Darker green
                    />
                    <SummaryCard
                        label="Empresa (60%)"
                        value={formatCurrency(repasseEmpresa)}
                        icon={<Wallet size={18} />}
                        bg="#1e3a8a" // Darker blue
                    />
                    <SummaryCard
                        label="Motorista (40%)"
                        value={formatCurrency(repasseMotorista)}
                        icon={<User size={18} />}
                        bg="#581c87" // Darker purple
                    />
                </div>

                {/* Operational Stats */}
                <h3 className="font-bold mb-4 text-lg dark:text-white">Dados Operacionais</h3>
                <div className="space-y-4">
                    <OperationalRow
                        icon={<Gauge size={20} />}
                        label="KM Rodados"
                        value={`${kmRodados} km`}
                        colorClass="text-blue-500 bg-blue-100 dark:bg-blue-900/30"
                    />
                    <OperationalRow
                        icon={<Calculator size={20} />}
                        label="Valor por KM"
                        value={formatCurrency(valorPorKm)}
                        colorClass="text-orange-500 bg-orange-100 dark:bg-orange-900/30"
                    />
                    <OperationalRow
                        icon={<Car size={20} />}
                        label="Total de Corridas"
                        value={totalCorridas.toString()}
                        colorClass="text-purple-500 bg-purple-100 dark:bg-purple-900/30"
                    />
                    <OperationalRow
                        icon={<Ticket size={20} />}
                        label="Ticket Médio Geral"
                        value={formatCurrency(ticketMedio)}
                        colorClass="text-cyan-500 bg-cyan-100 dark:bg-cyan-900/30"
                    />
                    <OperationalRow
                        icon={<Clock size={20} />}
                        label="Duração do Turno"
                        value={durationStr}
                        colorClass="text-gray-500 bg-gray-100 dark:bg-gray-800"
                        isSimple
                    />
                </div>
            </div>
        </div >
    );
}

function SummaryCard({ label, value, icon, bg }: { label: string, value: string, icon: React.ReactNode, bg: string }) {
    return (
        <div style={{ backgroundColor: bg }} className="text-white p-4 rounded-xl flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-3 font-semibold">
                <div className="p-1 rounded bg-white/20">
                    {icon}
                </div>
                {label}
            </div>
            <div className="font-bold text-lg">{value}</div>
        </div>
    );
}

function OperationalRow({ icon, label, value, colorClass, isSimple }: { icon: React.ReactNode, label: string, value: string, colorClass: string, isSimple?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            {isSimple ? (
                <div className="text-sm text-gray-500">{label}</div>
            ) : (
                <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClass}`}>
                        {icon}
                    </div>
                    <span className="font-medium dark:text-gray-300">{label}</span>
                </div>
            )}
            <div className={`font-bold ${isSimple ? 'text-sm text-gray-500' : 'text-lg dark:text-white'}`}>{value}</div>
        </div>
    )
}
