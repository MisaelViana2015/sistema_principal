
import React, { useState } from "react";
import { Filter, ChevronDown, ChevronUp, AlertTriangle, Loader2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";

// Helper function to fetch shifts
async function fetchShifts() {
    const response = await fetch("/api/shifts");
    if (!response.ok) {
        throw new Error("Falha ao buscar turnos");
    }
    return response.json();
}

export default function TurnosTabLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Estados de Filtro
    const [selectedDriver, setSelectedDriver] = useState("todos");
    const [selectedPeriod, setSelectedPeriod] = useState("semana");

    // Fetch data using React Query
    const { data: shifts, isLoading, error } = useQuery({
        queryKey: ["shifts"],
        queryFn: fetchShifts
    });

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
        filtersContainer: {
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "1rem",
            padding: "1rem",
            backgroundColor: isDark ? "#1e293b" : "#f8fafc",
            borderRadius: "0.5rem",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
        },
        selectGroup: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.25rem",
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
            minWidth: "150px",
        },
        listContainer: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.75rem",
        },
        card: {
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            borderRadius: "0.5rem",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "all 0.2s",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        },
        cardMainInfo: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.25rem",
        },
        cardTitle: {
            fontWeight: "600",
            fontSize: "1rem",
            color: isDark ? "#ffffff" : "#0f172a",
        },
        cardSubtitle: {
            fontSize: "0.875rem",
            color: isDark ? "#94a3b8" : "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        },
        badge: (status: string) => ({
            padding: "0.25rem 0.75rem",
            borderRadius: "9999px",
            fontSize: "0.75rem",
            fontWeight: "600",
            backgroundColor: status === "em_andamento"
                ? (isDark ? "rgba(34, 197, 94, 0.2)" : "#dcfce7") // green
                : (isDark ? "rgba(100, 116, 139, 0.2)" : "#f1f5f9"), // gray
            color: status === "em_andamento"
                ? (isDark ? "#4ade80" : "#166534")
                : (isDark ? "#94a3b8" : "#475569"),
        }),
        money: {
            fontWeight: "600",
            color: isDark ? "#4ade80" : "#16a34a",
        },
        alertBox: {
            marginTop: "0.5rem",
            padding: "0.5rem",
            backgroundColor: isDark ? "rgba(239, 68, 68, 0.1)" : "#fef2f2",
            border: `1px solid ${isDark ? "rgba(239, 68, 68, 0.2)" : "#fecaca"}`,
            borderRadius: "0.375rem",
            color: isDark ? "#fca5a5" : "#991b1b",
            fontSize: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
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
                <p>Erro ao carregar turnos</p>
            </div>
        );
    }

    // Process data to match previous mock structure if needed logic isn't in backend
    // Assuming backend returns { id, motorista, veiculo, inicio, fim, status, kmRodado, receita }
    const displayShifts = shifts || [];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Gestão de Turnos</h2>
            </div>

            {/* Filtros */}
            <div style={styles.filtersContainer}>
                <div style={styles.selectGroup}>
                    <label style={styles.label}>Período</label>
                    <select
                        style={styles.select}
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                        <option value="hoje">Hoje</option>
                        <option value="semana">Últimos 7 dias</option>
                        <option value="mes">Último Mês</option>
                        <option value="ano">Último Ano</option>
                        <option value="todos">Todos</option>
                    </select>
                </div>

                <div style={styles.selectGroup}>
                    <label style={styles.label}>Motorista</label>
                    <select
                        style={styles.select}
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                    >
                        <option value="todos">Todos os Motoristas</option>
                        {/* Populate explicitly if we have drivers list, otherwise static for now */}
                        <option value="joao">João Silva</option>
                        <option value="maria">Maria Oliveira</option>
                    </select>
                </div>

                <div style={styles.selectGroup}>
                    <label style={styles.label}>Veículo</label>
                    <select style={styles.select}>
                        <option value="todos">Todos os Veículos</option>
                        <option value="abc">ABC-1234</option>
                    </select>
                </div>

                <div style={styles.selectGroup}>
                    <label style={styles.label}>Status</label>
                    <select style={styles.select}>
                        <option value="todos">Todos</option>
                        <option value="aberto">Abertos</option>
                        <option value="fechado">Fechados</option>
                    </select>
                </div>
            </div>

            {/* Lista de Turnos */}
            <div style={styles.listContainer}>
                {displayShifts.map((shift: any) => (
                    <div key={shift.id} style={styles.card}>

                        {/* Coluna Esquerda: Info Principal */}
                        <div style={styles.cardMainInfo}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <span style={styles.cardTitle}>{shift.motorista || "Desconhecido"}</span>
                                <span style={styles.badge(shift.status)}>
                                    {shift.status === "em_andamento" ? "ABERTO" : "FECHADO"}
                                </span>
                            </div>
                            <div style={styles.cardSubtitle}>
                                <span>{shift.veiculo || "N/A"}</span>
                                <span>•</span>
                                <span>{new Date(shift.inicio).toLocaleString("pt-BR")}</span>
                            </div>

                            {/* Alerta de Suspeita (Mock logic for now as database doesn't have suspeito flag easily available) */}
                            {false && (
                                <div style={styles.alertBox}>
                                    <AlertTriangle size={14} />
                                    <span>Suspeita: ...</span>
                                </div>
                            )}
                        </div>

                        {/* Coluna Direita: Valores */}
                        <div style={{ textAlign: "right" }}>
                            {shift.status !== "em_andamento" ? (
                                <>
                                    <div style={styles.money}>R$ {Number(shift.receita || 0).toFixed(2)}</div>
                                    <div style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                                        {shift.kmRodado} km rodados
                                    </div>
                                </>
                            ) : (
                                <div style={{ fontSize: "0.875rem", opacity: 0.6, fontStyle: "italic" }}>
                                    Em andamento...
                                </div>
                            )}
                        </div>

                    </div>
                ))}
            </div>

            <div style={{ textAlign: "center", padding: "1rem", opacity: 0.5 }}>
                <p>Mostrando {displayShifts.length} registros</p>
            </div>
        </div>
    );
}
