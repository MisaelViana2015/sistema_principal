
import React, { useState, useEffect, useCallback } from "react";
import { Filter, Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
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
    const isDark = theme === "dark";

    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState("todos");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pneus, setPneus] = useState<PneuDisplay[]>([]);

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
        loadVehicles().then((loadedVehicles) => {
            loadPneus(loadedVehicles);
        });
    }, [loadVehicles, loadPneus]);

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
    const getBadgeStyle = (estado: string) => {
        const isNovo = estado === "Novo";
        if (isDark) {
            return {
                bg: isNovo ? "rgba(34, 197, 94, 0.2)" : "rgba(234, 179, 8, 0.2)",
                text: isNovo ? "#4ade80" : "#facc15"
            };
        } else {
            return {
                bg: isNovo ? "#dcfce7" : "#fef9c3",
                text: isNovo ? "#166534" : "#854d0e"
            };
        }
    };

    const styles = {
        container: { display: "flex", flexDirection: "column" as const, gap: "1.5rem" },
        header: { display: "flex", alignItems: "center", justifyContent: "space-between" },
        title: { fontSize: "1.25rem", fontWeight: "700", color: isDark ? "#ffffff" : "#0f172a", margin: 0 },
        filtersCard: { padding: "1rem", backgroundColor: isDark ? "#1e293b" : "#ffffff", borderRadius: "0.5rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, display: "flex", flexDirection: "column" as const, gap: "1rem" },
        filtersHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" },
        filtersGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" },
        inputGroup: { display: "flex", flexDirection: "column" as const, gap: "0.35rem" },
        label: { fontSize: "0.75rem", fontWeight: "500", color: isDark ? "#94a3b8" : "#64748b" },
        select: { padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, backgroundColor: isDark ? "#0f172a" : "#ffffff", color: isDark ? "#ffffff" : "#0f172a", fontSize: "0.875rem" },
        input: { padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#475569" : "#cbd5e1"}`, backgroundColor: isDark ? "#0f172a" : "#ffffff", color: isDark ? "#ffffff" : "#0f172a", fontSize: "0.875rem" },
        tableContainer: { border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, borderRadius: "0.5rem", overflow: "hidden" },
        table: { width: "100%", borderCollapse: "collapse" as const, textAlign: "left" as const, fontSize: "0.875rem" },
        th: { padding: "0.75rem 1rem", backgroundColor: isDark ? "#1e293b" : "#f8fafc", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "600", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` },
        td: { padding: "0.75rem 1rem", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, color: isDark ? "#e2e8f0" : "#1e293b" },
        badge: (estado: string) => { const style = getBadgeStyle(estado); return { padding: "0.15rem 0.5rem", borderRadius: "0.25rem", fontSize: "0.75rem", fontWeight: "600", backgroundColor: style.bg, color: style.text }; },
        actionButton: { padding: "0.25rem", borderRadius: "0.25rem", border: "none", backgroundColor: "transparent", color: "#ef4444", cursor: "pointer" },
        sortButton: { display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.375rem 0.75rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, backgroundColor: "transparent", color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.875rem", cursor: "pointer" },
        modalOverlay: { position: "fixed" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" },
        modalContent: { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderRadius: "0.75rem", padding: "1.5rem", width: "100%", maxWidth: "500px", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, maxHeight: "90vh", overflowY: "auto" as const },
        modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" },
        modalFooter: { display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1.5rem" }
    };

    const [selectedYear, setSelectedYear] = useState<string>("todos");
    const [selectedMonth, setSelectedMonth] = useState<string>("todos");

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

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>Controle de Pneus</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem", borderRadius: "0.375rem", border: "none", color: "white", background: isDark ? "#ea580c" : "#c2410c", fontSize: "0.875rem", cursor: "pointer", fontWeight: "500" }}
                >
                    <Plus size={16} /> Novo Pneu
                </button>
            </div>

            <div style={styles.filtersCard}>
                <div style={styles.filtersHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", fontWeight: "500" }}> <Filter size={16} opacity={0.5} /> Filtros </div>
                    <button style={styles.sortButton} onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}>
                        {sortOrder === "desc" ? <ArrowDown size={14} /> : <ArrowUp size={14} />} {sortOrder === "desc" ? "Mais Recentes" : "Mais Antigas"}
                    </button>
                </div>
                <div style={styles.filtersGrid}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Veículo</label>
                        <select style={styles.select} value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)}>
                            <option value="todos">Todos os Veículos</option>
                            {vehicles.map(vehicle => (<option key={vehicle.id} value={vehicle.plate}> {vehicle.plate} - {vehicle.modelo} </option>))}
                        </select>
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Ano</label>
                        <select style={styles.select} value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                            <option value="todos">Todos</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Mês</label>
                        <select style={styles.select} value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
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

            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Data Inst.</th>
                            <th style={styles.th}>Veículo</th>
                            <th style={styles.th}>Posição</th>
                            <th style={styles.th}>Marca/Modelo</th>
                            <th style={styles.th}>Estado</th>
                            <th style={styles.th}>KM Inst.</th>
                            <th style={styles.th}>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPneus.length === 0 ? (
                            <tr> <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: isDark ? "#64748b" : "#94a3b8" }}> Nenhum pneu registrado. </td> </tr>
                        ) : (
                            filteredPneus.map((p) => (
                                <tr key={p.id}>
                                    <td style={styles.td}>{p.displayData}</td>
                                    <td style={styles.td}>{p.veiculoPlate} <span style={{ fontSize: '0.7em', opacity: 0.7 }}>{p.veiculoModelo}</span></td>
                                    <td style={styles.td}>{p.position}</td>
                                    <td style={styles.td}>
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <span style={{ fontWeight: 500 }}>{p.brand} {p.model}</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}> <span style={styles.badge(p.status)}> {p.status} </span> </td>
                                    <td style={styles.td}>{p.installKm} km</td>
                                    <td style={styles.td}> <button style={styles.actionButton} title="Excluir"> <Trash2 size={16} /> </button> </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={styles.modalHeader}>
                            <h3 style={styles.title}>Novo Pneu</h3>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: isDark ? '#94a3b8' : '#64748b', cursor: 'pointer' }}>✕</button>
                        </div>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Veículo</label>
                                <select style={styles.select} value={newTire.veiculoId} onChange={e => setNewTire({ ...newTire, veiculoId: e.target.value })} required>
                                    <option value="">Selecione o veículo</option>
                                    {vehicles.map(v => (<option key={v.id} value={v.id}>{v.plate} - {v.modelo}</option>))}
                                </select>
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>Posição</label>
                                <input style={styles.input} placeholder="Ex: Dianteira Esquerda" value={newTire.posicao} onChange={e => setNewTire({ ...newTire, posicao: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={styles.inputGroup}> <label style={styles.label}>Marca</label> <input style={styles.input} placeholder="Ex: Pirelli" value={newTire.marca} onChange={e => setNewTire({ ...newTire, marca: e.target.value })} /> </div>
                                <div style={styles.inputGroup}> <label style={styles.label}>Modelo</label> <input style={styles.input} placeholder="Ex: Cinturato" value={newTire.modelo} onChange={e => setNewTire({ ...newTire, modelo: e.target.value })} /> </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={styles.inputGroup}> <label style={styles.label}>KM Instalação</label> <input style={styles.input} type="number" value={newTire.km} onChange={e => setNewTire({ ...newTire, km: e.target.value })} /> </div>
                                <div style={styles.inputGroup}> <label style={styles.label}>Data Instalação</label> <input style={styles.input} type="date" value={newTire.data} onChange={e => setNewTire({ ...newTire, data: e.target.value })} /> </div>
                            </div>
                            <div style={styles.modalFooter}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, background: 'transparent', color: isDark ? '#e2e8f0' : '#1e293b', cursor: 'pointer' }}>Cancelar</button>
                                <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', background: isDark ? '#0f172a' : '#0f172a', color: 'white', cursor: 'pointer', backgroundColor: isDark ? '#1e293b' : '#0f172a' }}>Salvar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
