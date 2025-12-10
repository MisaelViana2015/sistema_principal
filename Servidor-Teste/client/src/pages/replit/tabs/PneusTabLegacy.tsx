
import React, { useState } from "react";
import { Filter, Trash2, Plus, ArrowUp, ArrowDown, CircleDot } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

const MOCK_PNEUS = [
    { id: "1", veiculo: "ABC-1234", marca: "Michelin", modelo: "Primacy 4", dimensao: "205/55 R16", data: "01/12/2025", kmInstalacao: 150000, posicao: "Dianteiro Esq", estado: "Novo" },
    { id: "2", veiculo: "ABC-1234", marca: "Michelin", modelo: "Primacy 4", dimensao: "205/55 R16", data: "01/12/2025", kmInstalacao: 150000, posicao: "Dianteiro Dir", estado: "Novo" },
    { id: "3", veiculo: "XYZ-5678", marca: "Pirelli", modelo: "Cinturato P7", dimensao: "195/55 R15", data: "15/11/2025", kmInstalacao: 118000, posicao: "Traseiro Esq", estado: "Meia Vida" },
];

export default function PneusTabLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const getBadgeStyle = (estado: string) => {
        const isNovo = estado === "Novo";
        if (isDark) {
            return {
                bg: isNovo ? "rgba(34, 197, 94, 0.2)" : "rgba(234, 179, 8, 0.2)",
                text: isNovo ? "#4ade80" : "#facc15"
            };
        } else {
            return {
                bg: isNovo ? "#dcfce7" : "#fef9c3",
                text: isNovo ? "#166534" : "#854d0e"
            };
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
            flexDirection: "column" as const,
            gap: "1rem",
        },
        filtersHeader: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.5rem",
        },
        filtersGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
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
        badge: (estado: string) => {
            const style = getBadgeStyle(estado);
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
            color: "#ef4444",
            cursor: "pointer",
        },
        sortButton: {
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.375rem 0.75rem",
            borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            backgroundColor: "transparent",
            color: isDark ? "#94a3b8" : "#64748b",
            fontSize: "0.875rem",
            cursor: "pointer",
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Controle de Pneus</h2>
                <button
                    style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none",
                        color: "white", background: isDark ? "#ea580c" : "#c2410c", fontSize: "0.875rem", cursor: "pointer", fontWeight: "500"
                    }}
                >
                    <Plus size={16} />
                    Novo Pneu
                </button>
            </div>

            {/* Filtros */}
            <div style={styles.filtersCard}>
                <div style={styles.filtersHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: "500" }}>
                        <Filter size={16} opacity={0.5} />
                        Filtros
                    </div>
                    <button
                        style={styles.sortButton}
                        onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                    >
                        {sortOrder === "desc" ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                        {sortOrder === "desc" ? "Mais Recentes" : "Mais Antigas"}
                    </button>
                </div>

                <div style={styles.filtersGrid}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Veículo</label>
                        <select style={styles.select}>
                            <option value="todos">Todos os Veículos</option>
                            <option value="abc">ABC-1234 - Fiat Uno</option>
                            <option value="xyz">XYZ-5678 - VW Gol</option>
                        </select>
                    </div>
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
                </div>
            </div>

            {/* Tabela */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Data Inst.</th>
                            <th style={styles.th}>Veículo</th>
                            <th style={styles.th}>Posição</th>
                            <th style={styles.th}>Marca/Modelo</th>
                            <th style={styles.th}>Estado</th>
                            <th style={styles.th}>KM Inst.</th>
                            <th style={styles.th}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {MOCK_PNEUS.map((p) => (
                            <tr key={p.id}>
                                <td style={styles.td}>{p.data}</td>
                                <td style={styles.td}>{p.veiculo}</td>
                                <td style={styles.td}>{p.posicao}</td>
                                <td style={styles.td}>
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <span style={{ fontWeight: 500 }}>{p.marca} {p.modelo}</span>
                                        <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>{p.dimensao}</span>
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <span style={styles.badge(p.estado)}>
                                        {p.estado}
                                    </span>
                                </td>
                                <td style={styles.td}>{p.kmInstalacao} km</td>
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
        </div>
    );
}
