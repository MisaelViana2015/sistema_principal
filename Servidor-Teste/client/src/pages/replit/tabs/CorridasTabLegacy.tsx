

import React, { useState } from "react";
import { Filter, Trash2, Calendar, DollarSign, Loader2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";

// Helper functions
async function fetchRides() {
    const response = await fetch("/api/rides");
    if (!response.ok) throw new Error("Falha ao buscar corridas");
    return response.json();
}

async function fetchDrivers() {
    const response = await fetch("/api/drivers");
    if (!response.ok) throw new Error("Falha ao buscar motoristas");
    return response.json();
}

export default function CorridasTabLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [periodType, setPeriodType] = useState("semana");
    const [selectedDriver, setSelectedDriver] = useState("todos");
    const [selectedType, setSelectedType] = useState("todos");
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const { data: rides, isLoading, error } = useQuery({
        queryKey: ["rides"],
        queryFn: fetchRides
    });

    const { data: drivers } = useQuery({
        queryKey: ["drivers"],
        queryFn: fetchDrivers
    });

    const displayRides = (rides || []).filter((ride: any) => {
        if (selectedDriver !== "todos" && ride.motorista !== selectedDriver) return false;
        if (selectedType !== "todos" && ride.tipo !== selectedType) return false;

        // Period Logic
        const rideDate = new Date(ride.hora);
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (periodType === "dia") {
            if (rideDate < startOfDay) return false;
        } else if (periodType === "semana") {
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (rideDate < lastWeek) return false;
        } else if (periodType === "mes") {
            // Fix: Use the selected month from input
            const [year, month] = selectedMonth.split('-').map(Number);
            if (rideDate.getFullYear() !== year || rideDate.getMonth() !== month - 1) return false;
        } else if (periodType === "ano") {
            const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            if (rideDate < lastYear) return false;
        }

        return true;
    });

    const totalValue = displayRides.reduce((acc: number, ride: any) => acc + Number(ride.valor), 0);

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
            color: isDark ? "#e2e8f0" : "#64748b", // Lighter text for dark mode labels
        },
        select: {
            padding: "0.5rem",
            borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
            backgroundColor: isDark ? "#1e293b" : "#ffffff", // Slightly lighter background than page for inputs
            color: isDark ? "#ffffff" : "#0f172a",
            fontSize: "0.875rem",
            minWidth: "140px",
            outline: "none",
        },
        dateInput: {
            padding: "0.5rem",
            borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            color: isDark ? "#ffffff" : "#0f172a",
            fontSize: "0.875rem",
            outline: "none",
            colorScheme: isDark ? "dark" : "light", // Fixes native calendar icon color
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
            backgroundColor: isDark ? "#1e293b" : "#ffffff", // Explicit bg for table container
        },
        table: {
            width: "100%",
            borderCollapse: "collapse" as const,
            textAlign: "left" as const,
            fontSize: "0.875rem",
        },
        th: {
            padding: "0.75rem 1rem",
            backgroundColor: isDark ? "#0f172a" : "#f8fafc", // Darker header for contrast
            color: isDark ? "#e2e8f0" : "#64748b", // Lighter text
            fontWeight: "600",
            borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        },
        td: {
            padding: "0.75rem 1rem",
            borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            color: isDark ? "#cbd5e1" : "#1e293b", // Slightly softer white
        },
        typeBadge: (type: string) => ({
            padding: "0.15rem 0.5rem",
            borderRadius: "99px",
            fontSize: "0.7rem",
            fontWeight: "600",
            textTransform: "uppercase" as const,
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
        },
        loadingContainer: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "2rem",
            color: isDark ? "#94a3b8" : "#64748b",
        }
    };

    if (isLoading) {
        return (
            <div style={styles.loadingContainer}>
                <Loader2 className="animate-spin" size={24} />
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.loadingContainer}>
                <p>Erro ao carregar corridas</p>
            </div>
        );
    }

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
                        <input
                            type="month"
                            style={styles.dateInput}
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        />
                    </div>
                )}

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Motorista</label>
                    <select
                        style={styles.select}
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        {drivers?.map((d: any) => (
                            <option key={d.id} value={d.nome}>{d.nome}</option>
                        ))}
                    </select>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Tipo</label>
                    <select
                        style={styles.select}
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
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
                            <th style={styles.th}>Valor</th>
                            <th style={styles.th}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayRides.map((ride: any) => (
                            <tr key={ride.id}>
                                <td style={styles.td}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <Calendar size={14} opacity={0.5} />
                                        {new Date(ride.hora).toLocaleString("pt-BR")}
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    {ride.motorista || "Não identificado"}
                                </td>
                                <td style={styles.td}>
                                    <span style={styles.typeBadge(ride.tipo)}>
                                        {ride.tipo.toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ ...styles.td, fontWeight: "600" }}>
                                    R$ {Number(ride.valor).toFixed(2)}
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
                <p>Mostrando {displayRides.length} registros</p>
            </div>
        </div>
    );
}
