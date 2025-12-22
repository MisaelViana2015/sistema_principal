import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Users, Car, Clock, DollarSign, Receipt, FileText, Wrench, CircleDot, BarChart3, AlertTriangle, Upload, Bug, Sun, Moon, LogOut, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import logoRotaVerde from "@/assets/logo-rota-verde.png";
import AdminMotoristas from "@/components/admin/AdminMotoristas";
import AdminVeiculos from "@/components/admin/AdminVeiculos";
import AdminTurnos from "@/components/admin/AdminTurnos";
import AdminCorridas from "@/components/admin/AdminCorridas";
import AdminCustos from "@/components/admin/AdminCustos";
import AdminTiposCusto from "@/components/admin/AdminTiposCusto";
import AdminCustosFixos from "@/components/admin/AdminCustosFixos";
import AdminManutencoes from "@/components/admin/AdminManutencoes";
import AdminAnalise from "@/components/admin/AdminAnalise";

type MainTab = "motoristas" | "veiculos" | "turnos" | "corridas" | "custos" | "tipos_custo" | "custos_fixos";
type SecondaryTab = "manutencoes" | "pneus" | "analise" | "fraude" | "importar" | "debug";

const mainTabs: { id: MainTab; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "motoristas", label: "Motoristas", icon: Users },
  { id: "veiculos", label: "Veículos", icon: Car, badge: 4 },
  { id: "turnos", label: "Turnos", icon: Clock },
  { id: "corridas", label: "Corridas", icon: DollarSign },
  { id: "custos", label: "Custos", icon: Receipt },
  { id: "tipos_custo", label: "Tipos de Custo", icon: FileText },
  { id: "custos_fixos", label: "Custos Fixos", icon: FileText },
];

const secondaryTabs: { id: SecondaryTab; label: string; icon: React.ElementType }[] = [
  { id: "manutencoes", label: "Manutenções", icon: Wrench },
  { id: "pneus", label: "Pneus", icon: CircleDot },
  { id: "analise", label: "Análise", icon: BarChart3 },
  { id: "fraude", label: "Fraude", icon: AlertTriangle },
  { id: "importar", label: "Importar", icon: Upload },
  { id: "debug", label: "Debug Nav", icon: Bug },
];

const Admin = () => {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>("motoristas");
  const [activeSecondaryTab, setActiveSecondaryTab] = useState<SecondaryTab | null>(null);
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = () => {
    navigate("/login");
  };

  const handleMainTabChange = (tab: MainTab) => {
    setActiveMainTab(tab);
    setActiveSecondaryTab(null);
  };

  const handleSecondaryTabChange = (tab: SecondaryTab) => {
    setActiveSecondaryTab(tab);
  };

  const renderContent = () => {
    if (activeSecondaryTab) {
      switch (activeSecondaryTab) {
        case "manutencoes":
          return <AdminManutencoes />;
        case "analise":
          return <AdminAnalise />;
        case "pneus":
        case "fraude":
        case "importar":
        case "debug":
          return (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
                {activeSecondaryTab === "pneus" && <CircleDot className="w-10 h-10 text-muted-foreground" />}
                {activeSecondaryTab === "fraude" && <AlertTriangle className="w-10 h-10 text-warning" />}
                {activeSecondaryTab === "importar" && <Upload className="w-10 h-10 text-muted-foreground" />}
                {activeSecondaryTab === "debug" && <Bug className="w-10 h-10 text-muted-foreground" />}
              </div>
              <h3 className="font-display text-xl font-bold text-muted-foreground">
                {secondaryTabs.find(t => t.id === activeSecondaryTab)?.label}
              </h3>
              <p className="text-muted-foreground/70 text-sm mt-2">
                Seção em desenvolvimento
              </p>
            </div>
          );
        default:
          return null;
      }
    }

    switch (activeMainTab) {
      case "motoristas":
        return <AdminMotoristas />;
      case "veiculos":
        return <AdminVeiculos />;
      case "turnos":
        return <AdminTurnos />;
      case "corridas":
        return <AdminCorridas />;
      case "custos":
        return <AdminCustos />;
      case "tipos_custo":
        return <AdminTiposCusto />;
      case "custos_fixos":
        return <AdminCustosFixos />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-racing-purple/30"
      >
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img 
              src={logoRotaVerde} 
              alt="Rota Verde" 
              className="w-10 h-10 object-contain"
            />
            <div>
              <span className="font-display text-lg font-bold">ROTA VERDE</span>
              <p className="text-xs text-racing-purple">Área Administrativa</p>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="text-sm font-medium text-foreground block">Misael</span>
              <span className="text-xs text-racing-purple">Admin</span>
            </div>

            <div className="flex items-center gap-1">
              <Link 
                to="/" 
                className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors text-primary"
              >
                <Home className="w-5 h-5" />
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

      {/* Main Content */}
      <main className="pt-16 px-4 max-w-7xl mx-auto pb-8">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 relative overflow-hidden rounded-2xl p-6 md:p-8"
          style={{
            background: "linear-gradient(135deg, hsl(270 76% 25% / 0.8), hsl(270 76% 15% / 0.9))",
          }}
        >
          <div className="absolute inset-0 scan-lines opacity-20" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-racing-purple/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-racing-purple/30 flex items-center justify-center border border-racing-purple/50 shadow-[0_0_30px_hsl(270_76%_55%/0.3)]">
              <Shield className="w-8 h-8 text-racing-purple" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Área Administrativa
              </h1>
              <p className="text-muted-foreground mt-1">
                Gestão completa do sistema Rota Verde
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6 overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-2 p-1 min-w-max">
            {mainTabs.map((tab) => {
              const isActive = activeMainTab === tab.id && !activeSecondaryTab;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleMainTabChange(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-display font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-racing-purple/20 text-racing-purple border border-racing-purple/40 shadow-[0_0_15px_hsl(270_76%_55%/0.2)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Secondary Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-3 overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-2 p-1 min-w-max">
            {secondaryTabs.map((tab) => {
              const isActive = activeSecondaryTab === tab.id;
              const Icon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleSecondaryTabChange(tab.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content Area */}
        <motion.div
          key={activeSecondaryTab || activeMainTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6"
        >
          {renderContent()}
        </motion.div>
      </main>
    </div>
  );
};

export default Admin;
