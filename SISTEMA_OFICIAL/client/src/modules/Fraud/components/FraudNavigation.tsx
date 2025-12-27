import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, FileText, Clock, FileStack, Settings, ScrollText } from 'lucide-react';

const FraudNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { path: '/fraude', label: 'Painel', icon: LayoutDashboard, exact: true },
        { path: '/fraude/relatorios', label: 'Relatórios', icon: FileText },
        { path: '/fraude/fila', label: 'Fila', icon: Clock },
        { path: '/fraude/eventos', label: 'Histórico', icon: FileStack },
        { path: '/fraude/configuracao', label: 'Config', icon: Settings },
        { path: '/fraude/logs', label: 'Logs', icon: ScrollText },
    ];

    const isActive = (path: string, exact: boolean = false) => {
        if (exact) {
            return location.pathname === path;
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
            {tabs.map((tab) => {
                const active = isActive(tab.path, tab.exact);
                return (
                    <Button
                        key={tab.path}
                        variant={active ? "default" : "ghost"}
                        onClick={() => navigate(tab.path)}
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
