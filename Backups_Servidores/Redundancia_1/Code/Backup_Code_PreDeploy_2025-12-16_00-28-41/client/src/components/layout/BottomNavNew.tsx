import { Home, Banknote, Package, BarChart3, Car } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const navItems = [
    { path: "/veiculos", label: "Veículos", icon: Car },
    { path: "/turno", label: "Turno", icon: Home },
    { path: "/corridas", label: "Corridas", icon: Banknote },
    { path: "/caixa", label: "Caixa", icon: Package },
    { path: "/desempenho", label: "Desempenho", icon: BarChart3 },
];

const BottomNavNew = () => {
    const location = useLocation();

    return (
        <nav className="bottom-nav">
            <div className="flex items-center justify-around px-2 py-1">
                {navItems.map((item) => {
                    const isActive = location.pathname.startsWith(item.path);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`bottom-nav-item relative ${isActive ? "active" : ""}`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary/10 rounded-xl"
                                    transition={{ type: "spring", duration: 0.5 }}
                                />
                            )}
                            <Icon className="w-5 h-5 relative z-10" />
                            <span className="text-xs font-medium relative z-10">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default BottomNavNew;
