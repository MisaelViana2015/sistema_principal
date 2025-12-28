import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Activity, ShieldCheck } from 'lucide-react';
import { FraudHeatmap } from './FraudHeatmap'; // Assuming FraudHeatmap was default exported or named export. Step 2342 showed named export in import { FraudHeatmap }... actually wait. Step 2342 showed named export.
import FraudNavigation from './components/FraudNavigation';

// Sub-pages imports
import FraudReports from './pages/FraudReports';
import FraudAnalysisQueue from './pages/FraudAnalysisQueue';
import FraudEventsList from './pages/FraudEventsList';
import FraudConfiguration from './pages/FraudConfiguration';
import FraudLogs from './pages/FraudLogs';

interface FraudStats {
    riskScore: number;
    activeAlerts: number;
    processedShifts: number;
    highRiskDrivers: number;
}

interface FraudEvent {
    id: string;
    type: string;
    riskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    status: 'pendente' | 'em_analise' | 'confirmado' | 'descartado';
    detectedAt: string;
    driverId: string;
    shiftId: string;
    details: any;
    rules: { ruleId: string; label: string; score: number }[];
    driver?: { id: string; name: string; };
}

import { Dialog, DialogContent } from "@/components/ui/dialog";
import FraudEventDetail from './pages/FraudEventDetail';

const FraudDashboard = () => {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentTab, setCurrentTab] = useState('painel');
    const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

    const { data: stats } = useQuery({
        queryKey: ['fraud-stats'],
        queryFn: async () => {
            const res = await api.get('/fraud/dashboard-stats');
            return res.data;
        }
    });

    const { data: alerts } = useQuery({
        queryKey: ['fraud-recent-alerts'],
        queryFn: async () => {
            const res = await api.get('/fraud/alerts');
            return res.data;
        }
    });

    const displayStats: FraudStats = stats || {
        riskScore: 0,
        activeAlerts: 0,
        processedShifts: 0,
        highRiskDrivers: 0
    };

    const recentAlerts: FraudEvent[] = alerts || [];

    const filteredAlerts = statusFilter === 'all'
        ? recentAlerts
        : recentAlerts.filter(a => a.status === statusFilter);

    const getStatusBadge = (status: string) => {
        const styles = {
            pendente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            em_analise: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
            confirmado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            descartado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        };
        const labels = {
            pendente: 'Pendente',
            em_analise: 'Em Análise',
            confirmado: 'Confirmado',
            descartado: 'Descartado',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
                {labels[status as keyof typeof labels] || status}
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Painel de Detecção de Fraude</h2>
                    <p className="text-muted-foreground mt-1">Monitoramento em tempo real de anomalias financeiras e operacionais.</p>
                </div>
            </div>

            {/* Navigation Tabs - Controlled by State */}
            <FraudNavigation activeTab={currentTab} onTabChange={setCurrentTab} />

            {/* TAB CONTENT: PAINEL */}
            {currentTab === 'painel' && (
                <>
                    {/* KPI Cards */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card className="p-6 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                                    <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Score Geral de Risco</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{displayStats.riskScore?.toFixed(1) || '0.0'}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full">
                                    <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Alertas Ativos</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{displayStats.activeAlerts}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
                                    <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Turnos Processados</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{displayStats.processedShifts}</h3>
                                </div>
                            </div>
                        </Card>

                        <Card className="p-6 border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-full">
                                    <span className="text-xl">⚠️</span>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Motoristas em Risco</p>
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{displayStats.highRiskDrivers}</h3>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Heatmap Section */}
                    <div className="grid gap-6 md:grid-cols-1 mt-6">
                        <FraudHeatmap />
                    </div>

                    {/* Recent Alerts List */}
                    <Card className="p-6 mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">🚨 Alertas Recentes</h3>
                            <div className="flex gap-2">
                                {['all', 'pendente', 'em_analise', 'confirmado'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${statusFilter === status
                                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                            }`}
                                    >
                                        {status === 'all' ? 'Todos' : status.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredAlerts && filteredAlerts.length > 0 ? (
                                filteredAlerts.map((alert, i) => (
                                    <div key={alert.id || i} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${alert.riskLevel === 'critical' ? 'bg-red-600' :
                                                alert.riskLevel === 'high' ? 'bg-orange-500' :
                                                    alert.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                                }`}></div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">
                                                        {alert.rules && alert.rules.length > 0 ? alert.rules[0].label : 'Anomalia Detectada'}
                                                    </p>
                                                    {getStatusBadge(alert.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Score: {alert.riskScore} • {new Date((alert as any).metadata?.date || alert.detectedAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Turno: {alert.shiftId?.slice(0, 8)}... | Motorista: <strong>{alert.driver?.name || alert.driverId}</strong>
                                                </p>
                                            </div>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => setSelectedAlertId(alert.id)}>
                                            Ver Detalhes
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    Nenhum alerta recente encontrado com status "{statusFilter}".
                                </div>
                            )}
                        </div>
                    </Card>
                </>
            )}

            {/* TAB CONTENT: SUB-PAGES */}
            {currentTab === 'relatorios' && <FraudReports />}
            {currentTab === 'fila' && <FraudAnalysisQueue onSelectEvent={setSelectedAlertId} />}
            {currentTab === 'eventos' && <FraudEventsList onSelectEvent={setSelectedAlertId} />}
            {currentTab === 'configuracao' && <FraudConfiguration />}
            {currentTab === 'logs' && <FraudLogs />}

            {/* MODAL DETALHES EVENTO */}
            <Dialog open={!!selectedAlertId} onOpenChange={(open) => !open && setSelectedAlertId(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-full">
                    {selectedAlertId && (
                        <FraudEventDetail
                            eventId={selectedAlertId}
                            onClose={() => setSelectedAlertId(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default FraudDashboard;
