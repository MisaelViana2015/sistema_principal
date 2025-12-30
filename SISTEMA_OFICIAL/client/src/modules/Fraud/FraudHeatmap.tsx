import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

// Cores baseadas na média de risco (avgScore)
// Engine Scores: Low=5, Medium=10, High=20, Critical=40
const getRiskColor = (score: number, count: number) => {
    if (count === 0 || score === 0) return 'bg-white'; // Branco puro (Sem risco)
    if (score <= 5) return 'bg-green-300 dark:bg-green-700';  // Verde Claro (1 LOW)
    if (score < 20) return 'bg-yellow-400 dark:bg-yellow-500'; // Amarelo (MEDIUM ou múltiplos LOWs)
    return 'bg-red-500 dark:bg-red-600';                        // Vermelho (HIGH ou CRITICAL)
};



const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

interface HeatmapPoint {
    date: string;
    count: number;
    avgScore: number;
    maxScore: number;
}

interface FraudHeatmapProps {
    driverId?: string;
}

export const FraudHeatmap = ({ driverId }: FraudHeatmapProps) => {
    // Buscar dados reais da API
    const { data: apiData } = useQuery({
        queryKey: ['fraud-heatmap', driverId],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (driverId && driverId !== 'all') {
                params.append('driverId', driverId);
            }
            const res = await api.get('/fraud/heatmap', { params });
            return res.data as HeatmapPoint[];
        }
    });

    const heatmapData = useMemo(() => {
        const data = [];
        const today = new Date();
        const oneYearAgo = new Date(today.getFullYear(), today.getMonth() - 11, 1);
        let currentDate = new Date(oneYearAgo);

        const dataMap = new Map();
        if (apiData) {
            apiData.forEach(p => {
                const dKey = p.date; // Já vem YYYY-MM-DD do backend
                dataMap.set(dKey, p);
            });
        }

        while (currentDate <= today) {
            const dateKey = currentDate.toISOString().split('T')[0];
            const point = dataMap.get(dateKey);

            data.push({
                date: new Date(currentDate),
                count: point ? point.count : 0,
                avgScore: point ? point.avgScore : 0,
                maxScore: point ? point.maxScore : 0
            });
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return data;
    }, [apiData]);

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
                <span className="text-xl">🔥</span> Mapa de Calor de Riscos (Média Diária)
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
                                        className={`w-3 h-3 rounded-sm ${getRiskColor(day.avgScore, day.count)} transition-colors hover:scale-125 cursor-pointer`}
                                        title={`${day.date.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}: ${day.count} eventos, Média: ${day.avgScore.toFixed(1)}, Max: ${day.maxScore}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>

            <div className="flex gap-4 mt-6 text-xs text-gray-500 items-center flex-wrap">
                <span>Legenda (Score Médio):</span>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-white"></div> Sem risco (0)</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-green-300 dark:bg-green-700"></div> 1-5 (LOW)</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-yellow-400 dark:bg-yellow-500"></div> 6-19 (MEDIUM)</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 rounded-sm bg-red-500 dark:bg-red-600"></div> ≥ 20 (HIGH+)</div>
            </div>
        </Card>
    );
};
