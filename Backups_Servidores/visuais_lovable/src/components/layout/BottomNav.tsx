import { Home, Banknote, Package, BarChart3, Car } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "turno" | "corridas" | "caixa" | "desempenho" | "veiculos";

interface BottomNavProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "turno", label: "Turno", icon: Home },
  { id: "corridas", label: "Corridas", icon: Banknote },
  { id: "caixa", label: "Caixa", icon: Package },
  { id: "desempenho", label: "Desempenho", icon: BarChart3 },
  { id: "veiculos", label: "Veículos", icon: Car },
];

const BottomNav = ({ activeTab, onTabChange }: BottomNavProps) => {
  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
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
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
