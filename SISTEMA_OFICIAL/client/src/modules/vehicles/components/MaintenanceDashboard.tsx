
import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import { AlertTriangle, CheckCircle, Clock, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface MaintenanceStatus {
    vehicle: {
        id: string;
        plate: string;
        model: string;
        currentKm: number;
        imageUrl: string | null;
    };
    status: 'ok' | 'warning' | 'overdue';
    maintenances: {
        id: string;
        configId: string;
        configName: string;
        interval: number;
        lastKm: number | null;
        nextKm: number;
        status: 'ok' | 'warning' | 'overdue';
    }[];
}

export function MaintenanceDashboard() {
    const [fleets, setFleets] = useState<MaintenanceStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState<MaintenanceStatus | null>(null);
    const [selectedConfigId, setSelectedConfigId] = useState("");
    const [performKm, setPerformKm] = useState("");
    const [performDate, setPerformDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        loadDashboard();
    }, []);

    async function loadDashboard() {
        try {
            setIsLoading(true);
            const res = await api.get("/maintenance/dashboard");
            if (res.data.success) {
                setFleets(res.data.data);
            }
        } catch (error) {
            console.error("Failed to load maintenance dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handlePerformMaintenance(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedVehicle || !selectedConfigId || !performKm) return;

        try {
            setIsSubmitting(true);
            await api.post("/maintenance/perform", {
                vehicleId: selectedVehicle.vehicle.id,
                configId: selectedConfigId,
                currentKm: Number(performKm),
                date: performDate
            });

            setIsDialogOpen(false);
            loadDashboard(); // Refresh
        } catch (error) {
            console.error("Failed to register maintenance:", error);
            alert("Erro ao registrar manutenção");
        } finally {
            setIsSubmitting(false);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'overdue': return 'text-red-500 border-red-500/50 bg-red-500/10';
            case 'warning': return 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
            default: return 'text-emerald-500 border-emerald-500/50 bg-emerald-500/10';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'overdue': return <AlertTriangle className="w-4 h-4" />;
            case 'warning': return <Clock className="w-4 h-4" />;
            default: return <CheckCircle className="w-4 h-4" />;
        }
    };

    if (isLoading) return <div className="p-4 text-center text-gray-500 animate-pulse">Carregando status da frota...</div>;

    return (
        <div className="mb-8 space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ActivityIcon />
                Monitoramento de Quilometragem
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {fleets.map(item => (
                    <div key={item.vehicle.id} className={`bg-gray-900/40 border rounded-xl p-4 transition-all hover:bg-gray-900/60 ${item.status === 'overdue' ? 'border-red-500/30' :
                        item.status === 'warning' ? 'border-yellow-500/30' : 'border-gray-800'
                        }`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                {item.vehicle.imageUrl ? (
                                    <img src={item.vehicle.imageUrl} alt={item.vehicle.plate} className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                                        <Wrench className="w-5 h-5 text-gray-600" />
                                    </div>
                                )}
                                <div>
                                    <h4 className="font-bold text-gray-200 text-sm">{item.vehicle.plate}</h4>
                                    <p className="text-xs text-gray-500">{item.vehicle.model}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-500 uppercase tracking-wider">KM Atual</div>
                                <div className="font-mono font-bold text-cyan-400">{item.vehicle.currentKm.toLocaleString()} km</div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            {item.maintenances.map(m => (
                                <div key={m.id} className="flex items-center justify-between text-xs bg-black/20 p-2 rounded border border-gray-800">
                                    <span className="text-gray-400">{m.configName}</span>
                                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded border ${getStatusColor(m.status)}`}>
                                        {getStatusIcon(m.status)}
                                        <span className="font-bold">
                                            {m.status === 'overdue' ? 'VENCIDO' : m.status === 'warning' ? 'ATENÇÃO' : 'OK'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Dialog open={isDialogOpen && selectedVehicle?.vehicle.id === item.vehicle.id} onOpenChange={(open) => {
                            if (open) {
                                setSelectedVehicle(item);
                                setPerformKm(item.vehicle.currentKm.toString());
                                setIsDialogOpen(true);
                            } else {
                                setIsDialogOpen(false);
                            }
                        }}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full mt-4 border-gray-700 hover:bg-cyan-500/10 hover:text-cyan-400 hover:border-cyan-500/50 text-xs uppercase tracking-wider h-8">
                                    Registrar Manutenção
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-950 border-gray-800 text-gray-100">
                                <DialogHeader>
                                    <DialogTitle>Registrar Manutenção Realizada</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handlePerformMaintenance} className="space-y-4 mt-4">
                                    <div className="bg-gray-900/50 p-3 rounded border border-gray-800 mb-4 flex items-center gap-3">
                                        <div className="font-bold text-lg text-cyan-400">{item.vehicle.plate}</div>
                                        <div className="text-sm text-gray-500">KM Atual: {item.vehicle.currentKm}</div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Qual manutenção foi realizada?</Label>
                                        <select
                                            className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm"
                                            value={selectedConfigId}
                                            onChange={e => setSelectedConfigId(e.target.value)}
                                            required
                                        >
                                            <option value="">Selecione...</option>
                                            {item.maintenances.map(m => (
                                                <option key={m.id} value={m.configId}>
                                                    {m.configName} (Próx: {m.nextKm} km)
                                                </option>
                                            ))}
                                            {/* Logic note: the maintenance item ID in 'maintenances' array is 'vehicle_maintenance.id', but we need 'config_id' to register.
                                                Wait, dashboard returns 'maintenances' linked to vehicle_maintenance.
                                                BUT 'performMaintenance' expects 'configId'.
                                                I need to make sure the dashboard data includes 'configId'. 
                                                Let's check repo.
                                                Repo 'getMaintenancesByVehicle' returns: { id, configName, interval, ... }
                                                It DOES NOT return 'configId'. I need to fix repo.*/
                                            }
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>KM na data do serviço</Label>
                                            <Input
                                                type="number"
                                                value={performKm}
                                                onChange={e => setPerformKm(e.target.value)}
                                                className="bg-gray-900 border-gray-700"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Data do serviço</Label>
                                            <Input
                                                type="date"
                                                value={performDate}
                                                onChange={e => setPerformDate(e.target.value)}
                                                className="bg-gray-900 border-gray-700"
                                            />
                                        </div>
                                    </div>

                                    <Button type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold" disabled={isSubmitting}>
                                        {isSubmitting ? "Salvando..." : "Confirmar e Resetar Contador"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                ))}
            </div>
        </div>
    );
}

function ActivityIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
        </svg>
    )
}
