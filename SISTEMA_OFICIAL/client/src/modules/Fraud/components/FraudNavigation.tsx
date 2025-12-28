import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, Clock, FileStack, Settings, ScrollText } from 'lucide-react';

interface FraudNavigationProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const FraudNavigation: React.FC<FraudNavigationProps> = ({ activeTab, onTabChange }) => {

    const tabs = [
        { id: 'painel', label: 'Painel', icon: LayoutDashboard },
        { id: 'relatorios', label: 'Relatórios', icon: FileText },
        { id: 'fila', label: 'Fila', icon: Clock },
        { id: 'eventos', label: 'Histórico', icon: FileStack },
        { id: 'configuracao', label: 'Config', icon: Settings },
        { id: 'logs', label: 'Logs', icon: ScrollText },
    ];

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6 border-b pb-4">
            {tabs.map((tab) => {
                const active = activeTab === tab.id;
                return (
                    <Button
                        key={tab.id}
                        variant={active ? "default" : "ghost"}
                        onClick={() => onTabChange(tab.id)}
                        className={`gap-2 ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </Button>
                );
            })}
        </div>
    );
};

export default FraudNavigation;
