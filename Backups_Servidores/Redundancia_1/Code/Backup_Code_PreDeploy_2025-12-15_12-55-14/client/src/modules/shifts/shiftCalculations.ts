export function calculateShiftKPIs(shift: any, kmFinal?: number) {
    const kmRodados = kmFinal ? kmFinal - Number(shift.kmInicial) : 0;
    const totalReceita = Number(shift.totalBruto) || 0;
    const totalCustos = Number(shift.totalCustos) || 0;
    const lucroLiquido = totalReceita - totalCustos;
    const totalCorridas = (Number(shift.totalCorridasApp) || 0) + (Number(shift.totalCorridasParticular) || 0);

    return {
        kmRodados: Math.max(0, kmRodados),
        totalReceita,
        totalCustos,
        lucroLiquido,
        valorPorKm: kmRodados > 0 ? totalReceita / kmRodados : 0,
        ticketMedio: totalCorridas > 0 ? totalReceita / totalCorridas : 0,
        totalCorridas
    };
}

export function formatCurrency(value: number) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

export function formatTime(dateStr: string) {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
