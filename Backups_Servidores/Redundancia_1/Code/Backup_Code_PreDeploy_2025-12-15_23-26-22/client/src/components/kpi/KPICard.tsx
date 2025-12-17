import { useTheme } from "../../contexts/ThemeContext";

export const KPICard = ({ title, value, sublabel, icon: Icon, color, gradient }: any) => {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const getGradient = (g: string) => {
        if (!g) return "transparent";
        switch (g) {
            case "green": return isDark ? "rgba(34, 197, 94, 0.1)" : "rgba(34, 197, 94, 0.1)";
            case "red": return isDark ? "rgba(239, 68, 68, 0.1)" : "rgba(239, 68, 68, 0.1)";
            case "blue": return isDark ? "rgba(59, 130, 246, 0.1)" : "rgba(59, 130, 246, 0.1)";
            case "purple": return isDark ? "rgba(168, 85, 247, 0.1)" : "rgba(168, 85, 247, 0.1)";
            case "orange": return isDark ? "rgba(249, 115, 22, 0.1)" : "rgba(249, 115, 22, 0.1)";
            default: return "transparent";
        }
    };

    const getIconColor = (g: string) => {
        switch (g) {
            case "green": return isDark ? "#4ade80" : "#166534";
            case "red": return isDark ? "#f87171" : "#991b1b";
            case "blue": return isDark ? "#60a5fa" : "#1e40af";
            case "purple": return isDark ? "#c084fc" : "#6b21a8";
            case "orange": return isDark ? "#fb923c" : "#9a3412";
            default: return isDark ? "#fff" : "#000";
        }
    };

    return (
        <div style={{
            padding: "1.5rem",
            borderRadius: "0.75rem",
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            position: "relative",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
            <div style={{
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                background: getGradient(gradient),
                opacity: 0.5,
                zIndex: 0
            }} />

            <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                    <h3 style={{ fontSize: "0.875rem", fontWeight: 500, color: isDark ? "#cbd5e1" : "#64748b", margin: 0 }}>{title}</h3>
                    <div style={{ fontSize: "1.5rem", fontWeight: 700, color: isDark ? "#ffffff" : "#0f172a", margin: "0.5rem 0" }}>{value}</div>
                    <p style={{ fontSize: "0.75rem", color: isDark ? "#cbd5e1" : "#64748b" }}>{sublabel}</p>
                </div>
                <div style={{ padding: "0.5rem", borderRadius: "0.5rem", backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}>
                    <Icon size={20} color={getIconColor(gradient)} />
                </div>
            </div>
        </div>
    );
};
