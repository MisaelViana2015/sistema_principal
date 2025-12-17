
import React, { useState, useEffect } from "react";
import { Filter, Trash2, Wrench, Plus, ArrowUp, ArrowDown, X } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { vehiclesService } from "../../../modules/vehicles/vehicles.service";
import { financialService, Expense } from "../../../modules/financial/financial.service";
import { Vehicle } from "../../../../../shared/schema";
import { api } from "../../../lib/api";

export default function ManutencoesTabLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>("todos");
    const [selectedMonth, setSelectedMonth] = useState<string>("todos");
    const [selectedVehicle, setSelectedVehicle] = useState("todos");
    const [maintenances, setMaintenances] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Maintenance Form State
    const [newMaintenance, setNewMaintenance] = useState({
        vehicleId: "", // ID do veículo
        date: new Date().toISOString().split('T')[0],
        type: "preventiva",
        description: "",
        km: "",
        value: "",
        costTypeId: "" // Será preenchido com lógica ou seleção se necessário
    });



    const styles = {
        container: { display: "flex", flexDirection: "column" as const, gap: "1.5rem" },
        header: { display: "flex", alignItems: "center", justifyContent: "space-between" },
        title: { fontSize: "1.25rem", fontWeight: "700", color: isDark ? "#ffffff" : "#0f172a", margin: 0 },
        filtersCard: { padding: "1rem", backgroundColor: isDark ? "#1e293b" : "#ffffff", borderRadius: "0.5rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, display: "flex", flexDirection: "column" as const, gap: "1rem" },
        filtersHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" },
        filtersGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" },
        inputGroup: { display: "flex", flexDirection: "column" as const, gap: "0.35rem" },
        label: { fontSize: "0.75rem", fontWeight: "500", color: isDark ? "#94a3b8" : "#64748b" },
        select: { padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, backgroundColor: isDark ? "#0f172a" : "#ffffff", color: isDark ? "#ffffff" : "#0f172a", fontSize: "0.875rem" },
        input: { padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, backgroundColor: isDark ? "#0f172a" : "#ffffff", color: isDark ? "#ffffff" : "#0f172a", fontSize: "0.875rem" },
        tableContainer: { border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, borderRadius: "0.5rem", overflow: "hidden" },
        table: { width: "100%", borderCollapse: "collapse" as const, textAlign: "left" as const, fontSize: "0.875rem" },
        th: { padding: "0.75rem 1rem", backgroundColor: isDark ? "#1e293b" : "#f8fafc", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "600", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` },
        td: { padding: "0.75rem 1rem", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, color: isDark ? "#e2e8f0" : "#1e293b" },
        badge: (tipo: string) => {
            const isPreventiva = tipo?.toLowerCase().includes('preventiva');
            return { padding: "0.15rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: "600", backgroundColor: isPreventiva ? "rgba(34, 197, 94, 0.2)" : "rgba(234, 179, 8, 0.2)", color: isPreventiva ? "#4ade80" : "#facc15" };
        },
        actionButton: { padding: "0.25rem", borderRadius: "0.25rem", border: "none", backgroundColor: "transparent", color: "#ef4444", cursor: "pointer" },
        sortButton: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.75rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, backgroundColor: "transparent", color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.875rem", cursor: "pointer" },
    };

    // Extract available years from data
    const safeMaintenances = maintenances || [];
    const availableYears = Array.from(new Set(safeMaintenances.map(m => new Date(m.data).getFullYear()))).sort((a, b) => b - a);

    const filteredMaintenances = safeMaintenances.filter(m => {
        const mDate = new Date(m.data);

        // Filter by Vehicle
        if (selectedVehicle !== "todos" && m.veiculo !== null) {
            const selectedV = vehicles.find(v => v.id === selectedVehicle);
            if (selectedV && m.veiculo !== selectedV.plate) return false;
        }

        // Filter by Year
        if (selectedYear !== "todos" && mDate.getFullYear().toString() !== selectedYear) {
            return false;
        }

        // Filter by Month
        if (selectedMonth !== "todos" && (mDate.getMonth() + 1).toString() !== selectedMonth) {
            return false;
        }

        return true;
    }).sort((a, b) => {
        const dateA = new Date(a.data).getTime();
        const dateB = new Date(b.data).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    const handleSaveMaintenance = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMaintenance.vehicleId || !newMaintenance.value || !newMaintenance.description) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        try {
            let costTypeId = "MANUTENÇÃO_CORRETIVA";
            if (newMaintenance.type === "preventiva") costTypeId = "MANUTENÇÃO_PREVENTIVA";
            if (newMaintenance.type === "pneus") costTypeId = "PNEUS";

            const payload = {
                costTypeId: costTypeId,
                value: Number(newMaintenance.value),
                date: new Date(newMaintenance.date),
                notes: `${newMaintenance.description} - Veículo: ${vehicles.find(v => v.id === newMaintenance.vehicleId)?.plate} - KM: ${newMaintenance.km}`,
            };

            await api.post("/expenses", payload);
            alert("Manutenção registrada com sucesso!");
            setIsModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar manutenção. Verifique se o tipo de custo é válido.");
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Histórico de Manutenções</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
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
                        <select
                            style={styles.select}
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="todos">Todos</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
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
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg w-full max-w-md p-6 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Nova Manutenção</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveMaintenance} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Veículo</label>
                                <select
                                    required
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm"
                                    value={newMaintenance.vehicleId}
                                    onChange={e => setNewMaintenance({ ...newMaintenance, vehicleId: e.target.value })}
                                >
                                    <option value="">Selecione...</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.plate} - {v.modelo}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data</label>
                                    <input
                                        type="date"
                                        required
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm"
                                        value={newMaintenance.date}
                                        onChange={e => setNewMaintenance({ ...newMaintenance, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
                                    <select
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm"
                                        value={newMaintenance.type}
                                        onChange={e => setNewMaintenance({ ...newMaintenance, type: e.target.value })}
                                    >
                                        <option value="preventiva">Preventiva</option>
                                        <option value="corretiva">Corretiva</option>
                                        <option value="pneus">Pneus</option>
                                    </select>
                                </div>
                            </div>
                            {/* Initial data loading - DECOUPLED for robustness */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ex: Troca de óleo"
                                    className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm"
                                    value={newMaintenance.description}
                                    onChange={e => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">KM Atual</label>
                                    <input
                                        type="number"
                                        placeholder="0"
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm"
                                        value={newMaintenance.km}
                                        onChange={e => setNewMaintenance({ ...newMaintenance, km: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Valor (R$)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        required
                                        placeholder="0.00"
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700 rounded-md p-2 text-sm"
                                        value={newMaintenance.value}
                                        onChange={e => setNewMaintenance({ ...newMaintenance, value: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="pt-2 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
