
import { useState, useEffect } from "react";
import { Clock, Wallet, User } from "lucide-react";
import { useTheme } from "../../../../contexts/ThemeContext";

interface AddRideFormProps {
    onBack: () => void;
    onSave: (type: "APP" | "PARTICULAR", value: number) => void;
    isSubmitting: boolean;
}

export default function AddRideForm({ onBack, onSave, isSubmitting }: AddRideFormProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [rideType, setRideType] = useState<"APP" | "PARTICULAR">("APP");
    const [rideValue, setRideValue] = useState("");
    const [rideCooldown, setRideCooldown] = useState(0); // Mock local cooldown to prevent double taps beyond isSubmitting

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

    const handleSave = () => {
        if (!rideValue) return;
        onSave(rideType, Number(rideValue));
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: colors.text }}>
                ← Voltar
            </button>

            <div style={cardStyle}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: colors.text }}>Adicionar Corrida</h2>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>Tipo de Corrida *</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => setRideType("APP")}
                            style={{
                                flex: 1, padding: '1.5rem', borderRadius: '8px',
                                border: rideType === "APP" ? `2px solid #3b82f6` : `1px solid ${colors.border}`,
                                backgroundColor: rideType === "APP" ? '#eff6ff' : colors.bg,
                                color: rideType === "APP" ? '#1d4ed8' : colors.text,
                                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <Wallet />
                            <span style={{ fontWeight: 'bold' }}>App</span>
                        </button>
                        <button
                            onClick={() => setRideType("PARTICULAR")}
                            style={{
                                flex: 1, padding: '1.5rem', borderRadius: '8px',
                                border: rideType === "PARTICULAR" ? `2px solid #22c55e` : `1px solid ${colors.border}`,
                                backgroundColor: rideType === "PARTICULAR" ? '#f0fdf4' : colors.bg,
                                color: rideType === "PARTICULAR" ? '#15803d' : colors.text,
                                cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                            }}
                        >
                            <User />
                            <span style={{ fontWeight: 'bold' }}>Particular</span>
                        </button>
                    </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>Valor (R$) *</label>
                    <input
                        type="number"
                        inputMode="decimal"
                        value={rideValue}
                        onChange={e => setRideValue(e.target.value)}
                        onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                        style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.bg, color: colors.text }}
                        placeholder="Digite o valor"
                        autoFocus
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={!rideValue || isSubmitting}
                    style={{
                        width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                        backgroundColor: (!rideValue || isSubmitting) ? colors.border : colors.green,
                        color: 'white', fontWeight: 'bold', cursor: (!rideValue || isSubmitting) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {isSubmitting ? 'Salvando...' : 'Salvar Corrida'}
                </button>
            </div>
        </div>
    );
}
