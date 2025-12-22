import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, FileText, Car, ChevronLeft, ChevronRight, Calendar, DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const kpiData = [
  { period: "Dia", custos: 150, pago: 100, pendente: 50, juros: 5 },
  { period: "Semana", custos: 850, pago: 600, pendente: 250, juros: 25 },
  { period: "Mês", custos: 3200, pago: 2400, pendente: 800, juros: 80 },
  { period: "Ano", custos: 38400, pago: 28800, pendente: 9600, juros: 960 },
  { period: "Total", custos: 42000, pago: 31500, pendente: 10500, juros: 1050 },
];

const monthlyData = [
  { month: "Jan", total: 3200, juros: 80, pago: 2400, pendente: 800 },
  { month: "Fev", total: 3200, juros: 75, pago: 2600, pendente: 600 },
  { month: "Mar", total: 3200, juros: 90, pago: 2200, pendente: 1000 },
  { month: "Abr", total: 3200, juros: 70, pago: 2800, pendente: 400 },
  { month: "Mai", total: 3200, juros: 85, pago: 2500, pendente: 700 },
  { month: "Jun", total: 3200, juros: 95, pago: 2100, pendente: 1100 },
];

interface CustoFixo {
  id: string;
  veiculo: { plate: string; model: string };
  tipo: string;
  valor: number;
  parcela: string;
  status: "pago" | "pendente";
  vencimento: string;
}

const mockCustosFixos: CustoFixo[] = [
  { id: "1", veiculo: { plate: "TQQ0A07", model: "Mini Golfinho" }, tipo: "Empréstimo", valor: 850, parcela: "24/96", status: "pendente", vencimento: "2024-01-20" },
  { id: "2", veiculo: { plate: "TQQ0725", model: "Maverique" }, tipo: "Empréstimo", valor: 920, parcela: "18/96", status: "pago", vencimento: "2024-01-15" },
  { id: "3", veiculo: { plate: "TQS4C30", model: "Dolphin Mini" }, tipo: "Seguro", valor: 350, parcela: "3/12", status: "pendente", vencimento: "2024-01-25" },
];

const AdminCustosFixos = () => {
  const [year, setYear] = useState(2024);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-display text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-racing-purple" />
            Custos Fixos Avulsos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Custos mensais individuais ou recorrentes
          </p>
        </div>
        <Button className="btn-futuristic gap-2">
          <Plus className="w-4 h-4" />
          Novo Custo
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Headers */}
          <div className="grid grid-cols-6 gap-2 mb-2">
            <div className="p-2"></div>
            {["Dia", "Semana", "Mês", "Ano", "Total"].map((period) => (
              <div key={period} className="p-2 text-center">
                <span className="text-xs font-display font-bold text-muted-foreground">{period}</span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {[
            { label: "Custos", key: "custos", color: "text-info", bg: "from-info/20" },
            { label: "Pago", key: "pago", color: "text-primary", bg: "from-primary/20" },
            { label: "Pendente", key: "pendente", color: "text-warning", bg: "from-warning/20" },
            { label: "Juros", key: "juros", color: "text-destructive", bg: "from-destructive/20" },
          ].map((row, rowIndex) => (
            <div key={row.label} className="grid grid-cols-6 gap-2 mb-2">
              <div className="p-3 flex items-center">
                <span className={`text-sm font-display font-bold ${row.color}`}>{row.label}</span>
              </div>
              {kpiData.map((data, index) => (
                <motion.div
                  key={`${row.key}-${data.period}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (rowIndex * 5 + index) * 0.02 }}
                  className={`futuristic-card p-3 bg-gradient-to-br ${row.bg} to-transparent`}
                >
                  <p className={`font-display text-lg font-bold ${row.color}`}>
                    R$ {(data[row.key as keyof typeof data] as number).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {((data[row.key as keyof typeof data] as number / data.custos) * 100).toFixed(0)}%
                  </p>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="futuristic-card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold">Custos Fixos por Mês</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setYear(year - 1)}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-display font-bold">{year}</span>
            <Button variant="ghost" size="icon" onClick={() => setYear(year + 1)}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <XAxis dataKey="month" tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }} />
              <YAxis tick={{ fill: 'hsl(220, 10%, 55%)', fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(220, 18%, 10%)',
                  border: '1px solid hsl(220, 15%, 18%)',
                  borderRadius: '8px'
                }}
                formatter={(value: number) => [`R$ ${value.toFixed(2)}`, '']}
              />
              <Legend />
              <Bar dataKey="total" name="Custo Total" fill="hsl(200, 100%, 50%)" radius={4} />
              <Bar dataKey="juros" name="Juros" fill="hsl(0, 84%, 55%)" radius={4} />
              <Bar dataKey="pago" name="Valor Pago" fill="hsl(142, 76%, 45%)" radius={4} />
              <Bar dataKey="pendente" name="Valor Pendente" fill="hsl(38, 92%, 50%)" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters */}
      <div className="futuristic-card p-4">
        <div className="flex flex-wrap items-center gap-4">
          <select className="bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-racing-purple/50">
            <option>Todos os Veículos</option>
            <option>TQQ0A07</option>
            <option>TQQ0725</option>
            <option>TQS4C30</option>
          </select>
          <input
            type="month"
            className="bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-racing-purple/50"
            defaultValue="2024-01"
          />
          <select className="bg-secondary/50 border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-racing-purple/50">
            <option>Mensal</option>
            <option>Trimestral</option>
            <option>Semestral</option>
            <option>Anual</option>
          </select>
        </div>
      </div>

      {/* Custos List */}
      <div className="space-y-4">
        {mockCustosFixos.map((custo, index) => (
          <motion.div
            key={custo.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="futuristic-card overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-gradient-to-r from-racing-purple/10 to-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-racing-purple/20 flex items-center justify-center">
                  <Car className="w-6 h-6 text-racing-purple" />
                </div>
                <div>
                  <h3 className="font-display font-bold">{custo.veiculo.plate}</h3>
                  <p className="text-sm text-muted-foreground">{custo.veiculo.model}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display text-xl font-bold">R$ {custo.valor.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">1 custo</p>
              </div>
            </div>

            {/* Detail */}
            <div className="p-4 bg-secondary/10">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tipo</p>
                    <p className="font-bold">{custo.tipo}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    custo.status === "pago" 
                      ? "bg-primary/20 text-primary" 
                      : "bg-warning/20 text-warning"
                  }`}>
                    {custo.status === "pago" ? "Pago" : "Pendente"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {new Date(custo.vencimento).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="font-display font-bold">
                    Parcela {custo.parcela}
                  </div>
                  <div className="font-display font-bold text-lg">
                    R$ {custo.valor.toFixed(2)}
                  </div>
                </div>
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
        ))}
      </div>
    </div>
  );
};

export default AdminCustosFixos;
