
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import VeiculosPage from "./pages/VeiculosPage";
import TurnoPage from "./pages/TurnoPage";
import CorridasPage from "./pages/CorridasPage";
import CaixaPage from "./pages/CaixaPage";
import DesempenhoPage from "./pages/DesempenhoPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLegacy from "./pages/AdminLegacy";
import MainLayout from "./components/MainLayout";

// Wrapper for protected routes just in case
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <ThemeProvider>
                    <AuthProvider>
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />

                            <Route path="/" element={<Navigate to="/turno" replace />} />

                            <Route path="/turno" element={<TurnoPage />} />
                            <Route path="/corridas" element={<CorridasPage />} />
                            <Route path="/caixa" element={<CaixaPage />} />
                            <Route path="/desempenho" element={<DesempenhoPage />} />
                            <Route path="/veiculos" element={<VeiculosPage />} />
                            <Route path="/admin" element={<AdminDashboard />} />
                            <Route path="/admin-legacy" element={<AdminLegacy />} />

                            {/* Fallback */}
                            <Route path="*" element={<Navigate to="/turno" replace />} />
                        </Routes>
                    </AuthProvider>
                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>
    );
}

export default App;
