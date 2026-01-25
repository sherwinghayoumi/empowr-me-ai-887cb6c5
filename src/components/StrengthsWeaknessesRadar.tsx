import { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SkillData {
  skillId: string;
  skillName?: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel?: number;
}

interface StrengthsWeaknessesRadarProps {
  skills: SkillData[];
  showDemanded?: boolean;
  className?: string;
}

export function StrengthsWeaknessesRadar({
  skills,
  showDemanded = true,
  className,
}: StrengthsWeaknessesRadarProps) {
  const radarData = useMemo(() => {
    return skills.map((skill) => {
      const name = skill.skillName || skill.skillId;
      // Truncate long names for better display
      const shortName = name.length > 15 ? name.substring(0, 12) + "..." : name;
      
      return {
        subject: shortName,
        fullName: name,
        current: skill.currentLevel,
        demanded: skill.demandedLevel,
      };
    });
  }, [skills]);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
          <PolarGrid 
            stroke="hsl(var(--border))" 
            strokeOpacity={0.5}
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ 
              fill: "hsl(var(--foreground))", 
              fontSize: 11,
              fontWeight: 500,
            }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ 
              fill: "hsl(var(--muted-foreground))", 
              fontSize: 10 
            }}
            tickCount={5}
            axisLine={false}
          />
          <Radar
            name="Current Level"
            dataKey="current"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.5}
            strokeWidth={2}
          />
          {showDemanded && (
            <Radar
              name="Demanded Level"
              dataKey="demanded"
              stroke="hsl(var(--skill-moderate))"
              fill="hsl(var(--skill-moderate))"
              fillOpacity={0.2}
              strokeWidth={2}
              strokeDasharray="5 5"
            />
          )}
          <Legend
            wrapperStyle={{
              paddingTop: "20px",
            }}
            formatter={(value) => (
              <span style={{ color: "hsl(var(--foreground))", fontSize: "12px" }}>
                {value}
              </span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
