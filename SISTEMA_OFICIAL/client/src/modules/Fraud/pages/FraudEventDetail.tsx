```
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, Shield, AlertOctagon, Printer } from 'lucide-react';
import { FraudAuditReport } from '../components/FraudAuditReport';
import { BehaviorAnalysisWidget } from '../components/BehaviorAnalysisWidget';
import { ExternalEvidenceForm } from '../components/ExternalEvidenceForm';

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
    // New Fields for Breakdown
    ridesAppCount?: number;
    ridesParticularCount?: number;
    revenueApp?: number;
    revenueParticular?: number;
    ridesUnknownCount?: number;
    revenueUnknown?: number;
    // Identity Details
    driverName?: string;
    vehiclePlate?: string;
    vehicleModel?: string;
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
            const res = await api.get(`/ fraud / event / ${ id } `);
            return res.data as EventDetailResponse;
        },
        enabled: !!id
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ status, comment }: { status: string, comment?: string }) => {
            const res = await api.post(`/ fraud / event / ${ id }/status`, { status, comment });
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

return (
    <div className="flex flex-col h-full bg-gray-50 overflow-auto print:bg-white print:overflow-visible">
        {/* Header / Toolbar - Hidden in Print */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between print:hidden sticky top-0 z-10 shadow-sm">
            <div className="flex items-center gap-4">
                {!isModal && (
                    <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
                    </Button>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShieldAlert className="h-6 w-6 text-red-600" />
                        Auditoria de Evento #{event.id.slice(0, 8)}
                    </h1>
                    <p className="text-sm text-gray-500">
                        Motorista: <span className="font-medium text-gray-700">{shift.driverName || shift.driverId}</span> •
                        Veículo: <span className="font-medium text-gray-700">{shift.vehiclePlate || shift.vehicleId} {shift.vehicleModel ? `(${shift.vehicleModel})` : ''}</span>
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 justify-end">
                <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 hidden sm:flex">
                    <Printer className="h-4 w-4" /> <span className="hidden lg:inline">Imprimir Relatório</span><span className="lg:hidden">Imprimir</span>
                </Button>

                {/* Status Actions */}
                {(event.status === 'pendente' || event.status === 'em_analise') && (
                    <>
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusChange('confirmado')}
                            disabled={updateStatusMutation.isPending}
                        >
                            <Ban className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Confirmar Fraude</span><span className="sm:hidden">Confirmar</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-green-600 text-green-700 hover:bg-green-50"
                            onClick={() => handleStatusChange('descartado')}
                            disabled={updateStatusMutation.isPending}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Descartar (Falso Positivo)</span><span className="sm:hidden">Descartar</span>
                        </Button>
                    </>
                )}

                {isModal && onClose && (
                    <Button variant="secondary" size="sm" onClick={onClose} className="ml-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold border-l-2 border-gray-300 pl-4">
                        <XCircle className="h-4 w-4 mr-2" /> Fechar
                    </Button>
                )}

                <ExternalEvidenceForm eventId={event.id} />
            </div>
        </div>

        {/* Main Content - The Audit Report */}
        <div className="flex-1 p-6 print:p-0">
            <div className="max-w-5xl mx-auto space-y-6 print:max-w-full print:space-y-0">

                {/* Additional Context Alert if Pending - On Screen Only */}
                {event.status === 'pendente' && (
                    <div className="space-y-4 print:hidden mb-4">
                        {/* EVIDENCE REQUIRED ALERT */}
                        {event.rules?.some((r: any) => r.needsEvidence) && (
                            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded shadow-sm">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <ShieldAlert className="h-5 w-5 text-orange-500" aria-hidden="true" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-bold text-orange-800">Verificação de Evidência Necessária</h3>
                                        <p className="text-sm text-orange-700 mt-1">
                                            Pelo menos uma regra disparada ({event.rules.find((r: any) => r.needsEvidence)?.label}) requer validação física (ex: foto do painel, comprovante).
                                            Use o botão "Add Evidência" acima para anexar provas.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                        Este evento está pendente de análise. Revise o relatório de auditoria abaixo antes de tomar uma decisão.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ANALYSIS WIDGETS */}
                <BehaviorAnalysisWidget driverId={shift.driverId} />

                {/* THE REPORT COMPONENT */}
                <FraudAuditReport event={event} shift={shift} />

                {/* Action History / Comments - Screen Only */}
                <div className="mt-8 print:hidden">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Histórico de Ações</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {event.updatedAt && event.updatedAt !== event.detectedAt ? (() => {
                                    const dateObj = new Date(event.updatedAt);
                                    const isValidDate = !isNaN(dateObj.getTime());
                                    return (
                                        <div className="flex gap-3 text-sm">
                                            <Clock className="h-5 w-5 text-emerald-400" />
                                            <div>
                                                <p className="font-medium text-white">Status atualizado para <span className="uppercase text-emerald-400">{event.status}</span></p>
                                                <p className="text-gray-300">{isValidDate ? dateObj.toLocaleString('pt-BR') : 'Data não disponível'}</p>
                                                {event.comment && <p className="mt-1 bg-slate-700 p-2 rounded text-gray-200">"{event.comment}"</p>}
                                            </div>
                                        </div>
                                    );
                                })() : (
                                    <p className="text-sm text-gray-400 italic">Nenhuma ação registrada ainda.</p>
                                )}

                                {event.status === 'pendente' && (
                                    <div className="mt-4 pt-4 border-t">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Adicionar Observação (Opcional)</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => window.print()}
                                                className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                                                title="Salvar como PDF ou Imprimir"
                                            >
                                                <Printer size={18} />
                                                <span>Imprimir / PDF</span>
                                            </button>
                                            <button
                                                onClick={() => navigate('/fraud')}
                                                className="px-4 py-2 text-gray-600 hover:text-gray-900"
                                            >
                                                Voltar
                                            </button>
                                        </div>
                                        <textarea
                                            className="w-full border rounded p-2 text-sm"
                                            rows={3}
                                            placeholder="Justificativa para a decisão..."
                                            value={actionComment}
                                            onChange={(e) => setActionComment(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    </div>
);
};

export default FraudEventDetail;
