import React from "react";
import { motion } from "framer-motion";
import { Plus, DollarSign } from "lucide-react";

interface ShiftActionButtonsProps {
    onAddRide: () => void;
    onAddCost: () => void;
}

export function ShiftActionButtons({ onAddRide, onAddCost }: ShiftActionButtonsProps) {
    return (
        <div className="grid grid-cols-1 gap-4 mb-8">
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAddRide}
                className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 rounded-xl relative overflow-hidden group shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="flex items-center justify-center gap-3 text-white font-orbitron font-bold text-lg tracking-wide uppercase">
                    <Plus className="w-6 h-6" /> ADICIONAR CORRIDA
                </div>
            </motion.button>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onAddCost}
                className="w-full h-16 bg-red-600 hover:bg-red-500 rounded-xl relative overflow-hidden group shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <div className="flex items-center justify-center gap-3 text-white font-orbitron font-bold text-lg tracking-wide uppercase">
                    <DollarSign className="w-6 h-6" /> ADICIONAR CUSTO
                </div>
            </motion.button>
        </div>
    );
}
