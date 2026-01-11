import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Car, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface FraudEvent {
    id: string;
    detectedAt: string;
    riskScore: number;
    riskLevel: string;
    status: string;
    rules: { label: string }[];
    metadata?: { vehicleId?: string };
    driverId: string;
}

const FraudVehicleProfile = () => {
    const { vehicleId } = useParams();
    const navigate = useNavigate();

    // Fetch all events and filter by vehicleId in metadata (since backend doesn't support vehicleId filter yet)
    const { data: eventsData, isLoading } = useQuery({
        queryKey: ['fraud-vehicle-events', vehicleId],
        queryFn: async () => {
            const res = await api.get('/api/fraud/events', { params: { limit: 100 } });
            return res.data;
        },
        enabled: !!vehicleId
    });

    // Client-side filter by vehicleId in metadata
    const events: FraudEvent[] = (eventsData?.data || []).filter(
        (e: FraudEvent) => e.metadata?.vehicleId === vehicleId
    );

    const totalEvents = events.length;
    const highRiskCount = events.filter(e => e.riskLevel === 'high' || e.riskLevel === 'critical').length;
    const avgScore = events.length > 0
        ? (events.reduce((acc, e) => acc + e.riskScore, 0) / events.length).toFixed(1)
        : '0.0';

    const chartData = [...events].reverse().map(e => ({
        date: new Date(e.detectedAt).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
        score: e.riskScore
    }));

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ChevronLeft className="w-6 h-6" />
                </Button>
                <div className="flex items-center gap-3">
                    <Car className="w-8 h-8 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold">Perfil de Risco: Veículo {vehicleId || 'N/A'}</h1>
                        <p className="text-muted-foreground">Análise de alertas associados a este veículo.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total de Alertas</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{totalEvents}</div></CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Alertas Críticos/Altos</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 flex items-center gap-2">
                            {highRiskCount}
                            {highRiskCount > 0 && <AlertTriangle className="w-5 h-5" />}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Score Médio</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{avgScore}</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tendência de Risco do Veículo</CardTitle>
                    <CardDescription>Evolução do Score nos alertas associados</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    {events.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                            Nenhum alerta encontrado para este veículo.
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Histórico de Eventos</CardTitle></CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr>
                                    <th className="p-3">Data</th>
                                    <th className="p-3">Score</th>
                                    <th className="p-3">Motorista</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {events.map((event) => (
                                    <tr key={event.id} className="border-t hover:bg-muted/50">
                                        <td className="p-3">{new Date(event.detectedAt).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}</td>
                                        <td className="p-3 font-bold">{event.riskScore.toFixed(1)}</td>
                                        <td className="p-3">
                                            <button
                                                onClick={() => navigate(`/fraude/motorista/${event.driverId}`)}
                                                className="text-primary hover:underline"
                                            >
                                                {event.driverId}
                                            </button>
                                        </td>
                                        <td className="p-3"><Badge variant="outline">{event.status}</Badge></td>
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

export default FraudVehicleProfile;
