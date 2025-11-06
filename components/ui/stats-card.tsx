import { cn } from "@/lib/utils";
import { variants } from "@/lib/theme";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  description, 
  icon: Icon,
  trend,
  className 
}: StatsCardProps) {
  return (
    <div className={cn(variants.stats.card, className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className={variants.stats.label}>{title}</p>
          <p className={variants.stats.value}>{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        
        {Icon && (
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        )}
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span className={cn(
            "text-xs font-medium",
            trend.value > 0 ? "text-emerald-600" : "text-red-600"
          )}>
            {trend.value > 0 ? "+" : ""}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}