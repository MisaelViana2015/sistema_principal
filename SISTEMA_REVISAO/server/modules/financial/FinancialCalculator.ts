
/**
 * CALCULADORA FINANCEIRA CENTRALIZADA
 *
 * Regras:
 * 1. Antes de 15/12/2024: 60% Empresa / 40% Motorista
 * 2. Depois de 15/12/2024: 50% Empresa / 50% Motorista
 *
 * Lógica do Split de Custos:
 * - Se houver custo DIVIDIDO (isSplitCost), ele é descontado 50/50 APÓS a divisão base.
 * - Custos Normais são descontados 100% da parte da Empresa (ou do Bruto antes?),
 *   a implementação atual no service desconta da Empresa.
 */
export const FinancialCalculator = {
    // Constantes
    CUTOFF_DATE: new Date('2024-12-15T00:00:00'),

    // Regras de Partilha
    SPLIT_OLD: { company: 0.60, driver: 0.40 },
    SPLIT_NEW: { company: 0.50, driver: 0.50 },

    /**
     * Calcula a divisão do repasse baseado na data do turno
     */
    calculateSplit(shiftDate: Date | string, liquidoBase: number) {
        // REGRA FIXA: Sempre 60/40 (Empresa/Motorista)
        const split = this.SPLIT_OLD;

        // Calcula repasse base
        const repasseEmpresa = liquidoBase * split.company;
        const repasseMotorista = liquidoBase * split.driver;

        return {
            repasseEmpresa,
            repasseMotorista,
            ruleUsed: '60/40 (Padrão)'
        };
    },

    /**
     * Calcula o resultado final de um turno
     */
    calculateShiftResult(params: {
        totalApp: number,
        totalParticular: number,
        totalCustosNormais: number,
        totalCustosDivididos: number,
        shiftDate: Date | string
    }) {
        const { totalApp, totalParticular, totalCustosNormais, totalCustosDivididos, shiftDate } = params;

        const totalBruto = totalApp + totalParticular;

        // Na regra atual (shifts.service.ts), o "Líquido" base para divisão é o bruto.
        // Custos normais são abatidos da parte da empresa.
        const liquido = totalBruto;

        // 1. Calcular Repasse Base
        const { repasseEmpresa, repasseMotorista, ruleUsed } = this.calculateSplit(shiftDate, liquido);

        // 2. Aplicar descontos de custos
        // Custos Normais: Empresa paga 100%
        let finalEmpresa = repasseEmpresa - totalCustosNormais;
        let finalMotorista = repasseMotorista;

        // Custos Divididos: 50% para cada
        const discountCompany = totalCustosDivididos * 0.50;
        const discountDriver = totalCustosDivididos * 0.50;

        finalEmpresa -= discountCompany;
        finalMotorista -= discountDriver;

        return {
            totalBruto,
            liquido,
            repasseEmpresa: Number(finalEmpresa.toFixed(2)),
            repasseMotorista: Number(finalMotorista.toFixed(2)),
            ruleUsed,
            discountCompany,
            discountDriver,
            totalCustos: totalCustosNormais + totalCustosDivididos
        };
    }
};
