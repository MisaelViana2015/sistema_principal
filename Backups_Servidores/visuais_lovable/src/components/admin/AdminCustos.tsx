import { useState } from "react";
import { motion } from "framer-motion";
import { Receipt, Edit2, Trash2, ChevronDown, Zap, Car, DollarSign, MapPin, TrendingUp, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Custo {
  id: string;
  tipo: "recarga_carro" | "recarga_app" | "pedagio" | "outros";
  valor: number;
  dataHora: string;
  motorista: string;
  observacao?: string;
}

const mockCustos: Custo[] = [
  { id: "1", tipo: "recarga_carro", valor: 150.0, dataHora: "2024-01-15 14:30", motorista: "João Silva" },
  { id: "2", tipo: "pedagio", valor: 12.5, dataHora: "2024-01-15 13:45", motorista: "Maria Santos" },
  { id: "3", tipo: "recarga_app", valor: 50.0, dataHora: "2024-01-15 12:20", motorista: "Pedro Oliveira" },
  { id: "4", tipo: "outros", valor: 35.0, dataHora: "2024-01-15 11:00", motorista: "João Silva", observacao: "Lavagem do veículo" },
  { id: "5", tipo: "recarga_carro", valor: 180.0, dataHora: "2024-01-14 16:00", motorista: "Maria Santos" },
];

const tipoConfig = {
  recarga_carro: { label: "Recarga Carro", icon: Car, color: "text-accent", bg: "bg-accent/20" },
  recarga_app: { label: "Recarga App", icon: Zap, color: "text-primary", bg: "bg-primary/20" },
  pedagio: { label: "Pedágio", icon: MapPin, color: "text-warning", bg: "bg-warning/20" },
  outros: { label: "Outros", icon: DollarSign, color: "text-muted-foreground", bg: "bg-secondary" },
};

const motoristaCustos = [
  { name: "João Silva", value: 185 },
  { name: "Maria Santos", value: 192.5 },
  { name: "Pedro Oliveira", value: 50 },
];

const tipoCustos = [
  { name: "Recarga Carro", value: 330 },
  { name: "Recarga App", value: 50 },
  { name: "Outros", value: 35 },
  { name: "Pedágio", value: 12.5 },
];

const chartColors = ["hsl(200, 100%, 50%)", "hsl(142, 76%, 45%)", "hsl(38, 92%, 50%)", "hsl(270, 76%, 55%)"];

const AdminCustos = () => {
  const totalValue = mockCustos.reduce((acc, c) => acc + c.valor, 0);
  const avgValue = totalValue / mockCustos.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-racing-purple" />
            Gestão de Custos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Total: <span className="text-destructive font-bold">R$ {totalValue.toFixed(2)}</span> ({mockCustos.length} custos)
          </p>
        </div>
      </div>

      {/* Filters Card */}
      <div className="futuristic-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-3 flex-wrap">
            <select className="bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-racing-purple/50">
              <option>Todos os Motoristas</option>
              <option>João Silva</option>
              <option>Maria Santos</option>
              <option>Pedro Oliveira</option>
            </select>
            <select className="bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-racing-purple/50">
              <option>Todos os Tipos</option>
              <option>Recarga Carro</option>
              <option>Recarga App</option>
              <option>Pedágio</option>
              <option>Outros</option>
            </select>
            <select className="bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-racing-purple/50">
              <option>2024</option>
              <option>2023</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ChevronDown className="w-4 h-4" />
            Mais Recentes
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="futuristic-card p-4 bg-gradient-to-br from-info/20 to-accent/10"
        >
          <DollarSign className="w-6 h-6 text-info mb-2" />
          <p className="font-display text-2xl font-bold text-info">R$ {totalValue.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Total Geral</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="futuristic-card p-4 bg-gradient-to-br from-racing-purple/20 to-accent/10"
        >
          <Hash className="w-6 h-6 text-racing-purple mb-2" />
          <p className="font-display text-2xl font-bold text-racing-purple">{mockCustos.length}</p>
          <p className="text-sm text-muted-foreground">Qtd. Custos</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="futuristic-card p-4 bg-gradient-to-br from-primary/20 to-accent/10"
        >
          <TrendingUp className="w-6 h-6 text-primary mb-2" />
          <p className="font-display text-2xl font-bold text-primary">R$ {avgValue.toFixed(2)}</p>
          <p className="text-sm text-muted-foreground">Média/Custo</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="futuristic-card p-4">
          <h3 className="font-display font-bold mb-4">Custos por Motorista</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={motoristaCustos} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(220, 18%, 10%)', 
                    border: '1px solid hsl(220, 15%, 18%)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                />
                <Bar dataKey="value" radius={4}>
                  {motoristaCustos.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="futuristic-card p-4">
          <h3 className="font-display font-bold mb-4">Custos por Tipo</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tipoCustos} layout="vertical">
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(220, 18%, 10%)', 
                    border: '1px solid hsl(220, 15%, 18%)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                />
                <Bar dataKey="value" radius={4}>
                  {tipoCustos.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Custos List */}
      <div className="space-y-3">
        {mockCustos.map((custo, index) => {
          const config = tipoConfig[custo.tipo];
          const Icon = config.icon;

          return (
            <motion.div
              key={custo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="futuristic-card p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${config.bg} ${config.color}`}>
                        {config.label}
                      </span>
                      <span className="text-sm text-muted-foreground">{custo.motorista}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(custo.dataHora).toLocaleString('pt-BR')}
                    </p>
                    {custo.observacao && (
                      <p className="text-xs text-muted-foreground/70 mt-1 italic">
                        "{custo.observacao}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <p className="font-display text-xl font-bold text-destructive">
                    R$ {custo.valor.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCustos;
