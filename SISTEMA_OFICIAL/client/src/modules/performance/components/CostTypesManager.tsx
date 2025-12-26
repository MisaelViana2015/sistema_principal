import React, { useState } from "react";
import {
    DollarSign, Zap, Car, Tag, Home, ShoppingCart, Package, Wifi, Phone, Users,
    Wrench, Briefcase, Coffee, AlertCircle, Plus, Edit, Trash2, X, Save
} from "lucide-react";
import { api } from "../../../lib/api";

interface CostTypesManagerProps {
    costTypes: any[];
    isDark: boolean;
    refetch: () => void;
}

const ICONS: Record<string, any> = {
    DollarSign, Zap, Car, Tag, Home, ShoppingCart, Package, Wifi, Phone, Users,
    Wrench, Briefcase, Coffee, AlertCircle
};

const COLORS = [
    { name: "Blue", value: "blue", hex: "#3b82f6" },
    { name: "Green", value: "green", hex: "#22c55e" },
    { name: "Red", value: "red", hex: "#ef4444" },
    { name: "Yellow", value: "yellow", hex: "#eab308" },
    { name: "Purple", value: "purple", hex: "#a855f7" },
    { name: "Orange", value: "orange", hex: "#f97316" },
    { name: "Cyan", value: "cyan", hex: "#06b6d4" },
    { name: "Gray", value: "gray", hex: "#6b7280" },
];

