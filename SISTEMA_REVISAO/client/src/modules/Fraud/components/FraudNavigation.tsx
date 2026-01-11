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
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                            ${active
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 border border-transparent hover:border-gray-200 dark:hover:border-slate-600'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
};

export default FraudNavigation;
