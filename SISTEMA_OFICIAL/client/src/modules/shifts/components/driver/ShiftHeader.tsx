import React from "react";
import { motion } from "framer-motion";

interface ShiftHeaderProps {
    user: any;
    activeShift: any;
    vehicle: any;
    workedTime: string;
}

export function ShiftHeader({ user, activeShift, vehicle, workedTime }: ShiftHeaderProps) {
    if (!activeShift) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="futuristic-card relative overflow-hidden mb-6 p-6 border-l-4 border-l-emerald-500 bg-gray-900/80 backdrop-blur-md"
        >
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <div className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Turno Ativo • Iniciado às {new Date(activeShift.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <h1 className="text-3xl font-orbitron font-bold text-white mb-1">
                        {user?.nome || 'Motorista'}
                    </h1>
                    <div className="text-gray-400 font-rajdhani font-semibold text-lg flex items-center gap-2">
                        <span className="text-emerald-400">{vehicle?.plate || '---'}</span>
                        <span>—</span>
                        <span>{vehicle?.modelo || 'Veículo'}</span>
                    </div>
                </div>

                <div className="bg-black/50 p-4 rounded-xl border border-gray-800 flex flex-col items-end min-w-[140px]">
                    <span className="text-gray-500 text-xs uppercase font-bold mb-1">Tempo Trabalhado</span>
                    <div className="text-2xl font-orbitron font-bold text-white flex items-center gap-2">
                        {workedTime}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
