
import React from "react";
import { useTheme } from "../../../contexts/ThemeContext";

type GradientColor = "green" | "blue" | "yellow" | "red" | "purple" | "orange";

interface GradientCardProps {
    gradient: GradientColor;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string; // Para compatibilidade, mas estilo será inline
}

export default function GradientCardLegacy({ gradient, children, onClick }: GradientCardProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const getBackground = () => {
        if (isDark) {
            switch (gradient) {
                case "green": return "hsla(142, 71%, 35%, 0.35)";
                case "blue": return "hsla(217, 91%, 50%, 0.35)";
                case "yellow": return "linear-gradient(135deg, hsla(45, 93%, 45%, 0.3) 0%, hsla(45, 93%, 55%, 0.4) 50%, hsla(45, 93%, 40%, 0.3) 100%)";
                case "red": return "linear-gradient(135deg, hsla(0, 84%, 55%, 0.3) 0%, hsla(0, 84%, 65%, 0.4) 50%, hsla(0, 84%, 50%, 0.3) 100%)";
                case "purple": return "linear-gradient(135deg, hsla(271, 91%, 58%, 0.3) 0%, hsla(271, 91%, 68%, 0.4) 50%, hsla(271, 91%, 53%, 0.3) 100%)";
                case "orange": return "linear-gradient(135deg, hsla(25, 95%, 50%, 0.3) 0%, hsla(25, 95%, 60%, 0.4) 50%, hsla(25, 95%, 45%, 0.3) 100%)";
                default: return "hsla(217, 91%, 50%, 0.35)";
            }
        } else {
            // Light Mode
            switch (gradient) {
                case "green": return "hsla(142, 71%, 45%, 0.30)";
                case "blue": return "hsla(217, 91%, 60%, 0.30)";
                case "yellow": return "linear-gradient(135deg, hsla(45, 93%, 52%, 0.25) 0%, hsla(45, 93%, 60%, 0.35) 50%, hsla(45, 93%, 48%, 0.25) 100%)";
                case "red": return "linear-gradient(135deg, hsla(0, 84%, 65%, 0.25) 0%, hsla(0, 84%, 72%, 0.35) 50%, hsla(0, 84%, 60%, 0.25) 100%)";
                case "purple": return "linear-gradient(135deg, hsla(271, 91%, 68%, 0.25) 0%, hsla(271, 91%, 78%, 0.35) 50%, hsla(271, 91%, 63%, 0.25) 100%)";
                case "orange": return "linear-gradient(135deg, hsla(25, 95%, 58%, 0.25) 0%, hsla(25, 95%, 65%, 0.35) 50%, hsla(25, 95%, 53%, 0.25) 100%)";
                default: return "hsla(217, 91%, 60%, 0.30)";
            }
        }
    };

    const styles = {
        container: {
            background: getBackground(),
            borderRadius: "0.5rem", // rounded-md
            padding: "1rem",
            marginBottom: "1rem",
            transition: "all 0.2s ease-in-out",
            cursor: onClick ? "pointer" : "default",
            border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
            color: isDark ? "#ffffff" : "#0f172a",
        }
    };

    return (
        <div style={styles.container} onClick={onClick}>
            {children}
        </div>
    );
}
