import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { shiftsService } from "./shifts.service";
import { Loader2, AlertTriangle, Power } from "lucide-react";
import { RidesList } from "../rides/RidesList";
import { CostsList } from "../financial/CostsList";
import { api } from "../../lib/api";

interface EditShiftModalProps {
    shiftId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function EditShiftModal({ shiftId, open, onOpenChange, onSuccess }: EditShiftModalProps) {
    const [loading, setLoading] = useState(false);
    const [shift, setShift] = useState<any>(null);

    const [formData, setFormData] = useState({
        kmInicial: "",
        kmFinal: "",
        inicio: "",
        fim: ""
    });
    const [saving, setSaving] = useState(false);

    // Estado para encerramento manual
    const [showCloseForm, setShowCloseForm] = useState(false);
    const [closeData, setCloseData] = useState({ fim: "", kmFinal: "" });
    const [closing, setClosing] = useState(false);
    const [closeWarning, setCloseWarning] = useState<string | null>(null);

    useEffect(() => {
        if (open && shiftId) {
            loadShift();
            setShowCloseForm(false);
            setCloseWarning(null);
        }
    }, [open, shiftId]);

    const loadShift = async () => {
        setLoading(true);
        try {
            const data = await shiftsService.getById(shiftId!);
            setShift(data);
            setFormData({
                kmInicial: String(data.kmInicial),
                kmFinal: data.kmFinal ? String(data.kmFinal) : "",
                inicio: data.inicio ? new Date(data.inicio).toISOString().slice(0, 16) : "",
                fim: data.fim ? new Date(data.fim).toISOString().slice(0, 16) : ""
            });
            // Pré-preencher formulário de encerramento
            setCloseData({
                fim: data.fim ? new Date(data.fim).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                kmFinal: data.kmFinal ? String(data.kmFinal) : ""
            });
        } catch (error) {
            console.error("Error loading shift", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!shiftId) return;
        setSaving(true);
        try {
            const payload = {
                kmInicial: Number(formData.kmInicial),
                kmFinal: formData.kmFinal ? Number(formData.kmFinal) : undefined,
                inicio: formData.inicio ? new Date(formData.inicio) : undefined,
                fim: formData.fim ? new Date(formData.fim) : undefined
            };

            console.log('[EditShiftModal] Sending update:', payload);
            const result = await shiftsService.update(shiftId, payload);
            console.log('[EditShiftModal] Update result:', result);

            if (onSuccess) onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Error updating shift", error);
        } finally {
            setSaving(false);
        }
    };

    // Encerrar turno manualmente (NUNCA mexe nas corridas!)
    const handleAdminClose = async () => {
        if (!shiftId || !closeData.fim || !closeData.kmFinal) {
            alert("Preencha a data/hora de fim e o KM Final");
            return;
        }

        setClosing(true);
        setCloseWarning(null);

        try {
            const fimDate = new Date(closeData.fim);
            const result = await shiftsService.adminClose(shiftId, fimDate, Number(closeData.kmFinal));

            // Verificar se há aviso
            if ((result as any)._warning) {
                setCloseWarning((result as any)._warning);
            }

            alert("Turno encerrado com sucesso!");
            if (onSuccess) onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error closing shift", error);
            alert(error.response?.data?.message || "Erro ao encerrar turno");
        } finally {
            setClosing(false);
        }
    };

    const isShiftOpen = shift?.status === 'em_andamento';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="fixed left-0 top-0 translate-x-0 translate-y-0 w-screen h-[100dvh] max-w-none max-h-none rounded-none sm:fixed sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:max-w-2xl sm:w-[95vw] sm:max-h-[85vh] sm:rounded-xl bg-gray-900 border-gray-800 text-white flex flex-col p-4 overflow-hidden z-[9999]">
                <DialogHeader className="mb-2">
                    <DialogTitle className="flex items-center gap-2">
                        Editar Turno
                        {isShiftOpen && (
                            <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded">EM ANDAMENTO</span>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="dados" className="flex-1 flex flex-col">
                    <TabsList className="bg-gray-800 text-gray-400">
                        <TabsTrigger value="dados">Dados do Turno</TabsTrigger>
                        <TabsTrigger value="corridas">Corridas (Rides)</TabsTrigger>
                        <TabsTrigger value="custos">Custos & Despesas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dados" className="flex-1 p-3 sm:p-4 border border-gray-800 rounded-md mt-2 overflow-y-auto">
                        <div className="space-y-4">
                            <p className="text-gray-400 mb-4">Edite os dados principais do turno.</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>KM Inicial</Label>
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        className="bg-gray-800 border-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        value={formData.kmInicial}
                                        onChange={e => setFormData({ ...formData, kmInicial: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>KM Final</Label>
                                    <Input
                                        type="number"
                                        inputMode="numeric"
                                        className="bg-gray-800 border-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        value={formData.kmFinal}
                                        onChange={e => setFormData({ ...formData, kmFinal: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Início</Label>
                                    <Input
                                        type="datetime-local"
                                        className="bg-gray-800 border-gray-700"
                                        value={formData.inicio}
                                        onChange={e => setFormData({ ...formData, inicio: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Fim</Label>
                                    <Input
                                        type="datetime-local"
                                        className="bg-gray-800 border-gray-700"
                                        value={formData.fim}
                                        onChange={e => setFormData({ ...formData, fim: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                    {saving ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                    Salvar Alterações
                                </Button>
                            </div>

                            {/* Seção de Encerramento Manual - Só aparece se turno está em andamento */}
                            {isShiftOpen && (
                                <div className="mt-6 pt-6 border-t border-gray-700">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Power className="w-5 h-5 text-red-400" />
                                        <h3 className="text-lg font-semibold text-red-400">Manutenção: Encerrar Turno</h3>
                                    </div>

                                    {!showCloseForm ? (
                                        <Button
                                            onClick={() => setShowCloseForm(true)}
                                            className="w-full bg-red-600 hover:bg-red-700 text-white"
                                        >
                                            <Power className="w-4 h-4 mr-2" />
                                            Encerrar Turno Manualmente
                                        </Button>
                                    ) : (
                                        <div className="space-y-4 p-4 bg-red-950/30 border border-red-900/50 rounded-lg">
                                            <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                                                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                                                <p className="text-sm text-yellow-200">
                                                    <strong>Atenção:</strong> Esta ação encerra o turno como se o motorista tivesse finalizado normalmente.
                                                    Os horários das corridas <strong>NÃO serão alterados</strong>.
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label className="text-red-300">Data/Hora de Fim *</Label>
                                                    <Input
                                                        type="datetime-local"
                                                        className="bg-gray-800 border-red-700"
                                                        value={closeData.fim}
                                                        onChange={e => setCloseData({ ...closeData, fim: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="text-red-300">KM Final *</Label>
                                                    <Input
                                                        type="number"
                                                        className="bg-gray-800 border-red-700"
                                                        placeholder="Ex: 32310"
                                                        value={closeData.kmFinal}
                                                        onChange={e => setCloseData({ ...closeData, kmFinal: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            {closeWarning && (
                                                <div className="p-3 bg-orange-500/20 border border-orange-500/50 rounded text-orange-200 text-sm">
                                                    {closeWarning}
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => setShowCloseForm(false)}
                                                    variant="outline"
                                                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                                                >
                                                    Cancelar
                                                </Button>
                                                <Button
                                                    onClick={handleAdminClose}
                                                    disabled={closing}
                                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                                >
                                                    {closing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Power className="w-4 h-4 mr-2" />}
                                                    Confirmar Encerramento
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="corridas" className="flex-1 border border-gray-800 rounded-md mt-2 overflow-y-auto p-4 bg-gray-900/50">
                        <div className="min-h-full pb-4">
                            <p className="mb-2 text-sm text-gray-400">Gerencie as corridas deste turno. O total será recalculado automaticamente.</p>
                            {shiftId && <RidesList shiftId={shiftId} maxHeight="max-h-[40vh]" />}
                            {!shiftId && <p className="text-center p-10 text-gray-500">Selecione um turno para ver as corridas.</p>}
                        </div>
                    </TabsContent>

                    <TabsContent value="custos" className="flex-1 border border-gray-800 rounded-md mt-2 overflow-y-auto p-4 bg-gray-900/50">
                        <div className="min-h-full pb-4">
                            <p className="mb-2 text-sm text-gray-400">Lançamentos de despesas e custos.</p>
                            {shiftId && <CostsList shiftId={shiftId} />}
                            {!shiftId && <p className="text-center p-10 text-gray-500">Selecione um turno para ver os custos.</p>}
                        </div>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="mt-4 pt-4 border-t border-gray-800">
                    <Button
                        onClick={() => {
                            onSuccess();
                            onOpenChange(false);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold"
                    >
                        Salvar e Fechar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
