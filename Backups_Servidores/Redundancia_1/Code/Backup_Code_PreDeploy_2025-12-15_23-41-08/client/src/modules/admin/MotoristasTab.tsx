import { useState } from "react";
import { Plus } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * MOTORISTAS TAB
 * Design EXATO das imagens fornecidas
 */

interface Driver {
    id: number;
    nome: string;
    email: string;
}

const mockDrivers: Driver[] = [
    { id: 1, nome: "Misael", email: "programacao1215@hotmail.com" },
    { id: 2, nome: "zezu brocha", email: "zezus@gmail.com" },
    { id: 3, nome: "Robson", email: "robson@frota.com" },
    { id: 4, nome: "Luan", email: "luan@frota.com" },
    { id: 5, nome: "Gustavo", email: "gustavo@frota.com" },
    { id: 6, nome: "Felipe", email: "felipe@rotaverde.com" }
];

export default function MotoristasTab() {
    const [drivers] = useState<Driver[]>(mockDrivers);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const styles = {
        container: {
            width: '100%',
            padding: '0'
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
        },
        title: {
            fontSize: '1.125rem',
            fontWeight: '600',
            color: isDark ? '#ffffff' : '#1f2937',
            margin: 0
        },
        newButton: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#10b981',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        } as React.CSSProperties,
        cardsList: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '0.5rem'
        },
        card: (index: number) => ({
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderRadius: '0.5rem',
            backgroundColor: getCardBackground(index, isDark),
            width: '100%'
        }),
        driverInfo: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '0.25rem'
        },
        driverName: {
            fontSize: '0.9375rem',
            fontWeight: '600',
            color: isDark ? '#ffffff' : '#1f2937',
            margin: 0
        },
        driverEmail: {
            fontSize: '0.8125rem',
            color: isDark ? '#d1d5db' : '#4b5563',
            margin: 0
        },
        editButton: {
            padding: '0.375rem 1rem',
            backgroundColor: 'transparent',
            color: isDark ? '#ffffff' : '#4f46e5',
            border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.3)' : '#4f46e5'}`,
            borderRadius: '0.25rem',
            fontSize: '0.8125rem',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.15s'
        } as React.CSSProperties
    };

    function getCardBackground(index: number, dark: boolean): string {
        const isEven = index % 2 === 0;

        if (dark) {
            // Dark mode: verde escuro / azul escuro
            return isEven ? '#065f46' : '#1e3a5f';
        } else {
            // Light mode: verde claro / branco
            return isEven ? '#86efac' : '#ffffff';
        }
    }

    const handleNewDriver = () => {
        console.log('Novo motorista');
    };

    const handleEditDriver = (driver: Driver) => {
        console.log('Editar motorista:', driver);
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h2 style={styles.title}>Gestão de Motoristas</h2>
                <button
                    style={styles.newButton}
                    onClick={handleNewDriver}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#059669';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#10b981';
                    }}
                >
                    <Plus size={16} />
                    Novo Motorista
                </button>
            </div>

            {/* Lista de Motoristas */}
            <div style={styles.cardsList}>
                {drivers.map((driver, index) => (
                    <div key={driver.id} style={styles.card(index)}>
                        <div style={styles.driverInfo}>
                            <p style={styles.driverName}>{driver.nome}</p>
                            <p style={styles.driverEmail}>{driver.email}</p>
                        </div>

                        <button
                            style={styles.editButton}
                            onClick={() => handleEditDriver(driver)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(79, 70, 229, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            Editar
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
