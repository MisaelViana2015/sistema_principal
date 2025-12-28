import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, XCircle, Ban, ArrowLeft, Download, Clock, ShieldAlert, Printer } from 'lucide-react';
import { FraudAuditReport } from '../components/FraudAuditReport';

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

    const handlePrint = () => {
        window.print();
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
                {/* Status Actions */}
                {event.status === 'pendente' && (
                    <>
                        <Button
                            variant="destructive"
                            onClick={() => handleStatusChange('confirmado')}
                            disabled={updateStatusMutation.isPending}
                        >
                            <Ban className="h-4 w-4 mr-2" /> Confirmar Fraude
                        </Button>
                        <Button
                            variant="outline"
                            className="border-green-600 text-green-700 hover:bg-green-50"
                            onClick={() => handleStatusChange('descartado')}
                            disabled={updateStatusMutation.isPending}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" /> Descartar (Falso Positivo)
                        </Button>
                    </>
                )}
            </CardContent>
        </Card>
            </div >
        </div >
    );
};

export default FraudEventDetail;
