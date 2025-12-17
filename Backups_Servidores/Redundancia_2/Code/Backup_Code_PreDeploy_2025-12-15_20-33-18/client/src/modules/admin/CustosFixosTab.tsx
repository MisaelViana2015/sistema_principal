import { useState } from "react";

import { FileText, Plus, Search, Edit2, Trash2, DollarSign, Calendar } from "lucide-react";

/**
 * CUSTOS FIXOS PAGE - GESTÃO DE CUSTOS FIXOS (ADMIN)
 * 
 * Página administrativa para gerenciar custos fixos mensais
 * Funcionalidades: listar, adicionar, editar, excluir custos fixos
 */

interface FixedCost {
    id: number;
    name: string;
    description: string;
    amount: number;
    dueDay: number;
    category: string;
    active: boolean;
    createdAt: string;
}

// Mock data
const mockFixedCosts: FixedCost[] = [
    {
        id: 1,
        name: "Aluguel da Garagem",
        description: "Aluguel mensal do espaço para estacionamento",
        amount: 2500.00,
        dueDay: 10,
        category: "Infraestrutura",
        active: true,
        createdAt: "2024-01-01"
    },
    {
        id: 2,
        name: "Seguro Frota",
        description: "Seguro mensal da frota de veículos",
        amount: 1800.00,
        dueDay: 15,
        category: "Seguro",
        active: true,
        createdAt: "2024-01-01"
    },
    {
        id: 3,
        name: "Licenciamento Anual",
        description: "Taxa de licenciamento dos veículos",
        amount: 450.00,
        dueDay: 5,
        category: "Licenciamento",
        active: true,
        createdAt: "2024-01-01"
    },
    {
        id: 4,
        name: "Sistema de Rastreamento",
        description: "Assinatura mensal do sistema de GPS",
        amount: 320.00,
        dueDay: 20,
        category: "Tecnologia",
        active: true,
        createdAt: "2024-01-01"
    }
];

export default function CustosFixosTab() {
    const [fixedCosts] = useState<FixedCost[]>(mockFixedCosts);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCosts = fixedCosts.filter(cost =>
        cost.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cost.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cost.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalMonthlyCost = fixedCosts
        .filter(cost => cost.active)
        .reduce((sum, cost) => sum + cost.amount, 0);

    return (
        
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl shadow-lg">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white">Custos Fixos</h1>
                                <p className="text-gray-400">Gerencie os custos fixos mensais</p>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-600/50">
                            <Plus className="w-5 h-5" />
                            Novo Custo Fixo
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar custo fixo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-700/20 border border-emerald-600/30 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-400 text-sm font-medium mb-1">Total Mensal</p>
                                <p className="text-3xl font-bold text-white">
                                    R$ {totalMonthlyCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <DollarSign className="w-12 h-12 text-emerald-400 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-600/30 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-400 text-sm font-medium mb-1">Custos Ativos</p>
                                <p className="text-3xl font-bold text-white">
                                    {fixedCosts.filter(c => c.active).length}
                                </p>
                            </div>
                            <FileText className="w-12 h-12 text-blue-400 opacity-20" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/20 border border-purple-600/30 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-400 text-sm font-medium mb-1">Total Cadastrado</p>
                                <p className="text-3xl font-bold text-white">{fixedCosts.length}</p>
                            </div>
                            <Calendar className="w-12 h-12 text-purple-400 opacity-20" />
                        </div>
                    </div>
                </div>

                {/* Fixed Costs Table */}
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Descrição
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Categoria
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Valor
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Vencimento
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Ações
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {filteredCosts.map((cost) => (
                                    <tr key={cost.id} className="hover:bg-gray-700/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="text-sm font-medium text-white">{cost.name}</div>
                                                <div className="text-sm text-gray-400">{cost.description}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/30">
                                                {cost.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-emerald-400">
                                                R$ {cost.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm text-gray-300">
                                                <Calendar className="w-4 h-4" />
                                                Dia {cost.dueDay}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${cost.active
                                                    ? "bg-green-600/20 text-green-400 border border-green-600/30"
                                                    : "bg-red-600/20 text-red-400 border border-red-600/30"
                                                }`}>
                                                {cost.active ? "Ativo" : "Inativo"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg transition-all">
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Empty State */}
                {filteredCosts.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg">Nenhum custo fixo encontrado</p>
                    </div>
                )}
            </div>
        
    );
}
