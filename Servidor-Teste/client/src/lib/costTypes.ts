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
  type LucideIcon,
} from "lucide-react";
import type { ShiftCostType } from "@shared/schema";

/**
 * Maps icon name (string) to Lucide React component
 */
export function getIconComponent(iconName?: string): LucideIcon {
  const iconMap: Record<string, LucideIcon> = {
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
  };
  return iconMap[iconName || ""] || DollarSign;
}

/**
 * Maps colorToken to IconBadge-compatible color
 * IconBadge supports: "blue" | "green" | "orange" | "purple" | "red" | "yellow" | "teal" | "cyan" | "indigo" | "amber"
 */
export function getIconBadgeColor(colorToken?: string): "blue" | "green" | "orange" | "purple" | "red" | "yellow" | "teal" | "cyan" | "indigo" | "amber" {
  const colorMap: Record<string, "blue" | "green" | "orange" | "purple" | "red" | "yellow" | "teal" | "cyan" | "indigo" | "amber"> = {
    blue: "blue",
    green: "green",
    orange: "orange",
    purple: "purple",
    amber: "amber",
    yellow: "yellow",
    red: "red",
    cyan: "cyan",
    pink: "purple", // Map pink to purple
    teal: "teal",
    indigo: "indigo",
  };
  return colorMap[colorToken || ""] || "blue"; // Fallback to blue instead of "default"
}

/**
 * Creates memoized lookup maps for shift cost types
 * Returns { byId: Map<id, type>, byName: Map<name, type> }
 */
export function createShiftCostTypeMaps(costTypes: ShiftCostType[]) {
  return {
    byId: new Map(costTypes.map((t) => [t.id, t])),
    byName: new Map(costTypes.map((t) => [t.name, t])),
  };
}

/**
 * Hook for creating memoized shift cost type maps
 */
export function useShiftCostTypeMaps(costTypes: ShiftCostType[]) {
  return useMemo(() => createShiftCostTypeMaps(costTypes), [costTypes]);
}

/**
 * Get badge classes for cost type (following existing project pattern)
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
 * Get color configuration for cost type selection (AdicionarCusto pattern)
 */
export function getCostTypeColors(colorToken?: string) {
  const colorMap: Record<string, { border: string; bg: string; text: string; hover: string }> = {
    blue: {
      border: "border-blue-300 dark:border-blue-600",
      bg: "bg-white dark:bg-background",
      text: "text-blue-600 dark:text-blue-400",
      hover: "hover:bg-blue-50 dark:hover:bg-blue-950/30",
    },
    green: {
      border: "border-green-300 dark:border-green-600",
      bg: "bg-white dark:bg-background",
      text: "text-green-600 dark:text-green-400",
      hover: "hover:bg-green-50 dark:hover:bg-green-950/30",
    },
    orange: {
      border: "border-orange-300 dark:border-orange-600",
      bg: "bg-white dark:bg-background",
      text: "text-orange-600 dark:text-orange-400",
      hover: "hover:bg-orange-50 dark:hover:bg-orange-950/30",
    },
    purple: {
      border: "border-purple-300 dark:border-purple-600",
      bg: "bg-white dark:bg-background",
      text: "text-purple-600 dark:text-purple-400",
      hover: "hover:bg-purple-50 dark:hover:bg-purple-950/30",
    },
    amber: {
      border: "border-amber-300 dark:border-amber-600",
      bg: "bg-white dark:bg-background",
      text: "text-amber-600 dark:text-amber-400",
      hover: "hover:bg-amber-50 dark:hover:bg-amber-950/30",
    },
    red: {
      border: "border-red-300 dark:border-red-600",
      bg: "bg-white dark:bg-background",
      text: "text-red-600 dark:text-red-400",
      hover: "hover:bg-red-50 dark:hover:bg-red-950/30",
    },
    yellow: {
      border: "border-yellow-300 dark:border-yellow-600",
      bg: "bg-white dark:bg-background",
      text: "text-yellow-600 dark:text-yellow-400",
      hover: "hover:bg-yellow-50 dark:hover:bg-yellow-950/30",
    },
    cyan: {
      border: "border-cyan-300 dark:border-cyan-600",
      bg: "bg-white dark:bg-background",
      text: "text-cyan-600 dark:text-cyan-400",
      hover: "hover:bg-cyan-50 dark:hover:bg-cyan-950/30",
    },
    pink: {
      border: "border-pink-300 dark:border-pink-600",
      bg: "bg-white dark:bg-background",
      text: "text-pink-600 dark:text-pink-400",
      hover: "hover:bg-pink-50 dark:hover:bg-pink-950/30",
    },
    teal: {
      border: "border-teal-300 dark:border-teal-600",
      bg: "bg-white dark:bg-background",
      text: "text-teal-600 dark:text-teal-400",
      hover: "hover:bg-teal-50 dark:hover:bg-teal-950/30",
    },
    indigo: {
      border: "border-indigo-300 dark:border-indigo-600",
      bg: "bg-white dark:bg-background",
      text: "text-indigo-600 dark:text-indigo-400",
      hover: "hover:bg-indigo-50 dark:hover:bg-indigo-950/30",
    },
  };
  return (
    colorMap[colorToken || ""] || {
      border: "border-gray-300 dark:border-gray-600",
      bg: "bg-white dark:bg-background",
      text: "text-gray-600 dark:text-gray-400",
      hover: "hover:bg-gray-50 dark:hover:bg-gray-950/30",
    }
  );
}
