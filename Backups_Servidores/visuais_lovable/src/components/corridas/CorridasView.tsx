import { useState } from "react";
import { Smartphone, Handshake, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import KpiCard from "../ui/KpiCard";

interface Corrida {
  id: string;
  type: "app" | "particular";
  value: number;
  time: string;
  vehicle: { plate: string; model: string };
}

interface CorridaGroup {
  date: string;
  motoristas: string[];
  corridas: Corrida[];
  total: number;
}

const mockCorridaGroups: CorridaGroup[] = [
  {
    date: "15/12/2024",
    motoristas: ["Misael", "João"],
    corridas: [
      { id: "1", type: "app", value: 25.5, time: "08:30", vehicle: { plate: "ABC-1234", model: "Dolphin Mini" } },
      { id: "2", type: "particular", value: 45.0, time: "09:15", vehicle: { plate: "ABC-1234", model: "Dolphin Mini" } },
      { id: "3", type: "app", value: 18.0, time: "10:00", vehicle: { plate: "DEF-5678", model: "BYD Dolphin" } },
      { id: "4", type: "app", value: 32.0, time: "11:30", vehicle: { plate: "ABC-1234", model: "Dolphin Mini" } },
    ],
    total: 120.5,
  },
  {
    date: "14/12/2024",
    motoristas: ["Misael"],
    corridas: [
      { id: "5", type: "app", value: 28.0, time: "07:45", vehicle: { plate: "ABC-1234", model: "Dolphin Mini" } },
      { id: "6", type: "particular", value: 55.0, time: "12:00", vehicle: { plate: "ABC-1234", model: "Dolphin Mini" } },
    ],
    total: 83.0,
  },
];

const CorridasView = () => {
  const [period, setPeriod] = useState<"dia" | "semana" | "mes" | "ano" | "total">("semana");

  const totals = {
    app: mockCorridaGroups.reduce((acc, g) => acc + g.corridas.filter(c => c.type === "app").reduce((a, c) => a + c.value, 0), 0),
    particular: mockCorridaGroups.reduce((acc, g) => acc + g.corridas.filter(c => c.type === "particular").reduce((a, c) => a + c.value, 0), 0),
    total: mockCorridaGroups.reduce((acc, g) => acc + g.total, 0),
  };

  const motoristaPart = totals.total * 0.4;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold mb-1">Minhas Corridas</h1>
        <p className="text-sm text-muted-foreground">Histórico de corridas realizadas</p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["dia", "semana", "mes", "ano", "total"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              period === p
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          title="Total Aplicativo"
          value={`R$ ${totals.app.toFixed(2)}`}
          icon={Smartphone}
          variant="info"
          delay={0}
        />
        <KpiCard
          title="Total Particular"
          value={`R$ ${totals.particular.toFixed(2)}`}
          icon={Handshake}
          variant="warning"
          delay={1}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="racing-card p-4"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Geral</p>
            <p className="font-display text-2xl font-bold">R$ {totals.total.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Lucro Motorista (40%)</p>
            <p className="font-display text-xl font-bold text-success">R$ {motoristaPart.toFixed(2)}</p>
          </div>
        </div>
      </motion.div>

      {/* Corrida Groups */}
      <div className="space-y-4">
        {mockCorridaGroups.map((group, groupIndex) => (
          <motion.div
            key={group.date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 + 0.3 }}
            className="racing-card overflow-hidden"
          >
            {/* Group Header */}
            <div className="bg-secondary/50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-display font-semibold">{group.date}</span>
                <span className="text-xs text-muted-foreground">
                  • {group.motoristas.join(", ")}
                </span>
              </div>
              <div className="text-right">
                <span className="font-display font-bold text-success">R$ {group.total.toFixed(2)}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({group.corridas.length} corridas)
                </span>
              </div>
            </div>

            {/* Corridas List */}
            <div className="divide-y divide-border/50">
              {group.corridas.map((corrida) => (
                <div key={corrida.id} className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      corrida.type === "app" ? "bg-info/20" : "bg-warning/20"
                    }`}>
                      {corrida.type === "app" ? (
                        <Smartphone className="w-4 h-4 text-info" />
                      ) : (
                        <Handshake className="w-4 h-4 text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{corrida.time}</p>
                      <p className="text-xs text-muted-foreground">
                        {corrida.vehicle.plate} • {corrida.vehicle.model}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-display font-bold ${
                      corrida.type === "app" ? "text-info" : "text-warning"
                    }`}>
                      R$ {corrida.value.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{corrida.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4">
        <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm text-muted-foreground">Página 1 de 3</span>
        <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default CorridasView;
