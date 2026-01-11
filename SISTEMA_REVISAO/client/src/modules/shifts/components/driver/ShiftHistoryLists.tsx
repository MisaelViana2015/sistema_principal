import React from "react";
import { History, Wallet, User, DollarSign, Tag } from "lucide-react";

interface ShiftHistoryListsProps {
    rides: any[];
    expenses: any[];
}

export function ShiftHistoryLists({ rides, expenses }: ShiftHistoryListsProps) {
    return (
        <div className="grid grid-cols-2 gap-2 mb-8">
            {/* CORRIDAS RECENTES */}
            <div className="futuristic-card p-5 bg-gray-900/80 border border-gray-800">
                <h3 className="text-emerald-400 font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
                    <History className="w-5 h-5" /> Corridas
                </h3>
                {(!rides || rides.length === 0) ? (
                    <p className="text-gray-600 text-sm italic">Nenhuma corrida registrada.</p>
                ) : (
                    <div className="space-y-3">
                        {rides.map((r) => (
                            <div key={r.id} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                                <div className="flex items-center gap-3">
                                    <div className={`p-1.5 rounded-md ${r.tipo === 'APP' ? 'bg-blue-900/20 text-blue-400' : 'bg-orange-900/20 text-orange-400'}`}>
                                        {r.tipo === 'APP' ? <Wallet size={14} /> : <User size={14} />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-300 font-bold text-xs">{r.tipo}</span>
                                        <span className="text-gray-500 text-[10px]">{new Date(r.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <span className="text-white font-bold font-mono">R$ {Number(r.valor).toFixed(2).replace('.', ',')}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CUSTOS RECENTES */}
            <div className="futuristic-card p-5 bg-gray-900/80 border border-gray-800">
                <h3 className="text-red-400 font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5" /> Custos
                </h3>
                {(!expenses || expenses.length === 0) ? (
                    <p className="text-gray-600 text-sm italic">Nenhum custo registrado.</p>
                ) : (
                    <div className="space-y-3">
                        {expenses.map(e => {
                            const typeName = e.tipo || 'Despesa';
                            return (
                                <div key={e.id} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-1.5 rounded-md bg-red-900/20 text-red-400">
                                            <Tag size={14} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-gray-300 font-bold text-xs">{typeName}</span>
                                            <span className="text-gray-500 text-[10px]">{new Date(e.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-red-400 font-bold font-mono">R$ {Number(e.valor).toFixed(2).replace('.', ',')}</span>
                                        {(e as any).isSplitCost && (
                                            <div className="text-[10px] text-gray-500 mt-1 flex flex-col items-end opacity-80">
                                                <span>🏢 Emp: R$ {(Number(e.valor) / 2).toFixed(2).replace('.', ',')}</span>
                                                <span>👤 Mot: R$ {(Number(e.valor) / 2).toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
