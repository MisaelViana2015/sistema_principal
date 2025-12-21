
import React, { useState, useEffect } from "react";
import { DollarSign, Wallet, Car, User } from "lucide-react";
import { useTheme } from "../../../../contexts/ThemeContext";
import { api } from "../../../lib/api";

interface AddCostFormProps {
    onBack: () => void;
    onSave: (costTypeId: string, value: number, obs: string) => void;
    isSubmitting: boolean;
}

export default function AddCostForm({ onBack, onSave, isSubmitting }: AddCostFormProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [selectedCostType, setSelectedCostType] = useState<any>(null);
    const [costValue, setCostValue] = useState("");
    const [obs, setObs] = useState("");
    const [costTypesList, setCostTypesList] = useState<any[]>([]);

    useEffect(() => {
        api.get("/financial/cost-types").then(res => setCostTypesList(res.data));
    }, []);

    const colors = {
        bg: isDark ? '#111827' : '#f9fafb',
        card: isDark ? '#1f2937' : '#fff',
        text: isDark ? '#fff' : '#111827',
        border: isDark ? '#374151' : '#e5e7eb',
        green: '#22c55e',
    };

    const cardStyle = {
        backgroundColor: colors.card,
        color: colors.text,
        borderRadius: '12px',
        padding: '1.5rem',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    };

    // Helper to get cost type style (Duplicate of logic, could be shared util)
    const getCostTypeStyle = (type: any) => {
        const name = type.name.toLowerCase();
        if (name.includes('outros')) return { color: '#f97316', bg: '#fff7ed', icon: <DollarSign /> };
        if (name.includes('pedágio')) return { color: '#16a34a', bg: '#f0fdf4', icon: <DollarSign /> };
        if (name.includes('recarga app')) return { color: '#2563eb', bg: '#eff6ff', icon: <Wallet /> };
        if (name.includes('carro') || name.includes('abastecimento')) return { color: '#16a34a', bg: '#f0fdf4', icon: <Car /> };
        if (name.includes('alimentação')) return { color: '#db2777', bg: '#fce7f3', icon: <User /> };
        if (name.includes('manutenção')) return { color: '#dc2626', bg: '#fef2f2', icon: <DollarSign /> };
        return { color: '#6b7280', bg: '#f9fafb', icon: <DollarSign /> };
    };

    const handleSave = () => {
        if (!costValue || !selectedCostType) return;
        onSave(selectedCostType.id, Number(costValue), obs);
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: colors.text }}>
                ← Voltar
            </button>

            <div style={cardStyle}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: colors.text }}>Adicionar Custo</h2>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>Tipo de Custo *</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {costTypesList.map(type => {
                            const style = getCostTypeStyle(type);
                            const isSelected = selectedCostType?.id === type.id;
                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedCostType(type)}
                                    style={{
                                        width: '100%', padding: '1rem', borderRadius: '8px',
                                        border: isSelected ? `2px solid ${style.color}` : `1px solid ${colors.border}`,
                                        backgroundColor: isSelected ? style.bg : colors.bg,
                                        color: isSelected ? style.color : colors.text,
                                        display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontWeight: 'bold'
                                    }}
                                >
                                    <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: style.bg, color: style.color }}>
                                        {style.icon}
                                    </div>
                                    {type.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>Valor (R$) *</label>
                    <input
                        type="number"
                        inputMode="decimal"
                        value={costValue}
                        onChange={e => setCostValue(e.target.value)}
                        onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                        style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.bg, color: colors.text }}
                        placeholder="Digite o valor"
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>Observação (opcional)</label>
                    <textarea
                        value={obs}
                        onChange={e => setObs(e.target.value)}
                        style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.bg, color: colors.text, minHeight: '100px' }}
                        placeholder="Detalhes adicionais..."
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={!costValue || !selectedCostType || isSubmitting}
                    style={{
                        width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                        backgroundColor: (!costValue || !selectedCostType || isSubmitting) ? colors.border : colors.green,
                        color: 'white', fontWeight: 'bold', cursor: (!costValue || !selectedCostType || isSubmitting) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isSubmitting ? 'Salvando...' : 'Salvar Custo'}
                </button>
            </div>
        </div>
    );
}
