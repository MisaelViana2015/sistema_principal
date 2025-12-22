import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

type KpiVariant = "default" | "success" | "warning" | "info" | "destructive" | "gold" | "purple";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: KpiVariant;
  trend?: "up" | "down";
  trendValue?: string;
  delay?: number;
}

const variantStyles: Record<KpiVariant, string> = {
  default: "bg-card",
  success: "bg-success/10 border-success/30",
  warning: "bg-warning/10 border-warning/30",
  info: "bg-info/10 border-info/30",
  destructive: "bg-destructive/10 border-destructive/30",
  gold: "bg-racing-gold/10 border-racing-gold/30",
  purple: "bg-racing-purple/10 border-racing-purple/30",
};

const iconVariantStyles: Record<KpiVariant, string> = {
  default: "text-foreground bg-secondary",
  success: "text-success bg-success/20",
  warning: "text-warning bg-warning/20",
  info: "text-info bg-info/20",
  destructive: "text-destructive bg-destructive/20",
  gold: "text-racing-gold bg-racing-gold/20",
  purple: "text-racing-purple bg-racing-purple/20",
};

const KpiCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  trend,
  trendValue,
  delay = 0,
}: KpiCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.4 }}
      className={`kpi-card ${variantStyles[variant]} border`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="kpi-value text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${
              trend === "up" ? "text-success" : "text-destructive"
            }`}>
              <span>{trend === "up" ? "↑" : "↓"}</span>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconVariantStyles[variant]}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default KpiCard;
