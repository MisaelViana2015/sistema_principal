import { useState, useEffect } from "react";
import { Car, Plus, Search, Edit2, Trash2, CheckCircle, XCircle, Save, X } from "lucide-react";
import { vehiclesService } from "../vehicles/vehicles.service";
import { Vehicle } from "../../../../shared/schema";
import { api } from "../../lib/api";

type VehicleWithStatus = Vehicle & { active: boolean };

export default function VeiculosTab() {
    const [vehicles, setVehicles] = useState<VehicleWithStatus[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        plate: "",
        modelo: "",
        kmInicial: "",
    });

    useEffect(() => {
        loadVehicles();
    }, []);

    async function loadVehicles() {
        setIsLoading(true);
        try {
            const data = await vehiclesService.getAll();
            // Adapt API data to local shape if needed, or simply map
            setVehicles(data.map(v => ({ ...v, active: v.isActive })));
        } catch (error) {
            console.error("Erro ao carregar veículos", error);
        } finally {
            setIsLoading(false);
        }
    }

    const handleCreateVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/vehicles", {
                plate: formData.plate.toUpperCase(),
                modelo: formData.modelo,
                kmInicial: Number(formData.kmInicial),
                isActive: true
            });
            setIsModalOpen(false);
            setFormData({ plate: "", modelo: "", kmInicial: "" });
            loadVehicles(); // Refresh list
        } catch (error) {
            alert("Erro ao criar veículo. Verifique se a placa já existe.");
        }
    };

    const handleDeleteVehicle = async (id: string, plate: string) => {
        if (!confirm(`Tem certeza que deseja remover o veículo ${plate}?`)) return;
        try {
            // Assuming delete endpoint exists
            // await api.delete(`/vehicles/${id}`);
            alert("Funcionalidade de exclusão em desenvolvimento.");
        } catch (error) {
            console.error(error);
        }
    };

    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.modelo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                            <Car className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Gestão de Veículos</h1>
                            <p className="text-gray-400">Gerencie os veículos cadastrados no sistema</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-600/50"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Veículo
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por placa ou modelo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Modal de Cadastro */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Novo Veículo</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateVehicle} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Placa</label>
                                <input
                                    required
                                    value={formData.plate}
                                    onChange={e => setFormData({ ...formData, plate: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 uppercase"
                                    placeholder="ex: ABC-1234"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">Modelo</label>
                                <input
                                    required
                                    value={formData.modelo}
                                    onChange={e => setFormData({ ...formData, modelo: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500"
                                    placeholder="ex: BYD Dolphin Mini"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">KM Inicial</label>
                                <input
                                    required
                                    type="number"
                                    value={formData.kmInicial}
                                    onChange={e => setFormData({ ...formData, kmInicial: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500"
                                    placeholder="0"
                                />
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
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

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-600/30 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-400 text-sm font-medium mb-1">Veículos Ativos</p>
                            <p className="text-3xl font-bold text-white">
                                {vehicles.filter(v => v.active).length}
                            </p>
                        </div>
                        <CheckCircle className="w-12 h-12 text-green-400 opacity-20" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-red-600/20 to-red-700/20 border border-red-600/30 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-red-400 text-sm font-medium mb-1">Veículos Inativos</p>
                            <p className="text-3xl font-bold text-white">
                                {vehicles.filter(v => !v.active).length}
                            </p>
                        </div>
                        <XCircle className="w-12 h-12 text-red-400 opacity-20" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-600/30 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-400 text-sm font-medium mb-1">Total Cadastrado</p>
                            <p className="text-3xl font-bold text-white">{vehicles.length}</p>
                        </div>
                        <Car className="w-12 h-12 text-blue-400 opacity-20" />
                    </div>
                </div>
            </div>

            {/* Vehicles Grid */}
            {isLoading ? (
                <div className="text-center py-12 text-white">Carregando...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle) => (
                        <div
                            key={vehicle.id}
                            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-blue-600/50 transition-all duration-200"
                        >
                            {/* Vehicle Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                                        <Car className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">{vehicle.plate}</h3>
                                        <p className="text-sm text-gray-400">{vehicle.id.slice(0, 8)}...</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${vehicle.active
                                    ? "bg-green-600/20 text-green-400 border border-green-600/30"
                                    : "bg-red-600/20 text-red-400 border border-red-600/30"
                                    }`}>
                                    {vehicle.active ? "Ativo" : "Inativo"}
                                </span>
                            </div>

                            {/* Vehicle Details */}
                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-sm">Modelo:</span>
                                    <span className="text-white text-sm font-medium">{vehicle.modelo}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-sm">KM Atual:</span>
                                    <span className="text-white text-sm font-medium">{vehicle.kmInicial} km</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-gray-700">
                                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all">
                                    <Edit2 className="w-4 h-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleDeleteVehicle(vehicle.id, vehicle.plate)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredVehicles.length === 0 && (
                <div className="text-center py-12">
                    <Car className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nenhum veículo encontrado</p>
                </div>
            )}
        </div>
    );
}
