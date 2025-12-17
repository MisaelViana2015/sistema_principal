
import React, { useState } from "react";
import {
    DollarSign, Zap, Car, Tag, Home, ShoppingCart, Package, Wifi, Phone, Users,
    Plus, Edit, Trash2, X
} from "lucide-react";
import { api } from "../../../lib/api";
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from "../../../lib/costTypes";

export function CostTypesManager({ costTypes, isDark, refetch }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<any>(null);
    const [formData, setFormData] = useState({ name: "", icon: "dollar-sign", color: "orange" });
    const [loading, setLoading] = useState(false);

    const handleOpenModal = (type: any = null) => {
        if (type) {
            setEditingType(type);
            setFormData({ name: type.name, icon: type.icon || "dollar-sign", color: type.color || "orange" });
        } else {
            setEditingType(null);
            setFormData({ name: "", icon: "dollar-sign", color: "orange" });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name) return;
        setLoading(true);
        try {
            if (editingType) {
                await api.put(`/financial/cost-types/${editingType.id}`, { ...formData, category: 'Variável', description: 'Padrão' });
            } else {
                await api.post("/financial/cost-types", { ...formData, category: 'Variável', description: 'Padrão' });
            }
            refetch();
            setIsModalOpen(false);
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (type: any) => {
        const currentStatus = type.isActive !== false; // Default true if undefined
        const newStatus = !currentStatus;
        const action = newStatus ? "ativar" : "desativar";

        if (!confirm(`Tem certeza que deseja ${action} este item?`)) return;

        try {
            await api.put(`/financial/cost-types/${type.id}`, { isActive: newStatus });
            refetch();
        } catch (error) {
            console.error(error);
            alert(`Erro ao ${action}`);
        }
    };

    const styles = {
        card: {
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            borderRadius: "0.5rem",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "0.75rem",
        },
        iconBox: (colorName: string) => {
            const color = AVAILABLE_COLORS.find(c => c.value === colorName) || AVAILABLE_COLORS[0];
            return {
                width: "48px",
                height: "48px",
                borderRadius: "8px",
                backgroundColor: isDark ? `${color.hex}20` : color.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: color.hex,
                marginRight: "1rem"
            };
        },
        modalOverlay: {
            position: "fixed" as const,
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(2px)"
        },
        modalContent: {
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: "0.75rem",
            width: "500px",
            maxWidth: "90%",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            overflow: "hidden"
        },
        modalHeader: {
            padding: "1.5rem",
            borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start"
        },
        modalBody: {
            padding: "1.5rem",
            display: "flex",
            flexDirection: "column" as const,
            gap: "1.25rem"
        },
        modalFooter: {
            padding: "1rem 1.5rem",
            backgroundColor: isDark ? "#0f172a" : "#f8fafc",
            borderTop: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75rem"
        },
        input: {
            width: "100%",
            padding: "0.6rem 0.75rem",
            borderRadius: "0.375rem",
            border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`,
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            color: isDark ? "#ffffff" : "#0f172a",
            fontSize: "0.875rem",
            outline: "none"
        },
        label: {
            display: "block",
            fontSize: "0.875rem",
            fontWeight: 500,
            color: isDark ? "#cbd5e1" : "#4b5563",
            marginBottom: "0.35rem"
        }
    };



    const SelectedIcon = AVAILABLE_ICONS.find(i => i.value === formData.icon)?.icon || DollarSign;
    const selectedColor = AVAILABLE_COLORS.find(c => c.value === formData.color) || AVAILABLE_COLORS[0];

    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "700", color: isDark ? "#fff" : "#1e293b", margin: 0 }}>Tipos de Custo</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => handleOpenModal()}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.5rem",
                            padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none",
                            color: "white", background: "#0f172a", fontSize: "0.875rem", fontWeight: "500", cursor: "pointer"
                        }}
                    >
                        <Plus size={16} /> Adicionar Tipo
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {costTypes.length === 0 && (
                    <div style={{
                        padding: "3rem",
                        textAlign: "center",
                        backgroundColor: isDark ? "#1e293b" : "#f8fafc",
                        borderRadius: "0.5rem",
                        border: `1px dashed ${isDark ? "#334155" : "#cbd5e1"}`,
                        color: isDark ? "#94a3b8" : "#64748b"
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                            <Package size={48} style={{ opacity: 0.5 }} />
                        </div>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "600", marginBottom: "0.5rem", color: isDark ? "#fff" : "#0f172a" }}>
                            Nenhum tipo de custo encontrado
                        </h3>
                        <p style={{ marginBottom: "1.5rem" }}>
                            Parece que não há tipos de custo cadastrados.
                        </p>
                        <button
                            onClick={async () => {
                                if (!confirm("Deseja restaurar os tipos de custo padrão?")) return;
                                setLoading(true);
                                try {
                                    await api.post("/financial/cost-types/restore-defaults");
                                    refetch();
                                    alert("Tipos de custo restaurados com sucesso!");
                                } catch (error) {
                                    console.error(error);
                                    alert("Erro ao restaurar.");
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            disabled={loading}
                            style={{
                                padding: "0.75rem 1.5rem",
                                borderRadius: "0.5rem",
                                border: "none",
                                background: isDark ? "#3b82f6" : "#2563eb",
                                color: "white",
                                fontWeight: "600",
                                cursor: loading ? "not-allowed" : "pointer",
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? "Restaurando..." : "Restaurar Padrões"}
                        </button>
                    </div>
                )}
                {costTypes.map((type: any) => {
                    const Icon = AVAILABLE_ICONS.find(i => i.value === type.icon)?.icon || DollarSign;
                    const colorName = type.color || 'orange';

                    return (
                        <div key={type.id} style={styles.card}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={styles.iconBox(colorName)}>
                                    <Icon size={24} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: "600", fontSize: "1rem", color: isDark ? "#fff" : "#0f172a" }}>{type.name}</div>
                                    <div style={{
                                        fontSize: "0.75rem",
                                        fontWeight: "600",
                                        marginTop: "4px",
                                        color: type.isActive !== false ? "#22c55e" : "#ef4444",
                                        background: type.isActive !== false ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        display: "inline-block"
                                    }}>
                                        {type.isActive !== false ? "Ativo" : "Inativo"}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button title="Editar" onClick={() => handleOpenModal(type)} style={{ padding: "0.5rem", borderRadius: "0.375rem", border: "none", background: "transparent", color: isDark ? "#94a3b8" : "#64748b", cursor: "pointer" }}>
                                    <Edit size={16} />
                                </button>
                                <button
                                    title={type.isActive !== false ? "Desativar" : "Ativar"}
                                    onClick={() => handleToggleStatus(type)}
                                    style={{
                                        padding: "0.5rem", borderRadius: "0.375rem", border: "none", background: "transparent",
                                        color: type.isActive !== false ? "#ef4444" : "#22c55e",
                                        cursor: "pointer"
                                    }}
                                >
                                    {type.isActive !== false ? <Trash2 size={16} /> : <Plus size={16} style={{ transform: 'rotate(45deg)' }} />}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {isModalOpen && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div style={styles.modalHeader}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: "600", color: isDark ? "#fff" : "#0f172a" }}>
                                    {editingType ? "Editar Tipo de Custo" : "Novo Tipo de Custo"}
                                </h3>
                                <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                                    {editingType ? "Atualize as informações do tipo de custo." : "Crie um novo tipo de custo personalizado."}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", color: isDark ? "#94a3b8" : "#64748b", cursor: "pointer" }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={styles.modalBody}>
                            <div>
                                <label style={styles.label}>Nome</label>
                                <input
                                    style={styles.input}
                                    placeholder="Ex: Estacionamento"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label style={styles.label}>Ícone</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        style={{ ...styles.input, paddingLeft: '2.5rem', appearance: 'none' }}
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    >
                                        {AVAILABLE_ICONS.map(icon => (
                                            <option key={icon.value} value={icon.value}>{icon.label}</option>
                                        ))}
                                    </select>
                                    <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: isDark ? "#cbd5e1" : "#4b5563" }}>
                                        <SelectedIcon size={16} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label style={styles.label}>Cor</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        style={{ ...styles.input, paddingLeft: '2.5rem', appearance: 'none' }}
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                    >
                                        {AVAILABLE_COLORS.map(color => (
                                            <option key={color.value} value={color.value}>{color.label}</option>
                                        ))}
                                    </select>
                                    <div style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                        <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: selectedColor.hex }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={styles.modalFooter}>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, background: "transparent", color: isDark ? "#fff" : "#0f172a", fontSize: "0.875rem", fontWeight: "500", cursor: "pointer" }}
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", background: "#0f172a", color: "white", fontSize: "0.875rem", fontWeight: "500", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
                            >
                                {loading ? "Salvando..." : (editingType ? "Atualizar" : "Criar")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
