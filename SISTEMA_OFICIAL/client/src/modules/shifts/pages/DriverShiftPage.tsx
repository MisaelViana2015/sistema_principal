import React, { useState } from "react";
import MainLayout from "../../../components/MainLayout";
import { useTheme } from "../../../contexts/ThemeContext";
import { useAuth } from "../../../contexts/AuthContext";
import MaintenanceAlertPopup from "../../../components/MaintenanceAlertPopup";
import { Clock, Car, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// Hooks
import { useDriverShiftData } from "../hooks/useDriverShiftData";
import { useShiftTimer } from "../hooks/useShiftTimer";
import { useDriverActions } from "../hooks/useDriverActions";

// Components
import { ShiftHeader } from "../components/driver/ShiftHeader";
import { ShiftActionButtons } from "../components/driver/ShiftActionButtons";
import { ShiftMetrics } from "../components/driver/ShiftMetrics";
import { ShiftHistoryLists } from "../components/driver/ShiftHistoryLists";
import { AddRideForm } from "../components/driver/AddRideForm";
import { AddExpenseForm } from "../components/driver/AddExpenseForm";
import { FinishShiftForm } from "../components/driver/FinishShiftForm";

type ViewMode = "dashboard" | "add_ride" | "add_cost" | "finish_shift";

export default function DriverShiftPage() {
    const { theme } = useTheme();
    const { user } = useAuth();
    const [viewMode, setViewMode] = useState<ViewMode>("dashboard");

    // DATA HOOK
    const {
        activeShift,
        vehicles,
        rides,
        expenses,
        costTypesList,
        isLoading,
        error: dataError,
        clearError: clearDataError,
        refreshData
    } = useDriverShiftData();

    // TIMER HOOK
    const workedTime = useShiftTimer(activeShift?.inicio);

    // ACTIONS HOOK
    const {
        handleSaveRide,
        handleSaveCost,
        handleFinishShift,
        isSubmitting,
        error: actionError,
        setError: setActionError,
        rideCooldown,
        costCooldown
    } = useDriverActions(activeShift, rides, expenses, user, () => {
        refreshData();
        setViewMode("dashboard");
    });

    const currentVehicle = vehicles.find(v => v.id == activeShift?.vehicleId);
    const displayError = dataError || actionError;

    const handleClearErrors = () => {
        setActionError("");
        clearDataError();
        if (dataError) refreshData();
    };


    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // --- NO ACTIVE SHIFT ---
    if (!activeShift) {
        return (
            <MainLayout>
                <MaintenanceAlertPopup />
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

    // --- DASHBOARD VIEW ---
    if (viewMode === "dashboard") {
        return (
            <MainLayout>
                <MaintenanceAlertPopup />
                <div className="max-w-4xl mx-auto px-4 py-6 pb-32">

                    <ShiftHeader
                        user={user}
                        activeShift={activeShift}
                        vehicle={currentVehicle}
                        workedTime={workedTime}
                    />

                    <ShiftActionButtons
                        onAddRide={() => setViewMode("add_ride")}
                        onAddCost={() => setViewMode("add_cost")}
                    />

                    <ShiftMetrics activeShift={activeShift} />

                    <ShiftHistoryLists rides={rides} expenses={expenses} />

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

                    {/* Global Error Toast equivalent */}
                    {displayError && (
                        <div className="fixed bottom-20 left-4 right-4 bg-red-900/90 text-white p-4 rounded-xl border border-red-500 shadow-xl z-50 text-center animate-in slide-in-from-bottom-2">
                            {displayError}
                            <button onClick={handleClearErrors} className="absolute top-2 right-2 text-white/50 hover:text-white">x</button>
                        </div>
                    )}
                </div>
            </MainLayout>
        );
    }

    // --- SUB-VIEWS ---
    if (viewMode === "add_ride") {
        return (
            <MainLayout>
                <AddRideForm
                    onSave={handleSaveRide}
                    onCancel={() => setViewMode("dashboard")}
                    isSubmitting={isSubmitting}
                    error={actionError}
                    cooldown={rideCooldown}
                />
            </MainLayout>
        );
    }

    if (viewMode === "add_cost") {
        return (
            <MainLayout>
                <AddExpenseForm
                    onSave={handleSaveCost}
                    onCancel={() => setViewMode("dashboard")}
                    costTypes={costTypesList}
                    isSubmitting={isSubmitting}
                    error={actionError}
                />
            </MainLayout>
        );
    }

    if (viewMode === "finish_shift") {
        return (
            <MainLayout>
                <FinishShiftForm
                    activeShift={activeShift}
                    onFinish={handleFinishShift}
                    onCancel={() => setViewMode("dashboard")}
                    error={actionError}
                />
            </MainLayout>
        );
    }

    return null;
}
