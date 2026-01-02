import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertTriangle, Car } from "lucide-react";
import { ridesService } from "../../../rides/rides.service";

interface FinishShiftFormProps {
    activeShift: any;
    onFinish: (kmFinal: string) => void;
    onCancel: () => void;
    error: string;
}

export function FinishShiftForm({ activeShift, onFinish, onCancel, error }: FinishShiftFormProps) {
    const [kmFinal, setKmFinal] = useState("");
    const [fullRides, setFullRides] = useState<any[]>([]);

    useEffect(() => {
        if (activeShift) {
            ridesService.getAll({
                shiftId: activeShift.id,
                limit: 100
            }).then(res => setFullRides(Array.isArray(res.data) ? res.data : []));
        }
    }, [activeShift]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden"
            >
                <div className="relative z-10">
                    <button
                        onClick={onCancel}
                        className="mb-6 flex items-center text-gray-400 hover:text-white transition-colors text-sm uppercase font-bold tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </button>

                    <h2 className="text-2xl font-orbitron font-bold text-white mb-2">Encerrar Turno</h2>
                    <p className="text-gray-500 text-sm mb-8">Confira os dados e informe a quilometragem final.</p>

                    {/* Summary Card */}
                    <div className="bg-gray-800/50 rounded-xl p-4 mb-8 border border-gray-700">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <span className="block text-gray-500 text-xs uppercase mb-1">Total Bruto</span>
                                <span className="text-xl font-bold text-white">R$ {(activeShift.totalBruto || 0).toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs uppercase mb-1">Total Corridas</span>
                                <span className="text-xl font-bold text-emerald-400">{fullRides.length}</span>
                            </div>
                        </div>
                    </div>

                    {/* KM Final Input */}
                    <div className="mb-8">
                        <label className="block text-gray-500 text-xs uppercase font-bold mb-2 tracking-wider flex items-center gap-2">
                            <Car size={14} /> Quilometragem Final
                        </label>
                        <input
                            type="number"
                            inputMode="decimal"
                            value={kmFinal}
                            onChange={e => setKmFinal(e.target.value)}
                            className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 py-4 text-2xl font-bold text-white focus:border-red-500 focus:outline-none focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all font-mono"
                            placeholder={activeShift.kmInicial}
                            autoFocus
                        />
                        <p className="mt-2 text-xs text-gray-500">
                            KM Inicial: <span className="text-gray-300 font-mono">{activeShift.kmInicial}</span>
                        </p>
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

                    <button
                        onClick={() => onFinish(kmFinal)}
                        disabled={!kmFinal}
                        className={`w-full py-4 rounded-xl font-orbitron font-bold text-lg uppercase tracking-wider transition-all shadow-lg ${!kmFinal
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'
                            }`}
                    >
                        <CheckCircle2 className="w-5 h-5 inline-block mr-2" />
                        CONFIRMAR E ENCERRAR
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
