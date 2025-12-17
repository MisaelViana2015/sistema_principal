import { useState } from "react";

import { Car, Plus, Search, Edit2, Trash2, CheckCircle, XCircle } from "lucide-react";

/**
 * VEÍCULOS PAGE - GESTÃO DE VEÍCULOS (ADMIN)
 * 
 * Página administrativa para gerenciar veículos
 * Funcionalidades: listar, adicionar, editar, excluir
 */

interface Vehicle {
    id: number;
    plate: string;
    model: string;
    brand: string;
    year: number;
    color: string;
    active: boolean;
    createdAt: string;
}

// Mock data
const mockVehicles: Vehicle[] = [
    {
        id: 1,
        plate: "ABC-1234",
        model: "Onix",
        brand: "Chevrolet",
        year: 2022,
        color: "Preto",
        active: true,
        createdAt: "2024-01-10"
    },
    {
        id: 2,
        plate: "DEF-5678",
        model: "HB20",
        brand: "Hyundai",
        year: 2023,
        color: "Prata",
        active: true,
        createdAt: "2024-02-15"
    },
    {
        id: 3,
        plate: "GHI-9012",
        model: "Gol",
        brand: "Volkswagen",
        year: 2021,
        color: "Branco",
        active: false,
        createdAt: "2024-03-20"
    }
];

export default function VeiculosTab() {
    const [vehicles] = useState<Vehicle[]>(mockVehicles);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredVehicles = vehicles.filter(vehicle =>
        vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase())
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
                        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-600/50">
                            <Plus className="w-5 h-5" />
                            Novo Veículo
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por placa, modelo ou marca..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                    </div>
                </div>

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
                                        <p className="text-sm text-gray-400">{vehicle.brand}</p>
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
                                    <span className="text-white text-sm font-medium">{vehicle.model}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-sm">Ano:</span>
                                    <span className="text-white text-sm font-medium">{vehicle.year}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-sm">Cor:</span>
                                    <span className="text-white text-sm font-medium">{vehicle.color}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400 text-sm">Cadastro:</span>
                                    <span className="text-white text-sm font-medium">
                                        {new Date(vehicle.createdAt).toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-4 border-t border-gray-700">
                                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-all">
                                    <Edit2 className="w-4 h-4" />
                                    Editar
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-all">
                                    <Trash2 className="w-4 h-4" />
                                    Excluir
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredVehicles.length === 0 && (
                    <div className="text-center py-12">
                        <Car className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">Nenhum veículo encontrado</p>
                    </div>
                )}
            </div>
        
    );
}
