
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../../components/MainLayout";
import { shiftsService } from "../../shifts/shifts.service";
import { useAuth } from "../../../contexts/AuthContext";
import { Zap, AlertTriangle, ShieldCheck, X, Activity } from "lucide-react";
import { useToast } from "../../../components/ui/use-toast";
import { Button } from "../../../components/ui/button";
import { useVehicles, VehicleWithUI } from "../../../hooks/useVehicles";
import { VehicleCard } from "../../../components/garage/VehicleCard";

export default function GaragePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Use centralized hook for vehicles
    const { vehicles, isLoading: vehiclesLoading } = useVehicles();

    // Local state for Shift logic
    const [selectedVehicle, setSelectedVehicle] = useState<VehicleWithUI | null>(null);
    const [kmInicial, setKmInicial] = useState("");
    const [isStartingShift, setIsStartingShift] = useState(false);
    const [activeShift, setActiveShift] = useState<any>(null);
    const [shiftLoading, setShiftLoading] = useState(true);

    useEffect(() => {
        loadShiftData();
    }, [user]);

    async function loadShiftData() {
        if (!user?.id) return;
        setShiftLoading(true);
        try {
            const currentShift = await shiftsService.getCurrentShift(String(user.id));
            if (currentShift) {
                setActiveShift(currentShift);
            }
        } catch (error) {
            console.error("Error loading current shift:", error);
        } finally {
            setShiftLoading(false);
        }
    }

    const handleAccessVehicle = (vehicle: VehicleWithUI) => {
        // If user already has an active shift with THIS vehicle, go to cockpit
        if (activeShift && activeShift.vehicleId === vehicle.id) {
            navigate("/turno");
            return;
        }

        // If user has active shift with ANOTHER vehicle, warn them
        if (activeShift && activeShift.vehicleId !== vehicle.id) {
            toast({
                title: "Turno Ativo",
                description: "Você já tem um turno ativo em outro veículo. Encerre-o primeiro.",
                variant: "destructive"
            });
            return;
        }

        // If no active shift, make sure vehicle is available
        if (vehicle.status !== "disponivel") {
            toast({
                title: "Veículo Indisponível",
                description: vehicle.status === "manutencao" ? "Veículo em manutenção." : "Veículo já está em uso por outro motorista.",
                variant: "destructive"
            });
            return;
        }

        // Open modal to start
        setSelectedVehicle(vehicle);
    };

    const handleStartShift = async () => {
        if (!selectedVehicle || !kmInicial) {
            toast({ title: "Atenção", description: "Informe o KM Inicial.", variant: "destructive" });
            return;
        }

        setIsStartingShift(true);
        try {
            if (!user?.id) throw new Error("Usuário não identificado. Faça login novamente.");

            await shiftsService.startShift(String(selectedVehicle.id), Number(kmInicial), user.id);

            toast({ title: "Sucesso", description: "Turno iniciado! Bom trabalho.", className: "bg-green-600 text-white border-none" });
            navigate("/turno");
        } catch (error: any) {
            console.error("Start shift error:", error);
            const msg = error.response?.data?.message || error.message || "Erro ao iniciar turno.";
            toast({ title: "Erro", description: msg, variant: "destructive", duration: 5000 });
            // Alert para garantir que o usuário veja
            alert(`Não foi possível iniciar o turno:\n${msg}`);
        } finally {
            setIsStartingShift(false);
        }
    };

    const isLoading = vehiclesLoading || shiftLoading;

    // Filter logic specific to Driver View: Show all unless unavailable
    const visibleVehicles = vehicles.filter(v => v.status !== 'indisponivel');

    if (isLoading) {
        return (
            <MainLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-muted-foreground animate-pulse">Carregando frota...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto pb-20">
                {/* Header Section */}
                <div className="text-center mb-12 relative pt-8">
                    <div className="inline-block relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                        <h1 className="relative text-4xl md:text-5xl font-display font-black uppercase text-white tracking-wider mb-2">
                            Garagem <span className="text-primary text-glow">Virtual</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">
                        Selecione um veículo para iniciar seu turno
                    </p>
                </div>

                {/* Dashboard Stats (Mini) */}
                <div className="grid grid-cols-3 gap-2 mb-12">
                    <div className="futuristic-card p-3 flex flex-col items-center justify-center text-center bg-black/40 backdrop-blur border border-primary/20">
                        <div className="mb-2">
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="text-xl font-display font-bold text-white mb-0">{visibleVehicles.length}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Visíveis</span>
                    </div>

                    <div className="futuristic-card p-3 flex flex-col items-center justify-center text-center bg-black/40 backdrop-blur border border-primary/20">
                        <div className="mb-2">
                            <Activity className="w-5 h-5 text-orange-500" />
                        </div>
                        <span className="text-xl font-display font-bold text-white mb-0">{activeShift ? 1 : 0}</span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Seu Turno</span>
                    </div>

                    <div className="futuristic-card p-3 flex flex-col items-center justify-center text-center bg-black/40 backdrop-blur border border-primary/20">
                        <div className="mb-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        </div>
                        <span className="text-xl font-display font-bold text-white mb-0">
                            {visibleVehicles.filter(v => v.status === "manutencao").length}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Manutenção</span>
                    </div>
                </div>

                {/* Grid of Vehicles */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence>
                        {visibleVehicles.map((vehicle, index) => {
                            const hasActiveShiftHere = activeShift?.vehicleId === vehicle.id;
                            const isAvailable = vehicle.status === 'disponivel';
                            // Allow access if available OR if user already has active shift here
                            const canAccess = isAvailable || hasActiveShiftHere;

                            return (
                                <div key={vehicle.id} className="relative">
                                    {/* Active Indicator Overlay */}
                                    {hasActiveShiftHere && (
                                        <div className="absolute -top-3 -right-3 z-20">
                                            <span className="relative flex h-6 w-6">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-6 w-6 bg-primary"></span>
                                            </span>
                                        </div>
                                    )}

                                    <VehicleCard
                                        vehicle={vehicle}
                                        index={index}
                                        onAction={handleAccessVehicle}
                                        actionLabel={hasActiveShiftHere ? "CONTINUAR TURNO" : (vehicle.status === 'manutencao' ? 'EM MANUTENÇÃO' : (vehicle.status === 'em_uso' ? 'EM USO' : 'INICIAR TURNO'))}
                                        actionIcon={Zap}
                                        isActionDisabled={!canAccess}
                                    />
                                </div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* Start Shift Modal */}
            <AnimatePresence>
                {selectedVehicle && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedVehicle(null)} />

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative bg-[#0f1115] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-display font-bold text-white">Iniciar Turno</h2>
                                    <p className="text-sm text-muted-foreground">Informe o KM inicial para começar.</p>
                                </div>
                                <button onClick={() => setSelectedVehicle(null)} className="text-muted-foreground hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 bg-black/50 rounded-lg flex items-center justify-center border border-white/10 text-2xl overflow-hidden shrink-0">
                                        <img
                                            src={selectedVehicle.image}
                                            alt="Car"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/55/55283.png";
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white text-lg">{selectedVehicle.plate}</div>
                                        <div className="text-xs text-primary uppercase font-bold">{selectedVehicle.modelo}</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                        KM Inicial *
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={kmInicial}
                                            onChange={(e) => setKmInicial(e.target.value)}
                                            className="w-full h-14 bg-black/50 border border-white/10 rounded-lg px-4 text-xl font-mono text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/30"
                                            placeholder="000000"
                                            autoFocus
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-xs">
                                            KM
                                        </div>
                                    </div>
                                    {selectedVehicle.stats.kmTotal > 0 && kmInicial && Number(kmInicial) < Number(selectedVehicle.stats.kmTotal) && (
                                        <div className="text-red-500 text-xs mt-2 font-bold flex items-center gap-1">
                                            <AlertTriangle size={12} />
                                            KM informado menor que o atual ({Number(selectedVehicle.stats.kmTotal).toLocaleString()} km).
                                        </div>
                                    )}
                                </div>

                                <Button
                                    onClick={handleStartShift}
                                    disabled={isStartingShift || !kmInicial}
                                    className="w-full h-14 btn-futuristic rounded-xl text-lg font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    {isStartingShift ? (
                                        <span className="animate-pulse">Iniciando...</span>
                                    ) : (
                                        <>
                                            <Zap className="w-5 h-5 text-black" />
                                            Iniciar Turno
                                        </>
                                    )}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </MainLayout>
    );
}
