import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Filter, Search } from 'lucide-react';

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

const FraudEventsList = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: events, isLoading } = useQuery({
        queryKey: ['fraud-events-list', page, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '20');
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const res = await api.get('/api/fraud/events', { params });
            // API now returns { data, total, page, limit }
            return res.data;
        },
        placeholderData: (previousData) => previousData
    });

    const eventsList = events?.data || [];
    const totalCount = events?.total || 0;

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pendente: 'bg-yellow-100 text-yellow-800',
            em_analise: 'bg-blue-100 text-blue-800',
            confirmado: 'bg-red-100 text-red-800',
            descartado: 'bg-green-100 text-green-800',
            bloqueado: 'bg-gray-100 text-gray-800'
        };
        return colors[status] || 'bg-gray-100';
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-4 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Histórico de Eventos</h1>
                    <p className="text-muted-foreground">Todos os alertas de fraude registrados no sistema.</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-muted-foreground" />
                            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Filtrar por Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Status</SelectItem>
                                    <SelectItem value="pendente">Pendente</SelectItem>
                                    <SelectItem value="em_analise">Em Análise</SelectItem>
                                    <SelectItem value="confirmado">Confirmado</SelectItem>
                                    <SelectItem value="descartado">Descartado</SelectItem>
                                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || isLoading}
                            >
                                <ChevronLeft className="w-4 h-4" /> Anterior
                            </Button>
                            <span className="text-sm min-w-[3rem] text-center">Pág {page}</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage(p => p + 1)}
                                disabled={isLoading || (eventsList.length < 20)}
                            >
                                Próxima <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium">
                                <tr>
                                    <th className="p-3">Data</th>
                                    <th className="p-3">Score</th>
                                    <th className="p-3">Status</th>
                                    <th className="p-3">Motorista</th>
                                    <th className="p-3">Motivo Principal</th>
                                    <th className="p-3 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">Carregando dados...</td>
                                    </tr>
                                ) : eventsList.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhum evento encontrado.</td>
                                    </tr>
                                ) : (
                                    eventsList.map((event: FraudEvent) => (
                                        <tr key={event.id} className="border-t hover:bg-muted/50 transition-colors">
                                            <td className="p-3 whitespace-nowrap">
                                                {new Date(event.detectedAt).toLocaleString()}
                                            </td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${event.riskLevel === 'critical' ? 'bg-red-600' :
                                                        event.riskLevel === 'high' ? 'bg-orange-500' :
                                                            event.riskLevel === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                                                        }`} />
                                                    <span className="font-mono font-medium">{event.riskScore.toFixed(1)}</span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(event.status)}`}>
                                                    {event.status.toUpperCase().replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="p-3 font-mono text-xs">
                                                <button
                                                    onClick={() => navigate(`/fraude/motorista/${event.driverId}`)}
                                                    className="hover:underline text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    {event.driverId}
                                                </button>
                                            </td>
                                            <td className="p-3 truncate max-w-[200px]">
                                                {event.rules && event.rules.length > 0 ? event.rules[0].label : 'Anomalia Detectada'}
                                            </td>
                                            <td className="p-3 text-right">
                                                <Button size="sm" variant="ghost" onClick={() => navigate(`/fraude/evento/${event.id}`)}>
                                                    Detalhes
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default FraudEventsList;
