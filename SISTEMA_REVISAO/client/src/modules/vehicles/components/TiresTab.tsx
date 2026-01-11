import { useState, useEffect } from "react";
import { Plus, Trash2, Disc, Filter, Activity, Calendar, DollarSign } from "lucide-react";
import { api } from "../../../lib/api";
import { vehiclesService } from "../vehicles.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Tire {
    id: string;
    position: string;
    brand: string;
    model: string;
    status: string;
    installDate: string;
    installKm: number;
    cost: string; // new field
    vehicleId: string;
    veiculoPlate?: string;
    veiculoModelo?: string;
}

interface Vehicle {
    id: string;
    plate: string;
    modelo: string;
}

const MONTHS = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
];

export function TiresTab() {
    const [tires, setTires] = useState<Tire[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [filterVehicle, setFilterVehicle] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterMonth, setFilterMonth] = useState("all");
    const [filterYear, setFilterYear] = useState("all");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newItem, setNewItem] = useState({
        vehicleId: "",
        brand: "",
        model: "",
        status: "Novo",
        installDate: new Date().toISOString().split('T')[0],
        installKm: "",
        cost: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setIsLoading(true);

        // Load vehicles independent of tires
        try {
            const vRes = await vehiclesService.getAll();
            setVehicles(vRes || []);
        } catch (error) {
            console.error("Failed to load vehicles:", error);
        }

        // Load tires
        try {
            const tRes = await api.get("/financial/tires");
            setTires(tRes.data);
        } catch (error) {
            console.error("Failed to load tires:", error);
            setTires([]);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm("Deseja realmente excluir este registro de pneu?")) {
            return;
        }
        try {
            await api.delete(`/financial/tires/${id}`);
            setTires(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            console.error("Failed to delete tire:", error);
            alert("Erro ao excluir pneu.");
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newItem.vehicleId || !newItem.brand || !newItem.model) {
            alert("Preencha os campos obrigatórios");
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post("/financial/tires", {
                vehicleId: newItem.vehicleId,
                position: "Estoque", // Default value as requested
                brand: newItem.brand,
                model: newItem.model,
                status: "Novo", // Default to Novo
                installDate: newItem.installDate,
                installKm: newItem.installKm ? parseInt(newItem.installKm) : 0,
                cost: newItem.cost ? parseFloat(newItem.cost.replace(',', '.')) : 0
            });

            setIsModalOpen(false);
            setNewItem({
                vehicleId: "",
                brand: "",
                model: "",
                status: "Novo",
                installDate: new Date().toISOString().split('T')[0],
                installKm: "",
                cost: ""
            });
            await loadData();
        } catch (error) {
            console.error("Failed to create tire:", error);
            alert("Erro ao registrar pneu.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const filtered = tires.filter(t => {
        if (filterVehicle !== "all" && t.vehicleId !== filterVehicle) return false;


        const date = new Date(t.installDate);
        const isValidDate = !isNaN(date.getTime());

        if (filterYear !== "all") {
            if (isValidDate) {
                const year = date.getFullYear().toString();
                if (year !== filterYear) return false;
            }
        }

        if (filterMonth !== "all") {
            if (isValidDate) {
                const month = (date.getMonth() + 1).toString();
                if (month !== filterMonth) return false;
            }
        }
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
                        Monitoramento de vida útil e custos de pneus.
                    </p>
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg font-medium shadow-lg hover:shadow-orange-500/20 transition-all uppercase text-sm tracking-wide">
                            <Plus className="w-4 h-4" />
                            Novo Pneu
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-gray-950 border-gray-800 text-gray-100">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-orange-500">
                                <Disc className="w-5 h-5" />
                                Registrar Pneu
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleCreate} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Veículo</Label>
                                <select
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-orange-500 outline-none"
                                    value={newItem.vehicleId}
                                    onChange={e => setNewItem({ ...newItem, vehicleId: e.target.value })}
                                    required
                                >
                                    <option value="">Selecione um veículo...</option>
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.plate} - {v.modelo}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Marca</Label>
                                    <Input
                                        placeholder="Ex: Michelin"
                                        className="bg-gray-900/50 border-gray-700 focus:border-orange-500"
                                        value={newItem.brand}
                                        onChange={e => setNewItem({ ...newItem, brand: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Modelo</Label>
                                    <Input
                                        placeholder="Ex: Primacy 4"
                                        className="bg-gray-900/50 border-gray-700 focus:border-orange-500"
                                        value={newItem.model}
                                        onChange={e => setNewItem({ ...newItem, model: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Valor (R$)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="pl-9 bg-gray-900/50 border-gray-700 focus:border-orange-500"
                                            value={newItem.cost}
                                            onChange={e => setNewItem({ ...newItem, cost: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Data Instalação</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <Input
                                            type="date"
                                            className="pl-9 bg-gray-900/50 border-gray-700 focus:border-orange-500 block w-full"
                                            value={newItem.installDate}
                                            onChange={e => setNewItem({ ...newItem, installDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">KM Instalação</Label>
                                    <div className="relative">
                                        <Activity className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <Input
                                            type="number"
                                            placeholder="Ex: 50000"
                                            className="pl-9 bg-gray-900/50 border-gray-700 focus:border-orange-500"
                                            value={newItem.installKm}
                                            onChange={e => setNewItem({ ...newItem, installKm: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button
                                    type="submit"
                                    className="bg-orange-600 hover:bg-orange-700 text-white font-bold"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Salvando..." : "Registrar Pneu"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
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
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.plate} - {v.modelo}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ano</label>
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500 transition-colors"
                        >
                            <option value="all">Todos</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mês</label>
                        <select
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                            className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:border-orange-500 transition-colors"
                        >
                            <option value="all">Todos</option>
                            {MONTHS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                        </select>
                    </div>
                    {/* Empty placeholder to keep grid layout nice if needed, or just let it be 3 cols */}
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
                                <th className="px-4 py-3">Marca/Modelo</th>
                                <th className="px-4 py-3">Valor</th>
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
                                    <td className="px-4 py-3 font-bold text-gray-700 dark:text-gray-200">
                                        {tire.veiculoPlate || "N/A"}
                                    </td>
                                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{tire.brand} {tire.model}</td>

                                    <td className="px-4 py-3 font-mono text-green-500 font-bold">
                                        {tire.cost ? `R$ ${parseFloat(tire.cost).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-gray-500">
                                        {tire.installKm} km
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => handleDelete(tire.id)}
                                            className="text-gray-500 hover:text-red-500"
                                            title="Excluir"
                                        >
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
