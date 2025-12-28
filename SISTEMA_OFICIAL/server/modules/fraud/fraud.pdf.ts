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

// 12. ANEXO EXPLICATIVO (Hardcoded to avoid engine modification)
const OFFICIAL_RULES_LIST = [
    { code: "KM_ZERO_COM_RECEITA", name: "REGRA 01 — KM ZERO COM RECEITA", desc: "Existe receita registrada com km total menor ou igual a zero. Não é possível gerar receita sem deslocamento." },
    { code: "KM_RETROCEDEU", name: "REGRA 02 — KM RETROCEDEU", desc: "O km inicial do turno atual é menor que o km final do turno anterior. Odômetro não pode andar para trás." },
    { code: "KM_SALTO_ABSURDO", name: "REGRA 03 — SALTO DE KM ABSURDO ENTRE TURNOS", desc: "Diferença excessiva de km entre turnos consecutivos (> 250 km). Indica uso fora do sistema ou erro grave." },
    { code: "RECEITA_KM_MUITO_BAIXA", name: "REGRA 04 — RECEITA/KM MUITO BAIXA", desc: "Receita por km abaixo do mínimo aceitável (R$ 3,00/km). Indica corridas subdeclaradas." },
    { code: "RECEITA_KM_MUITO_ALTA", name: "REGRA 05 — RECEITA/KM MUITO ALTA", desc: "Receita por km acima do máximo aceitável (R$ 20,00/km). Pode indicar manipulação de valores." },
    { code: "RECEITA_KM_DESVIO_CRITICO", name: "REGRA 06 — DESVIO CRÍTICO DA MÉDIA DO MOTORISTA", desc: "Receita por km muito acima da média histórica do motorista (≥ 4x). Comportamento fora do padrão individual." },
    { code: "TURNO_CURTO_DEMAIS", name: "REGRA 07 — TURNO CURTO DEMAIS", desc: "Turno com duração extremamente curta (< 10 min) mas com corridas. Corridas exigem tempo mínimo." },
    { code: "TURNO_LONGO_DEMAIS", name: "REGRA 08 — TURNO LONGO DEMAIS", desc: "Turno com duração excessiva (> 14h). Possível esquecimento ou uso indevido." },
    { code: "RECEITA_HORA_MUITO_ALTA", name: "REGRA 09 — RECEITA POR HORA MUITO ALTA", desc: "Receita por hora acima do limite aceitável (R$ 150,00/h). Manipulação ou concentração artificial." },
    { code: "POUCAS_CORRIDAS_HORA", name: "REGRA 10 — POUCAS CORRIDAS POR HORA", desc: "Baixa produtividade (< 0,3 corridas/h) em turno com corridas. Uso improdutivo." },
    { code: "SEQUENCIA_VALORES_IGUAIS", name: "REGRA 11 — VALORES DE CORRIDAS REPETIDOS", desc: "Múltiplas corridas com exatamente o mesmo valor. Foge do comportamento natural." },
    { code: "SEQUENCIA_CONSECUTIVA", name: "REGRA 12 — SEQUÊNCIA CONSECUTIVA DE VALORES", desc: "Corridas consecutivas com valores idênticos. Indica possível automação ou fraude manual." }
];

// Helper to determine severity level for primary rule sort
const getSeverityWeight = (s?: string) => {
    switch (s?.toLowerCase()) {
        case 'critical': return 4;
        case 'high': return 3;
        case 'medium': return 2;
        default: return 1;
    }
};

