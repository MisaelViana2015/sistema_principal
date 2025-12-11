
import React, { useState } from "react";
import { Filter, ChevronDown, ChevronUp, AlertTriangle, Loader2, Edit, Trash2, Eye } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useQuery } from "@tanstack/react-query";

// Helper functions to fetch data
async function fetchShifts() {
    const response = await fetch("/api/shifts");
    if (!response.ok) throw new Error("Falha ao buscar turnos");
    return response.json();
}

async function fetchDrivers() {
    const response = await fetch("/api/drivers");
    if (!response.ok) throw new Error("Falha ao buscar motoristas");
    return response.json();
}

async function fetchVehicles() {
    const response = await fetch("/api/veiculos");
    if (!response.ok) throw new Error("Falha ao buscar veículos");
    return response.json();
}

export default function TurnosTabLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Estados de Filtro
    const [selectedDriver, setSelectedDriver] = useState("todos");
    const [selectedVehicle, setSelectedVehicle] = useState("todos");
    const [selectedPeriod, setSelectedPeriod] = useState("mes");
    const [selectedStatus, setSelectedStatus] = useState("todos");

    // Fetch data
    const { data: shifts, isLoading: loadingShifts, error: errorShifts } = useQuery({
        queryKey: ["shifts"],
        queryFn: fetchShifts
    });

    const { data: drivers } = useQuery({
        queryKey: ["drivers"],
        queryFn: fetchDrivers
    });

    const { data: vehicles } = useQuery({
        queryKey: ["vehicles"],
        queryFn: fetchVehicles
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
            minWidth: "180px",
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
            flexDirection: "column" as const,
            gap: "1rem",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        },
        cardHeader: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
        },
        infoRow: {
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            marginBottom: "0.25rem",
            flexWrap: "wrap" as const,
        },
        driverName: {
            fontWeight: "700",
            fontSize: "1rem",
            color: isDark ? "#ffffff" : "#0f172a",
        },
        vehicleInfo: {
            fontSize: "0.875rem",
            color: isDark ? "#94a3b8" : "#64748b",
        },
        dateRange: {
            fontSize: "0.75rem",
            color: isDark ? "#64748b" : "#94a3b8",
            marginTop: "0.25rem",
        },
        badge: (status: string) => ({
            padding: "0.125rem 0.5rem",
            borderRadius: "0.25rem",
            fontSize: "0.65rem",
            fontWeight: "600",
            textTransform: "uppercase" as const,
            backgroundColor: status === "em_andamento"
                ? (isDark ? "rgba(34, 197, 94, 0.2)" : "#dcfce7")
                : (isDark ? "#334155" : "#f1f5f9"),
            color: status === "em_andamento"
                ? (isDark ? "#4ade80" : "#166534")
                : (isDark ? "#94a3b8" : "#64748b"),
        }),
        statsContainer: {
            display: "flex",
            gap: "1.5rem",
            marginTop: "0.5rem",
            fontSize: "0.875rem",
            flexWrap: "wrap" as const,
        },
        statItem: {
            display: "flex",
            alignItems: "baseline",
            gap: "0.5rem",
            color: isDark ? "#cbd5e1" : "#334155",
        },
        statValue: {
            fontWeight: "600",
            color: isDark ? "#ffffff" : "#0f172a",
        },
        totalStat: {
            fontWeight: "700",
            color: isDark ? "#4ade80" : "#22c55e",
        },
        actions: {
            display: "flex",
            gap: "0.5rem",
        },
        actionButton: {
            padding: "0.5rem",
            borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            backgroundColor: "transparent",
            color: isDark ? "#94a3b8" : "#64748b",
            cursor: "pointer",
            display: "flex", // Ensure icon is centered
            alignItems: "center",
            justifyContent: "center",
        },
        suspectBadge: {
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            fontSize: "0.75rem",
            color: "#ef4444", // red
            fontWeight: "600",
        }
    };

    if (loadingShifts) {
        return (
            <div style={{ ...styles.container, alignItems: "center", justifyContent: "center", minHeight: "200px" }}>
                <Loader2 className="animate-spin" size={32} />
            </div>
        );
    }

    if (errorShifts) {
        return (
            <div style={{ ...styles.container, padding: "2rem", color: "red" }}>
                Erro ao carregar dados. Tente novamente.
            </div>
        );
    }

    // Filter Logic
    const filteredShifts = (shifts || []).filter((shift: any) => {
        if (selectedDriver !== "todos" && shift.motorista !== selectedDriver) return false; // Note: filtering by name for now as value is name in mock, adjust if ID
        if (selectedVehicle !== "todos" && shift.veiculo !== selectedVehicle) return false;
        if (selectedStatus !== "todos") {
            if (selectedStatus === "aberto" && shift.status !== "em_andamento") return false;
            if (selectedStatus === "fechado" && shift.status === "em_andamento") return false;
        }
        // Period logic
        const shiftDate = new Date(shift.inicio);
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (selectedPeriod === "hoje") {
            if (shiftDate < startOfDay) return false;
        } else if (selectedPeriod === "semana") {
            const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            if (shiftDate < lastWeek) return false;
        } else if (selectedPeriod === "mes") {
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            if (shiftDate < lastMonth) return false;
        } else if (selectedPeriod === "ano") { // Although not in select options currently, good to have
            const lastYear = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            if (shiftDate < lastYear) return false;
        }

        return true;
    });


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
                        {drivers?.map((d: any) => (
                            <option key={d.id} value={d.nome}>{d.nome}</option> // Using name for filter match with repo response
                        ))}
                    </select>
                </div>

                <div style={styles.selectGroup}>
                    <label style={styles.label}>Veículo</label>
                    <select
                        style={styles.select}
                        value={selectedVehicle}
                        onChange={(e) => setSelectedVehicle(e.target.value)}
                    >
                        <option value="todos">Todos os Veículos</option>
                        {vehicles?.map((v: any) => (
                            <option key={v.id} value={v.plate}>{v.plate} - {v.modelo}</option>
                        ))}
                    </select>
                </div>

                <div style={styles.selectGroup}>
                    <label style={styles.label}>Status</label>
                    <select
                        style={styles.select}
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        <option value="aberto">Aberto</option>
                        <option value="fechado">Fechado</option>
                    </select>
                </div>
            </div>

            {/* Lista de Turnos */}
            <div style={styles.listContainer}>
                {filteredShifts.map((shift: any) => (
                    <div key={shift.id} style={styles.card}>

                        {/* Header Row */}
                        <div style={styles.cardHeader}>
                            <div style={{ flex: 1 }}>
                                <div style={styles.infoRow}>
                                    <span style={styles.driverName}>{shift.motorista || "Motorista não identificado"}</span>
                                    <span style={styles.badge(shift.status)}>
                                        {shift.status === "em_andamento" ? "Aberto" : "Fechado"}
                                    </span>
                                    {/* Mock Suspect Check - Replace with real logic if available */}
                                    {(shift.totalCorridas > 20 || shift.totalBruto > 600) && (
                                        <div style={styles.suspectBadge}>
                                            <AlertTriangle size={14} />
                                            <span>Suspeito</span>
                                        </div>
                                    )}
                                </div>
                                <div style={styles.vehicleInfo}>
                                    {shift.veiculo} - {shift.veiculoModelo || "Modelo N/A"}
                                </div>
                                <div style={styles.dateRange}>
                                    {new Date(shift.inicio).toLocaleString("pt-BR")}
                                    {shift.fim && ` - ${new Date(shift.fim).toLocaleString("pt-BR")}`}
                                </div>

                                <div style={styles.statsContainer}>
                                    <div style={styles.statItem}>
                                        <span>{shift.totalCorridasApp || 0} App</span>
                                        <span>•</span>
                                        <span style={styles.statValue}>R$ {Number(shift.totalApp || 0).toFixed(2)}</span>
                                    </div>
                                    <div style={styles.statItem}>
                                        <span>{shift.totalCorridasParticular || 0} Particular</span>
                                        <span>•</span>
                                        <span style={styles.statValue}>R$ {Number(shift.totalParticular || 0).toFixed(2)}</span>
                                    </div>
                                    <div style={styles.statItem}>
                                        <span style={{ fontWeight: 600 }}>Total: {shift.totalCorridas || 0}</span>
                                        <span>•</span>
                                        <span style={styles.totalStat}>R$ {Number(shift.receita || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Right Side */}
                            <div style={styles.actions}>
                                <button style={styles.actionButton} title="Detalhes">
                                    <Eye size={18} />
                                    <span style={{ marginLeft: "0.5rem", fontSize: "0.875rem" }}>Detalhes</span>
                                </button>
                                <button style={styles.actionButton} title="Editar">
                                    <Edit size={16} />
                                </button>
                                <button style={{ ...styles.actionButton, color: "#ef4444", borderColor: isDark ? "rgba(239, 68, 68, 0.2)" : "#fecaca" }} title="Excluir">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div style={{ textAlign: "center", padding: "1rem", opacity: 0.5 }}>
                Mostrando {filteredShifts.length} registros
            </div>
        </div>
    );
}
