import { useNavigate } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Shield, ArrowRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { Button } from "../components/ui/button";

/**
 * ADMIN LEGACY (REPLIT BASE)
 * Página de referência com design PREMIUM melhorado.
 */

export default function AdminLegacy() {
    const navigate = useNavigate();

    const migrationSteps = [
        {
            title: "Estrutura Base (Dashboard)",
            status: "completed",
            desc: "Layout, navegação e tabs implementados."
        },
        {
            title: "Gestão de Motoristas",
            status: "completed",
            desc: "CRUD completo, design fidelizado e responsivo."
        },
        {
            title: "Gestão de Veículos",
            status: "pending",
            desc: "Cadastro, métricas e histórico de manutenção."
        },
        {
            title: "Turnos e Corridas",
            status: "waiting",
            desc: "Controle de jornada e lançamentos financeiros."
        },
        {
            title: "Financeiro Completo",
            status: "completed",
            desc: "Custos, análises e relatórios."
        }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            <TopBar />

            <main className="flex-1 overflow-auto p-6 md:p-12 flex flex-col items-center justify-center">

                {/* Main Card com efeito Glass e Borda Gradient */}
                <div className="relative group w-full max-w-4xl">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

                    <Card className="relative w-full p-8 md:p-10 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl rounded-xl">

                        {/* Header */}
                        <div className="text-center mb-10">
                            <div className="inline-flex p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 mb-6 shadow-sm">
                                <Shield className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 mb-4">
                                Centro de Migração
                            </h1>
                            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                                Bem-vindo à área de transição. Aqui você acompanha o progresso da importação das funcionalidades do sistema legado (Replit) para a nova arquitetura moderna.
                            </p>
                        </div>

                        {/* Progress Grid */}
                        <div className="grid md:grid-cols-2 gap-8 items-start">

                            {/* Lado Esquerdo: Status */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-indigo-500" />
                                    Roteiro de Implementação
                                </h3>

                                <div className="space-y-4">
                                    {migrationSteps.map((step, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${step.status === 'completed'
                                                ? 'bg-green-50/50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30'
                                                : step.status === 'pending'
                                                    ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 ring-1 ring-blue-500/20'
                                                    : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800'
                                                }`}
                                        >
                                            <div className="mt-1">
                                                {step.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                                                {step.status === 'pending' && <Clock className="w-5 h-5 text-blue-500 animate-pulse" />}
                                                {step.status === 'waiting' && <span className="w-5 h-5 block rounded-full border-2 border-slate-300 dark:border-slate-600" />}
                                            </div>
                                            <div>
                                                <h4 className={`font-medium ${step.status === 'completed' ? 'text-green-700 dark:text-green-300' :
                                                    step.status === 'pending' ? 'text-blue-700 dark:text-blue-300' :
                                                        'text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                    {step.title}
                                                </h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                                                    {step.desc}
                                                </p>
                                            </div>
                                            {step.status === 'pending' && (
                                                <div className="ml-auto px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-bold rounded uppercase tracking-wider">
                                                    Em Progresso
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lado Direito: Ação e Stats */}
                            <div className="flex flex-col gap-6 h-full">
                                <div className="bg-slate-900 text-white p-6 rounded-xl flex-1 flex flex-col justify-between relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>

                                    <div>
                                        <h3 className="text-lg font-medium text-indigo-300 mb-2">Por que refatorar?</h3>
                                        <p className="text-slate-300 text-sm leading-relaxed mb-6">
                                            O código original possui alta complexidade e acoplamento.
                                            A migração modular garante:
                                        </p>
                                        <ul className="space-y-2 text-sm text-slate-200">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-400" /> Manutenibilidade
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-400" /> Performance Superior
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-400" /> Interface Responsiva
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-700">
                                        <div className="flex items-center justify-between text-sm mb-2">
                                            <span className="text-slate-400">Progresso Geral</span>
                                            <span className="text-indigo-400 font-bold">40%</span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[40%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-14 text-lg shadow-lg hover:shadow-indigo-500/20 transition-all group"
                                    onClick={() => navigate('/admin')}
                                >
                                    Ir para Admin Moderno
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Button>

                                <div className="text-center">
                                    <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        Precisa consultar o código antigo?
                                        <span className="text-indigo-500 cursor-not-allowed opacity-50">Visualizar Raw (Indisponível)</span>
                                    </p>
                                </div>
                            </div>

                        </div>

                    </Card>
                </div>
            </main>
        </div>
    );
}
