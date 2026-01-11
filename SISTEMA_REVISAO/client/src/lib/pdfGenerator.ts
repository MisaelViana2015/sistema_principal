
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatTime, formatKm, formatDuration, formatPlate } from "./format";
import type { shifts, Ride, CostType } from "@shared/schema"; // Import Ride and CostType
// Using any for Cost/Details because frontend uses Portuguese keys (valor, tipo)
// while schema uses English (value, costTypeId), suggesting a transformation or legacy usage.
type ShiftWithDetails = any;
type Cost = any;
type ShiftCostType = CostType; // Alias for compatibility
import type { ShiftCalculations } from "./calc";

interface PDFData {
  shift: ShiftWithDetails;
  rides: Ride[];
  costs: Cost[];
  calculations: ShiftCalculations;
  kmFinal: number;
  costTypes?: ShiftCostType[];
}

export function generateShiftPDF(data: PDFData) {
  const { shift, rides, costs, calculations, kmFinal, costTypes = [] } = data;

  // Helper to resolve cost type name (prioritize observacao > dynamic type > legacy tipo)
  const getCostDisplayName = (cost: Cost): string => {
    // 1. Use observacao if present (user-provided description)
    if (cost.observacao) return cost.observacao;

    // 2. Try to resolve dynamic type name
    if (cost.typeId) {
      const type = costTypes.find(t => t.id === cost.typeId);
      if (type) return type.name;
    }

    // 3. Fallback to legacy tipo field
    if (cost.tipo) return cost.tipo;

    // 4. Final fallback
    return "N/A";
  };

  const doc = new jsPDF();
  let yPosition = 20;

  // Cabeçalho Principal
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235); // Azul
  doc.text("RELATÓRIO DE TURNO", 105, yPosition, { align: "center" });

  yPosition += 8;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")} `, 105, yPosition, { align: "center" });

  // Linha divisória
  yPosition += 8;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(14, yPosition, 196, yPosition);

  // Informações do Turno (Box com fundo)
  yPosition += 8;
  doc.setFillColor(245, 247, 250);
  doc.rect(14, yPosition, 182, 35, "F");

  yPosition += 7;
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("INFORMAÇÕES DO TURNO", 18, yPosition);

  yPosition += 7;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Motorista: ${shift.driver?.nome || "N/A"} `, 18, yPosition);
  yPosition += 5;
  doc.text(`Veículo: ${formatPlate(shift.vehicle?.plate || "")} - ${shift.vehicle?.modelo || "N/A"} `, 18, yPosition);
  yPosition += 5;
  doc.text(`Período: ${formatTime(shift.inicio)} - ${shift.fim ? formatTime(shift.fim) : "Em andamento"} `, 18, yPosition);
  yPosition += 5;
  doc.text(`Duração: ${formatDuration(calculations.duracaoMin)} | KM: ${shift.kmInicial.toFixed(1)} → ${kmFinal.toFixed(1)} km(${formatKm(calculations.kmRodado)} rodados)`, 18, yPosition);

  yPosition += 12;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("CORRIDAS POR APLICATIVO", 14, yPosition);
  yPosition += 2;

  const ridesApp = rides.filter((r) => r.tipo === "app");
  if (ridesApp.length > 0) {
    const appData = ridesApp.map((ride, idx) => [
      `${idx + 1} `,
      formatTime(ride.hora),
      formatCurrency(parseFloat(ride.valor as string)),
    ]);
    appData.push([
      "",
      "TOTAL",
      formatCurrency(calculations.totalApp),
    ]);
    appData.push([
      "",
      `Total de Corridas: ${ridesApp.length} `,
      `Ticket Médio: ${formatCurrency(calculations.ticketMedioApp)} `,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["#", "Hora", "Valor"]],
      body: appData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 80 },
        2: { cellWidth: 40, halign: "right" },
      },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    yPosition += 5;
    doc.setFont("helvetica", "italic");
    doc.text("Nenhuma corrida por app", 14, yPosition);
    yPosition += 10;
  }

  doc.setFont("helvetica", "bold");
  doc.text("CORRIDAS PARTICULARES", 14, yPosition);
  yPosition += 2;

  const ridesParticular = rides.filter((r) => r.tipo === "particular");
  if (ridesParticular.length > 0) {
    const particularData = ridesParticular.map((ride, idx) => [
      `${idx + 1} `,
      formatTime(ride.hora),
      formatCurrency(parseFloat(ride.valor as string)),
    ]);
    particularData.push([
      "",
      "TOTAL",
      formatCurrency(calculations.totalParticular),
    ]);
    particularData.push([
      "",
      `Total de Corridas: ${ridesParticular.length} `,
      `Ticket Médio: ${formatCurrency(calculations.ticketMedioParticular)} `,
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["#", "Hora", "Valor"]],
      body: particularData,
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 80 },
        2: { cellWidth: 40, halign: "right" },
      },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  } else {
    yPosition += 5;
    doc.setFont("helvetica", "italic");
    doc.text("Nenhuma corrida particular", 14, yPosition);
    yPosition += 10;
  }

  if (costs.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("CUSTOS DO TURNO", 14, yPosition);
    yPosition += 2;

    const costsData = costs.map((cost, idx) => [
      `${idx + 1} `,
      formatTime(cost.hora),
      cost.observacao || getCostDisplayName(cost),
      formatCurrency(parseFloat(cost.valor as string)),
    ]);
    costsData.push([
      "",
      "",
      "TOTAL",
      formatCurrency(calculations.totalCustos),
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [["#", "Hora", "Descrição", "Valor"]],
      body: costsData,
      theme: "striped",
      headStyles: { fillColor: [239, 68, 68], fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 15 },
        1: { cellWidth: 30 },
        2: { cellWidth: 70 },
        3: { cellWidth: 30, halign: "right" },
      },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  if (yPosition > 240) {
    doc.addPage();
    yPosition = 20;
  }

  // Box de Resumo Financeiro
  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(250, 204, 21);
  doc.setLineWidth(1);
  doc.rect(14, yPosition, 182, 50, "FD");

  yPosition += 7;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("RESUMO FINANCEIRO", 18, yPosition);

  yPosition += 10;
  doc.setFontSize(11);

  // Linha 1: Receita Total e Custos
  doc.setFont("helvetica", "normal");
  doc.text("Receita Total:", 18, yPosition);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(34, 197, 94); // Verde
  doc.text(formatCurrency(calculations.totalBruto), 80, yPosition);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text("Custos:", 110, yPosition);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(239, 68, 68); // Vermelho
  doc.text(formatCurrency(calculations.totalCustos), 160, yPosition);

  yPosition += 8;

  // Linha 2: Lucro Líquido (DESTAQUE)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(0, 0, 0);
  doc.text("LUCRO LÍQUIDO:", 18, yPosition);
  doc.setTextColor(22, 163, 74); // Verde escuro
  doc.text(formatCurrency(calculations.liquido), 80, yPosition);

  yPosition += 12;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(18, yPosition, 192, yPosition);
  yPosition += 8;

  // Linha 3: Divisão 60/40
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(0, 0, 0);
  doc.text("Empresa (60%):", 18, yPosition);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(calculations.repasseEmpresa), 80, yPosition);

  doc.setFont("helvetica", "normal");
  doc.text("Motorista (40%):", 110, yPosition);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235); // Azul
  doc.text(formatCurrency(calculations.repasseMotorista), 160, yPosition);

  yPosition += 10;

  doc.setFont("helvetica", "bold");
  doc.text("DADOS OPERACIONAIS", 14, yPosition);
  yPosition += 8;

  const operationalData = [
    ["KM Inicial", shift.kmInicial.toFixed(1) + " km"],
    ["KM Final", kmFinal.toFixed(1) + " km"],
    ["KM Rodados", formatKm(calculations.kmRodado)],
    ["Valor por KM", formatCurrency(calculations.valorKm)],
    ["Total de Corridas", calculations.totalCorridas.toString()],
    ["Ticket Médio Geral", formatCurrency(calculations.ticketMedioGeral)],
  ];

  autoTable(doc, {
    startY: yPosition,
    body: operationalData,
    theme: "plain",
    bodyStyles: { fontSize: 10 },
    columnStyles: {
      0: { cellWidth: 100, fontStyle: "bold" },
      1: { cellWidth: 40, halign: "right" },
    },
  });

  const fileName = `turno_${shift.driver?.nome?.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}
