import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { api } from '../../lib/api';

// Interface compatível com o retorno do backend para despesas
interface Expense {
    id: string;
    valor: string | number;
    tipo: string;
    descricao?: string;
    data?: string;
    isParticular?: boolean;
}

interface EditExpenseModalProps {
    expense: Expense | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, data: Partial<Expense>) => Promise<void>;
}

export function EditExpenseModal({ expense, isOpen, onClose, onSave }: EditExpenseModalProps) {
    const [formData, setFormData] = useState({
        valor: '',
        tipo: '',
        descricao: '',
        isParticular: false
    });
    const [costTypes, setCostTypes] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCostTypes();
    }, []);

    useEffect(() => {
        if (expense) {
            setFormData({
                valor: String(expense.valor),
                tipo: expense.tipo,
                descricao: expense.descricao || '',
                isParticular: expense.isParticular || false
            });
        }
    }, [expense]);

    const loadCostTypes = async () => {
        try {
            // Assumindo endpoint padrão. Se não existir, usaremos lista estática.
            // const response = await api.get('/financial/cost-types');
            // setCostTypes(response.data);

            // Mock types for now based on standard system types
            setCostTypes([
                { id: 'abastecimento', name: 'Abastecimento' },
                { id: 'lavagem', name: 'Lavagem' },
                { id: 'manutencao', name: 'Manutenção' },
                { id: 'outros', name: 'Outros' }
            ]);
        } catch (error) {
            console.error("Erro ao carregar tipos de custo", error);
        }
    };

    if (!isOpen || !expense) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(expense.id, {
                ...formData,
                valor: Number(formData.valor)
            });
            onClose();
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar alterações");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]"> {/* z-60 to be above EditShiftModal */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border border-gray-700">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Despesa</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Valor (R$)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            inputMode="decimal"
                            required
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={formData.valor}
                            onChange={e => setFormData({ ...formData, valor: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                        <input
                            type="checkbox"
                            id="edit-particular"
                            checked={formData.isParticular}
                            onChange={e => setFormData({ ...formData, isParticular: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-green-600 focus:ring-green-500 focus:ring-offset-gray-800"
                        />
                        <label htmlFor="edit-particular" className="text-sm font-medium text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                            Despesa Particular (Custos Particulares)
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tipo de Custo
                        </label>
                        <select
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={formData.tipo}
                            onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                        >
                            <option value="">Selecione...</option>
                            {costTypes.map(type => (
                                <option key={type.id} value={type.name}>{type.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descrição (Opcional)
                        </label>
                        <textarea
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            rows={3}
                            value={formData.descricao}
                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
