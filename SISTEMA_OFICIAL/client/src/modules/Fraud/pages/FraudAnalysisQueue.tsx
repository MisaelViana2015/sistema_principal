import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Clock, AlertTriangle, ArrowRight, ShieldAlert, ArrowLeft, ShieldCheck } from 'lucide-react';
import FraudNavigation from '../components/FraudNavigation';

interface FraudEvent {
    id: string;
    status: string;
    riskScore: number;
    riskLevel: string;
    detectedAt: string;
    shiftId: string;
    driverId: string;
    rules: { label: string }[];
}

const FraudAnalysisQueue = () => {
    const navigate = useNavigate();

    // Fetch pending and in_analysis events
    const { data: events, isLoading } = useQuery({
        queryKey: ['fraud-queue'],
        queryFn: async () => {
            // Fetch both pending and in_analysis events
            const res = await api.get('/api/fraud/events', { params: { status: 'pendente,em_analise', limit: 50 } });
            // Handle new API response structure { data: [...], total: ... }
            return (res.data.data || res.data) as FraudEvent[];
        },
        refetchInterval: 30000
    });

    const getTimeInQueue = (dateStr: string) => {
        const detected = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - detected.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h`;
        if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m`;
        return `${diffMins}m`;
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-blue-600 bg-blue-50 border-blue-200';
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Fila de Análise</h1>
                    <p className="text-muted-foreground">Casos pendentes aguardando revisão humana priorizada.</p>
                </div>
            </div>

            {/* Navigation Tabs */}
            <FraudNavigation />

            {isLoading ? (
                <div className="text-center p-12 text-muted-foreground">Carregando fila...</div>
            ) : events?.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">🎉</span>
                        </div>
                        <h3 className="text-lg font-semibold">Tudo Limpo!</h3>
                        <p className="text-muted-foreground">Não há eventos pendentes para análise no momento.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {events?.map((event) => (
                        <Card key={event.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-transparent hover:border-l-blue-500">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <Badge variant="outline" className={`${getRiskColor(event.riskLevel)} px-2 py-0.5`}>
                                        Score: {event.riskScore.toFixed(1)}
                                    </Badge>
                                    <div className="text-xs font-mono text-muted-foreground flex items-center gap-1" title="Tempo na fila">
                                        <Clock className="w-3 h-3" />
                                        {getTimeInQueue(event.detectedAt)}
                                    </div>
                                </div>
                                <CardTitle className="text-base mt-2 flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-gray-500" />
                                    {event.rules && event.rules.length > 0 ? event.rules[0].label : 'Anomalia'}
                                </CardTitle>
                                <CardDescription className="text-xs font-mono">
                                    Motorista: {event.driverId}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pb-3 text-sm text-gray-600 dark:text-gray-300">
                                <p>Turno: {event.shiftId.substring(0, 8)}...</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {new Date(event.detectedAt).toLocaleString()}
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full gap-2 group" onClick={() => navigate(`/fraude/evento/${event.id}`)}>
                                    Revisar Agora
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FraudAnalysisQueue;
