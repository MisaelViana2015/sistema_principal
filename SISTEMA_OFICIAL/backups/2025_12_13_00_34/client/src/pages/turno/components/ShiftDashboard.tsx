
import React from 'react';
import {
    Clock, Plus, DollarSign, TrendingUp, Building, User, Wallet
} from "lucide-react";
import { formatCurrency, calculateShiftKPIs } from '../../../modules/shifts/shiftCalculations';
import { useTheme } from '../../../contexts/ThemeContext';

interface ShiftDashboardProps {
    activeShift: any;
    user: any;
    vehicle?: any;
    workedTime: string;
    rides: any[];
    expenses: any[];
    onAddRide: () => void;
    onAddCost: () => void;
    onFinishShift: () => void;
}

export default function ShiftDashboard({
    activeShift,
    user,
    vehicle,
    workedTime,
    rides,
    expenses,
    onAddRide,
    onAddCost,
    onFinishShift
}: ShiftDashboardProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Helper Styles
    const colors = {
        bg: isDark ? '#111827' : '#f9fafb',
        card: isDark ? '#1f2937' : '#fff',
        text: isDark ? '#fff' : '#111827',
        textMuted: isDark ? '#9ca3af' : '#6b7280',
        border: isDark ? '#374151' : '#e5e7eb',
        green: '#22c55e',
        red: '#ef4444',
        blue: '#3b82f6',
    };

    const cardStyle = {
        backgroundColor: colors.card,
        color: colors.text,
        borderRadius: '12px',
        padding: '1.5rem',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    };

    // Calculate dynamic values
    const kpis = calculateShiftKPIs(activeShift);

    // Helpers for Cost Icons
    const getCostTypeStyle = (typeName: string) => {
        const name = typeName.toLowerCase();
        if (name.includes('outros')) return { color: '#f97316', bg: '#fff7ed', icon: <DollarSign /> };
        if (name.includes('pedágio')) return { color: '#16a34a', bg: '#f0fdf4', icon: <DollarSign /> };
        if (name.includes('recarga app')) return { color: '#2563eb', bg: '#eff6ff', icon: <Wallet /> };
        if (name.includes('carro') || name.includes('abastecimento')) return { color: '#16a34a', bg: '#f0fdf4', icon: <Clock /> }; // Use Clock/Car as generic
        if (name.includes('alimentação')) return { color: '#db2777', bg: '#fce7f3', icon: <User /> };
        if (name.includes('manutenção')) return { color: '#dc2626', bg: '#fef2f2', icon: <DollarSign /> };
        return { color: '#6b7280', bg: '#f9fafb', icon: <DollarSign /> };
    };

    return (
        <div style={{ maxWidth: '1024px', margin: '0 auto', paddingBottom: '120px' }}>
            {/* Header */}
            <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '1rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: colors.text }}>
                        {user?.nome?.split(' ')[0] || 'Motorista'}
                    </h2>
                    <div style={{ color: colors.textMuted, fontSize: '0.75rem' }}>
                        {vehicle?.plate || '---'} — {vehicle?.modelo || '---'}
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ color: colors.textMuted, fontSize: '0.7rem' }}>Início</div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        {new Date(activeShift.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div style={{ color: colors.textMuted, fontSize: '0.7rem' }}>{activeShift.kmInicial} km</div>
                </div>
            </div>

            {/* Timer */}
            <div style={{ textAlign: 'center', marginBottom: '1rem', color: colors.textMuted, fontSize: '0.8rem' }}>
                <Clock className="w-4 h-4 inline mr-2" />
                Tempo Trabalhado: {workedTime}
            </div>

            {/* Main Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <button
                    onClick={onAddRide}
                    className="hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: colors.green, color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                    <Plus size={18} /> Add Corrida
                </button>
                <button
                    onClick={onAddCost}
                    className="hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: colors.red, color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                    <DollarSign size={18} /> Add Custo
                </button>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {/* BRUTO */}
                <div style={{ ...cardStyle, backgroundColor: '#fef9c3', borderColor: '#fde047', color: '#854d0e', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        <DollarSign size={14} /> Bruto
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                        {formatCurrency(kpis.totalReceita)}
                    </div>
                </div>

                {/* DESCONTOS */}
                <div style={{ ...cardStyle, backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        <TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} /> Descontos
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                        {formatCurrency(kpis.totalCustos)}
                    </div>
                </div>

                {/* LIQUIDO */}
                <div style={{ ...cardStyle, backgroundColor: '#dcfce7', borderColor: '#86efac', color: '#166534', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                        <TrendingUp size={14} /> Líquido
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                        {formatCurrency(kpis.lucroLiquido)}
                    </div>
                </div>
            </div>

            {/* Lists */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                {/* Last Rides */}
                <div style={cardStyle}>
                    <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Últimas Corridas</h3>
                    <div className="space-y-2">
                        {rides.slice(0, 5).map((r, i) => (
                            <div key={r.id || i} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                                <span className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${r.tipo === 'APP' ? 'bg-blue-500' : 'bg-green-500'}`} />
                                    {new Date(r.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <span className="font-bold">{formatCurrency(Number(r.valor))}</span>
                            </div>
                        ))}
                        {rides.length === 0 && <span className="text-gray-400 text-sm">Sem corridas ainda.</span>}
                    </div>
                </div>

                {/* Last Expenses */}
                <div style={cardStyle}>
                    <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Últimos Custos</h3>
                    <div className="space-y-2">
                        {expenses.slice(0, 5).map((e, i) => {
                            const typeName = e.tipo || 'Despesa';
                            const style = getCostTypeStyle(typeName);
                            return (
                                <div key={e.id || i} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                                    <span className="flex items-center gap-2">
                                        <span style={{ color: style.color }}>{style.icon}</span>
                                        {typeName}
                                    </span>
                                    <span className="font-bold text-red-500">{formatCurrency(Number(e.valor))}</span>
                                </div>
                            )
                        })}
                        {expenses.length === 0 && <span className="text-gray-400 text-sm">Sem custos registrados.</span>}
                    </div>
                </div>
            </div>

            {/* Footer Action */}
            <div style={{ marginTop: '2rem' }}>
                <button
                    onClick={onFinishShift}
                    className="hover:bg-gray-800 transition-colors"
                    style={{
                        width: '100%',
                        backgroundColor: 'black',
                        color: 'white',
                        padding: '1rem',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        fontSize: '1rem'
                    }}
                >
                    Encerrar Turno
                </button>
            </div>
        </div>
    );
}
