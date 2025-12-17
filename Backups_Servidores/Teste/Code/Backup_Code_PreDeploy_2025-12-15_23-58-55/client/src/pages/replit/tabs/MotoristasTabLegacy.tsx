
import React, { useState } from "react";
import { Plus, Users, AlertCircle } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import GradientCardLegacy from "../components/GradientCardLegacy";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../../lib/api";

type Driver = {
    id: string;
    nome: string;
    email: string;
    role: string;
    isActive: boolean;
};

export default function MotoristasTabLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [creating, setCreating] = useState(false);

    const { data: drivers, isLoading, isError, error } = useQuery<Driver[]>({
        queryKey: ["/auth/drivers"],
        queryFn: async () => {
            const res = await api.get("/auth/drivers");
            return res.data.data;
        }
    });

    const styles = {
        container: {
            display: "flex",
            flexDirection: "column" as const,
            gap: "1rem",
        },
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap" as const,
            gap: "1rem",
        },
        title: {
            fontSize: "1.25rem", // text-xl
            fontWeight: "700", // font-bold
            color: isDark ? "#ffffff" : "#0f172a", // text-foreground
            margin: 0,
        },
        addButton: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            backgroundColor: isDark ? "#15803d" : "#16a34a", // green-700 / green-600
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.2s",
        },
        grid: {
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "1fr", // Mobile first
        },
        cardContent: {
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
        },
        driverInfo: {
            display: "flex",
            flexDirection: "column" as const,
        },
        driverName: {
            fontWeight: "700",
            fontSize: "1rem",
            margin: 0,
        },
        driverEmail: {
            fontSize: "0.875rem",
            opacity: 0.9,
            margin: 0,
        },
        editButton: {
            padding: "0.25rem 0.75rem",
            fontSize: "0.875rem",
            borderRadius: "0.25rem",
            border: "none",
            backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
            color: isDark ? "#ffffff" : "#0f172a",
            cursor: "pointer",
        }
    };

    if (isLoading) {
        return <div style={{ padding: "2rem", textAlign: "center", opacity: 0.6 }}>Carregando motoristas...</div>;
    }

    if (isError) {
        return (
            <div style={{ padding: "2rem", textAlign: "center", color: "#ef4444", border: "1px dashed #ef4444", borderRadius: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem" }}>
                    <AlertCircle />
                </div>
                <p style={{ fontWeight: "bold" }}>Erro ao carregar motoristas</p>
                <p style={{ fontSize: "0.875rem" }}>Verifique a conexão com o banco de dados.</p>
                <pre style={{ marginTop: "1rem", fontSize: "0.75rem", textAlign: "left", backgroundColor: "rgba(0,0,0,0.1)", padding: "0.5rem", borderRadius: "0.25rem", overflowX: "auto" }}>
                    {JSON.stringify(error, null, 2)}
                </pre>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header com Título e Botão */}
            <div style={styles.header}>
                <h2 style={styles.title}>Gestão de Motoristas</h2>
                <button
                    style={styles.addButton}
                    onClick={() => setCreating(true)}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = isDark ? "#166534" : "#15803d"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = isDark ? "#15803d" : "#16a34a"}
                >
                    <Plus size={16} />
                    Novo Motorista
                </button>
            </div>

            {/* Lista de Motoristas */}
            <div style={styles.grid}>
                {drivers?.map((driver, index) => (
                    <GradientCardLegacy
                        key={driver.id}
                        gradient={index % 2 === 0 ? "green" : "blue"}
                        onClick={() => console.log("Editar", driver.id)}
                    >
                        <div style={styles.cardContent}>
                            <div style={styles.driverInfo}>
                                <h3 style={styles.driverName}>{driver.nome}</h3>
                                <p style={styles.driverEmail}>{driver.email}</p>
                                <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>
                                    {driver.role === 'admin' ? '🛡️ Administrador' : '🚙 Motorista'}
                                    {driver.isActive ? ' • Ativo' : ' • Inativo'}
                                </span>
                            </div>
                            <button style={styles.editButton}>
                                Editar
                            </button>
                        </div>
                    </GradientCardLegacy>
                ))}
            </div>

            {/* Aviso */}
            <div style={{ padding: "1rem", textAlign: "center", opacity: 0.6, fontSize: "0.8rem", borderTop: "1px dashed gray", marginTop: "1rem" }}>
                <Users size={16} style={{ display: "inline", marginRight: "0.5rem", verticalAlign: "middle" }} />
                Dados em tempo real do banco de dados (Produção).
            </div>
        </div>
    );
}
