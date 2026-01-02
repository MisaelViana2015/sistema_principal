import { useState, useEffect } from "react";
import { api } from "../../../lib/api";
import { shiftsService } from "../shifts.service";

export function useDriverActions(
    activeShift: any,
    rides: any[],
    expenses: any[],
    user: any,
    onSuccess: () => void // Callback to refresh data or change view
) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [rideCooldown, setRideCooldown] = useState(0);
    const [costCooldown, setCostCooldown] = useState(0);
    const [isTabVisible, setIsTabVisible] = useState(true);

    useEffect(() => {
        const handleVisibilityChange = () => setIsTabVisible(!document.hidden);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, []);

    // Cooldown Timers
    useEffect(() => {
        if (rideCooldown > 0 && isTabVisible) {
            const timer = setTimeout(() => setRideCooldown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [rideCooldown, isTabVisible]);

    useEffect(() => {
        if (costCooldown > 0 && isTabVisible) {
            const timer = setTimeout(() => setCostCooldown(prev => prev - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [costCooldown, isTabVisible]);

    const handleSaveRide = async (rideValue: string, rideType: string) => {
        if (!rideValue) return;
        if (rideCooldown > 0 || isSubmitting) return;

        setIsSubmitting(true);
        setError("");
        try {
            // Duplicate check
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
            const recentDuplicateRide = rides.find(r =>
                Number(r.valor) === Number(rideValue) &&
                new Date(r.hora).getTime() > fiveMinutesAgo
            );
            if (recentDuplicateRide) {
                console.log('[INFO] Corrida com valor duplicado recente - permitindo mesmo assim.');
            }

            await api.post("/rides", {
                shiftId: activeShift.id,
                tipo: rideType,
                valor: Number(rideValue),
                hora: new Date().toISOString()
            });

            setRideCooldown(300);
            onSuccess();
        } catch (err: any) {
            console.error(err);
            const errMsg = err.response?.data?.message || "Erro ao salvar corrida.";
            const match = errMsg.match(/Aguarde (?:(\d+)m )?(\d+)s/);
            if (match) {
                const minutes = parseInt(match[1] || '0');
                const seconds = parseInt(match[2]);
                const totalSeconds = (minutes * 60) + seconds;
                setRideCooldown(totalSeconds);
            } else {
                setError(errMsg);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSaveCost = async (costValue: string, costType: any, obs: string, isSplitCost: boolean) => {
        if (isSubmitting) return;
        if (!costValue) {
            setError("Informe o valor total.");
            return;
        }
        if (!costType) {
            setError("Selecione um tipo de despesa.");
            return;
        }

        setIsSubmitting(true);
        setError("");
        try {
            const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
            const recentDuplicateCost = expenses.find(e =>
                Number(e.value || e.valor) === Number(costValue) &&
                new Date(e.date || e.data).getTime() > fiveMinutesAgo
            );

            if (recentDuplicateCost) {
                const minutesAgo = Math.round((Date.now() - new Date(recentDuplicateCost.date || recentDuplicateCost.data).getTime()) / 60000);
                const confirmDuplicate = window.confirm(
                    `⚠️ Atenção: Um custo de R$ ${Number(costValue).toFixed(2)} foi lançado há ${minutesAgo} minuto(s).\n\nDeseja lançar novamente?`
                );
                if (!confirmDuplicate) {
                    setIsSubmitting(false);
                    return;
                }
            }

            await api.post("/financial/expenses", {
                driverId: user?.id,
                shiftId: activeShift.id,
                costTypeId: costType.id,
                valor: Number(costValue),
                data: new Date().toISOString(),
                notes: obs,
                isSplitCost: isSplitCost
            });

            onSuccess();
        } catch (err) {
            console.error(err);
            setError("Erro ao salvar custo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFinishShift = async (kmFinal: string) => {
        if (!activeShift || !kmFinal) {
            setError("Informe o KM final.");
            return;
        }
        if (Number(kmFinal) < Number(activeShift.kmInicial)) {
            setError("O KM Final não pode ser menor que o KM Inicial.");
            return;
        }
        try {
            await shiftsService.finishShift(String(activeShift.id), Number(kmFinal));
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao finalizar turno.");
        }
    };

    return {
        handleSaveRide,
        handleSaveCost,
        handleFinishShift,
        isSubmitting,
        error,
        setError,
        rideCooldown,
        costCooldown
    };
}
