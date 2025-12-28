import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, Ban, ArrowLeft, Download, Clock, ShieldAlert } from 'lucide-react';

interface FraudEvent {
    id: string;
    status: 'pendente' | 'em_analise' | 'confirmado' | 'descartado' | 'bloqueado';
    riskScore: number;
    riskLevel: string;
    rules: any[];
    metadata: any;
    comment: string | null;
    detectedAt: string;
    updatedAt: string;
    details: any;
}

interface ShiftData {
    id: string;
    driverId: string;
    vehicleId: string;
    inicio: string;
    fim: string | null;
    kmInicial: number;
    kmFinal: number;
    totalBruto: number;
    totalCorridas: number;
    duracaoMin: number;
}

interface EventDetailResponse {
    event: FraudEvent;
    shift: ShiftData;
}

interface FraudEventDetailProps {
    eventId?: string;
    onClose?: () => void;
}

const FraudEventDetail = ({ eventId: propEventId, onClose }: FraudEventDetailProps = {}) => {
    const params = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [actionComment, setActionComment] = useState('');

    // Prioritize prop ID (modal mode) over route param
    const id = propEventId || params.id;
    const isModal = !!propEventId;

    const { data, isLoading, error } = useQuery({
        queryKey: ['fraud-event', id],
        queryFn: async () => {
            const res = await api.get(`/fraud/event/${id}`);
            return res.data as EventDetailResponse;
        },
        enabled: !!id
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ status, comment }: { status: string, comment?: string }) => {
            const res = await api.post(`/fraud/event/${id}/status`, { status, comment });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fraud-event', id] });
            queryClient.invalidateQueries({ queryKey: ['fraud-alerts'] });
            queryClient.invalidateQueries({ queryKey: ['fraud-stats'] });
            if (isModal && onClose) onClose();
        }
    });

    const handleStatusChange = (newStatus: string) => {
        if (!window.confirm(`Tem certeza que deseja alterar o status para ${newStatus.toUpperCase()}?`)) return;
        updateStatusMutation.mutate({ status: newStatus, comment: actionComment || undefined });
    };

    const handleDownloadPdf = async () => {
        try {
            const response = await api.get(`/fraud/event/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `fraud-event-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Failed to download PDF', err);
            alert('Erro ao baixar PDF');
        }
    };

    if (isLoading) return <div className="p-8 text-center">Carregando detalhes do evento...</div>;
    if (error || !data) return <div className="p-8 text-center text-red-500">Erro ao carregar evento ou evento não encontrado.</div>;

    const { event, shift } = data;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmado': return 'text-red-600 bg-red-100 border-red-200';
            case 'descartado': return 'text-green-600 bg-green-100 border-green-200';
            case 'bloqueado': return 'text-gray-600 bg-gray-100 border-gray-200';
            case 'em_analise': return 'text-orange-600 bg-orange-100 border-orange-200';
            default: return 'text-blue-600 bg-blue-100 border-blue-200';
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'critical': return 'text-red-700 font-bold';
            case 'high': return 'text-orange-600 font-semibold';
            case 'medium': return 'text-yellow-600';
            default: return 'text-blue-600';
        }
    };

    return (
        <div className={`space-y-6 animate-in fade-in duration-500 ${isModal ? '' : 'p-4 max-w-7xl mx-auto'}`}>
            {/* Header / Actions - Hide back button in modal */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    {!isModal && (
                        <Button variant="outline" onClick={() => navigate('/fraude')}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                        </Button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold">Detalhe do Evento</h1>
                        <p className="text-muted-foreground flex items-center gap-2 text-sm">
                            ID: <span className="font-mono">{event.id}</span>
                            <span className="text-gray-300">|</span>
                            {new Date(event.detectedAt).toLocaleString()}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleDownloadPdf}>
                        <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                </div>
            </div>

            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-1">Status Atual</div>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                            {event.status.toUpperCase().replace('_', ' ')}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-1">Risco Calculado</div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{event.riskScore}</span>
                            <span className={`text-sm capitalize ${getRiskColor(event.riskLevel)}`}>({event.riskLevel})</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-1">Motorista</div>
                        <div className="font-mono text-sm truncate" title={shift.driverId}>{shift.driverId}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground mb-1">Veículo</div>
                        <div className="font-mono text-sm truncate">{shift.vehicleId}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Rules Triggered */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-500" />
                        <CardTitle>Regras Disparadas</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Regras estão em event.rules ou event.details.reasons (legado) */}
                        {((event.rules as any[]) || event.details?.reasons || []).length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">Nenhuma regra específica registrada.</p>
                        ) : (
                            ((event.rules as any[]) || event.details?.reasons || []).map((rule: any, idx: number) => (
                                <div key={idx} className="flex items-start gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900 border-l-4 border-l-red-400">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                            {rule.label || rule.code}
                                            <span className="text-xs px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono">
                                                {rule.code}
                                            </span>
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{rule.description || ''}</p>
                                        <div className="flex gap-2 mt-2 text-xs">
                                            <span className="px-2 py-1 bg-red-100 text-red-700 rounded capitalize">Severidade: {rule.severity || 'info'}</span>
                                            {rule.data && (
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    {Object.entries(rule.data).map(([key, value]) => (
                                                        <span key={key} className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-mono text-xs border border-blue-100">
                                                            <span className="font-semibold text-blue-900">{key}:</span> {typeof value === 'number' ? value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : String(value)}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Shift Data */}
                <Card>
                    <CardHeader>
                        <CardTitle>Dados do Turno</CardTitle>
                        <CardDescription>ID: {shift.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Início</span>
                            <span>{new Date(shift.inicio).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Fim</span>
                            <span>{shift.fim ? new Date(shift.fim).toLocaleString() : 'Em andamento'}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">KM Total</span>
                            <span>{(shift.kmFinal - shift.kmInicial).toFixed(1)} km</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Total Bruto</span>
                            <span className="font-medium">R$ {shift.totalBruto.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Total Corridas</span>
                            <span>{shift.totalCorridas}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b">
                            <span className="text-muted-foreground">Duração</span>
                            <span>{(shift.duracaoMin / 60).toFixed(1)}h</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions Panel */}
                <Card className="border-2 border-blue-100 dark:border-blue-900">
                    <CardHeader>
                        <CardTitle>Decisão da Análise</CardTitle>
                        <CardDescription>Registre o resultado da revisão humana.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-muted rounded-md mb-4">
                            <p className="text-sm font-medium mb-1">Comentário Atual:</p>
                            <p className="text-sm italic text-muted-foreground">
                                {event.comment || "Nenhum comentário registrado."}
                            </p>
                        </div>

                        <textarea
                            className="w-full p-2 border rounded-md text-sm bg-background"
                            placeholder="Adicione um comentário para justificar a mudança de status..."
                            rows={3}
                            value={actionComment}
                            onChange={(e) => setActionComment(e.target.value)}
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <Button
                                variant="outline"
                                className="w-full border-orange-200 hover:bg-orange-50 text-orange-700"
                                onClick={() => handleStatusChange('em_analise')}
                                disabled={event.status === 'em_analise'}
                            >
                                <Clock className="w-4 h-4 mr-2" /> Em Análise
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full border-green-200 hover:bg-green-50 text-green-700"
                                onClick={() => handleStatusChange('descartado')}
                                disabled={event.status === 'descartado'}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" /> Descartar (Falso Positivo)
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full border-red-200 hover:bg-red-50 text-red-700"
                                onClick={() => handleStatusChange('confirmado')}
                                disabled={event.status === 'confirmado'}
                            >
                                <AlertTriangle className="w-4 h-4 mr-2" /> Confirmar Fraude
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full border-gray-200 hover:bg-gray-50 text-gray-700"
                                onClick={() => handleStatusChange('bloqueado')}
                                disabled={event.status === 'bloqueado'}
                            >
                                <Ban className="w-4 h-4 mr-2" /> Bloquear Motorista
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FraudEventDetail;
