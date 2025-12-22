import { useState, useEffect } from "react";
import { Plus, DollarSign, Square, Smartphone, Handshake, Clock, Gauge } from "lucide-react";
import { motion } from "framer-motion";
import KpiCard from "../ui/KpiCard";
import { Button } from "../ui/button";

interface TurnoAtivoProps {
  vehiclePlate: string;
  vehicleModel: string;
  kmInicial: number;
  startTime: Date;
  onEndTurno: () => void;
  onAddCorrida: () => void;
  onAddCusto: () => void;
}

const TurnoAtivo = ({
  vehiclePlate,
  vehicleModel,
  kmInicial,
  startTime,
  onEndTurno,
  onAddCorrida,
  onAddCusto,
}: TurnoAtivoProps) => {
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Date.now() - startTime.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsedTime(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Mock data - would come from state/API
  const turnoData = {
    bruto: 245.5,
    descontos: 12.0,
    liquido: 233.5,
    empresa: 140.1,
    motorista: 93.4,
    corridasApp: { count: 8, value: 156.0 },
    corridasParticular: { count: 3, value: 89.5 },
  };

  return (
    <div className="space-y-6">
      {/* Turno Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="racing-card p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Motorista</p>
            <p className="font-display font-bold text-lg">Misael</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{vehiclePlate}</p>
            <p className="text-xs text-muted-foreground">{vehicleModel}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <Clock className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Início</p>
            <p className="font-display font-semibold text-sm">
              {startTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div>
            <Gauge className="w-4 h-4 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">KM Inicial</p>
            <p className="font-display font-semibold text-sm">{kmInicial.toLocaleString()}</p>
          </div>
          <div>
            <Clock className="w-4 h-4 mx-auto mb-1 text-primary" />
            <p className="text-xs text-muted-foreground">Trabalhado</p>
            <p className="font-display font-bold text-primary text-glow">{elapsedTime}</p>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button
            onClick={onAddCorrida}
            className="w-full h-14 bg-success hover:bg-success/90 text-success-foreground font-display font-bold"
          >
            <Plus className="w-5 h-5 mr-2" />
            Corrida
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Button
            onClick={onAddCusto}
            className="w-full h-14 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-display font-bold"
          >
            <DollarSign className="w-5 h-5 mr-2" />
            Custo
          </Button>
        </motion.div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard
          title="Bruto"
          value={`R$ ${turnoData.bruto.toFixed(2)}`}
          subtitle="App + Particular"
          variant="success"
          delay={2}
        />
        <KpiCard
          title="Descontos"
          value={`-R$ ${turnoData.descontos.toFixed(2)}`}
          variant="destructive"
          delay={3}
        />
        <KpiCard
          title="Líquido"
          value={`R$ ${turnoData.liquido.toFixed(2)}`}
          variant="info"
          delay={4}
        />
        <KpiCard
          title="Empresa (60%)"
          value={`R$ ${turnoData.empresa.toFixed(2)}`}
          variant="purple"
          delay={5}
        />
        <KpiCard
          title="Motorista (40%)"
          value={`R$ ${turnoData.motorista.toFixed(2)}`}
          variant="gold"
          delay={6}
        />
      </div>

      {/* Corridas Summary */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="racing-card p-4 border-info/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-4 h-4 text-info" />
            <span className="text-xs text-muted-foreground">Corridas App</span>
          </div>
          <p className="font-display text-2xl font-bold">{turnoData.corridasApp.count}</p>
          <p className="text-sm text-info">R$ {turnoData.corridasApp.value.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="racing-card p-4 border-warning/30"
        >
          <div className="flex items-center gap-2 mb-2">
            <Handshake className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Corridas Particular</span>
          </div>
          <p className="font-display text-2xl font-bold">{turnoData.corridasParticular.count}</p>
          <p className="text-sm text-warning">R$ {turnoData.corridasParticular.value.toFixed(2)}</p>
        </motion.div>
      </div>

      {/* End Turno Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Button
          onClick={onEndTurno}
          className="w-full h-14 bg-foreground hover:bg-foreground/90 text-background font-display font-bold"
        >
          <Square className="w-5 h-5 mr-2" />
          Encerrar Turno
        </Button>
      </motion.div>
    </div>
  );
};

export default TurnoAtivo;
