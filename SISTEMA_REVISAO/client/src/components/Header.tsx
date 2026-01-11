import { Settings, Sun, Moon, LogOut, Menu, MonitorPlay } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { authService } from "../lib/api";
import { useTheme } from "../contexts/ThemeContext";
import { SYSTEM_VERSION } from "../../../shared/version";

/**
 * HEADER - Cabeçalho principal do sistema
 * Refatorado para seguir padrão visual limpo (HyperUI Style)
 * Atualizado: 2025-12-17 - Badge de função do usuário
 */

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
        <header className={`sticky top-0 z-40 w-full transition-colors duration-200 border-b ${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-gray-200'}`}>
            <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* ESQUERDA: Logo + Identificação */}
                    <div className="flex items-center gap-4">
                        <div
                            className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
                            onClick={() => navigate("/")}
                        >

                            <span className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Rota Verde
                            </span>
                        </div>
                    </div>

                    {/* CENTRO/DIREITA: Ações e Perfil */}
                    <div className="flex items-center gap-4">

                        {/* Info Usuário (Nome + Badge de Função) */}
                        {user && (
                            <div className="hidden md:flex items-center gap-3 border-r pr-4 border-gray-300 dark:border-gray-700">
                                <div className="text-right">
                                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {user.nome}
                                    </p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded ${user.role === 'admin'
                                        ? isDark
                                            ? 'bg-purple-500/30 text-purple-300'
                                            : 'bg-purple-100 text-purple-700'
                                        : isDark
                                            ? 'bg-blue-500/30 text-blue-300'
                                            : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {user.role === 'admin' ? 'Administrador' : 'Motorista'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Botões de Ação */}
                        <div className="flex items-center gap-2">

                            {/* Botão Admin Legacy (Replit) - Minimalista */}
                            <button
                                onClick={() => navigate("/admin-legacy")}
                                className={`group rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-slate-800 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                                title="Acessar Admin Legado (Replit)"
                            >
                                <span className="sr-only">Legacy Admin</span>
                                <MonitorPlay className="h-5 w-5 group-hover:text-indigo-500 transition-colors" />
                            </button>

                            {/* Botão Configurações (Novo Admin) - Apenas Admin */}
                            {user?.role === "admin" && (
                                <button
                                    onClick={() => navigate("/admin")}
                                    className={`rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-slate-800 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                                    title="Painel Administrativo"
                                >
                                    <span className="sr-only">Configurações</span>
                                    <Settings className="h-5 w-5 hover:animate-spin-slow" />
                                </button>
                            )}

                            {/* Toggle Tema (Minimalista) */}
                            <button
                                onClick={toggleTheme}
                                className={`rounded-lg p-2 transition hover:bg-gray-100 dark:hover:bg-slate-800 ${isDark ? 'text-amber-400' : 'text-gray-500'}`}
                                title="Alternar Tema"
                            >
                                <span className="sr-only">Tema</span>
                                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </button>

                            {/* Separador */}
                            <div className="h-8 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>

                            {/* Botão Logout (Destacado sutilmente em vermelho ao hover) */}
                            <button
                                onClick={handleLogout}
                                className={`rounded-lg p-2 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                                title="Sair do Sistema"
                            >
                                <span className="sr-only">Sair</span>
                                <LogOut className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header >
    );
}
