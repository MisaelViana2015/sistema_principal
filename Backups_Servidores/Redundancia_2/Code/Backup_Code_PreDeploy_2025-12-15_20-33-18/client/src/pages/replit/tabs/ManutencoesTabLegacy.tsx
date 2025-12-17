
import React, { useState, useEffect } from "react";
import { Filter, Trash2, Wrench, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { vehiclesService } from "../../../modules/vehicles/vehicles.service";
import { financialService, Expense } from "../../../modules/financial/financial.service";
import { Vehicle } from "../../../../../shared/schema";

export default function ManutencoesTabLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState("todos");
    const [maintenances, setMaintenances] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            vehiclesService.getAll(),
            financialService.getAllExpenses(),
            financialService.getAllLegacyMaintenances()
        ]).then(([vehiclesData, expensesData, legacyData]) => {
            setVehicles(vehiclesData);

            // Normalize Expenses (New System)
            const normalizedExpenses = expensesData
                .map(e => ({
                    id: e.id,
                    data: e.data,
                    veiculo: e.veiculo || 'N/A', // Se não tiver veículo, mostra N/A mas não esconde
                    notes: e.notes,
                    tipo: e.tipo,
                    km: null,
                    valor: Number(e.valor),
                    source: 'new'
                }));

            // Normalize Legacy Maintenances (Old System)
            const normalizedLegacy = legacyData.map(l => ({
                id: l.id,
                data: l.data,
                // Tenta o dado do join (veiculoPlate), se não tiver usa 'Veículo Antigo' ou tenta achar na lista
                veiculo: l.veiculoPlate || vehiclesData.find((v: any) => v.id === l.veiculoId)?.plate || 'Veículo (Legado)',
                notes: l.notes,
                tipo: l.tipo,
                km: l.km,
                valor: Number(l.valor),
                source: 'legacy'
            }));

            // Merge both lists
            setMaintenances([...normalizedExpenses, ...normalizedLegacy]);
        }).catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);

    const getBadgeStyle = (type: string) => {
        // Tentativa de inferir cor baseada no nome
        const name = type.toLowerCase();
        let isPreventive = name.includes("preventiva") || name.includes("manutenção");
        let isCorrective = name.includes("corretiva") || name.includes("reparo") || name.includes("conserto");

        // Se não cair em nenhuma, usa padrão verde se for fixo, vermelho se não?
        // Vou usar verde pra preventiva e vermelho pra corretiva/outros

        if (isDark) {
            return {
                bg: isCorrective ? "rgba(239, 68, 68, 0.2)" : "rgba(34, 197, 94, 0.2)",
                text: isCorrective ? "#fca5a5" : "#4ade80"
            };
        } else {
            return {
                bg: isCorrective ? "#fee2e2" : "#dcfce7",
                text: isCorrective ? "#991b1b" : "#166534"
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
        badge: (type: string) => {
            const style = getBadgeStyle(type);
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

    const filteredMaintenances = maintenances.filter(m => {
        if (selectedVehicle !== "todos" && m.veiculo !== null) {
            // Check if selectedVehicle is ID or plate? 
            // values in select are v.id
            // m.veiculo from API is PLATE. 
            // Need to match ID. But API result (repo) returns PLATE (veiculo: vehicles.plate).
            // Need to find the vehicle by ID to check plate? Or update repo to return vehicleId?
            // Easier: Update repo to return vehicleId. Or here find plate of filtered vehicle.
            const selectedV = vehicles.find(v => v.id === selectedVehicle);
            if (selectedV && m.veiculo !== selectedV.plate) return false;
        }
        return true;
    }).sort((a, b) => {
        const dateA = new Date(a.data).getTime();
        const dateB = new Date(b.data).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Histórico de Manutenções</h2>
                <button
                    style={{
                        display: "flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none",
                        color: "white", background: isDark ? "#e11d48" : "#be123c", fontSize: "0.875rem", cursor: "pointer", fontWeight: "500"
                    }}
                >
                    <Plus size={16} />
                    Nova Manutenção
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
                        <select
                            style={styles.select}
                            value={selectedVehicle}
                            onChange={(e) => setSelectedVehicle(e.target.value)}
                        >
                            <option value="todos">Todos os Veículos</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.plate} - {v.modelo}
                                </option>
                            ))}
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
                            <th style={styles.th}>Data</th>
                            <th style={styles.th}>Veículo</th>
                            <th style={styles.th}>Descrição</th>
                            <th style={styles.th}>Tipo</th>
                            <th style={styles.th}>KM</th>
                            <th style={styles.th}>Valor</th>
                            <th style={styles.th}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center' }}>Carregando...</td></tr>
                        ) : filteredMaintenances.length === 0 ? (
                            <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center' }}>Nenhuma manutenção encontrada.</td></tr>
                        ) : (
                            filteredMaintenances.map((m) => (
                                <tr key={m.id}>
                                    <td style={styles.td}>{new Date(m.data).toLocaleDateString('pt-BR')}</td>
                                    <td style={styles.td}>{m.veiculo}</td>
                                    <td style={styles.td}>{m.notes || '-'}</td>
                                    <td style={styles.td}>
                                        <span style={styles.badge(m.tipo || 'Desconhecido')}>
                                            {m.tipo || 'Outro'}
                                        </span>
                                    </td>
                                    <td style={styles.td}>{m.km ? `${m.km} km` : '-'}</td>
                                    <td style={{ ...styles.td, fontWeight: "600" }}>
                                        R$ {Number(m.valor).toFixed(2)}
                                    </td>
                                    <td style={styles.td}>
                                        <button style={styles.actionButton} title="Excluir">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
