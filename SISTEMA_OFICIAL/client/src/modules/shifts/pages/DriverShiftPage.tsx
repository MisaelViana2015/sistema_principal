
import { getVehicleImage } from "../../../lib/vehicleAssets";
import React, { useState, useEffect } from "react";
import MainLayout from "../../../components/MainLayout";
import {
    Car, Clock, Play, RotateCcw, CheckCircle2,
    Plus, DollarSign, TrendingUp, Building, User, Wallet, History, X,
    Zap, Tag, Home, ShoppingCart, Package, Wifi, Phone, Users, Fuel, Utensils, Smartphone, Wrench,
    ArrowLeft, LogOut, Edit
} from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import { vehiclesService } from "../../vehicles/vehicles.service";
import { shiftsService } from "../shifts.service";
import { ridesService, RideWithDetails } from "../../rides/rides.service";
import { Vehicle } from "../../../../../shared/schema";
import { api } from "../../../lib/api";
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from "../../../lib/costTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "dashboard" | "add_ride" | "add_cost" | "finish_shift";

export default function DriverShiftPage() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const isDark = theme === 'dark';

    // State
    const [viewMode, setViewMode] = useState<ViewMode>("dashboard");
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
    const [kmInicial, setKmInicial] = useState<string>("");
    const [kmFinal, setKmFinal] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [activeShift, setActiveShift] = useState<any>(null);
    const [rides, setRides] = useState<RideWithDetails[]>([]);
    const [expenses, setExpenses] = useState<any[]>([]);
    const [workedTime, setWorkedTime] = useState("--h --min");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Ride Form State
    const [rideType, setRideType] = useState<"APP" | "PARTICULAR">("APP");
    const [rideValue, setRideValue] = useState("");
    const [rideCooldown, setRideCooldown] = useState(0);

    // Cost Form State
    const [selectedCostType, setSelectedCostType] = useState<any>(null);
    const [costValue, setCostValue] = useState("");
    const [obs, setObs] = useState("");
    const [costTypesList, setCostTypesList] = useState<any[]>([]);
    const [isParticularCost, setIsParticularCost] = useState(false);

    // Finish Shift State
    const [finishPassword, setFinishPassword] = useState("");
    const [isEditingKmInitial, setIsEditingKmInitial] = useState(false);
    const [newKmInitial, setNewKmInitial] = useState("");

    useEffect(() => {
        loadData();
        loadCostTypes();
    }, [user]);

    // Cooldown Timer - DISABLED per user request
    /*
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (rideCooldown > 0) {
            interval = setInterval(() => {
                setRideCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [rideCooldown]);
    */

    // Work Timer
    useEffect(() => {
        if (!activeShift?.inicio) {
            setWorkedTime("--h --min");
            return;
        }
        const updateTimer = () => {
            const start = new Date(activeShift.inicio);
            const now = new Date();
            const diffMs = now.getTime() - start.getTime();
            const diffMins = Math.max(0, Math.floor(diffMs / 60000));
            const hours = Math.floor(diffMins / 60);
            const mins = diffMins % 60;
            setWorkedTime(`${hours}h ${mins}min`);
        };
        updateTimer();
        const interval = setInterval(updateTimer, 60000);
        return () => clearInterval(interval);
    }, [activeShift]);

    // Load full rides for Finish Shift view
    useEffect(() => {
        if (viewMode === "finish_shift" && activeShift) {
            ridesService.getAll({
                shiftId: activeShift.id,
                limit: 100
            }).then(res => setRides(Array.isArray(res.data) ? res.data : []));
        }
    }, [viewMode, activeShift]);

    async function loadData() {
        if (!user || !user.id) return;
        setIsLoading(true);
        try {
            const vehiclesData = await vehiclesService.getAll();
            const activeVehicles = Array.isArray(vehiclesData)
                ? vehiclesData.filter((v: any) => v.isActive !== false)
                : [];
            setVehicles(activeVehicles);

            const currentShift = await shiftsService.getCurrentShift(String(user.id));
            if (currentShift) {
                setActiveShift(currentShift);
                loadRides(currentShift.id);
                loadExpenses(currentShift.id);
            } else {
                setActiveShift(null);
            }
        } catch (err) {
            console.error(err);
            setActiveShift(null);
            setError("Erro ao carregar dados. Tente recarregar.");
        } finally {
            setIsLoading(false);
        }
    }

    async function loadCostTypes() {
        try {
            const res = await api.get("/financial/cost-types");
            const activeTypes = Array.isArray(res.data)
                ? res.data.filter((t: any) => t.isActive !== false)
                : [];
            setCostTypesList(activeTypes);
        } catch (err) {
            console.error("Erro ao carregar tipos de custo", err);
            setCostTypesList([]);
        }
    }

    async function loadRides(shiftId: string) {
        try {
            const data = await ridesService.getAll({
                limit: 20,
                driverId: String(user?.id),
                shiftId: shiftId
            });
            setRides(Array.isArray(data.data) ? data.data : []);
        } catch (err) {
            console.error("Erro ao carregar corridas recent", err);
            setRides([]);
        }
    }

    async function loadExpenses(shiftId: string) {
        try {
            const res = await api.get("/financial/expenses", {
                params: { shiftId, limit: 10 }
            });
            setExpenses(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Erro ao carregar custos", err);
            setExpenses([]);
        }
    }

    // -- Handlers --

    async function handleFinishShift() {
        if (!activeShift || !kmFinal) {
            setError("Informe o KM final.");
            return;
        }
        // NOTE: User requested password validation, might be annoying if not configured well, 
        // but preserving logic as requested.
        /* if (!finishPassword) {
             setError("Informe a senha para confirmar o encerramento.");
             return;
         } */
        if (Number(kmFinal) < Number(activeShift.kmInicial)) {
            setError("O KM Final não pode ser menor que o KM Inicial.");
            return;
        }
        try {
            await shiftsService.finishShift(String(activeShift.id), Number(kmFinal));
            setActiveShift(null);
            setKmFinal("");
            setKmInicial("");
            setSelectedVehicleId("");
            setViewMode("dashboard");
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao finalizar turno.");
        }
    }

    async function handleUpdateKmInitial() {
        if (!activeShift || !newKmInitial) return setIsEditingKmInitial(false);

        try {
            setIsSubmitting(true);
            await shiftsService.update(activeShift.id, { kmInicial: Number(newKmInitial) });
            await loadData();
            setIsEditingKmInitial(false);
        } catch (error) {
            console.error(error);
            setError("Erro ao atualizar KM Inicial");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleSaveRide() {
        if (!rideValue) return;
        if (rideCooldown > 0 || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await api.post("/rides", {
                shiftId: activeShift.id,
                tipo: rideType,
                valor: Number(rideValue),
                hora: new Date().toISOString()
            });

            // setRideCooldown(300); // DISABLED per user request
            setRideValue("");
            setViewMode("dashboard");
            loadData();
        } catch (err) {
            console.error(err);
            setError("Erro ao salvar corrida.");
        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleSaveCost() {
        if (isSubmitting) return;
        if (!costValue) {
            setError("Informe o valor total.");
            return;
        }
        if (!selectedCostType) {
            setError("Selecione um tipo de despesa.");
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post("/financial/expenses", {
                driverId: user?.id,
                shiftId: activeShift.id,
                costTypeId: selectedCostType.id,
                value: Number(costValue),
                date: new Date(),
                notes: obs,
                isParticular: isParticularCost
            });
            setCostValue("");
            setObs("");
            setIsParticularCost(false);
            setSelectedCostType(null);
            setViewMode("dashboard");
            loadData();
        } catch (err) {
            console.error(err);
            setError("Erro ao salvar custo.");
        } finally {
            setIsSubmitting(false);
        }
    }

    // Helper to get cost type style
    const getCostTypeStyle = (type: any) => {
        if (!type) {
            return { color: '#9ca3af', bg: '#374151', border: '#4b5563', icon: <DollarSign /> };
        }
        // 1. Try to use dynamic properties from DB
        try {
            if (type.icon && type.color) {
                const iconData = AVAILABLE_ICONS.find(i => i.value === type.icon);
                const colorData = AVAILABLE_COLORS.find(c => c.value === type.color);

                if (iconData && colorData) {
                    const IconComponent = iconData.icon;
                    return {
                        color: colorData.hex,
                        bg: colorData.bg,
                        border: colorData.hex,
                        icon: <IconComponent />
                    };
                }
            }
        } catch (err) { console.error(err); }

        // 2. Legacy Fallback with Better Colors
        const lowerName = type.name?.toLowerCase() || '';

        if (lowerName.includes('aliment') || lowerName.includes('refei'))
            return { color: '#eab308', bg: '#fefce8', border: '#eab308', icon: <Utensils /> };

        if (lowerName.includes('combust') || lowerName.includes('abastec') || lowerName.includes('gasolin') || lowerName.includes('etanol') || lowerName.includes('posto'))
            return { color: '#ef4444', bg: '#fef2f2', border: '#ef4444', icon: <Fuel /> };

        if (lowerName.includes('manuten') || lowerName.includes('oficina') || lowerName.includes('pneu') || lowerName.includes('oleo') || lowerName.includes('carro'))
            return { color: '#3b82f6', bg: '#eff6ff', border: '#3b82f6', icon: <Wrench /> }; // Blue for maintenance/car

        if (lowerName.includes('app') || lowerName.includes('recarga'))
            return { color: '#8b5cf6', bg: '#f5f3ff', border: '#8b5cf6', icon: <Smartphone /> }; // Purple for App/Recarga

        // Default Highlight Color (Emerald/White instead of gray)
        return { color: '#10b981', bg: '#ecfdf5', border: '#10b981', icon: <DollarSign /> };
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // --- NO ACTIVE SHIFT (Should assume initiated from Garage, but if they land here directly...) ---
    if (!activeShift) {
        return (
            <MainLayout>
                <div className="p-4 flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <div className="w-24 h-24 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800">
                        <Clock className="w-10 h-10 text-gray-500" />
                    </div>
                    <h2 className="text-2xl font-bold font-orbitron text-white mb-2">Nenhum Turno Ativo</h2>
                    <p className="text-gray-400 mb-8 max-w-sm">
                        Vá até a Garagem para selecionar um veículo e iniciar seu turno.
                    </p>
                    <Button
                        onClick={() => window.location.href = '/garagem'}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-orbitron px-8 py-6 rounded-xl"
                    >
                        <Car className="mr-2 w-5 h-5" />
                        IR PARA GARAGEM
                    </Button>
                </div>
            </MainLayout>
        );
    }

    const currentVehicle = vehicles.find(v => v.id == activeShift.vehicleId);

    // --- DASHBOARD VIEW ---
    if (viewMode === "dashboard") {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto px-4 py-6 pb-32">

                    {/* Header Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="futuristic-card relative overflow-hidden mb-6 p-6 border-l-4 border-l-emerald-500 bg-gray-900/80 backdrop-blur-md"
                    >
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="text-emerald-500 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Turno Ativo • Iniciado às {new Date(activeShift.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <h1 className="text-3xl font-orbitron font-bold text-white mb-1">
                                    Motorista
                                </h1>
                                <div className="text-gray-400 font-rajdhani font-semibold text-lg flex items-center gap-2">
                                    <span className="text-emerald-400">{currentVehicle?.plate || '---'}</span>
                                    <span>—</span>
                                    <span>{currentVehicle?.modelo || 'Veículo'}</span>
                                </div>
                            </div>

                            <div className="bg-black/50 p-4 rounded-xl border border-gray-800 flex flex-col items-end min-w-[140px]">
                                <span className="text-gray-500 text-xs uppercase font-bold mb-1">Tempo Trabalhado</span>
                                <div className="text-2xl font-orbitron font-bold text-white flex items-center gap-2">
                                    {workedTime}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Big Action Buttons */}
                    <div className="grid grid-cols-1 gap-4 mb-8">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setViewMode("add_ride")}
                            className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 rounded-xl relative overflow-hidden group shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <div className="flex items-center justify-center gap-3 text-white font-orbitron font-bold text-lg tracking-wide uppercase">
                                <Plus className="w-6 h-6" /> ADICIONAR CORRIDA
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setViewMode("add_cost")}
                            className="w-full h-16 bg-red-600 hover:bg-red-500 rounded-xl relative overflow-hidden group shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <div className="flex items-center justify-center gap-3 text-white font-orbitron font-bold text-lg tracking-wide uppercase">
                                <DollarSign className="w-6 h-6" /> ADICIONAR CUSTO
                            </div>
                        </motion.button>
                    </div>

                    {/* Metrics Dashboard */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {/* BRUTO - LARGE */}
                        <div className="col-span-1 md:col-span-1 futuristic-card p-4 bg-gray-900/50 border-emerald-900/30 border">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-2">
                                <Wallet className="w-3 h-3" /> Bruto
                            </div>
                            <div className="text-2xl md:text-3xl font-orbitron font-bold text-white">
                                R$ {(activeShift.totalBruto || 0).toFixed(2).replace('.', ',')}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1 uppercase">App + Particular</div>
                        </div>

                        {/* DESCONTOS */}
                        <div className="col-span-1 md:col-span-1 futuristic-card p-4 bg-gray-900/50 border-red-900/30 border">
                            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase mb-2">
                                <TrendingUp className="w-3 h-3 rotate-180" /> Descontos
                            </div>
                            <div className="text-2xl md:text-3xl font-orbitron font-bold text-white">
                                R$ {(activeShift.totalCustos || 0).toFixed(2).replace('.', ',')}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1 uppercase">Total Gastos</div>
                        </div>

                        {/* LIQUIDO */}
                        <div className="col-span-1 md:col-span-1 futuristic-card p-4 bg-emerald-950/20 border-emerald-500/30 border">
                            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-2">
                                <TrendingUp className="w-3 h-3" /> Líquido
                            </div>
                            <div className="text-2xl md:text-3xl font-orbitron font-bold text-emerald-100">
                                R$ {((activeShift.totalBruto || 0) - (activeShift.totalCustos || 0)).toFixed(2).replace('.', ',')}
                            </div>
                            <div className="text-[10px] text-gray-500 mt-1 uppercase">Receita Real</div>
                        </div>

                        {/* EMPRESA */}
                        <div className="col-span-1 md:col-span-1 futuristic-card p-4 bg-gray-900/50 border-gray-800 border">
                            <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase mb-2">
                                <Building className="w-3 h-3" /> Empresa (60%)
                            </div>
                            <div className="text-xl md:text-2xl font-orbitron font-bold text-gray-300">
                                R$ {(activeShift.repasseEmpresa || 0).toFixed(2).replace('.', ',')}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* MOTORISTA */}
                        <div className="col-span-1 md:col-span-1 futuristic-card p-4 bg-purple-900/10 border-purple-500/30 border">
                            <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase mb-2">
                                <User className="w-3 h-3" /> Motorista (40%)
                            </div>
                            <div className="text-2xl font-orbitron font-bold text-white">
                                R$ {(activeShift.repasseMotorista || 0).toFixed(2).replace('.', ',')}
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-1 futuristic-card p-4 bg-gray-900/50 border-gray-800 border">
                            <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase mb-2">
                                <Smartphone className="w-3 h-3" /> Corridas App
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-orbitron font-bold text-white">{activeShift.totalCorridasApp || 0}</span>
                                <span className="text-xs text-gray-500 mb-1">R$ {(activeShift.totalApp || 0).toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>

                        <div className="col-span-1 md:col-span-1 futuristic-card p-4 bg-orange-900/10 border-orange-500/30 border">
                            <div className="flex items-center gap-2 text-orange-400 font-bold text-xs uppercase mb-2">
                                <User className="w-3 h-3" /> Corridas Particular
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-2xl font-orbitron font-bold text-white">{activeShift.totalCorridasParticular || 0}</span>
                                <span className="text-xs text-gray-500 mb-1">R$ {(activeShift.totalParticular || 0).toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                    </div>

                    {/* RECENT LISTS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* CORRIDAS RECENTES */}
                        <div className="futuristic-card p-5 bg-gray-900/80 border border-gray-800">
                            <h3 className="text-emerald-400 font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
                                <History className="w-5 h-5" /> Corridas
                            </h3>
                            {(!rides || rides.length === 0) ? (
                                <p className="text-gray-600 text-sm italic">Nenhuma corrida registrada.</p>
                            ) : (
                                <div className="space-y-3">
                                    {rides.slice(0, 5).map((r, i) => (
                                        <div key={r.id} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded-md ${r.tipo === 'APP' ? 'bg-blue-900/20 text-blue-400' : 'bg-orange-900/20 text-orange-400'}`}>
                                                    {r.tipo === 'APP' ? <Wallet size={14} /> : <User size={14} />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-gray-300 font-bold text-xs">{r.tipo}</span>
                                                    <span className="text-gray-500 text-[10px]">{new Date(r.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                            <span className="text-white font-bold font-mono">R$ {Number(r.valor).toFixed(2).replace('.', ',')}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* CUSTOS RECENTES */}
                        <div className="futuristic-card p-5 bg-gray-900/80 border border-gray-800">
                            <h3 className="text-red-400 font-orbitron font-bold text-lg mb-4 flex items-center gap-2">
                                <DollarSign className="w-5 h-5" /> Custos
                            </h3>
                            {(!expenses || expenses.length === 0) ? (
                                <p className="text-gray-600 text-sm italic">Nenhum custo registrado.</p>
                            ) : (
                                <div className="space-y-3">
                                    {expenses.slice(0, 5).map(e => {
                                        const typeName = e.tipo || 'Despesa';
                                        return (
                                            <div key={e.id} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2 last:border-0 last:pb-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-1.5 rounded-md bg-red-900/20 text-red-400">
                                                        <Tag size={14} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-gray-300 font-bold text-xs">{typeName}</span>
                                                        <span className="text-gray-500 text-[10px]">{new Date(e.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </div>
                                                <span className="text-red-400 font-bold font-mono">R$ {Number(e.valor).toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* FINISH BUTTON */}
                    <div className="mt-8">
                        <button
                            onClick={() => setViewMode("finish_shift")}
                            className="w-full py-4 rounded-xl border border-gray-700 bg-transparent text-gray-400 font-orbitron uppercase text-sm tracking-wider hover:bg-gray-800 hover:text-white transition-colors flex items-center justify-center gap-2 group"
                        >
                            <LogOut className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                            Encerramento de Turno
                        </button>
                    </div>

                </div>
            </MainLayout>
        );
    }

    // --- ADD RIDE VIEW ---
    if (viewMode === "add_ride") {
        return (
            <MainLayout>
                <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                        <div className="relative z-10">
                            <button
                                onClick={() => setViewMode("dashboard")}
                                className="mb-6 flex items-center text-gray-400 hover:text-white transition-colors text-sm uppercase font-bold tracking-widest"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                            </button>

                            <h2 className="text-2xl font-orbitron font-bold text-white mb-2">Novo Lançamento</h2>
                            <p className="text-gray-500 text-sm mb-8">Selecione o tipo e informe o valor da corrida.</p>

                            {/* Ride Type Switch */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <button
                                    onClick={() => setRideType("APP")}
                                    className={`relative p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${rideType === 'APP'
                                        ? 'bg-blue-900/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    <Wallet className={`w-8 h-8 ${rideType === 'APP' ? 'animate-bounce' : ''}`} />
                                    <span className="font-orbitron font-bold text-sm tracking-wider">APP</span>
                                </button>

                                <button
                                    onClick={() => setRideType("PARTICULAR")}
                                    className={`relative p-4 rounded-xl border flex flex-col items-center justify-center gap-3 transition-all duration-300 ${rideType === 'PARTICULAR'
                                        ? 'bg-orange-900/20 border-orange-500 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                                        : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                                        }`}
                                >
                                    <User className={`w-8 h-8 ${rideType === 'PARTICULAR' ? 'animate-bounce' : ''}`} />
                                    <span className="font-orbitron font-bold text-sm tracking-wider">PARTICULAR</span>
                                </button>
                            </div>

                            {/* Value Input */}
                            <div className="mb-8">
                                <label className="block text-gray-500 text-xs uppercase font-bold mb-2 tracking-wider">Valor da Corrida</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold">R$</span>
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        value={rideValue}
                                        onChange={e => setRideValue(e.target.value)}
                                        className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 pl-12 py-4 text-2xl font-bold text-white focus:border-emerald-500 focus:outline-none focus:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all font-mono"
                                        placeholder="0,00"
                                        autoFocus
                                    />
                                </div>
                            </div>

                            {/* Cooldown Warning */}
                            {rideCooldown > 0 && (
                                <div className="mb-6 bg-red-900/20 border border-red-900/50 rounded-lg p-3 flex items-center gap-3 text-red-400 text-xs">
                                    <Clock className="w-4 h-4" />
                                    <span>Aguarde {rideCooldown}s para o próximo lançamento de app.</span>
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                onClick={handleSaveRide}
                                disabled={!rideValue || rideCooldown > 0 || isSubmitting}
                                className={`w-full py-4 rounded-xl font-orbitron font-bold text-lg uppercase tracking-wider transition-all shadow-lg ${(!rideValue || rideCooldown > 0 || isSubmitting)
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/20'
                                    }`}
                            >
                                {isSubmitting ? 'SALVANDO...' : 'CONFIRMAR LANÇAMENTO'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </MainLayout>
        )
    }

    // --- ADD COST VIEW ---
    if (viewMode === "add_cost") {
        return (
            <MainLayout>
                <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Effects */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                        <div className="relative z-10">
                            <button
                                onClick={() => setViewMode("dashboard")}
                                className="mb-6 flex items-center text-gray-400 hover:text-white transition-colors text-sm uppercase font-bold tracking-widest"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
                            </button>

                            <h2 className="text-2xl font-orbitron font-bold text-white mb-6">Registrar Custo</h2>

                            {/* Type Selection */}
                            <div className="mb-6">
                                <label className="block text-gray-500 text-xs uppercase font-bold mb-2 tracking-wider">Tipo de Despesa</label>
                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1 futuristic-scrollbar">
                                    {costTypesList.map(type => {
                                        const style = getCostTypeStyle(type);
                                        const isSelected = selectedCostType?.id === type.id;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => setSelectedCostType(type)}
                                                style={isSelected ? { borderColor: style.color, backgroundColor: `${style.color}20`, color: style.color } : {}}
                                                className={`p-3 rounded-lg border text-xs font-bold uppercase transition-all flex items-center gap-2 ${isSelected
                                                    ? 'border-current'
                                                    : 'bg-gray-800/40 border-gray-700 text-gray-400 hover:bg-gray-800'
                                                    }`}
                                            >
                                                {isSelected && <CheckCircle2 className="w-3 h-3" />}
                                                {type.name}
                                            </button>
                                        );
                                    })}
                                </div>
                                {!costTypesList.length && (
                                    <p className="text-red-400 text-xs mt-2">
                                        Nenhum tipo de despesa disponível. Contate o suporte.
                                    </p>
                                )}
                            </div>

                            {/* Value Input */}
                            <div className="mb-6">
                                <label className="block text-gray-500 text-xs uppercase font-bold mb-2 tracking-wider">Valor total</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg font-bold">R$</span>
                                    <input
                                        type="number"
                                        inputMode="decimal"
                                        value={costValue}
                                        onChange={e => setCostValue(e.target.value)}
                                        className="w-full bg-black/50 border-2 border-gray-700 rounded-xl px-4 pl-12 py-4 text-2xl font-bold text-white focus:border-red-500 focus:outline-none focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all font-mono"
                                        placeholder="0,00"
                                    />
                                </div>
                            </div>

                            {/* Particular Checkbox */}
                            <div className="mb-6 flex items-center gap-3 bg-gray-800/30 p-3 rounded-xl border border-gray-700/50">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="particular-cost"
                                        checked={isParticularCost}
                                        onChange={(e) => setIsParticularCost(e.target.checked)}
                                        className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border border-gray-600 bg-gray-700 transition-all checked:border-green-500 checked:bg-green-500 hover:border-gray-500"
                                    />
                                    <CheckCircle2 className="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                                </div>
                                <label htmlFor="particular-cost" className="cursor-pointer select-none text-sm font-bold text-gray-300">
                                    Despesa Particular
                                    <span className="block text-[10px] font-normal text-gray-500">Separar do caixa do veículo</span>
                                </label>
                            </div>

                            {/* Obs Input */}
                            <div className="mb-8">
                                <label className="block text-gray-500 text-xs uppercase font-bold mb-2 tracking-wider">Observação (Opcional)</label>
                                <textarea
                                    value={obs}
                                    onChange={e => setObs(e.target.value)}
                                    className="w-full bg-black/50 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:border-gray-500 focus:outline-none transition-all resize-none h-20"
                                    placeholder="Detalhes..."
                                />
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-sm animate-pulse">
                                    {error}
                                </div>
                            )}

                            {/* Action Button */}
                            <button
                                onClick={handleSaveCost}
                                disabled={!costValue || !selectedCostType || isSubmitting}
                                className={`w-full py-4 rounded-xl font-orbitron font-bold text-lg uppercase tracking-wider transition-all shadow-lg ${(!costValue || !selectedCostType || isSubmitting)
                                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                                    : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/20'
                                    }`}
                            >
                                {isSubmitting ? 'SALVANDO...' : 'LANÇAR DESPESA'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            </MainLayout>
        );
    }

    // --- FINISH SHIFT VIEW ---
    if (viewMode === "finish_shift") {
        return (
            <MainLayout>
                <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full max-w-md bg-gray-900 rounded-3xl p-8 border border-gray-800 shadow-2xl relative"
                    >
                        <button
                            onClick={() => setViewMode("dashboard")}
                            className="mb-8 flex items-center text-gray-400 hover:text-white transition-colors text-sm uppercase font-bold tracking-widest"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Painel
                        </button>

                        <h2 className="text-3xl font-orbitron font-bold text-white mb-2">Encerrar Turno</h2>
                        <p className="text-gray-500 text-sm mb-8">Confirme os dados finais para fechar o caixa do veículo.</p>

                        <div className="bg-gray-800/30 rounded-xl p-4 mb-8 border border-gray-700/50">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-400 text-xs uppercase font-bold">KM Inicial</span>
                                {isEditingKmInitial ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            className="w-24 bg-black border border-emerald-500 rounded px-2 py-1 text-white font-mono text-sm"
                                            value={newKmInitial}
                                            onChange={e => setNewKmInitial(e.target.value)}
                                            autoFocus
                                        />
                                        <button onClick={handleUpdateKmInitial} className="p-1 bg-emerald-600 rounded text-white">
                                            <CheckCircle2 size={16} />
                                        </button>
                                        <button onClick={() => setIsEditingKmInitial(false)} className="p-1 bg-red-600 rounded text-white">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-mono">{activeShift.kmInicial} km</span>
                                        <button
                                            onClick={() => {
                                                setNewKmInitial(String(activeShift.kmInicial));
                                                setIsEditingKmInitial(true);
                                            }}
                                            className="text-gray-500 hover:text-emerald-400 transition-colors"
                                        >
                                            <Edit size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-xs uppercase font-bold">Início</span>
                                <span className="text-white font-mono">{new Date(activeShift.inicio).toLocaleTimeString()}</span>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-emerald-500 text-xs uppercase font-bold mb-2 tracking-wider">KM Final</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                    value={kmFinal}
                                    onChange={e => setKmFinal(e.target.value)}
                                    className="w-full bg-black/50 border-2 border-emerald-900/50 rounded-xl px-4 py-4 text-2xl font-bold text-white focus:border-emerald-500 focus:outline-none focus:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all font-mono"
                                    placeholder={activeShift.kmInicial}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">KM</span>
                            </div>
                            {kmFinal && Number(kmFinal) < Number(activeShift.kmInicial) && (
                                <p className="text-red-500 text-xs mt-2 font-bold">O KM final não pode ser menor que o inicial.</p>
                            )}
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleFinishShift}
                            disabled={!kmFinal || Number(kmFinal) < Number(activeShift.kmInicial)}
                            className={`w-full py-4 rounded-xl font-orbitron font-bold text-lg uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 ${(!kmFinal || Number(kmFinal) < Number(activeShift.kmInicial))
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : 'bg-white text-black hover:bg-gray-200 shadow-white/10'
                                }`}
                        >
                            <CheckCircle2 className="w-5 h-5" /> CONFIRMAR ENCERRAMENTO
                        </button>

                    </motion.div>
                </div>
            </MainLayout>
        )
    }

    return null;
}
