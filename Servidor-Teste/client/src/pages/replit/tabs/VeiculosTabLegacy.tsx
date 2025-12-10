
import React, { useState } from "react";
import { Plus, Car, Clock, Filter, Trash2, Wrench, ArrowUp, ArrowDown, CircleDot } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import GradientCardLegacy from "../components/GradientCardLegacy";

// Mock Data para visualizar o layout
const MOCK_VEHICLES = [
    { id: "1", placa: "ABC-1234", modelo: "Fiat Uno", status: "ativo", km: 150000, custoKm: 0.85 },
    { id: "2", placa: "XYZ-5678", modelo: "VW Gol", status: "ativo", km: 120000, custoKm: 0.75 },
    { id: "3", placa: "DEF-9012", modelo: "Chevrolet Onix", status: "manutencao", km: 80000, custoKm: 0.90 },
];

const MOCK_MAINTENANCES = [
    { id: "1", data: "01/12/2025", veiculo: "ABC-1234", descricao: "Troca de Óleo", tipo: "Preventiva", km: 150000, valor: 250.00 },
    { id: "2", data: "20/11/2025", veiculo: "XYZ-5678", descricao: "Reparo Freio", tipo: "Corretiva", km: 118000, valor: 800.00 },
    { id: "3", data: "15/11/2025", veiculo: "ABC-1234", descricao: "Alinhamento e Balanceamento", tipo: "Preventiva", km: 149500, valor: 120.00 },
];

const MOCK_PNEUS = [
    { id: "1", veiculo: "ABC-1234", marca: "Michelin", modelo: "Primacy 4", dimensao: "205/55 R16", data: "01/12/2025", kmInstalacao: 150000, posicao: "Dianteiro Esq", estado: "Novo" },
    { id: "2", veiculo: "ABC-1234", marca: "Michelin", modelo: "Primacy 4", dimensao: "205/55 R16", data: "01/12/2025", kmInstalacao: 150000, posicao: "Dianteiro Dir", estado: "Novo" },
    { id: "3", veiculo: "XYZ-5678", marca: "Pirelli", modelo: "Cinturato P7", dimensao: "195/55 R15", data: "15/11/2025", kmInstalacao: 118000, posicao: "Traseiro Esq", estado: "Meia Vida" },
];

