
import { useState } from "react";
import { Shield, Car, Users, DollarSign, Wrench, AlertCircle, Plus, Filter, Edit, Trash2, ArrowUp, ArrowDown, Upload, TrendingUp, ChevronLeft, ChevronRight, Calendar, AlertTriangle, BarChart3 } from "lucide-react";
import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import MotoristasTabLegacy from "./tabs/MotoristasTabLegacy";
import VeiculosTabLegacy from "./tabs/VeiculosTabLegacy";
import TurnosTabLegacy from "./tabs/TurnosTabLegacy";
import CorridasTabLegacy from "./tabs/CorridasTabLegacy";
import AnaliseTabLegacy from "./tabs/AnaliseTabLegacy";
import FraudeTabLegacy from "./tabs/FraudeTabLegacy";
import DebugInfoLegacy from "./components/DebugInfoLegacy";

// Definição das Abas
const TABS = [
    { id: "motoristas", label: "Motoristas", icon: Users },
    { id: "veiculos", label: "Veículos", icon: Car },
    { id: "turnos", label: "Turnos", icon: Calendar },
    { id: "corridas", label: "Corridas", icon: Car },
    { id: "analise", label: "Análise", icon: BarChart3 },
    { id: "fraude", label: "Fraude", icon: Shield },
    { id: "importar", label: "Importar", icon: Upload },
    { id: "debug-nav", label: "Debug Nav", icon: Wrench },
];

export default function AdminLegacy() {
    const [activeTab, setActiveTab] = useState("motoristas");
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Estilos CSS Inline
    const styles = {
        container: {
            minHeight: "100vh",
            backgroundColor: isDark ? "#0f172a" : "#f8fafc", // slate-950 / slate-50
            padding: "1rem",
            display: "flex",
            flexDirection: "column" as const,
            gap: "1.5rem",
            fontFamily: "Inter, sans-serif",
        },
        headerCard: {
            // Gradiente Roxo/Indigo do original
            background: isDark
                ? "linear-gradient(135deg, #3730a3 0%, #581c87 50%, #4c1d95 100%)" // indigo-800 -> purple-900
                : "linear-gradient(135deg, #4338ca 0%, #6b21a8 50%, #581c87 100%)", // indigo-700 -> purple-800
            borderRadius: "0.75rem",
            padding: "1.5rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
        },
        headerContent: {
            display: "flex",
            alignItems: "center",
            gap: "1rem",
        },
        iconBox: {
            padding: "0.75rem",
            borderRadius: "0.75rem",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            fontSize: "1.875rem", // 3xl
            fontWeight: "700",
            margin: 0,
            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
        },
        subtitle: {
            fontSize: "0.875rem",
            opacity: 0.9,
            margin: "0.25rem 0 0 0",
        },
        tabsContainer: {
            display: "flex",
            flexWrap: "wrap" as const,
            gap: "0.5rem",
            borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            paddingBottom: "1rem",
        },
        tabButton: (isActive: boolean) => ({
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
            border: "none",
            outline: "none",
            transition: "all 0.2s",
            backgroundColor: isActive
                ? (isDark ? "#1e293b" : "#ffffff")
                : "transparent",
            color: isActive
                ? (isDark ? "#ffffff" : "#0f172a")
                : (isDark ? "#94a3b8" : "#64748b"),
            boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        }),
        contentArea: {
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            minHeight: "400px",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        },
        emptyState: {
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: isDark ? '#94a3b8' : '#64748b',
            gap: '1rem',
            marginTop: '3rem'
        }
    };

    return (
        <div style={styles.container}>
            {/* Header Roxo */}
            <div style={styles.headerCard}>
                <div style={styles.headerContent}>
                    <div style={styles.iconBox}>
                        <Shield size={32} color="white" />
                    </div>
                    <div>
                        <h1 style={styles.title}>Área Administrativa (REPLIT)</h1>
                        <p style={styles.subtitle}>Gestão completa do sistema Rota Verde (Versão Legado)</p>
                    </div>
                </div>
            </div>

            {/* Navegação de Abas */}
            <div style={styles.tabsContainer}>
                {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={styles.tabButton(activeTab === tab.id)}
                        >
                            {activeTab === tab.id && <Icon size={16} />}
                            {tab.label}
                        </button>
                    )
                })}
            </div>

            {/* Conteúdo da Aba */}
            <div style={styles.contentArea}>
                {activeTab === "motoristas" ? (
                    <MotoristasTabLegacy />
                ) : activeTab === "veiculos" ? (
                    <VeiculosTabLegacy />
                ) : activeTab === "turnos" ? (
                    <TurnosTabLegacy />
                ) : activeTab === "corridas" ? (
                    <CorridasTabLegacy />
                ) : activeTab === "analise" ? (
                    <AnaliseTabLegacy />
                ) : activeTab === "fraude" ? (
                    <FraudeTabLegacy />
                ) : (
                    <>
                        <div style={{ marginBottom: "1.5rem", borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, paddingBottom: "1rem" }}>
                            <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: isDark ? "#f8fafc" : "#0f172a", margin: 0 }}>
                                {TABS.find(t => t.id === activeTab)?.label}
                            </h2>
                        </div>

                        {/* Placeholder do Conteúdo */}
                        <div style={styles.emptyState}>
                            <Wrench size={48} opacity={0.5} />
                            <p>Conteúdo da aba <strong>{TABS.find(t => t.id === activeTab)?.label}</strong> será carregado aqui.</p>
                            <p style={{ fontSize: "0.875rem", opacity: 0.8 }}>
                                Esta é a estrutura "casca" para migração do código do Replit.
                            </p>
                        </div>
                    </>
                )}
            </div>

            {/* Debug Info Footer */}
            <DebugInfoLegacy />
        </div>
    );
}
