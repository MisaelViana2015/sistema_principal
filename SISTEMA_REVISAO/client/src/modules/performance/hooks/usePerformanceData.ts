import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";

// --- FETCHERS ---
async function fetchExpenses() {
    const response = await api.get("/financial/expenses");
    return response.data;
}

async function fetchCostTypes() {
    const response = await api.get("/financial/cost-types");
    return response.data;
}

async function fetchFixedCosts() {
    const response = await api.get("/financial/fixed-costs");
    return response.data;
}

async function fetchDrivers() {
    const response = await api.get("/drivers");
    return response.data;
}

async function fetchShifts() {
    // Busca últimos 1000 turnos para análise
    const response = await api.get("/shifts?limit=1000");
    return response.data.data || response.data; // Handle pagination structure
}

async function fetchLegacyMaintenances() {
    const response = await api.get("/financial/legacy-maintenances");
    return response.data;
}

async function fetchVehicles() {
    const response = await api.get("/vehicles");
    return response.data;
}

async function fetchFixedCostInstallments(filters?: any) {
    const params = new URLSearchParams(filters).toString();
    const response = await api.get(`/financial/fixed-costs/installments?${params}`);
    return response.data;
}

export function usePerformanceData(selectedYear: string, selectedMonth: string) {
    // Queries
    const { data: costs = [], refetch: refetchExpenses, isLoading: isLoadingExpenses } = useQuery({
        queryKey: ["expenses"],
        queryFn: fetchExpenses
    });

    const { data: costTypes = [], refetch: refetchCostTypes } = useQuery({
        queryKey: ["costTypes"],
        queryFn: fetchCostTypes
    });

    const { data: fixedCosts = [], refetch: refetchFixedCosts } = useQuery({
        queryKey: ["fixedCosts"],
        queryFn: fetchFixedCosts
    });

    const { data: drivers = [] } = useQuery({
        queryKey: ["drivers"],
        queryFn: fetchDrivers
    });

    const { data: shifts = [], isLoading: isLoadingShifts } = useQuery({
        queryKey: ["shifts"],
        queryFn: fetchShifts
    });

    const { data: legacyMaintenances = [] } = useQuery({
        queryKey: ["legacyMaintenances"],
        queryFn: fetchLegacyMaintenances
    });

    const { data: vehicles = [] } = useQuery({
        queryKey: ["vehicles"],
        queryFn: fetchVehicles
    });

    // Fetch Installments (filtered by year/month if selected)
    const { data: installments = [], refetch: refetchInstallments } = useQuery({
        queryKey: ["fixedCostInstallments", selectedYear, selectedMonth],
        queryFn: () => fetchFixedCostInstallments({ year: selectedYear, month: selectedMonth })
    });

    return {
        costs,
        costTypes,
        fixedCosts,
        drivers,
        shifts,
        legacyMaintenances,
        vehicles,
        installments,
        refetchExpenses,
        refetchCostTypes,
        refetchFixedCosts,
        refetchInstallments,
        isLoading: isLoadingExpenses || isLoadingShifts
    };
}
