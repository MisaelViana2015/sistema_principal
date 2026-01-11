import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { vehiclesService } from "../../vehicles/vehicles.service";
import { shiftsService } from "../shifts.service";
import { ridesService, RideWithDetails } from "../../rides/rides.service";
import { api } from "../../../lib/api";
import { Vehicle } from "../../../../../shared/schema";

export function useDriverShiftData() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [activeShift, setActiveShift] = useState<any>(null);
    const [rides, setRides] = useState<RideWithDetails[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [costTypesList, setCostTypesList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const loadRides = useCallback(async (shiftId: string) => {
        try {
            const data = await ridesService.getAll({
                limit: 20,
                driverId: String(user?.id),
                shiftId: shiftId
            });
            setRides(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            console.error("Erro ao carregar corridas recent", err);
            setRides([]);
        }
    }, [user?.id]);

    const loadExpenses = useCallback(async (shiftId: string) => {
        try {
            const res = await api.get("/financial/expenses", {
                params: { shiftId, limit: 10 }
            });
            setExpenses(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Erro ao carregar custos", err);
            setExpenses([]);
        }
    }, []);

    const loadData = useCallback(async () => {
        if (!user || !user.id) return;
        setIsLoading(true);
        setError("");
        try {
            const [vehiclesData, costTypesRes] = await Promise.all([
                vehiclesService.getAll(),
                api.get("/financial/cost-types")
            ]);

            const activeVehicles = Array.isArray(vehiclesData)
                ? vehiclesData.filter((v: any) => v.isActive !== false)
                : [];
            setVehicles(activeVehicles);

            const activeTypes = Array.isArray(costTypesRes.data)
                ? costTypesRes.data.filter((t: any) => t.isActive !== false && t.visibleToDriver !== false)
                : [];
            setCostTypesList(activeTypes);

            const currentShift = await shiftsService.getCurrentShift(String(user.id));
            if (currentShift) {
                setActiveShift(currentShift);
                await Promise.all([
                    loadRides(currentShift.id),
                    loadExpenses(currentShift.id)
                ]);
            } else {
                setActiveShift(null);
            }
        } catch (err) {
            console.error(err);
            setActiveShift(null);
            setError("Erro ao carregar dados. Tente recarregar.");
        } finally {
            setIsLoading(false);
        }
    }, [user, loadRides, loadExpenses]);

    // Force reload specifically for after mutations
    const refreshData = useCallback(async () => {
        if (activeShift) {
            // Reload specific parts without full page load effect if possible,
            // but for simplicity calling loadData is safest logic-wise
            // or just reload rides/expenses/shift details
            const updatedShift = await shiftsService.getCurrentShift(String(user?.id));
            if (updatedShift) {
                setActiveShift(updatedShift);
                loadRides(updatedShift.id);
                loadExpenses(updatedShift.id);
            } else {
                setActiveShift(null);
            }
        } else {
            loadData();
        }
    }, [activeShift, user?.id, loadRides, loadExpenses, loadData]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    return {
        vehicles,
        activeShift,
        rides,
        expenses,
        costTypesList,
        isLoading,
        error,
        clearError: () => setError(""),
        refreshData,
        loadData // Expose full reload if needed
    };
}
