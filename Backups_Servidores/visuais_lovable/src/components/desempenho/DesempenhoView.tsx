import { useState } from "react";
import { Smartphone, Handshake, Clock, BarChart3, Zap, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import KpiCard from "../ui/KpiCard";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";

const weeklyData = [
  { day: "Dom", app: 5, particular: 12, receita: 380 },
  { day: "Seg", app: 8, particular: 15, receita: 520 },
  { day: "Ter", app: 6, particular: 14, receita: 445 },
  { day: "Qua", app: 7, particular: 18, receita: 580 },
  { day: "Qui", app: 5, particular: 16, receita: 490 },
  { day: "Sex", app: 4, particular: 12, receita: 350 },
  { day: "Sáb", app: 4, particular: 11, receita: 320 },
];

const rankings = [
  { position: 1, name: "Misael", turnos: 6, horas: 48.5, receita: 2450.0, revenuePerHour: 50.51, score: 90.1 },
  { position: 2, name: "João", turnos: 5, horas: 42.0, receita: 1980.0, revenuePerHour: 47.14, score: 85.3 },
  { position: 3, name: "Carlos", turnos: 4, horas: 35.2, receita: 1650.0, revenuePerHour: 46.87, score: 78.5 },
];

const DesempenhoView = () => {
  const [period, setPeriod] = useState<"dia" | "semana" | "mes">("semana");

  const stats = {
    corridasApp: 39,
    corridasParticular: 98,
    horasTrabalhadas: 86.2,
    turnos: 6,
    receitaApp: 892.42,
    receitaParticular: 1370.0,
    receitaTotal: 2262.42,
    valorPorHora: 26.25,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-xl bg-racing-purple/20 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-racing-purple" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Desempenho</h1>
          <p className="text-sm text-muted-foreground">Estatísticas da semana</p>
        </div>
      </motion.div>

      {/* Period Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {(["dia", "semana", "mes"] as const).map((p) => (
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

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium">6/12 - 13/12</span>
          <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards - Corridas */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          title="App"
          value={stats.corridasApp}
          subtitle="corridas"
          icon={Smartphone}
          variant="info"
          delay={0}
        />
        <KpiCard
          title="Particular"
          value={stats.corridasParticular}
          subtitle="corridas"
          icon={Handshake}
          variant="warning"
          delay={1}
        />
        <KpiCard
          title="Horas"
          value={`${stats.horasTrabalhadas}h`}
          subtitle="trabalhadas"
          icon={Clock}
          variant="purple"
          delay={2}
        />
        <KpiCard
          title="Turnos"
          value={stats.turnos}
          subtitle="realizados"
          icon={BarChart3}
          variant="success"
          delay={3}
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="racing-card p-4 border-info/30"
        >
          <p className="text-xs text-muted-foreground mb-1">Receita App</p>
          <p className="font-display text-lg font-bold text-info">
            R$ {stats.receitaApp.toFixed(2)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="racing-card p-4 border-warning/30"
        >
          <p className="text-xs text-muted-foreground mb-1">Receita Particular</p>
          <p className="font-display text-lg font-bold text-warning">
            R$ {stats.receitaParticular.toFixed(2)}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="racing-card p-4 border-racing-purple/30"
        >
          <p className="text-xs text-muted-foreground mb-1">Receita Total</p>
          <p className="font-display text-lg font-bold text-racing-purple">
            R$ {stats.receitaTotal.toFixed(2)}
          </p>
        </motion.div>
      </div>

      {/* Valor por Hora Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="racing-card p-5 border-primary/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Valor por Hora</p>
              <p className="font-display text-3xl font-bold text-primary text-glow">
                R$ {stats.valorPorHora.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            <p>Receita total: R$ {stats.receitaTotal.toFixed(2)}</p>
            <p>÷ {stats.horasTrabalhadas}h trabalhadas</p>
          </div>
        </div>
      </motion.div>

      {/* Corridas por Dia Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="racing-card p-4"
      >
        <h3 className="font-display font-semibold mb-4">Corridas por Dia</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Bar dataKey="app" name="App" fill="hsl(var(--info))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="particular" name="Particular" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Rankings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-racing-gold" />
          <h3 className="font-display font-semibold">Rankings de Desempenho</h3>
        </div>

        {rankings.map((driver, index) => {
          const medalColors = ["bg-racing-gold/20 border-racing-gold/50", "bg-racing-silver/20 border-racing-silver/50", "bg-racing-bronze/20 border-racing-bronze/50"];
          const medalTextColors = ["text-racing-gold", "text-racing-silver", "text-racing-bronze"];
          
          return (
            <motion.div
              key={driver.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className={`racing-card p-4 border ${medalColors[index]}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${medalColors[index]}`}>
                    <Trophy className={`w-5 h-5 ${medalTextColors[index]}`} />
                  </div>
                  <div>
                    <p className="font-display font-bold">{driver.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {driver.turnos} turnos • {driver.horas}h • R$ {driver.receita.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold text-primary">{driver.score}</p>
                  <p className="text-xs text-muted-foreground">R$/h: {driver.revenuePerHour.toFixed(2)}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default DesempenhoView;
