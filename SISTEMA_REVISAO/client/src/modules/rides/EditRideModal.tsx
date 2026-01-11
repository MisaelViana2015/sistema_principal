import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// Use RideWithDetails directly or a compatible interface
export interface RideCompatible {
    id: string;
    valor: string; // The backend/schema usually returns string for decimal
    tipo: string;
    hora: Date; // The frontend uses Date objects after parsing
    driverName?: string;
    vehiclePlate?: string;
}

interface EditRideModalProps {
    ride: any | null; // Loosening strict type to avoid conflict during rapid dev, or use RideWithDetails
    isOpen: boolean;
    onClose: () => void;
    onSave: (id: string, data: any) => Promise<void>;
}

export function EditRideModal({ ride, isOpen, onClose, onSave }: EditRideModalProps) {
    const [formData, setFormData] = useState({
        valor: '',
        tipo: 'APP',
        hora: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (ride) {
            // Format date for datetime-local input
            const dateObj = new Date(ride.hora);
            dateObj.setMinutes(dateObj.getMinutes() - dateObj.getTimezoneOffset());
            const formattedDate = dateObj.toISOString().slice(0, 16);

            setFormData({
                valor: String(ride.valor),
                tipo: (ride.tipo || 'APP').toUpperCase(), // Garantir MAIÚSCULO
                hora: formattedDate
            });
        }
    }, [ride]);

    if (!isOpen || !ride) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(ride.id, {
                ...formData,
                tipo: formData.tipo.toUpperCase(), // Garantir MAIÚSCULO
                hora: new Date(formData.hora).toISOString()
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Editar Corrida</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Corrija os dados da corrida abaixo.</p>
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Tipo
                        </label>
                        <select
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={formData.tipo}
                            onChange={e => setFormData({ ...formData, tipo: e.target.value })}
                        >
                            <option value="APP">App</option>
                            <option value="PARTICULAR">Particular</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Data e Hora
                        </label>
                        <input
                            type="datetime-local"
                            required
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            value={formData.hora}
                            onChange={e => setFormData({ ...formData, hora: e.target.value })}
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
