import { useNavigate } from "react-router-dom";
import { authService } from "../lib/api";
import { useEffect, useState } from "react";
import ThemeToggle from "../components/ThemeToggle";
import MainLayout from "../components/MainLayout";

export default function DashboardPage() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        if (!authService.isAuthenticated()) {
            navigate("/login");
            return;
        }

        const userData = authService.getUser();
        setUser(userData);
    }, [navigate]);

    const handleLogout = async () => {
        await authService.logout();
        navigate("/login");
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* Header */}
                <header className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 bg-green-600 dark:bg-green-500 rounded-full flex items-center justify-center">
                                <svg
                                    className="h-6 w-6 text-white"
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
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rota Verde</h1>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.nome}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                Sair
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8 transition-colors">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Bem-vindo, {user.nome}! 👋
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300">
                            Sistema de Gestão de Frota - Versão 1.0
                        </p>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Status do Sistema
                                </h3>
                                <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">Sistema operacional</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Seu Perfil
                                </h3>
                                <svg
                                    className="h-6 w-6 text-green-600 dark:text-green-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 transition-colors">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Permissões
                                </h3>
                                <svg
                                    className="h-6 w-6 text-green-600 dark:text-green-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                                {user.role === "admin" ? "Administrador" : "Motorista"}
                            </p>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 transition-colors">
                        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
                            🚀 Próximos Passos
                        </h3>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                            <li>✅ Sistema de login implementado</li>
                            <li>✅ Autenticação JWT funcionando</li>
                            <li>✅ Banco de dados PostgreSQL conectado</li>
                            <li>✅ Dark Mode implementado</li>
                            <li className="text-blue-600 dark:text-blue-400">
                                ⏳ Aguardando implementação de funcionalidades...
                            </li>
                        </ul>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}
