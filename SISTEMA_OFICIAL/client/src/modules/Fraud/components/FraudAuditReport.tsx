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

// Hardcoded Official Rules List (Mirroring Backend)
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
                    <p><strong>Gerado em:</strong> {new Date().toLocaleString('pt-BR')}</p>
                </div>
            </div>

            {/* 10.2 Resumo Executivo */}
            <div className="mb-8">
                <h2 className="text-lg font-bold border-b border-gray-800 mb-3 pb-1">Resumo Executivo de Risco</h2>
                <div className="grid grid-cols-3 gap-4 mb-4 bg-gray-50 p-3 rounded">
                    <div><span className="text-gray-600 text-sm">Risk Score:</span> <span className="font-bold text-lg block">{event.riskScore}</span></div>
                    <div><span className="text-gray-600 text-sm">Risk Level:</span> <span className={`font-bold text-lg block uppercase ${event.riskLevel === 'critical' ? 'text-red-600' : event.riskLevel === 'high' ? 'text-orange-600' : 'text-yellow-600'}`}>{event.riskLevel}</span></div>
                    <div><span className="text-gray-600 text-sm">Status:</span> <span className="font-bold text-lg block uppercase">{event.status}</span></div>
                </div>

                <p className="text-sm italic text-gray-700 text-justify mb-3">
                    Este evento foi identificado automaticamente pelo sistema antifraude do Rota Verde devido à detecção de comportamentos operacionais anômalos, com base em regras determinísticas e critérios objetivos previamente definidos.
                </p>

                <div className="bg-red-50 border-l-4 border-red-600 p-3 mb-6">
                    <p className="text-red-700 font-bold text-sm">
                        ⚠️ A detecção de anomalia NÃO implica confirmação de fraude. O alerta indica exclusivamente a necessidade de análise humana.
                    </p>
                </div>

                <h3 className="text-md font-bold mb-2">Critérios de Normalidade Operacional</h3>
                <p className="text-sm text-gray-700 text-justify">
                    Um turno é considerado operacionalmente normal quando apresenta evolução contínua de quilometragem, duração compatível (10min a 14h), distribuição variada de corridas e indicadores financeiros dentro das faixas esperadas (Receita/KM entre R$ 3,00 e R$ 20,00).
                </p>
            </div>

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
                        { t: "4. Receita por KM", d: "Receita Total ÷ KM Total. Faixa esperada: R$ 3,00 a R$ 20,00/km.", i: "Abaixo do mínimo: corridas subdeclaradas. Acima: manipulação.", curr: `${fmtBRL(recPerKm)}/km` },
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

            <div className="text-center text-[10px] text-gray-400 mt-8 pt-4 border-t print:block hidden">
                Relatório gerado eletronicamente por Rota Verde Antifraude. Este documento é para uso interno e auditoria.
            </div>
        </div>
    );
};
