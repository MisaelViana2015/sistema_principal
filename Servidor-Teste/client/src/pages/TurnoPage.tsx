import { useState } from "react";
import MainLayout from "../components/MainLayout";
import { Star, Car, CheckCircle2, RotateCcw } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

type PeriodType = "dia" | "semana" | "mes" | "ano" | "total";

const mockVehicles = [
    { id: "1", plate: "TQQ8A07", modelo: "Delphi Mini Azul", isFavorite: true, inUse: false },
    { id: "2", plate: "TQQ8725", modelo: "MAVERICK", isFavorite: false, inUse: false },
    { id: "3", plate: "TQU8H17", modelo: "Delphi Mini BR", isFavorite: false, inUse: true },
    { id: "4", plate: "TQQ8A94", modelo: "Delphi Mini PT", isFavorite: false, inUse: false },
    { id: "5", plate: "TQ54C38", modelo: "Delphi Mini BR", isFavorite: false, inUse: false },
];

export default function TurnoPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
    const [kmInicial, setKmInicial] = useState<string>("");

    const favoriteVehicle = mockVehicles.find((v) => v.isFavorite);

    const card = {
        backgroundColor: isDark ? '#1f2937' : '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        padding: '1.5rem',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        marginBottom: '1.5rem'
    };

    const title = {
        fontSize: '1.25rem',
        fontWeight: 'bold',
        marginBottom: '1rem',
        color: isDark ? '#fff' : '#111827',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    };

    const label = {
        fontSize: '1rem',
        fontWeight: '600',
        marginBottom: '0.75rem',
        color: isDark ? '#fff' : '#111827'
    };

    const vehicleButton = (isSelected: boolean, inUse: boolean) => ({
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '1rem',
        borderRadius: '0.5rem',
        border: isSelected ? '4px solid #3b82f6' : `2px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        backgroundColor: isSelected ? (isDark ? '#1e3a8a' : '#eff6ff') : (isDark ? '#1f2937' : '#fff'),
        cursor: inUse ? 'not-allowed' : 'pointer',
        opacity: inUse ? 0.5 : 1,
        marginBottom: '0.75rem',
        transition: 'all 0.2s'
    });

    const input = {
        width: '100%',
        padding: '0.75rem',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        border: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        borderRadius: '0.5rem',
        fontFamily: 'monospace',
        backgroundColor: isDark ? '#1f2937' : '#fff',
        color: isDark ? '#fff' : '#111827'
    };

    const button = (color: string) => ({
        width: '100%',
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#fff',
        backgroundColor: color,
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        marginTop: '1rem'
    });

    return (
        <MainLayout>
            <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
                {favoriteVehicle && (
                    <div style={card}>
                        <h2 style={title}>
                            <Star style={{ width: '20px', height: '20px', fill: '#eab308', color: '#eab308' }} />
                            Veículo Favorito
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: isDark ? '#374151' : '#f9fafb', borderRadius: '0.5rem' }}>
                            <Car style={{ width: '32px', height: '32px', color: '#6b7280' }} />
                            <div>
                                <div style={{ fontFamily: 'monospace', fontSize: '1.125rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' }}>
                                    {favoriteVehicle.plate}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    {favoriteVehicle.modelo}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div style={card}>
                    <h2 style={title}>Iniciar Turno</h2>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                        Selecione o veículo e informe o KM inicial
                    </p>

                    <div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={label}>
                                Veículo <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <div>
                                {mockVehicles.map((vehicle) => (
                                    <button
                                        key={vehicle.id}
                                        type="button"
                                        onClick={() => !vehicle.inUse && setSelectedVehicleId(vehicle.id)}
                                        disabled={vehicle.inUse}
                                        style={vehicleButton(selectedVehicleId === vehicle.id, vehicle.inUse)}
                                    >
                                        {vehicle.isFavorite && (
                                            <Star style={{ width: '20px', height: '20px', fill: '#eab308', color: '#eab308' }} />
                                        )}
                                        <Car style={{ width: '24px', height: '24px', color: '#6b7280' }} />
                                        <div style={{ flex: 1, textAlign: 'left' }}>
                                            <div style={{ fontFamily: 'monospace', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' }}>
                                                {vehicle.plate}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                                {vehicle.modelo}
                                            </div>
                                            {vehicle.inUse && (
                                                <div style={{ fontSize: '0.75rem', color: '#dc2626', marginTop: '0.25rem' }}>
                                                    Em uso
                                                </div>
                                            )}
                                        </div>
                                        {selectedVehicleId === vehicle.id && (
                                            <CheckCircle2 style={{ width: '28px', height: '28px', color: '#3b82f6' }} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={label}>
                                KM Inicial <span style={{ color: '#dc2626' }}>*</span>
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                placeholder="Digite o KM inicial"
                                value={kmInicial}
                                onChange={(e) => setKmInicial(e.target.value)}
                                style={input}
                            />
                        </div>

                        <button type="button" style={button('#16a34a')}>
                            Iniciar Turno
                        </button>
                    </div>
                </div>

                <div style={card}>
                    <h2 style={title}>
                        <RotateCcw style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
                        Reabrir Último Turno
                    </h2>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                        Fechou sem querer? Reabra o último turno encerrado
                    </p>
                    <button type="button" style={button('#dc2626')}>
                        Reabrir Último Turno
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}
