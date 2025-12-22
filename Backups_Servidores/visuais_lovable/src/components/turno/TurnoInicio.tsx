import { useState } from "react";
import { Star, Play } from "lucide-react";
import { motion } from "framer-motion";
import VehicleCard from "../vehicles/VehicleCard";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// Import vehicle images
import dolphinAzul from "@/assets/vehicles/dolphin-azul.png";
import dolphinBranco from "@/assets/vehicles/dolphin-mini-branco.png";
import dolphinPreto from "@/assets/vehicles/dolphin-preto.png";

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  imageUrl?: string;
  isFavorite?: boolean;
  isInUse?: boolean;
  needsAttention?: boolean;
}

const mockVehicles: Vehicle[] = [
  { id: "1", plate: "ABC-1234", model: "Dolphin Mini Azul", imageUrl: dolphinAzul, isFavorite: true },
  { id: "2", plate: "DEF-5678", model: "BYD Dolphin Branco", imageUrl: dolphinBranco, isInUse: true },
  { id: "3", plate: "GHI-9012", model: "Dolphin Plus Preto", imageUrl: dolphinPreto, needsAttention: true },
  { id: "4", plate: "JKL-3456", model: "BYD Yuan Plus Cinza", imageUrl: dolphinBranco },
];

interface TurnoInicioProps {
  onStartTurno: (vehicleId: string, kmInicial: number) => void;
}

const TurnoInicio = ({ onStartTurno }: TurnoInicioProps) => {
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [kmInicial, setKmInicial] = useState("");

  const favoriteVehicle = mockVehicles.find(v => v.isFavorite);
  const availableVehicles = mockVehicles.filter(v => !v.isInUse);

  const handleStart = () => {
    if (selectedVehicle && kmInicial) {
      onStartTurno(selectedVehicle, parseInt(kmInicial));
    }
  };

  return (
    <div className="space-y-6">
      {/* Favorite Vehicle Highlight */}
      {favoriteVehicle && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="racing-card p-4 border-racing-gold/30"
        >
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-5 h-5 text-racing-gold fill-racing-gold" />
            <span className="text-sm font-semibold text-racing-gold">Veículo Favorito</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden">
              {favoriteVehicle.imageUrl ? (
                <img 
                  src={favoriteVehicle.imageUrl} 
                  alt={favoriteVehicle.model} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-racing-gold/20 flex items-center justify-center">
                  <span className="text-xl">🚗</span>
                </div>
              )}
            </div>
            <div>
              <p className="font-display font-bold">{favoriteVehicle.plate}</p>
              <p className="text-sm text-muted-foreground">{favoriteVehicle.model}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Start Shift Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="font-display text-xl font-bold mb-2">Iniciar Turno</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Selecione o veículo e informe o KM inicial
        </p>

        {/* Vehicle List */}
        <div className="space-y-3 mb-6">
          {mockVehicles.map((vehicle, index) => (
            <motion.div
              key={vehicle.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <VehicleCard
                plate={vehicle.plate}
                model={vehicle.model}
                imageUrl={vehicle.imageUrl}
                isFavorite={vehicle.isFavorite}
                isSelected={selectedVehicle === vehicle.id}
                isInUse={vehicle.isInUse}
                needsAttention={vehicle.needsAttention}
                onClick={() => !vehicle.isInUse && setSelectedVehicle(vehicle.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* KM Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">KM Inicial</label>
          <Input
            type="number"
            placeholder="Digite o KM inicial"
            value={kmInicial}
            onChange={(e) => setKmInicial(e.target.value)}
            className="bg-secondary border-border text-lg font-display"
          />
        </div>

        {/* Start Button */}
        <Button
          onClick={handleStart}
          disabled={!selectedVehicle || !kmInicial}
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-display text-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
        >
          <Play className="w-5 h-5 mr-2" />
          Iniciar Turno
        </Button>
      </motion.div>
    </div>
  );
};

export default TurnoInicio;
