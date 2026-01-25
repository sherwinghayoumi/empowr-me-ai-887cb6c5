import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  UserCheck,
  Shield,
  Plus,
  FileText,
  ClipboardList,
  Clock,
  AlertTriangle,
  Activity,
  HardDrive,
  MoreHorizontal,
  Eye,
  Edit,
  UserCog,
  TrendingUp,
  TrendingDown,
  FileWarning,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Dashboard = () => {
  const { profile } = useAuth();

  // Fetch organizations with counts
  const { data: organizations, isLoading: orgsLoading } = useQuery({
    queryKey: ['super-admin-dashboard-orgs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch employee counts per organization
  const { data: employeeCounts } = useQuery({
    queryKey: ['super-admin-employee-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('organization_id')
        .eq('is_active', true);

      if (error) throw error;
      
      // Group by organization
      const counts: Record<string, number> = {};
      data?.forEach(emp => {
        counts[emp.organization_id] = (counts[emp.organization_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Fetch all users count
  const { data: usersCount } = useQuery({
    queryKey: ['super-admin-users-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch total employees
  const { data: totalEmployees } = useQuery({
    queryKey: ['super-admin-employees-total'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch pending GDPR requests
  const { data: gdprRequests } = useQuery({
    queryKey: ['super-admin-gdpr-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gdpr_requests')
        .select('*, organizations(name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch recent audit log
  const { data: recentActivity } = useQuery({
    queryKey: ['super-admin-recent-activity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*, user_profiles(full_name, email, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const activeOrgs = organizations?.filter(o => o.subscription_status === 'active').length || 0;
  const trialOrgs = organizations?.filter(o => o.subscription_status === 'trial').length || 0;
  const pendingGdpr = gdprRequests?.length || 0;

  // Expiring subscriptions (mock - would need subscription_ends_at comparison)
  const expiringSubscriptions = organizations?.filter(o => {
    if (!o.subscription_ends_at) return false;
    const daysUntilExpiry = Math.floor((new Date(o.subscription_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  }) || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Aktiv</Badge>;
      case 'trial':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Trial</Badge>;
      case 'paused':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pausiert</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-muted-foreground">Gekündigt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return 'gerade eben';
    if (seconds < 3600) return `vor ${Math.floor(seconds / 60)} Min.`;
    if (seconds < 86400) return `vor ${Math.floor(seconds / 3600)} Std.`;
    return `vor ${Math.floor(seconds / 86400)} Tagen`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Willkommen zurück, {profile?.full_name || 'Super Admin'}
        </h1>
        <p className="text-muted-foreground">
          Hier ist der aktuelle Systemstatus und offene Aufgaben.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/super-admin/organizations">
          <Card className="glass hover:bg-card/80 transition-colors cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Organisationen</p>
                  <p className="text-3xl font-bold text-foreground">{organizations?.length || 0}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{activeOrgs} Aktiv</Badge>
                    <Badge variant="outline" className="text-xs text-primary border-primary/30">{trialOrgs} Trial</Badge>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/super-admin/users">
          <Card className="glass hover:bg-card/80 transition-colors cursor-pointer group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Benutzer</p>
                  <p className="text-3xl font-bold text-foreground">{usersCount || 0}</p>
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-500" />
                    Systemweit registriert
                  </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-secondary/50 flex items-center justify-center group-hover:bg-secondary transition-colors">
                  <Users className="w-6 h-6 text-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="glass">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Mitarbeiter</p>
                <p className="text-3xl font-bold text-foreground">{totalEmployees || 0}</p>
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-primary" />
                  Aktive Profile
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Activity className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Link to="/super-admin/audit-log">
          <Card className={`glass hover:bg-card/80 transition-colors cursor-pointer group ${pendingGdpr > 0 ? 'border-destructive/50' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">GDPR Anfragen</p>
                  <p className="text-3xl font-bold text-foreground">{pendingGdpr}</p>
                  <p className={`text-xs mt-2 flex items-center gap-1 ${pendingGdpr > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {pendingGdpr > 0 ? (
                      <>
                        <AlertTriangle className="w-3 h-3" />
                        Ausstehend
                      </>
                    ) : (
                      <>
                        <Shield className="w-3 h-3 text-emerald-500" />
                        Keine offenen
                      </>
                    )}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pendingGdpr > 0 ? 'bg-destructive/20' : 'bg-emerald-500/10'}`}>
                  <Shield className={`w-6 h-6 ${pendingGdpr > 0 ? 'text-destructive' : 'text-emerald-500'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card className="glass">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Schnellzugriff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/super-admin/organizations">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Neue Organisation</p>
                    <p className="text-xs text-muted-foreground">Kunde anlegen</p>
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/super-admin/reports">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Neuer Report</p>
                    <p className="text-xs text-muted-foreground">Quarterly hochladen</p>
                  </div>
                </div>
              </Link>
            </Button>

            <Button variant="outline" className="justify-start h-auto py-4" asChild>
              <Link to="/super-admin/role-profiles">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Role Profiles</p>
                    <p className="text-xs text-muted-foreground">Profile aktualisieren</p>
                  </div>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Organizations Table */}
        <Card className="glass lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-lg">Organisationen</CardTitle>
              <CardDescription>Alle aktiven Kunden im Überblick</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/super-admin/organizations" className="gap-1">
                Alle anzeigen
                <ChevronRight className="w-4 h-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organisation</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Mitarbeiter</TableHead>
                  <TableHead className="hidden lg:table-cell">Max</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgsLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Lade Organisationen...
                    </TableCell>
                  </TableRow>
                ) : organizations?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Keine Organisationen gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  organizations?.slice(0, 5).map((org) => {
                    const empCount = employeeCounts?.[org.id] || 0;
                    const usagePercent = org.max_employees ? Math.round((empCount / org.max_employees) * 100) : 0;
                    return (
                      <TableRow key={org.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarImage src={org.logo_url || undefined} />
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {org.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{org.name}</p>
                              <p className="text-xs text-muted-foreground">{org.slug}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(org.subscription_status || 'trial')}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{empCount}</span>
                            <Progress value={usagePercent} className="w-16 h-1.5" />
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {org.max_employees}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                Anzeigen
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Bearbeiten
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <UserCog className="w-4 h-4 mr-2" />
                                Impersonate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* System Health */}
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Storage</span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress value={34} className="w-20 h-1.5" />
                  <span className="text-xs text-muted-foreground">34%</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Aktive Sessions</span>
                </div>
                <Badge variant="outline">12</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Fehler (24h)</span>
                </div>
                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30">0</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Ausstehende Aktionen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingGdpr > 0 && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{pendingGdpr} GDPR {pendingGdpr === 1 ? 'Anfrage' : 'Anfragen'}</p>
                      <p className="text-xs text-muted-foreground">Warten auf Bearbeitung</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Anzeigen
                    </Button>
                  </div>
                </div>
              )}

              {expiringSubscriptions.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-amber-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{expiringSubscriptions.length} Ablaufende Abos</p>
                      <p className="text-xs text-muted-foreground">In den nächsten 30 Tagen</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs">
                      Anzeigen
                    </Button>
                  </div>
                </div>
              )}

              {pendingGdpr === 0 && expiringSubscriptions.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <Shield className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                  <p className="text-sm">Alles erledigt!</p>
                  <p className="text-xs">Keine ausstehenden Aktionen</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="glass">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Letzte Aktivitäten</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity?.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Keine Aktivitäten</p>
              ) : (
                recentActivity?.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 py-2">
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={activity.user_profiles?.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px] bg-muted">
                        {activity.user_profiles?.full_name?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        <span className="font-medium">
                          {activity.user_profiles?.full_name || 'System'}
                        </span>
                        <span className="text-muted-foreground"> • {activity.action}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.created_at || '')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
