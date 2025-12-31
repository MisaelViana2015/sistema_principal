import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Activity, ShieldCheck, RefreshCcw, Search, ChevronLeft, ChevronRight, Filter, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
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
    metadata?: { date?: string };
    rules: { ruleId: string; label: string; score: number }[];
    driver?: { id: string; name: string; };
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import FraudEventDetail from './pages/FraudEventDetail';

const FraudDashboard = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentTab, setCurrentTab] = useState('painel');
    // Filters & Pagination State
    const [alertPage, setAlertPage] = useState(1);
    const [selectedDriver, setSelectedDriver] = useState<string>('all');
    const [dateFilter, setDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' });

    // Helper to get first day of current month for default view? 
    // User requested "from first day of month to today".
    // We can set default state on mount if needed, or leave empty for "Recent".
    // Let's leave empty for now, user can filter.

    const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

    // Batch Reprocess States
    const [reprocessModalOpen, setReprocessModalOpen] = useState(false);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);
    const [previewData, setPreviewData] = useState<any>(null);
    const [reprocessStatus, setReprocessStatus] = useState<any>(null);
    const [isAnalyzingOpen, setIsAnalyzingOpen] = useState(false);
    const [analyzeOpenResult, setAnalyzeOpenResult] = useState<any>(null);

    // Polling for status
    React.useEffect(() => {
        let interval: NodeJS.Timeout;

        const checkStatus = async () => {
            try {
                const res = await api.get('/fraud/reprocess-status');
                const status = res.data;
                setReprocessStatus(status);

                if (!status.isRunning && status.processed > 0 && reprocessModalOpen) {
                    // Completed
                }
            } catch (err) {
                console.error("Error checking batch status", err);
            }
        };

        if (reprocessModalOpen) {
            checkStatus(); // Initial check
            interval = setInterval(checkStatus, 2000);
        }

        return () => clearInterval(interval);
    }, [reprocessModalOpen]);

    const handleOpenReprocess = async () => {
        setReprocessModalOpen(true);
        setIsLoadingPreview(true);
        setPreviewData(null);
        try {
            // Check status first
            const statusRes = await api.get('/fraud/reprocess-status');
            if (statusRes.data.isRunning) {
                setReprocessStatus(statusRes.data);
                setIsLoadingPreview(false);
                return;
            }

            // If not running, get preview
            const previewRes = await api.get('/fraud/reprocess-preview');
            setPreviewData(previewRes.data);
            setReprocessStatus(statusRes.data); // Reset status display
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handleConfirmReprocess = async () => {
        try {
            await api.post('/fraud/reprocess-all');
            // Status update will be caught by polling
            setPreviewData(null); // Switch to status view
        } catch (err) {
            alert('Erro ao iniciar reprocessamento. Verifique se já não há um em andamento.');
        }
    };

    const { data: stats } = useQuery({
        queryKey: ['fraud-stats'],
        queryFn: async () => {
            const res = await api.get('/fraud/dashboard-stats');
            return res.data;
        }
    });

    // Fetch Alerts with Pagination & Filters
    const { data: alertsResponse, isLoading: isLoadingAlerts } = useQuery({
        queryKey: ['fraud-recent-alerts', alertPage, selectedDriver, dateFilter, reprocessStatus?.lastUpdate],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', alertPage.toString());
            params.append('limit', '30'); // Requested 30 per page
            if (selectedDriver && selectedDriver !== 'all' && selectedDriver !== '') params.append('driverId', selectedDriver);
            if (dateFilter.start) params.append('startDate', dateFilter.start);
            if (dateFilter.end) params.append('endDate', dateFilter.end);

            // Pass current status filter to backend
            if (statusFilter && statusFilter !== 'all') {
                params.append('status', statusFilter);
            } else {
                params.append('status', 'pendente,em_analise,confirmado');
            }

            const res = await api.get('/fraud/alerts', { params });
            return res.data; // Now returns { data: [], meta: {} }
        },
        placeholderData: (previousData) => previousData
    });

    const recentAlerts = alertsResponse?.data || [];
    // Filter out Score 0 from 'Ativos' view (nothing to validate)
    const filteredAlerts = recentAlerts;
    const meta = alertsResponse?.meta || { total: 0, totalPages: 1, page: 1 };

    // Fetch Drivers for Select Filter
    const { data: driversData } = useQuery({
        queryKey: ['drivers-list'],
        queryFn: async () => {
            const res = await api.get('/drivers');
            return res.data;
        },
        staleTime: 5 * 60 * 1000 // Cache for 5 min
    });
    const driversList = driversData || [];


    const displayStats: FraudStats = stats || {
        riskScore: 0,
        activeAlerts: 0,
        processedShifts: 0,
        highRiskDrivers: 0
    };

    // Filter out Score 0 from 'Ativos' view - handled above in filteredAlerts

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
                <Button variant="outline" onClick={handleOpenReprocess} className="gap-2">
                    <RefreshCcw className="w-4 h-4" />
                    Reprocessar Histórico
                </Button>
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

                    {/* Combined Filters - Above Heatmap */}
                    <Card className="p-4 mt-6 border-slate-700 bg-slate-900/60">
                        <div className="flex items-center gap-2 mb-3">
                            <Filter className="w-4 h-4 text-emerald-500" />
                            <h3 className="text-sm font-semibold text-gray-200">Filtros</h3>
                        </div>
                        <div className="flex flex-wrap gap-4 items-end">
                            {/* Driver Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400">Motorista</label>
                                <Select
                                    value={selectedDriver}
                                    onValueChange={(val) => {
                                        setSelectedDriver(val);
                                        setAlertPage(1);
                                    }}
                                >
                                    <SelectTrigger className="w-[180px] h-9 bg-slate-800 border-slate-600 text-white">
                                        <SelectValue placeholder="Todos" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Motoristas</SelectItem>
                                        {driversList.map((driver: any) => (
                                            <SelectItem key={driver.id} value={driver.id}>
                                                {driver.nome || driver.name || driver.id}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date Filters */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400">Data Inicial</label>
                                <Input
                                    type="date"
                                    value={dateFilter.start}
                                    onChange={e => {
                                        setDateFilter(prev => ({ ...prev, start: e.target.value }));
                                        setAlertPage(1);
                                    }}
                                    className="w-[140px] h-9 bg-slate-800 border-slate-600 text-white [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-gray-400">Data Final</label>
                                <Input
                                    type="date"
                                    value={dateFilter.end}
                                    onChange={e => {
                                        setDateFilter(prev => ({ ...prev, end: e.target.value }));
                                        setAlertPage(1);
                                    }}
                                    className="w-[140px] h-9 bg-slate-800 border-slate-600 text-white [&::-webkit-calendar-picker-indicator]:invert"
                                />
                            </div>

                            {/* Clear Button */}
                            {(dateFilter.start || dateFilter.end || (selectedDriver && selectedDriver !== 'all')) && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        setDateFilter({ start: '', end: '' });
                                        setSelectedDriver('all');
                                        setAlertPage(1);
                                    }}
                                    className="text-gray-400 hover:text-white h-9"
                                >
                                    Limpar Tudo
                                </Button>
                            )}
                        </div>
                    </Card>

                    {/* Heatmap Section */}
                    <div className="grid gap-6 md:grid-cols-1 mt-4">
                        <FraudHeatmap driverId={selectedDriver} />
                    </div>

                    {/* Recent Alerts List */}
                    <Card className="p-6 mt-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">🚨 Alertas Recentes</h3>
                            <div className="flex gap-2">
                                {['all', 'pendente', 'em_analise', 'confirmado', 'descartado'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            setStatusFilter(status);
                                            setAlertPage(1);
                                        }}
                                        className={`px-3 py-1 text-sm rounded-full transition-colors ${statusFilter === status
                                            ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                                            }`}
                                    >
                                        {status === 'all' ? 'Ativos' : status.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {filteredAlerts && filteredAlerts.length > 0 ? (
                                filteredAlerts.map((alert: any, i: number) => (
                                    <div key={alert.id || i} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-4 h-4 rounded-full ${alert.riskScore >= 20 ? 'bg-red-500' :
                                                alert.riskScore >= 6 ? 'bg-yellow-400' :
                                                    alert.riskScore >= 1 ? 'bg-green-300' : 'bg-blue-100'
                                                }`}></div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-medium">
                                                        {alert.rules && alert.rules.length > 0 ? alert.rules[0].label : 'Anomalia Detectada'}
                                                    </p>
                                                    {getStatusBadge(alert.status)}
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Score: {alert.riskScore} • {new Date((alert.metadata?.date || alert.details?.date || alert.detectedAt)).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Turno: {alert.shiftId?.slice(0, 8)}... | Motorista: <strong>{alert.driver?.name || alert.driverId}</strong>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {(alert.status === 'pendente' || alert.status === 'em_analise') && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={async () => {
                                                        if (window.confirm('Marcar este alerta como Descartado (Falso Positivo)?')) {
                                                            try {
                                                                await api.post(`/fraud/event/${alert.id}/status`, {
                                                                    status: 'descartado',
                                                                    comment: 'Descartado via Acesso Rápido'
                                                                });
                                                                queryClient.invalidateQueries({ queryKey: ['fraud-recent-alerts'] });
                                                                queryClient.invalidateQueries({ queryKey: ['fraud-stats'] });
                                                            } catch (err) {
                                                                alert("Erro ao descartar alerta.");
                                                                console.error(err);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    <span className="sr-only">Descartar</span>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button variant="outline" size="sm" onClick={() => setSelectedAlertId(alert.id)}>
                                                Ver Detalhes
                                            </Button>
                                        </div>
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

            {/* MODAL REPROCESSAMENTO BATCH */}
            <Dialog open={reprocessModalOpen} onOpenChange={setReprocessModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reprocessamento de Histórico</DialogTitle>
                        <DialogDescription>
                            Reanalise todos os turnos finalizados com as regras atuais de fraude.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {isLoadingPreview ? (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                <p className="text-sm text-muted-foreground">Calculando escopo...</p>
                            </div>
                        ) : reprocessStatus?.isRunning ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Progresso:</span>
                                    <span className="font-bold">{reprocessStatus.processed} / {reprocessStatus.total}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, (reprocessStatus.processed / (reprocessStatus.total || 1)) * 100)}%` }}
                                    ></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-xs mt-2">
                                    <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded text-red-600">
                                        Erros: {reprocessStatus.errors}
                                    </div>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-blue-600 text-right">
                                        Tempo: {Math.round((Date.now() - (reprocessStatus.startTime || Date.now())) / 1000)}s
                                    </div>
                                </div>
                                <p className="text-xs text-center text-muted-foreground animate-pulse">
                                    Processando em background. Você pode fechar esta janela.
                                </p>
                            </div>
                        ) : previewData ? (
                            <div className="space-y-4">
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                                            <p className="font-bold mb-1">Atenção</p>
                                            <p>Esta ação irá gerar novas versões de eventos para {previewData.totalShifts} turnos.</p>
                                            <p className="mt-1">Período: {previewData.dateRange}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-center text-muted-foreground">
                                    Tempo estimado: <strong>{previewData.estimatedTime}</strong>
                                </div>
                            </div>
                        ) : reprocessStatus?.duration ? (
                            <div className="text-center space-y-4 py-4">
                                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
                                <h3 className="text-lg font-bold text-green-600">Concluído!</h3>
                                <p className="text-sm">
                                    Processados: {reprocessStatus.processed} | Erros: {reprocessStatus.errors}
                                    <br />
                                    Duração: {reprocessStatus.duration}
                                </p>
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter>
                        {!reprocessStatus?.isRunning && previewData && (
                            <Button onClick={handleConfirmReprocess} className="w-full sm:w-auto">
                                Confirmar e Processar
                            </Button>
                        )}
                        <Button variant="outline" onClick={() => setReprocessModalOpen(false)} className="w-full sm:w-auto">
                            Fechar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default FraudDashboard;
