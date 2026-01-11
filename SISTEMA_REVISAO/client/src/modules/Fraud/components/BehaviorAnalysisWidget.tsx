import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

interface BehaviorData {
    hasCorrection: boolean;
    incidentDate: string;
    statsBefore: string;
    statsAfter: string;
    improvementPercent: string;
    shiftsInvolved: {
        before: number;
        after: number;
    };
    message?: string;
}

interface BehaviorAnalysisWidgetProps {
    driverId: string;
}

export function BehaviorAnalysisWidget({ driverId }: BehaviorAnalysisWidgetProps) {
    const { data, isLoading, error } = useQuery({
        queryKey: ['behavior-change', driverId],
        queryFn: async () => {
            const res = await api.get(`/fraud/behavior-change/${driverId}`);
            return res.data as BehaviorData;
        },
        enabled: !!driverId
    });

    if (isLoading) {
        return <Skeleton className="w-full h-32 rounded-lg" />;
    }

    if (error) {
        return (
            <div className="p-4 border border-red-200 bg-red-50 text-red-600 rounded text-sm mb-4">
                Erro ao carregar análise comportamental.
            </div>
        );
    }

    if (!data || data.message) {
        // Sem dados suficientes ou sem fraude confirmada prévia
        return null;
    }

    const improvement = parseFloat(data.improvementPercent);
    const isPositive = improvement > 0;
    const isNeutral = improvement === 0;

    return (
        <Card className="bg-gradient-to-br from-slate-50 to-white border-blue-100 shadow-sm print:hidden mb-6">
            <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                    <Activity className="h-4 w-4 text-blue-600" />
                    Análise de Correção de Comportamento
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="flex-1 space-y-1">
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Antes do Incidente</div>
                        <div className="text-2xl font-mono text-slate-600">{data.statsBefore} <span className="text-sm text-slate-400">corridas/h</span></div>
                        <div className="text-xs text-slate-400">Base: {data.shiftsInvolved.before} turnos</div>
                    </div>

                    <div className="flex items-center justify-center">
                        {isPositive ? (
                            <TrendingUp className="h-8 w-8 text-emerald-500" />
                        ) : isNeutral ? (
                            <Minus className="h-8 w-8 text-slate-300" />
                        ) : (
                            <TrendingDown className="h-8 w-8 text-red-500" />
                        )}
                    </div>

                    <div className="flex-1 space-y-1 text-right sm:text-left">
                        <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Pós-Incidente</div>
                        <div className={`text-2xl font-mono ${isPositive ? 'text-emerald-600' : 'text-slate-600'}`}>
                            {data.statsAfter} <span className="text-sm text-slate-400">corridas/h</span>
                        </div>
                        <div className="text-xs text-slate-400">Base: {data.shiftsInvolved.after} turnos</div>
                    </div>

                    <div className={`px-4 py-2 rounded-lg text-center min-w-[120px] ${isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                        <div className="text-sm font-bold">{isPositive ? '+' : ''}{data.improvementPercent}%</div>
                        <div className="text-[10px] uppercase">Variação</div>
                    </div>
                </div>

                {data.hasCorrection && (
                    <div className="mt-4 p-2 bg-emerald-50 border border-emerald-100 rounded text-xs text-emerald-700 flex items-center gap-2">
                        <TrendingUp className="h-3 w-3" />
                        Motorista demonstrou melhora de produtividade após o primeiro incidente registrado em {new Date(data.incidentDate).toLocaleDateString('pt-BR')}.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
