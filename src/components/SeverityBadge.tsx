import { cn } from "@/lib/utils";

type Severity = "kritisch" | "mittel" | "gering" | "critical" | "medium" | "low";

const severityConfig: Record<Severity, { label: string; className: string }> = {
  kritisch: { label: "Kritisch", className: "bg-severity-critical/10 text-severity-critical" },
  critical: { label: "Kritisch", className: "bg-severity-critical/10 text-severity-critical" },
  mittel: { label: "Mittel", className: "bg-severity-medium/10 text-severity-medium" },
  medium: { label: "Mittel", className: "bg-severity-medium/10 text-severity-medium" },
  gering: { label: "Gering", className: "bg-severity-low/10 text-severity-low" },
  low: { label: "Gering", className: "bg-severity-low/10 text-severity-low" },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity] || severityConfig.gering;
  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium transition-opacity duration-200",
      config.className,
      (severity === 'kritisch' || severity === 'critical') && 'animate-pulse-subtle'
    )}>
      {config.label}
    </span>
  );
}
