import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface SkillProgressData {
  month: string;
  legalCore: number;
  businessAcumen: number;
  technology: number;
  softSkills: number;
}

interface SkillImpactChartProps {
  data: SkillProgressData[];
  className?: string;
  title?: string;
  showLegend?: boolean;
}

const CATEGORY_COLORS = {
  legalCore: "hsl(var(--primary))",
  businessAcumen: "hsl(var(--skill-strong))",
  technology: "hsl(var(--skill-very-strong))",
  softSkills: "hsl(var(--skill-moderate))",
};

const CATEGORY_LABELS = {
  legalCore: "Legal Core",
  businessAcumen: "Business Acumen",
  technology: "Technology",
  softSkills: "Soft Skills",
};

export function SkillImpactChart({
  data,
  className,
  title,
  showLegend = true,
}: SkillImpactChartProps) {
  const totalGrowth = useMemo(() => {
    if (data.length < 2) return 0;
    const first = data[0];
    const last = data[data.length - 1];
    const firstTotal = first.legalCore + first.businessAcumen + first.technology + first.softSkills;
    const lastTotal = last.legalCore + last.businessAcumen + last.technology + last.softSkills;
    return Math.round(((lastTotal - firstTotal) / firstTotal) * 100);
  }, [data]);

  return (
    <div className={className}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Impact</span>
            <span className={`text-lg font-bold ${totalGrowth >= 0 ? 'text-[hsl(var(--skill-very-strong))]' : 'text-[hsl(var(--skill-weak))]'}`}>
              {totalGrowth >= 0 ? '+' : ''}{totalGrowth}%
            </span>
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorLegalCore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CATEGORY_COLORS.legalCore} stopOpacity={0.8} />
              <stop offset="95%" stopColor={CATEGORY_COLORS.legalCore} stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorBusinessAcumen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CATEGORY_COLORS.businessAcumen} stopOpacity={0.8} />
              <stop offset="95%" stopColor={CATEGORY_COLORS.businessAcumen} stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorTechnology" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CATEGORY_COLORS.technology} stopOpacity={0.8} />
              <stop offset="95%" stopColor={CATEGORY_COLORS.technology} stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id="colorSoftSkills" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CATEGORY_COLORS.softSkills} stopOpacity={0.8} />
              <stop offset="95%" stopColor={CATEGORY_COLORS.softSkills} stopOpacity={0.2} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis 
            dataKey="month" 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            axisLine={{ stroke: 'hsl(var(--border))' }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--foreground))',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value: number, name: string) => [
              `${value}%`,
              CATEGORY_LABELS[name as keyof typeof CATEGORY_LABELS] || name,
            ]}
          />
          {showLegend && (
            <Legend
              formatter={(value) => (
                <span style={{ color: 'hsl(var(--foreground))' }}>
                  {CATEGORY_LABELS[value as keyof typeof CATEGORY_LABELS] || value}
                </span>
              )}
            />
          )}
          <Area
            type="monotone"
            dataKey="softSkills"
            stackId="1"
            stroke={CATEGORY_COLORS.softSkills}
            fill="url(#colorSoftSkills)"
          />
          <Area
            type="monotone"
            dataKey="technology"
            stackId="1"
            stroke={CATEGORY_COLORS.technology}
            fill="url(#colorTechnology)"
          />
          <Area
            type="monotone"
            dataKey="businessAcumen"
            stackId="1"
            stroke={CATEGORY_COLORS.businessAcumen}
            fill="url(#colorBusinessAcumen)"
          />
          <Area
            type="monotone"
            dataKey="legalCore"
            stackId="1"
            stroke={CATEGORY_COLORS.legalCore}
            fill="url(#colorLegalCore)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Add realistic variance to a value
function addVariance(value: number, variance: number = 3): number {
  const change = (Math.random() - 0.5) * 2 * variance;
  return Math.round(Math.max(0, Math.min(100, value + change)));
}

// Generate mock progress data for the last 6 months with realistic fluctuations
export function generateSkillProgressData(baseScores: {
  legalCore: number;
  businessAcumen: number;
  technology: number;
  softSkills: number;
}): SkillProgressData[] {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Start from lower values and build up with variance
  let current = {
    legalCore: baseScores.legalCore * 0.85,
    businessAcumen: baseScores.businessAcumen * 0.82,
    technology: baseScores.technology * 0.75,
    softSkills: baseScores.softSkills * 0.88,
  };

  return months.map((month, index) => {
    // Different growth patterns per category
    const growthFactors = {
      legalCore: 0.025 + Math.random() * 0.015,
      businessAcumen: 0.03 + Math.random() * 0.02,
      technology: 0.04 + Math.random() * 0.025,
      softSkills: 0.02 + Math.random() * 0.018,
    };

    // Last month should be close to actual scores
    if (index === 5) {
      return {
        month,
        legalCore: addVariance(baseScores.legalCore, 1),
        businessAcumen: addVariance(baseScores.businessAcumen, 1),
        technology: addVariance(baseScores.technology, 1),
        softSkills: addVariance(baseScores.softSkills, 1),
      };
    }

    const result = {
      month,
      legalCore: addVariance(current.legalCore, 2),
      businessAcumen: addVariance(current.businessAcumen, 3),
      technology: addVariance(current.technology, 4),
      softSkills: addVariance(current.softSkills, 2),
    };

    // Progress with some months having dips
    const hasDip = Math.random() < 0.2;
    current = {
      legalCore: current.legalCore + (hasDip ? -1 : baseScores.legalCore * growthFactors.legalCore),
      businessAcumen: current.businessAcumen + (hasDip ? -2 : baseScores.businessAcumen * growthFactors.businessAcumen),
      technology: current.technology + baseScores.technology * growthFactors.technology,
      softSkills: current.softSkills + (hasDip ? 0 : baseScores.softSkills * growthFactors.softSkills),
    };

    return result;
  });
}

// Generate company-wide progress data with realistic fluctuations
export function generateCompanyProgressData(): SkillProgressData[] {
  return [
    { month: 'Jul', legalCore: 61, businessAcumen: 46, technology: 30, softSkills: 54 },
    { month: 'Aug', legalCore: 63, businessAcumen: 49, technology: 33, softSkills: 55 },
    { month: 'Sep', legalCore: 64, businessAcumen: 48, technology: 38, softSkills: 58 },
    { month: 'Oct', legalCore: 67, businessAcumen: 52, technology: 41, softSkills: 59 },
    { month: 'Nov', legalCore: 68, businessAcumen: 56, technology: 46, softSkills: 63 },
    { month: 'Dec', legalCore: 72, businessAcumen: 60, technology: 52, softSkills: 66 },
  ];
}
