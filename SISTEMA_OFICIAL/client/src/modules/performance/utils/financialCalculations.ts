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
    const faturamentoTotal = filteredShifts.reduce((acc, s) => acc + (Number(s.totalBruto) || 0), 0); // Alterado para totalBruto conforme schema, ou mantemos receita se for campo virtual? O schema diz totalBruto. O código original usava receita. Vou verificar se receita é calculada. O schema tem totalBruto.
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
    const custosFixosMes = selectedMonth !== "todos" ? totalFixosCadastrados : 0;

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
            return yearMatch && monthMatch && s.driverId === driver.id;
        });

        // Usando totalBruto aqui tabém para consistência
        const driverTotal = dShifts.reduce((acc, s) => acc + (Number(s.totalBruto) || 0), 0);
        return {
            nome: driver.nome,
            valorTotal: driverTotal,
            valor: driverTotal * 0.40
        };
    }).filter((d) => d.valor > 0).sort((a, b) => b.valor - a.valor);
}
