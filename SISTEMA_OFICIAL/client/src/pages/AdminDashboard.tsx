import { useState } from "react";
import { Card } from "../components/ui/card";
import { Shield } from "lucide-react";
import HeaderNew from "../components/layout/HeaderNew";
import DriversList from "../modules/drivers/DriversList";
import VehiclesList from "../modules/vehicles/VehiclesList";
import ShiftsList from "../modules/shifts/ShiftsList";
import { RidesList } from "../modules/rides/RidesList";
import ImportTab from "./admin/tabs/ImportTab";
import PerformanceContent from "../modules/performance/components/PerformanceContent";
import { useTheme } from "../contexts/ThemeContext";

/**
 * ADMIN DASHBOARD - DARK MODE CORRIGIDO
 */

type TabValue =
    | "motoristas" | "veiculos" | "turnos" | "corridas"
    | "analise" | "fraude" | "importar";

interface TabItem {
    value: TabValue;
    label: string;
    badge?: number;
}

const tabs: TabItem[] = [
    { value: "motoristas", label: "Motoristas" },
    { value: "veiculos", label: "Veículos", badge: 3 },
    { value: "turnos", label: "Turnos" },
    { value: "corridas", label: "Corridas" },
    { value: "analise", label: "Análise" },
    { value: "fraude", label: "Fraude" },
    { value: "importar", label: "Importar" }
];


export default function Admin() {
    const [activeTab, setActiveTab] = useState<TabValue>("motoristas");
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const styles = {
        mainContainer: {
            backgroundColor: isDark ? '#111827' : '#f9fafb',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column' as const
        },
        contentWrapper: {
            flex: 1,
            overflowY: 'auto' as const,
            paddingBottom: '2rem'
        },
        tabsContainer: {
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            border: `1px solid ${isDark ? '#374151' : '#e2e8f0'}`,
            boxShadow: isDark
                ? '0 4px 6px rgba(0, 0, 0, 0.3)'
                : '0 1px 3px rgba(0, 0, 0, 0.1)'
        }
    };

    const tabButtonStyle = (isActive: boolean) => ({
        padding: '0.625rem 1.25rem',
        fontSize: '0.875rem',
        fontWeight: isActive ? '600' : '500',
        borderRadius: '0.5rem',
        border: `1px solid ${isActive
            ? (isDark ? '#6366f1' : '#4f46e5')
            : (isDark ? '#475569' : '#cbd5e1')
            }`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: isActive
            ? (isDark ? '#4f46e5' : '#eef2ff')
            : (isDark ? '#334155' : '#ffffff'),
        color: isActive
            ? '#ffffff'
            : (isDark ? '#cbd5e1' : '#64748b'),
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        boxShadow: isActive
            ? (isDark ? '0 2px 8px rgba(99, 102, 241, 0.4)' : '0 2px 8px rgba(79, 70, 229, 0.15)')
            : 'none'
    } as React.CSSProperties);

    const badgeStyle = {
        minWidth: '1.25rem',
        height: '1.25rem',
        padding: '0 0.375rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: '#ef4444',
        color: '#ffffff',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
    };

    const separatorStyle = {
        height: '1px',
        backgroundColor: isDark ? '#334155' : '#e2e8f0',
        margin: '1rem 0'
    };

    return (
        <div style={styles.mainContainer}>
            <HeaderNew showDesktopNav={false} />

            <main style={styles.contentWrapper}>
                <div className="max-w-7xl mx-auto p-6 space-y-8">
                    {/* Card Header */}
                    <Card className="overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-700 to-purple-800 dark:from-indigo-700 dark:via-purple-800 dark:to-indigo-950 border-0 shadow-2xl">
                        <div className="p-8">
                            <div className="flex items-center gap-5">
                                <div className="p-4 rounded-2xl bg-white/30 dark:bg-white/20 backdrop-blur-md shadow-lg">
                                    <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-white drop-shadow-lg tracking-tight">
                                        Área Administrativa
                                    </h1>
                                    <p className="text-base text-white/95 mt-2 font-medium">
                                        Gestão completa do sistema Rota Verde
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Tabs Container */}
                    <div style={styles.tabsContainer}>
                        <div className="space-y-6">
                            {/* Tabs - DUAS LINHAS */}
                            <div className="flex flex-col gap-3">
                                {/* LINHA 1 */}
                                <div className="flex flex-wrap gap-2">
                                    {tabs.slice(0, 7).map(tab => (
                                        <button
                                            key={tab.value}
                                            style={tabButtonStyle(activeTab === tab.value)}
                                            onClick={() => setActiveTab(tab.value)}
                                            onMouseEnter={(e) => {
                                                if (activeTab !== tab.value) {
                                                    e.currentTarget.style.backgroundColor = isDark ? '#475569' : '#f1f5f9';
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (activeTab !== tab.value) {
                                                    e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#ffffff';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }
                                            }}
                                        >
                                            {tab.label}
                                            {tab.badge && (
                                                <span style={badgeStyle}>{tab.badge}</span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* LINHA 2 */}
                                <div className="flex flex-wrap gap-2">
                                    {tabs.slice(7).map(tab => (
                                        <button
                                            key={tab.value}
                                            style={tabButtonStyle(activeTab === tab.value)}
                                            onClick={() => setActiveTab(tab.value)}
                                            onMouseEnter={(e) => {
                                                if (activeTab !== tab.value) {
                                                    e.currentTarget.style.backgroundColor = isDark ? '#475569' : '#f1f5f9';
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (activeTab !== tab.value) {
                                                    e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#ffffff';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }
                                            }}
                                        >
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Separador */}
                            <div style={separatorStyle} />

                            {/* CONTEÚDO */}
                            <div>
                                {activeTab === "motoristas" && <DriversList />}
                                {activeTab === "veiculos" && <VehiclesList />}
                                {activeTab === "turnos" && <ShiftsList />}
                                {activeTab === "corridas" && <RidesList />}
                                {activeTab === "analise" && <PerformanceContent />}
                                {activeTab === "fraude" && <div className="p-4 text-center text-gray-500">Módulo Fraude em migração</div>}
                                {activeTab === "importar" && <ImportTab />}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}


