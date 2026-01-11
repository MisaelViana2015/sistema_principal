import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { vehiclesService } from "../../../modules/vehicles/vehicles.service";
import { shiftsService } from "../../../modules/shifts/shifts.service";
import { ridesService, RideWithDetails } from "../../../modules/rides/rides.service";
import { useToast } from "@/hooks/use-toast";
import { Shift, Vehicle } from "@shared/schema";
import { api } from "../../../lib/api";

export enum TurnoView {
    DASHBOARD = "dashboard",
    ADD_RIDE = "add_ride",
    ADD_COST = "add_cost",
    FINISH_SHIFT = "finish_shift"
}

export function useShiftLogic() {
    const { user } = useAuth();

    // UI State
    const [viewMode, setViewMode] = useState<TurnoView>(TurnoView.DASHBOARD);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Data State
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [activeShift, setActiveShift] = useState<any>(null);
    const [rides, setRides] = useState<RideWithDetails[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [workedTime, setWorkedTime] = useState("--h --min");

    // Form inputs (shared)
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
    const [kmInicial, setKmInicial] = useState<string>("");


    /**
     * INITIAL LOAD
     */
    const loadData = useCallback(async () => {
        if (!user || !user.id) return;
        setIsLoading(true);
        try {
            const vehiclesData = await vehiclesService.getAll();
            setVehicles(vehiclesData);

            const currentShift = await shiftsService.getCurrentShift(String(user.id));
            if (currentShift) {
                setActiveShift(currentShift);
                await Promise.all([
                    loadRides(currentShift.id),
                    loadExpenses(currentShift.id)
                ]);
            }
        } catch (err) {
            console.error(err);
            setError("Erro ao carregar dados.");
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    // Initial effect
    useEffect(() => {
        loadData();
    }, [loadData]);


    /**
     * HELPERS
     */
    async function loadRides(shiftId: string) {
        try {
            const data = await ridesService.getAll({
                limit: 20,
                driverId: String(user?.id),
                shiftId: shiftId
            });
            setRides(data.data);
        } catch (err) {
            console.error("Erro ao carregar corridas recent", err);
        }
    }

    async function loadExpenses(shiftId: string) {
        try {
            const res = await api.get("/financial/expenses", {
                params: { shiftId, limit: 10 }
            });
            setExpenses(res.data || []);
        } catch (err) {
            console.error("Erro ao carregar custos", err);
            setExpenses([]);
        }
    }

    /**
     * TIMER LOGIC
     */
    useEffect(() => {
        if (!activeShift?.inicio) {
            setWorkedTime("--h --min");
            return;
        }
        const updateTimer = () => {
            const start = new Date(activeShift.inicio);
            const now = new Date();
            const diffMs = now.getTime() - start.getTime();
            const diffMins = Math.max(0, Math.floor(diffMs / 60000));
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            setWorkedTime(`${hours}h ${mins} min`);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [activeShift]);


    /**
     * ACTIONS
     */
    async function handleStartShift() {
        if (!selectedVehicleId || !kmInicial) {
            setError("Selecione um veículo e informe o KM inicial.");
            return;
        }
        try {
            const shift = await shiftsService.startShift(selectedVehicleId, Number(kmInicial));
            setActiveShift(shift);
            setError("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao iniciar turno.");
        }
    }

    async function handleFinishShift(kmFinal: string, password: string) {
        if (!activeShift) return;
        if (!kmFinal) {
            setError("Informe o KM final.");
            return;
        }
        if (!password) {
            setError("Informe a senha para confirmar.");
            return;
        }
        if (Number(kmFinal) < Number(activeShift.kmInicial)) {
            setError("O KM Final não pode ser menor que o KM Inicial.");
            return;
        }

        try {
            await shiftsService.finishShift(String(activeShift.id), Number(kmFinal));
            setActiveShift(null);
            setKmInicial("");
            setSelectedVehicleId("");
            setViewMode(TurnoView.DASHBOARD);
            await loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao finalizar turno.");
            throw err; // Propagate to component
        }
    }

    async function handleSaveRide(rideType: "APP" | "PARTICULAR", value: number) {
        if (!activeShift) return;
        setIsSubmitting(true);
        try {
            await api.post("/rides", {
                shiftId: activeShift.id,
                tipo: rideType,
                valor: value,
                hora: new Date().toISOString()
            });

            // Success
            setViewMode(TurnoView.DASHBOARD);
            await loadData(); // Reload stats
        } catch (err) {
            console.error(err);
            setError("Erro ao salvar corrida.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleSaveCost(costTypeId: string, value: number, obs: string) {
        if (!activeShift) return;
        setIsSubmitting(true);
        try {
            await api.post("/financial/expenses", {
                driverId: user?.id,
                shiftId: activeShift.id,
                costTypeId: costTypeId,
                value: value,
                date: new Date(),
                notes: obs
            });

            setViewMode(TurnoView.DASHBOARD);
            await loadData();
        } catch (err) {
            console.error(err);
            setError("Erro ao salvar custo.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return {
        // State
        viewMode,
        setViewMode,
        isLoading,
        isSubmitting,
        error,
        setError,

        // Data
        vehicles,
        activeShift,
        rides,
        expenses,
        workedTime,
        user,

        // Form States
        selectedVehicleId,
        setSelectedVehicleId,
        kmInicial,
        setKmInicial,

        // Methods
        loadData,
        handleStartShift,
        handleFinishShift,
        handleSaveRide,
        handleSaveCost
    };
}
