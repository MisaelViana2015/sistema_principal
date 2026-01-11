import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, Hammer, Construction, TrendingUp } from 'lucide-react';

const PerformancePage = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500 p-4 max-w-lg mx-auto mt-20">
            <Card className="border-dashed border-2">
                <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="p-4 bg-muted rounded-full">
                        <Construction className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                            <TrendingUp className="w-6 h-6" /> Desempenho
                        </h1>
                        <p className="text-muted-foreground max-w-xs mx-auto">
                            Este módulo está em construção. Em breve você poderá visualizar suas métricas detalhadas aqui.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default PerformancePage;
