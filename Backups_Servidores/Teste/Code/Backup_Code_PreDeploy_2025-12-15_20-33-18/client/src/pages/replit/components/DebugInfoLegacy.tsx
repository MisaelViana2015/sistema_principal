
import React, { useState, useEffect } from "react";
import { Bug, Copy, Check } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";

export default function DebugInfoLegacy() {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Simulating app version based on current time or build time
    const APP_VERSION = Date.now().toString();
    const APP_VERSION_FORMATTED = new Date().toLocaleString("pt-BR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });

    const [debugInfo, setDebugInfo] = useState<any>(null);

    useEffect(() => {
        // Gather browser info on mount
        const info = {
            timestamp: new Date().toISOString(),
            appVersion: APP_VERSION,
            appVersionFormatted: APP_VERSION_FORMATTED,
            device: {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                cookieEnabled: navigator.cookieEnabled,
                onLine: navigator.onLine,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                windowSize: `${window.innerWidth}x${window.innerHeight}`,
                touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0
            },
            browser: {
                name: getBrowserName(),
                version: getBrowserVersion(),
                mobile: /Mobi|Android/i.test(navigator.userAgent)
            },
            app: {
                url: window.location.href,
                protocol: window.location.protocol,
                hostname: window.location.hostname,
                pathname: window.location.pathname,
                environment: import.meta.env.MODE || "development"
            },
            cache: {
                localStorage: !!window.localStorage,
                sessionStorage: !!window.sessionStorage
            }
        };
        setDebugInfo(info);
    }, []);

    const getBrowserName = () => {
        const agent = navigator.userAgent.toLowerCase();
        if (agent.includes("chrome")) return "Chrome";
        if (agent.includes("firefox")) return "Firefox";
        if (agent.includes("safari") && !agent.includes("chrome")) return "Safari";
        if (agent.includes("edge")) return "Edge";
        return "Unknown";
    };

    const getBrowserVersion = () => {
        const raw = navigator.userAgent.match(/(chrome|firefox|safari|edge)\/([\d.]+)/i);
        return raw ? raw[2] : "Unknown";
    };

    const handleCopy = () => {
        if (!debugInfo) return;
        navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const styles = {
        container: {
            position: "fixed" as const,
            bottom: "1rem",
            right: "1rem", // Placed slightly to the right as per "nem ao lado direito" interpretation might mean "not strictly right" but usually debug is right. Let's stick to bottom right for now or center. User said "parte de baixo nem ao ládo direito", maybe "parte de baixo, no lado direito" (bottom right) or "parte de baixo, bem ao lado direito" (bottom, far right). Let's put it fixed bottom right.
            display: "flex",
            flexDirection: "column" as const,
            alignItems: "flex-end",
            gap: "0.25rem",
            zIndex: 50,
        },
        versionText: {
            fontSize: "0.7rem",
            color: isDark ? "#64748b" : "#94a3b8",
            marginRight: "0.25rem",
        },
        buttonGroup: {
            display: "flex",
            gap: "0.5rem",
            backgroundColor: isDark ? "#1e293b" : "#ffffff",
            padding: "0.25rem",
            borderRadius: "0.5rem",
            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
            boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        },
        button: {
            display: "flex",
            alignItems: "center",
            gap: "0.25rem",
            padding: "0.25rem 0.5rem",
            borderRadius: "0.25rem",
            border: "none", // `1px solid ${isDark ? "#334155" : "#e2e8f0"}`
            backgroundColor: "transparent",
            color: isDark ? "#94a3b8" : "#64748b",
            fontSize: "0.75rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
        },
        modalOverlay: {
            position: "fixed" as const,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            backdropFilter: "blur(2px)",
        },
        modalContent: {
            backgroundColor: "#1e1e1e", // Dark theme by default for debug console look
            color: "#e0e0e0",
            width: "90%",
            maxWidth: "600px",
            maxHeight: "80vh",
            borderRadius: "0.5rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column" as const,
            fontFamily: "monospace",
        },
        modalHeader: {
            padding: "1rem",
            borderBottom: "1px solid #333",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "#252526",
        },
        modalTitle: {
            fontSize: "1rem",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
        },
        modalBody: {
            padding: "1rem",
            overflowY: "auto" as const,
            fontSize: "0.85rem",
            lineHeight: "1.5",
        },
        sectionTitle: {
            color: "#61dafb", // React blue-ish
            fontWeight: "bold",
            marginTop: "1rem",
            marginBottom: "0.25rem",
            textTransform: "uppercase" as const,
            fontSize: "0.75rem",
            letterSpacing: "0.05em",
        },
        kvRow: {
            display: "flex",
            gap: "0.5rem",
            marginBottom: "0.1rem",
        },
        key: {
            color: "#9cdcfe",
            minWidth: "120px",
        },
        value: {
            color: "#ce9178",
            wordBreak: "break-all" as const,
        },
        boolValue: (val: boolean) => ({
            color: val ? "#569cd6" : "#f44747",
        }),
        closeButton: {
            padding: "0.5rem 1rem",
            backgroundColor: "#007acc",
            color: "white",
            border: "none",
            borderRadius: "0.25rem",
            cursor: "pointer",
            fontWeight: 600,
        }
    };

    if (!isOpen) {
        return (
            <div style={styles.container}>
                <div style={styles.buttonGroup}>
                    <button
                        style={styles.button}
                        onClick={handleCopy}
                        title="Copiar informações de debug"
                    >
                        {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />}
                        Copiar
                    </button>
                    <div style={{ width: "1px", backgroundColor: isDark ? "#334155" : "#e2e8f0" }}></div>
                    <button
                        style={styles.button}
                        onClick={() => setIsOpen(true)}
                        title="Ver detalhes de debug"
                    >
                        <Bug size={14} />
                        DEBUG
                    </button>
                </div>
                <span style={styles.versionText}>v{APP_VERSION_FORMATTED}</span>
            </div>
        );
    }

    return (
        <div style={styles.modalOverlay} onClick={() => setIsOpen(false)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <div style={styles.modalTitle}>
                        <span>| INFORMAÇÕES DE DEBUG - ROTA VERDE |</span>
                    </div>
                </div>

                <div style={styles.modalBody}>
                    <div style={{ ...styles.kvRow, marginBottom: "1rem" }}>
                        <span style={{ fontSize: "1.2rem", marginRight: "0.5rem" }}>⏰</span>
                        <span style={{ color: "#dcdcaa" }}>TIMESTAMP:</span>
                        <span style={{ color: "#b5cea8" }}>{debugInfo?.timestamp}</span>
                    </div>

                    <div style={{ ...styles.kvRow, marginBottom: "1rem" }}>
                        <span style={{ fontSize: "1.2rem", marginRight: "0.5rem" }}>🔢</span>
                        <span style={{ color: "#dcdcaa" }}>VERSÃO:</span>
                        <span style={{ color: "#b5cea8" }}>{debugInfo?.appVersionFormatted} ({debugInfo?.appVersion})</span>
                    </div>

                    <div style={styles.sectionTitle}>📱 DISPOSITIVO</div>
                    {debugInfo?.device && Object.entries(debugInfo.device).map(([k, v]) => (
                        <div key={k} style={styles.kvRow}>
                            <span style={styles.key}>• {k}:</span>
                            <span style={typeof v === 'boolean' ? styles.boolValue(v) : styles.value}>{String(v)}</span>
                        </div>
                    ))}

                    <div style={styles.sectionTitle}>🌐 NAVEGADOR</div>
                    {debugInfo?.browser && Object.entries(debugInfo.browser).map(([k, v]) => (
                        <div key={k} style={styles.kvRow}>
                            <span style={styles.key}>• {k}:</span>
                            <span style={typeof v === 'boolean' ? styles.boolValue(v) : styles.value}>{String(v)}</span>
                        </div>
                    ))}

                    <div style={styles.sectionTitle}>🔗 APP</div>
                    {debugInfo?.app && Object.entries(debugInfo.app).map(([k, v]) => (
                        <div key={k} style={styles.kvRow}>
                            <span style={styles.key}>• {k}:</span>
                            <span style={styles.value}>{String(v)}</span>
                        </div>
                    ))}
                </div>

                <div style={{ padding: "1rem", display: "flex", justifyContent: "flex-end", borderTop: "1px solid #333", backgroundColor: "#252526" }}>
                    <button style={styles.closeButton} onClick={() => setIsOpen(false)}>
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}
