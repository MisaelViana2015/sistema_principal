import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings, AlertTriangle, Shield, Activity, Clock, TrendingUp, Gauge, Target, ArrowLeft, ShieldCheck } from 'lucide-react';

// These thresholds are read-only and match the backend fraud.engine.ts (v2)
const THRESHOLDS = {
    // Receita/KM - Base: R$ 2.20 média
    MIN_REVENUE_PER_KM_HIGH: 1.98,       // 10% abaixo = HIGH
    MIN_REVENUE_PER_KM_CRITICAL: 1.87,   // 15% abaixo = CRITICAL
    MAX_REVENUE_PER_KM: 3.30,            // 50% acima = HIGH
    // Receita/Hora
    MIN_REVENUE_PER_HOUR: 20,            // MEDIUM
    MAX_REVENUE_PER_HOUR: 70,            // HIGH
    // Arrecadação/Turno (v2)
    MIN_REVENUE_PER_SHIFT: 200,          // MEDIUM
    MAX_REVENUE_PER_SHIFT: 550,          // HIGH
    // Duração
    MIN_SHIFT_HOURS: 1 / 6,              // 10 min = LOW
    MAX_SHIFT_HOURS: 14,                 // > 14h = LOW (v2)
    // Gap KM e Baseline
    MAX_KM_GAP_NORMAL: 250,
    DEVIATION_MULTIPLIER_HIGH: 1.5,
    DEVIATION_MULTIPLIER_CRITICAL: 2,
    SCORE: {
        LOW: 5,
        MEDIUM: 10,
        HIGH: 20,
        CRITICAL: 40,
    },
    LEVELS: {
        SUSPECT_MIN: 35,
        CRITICAL_MIN: 70,
    },
};

const RULES_INFO = [
    { code: 'KM_ZERO_COM_RECEITA', label: 'Receita com km zero', severity: 'critical', description: 'Turno com receita mas km total <= 0' },
    { code: 'RECEITA_KM_BAIXA', label: 'Receita/km baixa (10%)', severity: 'high', description: `Receita/km < R$ ${THRESHOLDS.MIN_REVENUE_PER_KM_HIGH}` },
    { code: 'RECEITA_KM_CRITICA', label: 'Receita/km crítica (15%)', severity: 'critical', description: `Receita/km < R$ ${THRESHOLDS.MIN_REVENUE_PER_KM_CRITICAL}` },
    { code: 'RECEITA_KM_ALTA', label: 'Receita/km alta', severity: 'high', description: `Receita/km > R$ ${THRESHOLDS.MAX_REVENUE_PER_KM}` },
    { code: 'RECEITA_HORA_MUITO_BAIXA', label: 'Receita/hora baixa', severity: 'medium', description: `Receita/hora < R$ ${THRESHOLDS.MIN_REVENUE_PER_HOUR}` },
    { code: 'RECEITA_HORA_MUITO_ALTA', label: 'Receita/hora alta', severity: 'high', description: `Receita/hora > R$ ${THRESHOLDS.MAX_REVENUE_PER_HOUR}` },
    { code: 'ARRECADACAO_TURNO_BAIXA', label: 'Arrecadação baixa', severity: 'medium', description: `Total < R$ ${THRESHOLDS.MIN_REVENUE_PER_SHIFT}` },
    { code: 'ARRECADACAO_TURNO_ALTA', label: 'Arrecadação alta', severity: 'high', description: `Total > R$ ${THRESHOLDS.MAX_REVENUE_PER_SHIFT}` },
    { code: 'TURNO_CURTO_DEMAIS', label: 'Turno muito curto', severity: 'low', description: `Duração < ${(THRESHOLDS.MIN_SHIFT_HOURS * 60).toFixed(0)} min` },
    { code: 'TURNO_LONGO_DEMAIS', label: 'Turno longo', severity: 'low', description: `Duração > ${THRESHOLDS.MAX_SHIFT_HOURS} horas` },
    { code: 'RECEITA_KM_DESVIO_ALTO', label: 'Desvio alto do baseline', severity: 'high', description: `>= ${THRESHOLDS.DEVIATION_MULTIPLIER_HIGH}x do padrão` },
    { code: 'RECEITA_KM_DESVIO_CRITICO', label: 'Desvio crítico do baseline', severity: 'critical', description: `>= ${THRESHOLDS.DEVIATION_MULTIPLIER_CRITICAL}x do padrão` },
    { code: 'GAP_KM_ANOMALO', label: 'Gap de km anômalo', severity: 'high', description: `Diferença > ${THRESHOLDS.MAX_KM_GAP_NORMAL} km` },
];

