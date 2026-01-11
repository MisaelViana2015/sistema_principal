
import { useState, useEffect, useCallback } from "react";
import { vehiclesService } from "../modules/vehicles/vehicles.service";
import { resolveVehicleImage } from "../lib/vehicleAssets";
import { Vehicle } from "@shared/schema";
import { useToast } from "../hooks/use-toast";

export interface VehicleWithUI extends Vehicle {
    image: string;
    isFavorite: boolean;
    status: "disponivel" | "manutencao" | "em_uso" | "indisponivel";
    stats: {
        revenue: number;
        kmTotal: number;
        corridas: number;
        meta: number;
        metaLastMonth: number;
    };
}

export function useVehicles() {
    const [vehicles, setVehicles] = useState<VehicleWithUI[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const loadVehicles = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await vehiclesService.getAllWithStatus();

            const processedVehicles: VehicleWithUI[] = data.map((v) => {
                let status: VehicleWithUI["status"] = "disponivel";

                if (v.status === 'indisponivel') status = 'indisponivel';
                else if (v.status === 'manutencao') status = 'manutencao';
                else if (v.currentShiftId) status = 'em_uso';
                else status = 'disponivel'; // 'ativo' maps to 'disponivel'

                // Fallback for legacy isActive if status is not set (should not happen with new schema default)
                if (!v.status && !v.isActive) status = 'manutencao';

                return {
                    ...v,
                    image: resolveVehicleImage(v),
                    isFavorite: false, // Pode vir do localStorage ou API futuramente
                    status,
                    stats: {
                        revenue: 0, // Placeholder
                        kmTotal: Number(v.kmInicial) || 0,
                        corridas: 0, // Placeholder
                        meta: 85, // Placeholder
                        metaLastMonth: 80 // Placeholder
                    }
                };
            });

            setVehicles(processedVehicles);
        } catch (error) {
            console.error("Failed to load vehicles", error);
            toast({
                title: "Erro",
                description: "Falha ao carregar frota de veículos.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    return { vehicles, isLoading, refresh: loadVehicles };
}
