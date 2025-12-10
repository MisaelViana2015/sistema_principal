
import React, { useState } from "react";
import { Filter, Trash2, Calendar, DollarSign, MapPin } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

const MOCK_RIDES = [
    { id: "1", data: "09/12/2025 10:30", motorista: "João Silva", origem: "Centro", destino: "Aeroporto", valor: 45.50, tipo: "app" },
    { id: "2", data: "09/12/2025 11:15", motorista: "João Silva", origem: "Aeroporto", destino: "Hotel Plaza", valor: 30.00, tipo: "app" },
    { id: "3", data: "08/12/2025 14:20", motorista: "Maria Oliveira", origem: "Shopping", destino: "Bairro Sul", valor: 25.00, tipo: "particular" },
    { id: "4", data: "08/12/2025 15:45", motorista: "Maria Oliveira", origem: "Bairro Sul", destino: "Centro", valor: 22.50, tipo: "particular" },
    { id: "5", data: "07/12/2025 09:00", motorista: "Carlos Santos", origem: "Residencial A", destino: "Escola B", valor: 15.00, tipo: "app" },
];

export default function CorridasTabLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [periodType, setPeriodType] = useState("semana");
    const [selectedDocs, setSelectedDocs] = useState("todos");

    const totalValue = MOCK_RIDES.reduce((acc, ride) => acc + ride.valor, 0);

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
        inputGroup: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.35rem",
        },
        label: {
            fontSize: "0.75rem",
            fontWeight: "500",
            color: isDark ? "#94a3b8" : "#64748b",
        },
        select: {
            padding: "0.5rem",
            borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#ffffff" : "#0f172a",
            fontSize: "0.875rem",
            minWidth: "140px",
        },
        dateInput: {
            padding: "0.5rem",
            borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#ffffff" : "#0f172a",
            fontSize: "0.875rem",
        },
        totalCard: {
            padding: "1rem",
            backgroundColor: isDark ? "rgba(16, 185, 129, 0.1)" : "#d1fae5",
            border: `1px solid ${isDark ? "rgba(16, 185, 129, 0.2)" : "#6ee7b7"}`,
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        },
        totalLabel: {
            fontWeight: "600",
            color: isDark ? "#34d399" : "#059669",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        },
        totalValue: {
            fontSize: "1.25rem",
            fontWeight: "700",
            color: isDark ? "#34d399" : "#059669",
        },
        tableContainer: {
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            borderRadius: "0.5rem",
            overflow: "hidden",
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
            color: isDark ? "#94a3b8" : "#64748b",
            fontWeight: "600",
            borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        },
        td: {
            padding: "0.75rem 1rem",
            borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            color: isDark ? "#e2e8f0" : "#1e293b",
        },
        typeBadge: (type: string) => ({
            padding: "0.15rem 0.5rem",
            borderRadius: "99px",
            fontSize: "0.7rem",
            fontWeight: "600",
            backgroundColor: type === "app" ? (isDark ? "#1e3a8a" : "#dbeafe") : (isDark ? "#14532d" : "#dcfce7"),
            color: type === "app" ? (isDark ? "#93c5fd" : "#1e40af") : (isDark ? "#86efac" : "#166534"),
        }),
        actionButton: {
            padding: "0.25rem",
            borderRadius: "0.25rem",
            border: "none",
            backgroundColor: "transparent",
            color: "#ef4444",
            cursor: "pointer",
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Histórico de Corridas</h2>
                <button
                    style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "1px solid #ef4444",
                        color: "#ef4444", background: "transparent", fontSize: "0.875rem", cursor: "pointer"
                    }}
                >
                    <Trash2 size={14} />
                    Limpar Órfãs
                </button>
            </div>

            {/* Filtros */}
            <div style={styles.filtersCard}>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Período</label>
                    <select
                        style={styles.select}
                        value={periodType}
                        onChange={(e) => setPeriodType(e.target.value)}
                    >
                        <option value="dia">Dia</option>
                        <option value="semana">Semana</option>
                        <option value="mes">Mês</option>
                        <option value="ano">Ano</option>
                        <option value="total">Total</option>
                    </select>
                </div>

                {periodType === "mes" && (
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Mês</label>
                        <input type="month" style={styles.dateInput} defaultValue="2025-12" />
                    </div>
                )}

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Motorista</label>
                    <select style={styles.select}>
                        <option value="todos">Todos</option>
                        <option value="joao">João Silva</option>
                        <option value="maria">Maria Oliveira</option>
                    </select>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Tipo</label>
                    <select style={styles.select}>
                        <option value="todos">Todos</option>
                        <option value="app">App</option>
                        <option value="particular">Particular</option>
                    </select>
                </div>
            </div>

            {/* Totalizador */}
            <div style={styles.totalCard}>
                <span style={styles.totalLabel}>
                    <DollarSign size={20} />
                    Total no Período
                </span>
                <span style={styles.totalValue}>
                    R$ {totalValue.toFixed(2)}
                </span>
            </div>

            {/* Tabela */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Data/Hora</th>
                            <th style={styles.th}>Motorista</th>
                            <th style={styles.th}>Tipo</th>
                            <th style={styles.th}>Trajeto</th>
                            <th style={styles.th}>Valor</th>
                            <th style={styles.th}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_RIDES.map((ride) => (
                            <tr key={ride.id}>
                                <td style={styles.td}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <Calendar size={14} opacity={0.5} />
                                        {ride.data}
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    {ride.motorista}
                                </td>
                                <td style={styles.td}>
                                    <span style={styles.typeBadge(ride.tipo)}>
                                        {ride.tipo.toUpperCase()}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem", fontSize: "0.8rem" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }}></span>
                                            {ride.origem}
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444" }}></span>
                                            {ride.destino}
                                        </div>
                                    </div>
                                </td>
                                <td style={{ ...styles.td, fontWeight: "600" }}>
                                    R$ {ride.valor.toFixed(2)}
                                </td>
                                <td style={styles.td}>
                                    <button style={styles.actionButton} title="Excluir">
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div style={{ textAlign: "center", padding: "1rem", opacity: 0.5 }}>
                <p>Mostrando {MOCK_RIDES.length} registros (Mock)</p>
            </div>
        </div>
    );
}
