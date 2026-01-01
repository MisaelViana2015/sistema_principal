
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { driversService } from '../../drivers/drivers.service';
import { vehiclesService } from '../../vehicles/vehicles.service';
import styles from '../styles/AuditPage.module.css';

interface AuditPayloadViewerProps {
    data: any;
    label?: string;
    className?: string;
}

const FIELD_LABELS: Record<string, string> = {
    // Shifts
    shiftId: "Turno",
    driverId: "Motorista",
    vehicleId: "Veículo",
    kmInicial: "KM Inicial",
    kmFinal: "KM Final",
    start: "Início",
    end: "Fim",
    status: "Status",

    // Financial
    value: "Valor",
    costTypeId: "Tipo de Custo",
    description: "Descrição",
    notes: "Notas",
    isParticular: "Particular?",
    isSplitCost: "Dividido?",

    // Rides
    tipo: "Tipo",
    hora: "Horário",

    // Common
    id: "ID",
    createdAt: "Criado em",
    updatedAt: "Atualizado em",
    isActive: "Ativo?",
    name: "Nome",
    plate: "Placa"
};

const AuditPayloadViewer: React.FC<AuditPayloadViewerProps> = ({ data, label, className }) => {
    // Fetch data for resolution (using cache mostly)
    const { data: drivers } = useQuery({
        queryKey: ['drivers'],
        queryFn: driversService.getAll,
        staleTime: 1000 * 60 * 5 // 5 min cache
    });

    const { data: vehicles } = useQuery({
        queryKey: ['vehicles'],
        queryFn: vehiclesService.getAll,
        staleTime: 1000 * 60 * 5 // 5 min cache
    });

    if (!data || Object.keys(data).length === 0) {
        return (
            <div className={className}>
                {label && <div className={styles.diffHeader}>{label}</div>}
                <div style={{ padding: '1rem', opacity: 0.5 }}>Nenhum dado</div>
            </div>
        );
    }

    const resolveValue = (key: string, value: any) => {
        if (value === null || value === undefined) return <span style={{ opacity: 0.3 }}>Vazio</span>;

        // Resolve Shifts (Optional: if we had shifts cache, but usually shift ID is not enough to get friendly name without request)
        if (key === 'shiftId') {
            // For now, just show ID but label it nicely. Could verify if we have robust shift cache.
            // If we knew the driver of the shift, we could show "Turno de [Motorista]"
            return <span title={String(value)} style={{ fontFamily: 'monospace' }}>{String(value).substring(0, 8)}...</span>;
        }

        // Resolve Driver
        if (key === 'driverId' && drivers) {
            const driver = drivers.find(d => d.id === value);
            return driver ? <strong>{driver.nome}</strong> : <span style={{ fontFamily: 'monospace' }}>{value}</span>;
        }

        // Resolve Vehicle
        if (key === 'vehicleId' && vehicles) {
            const vehicle = vehicles.find(v => v.id === value);
            return vehicle ? <strong>{vehicle.plate} - {vehicle.modelo}</strong> : <span style={{ fontFamily: 'monospace' }}>{value}</span>;
        }

        // Format Money
        if (key === 'value' || key === 'valor') {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value));
        }

        // Format Date
        if (typeof value === 'string' && (value.includes('T') && value.includes('Z') || key.toLowerCase().includes('date') || key === 'hora' || key === 'start' || key === 'end')) {
            try {
                return new Date(value).toLocaleString('pt-BR');
            } catch {
                return value;
            }
        }

        // Booleans
        if (typeof value === 'boolean') {
            return value ? 'Sim' : 'Não';
        }

        return String(value);
    };

    return (
        <div className={className}>
            {label && <div className={styles.diffHeader}>{label}</div>}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <tbody>
                    {Object.entries(data).map(([key, value]) => {
                        // Skip internal fields if needed
                        if (key === 'password') return null;

                        return (
                            <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <td style={{ padding: '4px 8px', color: '#a0a0a0', width: '140px' }}>
                                    {FIELD_LABELS[key] || key}
                                </td>
                                <td style={{ padding: '4px 8px', color: '#e0e0e0' }}>
                                    {resolveValue(key, value)}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default AuditPayloadViewer;
