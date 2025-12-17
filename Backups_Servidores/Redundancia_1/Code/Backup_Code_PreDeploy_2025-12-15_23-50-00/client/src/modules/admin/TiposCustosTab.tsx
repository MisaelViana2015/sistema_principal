import { useState } from "react";

import { Tag, Plus, Search, Edit2, Trash2 } from "lucide-react";

/**
 * TIPOS DE CUSTOS PAGE - GESTÃO DE TIPOS DE CUSTOS (ADMIN)
 * 
 * Página administrativa para gerenciar categorias de custos
 * Funcionalidades: listar, adicionar, editar, excluir categorias
 */

interface CostType {
    id: number;
    name: string;
    description: string;
    color: string;
    active: boolean;
    createdAt: string;
}

// Mock data
const mockCostTypes: CostType[] = [
    {
        id: 1,
        name: "Combustível",
        description: "Gastos com combustível",
        color: "#ef4444",
        active: true,
        createdAt: "2024-01-01"
    },
    {
        id: 2,
        name: "Manutenção",
        description: "Manutenções preventivas e corretivas",
        color: "#3b82f6",
        active: true,
        createdAt: "2024-01-01"
    },
    {
        id: 3,
        name: "Seguro",
        description: "Seguros de veículos",
        color: "#10b981",
        active: true,
        createdAt: "2024-01-01"
    },
    {
        id: 4,
        name: "Licenciamento",
        description: "Taxas e licenciamentos",
        color: "#f59e0b",
        active: true,
        createdAt: "2024-01-01"
    },
    {
        id: 5,
        name: "Pneus",
        description: "Compra e troca de pneus",
        color: "#8b5cf6",
        active: true,
        createdAt: "2024-01-01"
    }
];

export default function TiposCustosTab() {
    const [costTypes] = useState<CostType[]>(mockCostTypes);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCostTypes = costTypes.filter(type =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl shadow-lg">
                                <Tag className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Tipos de Custos</h1>
                                <p className="text-gray-400">Gerencie as categorias de custos do sistema</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-600/50">
                            <Plus className="w-5 h-5" />
                            Novo Tipo
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar tipo de custo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Stats Card */}
                <div className="bg-gradient-to-br from-orange-600/20 to-orange-700/20 border border-orange-600/30 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-400 text-sm font-medium mb-1">Total de Categorias</p>
                            <p className="text-3xl font-bold text-white">{costTypes.length}</p>
                        </div>
                        <Tag className="w-12 h-12 text-orange-400 opacity-20" />
                    </div>
                </div>

                {/* Cost Types Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCostTypes.map((type) => (
                        <div
                            key={type.id}
                            className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-orange-600/50 transition-all duration-200"
                        >
                            {/* Type Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div
                                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                                    style={{ backgroundColor: `${type.color}20`, border: `2px solid ${type.color}40` }}
                                >
                                    <Tag className="w-6 h-6" style={{ color: type.color }} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white">{type.name}</h3>
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${type.active
                                            ? "bg-green-600/20 text-green-400 border border-green-600/30"
                                            : "bg-red-600/20 text-red-400 border border-red-600/30"
                                        }`}>
                                        {type.active ? "Ativo" : "Inativo"}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <p className="text-gray-400 text-sm mb-4">{type.description}</p>

                            {/* Meta Info */}
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-700">
                                <span>Criado em:</span>
                                <span>{new Date(type.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
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
                {filteredCostTypes.length === 0 && (
                    <div className="text-center py-12">
                        <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">Nenhum tipo de custo encontrado</p>
                    </div>
                )}
            </div>
        
    );
}
