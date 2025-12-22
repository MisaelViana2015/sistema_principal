import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import TurnoInicio from "@/components/turno/TurnoInicio";
import TurnoAtivo from "@/components/turno/TurnoAtivo";
import CorridasView from "@/components/corridas/CorridasView";
import CaixaView from "@/components/caixa/CaixaView";
import DesempenhoView from "@/components/desempenho/DesempenhoView";
import GarageView from "@/components/garage/GarageView";
import { toast } from "@/hooks/use-toast";

type Tab = "turno" | "corridas" | "caixa" | "desempenho" | "veiculos";

interface TurnoState {
  isActive: boolean;
  vehicleId: string | null;
  vehiclePlate: string;
  vehicleModel: string;
  kmInicial: number;
  startTime: Date | null;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("veiculos");
  const [turno, setTurno] = useState<TurnoState>({
    isActive: false,
    vehicleId: null,
    vehiclePlate: "",
    vehicleModel: "",
    kmInicial: 0,
    startTime: null,
  });

  const handleStartTurno = (vehicleId: string, kmInicial: number) => {
    // In real app, would fetch vehicle details
    const vehicleMap: Record<string, { plate: string; model: string }> = {
      "1": { plate: "ABC-1234", model: "Dolphin Mini Azul" },
      "2": { plate: "DEF-5678", model: "BYD Dolphin Branco" },
      "3": { plate: "GHI-9012", model: "Dolphin Plus Preto" },
      "4": { plate: "JKL-3456", model: "BYD Yuan Plus Cinza" },
    };

    const vehicle = vehicleMap[vehicleId];
    
    setTurno({
      isActive: true,
      vehicleId,
      vehiclePlate: vehicle.plate,
      vehicleModel: vehicle.model,
      kmInicial,
      startTime: new Date(),
    });

    toast({
      title: "Turno Iniciado!",
      description: `Veículo ${vehicle.plate} - KM ${kmInicial}`,
    });
  };

  const handleEndTurno = () => {
    setTurno({
      isActive: false,
      vehicleId: null,
      vehiclePlate: "",
      vehicleModel: "",
      kmInicial: 0,
      startTime: null,
    });

    toast({
      title: "Turno Encerrado",
      description: "Seu turno foi finalizado com sucesso.",
    });
  };

  const handleAddCorrida = () => {
    toast({
      title: "Adicionar Corrida",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const handleAddCusto = () => {
    toast({
      title: "Adicionar Custo",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case "turno":
        return turno.isActive ? (
          <TurnoAtivo
            vehiclePlate={turno.vehiclePlate}
            vehicleModel={turno.vehicleModel}
            kmInicial={turno.kmInicial}
            startTime={turno.startTime!}
            onEndTurno={handleEndTurno}
            onAddCorrida={handleAddCorrida}
            onAddCusto={handleAddCusto}
          />
        ) : (
          <TurnoInicio onStartTurno={handleStartTurno} />
        );
      case "corridas":
        return <CorridasView />;
      case "caixa":
        return <CaixaView />;
      case "desempenho":
        return <DesempenhoView />;
      case "veiculos":
        return <GarageView />;
      default:
        return null;
    }
  };

  return (
    <MainLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </MainLayout>
  );
};

export default Index;
