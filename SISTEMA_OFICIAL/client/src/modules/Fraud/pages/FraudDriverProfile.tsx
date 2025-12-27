import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FraudEvent {
    id: string;
    detectedAt: string;
    riskScore: number;
    riskLevel: string;
    status: string;
    rules: { label: string }[];
}

const FraudDriverProfile = () => {
    const { driverId } = useParams();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);

    // Fetch driver's events
    const { data: eventsData, isLoading } = useQuery({
        queryKey: ['fraud-driver-events', driverId, page],
        queryFn: async () => {
            const res = await api.get('/api/fraud/events', {
                params: {
                    driverId,
                    limit: 50, // Get more for chart
                    page
                }
            });
            return res.data; // { data, total }
        },
        enabled: !!driverId
    });

    const events: FraudEvent[] = eventsData?.data || [];

    // Calculate simple stats from the fetched events (client-side for now)
    const totalEvents = eventsData?.total || 0;
    const highRiskCount = events.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length;
    const avgScore = events.length > 0
        ? (events.reduce((acc, e) => acc + e.riskScore, 0) / events.length).toFixed(1)
        : '0.0';

    // Prepare chart data (reverse to show chronological)
    const chartData = [...events].reverse().map(e => ({
        date: new Date(e.detectedAt).toLocaleDateString(),
        score: e.riskScore
    }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Perfil de Risco: {driverId || 'Desconhecido'}</h1>
                    <p className="text-muted-foreground">Análise detalhada do comportamento do motorista.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalEvents}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Alertas Críticos/Altos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
                            {highRiskCount}
                            {highRiskCount > 0 && <AlertTriangle className="w-5 h-5" />}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Score Médio (Recente)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgScore}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tendência de Risco</CardTitle>
                    <CardDescription>Evolução do Score de Fraude nos últimos eventos</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Line type="monotone" dataKey="score" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Histórico de Eventos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr>
                                    <th className="p-3">Data</th>
                                    <th className="p-3">Score</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Motivo</th>
                                    <th className="p-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id} className="border-t hover:bg-muted/50">
                                        <td className="p-3">{new Date(event.detectedAt).toLocaleString()}</td>
                                        <td className="p-3 font-bold">{event.riskScore.toFixed(1)}</td>
                                        <td className="p-3">
                                            <Badge variant="outline">{event.status}</Badge>
                                        </td>
                                        <td className="p-3">{event.rules?.[0]?.label || 'N/A'}</td>
                                        <td className="p-3 text-right">
                                            <Button size="sm" variant="ghost" onClick={() => navigate(`/fraude/evento/${event.id}`)}>
                                                Ver
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

export default FraudDriverProfile;
