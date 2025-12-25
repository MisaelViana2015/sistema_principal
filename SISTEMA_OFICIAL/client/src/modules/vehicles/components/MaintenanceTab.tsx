import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Wrench, ChevronDown, Calendar, DollarSign, Filter, Search } from "lucide-react";
import { api } from "../../../lib/api";

interface Maintenance {
    id: string;
    description: string;
    value: number;
    date: string;
    vehicleId: string;
    vehiclePlate?: string; // If joined
    km?: number;
    notes?: string;
    type?: string;
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
        if (filterVehicle !== "all" && m.vehicleId !== filterVehicle) return false;
        // Month filter logic here if needed
        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
                        <Wrench className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        Histórico de Manutenções
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Gerencie as manutenções da frota com estilo e precisão.
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-lg font-medium shadow-lg hover:shadow-cyan-500/20 transition-all">
                    <Plus className="w-4 h-4" />
                    NOVA MANUTENÇÃO
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-green-500 font-bold uppercase text-sm tracking-wider">
                    <Filter className="w-4 h-4" />
                    Filtros Avançados
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Veículo</label>
                        <select
                            value={filterVehicle}
                            onChange={(e) => setFilterVehicle(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="all">Todos os Veículos</option>
                            {/* Populate with vehicles if passed as props */}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Ano</label>
                        <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none">
                            <option value="all">Todos</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Mês</label>
                        <select
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 outline-none"
                        >
                            <option value="all">Todos</option>
                            <option value="1">Janeiro</option>
                            {/* ... */}
                        </select>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Carregando...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                        <Wrench className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">Nenhuma manutenção encontrada.</p>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-medium uppercase text-xs">
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
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {filtered.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-300">
                                            {new Date(item.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                                <span className="font-bold text-gray-900 dark:text-white">{item.vehiclePlate || "N/A"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{item.description}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold uppercase">
                                                {item.type || "Geral"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-500 dark:text-gray-400">
                                            {item.km ? `${item.km} km` : "-"}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-green-600 dark:text-green-400 font-mono">
                                            R$ {Number(item.value).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-red-500 transition-colors">
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
