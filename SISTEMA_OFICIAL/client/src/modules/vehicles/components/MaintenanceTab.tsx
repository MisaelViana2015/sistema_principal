import { useState, useEffect } from "react";
import { Wrench, Plus, Filter, Trash2, Calendar, DollarSign, Activity, FileText } from "lucide-react";
import { api } from "../../../lib/api";
import { vehiclesService } from "../vehicles.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

export function MaintenanceTab() {
    const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterVehicle, setFilterVehicle] = useState("all");
    const [filterMonth, setFilterMonth] = useState("all");
    const [filterYear, setFilterYear] = useState("all");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newItem, setNewItem] = useState({
        vehicleId: "",
        type: "",
        description: "",
        value: "",
        date: new Date().toISOString().split('T')[0],
        km: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setIsLoading(true);
            const [mRes, vRes] = await Promise.all([
                api.get("/financial/legacy-maintenances"),
                vehiclesService.getAll()
            ]);
            setMaintenances(mRes.data);
            setVehicles(vRes || []);
        } catch (error) {
            console.error("Failed to load data:", error);
            setMaintenances([]);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!window.confirm("Deseja realmente excluir esta manutenção? Esta ação não pode ser desfeita.")) {
            return;
        }

        try {
            await api.delete(`/financial/legacy-maintenances/${id}`);
            setMaintenances(prev => prev.filter(m => m.id !== id));
        } catch (error) {
            console.error("Failed to delete maintenance:", error);
            alert("Erro ao excluir manutenção. Tente novamente.");
        }
    }

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        if (!newItem.vehicleId || !newItem.value || !newItem.date) {
            alert("Preencha os campos obrigatórios");
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post("/financial/legacy-maintenances", {
                vehicleId: newItem.vehicleId,
                type: newItem.type || "Geral",
                description: newItem.description,
                value: parseFloat(newItem.value.replace(',', '.')),
                date: newItem.date,
                km: newItem.km ? parseInt(newItem.km) : null
            });

            setIsModalOpen(false);
            setNewItem({
                vehicleId: "",
                type: "",
                description: "",
                value: "",
                date: new Date().toISOString().split('T')[0],
                km: ""
            });
            await loadData(); // Refresh list
        } catch (error) {
            console.error("Failed to create maintenance:", error);
            alert("Erro ao criar manutenção.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const filtered = maintenances.filter(m => {
        if (filterVehicle !== "all" && m.veiculoId !== filterVehicle) return false;

        const date = new Date(m.data);
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

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogTrigger asChild>
                        <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-lg font-bold shadow-lg hover:shadow-cyan-500/20 transition-all uppercase tracking-wider text-xs">
                            <Plus className="w-4 h-4" />
                            NOVA MANUTENÇÃO
                        </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px] bg-gray-950 border-gray-800 text-gray-100">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-cyan-400">
                                <Wrench className="w-5 h-5" />
                                Nova Manutenção
                            </DialogTitle>
                        </DialogHeader>

                        <form onSubmit={handleCreate} className="space-y-4 mt-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Veículo</Label>
                                <select
                                    className="w-full bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-sm focus:border-cyan-500 outline-none"
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
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Tipo / Categoria</Label>
                                    <div className="relative">
                                        <Activity className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <Input
                                            placeholder="Ex: Troca de Óleo"
                                            className="pl-9 bg-gray-900/50 border-gray-700 focus:border-cyan-500"
                                            value={newItem.type}
                                            onChange={e => setNewItem({ ...newItem, type: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Valor (R$)</Label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0,00"
                                            className="pl-9 bg-gray-900/50 border-gray-700 focus:border-cyan-500"
                                            value={newItem.value}
                                            onChange={e => setNewItem({ ...newItem, value: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Data</Label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                                        <Input
                                            type="date"
                                            className="pl-9 bg-gray-900/50 border-gray-700 focus:border-cyan-500 block w-full"
                                            value={newItem.date}
                                            onChange={e => setNewItem({ ...newItem, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">KM Atual</Label>
                                    <Input
                                        type="number"
                                        placeholder="Ex: 50000"
                                        className="bg-gray-900/50 border-gray-700 focus:border-cyan-500"
                                        value={newItem.km}
                                        onChange={e => setNewItem({ ...newItem, km: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-500">Descrição / Observações</Label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                                    <Textarea
                                        placeholder="Detalhes adicionais..."
                                        className="pl-9 min-h-[80px] bg-gray-900/50 border-gray-700 focus:border-cyan-500"
                                        value={newItem.description}
                                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button
                                    type="submit"
                                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Salvando..." : "Salvar Manutenção"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
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
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.plate} - {v.modelo}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ano</label>
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:border-cyan-500 outline-none transition-all"
                        >
                            <option value="all">Todos</option>
                            <option value="2025">2025</option>
                            <option value="2024">2024</option>
                            <option value="2023">2023</option>
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
                            {MONTHS.map(m => (
                                <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
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
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-gray-600 hover:text-red-500 transition-colors p-1"
                                                title="Excluir"
                                            >
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
