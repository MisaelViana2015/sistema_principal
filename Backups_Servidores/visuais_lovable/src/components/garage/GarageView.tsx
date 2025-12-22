import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Car, TrendingUp, TrendingDown, Wrench, CheckCircle, Star, DollarSign, Gauge, Zap, Activity, Cpu, Shield, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";

// Import vehicle images - BYD Dolphins
import dolphinAzul from "@/assets/vehicles/dolphin-azul.png";
import dolphinBranco from "@/assets/vehicles/dolphin-mini-branco.png";
import dolphinPreto from "@/assets/vehicles/dolphin-preto.png";

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  image: string;
  isFavorite?: boolean;
  isInUse?: boolean;
  status: "disponivel" | "manutencao" | "em_uso";
  stats: {
    revenue: number;
    kmTotal: number;
    corridas: number;
    meta: number;
    metaLastMonth: number;
  };
}

const mockVehicles: Vehicle[] = [
  {
    id: "1",
    plate: "TQQ0A07",
    model: "Mini Golfinho Azul",
    image: dolphinAzul,
    isFavorite: true,
    status: "disponivel",
    stats: { revenue: 12450.5, kmTotal: 4856, corridas: 342, meta: 92, metaLastMonth: 88 },
  },
  {
    id: "2",
    plate: "TQQ0725",
    model: "Dolphin Mini Branco",
    image: dolphinBranco,
    isInUse: true,
    status: "em_uso",
    stats: { revenue: 18230.8, kmTotal: 6234, corridas: 456, meta: 88, metaLastMonth: 91 },
  },
  {
    id: "3",
    plate: "TQS4C30",
    model: "Dolphin Mini BR",
    image: dolphinPreto,
    status: "disponivel",
    stats: { revenue: 9876.2, kmTotal: 3892, corridas: 278, meta: 85, metaLastMonth: 85 },
  },
  {
    id: "4",
    plate: "TQU0H17",
    model: "Dolphin Mini BR",
    image: dolphinBranco,
    status: "manutencao",
    stats: { revenue: 15623.45, kmTotal: 5456, corridas: 398, meta: 90, metaLastMonth: 87 },
  },
];

type FilterType = "todos" | "ativos" | "favoritos";

// Floating particles component
const FloatingParticles = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div
        key={i}
        className="particle"
        style={{
          width: `${Math.random() * 4 + 2}px`,
          height: `${Math.random() * 4 + 2}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 8}s`,
          animationDuration: `${Math.random() * 4 + 6}s`,
        }}
      />
    ))}
  </div>
);

// Data streams component
const DataStreams = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="data-stream h-32"
        style={{
          left: `${10 + i * 20}%`,
          animationDelay: `${i * 0.6}s`,
        }}
      />
    ))}
  </div>
);

