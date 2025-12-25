import { useState, useEffect } from "react";
import { Plus, Trash2, Disc, Filter } from "lucide-react";
import { tiresService, Tire } from "../../tires/tires.service";
// Use relative path to api if needed, or stick to service
// import { api } from "../../../lib/api";

export function TiresTab() {
    const [tires, setTires] = useState<Tire[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterVehicle, setFilterVehicle] = useState("all");

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const data = await tiresService.getAll();
            setTires(data);
        } catch (error) {
            console.error("Failed to load tires:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const filtered = tires.filter(t => {
        if (filterVehicle !== "all" && t.vehicleId !== filterVehicle) return false;
        return true;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex flex-col">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                        <Disc className="w-6 h-6 text-orange-500" />
                        Controle de Pneus
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Monitoramento de vida útil e trocas de pneus.
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg font-medium shadow-lg hover:shadow-orange-500/20 transition-all uppercase text-sm tracking-wide">
                    <Plus className="w-4 h-4" />
                    Novo Pneu
                </button>
            </div>

            {/* Filters */}
            <div className="bg-gray-900/5 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4 text-orange-500 font-bold uppercase text-sm tracking-wider">
                    <Filter className="w-4 h-4" />
                    Filtros de Pneus
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Veículo</label>
                        <select
                            value={filterVehicle}
                            onChange={(e) => setFilterVehicle(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500 transition-colors"
                        >
                            <option value="all">Todos os Veículos</option>
                            {/* Populate dynamically if needed */}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ano</label>
                        <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500 transition-colors">
                            <option value="all">Todos</option>
                            <option value="2025">2025</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mês</label>
                        <select className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500 transition-colors">
                            <option value="all">Todos</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">Carregando pneus...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Nenhum pneu registrado.</p>
                    </div>
                ) : (
                    <table className="w-full text-xs text-left">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-4 py-3">Data Inst.</th>
                                <th className="px-4 py-3">Veículo</th>
                                <th className="px-4 py-3">Posição</th>
                                <th className="px-4 py-3">Marca/Modelo</th>
                                <th className="px-4 py-3">Estado</th>
                                <th className="px-4 py-3">KM Inst.</th>
                                <th className="px-4 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                            {filtered.map((tire) => (
                                <tr key={tire.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                                    <td className="px-4 py-3 font-mono text-gray-600 dark:text-gray-300">
                                        {new Date(tire.installDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 font-bold text-white">
                                        {/* Need vehicle plate from join or extra lookup */}
                                        {tire.vehicleId?.substring(0, 8)}...
                                    </td>
                                    <td className="px-4 py-3 text-gray-300">{tire.position}</td>
                                    <td className="px-4 py-3 text-gray-400">{tire.brand} {tire.model}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase font-bold text-[10px]">
                                            {tire.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-gray-500">
                                        {tire.installKm} km
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button className="text-gray-500 hover:text-red-500">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
