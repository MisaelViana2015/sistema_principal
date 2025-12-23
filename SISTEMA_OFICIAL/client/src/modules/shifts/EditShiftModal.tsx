import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { shiftsService } from "./shifts.service";
import { Loader2 } from "lucide-react";
import { RidesList } from "../rides/RidesList"; // Reusing RidesList component but filtered
// CustosList will be implemented next

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

    useEffect(() => {
        if (open && shiftId) {
            loadShift();
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
            console.log('[EditShiftModal] Form data:', formData);

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

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl bg-gray-900 border-gray-800 text-white h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Editar Turno</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="corridas" className="flex-1 flex flex-col">
                    <TabsList className="bg-gray-800 text-gray-400">
                        <TabsTrigger value="dados">Dados do Turno</TabsTrigger>
                        <TabsTrigger value="corridas">Corridas (Rides)</TabsTrigger>
                        <TabsTrigger value="custos">Custos & Despesas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="dados" className="flex-1 p-4 border border-gray-800 rounded-md mt-2">
                        <div className="space-y-4">
                            <p className="text-gray-400 mb-4">Edite os dados principais do turno.</p>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>KM Inicial</Label>
                                    <Input
                                        type="number"
                                        className="bg-gray-800 border-gray-700"
                                        value={formData.kmInicial}
                                        onChange={e => setFormData({ ...formData, kmInicial: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>KM Final</Label>
                                    <Input
                                        type="number"
                                        className="bg-gray-800 border-gray-700"
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
                        </div>
                    </TabsContent>

                    <TabsContent value="corridas" className="flex-1 p-4 border border-gray-800 rounded-md mt-2 overflow-auto">
                        <div className="h-full">
                            <p className="mb-2 text-sm text-gray-400">Gerencie as corridas deste turno. O total será recalculado automaticamente.</p>
                            {shiftId && <RidesList shiftId={shiftId} />}
                            {!shiftId && <p className="text-center p-10 text-gray-500">Selecione um turno para ver as corridas.</p>}
                        </div>
                    </TabsContent>

                    <TabsContent value="custos" className="flex-1 p-4 border border-gray-800 rounded-md mt-2 overflow-auto">
                        <div className="h-full">
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
