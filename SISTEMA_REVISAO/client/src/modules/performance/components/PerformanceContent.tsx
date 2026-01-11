import React, { useState } from "react";
import {
    DollarSign, Users, Car, Wrench, Filter, List
} from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";

// Hooks
import { usePerformanceData } from "../hooks/usePerformanceData";
import { usePerformanceCalculations } from "../hooks/usePerformanceCalculations";

// Components
import { CostTypesManager } from "./CostTypesManager";
import { FixedCostsManager } from "./FixedCostsManager";
import { EditExpenseModal } from "../../financial/EditExpenseModal";
import { ExpenseTable } from "./ExpenseTable";
import { PerformanceKPIs } from "./PerformanceKPIs";

export default function PerformanceContent() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const queryClient = useQueryClient();

    const [activeSubTab, setActiveSubTab] = useState("financeiro");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

    // Filters for Expenses Table (Lifted state if needed, or local in ExpenseTable)
    // Actually ExpenseTable has its own filters props.
    // But we might want to sync the global Year/Month with ExpenseTable?
    // In the original, the filters were separate per tab or shared?
    // In financeiro tab (KPIs), there were filters at the top (lines 433).
    // In expenses tab (Repasses), there were filters again (lines 724).
    // Let's keep them synced or separate? The user might want valid comparison.
    // I will use `selectedYear/Month` for the main dashboard (financeiro), and pass them to hooks.
    // Inside ExpenseTable, it has its own selectors. I will allow it to control itself but initial state can match.
    // Actually, let's keep it simple. `usePerformanceData` needs year/month for INSTALLMENTS fetching.

    // Data & Logic
    const {
        costs, costTypes, fixedCosts, drivers, shifts, legacyMaintenances, vehicles, installments,
        refetchExpenses, refetchCostTypes, refetchFixedCosts, refetchInstallments
    } = usePerformanceData(selectedYear, selectedMonth);

    const { financialSummary, driverBreakdown } = usePerformanceCalculations({
        drivers, shifts, costs, fixedCosts, selectedYear, selectedMonth
    });

    // SubState for Expenses Tab filters (if different from global)
    const [expYear, setExpYear] = useState(selectedYear);
    const [expMonth, setExpMonth] = useState(selectedMonth);
    const [expDriver, setExpDriver] = useState("todos");
    const [expType, setExpType] = useState("todos");

    // Mutations
    const createFixedCostMutation = useMutation({
        mutationFn: async (data: any) => { return await api.post("/financial/fixed-costs", data).then(r => r.data) },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fixedCosts"] });
            queryClient.invalidateQueries({ queryKey: ["fixedCostInstallments"] });
        }
    });

    const updateFixedCostMutation = useMutation({
        mutationFn: async (data: any) => { return await api.put(`/financial/fixed-costs/${data.id}`, data).then(r => r.data) },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fixedCosts"] });
            queryClient.invalidateQueries({ queryKey: ["fixedCostInstallments"] });
        }
    });

    const deleteFixedCostMutation = useMutation({
        mutationFn: async (id: string) => { return await api.delete(`/financial/fixed-costs/${id}`).then(r => r.data) },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fixedCosts"] });
            queryClient.invalidateQueries({ queryKey: ["fixedCostInstallments"] });
        }
    });

    const updateInstallmentMutation = useMutation({
        mutationFn: (data: { id: string, status?: string, value?: number, dueDate?: Date, paidDate?: Date | null, paidAmount?: number | null }) =>
            api.put(`/financial/fixed-costs/installments/${data.id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["fixedCostInstallments"] });
            queryClient.invalidateQueries({ queryKey: ["fixedCosts"] });
        }
    });

    // Expense Modal Logic
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);

    const handleSaveExpense = async (id: string | null, data: any) => {
        try {
            if (id) {
                await api.put(`/financial/expenses/${id}`, data);
            } else {
                const typeObj = costTypes.find((t: any) => t.name === data.tipo);
                const payload = {
                    ...data,
                    costTypeId: typeObj?.id,
                    date: new Date().toISOString()
                };
                await api.post("/financial/expenses", payload);
            }
            refetchExpenses();
            setIsExpenseModalOpen(false);
        } catch (error) {
            console.error("Error saving expense", error);
            alert("Erro ao salvar despesa.");
        }
    };

    const handleDeleteExpense = async (id: string) => {
        try {
            await api.delete(`/financial/expenses/${id}`);
            refetchExpenses();
        } catch (err) {
            console.error(err);
            alert("Erro ao excluir.");
        }
    }

    const styles = {
        container: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "1.5rem",
            maxWidth: '1200px', margin: '0 auto', width: '100%'
        },
        header: {
            borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            paddingBottom: "1rem",
        },
        title: {
            fontSize: "1.5rem",
            fontWeight: "700",
            color: isDark ? "#ffffff" : "#0f172a",
        },
        subTabs: {
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            overflowX: "auto" as const,
            paddingBottom: "0.5rem",
        },
        subTabButton: (isActive: boolean) => ({
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            border: isActive ? "none" : `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            backgroundColor: isActive ? (isDark ? "#3b82f6" : "#2563eb") : "transparent",
            color: isActive ? "#ffffff" : (isDark ? "#94a3b8" : "#64748b"),
            cursor: "pointer",
            fontWeight: "500" as const,
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.2s",
            whiteSpace: "nowrap" as const
        }),
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
            display: "flex", flexDirection: "column" as const, gap: "0.35rem"
        },
        label: {
            fontSize: "0.75rem", fontWeight: "500", color: isDark ? "#cbd5e1" : "#64748b"
        },
        select: {
            padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
            backgroundColor: isDark ? "#0f172a" : "#ffffff", color: isDark ? "#ffffff" : "#0f172a", fontSize: "0.875rem", minWidth: "140px", cursor: "pointer"
        },
        tableContainer: {
            backgroundColor: isDark ? "#1e293b" : "#ffffff", borderRadius: "0.5rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            overflow: "hidden", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)", marginTop: "1rem"
        },
        table: { width: "100%", borderCollapse: "collapse" as const, fontSize: "0.875rem" },
        th: {
            textAlign: "left" as const, padding: "0.75rem 1rem", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            color: isDark ? "#94a3b8" : "#64748b", fontWeight: "500", fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.05em"
        },
        td: { padding: "0.75rem 1rem", borderBottom: `1px solid ${isDark ? "#334155" : "#f1f5f9"}`, color: isDark ? "#e2e8f0" : "#334155" },
        badge: (color: string) => ({
            display: "inline-flex", padding: "0.25rem 0.6rem", borderRadius: "9999px", fontSize: "0.7rem", fontWeight: "600",
            backgroundColor: color === "green" ? (isDark ? "#052e16" : "#dcfce7") : color === "red" ? (isDark ? "#450a0a" : "#fee2e2") : (isDark ? "#172554" : "#dbeafe"),
            color: color === "green" ? (isDark ? "#4ade80" : "#166534") : color === "red" ? (isDark ? "#f87171" : "#991b1b") : (isDark ? "#60a5fa" : "#1e40af")
        }),
        actionButton: { padding: "0.25rem", borderRadius: "0.25rem", border: "none", backgroundColor: "transparent", cursor: "pointer", color: isDark ? "#94a3b8" : "#64748b" }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Análise e Relatórios</h2>
            </div>

            <div style={styles.subTabs}>
                <button style={styles.subTabButton(activeSubTab === "financeiro")} onClick={() => setActiveSubTab("financeiro")}>
                    <DollarSign size={14} /> Financeiro
                </button>
                <button style={styles.subTabButton(activeSubTab === "repasses")} onClick={() => setActiveSubTab("repasses")}>
                    <DollarSign size={14} /> Custos
                </button>
                <button style={styles.subTabButton(activeSubTab === "motoristas")} onClick={() => setActiveSubTab("motoristas")}>
                    <Users size={14} /> Motoristas
                </button>
                <button style={styles.subTabButton(activeSubTab === "veiculos")} onClick={() => setActiveSubTab("veiculos")}>
                    <Car size={14} /> Veículos
                </button>
                <button style={styles.subTabButton(activeSubTab === "manutencao")} onClick={() => setActiveSubTab("manutencao")}>
                    <Wrench size={14} /> Manutenção
                </button>
                <button style={styles.subTabButton(activeSubTab === "tipos-custo")} onClick={() => setActiveSubTab("tipos-custo")}>
                    <List size={14} /> Tipos Custo
                </button>
                <button style={styles.subTabButton(activeSubTab === "custos-fixos")} onClick={() => setActiveSubTab("custos-fixos")}>
                    <Filter size={14} /> Custos Fixos
                </button>
                <button style={styles.subTabButton(activeSubTab === "ferramentas")} onClick={() => setActiveSubTab("ferramentas")}>
                    <Wrench size={14} /> Ferramentas
                </button>
            </div>

            {activeSubTab === "financeiro" && (
                <>
                    <div style={styles.filtersCard}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Ano</label>
                            <select style={styles.select} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                                <option value="todos">Todos</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Mês</label>
                            <select style={styles.select} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
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
                    </div>
                    <PerformanceKPIs
                        financialSummary={financialSummary}
                        driverBreakdown={driverBreakdown}
                        isDark={isDark}
                    />
                </>
            )}

            {activeSubTab === "repasses" && (
                <ExpenseTable
                    costs={costs}
                    costTypes={costTypes}
                    isDark={isDark}
                    selectedYear={expYear} // Use local state for Expense Tab independency? Or share? Using local for now
                    setSelectedYear={setExpYear}
                    selectedMonth={expMonth}
                    setSelectedMonth={setExpMonth}
                    selectedDriver={expDriver}
                    setSelectedDriver={setExpDriver}
                    selectedCostType={expType}
                    setSelectedCostType={setExpType}
                    onAddExpense={() => {
                        setEditingExpense(null);
                        setIsExpenseModalOpen(true);
                    }}
                    onDeleteExpense={handleDeleteExpense}
                />
            )}

            {activeSubTab === "motoristas" && (
                <>
                    {/* Driver Charts using driverBreakdown from hook */}
                    <div style={{ ...styles.filtersCard, padding: '2rem', display: 'block' }}>
                        <h3 style={{ ...styles.title, fontSize: "1rem", marginBottom: "1rem" }}>Horas Trabalhadas por Motorista</h3>
                        <div style={{ width: "90%", height: "220px", display: "flex", alignItems: "flex-end", justifyContent: "space-around", gap: "20px", paddingBottom: "20px" }}>
                            {driverBreakdown.map((stat: any) => {
                                // Calculate max hours for scaling
                                const maxHours = Math.max(...driverBreakdown.map((s: any) => s.totalHours), 1);
                                return (
                                    <div key={stat.nome} style={{ display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", flex: 1 }}>
                                        <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#3b82f6", marginBottom: "4px" }}>{stat.totalHours.toFixed(1)}h</span>
                                        <div style={{
                                            width: "60%",
                                            height: `${(stat.totalHours / maxHours) * 80}%`,
                                            backgroundColor: "#3b82f6",
                                            borderRadius: "4px 4px 0 0",
                                            minHeight: "4px"
                                        }}></div>
                                        <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
                                            <span style={{ fontSize: "0.75rem", fontWeight: "600", display: "block", color: isDark ? "#fff" : "#000" }}>{stat.nome.split(' ')[0]}</span>
                                            <span style={{ fontSize: "0.7rem", color: "#eab308", fontWeight: "bold" }}>{stat.totalShifts} turnos</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div style={styles.tableContainer}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Motorista</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Horas</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Turnos</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Média h/turno</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>Receita</th>
                                    <th style={{ ...styles.th, textAlign: 'right' }}>R$/hora</th>
                                </tr>
                            </thead>
                            <tbody>
                                {driverBreakdown.map((stat: any) => (
                                    <tr key={stat.nome}>
                                        <td style={styles.td}>{stat.nome}</td>
                                        <td style={{ ...styles.td, textAlign: 'right' }}>{stat.totalHours.toFixed(1)}h</td>
                                        <td style={{ ...styles.td, textAlign: 'right' }}>{stat.totalShifts}</td>
                                        <td style={{ ...styles.td, textAlign: 'right' }}>{stat.avgHours.toFixed(1)}h</td>
                                        <td style={{ ...styles.td, textAlign: 'right' }}>R$ {stat.totalRevenue.toFixed(2)}</td>
                                        <td style={{ ...styles.td, textAlign: 'right', fontWeight: "600" }}>R$ {stat.revenuePerHour.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeSubTab === "manutencao" && (
                <div style={styles.tableContainer}>
                    <div style={{ padding: "1rem", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ ...styles.title, fontSize: '1.2rem' }}>Histórico de Manutenções</h3>
                        <span style={{ fontSize: "0.875rem", color: styles.label.color }}>Total: R$ {legacyMaintenances.reduce((acc: number, m: any) => acc + Number(m.valor), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Data</th>
                                <th style={styles.th}>Veículo</th>
                                <th style={styles.th}>Tipo</th>
                                <th style={styles.th}>Descrição</th>
                                <th style={styles.th}>KM</th>
                                <th style={styles.th}>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {legacyMaintenances.map((m: any) => (
                                <tr key={m.id}>
                                    <td style={styles.td}>{new Date(m.data).toLocaleDateString('pt-BR')}</td>
                                    <td style={styles.td}>{m.veiculoPlate ? `${m.veiculoModelo} (${m.veiculoPlate})` : "N/A"}</td>
                                    <td style={styles.td}><span style={styles.badge(m.tipo === "Corretiva" ? "red" : "blue")}>{m.tipo}</span></td>
                                    <td style={styles.td}>{m.notes}</td>
                                    <td style={styles.td}>{m.km?.toLocaleString('pt-BR')} km</td>
                                    <td style={{ ...styles.td, fontWeight: "600" }}>R$ {Number(m.valor).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSubTab === "tipos-custo" && (
                <CostTypesManager
                    costTypes={costTypes}
                    isDark={isDark}
                    refetch={refetchCostTypes}
                />
            )}

            {activeSubTab === "custos-fixos" && (
                <FixedCostsManager
                    costs={fixedCosts}
                    installments={installments}
                    vehicles={vehicles}
                    costTypes={costTypes}
                    onSave={(data) => {
                        let startDate = data.specificDate;
                        let dueDay = data.specificDate ? new Date(data.specificDate).getDate() : 5;
                        if (!startDate && data.monthYear) {
                            startDate = `${data.monthYear}-05`;
                            dueDay = 5;
                        } else if (!startDate) {
                            startDate = new Date().toISOString();
                            dueDay = new Date().getDate();
                        }
                        const payload = {
                            ...data,
                            name: data.description,
                            value: Number(data.value),
                            frequency: data.isRecurring ? "Mensal" : "Único",
                            dueDay: dueDay,
                            totalInstallments: data.isRecurring ? (data.totalInstallments || 12) : 1,
                            startDate: startDate
                        };
                        return data.id ? updateFixedCostMutation.mutateAsync({ id: data.id, ...payload }) : createFixedCostMutation.mutateAsync(payload);
                    }}
                    onDelete={(id) => deleteFixedCostMutation.mutate(id)}
                    onUpdateInstallment={(id, data) => updateInstallmentMutation.mutate({ id, ...data })}
                />
            )}

            {activeSubTab === "veiculos" && (
                <div style={styles.tableContainer}>
                    <div style={{ padding: "1rem", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ ...styles.title, fontSize: '1.2rem' }}>Frota Ativa</h3>
                        <span style={{ fontSize: "0.875rem", color: styles.label.color }}>Total: {vehicles.length} Veículos</span>
                    </div>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>Placa</th>
                                <th style={styles.th}>Modelo</th>
                                <th style={styles.th}>Ano</th>
                                <th style={styles.th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.map((v: any) => (
                                <tr key={v.id}>
                                    <td style={{ ...styles.td, fontWeight: "bold" }}>{v.plate}</td>
                                    <td style={styles.td}>{v.model}</td>
                                    <td style={styles.td}>{v.year || "-"}</td>
                                    <td style={styles.td}><span style={styles.badge(v.status === "active" ? "green" : "red")}>{v.status === "active" ? "Ativo" : "Inativo"}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSubTab === "ferramentas" && (
                <div style={{ padding: "1.5rem" }}>
                    <h3 style={{ ...styles.title, marginBottom: "1.5rem", fontSize: '1.2rem' }}>🛠️ Ferramentas de Manutenção</h3>
                    <div style={{ ...styles.filtersCard, padding: "1.5rem", marginBottom: "1rem" }}>
                        <h4 style={{ fontWeight: "600", marginBottom: "1rem", color: isDark ? "#fff" : "#0f172a" }}>🔍 Análise de Fraude em Massa</h4>
                        <p style={{ color: isDark ? "#94a3b8" : "#64748b", marginBottom: "1rem", fontSize: "0.875rem" }}>Executa o engine de detecção de fraude em todos os turnos finalizados.</p>
                        <div id="fraud-analysis-results" style={{ display: "none", marginBottom: "1rem", maxHeight: "400px", overflowY: "auto" }}></div>
                        <button onClick={async () => {
                            if (!window.confirm("Isso irá analisar todos os turnos. Continuar?")) return;
                            try {
                                const res = await api.post("/fraud/analyze-all");
                                const container = document.getElementById("fraud-analysis-results");
                                if (container) {
                                    container.style.display = "block";
                                    container.innerHTML = `<div style="padding:1rem">Concluído! ${res.data.analyzed} turnos analisados.</div>`;
                                }
                            } catch (err: any) { alert("Erro: " + err.message); }
                        }}
                            style={{ padding: "0.75rem 1.5rem", borderRadius: "0.5rem", border: "none", background: "#8b5cf6", color: "#fff", cursor: "pointer", fontWeight: "500" }}>
                            🔍 Executar Análise de Fraude
                        </button>
                    </div>
                </div>
            )}

            <EditExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
                onSave={handleSaveExpense}
                expense={editingExpense}
            />
        </div>
    );
}
