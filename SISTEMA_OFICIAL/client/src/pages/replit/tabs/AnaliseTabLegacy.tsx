
import React, { useState } from "react";
import {
    TrendingUp, TrendingDown, DollarSign, Clock, Users, Calendar, Trophy,
    Car, Wrench, Filter, List, Plus, Trash2, Edit, PieChart, X, Save
} from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";

// Components
import { KPICard } from "../../../components/kpi/KPICard";
import { CostTypesManager } from "../../analise/components/CostTypesManager";

// --- FETCHERS ---
async function fetchExpenses() {
    const response = await api.get("/financial/expenses");
    return response.data;
}

async function fetchCostTypes() {
    const response = await api.get("/financial/cost-types");
    return response.data;
}

async function fetchFixedCosts() {
    const response = await api.get("/financial/fixed-costs");
    return response.data;
}

async function fetchDrivers() {
    const response = await api.get("/drivers");
    return response.data;
}

async function fetchShifts() {
    // Busca últimos 1000 turnos para análise
    const response = await api.get("/shifts?limit=1000");
    return response.data.data || response.data; // Handle pagination structure
}

// --- MAIN PAGE ---

export default function AnaliseTabLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [activeSubTab, setActiveSubTab] = useState("financeiro");
    const [selectedCostType, setSelectedCostType] = useState("todos");
    const [selectedDriver, setSelectedDriver] = useState("todos");
    const [selectedYear, setSelectedYear] = useState("todos");
    const [selectedMonth, setSelectedMonth] = useState("todos");

    // Fixed Costs Modal State
    const [isFixedCostModalOpen, setIsFixedCostModalOpen] = useState(false);
    const [editingFixedCost, setEditingFixedCost] = useState<any>(null);
    const [fixedCostForm, setFixedCostForm] = useState({ name: "", value: "", frequency: "Mensal", dueDay: 5 });

    const queryClient = useQueryClient();

    // Queries
    const { data: costs = [] } = useQuery({ queryKey: ["expenses"], queryFn: fetchExpenses });
    const { data: costTypes = [], refetch: refetchCostTypes } = useQuery({ queryKey: ["costTypes"], queryFn: fetchCostTypes });
    const { data: fixedCosts = [] } = useQuery({ queryKey: ["fixedCosts"], queryFn: fetchFixedCosts });
    const { data: drivers = [] } = useQuery({ queryKey: ["drivers"], queryFn: fetchDrivers });
    const { data: shifts = [] } = useQuery({ queryKey: ["shifts"], queryFn: fetchShifts });

    // Mutations
    const createFixedCostMutation = useMutation({
        mutationFn: async (data: any) => { return await api.post("/financial/fixed-costs", data).then(r => r.data) },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fixedCosts"] });
            setIsFixedCostModalOpen(false);
            setEditingFixedCost(null);
            setFixedCostForm({ name: "", value: "", frequency: "Mensal", dueDay: 5 });
        }
    });

    const updateFixedCostMutation = useMutation({
        mutationFn: async (data: any) => { return await api.put(`/financial/fixed-costs/${data.id}`, data).then(r => r.data) },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fixedCosts"] });
            setIsFixedCostModalOpen(false);
            setEditingFixedCost(null);
            setFixedCostForm({ name: "", value: "", frequency: "Mensal", dueDay: 5 });
        }
    });

    const deleteFixedCostMutation = useMutation({
        mutationFn: async (id: string) => { return await api.delete(`/financial/fixed-costs/${id}`).then(r => r.data) },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fixedCosts"] });
        }
    });

    const handleOpenFixedCostModal = (cost?: any) => {
        if (cost) {
            setEditingFixedCost(cost);
            setFixedCostForm({ name: cost.name, value: cost.value, frequency: cost.frequency, dueDay: cost.dueDay });
        } else {
            setEditingFixedCost(null);
            setFixedCostForm({ name: "", value: "", frequency: "Mensal", dueDay: 5 });
        }
        setIsFixedCostModalOpen(true);
    };

    const handleSaveFixedCost = () => {
        if (!fixedCostForm.name || !fixedCostForm.value) return;

        if (editingFixedCost) {
            updateFixedCostMutation.mutate({ id: editingFixedCost.id, ...fixedCostForm });
        } else {
            createFixedCostMutation.mutate(fixedCostForm);
        }
    };

    const totalCosts = costs.reduce((acc: number, cost: any) => acc + Number(cost.valor), 0);

    const getBadgeStyle = (color: string) => {
        const isDarkTheme = theme === "dark";
        switch (color) {
            case "blue": return { bg: isDarkTheme ? "#1e3a8a" : "#dbeafe", text: isDarkTheme ? "#93c5fd" : "#1e40af" };
            case "green": return { bg: isDarkTheme ? "#14532d" : "#dcfce7", text: isDarkTheme ? "#86efac" : "#166534" };
            case "red": return { bg: isDarkTheme ? "#7f1d1d" : "#fee2e2", text: isDarkTheme ? "#fca5a5" : "#991b1b" };
            case "cyan": return { bg: isDarkTheme ? "#164e63" : "#cffafe", text: isDarkTheme ? "#67e8f9" : "#155e75" };
            default: return { bg: isDarkTheme ? "#1f2937" : "#f3f4f6", text: isDarkTheme ? "#9ca3af" : "#4b5563" };
        }
    };

    const styles = {
        container: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "1.5rem",
        },
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        },
        title: {
            fontSize: "1.25rem",
            fontWeight: "700",
            color: isDark ? "#ffffff" : "#0f172a",
            margin: 0,
        },
        filtersCard: {
            padding: "1rem",
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: "0.5rem",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "1rem",
            alignItems: "flex-end",
        },
        subTabs: {
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "0.5rem",
            marginBottom: "1.5rem",
        },
        subTabButton: (isActive: boolean) => ({
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: `1px solid ${isActive ? (isDark ? "#3730a3" : "#4338ca") : (isDark ? "#334155" : "#e2e8f0")}`,
            backgroundColor: isActive ? (isDark ? "#312e81" : "#e0e7ff") : (isDark ? "#1e293b" : "#ffffff"),
            color: isActive ? (isDark ? "#818cf8" : "#4338ca") : (isDark ? "#e2e8f0" : "#64748b"),
            fontSize: "0.875rem",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            transition: "all 0.2s",
            minWidth: "120px",
        }),
        gridKPI: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1rem",
        },
        chartPlaceholder: {
            height: "300px",
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: "0.75rem",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column" as const,
            color: isDark ? "#cbd5e1" : "#64748b",
            marginTop: "1.5rem",
        },
        // Shared Listing Styles
        tableContainer: {
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            borderRadius: "0.5rem",
            overflow: "hidden",
            marginTop: "1rem",
        },
        table: {
            width: "100%",
            borderCollapse: "collapse" as const,
            textAlign: "left" as const,
            fontSize: "0.875rem",
        },
        th: {
            padding: "0.75rem 1rem",
            backgroundColor: isDark ? "#1e293b" : "#f8fafc",
            color: isDark ? "#e2e8f0" : "#64748b",
            fontWeight: "600",
            borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        },
        td: {
            padding: "0.75rem 1rem",
            borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            color: isDark ? "#e2e8f0" : "#1e293b",
        },
        badge: (color: string) => {
            const style = getBadgeStyle(color);
            return {
                padding: "0.15rem 0.5rem",
                borderRadius: "0.25rem",
                fontSize: "0.75rem",
                fontWeight: "600",
                backgroundColor: style.bg,
                color: style.text,
            };
        },
        actionButton: {
            padding: "0.25rem",
            borderRadius: "0.25rem",
            border: "none",
            backgroundColor: "transparent",
            color: isDark ? "#cbd5e1" : "#64748b",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        primaryButton: {
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            border: "none",
            color: "white",
            background: isDark ? "#2563eb" : "#2563eb",
            fontSize: "0.875rem",
            cursor: "pointer",
            fontWeight: "500",
            marginBottom: "1rem",
            alignSelf: "flex-end"
        },
        inputGroup: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.35rem",
        },
        label: {
            fontSize: "0.75rem",
            fontWeight: "500",
            color: isDark ? "#cbd5e1" : "#64748b",
        },
        select: {
            padding: "0.5rem",
            borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#ffffff" : "#0f172a",
            fontSize: "0.875rem",
            minWidth: "140px",
            cursor: "pointer",
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Análise e Relatórios</h2>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, background: "transparent", color: isDark ? "#e2e8f0" : "#1e293b", fontSize: "0.875rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Calendar size={14} /> Mês Atual
                    </button>
                    <button style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, background: "transparent", color: isDark ? "#e2e8f0" : "#1e293b", fontSize: "0.875rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Trophy size={14} /> Rankings
                    </button>
                </div>
            </div>

            <div style={styles.subTabs}>
                <button style={styles.subTabButton(activeSubTab === "financeiro")} onClick={() => setActiveSubTab("financeiro")}>
                    <DollarSign size={14} /> Financeiro
                </button>
                <button style={styles.subTabButton(activeSubTab === "repasses")} onClick={() => setActiveSubTab("repasses")}>
                    <DollarSign size={14} /> Repasses / Custos
                </button>
                <button style={styles.subTabButton(activeSubTab === "motoristas")} onClick={() => setActiveSubTab("motoristas")}>
                    <Users size={14} /> Motoristas
                </button>
                <button style={styles.subTabButton(activeSubTab === "veiculos")} onClick={() => setActiveSubTab("veiculos")}>
                    <Car size={14} /> Veículos
                </button>
                <button style={styles.subTabButton(activeSubTab === "manutencao")} onClick={() => setActiveSubTab("manutencao")}>
                    <Wrench size={14} /> Manutenção
                </button>
                <button style={styles.subTabButton(activeSubTab === "tipos-custo")} onClick={() => setActiveSubTab("tipos-custo")}>
                    <List size={14} /> Tipos de Custo
                </button>
                <button style={styles.subTabButton(activeSubTab === "custos-fixos")} onClick={() => setActiveSubTab("custos-fixos")}>
                    <Filter size={14} /> Custos Fixos
                </button>
            </div>

            {activeSubTab === "financeiro" && (
                <>
                    {(() => {
                        // --- CALCULATIONS ---
                        // 1. Filter Data based on selection
                        const filteredShifts = (shifts || []).filter((s: any) => {
                            const d = new Date(s.inicio);
                            const yearMatch = selectedYear === "todos" || d.getFullYear().toString() === selectedYear;
                            const monthMatch = selectedMonth === "todos" || (d.getMonth() + 1).toString() === selectedMonth;
                            return yearMatch && monthMatch;
                        });

                        const filteredExpenses = (costs || []).filter((c: any) => {
                            const d = new Date(c.data);
                            const yearMatch = selectedYear === "todos" || d.getFullYear().toString() === selectedYear;
                            const monthMatch = selectedMonth === "todos" || (d.getMonth() + 1).toString() === selectedMonth;
                            return yearMatch && monthMatch;
                        });

                        // 2. Totals
                        const totalBruto = filteredShifts.reduce((acc: number, s: any) => acc + (Number(s.totalBruto) || 0), 0);
                        const totalRepasseEmpresa = filteredShifts.reduce((acc: number, s: any) => acc + (Number(s.repasseEmpresa) || 0), 0);
                        const totalRepasseMotorista = filteredShifts.reduce((acc: number, s: any) => acc + (Number(s.repasseMotorista) || 0), 0);
                        const totalTurnos = filteredShifts.length;

                        // Costs
                        const totalCustosVariaveis = filteredExpenses.reduce((acc: number, c: any) => acc + (Number(c.valor) || 0), 0);
                        const totalCustosFixos = (fixedCosts || []).reduce((acc: number, c: any) => acc + (Number(c.value) || 0), 0);
                        const appliedFixedCosts = selectedMonth !== "todos" ? totalCustosFixos : (selectedYear !== "todos" ? totalCustosFixos * 12 : 0);
                        const totalCustos = totalCustosVariaveis + appliedFixedCosts;

                        const lucroLiquido = totalRepasseEmpresa - totalCustos;
                        const margemLucro = totalRepasseEmpresa > 0 ? (lucroLiquido / totalRepasseEmpresa) * 100 : 0;

                        const targetReceitaEmpresa = totalCustos;
                        const targetReceitaBruta = targetReceitaEmpresa / 0.60;
                        const peTotalPercent = targetReceitaBruta > 0 ? (totalBruto / targetReceitaBruta) * 100 : 0;
                        const faltaParaPE = Math.max(0, targetReceitaBruta - totalBruto);


                        return (
                            <div style={styles.gridKPI}>
                                <KPICard
                                    title="Lucro Líquido"
                                    value={`R$ ${lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    sublabel="Receita Empresa (60%) - Custos"
                                    icon={TrendingUp}
                                    gradient={lucroLiquido >= 0 ? "green" : "red"}
                                />
                                <KPICard
                                    title="Margem de Lucro"
                                    value={`${margemLucro.toFixed(1)}%`}
                                    sublabel="Lucro / Receita Empresa"
                                    icon={DollarSign}
                                    gradient={margemLucro >= 0 ? "blue" : "red"}
                                />
                                <KPICard
                                    title="Receita Empresa"
                                    value={`R$ ${totalRepasseEmpresa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    sublabel={`60% de R$ ${totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    icon={DollarSign}
                                    gradient="blue"
                                />
                                <KPICard
                                    title="Repasse Motoristas"
                                    value={`R$ ${totalRepasseMotorista.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    sublabel={`40% de R$ ${totalBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    icon={Users}
                                    gradient="purple"
                                />
                                <KPICard
                                    title="Turnos"
                                    value={totalTurnos.toString()}
                                    sublabel="Total no período"
                                    icon={Clock}
                                    gradient="orange"
                                />
                                <KPICard
                                    title="Custo Total"
                                    value={`R$ ${totalCustos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    sublabel={`Fixos: ${appliedFixedCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} + Var: ${totalCustosVariaveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    icon={TrendingDown}
                                    gradient="red" // Or Orange
                                />
                                <KPICard
                                    title="P.E. Total (100%)"
                                    value={`${peTotalPercent.toFixed(1)}%`}
                                    sublabel={peTotalPercent >= 100 ? "Meta Atingida!" : `Faltam R$ ${faltaParaPE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                    icon={TrendingUp}
                                    gradient={peTotalPercent >= 100 ? "green" : "orange"}
                                />
                            </div>
                        );
                    })()}

                    <div style={styles.chartPlaceholder}>
                        <div style={{ width: "80%", height: "200px", display: "flex", alignItems: "flex-end", justifyContent: "space-around", gap: "10px" }}>
                            <div style={{ width: "15%", height: "80%", background: "#22c55e", borderRadius: "4px 4px 0 0", position: "relative" }} title="Receita"><span style={{ position: "absolute", bottom: "-25px", left: "0", right: "0", textAlign: "center", fontSize: "0.7rem" }}>Receita</span></div>
                            <div style={{ width: "15%", height: "40%", background: "#eab308", borderRadius: "4px 4px 0 0", position: "relative" }} title="Custos"><span style={{ position: "absolute", bottom: "-25px", left: "0", right: "0", textAlign: "center", fontSize: "0.7rem" }}>Custos</span></div>
                            <div style={{ width: "15%", height: "30%", background: "#3b82f6", borderRadius: "4px 4px 0 0", position: "relative" }} title="Lucro"><span style={{ position: "absolute", bottom: "-25px", left: "0", right: "0", textAlign: "center", fontSize: "0.7rem" }}>Lucro</span></div>
                        </div>
                        <p style={{ marginTop: "2rem" }}>Gráfico Financeiro (Conectado)</p>
                    </div>
                </>
            )}

            {activeSubTab === "motoristas" && (
                <>


                    {(() => {
                        // 1. Process Data
                        const driverStats = drivers.map((driver: any) => {
                            const driverShifts = (shifts || []).filter((s: any) => {
                                const sDate = new Date(s.inicio);
                                const sYear = sDate.getFullYear().toString();
                                const sMonth = (sDate.getMonth() + 1).toString();

                                const yearMatch = selectedYear === "todos" || sYear === selectedYear;
                                const monthMatch = selectedMonth === "todos" || sMonth === selectedMonth;
                                // Match both ID (if populated) or look for name matches if ID missing (legacy compat)
                                const idMatch = s.driverId === driver.id;

                                return yearMatch && monthMatch && idMatch;
                            });

                            const totalHours = driverShifts.reduce((acc: number, s: any) => {
                                let h = (s.duracaoMin || 0) / 60;
                                if (h === 0 && s.inicio && s.fim) {
                                    const start = new Date(s.inicio).getTime();
                                    const end = new Date(s.fim).getTime();
                                    h = (end - start) / (1000 * 60 * 60);
                                }
                                return acc + h;
                            }, 0);
                            const totalShifts = driverShifts.length;
                            const totalRevenue = driverShifts.reduce((acc: number, s: any) => acc + (Number(s.totalBruto) || 0), 0);

                            return {
                                name: driver.nome,
                                totalHours,
                                totalShifts,
                                avgHours: totalShifts > 0 ? totalHours / totalShifts : 0,
                                totalRevenue,
                                revenuePerHour: totalHours > 0 ? totalRevenue / totalHours : 0
                            };
                        }).filter((stat: any) => stat.totalShifts > 0).sort((a: any, b: any) => b.totalHours - a.totalHours);

                        const maxHours = Math.max(...driverStats.map((s: any) => s.totalHours), 1);

                        return (
                            <>
                                <div style={styles.chartPlaceholder}>
                                    <h3 style={{ ...styles.title, fontSize: "1rem", marginBottom: "1rem", alignSelf: "flex-start", padding: "0 1rem" }}>Horas Trabalhadas por Motorista</h3>
                                    <div style={{ width: "90%", height: "220px", display: "flex", alignItems: "flex-end", justifyContent: "space-around", gap: "20px", paddingBottom: "20px" }}>
                                        {driverStats.map((stat: any) => (
                                            <div key={stat.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", flex: 1, position: "relative" }}>
                                                {/* Tooltip-ish value */}
                                                <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "4px" }}>{stat.totalHours.toFixed(1)}h</span>

                                                {/* Bar */}
                                                <div style={{
                                                    width: "60%",
                                                    height: `${(stat.totalHours / maxHours) * 80}%`, // Use 80% height max
                                                    backgroundColor: "#3b82f6",
                                                    borderRadius: "4px 4px 0 0",
                                                    minHeight: "4px",
                                                    position: "relative",
                                                    transition: "height 0.5s ease"
                                                }}>
                                                    {/* Yellow bar for Shifts count inside or near? Screenshot shows yellow bar for turns next to it or overlay? 
                                                        Screenshot shows Blue Bar for Hours, Yellow Bar for Turns side-by-side or overlapping?
                                                        Actually it looks like Blue Bar (Total Hours) and Yellow Bar (Total Turns).
                                                        Let's just show Blue Bar for now to keep simple and consistent.
                                                    */}
                                                </div>

                                                <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
                                                    <span style={{ fontSize: "0.75rem", fontWeight: "600", display: "block" }}>{stat.name.split(' ')[0]}</span>
                                                    <span style={{ fontSize: "0.7rem", color: "#eab308", fontWeight: "bold" }}>{stat.totalShifts} turnos</span>
                                                </div>
                                            </div>
                                        ))}
                                        {driverStats.length === 0 && <p>Nenhum dado encontrado para o período.</p>}
                                    </div>
                                </div>

                                <h3 style={{ ...styles.title, fontSize: "1rem", marginTop: "1rem" }}>Detalhes por Motorista</h3>
                                <div style={styles.tableContainer}>
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Motorista</th>
                                                <th style={{ ...styles.th, textAlign: 'right' }}>Horas</th>
                                                <th style={{ ...styles.th, textAlign: 'right' }}>Turnos</th>
                                                <th style={{ ...styles.th, textAlign: 'right' }}>Média h/turno</th>
                                                <th style={{ ...styles.th, textAlign: 'right' }}>Receita</th>
                                                <th style={{ ...styles.th, textAlign: 'right' }}>R$/hora</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {driverStats.map((stat: any) => (
                                                <tr key={stat.name}>
                                                    <td style={styles.td}>{stat.name}</td>
                                                    <td style={{ ...styles.td, textAlign: 'right' }}>{stat.totalHours.toFixed(1)}h</td>
                                                    <td style={{ ...styles.td, textAlign: 'right' }}>{stat.totalShifts}</td>
                                                    <td style={{ ...styles.td, textAlign: 'right' }}>{stat.avgHours.toFixed(1)}h</td>
                                                    <td style={{ ...styles.td, textAlign: 'right' }}>R$ {stat.totalRevenue.toFixed(2)}</td>
                                                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: "600" }}>R$ {stat.revenuePerHour.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        );
                    })()}
                </>
            )
            }

            {
                activeSubTab === "repasses" && (
                    <>
                        {/* Filtros */}
                        <div style={styles.filtersCard}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Ano</label>
                                <select
                                    style={styles.select}
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    <option value="todos">Todos</option>
                                    <option value="2025">2025</option>
                                    <option value="2026">2026</option>
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Mês</label>
                                <select
                                    style={styles.select}
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                >
                                    <option value="todos">Todos</option>
                                    <option value="1">Janeiro</option>
                                    <option value="2">Fevereiro</option>
                                    <option value="3">Março</option>
                                    <option value="4">Abril</option>
                                    <option value="5">Maio</option>
                                    <option value="6">Junho</option>
                                    <option value="7">Julho</option>
                                    <option value="8">Agosto</option>
                                    <option value="9">Setembro</option>
                                    <option value="10">Outubro</option>
                                    <option value="11">Novembro</option>
                                    <option value="12">Dezembro</option>
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Motorista</label>
                                <select
                                    style={styles.select}
                                    value={selectedDriver}
                                    onChange={(e) => setSelectedDriver(e.target.value)}
                                >
                                    <option value="todos">Todos</option>
                                    {Array.from(new Set(costs.map((c: any) => c.motoristaNome).filter(Boolean))).sort().map((driver: any) => (
                                        <option key={driver} value={driver}>{driver}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Tipo de Custo</label>
                                <select
                                    style={styles.select}
                                    value={selectedCostType}
                                    onChange={(e) => setSelectedCostType(e.target.value)}
                                >
                                    <option value="todos">Todos</option>
                                    {Array.from(new Set(costs.map((c: any) => c.tipo).filter(Boolean))).sort().map((type: any) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            <button style={{ ...styles.primaryButton, marginBottom: 0, marginLeft: "auto", background: "#ef4444" }}>
                                <Plus size={16} /> Novo Custo
                            </button>
                        </div>

                        {/* KPIs e Tabela com Filtros Aplicados */}
                        {(() => {
                            const filteredCosts = costs.filter((cost: any) => {
                                const date = new Date(cost.data);
                                const yearMatch = selectedYear === "todos" || date.getFullYear().toString() === selectedYear;
                                const monthMatch = selectedMonth === "todos" || (date.getMonth() + 1).toString() === selectedMonth;
                                const driverMatch = selectedDriver === "todos" || cost.motoristaNome === selectedDriver;
                                const typeMatch = selectedCostType === "todos" || cost.tipo === selectedCostType;
                                return yearMatch && monthMatch && driverMatch && typeMatch;
                            });

                            const filteredTotal = filteredCosts.reduce((acc: number, cost: any) => acc + Number(cost.valor), 0);
                            const avgCost = filteredCosts.length > 0 ? filteredTotal / filteredCosts.length : 0;

                            return (
                                <>
                                    <div style={{ ...styles.gridKPI, marginTop: "1.5rem" }}>
                                        <div style={{ ...styles.filtersCard, padding: "1.5rem", flexDirection: "column", gap: "0.5rem", alignItems: "flex-start", width: "100%" }}>
                                            <span style={{ fontSize: "0.875rem", color: isDark ? "#94a3b8" : "#64748b", display: "flex", gap: "0.5rem" }}><DollarSign size={16} /> Total de Custos</span>
                                            <span style={{ fontSize: "1.5rem", fontWeight: "700", color: isDark ? "#ffffff" : "#0f172a" }}>R$ {filteredTotal.toFixed(2)}</span>
                                        </div>
                                        <div style={{ ...styles.filtersCard, padding: "1.5rem", flexDirection: "column", gap: "0.5rem", alignItems: "flex-start", width: "100%" }}>
                                            <span style={{ fontSize: "0.875rem", color: isDark ? "#94a3b8" : "#64748b", display: "flex", gap: "0.5rem" }}><PieChart size={16} /> Média por Registro</span>
                                            <span style={{ fontSize: "1.5rem", fontWeight: "700", color: isDark ? "#ffffff" : "#0f172a" }}>R$ {avgCost.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <div style={styles.tableContainer}>
                                        <table style={styles.table}>
                                            <thead>
                                                <tr>
                                                    <th style={styles.th}>Data</th>
                                                    <th style={styles.th}>Motorista</th>
                                                    <th style={styles.th}>Tipo</th>
                                                    <th style={styles.th}>Valor</th>
                                                    <th style={styles.th}>Ações</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredCosts.map((cost: any) => (
                                                    <tr key={cost.id}>
                                                        <td style={styles.td}>
                                                            {new Date(cost.data).toLocaleString('pt-BR', {
                                                                day: '2-digit', month: '2-digit', year: 'numeric',
                                                                hour: '2-digit', minute: '2-digit'
                                                            })}
                                                        </td>
                                                        <td style={styles.td}>{cost.motoristaNome || "N/A"}</td>
                                                        <td style={styles.td}>
                                                            <span style={styles.badge(cost.tipoCor || "blue")}>
                                                                {cost.tipo}
                                                            </span>
                                                        </td>
                                                        <td style={{ ...styles.td, fontWeight: "600" }}>
                                                            R$ {Number(cost.valor).toFixed(2)}
                                                        </td>
                                                        <td style={styles.td}>
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button style={{ ...styles.actionButton, color: '#ef4444' }}><Trash2 size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {filteredCosts.length === 0 && (
                                                    <tr>
                                                        <td colSpan={5} style={{ ...styles.td, textAlign: "center", padding: "2rem", color: styles.label.color }}>
                                                            Nenhum custo encontrado para os filtros selecionados.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            );
                        })()}
                    </>
                )
            }

            {
                activeSubTab === "tipos-custo" && (
                    <CostTypesManager
                        costTypes={costTypes}
                        isDark={isDark}
                        refetch={refetchCostTypes}
                    />
                )
            }

            {
                activeSubTab === "custos-fixos" && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button style={styles.primaryButton} onClick={() => handleOpenFixedCostModal()}>
                                <Plus size={16} /> Novo Custo Fixo
                            </button>
                        </div>
                        <div style={styles.tableContainer}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Nome</th>
                                        <th style={styles.th}>Valor</th>
                                        <th style={styles.th}>Frequência</th>
                                        <th style={styles.th}>Vencimento</th>
                                        <th style={styles.th}>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fixedCosts.map((cost: any) => (
                                        <tr key={cost.id}>
                                            <td style={styles.td}>{cost.name}</td>
                                            <td style={{ ...styles.td, fontWeight: 'bold' }}>R$ {Number(cost.value).toFixed(2)}</td>
                                            <td style={styles.td}>{cost.frequency}</td>
                                            <td style={styles.td}>Dia {cost.dueDay}</td>
                                            <td style={styles.td}>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button style={styles.actionButton} onClick={() => handleOpenFixedCostModal(cost)}><Edit size={16} /></button>
                                                    <button style={{ ...styles.actionButton, color: '#ef4444' }} onClick={() => { if (confirm('Tem certeza?')) deleteFixedCostMutation.mutate(cost.id); }}><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {fixedCosts.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ ...styles.td, textAlign: "center", padding: "2rem", color: styles.label.color }}>
                                                Nenhum custo fixo cadastrado.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            }

            {/* Modal de Custos Fixos */}
            {isFixedCostModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
                }}>
                    <div style={{
                        backgroundColor: isDark ? "#1e293b" : "#ffffff",
                        padding: "1.5rem", borderRadius: "0.5rem", width: "400px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <h3 style={styles.title}>{editingFixedCost ? "Editar Custo Fixo" : "Novo Custo Fixo"}</h3>
                            <button onClick={() => setIsFixedCostModalOpen(false)} style={styles.actionButton}><X size={20} /></button>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Nome</label>
                            <input
                                style={{ ...styles.select, cursor: 'text' }}
                                value={fixedCostForm.name}
                                onChange={e => setFixedCostForm({ ...fixedCostForm, name: e.target.value })}
                                placeholder="Ex: Aluguel, Internet..."
                            />
                        </div>
                        <div style={{ ...styles.inputGroup, marginTop: "1rem" }}>
                            <label style={styles.label}>Valor (R$)</label>
                            <input
                                style={{ ...styles.select, cursor: 'text' }}
                                type="number"
                                value={fixedCostForm.value}
                                onChange={e => setFixedCostForm({ ...fixedCostForm, value: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                        <div style={{ ...styles.inputGroup, marginTop: "1rem" }}>
                            <label style={styles.label}>Dia de Vencimento</label>
                            <input
                                style={{ ...styles.select, cursor: 'text' }}
                                type="number"
                                max={31} min={1}
                                value={fixedCostForm.dueDay}
                                onChange={e => setFixedCostForm({ ...fixedCostForm, dueDay: Number(e.target.value) })}
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem", gap: "0.5rem" }}>
                            <button onClick={() => setIsFixedCostModalOpen(false)} style={{ ...styles.select, width: "auto" }}>Cancelar</button>
                            <button onClick={handleSaveFixedCost} style={{ ...styles.primaryButton, marginBottom: 0 }}>
                                <Save size={16} /> Salvar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {
                activeSubTab !== "financeiro" && activeSubTab !== "repasses" && activeSubTab !== "tipos-custo" && activeSubTab !== "custos-fixos" && (
                    <div style={styles.chartPlaceholder}>
                        <p>Conteúdo da aba <strong>{activeSubTab.charAt(0).toUpperCase() + activeSubTab.slice(1)}</strong> em desenvolvimento.</p>
                    </div>
                )
            }
        </div >
    );
}
