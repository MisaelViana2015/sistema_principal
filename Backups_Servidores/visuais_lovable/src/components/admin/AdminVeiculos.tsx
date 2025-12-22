import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Car, AlertTriangle, CheckCircle, Wrench, Gauge, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Veiculo {
  id: string;
  plate: string;
  model: string;
  kmTotal: number;
  revenue: number;
  costPerKm: number;
  lastMaintenance: string;
  status: "disponivel" | "em_uso" | "manutencao";
}

const mockVeiculos: Veiculo[] = [
  { id: "1", plate: "TQQ0A07", model: "Mini Golfinho Azul", kmTotal: 4856, revenue: 12450.5, costPerKm: 0.45, lastMaintenance: "2024-01-15", status: "disponivel" },
  { id: "2", plate: "TQQ0725", model: "Maverique", kmTotal: 6234, revenue: 18230.8, costPerKm: 0.52, lastMaintenance: "2024-01-10", status: "em_uso" },
  { id: "3", plate: "TQS4C30", model: "Dolphin Mini BR", kmTotal: 3892, revenue: 9876.2, costPerKm: 0.38, lastMaintenance: "2024-01-20", status: "disponivel" },
  { id: "4", plate: "TQU0H17", model: "Dolphin Mini BR", kmTotal: 5456, revenue: 15623.45, costPerKm: 0.48, lastMaintenance: "2023-12-28", status: "manutencao" },
];

const AdminVeiculos = () => {
  const [activeSubTab, setActiveSubTab] = useState<"cadastro" | "gerais">("cadastro");
  const [period, setPeriod] = useState<"semana" | "mes" | "ano" | "total">("mes");

  const pendingMaintenance = mockVeiculos.filter(v => v.status === "manutencao").length;
  const upToDate = mockVeiculos.filter(v => v.status !== "manutencao").length;

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab("cadastro")}
            className={`px-4 py-2 rounded-lg text-sm font-display font-medium transition-all ${
              activeSubTab === "cadastro"
                ? "bg-racing-purple/20 text-racing-purple border border-racing-purple/40"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            Cadastro
          </button>
          <button
            onClick={() => setActiveSubTab("gerais")}
            className={`px-4 py-2 rounded-lg text-sm font-display font-medium transition-all ${
              activeSubTab === "gerais"
                ? "bg-racing-purple/20 text-racing-purple border border-racing-purple/40"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            Gerais
          </button>
        </div>

        {activeSubTab === "cadastro" && (
          <div className="flex items-center gap-2">
            {(["semana", "mes", "ano", "total"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-display font-medium transition-all ${
                  period === p
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
            <Button className="btn-futuristic gap-2 ml-2">
              <Plus className="w-4 h-4" />
              Novo Veículo
            </Button>
          </div>
        )}
      </div>

      {activeSubTab === "gerais" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="futuristic-card p-5"
            >
              <Car className="w-8 h-8 text-accent mb-3" />
              <p className="font-display text-3xl font-bold text-white">{mockVeiculos.length}</p>
              <p className="text-sm text-white/60">Monitorados</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="futuristic-card p-5"
            >
              <AlertTriangle className="w-8 h-8 text-warning mb-3" />
              <p className="font-display text-3xl font-bold text-white">{pendingMaintenance}</p>
              <p className="text-sm text-white/60">Manutenções Pendentes</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="futuristic-card p-5"
            >
              <CheckCircle className="w-8 h-8 text-primary mb-3" />
              <p className="font-display text-3xl font-bold text-white">{upToDate}</p>
              <p className="text-sm text-white/60">Em Dia</p>
            </motion.div>
          </div>

          {/* Pending Maintenance */}
          {pendingMaintenance > 0 && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-warning flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Manutenções Pendentes
              </h3>
              {mockVeiculos
                .filter(v => v.status === "manutencao")
                .map((veiculo) => (
                  <motion.div
                    key={veiculo.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="futuristic-card p-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-warning/20 flex items-center justify-center">
                          <Car className="w-6 h-6 text-warning" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-lg text-white">{veiculo.plate}</h4>
                          <p className="text-sm text-white/60">{veiculo.model}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-bold border border-warning/40">
                        Pendente
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-white/5">
                      <div>
                        <p className="text-xs text-white/60 mb-1">Rodízio de Pneus</p>
                        <p className="text-sm text-white">KM Atual: <span className="font-bold">{veiculo.kmTotal}</span></p>
                        <p className="text-sm text-white">Intervalo: <span className="font-bold">5.000 km</span></p>
                        <span className="inline-block mt-2 px-2 py-0.5 rounded bg-destructive/20 text-destructive text-xs font-bold">
                          Vencido
                        </span>
                      </div>
                      <div className="flex items-end justify-end">
                        <Button variant="outline" size="sm" className="gap-2 border-warning/50 text-warning hover:bg-warning/20">
                          <Wrench className="w-4 h-4" />
                          Registrar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </>
      )}

      {activeSubTab === "cadastro" && (
        <div className="space-y-3">
          {mockVeiculos.map((veiculo, index) => (
            <motion.div
              key={veiculo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="futuristic-card p-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-white">{veiculo.plate}</h3>
                    <p className="text-sm text-white/60">{veiculo.model}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <Gauge className="w-4 h-4 mx-auto mb-1 text-accent" />
                    <p className="font-bold text-white">{veiculo.kmTotal.toLocaleString()}</p>
                    <p className="text-xs text-white/50">KM</p>
                  </div>
                  <div className="text-center">
                    <DollarSign className="w-4 h-4 mx-auto mb-1 text-primary" />
                    <p className="font-bold text-white">R$ {veiculo.revenue.toLocaleString()}</p>
                    <p className="text-xs text-white/50">Receita</p>
                  </div>
                  <div className="text-center">
                    <Calendar className="w-4 h-4 mx-auto mb-1 text-racing-orange" />
                    <p className="font-bold text-racing-orange">{new Date(veiculo.lastMaintenance).toLocaleDateString('pt-BR')}</p>
                    <p className="text-xs text-white/50">Últ. Manutenção</p>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary hover:bg-primary/20">
                  <Edit2 className="w-4 h-4" />
                  Editar
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVeiculos;
