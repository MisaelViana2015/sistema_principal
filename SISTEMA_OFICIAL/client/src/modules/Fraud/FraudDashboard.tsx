import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FraudHeatmap } from './FraudHeatmap';
import { RefreshCw, ShieldAlert, ShieldCheck, Activity } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    riskScore: number;
    activeAlerts: number;
    processedShifts: number;
    highRiskDrivers: number;
}

interface FraudEvent {
    id: string;
    riskScore: number;
    riskLevel: string;
    rules: any[];
    metadata: any;
    status: string;
    detectedAt: string;
    shiftId: string;
    driverId: string;
}

export const FraudDashboard = () => {
    const queryClient = useQueryClient();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const navigate = useNavigate();

    // Fetch Stats
    const { data: stats, isLoading: isLoadingStats } = useQuery({
        queryKey: ['fraud-stats'],
        queryFn: async () => {
            const res = await api.get('/api/fraud/dashboard-stats');
            return res.data as DashboardStats;
        },
        refetchInterval: 30000 // Refresh every 30s
    });

    // Fetch Recent Alerts
    const { data: recentAlerts, isLoading: isLoadingAlerts } = useQuery({
        queryKey: ['fraud-alerts'],
        queryFn: async () => {
            const res = await api.get('/api/fraud/alerts');
            return res.data as FraudEvent[];
        }
    });

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['fraud-stats'] }),
            queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] }),
            queryClient.invalidateQueries({ queryKey: ['fraud-heatmap'] })
        ]);
        setTimeout(() => setIsRefreshing(false), 500);
    };

    const isLoading = isLoadingStats || isLoadingAlerts;

    // Default values if loading or error
    const displayStats = stats || {
        riskScore: 0,
        activeAlerts: 0,
        processedShifts: 0,
        highRiskDrivers: 0
    };

    const filteredAlerts = recentAlerts?.filter(alert => {
        if (statusFilter === 'all') return true;
        return alert.status === statusFilter;
    });

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            em_analise: 'bg-blue-100 text-blue-800 border-blue-200',
            confirmado: 'bg-red-100 text-red-800 border-red-200',
            descartado: 'bg-green-100 text-green-800 border-green-200',
            bloqueado: 'bg-gray-100 text-gray-800 border-gray-200'
        };
        const labels: Record<string, string> = {
            pendente: 'Pendente',
            em_analise: 'Em Análise',
            confirmado: 'Confirmado',
            descartado: 'Descartado',
            bloqueado: 'Bloqueado'
        };
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${styles[status] || styles.pendente}`}>
                {labels[status] || status}
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
                <Button onClick={handleRefresh} disabled={isRefreshing || isLoading} className="gap-2">
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Atualizando...' : 'Atualizar Análise'}
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
                            <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Score Geral de Risco</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{displayStats.riskScore?.toFixed(1) || '0.0'}/10</h3>
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
            <div className="grid gap-6 md:grid-cols-1">
                <FraudHeatmap />
            </div>

            {/* Recent Alerts List */}
            <Card className="p-6">
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
                                            Score: {alert.riskScore} • {new Date(alert.detectedAt).toLocaleString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground font-mono mt-1">
                                            Turno: {alert.shiftId?.slice(0, 8)}... | Motorista: {alert.driverId}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => navigate(`/fraude/evento/${alert.id}`)}>
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
        </div>
    );
};
