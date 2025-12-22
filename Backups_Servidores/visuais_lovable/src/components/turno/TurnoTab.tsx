import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, TrendingDown, TrendingUp, Building2, 
  User, Clock, XCircle, QrCode, UserCheck,
  Coins, Milestone, Wallet, PlugZap, Smartphone,
  StopCircle, ArrowLeft, Route, CircleDollarSign, Timer, Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TurnoTabProps {
  turnoAtivo: boolean;
  kmInicial: string;
  vehiclePlate: string;
  vehicleModel: string;
  startTime: string;
  onEncerrarTurno?: () => void;
}

interface Corrida {
  id: string;
  tipo: "app" | "particular";
  valor: number;
  hora: string;
}

interface Custo {
  id: string;
  tipo: "outros" | "pedagio" | "recarga_app" | "recarga_carro";
  valor: number;
  observacao?: string;
  hora: string;
}

const custoTypes = [
  { id: "outros", label: "Outros", icon: Coins, color: "bg-amber-500", textColor: "text-amber-500" },
  { id: "pedagio", label: "Pedágio", icon: Milestone, color: "bg-teal-500", textColor: "text-teal-500" },
  { id: "recarga_app", label: "Recarga APP", icon: Wallet, color: "bg-sky-500", textColor: "text-sky-500" },
  { id: "recarga_carro", label: "Recarga Carro", icon: PlugZap, color: "bg-lime-500", textColor: "text-lime-500" },
];

