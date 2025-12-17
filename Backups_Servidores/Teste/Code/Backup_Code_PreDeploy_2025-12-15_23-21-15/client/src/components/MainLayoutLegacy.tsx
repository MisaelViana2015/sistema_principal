import { ReactNode } from "react";
import Navigation from "./Navigation";
import Header from "./Header";
import { useTheme } from "../contexts/ThemeContext";

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            overflowX: 'hidden',
            boxSizing: 'border-box',
            backgroundColor: isDark ? '#111827' : '#f9fafb',
            transition: 'background-color 0.2s'
        }}>
            <Header />
            <main style={{
                paddingTop: '1rem',
                paddingBottom: '80px', // Ajustado para a nova Bottom Nav padrão
                minHeight: '100vh',
                paddingLeft: '1rem',
                paddingRight: '1rem'
            }}>
                {children}
            </main>
            <Navigation />
        </div>
    );
}