export async function generateEventPdf(event: typeof fraudEvents.$inferSelect, shift: ShiftData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers: Buffer[] = [];

        doc.on("data", (chunk) => buffers.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(buffers)));
        doc.on("error", (err) => reject(err));

        const fmtDate = (d: Date | string | null) => d ? new Date(d).toLocaleString('pt-BR') : "N/A";
        const fmtBRL = (v: number) => `R$ ${v.toFixed(2)}`;

        // --- 10.1 Cabeçalho / Identificação Geral ---
        doc.font('Helvetica-Bold').fontSize(18).text("Relatório de Análise Antifraude", { align: "center" });
        doc.fontSize(12).font('Helvetica').text("Rota Verde — Módulo Antifraude", { align: "center" });
        doc.moveDown();

        doc.fontSize(10);
        doc.text(`Event ID: ${event.id}`, { align: "right" });
        doc.text(`Shift ID: ${shift.id}`, { align: "right" });
        doc.text(`Data da Detecção: ${fmtDate(event.detectedAt)}`, { align: "right" });
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: "right" });
        doc.moveDown();
        doc.lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // --- 10.2 Resumo Executivo de Risco ---
        doc.font('Helvetica-Bold').fontSize(14).text("Resumo Executivo de Risco");
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');

        doc.text(`Risk Score: `, { continued: true }).font('Helvetica-Bold').text(`${event.riskScore}`);
        doc.font('Helvetica').text(`Risk Level: `, { continued: true }).font('Helvetica-Bold').text(`${(event.riskLevel || 'low').toUpperCase()}`);
        doc.font('Helvetica').text(`Status Atual: `, { continued: true }).font('Helvetica-Bold').text(`${(event.status || 'pendente').toUpperCase()}`);
        doc.moveDown();

        doc.font('Helvetica-Oblique').fontSize(10).text(
            "Este evento foi identificado automaticamente pelo sistema antifraude do Rota Verde devido à detecção de comportamentos operacionais anômalos, com base em regras determinísticas e critérios objetivos previamente definidos.",
            { align: 'justify' }
        );
        doc.moveDown(0.5);

        // Disclaimer Jurídico (CRÍTICO)
        doc.font('Helvetica-Bold').fillColor('#b91c1c').text(
            "⚠️  A detecção de anomalia NÃO implica confirmação de fraude. O alerta indica exclusivamente a necessidade de análise humana.",
            { align: 'justify' }
        );
        doc.fillColor('black');
        doc.moveDown();

        // --- DEFINIÇÃO DE TURNO NORMAL (CRÍTICO) ---
        doc.font('Helvetica-Bold').fontSize(12).text("Critérios de Normalidade Operacional");
        doc.moveDown(0.5);
        doc.font('Helvetica').fontSize(10).text(
            "Um turno é considerado operacionalmente normal quando apresenta evolução contínua de quilometragem, duração compatível (10min a 14h), distribuição variada de corridas e indicadores financeiros dentro das faixas esperadas (Receita/KM entre R$ 3,00 e R$ 20,00).",
            { align: 'justify' }
        );
        doc.moveDown();

        // --- 10.3 Identificação Operacional ---
        doc.font('Helvetica-Bold').fontSize(14).text("Identificação Operacional");
        doc.fontSize(12).font('Helvetica');
        doc.text(`Identificador do Motorista: ${shift.driverId}`);
        doc.text(`Identificador do Veículo: ${shift.vehicleId}`);
        doc.moveDown();

        // --- 10.4 Dados do Turno Analisado ---
        doc.font('Helvetica-Bold').fontSize(14).text("Dados do Turno Analisado");
        doc.fontSize(10).font('Helvetica');

        const kmTotal = shift.kmFinal - shift.kmInicial;
        const durationHours = shift.duracaoMin > 0 ? shift.duracaoMin / 60 : 0;
        const recPerKm = kmTotal > 0 ? shift.totalBruto / kmTotal : 0;
        const recPerHour = durationHours > 0 ? shift.totalBruto / durationHours : 0;

        const col1X = 50; const col2X = 300;
        let y = doc.y;

        doc.text(`Início: ${fmtDate(shift.inicio)}`, col1X, y);
        doc.text(`Fim: ${shift.fim ? fmtDate(shift.fim) : "Em andamento"}`, col2X, y); y += 15;
        doc.text(`KM Inicial: ${shift.kmInicial}`, col1X, y);
        doc.text(`KM Final: ${shift.kmFinal}`, col2X, y); y += 15;
        doc.text(`KM Total: ${kmTotal} km`, col1X, y);
        doc.text(`Duração Total: ${durationHours.toFixed(2)}h`, col2X, y); y += 15;
        doc.text(`Receita Total: ${fmtBRL(shift.totalBruto)}`, col1X, y);
        doc.text(`Corridas: ${shift.totalCorridas}`, col2X, y); y += 15;
        doc.text(`Receita por KM: ${fmtBRL(recPerKm)}/km`, col1X, y);
        doc.text(`Receita por Hora: ${fmtBRL(recPerHour)}/h`, col2X, y); y += 25;

        // Warning if Duration is 0 (PARCIALMENTE CORRETO FIX)
        if (durationHours <= 0.01) {
            doc.y = y;
            doc.font('Helvetica-Oblique').fontSize(9).fillColor('#ca8a04').text(
                "⚠️ A duração do turno foi calculada como zero ou inválida. Valores derivados por hora podem não ser representativos neste caso.",
                { align: 'left' }
            );
            doc.fillColor('black');
            doc.moveDown();
        } else {
            doc.y = y;
        }

        // --- 11. ANÁLISE DE DETECÇÃO ---
        doc.font('Helvetica-Bold').fontSize(14).text("Análise de Detecção");
        doc.moveDown(0.5);

        // Sort rules to find Primary Rule
        const reasons = (event.rules as any[]) || (event.metadata as any)?.reasons || [];
        const sortedRules = [...reasons].sort((a, b) => {
            const wA = getSeverityWeight(a.severity);
            const wB = getSeverityWeight(b.severity);
            if (wA !== wB) return wB - wA; // Higher severity first
            return (b.score || 0) - (a.score || 0); // Higher score first
        });

        if (sortedRules.length > 0) {
            // 11.1 Regra Principal
            const primary = sortedRules[0];
            const ruleDef = OFFICIAL_RULES_LIST.find(r => r.code === primary.code) || { name: primary.label || primary.code, desc: primary.description };

            doc.rect(50, doc.y, 500, 100).fill('#f3f4f6'); // Light grey background box (taller for breakdown)
            doc.fillColor('black');
            doc.y += 10;

            doc.fontSize(12).font('Helvetica-Bold').text(`Regra Principal: ${ruleDef.name}`, { indent: 10 });
            doc.fontSize(10).font('Helvetica').text(`Severidade: ${primary.severity?.toUpperCase()}`, { indent: 10 });
            doc.moveDown(0.5);
            doc.font('Helvetica-Oblique').text(
                "A regra acima foi aplicada porque o valor observado neste turno ultrapassou os limites operacionais definidos pelo sistema.",
                { indent: 10, align: 'justify', width: 480 }
            );

            // Explicit Structured Data (PARCIALMENTE CORRETO FIX)
            doc.moveDown(0.5);
            doc.font('Helvetica-Bold').text("Detalhe Técnico da Anomalia:", { indent: 10 });
            doc.font('Helvetica');

            const d = primary.data || {};
            let details = "";
            let expected = "";
            let observed = "";
            let diff = "";

            // Construct structured lines
            switch (primary.code) {
                case "KM_ZERO_COM_RECEITA":
                    expected = "KM Total > 0";
                    observed = `KM Total = ${d.kmTotal}`;
                    diff = "Inconsistência Física";
                    break;
                case "RECEITA_KM_MUITO_BAIXA":
                    expected = `Mínimo R$ ${d.minThreshold?.toFixed(2)}/km`;
                    observed = `Atual R$ ${d.revPerKm?.toFixed(2)}/km`;
                    diff = `-${(100 - (d.revPerKm / d.minThreshold) * 100).toFixed(0)}% abaixo do mínimo`;
                    break;
                case "RECEITA_KM_MUITO_ALTA":
                    expected = `Máximo R$ ${d.maxThreshold?.toFixed(2)}/km`;
                    observed = `Atual R$ ${d.revPerKm?.toFixed(2)}/km`;
                    diff = `${(d.revPerKm / d.maxThreshold).toFixed(1)}x acima do máximo`;
                    break;
                case "RECEITA_KM_DESVIO_CRITICO":
                    expected = `Ref. Média R$ ${d.baseline?.toFixed(2)}/km`;
                    observed = `Atual R$ ${d.revPerKm?.toFixed(2)}/km`;
                    diff = `${d.actualMultiplier?.toFixed(1)}x da média histórica`;
                    break;
                case "RECEITA_HORA_MUITO_ALTA":
                    expected = `Máximo R$ ${d.maxThreshold?.toFixed(2)}/h`;
                    observed = `Atual R$ ${d.revPerHour?.toFixed(2)}/h`;
                    break;
                case "TURNO_CURTO_DEMAIS":
                    expected = `Mínimo ${(d.minThresholdHours * 60).toFixed(0)} min`;
                    observed = `Atual ${(d.durationHours * 60).toFixed(0)} min`;
                    break;
                case "TURNO_LONGO_DEMAIS":
                    expected = `Máximo ${d.maxThresholdHours}h`;
                    observed = `Atual ${d.durationHours?.toFixed(1)}h`;
                    break;
                default:
                    details = primary.description; // Fallback
            }

            if (expected) {
                doc.text(`• Esperado: ${expected}`, { indent: 20 });
                doc.text(`• Observado: ${observed}`, { indent: 20 });
                if (diff) doc.font('Helvetica-Bold').text(`• Desvio: ${diff}`, { indent: 20 });
            } else {
                doc.text(`• ${details}`, { indent: 20 });
            }

            doc.y += 10; // Padding bottom box
            doc.moveDown();

            // 11.2 Regras Secundárias
            if (sortedRules.length > 1) {
                doc.font('Helvetica-Bold').fontSize(12).text("Regras Secundárias Disparadas");
                doc.moveDown(0.5);
                sortedRules.slice(1).forEach(rule => {
                    const rDef = OFFICIAL_RULES_LIST.find(r => r.code === rule.code);
                    doc.font('Helvetica-Bold').fontSize(10).text(`• ${rDef?.name || rule.label || rule.code} (${rule.severity?.toUpperCase()})`);
                    doc.font('Helvetica').text(`  ${rule.description}`);
                    doc.moveDown(0.5);
                });
            }
        } else {
            doc.text("Nenhuma regra específica registrada (Alerta Manual ou Externo).");
        }
        doc.moveDown();

        // 11.3 Baseline Histórico
        doc.font('Helvetica-Bold').fontSize(14).text("Baseline (Histórico do Motorista)");
        doc.moveDown(0.5);

        const bl = (event.metadata as any)?.baseline;
        if (bl && bl.sampleSize > 5) {
            doc.fontSize(10).font('Helvetica').text(
                "O sistema utiliza como referência o histórico do próprio motorista, considerando apenas turnos válidos anteriores. O turno analisado apresentou desvios em relação à média histórica, reforçando o alerta gerado."
            );
            doc.moveDown();

            doc.text(`Amostra: ${bl.sampleSize} turnos (últimos 30 dias)`);
            doc.moveDown(0.5);

            // Table
            const tY = doc.y;
            const rowH = 20;

            // Header
            doc.font('Helvetica-Bold');
            doc.text("Indicador", 50, tY);
            doc.text("Média Histórica", 200, tY);
            doc.text("Turno Analisado", 350, tY);

            // Rows
            const drawRow = (label: string, hist: number, current: number, yPos: number, formatMoney = false) => {
                const fmt = (v: number) => formatMoney ? fmtBRL(v) : v.toFixed(2);
                doc.font('Helvetica');
                doc.text(label, 50, yPos);
                doc.text(fmt(hist), 200, yPos);
                doc.text(fmt(current), 350, yPos);
            };

            drawRow("Receita por KM", bl.avgRevenuePerKm, recPerKm, tY + rowH, true);
            drawRow("Receita por Hora", bl.avgRevenuePerHour, recPerHour, tY + rowH * 2, true);
            drawRow("Corridas por Hora", bl.avgRidesPerHour, durationHours > 0 ? shift.totalCorridas / durationHours : 0, tY + rowH * 3);
            drawRow("Ticket Médio", bl.avgTicket, shift.totalCorridas > 0 ? shift.totalBruto / shift.totalCorridas : 0, tY + rowH * 4, true);

            doc.y = tY + rowH * 5 + 10;

        } else {
            doc.font('Helvetica-Oblique').fontSize(10).text("Não há histórico suficiente para cálculo de baseline individual neste caso.");
            doc.moveDown();
        }

        doc.addPage(); // Force new page for Rules Annex and Decision if needed, or just flow? 
        // Doc structure says Annex then Decision? Let's follow section numbers.

        // --- 12. REGRAS GERAIS DO SISTEMA (ANEXO) ---
        doc.font('Helvetica-Bold').fontSize(14).text("12. Regras Gerais do Sistema (Anexo Explicativo)");
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(
            "O sistema antifraude do Rota Verde utiliza um conjunto fixo de regras determinísticas para identificar comportamentos atípicos. Abaixo estão descritas todas as regras ativas no sistema, independentemente de terem sido aplicadas neste evento específico.",
            { align: 'justify' }
        );
        doc.moveDown();

        OFFICIAL_RULES_LIST.forEach(rule => {
            doc.font('Helvetica-Bold').fontSize(9).text(rule.name);
            doc.font('Helvetica').text(rule.desc, { indent: 10 });
            doc.moveDown(0.5);
        });
        doc.moveDown();

        // --- 13. DECISÃO HUMANA ---
        doc.font('Helvetica-Bold').fontSize(14).text("13. Decisão Humana");
        doc.moveDown(0.5);

        const decisionMeta = (event.metadata as any) || {};
        const comment = decisionMeta.comment;
        const decisionDate = decisionMeta.lastDecisionAt || event.reviewedAt;
        const reviewer = decisionMeta.reviewerName || "N/A";

        doc.fontSize(11).font('Helvetica');
        doc.text(`Status Final: ${(event.status || 'PENDENTE').toUpperCase()}`);

        if (event.status && event.status !== 'pendente') {
            doc.moveDown(0.5);
            doc.font('Helvetica-Oblique').text(
                "A decisão final sobre este evento foi tomada por um analista humano, com base nas evidências apresentadas neste relatório e nos critérios objetivos definidos pelo sistema antifraude.",
                { align: 'justify' }
            );
            doc.moveDown();
            doc.font('Helvetica').text(`Comentário do Analista: ${comment || "(Sem comentário registrado)"}`);
            doc.text(`Responsável: ${reviewer}`);
            doc.text(`Data da Decisão: ${fmtDate(decisionDate)}`);
        } else {
            doc.text("Nenhuma decisão registrada até o momento.");
        }

        doc.end();
    });
}
