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
    // New Fields for Breakdown
    ridesAppCount?: number;
    ridesParticularCount?: number;
    revenueApp?: number;
    revenueParticular?: number;
    ridesUnknownCount?: number;
    revenueUnknown?: number;
    // Identity Details
    driverName?: string;
    vehiclePlate?: string;
    vehicleModel?: string;
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
        const ticketMedio = shift.totalCorridas > 0 ? shift.totalBruto / shift.totalCorridas : 0;
        const runsPerHour = durationHours > 0 ? shift.totalCorridas / durationHours : 0;

        doc.text(`Receita Total: ${fmtBRL(shift.totalBruto)}`, col1X, y);
        doc.text(`Corridas: ${shift.totalCorridas}`, col2X, y); y += 15;
        // Standard 10 & 11
        doc.text(`Ticket Médio: ${fmtBRL(ticketMedio)}`, col1X, y);
        doc.text(`Produtividade: ${runsPerHour.toFixed(1)} corr/h`, col2X, y); y += 15;

        doc.text(`Receita por KM: ${fmtBRL(recPerKm)}/km`, col1X, y);
        doc.text(`Receita por Hora: ${fmtBRL(recPerHour)}/h`, col2X, y); y += 25;

        // --- App vs Particular Breakdown (MANDATORY) ---
        const revApp = shift.revenueApp || 0;
        const revPart = shift.revenueParticular || 0;
        const revUnknown = shift.revenueUnknown || 0; // Added
        const countApp = shift.ridesAppCount || 0;
        const countPart = shift.ridesParticularCount || 0;
        const countUnknown = shift.ridesUnknownCount || 0; // Added
        const hasParticular = revPart > 0;

        // Calc Specific Indicators
        const recPerKmApp = kmTotal > 0 ? revApp / kmTotal : 0;
        const recPerHourApp = durationHours > 0 ? revApp / durationHours : 0;
        const partShare = shift.totalBruto > 0 ? (revPart / shift.totalBruto) * 100 : 0;

        doc.rect(50, y, 500, 75).fill('#f8fafc').stroke('#e2e8f0');
        doc.fillColor('black');
        let by = y + 10;

        doc.font('Helvetica-Bold').fontSize(10).text("Distribuição por Tipo de Corrida", 60, by);
        by += 15;

        doc.font('Helvetica').fontSize(9);
        doc.text(`App: ${countApp} corridas (${fmtBRL(revApp)})`, 60, by);
        doc.text(`Particular: ${countPart} corridas (${fmtBRL(revPart)})`, 250, by);

        if (countUnknown > 0 || revUnknown > 0) {
            doc.text(`Unknown: ${countUnknown} (${fmtBRL(revUnknown)})`, 420, by);
        }

        by += 15;

        if (hasParticular) {
            let shareClass = "Predominantemente App";
            if (partShare > 60) shareClass = "Predominantemente Particular";
            else if (partShare >= 30) shareClass = "Misto";

            doc.text(`Receita/KM (Só App)*: ${fmtBRL(recPerKmApp)}/km`, 60, by);
            doc.text(`Receita/Hora (Só App): ${fmtBRL(recPerHourApp)}/h`, 250, by);
            doc.text(`Share Particular: ${partShare.toFixed(1)}% (${shareClass})`, 400, by);

            by += 15;
            doc.font('Helvetica-Oblique').fontSize(8);
            doc.text(
                "* Receita/KM (Só App) utiliza KM total do turno por ausência de segregação física de deslocamento.",
                60, by, { width: 480, align: 'justify' }
            );
            by += 10;
            doc.text(
                "“Quando uma parcela relevante da receita do turno é proveniente de corridas particulares, métricas globais como receita por quilômetro e por hora podem apresentar valores inferiores ao padrão de aplicativo, sem caracterizar fraude.”",
                60, by, { width: 480, align: 'justify' }
            );
        } else {
            doc.text("100% Receita de Aplicativo (Predominantemente App)", 60, by);
        }


        y += 85; // Spacing after box
        doc.y = y;

        // --- Explicação dos Indicadores do Turno (NOVA SEÇÃO) ---
        doc.font('Helvetica-Bold').fontSize(14).text("Explicação dos Indicadores do Turno");
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(
            "Os indicadores abaixo representam métricas operacionais utilizadas pelo sistema antifraude para avaliar a coerência do turno. Cada métrica possui faixas consideradas normais. Desvios relevantes podem gerar alertas, porém anomalia não implica confirmação de fraude.",
            { align: 'justify' }
        );
        doc.moveDown();

        const itemTitle = (t: string) => doc.font('Helvetica-Bold').text(t);
        const itemDesc = (l: string, t: string) => {
            doc.font('Helvetica-Bold').text(l + ": ", { continued: true });
            doc.font('Helvetica').text(t);
        };

        // 1. KM Total
        itemTitle("1. KM Total");
        itemDesc("O que é", "distância percorrida no turno (KM Final − KM Inicial).");
        itemDesc("Por que importa", "é a base para validar coerência física do deslocamento.");
        itemDesc("Como interpretar", "KM muito baixo com receita alta ou KM muito alto com poucas corridas pode indicar inconsistência.");
        doc.moveDown(0.5);

        // 2. Duração Total
        itemTitle("2. Duração Total");
        itemDesc("O que é", "tempo total do turno (fim − início) ou duracaoMin/60 quando disponível.");
        itemDesc("Por que importa", "é base para métricas “por hora”.");
        itemDesc("Como interpretar", "turnos longos demais podem indicar esquecimento de encerramento ou uso indevido.");
        doc.moveDown(0.5);

        // 3. Receita Total
        itemTitle("3. Receita Total");
        itemDesc("O que é", "soma do faturamento do turno.");
        itemDesc("Por que importa", "base para receita por KM, por Hora e ticket médio.");
        doc.moveDown(0.5);

        // 4. Receita por KM
        itemTitle("4. Receita por KM");
        itemDesc("O que é", "Receita Total ÷ KM Total.");
        itemDesc("Faixa esperada do sistema", "mínimo R$ 3,00/km e máximo R$ 20,00/km.");
        itemDesc("Como interpretar", "abaixo do mínimo pode indicar corridas não registradas; acima do máximo pode indicar manipulação.");
        doc.font('Helvetica-Bold').text(`Atual: ${fmtBRL(recPerKm)}/km`, { indent: 10 });
        doc.moveDown(0.5);

        // 5. Receita por Hora
        itemTitle("5. Receita por Hora");
        itemDesc("O que é", "Receita Total ÷ Duração Total (em horas).");
        itemDesc("Faixa esperada do sistema", "máximo R$ 150,00/h.");
        itemDesc("Como interpretar", "valores altos demais podem indicar concentração artificial de receita.");
        doc.font('Helvetica-Bold').text(`Atual: ${fmtBRL(recPerHour)}/h`, { indent: 10 });
        doc.moveDown(0.5);

        // 6. Corridas
        itemTitle("6. Corridas (Total de Corridas)");
        itemDesc("O que é", "quantidade de corridas registradas no turno.");
        itemDesc("Por que importa", "ajuda a validar coerência entre receita e atividade.");
        doc.moveDown(0.5);

        // 7. Corridas por Hora
        itemTitle("7. Corridas por Hora (se aplicável)");
        itemDesc("O que é", "total de corridas ÷ duração total.");
        itemDesc("Como interpretar", "produtividade baixa pode indicar inconsistência operacional.");
        doc.moveDown();

        // Warning if Duration is 0 (MANDATORY CHECK)
        if (durationHours <= 0.01) {
            doc.rect(50, doc.y, 500, 35).fill('#fffbeb').stroke('#f59e0b');
            doc.fillColor('#92400e'); // Darker amber for text
            doc.y += 10;
            doc.font('Helvetica-Bold').text(
                "⚠️ Atenção: a duração do turno foi calculada como zero ou inválida neste registro. Por este motivo, métricas derivadas do tempo (Receita por Hora e Corridas por Hora) podem não ser representativas e são apresentadas apenas para auditoria.",
                { align: 'center', width: 480, indent: 10 }
            );
            doc.fillColor('black');
            doc.y += 10;
            doc.moveDown();
        } else {
            // doc.y = y; // Remove sync Y from previous code as we are inserting content
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

            // Construct structured lines - MANDATORY MAPPING
            switch (primary.code) {
                case "RECEITA_KM_MUITO_BAIXA":
                    expected = "Receita por KM ≥ R$ 3,00/km";
                    observed = `R$ ${recPerKm.toFixed(2)}/km`;
                    diff = `${(100 - (recPerKm / 3.00) * 100).toFixed(0)}% abaixo`;
                    break;
                case "RECEITA_KM_MUITO_ALTA":
                    expected = "Receita por KM ≤ R$ 20,00/km";
                    observed = `R$ ${recPerKm.toFixed(2)}/km`;
                    diff = `${((recPerKm / 20.00 - 1) * 100).toFixed(0)}% acima`;
                    break;
                case "TURNO_LONGO_DEMAIS":
                    expected = "Duração ≤ 14h";
                    observed = `${durationHours.toFixed(1)}h`;
                    diff = `${(durationHours - 14).toFixed(1)}h acima`;
                    break;
                case "RECEITA_HORA_MUITO_ALTA":
                    expected = "Receita por Hora ≤ R$ 150,00/h";
                    observed = `R$ ${recPerHour.toFixed(2)}/h`;
                    diff = `${((recPerHour / 150.00 - 1) * 100).toFixed(0)}% acima`;
                    break;
                case "KM_ZERO_COM_RECEITA":
                    expected = "KM Total > 0 quando há receita";
                    observed = `KM Total = ${kmTotal} com Receita = ${fmtBRL(shift.totalBruto)}`;
                    diff = "Inconsistência física (receita com km zero)";
                    break;
                case "KM_RETROCEDEU":
                    expected = "KM Inicial ≥ KM Final do turno anterior";
                    const gap = (primary.data as any)?.gap || 0;
                    const prevKm = (primary.data as any)?.prevShiftKmEnd || "N/A";
                    observed = `KM Inicial = ${shift.kmInicial} e KM Anterior Final = ${prevKm}`;
                    diff = `${gap} km (retrocesso)`;
                    break;
                default:
                    expected = "Ver regra no Anexo";
                    observed = "Dados do turno (vide tabela acima)";
                    details = primary.description;
            }

            if (expected) doc.text(`• Esperado: ${expected}`, { indent: 20 });
            if (observed) doc.text(`• Observado: ${observed}`, { indent: 20 });
            if (diff) doc.font('Helvetica-Bold').text(`• Desvio: ${diff}`, { indent: 20 });
            if (details && !expected.startsWith("Ver")) doc.font('Helvetica').text(`• Detalhe: ${details}`, { indent: 20 });

            doc.y += 10; // Padding bottom box
            doc.moveDown();

            // 11.2 Regras Secundárias
            if (sortedRules.length > 1) {
                doc.font('Helvetica-Bold').fontSize(12).text("Regras Secundárias Disparadas");
                doc.moveDown(0.5);
                sortedRules.slice(1).forEach(rule => {
                    const rDef = OFFICIAL_RULES_LIST.find(r => r.code === rule.code);
                    doc.font('Helvetica-Bold').fontSize(10).text(`• ${rDef?.name || rule.label || rule.code} (${rule.severity?.toUpperCase()})`);
                    doc.font('Helvetica').text(`  ${rule.description} Esta regra existe para identificar comportamentos que, em operação normal, indicam inconsistência operacional ou financeira e demandam revisão humana.`);
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
            doc.moveDown(0.5);
            doc.text("A tabela abaixo compara a média histórica do motorista com os indicadores do turno analisado. Desvios relevantes reforçam a necessidade de revisão, mas não confirmam fraude automaticamente.");
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

        // Check which rules were fired for audit
        const firedCodes = new Set((reasons as any[]).map(r => r.code));

        OFFICIAL_RULES_LIST.forEach(rule => {
            doc.font('Helvetica-Bold').fontSize(9).text(rule.name);
            doc.font('Helvetica').text(rule.desc, { indent: 10 });

            const triggered = firedCodes.has(rule.code);
            doc.font(triggered ? 'Helvetica-Bold' : 'Helvetica').fillColor(triggered ? '#b91c1c' : '#374151')
                .text(`Disparou neste evento: ${triggered ? "SIM" : "NÃO"}`, { indent: 10 });
            doc.fillColor('black');

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

        // Classification Verdict
        let verdict = "Operacional Normal";
        const score = event.riskScore || 0;

        if (score >= 70) verdict = "Anomalia Crítica";
        else if (score >= 40) verdict = "Anomalia Relevante";
        else if (score >= 20) verdict = "Ineficiência Operacional";

        doc.moveDown(2);
        doc.font('Helvetica-Bold').fontSize(12).text(`Classificação Operacional do Turno: ${verdict}`, { align: 'center' });
        doc.fontSize(8).font('Helvetica').text("(Baseado exclusivamente no Risk Score calculado pelo sistema)", { align: 'center' });

        doc.end();
    });
}
