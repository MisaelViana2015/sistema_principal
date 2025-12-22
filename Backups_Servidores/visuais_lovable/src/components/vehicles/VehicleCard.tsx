import { Star, Check, Gauge, DollarSign, Wrench } from "lucide-react";
import { motion } from "framer-motion";

interface VehicleCardProps {
  plate: string;
  model: string;
  imageUrl?: string;
  isFavorite?: boolean;
  isSelected?: boolean;
  isInUse?: boolean;
  needsAttention?: boolean;
  kmTotal?: number;
  revenue?: number;
  costPerKm?: number;
  onClick?: () => void;
}

const VehicleCard = ({
  plate,
  model,
  imageUrl,
  isFavorite = false,
  isSelected = false,
  isInUse = false,
  needsAttention = false,
  kmTotal,
  revenue,
  costPerKm,
  onClick,
}: VehicleCardProps) => {
  const cardClasses = `vehicle-card p-4 ${isSelected ? "selected" : ""} ${needsAttention ? "warning" : ""}`;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cardClasses}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        {/* Left: Vehicle Info */}
        <div className="flex items-start gap-3">
          {/* Vehicle Image */}
          <div className={`w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center ${
            isInUse ? "ring-2 ring-info" : isSelected ? "ring-2 ring-primary" : ""
          }`}>
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={model} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-secondary flex items-center justify-center">
                <span className="text-2xl">🚗</span>
              </div>
            )}
          </div>
          
          <div>
            {/* Plate */}
            <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold tracking-wider">
                {plate}
              </span>
              {isFavorite && (
                <Star className="w-4 h-4 text-racing-gold fill-racing-gold" />
              )}
            </div>
            
            {/* Model */}
            <p className="text-sm text-muted-foreground">{model}</p>
            
            {/* Stats */}
            {(kmTotal !== undefined || revenue !== undefined) && (
              <div className="flex flex-wrap gap-3 mt-2">
                {kmTotal !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Gauge className="w-3 h-3" />
                    <span>{kmTotal.toLocaleString("pt-BR")} km</span>
                  </div>
                )}
                {revenue !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-success">
                    <DollarSign className="w-3 h-3" />
                    <span>R$ {revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                {costPerKm !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-warning">
                    <Wrench className="w-3 h-3" />
                    <span>R$ {costPerKm.toFixed(2)}/km</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Right: Status */}
        <div className="flex flex-col items-end gap-2">
          {isInUse ? (
            <span className="px-2 py-1 rounded-full bg-destructive/20 text-destructive text-xs font-semibold">
              Em Uso
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full bg-success/20 text-success text-xs font-semibold">
              Disponível
            </span>
          )}
          
          {isSelected && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
            >
              <Check className="w-4 h-4 text-primary-foreground" />
            </motion.div>
          )}
          
          {needsAttention && (
            <span className="px-2 py-1 rounded-full bg-warning/20 text-warning text-xs font-semibold">
              Atenção
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;
