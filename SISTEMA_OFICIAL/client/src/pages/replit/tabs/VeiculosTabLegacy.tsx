import React, { useState } from "react";
import { Plus, Car, Clock, Filter, Trash2, Wrench, ArrowUp, ArrowDown, CircleDot, Activity, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../../../contexts/ThemeContext";

type Vehicle = {
    id: string;
    plate: string;
    modelo: string;
    kmInicial: number;
    isActive: boolean;
};

// Mock Data preserved for layout visualization where real data isn't hooked up yet
const MOCK_MAINTENANCES = [
    { id: "1", data: "01/12/2025", veiculo: "ABC-1234", descricao: "Troca de Óleo", tipo: "Preventiva", km: 150000, valor: 250.00 },
    { id: "2", data: "20/11/2025", veiculo: "XYZ-5678", descricao: "Reparo Freio", tipo: "Corretiva", km: 118000, valor: 800.00 },
    { id: "3", data: "15/11/2025", veiculo: "ABC-1234", descricao: "Alinhamento e Balanceamento", tipo: "Preventiva", km: 149500, valor: 120.00 },
];

const MOCK_PNEUS = [
    { id: "1", veiculo: "ABC-1234", marca: "Michelin", modelo: "Primacy 4", dimensao: "205/55 R16", data: "01/12/2025", kmInstalacao: 150000, posicao: "Dianteiro Esq", estado: "Novo" },
    { id: "2", veiculo: "ABC-1234", marca: "Michelin", modelo: "Primacy 4", dimensao: "205/55 R16", data: "01/12/2025", kmInstalacao: 150000, posicao: "Dianteiro Dir", estado: "Novo" },
    { id: "3", veiculo: "XYZ-5678", marca: "Pirelli", modelo: "Cinturato P7", dimensao: "195/55 R15", data: "15/11/2025", kmInstalacao: 118000, posicao: "Traseiro Esq", estado: "Meia Vida" },
];

export default function VeiculosTabLegacy() {
    const { theme } = useTheme();
    // const isDark = theme === "dark"; // theme handled by CSS classes

    const { data: vehicles, isLoading } = useQuery<Vehicle[]>({
        queryKey: ["/api/veiculos"],
    });

    const [subTab, setSubTab] = useState<"cadastro" | "gerais" | "manutencoes" | "pneus">("cadastro");
    const [period, setPeriod] = useState<"semana" | "mes" | "ano" | "total">("mes");
    const [sortBy, setSortBy] = useState<"uso" | "rentabilidade" | "custo">("uso");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const getBadgeClass = (type: string) => {
        const t = type?.toLowerCase() || '';
        if (t.includes('preventiva')) return "badge-success";
        if (t.includes('corretiva')) return "badge-warning";
        return "badge-app";
    };

    const getPneuBadgeClass = (estado: string) => {
        if (estado === "Novo") return "badge-success";
        return "badge-warning";
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-glow-blue uppercase tracking-wider text-white">
                        Gestão de Veículos
                    </h2>
                    <p className="text-muted-foreground font-body text-sm mt-1">
                        Controle total da frota, manutenções e pneus.
                    </p>
                </div>

                <div className="flex gap-2">
                    {subTab === "manutencoes" && (
                        <button className="btn-futuristic flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-bold transition-transform active:scale-95">
                            <Plus size={18} className="animate-pulse" />
                            Nova Manutenção
                        </button>
                    )}
                    {subTab === "pneus" && (
                        <button className="btn-futuristic flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-white font-bold transition-transform active:scale-95 from-orange-600 to-amber-600 border-orange-500" style={{ '--primary': '25 95% 53%', '--accent': '45 93% 47%' } as React.CSSProperties}>
                            <Plus size={18} className="animate-pulse" />
                            Novo Pneu
                        </button>
                    )}
                </div>
            </div>

            {/* Sub-Abas */}
            <div className="flex flex-wrap gap-2 bg-muted/30 p-1.5 rounded-lg border border-white/10">
                {(["cadastro", "gerais", "manutencoes", "pneus"] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setSubTab(tab)}
                        className={`
                            flex-1 min-w-[100px] py-2 px-4 rounded-md text-sm font-bold uppercase tracking-wide transition-all
                            ${subTab === tab
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                                : "hover:bg-white/5 text-muted-foreground hover:text-white"
                            }
                        `}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {subTab === "cadastro" && (
                <>
                    {/* Filtros e Ações */}
                    <div className="futuristic-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex gap-2 p-1 bg-background/50 rounded-lg border border-white/5">
                            {(["semana", "mes", "ano", "total"] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPeriod(p)}
                                    className={`
                                        px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all
                                        ${period === p
                                            ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                                        }
                                    `}
                                >
                                    {p === "semana" ? "Semana" : p === "mes" ? "Mês" : p === "ano" ? "Ano" : "Total"}
                                </button>
                            ))}
                        </div>

                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex items-center gap-3 bg-background/50 px-3 py-2 rounded-lg border border-white/10 w-full md:w-auto">
                                <span className="text-xs font-bold uppercase text-muted-foreground">Ordenar:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="bg-transparent text-sm font-medium text-white focus:outline-none cursor-pointer"
                                >
                                    <option value="uso" className="bg-background">Mais usado</option>
                                    <option value="rentabilidade" className="bg-background">Mais rentável</option>
                                    <option value="custo" className="bg-background">Maior custo/km</option>
                                </select>
                            </div>

                            <button className="btn-futuristic flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-white font-bold text-sm w-full md:w-auto">
                                <Plus size={16} />
                                Novo Veículo
                            </button>
                        </div>
                    </div>

                    {/* Lista (Grid) de Veículos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {isLoading ? (
                            <div className="col-span-full py-12 text-center text-muted-foreground animate-pulse">
                                Carregando frota...
                            </div>
                        ) : !Array.isArray(vehicles) ? (
                            <div className="col-span-full futuristic-card p-6 border-destructive/50 text-center">
                                <p className="text-destructive font-bold mb-2">Erro ao carregar veículos</p>
                                <p className="text-xs text-muted-foreground">Os dados recebidos não são válidos ou o servidor retornou erro.</p>
                            </div>
                        ) : vehicles.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                Nenhum veículo encontrado.
                            </div>
                        ) : (
                            vehicles.map((vehicle, index) => (
                                <div
                                    key={vehicle.id}
                                    className="futuristic-card p-6 group hover:translate-y-[-2px] transition-all duration-300 relative overflow-hidden"
                                >
                                    {/* Gradient Decoration */}
                                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${index % 2 === 0 ? 'from-cyan-500 to-blue-500' : 'from-purple-500 to-pink-500'}`}></div>
                                    <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity ${index % 2 === 0 ? 'bg-cyan-500' : 'bg-purple-500'}`}></div>

                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div>
                                            <h3 className="text-xl font-display font-bold text-white tracking-wide">{vehicle.plate}</h3>
                                            <p className="text-sm text-muted-foreground">{vehicle.modelo}</p>
                                        </div>
                                        <div className={`p-2 rounded-lg ${index % 2 === 0 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-purple-500/10 text-purple-400'}`}>
                                            <Car size={24} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 relative z-10">
                                        <div className="flex flex-col gap-1 p-2 rounded-md bg-background/50 border border-white/5">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Rodagem</span>
                                            <span className="font-mono font-medium text-white">{vehicle.kmInicial.toLocaleString()} km</span>
                                        </div>
                                        <div className="flex flex-col gap-1 p-2 rounded-md bg-background/50 border border-white/5">
                                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Status</span>
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${vehicle.isActive ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`}></div>
                                                <span className={`text-sm font-medium ${vehicle.isActive ? 'text-green-400' : 'text-red-400'}`}>
                                                    {vehicle.isActive ? "Ativo" : "Inativo"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            )}

            {subTab === "gerais" && (
                <div className="futuristic-card p-12 flex flex-col items-center justify-center text-center opacity-60 border-dashed border-white/10">
                    <Clock size={48} className="mb-4 text-primary animate-pulse" />
                    <p className="font-display text-xl text-white">Em Desenvolvimento</p>
                    <p className="text-sm text-muted-foreground mt-2">Visualização Geral (KPIs) será implementada posteriormente na nova interface.</p>
                </div>
            )}

            {subTab === "manutencoes" && (
                <>
                    {/* Filtros de Manutenção */}
                    <div className="futuristic-card p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Wrench size={80} />
                        </div>

                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-2 text-primary font-display font-bold uppercase tracking-wider">
                                <Filter size={18} />
                                Filtros
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
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">Veículo</label>
                                <select className="w-full bg-background/50 border border-border/50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none">
                                    <option value="todos">Todos os Veículos</option>
                                    <option value="abc">ABC-1234 - Fiat Uno</option>
                                    <option value="xyz">XYZ-5678 - VW Gol</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">Ano</label>
                                <select className="w-full bg-background/50 border border-border/50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none">
                                    <option value="todos">Todos</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">Mês</label>
                                <select className="w-full bg-background/50 border border-border/50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none">
                                    <option value="todos">Todos</option>
                                    <option value="12">Dezembro</option>
                                    <option value="11">Novembro</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tabela de Manutenção */}
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
                                    {MOCK_MAINTENANCES.map((m) => (
                                        <tr key={m.id} className="hover:bg-primary/5 transition-colors group">
                                            <td className="px-6 py-4 text-white font-medium">{m.data}</td>
                                            <td className="px-6 py-4 text-white">{m.veiculo}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{m.descricao}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${getBadgeClass(m.tipo)}`}>
                                                    {m.tipo}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground font-mono">{m.km} km</td>
                                            <td className="px-6 py-4 font-bold text-glow-green text-primary font-mono">
                                                R$ {m.valor.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors" title="Excluir">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {subTab === "pneus" && (
                <>
                    {/* Filtros Pneus */}
                    <div className="futuristic-card p-6 relative overflow-hidden group border-orange-500/30">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <CircleDot size={80} className="text-orange-500" />
                        </div>
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className="flex items-center gap-2 text-orange-500 font-display font-bold uppercase tracking-wider">
                                <Filter size={18} />
                                Filtros
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
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">Veículo</label>
                                <select className="w-full bg-background/50 border border-border/50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none">
                                    <option value="todos">Todos os Veículos</option>
                                    <option value="abc">ABC-1234 - Fiat Uno</option>
                                    <option value="xyz">XYZ-5678 - VW Gol</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">Ano</label>
                                <select className="w-full bg-background/50 border border-border/50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none">
                                    <option value="todos">Todos</option>
                                    <option value="2025">2025</option>
                                    <option value="2024">2024</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">Mês</label>
                                <select className="w-full bg-background/50 border border-border/50 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all outline-none">
                                    <option value="todos">Todos</option>
                                    <option value="12">Dezembro</option>
                                    <option value="11">Novembro</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Tabela Pneus */}
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
                                    {MOCK_PNEUS.map((p) => (
                                        <tr key={p.id} className="hover:bg-orange-500/5 transition-colors group">
                                            <td className="px-6 py-4 text-white font-medium">{p.data}</td>
                                            <td className="px-6 py-4 text-white">{p.veiculo}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{p.posicao}</td>
                                            <td className="px-6 py-4 text-white">
                                                <div className="flex flex-col">
                                                    <span className="font-medium">{p.marca} {p.modelo}</span>
                                                    <span className="text-xs text-muted-foreground">{p.dimensao}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${getPneuBadgeClass(p.estado)}`}>
                                                    {p.estado}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground font-mono">{p.kmInstalacao} km</td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors" title="Excluir">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
