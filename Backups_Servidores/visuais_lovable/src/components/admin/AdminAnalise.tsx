import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Users, Car, Wrench, CircleDot, PieChart, Star, Trophy, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart as RechartsPie, Pie, Cell } from "recharts";

type SubTab = "financeiro" | "motoristas" | "veiculos" | "manutencao" | "pneus" | "receitas" | "destaques";

const periods = ["Dia", "Semana", "Mês", "Total"];

const financialData = {
  lucroLiquido: -2450.5,
  margemLucro: -8.5,
  receitaEmpresa: 18600,
  repasseMotoristas: 12400,
  turnos: 27,
  custoTotal: 21050.5,
  peTotal: 115,
  peEmpresa: 68,
};

const chartData = [
  { name: "Receita Bruta", value: 31000 },
  { name: "Custos Totais", value: 21050 },
  { name: "Lucro Líquido", value: -2450 },
  { name: "Receita Empresa", value: 18600 },
  { name: "Repasse Motoristas", value: 12400 },
];

const motoristaHorasData = [
  { name: "João Silva", horas: 86.5, turnos: 12 },
  { name: "Maria Santos", horas: 72.3, turnos: 10 },
  { name: "Pedro Oliveira", horas: 65.8, turnos: 9 },
  { name: "Ana Costa", horas: 58.2, turnos: 8 },
];

const custosDistribuicao = [
  { name: "Custos Fixos", value: 15000 },
  { name: "Custos Variáveis", value: 6050 },
];

const pieColors = ["hsl(0, 84%, 55%)", "hsl(38, 92%, 50%)"];

