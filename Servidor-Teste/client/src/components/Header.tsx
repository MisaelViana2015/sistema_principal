import { Settings, Sun, Moon, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../lib/api";
import { useTheme } from "../contexts/ThemeContext";

/**
 * HEADER - Cabeçalho principal do sistema
 * ESTILO: CSS INLINE (conforme PADRAO_CSS.md)
 */

const styles = {
    header: (isDark: boolean) => ({
        backgroundColor: isDark ? '#1a2332' : '#ffffff',
        borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        position: 'sticky' as const,
        top: 0,
        zIndex: 40,
        transition: 'background-color 0.2s'
    }),
    container: {
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem'
    },
    content: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
    },
    leftSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    },
    logoContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    logoIcon: (isDark: boolean) => ({
        height: '32px',
        width: '32px',
        backgroundColor: isDark ? '#22c55e' : '#16a34a',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }),
    logoText: (isDark: boolean) => ({
        fontSize: '1.25rem',
        fontWeight: 'bold',
        color: isDark ? '#ffffff' : '#111827'
    }),
    userInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginLeft: '1rem'
    },
    userName: (isDark: boolean) => ({
        fontSize: '0.875rem',
        color: isDark ? '#d1d5db' : '#4b5563'
    }),
    badge: (isAdmin: boolean, isDark: boolean) => ({
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        borderRadius: '0.25rem',
        backgroundColor: isAdmin
            ? (isDark ? 'rgba(168, 85, 247, 0.3)' : '#f3e8ff')
            : (isDark ? 'rgba(59, 130, 246, 0.3)' : '#dbeafe'),
        color: isAdmin
            ? (isDark ? '#c084fc' : '#7c3aed')
            : (isDark ? '#60a5fa' : '#2563eb')
    }),
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    },
    button: (isDark: boolean, isRed = false) => ({
        padding: '0.5rem',
        borderRadius: '0.5rem',
        border: 'none',
        cursor: 'pointer',
        color: isRed
            ? (isDark ? '#f87171' : '#dc2626')
            : (isDark ? '#d1d5db' : '#4b5563'),
        backgroundColor: 'transparent',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: isRed
                ? (isDark ? 'rgba(220, 38, 38, 0.2)' : '#fee2e2')
                : (isDark ? '#374151' : '#f3f4f6')
        }
    } as React.CSSProperties)
};

export default function Header() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const user = authService.getUser();
    const isDark = theme === 'dark';

    const handleLogout = async () => {
        await authService.logout();
        navigate("/login");
    };

    return (
        <header style={styles.header(isDark)}>
            <div style={styles.container}>
                <div style={styles.content}>
                    {/* Logo e User Info */}
                    <div style={styles.leftSection}>
                        {/* Logo */}
                        <div style={styles.logoContainer}>
                            <div style={styles.logoIcon(isDark)}>
                                <svg
                                    style={{ height: '20px', width: '20px', color: '#ffffff' }}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <h1 style={styles.logoText(isDark)}>
                                Rota Verde
                            </h1>
                        </div>

                        {/* User Info */}
                        {user && (
                            <div style={styles.userInfo}>
                                <span style={styles.userName(isDark)}>
                                    {user.nome}
                                </span>
                                <span style={styles.badge(user.role === "admin", isDark)}>
                                    {user.role === "admin" ? "Admin" : "Motorista"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={styles.actions}>
                        {/* Botão Admin - Apenas Admin (Simulado para teste) */}
                        <button
                            onClick={() => navigate("/admin-legacy")}
                            style={{
                                ...styles.button(isDark),
                                backgroundColor: isDark ? 'rgba(79, 70, 229, 0.2)' : '#e0e7ff',
                                color: isDark ? '#818cf8' : '#4338ca',
                                marginLeft: '0.25rem'
                            }}
                            title="Admin Replit (Legado)"
                        >
                            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>REPLIT</span>
                        </button>

                        {/* Botão Admin Original */}
                        {user?.role === "admin" && (
                            <button
                                onClick={() => navigate("/admin")}
                                style={styles.button(isDark)}
                                title="Painel Administrativo (Novo)"
                            >
                                <Settings style={{ width: '20px', height: '20px' }} />
                            </button>
                        )}

                        {/* Toggle Dark Mode */}
                        <button
                            onClick={toggleTheme}
                            style={styles.button(isDark)}
                            title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                        >
                            {theme === "dark" ? (
                                <Sun style={{ width: '20px', height: '20px' }} />
                            ) : (
                                <Moon style={{ width: '20px', height: '20px' }} />
                            )}
                        </button>

                        {/* Botão Logout */}
                        <button
                            onClick={handleLogout}
                            style={styles.button(isDark, true)}
                            title="Sair"
                        >
                            <LogOut style={{ width: '20px', height: '20px' }} />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
