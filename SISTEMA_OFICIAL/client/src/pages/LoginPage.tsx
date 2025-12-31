import { useState, FormEvent } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, Shield, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import logoRotaVerde from "@/assets/logo-rota-verde.png";
import { authService } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";
import { SYSTEM_VERSION } from "rota-verde-shared/version";

const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
            <div
                key={i}
                className="particle absolute w-1 h-1 bg-primary/20 rounded-full"
                style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                }}
            />
        ))}
        <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0); opacity: 0.2; }
        50% { transform: translateY(-20px); opacity: 0.8; }
      }
    `}</style>
    </div>
);

const DataStreams = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        {[...Array(5)].map((_, i) => (
            <div
                key={i}
                className="data-stream absolute top-0 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/50 to-transparent"
                style={{
                    left: `${10 + i * 20}%`,
                    animation: `stream 3s linear infinite`,
                    animationDelay: `${i * 0.5}s`,
                }}
            />
        ))}
        <style>{`
      @keyframes stream {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }
    `}</style>
    </div>
);

export default function LoginPage() {
    const navigate = useNavigate();
    const { setUser } = useAuth();

    // Form and UI state
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await authService.login(email, password);

            if (result.success && result.user) {
                setUser(result.user as any);
                navigate("/turno");
            } else if (result.requirePasswordReset && result.user) {
                // Redirect to password change page with email
                navigate("/change-password", { state: { email } });
            } else {
                setError(result.error || "Erro ao fazer login");
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Erro ao conectar com servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute inset-0 bg-background/90" /> {/* Dim grid */}

            <FloatingParticles />
            <DataStreams />

            {/* Gradient Orbs */}
            <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo Section */}
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
                            className="w-32 h-32 object-contain drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                        />
                        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full animate-pulse" />
                    </div>

                    <p className="text-muted-foreground text-sm tracking-widest uppercase font-medium">
                        Sistema de Gestão de Frota
                    </p>
                </motion.div>

                {/* Login Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="futuristic-card p-8 relative border border-white/10 shadow-2xl bg-black/40 backdrop-blur-xl"
                >
                    {/* Decorative Scan Line */}
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />

                    {/* Card Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white font-display uppercase tracking-wide">Acesso Seguro</h2>
                            <p className="text-xs text-muted-foreground">Autenticação criptografada</p>
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

                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                E-mail
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-background/50 border-white/10 focus:border-primary/50 h-12 pl-4 pr-4 text-white placeholder:text-muted-foreground/50 transition-all duration-300 group-hover:border-white/20"
                                    required
                                />
                                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs text-muted-foreground uppercase tracking-wider font-bold">
                                Senha
                            </Label>
                            <div className="relative group">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-background/50 border-white/10 focus:border-primary/50 h-12 pl-4 pr-12 text-white placeholder:text-muted-foreground/50 transition-all duration-300 group-hover:border-white/20"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors hover:bg-white/5 p-1 rounded-full"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                                <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>

                        {/* Remember & Forgot */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="w-4 h-4 rounded border border-white/20 bg-background/50 group-hover:border-primary/50 transition-colors flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-sm bg-primary opacity-0 group-hover:opacity-50 transition-opacity" />
                                </div>
                                <span className="text-muted-foreground group-hover:text-white transition-colors text-xs uppercase tracking-wide">Lembrar acesso</span>
                            </label>
                            <a href="#" className="text-primary hover:text-primary/80 transition-colors text-xs uppercase tracking-wide font-medium">
                                Esqueceu a senha?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 btn-futuristic text-base font-bold tracking-wider uppercase group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5 mr-2 group-hover:text-yellow-300 transition-colors" />
                                        Acessar Sistema
                                        <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase font-bold">
                            <span className="bg-[#0f1115] px-3 text-muted-foreground tracking-widest">ou continue com</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3">
                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                            whileTap={{ scale: 0.98 }}
                            className="h-10 rounded-lg border border-white/10 bg-background/30 transition-all duration-300 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-white"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Google
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
                            whileTap={{ scale: 0.98 }}
                            className="h-10 rounded-lg border border-white/10 bg-background/30 transition-all duration-300 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-white"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                            GitHub
                        </motion.button>
                    </div>
                </motion.div>

                {/* Status Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground font-mono"
                >
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                        <span>Sistema Online</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-primary" />
                        <span>SSL Ativo</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Zap className="w-3 h-3 text-orange-400" />
                        <span>{SYSTEM_VERSION}</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
