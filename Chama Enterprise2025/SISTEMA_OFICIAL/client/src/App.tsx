
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
// const RidesPage = lazy(() => import("./modules/rides/RidesPage")); // Unused

import TurnoPage from "./pages/TurnoPage";
import GaragePage from "./pages/GaragePage"; // New Garage Page
import CorridasPage from "./pages/CorridasPage";
import CaixaPage from "./pages/CaixaPage";
import DesempenhoPage from "./pages/DesempenhoPage";
import AdminDashboard from "./pages/AdminDashboard";

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
                                <Route path="/garagem" element={<GaragePage />} />
                                <Route path="/turno" element={<TurnoPage />} />
                                <Route path="/corridas" element={<CorridasPage />} />
                                <Route path="/caixa" element={<CaixaPage />} />
                                <Route path="/desempenho" element={<DesempenhoPage />} />

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
