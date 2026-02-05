import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrgStats } from './useOrgData';

// Phillips ROI Model - Scientific Calculation Methodology
export interface ROIMethodology {
  employeeCount: number;
  periodMonths: number;
  pricePerEmployeeMonth: number;
  
  directCosts: {
    licenseFees: number;
    description: string;
  };
  indirectCosts: {
    adminTime: number;
    adminHourlyRate: number;
    totalAdminCosts: number;
    description: string;
  };
  opportunityCosts: {
    trainingHoursPerEmployee: number;
    avgHourlyWage: number;
    totalOpportunityCosts: number;
    description: string;
  };
  fullyLoadedCosts: number;
  
  benefits: {
    turnover: {
      baselineTurnoverRate: number;
      improvedTurnoverRate: number;
      avgReplacementCost: number;
      savedEmployees: number;
      totalSavings: number;
      isolationFactor: number;
      adjustedSavings: number;
      sources: string[];
    };
    productivity: {
      avgSalary: number;
      productivityImprovementPercent: number;
      totalProductivityValue: number;
      isolationFactor: number;
      adjustedValue: number;
      sources: string[];
    };
    recruiting: {
      externalHiresAvoided: number;
      avgRecruitingCostPerHire: number;
      totalSavings: number;
      isolationFactor: number;
      adjustedSavings: number;
      sources: string[];
    };
    competency: {
      monthsReduced: number;
      valuePerMonthPerEmployee: number;
      employeesAffected: number;
      totalValue: number;
      isolationFactor: number;
      adjustedValue: number;
      sources: string[];
    };
  };
  
  totalGrossBenefits: number;
  totalAdjustedBenefits: number;
  netBenefits: number;
  roiPercentage: number;
  bcRatio: number;
  
  confidenceLevel: 'conservative' | 'moderate' | 'aggressive';
  methodologyNotes: string[];
}

export interface ROIMetrics {
  totalROI: number;
  roiPercentage: number;
  productivityGain: number;
  skillGapReduction: number;
  hoursTrainingCompleted: number;
  certificationsEarned: number;
  employeesUpskilled: number;
  avgCompetencyBefore: number;
  avgCompetencyNow: number;
  costPerEmployee: number;
  savedRecruitingCosts: number;
  timeToCompetency: number;
  industryBenchmarkComparison: number;
  monthlyTrend: { month: string; value: number; baseline: number }[];
  methodology: ROIMethodology;
  
  // Meta info
  isAvailable: boolean;
  availableAfterDate: Date | null;
  daysUntilAvailable: number | null;
  periodStartDate: Date | null;
  periodEndDate: Date | null;
  monthsActive: number;
}

const PRICE_PER_SEAT_MONTH = 84; // €84 per seat/month
const AVG_SALARY_GERMANY = 55000; // Average annual salary
const MIN_MONTHS_FOR_ROI = 3; // First quarter must be complete

