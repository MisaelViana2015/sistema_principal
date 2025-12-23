import React, { useState } from "react";
import { Plus, X, Calendar, Edit, Trash2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

interface FixedCost {
    id: string;
    vehicleId?: string; // Optional connection to vehicle
    type: string;
    description: string;
    value: number;
    date: string; // ISO date
    isPaid: boolean;
    isRecurring: boolean;
    frequency?: string;
    dueDate?: number;
    notes?: string;
}

interface Vehicle {
    id: string;
    plate: string;
    model: string;
}

interface FixedCostsManagerProps {
    costs: FixedCost[];
    vehicles: Vehicle[];
    onSave: (cost: any) => void;
    onDelete: (id: string) => void;
}

const COST_TYPES = [
    "Prestação", "Seguro", "IPVA", "Energia", "Licenciamento",
    "Empréstimo", "Rota77", "Outro"
];

export function FixedCostsManager({ costs, vehicles, onSave, onDelete }: FixedCostsManagerProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [isModalOpen, setIsModalOpen] = useState(false);
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
        notes: ""
    });

    const handleOpenModal = (cost?: FixedCost) => {
        if (cost) {
            setEditingCost(cost);
            setFormData({
                vehicleId: cost.vehicleId || "",
                type: cost.type,
                description: cost.description,
                value: cost.value.toString(),
                monthYear: cost.date.slice(0, 7), // YYYY-MM
                specificDate: cost.date.slice(0, 10),
                isRecurring: cost.isRecurring,
                notes: cost.notes || ""
            });
        } else {
            setEditingCost(null);
            setFormData({
                vehicleId: "",
                type: "",
                description: "",
                value: "",
                monthYear: "",
                specificDate: "",
                isRecurring: false,
                notes: ""
            });
        }
        setIsModalOpen(true);
    };

    const styles = {
        container: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "1.5rem",
            color: isDark ? "#e2e8f0" : "#1e293b",
        },
        header: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
        },
        title: {
            fontSize: "1.25rem",
            fontWeight: "bold",
            color: isDark ? "#f1f5f9" : "#0f172a",
        },
        subtitle: {
            fontSize: "0.875rem",
            color: isDark ? "#94a3b8" : "#64748b",
        },
        primaryButton: {
            backgroundColor: "#0f172a",
            color: "#ffffff",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
        },
        grid: {
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "1rem",
        },
        card: (bgColor: string, textColor: string = "#1e293b") => ({
            backgroundColor: bgColor,
            color: textColor,
            padding: "1rem",
            borderRadius: "0.5rem",
            display: "flex",
            flexDirection: "column" as const,
            justifyContent: "space-between",
            minHeight: "100px",
        }),
        cardLabel: {
            fontSize: "0.75rem",
            opacity: 0.8,
        },
        cardValue: {
            fontSize: "1.25rem",
            fontWeight: "bold",
            marginTop: "0.5rem",
        },
        cardSub: {
            fontSize: "0.75rem",
            marginTop: "0.25rem",
            opacity: 0.7,
        },
        // Modal Styles
        modalOverlay: {
            position: "fixed" as const,
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
        },
        modalContent: {
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            padding: "1.5rem",
            borderRadius: "0.5rem",
            width: "600px", // Wider modal for form
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            maxHeight: "90vh",
            overflowY: "auto" as const,
        },
        formGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1rem",
        },
        inputGroup: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.25rem",
        },
        label: {
            fontSize: "0.875rem",
            fontWeight: 500,
            color: isDark ? "#cbd5e1" : "#475569",
        },
        input: {
            width: "100%",
            padding: "0.5rem",
            borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
            backgroundColor: isDark ? "#334155" : "#ffffff",
            color: isDark ? "#f1f5f9" : "#0f172a",
        },
        select: {
            width: "100%",
            padding: "0.5rem",
            borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
            backgroundColor: isDark ? "#334155" : "#ffffff",
            color: isDark ? "#f1f5f9" : "#0f172a",
        },
        textarea: {
            width: "100%",
            padding: "0.5rem",
            borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
            backgroundColor: isDark ? "#334155" : "#ffffff",
            color: isDark ? "#f1f5f9" : "#0f172a",
            minHeight: "80px",
            resize: "vertical" as const,
        },
        checkboxContainer: {
            display: "flex",
            alignItems: "flex-start",
            gap: "0.5rem",
            marginTop: "0.5rem",
            padding: "0.75rem",
            border: `1px solid ${isDark ? "#475569" : "#e2e8f0"}`,
            borderRadius: "0.375rem",
        },
        actionFooter: {
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.5rem",
            marginTop: "1.5rem",
        },
        cancelButton: {
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
            background: "transparent",
            color: isDark ? "#f1f5f9" : "#0f172a",
            cursor: "pointer",
        },
        saveButton: {
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            border: "none",
            cursor: "pointer",
        }
    };

    // Placeholder data for the cards (Image 1 visualization)
    const summaryCards = [
        // Row 1: Custos
        { title: "Custos - Dia", value: "R$ 2.273,99", sub: "100%", bg: "#cffafe", text: "#155e75" },
        { title: "Custos - Semana", value: "R$ 2.273,99", sub: "100%", bg: "#dbeafe", text: "#1e40af" },
        { title: "Custos - Mês", value: "R$ 12.738,65", sub: "100%", bg: "#ede9fe", text: "#5b21b6" },
        { title: "Custos - Ano", value: "R$ 56.360,90", sub: "100%", bg: "#f3e8ff", text: "#6b21a8" },
        { title: "Custos - Total", value: "R$ 607.446,66", sub: "Total Geral", bg: "#dbeafe", text: "#1e40af" },

        // Row 2: Pago
        { title: "Pago - Dia", value: "R$ 0,00", sub: "0.0%", bg: "#67e8f9", text: "#0e7490" },
        { title: "Pago - Semana", value: "R$ 0,00", sub: "0.0%", bg: "#93c5fd", text: "#1e3a8a" },
        { title: "Pago - Mês", value: "R$ 0,00", sub: "0.0%", bg: "#c4b5fd", text: "#4c1d95" },
        { title: "Pago - Ano", value: "R$ 42.158,74", sub: "74.8%", bg: "#e9d5ff", text: "#581c87" },
        { title: "Pago - Total", value: "R$ 42.158,74", sub: "Total Geral", bg: "#a5b4fc", text: "#312e81" },

        // Row 3: Pendente
        { title: "Pendente - Dia", value: "R$ 2.273,99", sub: "100.0%", bg: "#22d3ee", text: "#0891b2" },
        { title: "Pendente - Semana", value: "R$ 2.273,99", sub: "100.0%", bg: "#60a5fa", text: "#1d4ed8" },
        { title: "Pendente - Mês", value: "R$ 12.738,65", sub: "100.0%", bg: "#a78bfa", text: "#4c1d95" },
        { title: "Pendente - Ano", value: "R$ 15.012,64", sub: "26.6%", bg: "#d8b4fe", text: "#6b21a8" },
        { title: "Pendente - Total", value: "R$ 566.098,40", sub: "Total Geral", bg: "#818cf8", text: "#312e81" },

        // Row 4: Juros (Darker / Stronger)
        { title: "Juros - Dia", value: "R$ 0,00", sub: "0.0%", bg: "#06b6d4", text: "#ffffff" },
        { title: "Juros - Semana", value: "R$ 0,00", sub: "0.0%", bg: "#3b82f6", text: "#ffffff" },
        { title: "Juros - Mês", value: "R$ 0,00", sub: "0.0%", bg: "#8b5cf6", text: "#ffffff" },
        { title: "Juros - Ano", value: "R$ 810,48", sub: "1.4%", bg: "#a855f7", text: "#ffffff" },
        { title: "Juros - Total", value: "R$ 810,48", sub: "Total Geral", bg: "#6366f1", text: "#ffffff" },
    ];

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Custos Fixos Avulsos</h2>
                    <p style={styles.subtitle}>Custos mensais individuais ou recorrentes</p>
                </div>
                <button style={styles.primaryButton} onClick={() => handleOpenModal()}>
                    <Plus size={16} /> Novo Custo
                </button>
            </div>

            {/* Dashboard Grid */}
            <div style={styles.grid}>
                {summaryCards.map((card, index) => (
                    <div key={index} style={styles.card(card.bg, card.text)}>
                        <div>
                            <span style={styles.cardLabel}>{card.title}</span>
                            <div style={styles.cardValue}>{card.value}</div>
                        </div>
                        <div style={styles.cardSub}>{card.sub}</div>
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
                                <label style={styles.label}>Mês/Ano</label>
                                <input
                                    type="month"
                                    style={styles.input}
                                    value={formData.monthYear}
                                    onChange={e => setFormData({ ...formData, monthYear: e.target.value })}
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Data Específica</label>
                                <input
                                    type="date"
                                    style={styles.input}
                                    value={formData.specificDate}
                                    onChange={e => setFormData({ ...formData, specificDate: e.target.value })}
                                />
                                <span style={{ fontSize: "0.7rem", color: styles.subtitle.color }}>Opcional. Se não informado, assume dia 1.</span>
                            </div>
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
                                <label htmlFor="isRecurring" style={{ ...styles.label, cursor: "pointer" }}>Repetir mensalmente</label>
                                <p style={{ fontSize: "0.75rem", color: styles.subtitle.color }}>Gera automaticamente múltiplos lançamentos mensais (útil para energia, seguro mensal, etc.)</p>
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

