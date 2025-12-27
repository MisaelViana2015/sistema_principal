import PDFDocument from "pdfkit";
import { fraudEvents } from "../../../shared/schema.js";

interface ShiftData {
    id: string;
    driverId: string;
    vehicleId: string;
    inicio: Date | string;
    fim: Date | string | null;
    kmInicial: number;
    kmFinal: number;
    totalBruto: number;
    totalCorridas: number;
    duracaoMin: number;
}

export async function generateEventPdf(event: typeof fraudEvents.$inferSelect, shift: ShiftData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const buffers: Buffer[] = [];

        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err) => reject(err));

        // Header
        doc.fontSize(20).text("Relatório de Evento de Fraude", { align: "center" });
        doc.moveDown();

        // Summary
        doc.fontSize(12).text(`ID do Evento: ${event.id}`);
        doc.text(`Data de Detecção: ${new Date(event.detectedAt || "").toLocaleString()}`);
        doc.text(`Status: ${(event.status || 'pendente').toUpperCase()}`);
        doc.moveDown();

        // Risk
        doc.fontSize(14).text("Análise de Risco");
        doc.fontSize(12).text(`Score Total: ${event.riskScore}`);
        doc.text(`Nível de Risco: ${(event.riskLevel || 'low').toUpperCase()}`);
        doc.moveDown();

        // Shift Details
        doc.fontSize(14).text("Dados do Turno");
        doc.fontSize(12).text(`ID do Turno: ${shift.id}`);
        doc.text(`Motorista: ${shift.driverId}`); // In real app, name would be better, but ID is what we have
        doc.text(`Veículo: ${shift.vehicleId}`);
        doc.text(`Início: ${new Date(shift.inicio).toLocaleString()}`);
        doc.text(`Fim: ${shift.fim ? new Date(shift.fim).toLocaleString() : "Em andamento"}`);
        doc.text(`KM Total: ${shift.kmFinal - shift.kmInicial} km`);
        doc.text(`Total Bruto: R$ ${shift.totalBruto.toFixed(2)}`);
        doc.text(`Total Corridas: ${shift.totalCorridas}`);
        doc.moveDown();

        // Rules
        doc.fontSize(14).text("Regras Acionadas");
        doc.fontSize(10);

        // Regras estão em event.rules (schema) ou event.details.reasons (seed)
        const reasons = (event.rules as any[]) || (event.metadata as any)?.reasons || [];
        if (reasons.length === 0) {
            doc.text("Nenhuma regra específica registrada.");
        } else {
            reasons.forEach((rule: any) => {
                doc.text(`[${rule.severity?.toUpperCase() || "INFO"}] ${rule.label || rule.code}: ${rule.description || ''}`);
                doc.moveDown(0.5);
            });
        }
        doc.moveDown();

        // Comments
        if (event.metadata && (event.metadata as any).comment) {
            doc.fontSize(14).text("Comentários da Análise Humana");
            doc.fontSize(12).text((event.metadata as any).comment);
        }

        doc.end();
    });
}
