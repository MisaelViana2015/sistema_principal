import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../components/ui/select";
import { driversService } from "../drivers/drivers.service";
import { Driver } from "../../../../shared/schema";
import { ridesService, RideWithDetails } from "./rides.service";
import { Loader2 } from "lucide-react";

export function RidesList() {
    const [rides, setRides] = useState<RideWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [drivers, setDrivers] = useState<Driver[]>([]);

    // Filters
    const [driverId, setDriverId] = useState<string>("todos");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const LIMIT = 10;

    useEffect(() => {
        loadDrivers();
    }, []);

    useEffect(() => {
        loadRides();
    }, [page, driverId, startDate, endDate]);

    const loadDrivers = async () => {
        try {
            const data = await driversService.getAll();
            setDrivers(data);
        } catch (error) {
            console.error("Erro ao carregar motoristas:", error);
        }
    };

    const loadRides = async () => {
        setLoading(true);
        try {
            const data = await ridesService.getAll({
                page,
                limit: LIMIT,
                driverId: driverId !== "todos" ? driverId : undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
            setRides(data.data);
            setTotalPages(data.pagination.totalPages);
            setTotalItems(data.pagination.totalItems);
        } catch (error) {
            console.error("Erro ao carregar corridas:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number | string) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(Number(value));
    };

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-bold text-white mb-4">Gestão de Corridas</h1>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-1 block">Motorista</label>
                    <Select value={driverId} onValueChange={setDriverId}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-200">
                            <SelectValue placeholder="Todos" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                            <SelectItem value="todos">Todos</SelectItem>
                            {drivers.map((driver) => (
                                <SelectItem key={driver.id} value={String(driver.id)}>
                                    {driver.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-1 block">Data Inicial</label>
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-gray-200"
                    />
                </div>

                <div className="flex-1">
                    <label className="text-sm text-gray-400 mb-1 block">Data Final</label>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-gray-200"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-900/50 rounded-lg border border-gray-800 overflow-hidden">
                <Table>
                    <TableHeader className="bg-gray-900 hover:bg-gray-900">
                        <TableRow className="border-gray-800 hover:bg-gray-900">
                            <TableHead className="text-gray-400">Data/Hora</TableHead>
                            <TableHead className="text-gray-400">Motorista</TableHead>
                            <TableHead className="text-gray-400">Placa</TableHead>
                            <TableHead className="text-gray-400">Tipo</TableHead>
                            <TableHead className="text-gray-400 text-right">Valor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-gray-400">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                        <span>Carregando corridas...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : rides.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="h-32 text-center text-gray-400">
                                    Nenhuma corrida encontrada
                                </TableCell>
                            </TableRow>
                        ) : (
                            rides.map((ride) => (
                                <TableRow key={ride.id} className="border-gray-800 hover:bg-gray-800/50">
                                    <TableCell className="text-gray-300 font-medium">
                                        {new Date(ride.hora).toLocaleString("pt-BR", {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                        {ride.driverName || '-'}
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                        {ride.vehiclePlate || '-'}
                                    </TableCell>
                                    <TableCell className="text-gray-300">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${ride.tipo === 'APP'
                                            ? 'bg-blue-500/20 text-blue-400'
                                            : 'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                            {ride.tipo}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right text-emerald-400 font-bold">
                                        {formatCurrency(ride.valor)}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-400">
                    Total: {totalItems} corridas
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1 || loading}
                        className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    >
                        Anterior
                    </Button>
                    <span className="flex items-center px-4 text-gray-400 text-sm">
                        Página {page} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages || loading}
                        className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    >
                        Próximo
                    </Button>
                </div>
            </div>
        </div>
    );
}
