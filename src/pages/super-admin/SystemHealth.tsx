import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  FileText,
  HardDrive,
  Loader2,
  RefreshCw,
  Shield,
  Users,
  UserCheck,
  Building2,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ─── Health check types ──────────────────────────────────────
interface HealthCheck {
  label: string;
  status: 'ok' | 'warning' | 'error';
  detail: string;
  icon: React.ReactNode;
}

// ─── Component ───────────────────────────────────────────────
export default function SystemHealthPage() {
  // ── Data Queries (all real) ─────────────────────────────────

  const { data: orgStats, isLoading: orgsLoading, refetch: refetchOrgs } = useQuery({
    queryKey: ['health-org-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug, subscription_status, subscription_ends_at, max_employees, data_processing_agreement_signed_at, created_at, deleted_at')
        .is('deleted_at', null);
      if (error) throw error;
      return data;
    },
  });

  const { data: allEmployees, isLoading: empLoading } = useQuery({
    queryKey: ['health-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, organization_id, is_active, overall_score, role_profile_id, profile_last_updated_at, created_at');
      if (error) throw error;
      return data;
    },
  });

  const { data: userProfiles, isLoading: usersLoading } = useQuery({
    queryKey: ['health-user-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, role, is_super_admin, organization_id, employee_id, last_login_at, gdpr_consent_given_at, created_at');
      if (error) throw error;
      return data;
    },
  });

  const { data: roleProfiles } = useQuery({
    queryKey: ['health-role-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_profiles')
        .select('id, role_title, role_key, is_active, is_published, practice_group, quarter, year');
      if (error) throw error;
      return data;
    },
  });

  const { data: competencies } = useQuery({
    queryKey: ['health-competencies'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('competencies')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: employeeCompetencies } = useQuery({
    queryKey: ['health-employee-competencies'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('employee_competencies')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: learningPaths } = useQuery({
    queryKey: ['health-learning-paths'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('id, employee_id, is_ai_generated, progress_percent, completed_at');
      if (error) throw error;
      return data;
    },
  });

  const { data: gdprRequests } = useQuery({
    queryKey: ['health-gdpr'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gdpr_requests')
        .select('id, status, request_type, created_at, deadline_at');
      if (error) throw error;
      return data;
    },
  });

  const { data: auditLogCount } = useQuery({
    queryKey: ['health-audit-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('audit_log')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: recentAuditActions } = useQuery({
    queryKey: ['health-audit-recent'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('action, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const { data: certifications } = useQuery({
    queryKey: ['health-certifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certifications')
        .select('id, is_processed, is_verified, processing_error');
      if (error) throw error;
      return data;
    },
  });

  // ── Computed Metrics ─────────────────────────────────────────

  const metrics = useMemo(() => {
    const activeEmployees = allEmployees?.filter(e => e.is_active) || [];
    const inactiveEmployees = allEmployees?.filter(e => !e.is_active) || [];
    const employeesWithProfile = activeEmployees.filter(e => e.role_profile_id);
    const employeesWithScore = activeEmployees.filter(e => e.overall_score && e.overall_score > 0);
    const orphanedEmployees = activeEmployees.filter(e => !e.role_profile_id);

    // Users without employee link
    const usersWithoutEmployee = userProfiles?.filter(u => !u.employee_id && u.role === 'employee') || [];
    const usersWithoutGdpr = userProfiles?.filter(u => !u.gdpr_consent_given_at) || [];
    const usersNeverLoggedIn = userProfiles?.filter(u => !u.last_login_at) || [];

    // Orgs
    const orgsWithoutDpa = orgStats?.filter(o => !o.data_processing_agreement_signed_at) || [];
    const expiringTrials = orgStats?.filter(o => {
      if (!o.subscription_ends_at || o.subscription_status !== 'trial') return false;
      const daysLeft = Math.floor((new Date(o.subscription_ends_at).getTime() - Date.now()) / 86400000);
      return daysLeft <= 14 && daysLeft > 0;
    }) || [];
    const expiredTrials = orgStats?.filter(o => {
      if (!o.subscription_ends_at || o.subscription_status !== 'trial') return false;
      return new Date(o.subscription_ends_at).getTime() < Date.now();
    }) || [];

    // Role profiles
    const unpublishedProfiles = roleProfiles?.filter(rp => !rp.is_published) || [];
    const inactiveProfiles = roleProfiles?.filter(rp => !rp.is_active) || [];

    // GDPR
    const pendingGdpr = gdprRequests?.filter(r => r.status === 'pending') || [];
    const overdueGdpr = pendingGdpr.filter(r => {
      if (!r.deadline_at) return false;
      return new Date(r.deadline_at).getTime() < Date.now();
    });

    // Certifications
    const failedCerts = certifications?.filter(c => c.processing_error) || [];
    const unprocessedCerts = certifications?.filter(c => !c.is_processed) || [];

    // Learning paths
    const activeLearningPaths = learningPaths?.filter(lp => !lp.completed_at) || [];
    const completedLearningPaths = learningPaths?.filter(lp => lp.completed_at) || [];
    const aiGeneratedPaths = learningPaths?.filter(lp => lp.is_ai_generated) || [];

    // Audit velocity (actions in last 24h)
    const now = Date.now();
    const actionsLast24h = recentAuditActions?.filter(a =>
      a.created_at && (now - new Date(a.created_at).getTime()) < 86400000
    ).length || 0;

    // Coverage rate
    const coverageRate = activeEmployees.length > 0
      ? Math.round((employeesWithScore.length / activeEmployees.length) * 100)
      : 0;

    return {
      activeEmployees: activeEmployees.length,
      inactiveEmployees: inactiveEmployees.length,
      employeesWithProfile: employeesWithProfile.length,
      employeesWithScore: employeesWithScore.length,
      orphanedEmployees: orphanedEmployees.length,
      usersWithoutEmployee: usersWithoutEmployee.length,
      usersWithoutGdpr: usersWithoutGdpr.length,
      usersNeverLoggedIn: usersNeverLoggedIn.length,
      totalUsers: userProfiles?.length || 0,
      totalOrgs: orgStats?.length || 0,
      orgsWithoutDpa: orgsWithoutDpa.length,
      expiringTrials: expiringTrials.length,
      expiredTrials: expiredTrials.length,
      expiringTrialsList: expiringTrials,
      expiredTrialsList: expiredTrials,
      unpublishedProfiles: unpublishedProfiles.length,
      inactiveProfiles: inactiveProfiles.length,
      pendingGdpr: pendingGdpr.length,
      overdueGdpr: overdueGdpr.length,
      failedCerts: failedCerts.length,
      unprocessedCerts: unprocessedCerts.length,
      totalCerts: certifications?.length || 0,
      activeLearningPaths: activeLearningPaths.length,
      completedLearningPaths: completedLearningPaths.length,
      aiGeneratedPaths: aiGeneratedPaths.length,
      totalLearningPaths: learningPaths?.length || 0,
      auditLogCount: auditLogCount || 0,
      actionsLast24h,
      coverageRate,
      totalCompetencies: competencies || 0,
      totalEmployeeCompetencies: employeeCompetencies || 0,
      totalRoleProfiles: roleProfiles?.length || 0,
    };
  }, [orgStats, allEmployees, userProfiles, roleProfiles, gdprRequests, certifications, learningPaths, recentAuditActions, auditLogCount, competencies, employeeCompetencies]);

  // ── Health Checks ────────────────────────────────────────────

  const healthChecks: HealthCheck[] = useMemo(() => {
    const checks: HealthCheck[] = [];

    // GDPR compliance
    if (metrics.overdueGdpr > 0) {
      checks.push({ label: 'GDPR Compliance', status: 'error', detail: `${metrics.overdueGdpr} überfällige Anfrage(n)`, icon: <Shield className="w-4 h-4" /> });
    } else if (metrics.pendingGdpr > 0) {
      checks.push({ label: 'GDPR Compliance', status: 'warning', detail: `${metrics.pendingGdpr} ausstehende Anfrage(n)`, icon: <Shield className="w-4 h-4" /> });
    } else {
      checks.push({ label: 'GDPR Compliance', status: 'ok', detail: 'Keine offenen Anfragen', icon: <Shield className="w-4 h-4" /> });
    }

    // DPA coverage
    if (metrics.orgsWithoutDpa > 0) {
      checks.push({ label: 'DPA-Abdeckung', status: 'warning', detail: `${metrics.orgsWithoutDpa} Org(s) ohne DPA`, icon: <FileText className="w-4 h-4" /> });
    } else {
      checks.push({ label: 'DPA-Abdeckung', status: 'ok', detail: 'Alle Orgs mit DPA', icon: <FileText className="w-4 h-4" /> });
    }

    // Orphaned employees (no role profile)
    if (metrics.orphanedEmployees > 5) {
      checks.push({ label: 'Profil-Zuordnung', status: 'error', detail: `${metrics.orphanedEmployees} Mitarbeiter ohne Role Profile`, icon: <Users className="w-4 h-4" /> });
    } else if (metrics.orphanedEmployees > 0) {
      checks.push({ label: 'Profil-Zuordnung', status: 'warning', detail: `${metrics.orphanedEmployees} Mitarbeiter ohne Role Profile`, icon: <Users className="w-4 h-4" /> });
    } else {
      checks.push({ label: 'Profil-Zuordnung', status: 'ok', detail: 'Alle Mitarbeiter zugeordnet', icon: <Users className="w-4 h-4" /> });
    }

    // GDPR consent coverage
    if (metrics.usersWithoutGdpr > 3) {
      checks.push({ label: 'GDPR-Einwilligung', status: 'warning', detail: `${metrics.usersWithoutGdpr} User ohne Einwilligung`, icon: <Shield className="w-4 h-4" /> });
    } else {
      checks.push({ label: 'GDPR-Einwilligung', status: 'ok', detail: `${metrics.totalUsers - metrics.usersWithoutGdpr}/${metrics.totalUsers} mit Einwilligung`, icon: <Shield className="w-4 h-4" /> });
    }

    // Expired trials
    if (metrics.expiredTrials > 0) {
      checks.push({ label: 'Abgelaufene Trials', status: 'error', detail: `${metrics.expiredTrials} Trial(s) abgelaufen`, icon: <Clock className="w-4 h-4" /> });
    } else if (metrics.expiringTrials > 0) {
      checks.push({ label: 'Ablaufende Trials', status: 'warning', detail: `${metrics.expiringTrials} Trial(s) laufen bald ab`, icon: <Clock className="w-4 h-4" /> });
    } else {
      checks.push({ label: 'Trial-Status', status: 'ok', detail: 'Keine ablaufenden Trials', icon: <Clock className="w-4 h-4" /> });
    }

    // Failed certifications
    if (metrics.failedCerts > 0) {
      checks.push({ label: 'Zertifikats-Verarbeitung', status: 'error', detail: `${metrics.failedCerts} fehlgeschlagene Analyse(n)`, icon: <AlertTriangle className="w-4 h-4" /> });
    } else {
      checks.push({ label: 'Zertifikats-Verarbeitung', status: 'ok', detail: `${metrics.totalCerts} verarbeitet`, icon: <CheckCircle2 className="w-4 h-4" /> });
    }

    // Competency coverage
    if (metrics.coverageRate < 50) {
      checks.push({ label: 'Kompetenz-Abdeckung', status: 'warning', detail: `Nur ${metrics.coverageRate}% der Mitarbeiter bewertet`, icon: <BarChart3 className="w-4 h-4" /> });
    } else {
      checks.push({ label: 'Kompetenz-Abdeckung', status: 'ok', detail: `${metrics.coverageRate}% bewertet`, icon: <BarChart3 className="w-4 h-4" /> });
    }

    // Users without employee link
    if (metrics.usersWithoutEmployee > 0) {
      checks.push({ label: 'User-Employee-Link', status: 'warning', detail: `${metrics.usersWithoutEmployee} Employee-User ohne Verknüpfung`, icon: <UserCheck className="w-4 h-4" /> });
    }

    return checks;
  }, [metrics]);

  const overallStatus = useMemo(() => {
    if (healthChecks.some(c => c.status === 'error')) return 'error';
    if (healthChecks.some(c => c.status === 'warning')) return 'warning';
    return 'ok';
  }, [healthChecks]);

  const isLoading = orgsLoading || empLoading || usersLoading;

  const handleRefresh = () => {
    refetchOrgs();
  };

  const statusIcon = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-destructive" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Health</h1>
          <p className="text-muted-foreground">Tiefe Einblicke in den Systemzustand und potenzielle Probleme</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            className={
              overallStatus === 'ok' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
              overallStatus === 'warning' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
              'bg-destructive/20 text-destructive border-destructive/30'
            }
          >
            {overallStatus === 'ok' ? 'Gesund' : overallStatus === 'warning' ? 'Warnungen' : 'Probleme erkannt'}
          </Badge>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Aktualisieren
          </Button>
        </div>
      </div>

      {/* Health Checks */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Health Checks
          </CardTitle>
          <CardDescription>Automatische Prüfungen auf Basis der Echtdaten</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {healthChecks.map((check, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  check.status === 'error' ? 'border-destructive/30 bg-destructive/5' :
                  check.status === 'warning' ? 'border-amber-500/30 bg-amber-500/5' :
                  'border-border bg-muted/20'
                }`}
              >
                {statusIcon(check.status)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{check.label}</p>
                  <p className="text-xs text-muted-foreground truncate">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard icon={<Building2 className="w-4 h-4 text-primary" />} label="Organisationen" value={metrics.totalOrgs} />
        <MetricCard icon={<Users className="w-4 h-4 text-primary" />} label="Benutzer" value={metrics.totalUsers} />
        <MetricCard icon={<UserCheck className="w-4 h-4 text-primary" />} label="Aktive MA" value={metrics.activeEmployees} />
        <MetricCard icon={<ClipboardList className="w-4 h-4 text-primary" />} label="Role Profiles" value={metrics.totalRoleProfiles} />
        <MetricCard icon={<Database className="w-4 h-4 text-primary" />} label="Kompetenzen" value={metrics.totalCompetencies} />
        <MetricCard icon={<Zap className="w-4 h-4 text-primary" />} label="Bewertungen" value={metrics.totalEmployeeCompetencies} />
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Organization Health */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Organisations-Gesundheit
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Aktive Abos" value={orgStats?.filter(o => o.subscription_status === 'active').length || 0} />
            <DetailRow label="Trial-Abos" value={orgStats?.filter(o => o.subscription_status === 'trial').length || 0} />
            <DetailRow label="Pausiert" value={orgStats?.filter(o => o.subscription_status === 'paused').length || 0} />
            <Separator />
            <DetailRow label="Ohne DPA" value={metrics.orgsWithoutDpa} warn={metrics.orgsWithoutDpa > 0} />
            <DetailRow label="Trials ablaufend (14d)" value={metrics.expiringTrials} warn={metrics.expiringTrials > 0} />
            <DetailRow label="Trials abgelaufen" value={metrics.expiredTrials} error={metrics.expiredTrials > 0} />

            {metrics.expiredTrialsList.length > 0 && (
              <div className="mt-2 p-2 rounded bg-destructive/5 border border-destructive/20">
                <p className="text-xs font-medium text-destructive mb-1">Abgelaufene Trials:</p>
                {metrics.expiredTrialsList.map(o => (
                  <p key={o.id} className="text-xs text-muted-foreground">• {o.name}</p>
                ))}
              </div>
            )}
            {metrics.expiringTrialsList.length > 0 && (
              <div className="mt-2 p-2 rounded bg-amber-500/5 border border-amber-500/20">
                <p className="text-xs font-medium text-amber-500 mb-1">Bald ablaufend:</p>
                {metrics.expiringTrialsList.map(o => {
                  const daysLeft = Math.floor((new Date(o.subscription_ends_at!).getTime() - Date.now()) / 86400000);
                  return <p key={o.id} className="text-xs text-muted-foreground">• {o.name} ({daysLeft} Tage)</p>;
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* User & Employee Health */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              User & Employee Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Aktive Mitarbeiter" value={metrics.activeEmployees} />
            <DetailRow label="Inaktive Mitarbeiter" value={metrics.inactiveEmployees} />
            <DetailRow label="Mit Role Profile" value={metrics.employeesWithProfile} />
            <DetailRow label="Ohne Role Profile" value={metrics.orphanedEmployees} warn={metrics.orphanedEmployees > 0} />
            <Separator />
            <DetailRow label="User mit bewerteten Kompetenzen" value={metrics.employeesWithScore} />
            <DetailRow label="Kompetenz-Abdeckung" value={`${metrics.coverageRate}%`} warn={metrics.coverageRate < 50} />
            <Separator />
            <DetailRow label="Employee-User ohne Verknüpfung" value={metrics.usersWithoutEmployee} warn={metrics.usersWithoutEmployee > 0} />
            <DetailRow label="User nie eingeloggt" value={metrics.usersNeverLoggedIn} warn={metrics.usersNeverLoggedIn > 0} />
            <DetailRow label="User ohne GDPR-Consent" value={metrics.usersWithoutGdpr} warn={metrics.usersWithoutGdpr > 3} />
          </CardContent>
        </Card>

        {/* Competency & Learning Data */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Kompetenzdaten & Lernen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Kompetenz-Definitionen" value={metrics.totalCompetencies} />
            <DetailRow label="Employee-Bewertungen" value={metrics.totalEmployeeCompetencies} />
            <DetailRow label="Veröffentlichte Role Profiles" value={metrics.totalRoleProfiles - metrics.unpublishedProfiles} />
            <DetailRow label="Unveröffentlichte Role Profiles" value={metrics.unpublishedProfiles} warn={metrics.unpublishedProfiles > 0} />
            <Separator />
            <DetailRow label="Lernpfade gesamt" value={metrics.totalLearningPaths} />
            <DetailRow label="Aktive Lernpfade" value={metrics.activeLearningPaths} />
            <DetailRow label="Abgeschlossene Lernpfade" value={metrics.completedLearningPaths} />
            <DetailRow label="KI-generierte Lernpfade" value={metrics.aiGeneratedPaths} />
          </CardContent>
        </Card>

        {/* Audit & Compliance */}
        <Card className="glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Audit & Compliance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Audit Log Einträge" value={metrics.auditLogCount} />
            <DetailRow label="Aktionen (letzte 24h)" value={metrics.actionsLast24h} />
            <Separator />
            <DetailRow label="GDPR-Anfragen (ausstehend)" value={metrics.pendingGdpr} warn={metrics.pendingGdpr > 0} />
            <DetailRow label="GDPR-Anfragen (überfällig)" value={metrics.overdueGdpr} error={metrics.overdueGdpr > 0} />
            <Separator />
            <DetailRow label="Zertifikate gesamt" value={metrics.totalCerts} />
            <DetailRow label="Unverarbeitete Zertifikate" value={metrics.unprocessedCerts} warn={metrics.unprocessedCerts > 0} />
            <DetailRow label="Fehlgeschlagene Analysen" value={metrics.failedCerts} error={metrics.failedCerts > 0} />
          </CardContent>
        </Card>
      </div>

      {/* Data Integrity Table */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            Datenbank-Übersicht
          </CardTitle>
          <CardDescription>Zeilenanzahl pro Tabelle</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tabelle</TableHead>
                <TableHead className="text-right">Einträge</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <DbRow label="organizations" count={metrics.totalOrgs} />
              <DbRow label="user_profiles" count={metrics.totalUsers} />
              <DbRow label="employees" count={(allEmployees?.length || 0)} />
              <DbRow label="role_profiles" count={metrics.totalRoleProfiles} />
              <DbRow label="competencies" count={metrics.totalCompetencies} />
              <DbRow label="employee_competencies" count={metrics.totalEmployeeCompetencies} />
              <DbRow label="learning_paths" count={metrics.totalLearningPaths} />
              <DbRow label="certifications" count={metrics.totalCerts} />
              <DbRow label="audit_log" count={metrics.auditLogCount} />
              <DbRow label="gdpr_requests" count={gdprRequests?.length || 0} />
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <Card className="glass">
      <CardContent className="p-4 flex flex-col items-center text-center gap-1">
        {icon}
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value, warn, error: isError }: { label: string; value: number | string; warn?: boolean; error?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${isError ? 'text-destructive' : warn ? 'text-amber-500' : 'text-foreground'}`}>
        {value}
      </span>
    </div>
  );
}

function DbRow({ label, count }: { label: string; count: number }) {
  return (
    <TableRow>
      <TableCell className="font-mono text-sm">{label}</TableCell>
      <TableCell className="text-right">{count.toLocaleString('de-DE')}</TableCell>
      <TableCell className="text-right">
        <Badge variant="outline" className="text-xs">
          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
          OK
        </Badge>
      </TableCell>
    </TableRow>
  );
}
