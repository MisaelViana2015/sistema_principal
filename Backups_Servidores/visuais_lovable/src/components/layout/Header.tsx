import { Sun, Moon, LogOut, Car, DollarSign, Package, TrendingUp, MoreHorizontal, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import logoRotaVerde from "@/assets/logo-rota-verde.png";

type Tab = "turno" | "corridas" | "caixa" | "desempenho" | "veiculos";

interface HeaderProps {
  userName?: string;
  isAdmin?: boolean;
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
  showDesktopNav?: boolean;
}

const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "veiculos", label: "Garagem", icon: Car },
  { id: "corridas", label: "Corridas", icon: DollarSign },
  { id: "caixa", label: "Caixa", icon: Package },
  { id: "desempenho", label: "desempenho", icon: TrendingUp },
  { id: "turno", label: "mais", icon: MoreHorizontal },
];

const Header = ({ 
  userName = "Misael", 
  isAdmin = true,
  activeTab = "veiculos",
  onTabChange,
  showDesktopNav = true,
}: HeaderProps) => {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
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
        <div className="flex items-center gap-3 shrink-0">
          <img 
            src={logoRotaVerde} 
            alt="Rota Verde" 
            className="w-10 h-10 object-contain"
          />
          <div className="min-w-0">
            <span className="font-display text-lg font-bold whitespace-nowrap">ROTA VERDE</span>
            <p className="text-xs text-muted-foreground hidden sm:block">Sistema de Gestão</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        {showDesktopNav && (
          <nav className="hidden md:flex items-center gap-1 ml-8">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange?.(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </button>
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
            <div className="text-right hidden sm:block">
              <span className="text-sm font-medium text-foreground block">{userName}</span>
              {isAdmin && (
                <span className="text-xs text-primary">Administrador</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Link 
              to="/admin" 
              className="p-2 rounded-lg bg-racing-purple/20 hover:bg-racing-purple/30 transition-colors text-racing-purple"
              title="Área Administrativa"
            >
              <Shield className="w-5 h-5" />
            </Link>
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
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

export default Header;
