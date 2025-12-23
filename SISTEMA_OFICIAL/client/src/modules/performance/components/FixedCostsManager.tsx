import React, { useState, useMemo } from "react";
import { Plus, X, Calendar, Edit, Trash2, CheckCircle, Clock } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell
} from 'recharts';

interface FixedCost {
    id: string;
    vehicleId?: string;
    name: string;
    value: number;
    frequency: string;
    isRecurring: boolean;
    totalInstallments?: number;
}

interface Installment {
    id: string;
    fixedCostId: string;
    vehicleId?: string;
    installmentNumber: number;
    totalInstallments?: number;
    dueDate: string;
    value: number;
    status: 'Pago' | 'Pendente';
    costName?: string;
    vendor?: string;
}

interface Vehicle {
    id: string;
    plate: string;
    model: string;
}

interface FixedCostsManagerProps {
    costs: FixedCost[];
    installments: Installment[];
    vehicles: Vehicle[];
    onSave: (cost: any) => void;
    onDelete: (id: string) => void;
    onUpdateInstallment: (id: string, data: any) => void;
}

const COST_TYPES = [
    "Prestação", "Seguro", "IPVA", "Energia", "Licenciamento",
    "Empréstimo", "Rota77", "Outro"
];

export function FixedCostsManager({ costs, installments, vehicles, onSave, onDelete, onUpdateInstallment }: FixedCostsManagerProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [editingCost, setEditingCost] = useState<FixedCost | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        vehicleId: "",
        type: "",
        description: "",
        value: "",
        monthYear: "",
        specificDate: "",
        isRecurring: false,
        totalInstallments: "1",
        vendor: "",
        notes: ""
    });

    const handleOpenModal = () => {
        setFormData({
            vehicleId: "",
            type: "",
            description: "",
            value: "",
            monthYear: "",
            specificDate: "",
            isRecurring: false,
            totalInstallments: "1",
            vendor: "",
            notes: ""
        });
        setIsModalOpen(true);
    };

    // --- Data Processing for Charts ---
    const chartDataMonths = useMemo(() => {
        const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        return months.map((month, index) => {
            const monthInstallments = installments.filter(i => {
                const d = new Date(i.dueDate);
                return d.getMonth() === index && d.getFullYear().toString() === selectedYear;
            });
            const total = monthInstallments.reduce((acc, curr) => acc + Number(curr.value), 0);
            const paid = monthInstallments.filter(i => i.status === 'Pago').reduce((acc, curr) => acc + Number(curr.value), 0);
            const pending = monthInstallments.filter(i => i.status === 'Pendente').reduce((acc, curr) => acc + Number(curr.value), 0);

            return {
                name: month,
                Total: total,
                Pago: paid,
                Pendente: pending
            };
        });
    }, [installments, selectedYear]);

    // --- Group List by Vehicle ---
    const installmentsByVehicle = useMemo(() => {
        const groups: Record<string, Installment[]> = {};
        installments.forEach(inst => {
            const vid = inst.vehicleId || "Sem Veículo";
            if (!groups[vid]) groups[vid] = [];
            groups[vid].push(inst);
        });
        return groups;
    }, [installments]);

    const getVehicleName = (id: string) => {
        const v = vehicles.find(veh => veh.id === id);
        return v ? `${v.plate} - ${v.model}` : "Geral / Sem Veículo";
    };

    const styles = {
        container: { display: "flex", flexDirection: "column" as const, gap: "1.5rem", color: isDark ? "#e2e8f0" : "#1e293b" },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center" },
        title: { fontSize: "1.25rem", fontWeight: "bold", color: isDark ? "#f1f5f9" : "#0f172a" },
        subtitle: { fontSize: "0.875rem", color: isDark ? "#94a3b8" : "#64748b" },
        primaryButton: { backgroundColor: "#0f172a", color: "#ffffff", padding: "0.5rem 1rem", borderRadius: "0.375rem", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 500, border: "none", cursor: "pointer" },
        grid: { display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem" },
        card: (bgColor: string, textColor: string = "#1e293b") => ({
            backgroundColor: bgColor, color: textColor, padding: "1rem", borderRadius: "0.5rem",
            display: "flex", flexDirection: "column" as const, justifyContent: "space-between", minHeight: "100px"
        }),
        section: { backgroundColor: isDark ? "#1e293b" : "#ffffff", padding: "1.5rem", borderRadius: "0.5rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` },
        chartContainer: { height: "300px", width: "100%", marginTop: "1rem" },

        // List Styles
        vehicleGroup: { marginBottom: "1.5rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, borderRadius: "0.5rem", overflow: "hidden", backgroundColor: isDark ? "#1e293b" : "#ffffff" },
        vehicleHeader: { padding: "1rem", backgroundColor: isDark ? "#334155" : "#f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: "bold" as const, color: isDark ? "#f1f5f9" : "#0f172a" },
        installmentRow: { padding: "1rem", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, display: "flex", justifyContent: "space-between", alignItems: "center" },
        tag: (status: string) => ({
            padding: "0.25rem 0.5rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 600,
            backgroundColor: status === 'Pago' ? "#dcfce7" : "#fee2e2", color: status === 'Pago' ? "#166534" : "#991b1b"
        }),
        iconButton: { padding: "0.25rem", borderRadius: "0.25rem", cursor: "pointer", border: "none", background: "transparent", color: isDark ? "#94a3b8" : "#64748b" },

        // Modal Styles
        modalOverlay: { position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 },
        modalContent: { backgroundColor: isDark ? "#1e293b" : "#ffffff", padding: "1.5rem", borderRadius: "0.5rem", width: "600px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, maxHeight: "90vh", overflowY: "auto" as const },
        formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" },
        inputGroup: { display: "flex", flexDirection: "column" as const, gap: "0.25rem" },
        label: { fontSize: "0.875rem", fontWeight: 500, color: isDark ? "#cbd5e1" : "#475569" },
        input: { width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, backgroundColor: isDark ? "#334155" : "#ffffff", color: isDark ? "#f1f5f9" : "#0f172a" },
        select: { width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, backgroundColor: isDark ? "#334155" : "#ffffff", color: isDark ? "#f1f5f9" : "#0f172a" },
        textarea: { width: "100%", padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, backgroundColor: isDark ? "#334155" : "#ffffff", color: isDark ? "#f1f5f9" : "#0f172a", minHeight: "80px", resize: "vertical" as const },
        checkboxContainer: { display: "flex", alignItems: "flex-start", gap: "0.5rem", marginTop: "0.5rem", padding: "0.75rem", border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`, borderRadius: "0.375rem" },
        actionFooter: { display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" },
        cancelButton: { padding: "0.5rem 1rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, background: "transparent", color: isDark ? "#f1f5f9" : "#0f172a", cursor: "pointer" },
        saveButton: { padding: "0.5rem 1rem", borderRadius: "0.375rem", backgroundColor: "#0f172a", color: "#ffffff", border: "none", cursor: "pointer" }
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Custos Fixos e Parcelas</h2>
                    <p style={styles.subtitle}>Gestão de despesas recorrentes e financiamentos</p>
                </div>
                <button style={styles.primaryButton} onClick={handleOpenModal}>
                    <Plus size={16} /> Novo Custo
                </button>
            </div>

            {/* Dashboard Grid */}
            <div style={styles.grid}>
                <div style={styles.card("#dbeafe", "#1e40af")}>
                    <div><span style={{ fontSize: "0.75rem" }}>Total Instalações (Ano)</span><div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>R$ {chartDataMonths.reduce((a, b) => a + b.Total, 0).toLocaleString()}</div></div>
                </div>
                <div style={styles.card("#dcfce7", "#166534")}>
                    <div><span style={{ fontSize: "0.75rem" }}>Pago (Ano)</span><div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>R$ {chartDataMonths.reduce((a, b) => a + b.Pago, 0).toLocaleString()}</div></div>
                </div>
                <div style={styles.card("#fee2e2", "#991b1b")}>
                    <div><span style={{ fontSize: "0.75rem" }}>Pendente (Ano)</span><div style={{ fontSize: "1.25rem", fontWeight: "bold" }}>R$ {chartDataMonths.reduce((a, b) => a + b.Pendente, 0).toLocaleString()}</div></div>
                </div>
            </div>

            {/* Charts Section */}
            <div style={styles.section}>
                <div style={styles.header}>
                    <h3 style={styles.title}>Custos Fixos por Mês</h3>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button style={styles.iconButton}>{"<"}</button>
                        <span>{selectedYear}</span>
                        <button style={styles.iconButton}>{">"}</button>
                    </div>
                </div>
                <div style={styles.chartContainer}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartDataMonths}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#334155" : "#e2e8f0"} />
                            <XAxis dataKey="name" stroke={styles.subtitle.color} />
                            <YAxis stroke={styles.subtitle.color} />
                            <Tooltip
                                contentStyle={{ backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }}
                                formatter={(value: number) => `R$ ${value.toLocaleString()}`}
                            />
                            <Legend />
                            <Bar dataKey="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Custo Total" />
                            <Bar dataKey="Pago" fill="#22c55e" radius={[4, 4, 0, 0]} name="Valor Pago" />
                            <Bar dataKey="Pendente" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Valor Pendente" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Installments List */}
            <div>
                {Object.entries(installmentsByVehicle).map(([vehicleId, insts]) => (
                    <div key={vehicleId} style={styles.vehicleGroup}>
                        <div style={styles.vehicleHeader}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div style={{ width: "24px", height: "24px", borderRadius: "4px", backgroundColor: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                                    <CheckCircle size={16} />
                                </div>
                                {getVehicleName(vehicleId)}
                            </div>
                            <span>R$ {insts.reduce((a, b) => a + Number(b.value), 0).toLocaleString()}</span>
                        </div>
                        <div>
                            {insts.map(inst => (
                                <div key={inst.id} style={styles.installmentRow}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{inst.costName || "Parcela"}</div>
                                        <div style={{ fontSize: "0.75rem", color: styles.subtitle.color }}>
                                            {inst.vendor || ""} • {new Date(inst.dueDate).toLocaleDateString()}
                                            {inst.totalInstallments && inst.totalInstallments > 1 && ` • (${inst.installmentNumber}/${inst.totalInstallments})`}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <span
                                            style={{ ...styles.tag(inst.status), cursor: "pointer" }}
                                            onClick={() => onUpdateInstallment(inst.id, { status: inst.status === 'Pago' ? 'Pendente' : 'Pago' })}
                                        >
                                            {inst.status}
                                        </span>
                                        <div style={{ fontWeight: "bold", width: "100px", textAlign: "right" }}>
                                            R$ {Number(inst.value).toFixed(2)}
                                        </div>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button style={styles.iconButton}><Edit size={16} /></button>
                                            <button style={styles.iconButton} onClick={() => onDelete(inst.fixedCostId)}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.5rem" }}>
                            <h3 style={styles.title}>{editingCost ? "Editar Custo Fixo" : "Novo Custo Fixo"}</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: isDark ? "#94a3b8" : "#64748b" }}>
                                <X size={20} />
                            </button>
                        </div>
                        <p style={{ ...styles.subtitle, marginBottom: "1rem" }}>Cadastre um novo custo fixo ou recorrente do veículo</p>

                        {/* Top Row: Veículo & Tipo */}
                        <div style={styles.formGrid}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Veículo</label>
                                <select
                                    style={styles.select}
                                    value={formData.vehicleId}
                                    onChange={e => setFormData({ ...formData, vehicleId: e.target.value })}
                                >
                                    <option value="">Selecione o veículo</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Tipo de Custo</label>
                                <select
                                    style={styles.select}
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="">Selecione o tipo</option>
                                    {COST_TYPES.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Descrição */}
                        <div style={{ ...styles.inputGroup, marginBottom: "1rem" }}>
                            <label style={styles.label}>Descrição</label>
                            <input
                                style={styles.input}
                                placeholder="Ex: Prestação BYD Dolphin"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Values & Dates Row */}
                        <div style={{ ...styles.formGrid, gridTemplateColumns: "1fr 1fr 1fr" }}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Valor (R$)</label>
                                <input
                                    type="number"
                                    style={styles.input}
                                    placeholder="0.00"
                                    value={formData.value}
                                    onChange={e => setFormData({ ...formData, value: e.target.value })}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Parcelas</label>
                                <input
                                    type="number"
                                    style={styles.input}
                                    placeholder="1 = Única"
                                    value={formData.totalInstallments}
                                    onChange={e => setFormData({ ...formData, totalInstallments: e.target.value })}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Data Início</label>
                                <input
                                    type="date"
                                    style={styles.input}
                                    value={formData.specificDate}
                                    onChange={e => setFormData({ ...formData, specificDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Vendor (Optional) */}
                        <div style={{ ...styles.inputGroup, marginBottom: "1rem" }}>
                            <label style={styles.label}>Fornecedor / Loja (Opcional)</label>
                            <input
                                style={styles.input}
                                placeholder="Ex: Santander, Mercado Livre, Oficina X"
                                value={formData.vendor}
                                onChange={e => setFormData({ ...formData, vendor: e.target.value })}
                            />
                        </div>

                        {/* Recorrência */}
                        <div style={styles.checkboxContainer}>
                            <input
                                type="checkbox"
                                id="isRecurring"
                                checked={formData.isRecurring}
                                onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
                            />
                            <div>
                                <label htmlFor="isRecurring" style={{ ...styles.label, cursor: "pointer" }}>Repetir mensalmente (Indefinido)</label>
                                <p style={{ fontSize: "0.75rem", color: styles.subtitle.color }}>Use para contas como Energia, Seguro mensal, etc.</p>
                            </div>
                        </div>

                        {/* Observação */}
                        <div style={{ ...styles.inputGroup, marginTop: "1rem" }}>
                            <label style={styles.label}>Observação</label>
                            <textarea
                                style={styles.textarea}
                                placeholder="Informações adicionais"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            />
                        </div>

                        {/* Footer Buttons */}
                        <div style={styles.actionFooter}>
                            <button style={styles.cancelButton} onClick={() => setIsModalOpen(false)}>Cancelar</button>
                            <button style={styles.saveButton} onClick={() => { onSave(formData); setIsModalOpen(false); }}>Salvar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
