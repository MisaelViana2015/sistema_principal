
import { useState, useEffect, useCallback } from "react";
import { vehiclesService } from "../modules/vehicles/vehicles.service";
import { resolveVehicleImage } from "../lib/vehicleAssets";
import { Vehicle } from "../../../shared/schema";
import { useToast } from "../components/ui/use-toast";

export interface VehicleWithUI extends Vehicle {
    image: string;
    isFavorite: boolean;
    status: "disponivel" | "manutencao" | "em_uso";
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
            const data = await vehiclesService.getAll();

            const processedVehicles: VehicleWithUI[] = data.map((v) => ({
                ...v,
                image: resolveVehicleImage(v),
                isFavorite: false, // Pode vir do localStorage ou API futuramente
                status: !v.isActive ? "manutencao" : (v.currentShiftId ? "em_uso" : "disponivel"),
                stats: {
                    revenue: 0, // Placeholder
                    kmTotal: Number(v.kmInicial) || 0,
                    corridas: 0, // Placeholder
                    meta: 85, // Placeholder
                    metaLastMonth: 80 // Placeholder
                }
            }));

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
