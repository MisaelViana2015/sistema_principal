
import React, { useState } from "react";
import { Shield, AlertTriangle, TrendingUp, Users, RefreshCw, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

// Dados Mockados de Relatório de Fraude
const MOCK_FRAUD_REPORT = {
    totalTurnos: 45,
    totalSuspeitos: 3,
    totalCriticos: 1,
    taxaRisco: "7%",
    ranking: [
        { id: "1", nome: "Carlos Santos", turnos: 12, score: 75, nivel: "critico" },
        { id: "2", nome: "Ana Pereira", turnos: 8, score: 45, nivel: "suspeito" },
        { id: "3", nome: "João Silva", turnos: 15, score: 12, nivel: "ok" },
    ],
    alertas: [
        { id: "a1", motorista: "Carlos Santos", hora: "07:00 - 19:00", score: 75, nivel: "critico", regras: 3, receita: 850.00 },
        { id: "a2", motorista: "Ana Pereira", hora: "08:00 - 18:00", score: 45, nivel: "suspeito", regras: 1, receita: 320.00 },
    ]
};

export default function FraudeTabLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [expandedIds, setExpandedIds] = useState<string[]>([]);

    const toggleExpand = (id: string) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const getBadgeStyle = (nivel: string) => {
        if (nivel === "critico") return { bg: isDark ? "rgba(239, 68, 68, 0.2)" : "#fee2e2", text: isDark ? "#fca5a5" : "#991b1b", label: "CRÍTICO" };
        if (nivel === "suspeito") return { bg: isDark ? "rgba(234, 179, 8, 0.2)" : "#fef9c3", text: isDark ? "#facc15" : "#854d0e", label: "SUSPEITO" };
        return { bg: isDark ? "rgba(34, 197, 94, 0.2)" : "#dcfce7", text: isDark ? "#4ade80" : "#166534", label: "OK" };
    };

    const styles = {
        container: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "1.5rem",
        },
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        },
        title: {
            fontSize: "1.25rem",
            fontWeight: "700",
            color: isDark ? "#ffffff" : "#0f172a",
            margin: 0,
        },
        summaryGrid: {
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
        },
        summaryCard: {
            padding: "1.5rem",
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            borderRadius: "0.75rem",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.5rem",
        },
        cardValue: (color: string) => ({
            fontSize: "1.5rem",
            fontWeight: "700",
            color: color,
        }),
        cardLabel: {
            fontSize: "0.875rem",
            color: isDark ? "#cbd5e1" : "#64748b",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        },
        sectionTitle: {
            fontSize: "1rem",
            fontWeight: "600",
            color: isDark ? "#ffffff" : "#0f172a",
            marginTop: "1rem",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        },
        listContainer: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "0.5rem",
        },
        listItem: {
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            borderRadius: "0.5rem",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        },
        badge: (style: any) => ({
            padding: "0.25rem 0.5rem",
            borderRadius: "0.25rem",
            fontSize: "0.75rem",
            fontWeight: "700",
            backgroundColor: style.bg,
            color: style.text,
        })
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>Detecção de Fraude</h2>
                    <p style={{ fontSize: "0.875rem", opacity: 0.7, color: isDark ? "#cbd5e1" : "#64748b" }}>Análise automática de anomalias</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button style={{ padding: "0.5rem 1rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, background: "transparent", color: isDark ? "#e2e8f0" : "#1e293b", fontSize: "0.875rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Calendar size={14} /> Hoje
                    </button>
                    <button style={{ padding: "0.5rem", borderRadius: "0.375rem", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, background: "transparent", color: isDark ? "#e2e8f0" : "#1e293b", cursor: "pointer" }}>
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {/* Cards de Resumo */}
            <div style={styles.summaryGrid}>
                <div style={styles.summaryCard}>
                    <div style={styles.cardLabel}>
                        Total de Turnos <Shield size={16} />
                    </div>
                    <div style={styles.cardValue(isDark ? "#ffffff" : "#0f172a")}>{MOCK_FRAUD_REPORT.totalTurnos}</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={styles.cardLabel}>
                        Suspeitos <AlertTriangle size={16} color="#eab308" />
                    </div>
                    <div style={styles.cardValue("#eab308")}>{MOCK_FRAUD_REPORT.totalSuspeitos}</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={styles.cardLabel}>
                        Críticos <AlertTriangle size={16} color="#ef4444" />
                    </div>
                    <div style={styles.cardValue("#ef4444")}>{MOCK_FRAUD_REPORT.totalCriticos}</div>
                </div>
                <div style={styles.summaryCard}>
                    <div style={styles.cardLabel}>
                        Taxa de Risco <TrendingUp size={16} />
                    </div>
                    <div style={styles.cardValue(isDark ? "#ffffff" : "#0f172a")}>{MOCK_FRAUD_REPORT.taxaRisco}</div>
                </div>
            </div>

            {/* Turnos com Anomalias */}
            <div>
                <h3 style={styles.sectionTitle}>
                    <AlertTriangle size={18} /> Turnos com Anomalias Detectadas
                </h3>
                <div style={styles.listContainer}>
                    {MOCK_FRAUD_REPORT.alertas.map((alerta) => {
                        const style = getBadgeStyle(alerta.nivel);
                        const isExpanded = expandedIds.includes(alerta.id);
                        return (
                            <div key={alerta.id} style={{ display: "flex", flexDirection: "column", border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, borderRadius: "0.5rem", backgroundColor: isDark ? "#1e293b" : "#ffffff", overflow: "hidden" }}>
                                <div style={{ padding: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <span style={styles.badge(style)}>{style.label}</span>
                                        <div>
                                            <div style={{ fontWeight: 600, color: isDark ? "#e2e8f0" : "#0f172a" }}>{alerta.motorista}</div>
                                            <div style={{ fontSize: "0.8rem", opacity: 0.7, color: isDark ? "#cbd5e1" : "#64748b" }}>{alerta.hora}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "0.875rem", fontWeight: 600, color: isDark ? "#e2e8f0" : "#0f172a" }}>Score: {alerta.score}</div>
                                            <div style={{ fontSize: "0.75rem", opacity: 0.7, color: isDark ? "#cbd5e1" : "#64748b" }}>{alerta.regras} regras disparadas</div>
                                        </div>
                                        <button onClick={() => toggleExpand(alerta.id)} style={{ background: "transparent", border: "none", color: isDark ? "#fff" : "#000", cursor: "pointer" }}>
                                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div style={{ padding: "1rem", borderTop: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`, backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)", fontSize: "0.875rem", color: isDark ? "#e2e8f0" : "#0f172a" }}>
                                        <p style={{ margin: 0, marginBottom: "0.5rem" }}><strong>Detalhes da Análise:</strong></p>
                                        <ul style={{ paddingLeft: "1.5rem", margin: 0, opacity: 0.8 }}>
                                            <li>Receita anormalmente alta para o período ({alerta.receita.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })})</li>
                                            <li>Intervalo de descanso menor que o permitido</li>
                                            {alerta.nivel === 'critico' && <li>Incongruência no hodômetro final</li>}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Ranking de Risco */}
            <div>
                <h3 style={styles.sectionTitle}>
                    <Users size={18} /> Ranking de Risco
                </h3>
                <div style={styles.listContainer}>
                    {MOCK_FRAUD_REPORT.ranking.map((motorista, index) => {
                        const style = getBadgeStyle(motorista.nivel);
                        return (
                            <div key={motorista.id} style={styles.listItem}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: isDark ? "#334155" : "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "0.8rem" }}>{index + 1}</div>
                                    <div>
                                        <div style={{ fontWeight: 500, color: isDark ? "#e2e8f0" : "#0f172a" }}>{motorista.nome}</div>
                                        <div style={{ fontSize: "0.8rem", opacity: 0.7, color: isDark ? "#cbd5e1" : "#64748b" }}>{motorista.turnos} turnos</div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ textAlign: "right", fontSize: "0.875rem", color: isDark ? "#e2e8f0" : "#0f172a" }}>Score Médio: <strong>{motorista.score}</strong></div>
                                    <span style={styles.badge(style)}>{style.label}</span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
