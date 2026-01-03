import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Loader2, Plus, Trash2, Car, User, Clock, DollarSign } from "lucide-react";
import { api } from "../../lib/api";

interface CreateManualShiftModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

interface RideEntry {
    hora: string;
    valor: string;
    tipo: 'app' | 'particular';
}

interface CostEntry {
    hora: string;
    costTypeId: string;
    value: string;
    description: string;
}

export function CreateManualShiftModal({ open, onOpenChange, onSuccess }: CreateManualShiftModalProps) {
    const [loading, setLoading] = useState(false);
    const [drivers, setDrivers] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [costTypes, setCostTypes] = useState<any[]>([]);

    // Form state
    const [driverId, setDriverId] = useState("");
    const [vehicleId, setVehicleId] = useState("");
    const [kmInicial, setKmInicial] = useState("");
    const [kmFinal, setKmFinal] = useState("");
    const [inicio, setInicio] = useState("");
    const [fim, setFim] = useState("");

    // Dynamic lists
    const [rides, setRides] = useState<RideEntry[]>([{ hora: "", valor: "", tipo: "app" }]);
    const [costs, setCosts] = useState<CostEntry[]>([]);

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            loadData();
            resetForm();
        }
    }, [open]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [driversRes, vehiclesRes, costTypesRes] = await Promise.all([
                api.get('/drivers'),
                api.get('/vehicles'),
                api.get('/cost-types')
            ]);
            setDrivers(driversRes.data);
            setVehicles(vehiclesRes.data);
            setCostTypes(costTypesRes.data);
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setDriverId("");
        setVehicleId("");
        setKmInicial("");
        setKmFinal("");
        setInicio("");
        setFim("");
        setRides([{ hora: "", valor: "", tipo: "app" }]);
        setCosts([]);
        setError(null);
    };

    // Rides management
    const addRide = () => {
        setRides([...rides, { hora: "", valor: "", tipo: "app" }]);
    };

    const removeRide = (index: number) => {
        if (rides.length > 1) {
            setRides(rides.filter((_, i) => i !== index));
        }
    };

    const updateRide = (index: number, field: keyof RideEntry, value: string) => {
        const updated = [...rides];
        updated[index] = { ...updated[index], [field]: value };
        setRides(updated);
    };

    // Costs management
    const addCost = () => {
        setCosts([...costs, { hora: "", costTypeId: "", value: "", description: "" }]);
    };

    const removeCost = (index: number) => {
        setCosts(costs.filter((_, i) => i !== index));
    };

    const updateCost = (index: number, field: keyof CostEntry, value: string) => {
        const updated = [...costs];
        updated[index] = { ...updated[index], [field]: value };
        setCosts(updated);
    };

    const handleSubmit = async () => {
        // Validation
        if (!driverId || !vehicleId || !kmInicial || !kmFinal || !inicio || !fim) {
            setError("Preencha todos os campos obrigatórios do turno.");
            return;
        }

        const validRides = rides.filter(r => r.hora && r.valor);
        if (validRides.length === 0) {
            setError("Adicione pelo menos uma corrida.");
            return;
        }

        setSaving(true);
        setError(null);

        try {
            const payload = {
                driverId,
                vehicleId,
                kmInicial: Number(kmInicial),
                kmFinal: Number(kmFinal),
                inicio: new Date(inicio).toISOString(),
                fim: new Date(fim).toISOString(),
                rides: validRides.map(r => ({
                    hora: new Date(r.hora).toISOString(),
                    valor: Number(r.valor),
                    tipo: r.tipo
                })),
                expenses: costs.filter(c => c.costTypeId && c.value).map(c => ({
                    hora: c.hora ? new Date(c.hora).toISOString() : new Date(inicio).toISOString(),
                    costTypeId: c.costTypeId,
                    value: Number(c.value),
                    description: c.description || null
                }))
            };

            console.log('[CreateManualShift] Sending:', payload);
            await api.post('/shifts/manual', payload);

            onSuccess();
            onOpenChange(false);
        } catch (err: any) {
            console.error('Error creating manual shift:', err);
            setError(err.response?.data?.message || "Erro ao criar turno manual.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="fixed left-0 top-0 translate-x-0 translate-y-0 w-screen h-[100dvh] max-w-none max-h-none rounded-none sm:fixed sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-3xl sm:w-[95vw] sm:max-h-[90vh] sm:rounded-xl bg-gray-900 border-gray-800 text-white flex flex-col p-4 overflow-hidden z-[9999]">
                <DialogHeader className="mb-2">
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Car className="w-6 h-6 text-emerald-400" />
                        Criar Turno Manual (Retroativo)
                    </DialogTitle>
                    <p className="text-sm text-gray-400">
                        Crie um turno completo retroativamente quando o motorista esqueceu de abrir.
                    </p>
                </DialogHeader>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center">
                        <Loader2 className="animate-spin w-8 h-8 text-emerald-400" />
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                        {/* Dados do Turno */}
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-400" />
                                Dados do Turno
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Motorista *</Label>
                                    <Select value={driverId} onValueChange={setDriverId}>
                                        <SelectTrigger className="bg-gray-800 border-gray-700">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700">
                                            {drivers.map(d => (
                                                <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Veículo *</Label>
                                    <Select value={vehicleId} onValueChange={setVehicleId}>
                                        <SelectTrigger className="bg-gray-800 border-gray-700">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent className="bg-gray-800 border-gray-700">
                                            {vehicles.map(v => (
                                                <SelectItem key={v.id} value={v.id}>{v.placa} — {v.apelido}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>KM Inicial *</Label>
                                    <Input
                                        type="number"
                                        className="bg-gray-800 border-gray-700"
                                        value={kmInicial}
                                        onChange={e => setKmInicial(e.target.value)}
                                        placeholder="Ex: 32150"
                                    />
                                </div>
                                <div>
                                    <Label>KM Final *</Label>
                                    <Input
                                        type="number"
                                        className="bg-gray-800 border-gray-700"
                                        value={kmFinal}
                                        onChange={e => setKmFinal(e.target.value)}
                                        placeholder="Ex: 32280"
                                    />
                                </div>
                                <div>
                                    <Label>Horário de Início *</Label>
                                    <Input
                                        type="datetime-local"
                                        className="bg-gray-800 border-gray-700"
                                        value={inicio}
                                        onChange={e => setInicio(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label>Horário de Fim *</Label>
                                    <Input
                                        type="datetime-local"
                                        className="bg-gray-800 border-gray-700"
                                        value={fim}
                                        onChange={e => setFim(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Corridas */}
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-green-400" />
                                    Corridas ({rides.length})
                                </h3>
                                <Button size="sm" onClick={addRide} className="bg-green-600 hover:bg-green-700">
                                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {rides.map((ride, idx) => (
                                    <div key={idx} className="grid grid-cols-[1fr_100px_120px_40px] gap-2 items-end">
                                        <div>
                                            <Label className="text-xs">Horário</Label>
                                            <Input
                                                type="datetime-local"
                                                className="bg-gray-800 border-gray-700 text-sm"
                                                value={ride.hora}
                                                onChange={e => updateRide(idx, 'hora', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Valor (R$)</Label>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                className="bg-gray-800 border-gray-700 text-sm"
                                                value={ride.valor}
                                                onChange={e => updateRide(idx, 'valor', e.target.value)}
                                                placeholder="15.00"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Tipo</Label>
                                            <Select value={ride.tipo} onValueChange={v => updateRide(idx, 'tipo', v)}>
                                                <SelectTrigger className="bg-gray-800 border-gray-700 text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="bg-gray-800 border-gray-700">
                                                    <SelectItem value="app">App</SelectItem>
                                                    <SelectItem value="particular">Particular</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeRide(idx)}
                                            disabled={rides.length === 1}
                                            className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Custos */}
                        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <DollarSign className="w-5 h-5 text-red-400" />
                                    Custos ({costs.length})
                                </h3>
                                <Button size="sm" onClick={addCost} className="bg-red-600 hover:bg-red-700">
                                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                                </Button>
                            </div>
                            {costs.length === 0 ? (
                                <p className="text-gray-500 text-sm italic">Nenhum custo adicionado.</p>
                            ) : (
                                <div className="space-y-3">
                                    {costs.map((cost, idx) => (
                                        <div key={idx} className="grid grid-cols-[1fr_1fr_100px_1fr_40px] gap-2 items-end">
                                            <div>
                                                <Label className="text-xs">Horário</Label>
                                                <Input
                                                    type="datetime-local"
                                                    className="bg-gray-800 border-gray-700 text-sm"
                                                    value={cost.hora}
                                                    onChange={e => updateCost(idx, 'hora', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Tipo de Custo</Label>
                                                <Select value={cost.costTypeId} onValueChange={v => updateCost(idx, 'costTypeId', v)}>
                                                    <SelectTrigger className="bg-gray-800 border-gray-700 text-sm">
                                                        <SelectValue placeholder="Selecione..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-gray-800 border-gray-700">
                                                        {costTypes.map(ct => (
                                                            <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-xs">Valor (R$)</Label>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    className="bg-gray-800 border-gray-700 text-sm"
                                                    value={cost.value}
                                                    onChange={e => updateCost(idx, 'value', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs">Descrição</Label>
                                                <Input
                                                    type="text"
                                                    className="bg-gray-800 border-gray-700 text-sm"
                                                    value={cost.description}
                                                    onChange={e => updateCost(idx, 'description', e.target.value)}
                                                    placeholder="Opcional"
                                                />
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => removeCost(idx)}
                                                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-3 bg-red-900/30 border border-red-700 rounded text-red-300 text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                )}

                <DialogFooter className="mt-4 pt-4 border-t border-gray-800 flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={saving || loading}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                        {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Car className="w-4 h-4 mr-2" />}
                        Criar Turno Completo
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