const TurnoTab = ({ turnoAtivo, kmInicial, vehiclePlate, vehicleModel, startTime, onEncerrarTurno }: TurnoTabProps) => {
  const [corridas, setCorridas] = useState<Corrida[]>([]);
  const [custos, setCustos] = useState<Custo[]>([]);
  
  // Dialog states
  const [showCorridaDialog, setShowCorridaDialog] = useState(false);
  const [showCustoDialog, setShowCustoDialog] = useState(false);
  const [showEncerrarDialog, setShowEncerrarDialog] = useState(false);
  
  // Form states
  const [corridaTipo, setCorridaTipo] = useState<"app" | "particular">("app");
  const [corridaValor, setCorridaValor] = useState("");
  const [custoTipo, setCustoTipo] = useState<"outros" | "pedagio" | "recarga_app" | "recarga_carro">("outros");
  const [custoValor, setCustoValor] = useState("");
  const [custoObservacao, setCustoObservacao] = useState("");
  
  // Encerrar turno states
  const [kmFinal, setKmFinal] = useState("");
  const [senha, setSenha] = useState("");

  // Calculations
  const totalCorridasApp = corridas.filter(c => c.tipo === "app").reduce((acc, c) => acc + c.valor, 0);
  const totalCorridasParticular = corridas.filter(c => c.tipo === "particular").reduce((acc, c) => acc + c.valor, 0);
  const totalBruto = totalCorridasApp + totalCorridasParticular;
  const totalCustos = custos.reduce((acc, c) => acc + c.valor, 0);
  const totalLiquido = totalBruto - totalCustos;
  const empresaPart = totalLiquido * 0.6;
  const motoristaPart = totalLiquido * 0.4;
  const corridasAppCount = corridas.filter(c => c.tipo === "app").length;
  const corridasParticularCount = corridas.filter(c => c.tipo === "particular").length;
  const totalCorridasCount = corridasAppCount + corridasParticularCount;
  const ticketMedio = totalCorridasCount > 0 ? totalBruto / totalCorridasCount : 0;
  
  // Encerrar turno calculations
  const kmRodados = kmFinal ? (parseFloat(kmFinal) - parseFloat(kmInicial || "0")) : 0;
  const valorPorKm = kmRodados > 0 ? totalLiquido / kmRodados : 0;
  
  // Calculate duration
  const calcularDuracao = () => {
    if (!startTime) return "0 min";
    const [hours, minutes] = startTime.split(":").map(Number);
    const inicio = new Date();
    inicio.setHours(hours, minutes, 0, 0);
    const agora = new Date();
    const diffMs = agora.getTime() - inicio.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min`;
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    return `${h}h ${m}min`;
  };

  const handleSalvarCorrida = () => {
    if (!corridaValor) return;
    const newCorrida: Corrida = {
      id: Date.now().toString(),
      tipo: corridaTipo,
      valor: parseFloat(corridaValor),
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setCorridas([...corridas, newCorrida]);
    setCorridaValor("");
    setShowCorridaDialog(false);
  };

  const handleSalvarCusto = () => {
    if (!custoValor) return;
    const newCusto: Custo = {
      id: Date.now().toString(),
      tipo: custoTipo,
      valor: parseFloat(custoValor),
      observacao: custoObservacao || undefined,
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };
    setCustos([...custos, newCusto]);
    setCustoValor("");
    setCustoObservacao("");
    setShowCustoDialog(false);
  };

  const handleConfirmarEncerramento = () => {
    if (!kmFinal || !senha) return;
    // Here you would validate the password and save the data
    setShowEncerrarDialog(false);
    setKmFinal("");
    setSenha("");
    onEncerrarTurno?.();
  };

  if (!turnoAtivo) {
    return (
      <div className="futuristic-card p-12 text-center">
        <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-display font-bold text-xl mb-2">Nenhum Turno Ativo</h3>
        <p className="text-muted-foreground">Clique em "Iniciar Turno" para começar a registrar corridas e custos.</p>
      </div>
    );
  }

  const getCustoIcon = (tipo: Custo["tipo"]) => {
    const config = custoTypes.find(c => c.id === tipo);
    return config || custoTypes[0];
  };

  return (
    <div className="space-y-6">
      {/* Header do Turno */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="futuristic-card p-6"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Motorista</h2>
            <p className="text-primary text-sm">{vehiclePlate} — {vehicleModel}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-sm">Início</p>
            <p className="font-display font-bold text-lg">{startTime}</p>
            <p className="text-primary text-sm">{parseFloat(kmInicial).toLocaleString("pt-BR")} km</p>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 text-muted-foreground border-t border-border/50 pt-4">
          <Clock className="w-4 h-4" />
          <span>Tempo Trabalhado: 0h 0min</span>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={() => setShowCorridaDialog(true)}
          className="h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Adicionar Corrida
        </Button>
        <Button
          onClick={() => setShowCustoDialog(true)}
          variant="destructive"
          className="h-14 font-display font-bold text-lg"
        >
          <Coins className="w-5 h-5 mr-2" />
          Adicionar Custo
        </Button>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Coins className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">BRUTO</span>
          </div>
          <p className="font-display text-xl font-black text-foreground">R$ {totalBruto.toFixed(2).replace(".", ",")}</p>
          <p className="text-xs text-muted-foreground">App + Particular</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-xl bg-rose-100 dark:bg-rose-900/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-rose-700 dark:text-rose-300">DESCONTOS</span>
          </div>
          <p className="font-display text-xl font-black text-foreground">R$ {totalCustos.toFixed(2).replace(".", ",")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">LÍQUIDO</span>
          </div>
          <p className="font-display text-xl font-black text-foreground">R$ {totalLiquido.toFixed(2).replace(".", ",")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-background border border-border/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Building2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">EMPRESA (60%)</span>
          </div>
          <p className="font-display text-xl font-black text-foreground">R$ {empresaPart.toFixed(2).replace(".", ",")}</p>
        </motion.div>
      </div>

      {/* KPI Cards - Row 2 */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-background border border-border/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <User className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">MOTORISTA (40%)</span>
          </div>
          <p className="font-display text-xl font-black text-foreground">R$ {motoristaPart.toFixed(2).replace(".", ",")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl bg-background border border-border/50"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">CORRIDAS APP</span>
          </div>
          <p className="font-display text-xl font-black text-foreground">{corridasAppCount}</p>
          <p className="text-xs text-muted-foreground">R$ {totalCorridasApp.toFixed(2).replace(".", ",")}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="p-4 rounded-xl bg-orange-50 dark:bg-orange-900/20"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-orange-500" />
            </div>
            <span className="text-xs font-medium text-orange-700 dark:text-orange-300">CORRIDAS PARTICULAR</span>
          </div>
          <p className="font-display text-xl font-black text-foreground">{corridasParticularCount}</p>
          <p className="text-xs text-muted-foreground">R$ {totalCorridasParticular.toFixed(2).replace(".", ",")}</p>
        </motion.div>
      </div>

      {/* Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Corridas List */}
        <div className="futuristic-card p-5">
          <h3 className="font-display font-bold text-lg mb-4">Corridas</h3>
          {corridas.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhuma corrida registrada</p>
          ) : (
            <div className="space-y-3">
              {["app", "particular"].map(tipo => {
                const corridasTipo = corridas.filter(c => c.tipo === tipo);
                if (corridasTipo.length === 0) return null;
                return (
                  <div key={tipo}>
                    <div className="flex items-center gap-2 mb-2">
                      {tipo === "app" ? (
                        <QrCode className="w-4 h-4 text-amber-500" />
                      ) : (
                        <UserCheck className="w-4 h-4 text-emerald-500" />
                      )}
                      <span className="font-medium text-sm">{tipo === "app" ? "APP:" : "Particular:"}</span>
                    </div>
                    {corridasTipo.map((corrida, idx) => (
                      <div key={corrida.id} className="flex justify-between items-center text-sm py-1">
                        <span className="text-muted-foreground">{idx + 1}  {corrida.hora}</span>
                        <span>R$ {corrida.valor.toFixed(2).replace(".", ",")}</span>
                      </div>
                    ))}
                    <div className="border-t border-border/50 mt-2 pt-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Total de Corridas = {corridasTipo.length}</span>
                      <span>Total = R$ {corridasTipo.reduce((a, c) => a + c.valor, 0).toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                );
              })}
              <div className="border-t border-border pt-3 flex justify-between font-medium">
                <span>APP + Particular = {corridas.length} corridas</span>
                <span>R$ {totalBruto.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Custos List */}
        <div className="futuristic-card p-5">
          <h3 className="font-display font-bold text-lg mb-4">Custos</h3>
          {custos.length === 0 ? (
            <p className="text-muted-foreground text-sm">Nenhum custo registrado</p>
          ) : (
            <div className="space-y-3">
              {custos.map((custo) => {
                const config = getCustoIcon(custo.tipo);
                const IconComponent = config.icon;
                return (
                  <div key={custo.id} className="flex justify-between items-center p-3 rounded-lg bg-background/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${config.color} flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{config.label}</p>
                        <p className="text-xs text-muted-foreground">{custo.observacao || custo.hora}</p>
                      </div>
                    </div>
                    <span className="font-display font-bold text-destructive">R$ {custo.valor.toFixed(2).replace(".", ",")}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Encerrar Turno Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Button
          onClick={() => setShowEncerrarDialog(true)}
          variant="outline"
          className="w-full h-14 font-display font-bold text-lg border-2 border-muted-foreground/30 hover:bg-muted"
        >
          <StopCircle className="w-5 h-5 mr-2" />
          Encerrar Turno
        </Button>
      </motion.div>

      {/* Dialog Adicionar Corrida */}
      <Dialog open={showCorridaDialog} onOpenChange={setShowCorridaDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Adicionar Corrida</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div>
              <label className="text-sm font-medium text-primary">Tipo de Corrida *</label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => setCorridaTipo("app")}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    corridaTipo === "app"
                      ? "border-amber-400 bg-amber-50 dark:bg-amber-900/20"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <QrCode className={`w-8 h-8 mx-auto mb-2 ${corridaTipo === "app" ? "text-amber-500" : "text-muted-foreground"}`} />
                  <span className={`font-medium ${corridaTipo === "app" ? "text-amber-600" : "text-muted-foreground"}`}>App</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCorridaTipo("particular")}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    corridaTipo === "particular"
                      ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <UserCheck className={`w-8 h-8 mx-auto mb-2 ${corridaTipo === "particular" ? "text-emerald-500" : "text-muted-foreground"}`} />
                  <span className={`font-medium ${corridaTipo === "particular" ? "text-emerald-600" : "text-muted-foreground"}`}>Particular</span>
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-primary">Valor (R$) *</label>
              <Input
                type="number"
                placeholder="25"
                value={corridaValor}
                onChange={(e) => setCorridaValor(e.target.value)}
                className="mt-2 h-14 text-lg"
              />
            </div>
            <Button 
              onClick={handleSalvarCorrida}
              disabled={!corridaValor}
              className="w-full h-14 bg-slate-800 hover:bg-slate-700 text-white font-display font-bold"
            >
              Salvar Corrida
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar Custo */}
      <Dialog open={showCustoDialog} onOpenChange={setShowCustoDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Adicionar Custo</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div>
              <label className="text-sm font-medium text-primary">Tipo de Custo *</label>
              <div className="space-y-3 mt-2">
                {custoTypes.map((tipo) => {
                  const IconComponent = tipo.icon;
                  const isSelected = custoTipo === tipo.id;
                  return (
                    <button
                      key={tipo.id}
                      type="button"
                      onClick={() => setCustoTipo(tipo.id as any)}
                      className={`w-full p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                        isSelected
                          ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${tipo.color} flex items-center justify-center`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <span className={`font-medium ${isSelected ? tipo.textColor : "text-muted-foreground"}`}>{tipo.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-primary">Valor (R$) *</label>
              <Input
                type="number"
                placeholder="Digite o valor"
                value={custoValor}
                onChange={(e) => setCustoValor(e.target.value)}
                className="mt-2 h-14 text-lg"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Observação (opcional)</label>
              <Textarea
                placeholder="35"
                value={custoObservacao}
                onChange={(e) => setCustoObservacao(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button 
              onClick={handleSalvarCusto}
              disabled={!custoValor}
              className="w-full h-14 bg-slate-800 hover:bg-slate-700 text-white font-display font-bold"
            >
              Salvar Custo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Encerrar Turno */}
      <Dialog open={showEncerrarDialog} onOpenChange={setShowEncerrarDialog}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <button
              onClick={() => setShowEncerrarDialog(false)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </button>
            <DialogTitle className="font-display text-2xl">Encerramento de Turno</DialogTitle>
            <p className="text-sm text-muted-foreground">Motorista: <span className="text-foreground">Motorista</span></p>
            <p className="text-sm text-primary">{vehiclePlate} — {vehicleModel}</p>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            {/* Corridas Resumo */}
            <div className="futuristic-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold">Aplicativo</span>
              </div>
              {corridas.filter(c => c.tipo === "app").length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma corrida de aplicativo</p>
              ) : (
                <div className="space-y-2">
                  {corridas.filter(c => c.tipo === "app").map((c, i) => (
                    <div key={c.id} className="flex justify-between text-sm">
                      <span className="text-primary">{i + 1} - {c.hora}</span>
                      <span>R$ {c.valor.toFixed(2).replace(".", ",")}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total APP</span>
                      <span>R$ {totalCorridasApp.toFixed(2).replace(".", ",")}</span>
                    </div>
                    <div className="flex justify-between text-sm text-primary">
                      <span>Total Corridas APP</span>
                      <span>{corridasAppCount}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="futuristic-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold">Particular</span>
              </div>
              {corridas.filter(c => c.tipo === "particular").length === 0 ? (
                <p className="text-muted-foreground text-sm">Nenhuma corrida particular</p>
              ) : (
                <div className="space-y-2">
                  {corridas.filter(c => c.tipo === "particular").map((c, i) => (
                    <div key={c.id} className="flex justify-between text-sm">
                      <span className="text-primary">{i + 1} - {c.hora}</span>
                      <span>R$ {c.valor.toFixed(2).replace(".", ",")}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 mt-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Total Particular</span>
                      <span>R$ {totalCorridasParticular.toFixed(2).replace(".", ",")}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resumo Financeiro */}
            <div className="futuristic-card p-4 space-y-3">
              <h4 className="font-display font-bold">Resumo Financeiro</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                      <Coins className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">Receita Total</span>
                  </div>
                  <span className="font-display font-bold">R$ {totalBruto.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">Custos</span>
                  </div>
                  <span className="font-display font-bold text-red-500">R$ {totalCustos.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">Lucro Líquido</span>
                  </div>
                  <span className={`font-display font-bold ${totalLiquido >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                    R$ {totalLiquido.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-500 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">Empresa (60%)</span>
                  </div>
                  <span className={`font-display font-bold ${empresaPart >= 0 ? "" : "text-red-500"}`}>
                    R$ {empresaPart.toFixed(2).replace(".", ",")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm">Motorista (40%)</span>
                  </div>
                  <span className={`font-display font-bold ${motoristaPart >= 0 ? "" : "text-red-500"}`}>
                    R$ {motoristaPart.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            </div>

            {/* Dados Operacionais */}
            <div className="futuristic-card p-4 space-y-4">
              <h4 className="font-display font-bold">Dados Operacionais</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">KM Inicial</label>
                  <p className="font-display text-2xl font-bold">{parseFloat(kmInicial || "0").toFixed(1)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">KM Final *</label>
                  <Input
                    type="number"
                    placeholder="Digite o KM final"
                    value={kmFinal}
                    onChange={(e) => setKmFinal(e.target.value)}
                    className="mt-1 h-12"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Senha *</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="mt-1 h-12"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Por segurança, confirme sua senha antes de encerrar o turno
                </p>
              </div>

              {kmFinal && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2 pt-2 border-t border-border"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Route className="w-4 h-4 text-primary" />
                      <span className="text-sm">KM Rodados</span>
                    </div>
                    <span className="font-display font-bold">{kmRodados.toFixed(1)} km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="w-4 h-4 text-primary" />
                      <span className="text-sm">Valor por KM</span>
                    </div>
                    <span className={`font-display font-bold ${valorPorKm >= 0 ? "" : "text-red-500"}`}>
                      R$ {valorPorKm.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-primary" />
                      <span className="text-sm">Total de Corridas</span>
                    </div>
                    <span className="font-display font-bold">{totalCorridasCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-primary" />
                      <span className="text-sm">Ticket Médio Geral</span>
                    </div>
                    <span className="font-display font-bold">R$ {ticketMedio.toFixed(2).replace(".", ",")}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Início</span>
                    </div>
                    <span>{startTime}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">Duração do Turno</span>
                    </div>
                    <span>{calcularDuracao()}</span>
                  </div>
                </motion.div>
              )}
            </div>

            <Button 
              onClick={handleConfirmarEncerramento}
              disabled={!kmFinal || !senha}
              className="w-full h-14 bg-red-500 hover:bg-red-600 text-white font-display font-bold"
            >
              Confirmar Fechamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TurnoTab;
