import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, DollarSign, AlertTriangle, Utensils, Fuel, Wrench, Smartphone } from "lucide-react";
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from "@/lib/costTypes";

interface AddExpenseFormProps {
    onSave: (value: string, costType: any, obs: string, isSplitCost: boolean) => void;
    onCancel: () => void;
    costTypes: any[];
    isSubmitting: boolean;
    error: string;
}

export function AddExpenseForm({ onSave, onCancel, costTypes, isSubmitting, error }: AddExpenseFormProps) {
    const [selectedCostType, setSelectedCostType] = useState<any>(null);
    const [costValue, setCostValue] = useState("");
    const [obs, setObs] = useState("");
    const [isSplitCost, setIsSplitCost] = useState(false);

    // Helper to get cost type style
    const getCostTypeStyle = (type: any) => {
        if (!type || !type.name) {
            return { color: '#9ca3af', bg: '#374151', border: '#4b5563', icon: <DollarSign /> };
        }

        // 1. Try to use dynamic properties from DB
        try {
            if (type.icon && type.color) {
                const iconData = AVAILABLE_ICONS.find(i => i.value === type.icon);
                const colorData = AVAILABLE_COLORS.find(c => c.value === type.color);

                if (iconData && colorData) {
                    const IconComponent = iconData.icon;
                    return {
                        color: colorData.hex,
                        bg: colorData.bg,
                        border: colorData.hex,
                        icon: <IconComponent />
                    };
                }
            }
        } catch (err) { console.error(err); }

        // 2. Legacy Fallback with Better Colors
        const lowerName = type.name.toLowerCase();

        if (lowerName.includes('aliment') || lowerName.includes('refei'))
            return { color: '#eab308', bg: '#fefce8', border: '#eab308', icon: <Utensils /> };

        if (lowerName.includes('combust') || lowerName.includes('abastec') || lowerName.includes('gasolin') || lowerName.includes('etanol') || lowerName.includes('posto'))
            return { color: '#ef4444', bg: '#fef2f2', border: '#ef4444', icon: <Fuel /> };

        if (lowerName.includes('manuten') || lowerName.includes('oficina') || lowerName.includes('pneu') || lowerName.includes('oleo') || lowerName.includes('carro'))
            return { color: '#3b82f6', bg: '#eff6ff', border: '#3b82f6', icon: <Wrench /> };

        if (lowerName.includes('app') || lowerName.includes('recarga'))
            return { color: '#8b5cf6', bg: '#f5f3ff', border: '#8b5cf6', icon: <Smartphone /> };

        return { color: '#10b981', bg: '#ecfdf5', border: '#10b981', icon: <DollarSign /> };
    };

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden"
            >
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="relative z-10">
                    <button
                        onClick={onCancel}
                        className="mb-6 flex items-center text-gray-400 hover:text-white transition-colors text-sm uppercase font-bold tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </button>

                    <h2 className="text-2xl font-orbitron font-bold text-white mb-2">Novo Custo</h2>
                    <p className="text-gray-500 text-sm mb-8">Informe o valor e selecione o tipo de despesa.</p>

                    {/* Value Input */}
                    <div className="mb-6">
                        <label className="block text-gray-500 text-xs uppercase font-bold mb-2 tracking-wider">Valor Total</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold">R$</span>
                            <input
                                type="number"
                                inputMode="decimal"
                                value={costValue}
                                onChange={e => setCostValue(e.target.value)}
                                className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 pl-12 py-4 text-2xl font-bold text-white focus:border-red-500 focus:outline-none focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all font-mono"
                                placeholder="0,00"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Cost Types Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        {costTypes.map(type => {
                            const style = getCostTypeStyle(type);
                            const isSelected = selectedCostType?.id === type.id;

                            return (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedCostType(type)}
                                    className={`relative p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${isSelected
                                        ? `bg-[${style.bg}] border-[${style.border}] shadow-lg scale-105 ring-2 ring-[${style.border}]`
                                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                                        }`}
                                    style={isSelected ? {
                                        borderColor: style.border,
                                        backgroundColor: `${style.color}20`, // 20% opacity
                                        color: style.color
                                    } : {}}
                                >
                                    <div className={`${isSelected ? '' : 'text-gray-500'}`}>
                                        {style.icon}
                                    </div>
                                    <span className={`font-rajdhani font-bold text-xs uppercase text-center ${isSelected ? '' : 'text-gray-400'}`}>
                                        {type.name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Split Cost Checkbox */}
                    <div className="mb-6 flex items-center gap-3 p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <input
                            type="checkbox"
                            checked={isSplitCost}
                            onChange={(e) => setIsSplitCost(e.target.checked)}
                            className="w-5 h-5 rounded border-gray-600 text-emerald-500 focus:ring-emerald-500 bg-gray-900"
                        />
                        <div className="flex flex-col">
                            <span className="text-white text-sm font-bold">Dividir Custo (Empresa/Motorista)</span>
                            <span className="text-gray-500 text-xs">Ex: Lavagem, Manutenção Leve, etc.</span>
                        </div>
                    </div>


                    {/* Notes Input */}
                    <div className="mb-8">
                        <label className="block text-gray-500 text-xs uppercase font-bold mb-2 tracking-wider">Observação (Opcional)</label>
                        <textarea
                            value={obs}
                            onChange={e => setObs(e.target.value)}
                            className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-gray-500 focus:outline-none transition-all resize-none h-24"
                            placeholder="Detalhes sobre o custo..."
                        />
                    </div>

                    {/* Error Message */}
                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="mb-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4 flex items-center gap-3 text-red-200 text-sm font-bold"
                            >
                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action Button */}
                    <button
                        onClick={() => onSave(costValue, selectedCostType, obs, isSplitCost)}
                        disabled={!costValue || !selectedCostType || isSubmitting}
                        className={`w-full py-4 rounded-xl font-orbitron font-bold text-lg uppercase tracking-wider transition-all shadow-lg ${(!costValue || !selectedCostType || isSubmitting)
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'
                            }`}
                    >
                        {isSubmitting ? 'SALVANDO...' : 'CONFIRMAR CUSTO'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
