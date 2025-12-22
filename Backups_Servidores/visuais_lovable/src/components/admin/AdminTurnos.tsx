import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronDown, ChevronUp, Edit2, Trash2, Eye, Car, DollarSign, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Turno {
  id: string;
  motorista: string;
  veiculo: { plate: string; model: string };
  inicio: string;
  fim: string;
  status: "fechado" | "suspeito" | "aberto";
  corridas: { app: number; appValue: number; particular: number; particularValue: number };
  kmInicial: number;
  kmFinal: number;
  receita: number;
  custos: number;
}

const mockTurnos: Turno[] = [
  {
    id: "1",
    motorista: "João Silva",
    veiculo: { plate: "TQQ0A07", model: "Mini Golfinho" },
    inicio: "2024-01-15 08:00",
    fim: "2024-01-15 18:00",
    status: "fechado",
    corridas: { app: 12, appValue: 245.5, particular: 5, particularValue: 180 },
    kmInicial: 4500,
    kmFinal: 4698,
    receita: 425.5,
    custos: 45.0,
  },
  {
    id: "2",
    motorista: "Maria Santos",
    veiculo: { plate: "TQQ0725", model: "Maverique" },
    inicio: "2024-01-15 07:30",
    fim: "2024-01-15 17:30",
    status: "suspeito",
    corridas: { app: 8, appValue: 156.0, particular: 12, particularValue: 420 },
    kmInicial: 6000,
    kmFinal: 6198,
    receita: 576.0,
    custos: 32.0,
  },
  {
    id: "3",
    motorista: "Pedro Oliveira",
    veiculo: { plate: "TQS4C30", model: "Dolphin Mini" },
    inicio: "2024-01-14 09:00",
    fim: "2024-01-14 19:00",
    status: "fechado",
    corridas: { app: 15, appValue: 312.0, particular: 3, particularValue: 95 },
    kmInicial: 3700,
    kmFinal: 3892,
    receita: 407.0,
    custos: 28.0,
  },
];

const periods = ["Dia", "Semana", "Mês", "3 Meses", "6 Meses", "Ano", "Todos"];

const AdminTurnos = () => {
  const [expandedTurno, setExpandedTurno] = useState<string | null>(null);
  const [period, setPeriod] = useState("Semana");

  const toggleExpand = (id: string) => {
    setExpandedTurno(expandedTurno === id ? null : id);
  };

  const getStatusBadge = (status: Turno["status"]) => {
    const configs = {
      fechado: { label: "Fechado", color: "bg-primary/20 text-primary border-primary/40" },
      suspeito: { label: "Suspeito", color: "bg-warning/20 text-warning border-warning/40" },
      aberto: { label: "Aberto", color: "bg-info/20 text-info border-info/40" },
    };
    return configs[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-racing-purple" />
            Gestão de Turnos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Últimos 7 dias</p>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-bold text-foreground">{mockTurnos.length}</span> turno(s)
        </p>
      </div>

      {/* Period Filters */}
      <div className="flex gap-2 flex-wrap">
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${
              period === p
                ? "bg-racing-purple/20 text-racing-purple border border-racing-purple/40"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Filter Card */}
      <div className="futuristic-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-racing-purple/50">
            <option>Todos os Motoristas</option>
            <option>João Silva</option>
            <option>Maria Santos</option>
            <option>Pedro Oliveira</option>
          </select>
          <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-racing-purple/50">
            <option>Todos os Veículos</option>
            <option>TQQ0A07</option>
            <option>TQQ0725</option>
            <option>TQS4C30</option>
          </select>
          <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-racing-purple/50">
            <option>Todos os Status</option>
            <option>Fechado</option>
            <option>Suspeito</option>
            <option>Aberto</option>
          </select>
        </div>
      </div>

      {/* Turnos List */}
      <div className="space-y-3">
        {mockTurnos.map((turno, index) => {
          const isExpanded = expandedTurno === turno.id;
          const statusBadge = getStatusBadge(turno.status);
          const totalCorridas = turno.corridas.app + turno.corridas.particular;
          const totalValue = turno.corridas.appValue + turno.corridas.particularValue;

          return (
            <motion.div
              key={turno.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="futuristic-card overflow-hidden"
            >
              {/* Main Row */}
              <div 
                className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => toggleExpand(turno.id)}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-racing-purple/20 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-racing-purple" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-white">{turno.motorista}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusBadge.color}`}>
                          {statusBadge.label}
                        </span>
                        {turno.status === "suspeito" && (
                          <AlertTriangle className="w-4 h-4 text-warning" />
                        )}
                      </div>
                      <p className="text-sm text-white/60 flex items-center gap-2 mt-1">
                        <Car className="w-3 h-3" />
                        {turno.veiculo.plate} • {turno.veiculo.model}
                      </p>
                      <p className="text-xs text-white/50 mt-1">
                        {new Date(turno.inicio).toLocaleString('pt-BR')} → {new Date(turno.fim).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Quick Stats */}
                    <div className="flex gap-3">
                      <span className="px-2 py-1 rounded-lg bg-info/20 text-info text-xs font-bold">
                        App: {turno.corridas.app} • R$ {turno.corridas.appValue.toFixed(0)}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-warning/20 text-warning text-xs font-bold">
                        Part: {turno.corridas.particular} • R$ {turno.corridas.particularValue.toFixed(0)}
                      </span>
                      <span className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-xs font-bold">
                        Total: {totalCorridas} • R$ {totalValue.toFixed(0)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-white/50" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white/50" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-white/10"
                  >
                    <div className="p-4 bg-white/5">
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                        <div className="text-center p-3 rounded-lg bg-white/5">
                          <p className="text-xs text-white/50 mb-1">KM Inicial</p>
                          <p className="font-display font-bold text-white">{turno.kmInicial.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white/5">
                          <p className="text-xs text-white/50 mb-1">KM Final</p>
                          <p className="font-display font-bold text-white">{turno.kmFinal.toLocaleString()}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white/5">
                          <p className="text-xs text-white/50 mb-1">Total Corridas</p>
                          <p className="font-display font-bold text-white">{totalCorridas}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white/5">
                          <p className="text-xs text-white/50 mb-1">Receita Bruta</p>
                          <p className="font-display font-bold text-primary">R$ {turno.receita.toFixed(2)}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white/5">
                          <p className="text-xs text-white/50 mb-1">Custos</p>
                          <p className="font-display font-bold text-destructive">R$ {turno.custos.toFixed(2)}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white/5">
                          <p className="text-xs text-white/50 mb-1">Líquido</p>
                          <p className="font-display font-bold text-white">R$ {(turno.receita - turno.custos).toFixed(2)}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white/5">
                          <p className="text-xs text-white/50 mb-1">Empresa (60%)</p>
                          <p className="font-display font-bold text-white">R$ {((turno.receita - turno.custos) * 0.6).toFixed(2)}</p>
                        </div>
                        <div className="text-center p-3 rounded-lg bg-white/5">
                          <p className="text-xs text-white/50 mb-1">Motorista (40%)</p>
                          <p className="font-display font-bold text-accent">R$ {((turno.receita - turno.custos) * 0.4).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminTurnos;
