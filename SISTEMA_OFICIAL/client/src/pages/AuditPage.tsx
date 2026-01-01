import { useState, useEffect } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { api } from "../lib/api";
import styles from "../modules/audit/styles/AuditPage.module.css";
import { Shield, RefreshCw } from "lucide-react";

// Interfaces
interface AuditLog {
    id: string;
    actorType: 'user' | 'admin' | 'system' | 'ai';
    actorId: string | null;
    actorRole: string | null;
    action: string;
    entity: string;
    entityId: string | null;
    source: string;
    requestId: string | null;
    ip: string | null;
    userAgent: string | null;
    meta: Record<string, any>;
    createdAt: string;
}

interface EntityHistoryRecord {
    id: string;
    entity: string;
    entityId: string;
    operation: string;
    beforeData: any;
    afterData: any;
    actorType: string;
    actorId: string | null;
    createdAt: string;
}

interface AuditStats {
    totalLogs: number;
    totalHistory: number;
    byEntity: { entity: string; count: number }[];
    byActor: { actorType: string; count: number }[];
}

interface FiltersState {
    entity: string;
    actorType: string;
    startDate: string;
    endDate: string;
}

const INITIAL_FILTERS: FiltersState = {
    entity: "",
    actorType: "",
    startDate: "",
    endDate: "",
};

