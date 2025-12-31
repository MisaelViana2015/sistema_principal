import { useEffect, useState } from "react";
import { driversService } from "./drivers.service";
import { Driver } from "../../../../shared/schema";
import { Plus, KeyRound } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { DriverModal } from "./DriverModal";

export default function DriversList() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        loadDrivers();
    }, []);

    async function loadDrivers() {
        try {
            const data = await driversService.getAll();
            setDrivers(data);
        } catch (err) {
            console.error(err);
            setError("Erro ao carregar motoristas.");
        } finally {
            setIsLoading(false);
        }
    }


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | undefined>(undefined);

    function handleNew() {
        setSelectedDriver(undefined);
        setIsModalOpen(true);
    }

    function handleEdit(driver: Driver) {
        setSelectedDriver(driver);
        setIsModalOpen(true);
    }

    async function handleSave(data: any) {
        if (selectedDriver) {
            await driversService.update(selectedDriver.id, data);
        } else {
            await driversService.create(data);
        }
        await loadDrivers();
    }

    async function handleToggleActive(driver: Driver) {
        if (!confirm(`Tem certeza que deseja ${driver.isActive ? 'INATIVAR' : 'ATIVAR'} este motorista?`)) return;
        try {
            await driversService.update(driver.id, { isActive: !driver.isActive });
            await loadDrivers();
        } catch (err) {
            console.error(err);
            alert("Erro ao alterar status do motorista");
        }
    }

    async function handleResetPassword(driver: Driver) {
        if (!confirm(`Resetar senha de ${driver.nome}? Uma senha temporária será gerada.`)) return;
        try {
            const result = await driversService.resetPassword(driver.id);
            alert(`Senha temporária: ${result.temp_password}\n\nVálida por 10 minutos.\nEnvie para o motorista via WhatsApp.`);
        } catch (err) {
            console.error(err);
            alert("Erro ao resetar senha");
        }
    }

    const s = {
        container: { maxWidth: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column' as const, gap: '1rem' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' },
        title: { fontSize: '1.25rem', fontWeight: 'bold', color: isDark ? '#fff' : '#111827' },
        addButton: {
            padding: '0.5rem 1rem',
            backgroundColor: '#22c55e', // Green-500
            color: '#fff',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem'
        },
        list: {
            display: 'flex',
            flexDirection: 'column' as const,
            gap: '0.5rem'
        },
        card: (index: number, isActive: boolean) => {
            const isEven = index % 2 === 0;
            let bg;
            if (isDark) {
                bg = isEven ? 'rgba(34, 197, 94, 0.15)' : 'transparent';
                if (!isActive) bg = 'rgba(239, 68, 68, 0.1)'; // Red tint for inactive
            } else {
                bg = isEven ? '#dcfce7' : '#ffffff';
                if (!isActive) bg = '#fee2e2'; // Light red for inactive
            }
            return {
                backgroundColor: bg,
                borderRadius: '0.5rem',
                padding: '1rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: isActive ? 1 : 0.7,
            };
        },
        name: { fontWeight: 'bold', color: isDark ? '#fff' : '#000', marginBottom: '0.25rem' },
        email: { color: isDark ? '#9ca3af' : '#4b5563', fontSize: '0.875rem' },
        actions: { display: 'flex', gap: '0.5rem' },
        editBtn: {
            padding: '0.25rem 0.75rem',
            backgroundColor: isDark ? '#374151' : '#f3f4f6',
            border: `1px solid ${isDark ? '#4b5563' : '#e5e7eb'}`,
            borderRadius: '0.375rem',
            color: isDark ? '#e5e7eb' : '#374151',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer'
        },
        toggleBtn: (isActive: boolean) => ({
            padding: '0.25rem 0.75rem',
            backgroundColor: isActive ? (isDark ? '#7f1d1d' : '#fee2e2') : (isDark ? '#14532d' : '#dcfce7'),
            border: `1px solid ${isActive ? '#ef4444' : '#22c55e'}`,
            borderRadius: '0.375rem',
            color: isActive ? '#ef4444' : '#16a34a',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer'
        }),
        resetBtn: {
            padding: '0.25rem 0.75rem',
            backgroundColor: isDark ? '#1e3a5f' : '#dbeafe',
            border: '1px solid #3b82f6',
            borderRadius: '0.375rem',
            color: '#3b82f6',
            fontSize: '0.75rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
        }
    };

    return (
        <>
            <div style={s.container}>
                <div style={s.header}>
                    <h2 style={s.title}>Gestão de Motoristas</h2>
                    <button style={s.addButton} onClick={handleNew}>
                        <Plus size={16} />
                        Novo Motorista
                    </button>
                </div>

                <div style={s.list}>
                    {drivers.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            Nenhum motorista encontrado.
                        </div>
                    )}

                    {drivers.map((driver, index) => (
                        <div key={driver.id} style={s.card(index, driver.isActive ?? true)}>
                            <div>
                                <div style={s.name}>
                                    {driver.nome} {driver.role === 'admin' && '🛡️'}
                                    {!driver.isActive && <span className="ml-2 text-xs text-red-500">(Inativo)</span>}
                                </div>
                                <div style={s.email}>{driver.email}</div>
                            </div>
                            <div style={s.actions}>
                                <button
                                    style={s.toggleBtn(driver.isActive ?? true)}
                                    onClick={() => handleToggleActive(driver)}
                                >
                                    {driver.isActive ? 'Inativar' : 'Ativar'}
                                </button>
                                <button style={s.editBtn} onClick={() => handleEdit(driver)}>
                                    Editar
                                </button>
                                <button style={s.resetBtn} onClick={() => handleResetPassword(driver)}>
                                    <KeyRound size={12} />
                                    Resetar Senha
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <DriverModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                driver={selectedDriver}
            />
        </>
    );
}
