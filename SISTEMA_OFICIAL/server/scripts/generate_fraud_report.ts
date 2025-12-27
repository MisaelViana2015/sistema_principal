
import { db } from "../core/db/connection.js";
import { shifts } from "../../shared/schema.js";
import { FraudService } from "../modules/fraud/fraud.service.js";
import { desc, ne } from "drizzle-orm";
import fs from 'fs';
import path from 'path';

async function generateReport() {
    console.log("🔍 Iniciando auditoria de fraude em todos os turnos...");

    // Buscar turnos finalizados
    const allShifts = await db.query.shifts.findMany({
        where: ne(shifts.status, 'em_andamento'),
        orderBy: [desc(shifts.fim)],
        limit: 100 // Limite para não sobrecarregar
    });

    console.log(`📋 Analisando ${allShifts.length} turnos recentes...`);

    let reportContent = "# 🕵️ Relatório de Auditoria de Fraude e Anomalias\n\n";
    reportContent += `**Data da Geração:** ${new Date().toLocaleString('pt-BR')}\n`;
    reportContent += `**Turnos Analisados:** ${allShifts.length}\n\n`;

    reportContent += "| ID Turno | Motorista | Data | Score | Nível | Alertas Detectados |\n";
    reportContent += "|---|---|---|---|---|---|\n";

    let suspiciousCount = 0;

    for (const shift of allShifts) {
        try {
            // Executa a engine de fraude
            const analysis = await FraudService.analyzeShift(shift.id);

            if (analysis && analysis.score.totalScore > 0) {
                suspiciousCount++;
                const reasons = analysis.score.reasons.map((r: any) => `**${r.label}**: ${r.description}`).join('<br>');
                const driverName = (shift as any).driver?.nome || 'Desc.';
                const date = shift.inicio ? new Date(shift.inicio).toLocaleDateString('pt-BR') : '-';

                // Formata a linha da tabela
                reportContent += `| ${shift.id.substring(0, 8)} | ${(shift as any).driverId} | ${date} | **${analysis.score.totalScore}** | ${analysis.score.level} | ${reasons} |\n`;
            }
        } catch (error) {
            console.error(`Erro ao analisar turno ${shift.id}:`, error);
        }
    }

    reportContent += `\n\n**Total de Turnos Suspeitos Encontrados:** ${suspiciousCount}`;

    // Adicionar Explicação das Regras
    reportContent += "\n\n## 📏 Regras Validadas pelo Sistema\n\n";
    reportContent += "O sistema verifica automaticamente os seguintes padrões em cada turno:\n";
    reportContent += "1. **Inconsistência de KM:** Se o KM Final for menor que o Inicial.\n";
    reportContent += "2. **Duração Excessiva:** Turnos com mais de 16 horas.\n";
    reportContent += "3. **Ganho Desproporcional:** Receita muito alta para pouca quilometragem (indício de 'corridas fantasmas').\n";
    reportContent += "4. **Velocidade Média:** Se a média de KM/h for humanamente impossível.\n";
    reportContent += "5. **Corridas Excessivas:** Quantidade de corridas incompatível com o tempo trabalhado.\n";

    // Salvar arquivo
    const outputPath = String.raw`C:\Users\Misael\.gemini\antigravity\brain\c42e1917-fd24-4d26-9592-ef6161770392\relatorio_auditoria_fraude.md`;

    // Create directory if not exists (safety check)
    // fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    fs.writeFileSync(outputPath, reportContent);
    console.log(`✅ Relatório gerado com sucesso em: ${outputPath}`);
    process.exit(0);
}

generateReport();
