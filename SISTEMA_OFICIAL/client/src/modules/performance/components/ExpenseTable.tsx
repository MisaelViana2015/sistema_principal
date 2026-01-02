import React, { useState } from "react";
import { DollarSign, PieChart, Plus, Trash2, Edit } from "lucide-react";

interface ExpenseTableProps {
    costs: any[];
    costTypes: any[];
    isDark: boolean;
    selectedYear: string;
    setSelectedYear: (value: string) => void;
    selectedMonth: string;
    setSelectedMonth: (value: string) => void;
    selectedDriver: string;
    setSelectedDriver: (value: string) => void;
    selectedCostType: string;
    setSelectedCostType: (value: string) => void;
    onAddExpense: () => void;
    onDeleteExpense: (id: string) => void;
}

export function ExpenseTable({
    costs,
    costTypes,
    isDark,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    selectedDriver,
    setSelectedDriver,
    selectedCostType,
    setSelectedCostType,
    onAddExpense,
    onDeleteExpense
}: ExpenseTableProps) {
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    const styles = {
        filtersCard: {
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: "0.5rem",
            padding: "1rem",
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "1rem",
            marginBottom: "1rem",
            alignItems: "flex-end",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
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
        primaryButton: {
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            border: "none",
            color: "white",
            background: "#ef4444",
            fontSize: "0.875rem",
            cursor: "pointer",
            fontWeight: "500",
            marginBottom: "0",
            marginLeft: "auto"
        },
        gridKPI: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
        },
        tableContainer: {
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: "0.5rem",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            overflow: "hidden",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
            marginTop: "1rem"
        },
        table: {
            width: "100%",
            borderCollapse: "collapse" as const,
            fontSize: "0.875rem",
        },
        th: {
            textAlign: "left" as const,
            padding: "0.75rem 1rem",
            borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            color: isDark ? "#94a3b8" : "#64748b",
            fontWeight: "500",
            fontSize: "0.75rem",
            textTransform: "uppercase" as const,
            letterSpacing: "0.05em",
        },
        td: {
            padding: "0.75rem 1rem",
            borderBottom: `1px solid ${isDark ? "#334155" : "#f1f5f9"}`,
            color: isDark ? "#e2e8f0" : "#334155",
        },
        badge: (color: string) => ({
            display: "inline-flex",
            padding: "0.25rem 0.6rem",
            borderRadius: "9999px",
            fontSize: "0.7rem",
            fontWeight: "600",
            backgroundColor: color === "green" ? (isDark ? "#052e16" : "#dcfce7") :
                color === "red" ? (isDark ? "#450a0a" : "#fee2e2") :
                    color === "blue" ? (isDark ? "#172554" : "#dbeafe") :
                        (isDark ? "#4b5563" : "#f3f4f6"),
            color: color === "green" ? (isDark ? "#4ade80" : "#166534") :
                color === "red" ? (isDark ? "#f87171" : "#991b1b") :
                    color === "blue" ? (isDark ? "#60a5fa" : "#1e40af") :
                        (isDark ? "#d1d5db" : "#374151"),
        }),
        actionButton: {
            padding: "0.25rem",
            borderRadius: "0.25rem",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            color: isDark ? "#94a3b8" : "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }
    };

    const filteredCosts = costs.filter((cost: any) => {
        const date = new Date(cost.data);
        const yearMatch = selectedYear === "todos" || date.getFullYear().toString() === selectedYear;
        const monthMatch = selectedMonth === "todos" || (date.getMonth() + 1).toString() === selectedMonth;
        const driverMatch = selectedDriver === "todos" || cost.motoristaNome === selectedDriver;
        const typeMatch = selectedCostType === "todos" || cost.tipo === selectedCostType;
        return yearMatch && monthMatch && driverMatch && typeMatch;
    });

    const filteredTotal = filteredCosts.reduce((acc: number, cost: any) => {
        const valorEmpresa = cost.isSplitCost ? Number(cost.valor) * 0.5 : Number(cost.valor);
        return acc + valorEmpresa;
    }, 0);
    const avgCost = filteredCosts.length > 0 ? filteredTotal / filteredCosts.length : 0;

    return (
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
                        {costTypes.map((type: any) => (
                            <option key={type.id} value={type.name}>{type.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    style={styles.primaryButton}
                    onClick={onAddExpense}
                >
                    <Plus size={16} /> Novo Custo
                </button>
            </div>

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
                                    R$ {(cost.isSplitCost ? Number(cost.valor) * 0.5 : Number(cost.valor)).toFixed(2)}
                                    {cost.isSplitCost && <span style={{ fontSize: '0.7rem', color: '#f59e0b', marginLeft: '4px' }}>(50%)</span>}
                                </td>
                                <td style={styles.td}>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button style={{ ...styles.actionButton, color: '#ef4444' }} onClick={() => setDeleteConfirmId(cost.id)}><Trash2 size={16} /></button>
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

            {deleteConfirmId && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000 }}>
                    <div style={{ background: isDark ? '#1e293b' : '#fff', padding: '1.5rem', borderRadius: '0.5rem', maxWidth: '400px', textAlign: 'center', border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                        <p style={{ marginBottom: '1rem', color: isDark ? '#fff' : '#000', fontWeight: '500' }}>Tem certeza que deseja excluir este custo?</p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button onClick={() => setDeleteConfirmId(null)} style={{ padding: '0.5rem 1rem', borderRadius: '0.25rem', border: `1px solid ${isDark ? '#4b5563' : '#9ca3af'}`, background: 'transparent', color: isDark ? '#d1d5db' : '#374151', cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={async () => {
                                onDeleteExpense(deleteConfirmId);
                                setDeleteConfirmId(null);
                            }} style={{ padding: '0.5rem 1rem', borderRadius: '0.25rem', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: '500' }}>Excluir</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
