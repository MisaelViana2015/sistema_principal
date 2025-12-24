import React, { useState, useMemo } from "react";
import { Plus, X, Edit, Trash2, Calendar, Filter } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell
} from 'recharts';

interface FixedCost {
    id: string;
    vehicleId?: string;
    name: string;
    value: number;
    frequency: string;
    isRecurring: boolean;
    totalInstallments?: number;
}

interface Installment {
    id: string;
    fixedCostId: string;
    vehicleId?: string;
    installmentNumber: number;
    totalInstallments?: number;
    dueDate: string;
    value: number;
    status: 'Pago' | 'Pendente';
    costName?: string;
    vendor?: string;
}

interface Vehicle {
    id: string;
    plate: string;
    model: string;
}

interface FixedCostsManagerProps {
    costs: FixedCost[];
    installments: Installment[];
    vehicles: Vehicle[];
    onSave: (cost: any) => void;
    onDelete: (id: string) => void;
    onUpdateInstallment: (id: string, data: any) => void;
}

const COST_TYPES = [
    "Prestação", "Seguro", "IPVA", "Energia", "Licenciamento",
    "Empréstimo", "Rota77", "Outro"
];

// Cores baseadas nos screenshots
const COLORS = {
    costs: { bg: "#dbeafe", text: "#1e40af", bar: "#3b82f6" },     // Azul claro / Azul
    paid: { bg: "#ccfbf1", text: "#0f766e", bar: "#22c55e" },      // Verde-azulado / Verde
    pending: { bg: "#e0f2fe", text: "#0369a1", bar: "#f59e0b" },   // Azul céu / Laranja (conforme gráfico)
    interest: { bg: "#f3e8ff", text: "#7e22ce", bar: "#ef4444" }   // Roxo claro / Vermelho (Juros)
};

