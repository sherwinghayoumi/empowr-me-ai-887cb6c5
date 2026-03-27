import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees } from "@/hooks/useOrgData";
import { Briefcase } from "lucide-react";

interface PracticeGroupFilterProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PracticeGroupFilter({ value, onChange, className }: PracticeGroupFilterProps) {
  const { data: employees } = useEmployees();

  const practiceGroups = useMemo(() => {
    if (!employees) return [];
    const groups = new Set<string>();
    for (const emp of employees) {
      const pg = (emp as any).role_profile?.practice_group;
      if (pg) groups.add(pg);
    }
    return [...groups].sort();
  }, [employees]);

  if (practiceGroups.length <= 1) return null;

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`h-8 text-xs bg-card/80 border-border/50 ${className || "w-52"}`}>
        <Briefcase className="w-3 h-3 mr-1.5 text-muted-foreground" />
        <SelectValue placeholder="Practice Group" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Alle Practice Groups</SelectItem>
        {practiceGroups.map((pg) => (
          <SelectItem key={pg} value={pg}>{pg}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
