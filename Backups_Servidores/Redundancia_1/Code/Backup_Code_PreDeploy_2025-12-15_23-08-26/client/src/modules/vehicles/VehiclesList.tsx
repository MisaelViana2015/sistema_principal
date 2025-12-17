import { useEffect, useState } from "react";
import { vehiclesService } from "./vehicles.service";
import { Vehicle } from "../../../../shared/schema";
import { Car, AlertCircle, CheckCircle, Wrench, Gauge, Plus, Disc, X, Save, Edit2, Trash2 } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import ManutencoesTabLegacy from "../../pages/replit/tabs/ManutencoesTabLegacy";
import PneusTabLegacy from "../../pages/replit/tabs/PneusTabLegacy";
import { api } from "../../lib/api";

export default function VehiclesList() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"frota" | "manutencao" | "pneus">("frota");
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        plate: "",
        modelo: "",
        kmInicial: "",
    });

    useEffect(() => {
        loadVehicles();
    }, []);

    async function loadVehicles() {
        try {
            const data = await vehiclesService.getAll();
            setVehicles(data);
        } catch (err) {
            console.error(err);
            setError("Erro ao carregar veículos.");
        } finally {
            setIsLoading(false);
        }
    }

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ plate: "", modelo: "", kmInicial: "" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (vehicle: Vehicle) => {
        setEditingId(vehicle.id);
        setFormData({
            plate: vehicle.plate,
            modelo: vehicle.modelo,
            kmInicial: vehicle.kmInicial.toString(),
        });
        setIsModalOpen(true);
    };

    const handleSaveVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                // Update
                await api.put(`/vehicles/${editingId}`, {
                    plate: formData.plate.toUpperCase(),
                    modelo: formData.modelo,
                    kmInicial: Number(formData.kmInicial),
                });
            } else {
                // Create
                await api.post("/vehicles", {
                    plate: formData.plate.toUpperCase(),
                    modelo: formData.modelo,
                    kmInicial: Number(formData.kmInicial),
                    isActive: true
                });
            }
            setIsModalOpen(false);
            setFormData({ plate: "", modelo: "", kmInicial: "" });
            setEditingId(null);
            loadVehicles();
        } catch (error) {
            alert("Erro ao salvar veículo. Verifique os dados.");
        }
    };

    const handleDeleteVehicle = async (id: string, plate: string) => {
        if (!confirm(`Tem certeza que deseja remover o veículo ${plate}?`)) return;
        try {
            await api.delete(`/vehicles/${id}`);
            loadVehicles();
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir veículo.");
        }
    };

    // Hardcoded stats for now
    const stats = {
        disponiveis: vehicles.filter(v => v.isActive).length,
        emUso: 0,
        manutencao: 0
    };

    const s = {
        container: { maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' as const, gap: '1.5rem' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        title: { fontSize: '1.5rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' },
        subTabs: {
            display: 'flex',
            gap: '0.5rem',
            borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            paddingBottom: '0.5rem',
            marginBottom: '1rem',
            overflowX: 'auto' as const
        },
        subTabBtn: (active: boolean) => ({
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            backgroundColor: active ? (isDark ? '#374151' : '#e5e7eb') : 'transparent',
            color: active ? (isDark ? '#fff' : '#111827') : (isDark ? '#9ca3af' : '#6b7280'),
            fontWeight: 500,
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            whiteSpace: 'nowrap' as const
        }),
        addButton: {
            padding: '0.75rem 1.5rem',
            backgroundColor: '#22c55e',
            color: '#fff',
            border: 'none',
            borderRadius: '0.5rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
        },
        stats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' },
        statCard: (color: string) => ({
            padding: '1rem',
            borderRadius: '0.75rem',
            backgroundColor: isDark ? '#1f2937' : '#fff',
            border: `2px solid ${color}`,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
        }),
        vehicleCard: {
            backgroundColor: isDark ? '#1f2937' : '#fff',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        },
        badge: (status: boolean) => {
            const color = status ? { bg: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7', text: '#16a34a', border: '#22c55e' } : { bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2', text: '#dc2626', border: '#ef4444' };
            return {
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: color.bg,
                color: color.text,
                border: `1px solid ${color.border}`
            };
        }
    };

    if (isLoading) return <div className="p-8 text-center">Carregando frota...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div style={s.container}>
            <div style={s.header}>
                <h1 style={s.title}>Veículos (Módulo Real)</h1>
                <button style={s.addButton} onClick={handleOpenCreate}>
                    <Plus style={{ width: '20px', height: '20px' }} />
                    Novo Veículo
                </button>
            </div>

            {/* Modal de Cadastro/Edição */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingId ? "Editar Veículo" : "Novo Veículo"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveVehicle} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Placa</label>
                                <input
                                    required
                                    value={formData.plate}
                                    onChange={e => setFormData({ ...formData, plate: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 uppercase"
                                    placeholder="ex: ABC-1234"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Modelo</label>
                                <input
                                    required
                                    value={formData.modelo}
                                    onChange={e => setFormData({ ...formData, modelo: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                                    placeholder="ex: BYD Dolphin Mini"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">KM Inicial</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.kmInicial}
                                    onChange={e => setFormData({ ...formData, kmInicial: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                                    placeholder="0"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-white rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Sub-abas Internas */}
            <div style={s.subTabs}>
                <button style={s.subTabBtn(activeTab === 'frota')} onClick={() => setActiveTab('frota')}>
                    <Car size={16} /> Frota
                </button>
                <button style={s.subTabBtn(activeTab === 'manutencao')} onClick={() => setActiveTab('manutencao')}>
                    <Wrench size={16} /> Manutenções
                </button>
                <button style={s.subTabBtn(activeTab === 'pneus')} onClick={() => setActiveTab('pneus')}>
                    <Disc size={16} /> Pneus
                </button>
            </div>

            {activeTab === 'frota' && (
                <>
                    <div style={s.stats}>
                        <div style={s.statCard('#22c55e')}>
                            <CheckCircle style={{ width: '32px', height: '32px', color: '#22c55e' }} />
                            <div>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Ativos</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' }}>{stats.disponiveis}</p>
                            </div>
                        </div>
                    </div>

                    {vehicles.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            Nenhum veículo cadastrado.
                        </div>
                    )}

                    {vehicles.map((veiculo) => (
                        <div key={veiculo.id} style={s.vehicleCard}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827', fontFamily: 'monospace' }}>
                                        {veiculo.plate}
                                    </h3>
                                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{veiculo.modelo}</p>
                                </div>
                                <span style={s.badge(veiculo.isActive)}>{veiculo.isActive ? 'Ativo' : 'Inativo'}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Gauge style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Quilometragem Inicial</p>
                                        <p style={{ fontWeight: '600', color: isDark ? '#fff' : '#111827', fontFamily: 'monospace' }}>
                                            {veiculo.kmInicial.toLocaleString()} km
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions Buttons */}
                            <div className="flex gap-2 pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => handleOpenEdit(veiculo)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all font-medium text-sm"
                                >
                                    <Edit2 className="w-4 h-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDeleteVehicle(veiculo.id, veiculo.plate)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all font-medium text-sm"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </>
            )}

            {activeTab === 'manutencao' && (
                <div className="animate-in fade-in duration-300">
                    <ManutencoesTabLegacy />
                </div>
            )}

            {activeTab === 'pneus' && (
                <div className="animate-in fade-in duration-300">
                    <PneusTabLegacy />
                </div>
            )}
        </div>
    );
}

