import { format as dateFnsFormat } from "date-fns";
import { ptBR } from "date-fns/locale";

// Formata moeda em BRL
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

// Formata data e hora no formato 24h pt-BR (America/Sao_Paulo)
export function formatDateTime(date: string | Date): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

// Formata apenas hora no formato 24h (America/Sao_Paulo)
export function formatTime(date: string | Date): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

// Formata apenas data (America/Sao_Paulo)
export function formatDate(date: string | Date): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(d);
}

// Formata KM com separador de milhares
export function formatKm(km: number | null | undefined): string {
  if (km === null || km === undefined) return "0 km";
  return `${new Intl.NumberFormat("pt-BR").format(km)} km`;
}

// Formata duração em minutos para "Xh Ymin"
export function formatDuration(minutes: number | null | undefined): string {
  if (!minutes) return "0 min";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

// Arredonda para 2 casas decimais
export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Formata placa de veículo (uppercase)
export function formatPlate(plate: string): string {
  return plate.toUpperCase();
}

/**
 * Formata um timestamp (em string) para versão legível
 * Exemplo: "1762578795129" -> "08/11/2025 02:10"
 */
export function formatVersion(timestampStr: string): string {
  try {
    const timestamp = parseInt(timestampStr, 10);
    const date = new Date(timestamp);
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (error) {
    return timestampStr; // Fallback para o valor original
  }
}
