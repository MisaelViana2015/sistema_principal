import { NavLink } from "react-router-dom";
import { Users, Car, FileText, Settings, BarChart3, Shield } from "lucide-react";

/**
 * ADMIN NAVIGATION - MENU DE NAVEGAÇÃO PARA ADMINISTRADORES
 * 
 * Menu inferior específico para usuários com role="admin"
 * Contém funcionalidades administrativas
 */

interface AdminNavItem {
    path: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

const adminNavItems: AdminNavItem[] = [
    { path: "/admin/motoristas", label: "Motoristas", icon: Users },
    { path: "/admin/veiculos", label: "Veículos", icon: Car },
    { path: "/admin/relatorios", label: "Relatórios", icon: FileText },
    { path: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
    { path: "/admin/configuracoes", label: "Config", icon: Settings },
];

export default function AdminNavigation() {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#1a2332] border-t border-gray-700 z-50">
            <div className="max-w-7xl mx-auto px-4">
                {/* Badge Admin */}
                <div className="flex items-center justify-center py-1 bg-gradient-to-r from-purple-600 to-purple-700">
                    <Shield className="w-4 h-4 text-white mr-2" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Painel Administrativo
                    </span>
                </div>

                {/* Menu Items */}
                <div className="flex items-center justify-around h-20">
                    {adminNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 group ${isActive
                                        ? "text-white"
                                        : "text-gray-400 hover:text-gray-200"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div
                                            className={`p-2 rounded-lg transition-all duration-200 ${isActive
                                                    ? "bg-purple-600 shadow-lg shadow-purple-600/50"
                                                    : "group-hover:bg-gray-700"
                                                }`}
                                        >
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-medium">
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
