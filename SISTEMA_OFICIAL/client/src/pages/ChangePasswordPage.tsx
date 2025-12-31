import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, Shield, ChevronRight, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import logoRotaVerde from "@/assets/logo-rota-verde.png";
import { api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

export default function ChangePasswordPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setUser } = useAuth();

    // Get email from navigation state
    const email = location.state?.email || "";

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate
        if (newPassword.length < 8) {
            setError("Nova senha deve ter pelo menos 8 caracteres");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("As senhas não conferem");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/auth/change-password-required", {
                email,
                current_password: currentPassword,
                new_password: newPassword
            });

            if (response.data.success) {
                // Save token and user
                localStorage.setItem("token", response.data.data.token);
                localStorage.setItem("user", JSON.stringify(response.data.data.user));
                setUser(response.data.data.user);
                navigate("/turno");
            } else {
                setError(response.data.error || "Erro ao trocar senha");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Erro ao conectar com servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
            {/* Background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-background/90" />

            {/* Gradient Orbs */}
            <div className="absolute top-1/4 -left-32 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-8"
                >
                    <div className="relative inline-block mb-4">
                        <img
                            src={logoRotaVerde}
                            alt="Rota Verde Logo"
                            className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                        />
                    </div>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="futuristic-card p-8 relative border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl"
                >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50" />

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30 flex items-center justify-center">
                            <KeyRound className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white font-display uppercase tracking-wide">Troca de Senha</h2>
                            <p className="text-xs text-muted-foreground">Crie uma nova senha segura</p>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6 flex items-start gap-2">
                        <Shield size={16} className="mt-0.5 text-blue-400" />
                        <div className="text-sm text-blue-300">
                            Sua senha temporária expirou ou foi resetada. Crie uma nova senha com pelo menos 8 caracteres.
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2 text-destructive text-sm"
                            >
                                <AlertCircle size={16} className="mt-0.5" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {/* Current Password */}
                        <div className="space-y-2">
                            <Label htmlFor="current" className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                Senha Atual (temporária)
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="current"
                                    type={showCurrentPassword ? "text" : "password"}
                                    placeholder="RV-XXXX"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="bg-background/50 border-white/10 focus:border-blue-500/50 h-12 pl-4 pr-12 text-white placeholder:text-muted-foreground/50"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-400 p-1"
                                >
                                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-2">
                            <Label htmlFor="new" className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                Nova Senha
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="new"
                                    type={showNewPassword ? "text" : "password"}
                                    placeholder="Mínimo 8 caracteres"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="bg-background/50 border-white/10 focus:border-blue-500/50 h-12 pl-4 pr-12 text-white placeholder:text-muted-foreground/50"
                                    required
                                    minLength={8}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-blue-400 p-1"
                                >
                                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirm" className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                Confirmar Nova Senha
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="confirm"
                                    type="password"
                                    placeholder="Repita a nova senha"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="bg-background/50 border-white/10 focus:border-blue-500/50 h-12 pl-4 pr-12 text-white placeholder:text-muted-foreground/50"
                                    required
                                />
                                {confirmPassword && newPassword === confirmPassword && (
                                    <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
                                )}
                            </div>
                        </div>

                        {/* Submit */}
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-bold tracking-wider uppercase group relative overflow-hidden"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <>
                                        <KeyRound className="w-5 h-5 mr-2" />
                                        Salvar Nova Senha
                                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