export default function VeiculosTabLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [subTab, setSubTab] = useState<"cadastro" | "gerais" | "manutencoes" | "pneus">("cadastro");
    const [period, setPeriod] = useState<"semana" | "mes" | "ano" | "total">("mes");
    const [sortBy, setSortBy] = useState<"uso" | "rentabilidade" | "custo">("uso");

    // Estados para sub-abas
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const getBadgeStyle = (type: string) => {
        const isPreventive = type === "Preventiva";
        if (isDark) {
            return {
                bg: isPreventive ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
                text: isPreventive ? "#4ade80" : "#fca5a5"
            };
        } else {
            return {
                bg: isPreventive ? "#dcfce7" : "#fee2e2",
                text: isPreventive ? "#166534" : "#991b1b"
            };
        }
    };

    const getPneuBadgeStyle = (estado: string) => {
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
        subTabsContainer: {
            display: "flex",
            backgroundColor: isDark ? "#1e293b" : "#f1f5f9",
            borderRadius: "0.5rem",
            padding: "0.25rem",
            gap: "0.25rem",
            flexWrap: "wrap" as const,
        },
        subTabTrigger: (isActive: boolean) => ({
            flex: 1,
            minWidth: "100px",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            border: "none",
            backgroundColor: isActive ? (isDark ? "#0f172a" : "#ffffff") : "transparent",
            color: isActive ? (isDark ? "#ffffff" : "#0f172a") : (isDark ? "#cbd5e1" : "#64748b"),
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
            boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            transition: "all 0.2s",
            textAlign: "center" as const,
        }),
        filtersBar: {
            display: "flex",
            flexWrap: "wrap" as const,
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
        },
        periodButtons: {
            display: "flex",
            gap: "0.5rem",
        },
        periodButton: (isActive: boolean) => ({
            padding: "0.375rem 0.75rem",
            borderRadius: "0.375rem",
            border: `1px solid ${isActive ? (isDark ? "transparent" : "transparent") : (isDark ? "#334155" : "#e2e8f0")}`,
            backgroundColor: isActive ? (isDark ? "#ffffff" : "#0f172a") : "transparent",
            color: isActive ? (isDark ? "#0f172a" : "#ffffff") : (isDark ? "#ffffff" : "#0f172a"),
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.2s",
        }),
        actionsGroup: {
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
        },
        select: {
            padding: "0.375rem 2rem 0.375rem 0.75rem",
            borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#ffffff" : "#0f172a",
            fontSize: "0.875rem",
            cursor: "pointer",
        },
        addButton: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            backgroundColor: "#2563eb", // blue-600
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s",
        },
        addMaintButton: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            backgroundColor: isDark ? "#e11d48" : "#be123c",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s",
        },
        addPneuButton: {
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            border: "none",
            color: "white",
            background: isDark ? "#ea580c" : "#c2410c",
            fontSize: "0.875rem",
            cursor: "pointer",
            fontWeight: "500"
        },
        grid: {
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        },
        vehicleInfo: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.25rem",
        },
        vehiclePlate: {
            fontWeight: "700",
            fontSize: "1.125rem",
            margin: 0,
        },
        vehicleModel: {
            fontSize: "0.875rem",
            opacity: 0.8,
            margin: 0,
        },
        metrics: {
            marginTop: "1rem",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            fontSize: "0.875rem",
        },
        metricItem: {
            display: "flex",
            flexDirection: "column" as const,
        },
        metricLabel: {
            opacity: 0.7,
            fontSize: "0.75rem",
        },
        metricValue: {
            fontWeight: "600",
        },
        // Estilos Comuns de Cards e Tabelas
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
            color: isDark ? "#cbd5e1" : "#64748b",
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
            color: isDark ? "#e2e8f0" : "#64748b",
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
        pneuBadge: (estado: string) => {
            const style = getPneuBadgeStyle(estado);
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
            color: isDark ? "#cbd5e1" : "#64748b",
            fontSize: "0.875rem",
            cursor: "pointer",
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Gestão de Veículos</h2>
                {subTab === "manutencoes" && (
                    <button style={styles.addMaintButton}>
                        <Plus size={16} />
                        Nova Manutenção
                    </button>
                )}
                {subTab === "pneus" && (
                    <button style={styles.addPneuButton}>
                        <Plus size={16} />
                        Novo Pneu
                    </button>
                )}
            </div>

            {/* Sub-Abas */}
            <div style={styles.subTabsContainer}>
                <button
                    style={styles.subTabTrigger(subTab === "cadastro")}
                    onClick={() => setSubTab("cadastro")}
                >
                    Cadastro
                </button>
                <button
                    style={styles.subTabTrigger(subTab === "gerais")}
                    onClick={() => setSubTab("gerais")}
                >
                    Gerais
                </button>
                <button
                    style={styles.subTabTrigger(subTab === "manutencoes")}
                    onClick={() => setSubTab("manutencoes")}
                >
                    Manutenções
                </button>
                <button
                    style={styles.subTabTrigger(subTab === "pneus")}
                    onClick={() => setSubTab("pneus")}
                >
                    Pneus
                </button>
            </div>

            {subTab === "cadastro" && (
                <>
                    {/* Filtros e Ações */}
                    <div style={styles.filtersBar}>
                        <div style={styles.periodButtons}>
                            {(["semana", "mes", "ano", "total"] as const).map((p) => (
                                <button
                                    key={p}
                                    style={styles.periodButton(period === p)}
                                    onClick={() => setPeriod(p)}
                                >
                                    {p === "semana" ? "Semana" : p === "mes" ? "Mês" : p === "ano" ? "Ano" : "Total"}
                                </button>
                            ))}
                        </div>

                        <div style={styles.actionsGroup}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span style={{ fontSize: "0.875rem", opacity: 0.7 }}>Ordenar:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    style={styles.select}
                                >
                                    <option value="uso">Mais usado</option>
                                    <option value="rentabilidade">Mais rentável</option>
                                    <option value="custo">Maior custo/km</option>
                                </select>
                            </div>

                            <button
                                style={styles.addButton}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#1d4ed8"} // blue-700
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2563eb"} // blue-600
                            >
                                <Plus size={16} />
                                Novo Veículo
                            </button>
                        </div>
                    </div>

                    {/* Lista (Grid) de Veículos */}
                    <div style={styles.grid}>
                        {MOCK_VEHICLES.map((vehicle, index) => (
                            <GradientCardLegacy
                                key={vehicle.id}
                                gradient={index % 2 === 0 ? "blue" : "purple"}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div style={styles.vehicleInfo}>
                                        <h3 style={styles.vehiclePlate}>{vehicle.placa}</h3>
                                        <p style={styles.vehicleModel}>{vehicle.modelo}</p>
                                    </div>
                                    <Car size={24} opacity={0.5} />
                                </div>

                                <div style={styles.metrics}>
                                    <div style={styles.metricItem}>
                                        <span style={styles.metricLabel}>Rodagem</span>
                                        <span style={styles.metricValue}>{vehicle.km.toLocaleString()} km</span>
                                    </div>
                                    <div style={styles.metricItem}>
                                        <span style={styles.metricLabel}>Custo/Km</span>
                                        <span style={styles.metricValue}>R$ {vehicle.custoKm.toFixed(2)}</span>
                                    </div>
                                </div>
                            </GradientCardLegacy>
                        ))}
                    </div>
                </>
            )}

            {subTab === "gerais" && (
                <div style={{ ...styles.grid, gridTemplateColumns: "1fr" }}>
                    <div style={{ padding: "2rem", textAlign: "center", opacity: 0.6, border: "1px dashed gray", borderRadius: "0.5rem" }}>
                        <Clock size={48} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                        <p>Visualização Geral (KPIs) será implementada posteriormente.</p>
                    </div>
                </div>
            )}

            {subTab === "manutencoes" && (
                <>
                    {/* Filtros de Manutenção */}
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

                    {/* Tabela de Manutenção */}
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
                                {MOCK_MAINTENANCES.map((m) => (
                                    <tr key={m.id}>
                                        <td style={styles.td}>{m.data}</td>
                                        <td style={styles.td}>{m.veiculo}</td>
                                        <td style={styles.td}>{m.descricao}</td>
                                        <td style={styles.td}>
                                            <span style={styles.badge(m.tipo)}>
                                                {m.tipo}
                                            </span>
                                        </td>
                                        <td style={styles.td}>{m.km} km</td>
                                        <td style={{ ...styles.td, fontWeight: "600" }}>
                                            R$ {m.valor.toFixed(2)}
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
                </>
            )}

            {subTab === "pneus" && (
                <>
                    {/* Filtros Pneus */}
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

                    {/* Tabela Pneus */}
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
                                            <span style={styles.pneuBadge(p.estado)}>
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
                </>
            )}
        </div>
    );
}
