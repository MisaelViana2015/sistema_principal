
import React, { useState } from "react";
import { Filter, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

// Mock Data
const MOCK_SHIFTS = [
    {
        id: "1",
        motorista: "João Silva",
        veiculo: "ABC-1234",
        inicio: "09/12/2025 08:00",
        fim: null,
        status: "em_andamento",
        kmRodado: 0,
        receita: 0
    },
    {
        id: "2",
        motorista: "Maria Oliveira",
        veiculo: "XYZ-5678",
        inicio: "08/12/2025 07:00",
        fim: "08/12/2025 19:00",
        status: "finalizado",
        kmRodado: 150,
        receita: 450.50
    },
    {
        id: "3",
        motorista: "Carlos Santos",
        veiculo: "DEF-9012",
        inicio: "07/12/2025 08:00",
        fim: "07/12/2025 18:00",
        status: "finalizado",
        kmRodado: 10,
        receita: 800.00,
        suspeito: true,
        motivoSuspeita: "Receita alta com baixo KM"
    },
];

export default function TurnosTabLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Estados de Filtro (Mock)
    const [selectedDriver, setSelectedDriver] = useState("todos");
    const [selectedPeriod, setSelectedPeriod] = useState("semana");

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
        }
    };

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
                {MOCK_SHIFTS.map((shift) => (
                    <div key={shift.id} style={styles.card}>

                        {/* Coluna Esquerda: Info Principal */}
                        <div style={styles.cardMainInfo}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <span style={styles.cardTitle}>{shift.motorista}</span>
                                <span style={styles.badge(shift.status)}>
                                    {shift.status === "em_andamento" ? "ABERTO" : "FECHADO"}
                                </span>
                            </div>
                            <div style={styles.cardSubtitle}>
                                <span>{shift.veiculo}</span>
                                <span>•</span>
                                <span>{shift.inicio}</span>
                            </div>

                            {/* Alerta de Suspeita */}
                            {shift.suspeito && (
                                <div style={styles.alertBox}>
                                    <AlertTriangle size={14} />
                                    <span>Suspeita: {shift.motivoSuspeita}</span>
                                </div>
                            )}
                        </div>

                        {/* Coluna Direita: Valores */}
                        <div style={{ textAlign: "right" }}>
                            {shift.status === "finalizado" ? (
                                <>
                                    <div style={styles.money}>R$ {shift.receita.toFixed(2)}</div>
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
                <p>Mostrando 3 de 3 registros (Mock)</p>
            </div>
        </div>
    );
}
