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

        // 1. Header
        doc.fontSize(20).text("Relatório de Análise Antifraude", { align: "center" });
        doc.moveDown();
        doc.fontSize(10).text(`Event ID: ${event.id}`, { align: "right" });
        doc.text(`Shift ID: ${shift.id}`, { align: "right" });
        doc.text(`Detectado em: ${new Date(event.detectedAt || "").toLocaleString()}`, { align: "right" });
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // 2. Resumo de Risco
        doc.fontSize(14).text("2. Resumo de Risco");
        doc.fontSize(12);
        doc.text(`Risk Score: ${event.riskScore}`);
        doc.text(`Risk Level: ${(event.riskLevel || 'low').toUpperCase()}`);
        doc.text(`Status Atual: ${(event.status || 'pendente').toUpperCase()}`);
        doc.moveDown();

        // 3. Identificação
        doc.fontSize(14).text("3. Identificação");
        doc.fontSize(12);
        doc.text(`Motorista: ${shift.driverId}`);
        doc.text(`Veículo: ${shift.vehicleId}`);
        doc.moveDown();

        // 4. Dados do Turno
        doc.fontSize(14).text("4. Dados do Turno");
        doc.fontSize(12);

        const kmTotal = shift.kmFinal - shift.kmInicial;
        const recPerKm = kmTotal > 0 ? shift.totalBruto / kmTotal : 0;
        const durationHours = shift.duracaoMin > 0 ? shift.duracaoMin / 60 : 0;
        const recPerHour = durationHours > 0 ? shift.totalBruto / durationHours : 0;

        doc.text(`Início: ${new Date(shift.inicio).toLocaleString()}`);
        doc.text(`Fim: ${shift.fim ? new Date(shift.fim).toLocaleString() : "Em andamento"}`);
        doc.text(`KM Total: ${kmTotal} km (Inicial: ${shift.kmInicial} - Final: ${shift.kmFinal})`);
        doc.text(`Receita Total: R$ ${shift.totalBruto.toFixed(2)}`);
        doc.text(`Receita por KM: R$ ${recPerKm.toFixed(2)} / km`);
        doc.text(`Receita por Hora: R$ ${recPerHour.toFixed(2)} / h`);
        doc.text(`Total de Corridas: ${shift.totalCorridas}`);
        doc.text(`Duração: ${durationHours.toFixed(1)} horas`);
        doc.moveDown();

        // 5. Baseline (Média do Motorista)
        doc.fontSize(14).text("5. Baseline (Média do Motorista)");
        doc.fontSize(12);

        const bl = (event.metadata as any)?.baseline;
        if (bl && bl.sampleSize > 0) {
            const fmt = (v: number) => v !== undefined ? v.toFixed(2) : '-';
            doc.text(`Amostra: ${bl.sampleSize} turnos analisados`);
            doc.text(`Receita Média/KM: R$ ${fmt(bl.avgRevenuePerKm)}`);
            doc.text(`Receita Média/Hora: R$ ${fmt(bl.avgRevenuePerHour)}`);
            doc.text(`Corridas Média/Hora: ${fmt(bl.avgRidesPerHour)}`);
            doc.text(`Ticket Médio: R$ ${fmt(bl.avgTicket)}`);
        } else {
            doc.text("Baseline insuficiente para este motorista.", { oblique: true });
        }
        doc.moveDown();

        // 6. Regras Disparadas
        doc.fontSize(14).text("6. Regras Disparadas");
        doc.fontSize(10);

        const reasons = (event.rules as any[]) || (event.metadata as any)?.reasons || [];
        if (reasons.length === 0) {
            doc.text("Nenhuma regra específica registrada.");
        } else {
            reasons.forEach((rule: any) => {
                doc.font('Helvetica-Bold').text(`[${rule.severity?.toUpperCase() || "INFO"}] ${rule.label || rule.code}`);

                // Construct detailed explanation based on rule code and data
                let explanation = rule.description || '';
                const d = rule.data || {};

                // Helper to format currency
                const fmtBRL = (v: number) => `R$ ${v.toFixed(2)}`;

                switch (rule.code) {
                    case "KM_ZERO_COM_RECEITA":
                        explanation = `Esperado: KM > 0 quando há receita • Atual: KM: ${d.kmTotal || 0}, Receita: ${fmtBRL(d.revenueTotal || 0)}`;
                        break;
                    case "RECEITA_KM_MUITO_BAIXA":
                        explanation = `Esperado: ≥ ${fmtBRL(d.minThreshold)}/km • Atual: ${fmtBRL(d.revPerKm)}/km (-${(100 - (d.revPerKm / d.minThreshold) * 100).toFixed(0)}% abaixo)`;
                        break;
                    case "RECEITA_KM_MUITO_ALTA":
                        explanation = `Esperado: ≤ ${fmtBRL(d.maxThreshold)}/km • Atual: ${fmtBRL(d.revPerKm)}/km (${(d.revPerKm / d.maxThreshold).toFixed(1)}x acima)`;
                        break;
                    case "RECEITA_KM_DESVIO_CRITICO":
                        explanation = `Esperado: Próximo da média (${fmtBRL(d.baseline || 0)}) • Atual: ${fmtBRL(d.revPerKm)} (${d.actualMultiplier?.toFixed(1)}x da média)`;
                        break;
                    case "RECEITA_HORA_MUITO_ALTA":
                        explanation = `Esperado: ≤ ${fmtBRL(d.maxThreshold)}/h • Atual: ${fmtBRL(d.revPerHour)}/h`;
                        break;
                    case "POUCAS_CORRIDAS_HORA":
                        explanation = `Esperado: ≥ ${d.minThreshold} corridas/h • Atual: ${(d.ridesPerHour || 0).toFixed(2)} corridas/h`;
                        break;
                    case "TURNO_CURTO_DEMAIS":
                        explanation = `Esperado: ≥ ${(d.minThresholdHours * 60).toFixed(0)} min quando há corridas • Atual: ${(d.durationHours * 60).toFixed(0)} min`;
                        break;
                    case "TURNO_LONGO_DEMAIS":
                        explanation = `Esperado: ≤ ${d.maxThresholdHours}h • Atual: ${(d.durationHours || 0).toFixed(1)}h`;
                        break;
                    case "KM_RETROCEDEU":
                        explanation = `Esperado: KM inicial ≥ KM final anterior (${d.prevShiftKmEnd}) • Atual: ${d.currentShiftKmStart} (Diferença: ${d.gap})`;
                        break;
                    case "KM_SALTO_ABSURDO":
                        explanation = `Esperado: Gap ≤ ${d.maxGap}km • Atual: ${d.gap}km`;
                        break;
                    case "SEQUENCIA_VALORES_IGUAIS":
                    case "SEQUENCIA_VALORES_SUSPEITA":
                        explanation = `Suspeita: ${d.count} corridas de mesmo valor (${fmtBRL(d.valor)}) no turno.`;
                        break;
                    case "SEQUENCIA_CONSECUTIVA":
                        explanation = `Suspeita: ${d.streak} corridas seguidas com valor exato de ${fmtBRL(d.streakValue)}.`;
                        break;
                }

                doc.font('Helvetica').text(`   ${explanation}`);

                // Generic data dump for fallback or extra info
                // Only show if not covered by specific explanation to avoid clutter?
                // User said "well explained", so maybe keep it clean. 
                // Let's hide the raw data dump if we have a specific explanation, OR keep it small and grey.
                // Keeping it creates transparency, but might look redundant. 
                // The images show CLEAN explanations. Let's comment out the raw dump for these known codes.
                if (rule.data && !['KM_ZERO_COM_RECEITA', 'RECEITA_KM_MUITO_BAIXA', 'RECEITA_KM_MUITO_ALTA', 'RECEITA_KM_DESVIO_CRITICO', 'RECEITA_HORA_MUITO_ALTA', 'POUCAS_CORRIDAS_HORA', 'TURNO_CURTO_DEMAIS', 'TURNO_LONGO_DEMAIS', 'KM_RETROCEDEU', 'KM_SALTO_ABSURDO'].includes(rule.code)) {
                    doc.fontSize(8).fillColor('#666666');
                    Object.entries(rule.data).forEach(([key, value]) => {
                        const formattedValue = typeof value === 'number' ? value.toLocaleString('pt-BR', { maximumFractionDigits: 2 }) : value;
                        doc.text(`   • ${key}: ${formattedValue}`);
                    });
                    doc.fontSize(10).fillColor('black');
                }

                doc.moveDown(0.5);
            });
        }
        doc.moveDown();

        // 7. Decisão Humana
        doc.fontSize(14).text("7. Decisão Humana");
        doc.fontSize(12);

        if (event.metadata && (event.metadata as any).comment) {
            doc.text(`Comentário: ${(event.metadata as any).comment}`);
            doc.text(`Data da decisão: ${new Date((event.metadata as any).lastDecisionAt || event.reviewedAt || new Date()).toLocaleString()}`);
        } else {
            doc.text("Nenhuma decisão ou comentário registrado.");
        }

        doc.end();
    });
}
