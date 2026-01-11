import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Smartphone, User, Car } from 'lucide-react';

interface FraudAuditReportProps {
    event: any;
    shift: any;
}

// --- Types from Backend (Mirrored) ---
interface TimeSlot {
    name: string;
    corridas: number;
    receita: number;
    corridasPorHora: number;
}
interface GapAnalysis {
    maxGapMinutos: number;
    gapEmHorarioDePico: boolean;
    status: 'NORMAL' | 'ANÔMALO';
}
interface AuditMetrics {
    timeSlots: TimeSlot[];
    gapAnalysis: GapAnalysis;
    baselineComparison: any[];
    ritmoScore: number;
    classificacaoRitmo: string;
    scoreContextual: number;
    classificacaoTurno: 'BOM' | 'RUIM';
}

// Hardcoded Official Rules List (Mirroring Backend - ALL RULES INCLUDING V2)
const OFFICIAL_RULES_LIST = [
    // === REGRAS LEGADO (01-10) ===
    { code: "KM_ZERO_COM_RECEITA", name: "REGRA 01 — KM ZERO COM RECEITA", desc: "Existe receita registrada com km total menor ou igual a zero. Não é possível gerar receita sem deslocamento." },
    { code: "RECEITA_KM_MUITO_BAIXA", name: "REGRA 02 — BAIXA RECEITA POR KM", desc: "Receita por km abaixo do piso operacional (R$ 2,00/km). Indica ineficiência ou subdeclaração." },
    { code: "RECEITA_KM_MUITO_ALTA", name: "REGRA 03 — ALTA RECEITA POR KM", desc: "Receita por km acima do pico real (R$ 3,10/km). Indica possível inconsistência de km." },
    { code: "RECEITA_HORA_MUITO_BAIXA", name: "REGRA 04 — BAIXA RECEITA POR HORA", desc: "Receita por hora abaixo de R$ 20,00/h. Turno com produtividade suspeita." },
    { code: "RECEITA_HORA_MUITO_ALTA", name: "REGRA 05 — ALTA RECEITA POR HORA", desc: "Receita por hora acima de R$ 70,00/h. Pode indicar erro de duração." },
    { code: "TURNO_CURTO_DEMAIS", name: "REGRA 06 — TURNO MUITO CURTO", desc: "Duração inferior a 10 minutos. Turno técnico irrelevante para análise padrão." },
    { code: "TURNO_LONGO_DEMAIS", name: "REGRA 07 — TURNO MUITO LONGO", desc: "Duração superior a 16 horas. Comportamento fora do padrão típico." },
    { code: "RECEITA_KM_DESVIO_ALTO", name: "REGRA 08 — DESVIO DE BASELINE ALTO", desc: "Receita/KM variou +/- 50% em relação à média pessoal." },
    { code: "RECEITA_KM_DESVIO_CRITICO", name: "REGRA 09 — DESVIO DE BASELINE CRÍTICO", desc: "Receita/KM variou +/- 50% (1.5x) em relação à média pessoal." },
    { code: "KM_SALTO_ABSURDO", name: "REGRA 10 — GAP DE KM ANÔMALO", desc: "Diferença entre turnos maior que 250 km. Indica uso não registrado." },
    { code: "KM_RETROCEDEU", name: "REGRA 11 — KM RETROCEDEU", desc: "O km inicial do turno atual é menor que o km final do turno anterior." },

    // === REGRAS 12-14 - COMPARAÇÃO EM TEMPO REAL (CohortAgent) ===
    { code: "DRIVER_IDLE_FLEET_ACTIVE", name: "REGRA 12 — MOTORISTA PARADO COM FROTA ATIVA", desc: "Demanda alta na cidade porém motorista não registrou corridas nos últimos 15 minutos. Indica possível ocultação de corridas ou parada não justificada." },
    { code: "NO_RIDE_15_PLUS_HIGH_DEMAND", name: "REGRA 13 — SEM CORRIDAS ≥R$15 EM DEMANDA ALTA", desc: "Frota com mediana de valor acima de R$15, mas motorista só tem corridas abaixo desse valor. Indica possível seleção de corridas ou divisão." },
    { code: "OUTLIER_VS_FLEET", name: "REGRA 14 — PRODUTIVIDADE ABAIXO DA FROTA", desc: "Motorista está produzindo menos de 50% da média de corridas/hora da frota ativa no mesmo período." },

    // === REGRAS 15-17 - PADRÕES SUSPEITOS (RealTimeAgent) ===
    { code: "LOW_VALUE_STEADY", name: "REGRA 15 — PADRÃO DE VALORES BAIXOS", desc: "60% ou mais das corridas são ≤ R$12. Padrão típico de divisão de corridas (uma corrida real dividida em várias menores)." },
    { code: "RIDE_INTERVAL_20_30", name: "REGRA 16 — INTERVALO SUSPEITAMENTE REGULAR", desc: "Maioria dos intervalos entre corridas está entre 20-35 minutos. Padrão fabricado típico de corridas inventadas." },
    { code: "VALUE_DISTRIBUTION_SPIKE", name: "REGRA 17 — CONCENTRAÇÃO EM VALOR ÚNICO", desc: "Mais de 50% das corridas têm exatamente o mesmo valor. Indica valores possivelmente inventados." },

    // === REGRAS 18-21 - ANÁLISE COMPORTAMENTAL ===
    { code: "PRODUTIVIDADE_ABAIXO_BASELINE", name: "REGRA 18 — PRODUTIVIDADE VS FROTA", desc: "Motorista produziu 70%+ menos que a média da frota em múltiplas faixas horárias do turno." },
    { code: "TIME_GAP_SEM_JUSTIFICATIVA", name: "REGRA 19 — GAP DE TEMPO SEM CORRIDA", desc: "Período de 1h ou mais sem registrar corridas enquanto turno estava ativo. Requer verificação de câmeras." },
    { code: "DEVIATION_VS_SELF", name: "REGRA 20 — DESVIO DO PRÓPRIO HISTÓRICO", desc: "Produtividade muito diferente da média histórica do próprio motorista nos últimos 30 dias." },
    { code: "VALUE_ASYMMETRY", name: "REGRA 21 — ASSIMETRIA DE VALORES", desc: "Motorista pegando apenas corridas baratas enquanto frota tem acesso às mesmas corridas caras. Indica seleção proposital." },
];

