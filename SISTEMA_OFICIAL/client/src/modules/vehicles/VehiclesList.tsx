import { useEffect, useState } from "react";
import { vehiclesService } from "./vehicles.service";
import { MaintenanceTab } from "./components/MaintenanceTab";
import { TiresTab } from "./components/TiresTab";
import { driversService } from "../drivers/drivers.service";
import { Vehicle, Driver } from "../../../../shared/schema";
import { Car, AlertCircle, CheckCircle, Wrench, Gauge, Plus, Disc, X, Save, Edit2, Trash2, Ban } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

import { api } from "../../lib/api";

const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

function isValidPlaca(placa: string): boolean {
    const normalized = placa.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return placaRegex.test(normalized);
}

export default function VehiclesList() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [drivers, setDrivers] = useState<Driver[]>([]);
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
        motoristaPadraoId: "",
        color: "",
        imageUrl: "",
        status: "ativo" // Default status
    });

    // Safe Delete State
    const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState("");


    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [vehiclesData, driversData] = await Promise.all([
                vehiclesService.getAll(),
                driversService.getAll()
            ]);
            setVehicles(vehiclesData);
            setDrivers(driversData);
        } catch (err) {
            console.error(err);
            setError("Erro ao carregar dados.");
        } finally {
            setIsLoading(false);
        }
    }

    async function loadVehicles() {
        try {
            const data = await vehiclesService.getAll();
            setVehicles(data);
        } catch (err) {
            console.error(err);
        }
    }

    const handleOpenCreate = () => {
        setEditingId(null);
        setFormData({ plate: "", modelo: "", kmInicial: "", motoristaPadraoId: "", color: "", imageUrl: "", status: "ativo" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (vehicle: Vehicle) => {
        setEditingId(vehicle.id);
        setFormData({
            plate: vehicle.plate,
            modelo: vehicle.modelo,
            kmInicial: vehicle.kmInicial.toString(),
            motoristaPadraoId: vehicle.motoristaPadraoId || "",
            color: vehicle.color || "",
            imageUrl: vehicle.imageUrl || "",
            status: vehicle.status || "ativo"
        });
        setIsModalOpen(true);
    };

    const handleSaveVehicle = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!isValidPlaca(formData.plate)) {
            alert("Placa inválida. Formato esperado: ABC1234 ou ABC1D23 (Mercosul).");
            return;
        }

        try {
            const payload = {
                placa: formData.plate.toUpperCase(),
                modelo: formData.modelo,
                kmInicial: Number(formData.kmInicial),
                motoristaPadraoId: formData.motoristaPadraoId || null,
                color: formData.color || null,
                imageUrl: formData.imageUrl || null,
                status: formData.status
            };

            if (editingId) {
                // Update
                await vehiclesService.update(editingId, payload);
            } else {
                // Create
                await vehiclesService.create(payload);
            }
            setIsModalOpen(false);
            setFormData({ plate: "", modelo: "", kmInicial: "", motoristaPadraoId: "", color: "", imageUrl: "", status: "ativo" });
            setEditingId(null);
            loadVehicles();
        } catch (error) {
            alert("Erro ao salvar veículo. Verifique os dados.");
        }
    };

    const handleDeleteClick = (vehicle: Vehicle) => {
        setVehicleToDelete(vehicle);
        setDeleteConfirmation("");
    };

    const confirmDelete = async () => {
        if (!vehicleToDelete) return;

        if (deleteConfirmation.toUpperCase() !== vehicleToDelete.plate.toUpperCase()) {
            alert("A confirmação não corresponde à placa do veículo.");
            return;
        }

        try {
            await vehiclesService.delete(vehicleToDelete.id);
            loadVehicles();
            setVehicleToDelete(null);
            setDeleteConfirmation("");
        } catch (error) {
            console.error(error);
            alert("Erro ao excluir veículo e seus dados vinculados.");
        }
    };

    // Stats based on Status
    const stats = {
        ativos: vehicles.filter(v => v.status === 'ativo' || !v.status).length, // Fallback for old records
        manutencao: vehicles.filter(v => v.status === 'manutencao').length,
        indisponivel: vehicles.filter(v => v.status === 'indisponivel').length
    };

    const s = {
        container: { maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' as const, gap: '1.5rem' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        title: { fontSize: '1.5rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' },

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


        badge: (status: string) => {
            let color = { bg: isDark ? 'rgba(34, 197, 94, 0.2)' : '#dcfce7', text: '#16a34a', border: '#22c55e' }; // Default Active
            if (status === 'manutencao') color = { bg: isDark ? 'rgba(234, 179, 8, 0.2)' : '#fef9c3', text: '#ca8a04', border: '#eab308' };
            if (status === 'indisponivel') color = { bg: isDark ? 'rgba(239, 68, 68, 0.2)' : '#fee2e2', text: '#dc2626', border: '#ef4444' };

            return {
                display: 'inline-block',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: '600',
                backgroundColor: color.bg,
                color: color.text,
                border: `1px solid ${color.border}`,
                textTransform: 'capitalize' as const
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
                    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
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
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'ativo' })}
                                        className={`py-2 px-1 text-xs font-bold rounded-lg border-2 transition-all ${formData.status === 'ativo'
                                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                                            }`}
                                    >
                                        🟢 ATIVO
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'manutencao' })}
                                        className={`py-2 px-1 text-xs font-bold rounded-lg border-2 transition-all ${formData.status === 'manutencao'
                                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                                            }`}
                                    >
                                        🟡 MANUTENÇÃO
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'indisponivel' })}
                                        className={`py-2 px-1 text-xs font-bold rounded-lg border-2 transition-all ${formData.status === 'indisponivel'
                                            ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                                            : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300'
                                            }`}
                                    >
                                        🔴 INDISPONÍVEL
                                    </button>
                                </div>
                            </div>

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

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cor Predominante</label>
                                    <select
                                        value={formData.color}
                                        onChange={e => setFormData({ ...formData, color: e.target.value })}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                                    >
                                        <option value="">Selecione...</option>
                                        <option value="Branco">Branco</option>
                                        <option value="Preto">Preto</option>
                                        <option value="Prata">Prata</option>
                                        <option value="Cinza">Cinza</option>
                                        <option value="Azul">Azul</option>
                                        <option value="Vermelho">Vermelho</option>
                                        <option value="Verde">Verde</option>
                                        <option value="Outro">Outro</option>
                                    </select>
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
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL da Imagem (Opcional)</label>
                                <div className="flex gap-2">
                                    <input
                                        value={formData.imageUrl}
                                        onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 text-xs"
                                        placeholder="https://exemplo.com/carro.jpg"
                                    />
                                    {formData.imageUrl && (
                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-600">
                                            <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-[10px] text-gray-500 mt-1">Cole aqui o link direto da imagem do veículo.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motorista Padrão (opcional)</label>
                                <select
                                    value={formData.motoristaPadraoId}
                                    onChange={e => setFormData({ ...formData, motoristaPadraoId: e.target.value })}
                                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="">Selecione um motorista</option>
                                    {drivers.map(driver => (
                                        <option key={driver.id} value={driver.id}>
                                            {driver.nome}
                                        </option>
                                    ))}
                                </select>
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

            {/* Modal de Exclusão Segura */}
            {vehicleToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-900 border border-red-500/50 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden">
                        {/* Background Alert Accents */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>

                        <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                    <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Excluir Veículo?</h2>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
                                        Você está prestes a excluir o veículo <strong className="text-gray-900 dark:text-white">{vehicleToDelete.plate}</strong> (<span className="text-gray-500">{vehicleToDelete.modelo}</span>).
                                    </p>
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                                        <p className="text-red-800 dark:text-red-200 text-xs font-bold uppercase tracking-wide mb-1">Ação Irreversível</p>
                                        <p className="text-red-700 dark:text-red-300 text-sm">
                                            Todos os dados associados a este veículo serão removidos permanentemente:
                                        </p>
                                        <ul className="list-disc list-inside text-red-700 dark:text-red-300 text-sm mt-1 pl-2">
                                            <li>Histórico de manutenções</li>
                                            <li>Registros de pneus</li>
                                            <li>Atribuições de turnos passados</li>
                                        </ul>
                                    </div>

                                    <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                                        Digite <strong className="select-all">{vehicleToDelete.plate}</strong> para confirmar:
                                    </label>
                                    <input
                                        type="text"
                                        value={deleteConfirmation}
                                        onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
                                        placeholder={vehicleToDelete.plate}
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none font-mono uppercase tracking-wider"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <button
                                    onClick={() => {
                                        setVehicleToDelete(null);
                                        setDeleteConfirmation("");
                                    }}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleteConfirmation !== vehicleToDelete.plate}
                                    className={`px-6 py-2 rounded-lg text-white font-bold transition-all flex items-center gap-2
                                        ${deleteConfirmation === vehicleToDelete.plate
                                            ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/30 cursor-pointer'
                                            : 'bg-gray-400 cursor-not-allowed opacity-50'
                                        }`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir Veículo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sub-abas Internas */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800 pb-4 mb-6 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('frota')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                        ${activeTab === 'frota'
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    <Car size={16} /> Frota
                </button>
                <button
                    onClick={() => setActiveTab('manutencao')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                        ${activeTab === 'manutencao'
                            ? 'bg-yellow-600 text-white shadow-lg shadow-yellow-600/20'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    <Wrench size={16} /> Manutenções
                </button>
                <button
                    onClick={() => setActiveTab('pneus')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                        ${activeTab === 'pneus'
                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                >
                    <Disc size={16} /> Pneus
                </button>
            </div>

            {activeTab === 'frota' && (
                <>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-500/30 shadow-sm">
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Ativos</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{stats.ativos}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-yellow-500/30 shadow-sm">
                            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
                                <Wrench className="w-5 h-5 text-yellow-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Manutenção</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{stats.manutencao}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-red-500/30 shadow-sm">
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full">
                                <Ban className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-semibold">Indisponível</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white leading-none">{stats.indisponivel}</p>
                            </div>
                        </div>
                    </div>

                    {vehicles.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            Nenhum veículo cadastrado.
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vehicles.map((veiculo) => (
                            <div key={veiculo.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-4">
                                        {/* Imagem do Veículo no Card */}
                                        {veiculo.imageUrl ? (
                                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                <img src={veiculo.imageUrl} alt={veiculo.plate} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                                                <Car className="text-gray-400" />
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white font-mono">
                                                {veiculo.plate}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm text-gray-500">{veiculo.modelo}</p>
                                                {veiculo.color && (
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                                                        {veiculo.color}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span style={s.badge(veiculo.status || 'ativo')}>
                                        {veiculo.status || 'Ativo'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4 mb-4 flex-grow">
                                    <div className="flex items-center gap-2">
                                        <Gauge className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">Quilometragem Inicial</p>
                                            <p className="font-semibold text-gray-900 dark:text-white font-mono">
                                                {veiculo.kmInicial.toLocaleString()} km
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions Buttons */}
                                <div className="flex gap-2 pt-4 mt-auto border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => handleOpenEdit(veiculo)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all font-medium text-sm"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(veiculo)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-all font-medium text-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {activeTab === 'manutencao' && <MaintenanceTab />}
            {activeTab === 'pneus' && <TiresTab />}
        </div>
    );
}
