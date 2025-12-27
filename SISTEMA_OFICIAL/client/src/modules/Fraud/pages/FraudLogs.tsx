import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollText, CheckCircle, XCircle, Clock, AlertTriangle, Eye } from 'lucide-react';

interface FraudEvent {
    id: string;
    status: string;
    detectedAt: string;
    driverId: string;
    riskScore: number;
    metadata?: {
        lastDecisionAt?: string;
        comment?: string;
    };
}

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'confirmado': return <CheckCircle className="w-4 h-4 text-red-600" />;
        case 'descartado': return <XCircle className="w-4 h-4 text-green-600" />;
        case 'em_analise': return <Eye className="w-4 h-4 text-blue-600" />;
        case 'bloqueado': return <AlertTriangle className="w-4 h-4 text-gray-600" />;
        default: return <Clock className="w-4 h-4 text-yellow-600" />;
    }
};

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        pendente: 'Pendente',
        em_analise: 'Em Análise',
        confirmado: 'Confirmado',
        descartado: 'Descartado',
        bloqueado: 'Bloqueado',
    };
    return labels[status] || status;
};

const getActionDescription = (status: string) => {
    switch (status) {
        case 'confirmado': return 'Admin confirmou fraude';
        case 'descartado': return 'Admin descartou alerta';
        case 'em_analise': return 'Iniciou análise';
        case 'bloqueado': return 'Motorista bloqueado';
        default: return 'Alerta criado pelo sistema';
    }
};

const FraudLogs = () => {
    const { data: eventsData, isLoading } = useQuery({
        queryKey: ['fraud-logs'],
        queryFn: async () => {
            const res = await api.get('/api/fraud/events', { params: { limit: 100 } });
            return res.data;
        }
    });

    const events: FraudEvent[] = eventsData?.data || [];

    // Build log entries from events with decisions
    const logEntries = events
        .filter(e => e.status !== 'pendente' || e.metadata?.lastDecisionAt)
        .map(e => ({
            id: e.id,
            eventId: e.id.slice(0, 8),
            driverId: e.driverId,
            action: getActionDescription(e.status),
            status: e.status,
            timestamp: e.metadata?.lastDecisionAt || e.detectedAt,
            comment: e.metadata?.comment,
            score: e.riskScore,
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-4 max-w-7xl mx-auto">
            <div className="flex items-center gap-3">
                <ScrollText className="w-8 h-8 text-muted-foreground" />
                <div>
                    <h1 className="text-2xl font-bold">Logs de Auditoria</h1>
                    <p className="text-muted-foreground">Histórico de ações e decisões sobre alertas de fraude</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ações Recentes</CardTitle>
                    <CardDescription>Decisões tomadas sobre alertas de fraude</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8 text-muted-foreground">Carregando logs...</div>
                    ) : logEntries.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Nenhuma ação registrada ainda.
                            <br />
                            <span className="text-sm">Ações aparecerão aqui quando alertas forem revisados.</span>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {logEntries.map((log, idx) => (
                                <div key={`${log.id}-${idx}`} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="p-2 bg-muted rounded-full">
                                        {getStatusIcon(log.status)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium">{log.action}</span>
                                            <Badge variant="outline">{getStatusLabel(log.status)}</Badge>
                                            <span className="text-sm text-muted-foreground">• Score: {log.score.toFixed(1)}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Evento: <code className="bg-muted px-1 rounded">{log.eventId}</code>
                                            {' • '}Motorista: <code className="bg-muted px-1 rounded">{log.driverId}</code>
                                        </p>
                                        {log.comment && (
                                            <p className="text-sm mt-2 p-2 bg-muted rounded italic">
                                                "{log.comment}"
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                                        <br />
                                        <span className="text-xs">{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default FraudLogs;