const GarageView = () => {
  const [filter, setFilter] = useState<FilterType>("todos");
  const navigate = useNavigate();

  const fleetStats = {
    recipientesAtivos: mockVehicles.filter(v => v.status !== "manutencao").length,
    emUso: mockVehicles.filter(v => v.status === "em_uso").length,
    manutencao: mockVehicles.filter(v => v.status === "manutencao").length,
  };

  const filteredVehicles = mockVehicles.filter(v => {
    if (filter === "ativos") return v.status !== "manutencao";
    if (filter === "favoritos") return v.isFavorite;
    return true;
  });

  const getStatusConfig = (status: Vehicle["status"]) => {
    const configs = {
      disponivel: { 
        label: "ONLINE", 
        color: "bg-primary/20 text-primary border-primary/40",
        icon: CheckCircle,
        glow: "shadow-[0_0_15px_hsl(var(--primary)/0.5)]"
      },
      em_uso: { 
        label: "EM OPERAÇÃO", 
        color: "bg-racing-orange/20 text-racing-orange border-racing-orange/40",
        icon: Activity,
        glow: "shadow-[0_0_15px_hsl(var(--racing-orange)/0.5)]"
      },
      manutencao: { 
        label: "MANUTENÇÃO", 
        color: "bg-warning/20 text-warning border-warning/40",
        icon: Wrench,
        glow: "shadow-[0_0_15px_hsl(var(--warning)/0.5)]"
      },
    };
    return configs[status];
  };

  return (
    <div className="relative space-y-8 pb-8">
      {/* Background Effects */}
      <FloatingParticles />
      <DataStreams />
      
      {/* Cyber Grid Overlay */}
      <div className="fixed inset-0 cyber-grid pointer-events-none opacity-30" />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative text-center space-y-6 py-8"
      >
        {/* System Status Badge */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-primary/30 holographic"
        >
          <div className="orb-indicator" />
          <span className="text-sm font-display font-bold tracking-[0.2em] text-primary uppercase">
            Sistema Ativo
          </span>
          <Cpu className="w-4 h-4 text-primary animate-pulse" />
        </motion.div>

        {/* Main Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-tight">
            <span className="text-foreground">GARAGEM</span>
            <br />
            <span className="text-primary text-glow">VIRTUAL</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-lg tracking-wide">
            Central de Controle da Frota • Monitoramento em Tempo Real
          </p>
        </motion.div>

        {/* Decorative Line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mx-auto w-48 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      </motion.div>

      {/* Fleet Stats - Holographic Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {[
          { icon: Shield, value: fleetStats.recipientesAtivos, label: "UNIDADES ATIVAS", color: "text-primary", gradient: "from-primary/20 to-accent/10" },
          { icon: Flame, value: fleetStats.emUso, label: "EM OPERAÇÃO", color: "text-racing-orange", gradient: "from-racing-orange/20 to-warning/10" },
          { icon: Wrench, value: fleetStats.manutencao, label: "MANUTENÇÃO", color: "text-warning", gradient: "from-warning/20 to-racing-orange/10" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 30, rotateX: -20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="relative futuristic-card p-5 hover-glow overflow-hidden"
          >
            {/* Scan line effect */}
            <div className="absolute inset-0 scan-lines opacity-50" />
            
            {/* Icon */}
            <div className={`relative z-10 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            
            {/* Value */}
            <p className={`relative z-10 font-display text-4xl font-black ${stat.color}`}>
              {stat.value}
            </p>
            
            {/* Label */}
            <p className="relative z-10 text-xs text-white/60 font-display tracking-[0.15em] mt-1">
              {stat.label}
            </p>

            {/* Corner accent */}
            <div className={`absolute top-0 right-0 w-16 h-16 ${stat.color} opacity-10`} 
              style={{ 
                background: `radial-gradient(circle at top right, currentColor, transparent 70%)` 
              }} 
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Section Header with Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
          <h2 className="font-display text-2xl font-bold tracking-wide">
            UNIDADES DISPONÍVEIS
          </h2>
        </div>
        
        <div className="flex gap-2 p-1 rounded-xl bg-background/50 border border-border/50">
          {(["todos", "ativos", "favoritos"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2 rounded-lg text-sm font-display font-bold tracking-wider transition-all duration-300 ${
                filter === f
                  ? "bg-primary/20 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Vehicle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredVehicles.map((vehicle, index) => {
          const statusConfig = getStatusConfig(vehicle.status);
          const StatusIcon = statusConfig.icon;
          
          return (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.15, type: "spring", stiffness: 100 }}
              className="group futuristic-card hover-glow overflow-hidden"
            >
              {/* Vehicle Image with Overlay */}
              <div className="relative h-56 overflow-hidden">
                <motion.img
                  src={vehicle.image}
                  alt={vehicle.model}
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                
                {/* Scan lines on image */}
                <div className="absolute inset-0 scan-lines opacity-30" />
                
                {/* Status Badge */}
                <div className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig.color} ${statusConfig.glow} backdrop-blur-sm`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-xs font-display font-bold tracking-wider">{statusConfig.label}</span>
                </div>

                {/* Favorite Badge */}
                {vehicle.isFavorite && (
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full bg-racing-gold/20 text-racing-gold border border-racing-gold/40 shadow-[0_0_15px_hsl(var(--racing-gold)/0.5)] backdrop-blur-sm">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-display font-bold tracking-wider">FAVORITO</span>
                  </div>
                )}

                {/* Holographic overlay on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 holographic" />
              </div>

              {/* Vehicle Info */}
              <div className="p-6 space-y-5">
                {/* Plate & Model */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-3xl font-black tracking-[0.1em] text-white glitch">
                      {vehicle.plate}
                    </h3>
                    <p className="text-sm text-white/60 font-display tracking-wide mt-1">
                      {vehicle.model}
                    </p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                    vehicle.status === "disponivel" ? "bg-primary/10 border-primary/30 text-primary" :
                    vehicle.status === "em_uso" ? "bg-racing-orange/10 border-racing-orange/30 text-racing-orange" :
                    "bg-warning/10 border-warning/30 text-warning"
                  }`}>
                    <Car className="w-7 h-7" />
                  </div>
                </div>

                {/* Meta Bar with Month Comparison */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/60 font-display tracking-wide">META</span>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-lg text-primary">{vehicle.stats.meta}%</span>
                      {(() => {
                        const diff = vehicle.stats.meta - vehicle.stats.metaLastMonth;
                        if (diff > 0) {
                          return (
                            <span className="flex items-center gap-1 text-xs text-success font-display font-bold">
                              <TrendingUp className="w-3 h-3" />
                              +{diff}%
                            </span>
                          );
                        } else if (diff < 0) {
                          return (
                            <span className="flex items-center gap-1 text-xs text-destructive font-display font-bold">
                              <TrendingDown className="w-3 h-3" />
                              {diff}%
                            </span>
                          );
                        }
                        return (
                          <span className="text-xs text-muted-foreground font-display">
                            =
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="stat-bar">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${vehicle.stats.meta}%` }}
                      transition={{ delay: index * 0.15 + 0.5, duration: 1, ease: "easeOut" }}
                      className="stat-bar-fill"
                    />
                  </div>
                  <p className="text-[10px] text-white/40 font-display">
                    Mês anterior: {vehicle.stats.metaLastMonth}%
                  </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-white/10">
                  {[
                    { icon: DollarSign, value: `R$ ${(vehicle.stats.revenue / 1000).toFixed(1)}k`, label: "RECEITA" },
                    { icon: Gauge, value: `${(vehicle.stats.kmTotal / 1000).toFixed(1)}k`, label: "KM TOTAL" },
                    { icon: TrendingUp, value: vehicle.stats.corridas, label: "CORRIDAS" },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <stat.icon className="w-5 h-5 mx-auto mb-2 text-accent" />
                      <p className="font-display text-lg font-bold text-white">{stat.value}</p>
                      <p className="text-[10px] text-white/50 font-display tracking-[0.1em]">{stat.label}</p>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <Button 
                  onClick={() => navigate(`/vehicle/${vehicle.id}`)}
                  className="w-full h-14 btn-futuristic rounded-xl text-primary-foreground"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <Cpu className="w-5 h-5" />
                    ACESSAR VEÍCULO
                  </span>
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default GarageView;
