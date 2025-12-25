import React, { useState, useMemo } from "react";
import { Plus, X, Edit, Trash2, Calendar, Filter, RefreshCw } from "lucide-react";
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

export interface FixedCostsManagerProps {
    costs: FixedCost[];
    installments: Installment[];
    vehicles: Vehicle[];
    costTypes: any[];
    onSave: (cost: any) => void;
    onDelete: (id: string) => void;
    onUpdateInstallment: (id: string, data: any) => void;
}

// Cores baseadas nos screenshots
const COLORS = {
    costs: { bg: "#dbeafe", text: "#1e40af", bar: "#3b82f6" },     // Azul claro / Azul
    paid: { bg: "#ccfbf1", text: "#0f766e", bar: "#22c55e" },      // Verde-azulado / Verde
    pending: { bg: "#e0f2fe", text: "#0369a1", bar: "#f59e0b" },   // Azul céu / Laranja (conforme gráfico)
    interest: { bg: "#f3e8ff", text: "#7e22ce", bar: "#ef4444" }   // Roxo claro / Vermelho (Juros)
};

export function FixedCostsManager({ costs, installments, vehicles, costTypes, onSave, onDelete, onUpdateInstallment }: FixedCostsManagerProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filtros
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>("all");
    const [filterDate, setFilterDate] = useState(new Date());
    const [showAll, setShowAll] = useState(false);
    const [statusFilter, setStatusFilter] = useState<'all' | 'Pago' | 'Pendente'>('all');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

    // Form State for Cost
    const [formData, setFormData] = useState({
        id: "", // Added ID
        vehicleId: "", costTypeId: "", description: "", value: "",
        specificDate: "", monthYear: "", isRecurring: false, totalInstallments: "12",
        vendor: "", notes: ""
    });

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentData, setPaymentData] = useState({
        installmentId: "",
        date: new Date().toISOString().split('T')[0],
        value: "",
        costName: ""
    });

    // Edit Installment Modal State
    const [isEditInstallmentModalOpen, setIsEditInstallmentModalOpen] = useState(false);
    const [editInstallmentData, setEditInstallmentData] = useState({
        installmentId: "",
        dueDate: new Date().toISOString().split('T')[0],
        value: "",
        status: "",
        costName: ""
    });

    // Edit Handler (Fixed Cost)
    const handleEditCost = (costId: string) => {
        const cost = costs.find(c => c.id === costId);
        if (!cost) return;

        setFormData({
            id: cost.id,
            vehicleId: cost.vehicleId || "",
            costTypeId: (cost as any).costTypeId || "",
            description: cost.name,
            value: cost.value.toString(),
            specificDate: "",
            monthYear: "",
            isRecurring: cost.isRecurring,
            totalInstallments: cost.totalInstallments?.toString() || "12",
            vendor: (cost as any).vendor || "",
            notes: (cost as any).notes || ""
        });
        setIsModalOpen(true);
    };

    // Payment Handler
    const handleOpenPayment = (inst: Installment) => {
        setPaymentData({
            installmentId: inst.id,
            date: new Date().toISOString().split('T')[0],
            value: inst.value.toString(),
            costName: inst.costName || "Custo"
        });
        setIsPaymentModalOpen(true);
    };

    const handleConfirmPayment = () => {
        if (!paymentData.installmentId) return;
        onUpdateInstallment(paymentData.installmentId, {
            status: "Pago",
            paymentDate: new Date(paymentData.date),
            value: Number(paymentData.value)
        });
        setIsPaymentModalOpen(false);
    };

    const handleEditInstallment = (inst: Installment) => {
        setEditInstallmentData({
            installmentId: inst.id,
            dueDate: new Date(inst.dueDate).toISOString().split('T')[0],
            value: inst.value.toString(),
            status: inst.status,
            costName: inst.costName || "Parcela"
        });
        setIsEditInstallmentModalOpen(true);
    };

    const handleConfirmEditInstallment = () => {
        if (!editInstallmentData.installmentId) return;
        onUpdateInstallment(editInstallmentData.installmentId, {
            dueDate: new Date(editInstallmentData.dueDate),
            value: Number(editInstallmentData.value),
            status: editInstallmentData.status
        });
        setIsEditInstallmentModalOpen(false);
    };

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
        input: { width: "100%", padding: "0.5rem", marginTop: "0.25rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, backgroundColor: isDark ? "#334155" : "#ffffff", color: isDark ? "#f1f5f9" : "#0f172a" },
        label: { fontSize: "0.8rem", fontWeight: 600, color: isDark ? "#e2e8f0" : "#475569" }
    };

    const handleOpenModal = () => {
        setFormData({
            id: "", // Reset ID
            vehicleId: "", costTypeId: "", description: "", value: "",
            specificDate: "", monthYear: "", isRecurring: false, totalInstallments: "12",
            vendor: "", notes: ""
        });
        setIsModalOpen(true);
    };

    return (
        <div style={styles.container} >
            {/* Header */}
            < div style={styles.header} >
                <div>
                    <h2 style={styles.title}>Custos Fixos Avulsos</h2>
                    <p style={styles.subtitle}>Custos mensais individuais ou recorrentes</p>
                </div>
                <button style={styles.primaryButton} onClick={handleOpenModal}>
                    <Plus size={16} /> Novo Custo
                </button>
            </div >

            {/* 4x5 Summary Grid */}
            < div style={{ ...styles.summaryGrid, gridTemplateRows: "repeat(4, 1fr)" }
            }>
                {
                    summaryData.map((row, rIdx) => (
                        <React.Fragment key={rIdx}>
                            {Object.entries(row.values).map(([period, val], cIdx) => (
                                <div key={`${rIdx}-${cIdx}`} style={styles.summaryCard(row.color.bg, row.color.text)}>
                                    <span style={styles.summaryLabel}>{row.label} - {period.charAt(0).toUpperCase() + period.slice(1)}</span>
                                    <div style={styles.summaryValue}>{formatCurrency(val)}</div>
                                    <div style={styles.summaryPercent}>{period === 'total' ? 'Total Geral' : '100%'}</div>
                                </div>
                            ))}
                        </React.Fragment>
                    ))
                }
            </div >

            {/* Charts Section */}
            < div style={styles.chartSection} >
                {/* Horizontal Chart: Month */}
                < div style={styles.header} >
                    <h3 style={{ ...styles.title, fontSize: "1.1rem" }}>Custos Fixos por Mês</h3>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <button style={styles.iconButton}>{"<"}</button>
                        <span>{selectedYear}</span>
                        <button style={styles.iconButton}>{">"}</button>
                    </div>
                </div >
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
            </div >

            {/* Filters Bar */}
            < div style={{ ...styles.filtersBar, display: "flex" as const }}>
                <div style={styles.filterGroup}>
                    <label style={{ fontSize: "0.75rem", fontWeight: 600 }}>Veículo</label>
                    <select style={styles.select} value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)}>
                        <option value="all">Todos os veículos</option>
                        {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.plate} - {v.model} {v.driverName ? `(${v.driverName})` : ''}</option>)}
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
            </div >

            {/* Cards List */}
            <div>
                {
                    Object.entries(groupedInstallments).map(([key, insts]) => {
                        const [vid, monthYear] = key.split('|');
                        const vehicleName = getVehicleName(vid);
                        const totalVal = insts.reduce((a, b) => a + Number(b.value), 0);

                        return (
                            <div key={key} style={styles.card}>
                                {/* Group Header */}
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, paddingBottom: "0.5rem" }}>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <div
                                                    onClick={() => {
                                                        // Find first cost in group to get ID (Grouping by vehicle/month means multiple costs... wait. Grouping is by Cost? No, by Vehicle|Month)
                                                        // The image implies grouping by a specific Cost Period.
                                                        // Actually, "Editar Custo" usually edits the PARENT Fixed Cost.
                                                        // We need the Fixed Cost ID.
                                                        // `insts` array contains installments. `insts[0].fixedCostId` gives the parent ID.
                                                        if (insts.length > 0) handleEditCost(insts[0].fixedCostId);
                                                    }}
                                                    style={{ backgroundColor: "#22c55e", padding: "0.25rem", borderRadius: "0.25rem", color: "white", cursor: "pointer" }}>
                                                    <Edit size={12} />
                                                </div>
                                                <span style={{ fontWeight: "bold" }}>{vehicleName}</span>
                                            </div>
                                            <span style={{ fontSize: "0.75rem", color: styles.subtitle.color, marginLeft: "2rem" }}>{monthYear}</span>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontWeight: "bold" }}>{formatCurrency(totalVal)}</div>
                                            <div style={{ fontSize: "0.75rem", color: styles.subtitle.color }}>{insts.length} custo(s)</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Individual Items */}
                                {insts.map(inst => (
                                    <div key={inst.id} style={styles.cardRow}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                                <span style={{ fontWeight: 600 }}>{inst.costName}</span>
                                                <span
                                                    onClick={() => inst.status === 'Pendente' && handleOpenPayment(inst)}
                                                    style={{ ...styles.tag(inst.status), cursor: inst.status === 'Pendente' ? 'pointer' : 'default' }}
                                                    title={inst.status === 'Pendente' ? "Clique para registrar pagamento" : ""}
                                                >
                                                    {inst.status}
                                                </span>
                                            </div>
                                            <div style={{ fontSize: "0.8rem", color: styles.subtitle.color }}>
                                                {new Date(inst.dueDate).toLocaleDateString()} • {inst.vendor || inst.costName}
                                                {inst.totalInstallments && inst.totalInstallments > 1 && ` (${inst.installmentNumber}/${inst.totalInstallments})`}
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                            <span style={{ fontWeight: "bold" }}>{formatCurrency(inst.value)}</span>
                                            <div style={{ display: "flex", gap: "0.25rem" }}>
                                                <button style={styles.iconButton} onClick={() => handleEditInstallment(inst)}><Edit size={14} /></button>
                                                <button style={styles.iconButton} onClick={() => onDelete(inst.fixedCostId)}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })
                }
            </div >

            {/* Modal (Simplified structure to match previous functionality) */}
            {
                isModalOpen && (
                    <div style={styles.modalOverlay}>
                        <div style={{ ...styles.modalContent, width: "600px" }}> {/* Wider modal */}
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                                <h3 style={styles.title}>{formData.id ? "Editar Custo Fixo" : "Novo Custo Fixo"}</h3>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: styles.subtitle.color, cursor: "pointer" }}><X size={20} /></button>
                            </div>

                            <p style={{ fontSize: "0.875rem", color: styles.subtitle.color, marginBottom: "1.5rem" }}>
                                {formData.id ? "Edite as informações do custo fixo" : "Cadastre um novo custo fixo do veículo"}
                            </p>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                                <div>
                                    <label style={styles.label}>Veículo</label>
                                    <select style={styles.input} value={formData.vehicleId} onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}>
                                        <option value="">Selecione o veículo</option>
                                        {vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.plate} - {v.model} {v.driverName ? `(${v.driverName})` : ''}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={styles.label}>Tipo de Custo</label>
                                    <select style={styles.input} value={formData.costTypeId} onChange={e => setFormData({ ...formData, costTypeId: e.target.value })}>
                                        <option value="">Selecione o tipo</option>
                                        {costTypes && costTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <label style={styles.label}>Descrição</label>
                                <input
                                    style={styles.input}
                                    placeholder="Ex: Prestação BYD Dolphin"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                                <div>
                                    <label style={styles.label}>Valor (R$)</label>
                                    <input type="number" step="0.01" style={styles.input} placeholder="0.00" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} />
                                </div>
                                <div>
                                    <label style={styles.label}>Mês/Ano</label>
                                    <input type="month" style={styles.input} value={formData.monthYear} onChange={e => setFormData({ ...formData, monthYear: e.target.value })} />
                                </div>
                                <div>
                                    <label style={styles.label}>Data Específica</label>
                                    <input type="date" style={styles.input} value={formData.specificDate} onChange={e => setFormData({ ...formData, specificDate: e.target.value })} />
                                    <span style={{ fontSize: "0.7rem", color: styles.subtitle.color }}>Opcional. Se não informado, assume dia 1.</span>
                                </div>
                            </div>

                            {/* Recurring Section */}
                            <div style={{ marginBottom: "1.5rem", borderTop: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, paddingTop: "1rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                    <RefreshCw size={16} />
                                    <span style={{ fontWeight: 600 }}>Custos Recorrentes</span>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                                    <input
                                        type="checkbox"
                                        id="isRecurring"
                                        checked={formData.isRecurring}
                                        onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                                        style={{ width: "16px", height: "16px" }}
                                    />
                                    <label htmlFor="isRecurring" style={{ fontSize: "0.9rem", cursor: "pointer" }}>Repetir mensalmente</label>
                                </div>
                                <p style={{ fontSize: "0.8rem", color: styles.subtitle.color, marginLeft: "1.5rem", marginBottom: "1rem" }}>
                                    Gera automaticamente múltiplos lançamentos mensais
                                </p>

                                {formData.isRecurring && (
                                    <div style={{ marginLeft: "1.5rem" }}>
                                        <label style={styles.label}>Quantidade de Meses</label>
                                        <input type="number" style={{ ...styles.input, width: "100px" }} value={formData.totalInstallments} onChange={e => setFormData({ ...formData, totalInstallments: e.target.value })} />
                                        <p style={{ fontSize: "0.8rem", color: styles.subtitle.color, marginTop: "0.25rem" }}>Será criado 1 lançamento para cada mês</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={styles.label}>Observação</label>
                                <textarea
                                    style={{ ...styles.input, height: "80px", resize: "none" }}
                                    placeholder="Informações adicionais"
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                                <button onClick={() => setIsModalOpen(false)} style={{ padding: "0.75rem 1.5rem", border: `1px solid ${isDark ? "#475569" : "#ccc"}`, background: "transparent", borderRadius: "0.375rem", cursor: "pointer", color: isDark ? "white" : "black" }}>Cancelar</button>
                                <button
                                    onClick={async () => {
                                        try {
                                            console.log("Tentando salvar payload:", formData);
                                            await onSave(formData);
                                            console.log("Solicitação de salvamento enviada com sucesso.");
                                            setIsModalOpen(false);
                                        } catch (err) {
                                            console.error("ERRO AO SALVAR (Call Stack):", err);
                                            alert("Erro ao salvar! Verifique o console com F12.");
                                        }
                                    }}
                                    style={{ ...styles.primaryButton, padding: "0.75rem 1.5rem", height: "auto" }}
                                >
                                    Salvar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Payment Modal */}
            {
                isPaymentModalOpen && (
                    <div style={styles.modalOverlay}>
                        <div style={{ ...styles.modalContent, width: "400px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                                <h3 style={styles.title}>Registrar Pagamento</h3>
                                <button onClick={() => setIsPaymentModalOpen(false)} style={{ background: "transparent", border: "none" }}><X size={20} color={styles.subtitle.color} /></button>
                            </div>
                            <p style={{ fontSize: "0.875rem", color: styles.subtitle.color, marginBottom: "1.5rem" }}>
                                Informe a data e o valor pago para este custo
                            </p>

                            <div style={{ marginBottom: "1rem" }}>
                                <label style={styles.label}>Data do Pagamento</label>
                                <input
                                    type="date"
                                    style={styles.input}
                                    value={paymentData.date}
                                    onChange={e => setPaymentData({ ...paymentData, date: e.target.value })}
                                />
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={styles.label}>Valor Pago</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    style={styles.input}
                                    value={paymentData.value}
                                    onChange={e => setPaymentData({ ...paymentData, value: e.target.value })}
                                />
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                                <button onClick={() => setIsPaymentModalOpen(false)} style={{ padding: "0.75rem 1.5rem", border: `1px solid ${isDark ? "#475569" : "#ccc"}`, background: "transparent", borderRadius: "0.375rem", cursor: "pointer", color: isDark ? "white" : "black" }}>Cancelar</button>
                                <button
                                    onClick={handleConfirmPayment}
                                    style={{ ...styles.primaryButton, padding: "0.75rem 1.5rem", height: "auto" }}
                                >
                                    Confirmar Pagamento
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Edit Installment Modal */}
            {
                isEditInstallmentModalOpen && (
                    <div style={styles.modalOverlay}>
                        <div style={{ ...styles.modalContent, width: "400px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                                <h3 style={styles.title}>Editar Parcela</h3>
                                <button onClick={() => setIsEditInstallmentModalOpen(false)} style={{ background: "transparent", border: "none" }}><X size={20} color={styles.subtitle.color} /></button>
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <label style={styles.label}>Data de Vencimento</label>
                                <input
                                    type="date"
                                    style={styles.input}
                                    value={editInstallmentData.dueDate}
                                    onChange={e => setEditInstallmentData({ ...editInstallmentData, dueDate: e.target.value })}
                                />
                            </div>

                            <div style={{ marginBottom: "1rem" }}>
                                <label style={styles.label}>Valor (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    style={styles.input}
                                    value={editInstallmentData.value}
                                    onChange={e => setEditInstallmentData({ ...editInstallmentData, value: e.target.value })}
                                />
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={styles.label}>Status</label>
                                <select
                                    style={styles.input}
                                    value={editInstallmentData.status}
                                    onChange={e => setEditInstallmentData({ ...editInstallmentData, status: e.target.value })}
                                >
                                    <option value="Pendente">Pendente</option>
                                    <option value="Pago">Pago</option>
                                </select>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                                <button onClick={() => setIsEditInstallmentModalOpen(false)} style={{ padding: "0.75rem 1.5rem", border: `1px solid ${isDark ? "#475569" : "#ccc"}`, background: "transparent", borderRadius: "0.375rem", cursor: "pointer", color: isDark ? "white" : "black" }}>Cancelar</button>
                                <button
                                    onClick={handleConfirmEditInstallment}
                                    style={{ ...styles.primaryButton, padding: "0.75rem 1.5rem", height: "auto" }}
                                >
                                    Salvar Alterações
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}