const getSeverityWeight = (s?: string) => {
    switch (s?.toLowerCase()) {
        case 'critical': return 4;
        case 'high': return 3;
        case 'medium': return 2;
        default: return 1;
    }
};

const fmtBRL = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
const fmtDate = (d: string | null) => d ? new Date(d).toLocaleString('pt-BR') : "N/A";

export const FraudAuditReport: React.FC<FraudAuditReportProps> = ({ event, shift }) => {
    const kmTotal = shift.kmFinal - shift.kmInicial;

    // Robust Duration Calculation
    const start = new Date(shift.inicio);
    const end = shift.fim ? new Date(shift.fim) : new Date();
    const calcDurationMin = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60));
    const effectiveDurationMin = (shift.duracaoMin && shift.duracaoMin > 0) ? shift.duracaoMin : calcDurationMin;

    const durationHours = effectiveDurationMin > 0 ? effectiveDurationMin / 60 : 0;
    const recPerKm = kmTotal > 0 ? shift.totalBruto / kmTotal : 0;
    const recPerHour = durationHours > 0 ? shift.totalBruto / durationHours : 0;
    const isDurationInvalid = durationHours <= 0.01;
    const am = shift.auditMetrics as AuditMetrics | undefined;

    const reasons = (event.rules as any[]) || (event.metadata as any)?.reasons || [];
    const sortedRules = [...reasons].sort((a, b) => {
        const wA = getSeverityWeight(a.severity);
        const wB = getSeverityWeight(b.severity);
        if (wA !== wB) return wB - wA;
        return (b.score || 0) - (a.score || 0);
    });

    const primary = sortedRules[0];
    const ruleDef = primary ? (OFFICIAL_RULES_LIST.find(r => r.code === primary.code) || { name: primary.label || primary.code, desc: primary.description }) : null;
    const firedCodes = new Set((reasons as any[]).map(r => r.code));
    const bl = (event.metadata as any)?.baseline;

    // Structured Breakdown Logic
    let expected = "", observed = "", diff = "", details = "";
    if (primary) {
        const d = primary.data || {};
        switch (primary.code) {
            case "RECEITA_KM_MUITO_BAIXA":
                expected = "Receita por KM ≥ R$ 2,00/km";
                observed = `R$ ${recPerKm.toFixed(2)}/km`;
                diff = `${(100 - (recPerKm / 2.00) * 100).toFixed(0)}% abaixo`;
                break;
            case "RECEITA_KM_MUITO_ALTA":
                expected = "Receita por KM ≤ R$ 3,10/km";
                observed = `R$ ${recPerKm.toFixed(2)}/km`;
                diff = `${((recPerKm / 3.10 - 1) * 100).toFixed(0)}% acima`;
                break;
            case "RECEITA_HORA_MUITO_BAIXA":
                expected = "Receita por Hora ≥ R$ 20,00/h";
                observed = `R$ ${recPerHour.toFixed(2)}/h`;
                diff = "Abaixo do piso";
                break;
            case "RECEITA_HORA_MUITO_ALTA":
                expected = "Receita por Hora ≤ R$ 70,00/h";
                observed = `R$ ${recPerHour.toFixed(2)}/h`;
                diff = `${((recPerHour / 70.00 - 1) * 100).toFixed(0)}% acima`;
                break;
            case "TURNO_LONGO_DEMAIS":
                expected = "Duração ≤ 14h";
                observed = `${durationHours.toFixed(1)}h`;
                diff = `${(durationHours - 14).toFixed(1)}h acima`;
                break;
            case "RECEITA_KM_DESVIO_CRITICO":
                expected = `Próximo de R$ ${d.baseline?.toFixed(2)}`;
                observed = `R$ ${recPerKm.toFixed(2)}`;
                diff = `${d.actualMultiplier?.toFixed(1) || d.ratio?.toFixed(1) || "?"}x a média`;
                break;
            case "RECEITA_KM_DESVIO_ALTO":
                expected = `Próximo de R$ ${d.baseline?.toFixed(2)}`;
                observed = `R$ ${recPerKm.toFixed(2)}`;
                diff = `${d.actualMultiplier?.toFixed(1) || d.ratio?.toFixed(1) || "?"}x a média`;
                break;
            case "KM_SALTO_ABSURDO":
                expected = "Gap < 250 km";
                observed = `${d.gap} km`;
                diff = "Gap Excessivo";
                break;
            case "KM_ZERO_COM_RECEITA":
                expected = "KM Total > 0 quando há receita";
                observed = `KM Total = ${kmTotal} com Receita = ${fmtBRL(shift.totalBruto)}`;
                diff = "Inconsistência física (receita com km zero)";
                break;
            case "KM_RETROCEDEU":
                expected = "KM Inicial ≥ KM Final do turno anterior";
                const gap = (d as any)?.gap || 0;
                const prevKm = (d as any)?.prevShiftKmEnd || "N/A";
                observed = `KM Inicial = ${shift.kmInicial} e KM Anterior Final = ${prevKm}`;
                diff = `${gap} km (retrocesso)`;
                break;
            default:
                expected = "Ver regra no Anexo";
                observed = "Dados do turno (vide tabela acima)";
                details = primary.description;
        }
    }

    return (
        <div className="bg-white text-black p-8 font-sans max-w-[210mm] mx-auto print:max-w-none print:shadow-none shadow-lg my-8 print:my-0">
            {/* 10.1 Cabeçalho */}
            <div className="text-center mb-6 border-b pb-4 border-gray-300">
                <h1 className="text-2xl font-bold uppercase tracking-wide">Relatório de Análise Antifraude</h1>
                <p className="text-sm text-gray-500 mt-1">Rota Verde — Módulo Antifraude</p>
            </div>

            <div className="flex justify-between text-xs text-gray-500 mb-6">
                <div className="text-left">
                    <p><strong>Event ID:</strong> {event.id}</p>
                    <p><strong>Shift ID:</strong> {shift.id}</p>
                </div>
                <div className="text-right">
                    <p><strong>Detecção:</strong> {fmtDate(event.detectedAt)}</p>
                    <p><strong>Status:</strong> <span className="uppercase font-bold">{event.status}</span></p>
                </div>
            </div>

            {/* 10.2 Resumo Executivo (APENAS SE HOUVER RISCO) */}
            {event.riskScore > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold border-b border-gray-800 mb-3 pb-1">Resumo Executivo de Risco</h2>
                    <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-3 rounded">
                        <div><span className="text-gray-600 text-sm">Risk Score:</span> <span className="font-bold text-lg block">{event.riskScore}</span></div>
                        <div><span className="text-gray-600 text-sm">Risk Level:</span> <span className={`font-bold text-lg block uppercase ${event.riskLevel === 'critical' ? 'text-red-600' : event.riskLevel === 'high' ? 'text-orange-600' : 'text-yellow-600'}`}>{event.riskLevel}</span></div>
                        <div><span className="text-gray-600 text-sm">Status:</span> <span className="font-bold text-lg block uppercase">{event.status}</span></div>
                    </div>

                    {/* Quadro de Resumo - Regras Disparadas */}
                    {sortedRules.length > 0 && (
                        <div className="border border-gray-300 rounded-lg p-4 mb-4 bg-gray-50">
                            <h3 className="text-md font-bold mb-3 text-gray-800">📋 Resumo das Regras Disparadas</h3>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-300">
                                        <th className="text-left py-2 font-semibold">Regra</th>
                                        <th className="text-center py-2 font-semibold">Severidade</th>
                                        <th className="text-right py-2 font-semibold">Pontos</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedRules.map((rule: any, idx: number) => {
                                        const rDef = OFFICIAL_RULES_LIST.find(r => r.code === rule.code);
                                        const sevColor = rule.severity === 'critical' ? 'text-red-600' : rule.severity === 'high' ? 'text-orange-600' : rule.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600';
                                        return (
                                            <tr key={idx} className="border-b border-gray-200">
                                                <td className="py-2">
                                                    {rDef?.name || rule.label || rule.code}
                                                    {rule.needsEvidence && (
                                                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-800 border border-purple-200 uppercase tracking-wide">
                                                            Evidência Req.
                                                        </span>
                                                    )}
                                                </td>
                                                <td className={`py-2 text-center font-semibold uppercase ${sevColor}`}>{rule.severity || 'low'}</td>
                                                <td className="py-2 text-right font-bold">{rule.score || 0}</td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="font-bold bg-gray-100">
                                        <td className="py-2">TOTAL</td>
                                        <td></td>
                                        <td className="py-2 text-right text-lg">{event.riskScore || sortedRules.reduce((acc: number, r: any) => acc + (r.score || 0), 0)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    <h3 className="text-md font-bold mb-2">Critérios de Normalidade Operacional</h3>
                    <p className="text-sm text-gray-700 text-justify">
                        Um turno é considerado operacionalmente normal quando apresenta evolução contínua de quilometragem, duração compatível (10min a 16h), distribuição variada de corridas e indicadores financeiros dentro das faixas esperadas (Receita/KM entre R$ 1,98 e R$ 3,30/km).
                    </p>
                </div>
            )}

            {/* 10.3 Identificação Operacional */}
            <div className="mb-8">
                <h2 className="text-lg font-bold border-b border-gray-800 mb-3 pb-1">Identificação Operacional</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    <p><span className="font-semibold">Motorista:</span> {shift.driverName || shift.driverId}</p>
                    <p><span className="font-semibold">Veículo:</span> {shift.vehicleModel ? `${shift.vehicleModel} - ` : ''}{shift.vehiclePlate || shift.vehicleId}</p>
                </div>
            </div>

            {/* 10.4 Dados do Turno */}
            <div className="mb-8">
                <h2 className="text-lg font-bold border-b border-gray-800 mb-3 pb-1">Dados do Turno Analisado</h2>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm mb-4">
                    <div className="grid grid-cols-2 gap-1">
                        <span className="text-gray-600">Início:</span>
                        <span>{fmtDate(shift.inicio)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                        <span className="text-gray-600">Fim:</span>
                        <span>{shift.fim ? fmtDate(shift.fim) : "Em andamento"}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                        <span className="text-gray-600">KM Inicial:</span>
                        <span>{shift.kmInicial} km</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                        <span className="text-gray-600">KM Final:</span>
                        <span>{shift.kmFinal} km</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 font-semibold rounded">
                        <span>KM Total:</span>
                        <span>{kmTotal} km</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 font-semibold rounded">
                        <span>Duração:</span>
                        <span>{durationHours.toFixed(2)}h</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-1">
                        <span className="text-gray-600">Receita Total:</span>
                        <span>{fmtBRL(shift.totalBruto)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-1">
                        <span className="text-gray-600">Corridas:</span>
                        <span>{shift.totalCorridas}</span>
                    </div>
                    {/* Derived Metrics (Standard 10 & 11) */}
                    <div className="grid grid-cols-2 gap-1 p-1">
                        <span className="text-gray-600">Ticket Médio:</span>
                        <span>{fmtBRL(shift.totalCorridas > 0 ? shift.totalBruto / shift.totalCorridas : 0)}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-1">
                        <span className="text-gray-600">Produtividade:</span>
                        <span>{durationHours > 0 ? (shift.totalCorridas / durationHours).toFixed(1) : 0} corr/h</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1 bg-blue-50 p-1 font-bold rounded text-blue-900">
                        <span>Receita/KM:</span>
                        <span>{fmtBRL(recPerKm)}/km</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 bg-blue-50 p-1 font-bold rounded text-blue-900">
                        <span>Receita/Hora:</span>
                        <span>{fmtBRL(recPerHour)}/h</span>
                    </div>
                </div>

                {isDurationInvalid && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded text-sm font-medium text-center mb-4">
                        ⚠️ Atenção: a duração do turno foi calculada como zero ou inválida neste registro. Por este motivo, métricas derivadas do tempo (Receita por Hora e Corridas por Hora) podem não ser representativas e são apresentadas apenas para auditoria.
                    </div>
                )}

                {/* Breakdown App vs Particular */}
                <div className="bg-gray-50 border p-4 rounded text-sm mb-6">
                    <h3 className="font-bold text-gray-800 mb-2 border-b pb-1">Distribuição por Tipo de Corrida</h3>
                    <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                            <span className="text-gray-600 block">App</span>
                            <span className="font-medium">{shift.ridesAppCount || 0} corridas ({fmtBRL(shift.revenueApp || 0)})</span>
                        </div>
                        <div>
                            <span className="text-gray-600 block">Particular</span>
                            <span className="font-medium">{shift.ridesParticularCount || 0} corridas ({fmtBRL(shift.revenueParticular || 0)})</span>
                        </div>
                        {(shift.ridesUnknownCount || 0) > 0 && (
                            <div>
                                <span className="text-gray-600 block">Unknown</span>
                                <span className="font-medium text-amber-700">{shift.ridesUnknownCount} corridas ({fmtBRL(shift.revenueUnknown || 0)})</span>
                            </div>
                        )}
                    </div>

                    {(shift.revenueParticular || 0) > 0 ? (() => {
                        const share = (shift.revenueParticular || 0) / (shift.totalBruto || 1) * 100;
                        let shareClass = "Predominantemente App";
                        if (share > 60) shareClass = "Predominantemente Particular";
                        else if (share >= 30) shareClass = "Misto";

                        return (
                            <>
                                <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                                    <div className="bg-white p-1 rounded border">
                                        <span className="text-gray-500 block">Receita/KM (App)*</span>
                                        <span className="font-bold">{fmtBRL(kmTotal > 0 ? (shift.revenueApp || 0) / kmTotal : 0)}/km</span>
                                    </div>
                                    <div className="bg-white p-1 rounded border">
                                        <span className="text-gray-500 block">Receita/KM (Part)*</span>
                                        <span className="font-bold">{fmtBRL(kmTotal > 0 ? (shift.revenueParticular || 0) / kmTotal : 0)}/km</span>
                                    </div>
                                    <div className="bg-white p-1 rounded border row-span-2 flex flex-col justify-center">
                                        <span className="text-gray-500 block">Share Particular</span>
                                        <span className="font-bold text-lg">{share.toFixed(1)}%</span>
                                        <span className="block text-[10px] text-gray-400 font-normal uppercase mt-0.5 leading-tight">{shareClass}</span>
                                    </div>
                                    <div className="bg-white p-1 rounded border">
                                        <span className="text-gray-500 block">Receita/Hora (App)</span>
                                        <span className="font-bold">{fmtBRL(durationHours > 0 ? (shift.revenueApp || 0) / durationHours : 0)}/h</span>
                                    </div>
                                    <div className="bg-white p-1 rounded border">
                                        <span className="text-gray-500 block">Receita/Hora (Part)</span>
                                        <span className="font-bold">{fmtBRL(durationHours > 0 ? (shift.revenueParticular || 0) / durationHours : 0)}/h</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs italic text-gray-500">
                                        * Métricas segregadas utilizam KM e Tempo total do turno por ausência de segregação física de deslocamento.
                                    </p>
                                    <p className="text-xs italic text-gray-600 border-l-2 border-gray-300 pl-2">
                                        “Quando uma parcela relevante da receita do turno é proveniente de corridas particulares, métricas globais como receita por quilômetro e por hora podem apresentar valores inferiores ao padrão de aplicativo, sem caracterizar fraude.”
                                    </p>
                                </div>
                            </>
                        );
                    })() : (
                        <p className="text-xs text-green-600 font-medium bg-green-50 p-1 rounded inline-block">✅ 100% Receita de Aplicativo (Predominantemente App)</p>
                    )}
                </div>

                {/* 10. ANÁLISE AVANÇADA DE AUDITORIA (PHASE 2) */}
                {am && (
                    <div className="mb-8 break-inside-avoid border-t pt-6 bg-slate-50 p-4 -mx-4">
                        <h2 className="text-lg font-bold border-gray-800 mb-4 pb-1 uppercase text-slate-800">10. Análise Avançada de Auditoria</h2>

                        {/* 10.1 Faixas Horárias */}
                        <h3 className="text-md font-bold mb-3 text-slate-700">10.1 Performance por Faixa Horária</h3>
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {am.timeSlots.map(slot => (
                                <div key={slot.name} className="bg-white border p-2 rounded text-center shadow-sm">
                                    <span className="text-xs text-gray-400 block uppercase font-bold">{slot.name}</span>
                                    <span className="font-bold block text-lg">{slot.corridas} <span className="text-xs font-normal text-gray-500">corridas</span></span>
                                    <div className="text-xs mt-1 border-t pt-1">
                                        <span className="block">{fmtBRL(slot.receita)}</span>
                                        <span className="block text-gray-400">{slot.corridasPorHora.toFixed(1)}/h</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* 10.2 Gaps */}
                        <h3 className="text-md font-bold mb-3 text-slate-700">10.2 Análise de Intervalos (Gaps)</h3>
                        <div className={`p-4 rounded border-l-4 mb-6 flex justify-between items-center ${am.gapAnalysis.status === 'ANÔMALO' ? 'bg-red-50 border-red-500' : 'bg-green-50 border-green-500'}`}>
                            <div>
                                <p className="font-bold text-lg">Maior Intervalo: {am.gapAnalysis.maxGapMinutos.toFixed(0)} min</p>
                                <p className="text-sm text-gray-600">Ocorreu em horário de pico? {am.gapAnalysis.gapEmHorarioDePico ? <strong>SIM</strong> : "NÃO"}</p>
                            </div>
                            <div className={`px-4 py-1 rounded font-bold uppercase text-sm ${am.gapAnalysis.status === 'ANÔMALO' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                                {am.gapAnalysis.status}
                            </div>
                        </div>

                        {/* 10.3 Score Contextual */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <h3 className="text-md font-bold mb-3 text-slate-700">10.3 Score Contextualizado</h3>
                                <div className="bg-white p-4 rounded border shadow-sm">
                                    <div className="flex justify-between mb-2">
                                        <span className="text-gray-500">Score Oficial:</span>
                                        <span className="font-bold">{event.riskScore}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-900 font-bold">Score Ajustado:</span>
                                        <span className="font-bold text-xl bg-slate-100 px-2 rounded">{am.scoreContextual}</span>
                                    </div>
                                    {am.scoreContextual < event.riskScore && (
                                        <p className="text-xs text-gray-500 italic mt-2 text-justify">
                                            * Ajuste aplicado devido à presença de corridas particulares que justificam parcialmente a ineficiência.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* 10.4 Diagnóstico */}
                            <div>
                                <h3 className="text-md font-bold mb-3 text-slate-700">10.4 Diagnóstico do Turno</h3>
                                <div className={`p-4 rounded border text-center ${am.classificacaoTurno === 'BOM' ? 'bg-green-600 text-white' : 'bg-red-700 text-white'}`}>
                                    <p className="text-xs uppercase opacity-80 mb-1">Classificação Operacional</p>
                                    <p className="text-2xl font-bold tracking-wider">TURNO {am.classificacaoTurno}</p>
                                    <div className="mt-2 text-xs bg-black/20 p-1 rounded inline-block">
                                        Ritmo: {am.classificacaoRitmo} (Score {am.ritmoScore})
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center text-xs text-slate-400 uppercase tracking-widest mt-4">
                            Inteligência Operacional Auditável — V2
                        </div>
                    </div>
                )}

                {/* Classification (Legacy Display - moved to end of section if no audit metrics, but kept here for structure consistency) */}
                <div className="text-center p-4 border rounded bg-gray-100 mb-8 break-inside-avoid">
                    <h3 className="text-md font-bold text-black uppercase">
                        Classificação Operacional do Turno
                    </h3>
                    <p className={`text-xl font-bold mt-1 ${event.riskScore >= 70 ? 'text-red-700' : event.riskScore >= 40 ? 'text-orange-600' : event.riskScore >= 20 ? 'text-amber-600' : 'text-green-600'}`}>
                        {event.riskScore >= 70 ? 'Anomalia Crítica' :
                            event.riskScore >= 40 ? 'Anomalia Relevante' :
                                event.riskScore >= 20 ? 'Ineficiência Operacional' :
                                    'Operacional Normal'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">(Baseado exclusivamente no Risk Score calculado pelo sistema)</p>
                </div>
            </div>

            {/* NOVA SEÇÃO: Explicação dos Indicadores */}
            <div className="mb-8 break-inside-avoid">
                <h2 className="text-lg font-bold border-b border-gray-800 mb-3 pb-1">Explicação dos Indicadores do Turno</h2>
                <p className="text-sm text-gray-700 text-justify mb-4">
                    Os indicadores abaixo representam métricas operacionais utilizadas pelo sistema antifraude para avaliar a coerência do turno. Cada métrica possui faixas consideradas normais. Desvios relevantes podem gerar alertas, porém anomalia não implica confirmação de fraude.
                </p>
                <div className="space-y-3 text-sm">
                    {[
                        { t: "1. KM Total", d: "Distância percorrida no turno (KM Final − KM Inicial). Base para validar coerência física.", i: "KM muito baixo com receita alta ou KM muito alto com poucas corridas pode indicar inconsistência." },
                        { t: "2. Duração Total", d: "Tempo total do turno ou duracaoMin/60. Base para métricas 'por hora'.", i: "Turnos longos demais podem indicar esquecimento ou fraude." },
                        { t: "3. Receita Total", d: "Soma do faturamento do turno. Base para receita por KM e Ticket Médio." },
                        { t: "4. Receita por KM", d: "Receita Total ÷ KM Total. Faixa esperada: R$ 2,00 a R$ 20,00/km.", i: "Abaixo do mínimo: corridas subdeclaradas. Acima: manipulação.", curr: `${fmtBRL(recPerKm)}/km` },
                        { t: "5. Receita por Hora", d: "Receita Total ÷ Duração. Faixa esperada: máx R$ 150,00/h.", i: "Valores altos indicam concentração artificial de receita.", curr: `${fmtBRL(recPerHour)}/h` },
                        { t: "6. Corridas", d: "Quantidade de corridas registradas.", i: "Valida coerência entre receita e atividade." }
                    ].map((item, idx) => (
                        <div key={idx}>
                            <p className="font-bold">{item.t}</p>
                            <p className="text-gray-600 pl-4 border-l-2 border-gray-200 ml-1">
                                <span className="font-semibold text-gray-700">O que é/Por que importa:</span> {item.d}
                                {item.i && <><br /><span className="font-semibold text-gray-700">Interpretação:</span> {item.i}</>}
                                {item.curr && <><br /><span className="font-bold text-black mt-1 block">Atual: {item.curr}</span></>}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* 11. Análise de Detecção */}
            <div className="mb-8 break-inside-avoid">
                <h2 className="text-lg font-bold border-b border-gray-800 mb-3 pb-1">Análise de Detecção</h2>

                {primary ? (
                    <div className="bg-gray-50 border p-4 rounded mb-6">
                        <h3 className="font-bold text-md mb-1">Regra Principal: {ruleDef?.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">Severidade: <strong className="uppercase">{primary.severity}</strong></p>
                        <p className="text-sm italic text-gray-700 mb-4 text-justify w-3/4">
                            A regra acima foi aplicada porque o valor observado neste turno ultrapassou os limites operacionais definidos pelo sistema.
                        </p>

                        <div className="bg-white border rounded p-3">
                            <h4 className="font-bold text-sm mb-2">Detalhe Técnico da Anomalia:</h4>
                            <ul className="text-sm space-y-1 pl-2">
                                {expected && <li><strong>• Esperado:</strong> {expected}</li>}
                                {observed && <li><strong>• Observado:</strong> {observed}</li>}
                                {diff && <li className="text-red-700"><strong>• Desvio:</strong> {diff}</li>}
                                {(!expected || expected.startsWith("Ver")) && details && <li>• {details}</li>}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">Nenhuma regra específica registrada (Alerta Manual ou Externo).</p>
                )}

                {/* Regras Secundárias */}
                {sortedRules.length > 1 && (
                    <div className="mb-6">
                        <h3 className="font-bold text-md mb-2">Regras Secundárias Disparadas</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            {sortedRules.slice(1).map((r, idx) => {
                                const rd = OFFICIAL_RULES_LIST.find(def => def.code === r.code);
                                return (
                                    <li key={idx} className="text-sm">
                                        <strong>{rd?.name || r.code} ({r.severity?.toUpperCase()})</strong>
                                        <p className="text-gray-600 mt-1">
                                            {r.description} Esta regra existe para identificar comportamentos que, em operação normal, indicam inconsistência operacional ou financeira e demandam revisão humana.
                                        </p>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>

            {/* 11.3 Baseline History */}
            <div className="mb-8 break-inside-avoid">
                <h2 className="text-lg font-bold border-b border-gray-800 mb-3 pb-1">Baseline (Histórico do Motorista)</h2>
                {bl && bl.sampleSize > 5 ? (
                    <>
                        <p className="text-sm text-gray-700 text-justify mb-2">
                            O sistema utiliza como referência o histórico do próprio motorista. O turno analisado apresentou desvios em relação à média histórica.
                        </p>
                        <p className="text-sm text-gray-700 text-justify mb-4 font-medium bg-gray-100 p-2 rounded">
                            A tabela abaixo compara a média histórica com os indicadores do turno. Desvios relevantes reforçam a necessidade de revisão.
                        </p>
                        <p className="text-xs text-gray-500 mb-2">Amostra: {bl.sampleSize} turnos (últimos 30 dias)</p>

                        <table className="w-full text-sm border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2 text-left">Indicador</th>
                                    <th className="border p-2 text-right">Média Histórica</th>
                                    <th className="border p-2 text-right">Turno Analisado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { l: "Receita por KM", h: bl.avgRevenuePerKm, c: recPerKm, m: true },
                                    { l: "Receita por Hora", h: bl.avgRevenuePerHour, c: recPerHour, m: true },
                                    { l: "Corridas por Hora", h: bl.avgRidesPerHour, c: durationHours > 0 ? shift.totalCorridas / durationHours : 0 },
                                    { l: "Ticket Médio", h: bl.avgTicket, c: shift.totalCorridas > 0 ? shift.totalBruto / shift.totalCorridas : 0, m: true },
                                ].map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="border p-2 font-medium">{row.l}</td>
                                        <td className="border p-2 text-right text-gray-600">{row.m ? fmtBRL(row.h) : row.h.toFixed(2)}</td>
                                        <td className="border p-2 text-right font-bold">{row.m ? fmtBRL(row.c) : row.c.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                ) : (
                    <p className="italic text-gray-500 text-sm">Não há histórico suficiente para cálculo de baseline individual neste caso.</p>
                )}
            </div>

            {/* 12. Anexo */}
            <div className="break-inside-avoid">
                <h2 className="text-lg font-bold border-b border-gray-800 mb-3 pb-1">12. Regras Gerais do Sistema (Anexo)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {OFFICIAL_RULES_LIST.map((rule, idx) => {
                        const triggered = firedCodes.has(rule.code);
                        return (
                            <div key={idx} className={`p-2 border rounded ${triggered ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
                                <p className={`font-bold ${triggered ? 'text-red-800' : 'text-gray-800'}`}>{rule.name}</p>
                                <p className="text-gray-600 mt-1 mb-2">{rule.desc}</p>
                                <p className={`font-bold ${triggered ? 'text-red-700' : 'text-gray-400'}`}>
                                    Disparou neste evento: {triggered ? "SIM" : "NÃO"}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 13. Dados Técnicos da Detecção - NOVA SEÇÃO */}
            {sortedRules.length > 0 && (
                <div className="mt-8 break-inside-avoid">
                    <h2 className="text-lg font-bold border-b border-gray-800 mb-3 pb-1">13. Dados Técnicos da Detecção</h2>
                    <p className="text-sm text-gray-700 mb-4 text-justify">
                        Esta seção apresenta os dados brutos que dispararam cada regra. Use estas informações para validar manualmente consultando as corridas do turno.
                    </p>

                    <div className="space-y-4">
                        {sortedRules.map((rule: any, idx: number) => {
                            const rDef = OFFICIAL_RULES_LIST.find(r => r.code === rule.code);
                            const data = rule.data || {};

                            return (
                                <div key={idx} className="border border-gray-300 rounded-lg overflow-hidden">
                                    {/* Header */}
                                    <div className={`px-4 py-2 font-bold text-sm ${rule.severity === 'critical' ? 'bg-red-100 text-red-800' : rule.severity === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {rDef?.name || rule.label || rule.code}
                                        <span className="float-right font-normal text-xs uppercase">{rule.severity} • {rule.score} pts</span>
                                    </div>

                                    {/* Body - Dados Técnicos */}
                                    <div className="p-4 bg-gray-50 text-xs">
                                        <p className="text-gray-600 mb-3 italic">{rule.description}</p>

                                        {/* Dados Genéricos */}
                                        {Object.keys(data).length > 0 && (
                                            <div className="space-y-2">
                                                <p className="font-bold text-gray-800 border-b pb-1">📊 Dados que Dispararam a Regra:</p>

                                                {/* Valores Monetários */}
                                                {data.revPerKm !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">Receita/KM Calculada:</span>
                                                        <span className="font-mono font-bold">{fmtBRL(data.revPerKm)}/km</span>
                                                    </div>
                                                )}
                                                {data.revPerHour !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">Receita/Hora Calculada:</span>
                                                        <span className="font-mono font-bold">{fmtBRL(data.revPerHour)}/h</span>
                                                    </div>
                                                )}
                                                {data.threshold !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">Limite Esperado:</span>
                                                        <span className="font-mono">{fmtBRL(data.threshold)}/km</span>
                                                    </div>
                                                )}
                                                {data.minThreshold !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">Limite Mínimo:</span>
                                                        <span className="font-mono">{typeof data.minThreshold === 'number' && data.minThreshold > 100 ? fmtBRL(data.minThreshold) : `${data.minThreshold}`}</span>
                                                    </div>
                                                )}
                                                {data.maxThreshold !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">Limite Máximo:</span>
                                                        <span className="font-mono">{typeof data.maxThreshold === 'number' && data.maxThreshold > 100 ? fmtBRL(data.maxThreshold) : `${data.maxThreshold}`}</span>
                                                    </div>
                                                )}

                                                {/* Baseline Comparison */}
                                                {data.baseline !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">Média Histórica (Baseline):</span>
                                                        <span className="font-mono">{fmtBRL(data.baseline)}</span>
                                                    </div>
                                                )}
                                                {data.ratio !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">Desvio (Ratio):</span>
                                                        <span className="font-mono font-bold text-red-700">{data.ratio.toFixed(2)}x</span>
                                                    </div>
                                                )}

                                                {/* KM Data */}
                                                {data.gap !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">Gap de KM:</span>
                                                        <span className="font-mono font-bold">{data.gap} km</span>
                                                    </div>
                                                )}
                                                {data.prevShiftKmEnd !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">KM Final Turno Anterior:</span>
                                                        <span className="font-mono">{data.prevShiftKmEnd} km</span>
                                                    </div>
                                                )}
                                                {data.currentShiftKmStart !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">KM Inicial Turno Atual:</span>
                                                        <span className="font-mono">{data.currentShiftKmStart} km</span>
                                                    </div>
                                                )}

                                                {/* Duration Data */}
                                                {data.durationHours !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">Duração do Turno:</span>
                                                        <span className="font-mono">{data.durationHours.toFixed(2)}h</span>
                                                    </div>
                                                )}

                                                {/* Productivity vs Fleet */}
                                                {data.hoursBelow && Array.isArray(data.hoursBelow) && (
                                                    <div className="mt-2 p-2 bg-white rounded border">
                                                        <p className="font-bold text-gray-700 mb-2">🕐 Faixas Horárias Abaixo do Esperado:</p>
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="border-b">
                                                                    <th className="text-left py-1">Horário</th>
                                                                    <th className="text-center py-1">Corridas Realizadas</th>
                                                                    <th className="text-center py-1">Frota Média</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {data.hoursBelow.map((h: any, i: number) => (
                                                                    <tr key={i} className="border-b border-gray-100">
                                                                        <td className="py-1">{String(h.hour).padStart(2, '0')}:00 - {String(h.hour).padStart(2, '0')}:59</td>
                                                                        <td className="text-center font-bold text-red-600">{h.actual}</td>
                                                                        <td className="text-center text-gray-600">{h.expected?.toFixed(1)}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}

                                                {/* Time Gaps */}
                                                {data.gaps && Array.isArray(data.gaps) && (
                                                    <div className="mt-2 p-2 bg-white rounded border">
                                                        <p className="font-bold text-gray-700 mb-2">⏱️ Intervalos Sem Corrida Detectados:</p>
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="border-b">
                                                                    <th className="text-left py-1">Início do Gap</th>
                                                                    <th className="text-left py-1">Fim do Gap</th>
                                                                    <th className="text-center py-1">Duração</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {data.gaps.map((g: any, i: number) => (
                                                                    <tr key={i} className="border-b border-gray-100">
                                                                        <td className="py-1 font-mono">{new Date(g.start).toLocaleTimeString('pt-BR')}</td>
                                                                        <td className="py-1 font-mono">{new Date(g.end).toLocaleTimeString('pt-BR')}</td>
                                                                        <td className="text-center font-bold text-orange-600">{g.msg}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                        {data.isShiftOpen && (
                                                            <p className="text-xs text-orange-600 mt-2 font-medium">⚠️ Turno estava ABERTO durante esses intervalos</p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Historical Deviation */}
                                                {data.currentRidesPerHour !== undefined && data.historicalAvg !== undefined && (
                                                    <div className="mt-2 p-2 bg-white rounded border">
                                                        <p className="font-bold text-gray-700 mb-2">📉 Comparação com Histórico Pessoal:</p>
                                                        <div className="grid grid-cols-3 gap-2 text-center">
                                                            <div>
                                                                <span className="block text-gray-500">Turno Atual</span>
                                                                <span className="font-bold text-lg text-red-600">{data.currentRidesPerHour.toFixed(1)}/h</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-gray-500">Média Histórica</span>
                                                                <span className="font-bold text-lg text-green-600">{data.historicalAvg.toFixed(1)}/h</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-gray-500">Desvio</span>
                                                                <span className="font-bold text-lg text-orange-600">{data.deviation}</span>
                                                            </div>
                                                        </div>
                                                        {data.sampleSize && (
                                                            <p className="text-xs text-gray-500 mt-2 text-center">Baseado em {data.sampleSize} turnos anteriores</p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Value Asymmetry */}
                                                {data.driverLowPercent !== undefined && data.fleetLowPercent !== undefined && (
                                                    <div className="mt-2 p-2 bg-white rounded border">
                                                        <p className="font-bold text-gray-700 mb-2">⚖️ Assimetria de Seleção de Corridas:</p>
                                                        <div className="grid grid-cols-3 gap-2 text-center">
                                                            <div>
                                                                <span className="block text-gray-500">% Corridas Baratas (Motorista)</span>
                                                                <span className="font-bold text-lg">{data.driverLowPercent.toFixed(1)}%</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-gray-500">% Corridas Baratas (Frota)</span>
                                                                <span className="font-bold text-lg">{data.fleetLowPercent.toFixed(1)}%</span>
                                                            </div>
                                                            <div>
                                                                <span className="block text-gray-500">Diferença</span>
                                                                <span className="font-bold text-lg text-red-600">{data.asymmetry?.toFixed(1)}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Sequence of Equal Values */}
                                                {data.valor !== undefined && data.count !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2 bg-white p-2 rounded border mt-2">
                                                        <div>
                                                            <span className="block text-gray-500 text-xs">Valor Repetido</span>
                                                            <span className="font-bold">{fmtBRL(data.valor)}</span>
                                                        </div>
                                                        <div>
                                                            <span className="block text-gray-500 text-xs">Quantidade Consecutiva</span>
                                                            <span className="font-bold text-red-600">{data.count}x em sequência</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Revenue/Rides Data */}
                                                {data.revenueTotal !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">Receita Total:</span>
                                                        <span className="font-mono font-bold">{fmtBRL(data.revenueTotal)}</span>
                                                    </div>
                                                )}
                                                {data.kmTotal !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">KM Total:</span>
                                                        <span className="font-mono">{data.kmTotal} km</span>
                                                    </div>
                                                )}
                                                {data.ridesCount !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">Total de Corridas:</span>
                                                        <span className="font-mono">{data.ridesCount}</span>
                                                    </div>
                                                )}
                                                {data.ridesPerHour !== undefined && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <span className="text-gray-600">Corridas/Hora:</span>
                                                        <span className="font-mono">{data.ridesPerHour.toFixed(2)}/h</span>
                                                    </div>
                                                )}

                                                {/* NOVO: Comparação com Frota (Dedo Duro) */}
                                                {rule.comparison && (
                                                    <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                                                        <p className="font-bold text-blue-800 mb-2">👥 {rule.comparison.context}</p>

                                                        {rule.comparison.fleet && rule.comparison.fleet.length > 0 ? (
                                                            <div className="space-y-2">
                                                                {rule.comparison.fleet.map((driver: any, i: number) => (
                                                                    <div key={i} className="bg-green-50 p-2 rounded border border-green-200">
                                                                        <p className="font-semibold text-green-800">
                                                                            ✅ {driver.driverName} ({driver.vehiclePlate}): {driver.total || driver.rides?.length} corrida(s)
                                                                        </p>
                                                                        {driver.rides && driver.rides.length > 0 && (
                                                                            <ul className="ml-4 mt-1 text-xs text-green-700">
                                                                                {driver.rides.map((r: any, j: number) => (
                                                                                    <li key={j}>• {r.hora} → R$ {r.valor?.toFixed(2)} ({r.tipo})</li>
                                                                                ))}
                                                                            </ul>
                                                                        )}
                                                                    </div>
                                                                ))}

                                                                <div className="bg-red-50 p-2 rounded border border-red-200">
                                                                    <p className="font-semibold text-red-800">
                                                                        ❌ VOCÊ: {rule.comparison.yourValue}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <p className="text-gray-500 italic">Nenhum outro motorista ativo neste período para comparação.</p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* NOVO: Corridas Suspeitas (Evidence) */}
                                                {rule.evidence?.rides && rule.evidence.rides.length > 0 && (
                                                    <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-300">
                                                        <p className="font-bold text-yellow-800 mb-2">⚠️ Corridas Suspeitas Detectadas:</p>
                                                        <table className="w-full text-xs">
                                                            <thead>
                                                                <tr className="border-b border-yellow-300">
                                                                    <th className="text-left py-1">#</th>
                                                                    <th className="text-left py-1">Horário</th>
                                                                    <th className="text-right py-1">Valor</th>
                                                                    <th className="text-left py-1">Tipo</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {rule.evidence.rides.map((r: any, i: number) => (
                                                                    <tr key={i} className="border-b border-yellow-200">
                                                                        <td className="py-1">{i + 1}</td>
                                                                        <td className="py-1 font-mono">{r.hora}</td>
                                                                        <td className="py-1 text-right font-bold">R$ {r.valor?.toFixed(2)}</td>
                                                                        <td className="py-1">{r.tipo}</td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}

                                                {/* NOVO: O QUE / QUANDO / VALORES (formato atômico) */}
                                                {rule.what && (
                                                    <div className="mt-3 p-3 bg-slate-100 rounded border">
                                                        <div className="grid grid-cols-1 gap-2">
                                                            <div>
                                                                <span className="text-slate-500 text-xs">📍 O QUE:</span>
                                                                <span className="block font-bold text-slate-800">{rule.what}</span>
                                                            </div>
                                                            {rule.when && (
                                                                <div>
                                                                    <span className="text-slate-500 text-xs">⏰ QUANDO:</span>
                                                                    <span className="block font-mono">{rule.when.start}{rule.when.end ? ` → ${rule.when.end}` : ''}</span>
                                                                </div>
                                                            )}
                                                            {rule.values && (
                                                                <div className="grid grid-cols-3 gap-2 mt-2 text-center">
                                                                    <div className="bg-white p-1 rounded">
                                                                        <span className="block text-xs text-gray-500">Observado</span>
                                                                        <span className="font-bold text-red-600">{rule.values.observed}</span>
                                                                    </div>
                                                                    <div className="bg-white p-1 rounded">
                                                                        <span className="block text-xs text-gray-500">Esperado</span>
                                                                        <span className="font-medium text-green-600">{rule.values.expected}</span>
                                                                    </div>
                                                                    {rule.values.diff && (
                                                                        <div className="bg-white p-1 rounded">
                                                                            <span className="block text-xs text-gray-500">Diferença</span>
                                                                            <span className="font-bold text-orange-600">{rule.values.diff}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {Object.keys(data).length === 0 && (
                                            <p className="text-gray-400 italic">Dados adicionais não disponíveis para esta regra.</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                        <strong>💡 Como usar estes dados:</strong> Compare os horários e valores acima com as corridas registradas no turno.
                        Vá em <strong>Turnos → [Turno ID] → Ver Corridas</strong> e verifique se as inconsistências apontadas correspondem aos registros.
                    </div>
                </div>
            )}

            <div className="text-center text-[10px] text-gray-400 mt-8 pt-4 border-t print:block hidden">
                Relatório gerado eletronicamente por Rota Verde Antifraude. Este documento é para uso interno e auditoria.
            </div>
        </div>
    );
};
