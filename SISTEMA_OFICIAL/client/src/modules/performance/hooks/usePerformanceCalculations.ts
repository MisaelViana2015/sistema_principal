import { useMemo } from "react";
import { calculateFinancialSummary, calculateDriverMetrics } from "../utils/financialCalculations";

interface PerformanceCalculationsProps {
    drivers: any[];
    shifts: any[];
    costs: any[];
    fixedCosts: any[];
    selectedYear: string;
    selectedMonth: string;
}

export function usePerformanceCalculations({
    drivers,
    shifts,
    costs,
    fixedCosts,
    selectedYear,
    selectedMonth
}: PerformanceCalculationsProps) {
    const financialSummary = useMemo(() => calculateFinancialSummary(
        shifts || [],
        costs || [],
        fixedCosts || [],
        selectedYear,
        selectedMonth
    ), [shifts, costs, fixedCosts, selectedYear, selectedMonth]);

    const driverBreakdown = useMemo(() => calculateDriverMetrics(
        drivers || [],
        shifts || [],
        selectedYear,
        selectedMonth
    ), [drivers, shifts, selectedYear, selectedMonth]);

    return {
        financialSummary,
        driverBreakdown
    };
}