const getSeverityBadge = (severity: string) => {
    const styleMap: Record<string, string> = {
        low: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700',
        medium: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700',
        high: 'bg-orange-50 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 border-orange-200 dark:border-orange-700',
        critical: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700',
    };
    return <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border font-semibold text-sm ${styleMap[severity] || styleMap.low}`}>{severity.toUpperCase()}</div>;
};

const FraudConfiguration = () => {
    const navigate = useNavigate();
    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-4 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Settings className="w-8 h-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold">Configuração de Regras</h1>
                    <p className="text-muted-foreground">Parâmetros e limites do motor de detecção de fraudes.</p>
                </div>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Thresholds Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Gauge className="w-5 h-5" /> Limites de Detecção</CardTitle>
                        <CardDescription>Valores usados para identificar anomalias</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Receita/km (10% abaixo)</p>
                                <p className="text-lg font-bold">R$ {THRESHOLDS.MIN_REVENUE_PER_KM_HIGH}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Receita/km (15% abaixo)</p>
                                <p className="text-lg font-bold text-destructive">R$ {THRESHOLDS.MIN_REVENUE_PER_KM_CRITICAL}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Receita/km máxima</p>
                                <p className="text-lg font-bold">R$ {THRESHOLDS.MAX_REVENUE_PER_KM}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Receita/hora mínima</p>
                                <p className="text-lg font-bold">R$ {THRESHOLDS.MIN_REVENUE_PER_HOUR}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Receita/hora máxima</p>
                                <p className="text-lg font-bold">R$ {THRESHOLDS.MAX_REVENUE_PER_HOUR}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Arrecadação/turno mínima</p>
                                <p className="text-lg font-bold">R$ {THRESHOLDS.MIN_REVENUE_PER_SHIFT}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Arrecadação/turno máxima</p>
                                <p className="text-lg font-bold">R$ {THRESHOLDS.MAX_REVENUE_PER_SHIFT}</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Turno mínimo</p>
                                <p className="text-lg font-bold">{(THRESHOLDS.MIN_SHIFT_HOURS * 60).toFixed(0)} min</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Turno máximo</p>
                                <p className="text-lg font-bold">{THRESHOLDS.MAX_SHIFT_HOURS} horas</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Gap km anômalo</p>
                                <p className="text-lg font-bold">{THRESHOLDS.MAX_KM_GAP_NORMAL} km</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Multiplicador crítico</p>
                                <p className="text-lg font-bold">{THRESHOLDS.DEVIATION_MULTIPLIER_CRITICAL}x</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Score System Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" /> Sistema de Pontuação</CardTitle>
                        <CardDescription>Como os scores são calculados e classificados</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Pontos por Severidade</h4>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700"><p className="text-xs text-muted-foreground mb-1">Low</p><p className="text-2xl font-bold text-blue-800 dark:text-blue-200">{THRESHOLDS.SCORE.LOW}</p></div>
                                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700"><p className="text-xs text-muted-foreground mb-1">Medium</p><p className="text-2xl font-bold text-yellow-800 dark:text-yellow-200">{THRESHOLDS.SCORE.MEDIUM}</p></div>
                                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700"><p className="text-xs text-muted-foreground mb-1">High</p><p className="text-2xl font-bold text-orange-800 dark:text-orange-200">{THRESHOLDS.SCORE.HIGH}</p></div>
                                <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700"><p className="text-xs text-muted-foreground mb-1">Critical</p><p className="text-2xl font-bold text-red-800 dark:text-red-200">{THRESHOLDS.SCORE.CRITICAL}</p></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Níveis de Alerta</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                                    <span className="font-medium">Normal</span><span className="font-mono text-lg font-bold text-green-800 dark:text-green-200">0 - {THRESHOLDS.LEVELS.SUSPECT_MIN - 1}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                                    <span className="font-medium">Suspeito</span><span className="font-mono text-lg font-bold text-yellow-800 dark:text-yellow-200">{THRESHOLDS.LEVELS.SUSPECT_MIN} - {THRESHOLDS.LEVELS.CRITICAL_MIN - 1}</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                                    <span className="font-medium">Crítico</span><span className="font-mono text-lg font-bold text-red-800 dark:text-red-200">{THRESHOLDS.LEVELS.CRITICAL_MIN}+</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Rules Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Regras de Detecção Ativas</CardTitle>
                    <CardDescription>Lista completa de regras implementadas no engine</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                                <tr>
                                    <th className="p-3 text-left">Código</th>
                                    <th className="p-3 text-left">Regra</th>
                                    <th className="p-3 text-left">Severidade</th>
                                    <th className="p-3 text-left">Descrição</th>
                                </tr>
                            </thead>
                            <tbody>
                                {RULES_INFO.map(rule => (
                                    <tr key={rule.code} className="border-t hover:bg-muted/50">
                                        <td className="p-3 font-mono text-xs">{rule.code}</td>
                                        <td className="p-3 font-medium">{rule.label}</td>
                                        <td className="p-3">{getSeverityBadge(rule.severity)}</td>
                                        <td className="p-3 text-muted-foreground">{rule.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground p-4">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Esta tela é somente leitura. Para alterar parâmetros, edite o arquivo <code className="bg-muted px-1 rounded">fraud.engine.ts</code> no servidor.
            </div>
        </div>
    );
};

export default FraudConfiguration;
