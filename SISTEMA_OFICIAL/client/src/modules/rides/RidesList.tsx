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
import { EditRideModal } from "./EditRideModal";
import { Loader2, Edit, Trash2 } from "lucide-react";

interface RidesListProps {
    shiftId?: string;
    maxHeight?: string;
}

export function RidesList({ shiftId: propShiftId, maxHeight = "max-h-[40vh] md:max-h-[60vh]" }: RidesListProps) {
    // ... state ...

    // ... useEffects ...

    // ... load functions ...

    // ... handlers ...

    // ... formatCurrency ...

    return (
        <div className="space-y-4">
            {/* ... title ... */}

            {/* ... filters ... */}

            {/* Table */}
            <div className={`rounded-md border ${maxHeight} overflow-y-auto custom-scrollbar`}>
                <div className="overflow-x-auto min-w-full">
                    <Table className="min-w-[600px] w-full">
                        <TableHeader className="bg-gray-900 hover:bg-gray-900 sticky top-0 z-10 shadow-sm">
                            <TableRow className="border-gray-800 hover:bg-gray-900">
                                <TableHead className="text-gray-400 w-[140px]">Data/Hora</TableHead>
                                <TableHead className="text-gray-400">Motorista</TableHead>
                                <TableHead className="text-gray-400 hidden md:table-cell">Placa</TableHead>
                                <TableHead className="text-gray-400 w-[100px]">Tipo</TableHead>
                                <TableHead className="text-gray-400 text-right w-[120px]">Valor</TableHead>
                                <TableHead className="text-gray-400 text-right w-[100px]">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                                            <span>Carregando corridas...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : rides.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-32 text-center text-gray-400">
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
                                        <TableCell className="text-gray-300 hidden md:table-cell">
                                            {ride.vehiclePlate || '-'}
                                        </TableCell>
                                        <TableCell className="text-gray-300">
                                            <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${['APP', 'APLICATIVO'].includes(ride.tipo?.toUpperCase() || '')
                                                ? 'bg-blue-500/20 text-blue-400'
                                                : 'bg-emerald-500/20 text-emerald-400'
                                                }`}>
                                                {ride.tipo}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right text-emerald-400 font-bold">
                                            {formatCurrency(ride.valor)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 h-8 w-8 p-0"
                                                    onClick={() => {
                                                        setSelectedRide(ride);
                                                        setIsEditModalOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-red-900/20 border-red-900/50 text-red-400 hover:bg-red-900/40 hover:text-red-300 h-8 w-8 p-0"
                                                    onClick={() => handleDelete(ride)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 pb-2">
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

            <EditRideModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                ride={selectedRide}
                onSave={handleEditSave}
            />
        </div>
    );
}
