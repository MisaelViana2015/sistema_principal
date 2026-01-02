import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Wallet, User, AlertTriangle, Clock } from "lucide-react";

interface AddRideFormProps {
    onSave: (value: string, type: "APP" | "PARTICULAR") => void;
    onCancel: () => void;
    isSubmitting: boolean;
    error: string;
    cooldown: number;
}

export function AddRideForm({ onSave, onCancel, isSubmitting, error, cooldown }: AddRideFormProps) {
    const [rideType, setRideType] = useState<"APP" | "PARTICULAR">("APP");
    const [rideValue, setRideValue] = useState("");

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden"
            >
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                <div className="relative z-10">
                    <button
                        onClick={onCancel}
                        className="mb-6 flex items-center text-gray-400 hover:text-white transition-colors text-sm uppercase font-bold tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                    </button>

                    <h2 className="text-2xl font-orbitron font-bold text-white mb-2">Novo Lançamento</h2>
                    <p className="text-gray-500 text-sm mb-8">Selecione o tipo e informe o valor da corrida.</p>

                    {/* Ride Type Switch */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                            onClick={() => setRideType("APP")}
                            className={`relative p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${rideType === 'APP'
                                ? 'bg-blue-900/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                                }`}
                        >
                            <Wallet className={`w-8 h-8 ${rideType === 'APP' ? 'animate-bounce' : ''}`} />
                            <span className="font-orbitron font-bold text-sm tracking-wider">APP</span>
                        </button>

                        <button
                            onClick={() => setRideType("PARTICULAR")}
                            className={`relative p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${rideType === 'PARTICULAR'
                                ? 'bg-orange-900/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                                : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                                }`}
                        >
                            <User className={`w-8 h-8 ${rideType === 'PARTICULAR' ? 'animate-bounce' : ''}`} />
                            <span className="font-orbitron font-bold text-sm tracking-wider">PARTICULAR</span>
                        </button>
                    </div>


                    {/* Value Input */}
                    <div className="mb-8">
                        <label className="block text-gray-500 text-xs uppercase font-bold mb-2 tracking-wider">Valor da Corrida</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold">R$</span>
                            <input
                                type="number"
                                inputMode="decimal"
                                value={rideValue}
                                onChange={e => setRideValue(e.target.value)}
                                className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 pl-12 py-4 text-2xl font-bold text-white focus:border-emerald-500 focus:outline-none focus:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all font-mono"
                                placeholder="0,00"
                                autoFocus
                            />
                        </div>
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

                    {/* Cooldown Warning */}
                    {cooldown > 0 && (
                        <div className="mb-6 bg-red-900/20 border border-red-900/50 rounded-lg p-3 flex items-center gap-3 text-red-400 text-xs">
                            <Clock className="w-4 h-4" />
                            <span>Aguarde {cooldown}s para o próximo lançamento de app.</span>
                        </div>
                    )}

                    {/* Action Button */}
                    <button
                        onClick={() => onSave(rideValue, rideType)}
                        disabled={!rideValue || cooldown > 0 || isSubmitting}
                        className={`w-full py-4 rounded-xl font-orbitron font-bold text-lg uppercase tracking-wider transition-all shadow-lg ${(!rideValue || cooldown > 0 || isSubmitting)
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                            }`}
                    >
                        {isSubmitting ? 'SALVANDO...' : 'CONFIRMAR LANÇAMENTO'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
