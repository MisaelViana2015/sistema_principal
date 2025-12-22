
import React, { useState, useEffect } from "react";
import { DollarSign, Trash2, PieChart, RefreshCw } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { financialService, Expense } from "../../../modules/financial/financial.service";


export default function CustosTabLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";


    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [drivers, setDrivers] = useState<string[]>([]);
    const [costTypes, setCostTypes] = useState<string[]>([]);

    // Filter states
    const [selectedYear, setSelectedYear] = useState("todos");
    const [selectedMonth, setSelectedMonth] = useState("todos");
    const [selectedType, setSelectedType] = useState("todos");
    const [selectedDriver, setSelectedDriver] = useState("todos");

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const data = await financialService.getExpenses();
            setExpenses(data);

            // Extract unique values for filters
            const uniqueDrivers = Array.from(new Set(data.map(d => d.motoristaNome).filter(Boolean))) as string[];
            const uniqueTypes = Array.from(new Set(data.map(d => d.tipo).filter(Boolean))) as string[];

            setDrivers(uniqueDrivers.sort());
            setCostTypes(uniqueTypes.sort());
        } catch (error) {
            console.error("Erro ao carregar custos:", error);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredExpenses = expenses.filter(cost => {
        const date = new Date(cost.data);
        const yearMatch = selectedYear === "todos" || date.getFullYear().toString() === selectedYear;
        const monthMatch = selectedMonth === "todos" || (date.getMonth() + 1).toString() === selectedMonth;
        const driverMatch = selectedDriver === "todos" || cost.motoristaNome === selectedDriver;
        const typeMatch = selectedType === "todos" || cost.tipo === selectedType;

        return yearMatch && monthMatch && driverMatch && typeMatch;
    });

    const totalCosts = filteredExpenses.reduce((acc, cost) => acc + Number(cost.valor), 0);

    const getBadgeStyle = (color: string) => {
        const isDarkTheme = theme === "dark";
        switch (color) {
            case "blue": return { bg: isDarkTheme ? "#1e3a8a" : "#dbeafe", text: isDarkTheme ? "#93c5fd" : "#1e40af" };
            case "green": return { bg: isDarkTheme ? "#14532d" : "#dcfce7", text: isDarkTheme ? "#86efac" : "#166534" };
            case "red": return { bg: isDarkTheme ? "#7f1d1d" : "#fee2e2", text: isDarkTheme ? "#fca5a5" : "#991b1b" };
            case "cyan": return { bg: isDarkTheme ? "#164e63" : "#cffafe", text: isDarkTheme ? "#67e8f9" : "#155e75" };
            case "orange": return { bg: isDarkTheme ? "#7c2d12" : "#ffedd5", text: isDarkTheme ? "#fdba74" : "#c2410c" };
            default: return { bg: isDarkTheme ? "#1f2937" : "#f3f4f6", text: isDarkTheme ? "#9ca3af" : "#4b5563" };
        }
    };

    const styles = {
        // ... (keep styles) ...
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
        kpiContainer: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
        },
        kpiCard: {
            padding: "1rem",
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            borderRadius: "0.5rem",
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.5rem",
        },
        kpiLabel: {
            fontSize: "0.875rem",
            color: isDark ? "#94a3b8" : "#64748b",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        },
        kpiValue: {
            fontSize: "1.5rem",
            fontWeight: "700",
            color: isDark ? "#ffffff" : "#0f172a",
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
        badge: (color: string) => {
            const style = getBadgeStyle(color || 'gray');
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
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Gestão de Custos</h2>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                        onClick={loadExpenses}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.5rem 1rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                            color: isDark ? "white" : "#334155", background: "transparent", fontSize: "0.875rem", cursor: "pointer", fontWeight: "500"
                        }}
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        Atualizar
                    </button>
                    <button
                        style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none",
                            color: "white", background: "#ef4444", fontSize: "0.875rem", cursor: "pointer", fontWeight: "500"
                        }}
                    >
                        <DollarSign size={16} />
                        Novo Custo
                    </button>
                </div>
            </div>

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
                        {drivers.map(driver => (
                            <option key={driver} value={driver}>{driver}</option>
                        ))}
                    </select>
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Tipo de Custo</label>
                    <select
                        style={styles.select}
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        {costTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* KPIs */}
            <div style={styles.kpiContainer}>
                <div style={styles.kpiCard}>
                    <span style={styles.kpiLabel}><DollarSign size={16} /> Total de Custos (Real)</span>
                    <span style={styles.kpiValue}>R$ {totalCosts.toFixed(2)}</span>
                </div>
                <div style={styles.kpiCard}>
                    <span style={styles.kpiLabel}><PieChart size={16} /> Registros</span>
                    <span style={styles.kpiValue}>{filteredExpenses.length}</span>
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
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: isDark ? "#94a3b8" : "#64748b" }}>
                                    Carregando dados do servidor...
                                </td>
                            </tr>
                        ) : (
                            filteredExpenses.map((cost) => (
                                <tr key={cost.id}>
                                    <td style={styles.td}>
                                        {new Date(cost.data).toLocaleString('pt-BR', {
                                            day: '2-digit', month: '2-digit', year: 'numeric',
                                            hour: '2-digit', minute: '2-digit'
                                        })}
                                    </td>
                                    <td style={styles.td}>{cost.motoristaNome || "N/A"}</td>
                                    <td style={styles.td}>
                                        <span style={styles.badge(cost.tipoCor || 'gray')}>
                                            {cost.tipo}
                                        </span>
                                    </td>
                                    <td style={{ ...styles.td, fontWeight: "600" }}>
                                        R$ {Number(cost.valor).toFixed(2)}
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