export default function AuditPage() {
    const [filters, setFilters] = useState<FiltersState>(INITIAL_FILTERS);
    const [page, setPage] = useState(1);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [historyData, setHistoryData] = useState<EntityHistoryRecord[]>([]);

    // Queries
    const { data: stats } = useQuery<AuditStats>({
        queryKey: ["audit-stats"],
        queryFn: async () => {
            const res = await api.get("/audit/stats");
            return res.data;
        },
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const {
        data: logsData,
        isLoading,
        isError,
        refetch,
        isFetching
    } = useQuery({
        queryKey: ["audit-logs", page, filters],
        queryFn: async (): Promise<{ data: AuditLog[]; pagination: { total: number; totalPages: number; page: number; limit: number }; }> => {
            const params = new URLSearchParams();
            params.set("page", page.toString());
            params.set("limit", "25");
            if (filters.entity) params.set("entity", filters.entity);
            if (filters.actorType) params.set("actorType", filters.actorType);
            if (filters.startDate) params.set("startDate", filters.startDate);
            if (filters.endDate) params.set("endDate", filters.endDate);

            const res = await api.get<{
                data: AuditLog[];
                pagination: { total: number; totalPages: number; page: number; limit: number };
            }>(`/audit/logs?${params.toString()}`);
            return res.data;
        },
        placeholderData: keepPreviousData,
    });

    // Load History Detail
    useEffect(() => {
        if (selectedLog && selectedLog.entity && selectedLog.entityId) {
            setHistoryData([]); // Clear previous
            api.get<{ data: EntityHistoryRecord[] }>(`/audit/history/${selectedLog.entity}/${selectedLog.entityId}`)
                .then((res) => setHistoryData(res.data.data || []))
                .catch((err: any) => {
                    console.error("Failed to load history", err);
                    setHistoryData([]);
                });
        }
    }, [selectedLog]);

    // Handlers
    const handleFilterChange = (key: keyof FiltersState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page
    };

    const clearFilters = () => {
        setFilters(INITIAL_FILTERS);
        setPage(1);
    };

    const formatDate = (dateStr: string) => {
        try {
            return new Date(dateStr).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    const getActorBadgeClass = (actorType: string) => {
        switch (actorType) {
            case "admin": return styles.adminBadge;
            case "system": return styles.systemBadge;
            case "ai": return styles.aiBadge;
            default: return styles.actorBadge;
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <header className={styles.header}>
                <div className={styles.title}>
                    <Shield size={32} />
                    <h1>Central de Auditoria</h1>
                </div>
                <button
                    onClick={() => refetch()}
                    className={styles.detailsBtn}
                    disabled={isFetching}
                    title="Atualizar Logs"
                >
                    <RefreshCw size={16} className={isFetching ? "animate-spin" : ""} />
                    Atualizar
                </button>
            </header>

            {/* Stats Cards */}
            <section className={styles.statsGrid} aria-label="Estatísticas">
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {stats?.totalLogs?.toLocaleString() ?? "-"}
                    </div>
                    <div className={styles.statLabel}>Total de Logs</div>
                </div>
                <div className={styles.statCard}>
                    <div className={styles.statValue}>
                        {stats?.totalHistory?.toLocaleString() ?? "-"}
                    </div>
                    <div className={styles.statLabel}>Alterações Rastreadas</div>
                </div>
                {stats?.byEntity?.slice(0, 2).map((e) => (
                    <div key={e.entity} className={styles.statCard}>
                        <div className={styles.statValue}>{e.count.toLocaleString()}</div>
                        <div className={styles.statLabel}>Logs em {e.entity}</div>
                    </div>
                ))}
            </section>

            {/* Filters */}
            <section className={styles.filtersCard}>
                <div className={styles.filtersGrid}>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Entidade</label>
                        <select
                            className={styles.filterSelect}
                            value={filters.entity}
                            onChange={(e) => handleFilterChange("entity", e.target.value)}
                        >
                            <option value="">Todas</option>
                            <option value="shifts">Turnos</option>
                            <option value="expenses">Despesas</option>
                            <option value="rides">Corridas</option>
                            <option value="vehicles">Veículos</option>
                            <option value="drivers">Motoristas</option>
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Ator</label>
                        <select
                            className={styles.filterSelect}
                            value={filters.actorType}
                            onChange={(e) => handleFilterChange("actorType", e.target.value)}
                        >
                            <option value="">Todos</option>
                            <option value="user">Usuário</option>
                            <option value="admin">Administrador</option>
                            <option value="system">Sistema</option>
                            <option value="ai">Inteligência Artificial</option>
                        </select>
                    </div>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Início</label>
                        <input
                            type="date"
                            className={styles.filterInput}
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        />
                    </div>
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Fim</label>
                        <input
                            type="date"
                            className={styles.filterInput}
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        />
                    </div>
                    <button onClick={clearFilters} className={styles.clearFiltersBtn}>
                        Limpar Filtros
                    </button>
                </div>
            </section>

            {/* Content */}
            {isLoading ? (
                <div className={styles.loadingText}>Carregando registros de auditoria...</div>
            ) : isError ? (
                <div className={styles.errorText}>
                    ❌ Erro ao carregar logs. Verifique sua conexão ou tente novamente.
                </div>
            ) : logsData?.data?.length === 0 ? (
                <div className={styles.emptyState}>
                    📭 Nenhum registro encontrado com os filtros atuais.
                </div>
            ) : (
                <>
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>Data/Hora</th>
                                    <th className={styles.th}>Ação</th>
                                    <th className={styles.th}>Entidade</th>
                                    <th className={styles.th}>Ator</th>
                                    <th className={styles.th}>IP</th>
                                    <th className={styles.th}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logsData?.data.map((log: AuditLog) => (
                                    <tr key={log.id}>
                                        <td className={styles.td}>{formatDate(log.createdAt)}</td>
                                        <td className={styles.td}>
                                            <span className={`${styles.badge} ${styles.actionBadge}`}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={`${styles.badge} ${styles.entityBadge}`}>
                                                {log.entity}
                                            </span>
                                            {log.entityId && (
                                                <small style={{ marginLeft: "8px", opacity: 0.7 }}>
                                                    #{log.entityId.substring(0, 8)}
                                                </small>
                                            )}
                                        </td>
                                        <td className={styles.td}>
                                            <span className={`${styles.badge} ${getActorBadgeClass(log.actorType)}`}>
                                                {log.actorType}
                                            </span>
                                            {log.actorRole && (
                                                <small style={{ display: "block", marginTop: "2px", opacity: 0.7 }}>
                                                    {log.actorRole}
                                                </small>
                                            )}
                                        </td>
                                        <td className={styles.td}>
                                            <span style={{ opacity: 0.6, fontSize: "0.8rem" }}>
                                                {log.ip || "N/A"}
                                            </span>
                                        </td>
                                        <td className={styles.td}>
                                            <button
                                                className={styles.detailsBtn}
                                                onClick={() => setSelectedLog(log)}
                                                aria-label={`Ver detalhes do log ${log.id}`}
                                            >
                                                Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className={styles.pagination}>
                        <button
                            className={`${styles.paginationBtn} ${page <= 1 ? styles.paginationBtnDisabled : ""}`}
                            disabled={page <= 1}
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                            ← Anterior
                        </button>
                        <span style={{ margin: "0 1rem", fontSize: "0.9rem" }}>
                            Página {page} de {logsData?.pagination?.totalPages || 1}
                        </span>
                        <button
                            className={`${styles.paginationBtn} ${page >= (logsData?.pagination?.totalPages || 1) ? styles.paginationBtnDisabled : ""
                                }`}
                            disabled={page >= (logsData?.pagination?.totalPages || 1)}
                            onClick={() => setPage((p) => p + 1)}
                        >
                            Próxima →
                        </button>
                    </div>
                </>
            )}

            {/* Detail Modal */}
            {selectedLog && (
                <div
                    className={styles.modal}
                    onClick={() => setSelectedLog(null)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div
                        className={styles.modalContent}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 id="modal-title" className={styles.modalTitle}>
                            Detalhes do Registro
                        </h2>

                        <div className={styles.modalGrid}>
                            <div>
                                <span className={styles.modalLabel}>Ação</span>
                                <span className={`${styles.badge} ${styles.actionBadge}`}>
                                    {selectedLog.action}
                                </span>
                            </div>
                            <div>
                                <span className={styles.modalLabel}>Entidade</span>
                                <strong>{selectedLog.entity}</strong>
                                <span className={styles.codeBlock}>#{selectedLog.entityId}</span>
                            </div>
                            <div>
                                <span className={styles.modalLabel}>Ator</span>
                                <strong>{selectedLog.actorType}</strong> ({selectedLog.actorRole || "N/A"})
                                <br />
                                <small className={styles.codeBlock}>{selectedLog.actorId}</small>
                            </div>
                            <div>
                                <span className={styles.modalLabel}>Data & Hora</span>
                                <strong>{formatDate(selectedLog.createdAt)}</strong>
                            </div>
                            <div>
                                <span className={styles.modalLabel}>Origem</span>
                                <span className={styles.codeBlock}>ID: {selectedLog.requestId}</span>
                                <br />
                                <small>IP: {selectedLog.ip || "N/A"}</small>
                            </div>
                        </div>

                        {/* History Diff Viewer */}
                        {historyData.length > 0 && (
                            <div className={styles.historySection}>
                                <h3 className={styles.historyTitle}>Histórico de Alterações</h3>
                                {historyData.map((h) => (
                                    <div key={h.id} style={{ marginBottom: "2rem" }}>
                                        <div style={{ marginBottom: "0.5rem", opacity: 0.8, fontSize: "0.9rem" }}>
                                            {h.operation} &bull; {formatDate(h.createdAt)}
                                        </div>
                                        <div className={styles.diffContainer}>
                                            <div className={styles.diffPanel}>
                                                <div className={`${styles.diffHeader} ${styles.diffHeaderBefore}`}>
                                                    ANTES ({h.beforeData ? "Dados Originais" : "Vazio"})
                                                </div>
                                                <pre className={styles.jsonPre}>
                                                    {h.beforeData
                                                        ? JSON.stringify(h.beforeData, null, 2)
                                                        : <span style={{ opacity: 0.3 }}>(Nenhum dado prévio)</span>
                                                    }
                                                </pre>
                                            </div>
                                            <div className={styles.diffPanel}>
                                                <div className={`${styles.diffHeader} ${styles.diffHeaderAfter}`}>
                                                    DEPOIS ({h.afterData ? "Novos Dados" : "Removido"})
                                                </div>
                                                <pre className={styles.jsonPre}>
                                                    {h.afterData
                                                        ? JSON.stringify(h.afterData, null, 2)
                                                        : <span style={{ opacity: 0.3 }}>(Entidade removida)</span>
                                                    }
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button
                            className={styles.closeBtn}
                            onClick={() => setSelectedLog(null)}
                        >
                            Fechar Detalhes
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
