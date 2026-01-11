import React from "react";
import { Wallet, TrendingUp, Building, User, Smartphone } from "lucide-react";

interface ShiftMetricsProps {
    activeShift: any;
}

export function ShiftMetrics({ activeShift }: ShiftMetricsProps) {
    if (!activeShift) return null;

    return (
        <>
            {/* Metrics Dashboard */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-4">
                {/* BRUTO - LARGE */}
                <div className="col-span-1 md:col-span-1 futuristic-card p-3 md:p-4 bg-gray-900/50 border-emerald-900/30 border">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] md:text-xs uppercase mb-1 md:mb-2">
                        <Wallet className="w-3 h-3" /> Bruto
                    </div>
                    <div className="text-xl md:text-3xl font-orbitron font-bold text-white truncate">
                        R$ {(activeShift.totalBruto || 0).toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 uppercase">App + Part.</div>
                </div>

                {/* DESCONTOS */}
                <div className="col-span-1 md:col-span-1 futuristic-card p-3 md:p-4 bg-gray-900/50 border-red-900/30 border">
                    <div className="flex items-center gap-2 text-red-400 font-bold text-[10px] md:text-xs uppercase mb-1 md:mb-2">
                        <TrendingUp className="w-3 h-3 rotate-180" /> Descontos
                    </div>
                    <div className="text-xl md:text-3xl font-orbitron font-bold text-white truncate">
                        R$ {(activeShift.totalCustos || 0).toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 uppercase">Total Gastos</div>
                </div>

                {/* LIQUIDO */}
                <div className="col-span-1 md:col-span-1 futuristic-card p-3 md:p-4 bg-emerald-950/20 border-emerald-500/30 border">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-[10px] md:text-xs uppercase mb-1 md:mb-2">
                        <TrendingUp className="w-3 h-3" /> Líquido
                    </div>
                    <div className="text-xl md:text-3xl font-orbitron font-bold text-emerald-100 truncate">
                        R$ {((activeShift.totalBruto || 0) - (activeShift.totalCustos || 0)).toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1 uppercase">Receita Real</div>
                </div>

                {/* EMPRESA */}
                <div className="col-span-1 md:col-span-1 futuristic-card p-3 md:p-4 bg-gray-900/50 border-gray-800 border">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] md:text-xs uppercase mb-1 md:mb-2">
                        <Building className="w-3 h-3" /> Empresa (60%)
                    </div>
                    <div className="text-lg md:text-2xl font-orbitron font-bold text-gray-300 truncate">
                        R$ {(activeShift.repasseEmpresa || 0).toFixed(2).replace('.', ',')}
                    </div>
                </div>

                {/* DESC. EMPRESA */}
                <div className="col-span-1 md:col-span-1 futuristic-card p-3 md:p-4 bg-gray-900/50 border-gray-800 border opacity-80">
                    <div className="flex items-center gap-2 text-gray-500 font-bold text-[10px] md:text-xs uppercase mb-1 md:mb-2">
                        <Building className="w-3 h-3" /> Desc. Empresa
                    </div>
                    <div className="text-lg md:text-xl font-orbitron font-bold text-gray-400 truncate">
                        R$ {(activeShift.discountCompany || 0).toFixed(2).replace('.', ',')}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-8">
                {/* MOTORISTA */}
                <div className="col-span-1 md:col-span-1 futuristic-card p-3 md:p-4 bg-purple-900/10 border-purple-500/30 border">
                    <div className="flex items-center gap-2 text-purple-400 font-bold text-[10px] md:text-xs uppercase mb-1 md:mb-2">
                        <User className="w-3 h-3" /> Motorista (40%)
                    </div>
                    <div className="text-xl md:text-2xl font-orbitron font-bold text-white truncate">
                        R$ {(activeShift.repasseMotorista || 0).toFixed(2).replace('.', ',')}
                    </div>
                </div>

                {/* DESC. MOTORISTA */}
                <div className="col-span-1 md:col-span-1 futuristic-card p-3 md:p-4 bg-purple-900/10 border-purple-500/30 border opacity-80">
                    <div className="flex items-center gap-2 text-purple-400/70 font-bold text-[10px] md:text-xs uppercase mb-1 md:mb-2">
                        <User className="w-3 h-3" /> Desc. Mot.
                    </div>
                    <div className="text-lg md:text-xl font-orbitron font-bold text-purple-200/70 truncate">
                        R$ {(activeShift.discountDriver || 0).toFixed(2).replace('.', ',')}
                    </div>
                </div>

                <div className="col-span-1 md:col-span-1 futuristic-card p-3 md:p-4 bg-gray-900/50 border-gray-800 border">
                    <div className="flex items-center gap-2 text-gray-400 font-bold text-[10px] md:text-xs uppercase mb-1 md:mb-2">
                        <Smartphone className="w-3 h-3" /> App
                    </div>
                    <div className="flex items-end gap-2 flex-wrap">
                        <span className="text-xl md:text-2xl font-orbitron font-bold text-white">{activeShift.totalCorridasApp || 0}</span>
                        <span className="text-[10px] md:text-xs text-gray-500 mb-1">R$ {(activeShift.totalApp || 0).toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-1 futuristic-card p-3 md:p-4 bg-orange-900/10 border-orange-500/30 border">
                    <div className="flex items-center gap-2 text-orange-400 font-bold text-[10px] md:text-xs uppercase mb-1 md:mb-2">
                        <User className="w-3 h-3" /> Part.
                    </div>
                    <div className="flex items-end gap-2 flex-wrap">
                        <span className="text-xl md:text-2xl font-orbitron font-bold text-white">{activeShift.totalCorridasParticular || 0}</span>
                        <span className="text-[10px] md:text-xs text-gray-500 mb-1">R$ {(activeShift.totalParticular || 0).toFixed(2).replace('.', ',')}</span>
                    </div>
                </div>
            </div>
        </>
    );
}
