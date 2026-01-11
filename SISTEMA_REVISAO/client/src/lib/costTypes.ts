import { useMemo } from "react";
import {
  Smartphone,
  Car,
  Ticket,
  MoreHorizontal,
  DollarSign,
  Fuel,
  Wrench,
  CreditCard,
  Coffee,
  ShoppingCart,
  Utensils,
  Zap,
  Package,
  Phone,
  Wifi,
  Home,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { CostType } from "@shared/schema";

// Centralized Constants matching UI usage
export const AVAILABLE_ICONS = [
  { label: "Dinheiro", value: "dollar-sign", icon: DollarSign },
  { label: "Raio", value: "zap", icon: Zap },
  { label: "Carro", value: "car", icon: Car },
  { label: "Ticket", value: "ticket", icon: Tag }, // UI uses Tag for ticket
  { label: "Casa", value: "home", icon: Home },
  { label: "Carrinho", value: "shopping-cart", icon: ShoppingCart },
  { label: "Pacote", value: "package", icon: Package },
  { label: "WiFi", value: "wifi", icon: Wifi },
  { label: "Telefone", value: "phone", icon: Phone },
  { label: "Café", value: "coffee", icon: Users }, // UI uses Users for coffee? Preserving existing behavior.
  { label: "Celular", value: "smartphone", icon: Smartphone },
  { label: "Combustível", value: "fuel", icon: Fuel },
  { label: "Ferramenta", value: "wrench", icon: Wrench },
  { label: "Cartão", value: "credit-card", icon: CreditCard },
  { label: "Talheres", value: "utensils", icon: Utensils },
  { label: "Outros", value: "more", icon: MoreHorizontal },
];

export const AVAILABLE_COLORS = [
  { label: "Laranja", value: "orange", hex: "#f97316", bg: "#fff7ed" },
  { label: "Verde", value: "green", hex: "#22c55e", bg: "#f0fdf4" },
  { label: "Azul", value: "blue", hex: "#3b82f6", bg: "#eff6ff" },
  { label: "Roxo", value: "purple", hex: "#a855f7", bg: "#faf5ff" },
  { label: "Vermelho", value: "red", hex: "#ef4444", bg: "#fef2f2" },
  { label: "Amarelo", value: "yellow", hex: "#eab308", bg: "#fefce8" },
  { label: "Ciano", value: "cyan", hex: "#06b6d4", bg: "#ecfeff" },
  { label: "Rosa", value: "pink", hex: "#ec4899", bg: "#fdf2f8" },
  { label: "Ambar", value: "amber", hex: "#d97706", bg: "#fffbeb" },
  { label: "Teal", value: "teal", hex: "#14b8a6", bg: "#f0fdfa" },
  { label: "Indigo", value: "indigo", hex: "#6366f1", bg: "#eef2ff" },
];

/**
 * Maps icon name (string) to Lucide React component
 * Supports both legacy PascalCase names and new kebab-case values
 */
export function getIconComponent(iconName?: string): LucideIcon {
  if (!iconName) return DollarSign;

  // 1. Try finding by value (kebab-case)
  const found = AVAILABLE_ICONS.find(i => i.value === iconName);
  if (found) return found.icon;

  // 2. Fallback for legacy database values (PascalCase keys)
  const legacyMap: Record<string, LucideIcon> = {
    Smartphone, Car, Ticket, MoreHorizontal, DollarSign, Fuel, Wrench,
    CreditCard, Coffee, ShoppingCart, Utensils, Zap, Package, Phone, Wifi, Home
  };
  return legacyMap[iconName] || DollarSign;
}

/**
 * Maps colorToken to IconBadge-compatible color
 */
export function getIconBadgeColor(colorToken?: string): "blue" | "green" | "orange" | "purple" | "red" | "yellow" | "teal" | "cyan" | "indigo" | "amber" {
  const validColors = ["blue", "green", "orange", "purple", "red", "yellow", "teal", "cyan", "indigo", "amber"];
  if (validColors.includes(colorToken || "")) {
    return colorToken as any;
  }
  if (colorToken === "pink") return "purple"; // Fallback
  return "blue";
}

/**
 * Creates memoized lookup maps for shift cost types
 */
export function createShiftCostTypeMaps(costTypes: CostType[]) {
  return {
    byId: new Map(costTypes.map((t) => [t.id, t])),
    byName: new Map(costTypes.map((t) => [t.name, t])),
  };
}

export function useShiftCostTypeMaps(costTypes: CostType[]) {
  return useMemo(() => createShiftCostTypeMaps(costTypes), [costTypes]);
}

/**
 * Get badge classes for cost type
 */
export function getCostTypeBadgeClasses(colorToken?: string): string {
  const classMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    green: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
    purple: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    red: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    yellow: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    cyan: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
    pink: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
    teal: "bg-teal-100 text-teal-700 dark:bg-teal-900 dark:text-teal-300",
    indigo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  };
  return classMap[colorToken || ""] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

/**
 * Get color configuration for cost type selection
 */
export function getCostTypeColors(colorToken?: string) {
  const colorMap: Record<string, { border: string; bg: string; text: string; hover: string }> = {
    blue: { border: "border-blue-300 dark:border-blue-600", bg: "bg-white dark:bg-background", text: "text-blue-600 dark:text-blue-400", hover: "hover:bg-blue-50 dark:hover:bg-blue-950/30" },
    green: { border: "border-green-300 dark:border-green-600", bg: "bg-white dark:bg-background", text: "text-green-600 dark:text-green-400", hover: "hover:bg-green-50 dark:hover:bg-green-950/30" },
    orange: { border: "border-orange-300 dark:border-orange-600", bg: "bg-white dark:bg-background", text: "text-orange-600 dark:text-orange-400", hover: "hover:bg-orange-50 dark:hover:bg-orange-950/30" },
    purple: { border: "border-purple-300 dark:border-purple-600", bg: "bg-white dark:bg-background", text: "text-purple-600 dark:text-purple-400", hover: "hover:bg-purple-50 dark:hover:bg-purple-950/30" },
    amber: { border: "border-amber-300 dark:border-amber-600", bg: "bg-white dark:bg-background", text: "text-amber-600 dark:text-amber-400", hover: "hover:bg-amber-50 dark:hover:bg-amber-950/30" },
    red: { border: "border-red-300 dark:border-red-600", bg: "bg-white dark:bg-background", text: "text-red-600 dark:text-red-400", hover: "hover:bg-red-50 dark:hover:bg-red-950/30" },
    yellow: { border: "border-yellow-300 dark:border-yellow-600", bg: "bg-white dark:bg-background", text: "text-yellow-600 dark:text-yellow-400", hover: "hover:bg-yellow-50 dark:hover:bg-yellow-950/30" },
    cyan: { border: "border-cyan-300 dark:border-cyan-600", bg: "bg-white dark:bg-background", text: "text-cyan-600 dark:text-cyan-400", hover: "hover:bg-cyan-50 dark:hover:bg-cyan-950/30" },
    pink: { border: "border-pink-300 dark:border-pink-600", bg: "bg-white dark:bg-background", text: "text-pink-600 dark:text-pink-400", hover: "hover:bg-pink-50 dark:hover:bg-pink-950/30" },
    teal: { border: "border-teal-300 dark:border-teal-600", bg: "bg-white dark:bg-background", text: "text-teal-600 dark:text-teal-400", hover: "hover:bg-teal-50 dark:hover:bg-teal-950/30" },
    indigo: { border: "border-indigo-300 dark:border-indigo-600", bg: "bg-white dark:bg-background", text: "text-indigo-600 dark:text-indigo-400", hover: "hover:bg-indigo-50 dark:hover:bg-indigo-950/30" },
    // Fallback for missing colors (using blue)
    gray: { border: "border-gray-300 dark:border-gray-600", bg: "bg-white dark:bg-background", text: "text-gray-600 dark:text-gray-400", hover: "hover:bg-gray-50 dark:hover:bg-gray-950/30" },
  };
  return colorMap[colorToken || ""] || colorMap.gray;
}
