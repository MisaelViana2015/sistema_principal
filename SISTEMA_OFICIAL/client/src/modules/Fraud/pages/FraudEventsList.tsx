import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Filter, Search, ArrowLeft, ShieldCheck } from 'lucide-react';

interface FraudEvent {
    id: string;
    status: string;
    riskScore: number;
    riskLevel: string;
    detectedAt: string;
    shiftId: string;
    driverId: string;
    rules: { label: string }[];
}

export interface FraudEventsListProps {
    onSelectEvent?: (id: string) => void;
}

const FraudEventsList: React.FC<FraudEventsListProps> = ({ onSelectEvent } = {}) => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: events, isLoading } = useQuery({
        queryKey: ['fraud-events-list', page, statusFilter],
        queryFn: async () => {
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', '20');
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const res = await api.get('/fraud/events', { params });
            // API now returns { data, total, page, limit }
            return res.data;
        },
        placeholderData: (previousData) => previousData
    });

    const handleDetailClick = (id: string) => {
        if (onSelectEvent) {
            onSelectEvent(id);
        } else {
            navigate(`/fraude/evento/${id}`);
        }
    };

    // ... inside map ...

    // (Omitted unchanged parts, targeting the return JSX map)
    <td className="p-3 text-right">
        <Button size="sm" variant="ghost" onClick={() => handleDetailClick(event.id)}>
            Detalhes
        </Button>
    </td>
                                        </tr >
                                    ))
                                )}
                            </tbody >
                        </table >
                    </div >
                </CardContent >
            </Card >
        </div >
    );
};

export default FraudEventsList;
