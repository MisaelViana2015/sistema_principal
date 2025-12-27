import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Cores baseadas no nível de risco
const getRiskColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count < 2) return 'bg-emerald-200 dark:bg-emerald-900';
    if (count < 5) return 'bg-yellow-200 dark:bg-yellow-900';
    return 'bg-red-400 dark:bg-red-900';
};

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface HeatmapPoint {
    date: string;
    count: number;
    details: any[];
}

export const FraudHeatmap = () => {
    // Buscar dados reais da API
    const { data: apiData } = useQuery({
        queryKey: ['fraud-heatmap'],
        queryFn: async () => {
            const res = await api.get('/api/fraud/heatmap');
            return res.data as HeatmapPoint[];
        }
    });

    const heatmapData = useMemo(() => {
        // Se ainda não carregou, retorna array vazio ou skeleton
        // Aqui vamos gerar os dias do ano vazio e preencher com o que veio da API
        const data = [];
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
        let currentDate = new Date(oneYearAgo);

        // Mapa de acesso rápido aos dados da API
        const dataMap = new Map();
        if (apiData) {
            apiData.forEach(p => {
                // A data vem como string YYYY-MM-DD
                const dKey = p.date.split('T')[0];
                dataMap.set(dKey, p.count);
            });
        }

        while (currentDate <= today) {
            const dateKey = currentDate.toISOString().split('T')[0];
            data.push({
                date: new Date(currentDate),
                count: dataMap.get(dateKey) || 0,
                details: []
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return data;
    }, [apiData]);

    // Agrupar por mês
    const monthsData = useMemo(() => {
        return MONTHS.map((month, index) => {
            return {
                name: month,
                days: heatmapData.filter(d => d.date.getMonth() === index)
            };
        });
    }, [heatmapData]);

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <span className="text-xl">🔥</span> Mapa de Calor de Riscos
            </h3>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {monthsData.map((month) => (
                    month.days.length > 0 && (
                        <div key={month.name} className="flex flex-col gap-1">
                            <span className="text-xs text-center font-medium text-gray-500 mb-1">{month.name}</span>
                            <div className="grid grid-rows-7 grid-flow-col gap-1">
                                {month.days.map((day, dIndex) => (
                                    <div
                                        key={dIndex}
                                        className={`w-3 h-3 rounded-sm ${getRiskColor(day.count)} transition-colors hover:scale-125 cursor-pointer`}
                                        title={`${day.date.toLocaleDateString()}: ${day.count} alertas`}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>

            <div className="flex gap-4 mt-6 text-xs text-gray-500 items-center">
                <span>Legenda:</span>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"></div> Sem alertas</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-900"></div> Baixo</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-yellow-200 dark:bg-yellow-900"></div> Médio</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-400 dark:bg-red-900"></div> Crítico</div>
            </div>
        </Card>
    );
};
