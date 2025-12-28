
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginPage from "./pages/LoginPage";
// import DashboardPage from "./pages/DashboardPage"; // Unused
import { lazy, Suspense } from "react";

// Lazy load new modules
const VeiculosPage = lazy(() => import("./modules/vehicles/VehiclesPage"));
const DriversPage = lazy(() => import("./modules/drivers/DriversPage"));
const ShiftsPage = lazy(() => import("./modules/shifts/ShiftsPage"));
const DriverShiftPage = lazy(() => import("./modules/shifts/pages/DriverShiftPage"));
// const RidesPage = lazy(() => import("./modules/rides/RidesPage")); // Unused
const DriverFinancePage = lazy(() => import("./modules/financial/pages/DriverFinancePage"));
const RidesHistoryPage = lazy(() => import("./modules/rides/pages/RidesHistoryPage"));
const PerformancePage = lazy(() => import("./modules/performance/pages/PerformancePage"));
const GaragePage = lazy(() => import("./modules/garage/pages/GaragePage"));


import AdminDashboard from "./pages/AdminDashboard";
import FraudDashboard from "./modules/Fraud/FraudDashboard";
const FraudEventDetail = lazy(() => import("./modules/Fraud/pages/FraudEventDetail"));
const FraudEventsList = lazy(() => import("./modules/Fraud/pages/FraudEventsList"));
const FraudAnalysisQueue = lazy(() => import("./modules/Fraud/pages/FraudAnalysisQueue"));
const FraudDriverProfile = lazy(() => import("./modules/Fraud/pages/FraudDriverProfile"));
const FraudReports = lazy(() => import("./modules/Fraud/pages/FraudReports"));
const FraudVehicleProfile = lazy(() => import("./modules/Fraud/pages/FraudVehicleProfile"));
const FraudConfiguration = lazy(() => import("./modules/Fraud/pages/FraudConfiguration"));
const FraudLogs = lazy(() => import("./modules/Fraud/pages/FraudLogs"));

import MainLayout from "./components/MainLayout"; // Not currently used in layout but imported

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <Routes>
                            {/* Public Routes */}
                            <Route path="/login" element={<LoginPage />} />

                            {/* Protected Routes (Authenticated Users) */}
                            <Route element={<ProtectedRoute />}>
                                {/* Root Redirect - Changed to Garage */}
                                <Route path="/" element={<Navigate to="/garagem" replace />} />

                                {/* Shared Routes (Driver/Admin) - Motoristas veem apenas seus dados */}
                                <Route path="/garagem" element={
                                    <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                                        <GaragePage />
                                    </Suspense>
                                } />
                                <Route path="/turno" element={
                                    <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                                        <DriverShiftPage />
                                    </Suspense>
                                } />
                                <Route path="/corridas" element={
                                    <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                                        <RidesHistoryPage />
                                    </Suspense>
                                } />
                                <Route path="/caixa" element={
                                    <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                                        <DriverFinancePage />
                                    </Suspense>
                                } />

                                {/* Admin Only Routes */}
                                <Route element={<AdminRoute />}>
                                    <Route path="/admin" element={<AdminDashboard />} />

                                    {/* Modules - Admin Only */}
                                    <Route path="/veiculos" element={
                                        <Suspense fallback={<div className="p-10 text-center">Carregando módulo...</div>}>
                                            <VeiculosPage />
                                        </Suspense>
                                    } />
                                    <Route
                                        path="/motoristas"
                                        element={
                                            <Suspense fallback={<div className="p-10 text-center">Carregando módulo...</div>}>
                                                <DriversPage />
                                            </Suspense>
                                        }
                                    />
                                    <Route path="/turnos" element={
                                        <Suspense fallback={<div className="p-10 text-center">Carregando módulo...</div>}>
                                            <ShiftsPage />
                                        </Suspense>
                                    } />
                                    <Route path="/desempenho" element={
                                        <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                                            <PerformancePage />
                                        </Suspense>
                                    } />
                                    {/* Fraud detail routes - main dashboard accessed via Admin tab */}
                                    <Route path="/fraude/eventos" element={
                                        <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                                            <FraudEventsList />
                                        </Suspense>
                                    } />
                                    <Route path="/fraude/fila" element={
                                        <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                                            <FraudAnalysisQueue />
                                        </Suspense>
                                    } />
                                    <Route path="/fraude/evento/:id" element={
                                        <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                                            <FraudEventDetail />
                                        </Suspense>
                                    } />
                                    <Route path="/fraude/motorista/:driverId" element={
                                        <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                                            <FraudDriverProfile />
                                        </Suspense>
                                    } />
                                    <Route path="/fraude/relatorios" element={
                                        <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                                            <FraudReports />
                                        </Suspense>
                                    } />
                                    <Route path="/fraude/veiculo/:vehicleId" element={
                                        <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                                            <FraudVehicleProfile />
                                        </Suspense>
                                    } />
                                    <Route path="/fraude/configuracao" element={
                                        <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                                            <FraudConfiguration />
                                        </Suspense>
                                    } />
                                    <Route path="/fraude/logs" element={
                                        <Suspense fallback={<div className="p-10 text-center">Carregando...</div>}>
                                            <FraudLogs />
                                        </Suspense>
                                    } />
                                </Route>
                            </Route>

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/garagem" replace />} />
                        </Routes>
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
