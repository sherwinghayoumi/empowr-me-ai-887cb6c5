import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  color?: string;
  pulse?: boolean;
  index?: number;
}

export function KpiCard({ label, value, sub, trend, icon: Icon, color = "text-foreground", pulse, index = 0 }: KpiCardProps) {
  return (
    <Card
      className="px-4 py-3 bg-card/80 border-border/50 animate-fade-in-up opacity-0 hover:border-primary/20 transition-colors duration-200"
      style={{ animationDelay: `${index * 0.07}s` }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        {Icon && <Icon className={`w-3.5 h-3.5 ${color}`} />}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <p className={`text-2xl font-semibold tabular-nums ${color} ${pulse ? 'animate-pulse-subtle' : ''}`}>
          {value}
        </p>
        {trend && (
          <span className={`text-xs font-medium ${
            trend === 'up' ? 'text-severity-low' : trend === 'down' ? 'severity-critical animate-pulse-subtle' : 'text-muted-foreground'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </Card>
  );
}
