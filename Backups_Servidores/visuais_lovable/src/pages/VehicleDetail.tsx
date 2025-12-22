import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Star, TrendingUp, TrendingDown, DollarSign, 
  Gauge, Activity, Wrench, BarChart3, CheckCircle, Play, 
  Square, Clock, Zap, Target, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MainLayout from "@/components/layout/MainLayout";
import TurnoTab from "@/components/turno/TurnoTab";

// Import vehicle images
import dolphinAzul from "@/assets/vehicles/dolphin-azul.png";
import dolphinBranco from "@/assets/vehicles/dolphin-mini-branco.png";
import dolphinPreto from "@/assets/vehicles/dolphin-preto.png";

interface VehicleData {
  id: string;
  plate: string;
  model: string;
  image: string;
  isFavorite?: boolean;
  status: "disponivel" | "manutencao" | "em_uso";
  stats: {
    revenue: number;
    kmTotal: number;
    corridas: number;
    meta: number;
    metaLastMonth: number;
    costPerKm: number;
    revenuePerKm: number;
    revenuePerHour: number;
    avgTicket: number;
    lastMaintenance: string;
    nextMaintenance: string;
    maintenanceCost: number;
  };
}

const mockVehicles: Record<string, VehicleData> = {
  "1": {
    id: "1",
    plate: "TQQ0A07",
    model: "Dolphin Mini Azul",
    image: dolphinAzul,
    isFavorite: true,
    status: "disponivel",
    stats: { 
      revenue: 12450.5, 
      kmTotal: 4856, 
      corridas: 342, 
      meta: 92, 
      metaLastMonth: 88,
      costPerKm: 2.56,
      revenuePerKm: 2.56,
      revenuePerHour: 48.20,
      avgTicket: 36.40,
      lastMaintenance: "15 dias atrás",
      nextMaintenance: "500 km",
      maintenanceCost: 1240.00
    },
  },
  "2": {
    id: "2",
    plate: "TQQ0725",
    model: "Dolphin Mini Branco",
    image: dolphinBranco,
    status: "em_uso",
    stats: { 
      revenue: 18230.8, 
      kmTotal: 6234, 
      corridas: 456, 
      meta: 88, 
      metaLastMonth: 91,
      costPerKm: 2.92,
      revenuePerKm: 2.92,
      revenuePerHour: 52.30,
      avgTicket: 39.95,
      lastMaintenance: "8 dias atrás",
      nextMaintenance: "1200 km",
      maintenanceCost: 1820.00
    },
  },
  "3": {
    id: "3",
    plate: "TQS4C30",
    model: "Dolphin Mini BR",
    image: dolphinPreto,
    status: "disponivel",
    stats: { 
      revenue: 9876.2, 
      kmTotal: 3892, 
      corridas: 278, 
      meta: 85, 
      metaLastMonth: 85,
      costPerKm: 2.54,
      revenuePerKm: 2.54,
      revenuePerHour: 42.10,
      avgTicket: 35.52,
      lastMaintenance: "22 dias atrás",
      nextMaintenance: "300 km",
      maintenanceCost: 988.00
    },
  },
  "4": {
    id: "4",
    plate: "TQU0H17",
    model: "Dolphin Mini BR",
    image: dolphinBranco,
    status: "manutencao",
    stats: { 
      revenue: 15623.45, 
      kmTotal: 5456, 
      corridas: 398, 
      meta: 90, 
      metaLastMonth: 87,
      costPerKm: 2.86,
      revenuePerKm: 2.86,
      revenuePerHour: 49.80,
      avgTicket: 39.26,
      lastMaintenance: "Hoje",
      nextMaintenance: "5000 km",
      maintenanceCost: 1560.00
    },
  },
};

const maintenanceHistory = [
  { date: "15 dias atrás", type: "Troca de Óleo", cost: 450.00, km: 4300 },
  { date: "45 dias atrás", type: "Revisão Geral", cost: 1200.00, km: 3800 },
  { date: "72 dias atrás", type: "Rodízio de Pneus", cost: 280.00, km: 3200 },
];

const recentRides = [
  { time: "18:49", type: "app", value: 16.74, driver: "Felipe" },
  { time: "17:30", type: "particular", value: 25.00, driver: "Felipe" },
  { time: "16:15", type: "app", value: 18.90, driver: "Felipe" },
  { time: "15:00", type: "particular", value: 30.00, driver: "Felipe" },
];

const VehicleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [turnoAtivo, setTurnoAtivo] = useState(false);
  const [activeTab, setActiveTab] = useState("turno");
  const [showKmDialog, setShowKmDialog] = useState(false);
  const [kmInicial, setKmInicial] = useState("");
  const [turnoStartTime, setTurnoStartTime] = useState("");

  const [activeNavTab, setActiveNavTab] = useState<"turno" | "corridas" | "caixa" | "desempenho" | "veiculos">("turno");

  const vehicle = mockVehicles[id || "1"];

  if (!vehicle) {
    return (
      <MainLayout activeTab={activeNavTab} onTabChange={setActiveNavTab}>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Veículo não encontrado</p>
        </div>
      </MainLayout>
    );
  }

  const getStatusConfig = (status: VehicleData["status"]) => {
    const configs = {
      disponivel: { 
        label: "Disponível", 
        color: "bg-primary/20 text-primary border-primary/40",
        icon: CheckCircle,
      },
      em_uso: { 
        label: "Em Uso", 
        color: "bg-racing-orange/20 text-racing-orange border-racing-orange/40",
        icon: Activity,
      },
      manutencao: { 
        label: "Manutenção", 
        color: "bg-warning/20 text-warning border-warning/40",
        icon: Wrench,
      },
    };
    return configs[status];
  };

  const statusConfig = getStatusConfig(vehicle.status);
  const StatusIcon = statusConfig.icon;

  const handleIniciarTurno = () => {
    if (turnoAtivo) {
      setTurnoAtivo(false);
      setKmInicial("");
      setTurnoStartTime("");
    } else {
      setShowKmDialog(true);
    }
  };

  const handleConfirmarKm = () => {
    if (!kmInicial) return;
    setTurnoAtivo(true);
    setTurnoStartTime(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }));
    setShowKmDialog(false);
    setActiveTab("turno");
  };

  return (
    <MainLayout activeTab={activeNavTab} onTabChange={setActiveNavTab}>
      <div className="space-y-6 pb-8">
        {/* Hero Section */}
        <div className="relative h-[40vh] min-h-[300px] overflow-hidden rounded-2xl">
          {/* Background Image */}
          <img 
            src={vehicle.image}
            alt={vehicle.model}
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-foreground hover:bg-background transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar à Garagem</span>
          </motion.button>

          {/* Vehicle Info */}
          <div className="absolute bottom-6 left-6 right-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-4xl md:text-5xl font-black tracking-tight text-foreground">
                    {vehicle.plate}
                  </h1>
                  {vehicle.isFavorite && (
                    <Star className="w-8 h-8 text-racing-gold fill-racing-gold" />
                  )}
                </div>
                <p className="text-lg text-muted-foreground">{vehicle.model}</p>
              </div>

              {/* Status Badge & Start Turno Button */}
              <div className="flex items-center gap-3">
                {/* Status Badge */}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${statusConfig.color} backdrop-blur-sm`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="text-sm font-display font-bold">{statusConfig.label}</span>
                </div>

                {/* Iniciar/Encerrar Turno Button */}
                {vehicle.status !== "manutencao" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button
                      onClick={handleIniciarTurno}
                      size="lg"
                      className={`h-12 px-6 font-display font-bold tracking-wide transition-all duration-300 ${
                        turnoAtivo
                          ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-[0_0_20px_hsl(var(--destructive)/0.4)]"
                          : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.4)]"
                      }`}
                    >
                      {turnoAtivo ? (
                        <>
                          <Square className="w-5 h-5 mr-2" />
                          Encerrar Turno
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Iniciar Turno
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Turno Ativo Banner */}
        {turnoAtivo && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between p-4 rounded-xl bg-primary/10 border border-primary/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
              <span className="font-display font-bold text-primary">Turno Ativo</span>
              <span className="text-muted-foreground">• Iniciado às {turnoStartTime}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-display font-bold">{kmInicial} km</span>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full md:w-auto justify-start bg-background/50 border border-border/50 p-1 rounded-xl overflow-x-auto">
            <TabsTrigger value="turno" className="font-display data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Home className="w-4 h-4 mr-2" />
              Turno
            </TabsTrigger>
            <TabsTrigger value="performance" className="font-display data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <TrendingUp className="w-4 h-4 mr-2" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="manutencao" className="font-display data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Wrench className="w-4 h-4 mr-2" />
              Manutenção
            </TabsTrigger>
            <TabsTrigger value="corridas" className="font-display data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Activity className="w-4 h-4 mr-2" />
              Corridas
            </TabsTrigger>
            <TabsTrigger value="analise" className="font-display data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="w-4 h-4 mr-2" />
              Análise
            </TabsTrigger>
          </TabsList>

          {/* Turno Tab */}
          <TabsContent value="turno" className="mt-6">
            <TurnoTab
              turnoAtivo={turnoAtivo}
              kmInicial={kmInicial}
              vehiclePlate={vehicle.plate}
              vehicleModel={vehicle.model}
              startTime={turnoStartTime}
              onEncerrarTurno={() => {
                setTurnoAtivo(false);
                setKmInicial("");
                setTurnoStartTime("");
              }}
            />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { icon: DollarSign, value: `R$ ${vehicle.stats.revenue.toLocaleString("pt-BR")}`, label: "Receita Total", change: "+12,5%", color: "text-primary", bg: "bg-primary/10" },
                { icon: Gauge, value: vehicle.stats.kmTotal.toLocaleString("pt-BR"), label: "KM Rodados", change: "+8,2%", color: "text-accent", bg: "bg-accent/10" },
                { icon: Activity, value: vehicle.stats.corridas, label: "Total de Corridas", change: "+15,3%", color: "text-racing-orange", bg: "bg-racing-orange/10" },
                { icon: Target, value: `${vehicle.stats.meta}%`, label: "Meta", change: "+3,1%", color: "text-warning", bg: "bg-warning/10" },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="futuristic-card p-5"
                >
                  <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <p className={`font-display text-2xl font-black ${stat.color}`}>{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Receita por KM", value: `R$ ${vehicle.stats.revenuePerKm.toFixed(2)}`, subtitle: "Acima da média da frota", color: "text-primary" },
                { label: "Receita por Hora", value: `R$ ${vehicle.stats.revenuePerHour.toFixed(2)}`, subtitle: "Meta: R$ 50,00/h", color: "text-accent" },
                { label: "Bilheteria", value: `R$ ${vehicle.stats.avgTicket.toFixed(2)}`, subtitle: "Melhorou 5% este mês", color: "text-racing-orange" },
              ].map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="futuristic-card p-5"
                >
                  <p className="text-sm text-muted-foreground mb-2">{metric.label}</p>
                  <p className={`font-display text-3xl font-black ${metric.color}`}>{metric.value}</p>
                  <div className="mt-3 h-1 bg-background/50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r from-primary to-accent`} style={{ width: "75%" }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{metric.subtitle}</p>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Manutenção Tab */}
          <TabsContent value="manutencao" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="futuristic-card p-5 border-l-4 border-l-primary"
              >
                <CheckCircle className="w-8 h-8 text-primary mb-3" />
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-display text-2xl font-black text-primary">Em Dia</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="futuristic-card p-5 border-l-4 border-l-warning"
              >
                <Clock className="w-8 h-8 text-warning mb-3" />
                <p className="text-sm text-muted-foreground">Próxima Manutenção</p>
                <p className="font-display text-2xl font-black text-warning">{vehicle.stats.nextMaintenance}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="futuristic-card p-5 border-l-4 border-l-accent"
              >
                <DollarSign className="w-8 h-8 text-accent mb-3" />
                <p className="text-sm text-muted-foreground">Custo Total</p>
                <p className="font-display text-2xl font-black text-accent">R$ {vehicle.stats.maintenanceCost.toLocaleString("pt-BR")}</p>
              </motion.div>
            </div>

            {/* Maintenance History */}
            <div className="futuristic-card p-5">
              <h3 className="font-display font-bold text-lg mb-4">Histórico de Manutenções</h3>
              <div className="space-y-4">
                {maintenanceHistory.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
                        <Wrench className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-sm text-muted-foreground">{item.date} • {item.km} km</p>
                      </div>
                    </div>
                    <p className="font-display font-bold">R$ {item.cost.toFixed(2)}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Corridas Tab */}
          <TabsContent value="corridas" className="mt-6">
            <div className="futuristic-card p-5">
              <h3 className="font-display font-bold text-lg mb-4">Últimas Corridas</h3>
              <div className="space-y-3">
                {recentRides.map((ride, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        ride.type === "app" ? "bg-accent/20" : "bg-primary/20"
                      }`}>
                        <Activity className={`w-5 h-5 ${ride.type === "app" ? "text-accent" : "text-primary"}`} />
                      </div>
                      <div>
                        <p className="font-medium">{ride.time}</p>
                        <p className="text-sm text-muted-foreground">{ride.driver} • {ride.type === "app" ? "Aplicativo" : "Particular"}</p>
                      </div>
                    </div>
                    <p className={`font-display font-bold ${ride.type === "app" ? "text-accent" : "text-primary"}`}>
                      R$ {ride.value.toFixed(2)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Análise Tab */}
          <TabsContent value="analise" className="mt-6">
            <div className="futuristic-card p-12 text-center">
              <BarChart3 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display font-bold text-xl mb-2">Análise</h3>
              <p className="text-muted-foreground">Gráficos e relatórios em desenvolvimento</p>
            </div>
          </TabsContent>
        </Tabs>

        {/* KM Inicial Dialog */}
        <Dialog open={showKmDialog} onOpenChange={setShowKmDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-2xl">Iniciar Turno</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground text-sm mb-4">
              Informe o KM inicial do veículo para começar o turno.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-primary">KM Inicial *</label>
                <Input
                  type="number"
                  placeholder="Digite o KM inicial"
                  value={kmInicial}
                  onChange={(e) => setKmInicial(e.target.value)}
                  className="mt-2 h-14 text-lg"
                />
              </div>
              <Button 
                onClick={handleConfirmarKm}
                disabled={!kmInicial}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-bold"
              >
                Iniciar Turno
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default VehicleDetail;
