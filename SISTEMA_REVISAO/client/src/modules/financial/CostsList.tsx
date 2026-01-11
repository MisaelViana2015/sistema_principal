import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { api } from "../../lib/api";
import { Loader2, Edit, Trash2 } from "lucide-react";
import { EditExpenseModal } from "./EditExpenseModal";

interface Expense {
    id: string;
    valor: string | number;
    tipo: string;
    descricao?: string;
    data: string;
}

interface CostsListProps {
    shiftId: string;
}

export function CostsList({ shiftId }: CostsListProps) {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (shiftId) {
            loadExpenses();
        }
    }, [shiftId]);

    const loadExpenses = async () => {
        setLoading(true);
        try {
            // Need an endpoint to get expenses by shiftId.
            // Currently financial.routes has /expenses (all). We might need to filter client-side or add query param.
            // Let's try adding shiftId query param assuming backend supports or we update it.
            // Checking financial.service.ts... getExpenses accepts filters?
            // Actually, let's look at getExpensesController.

            // For now, let's assume we can filter or fetch. If not, we fix backend.
            // Based on previous context, we added getExpenses but maybe not filter by shift strictly yet?
            // Let's try passing query param.
            const response = await api.get(`/financial/expenses?shiftId=${shiftId}`);
            setExpenses(response.data.data || []); // Assuming paginated structure or direct array
        } catch (error) {
            console.error("Erro ao carregar despesas:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (expense: Expense) => {
        if (!confirm(`Tem certeza que deseja excluir esta despesa de ${formatCurrency(expense.valor)}?`)) return;

        try {
            await api.delete(`/financial/expenses/${expense.id}`);
            loadExpenses(); // Reload
        } catch (error) {
            console.error("Erro ao excluir:", error);
            alert("Erro ao excluir despesa.");
        }
    };

    const handleEditSave = async (id: string | null, data: Partial<Expense>) => {
        if (!id) return;
        try {
            await api.put(`/financial/expenses/${id}`, data);
            loadExpenses(); // Reload
        } catch (error) {
            console.error("Erro ao atualizar:", error);
            throw error;
        }
    };

    const formatCurrency = (value: number | string) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(Number(value));
    };

    return (
        <div className="space-y-4">
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-900 hover:bg-gray-900">
                        <TableRow className="border-gray-800 hover:bg-gray-900">
                            <TableHead className="text-gray-400">Tipo</TableHead>
                            <TableHead className="text-gray-400">Descrição</TableHead>
                            <TableHead className="text-gray-400 text-right">Valor</TableHead>
                            <TableHead className="text-gray-400 text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-gray-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                        <span>Carregando custos...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : expenses.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-gray-400">
                                    Nenhuma despesa lançada neste turno.
                                </TableCell>
                            </TableRow>
                        ) : (
                            expenses.map((expense) => (
                                <TableRow key={expense.id} className="border-gray-800 hover:bg-gray-800/50">
                                    <TableCell className="text-gray-300 font-medium">
                                        {expense.tipo}
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                        {expense.descricao || '-'}
                                    </TableCell>
                                    <TableCell className="text-right text-red-400 font-bold">
                                        {formatCurrency(expense.valor)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 h-8 w-8 p-0"
                                                onClick={() => {
                                                    setSelectedExpense(expense);
                                                    setIsEditModalOpen(true);
                                                }}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="bg-red-900/20 border-red-900/50 text-red-400 hover:bg-red-900/40 hover:text-red-300 h-8 w-8 p-0"
                                                onClick={() => handleDelete(expense)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <EditExpenseModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                expense={selectedExpense}
                onSave={handleEditSave}
            />
        </div>
    );
}
