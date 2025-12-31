import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { AlertTriangle, Wrench } from 'lucide-react';
import { api } from '../lib/api';

interface MaintenanceAlert {
    configName: string;
    nextKm: number;
    currentKm: number;
    status: string;
    vehiclePlate: string;
}

const NOTIFICATION_INTERVAL_MS = 12 * 60 * 60 * 1000; // 12 horas (2x ao dia)

export const MaintenanceAlertPopup: React.FC = () => {
    const [open, setOpen] = useState(false);
    const [alerts, setAlerts] = useState<MaintenanceAlert[]>([]);

    useEffect(() => {
        const checkAndShowAlerts = async () => {
            // Verificar última vez que mostrou
            const lastShown = localStorage.getItem('maintenance_alert_driver');
            const now = Date.now();

            if (lastShown && (now - parseInt(lastShown)) < NOTIFICATION_INTERVAL_MS) {
                return; // Já mostrou recentemente
            }

            try {
                // Buscar alertas de manutenção de toda a frota
                const res = await api.get('/maintenance/dashboard');
                if (res.data.success) {
                    const allAlerts: MaintenanceAlert[] = [];

                    res.data.data.forEach((vehicleData: any) => {
                        const currentKm = vehicleData.vehicle.currentKm || 0;
                        const plate = vehicleData.vehicle.plate;

                        vehicleData.maintenances
                            .filter((m: any) => m.status === 'overdue' || m.status === 'warning')
                            .forEach((m: any) => {
                                allAlerts.push({
                                    configName: m.configName,
                                    nextKm: m.nextKm,
                                    currentKm,
                                    status: m.status,
                                    vehiclePlate: plate
                                });
                            });
                    });

                    if (allAlerts.length > 0) {
                        setAlerts(allAlerts);
                        setOpen(true);
                        localStorage.setItem('maintenance_alert_driver', now.toString());
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar alertas de manutenção:', error);
            }
        };

        // Executar verificação após 2 segundos (dar tempo do app carregar)
        const timer = setTimeout(checkAndShowAlerts, 2000);
        return () => clearTimeout(timer);
    }, []);

    if (alerts.length === 0) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="bg-gradient-to-br from-red-900/95 to-gray-900/95 border-red-500/50 text-white max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl text-red-300">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                        Alertas de Manutenção
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4 max-h-80 overflow-y-auto">
                    <p className="text-white/90">
                        Existem manutenções pendentes na frota:
                    </p>

                    <div className="space-y-3">
                        {alerts.map((alert, idx) => {
                            const diff = alert.nextKm - alert.currentKm;
                            const isOverdue = diff < 0;

                            return (
                                <div
                                    key={idx}
                                    className={`p-3 rounded-lg border ${isOverdue
                                            ? 'bg-red-500/20 border-red-500/50'
                                            : 'bg-yellow-500/20 border-yellow-500/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Wrench className={`w-5 h-5 ${isOverdue ? 'text-red-400' : 'text-yellow-400'}`} />
                                            <span className="font-semibold">{alert.configName}</span>
                                        </div>
                                        <span className="text-xs text-cyan-300 bg-cyan-500/20 px-2 py-1 rounded">
                                            {alert.vehiclePlate}
                                        </span>
                                    </div>
                                    <p className={`text-sm mt-1 ${isOverdue ? 'text-red-300' : 'text-yellow-300'}`}>
                                        {isOverdue
                                            ? `VENCIDO (${Math.abs(diff).toLocaleString()} km atrás)`
                                            : `Faltam ${diff.toLocaleString()} km`
                                        }
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-sm text-white/70 italic">
                        Por favor, informe a administração para agendar a manutenção.
                    </p>
                </div>

                <div className="flex justify-end">
                    <Button
                        onClick={() => setOpen(false)}
                        className="bg-cyan-600 hover:bg-cyan-700"
                    >
                        Entendi
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MaintenanceAlertPopup;
