import React from "react";

interface PerformanceKPIsProps {
    financialSummary: any;
    driverBreakdown: any[];
    isDark: boolean;
}

export function PerformanceKPIs({
    financialSummary,
    driverBreakdown,
    isDark
}: PerformanceKPIsProps) {
    const cardStyle = {
        background: isDark ? "#1e293b" : "#ffffff",
        borderRadius: "0.5rem",
        padding: "1rem",
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "center",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
    };

    const cardTitle = {
        fontSize: "0.875rem",
        fontWeight: "500",
        color: isDark ? "#94a3b8" : "#64748b",
        marginBottom: "0.25rem",
    };

    const cardValue = {
        fontSize: "1.5rem",
        fontWeight: "700",
        color: isDark ? "#ffffff" : "#0f172a",
    };

    const cardSublabel = {
        fontSize: "0.75rem",
        color: isDark ? "#64748b" : "#94a3b8",
        marginTop: "0.25rem",
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.5rem", marginTop: "1rem" }}>
            {/* === COLUNA ESQUERDA: EMPRESA === */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Faturamento Total (100%) */}
                <div style={{ ...cardStyle, borderLeft: "4px solid #3b82f6" }}>
                    <span style={cardTitle}>Faturamento Total</span>
                    <span style={cardValue}>R$ {financialSummary.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span style={cardSublabel}>100% (App + Particular)</span>
                </div>

                {/* Lucro Bruto Empresa (60%) */}
                <div style={{ ...cardStyle, borderLeft: "4px solid #22c55e" }}>
                    <span style={cardTitle}>Lucro Bruto Empresa</span>
                    <span style={cardValue}>R$ {financialSummary.lucroBrutoEmpresa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span style={cardSublabel}>60% do Faturamento Total</span>
                </div>

                {/* Custo Total */}
                <div style={{ ...cardStyle, borderLeft: "4px solid #ef4444" }}>
                    <span style={cardTitle}>Custo Total</span>
                    <span style={cardValue}>R$ {financialSummary.custosTotais.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span style={cardSublabel}>Fixos: R$ {financialSummary.custosFixosMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} + Var: R$ {financialSummary.custosVariaveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                </div>

                {/* Lucro Líquido Empresa */}
                <div style={{ ...cardStyle, borderLeft: `4px solid ${financialSummary.lucroLiquidoEmpresa >= 0 ? "#22c55e" : "#ef4444"}` }}>
                    <span style={cardTitle}>Lucro Líquido Empresa</span>
                    <span style={{ ...cardValue, color: financialSummary.lucroLiquidoEmpresa >= 0 ? "#22c55e" : "#ef4444" }}>
                        R$ {financialSummary.lucroLiquidoEmpresa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span style={cardSublabel}>Lucro Bruto (60%) - Custo Total</span>
                </div>
            </div>

            {/* === COLUNA CENTRAL: P.E. EMPRESA === */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", justifyContent: "flex-start" }}>
                <div style={{ ...cardStyle, borderLeft: "4px solid #f59e0b", width: "100%", minHeight: "200px", justifyContent: "space-between" }}>
                    <div>
                        <span style={{ ...cardTitle, display: "block", textAlign: "center", marginBottom: "0.5rem" }}>P.E. Empresa (Break-Even)</span>
                        <div style={{ textAlign: "center", marginBottom: "1rem" }}>
                            <span style={{ fontSize: "2rem", fontWeight: "700", color: "#f59e0b" }}>
                                R$ {financialSummary.targetReceitaBruta.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span style={{ display: "block", fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                                Meta de Faturamento para Zero Prejuízo
                            </span>
                        </div>
                    </div>

                    <div style={{ width: "100%", padding: "0 1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem", fontSize: "0.75rem", fontWeight: "600", color: isDark ? "#fff" : "#0f172a" }}>
                            <span>Progresso</span>
                            <span>{financialSummary.progressoPE.toFixed(1)}%</span>
                        </div>
                        <div style={{ width: "100%", height: "10px", backgroundColor: isDark ? "#334155" : "#e2e8f0", borderRadius: "5px", overflow: "hidden" }}>
                            <div style={{
                                width: `${Math.min(financialSummary.progressoPE, 100)}%`,
                                height: "100%",
                                backgroundColor: financialSummary.progressoPE >= 100 ? "#22c55e" : "#f59e0b",
                                transition: "width 0.5s ease"
                            }} />
                        </div>
                        <div style={{ marginTop: "0.5rem", textAlign: "center", fontSize: "0.75rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                            {financialSummary.progressoPE >= 100
                                ? "✅ Ponto de equilíbrio atingido!"
                                : `Faltam R$ ${financialSummary.faltaParaPE.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            }
                        </div>
                    </div>
                </div>
            </div>

            {/* === COLUNA DIREITA: MOTORISTAS === */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Faturamento Bruto Motorista (40%) */}
                <div style={{ ...cardStyle, borderLeft: "4px solid #8b5cf6" }}>
                    <span style={cardTitle}>Faturamento Bruto Motorista</span>
                    <span style={cardValue}>R$ {financialSummary.repasseMotorista.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span style={cardSublabel}>40% do Faturamento Total</span>
                </div>

                {/* Custos do Motorista (Placeholder) */}
                <div style={{ ...cardStyle, borderLeft: "4px solid #64748b" }}>
                    <span style={cardTitle}>Custos do Motorista</span>
                    <span style={{ ...cardValue, color: "#64748b" }}>R$ —</span>
                    <span style={cardSublabel}>Dados a definir</span>
                </div>

                {/* Lucro Líquido Motorista + Tabela */}
                <div style={{ ...cardStyle, borderLeft: "4px solid #8b5cf6", flex: 1 }}>
                    <span style={cardTitle}>Lucro Líquido Motorista</span>
                    <span style={cardValue}>R$ {financialSummary.repasseMotorista.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span style={cardSublabel}>Por enquanto = Faturamento Bruto Motorista</span>

                    {/* Tabela de breakdown por motorista */}
                    <div style={{ marginTop: "1rem" }}>
                        <table style={{ width: "100%", fontSize: "0.8rem", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: `1px solid ${isDark ? "#334155" : "#e2e8f0"}` }}>
                                    <th style={{ textAlign: "center", padding: "0.5rem 0", color: isDark ? "#94a3b8" : "#64748b", width: "5%" }}>#</th>
                                    <th style={{ textAlign: "left", padding: "0.5rem 0.25rem", color: isDark ? "#94a3b8" : "#64748b" }}>Motorista</th>
                                    <th style={{ textAlign: "right", padding: "0.5rem 0.25rem", color: isDark ? "#94a3b8" : "#64748b" }}>Valor (40%)</th>
                                    <th style={{ textAlign: "right", padding: "0.5rem 0.25rem", color: isDark ? "#94a3b8" : "#64748b" }}>Vlr. 60%</th>
                                    <th style={{ textAlign: "right", padding: "0.5rem 0.25rem", color: isDark ? "#94a3b8" : "#64748b" }}>Vlr. Total</th>
                                    <th style={{ textAlign: "right", padding: "0.5rem 0", color: isDark ? "#94a3b8" : "#64748b", width: "10%" }}>%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {driverBreakdown.map((d: any, index: number) => {
                                    const percent = financialSummary.repasseMotorista > 0 ? (d.valor / financialSummary.repasseMotorista) * 100 : 0;
                                    const valor60 = d.valorTotal * 0.60;
                                    return (
                                        <tr key={d.nome} style={{ borderBottom: `1px solid ${isDark ? "#1e293b" : "#f1f5f9"}` }}>
                                            <td style={{ textAlign: "center", padding: "0.4rem 0", color: isDark ? "#64748b" : "#94a3b8", fontSize: "0.75rem" }}>{index + 1}º</td>
                                            <td style={{ padding: "0.4rem 0.25rem", color: isDark ? "#e2e8f0" : "#1e293b", whiteSpace: "nowrap" }}>{d.nome}</td>
                                            <td style={{ textAlign: "right", padding: "0.4rem 0.25rem", color: "#8b5cf6", fontWeight: "600" }}>
                                                R$ {d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ textAlign: "right", padding: "0.4rem 0.25rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                                                R$ {valor60.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ textAlign: "right", padding: "0.4rem 0.25rem", color: isDark ? "#94a3b8" : "#64748b" }}>
                                                R$ {d.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ textAlign: "right", padding: "0.4rem 0", color: isDark ? "#94a3b8" : "#64748b", fontSize: "0.75rem" }}>
                                                {percent.toFixed(2)}%
                                            </td>
                                        </tr>
                                    );
                                })}
                                {driverBreakdown.length === 0 && (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: "center", padding: "1rem 0", color: isDark ? "#64748b" : "#94a3b8" }}>
                                            Nenhum motorista no período
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
