import { createContext, useContext, useEffect, ReactNode } from "react";

type Theme = "dark"; // SEMPRE DARK MODE

interface ThemeContextType {
    theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    // Tema fixo: sempre dark
    const theme: Theme = "dark";

    useEffect(() => {
        // Força a classe "dark" no HTML (permanente)
        const root = window.document.documentElement;
        root.classList.remove("light");
        root.classList.add("dark");

        // Limpa qualquer configuração antiga do localStorage
        localStorage.removeItem("theme");
    }, []);

    return (
        <ThemeContext.Provider value={{ theme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme deve ser usado dentro de ThemeProvider");
    }
    return context;
}