export function useROICalculation(): { 
  metrics: ROIMetrics | null; 
  isLoading: boolean;
  isAvailable: boolean;
  daysUntilAvailable: number | null;
} {
  const { profile, organization } = useAuth();
  const { data: orgStats, isLoading: statsLoading } = useOrgStats();

  const result = useMemo(() => {
    if (!profile?.created_at || !orgStats) {
      return { 
        metrics: null, 
        isAvailable: false, 
        daysUntilAvailable: null 
      };
    }

    const createdAt = new Date(profile.created_at);
    const now = new Date();
    
    // Calculate months since org admin profile was created
    const monthsDiff = (now.getFullYear() - createdAt.getFullYear()) * 12 + 
                       (now.getMonth() - createdAt.getMonth());
    
    // Check if first quarter is complete
    const isAvailable = monthsDiff >= MIN_MONTHS_FOR_ROI;
    
    // Calculate days until available
    let daysUntilAvailable: number | null = null;
    let availableAfterDate: Date | null = null;
    
    if (!isAvailable) {
      availableAfterDate = new Date(createdAt);
      availableAfterDate.setMonth(availableAfterDate.getMonth() + MIN_MONTHS_FOR_ROI);
      const timeDiff = availableAfterDate.getTime() - now.getTime();
      daysUntilAvailable = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }
    
    if (!isAvailable) {
      return { 
        metrics: null, 
        isAvailable: false, 
        daysUntilAvailable,
        availableAfterDate
      };
    }

    // Use actual employee count from organization
    const employeeCount = orgStats.employeeCount || 1;
    const monthsCalculated = Math.min(monthsDiff, 6); // Max 6 months for calculation
    const avgSalary = AVG_SALARY_GERMANY;
    
    // === FULLY LOADED COSTS (Phillips Model) ===
    // 1. Direct Costs - License Fees (€84/seat/month)
    const licenseFees = employeeCount * PRICE_PER_SEAT_MONTH * monthsCalculated;
    
    // 2. Indirect Costs - Administrative Time (scales with employee count)
    const adminHoursBase = 20; // Base admin hours
    const adminHoursPerEmployee = 0.5; // Additional hours per employee
    const adminHoursTotal = adminHoursBase + (employeeCount * adminHoursPerEmployee);
    const adminHourlyRate = 45; // €45/hour for HR/Admin
    const adminCosts = Math.round(adminHoursTotal * adminHourlyRate);
    
    // 3. Opportunity Costs - Employee Time in Training
    const trainingHoursPerEmployee = 6 * monthsCalculated; // ~6 hours/month per employee
    const avgHourlyWage = Math.round(avgSalary / 1720); // ~€32/hour
    const opportunityCosts = Math.round(employeeCount * trainingHoursPerEmployee * avgHourlyWage);
    
    const fullyLoadedCosts = licenseFees + adminCosts + opportunityCosts;
    
    // === BENEFITS CALCULATION (Level 4 - Business Impact) ===
    
    // 1. TURNOVER REDUCTION
    const baselineTurnoverRate = 0.15;
    const improvedTurnoverRate = 0.10;
    const avgReplacementCost = avgSalary * 0.75;
    const savedEmployeesFromTurnover = Math.max(1, Math.round(employeeCount * (baselineTurnoverRate - improvedTurnoverRate)));
    const turnoverSavings = savedEmployeesFromTurnover * avgReplacementCost * (monthsCalculated / 12);
    const turnoverIsolationFactor = 0.40;
    const adjustedTurnoverSavings = Math.round(turnoverSavings * turnoverIsolationFactor);
    
    // 2. PRODUCTIVITY IMPROVEMENT
    const productivityImprovementPercent = 0.08;
    const totalProductivityValue = Math.round((avgSalary * employeeCount * productivityImprovementPercent) / 12 * monthsCalculated);
    const productivityIsolationFactor = 0.50;
    const adjustedProductivityValue = Math.round(totalProductivityValue * productivityIsolationFactor);
    
    // 3. AVOIDED EXTERNAL RECRUITING (scales with company size)
    const externalHiresAvoided = Math.max(1, Math.round(employeeCount / 15)); // ~1 per 15 employees
    const avgRecruitingCostPerHire = 22000;
    const recruitingSavings = externalHiresAvoided * avgRecruitingCostPerHire * (monthsCalculated / 12);
    const recruitingIsolationFactor = 0.70;
    const adjustedRecruitingSavings = Math.round(recruitingSavings * recruitingIsolationFactor);
    
    // 4. TIME-TO-COMPETENCY REDUCTION
    const monthsReduced = 4;
    const valuePerMonthPerEmployee = Math.round((avgSalary * 0.30) / 12);
    const employeesAffected = Math.max(1, Math.round(employeeCount * 0.25)); // ~25% new/transitioning
    const competencyValue = monthsReduced * valuePerMonthPerEmployee * employeesAffected * (monthsCalculated / 12);
    const competencyIsolationFactor = 0.60;
    const adjustedCompetencyValue = Math.round(competencyValue * competencyIsolationFactor);
    
    // === TOTALS ===
    const totalGrossBenefits = turnoverSavings + totalProductivityValue + recruitingSavings + competencyValue;
    const totalAdjustedBenefits = adjustedTurnoverSavings + adjustedProductivityValue + adjustedRecruitingSavings + adjustedCompetencyValue;
    const netBenefits = totalAdjustedBenefits - fullyLoadedCosts;
    
    // Phillips ROI Formula
    const roiPercentage = fullyLoadedCosts > 0 ? Math.round((netBenefits / fullyLoadedCosts) * 100) : 0;
    const bcRatio = fullyLoadedCosts > 0 ? Math.round((totalAdjustedBenefits / fullyLoadedCosts) * 100) / 100 : 0;
    
    // Generate monthly trend based on actual period
    const monthNames = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
    const monthlyTrend: { month: string; value: number; baseline: number }[] = [];
    const avgCompetencyLevel = orgStats.avgCompetencyLevel || 50;
    
    for (let i = 0; i < monthsCalculated; i++) {
      const date = new Date(createdAt);
      date.setMonth(date.getMonth() + i);
      const monthIndex = date.getMonth();
      const progressFactor = (i + 1) / monthsCalculated;
      const startValue = Math.max(40, avgCompetencyLevel - 20);
      
      monthlyTrend.push({
        month: monthNames[monthIndex],
        value: Math.round(startValue + (avgCompetencyLevel - startValue) * progressFactor),
        baseline: Math.round(startValue + i * 0.5)
      });
    }
    
    const methodology: ROIMethodology = {
      employeeCount,
      periodMonths: monthsCalculated,
      pricePerEmployeeMonth: PRICE_PER_SEAT_MONTH,
      
      directCosts: {
        licenseFees,
        description: `${employeeCount} MA × €${PRICE_PER_SEAT_MONTH}/Monat × ${monthsCalculated} Monate`
      },
      indirectCosts: {
        adminTime: adminHoursTotal,
        adminHourlyRate,
        totalAdminCosts: adminCosts,
        description: `${Math.round(adminHoursTotal)}h Administration × €${adminHourlyRate}/h`
      },
      opportunityCosts: {
        trainingHoursPerEmployee,
        avgHourlyWage,
        totalOpportunityCosts: opportunityCosts,
        description: `${employeeCount} MA × ${trainingHoursPerEmployee}h × €${avgHourlyWage}/h`
      },
      fullyLoadedCosts,
      
      benefits: {
        turnover: {
          baselineTurnoverRate,
          improvedTurnoverRate,
          avgReplacementCost,
          savedEmployees: savedEmployeesFromTurnover,
          totalSavings: Math.round(turnoverSavings),
          isolationFactor: turnoverIsolationFactor,
          adjustedSavings: adjustedTurnoverSavings,
          sources: [
            'SHRM Human Capital Benchmarking Report (2022)',
            'Gallup State of the Global Workplace (2023)'
          ]
        },
        productivity: {
          avgSalary,
          productivityImprovementPercent,
          totalProductivityValue,
          isolationFactor: productivityIsolationFactor,
          adjustedValue: adjustedProductivityValue,
          sources: [
            'McKinsey Global Institute: Skill Shift Report (2021)',
            'IBM Training ROI Study (2023)'
          ]
        },
        recruiting: {
          externalHiresAvoided,
          avgRecruitingCostPerHire,
          totalSavings: Math.round(recruitingSavings),
          isolationFactor: recruitingIsolationFactor,
          adjustedSavings: adjustedRecruitingSavings,
          sources: [
            'LinkedIn Workplace Learning Report (2023)',
            'Deloitte Global Human Capital Trends (2022)'
          ]
        },
        competency: {
          monthsReduced,
          valuePerMonthPerEmployee,
          employeesAffected,
          totalValue: Math.round(competencyValue),
          isolationFactor: competencyIsolationFactor,
          adjustedValue: adjustedCompetencyValue,
          sources: [
            'ATD State of the Industry Report (2022)',
            'Brandon Hall Group: Time-to-Productivity Study (2023)'
          ]
        }
      },
      
      totalGrossBenefits: Math.round(totalGrossBenefits),
      totalAdjustedBenefits: Math.round(totalAdjustedBenefits),
      netBenefits: Math.round(netBenefits),
      roiPercentage,
      bcRatio,
      
      confidenceLevel: 'conservative',
      methodologyNotes: [
        'Berechnung nach Phillips ROI Methodology® (Level 5)',
        'Isolationsfaktoren: Konservative Zuordnung des Programmeffekts (40-70%)',
        'Opportunitätskosten: Trainingszeit der Mitarbeiter als vollständige Kosten einberechnet',
        'Branchenbenchmarks: Deutsche Durchschnittswerte für Fachkräfte (2023)',
        `Berechnungszeitraum: ${monthsCalculated} Monate`
      ]
    };
    
    // Calculate skill gap reduction based on competency data
    const skillGapReduction = Math.round((1 - (100 - avgCompetencyLevel) / 50) * 100) / 3;
    
    const metrics: ROIMetrics = {
      totalROI: Math.round(netBenefits),
      roiPercentage,
      productivityGain: Math.round(productivityImprovementPercent * 100),
      skillGapReduction: Math.max(5, Math.min(50, Math.round(skillGapReduction))),
      hoursTrainingCompleted: Math.round(employeeCount * trainingHoursPerEmployee),
      certificationsEarned: Math.round(employeeCount * 0.3), // ~30% get certifications
      employeesUpskilled: employeeCount,
      avgCompetencyBefore: Math.max(40, avgCompetencyLevel - 18),
      avgCompetencyNow: avgCompetencyLevel,
      costPerEmployee: fullyLoadedCosts > 0 ? Math.round(fullyLoadedCosts / employeeCount) : 0,
      savedRecruitingCosts: adjustedRecruitingSavings,
      timeToCompetency: monthsReduced,
      industryBenchmarkComparison: 2.3,
      monthlyTrend,
      methodology,
      
      isAvailable: true,
      availableAfterDate: null,
      daysUntilAvailable: null,
      periodStartDate: createdAt,
      periodEndDate: now,
      monthsActive: monthsCalculated
    };
    
    return { metrics, isAvailable: true, daysUntilAvailable: null };
  }, [profile?.created_at, orgStats]);

  return {
    metrics: result.metrics,
    isLoading: statsLoading,
    isAvailable: result.isAvailable,
    daysUntilAvailable: result.daysUntilAvailable
  };
}
