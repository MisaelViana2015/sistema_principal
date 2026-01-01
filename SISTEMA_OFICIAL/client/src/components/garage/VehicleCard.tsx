import { motion } from "framer-motion";
import { Car, TrendingUp, TrendingDown, Wrench, CheckCircle, Star, DollarSign, Gauge, Activity, Cpu, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleWithUI } from "@/hooks/useVehicles";

interface VehicleCardProps {
    vehicle: VehicleWithUI;
    index?: number;
    onAction: (vehicle: VehicleWithUI) => void;
    actionLabel?: string;
    isActionDisabled?: boolean;
    actionIcon?: React.ElementType;
}

export function VehicleCard({
    vehicle,
    index = 0,
    onAction,
    actionLabel = "ACESSAR VEÍCULO",
    isActionDisabled = false,
    actionIcon: ActionIcon = Cpu
}: VehicleCardProps) {

    const getStatusConfig = (status: VehicleWithUI["status"]) => {
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
            indisponivel: {
                label: "INDISPONÍVEL",
                color: "bg-destructive/20 text-destructive border-destructive/40",
                icon: AlertCircle,
                glow: "shadow-[0_0_15px_hsl(var(--destructive)/0.5)]"
            }
        };
        return configs[status] || configs.disponivel;
    };

    const statusConfig = getStatusConfig(vehicle.status);
    const StatusIcon = statusConfig.icon;

    return (
        <motion.div
            layout // Enable layout animation for smooth filtering
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
            className="group futuristic-card hover-glow overflow-hidden flex flex-col h-full"
        >
            {/* Vehicle Image with Overlay */}
            <div className="relative h-56 overflow-hidden shrink-0">
                <motion.img
                    src={vehicle.image}
                    alt={vehicle.modelo}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    onError={(e) => {
                        e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/55/55283.png";
                    }}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />

                {/* Scan lines on image */}
                <div className="absolute inset-0 scan-lines opacity-30" />

                {/* Status Badge */}
                <div className={`absolute top - 4 right - 4 flex items - center gap - 2 px - 4 py - 2 rounded - full border ${statusConfig.color} ${statusConfig.glow} backdrop - blur - sm`}>
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
            <div className="p-6 space-y-5 flex-1 flex flex-col">
                {/* Plate & Model */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-display text-3xl font-black tracking-[0.1em] text-white glitch">
                            {vehicle.plate}
                        </h3>
                        <p className="text-sm text-white/60 font-display tracking-wide mt-1 uppercase">
                            {vehicle.modelo}
                        </p>
                    </div>
                    <div className={`w - 14 h - 14 rounded - 2xl flex items - center justify - center border ${vehicle.status === "disponivel" ? "bg-primary/10 border-primary/30 text-primary" :
                        vehicle.status === "em_uso" ? "bg-racing-orange/10 border-racing-orange/30 text-racing-orange" :
                            "bg-warning/10 border-warning/30 text-warning"
                        } `}>
                        <Car className="w-7 h-7" />
                    </div>
                </div>

                {/* Meta Bar */}
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
                                }
                                return null;
                            })()}
                        </div>
                    </div>
                    <div className="stat-bar">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${vehicle.stats.meta}% ` }}
                            transition={{ delay: index * 0.1 + 0.5, duration: 1, ease: "easeOut" }}
                            className="stat-bar-fill"
                        />
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-white/10">
                    <div className="text-center">
                        <Gauge className="w-5 h-5 mx-auto mb-2 text-accent" />
                        <p className="font-display text-lg font-bold text-white">{(vehicle.stats.kmTotal / 1000).toFixed(1)}k</p>
                        <p className="text-[10px] text-white/50 font-display tracking-[0.1em]">KM TOTAL</p>
                    </div>
                    <div className="text-center">
                        <DollarSign className="w-5 h-5 mx-auto mb-2 text-primary" />
                        <p className="font-display text-lg font-bold text-white">R$ {(vehicle.stats.revenue || 0).toFixed(0)}</p>
                        <p className="text-[10px] text-white/50 font-display tracking-[0.1em]">RECEITA</p>
                    </div>
                </div>

                {/* Action Button */}
                <div className="mt-auto pt-4">
                    <Button
                        onClick={() => onAction(vehicle)}
                        disabled={isActionDisabled}
                        className="w-full h-14 btn-futuristic rounded-xl text-primary-foreground group-hover:shadow-[0_0_20px_hsl(var(--primary)/0.4)] transition-all duration-300"
                    >
                        <span className="relative z-10 flex items-center gap-2 font-display font-bold tracking-wider">
                            <ActionIcon className="w-5 h-5" />
                            {actionLabel}
                        </span>
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
