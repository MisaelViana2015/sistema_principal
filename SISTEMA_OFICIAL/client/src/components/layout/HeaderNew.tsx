import { Sun, Moon, LogOut, Car, DollarSign, Package, TrendingUp, Home, Shield, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logoRotaVerde from "@/assets/logo-rota-verde.png";
import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { SYSTEM_VERSION } from "../../../../shared/version"; // Import Version

interface HeaderProps {
    userName?: string;
    isAdmin?: boolean;
    showDesktopNav?: boolean;
}

const navItems = [
    { path: "/garagem", label: "Garagem", icon: Car },
    { path: "/corridas", label: "Corridas", icon: DollarSign },
    { path: "/caixa", label: "Caixa", icon: Package },
    { path: "/desempenho", label: "Desempenho", icon: TrendingUp },
    { path: "/fraude", label: "Fraude", icon: ShieldAlert },
];

const HeaderNew = ({
    userName = "Misael",
    isAdmin = true,
    showDesktopNav = true,
}: HeaderProps) => {
    const { user, logout } = useAuth();
    const [theme, setTheme] = useState("dark");
    const [currentTime, setCurrentTime] = useState(new Date()); // Clock State
    const navigate = useNavigate();
    const location = useLocation();

    // Determine values to display (Context > Props > Default)
    const displayUserName = user?.nome || userName;
    const isUserAdmin = user ? user.role === 'admin' : isAdmin;

    useEffect(() => {
        if (document.documentElement.classList.contains("dark")) {
            setTheme("dark");
        } else {
            setTheme("light");
        }

        // Timer Interval
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);
        if (newTheme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur-md border-b border-border/50"
        >
            <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
                {/* Logo */}
                <div className="flex items-center gap-3 shrink-0 cursor-pointer" onClick={() => navigate("/")}>
                    <img
                        src={logoRotaVerde}
                        alt="Rota Verde"
                        className="w-10 h-10 object-contain"
                    />
                    <div className="min-w-0">
                        <span className="font-display text-lg font-bold whitespace-nowrap">ROTA VERDE</span>
                        <p className="text-[10px] text-muted-foreground block leading-tight">
                            v{SYSTEM_VERSION} • Sistema de Gestão
                        </p>
                    </div>
                </div>

                {/* Desktop Navigation */}
                {showDesktopNav && (
                    <nav className="hidden md:flex items-center gap-1 ml-8">
                        {navItems
                            .filter(item => (item.path !== "/fraude" || isUserAdmin)) // Hide Fraud if not admin, show Performance to all
                            .map((item) => {
                                const isActive = location.pathname.startsWith(item.path);
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="hidden lg:inline">{item.label}</span>
                                    </Link>
                                );
                            })}
                    </nav>
                )}

                {/* Spacer */}
                <div className="flex-1" />

                {/* User Info & Actions */}
                <div className="flex items-center gap-3">
                    {/* User */}
                    <div className="flex items-center gap-2">
                        {/* Changed to block (visible on mobile) */}
                        <div className="text-right block">
                            <span className="text-sm font-medium text-foreground block md:inline max-w-[100px] md:max-w-none truncate">{displayUserName}</span>
                            <span className={`text-[10px] md:text-xs font-semibold block ${isUserAdmin
                                ? 'text-purple-500 dark:text-purple-400'
                                : 'text-blue-500 dark:text-blue-400'
                                }`}>
                                {isUserAdmin ? 'Administrador' : 'Motorista'}
                            </span>
                            {/* Date/Time Display (Hidden on mobile to save space) */}
                            <span className="text-[10px] text-muted-foreground hidden md:block leading-tight mt-0.5">
                                {currentTime.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => {
                                // Toggle: se estiver no admin, volta pra home; senão, vai pro admin
                                if (location.pathname.startsWith('/admin')) {
                                    navigate('/');
                                } else {
                                    navigate('/admin');
                                }
                            }}
                            className="p-2 rounded-lg bg-racing-purple/20 hover:bg-racing-purple/30 transition-colors text-racing-purple"
                            title={location.pathname.startsWith('/admin') ? 'Voltar à Página Inicial' : 'Área Administrativa'}
                        >
                            <Shield className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg bg-destructive/20 hover:bg-destructive/30 transition-colors text-destructive"
                            title="Sair"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.header>
    );
};

export default HeaderNew;
