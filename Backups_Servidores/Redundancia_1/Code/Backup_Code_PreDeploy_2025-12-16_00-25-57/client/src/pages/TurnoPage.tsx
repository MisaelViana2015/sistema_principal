
import { getVehicleImage } from "../lib/vehicleAssets";
import React, { useState, useEffect } from "react";
import MainLayout from "../components/MainLayout";
import {
    Car, Clock, Play, RotateCcw, CheckCircle2,
    Plus, DollarSign, TrendingUp, Building, User, Wallet, History, X,
    Zap, Tag, Home, ShoppingCart, Package, Wifi, Phone, Users, Fuel, Utensils, Smartphone, Wrench
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { vehiclesService } from "../modules/vehicles/vehicles.service";
import { shiftsService } from "../modules/shifts/shifts.service";
import { ridesService, RideWithDetails } from "../modules/rides/rides.service";
import { Vehicle } from "../../../shared/schema";
import { api } from "../lib/api";
import { AVAILABLE_ICONS, AVAILABLE_COLORS } from "../lib/costTypes";



type ViewMode = "dashboard" | "add_ride" | "add_cost" | "finish_shift";

export default function TurnoPage() {
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

    // Finish Shift State
    const [finishPassword, setFinishPassword] = useState("");

    useEffect(() => {
        loadData();
        loadCostTypes();
    }, [user]);

    // Cooldown Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (rideCooldown > 0) {
            interval = setInterval(() => {
                setRideCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [rideCooldown]);

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
            // Filtrar apenas veículos ATIVOS para o motorista
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
            // If auth fails or any other error, ensuring activeShift is null allows showing the 'Start Shift' screen (or at least not white screen)
            setActiveShift(null);
            setError("Erro ao carregar dados. Tente recarregar.");
        } finally {
            setIsLoading(false);
        }
    }

    async function loadCostTypes() {
        try {
            const res = await api.get("/financial/cost-types");
            // Filtrar apenas tipos de custo ATIVOS
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

    async function handleStartShift() {
        if (!selectedVehicleId || !kmInicial) {
            setError("Selecione um veículo e informe o KM inicial.");
            return;
        }
        try {
            const shift = await shiftsService.startShift(selectedVehicleId, Number(kmInicial));
            setActiveShift(shift);
            setError("");
        } catch (err: any) {
            setError(err.response?.data?.message || "Erro ao iniciar turno.");
        }
    }

    async function handleFinishShift() {
        if (!activeShift || !kmFinal) {
            setError("Informe o KM final.");
            return;
        }
        if (!finishPassword) {
            setError("Informe a senha para confirmar o encerramento.");
            return;
        }
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

            setRideCooldown(300);
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
        if (!selectedCostType || !costValue || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await api.post("/financial/expenses", {
                driverId: user?.id,
                shiftId: activeShift.id,
                costTypeId: selectedCostType.id,
                value: Number(costValue),
                date: new Date(),
                notes: obs
            });
            setCostValue("");
            setObs("");
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
            return { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', icon: <DollarSign /> };
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
        } catch (err) {
            console.error("Error generating style", err);
        }

        // 2. Legacy Fallback: Infer from name query
        const lowerName = type.name?.toLowerCase() || '';
        if (lowerName.includes('aliment') || lowerName.includes('refei'))
            return { color: '#eab308', bg: '#fefce8', border: '#eab308', icon: <Utensils /> };
        if (lowerName.includes('combust') || lowerName.includes('abastec') || lowerName.includes('gasolin') || lowerName.includes('etanol'))
            return { color: '#ef4444', bg: '#fef2f2', border: '#ef4444', icon: <Fuel /> };
        if (lowerName.includes('manuten') || lowerName.includes('oficina') || lowerName.includes('pneu') || lowerName.includes('oleo'))
            return { color: '#6b7280', bg: '#f9fafb', border: '#6b7280', icon: <Wrench /> };
        if (lowerName.includes('lavage') || lowerName.includes('limpez'))
            return { color: '#06b6d4', bg: '#ecfeff', border: '#06b6d4', icon: <Zap /> };
        if (lowerName.includes('pedág') || lowerName.includes('pedag') || lowerName.includes('estacion'))
            return { color: '#f97316', bg: '#fff7ed', border: '#f97316', icon: <Tag /> };
        if (lowerName.includes('recarga') || lowerName.includes('celular') || lowerName.includes('app'))
            return { color: '#22c55e', bg: '#f0fdf4', border: '#22c55e', icon: <Smartphone /> };

        // 3. Generic default
        return { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb', icon: <DollarSign /> };
    };

    // Styles
    const colors = {
        bg: isDark ? '#111827' : '#f9fafb',
        card: isDark ? '#1f2937' : '#fff',
        text: isDark ? '#fff' : '#111827',
        textMuted: isDark ? '#9ca3af' : '#6b7280',
        border: isDark ? '#374151' : '#e5e7eb',
        green: '#22c55e',
        red: '#ef4444',
        yellow: '#eab308',
        blue: '#3b82f6',
    };

    const cardStyle = {
        backgroundColor: colors.card,
        color: colors.text,
        borderRadius: '12px',
        padding: '1.5rem',
        border: `1px solid ${colors.border}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    };

    if (isLoading) return <MainLayout><div className="p-8 text-center">Carregando...</div></MainLayout>;

    try {
        // --- DASHBOARD VIEW ---
        if (activeShift && viewMode === "dashboard") {
            return (
                <MainLayout>
                    <div style={{ maxWidth: '1024px', margin: '0 auto', paddingBottom: '120px' }}>
                        {/* Header */}
                        <div style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', padding: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: colors.text }}>
                                    {user?.nome?.split(' ')[0] || 'Motorista'}
                                </h2>
                                <div style={{ color: colors.textMuted, fontSize: '0.75rem' }}>
                                    {vehicles.find(v => v.id == activeShift.vehicleId)?.plate} — {vehicles.find(v => v.id == activeShift.vehicleId)?.modelo}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ color: colors.textMuted, fontSize: '0.7rem' }}>Início</div>
                                <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                                    {new Date(activeShift.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div style={{ color: colors.textMuted, fontSize: '0.7rem' }}>{activeShift.kmInicial} km</div>
                            </div>
                        </div>

                        {/* Timer */}
                        <div style={{ textAlign: 'center', marginBottom: '1rem', color: colors.textMuted, fontSize: '0.8rem' }}>
                            <Clock className="w-4 h-4 inline mr-2" />
                            Tempo Trabalhado: {workedTime}
                        </div>

                        {/* Main Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <button
                                onClick={() => setViewMode("add_ride")}
                                style={{ backgroundColor: colors.green, color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                <Plus size={18} /> Add Corrida
                            </button>
                            <button
                                onClick={() => setViewMode("add_cost")}
                                style={{ backgroundColor: colors.red, color: 'white', padding: '0.75rem', borderRadius: '8px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                <DollarSign size={18} /> Add Custo
                            </button>
                        </div>

                        {/* Stats Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                            {/* BRUTO */}
                            <div style={{ ...cardStyle, backgroundColor: '#fef9c3', borderColor: '#fde047', color: '#854d0e', padding: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    <DollarSign size={14} /> Bruto
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                    R$ {(activeShift.totalBruto || 0).toFixed(2).replace('.', ',')}
                                </div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>App + Particular</div>
                            </div>

                            {/* DESCONTOS */}
                            <div style={{ ...cardStyle, backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#991b1b', padding: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    <TrendingUp size={14} style={{ transform: 'rotate(180deg)' }} /> Descontos
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                    R$ {(activeShift.totalCustos || 0).toFixed(2).replace('.', ',')}
                                </div>
                            </div>

                            {/* LIQUIDO */}
                            <div style={{ ...cardStyle, backgroundColor: '#dcfce7', borderColor: '#86efac', color: '#166534', padding: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    <TrendingUp size={14} /> Líquido
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                    R$ {((activeShift.totalBruto || 0) - (activeShift.totalCustos || 0)).toFixed(2).replace('.', ',')}
                                </div>
                            </div>

                            {/* EMPRESA 60% */}
                            <div style={{ ...cardStyle, padding: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: colors.blue }}>
                                    <Building size={14} /> Empresa (60%)
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: colors.text }}>
                                    R$ {(activeShift.repasseEmpresa || 0).toFixed(2).replace('.', ',')}
                                </div>
                            </div>

                            {/* MOTORISTA 40% */}
                            <div style={{ ...cardStyle, padding: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#a855f7' }}>
                                    <User size={14} /> Motorista (40%)
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem', color: colors.text }}>
                                    R$ {(activeShift.repasseMotorista || 0).toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                        </div>

                        {/* Counts */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ ...cardStyle, padding: '1rem' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: colors.blue }}>
                                    <Wallet size={14} /> Corridas App
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                    {activeShift.totalCorridasApp || 0}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: colors.textMuted }}>
                                    R$ {(activeShift.totalApp || 0).toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                            <div style={{ ...cardStyle, padding: '1rem', backgroundColor: isDark ? '#431407' : '#ffedd5', borderColor: isDark ? '#7c2d12' : '#fed7aa', color: isDark ? '#fdba74' : '#9a3412' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                    <User size={14} /> Corridas Particular
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
                                    {activeShift.totalCorridasParticular || 0}
                                </div>
                                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                                    R$ {(activeShift.totalParticular || 0).toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                        </div>

                        {/* Lists */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
                            {/* Corridas Detalhadas */}
                            <div style={cardStyle}>
                                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Corridas</h3>

                                {/* APP */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2 text-blue-500 font-bold uppercase text-xs">
                                        <Wallet size={14} /> APP:
                                    </div>
                                    <div className="space-y-1">
                                        {(rides || []).filter(r => r.tipo === 'APP').map((r, i) => (
                                            <div key={r.id} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-1">
                                                <div className="flex gap-2 text-gray-500">
                                                    <span>{i + 1}</span>
                                                    <span>{r.hora ? new Date(r.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</span>
                                                </div>
                                                <span>R$ {Number(r.valor).toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs font-bold border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                                        <span>Total de Corridas = {activeShift.totalCorridasApp || 0}</span>
                                        <span>Total = R$ {(activeShift.totalApp || 0).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </div>

                                {/* PARTICULAR */}
                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2 text-green-500 font-bold uppercase text-xs">
                                        <User size={14} /> Particular:
                                    </div>
                                    <div className="space-y-1">
                                        {(rides || []).filter(r => r.tipo === 'PARTICULAR').map((r, i) => (
                                            <div key={r.id} className="flex justify-between items-center text-sm border-b border-gray-100 dark:border-gray-800 pb-1">
                                                <div className="flex gap-2 text-gray-500">
                                                    <span>{i + 1}</span>
                                                    <span>{r.hora ? new Date(r.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}</span>
                                                </div>
                                                <span>R$ {Number(r.valor).toFixed(2).replace('.', ',')}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs font-bold border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                                        <span>Total de Corridas = {activeShift.totalCorridasParticular || 0}</span>
                                        <span>Total = R$ {(activeShift.totalParticular || 0).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                </div>

                                {/* GRAND TOTAL */}
                                <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg flex justify-between font-bold text-sm mt-4 items-center">
                                    <span>APP + Particular = {(activeShift.totalCorridasApp || 0) + (activeShift.totalCorridasParticular || 0)} corridas</span>
                                    <span className="text-lg">R$ {(activeShift.totalBruto || 0).toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>

                            {/* Custos Detalhados */}
                            <div style={cardStyle}>
                                <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Custos</h3>
                                {(expenses || []).length === 0 ? <p className="text-sm text-gray-500 dark:text-gray-400">Nenhum custo registrado</p> :
                                    (expenses || []).map(e => {
                                        const typeName = e.tipo || 'Despesa';
                                        const style = getCostTypeStyle(e);

                                        return (
                                            <div key={e.id} className="flex gap-3 items-start py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                                <div style={{ backgroundColor: style.bg, color: style.color }} className="p-2 rounded-full">
                                                    {React.cloneElement(style.icon as React.ReactElement, { size: 16 })}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className="font-bold text-sm">{typeName}</span>
                                                        <span className="font-bold text-red-500 text-sm">R$ {Number(e.valor).toFixed(2).replace('.', ',')}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex gap-2">
                                                        <span>{new Date(e.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        {e.notes && <span>• {e.notes}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div style={{ marginTop: '2rem' }}>
                            <button
                                onClick={() => setViewMode("finish_shift")}
                                style={{
                                    width: '100%',
                                    backgroundColor: 'black',
                                    color: 'white',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '1rem'
                                }}
                            >
                                <X className="inline w-5 h-5 mr-2" /> Encerrar Turno
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
                    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
                        <button onClick={() => setViewMode("dashboard")} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: colors.text }}>
                            ← Voltar
                        </button>

                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: colors.text }}>Adicionar Corrida</h2>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>Tipo de Corrida *</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        onClick={() => setRideType("APP")}
                                        style={{
                                            flex: 1, padding: '1.5rem', borderRadius: '8px',
                                            border: rideType === "APP" ? `2px solid #3b82f6` : `1px solid ${colors.border}`,
                                            backgroundColor: rideType === "APP" ? '#eff6ff' : colors.bg,
                                            color: rideType === "APP" ? '#1d4ed8' : colors.text,
                                            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        <Wallet />
                                        <span style={{ fontWeight: 'bold' }}>App</span>
                                    </button>
                                    <button
                                        onClick={() => setRideType("PARTICULAR")}
                                        style={{
                                            flex: 1, padding: '1.5rem', borderRadius: '8px',
                                            border: rideType === "PARTICULAR" ? `2px solid #22c55e` : `1px solid ${colors.border}`,
                                            backgroundColor: rideType === "PARTICULAR" ? '#f0fdf4' : colors.bg,
                                            color: rideType === "PARTICULAR" ? '#15803d' : colors.text,
                                            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                                        }}
                                    >
                                        <User />
                                        <span style={{ fontWeight: 'bold' }}>Particular</span>
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>Valor (R$) *</label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={rideValue}
                                    onChange={e => setRideValue(e.target.value)}
                                    onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                    style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.bg, color: colors.text }}
                                    placeholder="Digite o valor"
                                    autoFocus
                                />
                            </div>

                            {rideCooldown > 0 && (
                                <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                    <Clock size={16} />
                                    <span>Aguarde para lançar nova corrida. Próximo lançamento em: 0:{String(rideCooldown).padStart(2, '0')}</span>
                                </div>
                            )}

                            <button
                                onClick={handleSaveRide}
                                disabled={!rideValue || rideCooldown > 0 || isSubmitting}
                                style={{
                                    width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                                    backgroundColor: (!rideValue || rideCooldown > 0 || isSubmitting) ? colors.border : colors.green,
                                    color: 'white', fontWeight: 'bold', cursor: (!rideValue || rideCooldown > 0 || isSubmitting) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isSubmitting ? 'Salvando...' : (rideCooldown > 0 ? `Aguarde ${rideCooldown}s` : 'Salvar Corrida')}
                            </button>
                        </div>
                    </div>
                </MainLayout>
            )
        }

        // --- ADD COST VIEW ---
        if (viewMode === "add_cost") {
            return (
                <MainLayout>
                    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
                        <button onClick={() => setViewMode("dashboard")} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: colors.text }}>
                            ← Voltar
                        </button>

                        <div style={cardStyle}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: colors.text }}>Adicionar Custo</h2>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>Tipo de Custo *</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {costTypesList.map(type => {
                                        const style = getCostTypeStyle(type);
                                        const isSelected = selectedCostType?.id === type.id;
                                        return (
                                            <button
                                                key={type.id}
                                                onClick={() => setSelectedCostType(type)}
                                                style={{
                                                    width: '100%', padding: '1rem', borderRadius: '8px',
                                                    border: isSelected ? `2px solid ${style.color}` : `1px solid ${colors.border}`,
                                                    backgroundColor: isSelected ? style.bg : colors.bg,
                                                    color: isSelected ? style.color : colors.text,
                                                    display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', fontWeight: 'bold'
                                                }}
                                            >
                                                <div style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: style.bg, color: style.color }}>
                                                    {style.icon}
                                                </div>
                                                {type.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>Valor (R$) *</label>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    value={costValue}
                                    onChange={e => setCostValue(e.target.value)}
                                    onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                                    style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.bg, color: colors.text }}
                                    placeholder="Digite o valor"
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>Observação (opcional)</label>
                                <textarea
                                    value={obs}
                                    onChange={e => setObs(e.target.value)}
                                    style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.bg, color: colors.text, minHeight: '100px' }}
                                    placeholder="Detalhes adicionais..."
                                />
                            </div>

                            <button
                                onClick={handleSaveCost}
                                disabled={!costValue || !selectedCostType || isSubmitting}
                                style={{
                                    width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                                    backgroundColor: (!costValue || !selectedCostType || isSubmitting) ? colors.border : colors.green,
                                    color: 'white', fontWeight: 'bold', cursor: (!costValue || !selectedCostType || isSubmitting) ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {isSubmitting ? 'Salvando...' : 'Salvar Custo'}
                            </button>
                        </div>
                    </div>
                </MainLayout>
            );
        }

        // --- FINISH SHIFT VIEW ---
        if (viewMode === "finish_shift") {
            const kmRodados = kmFinal ? Number(kmFinal) - Number(activeShift.kmInicial) : 0;
            const totalReceita = activeShift.totalBruto || 0;
            const totalCustos = activeShift.totalCustos || 0;
            const lucroLiquido = totalReceita - totalCustos;
            const valorPorKm = kmRodados > 0 ? totalReceita / kmRodados : 0;
            const totalCorridas = (activeShift.totalCorridasApp || 0) + (activeShift.totalCorridasParticular || 0);
            const ticketMedio = totalCorridas > 0 ? totalReceita / totalCorridas : 0;

            const start = new Date(activeShift.inicio);
            const now = new Date();
            const diffMs = now.getTime() - start.getTime();
            const diffMins = Math.round(diffMs / 60000);
            const durationStr = `${Math.floor(diffMins / 60)}h ${diffMins % 60}min`;

            const appRides = (rides || []).filter(r => r.tipo === 'APP');
            const particularRides = (rides || []).filter(r => r.tipo === 'PARTICULAR');

            return (
                <MainLayout>
                    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem', paddingBottom: '200px' }}>
                        <button onClick={() => {
                            setViewMode("dashboard");
                            loadData(); // Reload dashboard data (recent rides)
                        }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: colors.text }}>
                            ← Voltar
                        </button>

                        <div style={{ ...cardStyle, marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem', color: colors.text }}>Encerramento de Turno</h2>
                            <div style={{ color: colors.textMuted, fontSize: '0.875rem' }}>
                                Motorista: <span className="font-bold">{user?.nome}</span> <br />
                                {vehicles.find(v => v.id == activeShift.vehicleId)?.plate} — {vehicles.find(v => v.id == activeShift.vehicleId)?.modelo}
                            </div>
                        </div>

                        {/* App Summary */}
                        <div style={{ ...cardStyle, marginBottom: '1rem', padding: '1.25rem' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-500 text-white rounded-lg"><Wallet size={20} /></div>
                                <span className="font-bold text-lg">Aplicativo</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                {appRides.map((ride, idx) => (
                                    <div key={ride.id} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                        <span className="text-gray-500">{idx + 1} - {new Date(ride.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="font-bold">R$ {Number(ride.valor).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-bold text-base pt-2">
                                    <span>Total APP</span>
                                    <span>R$ {(activeShift.totalApp || 0).toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-xs">
                                    <span>Total Corridas APP</span>
                                    <span>{activeShift.totalCorridasApp || 0}</span>
                                </div>
                            </div>
                        </div>

                        {/* Particular Summary */}
                        <div style={{ ...cardStyle, marginBottom: '2rem', padding: '1.25rem' }}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-green-500 text-white rounded-lg"><User size={20} /></div>
                                <span className="font-bold text-lg">Particular</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                {particularRides.map((ride, idx) => (
                                    <div key={ride.id} className="flex justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
                                        <span className="text-gray-500">{idx + 1} - {new Date(ride.hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span className="font-bold">R$ {Number(ride.valor).toFixed(2).replace('.', ',')}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between font-bold text-base pt-2">
                                    <span>Total Particular</span>
                                    <span>R$ {(activeShift.totalParticular || 0).toFixed(2).replace('.', ',')}</span>
                                </div>
                                <div className="flex justify-between text-gray-500 text-xs">
                                    <span>Total Corridas Particulares</span>
                                    <span>{activeShift.totalCorridasParticular || 0}</span>
                                </div>
                            </div>
                        </div>

                        <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.1rem' }}>Resumo Financeiro</h3>
                        <div className="space-y-3 mb-8">
                            {/* Receita Total - Brown/Orange */}
                            <div style={{ backgroundColor: '#9a3412', color: 'white' }} className="rounded-lg p-4 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-3 font-bold">
                                    <div className="bg-white/20 p-1.5 rounded"><DollarSign size={18} /></div>
                                    Receita Total
                                </div>
                                <div className="text-xl font-bold">R$ {totalReceita.toFixed(2).replace('.', ',')}</div>
                            </div>

                            {/* Custos - Red */}
                            <div style={{ backgroundColor: '#dc2626', color: 'white' }} className="rounded-lg p-4 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-3 font-bold">
                                    <div className="bg-white/20 p-1.5 rounded"><TrendingUp size={18} style={{ transform: 'rotate(180deg)' }} /></div>
                                    Custos
                                </div>
                                <div className="text-xl font-bold">R$ {totalCustos.toFixed(2).replace('.', ',')}</div>
                            </div>

                            {/* Lucro Líquido - Green */}
                            <div style={{ backgroundColor: '#16a34a', color: 'white' }} className="rounded-lg p-4 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-3 font-bold">
                                    <div className="bg-white/20 p-1.5 rounded"><TrendingUp size={18} /></div>
                                    Lucro Líquido
                                </div>
                                <div className="text-xl font-bold">R$ {lucroLiquido.toFixed(2).replace('.', ',')}</div>
                            </div>

                            {/* Empresa - Blue */}
                            <div style={{ backgroundColor: '#2563eb', color: 'white' }} className="rounded-lg p-4 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-3 font-bold">
                                    <div className="bg-white/20 p-1.5 rounded"><Building size={18} /></div>
                                    Empresa (60%)
                                </div>
                                <div className="text-xl font-bold">R$ {(activeShift.repasseEmpresa || 0).toFixed(2).replace('.', ',')}</div>
                            </div>

                            {/* Motorista - Purple */}
                            <div style={{ backgroundColor: '#7e22ce', color: 'white' }} className="rounded-lg p-4 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-3 font-bold">
                                    <div className="bg-white/20 p-1.5 rounded"><User size={18} /></div>
                                    Motorista (40%)
                                </div>
                                <div className="text-xl font-bold">R$ {(activeShift.repasseMotorista || 0).toFixed(2).replace('.', ',')}</div>
                            </div>
                        </div>

                        <h3 style={{ fontWeight: 'bold', marginBottom: '1rem', fontSize: '1.1rem' }}>Estatísticas</h3>
                        <div className="grid grid-cols-2 gap-3 mb-8">
                            <div style={{ ...cardStyle, padding: '1rem' }} className="text-center">
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Ticket Médio</div>
                                <div className="font-bold text-lg">R$ {ticketMedio.toFixed(2).replace('.', ',')}</div>
                            </div>
                            <div style={{ ...cardStyle, padding: '1rem' }} className="text-center">
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Valor por KM</div>
                                <div className="font-bold text-lg">R$ {valorPorKm.toFixed(2).replace('.', ',')}</div>
                            </div>
                            <div style={{ ...cardStyle, padding: '1rem' }} className="text-center">
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">KM Rodados</div>
                                <div className="font-bold text-lg">{kmRodados} km</div>
                            </div>
                            <div style={{ ...cardStyle, padding: '1rem' }} className="text-center">
                                <div className="text-xs text-gray-500 uppercase font-bold mb-1">Duração</div>
                                <div className="font-bold text-lg">{durationStr}</div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>KM Final *</label>
                            <input
                                type="number"
                                inputMode="decimal"
                                value={kmFinal}
                                onChange={e => setKmFinal(e.target.value)}
                                style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.bg, color: colors.text }}
                                placeholder="Digite o KM final"
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>Senha de Encerramento *</label>
                            <input
                                type="password"
                                value={finishPassword}
                                onChange={e => setFinishPassword(e.target.value)}
                                style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.bg, color: colors.text }}
                                placeholder="Digite sua senha"
                            />
                        </div>

                        {error && (
                            <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fca5a5' }}>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleFinishShift}
                            disabled={!kmFinal || !finishPassword}
                            style={{
                                width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                                backgroundColor: (!kmFinal || !finishPassword) ? colors.border : 'black',
                                color: 'white', fontWeight: 'bold', cursor: (!kmFinal || !finishPassword) ? 'not-allowed' : 'pointer',
                                fontSize: '1.1rem'
                            }}
                        >
                            Confirmar Encerramento
                        </button>
                        <p className="text-center text-xs text-gray-400 mt-4">
                            Ao encerrar, os valores serão computados e o veículo liberado.
                        </p>
                    </div>
                </MainLayout>
            );
        }

        // --- START SHIFT VIEW (FALLBACK WHEN NO ACTIVE SHIFT) ---
        if (!activeShift && !isLoading) {
            return (
                <MainLayout>
                    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
                        <div style={{ ...cardStyle, textAlign: 'center', padding: '2rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: colors.text }}>Iniciar Novo Turno</h2>

                            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', color: colors.text, fontSize: '1.2rem' }}>
                                    Selecione sua Máquina
                                </label>

                                <div style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                                    gap: '1rem',
                                    maxHeight: '500px',
                                    overflowY: 'auto',
                                    padding: '0.5rem'
                                }}>
                                    {vehicles.filter(v => v.isActive).map(v => {
                                        const isSelected = selectedVehicleId === v.id;
                                        return (
                                            <div
                                                key={v.id}
                                                onClick={() => setSelectedVehicleId(v.id)}
                                                style={{
                                                    position: 'relative',
                                                    borderRadius: '16px',
                                                    overflow: 'hidden',
                                                    cursor: 'pointer',
                                                    border: isSelected ? '2px solid #3b82f6' : '1px solid #334155',
                                                    background: isSelected
                                                        ? 'linear-gradient(180deg, #1e3a8a 0%, #172554 100%)'
                                                        : 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', // Always dark/premium for vehicle card
                                                    boxShadow: isSelected
                                                        ? '0 0 15px rgba(59, 130, 246, 0.6)'
                                                        : '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                                                    transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                                }}
                                            >
                                                {/* Selection Badge */}
                                                {isSelected && (
                                                    <div style={{
                                                        position: 'absolute', top: '8px', right: '8px', zIndex: 20,
                                                        color: '#60a5fa', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', padding: '2px'
                                                    }}>
                                                        <CheckCircle2 size={20} fill="#3b82f6" color="white" />
                                                    </div>
                                                )}

                                                {/* Garage Spotlight Background */}
                                                <div style={{
                                                    height: '110px',
                                                    // Sem gradiente, pois é estilo card agora
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    position: 'relative',
                                                    padding: '4px'
                                                }}>

                                                    {/* Car Image - Style Card Cover */}
                                                    <img
                                                        src={getVehicleImage(v.modelo, v.plate)}
                                                        alt={v.modelo}
                                                        referrerPolicy="no-referrer"
                                                        style={{
                                                            width: '100%', height: '100%',
                                                            objectFit: 'cover',
                                                            borderRadius: '12px',
                                                            zIndex: 10
                                                        }}
                                                        onError={(e) => {
                                                            const target = e.target as HTMLImageElement;
                                                            // Fallback: Silhueta Branca
                                                            target.src = "https://cdn-icons-png.flaticon.com/512/55/55283.png";
                                                            target.style.objectFit = 'contain';
                                                            target.style.padding = '20px';
                                                            target.style.opacity = '0.7';
                                                        }}
                                                    />
                                                </div>

                                                {/* Info Footer */}
                                                <div style={{
                                                    padding: '0.75rem',
                                                    background: 'rgba(0,0,0,0.2)',
                                                    borderTop: '1px solid rgba(255,255,255,0.05)',
                                                    textAlign: 'center'
                                                }}>
                                                    <div style={{
                                                        color: '#fff',
                                                        fontWeight: '800',
                                                        fontSize: '1.1rem',
                                                        letterSpacing: '1px',
                                                        marginBottom: '2px'
                                                    }}>
                                                        {v.plate}
                                                    </div>
                                                    <div style={{
                                                        color: '#94a3b8',
                                                        fontSize: '0.7rem',
                                                        fontWeight: '600',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px'
                                                    }}>
                                                        {v.modelo}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: colors.text }}>KM Inicial</label>
                                <input
                                    type="number"
                                    value={kmInicial}
                                    onChange={e => setKmInicial(e.target.value)}
                                    style={{ width: '100%', padding: '1rem', fontSize: '1.25rem', borderRadius: '8px', border: `1px solid ${colors.border}`, backgroundColor: colors.bg, color: colors.text }}
                                    placeholder="000000"
                                />
                            </div>

                            {error && (
                                <div style={{ backgroundColor: '#fef2f2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #fca5a5' }}>
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={handleStartShift}
                                style={{
                                    width: '100%', padding: '1rem', borderRadius: '8px', border: 'none',
                                    backgroundColor: 'black', color: 'white', fontWeight: 'bold', cursor: 'pointer',
                                    fontSize: '1.1rem'
                                }}
                            >
                                <Play className="inline w-5 h-5 mr-2" /> Iniciar Turno
                            </button>
                        </div>
                    </div>
                </MainLayout>
            );
        }

    } catch (err) {
        console.error("Critical rendering error", err);
        return (
            <MainLayout>
                <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                    <h3 style={{ fontWeight: 'bold', marginBottom: '1rem' }}>Erro crítico ao renderizar</h3>
                    <pre style={{ textAlign: 'left', background: '#f3f4f6', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
                        {String(err)}
                    </pre>
                </div>
            </MainLayout>
        );
    }

    return null;
}
