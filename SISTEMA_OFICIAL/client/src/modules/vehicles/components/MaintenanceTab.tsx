import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Wrench, ChevronDown, Calendar, DollarSign, Filter, Search } from "lucide-react";
import { api } from "../../../lib/api";

interface Maintenance {
    id: string;
    notes: string;
    valor: string | number;
    data: string;
    veiculoId: string;
    veiculoPlate?: string;
    veiculoModelo?: string;
    km?: number;
    tipo?: string;
}

export function MaintenanceTab() {
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterVehicle, setFilterVehicle] = useState("all");
    const [filterMonth, setFilterMonth] = useState("all");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            // TODO: Ensure this endpoint exists or use expenses with type filter
            // For now, using a hypothetical legacy-maintenances endpoint or matching existing patterns
            // Use existing vehiclesService logic if available.
            // fallback to empty or mock if endpoint fails during dev
            const res = await api.get("/financial/legacy-maintenances");
            setMaintenances(res.data);
        } catch (error) {
            console.error("Failed to load maintenances:", error);
            // Fallback to empty to avoid crash if API missing
            setMaintenances([]);
        } finally {
            setIsLoading(false);
        }
    }

    const filtered = maintenances.filter(m => {
        if (filterVehicle !== "all" && m.veiculoId !== filterVehicle) return false;
        // Month filter logic here if needed
        return true;
    });

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return "Erro Data";
        return date.toLocaleDateString('pt-BR');
    };

    const formatCurrency = (val: string | number | undefined) => {
        const num = Number(val);
        if (isNaN(num)) return "R$ 0,00";
        return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                        <Wrench className="w-6 h-6 text-cyan-400" />
                        Histórico de Manutenções
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gerencie as manutenções da frota com estilo e precisão.
                    </p>
                </div>
                <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-bold shadow-lg hover:shadow-cyan-500/20 transition-all uppercase tracking-wider text-xs">
                    <Plus className="w-4 h-4" />
                    NOVA MANUTENÇÃO
                </button>
            </div>

            {/* Filters */}
            <div className="bg-gray-900/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-6 text-emerald-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                    <Filter className="w-4 h-4" />
                    FILTROS AVANÇADOS
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Veículo</label>
                        <select
                            value={filterVehicle}
                            onChange={(e) => setFilterVehicle(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:border-cyan-500 outline-none transition-all"
                        >
                            <option value="all">Todos os Veículos</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ano</label>
                        <select className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:border-cyan-500 outline-none transition-all">
                            <option value="all">Todos</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Mês</label>
                        <select
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:border-cyan-500 outline-none transition-all"
                        >
                            <option value="all">Todos</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="bg-gray-900/20 border border-gray-800 rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="text-center py-12 text-gray-500 font-medium animate-pulse">
                        Sincronizando registros legados...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Wrench className="w-12 h-12 mx-auto text-gray-700 mb-4 opacity-20" />
                        <p className="text-gray-500 text-sm font-medium">Nenhuma manutenção encontrada no histórico.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-gray-800/50 text-gray-500 font-bold uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4">Veículo</th>
                                    <th className="px-6 py-4">Descrição</th>
                                    <th className="px-6 py-4">Tipo</th>
                                    <th className="px-6 py-4">KM</th>
                                    <th className="px-6 py-4">Valor</th>
                                    <th className="px-6 py-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {filtered.map((item) => (
                                    <tr key={item.id} className="hover:bg-cyan-500/5 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-gray-400">
                                            {formatDate(item.data)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                                <span className="font-bold text-gray-200">{item.veiculoPlate || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 group-hover:text-gray-200 transition-colors">
                                            {item.notes || "Sem descrição"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase text-[10px]">
                                                {item.tipo || "GERAL"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-500">
                                            {item.km ? `${item.km} km` : "-"}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-400 font-mono">
                                            {formatCurrency(item.valor)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-600 hover:text-red-500 transition-colors p-1">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
