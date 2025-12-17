
import { useState } from "react";
import { Wallet, User, DollarSign, TrendingUp, Building } from "lucide-react";
import { useTheme } from "../../../../contexts/ThemeContext";
import { calculateShiftKPIs, formatCurrency, formatTime } from "../../../modules/shifts/shiftCalculations";

interface FinishShiftFormProps {
    activeShift: any;
    vehicle: any;
    user: any;
    rides: any[];
    onBack: () => void;
    onFinish: (kmFinal: string, password: string) => void;
    error?: string;
}

export default function FinishShiftForm({
    activeShift,
    vehicle,
    user,
    rides,
    onBack,
    onFinish,
    error
}: FinishShiftFormProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [kmFinal, setKmFinal] = useState("");
    const [password, setPassword] = useState("");

    const kpis = calculateShiftKPIs(activeShift, kmFinal ? Number(kmFinal) : undefined);
    const appRides = rides.filter(r => r.tipo === 'APP');
    const particularRides = rides.filter(r => r.tipo === 'PARTICULAR');

    const colors = {
        bg: isDark ? '#111827' : '#f9fafb',
        card: isDark ? '#1f2937' : '#fff',
        text: isDark ? '#fff' : '#111827',
        textMuted: isDark ? '#9ca3af' : '#6b7280',
        border: isDark ? '#374151' : '#e5e7eb',
    };

    const cardStyle = {
        backgroundColor: colors.card,
        color: colors.text,
        borderRadius: '12px',
        padding: '1.5rem',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem', paddingBottom: '200px' }}>
            <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: colors.text }}>
                ← Voltar
            </button>

            <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: colors.text }}>Encerramento de Turno</h2>
                <div style={{ color: colors.textMuted, fontSize: '0.875rem' }}>
                    Motorista: <span className="font-bold">{user?.nome}</span> <br />
                    {vehicle?.plate} — {vehicle?.modelo}
                </div>
            </div>

            {/* INPUTS DE FECHAMENTO */}
            <div style={{ ...cardStyle, marginBottom: '2rem', borderColor: error ? '#ef4444' : colors.border }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>KM Final *</label>
                    <input
                        type="number"
                        inputMode="numeric"
                        value={kmFinal}
                        onChange={e => setKmFinal(e.target.value)}
                        className="w-full p-4 text-xl rounded-lg border bg-transparent"
                        style={{ borderColor: colors.border, color: colors.text }}
                        placeholder={`Mínimo: ${activeShift.kmInicial}`}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>Senha de Confirmação *</label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full p-4 text-lg rounded-lg border bg-transparent"
                        style={{ borderColor: colors.border, color: colors.text }}
                        placeholder="Sua senha"
                    />
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm font-bold border border-red-200">
                        {error}
                    </div>
                )}

                <button
                    onClick={() => onFinish(kmFinal, password)}
                    className="w-full bg-black text-white font-bold py-4 rounded-lg hover:bg-gray-900 transition-colors"
                >
                    Confirmar Encerramento
                </button>
            </div>

            {/* App Summary */}
            <div style={{ ...cardStyle, marginBottom: '1rem', padding: '1.25rem' }}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500 text-white rounded-lg"><Wallet size={20} /></div>
                    <span className="font-bold text-lg">Aplicativo</span>
                </div>
                <div className="space-y-2 text-sm">
                    {appRides.map((ride, idx) => (
                        <div key={ride.id} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                            <span className="text-gray-500">{idx + 1} - {formatTime(ride.hora)}</span>
                            <span className="font-bold">{formatCurrency(Number(ride.valor))}</span>
                        </div>
                    ))}
                    <div className="flex justify-between font-bold text-base pt-2">
                        <span>Total APP</span>
                        <span>{formatCurrency(kpis.totalReceita - (Number(activeShift.totalParticular) || 0))}</span>
                        {/* Note: KPI Total Receita is sum of both, verifying logic consistency */}
                    </div>
                </div>
            </div>

            {/* Particular Summary */}
            <div style={{ ...cardStyle, marginBottom: '2rem', padding: '1.25rem' }}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500 text-white rounded-lg"><User size={20} /></div>
                    <span className="font-bold text-lg">Particular</span>
                </div>
                <div className="space-y-2 text-sm">
                    {particularRides.map((ride, idx) => (
                        <div key={ride.id} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                            <span className="text-gray-500">{idx + 1} - {formatTime(ride.hora)}</span>
                            <span className="font-bold">{formatCurrency(Number(ride.valor))}</span>
                        </div>
                    ))}
                    <div className="flex justify-between font-bold text-base pt-2">
                        <span>Total Particular</span>
                        <span>{formatCurrency(Number(activeShift.totalParticular) || 0)}</span>
                    </div>
                </div>
            </div>

            <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.1rem' }}>Resumo (Prévia)</h3>
            <div className="space-y-3 mb-8">
                {/* Receita Total */}
                <div style={{ backgroundColor: '#9a3412', color: 'white' }} className="rounded-lg p-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3 font-bold">
                        <div className="bg-white/20 p-1.5 rounded"><DollarSign size={18} /></div>
                        Receita Total
                    </div>
                    <div className="text-xl font-bold">{formatCurrency(kpis.totalReceita)}</div>
                </div>

                {/* Custos */}
                <div style={{ backgroundColor: '#dc2626', color: 'white' }} className="rounded-lg p-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3 font-bold">
                        <div className="bg-white/20 p-1.5 rounded"><TrendingUp size={18} style={{ transform: 'rotate(180deg)' }} /></div>
                        Custos
                    </div>
                    <div className="text-xl font-bold">{formatCurrency(kpis.totalCustos)}</div>
                </div>

                {/* Lucro Líquido */}
                <div style={{ backgroundColor: '#16a34a', color: 'white' }} className="rounded-lg p-4 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3 font-bold">
                        <div className="bg-white/20 p-1.5 rounded"><TrendingUp size={18} /></div>
                        Lucro Líquido
                    </div>
                    <div className="text-xl font-bold">{formatCurrency(kpis.lucroLiquido)}</div>
                </div>
            </div>
        </div>
    );
}
