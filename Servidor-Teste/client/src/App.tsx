import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { authService } from "./lib/api";

// Pages
import LoginPage from "./pages/LoginPage";
import TurnoPage from "./pages/TurnoPage";
import CorridasPage from "./pages/CorridasPage";
import CaixaPage from "./pages/CaixaPage";
import DesempenhoPage from "./pages/DesempenhoPage";
import VeiculosPage from "./pages/VeiculosPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLegacy from "./pages/replit/AdminLegacy";

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<LoginPage />} />

                        <Route
                            path="/turno"
                            element={<TurnoPage />}
                        />

                        <Route
                            path="/corridas"
                            element={<CorridasPage />}
                        />

                        <Route
                            path="/caixa"
                            element={<CaixaPage />}
                        />

                        <Route
                            path="/desempenho"
                            element={<DesempenhoPage />}
                        />

                        <Route
                            path="/veiculos"
                            element={<VeiculosPage />}
                        />

                        {/* Rota Admin Única */}
                        <Route
                            path="/admin"
                            element={<AdminDashboard />}
                        />

                        {/* Rota Admin Legado (Replit) */}
                        <Route
                            path="/admin-legacy"
                            element={<AdminLegacy />}
                        />

                        {/* Rota raiz redireciona para turno ou login - Simplificado */}
                        <Route
                            path="/"
                            element={<Navigate to="/turno" replace />}
                        />

                        {/* Rota 404 */}
                        <Route
                            path="*"
                            element={
                                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                                    <div className="text-center">
                                        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">Página não encontrada</p>
                                        <a
                                            href="/"
                                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            Voltar ao início
                                        </a>
                                    </div>
                                </div>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
