import { NavLink } from "react-router-dom";
import { Home, FileText, Wallet, TrendingUp, Car } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const navItems = [
    { to: "/turno", icon: Home, label: "Turno", roles: ["admin", "driver"] },
    { to: "/corridas", icon: FileText, label: "Corridas", roles: ["admin"] },
    { to: "/caixa", icon: Wallet, label: "Caixa", roles: ["admin"] },
    { to: "/desempenho", icon: TrendingUp, label: "Desempenho", roles: ["admin"] },
    { to: "/veiculos", icon: Car, label: "Veículos", roles: ["admin"] },
];

export default function Navigation() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const userRole = user?.role || "driver";
    const isDark = theme === 'dark';

    // Filtrar itens por role
    const visibleItems = navItems.filter(item =>
        item.roles.includes(userRole) || (userRole === "admin")
    );

    return (
        <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t pb-safe ${isDark ? 'bg-[#1e293b] border-slate-700' : 'bg-white border-gray-200'} transition-colors duration-200 shadow-lg`}>
            <div className="mx-auto max-w-screen-xl px-4">
                <div className="flex justify-center items-center h-16 gap-8 md:gap-12">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => `
                                    flex flex-col items-center justify-center min-w-[64px] py-1 space-y-1 transition-all duration-200
                                    ${isActive
                                        ? (isDark ? 'text-green-400' : 'text-green-600')
                                        : (isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700')}
                                `}
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`
                                            p-1.5 rounded-xl transition-all duration-200
                                            ${isActive ? (isDark ? 'bg-green-400/10' : 'bg-green-100') : 'bg-transparent'}
                                        `}>
                                            <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : 'scale-100'} transition-transform`} />
                                        </div>
                                        <span className={`text-[10px] font-medium tracking-wide ${isActive ? 'opacity-100' : 'opacity-70'}`}>
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
