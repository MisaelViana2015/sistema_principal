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

    const [tempPasswordData, setTempPasswordData] = useState<{ password: string, driverName: string } | null>(null);

    async function handleResetPassword(driver: Driver) {
        if (!confirm(`Resetar senha de ${driver.nome}? Uma senha temporária será gerada.`)) return;
        try {
            const result = await driversService.resetPassword(driver.id);
            setTempPasswordData({ password: result.temp_password, driverName: driver.nome });
        } catch (err) {
            console.error(err);
            alert("Erro ao resetar senha");
        }
    }

    function handleCopyPassword() {
        if (tempPasswordData) {
            navigator.clipboard.writeText(tempPasswordData.password);
            // Optional: show toast or brief feedback
            alert("Senha copiada! Envie para o motorista.");
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

    const [showInactive, setShowInactive] = useState(false);

    // Filter drivers based on showInactive state
    const filteredDrivers = drivers.filter(d => showInactive || d.isActive);

    return (
        <>
            <div style={s.container}>
                <div style={s.header}>
                    <h2 style={s.title}>Gestão de Motoristas</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowInactive(!showInactive)}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors border ${showInactive
                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600'
                                    : 'bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                }`}
                        >
                            {showInactive ? 'Ocultar Inativos' : 'Mostrar Inativos'}
                        </button>
                        <button style={s.addButton} onClick={handleNew}>
                            <Plus size={16} />
                            Novo Motorista
                        </button>
                    </div>
                </div>

                <div style={s.list}>
                    {filteredDrivers.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            {drivers.length > 0 && !showInactive
                                ? "Nenhum motorista ativo encontrado. Clique em 'Mostrar Inativos' para ver todos."
                                : "Nenhum motorista encontrado."}
                        </div>
                    )}

                    {filteredDrivers.map((driver, index) => (
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

            {/* Temp Password Modal */}
            {tempPasswordData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-2xl max-w-md w-full border border-green-500/50">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <KeyRound className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                Senha Gerada com Sucesso!
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Para o motorista <strong>{tempPasswordData.driverName}</strong>
                            </p>
                        </div>

                        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mb-6 text-center border border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Senha Temporária</div>
                            <div className="text-2xl font-mono font-bold text-green-600 dark:text-green-400 tracking-wider">
                                {tempPasswordData.password}
                            </div>
                            <div className="text-xs text-gray-400 mt-2">Válida por 10 minutos</div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setTempPasswordData(null)}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Fechar
                            </button>
                            <button
                                onClick={handleCopyPassword}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                Copiar Senha
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
