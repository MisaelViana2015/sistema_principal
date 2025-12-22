import { useState } from "react";
import { ChevronLeft, ChevronRight, FileDown, Smartphone, Handshake, Gauge, Clock, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import KpiCard from "../ui/KpiCard";

interface Turno {
  id: string;
  motorista: string;
  veiculo: { plate: string; model: string };
  inicio: string;
  fim: string;
  corridasApp: { count: number; value: number }[];
  corridasParticular: { count: number; value: number }[];
  custos: number;
  kmInicial: number;
  kmFinal: number;
}

const mockTurno: Turno = {
  id: "1",
  motorista: "Misael",
  veiculo: { plate: "ABC-1234", model: "Dolphin Mini Azul" },
  inicio: "08:00",
  fim: "17:55",
  corridasApp: [
    { count: 1, value: 25.5 },
    { count: 2, value: 18.0 },
    { count: 3, value: 32.0 },
    { count: 4, value: 28.0 },
    { count: 5, value: 22.5 },
  ],
  corridasParticular: [
    { count: 1, value: 45.0 },
    { count: 2, value: 55.0 },
    { count: 3, value: 40.0 },
  ],
  custos: 45.0,
  kmInicial: 45230,
  kmFinal: 45428,
};

const CaixaView = () => {
  const [selectedDate, setSelectedDate] = useState("15/12/2024");

  const totalApp = mockTurno.corridasApp.reduce((acc, c) => acc + c.value, 0);
  const totalParticular = mockTurno.corridasParticular.reduce((acc, c) => acc + c.value, 0);
  const totalBruto = totalApp + totalParticular;
  const lucroLiquido = totalBruto - mockTurno.custos;
  const empresa = lucroLiquido * 0.6;
  const motorista = lucroLiquido * 0.4;
  const kmRodados = mockTurno.kmFinal - mockTurno.kmInicial;
  const valorPorKm = totalBruto / kmRodados;
  const totalCorridas = mockTurno.corridasApp.length + mockTurno.corridasParticular.length;
  const ticketMedio = totalBruto / totalCorridas;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="font-display text-2xl font-bold mb-1">Caixa</h1>
        <p className="text-sm text-muted-foreground">Fechamento de turnos</p>
      </motion.div>

      {/* Date Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-display font-semibold text-lg">{selectedDate}</span>
        <button className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Turno Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="racing-card overflow-hidden"
      >
        {/* Header */}
        <div className="bg-secondary/50 px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-display font-bold">{mockTurno.motorista}</p>
            <p className="text-xs text-muted-foreground">
              {mockTurno.veiculo.plate} • {mockTurno.veiculo.model}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <p className="text-muted-foreground">Início: {mockTurno.inicio}</p>
              <p className="text-muted-foreground">Fim: {mockTurno.fim}</p>
            </div>
            <button className="p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors">
              <FileDown className="w-5 h-5 text-primary" />
            </button>
          </div>
        </div>

        {/* Corridas Lists */}
        <div className="p-4 grid grid-cols-2 gap-4">
          {/* App */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="w-4 h-4 text-info" />
              <span className="text-sm font-semibold">Aplicativo</span>
            </div>
            <div className="space-y-2">
              {mockTurno.corridasApp.map((c) => (
                <div key={c.count} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">#{c.count}</span>
                  <span className="text-info font-medium">R$ {c.value.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex items-center justify-between font-semibold">
                <span>Total</span>
                <span className="text-info">R$ {totalApp.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Particular */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Handshake className="w-4 h-4 text-warning" />
              <span className="text-sm font-semibold">Particular</span>
            </div>
            <div className="space-y-2">
              {mockTurno.corridasParticular.map((c) => (
                <div key={c.count} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">#{c.count}</span>
                  <span className="text-warning font-medium">R$ {c.value.toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-2 flex items-center justify-between font-semibold">
                <span>Total</span>
                <span className="text-warning">R$ {totalParticular.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Financial Summary */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard title="Receita Total" value={`R$ ${totalBruto.toFixed(2)}`} variant="success" delay={2} />
        <KpiCard title="Custos" value={`R$ ${mockTurno.custos.toFixed(2)}`} variant="destructive" delay={3} />
        <KpiCard title="Lucro Líquido" value={`R$ ${lucroLiquido.toFixed(2)}`} variant="info" delay={4} />
        <KpiCard title="Empresa (60%)" value={`R$ ${empresa.toFixed(2)}`} variant="purple" delay={5} />
        <KpiCard title="Motorista (40%)" value={`R$ ${motorista.toFixed(2)}`} variant="gold" delay={6} />
      </div>

      {/* Operational Data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="racing-card p-4"
      >
        <h3 className="font-display font-semibold mb-4">Dados Operacionais</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <Gauge className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">KM Rodados</p>
              <p className="font-display font-bold">{kmRodados} km</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valor/KM</p>
              <p className="font-display font-bold text-success">R$ {valorPorKm.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-info/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Corridas</p>
              <p className="font-display font-bold">{totalCorridas}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ticket Médio</p>
              <p className="font-display font-bold text-warning">R$ {ticketMedio.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 col-span-2">
            <div className="w-10 h-10 rounded-lg bg-racing-purple/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-racing-purple" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duração do Turno</p>
              <p className="font-display font-bold">9h 55min</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CaixaView;
