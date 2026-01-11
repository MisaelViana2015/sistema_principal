import { round2 } from "./format";
import type { Ride } from "@shared/schema";
// import type { expenses } from "@shared/schema";
type Cost = any;

export interface ShiftCalculations {
  totalApp: number;
  totalParticular: number;
  totalBruto: number;
  totalCustos: number;
  liquido: number;
  repasseEmpresa: number;
  repasseMotorista: number;
  totalCorridasApp: number;
  totalCorridasParticular: number;
  totalCorridas: number;
  duracaoMin: number;
  valorKm: number;
  ticketMedioApp: number;
  ticketMedioParticular: number;
  ticketMedioGeral: number;
  kmRodado: number;
}

export function calculateShiftTotals(
  rides: Ride[],
  costs: Cost[],
  kmInicial: number,
  kmFinal: number,
  inicio: Date,
  fim: Date
): ShiftCalculations {
  // Totais por tipo
  const totalApp = round2(
    rides
      .filter((r) => r.tipo === "app")
      .reduce((sum, r) => sum + (parseFloat(r.valor as string) || 0), 0)
  );

  const totalParticular = round2(
    rides
      .filter((r) => r.tipo === "particular")
      .reduce((sum, r) => sum + (parseFloat(r.valor as string) || 0), 0)
  );

  const totalBruto = round2(totalApp + totalParticular);

  // Custos
  const totalCustos = round2(
    costs.reduce((sum, c) => sum + (parseFloat(c.valor as string) || 0), 0)
  );

  // Líquido
  const liquido = round2(totalBruto - totalCustos);

  // Repasses (60% empresa, 40% motorista)
  const repasseEmpresa = round2(liquido * 0.6);
  const repasseMotorista = round2(liquido * 0.4);

  // Contagens
  const totalCorridasApp = rides.filter((r) => r.tipo === "app").length;
  const totalCorridasParticular = rides.filter((r) => r.tipo === "particular").length;
  const totalCorridas = rides.length;

  // KM
  const kmRodado = round2(kmFinal - kmInicial);
  const valorKm = kmRodado > 0 ? round2(liquido / kmRodado) : 0;

  // Duração em minutos
  const duracaoMin = Math.floor((fim.getTime() - inicio.getTime()) / 1000 / 60);

  // Tickets médios
  const ticketMedioApp =
    totalCorridasApp > 0 ? round2(totalApp / totalCorridasApp) : 0;
  const ticketMedioParticular =
    totalCorridasParticular > 0
      ? round2(totalParticular / totalCorridasParticular)
      : 0;
  const ticketMedioGeral =
    totalCorridas > 0 ? round2(totalBruto / totalCorridas) : 0;

  return {
    totalApp,
    totalParticular,
    totalBruto,
    totalCustos,
    liquido,
    repasseEmpresa,
    repasseMotorista,
    totalCorridasApp,
    totalCorridasParticular,
    totalCorridas,
    duracaoMin,
    valorKm,
    ticketMedioApp,
    ticketMedioParticular,
    ticketMedioGeral,
    kmRodado,
  };
}
