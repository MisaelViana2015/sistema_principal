import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Settings, AlertTriangle, Shield, Activity, Clock, TrendingUp, Gauge, Target, ArrowLeft, ShieldCheck } from 'lucide-react';

// These thresholds are read-only and match the backend fraud.engine.ts
const THRESHOLDS = {
    MIN_REVENUE_PER_KM: 3,
    MAX_REVENUE_PER_KM: 20,
    MIN_REVENUE_PER_HOUR: 20,
    MAX_REVENUE_PER_HOUR: 150,
    MIN_RIDES_PER_HOUR: 0.3,
    MAX_RIDES_PER_HOUR: 8,
    MIN_SHIFT_HOURS: 1 / 6,
    MAX_SHIFT_HOURS: 14,
    MAX_KM_GAP_NORMAL: 250,
    DEVIATION_MULTIPLIER_HIGH: 2.5,
    DEVIATION_MULTIPLIER_CRITICAL: 4,
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
    { code: 'BAIXA_RECEITA_POR_KM', label: 'Baixa receita por km', severity: 'medium', description: `Receita/km < R$ ${THRESHOLDS.MIN_REVENUE_PER_KM}` },
    { code: 'ALTA_RECEITA_POR_KM', label: 'Alta receita por km', severity: 'high', description: `Receita/km > R$ ${THRESHOLDS.MAX_REVENUE_PER_KM}` },
    { code: 'BAIXA_RECEITA_POR_HORA', label: 'Baixa receita por hora', severity: 'medium', description: `Receita/hora < R$ ${THRESHOLDS.MIN_REVENUE_PER_HOUR}` },
    { code: 'ALTA_RECEITA_POR_HORA', label: 'Alta receita por hora', severity: 'high', description: `Receita/hora > R$ ${THRESHOLDS.MAX_REVENUE_PER_HOUR}` },
    { code: 'TURNO_MUITO_CURTO', label: 'Turno muito curto', severity: 'low', description: `Duração < ${(THRESHOLDS.MIN_SHIFT_HOURS * 60).toFixed(0)} min` },
    { code: 'TURNO_MUITO_LONGO', label: 'Turno muito longo', severity: 'medium', description: `Duração > ${THRESHOLDS.MAX_SHIFT_HOURS} horas` },
    { code: 'DESVIO_BASELINE_ALTO', label: 'Desvio alto do baseline', severity: 'high', description: `> ${THRESHOLDS.DEVIATION_MULTIPLIER_HIGH}x do padrão histórico` },
    { code: 'DESVIO_BASELINE_CRITICO', label: 'Desvio crítico do baseline', severity: 'critical', description: `> ${THRESHOLDS.DEVIATION_MULTIPLIER_CRITICAL}x do padrão histórico` },
    { code: 'GAP_KM_ANOMALO', label: 'Gap de km anômalo', severity: 'high', description: `Diferença entre turnos > ${THRESHOLDS.MAX_KM_GAP_NORMAL} km` },
];

const getSeverityBadge = (severity: string) => {
    const styles: Record<string, string> = {
        low: 'bg-blue-100 text-blue-800 border-blue-200',
        medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        high: 'bg-orange-100 text-orange-800 border-orange-200',
        critical: 'bg-red-100 text-red-800 border-red-200',
    };
    return <Badge className={`${styles[severity]} border`}>{severity.toUpperCase()}</Badge>;
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
                                <p className="text-muted-foreground">Receita/km mínima</p>
                                <p className="text-lg font-bold">R$ {THRESHOLDS.MIN_REVENUE_PER_KM}</p>
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
                                <p className="text-muted-foreground">Turno mínimo</p>
                                <p className="text-lg font-bold">{(THRESHOLDS.MIN_SHIFT_HOURS * 60).toFixed(0)} min</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Turno máximo</p>
                                <p className="text-lg font-bold">{THRESHOLDS.MAX_SHIFT_HOURS} horas</p>
                            </div>
                            <div className="p-3 bg-muted rounded-lg">
                                <p className="text-muted-foreground">Gap km normal</p>
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
                                <div className="text-center p-2 bg-blue-50 rounded"><p className="text-xs text-muted-foreground">Low</p><p className="font-bold">{THRESHOLDS.SCORE.LOW}</p></div>
                                <div className="text-center p-2 bg-yellow-50 rounded"><p className="text-xs text-muted-foreground">Medium</p><p className="font-bold">{THRESHOLDS.SCORE.MEDIUM}</p></div>
                                <div className="text-center p-2 bg-orange-50 rounded"><p className="text-xs text-muted-foreground">High</p><p className="font-bold">{THRESHOLDS.SCORE.HIGH}</p></div>
                                <div className="text-center p-2 bg-red-50 rounded"><p className="text-xs text-muted-foreground">Critical</p><p className="font-bold">{THRESHOLDS.SCORE.CRITICAL}</p></div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Níveis de Alerta</h4>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                                    <span>Normal</span><span className="font-mono">0 - {THRESHOLDS.LEVELS.SUSPECT_MIN - 1}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                                    <span>Suspeito</span><span className="font-mono">{THRESHOLDS.LEVELS.SUSPECT_MIN} - {THRESHOLDS.LEVELS.CRITICAL_MIN - 1}</span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                                    <span>Crítico</span><span className="font-mono">{THRESHOLDS.LEVELS.CRITICAL_MIN}+</span>
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
