import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Loader2, PlusCircle } from 'lucide-react';

interface ExternalEvidenceFormProps {
    eventId: string;
    onSuccess?: () => void;
}

export function ExternalEvidenceForm({ eventId, onSuccess }: ExternalEvidenceFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState('camera');
    const [rideCount, setRideCount] = useState('');
    const [evidenceDetails, setEvidenceDetails] = useState('');
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async () => {
            // Mock JSON structure for evidence
            const evidencePayload = JSON.stringify({
                notes: evidenceDetails,
                submittedAt: new Date().toISOString()
            });

            await api.post(`/fraud/event/${eventId}/evidence`, {
                evidenceType: type,
                externalRideCount: Number(rideCount),
                externalEvidence: evidencePayload
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fraud-event', eventId] });
            setIsOpen(false);
            if (onSuccess) onSuccess();
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate();
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Evidência</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Evidência Externa</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Tipo de Evidência</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="camera">Câmera de Segurança</SelectItem>
                                <SelectItem value="city_app">App da Cidade / Prefeitura</SelectItem>
                                <SelectItem value="denuncia">Denúncia de Passageiro</SelectItem>
                                <SelectItem value="fiscalizacao">Fiscalização Presencial</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Qtd. Corridas Ocultadas (Estimado)</Label>
                        <Input
                            type="number"
                            value={rideCount}
                            onChange={(e) => setRideCount(e.target.value)}
                            placeholder="Ex: 8"
                            min="0"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Detalhes / Links</Label>
                        <Textarea
                            value={evidenceDetails}
                            onChange={(e) => setEvidenceDetails(e.target.value)}
                            placeholder="Cole links, timestamps ou descreva brevemente a prova..."
                            rows={4}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={mutation.isPending}>
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Evidência
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