export function CostTypesManager({ costTypes, isDark, refetch }: CostTypesManagerProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<any>(null);
    const [formData, setFormData] = useState({ name: "", icon: "DollarSign", color: "blue", category: "Variável", visibleToDriver: true });
    const [loading, setLoading] = useState(false);

    const handleOpenModal = (type?: any) => {
        if (type) {
            setEditingType(type);
            setFormData({
                name: type.name || type.tipo, // Handle legacy 'tipo' field
                icon: type.icon || "DollarSign",
                color: type.color || "blue",
                category: type.category || "Variável",
                visibleToDriver: type.visibleToDriver !== false // Default to true if undefined
            });
        } else {
            setEditingType(null);
            setFormData({ name: "", icon: "DollarSign", color: "blue", category: "Variável", visibleToDriver: true });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) return;
        setLoading(true);
        try {
            if (editingType) {
                await api.put(`/financial/cost-types/${editingType.id}`, formData);
            } else {
                await api.post("/financial/cost-types", formData);
            }
            refetch();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving cost type", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este tipo de custo?")) return;
        try {
            await api.delete(`/financial/cost-types/${id}`);
            refetch();
        } catch (error) {
            console.error("Error deleting cost type", error);
        }
    };

    const styles = {
        container: { display: 'flex', flexDirection: 'column' as const, gap: '1rem' },
        header: { display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' },
        card: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '0.5rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        iconWrapper: (color: string) => {
            const c = COLORS.find(c => c.value === color) || COLORS[0];
            return {
                width: '40px', height: '40px',
                borderRadius: '0.5rem',
                backgroundColor: isDark ? `${c.hex}20` : `${c.hex}20`,
                color: c.hex,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            };
        },
        primaryButton: {
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.5rem 1rem", borderRadius: "0.375rem",
            border: "none", color: "white",
            background: "#2563eb",
            fontSize: "0.875rem", cursor: "pointer", fontWeight: "500"
        },
        actionButton: {
            padding: "0.25rem", borderRadius: "0.25rem", border: "none",
            backgroundColor: "transparent", color: isDark ? "#cbd5e1" : "#64748b",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
        },
        modalOverlay: {
            position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50
        },
        modalBody: {
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            padding: "1.5rem", borderRadius: "0.5rem", width: "400px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`
        },
        inputGroup: { display: "flex", flexDirection: "column" as const, gap: "0.35rem", marginBottom: "1rem" },
        label: { fontSize: "0.75rem", fontWeight: "500", color: isDark ? "#cbd5e1" : "#64748b" },
        input: {
            padding: "0.5rem", borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#ffffff" : "#0f172a",
            fontSize: "0.875rem", width: "100%"
        },
        select: {
            padding: "0.5rem", borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#ffffff" : "#0f172a",
            fontSize: "0.875rem", width: "100%", cursor: "pointer"
        },
        colorGrid: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const },
        colorOption: (color: string, selected: boolean) => {
            const c = COLORS.find(cl => cl.value === color) || COLORS[0];
            return {
                width: '24px', height: '24px', borderRadius: '50%',
                backgroundColor: c.hex,
                border: selected ? `2px solid ${isDark ? '#fff' : '#000'}` : 'none',
                cursor: 'pointer'
            };
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <button style={styles.primaryButton} onClick={() => handleOpenModal()}>
                    <Plus size={16} /> Novo Tipo
                </button>
            </div>

            <div style={styles.grid}>
                {costTypes.map((type) => {
                    const Icon = ICONS[type.icon] || DollarSign;
                    return (
                        <div key={type.id} style={styles.card}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                                <div style={{ ...styles.iconWrapper(type.color || 'blue'), flexShrink: 0 }}>
                                    <Icon size={20} />
                                </div>
                                <span style={{ fontWeight: '500', color: isDark ? '#fff' : '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={type.name || type.tipo}>
                                    {type.name || type.tipo}
                                </span>
                                {type.visibleToDriver === false && (
                                    <span title="Invisível para Motorista" style={{ marginLeft: '0.5rem', color: '#ef4444' }}>
                                        <Users size={16} />
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button style={styles.actionButton} onClick={() => handleOpenModal(type)}><Edit size={16} /></button>
                                <button style={{ ...styles.actionButton, color: '#ef4444' }} onClick={() => handleDelete(type.id)}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalBody}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                            <h3 style={{ fontSize: "1.125rem", fontWeight: "bold", color: isDark ? "#fff" : "#000" }}>
                                {editingType ? "Editar Tipo" : "Novo Tipo"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} style={styles.actionButton}><X size={20} /></button>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Nome</label>
                            <input
                                style={styles.input}
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Combustível"
                            />
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Ícone</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', maxHeight: '150px', overflowY: 'auto', padding: '0.5rem', background: isDark ? '#0f172a' : '#f8fafc', borderRadius: '0.375rem' }}>
                                {Object.keys(ICONS).map(iconName => {
                                    const Icon = ICONS[iconName];
                                    const isSelected = formData.icon === iconName;
                                    return (
                                        <div
                                            key={iconName}
                                            onClick={() => setFormData({ ...formData, icon: iconName })}
                                            style={{
                                                padding: '0.5rem', borderRadius: '0.25rem',
                                                backgroundColor: isSelected ? (isDark ? '#374151' : '#e2e8f0') : 'transparent',
                                                cursor: 'pointer', display: 'flex', justifyContent: 'center'
                                            }}
                                        >
                                            <Icon size={20} color={isDark ? '#fff' : '#000'} />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Cor</label>
                            <div style={styles.colorGrid}>
                                {COLORS.map(c => (
                                    <div
                                        key={c.value}
                                        onClick={() => setFormData({ ...formData, color: c.value })}
                                        style={styles.colorOption(c.value, formData.color === c.value)}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        </div>

                        <div style={styles.inputGroup}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: isDark ? '#fff' : '#000' }}>
                                <input
                                    type="checkbox"
                                    checked={formData.visibleToDriver}
                                    onChange={e => setFormData({ ...formData, visibleToDriver: e.target.checked })}
                                    style={{ width: '1rem', height: '1rem' }}
                                />
                                Visível para Motorista
                            </label>
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1.5rem", gap: "0.5rem" }}>
                            <button onClick={() => setIsModalOpen(false)} style={{ ...styles.input, width: "auto", cursor: 'pointer' }}>Cancelar</button>
                            <button onClick={handleSave} style={{ ...styles.primaryButton, marginBottom: 0 }} disabled={loading}>
                                <Save size={16} /> {loading ? "Salvando..." : "Salvar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CostTypesManager;
