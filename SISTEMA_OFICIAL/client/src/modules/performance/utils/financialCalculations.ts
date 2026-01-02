import { Shift, Expense, FixedCost, Driver } from "../../../../../shared/schema";

export interface FinancialSummary {
    faturamentoTotal: number;
    custosTotais: number;
    custosFixosMes: number;
    custosVariaveis: number;
    lucroLiquidoEmpresa: number;
    lucroBrutoEmpresa: number;
    repasseMotorista: number;
    pontoEquilibrio: number;
    progressoPE: number;
    faltaParaPE: number;
    targetReceitaBruta: number;
}

export interface DriverMetric {
    nome: string;
    valorTotal: number;
    valor: number; // 40%
    totalHours: number;
    totalShifts: number;
    avgHours: number;
    totalRevenue: number;
    revenuePerHour: number;
}

export function calculateFinancialSummary(
    shifts: Shift[],
    expenses: Expense[],
    fixedCosts: FixedCost[], // Total da query
    selectedYear: string,
    selectedMonth: string
): FinancialSummary {
    // 1. Filtrar Turnos
    const filteredShifts = shifts.filter((s) => {
        const d = new Date(s.inicio);
        const yearMatch = selectedYear === "todos" || d.getFullYear().toString() === selectedYear;
        const monthMatch = selectedMonth === "todos" || (d.getMonth() + 1).toString() === selectedMonth;
        return yearMatch && monthMatch;
    });

    // 2. Filtrar Despesas
    const filteredExpenses = expenses.filter((c) => {
        const d = new Date(c.date);
        const yearMatch = selectedYear === "todos" || d.getFullYear().toString() === selectedYear;
        const monthMatch = selectedMonth === "todos" || (d.getMonth() + 1).toString() === selectedMonth;
        return yearMatch && monthMatch;
    });

    // 3. Totais Base
    const faturamentoTotal = filteredShifts.reduce((acc, s) => acc + (Number(s.totalBruto) || 0), 0);
    // Nota: O código original usava s.receita. No schema Shifts tem 'totalBruto'. Assumindo totalBruto.

    // Repasse Motorista: O schema tem repasseMotorista salvo.
    // Porém a regra de negócio do frontend estava recalculando: faturamentoTotal * 0.40.
    // Vou manter a lógica do frontend para consitência com o que estava lá.
    const repasseMotorista = faturamentoTotal * 0.40;
    const lucroBrutoEmpresa = faturamentoTotal * 0.60;

    // 4. Custos
    // Custos Variáveis (Considerando split 50%)
    const custosVariaveis = filteredExpenses.reduce((acc, c) => {
        const val = Number(c.value) || 0;
        return acc + (c.isSplitCost ? val * 0.5 : val);
    }, 0);

    // Custos Fixos
    const totalFixosCadastrados = fixedCosts.reduce((acc, c) => acc + (Number(c.value) || 0), 0);
    const custosFixosMes = selectedMonth !== "todos" ? totalFixosCadastrados : (selectedYear !== "todos" ? totalFixosCadastrados * 12 : 0);

    const custosTotais = custosVariaveis + custosFixosMes;

    // 5. Lucro Líquido
    const lucroLiquidoEmpresa = lucroBrutoEmpresa - custosTotais;

    // 6. Ponto de Equilíbrio
    const targetReceitaEmpresa = custosTotais;
    const targetReceitaBruta = targetReceitaEmpresa / 0.60;
    const pontoEquilibrio = targetReceitaBruta;
    const progressoPE = targetReceitaBruta > 0 ? (faturamentoTotal / targetReceitaBruta) * 100 : 0;
    const faltaParaPE = Math.max(0, targetReceitaBruta - faturamentoTotal);

    return {
        faturamentoTotal,
        custosTotais,
        custosFixosMes,
        custosVariaveis,
        lucroLiquidoEmpresa,
        lucroBrutoEmpresa,
        repasseMotorista,
        pontoEquilibrio,
        progressoPE,
        faltaParaPE,
        targetReceitaBruta
    };
}

export function calculateDriverMetrics(
    drivers: Driver[],
    shifts: Shift[],
    selectedYear: string,
    selectedMonth: string
): DriverMetric[] {
    return drivers.map((driver) => {
        const dShifts = shifts.filter((s) => {
            const d = new Date(s.inicio);
            const yearMatch = selectedYear === "todos" || d.getFullYear().toString() === selectedYear;
            const monthMatch = selectedMonth === "todos" || (d.getMonth() + 1).toString() === selectedMonth;
            // Match both ID (if populated) or match name if ID missing (legacy compat)
            const idMatch = s.driverId === driver.id; // Removed fallback to name match for stricter typing
            return yearMatch && monthMatch && idMatch;
        });

        const totalHours = dShifts.reduce((acc, s) => {
            let h = (Number(s.duracaoMin) || 0) / 60;
            if (h === 0 && s.inicio && s.fim) {
                const start = new Date(s.inicio).getTime();
                const end = new Date(s.fim).getTime();
                h = (end - start) / (1000 * 60 * 60);
            }
            return acc + h;
        }, 0);

        const totalShifts = dShifts.length;
        const totalRevenue = dShifts.reduce((acc, s) => acc + (Number(s.totalBruto) || 0), 0);

        return {
            nome: driver.nome,
            valorTotal: totalRevenue,
            valor: totalRevenue * 0.40,
            totalHours,
            totalShifts,
            avgHours: totalShifts > 0 ? totalHours / totalShifts : 0,
            totalRevenue,
            revenuePerHour: totalHours > 0 ? totalRevenue / totalHours : 0
        };
    }).filter((d) => d.totalShifts > 0).sort((a, b) => b.totalHours - a.totalHours);
}
