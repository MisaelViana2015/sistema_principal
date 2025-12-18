import React, { useState, useEffect, useCallback } from "react";
import { Filter, Trash2, Plus, ArrowUp, ArrowDown, X, CircleDot, Activity, Calendar, Car } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { vehiclesService } from "../../../modules/vehicles/vehicles.service";
import { tiresService, Tire } from "../../../modules/tires/tires.service";

interface PneuDisplay extends Tire {
    veiculoPlate: string;
    veiculoModelo: string;
    displayData: string;
}

export default function PneusTabLegacy() {
    const { theme } = useTheme();
    // const isDark = theme === "dark"; // Controlado via CSS classes agora

    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState("todos");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pneus, setPneus] = useState<PneuDisplay[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>("todos");
    const [selectedMonth, setSelectedMonth] = useState<string>("todos");

    // Novo pneu form state
    const [newTire, setNewTire] = useState({
        veiculoId: "",
        posicao: "",
        marca: "",
        modelo: "",
        estado: "Novo",
        km: "",
        data: new Date().toISOString().split('T')[0]
    });

    // Buscar lista de veiculos
    const loadVehicles = useCallback(async () => {
        try {
            const data = await vehiclesService.getAll();
            setVehicles(data);
            return data;
        } catch (error) {
            console.error("Erro ao carregar veículos", error);
            return [];
        }
    }, []);

    // Buscar e processar pneus
    const loadPneus = useCallback(async (currentVehicles: any[]) => {
        try {
            const data = await tiresService.getAll();

            // Enriquecer dados para exibição (Join manual no frontend por enquanto)
            const processedPneus = data.map(tire => {
                const veiculo = currentVehicles.find(v => v.id === tire.vehicleId);
                return {
                    ...tire,
                    veiculoPlate: veiculo ? veiculo.plate : "N/A",
                    veiculoModelo: veiculo ? veiculo.modelo : "",
                    displayData: new Date(tire.installDate).toLocaleDateString('pt-BR')
                };
            });

            setPneus(processedPneus);
        } catch (error) {
            console.error("Erro ao carregar pneus:", error);
        }
    }, []);

    // Inicialização
    useEffect(() => {
        vehiclesService.getAll()
            .then(vs => {
                setVehicles(vs);
                return loadPneus(vs);
            })
            .catch(err => {
                console.error("Erro crítico na inicialização:", err);
                loadPneus([]);
            });

    }, [loadPneus]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await tiresService.create({
                vehicleId: newTire.veiculoId,
                position: newTire.posicao,
                brand: newTire.marca,
                model: newTire.modelo,
                status: newTire.estado,
                installKm: Number(newTire.km),
                installDate: new Date(newTire.data)
            });

            // Recarregar lista
            await loadPneus(vehicles);

            setIsModalOpen(false);

            // Limpar form
            setNewTire({
                veiculoId: "",
                posicao: "",
                marca: "",
                modelo: "",
                estado: "Novo",
                km: "",
                data: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error("Erro ao salvar pneu:", error);
            alert("Erro ao salvar pneu. Verifique o console.");
        }
    };

    // Extract available years
    const safePneus = pneus || [];
    const availableYears = Array.from(new Set(safePneus.map(p => new Date(p.installDate).getFullYear()))).sort((a, b) => b - a);

    const filteredPneus = safePneus.filter(p => {
        const pDate = new Date(p.installDate);

        // Filter by Vehicle
        if (selectedVehicle !== "todos" && p.veiculoPlate !== selectedVehicle) {
            return false;
        }

        // Filter by Year
        if (selectedYear !== "todos" && pDate.getFullYear().toString() !== selectedYear) {
            return false;
        }

        // Filter by Month
        if (selectedMonth !== "todos" && (pDate.getMonth() + 1).toString() !== selectedMonth) {
            return false;
        }

        return true;
    }).sort((a, b) => {
        const dateA = new Date(a.installDate).getTime();
        const dateB = new Date(b.installDate).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    const getBadgeClass = (estado: string) => {
        if (estado === "Novo") return "badge-success";
        return "badge-warning";
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-glow-orange uppercase tracking-wider text-white">
                        Controle de Pneus
                    </h2>
                    <p className="text-muted-foreground font-body text-sm mt-1">
                        Monitoramento de vida útil e trocas de pneus.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-futuristic flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-bold transition-transform active:scale-95 from-orange-600 to-amber-600 border-orange-500"
                    style={{ '--primary': '25 95% 53%', '--accent': '45 93% 47%' } as React.CSSProperties}
                >
                    <Plus size={18} className="animate-pulse" />
                    Novo Pneu
                </button>
            </div>

            {/* Filtros */}
            <div className="futuristic-card p-6 relative overflow-hidden group border-orange-500/30">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <CircleDot size={80} className="text-orange-500" />
                </div>

                <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-2 text-orange-500 font-display font-bold uppercase tracking-wider">
                        <Filter size={18} />
                        Filtros de Pneus
                    </div>
                    <button
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-orange-500/30 text-orange-500 hover:bg-orange-500/10 transition-colors text-sm font-medium"
                        onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                    >
                        {sortOrder === "desc" ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                        {sortOrder === "desc" ? "Recentes" : "Antigas"}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Car size={12} className="text-orange-500" /> Veículo
                        </label>
                        <select
                            className="w-full bg-background/50 border border-border/50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none"
                            value={selectedVehicle}
                            onChange={(e) => setSelectedVehicle(e.target.value)}
                        >
                            <option value="todos">Todos os Veículos</option>
                            {vehicles.map(vehicle => (<option key={vehicle.id} value={vehicle.plate}> {vehicle.plate} - {vehicle.modelo} </option>))}
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <Calendar size={12} className="text-orange-500" /> Ano
                        </label>
                        <select
                            className="w-full bg-background/50 border border-border/50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none"
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
                            <Calendar size={12} className="text-orange-500" /> Mês
                        </label>
                        <select
                            className="w-full bg-background/50 border border-border/50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none"
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
            <div className="futuristic-card p-0 overflow-hidden border-t-2 border-orange-500/50">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase text-xs font-bold tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Data Inst.</th>
                                <th className="px-6 py-4">Veículo</th>
                                <th className="px-6 py-4">Posição</th>
                                <th className="px-6 py-4">Marca/Modelo</th>
                                <th className="px-6 py-4">Estado</th>
                                <th className="px-6 py-4">KM Inst.</th>
                                <th className="px-6 py-4 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {filteredPneus.length === 0 ? (
                                <tr> <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground"> Nenhum pneu registrado. </td> </tr>
                            ) : (
                                filteredPneus.map((p) => (
                                    <tr key={p.id} className="hover:bg-orange-500/5 transition-colors group">
                                        <td className="px-6 py-4 text-white font-medium">{p.displayData}</td>
                                        <td className="px-6 py-4 text-white">
                                            {p.veiculoPlate} <span className="text-xs text-muted-foreground ml-1">{p.veiculoModelo}</span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{p.position}</td>
                                        <td className="px-6 py-4 text-white">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{p.brand} {p.model}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${getBadgeClass(p.status)}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground font-mono">{p.installKm} km</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors" title="Excluir">
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

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="futuristic-card w-full max-w-lg p-0 shadow-2xl border-orange-500/30 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-border/20 flex justify-between items-center bg-muted/20">
                            <h3 className="text-xl font-display font-bold text-glow-orange text-white flex items-center gap-2">
                                <Plus size={20} className="text-orange-500" />
                                Novo Pneu
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Veículo</label>
                                    <select
                                        className="w-full bg-background/50 border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none text-white"
                                        value={newTire.veiculoId}
                                        onChange={e => setNewTire({ ...newTire, veiculoId: e.target.value })}
                                        required
                                    >
                                        <option value="">Selecione o veículo</option>
                                        {vehicles.map(v => (<option key={v.id} value={v.id}>{v.plate} - {v.modelo}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Posição</label>
                                    <div className="relative">
                                        <input
                                            className="w-full bg-background/50 border border-border/50 rounded-lg p-3 pl-10 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none text-white"
                                            placeholder="Ex: Dianteira Esquerda"
                                            value={newTire.posicao}
                                            onChange={e => setNewTire({ ...newTire, posicao: e.target.value })}
                                        />
                                        <div className="absolute left-3 top-3 text-muted-foreground">
                                            <CircleDot size={16} />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Marca</label>
                                        <input
                                            className="w-full bg-background/50 border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none text-white"
                                            placeholder="Ex: Pirelli"
                                            value={newTire.marca}
                                            onChange={e => setNewTire({ ...newTire, marca: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Modelo</label>
                                        <input
                                            className="w-full bg-background/50 border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none text-white"
                                            placeholder="Ex: Cinturato"
                                            value={newTire.modelo}
                                            onChange={e => setNewTire({ ...newTire, modelo: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">KM Instalação</label>
                                        <input
                                            className="w-full bg-background/50 border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none text-white"
                                            type="number"
                                            value={newTire.km}
                                            onChange={e => setNewTire({ ...newTire, km: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 ml-1">Data Instalação</label>
                                        <input
                                            className="w-full bg-background/50 border border-border/50 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none text-white"
                                            type="date"
                                            value={newTire.data}
                                            onChange={e => setNewTire({ ...newTire, data: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-border/20 mt-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors">Cancelar</button>
                                <button type="submit" className="btn-futuristic px-6 py-2 rounded-lg text-sm font-bold text-white shadow-lg shadow-orange-500/25 from-orange-600 to-amber-600 border-orange-500" style={{ '--primary': '25 95% 53%', '--accent': '45 93% 47%' } as React.CSSProperties}>Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