const AdminAnalise = () => {
  const [subTab, setSubTab] = useState<SubTab>("financeiro");
  const [period, setPeriod] = useState("Mês");

  const subTabs: { id: SubTab; label: string; icon: React.ElementType }[] = [
    { id: "financeiro", label: "Financeiro", icon: DollarSign },
    { id: "motoristas", label: "Motoristas", icon: Users },
    { id: "veiculos", label: "Veículos", icon: Car },
    { id: "manutencao", label: "Manutenção", icon: Wrench },
    { id: "pneus", label: "Pneus", icon: CircleDot },
    { id: "receitas", label: "Receitas x Despesas", icon: PieChart },
    { id: "destaques", label: "Destaques", icon: Star },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="font-display text-xl font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-racing-purple" />
          Análise e Relatórios
        </h2>
        <Button variant="outline" className="gap-2 border-racing-gold/50 text-racing-gold hover:bg-racing-gold/20">
          <Trophy className="w-4 h-4" />
          Ver Rankings
        </Button>
      </div>

      {/* Period Card */}
      <div className="futuristic-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Visualizar por:</span>
            <div className="flex gap-2">
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
          </div>
          <p className="text-sm text-muted-foreground">
            Mostrando dados do mês completo
          </p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-2 flex-wrap">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setSubTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-display font-medium transition-all ${
                subTab === tab.id
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {subTab === "financeiro" && (
        <div className="space-y-6">
          {/* KPI Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`futuristic-card p-4 ${financialData.lucroLiquido < 0 ? "bg-gradient-to-br from-destructive/20 to-transparent" : "bg-gradient-to-br from-primary/20 to-transparent"}`}
            >
              {financialData.lucroLiquido < 0 ? (
                <TrendingDown className="w-6 h-6 text-destructive mb-2" />
              ) : (
                <TrendingUp className="w-6 h-6 text-primary mb-2" />
              )}
              <p className={`font-display text-2xl font-bold ${financialData.lucroLiquido < 0 ? "text-destructive" : "text-primary"}`}>
                R$ {Math.abs(financialData.lucroLiquido).toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground">Lucro Líquido</p>
              <p className="text-xs text-muted-foreground/70">Receita Empresa (60%) - Custos</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="futuristic-card p-4 bg-gradient-to-br from-warning/20 to-transparent"
            >
              <TrendingDown className="w-6 h-6 text-warning mb-2" />
              <p className="font-display text-2xl font-bold text-warning">{financialData.margemLucro}%</p>
              <p className="text-sm text-muted-foreground">Margem de Lucro</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="futuristic-card p-4 bg-gradient-to-br from-accent/20 to-transparent"
            >
              <DollarSign className="w-6 h-6 text-accent mb-2" />
              <p className="font-display text-2xl font-bold text-accent">R$ {financialData.receitaEmpresa.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Receita Empresa</p>
              <p className="text-xs text-muted-foreground/70">60% da receita bruta</p>
            </motion.div>
          </div>

          {/* KPI Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="futuristic-card p-4 bg-gradient-to-br from-racing-purple/20 to-transparent"
            >
              <Users className="w-6 h-6 text-racing-purple mb-2" />
              <p className="font-display text-2xl font-bold text-racing-purple">R$ {financialData.repasseMotoristas.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Repasse Motoristas (40%)</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="futuristic-card p-4 bg-gradient-to-br from-info/20 to-transparent"
            >
              <Clock className="w-6 h-6 text-info mb-2" />
              <p className="font-display text-2xl font-bold text-info">{financialData.turnos}</p>
              <p className="text-sm text-muted-foreground">Turnos no Período</p>
            </motion.div>
          </div>

          {/* Chart */}
          <div className="futuristic-card p-4">
            <h3 className="font-display font-bold mb-4">Análise Financeira</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(220, 18%, 10%)',
                      border: '1px solid hsl(220, 15%, 18%)',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Valor']}
                  />
                  <Bar dataKey="value" radius={4}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.value < 0 ? "hsl(0, 84%, 55%)" : index === 0 ? "hsl(142, 76%, 45%)" : index === 1 ? "hsl(38, 92%, 50%)" : "hsl(200, 100%, 50%)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {subTab === "motoristas" && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="futuristic-card p-4">
            <h3 className="font-display font-bold mb-4">Horas Trabalhadas por Motorista</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={motoristaHorasData} layout="vertical">
                  <XAxis type="number" tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" width={100} tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(220, 18%, 10%)',
                      border: '1px solid hsl(220, 15%, 18%)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="horas" name="Total de Horas" fill="hsl(200, 100%, 50%)" radius={4} />
                  <Bar dataKey="turnos" name="Total de Turnos" fill="hsl(38, 92%, 50%)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table */}
          <div className="futuristic-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="p-4 text-left font-display text-sm text-muted-foreground">Motorista</th>
                    <th className="p-4 text-center font-display text-sm text-muted-foreground">Horas</th>
                    <th className="p-4 text-center font-display text-sm text-muted-foreground">Turnos</th>
                    <th className="p-4 text-center font-display text-sm text-muted-foreground">Média h/turno</th>
                    <th className="p-4 text-center font-display text-sm text-muted-foreground">Receita</th>
                    <th className="p-4 text-center font-display text-sm text-muted-foreground">R$/hora</th>
                  </tr>
                </thead>
                <tbody>
                  {motoristaHorasData.map((motorista, index) => (
                    <tr key={motorista.name} className="border-b border-border/20 hover:bg-secondary/20">
                      <td className="p-4 font-display font-bold">{motorista.name}</td>
                      <td className="p-4 text-center">{motorista.horas}h</td>
                      <td className="p-4 text-center">{motorista.turnos}</td>
                      <td className="p-4 text-center">{(motorista.horas / motorista.turnos).toFixed(1)}h</td>
                      <td className="p-4 text-center text-primary font-bold">R$ {(motorista.horas * 28).toFixed(0)}</td>
                      <td className="p-4 text-center text-accent font-bold">R$ 28,00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {subTab === "receitas" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="futuristic-card p-4">
              <h3 className="font-display font-bold mb-4">Distribuição de Custos</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={custosDistribuicao}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {custosDistribuicao.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(220, 18%, 10%)',
                        border: '1px solid hsl(220, 15%, 18%)',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Valor']}
                    />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="futuristic-card p-4">
              <h3 className="font-display font-bold mb-4">Despesas do Período</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={custosDistribuicao}>
                    <XAxis dataKey="name" tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(220, 18%, 10%)',
                        border: '1px solid hsl(220, 15%, 18%)',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString()}`, 'Valor']}
                    />
                    <Bar dataKey="value" radius={4}>
                      {custosDistribuicao.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {(subTab === "veiculos" || subTab === "manutencao" || subTab === "pneus" || subTab === "destaques") && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4">
            {subTab === "veiculos" && <Car className="w-10 h-10 text-muted-foreground" />}
            {subTab === "manutencao" && <Wrench className="w-10 h-10 text-muted-foreground" />}
            {subTab === "pneus" && <CircleDot className="w-10 h-10 text-muted-foreground" />}
            {subTab === "destaques" && <Star className="w-10 h-10 text-racing-gold" />}
          </div>
          <h3 className="font-display text-xl font-bold text-muted-foreground">
            {subTabs.find(t => t.id === subTab)?.label}
          </h3>
          <p className="text-muted-foreground/70 text-sm mt-2">
            Seção em desenvolvimento
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminAnalise;
