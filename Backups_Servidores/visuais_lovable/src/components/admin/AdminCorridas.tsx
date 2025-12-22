import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, Edit2, Trash2, Smartphone, Handshake, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Corrida {
  id: string;
  tipo: "app" | "particular";
  valor: number;
  dataHora: string;
  motorista: string;
}

const mockCorridas: Corrida[] = [
  { id: "1", tipo: "app", valor: 25.5, dataHora: "2024-01-15 14:30", motorista: "João Silva" },
  { id: "2", tipo: "particular", valor: 45.0, dataHora: "2024-01-15 13:45", motorista: "Maria Santos" },
  { id: "3", tipo: "app", valor: 18.0, dataHora: "2024-01-15 12:20", motorista: "Pedro Oliveira" },
  { id: "4", tipo: "app", valor: 32.0, dataHora: "2024-01-15 11:00", motorista: "João Silva" },
  { id: "5", tipo: "particular", valor: 60.0, dataHora: "2024-01-15 10:15", motorista: "Maria Santos" },
  { id: "6", tipo: "app", valor: 22.0, dataHora: "2024-01-15 09:30", motorista: "Ana Costa" },
];

const periods = ["Hoje", "Semana", "Mês", "Ano", "Todas"];

const AdminCorridas = () => {
  const [period, setPeriod] = useState("Semana");

  const totalValue = mockCorridas.reduce((acc, c) => acc + c.valor, 0);
  const totalApp = mockCorridas.filter(c => c.tipo === "app").reduce((acc, c) => acc + c.valor, 0);
  const totalParticular = mockCorridas.filter(c => c.tipo === "particular").reduce((acc, c) => acc + c.valor, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-racing-purple" />
            Gestão de Corridas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Total: <span className="text-primary font-bold">R$ {totalValue.toFixed(2)}</span> ({mockCorridas.length} corridas)
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="futuristic-card p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3">
            <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-racing-purple/50">
              <option>Todos os Motoristas</option>
              <option>João Silva</option>
              <option>Maria Santos</option>
              <option>Pedro Oliveira</option>
            </select>
            <select className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-racing-purple/50">
              <option>Todos os Tipos</option>
              <option>App</option>
              <option>Particular</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 text-sm text-white/70 hover:text-white transition-colors">
            <ChevronDown className="w-4 h-4" />
            Mais Recentes
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${
                period === p
                  ? "bg-racing-purple/30 text-racing-purple border border-racing-purple/40"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="futuristic-card p-4"
        >
          <Smartphone className="w-6 h-6 text-info mb-2" />
          <p className="font-display text-2xl font-bold text-info">R$ {totalApp.toFixed(2)}</p>
          <p className="text-sm text-white/60">Total App</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="futuristic-card p-4"
        >
          <Handshake className="w-6 h-6 text-warning mb-2" />
          <p className="font-display text-2xl font-bold text-warning">R$ {totalParticular.toFixed(2)}</p>
          <p className="text-sm text-white/60">Total Particular</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="futuristic-card p-4"
        >
          <DollarSign className="w-6 h-6 text-primary mb-2" />
          <p className="font-display text-2xl font-bold text-primary">R$ {totalValue.toFixed(2)}</p>
          <p className="text-sm text-white/60">Total Geral</p>
        </motion.div>
      </div>

      {/* Corridas List */}
      <div className="space-y-3">
        {mockCorridas.map((corrida, index) => (
          <motion.div
            key={corrida.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="futuristic-card p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  corrida.tipo === "app" 
                    ? "bg-info/20 text-info" 
                    : "bg-warning/20 text-warning"
                }`}>
                  {corrida.tipo === "app" ? (
                    <Smartphone className="w-5 h-5" />
                  ) : (
                    <Handshake className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                      corrida.tipo === "app" 
                        ? "bg-info/20 text-info" 
                        : "bg-warning/20 text-warning"
                    }`}>
                      {corrida.tipo === "app" ? "App" : "Particular"}
                    </span>
                    <span className="text-sm text-white/70">{corrida.motorista}</span>
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    {new Date(corrida.dataHora).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <p className="font-display text-xl font-bold text-white">
                  R$ {corrida.valor.toFixed(2)}
                </p>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/20">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminCorridas;
