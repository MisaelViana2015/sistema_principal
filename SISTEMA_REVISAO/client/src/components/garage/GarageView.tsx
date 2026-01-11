import { useState } from "react";
import { TrendingUp, TrendingDown, Wrench, CheckCircle, Star, DollarSign, Gauge, Activity, Cpu, Shield, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useVehicles, VehicleWithUI } from "../../hooks/useVehicles";
import { VehicleCard } from "./VehicleCard";

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

type FilterType = "todos" | "ativos" | "favoritos";

const GarageView = () => {
    const [filter, setFilter] = useState<FilterType>("todos");
    const { vehicles, isLoading } = useVehicles();
    const navigate = useNavigate();

    const fleetStats = {
        recipientesAtivos: vehicles.filter(v => v.status !== "manutencao").length,
        emUso: vehicles.filter(v => v.status === "em_uso").length,
        manutencao: vehicles.filter(v => v.status === "manutencao").length,
    };

    const filteredVehicles = vehicles.filter(v => {
        if (filter === "ativos") return v.status !== "manutencao";
        if (filter === "favoritos") return v.isFavorite;
        return true;
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    <p className="font-display text-primary animate-pulse">CARREGANDO SISTEMA...</p>
                </div>
            </div>
        )
    }

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
                            className={`px-5 py-2 rounded-lg text-sm font-display font-bold tracking-wider transition-all duration-300 ${filter === f
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
            <motion.div
                layout
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6"
            >
                <AnimatePresence mode="popLayout">
                    {filteredVehicles.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="col-span-full py-12 text-center text-muted-foreground font-display"
                        >
                            <p>Nenhum veículo encontrado com os filtros atuais.</p>
                        </motion.div>
                    ) : (
                        filteredVehicles.map((vehicle, index) => (
                            <VehicleCard
                                key={vehicle.id}
                                vehicle={vehicle}
                                index={index}
                                onAction={(v) => navigate(`/veiculos/${v.id}`)}
                                actionLabel="ACESSAR VEÍCULO"
                                actionIcon={Cpu}
                            />
                        ))
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default GarageView;
