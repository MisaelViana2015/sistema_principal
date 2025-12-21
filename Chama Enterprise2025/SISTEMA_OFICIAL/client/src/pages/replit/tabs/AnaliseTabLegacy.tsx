
import React, { useState } from "react";
import {
    TrendingUp, TrendingDown, DollarSign, Clock, Users, Calendar, Trophy,
    Car, Wrench, Filter, List, Plus, Trash2, Edit, PieChart
} from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";
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

// --- MAIN PAGE ---

export default function AnaliseTabLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [activeSubTab, setActiveSubTab] = useState("financeiro");
    const [selectedCostType, setSelectedCostType] = useState("todos");
    const [selectedDriver, setSelectedDriver] = useState("todos");

    // Queries
    const { data: costs = [] } = useQuery({ queryKey: ["expenses"], queryFn: fetchExpenses });
    const { data: costTypes = [], refetch: refetchCostTypes } = useQuery({ queryKey: ["costTypes"], queryFn: fetchCostTypes });
    const { data: fixedCosts = [] } = useQuery({ queryKey: ["fixedCosts"], queryFn: fetchFixedCosts });
    const { data: drivers = [] } = useQuery({ queryKey: ["drivers"], queryFn: fetchDrivers });

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
                    <div style={styles.gridKPI}>
                        <KPICard
                            title="Lucro Líquido"
                            value="R$ 12.450,00"
                            sublabel="Receita Empresa (60%) - Custos"
                            icon={TrendingUp}
                            gradient="green"
                        />
                        <KPICard
                            title="Margem de Lucro"
                            value="32.5%"
                            sublabel="Lucro / Receita Empresa"
                            icon={DollarSign}
                            gradient="blue"
                        />
                        <KPICard
                            title="Receita Empresa"
                            value="R$ 38.400,00"
                            sublabel="60% de R$ 64.000,00"
                            icon={DollarSign}
                            gradient="blue"
                        />
                        <KPICard
                            title="Repasse Motoristas"
                            value="R$ 25.600,00"
                            sublabel="40% de R$ 64.000,00"
                            icon={Users}
                            gradient="purple"
                        />
                        <KPICard
                            title="Turnos"
                            value="142"
                            sublabel="Total no período"
                            icon={Clock}
                            gradient="orange"
                        />
                    </div>

                    <div style={styles.chartPlaceholder}>
                        <div style={{ width: "80%", height: "200px", display: "flex", alignItems: "flex-end", justifyContent: "space-around", gap: "10px" }}>
                            {/* Mock Chart Bars */}
                            <div style={{ width: "15%", height: "90%", background: "#22c55e", borderRadius: "4px 4px 0 0", position: "relative" }} title="Receita Bruta"><span style={{ position: "absolute", bottom: "-25px", left: "0", right: "0", textAlign: "center", fontSize: "0.7rem" }}>Bruto</span></div>
                            <div style={{ width: "15%", height: "50%", background: "#eab308", borderRadius: "4px 4px 0 0", position: "relative" }} title="Custos"><span style={{ position: "absolute", bottom: "-25px", left: "0", right: "0", textAlign: "center", fontSize: "0.7rem" }}>Custos</span></div>
                            <div style={{ width: "15%", height: "20%", background: "#22c55e", borderRadius: "4px 4px 0 0", position: "relative" }} title="Lucro"><span style={{ position: "absolute", bottom: "-25px", left: "0", right: "0", textAlign: "center", fontSize: "0.7rem" }}>Lucro</span></div>
                            <div style={{ width: "15%", height: "60%", background: "#3b82f6", borderRadius: "4px 4px 0 0", position: "relative" }} title="Empresa"><span style={{ position: "absolute", bottom: "-25px", left: "0", right: "0", textAlign: "center", fontSize: "0.7rem" }}>Empresa</span></div>
                            <div style={{ width: "15%", height: "40%", background: "#a855f7", borderRadius: "4px 4px 0 0", position: "relative" }} title="Motoristas"><span style={{ position: "absolute", bottom: "-25px", left: "0", right: "0", textAlign: "center", fontSize: "0.7rem" }}>Motoristas</span></div>
                        </div>
                        <p style={{ marginTop: "2rem" }}>Gráfico de Análise Financeira (Mock Visual)</p>
                    </div>
                </>
            )}

            {activeSubTab === "repasses" && (
                <>
                    {/* Filtros */}
                    <div style={styles.filtersCard}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Ano</label>
                            <select style={styles.select}>
                                <option value="todos">Todos</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Mês</label>
                            <select style={styles.select}>
                                <option value="todos">Todos</option>
                                <option value="12">Dezembro</option>
                                <option value="11">Novembro</option>
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
                                <option value="joao">João Silva</option>
                                <option value="maria">Maria Oliveira</option>
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
                                <option value="combustivel">Combustível</option>
                                <option value="manutencao">Manutenção</option>
                            </select>
                        </div>
                        <button style={{ ...styles.primaryButton, marginBottom: 0, marginLeft: "auto", background: "#ef4444" }}>
                            <Plus size={16} /> Novo Custo
                        </button>
                    </div>

                    {/* KPIs */}
                    <div style={{ ...styles.gridKPI, marginTop: "1.5rem" }}>
                        <div style={{ ...styles.filtersCard, padding: "1.5rem", flexDirection: "column", gap: "0.5rem", alignItems: "flex-start", width: "100%" }}>
                            <span style={{ fontSize: "0.875rem", color: isDark ? "#94a3b8" : "#64748b", display: "flex", gap: "0.5rem" }}><DollarSign size={16} /> Total de Custos</span>
                            <span style={{ fontSize: "1.5rem", fontWeight: "700", color: isDark ? "#ffffff" : "#0f172a" }}>R$ {totalCosts.toFixed(2)}</span>
                        </div>
                        <div style={{ ...styles.filtersCard, padding: "1.5rem", flexDirection: "column", gap: "0.5rem", alignItems: "flex-start", width: "100%" }}>
                            <span style={{ fontSize: "0.875rem", color: isDark ? "#94a3b8" : "#64748b", display: "flex", gap: "0.5rem" }}><PieChart size={16} /> Média por Registro</span>
                            <span style={{ fontSize: "1.5rem", fontWeight: "700", color: isDark ? "#ffffff" : "#0f172a" }}>R$ {(costs.length > 0 ? totalCosts / costs.length : 0).toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Tabela */}
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
                                {costs.map((cost: any) => (
                                    <tr key={cost.id}>
                                        <td style={styles.td}>{new Date(cost.data).toLocaleDateString("pt-BR")}</td>
                                        <td style={styles.td}>{cost.motorista || "N/A"}</td>
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
                                {costs.length === 0 && (
                                    <tr>
                                        <td colSpan={5} style={{ ...styles.td, textAlign: "center", padding: "2rem", color: styles.label.color }}>
                                            Nenhum custo registrado no período.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeSubTab === "tipos-custo" && (
                <CostTypesManager
                    costTypes={costTypes}
                    isDark={isDark}
                    refetch={refetchCostTypes}
                />
            )}

            {activeSubTab === "custos-fixos" && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                        <button style={styles.primaryButton}>
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
                                                <button style={styles.actionButton}><Edit size={16} /></button>
                                                <button style={{ ...styles.actionButton, color: '#ef4444' }}><Trash2 size={16} /></button>
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
            )}

            {activeSubTab !== "financeiro" && activeSubTab !== "repasses" && activeSubTab !== "tipos-custo" && activeSubTab !== "custos-fixos" && (
                <div style={styles.chartPlaceholder}>
                    <p>Conteúdo da aba <strong>{activeSubTab.charAt(0).toUpperCase() + activeSubTab.slice(1)}</strong> em desenvolvimento.</p>
                </div>
            )}
        </div>
    );
}
