import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { Download, Filter, ArrowLeft, ShieldCheck } from 'lucide-react';
import FraudNavigation from '../components/FraudNavigation';

interface TopDriver {
    driverId: string;
    totalEvents: string;
    avgScore: string;
    criticalCount: string;
}

const FraudReports = () => {
    const navigate = useNavigate();

    // Queries
    const { data: stats } = useQuery({
        queryKey: ['fraud-dashboard-stats'],
        queryFn: async () => (await api.get('/api/fraud/dashboard-stats')).data
    });

    const { data: heatmapData } = useQuery({
        queryKey: ['fraud-heatmap'],
        queryFn: async () => (await api.get('/api/fraud/heatmap')).data
    });

    const { data: topDrivers } = useQuery({
        queryKey: ['fraud-top-drivers'],
        queryFn: async () => (await api.get('/api/fraud/stats/top-drivers?limit=10')).data
    });

    const formattedHeatmapData = heatmapData?.map((item: any) => ({
        ...item,
        date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    })) || [];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Relatórios de Fraude e Risco</h1>
                    <p className="text-muted-foreground">Métricas consolidadas e análise de tendências.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Score Médio Global</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{stats?.riskScore || 0}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Alertas Ativos</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-orange-600">{stats?.activeAlerts || 0}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Turnos Processados</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{stats?.processedShifts || 0}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm">Motoristas de Risco (High/Crit)</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold text-red-600">{stats?.highRiskDrivers || 0}</div></CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Tendência de Risco (Últimos 30 Dias)</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formattedHeatmapData.slice(-30)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="avgScore" name="Score Médio" stroke="#8884d8" strokeWidth={2} />
                                <Line type="monotone" dataKey="maxScore" name="Score Máximo" stroke="#ff8042" strokeDasharray="3 3" />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Volume de Alertas Diários</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={formattedHeatmapData.slice(-30)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" name="Alertas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Top 10 Motoristas de Maior Risco</CardTitle>
                    <CardDescription>Baseado na média de score e número de incidentes.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr>
                                    <th className="p-3">Motorista</th>
                                    <th className="p-3 text-center">Eventos Totais</th>
                                    <th className="p-3 text-center">Score Médio</th>
                                    <th className="p-3 text-center">Eventos Críticos</th>
                                    <th className="p-3 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topDrivers?.map((driver: TopDriver) => (
                                    <tr key={driver.driverId} className="border-t hover:bg-muted/50">
                                        <td className="p-3 font-medium">{driver.driverId}</td>
                                        <td className="p-3 text-center">{driver.totalEvents}</td>
                                        <td className="p-3 text-center">
                                            <span className={`font-bold ${Number(driver.avgScore) > 70 ? 'text-red-600' : 'text-orange-500'}`}>
                                                {Number(driver.avgScore).toFixed(1)}
                                            </span>
                                        </td>
                                        <td className="p-3 text-center text-red-600 font-bold">{driver.criticalCount}</td>
                                        <td className="p-3 text-right">
                                            <Button variant="link" size="sm" asChild>
                                                <a href={`/fraude/motorista/${driver.driverId}`}>Ver Perfil</a>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default FraudReports;
