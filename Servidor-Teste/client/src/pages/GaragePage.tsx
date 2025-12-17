
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import { vehiclesService } from "../modules/vehicles/vehicles.service";
import { shiftsService } from "../modules/shifts/shifts.service";
import { useAuth } from "../contexts/AuthContext";
import { Vehicle } from "../../../shared/schema";
import { Car, Zap, Battery, AlertTriangle, ShieldCheck, ArrowRight, X, Gauge } from "lucide-react";
import { useToast } from "../components/ui/use-toast";
import { resolveVehicleImage } from "../lib/vehicleAssets";

export default function GaragePage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const [kmInicial, setKmInicial] = useState("");
    const [isStartingShift, setIsStartingShift] = useState(false);
    const [activeShift, setActiveShift] = useState<any>(null);

    useEffect(() => {
        loadGarageData();
    }, [user]);

    async function loadGarageData() {
        setIsLoading(true);
        try {
            // 1. Get User Active Shift
            const currentShift = await shiftsService.getCurrentShift(String(user?.id));
            if (currentShift) {
                setActiveShift(currentShift);
                // If user already has a shift, redirect to cockpit immediately?
                // Or show a "Resume Shift" button. Let's redirect for now or show banner.
                // For this new flow, maybe we want them to see the Garage but "Locked" into the active car.
            }

            // 2. Get Vehicles
            const allVehicles = await vehiclesService.getAll();
            const activeVehicles = Array.isArray(allVehicles)
                ? allVehicles.filter(v => v.isActive !== false)
                : [];
            setVehicles(activeVehicles);

        } catch (error) {
            console.error("Error loading garage:", error);
            toast({ title: "Erro", description: "Falha ao carregar a garagem.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    const handleAccessVehicle = async (vehicle: Vehicle) => {
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

        // If no active shift, open modal to start
        setSelectedVehicle(vehicle);
    };

    const handleStartShift = async () => {
        if (!selectedVehicle || !kmInicial) {
            toast({ title: "Atenção", description: "Informe o KM Inicial.", variant: "destructive" });
            return;
        }

        setIsStartingShift(true);
        try {
            await shiftsService.startShift(String(selectedVehicle.id), Number(kmInicial));
            toast({ title: "Sucesso", description: "Turno iniciado! Bom trabalho.", className: "bg-green-600 text-white border-none" });
            navigate("/turno");
        } catch (error: any) {
            toast({ title: "Erro", description: error.response?.data?.message || "Erro ao iniciar turno.", variant: "destructive" });
        } finally {
            setIsStartingShift(false);
        }
    };

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
                <div className="text-center mb-12 relative">
                    <div className="inline-block relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                        <h1 className="relative text-4xl md:text-5xl font-display font-black uppercase text-white tracking-wider mb-2">
                            Garagem <span className="text-primary text-glow">Virtual</span>
                        </h1>
                    </div>
                    <p className="text-muted-foreground font-mono text-sm tracking-widest uppercase">
                        Central de Controle da Frota • Monitoramento em Tempo Real
                    </p>
                </div>

                {/* Dashboard Stats (Mini) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
                    <div className="futuristic-card p-6 flex flex-col items-start bg-black/40 backdrop-blur border border-primary/20">
                        <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg border border-green-500/20 mb-3">
                            <ShieldCheck className="w-6 h-6 text-green-500" />
                        </div>
                        <span className="text-3xl font-display font-bold text-white mb-1">{vehicles.length}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Unidades Ativas</span>
                    </div>

                    <div className="futuristic-card p-6 flex flex-col items-start bg-black/40 backdrop-blur border border-primary/20">
                        <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-500/5 rounded-lg border border-orange-500/20 mb-3">
                            <Zap className="w-6 h-6 text-orange-500" />
                        </div>
                        <span className="text-3xl font-display font-bold text-white mb-1">{activeShift ? 1 : 0}</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Em Operação</span>
                    </div>

                    <div className="futuristic-card p-6 flex flex-col items-start bg-black/40 backdrop-blur border border-primary/20">
                        <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-500/5 rounded-lg border border-yellow-500/20 mb-3">
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
                        </div>
                        <span className="text-3xl font-display font-bold text-white mb-1">0</span>
                        <span className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Manutenção</span>
                    </div>
                </div>

                {/* Grid of Vehicles */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {vehicles.map((vehicle) => {
                        const hasActiveShiftHere = activeShift?.vehicleId === vehicle.id;
                        const isUnavailable = false; // Add logic if needed for maintenance

                        return (
                            <motion.div
                                key={vehicle.id}
                                whileHover={{ y: -5 }}
                                className={`futuristic-card group relative overflow-hidden flex flex-col ${hasActiveShiftHere ? 'border-primary ring-1 ring-primary/50' : 'border-white/10'}`}
                            >
                                {/* Active Indicator */}
                                {hasActiveShiftHere && (
                                    <div className="absolute top-4 right-4 z-10 bg-primary text-black text-xs font-bold px-3 py-1 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]">
                                        EM USO
                                    </div>
                                )}

                                {/* Image Heder */}
                                <div className="h-48 relative overflow-hidden bg-gray-900 border-b border-white/5">
                                    {/* Gradient Removed for Maximum Brightness */}
                                    <img
                                        src={resolveVehicleImage(vehicle)}
                                        alt={vehicle.modelo}
                                        className="w-full h-full object-cover opacity-100 group-hover:scale-110 transition-all duration-700"
                                        onError={(e) => {
                                            // Fallback para evitar imagem quebrada se a URL for inválida
                                            e.currentTarget.src = "https://cdn-icons-png.flaticon.com/512/55/55283.png";
                                        }}
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-display font-bold text-white mb-1 group-hover:text-glow transition-all">
                                        {vehicle.plate}
                                    </h3>
                                    <p className="text-sm text-muted-foreground font-mono uppercase tracking-wide mb-6">
                                        {vehicle.modelo}
                                    </p>

                                    {/* Stats (Mocked or Real) */}
                                    <div className="grid grid-cols-2 gap-4 mb-6 pt-4 border-t border-white/5">
                                        <div>
                                            <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Status</div>
                                            <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                                                <Battery className="w-4 h-4" />
                                                100%
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Total KM</div>
                                            <div className="flex items-center gap-2 text-white font-bold text-sm">
                                                <Gauge className="w-4 h-4 text-primary" />
                                                {vehicle.kmInicial ? Number(vehicle.kmInicial).toLocaleString() + 'k' : 'N/A'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <button
                                            onClick={() => handleAccessVehicle(vehicle)}
                                            className="w-full h-12 btn-futuristic font-bold uppercase tracking-wider flex items-center justify-center gap-2 group-hover:bg-primary/20 transition-all"
                                        >
                                            {hasActiveShiftHere ? 'Continuar Turno' : 'Acessar Veículo'}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Start Shift Modal */}
            {selectedVehicle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedVehicle(null)} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
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
                                <div className="w-12 h-12 bg-black/50 rounded-lg flex items-center justify-center border border-white/10 text-2xl overflow-hidden">
                                    {selectedVehicle.imageUrl ? (
                                        <img src={selectedVehicle.imageUrl} alt="Car" className="w-full h-full object-cover" />
                                    ) : (
                                        <span>🚗</span>
                                    )}
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
                            </div>

                            <button
                                onClick={handleStartShift}
                                disabled={isStartingShift || !kmInicial}
                                className="w-full h-14 btn-futuristic text-lg font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                {isStartingShift ? (
                                    <span className="animate-pulse">Iniciando...</span>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 text-black" />
                                        Iniciar Turno
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </MainLayout>
    );
}
