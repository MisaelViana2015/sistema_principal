import React, { useState, useEffect } from "react";
import { Filter, Trash2, Plus, ArrowUp, ArrowDown, X, Wrench, Calendar, DollarSign, Activity } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { vehiclesService } from "../../../modules/vehicles/vehicles.service";
import { financialService } from "../../../modules/financial/financial.service";
import { Vehicle } from "../../../../../shared/schema";
import { api } from "../../../lib/api";

export default function ManutencoesTabLegacy() {
    const { theme } = useTheme();
    // const isDark = theme === "dark"; // Não precisamos mais disso, o theme controla via classe 'dark' no html/body

    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>("todos");
    const [selectedMonth, setSelectedMonth] = useState<string>("todos");
    const [selectedVehicle, setSelectedVehicle] = useState("todos");
    const [maintenances, setMaintenances] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Maintenance Form State
    const [newMaintenance, setNewMaintenance] = useState({
        vehicleId: "",
        date: new Date().toISOString().split('T')[0],
        type: "preventiva",
        description: "",
        km: "",
        value: "",
    });

    // Data Loading
    useEffect(() => {
        // 1. Load Vehicles
        vehiclesService.getAll()
            .then(data => setVehicles(data || []))
            .catch(error => console.error("Erro ao carregar veículos:", error));

        // 2. Load Maintenances
        const loadMaintenances = async () => {
            setIsLoading(true);
            try {
                const data = await financialService.getAllLegacyMaintenances();
                setMaintenances(data || []);
            } catch (error) {
                console.error("Erro ao carregar manutenções:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadMaintenances();
    }, []);

    // Extract available years from data
    const safeMaintenances = maintenances || [];
    const availableYears = Array.from(new Set(safeMaintenances.map(m => new Date(m.data).getFullYear()))).sort((a, b) => b - a);

    const filteredMaintenances = safeMaintenances.filter(m => {
        const mDate = new Date(m.data);

        // Filter by Vehicle
        if (selectedVehicle !== "todos" && m.veiculo !== null) {
            const selectedV = vehicles.find(v => v.id === selectedVehicle);
            if (selectedV && m.veiculo !== selectedV.plate) return false;
        }

        // Filter by Year
        if (selectedYear !== "todos" && mDate.getFullYear().toString() !== selectedYear) {
            return false;
        }

        // Filter by Month
        if (selectedMonth !== "todos" && (mDate.getMonth() + 1).toString() !== selectedMonth) {
            return false;
        }

        return true;
    }).sort((a, b) => {
        const dateA = new Date(a.data).getTime();
        const dateB = new Date(b.data).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    const handleSaveMaintenance = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newMaintenance.vehicleId || !newMaintenance.value || !newMaintenance.description) {
            alert("Preencha todos os campos obrigatórios.");
            return;
        }

        try {
            let costTypeId = "MANUTENÇÃO_CORRETIVA";
            if (newMaintenance.type === "preventiva") costTypeId = "MANUTENÇÃO_PREVENTIVA";
            if (newMaintenance.type === "pneus") costTypeId = "PNEUS";

            const payload = {
                costTypeId: costTypeId,
                value: Number(newMaintenance.value),
                date: new Date(newMaintenance.date),
                notes: `${newMaintenance.description} - Veículo: ${vehicles.find(v => v.id === newMaintenance.vehicleId)?.plate} - KM: ${newMaintenance.km}`,
            };

            await api.post("/expenses", payload);
            alert("Manutenção registrada com sucesso!");
            setIsModalOpen(false);
            window.location.reload();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar manutenção. Verifique se o tipo de custo é válido.");
        }
    };

    const getBadgeClass = (tipo: string) => {
        const t = tipo?.toLowerCase() || '';
        if (t.includes('preventiva')) return "badge-success";
        if (t.includes('corretiva')) return "badge-warning";
        return "badge-app";
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-glow uppercase tracking-wider text-white">
                        Histórico de Manutenções
                    </h2>
                    <p className="text-muted-foreground font-body text-sm mt-1">
                        Gerencie as manutenções da frota com estilo e precisão.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-futuristic flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-bold transition-transform active:scale-95"
                >
                    <Plus size={18} className="animate-pulse" />
                    Nova Manutenção
                </button>
            </div>

            {/* Filtros */}
            <div className="futuristic-card p-6 relative overflow-hidden group">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Wrench size={80} />
                </div>

                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-2 text-primary font-display font-bold uppercase tracking-wider">
                        <Filter size={18} />
                        Filtros Avançados
                    </div>
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-primary/30 text-primary hover:bg-primary/10 transition-colors text-sm font-medium"
                        onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                    >
                        {sortOrder === "desc" ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                        {sortOrder === "desc" ? "Recentes" : "Antigas"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Activity size={12} className="text-primary" /> Veículo
                        </label>
                        <select
                            className="w-full bg-background/50 border border-border/50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                            value={selectedVehicle}
                            onChange={(e) => setSelectedVehicle(e.target.value)}
                        >
                            <option value="todos">Todos os Veículos</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>
                                    {v.plate} - {v.modelo}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Calendar size={12} className="text-primary" /> Ano
                        </label>
                        <select
                            className="w-full bg-background/50 border border-border/50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                        >
                            <option value="todos">Todos</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Calendar size={12} className="text-primary" /> Mês
                        </label>
                        <select
                            className="w-full bg-background/50 border border-border/50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                        >
                            <option value="todos">Todos</option>
                            <option value="1">Janeiro</option>
                            <option value="2">Fevereiro</option>
                            <option value="3">Março</option>
                            <option value="4">Abril</option>
                            <option value="5">Maio</option>
                            <option value="6">Junho</option>
                            <option value="7">Julho</option>
                            <option value="8">Agosto</option>
                            <option value="9">Setembro</option>
                            <option value="10">Outubro</option>
                            <option value="11">Novembro</option>
                            <option value="12">Dezembro</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tabela */}
            <div className="futuristic-card p-0 overflow-hidden border-t-2 border-primary/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold tracking-wider">
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
                        <tbody className="divide-y divide-border/20">
                            {isLoading ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground animate-pulse">Carregando dados...</td></tr>
                            ) : filteredMaintenances.length === 0 ? (
                                <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Nenhuma manutenção encontrada nos filtros selecionados.</td></tr>
                            ) : (
                                filteredMaintenances.map((m) => (
                                    <tr key={m.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-4 text-white font-medium">
                                            {new Date(m.data).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-6 py-4 text-white">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-primary orb-indicator"></div>
                                                {m.veiculo}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{m.notes || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${getBadgeClass(m.tipo || 'Outro')}`}>
                                                {m.tipo || 'Outro'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground font-mono">{m.km ? `${m.km} km` : '-'}</td>
                                        <td className="px-6 py-4 font-bold text-glow-green text-primary font-mono">
                                            R$ {Number(m.valor).toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="futuristic-card w-full max-w-lg p-0 shadow-2xl border-primary/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-border/20 flex justify-between items-center bg-muted/20">
                            <h3 className="text-xl font-display font-bold text-glow text-white flex items-center gap-2">
                                <Plus size={20} className="text-primary" />
                                Nova Manutenção
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSaveMaintenance} className="p-6 space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Veículo</label>
                                    <select
                                        required
                                        className="w-full bg-background/50 border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-white"
                                        value={newMaintenance.vehicleId}
                                        onChange={e => setNewMaintenance({ ...newMaintenance, vehicleId: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.plate} - {v.modelo}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Data</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full bg-background/50 border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-white"
                                            value={newMaintenance.date}
                                            onChange={e => setNewMaintenance({ ...newMaintenance, date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Tipo</label>
                                        <select
                                            className="w-full bg-background/50 border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-white"
                                            value={newMaintenance.type}
                                            onChange={e => setNewMaintenance({ ...newMaintenance, type: e.target.value })}
                                        >
                                            <option value="preventiva">Preventiva</option>
                                            <option value="corretiva">Corretiva</option>
                                            <option value="pneus">Pneus</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Descrição</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: Troca de óleo, Reparo freios..."
                                            className="w-full bg-background/50 border border-border/50 rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-white"
                                            value={newMaintenance.description}
                                            onChange={e => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                                        />
                                        <div className="absolute left-3 top-3 text-muted-foreground">
                                            <Wrench size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">KM Atual</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                placeholder="0"
                                                className="w-full bg-background/50 border border-border/50 rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-white"
                                                value={newMaintenance.km}
                                                onChange={e => setNewMaintenance({ ...newMaintenance, km: e.target.value })}
                                            />
                                            <div className="absolute left-3 top-3 text-muted-foreground">
                                                <Activity size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Valor (R$)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                step="0.01"
                                                required
                                                placeholder="0.00"
                                                className="w-full bg-background/50 border border-border/50 rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-white"
                                                value={newMaintenance.value}
                                                onChange={e => setNewMaintenance({ ...newMaintenance, value: e.target.value })}
                                            />
                                            <div className="absolute left-3 top-3 text-green-500">
                                                <DollarSign size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-border/20 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn-futuristic px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg shadow-primary/25"
                                >
                                    Salvar Registro
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
