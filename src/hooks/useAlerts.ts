import { useMemo } from 'react';
import { useEmployees, useTeams, useSkillGapAnalysis } from '@/hooks/useOrgData';
import { useMeasures } from '@/hooks/useMeasures';

export type AlertSeverity = 'critical' | 'medium' | 'low';
export type AlertCategory = 'gap' | 'measure' | 'budget' | 'profile' | 'quarter';

export interface SystemAlert {
  id: string;
  text: string;
  severity: AlertSeverity;
  category: AlertCategory;
  link?: string;
}

function getQuarterProgress(): { quarter: string; progressPct: number; isMidQuarter: boolean; daysRemaining: number } {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const qStart = new Date(now.getFullYear(), Math.floor(month / 3) * 3, 1);
  const qEnd = new Date(now.getFullYear(), Math.floor(month / 3) * 3 + 3, 1);
  const totalDays = (qEnd.getTime() - qStart.getTime()) / (1000 * 60 * 60 * 24);
  const elapsed = (now.getTime() - qStart.getTime()) / (1000 * 60 * 60 * 24);
  const pct = Math.round((elapsed / totalDays) * 100);
  const daysRemaining = Math.ceil(totalDays - elapsed);
  const quarterNum = Math.floor(month / 3) + 1;
  return {
    quarter: `Q${quarterNum}`,
    progressPct: pct,
    isMidQuarter: pct >= 40 && pct <= 60,
    daysRemaining,
  };
}

export function useAlerts() {
  const { data: employees } = useEmployees();
  const { data: teams } = useTeams();
  const { data: measures } = useMeasures();
  const { data: gapAnalysis } = useSkillGapAnalysis();

  const quarterInfo = useMemo(() => getQuarterProgress(), []);

  const alerts = useMemo(() => {
    const items: SystemAlert[] = [];

    // ─── Mid-Quarter Check ──────────────────────────
    if (quarterInfo.isMidQuarter) {
      items.push({
        id: 'mid-quarter',
        text: `Mid-Quarter-Check: ${quarterInfo.quarter} ist zu ${quarterInfo.progressPct}% verstrichen – ${quarterInfo.daysRemaining} Tage verbleiben`,
        severity: 'medium',
        category: 'quarter',
      });
    } else if (quarterInfo.progressPct >= 80) {
      items.push({
        id: 'quarter-ending',
        text: `${quarterInfo.quarter} endet in ${quarterInfo.daysRemaining} Tagen – Reports und Bewertungen jetzt abschließen`,
        severity: 'critical',
        category: 'quarter',
      });
    }

    // ─── Employees without profiles ─────────────────
    const noProfile = employees?.filter(e => !e.competencies || e.competencies.length === 0) || [];
    if (noProfile.length > 0) {
      items.push({
        id: 'no-profile',
        text: `${noProfile.length} Anwält${noProfile.length === 1 ? '' : 'e'} ohne Kompetenzprofil`,
        severity: noProfile.length >= 3 ? 'critical' : 'medium',
        category: 'profile',
        link: '/admin/employees',
      });
    }

    // ─── Critical gaps ──────────────────────────────
    const critCount = gapAnalysis?.criticalGaps?.length || 0;
    if (critCount > 0) {
      items.push({
        id: 'critical-gaps',
        text: `${critCount} kritische Kompetenzlücke${critCount === 1 ? '' : 'n'} identifiziert`,
        severity: 'critical',
        category: 'gap',
        link: '/admin/skill-gaps',
      });
    }

    // ─── Expiring / overdue measures ────────────────
    if (measures) {
      const now = new Date();
      const overdue = measures.filter(m => {
        if (m.status === 'completed' || m.status === 'cancelled') return false;
        if (!m.end_date) return false;
        return new Date(m.end_date) < now;
      });
      if (overdue.length > 0) {
        items.push({
          id: 'overdue-measures',
          text: `${overdue.length} Maßnahme${overdue.length === 1 ? '' : 'n'} überfällig`,
          severity: 'critical',
          category: 'measure',
          link: '/admin/measures',
        });
      }

      const soonDays = 14;
      const soonDate = new Date(now.getTime() + soonDays * 24 * 60 * 60 * 1000);
      const expiring = measures.filter(m => {
        if (m.status === 'completed' || m.status === 'cancelled') return false;
        if (!m.end_date) return false;
        const end = new Date(m.end_date);
        return end >= now && end <= soonDate;
      });
      if (expiring.length > 0) {
        items.push({
          id: 'expiring-measures',
          text: `${expiring.length} Maßnahme${expiring.length === 1 ? ' läuft' : 'n laufen'} in den nächsten 14 Tagen aus`,
          severity: 'medium',
          category: 'measure',
          link: '/admin/measures',
        });
      }

      // No active measures at all
      const activeMeasures = measures.filter(m => m.status === 'active' || m.status === 'planned');
      if (activeMeasures.length === 0 && measures.length > 0) {
        items.push({
          id: 'no-active-measures',
          text: 'Keine laufenden oder geplanten Maßnahmen vorhanden',
          severity: 'medium',
          category: 'measure',
          link: '/admin/measures',
        });
      }
    }

    // ─── Budget overruns ────────────────────────────
    if (teams && measures) {
      const overBudgetTeams = teams.filter(t => {
        const budget = (t as any).annual_budget || 0;
        if (budget <= 0) return false;
        const teamMeasures = measures.filter(m => m.assigned_team_id === t.id);
        const spent = teamMeasures
          .filter(m => m.status !== 'cancelled')
          .reduce((s, m) => s + (m.cost || 0), 0);
        return spent > budget;
      });
      if (overBudgetTeams.length > 0) {
        items.push({
          id: 'budget-overrun',
          text: `${overBudgetTeams.length} Team${overBudgetTeams.length === 1 ? '' : 's'} über Budget: ${overBudgetTeams.map(t => t.name).join(', ')}`,
          severity: 'critical',
          category: 'budget',
          link: '/admin/budget',
        });
      }

      // High utilization warning (>80%)
      const totalBudget = teams.reduce((s, t) => s + ((t as any).annual_budget || 0), 0);
      if (totalBudget > 0) {
        const totalSpent = measures
          .filter(m => m.status !== 'cancelled')
          .reduce((s, m) => s + (m.cost || 0), 0);
        const util = (totalSpent / totalBudget) * 100;
        if (util >= 80 && util < 100) {
          items.push({
            id: 'budget-high-util',
            text: `Gesamtbudget zu ${Math.round(util)}% ausgeschöpft`,
            severity: 'medium',
            category: 'budget',
            link: '/admin/budget',
          });
        }
      }
    }

    // Sort: critical first
    const order: Record<AlertSeverity, number> = { critical: 0, medium: 1, low: 2 };
    return items.sort((a, b) => order[a.severity] - order[b.severity]);
  }, [employees, gapAnalysis, measures, teams, quarterInfo]);

  return { alerts, quarterInfo };
}
