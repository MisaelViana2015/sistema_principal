import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import {
    Shield, Users, Car, Calendar, MapPin,
    TrendingUp, AlertTriangle, Upload, ChevronRight
} from "lucide-react";
import HeaderNew from "../components/layout/HeaderNew";
import DriversList from "../modules/drivers/DriversList";
import VehiclesList from "../modules/vehicles/VehiclesList";
import ShiftsList from "../modules/shifts/ShiftsList";
import { RidesList } from "../modules/rides/RidesList";
import ImportTab from "./admin/tabs/ImportTab";
import PerformanceContent from "../modules/performance/components/PerformanceContent";
import FraudDashboard from "../modules/Fraud/FraudDashboard";
import AuditPage from "../pages/AuditPage";
import { useTheme } from "../contexts/ThemeContext";
import { api } from "../lib/api";

type TabValue =
    | "motoristas" | "veiculos" | "turnos" | "corridas"
    | "analise" | "fraude" | "importar" | "auditoria";

interface TabItem {
    value: TabValue;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    color: string;
}

export default function Admin() {
    const [activeTab, setActiveTab] = useState<TabValue>("fraude");
    const [alertCount, setAlertCount] = useState<number>(0);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        async function fetchAlertCount() {
            try {
                const res = await api.get("/maintenance/alert-count");
                if (res.data.success) {
                    setAlertCount(res.data.data.total);
                }
            } catch (error) {
                console.error("Failed to fetch maintenance alerts:", error);
            }
        }
        fetchAlertCount();
    }, []);

    const handleFixDB = async () => {
        if (!confirm("Isso vai forçar a atualização dos nomes no banco de dados PRODUÇÃO. Continuar?")) return;
        try {
            const res = await api.post("/maintenance/fix-db-data");
            console.log("DB Fix Result:", res.data);
            alert("Banco Atualizado! \n\nDiagnóstico TQU0H17:\n" + JSON.stringify(res.data.data, null, 2));
            window.location.reload();
        } catch (err: any) {
            console.error(err);
            alert("Erro: " + (err.response?.data?.error || err.message));
        }
    };

    const tabs: TabItem[] = [
        { value: "fraude", label: "Fraude", icon: AlertTriangle, color: "from-red-500 to-orange-500" },
        { value: "auditoria", label: "Auditoria", icon: Shield, color: "from-cyan-500 to-blue-500" },
        { value: "motoristas", label: "Motoristas", icon: Users, color: "from-blue-500 to-cyan-500" },
        { value: "veiculos", label: "Veículos", icon: Car, badge: alertCount > 0 ? alertCount : undefined, color: "from-green-500 to-emerald-500" },
        { value: "turnos", label: "Turnos", icon: Calendar, color: "from-purple-500 to-violet-500" },
        { value: "corridas", label: "Corridas", icon: MapPin, color: "from-pink-500 to-rose-500" },
        { value: "analise", label: "Análise", icon: TrendingUp, color: "from-amber-500 to-yellow-500" },
        { value: "importar", label: "Importar", icon: Upload, color: "from-slate-500 to-gray-500" }
    ];

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-slate-100'}`}>
            <HeaderNew showDesktopNav={false} />

            <main className="flex-1 overflow-y-auto pb-8 pt-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

                    {/* Header Card - Hero Style */}
                    <Card className="relative overflow-hidden border-0 shadow-2xl">
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700" />

                        {/* Animated Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute inset-0" style={{
                                backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                                                  radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
                                backgroundSize: '50px 50px'
                            }} />
                        </div>

                        {/* Content */}
                        <div className="relative p-6 sm:p-8">
                            <div className="flex items-center gap-4">
                                <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 shadow-xl">
                                    <Shield className="w-10 h-10 text-white" strokeWidth={2} />
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                                        Área Administrativa
                                    </h1>
                                    <p className="text-white/80 mt-1 text-sm sm:text-base flex items-center gap-2">
                                        <span>Gestão completa do sistema Rota Verde</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Tabs Navigation - Modern Pills */}
                    <div className={`rounded-2xl p-4 sm:p-5 ${isDark ? 'bg-gray-900/80 border border-gray-800' : 'bg-white border border-gray-200'} shadow-xl backdrop-blur-sm`}>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {tabs.map(tab => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.value;

                                return (
                                    <button
                                        key={tab.value}
                                        onClick={() => setActiveTab(tab.value)}
                                        className={`
                                            relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                                            transition-all duration-300 ease-out
                                            ${isActive
                                                ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                                                : isDark
                                                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
                                        <span>{tab.label}</span>

                                        {/* Badge */}
                                        {tab.badge && (
                                            <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white animate-bounce">
                                                {tab.badge}
                                            </span>
                                        )}

                                        {/* Active Indicator Glow */}
                                        {isActive && (
                                            <div className={`absolute inset-0 rounded-xl bg-gradient-to-r ${tab.color} opacity-20 blur-lg -z-10`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className={`rounded-2xl p-4 sm:p-6 ${isDark ? 'bg-gray-900/50 border border-gray-800' : 'bg-white border border-gray-200'} shadow-lg`}>


                        {/* CONTEÚDO */}
                        <div>
                            {activeTab === "motoristas" && <DriversList />}
                            {activeTab === "veiculos" && (
                                <>
                                    <VehiclesList />
                                    <button
                                        onClick={handleFixDB}
                                        className="fixed bottom-4 right-4 z-50 bg-red-600 text-white px-2 py-1 rounded shadow-lg text-xs opacity-50 hover:opacity-100"
                                        title="Corrigir Nomes DB e Diagnosticar"
                                    >
                                        Fix DB
                                    </button>
                                </>
                            )}
                            {activeTab === "turnos" && <ShiftsList />}
                            {activeTab === "corridas" && <RidesList />}
                            {activeTab === "analise" && <PerformanceContent />}
                            {activeTab === "fraude" && <FraudDashboard />}
                            {activeTab === "auditoria" && (
                                <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-700 bg-[#0d1117]">
                                    <AuditPage />
                                </div>
                            )}
                            {activeTab === "importar" && <ImportTab />}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