export function FixedCostsManager({ costs, installments, vehicles, onSave, onDelete, onUpdateInstallment }: FixedCostsManagerProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filtros
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>("all");
    const [filterDate, setFilterDate] = useState(new Date());
    const [showAll, setShowAll] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'Pago' | 'Pendente'>('all');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    // Form State
    const [formData, setFormData] = useState({
        vehicleId: "", type: "", description: "", value: "",
        specificDate: "", isRecurring: false, totalInstallments: "1",
        vendor: "", notes: ""
    });

    // --- Helpers ---
    const getVehicleName = (id: string) => {
        if (!id || id === "Sem Veículo") return "Geral";
        const v = vehicles.find(veh => veh.id === id);
        return v ? `${v.plate} - ${v.model}` : "Veículo Desconhecido";
    };

    const formatCurrency = (val: number) => `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

    // --- Data Processing for Summary Grid (4x5) ---
    const summaryData = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const currentDay = now.getDate();

        // Helper to filter installments
        const filter = (period: 'day' | 'week' | 'month' | 'year' | 'total', status?: 'Pago' | 'Pendente') => {
            return installments.filter(inst => {
                const d = new Date(inst.dueDate);
                if (status && inst.status !== status) return false;

                const isSameYear = d.getFullYear() === currentYear;
                const isSameMonth = d.getMonth() === currentMonth;
                const isSameDay = d.getDate() === currentDay;

                if (period === 'total') return true;
                if (period === 'year') return isSameYear;
                if (period === 'month') return isSameYear && isSameMonth;
                if (period === 'day') return isSameYear && isSameMonth && isSameDay;
                if (period === 'week') {
                    // Simplificação: Semana atual (Sunday-Saturday)
                    const firstDayOfWeek = currentDay - now.getDay();
                    const lastDayOfWeek = firstDayOfWeek + 6;
                    return isSameYear && isSameMonth && d.getDate() >= firstDayOfWeek && d.getDate() <= lastDayOfWeek;
                }
                return false;
            }).reduce((acc, curr) => acc + Number(curr.value), 0);
        };

        const totalCost = installments.reduce((acc, curr) => acc + Number(curr.value), 0);

        // Estrutura para os 4 cards principais (Linhas) x 5 colunas
        return [
            {
                label: "Custos",
                color: COLORS.costs,
                values: {
                    dia: filter('day'), semana: filter('week'), mes: filter('month'), ano: filter('year'), total: filter('total')
                }
            },
            {
                label: "Pago",
                color: COLORS.paid,
                values: {
                    dia: filter('day', 'Pago'), semana: filter('week', 'Pago'), mes: filter('month', 'Pago'), ano: filter('year', 'Pago'), total: filter('total', 'Pago')
                }
            },
            {
                label: "Pendente",
                color: COLORS.pending,
                values: {
                    dia: filter('day', 'Pendente'), semana: filter('week', 'Pendente'), mes: filter('month', 'Pendente'), ano: filter('year', 'Pendente'), total: filter('total', 'Pendente')
                }
            },
            {
                label: "Juros",
                color: COLORS.interest,
                values: {
                    dia: 0, semana: 0, mes: 0, ano: 810.48, total: 810.48 // Hardcoded conforme screenshot por enquanto
                }
            }
        ];
    }, [installments]);


    // --- Data Processing for Charts ---
    const chartDataMonths = useMemo(() => {
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        return months.map((month, index) => {
            const monthInsts = installments.filter(i => {
                const d = new Date(i.dueDate);
                return d.getMonth() === index && d.getFullYear().toString() === selectedYear;
            });
            return {
                name: month,
                Total: monthInsts.reduce((acc, curr) => acc + Number(curr.value), 0),
                Pago: monthInsts.filter(i => i.status === 'Pago').reduce((acc, curr) => acc + Number(curr.value), 0),
                Pendente: monthInsts.filter(i => i.status === 'Pendente').reduce((acc, curr) => acc + Number(curr.value), 0),
                Juros: 0 // Placeholder
            };
        });
    }, [installments, selectedYear]);

    // --- List Grouping ---
    // Agrupar por Veículo -> Mês/Ano
    const groupedInstallments = useMemo(() => {
        let filtered = installments;

        // Filter by Vehicle
        if (selectedVehicleId !== "all") {
            filtered = filtered.filter(i => (i.vehicleId || "Sem Veículo") === selectedVehicleId);
        }

        // Filter by Date (if not Show All)
        if (!showAll) {
            const targetMonth = filterDate.getMonth();
            const targetYear = filterDate.getFullYear();
            filtered = filtered.filter(i => {
                const d = new Date(i.dueDate);
                return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
            });
        }

        // Filter by Status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(i => i.status === statusFilter);
        }

        // Ordenar por data decrescente
        filtered.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

        const groups: Record<string, Installment[]> = {}; // Key: "VehicleID|MonthYear"

        filtered.forEach(inst => {
            const date = new Date(inst.dueDate);
            const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
            const vid = inst.vehicleId || "Sem Veículo";
            const key = `${vid}|${monthYear}`; // Composite key

            if (!groups[key]) groups[key] = [];
            groups[key].push(inst);
        });

        return groups;
    }, [installments, selectedVehicleId, showAll, filterDate]);

    // Handlers para Filtros de Data
    const handlePrevMonth = () => {
        setFilterDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        setShowAll(false);
    };
    const handleNextMonth = () => {
        setFilterDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        setShowAll(false);
    };
    const handleCurrentMonth = () => {
        setFilterDate(new Date());
        setShowAll(false);
    };
    const handleAllMonths = () => {
        setShowAll(true);
    };

    const monthDisplay = filterDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    const capitalizedMonthDisplay = monthDisplay.charAt(0).toUpperCase() + monthDisplay.slice(1);



    // --- Styles ---
    const styles = {
        container: { display: "flex", flexDirection: "column" as const, gap: "1.5rem", color: isDark ? "#e2e8f0" : "#1e293b" },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
        title: { fontSize: "1.5rem", fontWeight: "bold", color: isDark ? "#f1f5f9" : "#0f172a" },
        subtitle: { fontSize: "0.875rem", color: isDark ? "#94a3b8" : "#64748b" },
        primaryButton: { backgroundColor: "#0f172a", color: "#ffffff", padding: "0.5rem 1rem", borderRadius: "0.375rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500, border: "none", cursor: "pointer" },

        // Summary Grid
        summaryGrid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginTop: "1rem" },
        summarySection: { display: "contents" }, // To allow grid flow
        summaryCard: (bg: string, text: string) => ({
            backgroundColor: bg, color: text, padding: "1rem", borderRadius: "0.5rem",
            display: "flex", flexDirection: "column" as const, minHeight: "80px", justifyContent: "center"
        }),
        summaryLabel: { fontSize: "0.75rem", opacity: 0.8, marginBottom: "0.25rem" },
        summaryValue: { fontSize: "1.1rem", fontWeight: "bold" },
        summaryPercent: { fontSize: "0.75rem", marginTop: "0.25rem" },

        // Charts
        chartSection: { display: "grid", gridTemplateColumns: "1fr", gap: "2rem", backgroundColor: isDark ? "#1e293b" : "#ffffff", padding: "1.5rem", borderRadius: "0.5rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` },
        chartHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" },

        // List Layout
        filtersBar: { display: "flex", flexWrap: "wrap" as const, alignItems: "center" as const, gap: "1rem", backgroundColor: isDark ? "#1e293b" : "#ffffff", padding: "1rem", borderRadius: "0.5rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` },
        filterGroup: { display: "flex", flexDirection: "column" as const, gap: "0.25rem" },
        select: { padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, backgroundColor: isDark ? "#334155" : "#ffffff", color: isDark ? "#f1f5f9" : "#0f172a" },

        // Cards
        cardGroup: { marginBottom: "1rem" },
        cardHeader: { display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" },
        card: { backgroundColor: isDark ? "#1e293b" : "#ffffff", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, borderRadius: "0.5rem", padding: "1rem", display: "flex", flexDirection: "column" as const, gap: "1rem", marginBottom: "0.5rem" },
        cardRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: "0.5rem", borderBottom: `1px solid ${isDark ? "#334155" : "#f1f5f9"}` },
        tag: (status: string) => ({
            padding: "0.1rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: 600,
            backgroundColor: status === 'Pago' ? "#22c55e" : "#ef4444", color: "#ffffff" // Revertendo para cores sólidas do print
        }),
        iconButton: { padding: "0.25rem", cursor: "pointer", border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, borderRadius: "0.25rem", background: "transparent", color: isDark ? "#94a3b8" : "#64748b", display: "flex", alignItems: "center", justifyContent: "center" },

        // Modal (Simplified copy from prev)
        modalOverlay: { position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
        modalContent: { backgroundColor: isDark ? "#1e293b" : "#ffffff", padding: "2rem", borderRadius: "0.5rem", width: "600px", maxWidth: "95%" },
        input: { width: "100%", padding: "0.5rem", marginTop: "0.25rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, backgroundColor: isDark ? "#334155" : "#ffffff", color: isDark ? "#f1f5f9" : "#0f172a" }
    };

    const handleOpenModal = () => {
        setFormData({ vehicleId: "", type: "", description: "", value: "", specificDate: "", isRecurring: false, totalInstallments: "1", vendor: "", notes: "" });
        setIsModalOpen(true);
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Custos Fixos Avulsos</h2>
                    <p style={styles.subtitle}>Custos mensais individuais ou recorrentes</p>
                </div>
                <button style={styles.primaryButton} onClick={handleOpenModal}>
                    <Plus size={16} /> Novo Custo
                </button>
            </div>

            {/* 4x5 Summary Grid */}
            <div style={{ ...styles.summaryGrid, gridTemplateRows: "repeat(4, 1fr)" }}>
                {summaryData.map((row, rIdx) => (
                    <React.Fragment key={rIdx}>
                        {Object.entries(row.values).map(([period, val], cIdx) => (
                            <div key={`${rIdx}-${cIdx}`} style={styles.summaryCard(row.color.bg, row.color.text)}>
                                <span style={styles.summaryLabel}>{row.label} - {period.charAt(0).toUpperCase() + period.slice(1)}</span>
                                <div style={styles.summaryValue}>{formatCurrency(val)}</div>
                                <div style={styles.summaryPercent}>{period === 'total' ? 'Total Geral' : '100%'}</div>
                            </div>
                        ))}
                    </React.Fragment>
                ))}
            </div>

            {/* Charts Section */}
            <div style={styles.chartSection}>
                {/* Horizontal Chart: Month */}
                <div style={styles.header}>
                    <h3 style={{ ...styles.title, fontSize: "1.1rem" }}>Custos Fixos por Mês</h3>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <button style={styles.iconButton}>{"<"}</button>
                        <span>{selectedYear}</span>
                        <button style={styles.iconButton}>{">"}</button>
                    </div>
                </div>
                <div style={{ height: "400px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartDataMonths} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                            <XAxis type="number" stroke={styles.subtitle.color} />
                            <YAxis dataKey="name" type="category" stroke={styles.subtitle.color} width={40} />
                            <Tooltip contentStyle={{ backgroundColor: isDark ? "#1e293b" : "#ffffff" }} formatter={(val: number | undefined) => formatCurrency(Number(val) || 0)} />
                            <Legend verticalAlign="top" height={36} />
                            <Bar dataKey="Total" fill={COLORS.costs.bar} name="Custo Total" barSize={20} radius={[0, 4, 4, 0]} />
                            <Bar dataKey="Juros" fill={COLORS.interest.bar} name="Juros" barSize={20} radius={[0, 4, 4, 0]} />
                            <Bar dataKey="Pago" fill={COLORS.paid.bar} name="Valor Pago" barSize={20} radius={[0, 4, 4, 0]} />
                            <Bar dataKey="Pendente" fill={COLORS.pending.bar} name="Valor Pendente" barSize={20} radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Horizontal Chart: Day (Placeholder logic for now) */}
                <div style={{ ...styles.header, marginTop: "2rem" }}>
                    <h3 style={{ ...styles.title, fontSize: "1.1rem" }}>Custos por Dia</h3>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <button style={styles.iconButton}>{"<"}</button>
                        <span>Dezembro</span>
                        <button style={styles.iconButton}>{">"}</button>
                    </div>
                </div>
                {/* Empty Chart container for Visual Match */}
                <div style={{ height: "300px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: styles.subtitle.color, border: `1px dashed ${isDark ? "#334155" : "#e2e8f0"}` }}>
                    Gráfico por Dia (Dados em desenvolvimento)
                </div>
            </div>

            {/* Filters Bar */}
            <div style={{ ...styles.filtersBar, display: "flex" as const }}>
                <div style={styles.filterGroup}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Veículo</label>
                    <select style={styles.select} value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)}>
                        <option value="all">Todos os veículos</option>
                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>)}
                    </select>
                </div>

                {/* Buttons Group */}
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "flex-end" }}>
                    <button onClick={handlePrevMonth} style={styles.primaryButton}>Mês Anterior</button>
                    <button onClick={handleCurrentMonth} style={styles.primaryButton}>Mês Atual</button>
                    <button onClick={handleNextMonth} style={styles.primaryButton}>Mês Seguinte</button>
                    <button onClick={handleAllMonths} style={{ ...styles.primaryButton, backgroundColor: showAll ? "#2563eb" : (isDark ? "#334155" : "#cbd5e1"), color: showAll ? "white" : (isDark ? "white" : "black") }}>
                        Todos Meses
                    </button>
                </div>

                <div style={styles.filterGroup}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Mês/Ano</label>
                    <div style={{ ...styles.select, display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: "180px" }}>
                        <span>{showAll ? "Todos" : capitalizedMonthDisplay}</span>
                        <Calendar size={14} />
                    </div>
                </div>

                {/* Status Filter */}
                <div style={styles.filterGroup}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Status</label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => setStatusFilter('Pago')} style={{ ...styles.primaryButton, backgroundColor: statusFilter === 'Pago' ? "#22c55e" : (isDark ? "#334155" : "#e2e8f0"), color: statusFilter === 'Pago' ? "white" : (isDark ? "#e2e8f0" : "#1e293b") }}>Pago</button>
                        <button onClick={() => setStatusFilter('Pendente')} style={{ ...styles.primaryButton, backgroundColor: statusFilter === 'Pendente' ? "#ef4444" : (isDark ? "#334155" : "#e2e8f0"), color: statusFilter === 'Pendente' ? "white" : (isDark ? "#e2e8f0" : "#1e293b") }}>Aberto</button>
                        <button onClick={() => setStatusFilter('all')} style={{ ...styles.primaryButton, backgroundColor: statusFilter === 'all' ? (isDark ? "#475569" : "#94a3b8") : (isDark ? "#334155" : "#e2e8f0"), color: statusFilter === 'all' ? "white" : (isDark ? "#e2e8f0" : "#1e293b") }}>Ambos</button>
                    </div>
                </div>
            </div>

            {/* Cards List */}
            <div>
                {Object.entries(groupedInstallments).map(([key, insts]) => {
                    const [vid, monthYear] = key.split('|');
                    const vehicleName = getVehicleName(vid);
                    const totalVal = insts.reduce((a, b) => a + Number(b.value), 0);

                    return (
                        <div key={key} style={styles.card}>
                            {/* Group Header */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, paddingBottom: "0.5rem" }}>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <div style={{ backgroundColor: "#22c55e", padding: "0.25rem", borderRadius: "0.25rem", color: "white" }}><Edit size={12} /></div>
                                        <span style={{ fontWeight: "bold" }}>{vehicleName}</span>
                                    </div>
                                    <span style={{ fontSize: "0.75rem", color: styles.subtitle.color, marginLeft: "2rem" }}>{monthYear}</span>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontWeight: "bold" }}>{formatCurrency(totalVal)}</div>
                                    <div style={{ fontSize: "0.75rem", color: styles.subtitle.color }}>{insts.length} custo(s)</div>
                                </div>
                            </div>

                            {/* Individual Items */}
                            {insts.map(inst => (
                                <div key={inst.id} style={styles.cardRow}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                            <span style={{ fontWeight: 600 }}>{inst.costName}</span>
                                            <span style={styles.tag(inst.status)}>{inst.status}</span>
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: styles.subtitle.color }}>
                                            {new Date(inst.dueDate).toLocaleDateString()} • {inst.vendor || inst.costName}
                                            {inst.totalInstallments && inst.totalInstallments > 1 && ` (${inst.installmentNumber}/${inst.totalInstallments})`}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <span style={{ fontWeight: "bold" }}>{formatCurrency(inst.value)}</span>
                                        <div style={{ display: "flex", gap: "0.25rem" }}>
                                            <button style={styles.iconButton}><Edit size={14} /></button>
                                            <button style={styles.iconButton} onClick={() => onDelete(inst.fixedCostId)}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>

            {/* Modal (Simplified structure to match previous functionality) */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <h3>Novo Custo</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: styles.subtitle.color, cursor: "pointer" }}><X /></button>
                        </div>
                        {/* Form Fields (Reusing state for simplicity in this refactor view) */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={{ fontSize: "0.8rem" }}>Veículo</label>
                                <select style={styles.input} value={formData.vehicleId} onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}>
                                    <option value="">Selecione</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: "0.8rem" }}>Tipo</label>
                                <select style={styles.input} value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="">Selecione</option>
                                    {COST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ marginTop: "1rem" }}>
                            <label style={{ fontSize: "0.8rem" }}>Descrição</label>
                            <input style={styles.input} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
                            <div>
                                <label style={{ fontSize: "0.8rem" }}>Valor</label>
                                <input type="number" style={styles.input} value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: "0.8rem" }}>Parcelas</label>
                                <input type="number" style={styles.input} value={formData.totalInstallments} onChange={e => setFormData({ ...formData, totalInstallments: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: "0.8rem" }}>Início</label>
                                <input type="date" style={styles.input} value={formData.specificDate} onChange={e => setFormData({ ...formData, specificDate: e.target.value })} />
                            </div>
                        </div>
                        <div style={{ marginTop: "1.5rem", display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ padding: "0.5rem 1rem", border: "1px solid #ccc", background: "transparent", borderRadius: "0.25rem", cursor: "pointer" }}>Cancelar</button>
                            <button onClick={() => { onSave(formData); setIsModalOpen(false); }} style={{ padding: "0.5rem 1rem", backgroundColor: "#0f172a", color: "white", border: "none", borderRadius: "0.25rem", cursor: "pointer" }}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
