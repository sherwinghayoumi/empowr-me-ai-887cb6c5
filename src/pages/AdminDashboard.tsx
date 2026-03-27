import { useState } from "react";
import { SkillProgressBar } from "@/components/SkillProgressBar";
import { DemandIndicator } from "@/components/DemandIndicator";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import { GrowthJourneyChart } from "@/components/GrowthJourneyChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, BookOpen, Building2 } from "lucide-react";
import { useEmployees, useTeams, useRoleProfilesPublished, useOrgStats, useQuarterlyReports } from "@/hooks/useOrgData";
import { useAuth } from "@/contexts/AuthContext";
import { getSkillLevel } from "@/lib/utils";

// Type for employee from database
interface DbEmployee {
  id: string;
  full_name: string;
  overall_score: number | null;
  avatar_url: string | null;
  role_profile: {
    id: string;
    role_title: string;
    role_key: string;
  } | null;
  team: {
    id: string;
    name: string;
  } | null;
  competencies: Array<{
    id: string;
    current_level: number | null;
    demanded_level: number | null;
    future_level: number | null;
    gap_to_current: number | null;
    competency: {
      id: string;
      name: string;
      status: string | null;
      cluster: {
        name: string;
      } | null;
    } | null;
  }>;
}

const AdminDashboard = () => {
  const { organization } = useAuth();
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<DbEmployee | null>(null);

  // Load data from Supabase
  const { data: stats, isLoading: statsLoading } = useOrgStats();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: roleProfiles, isLoading: rolesLoading } = useRoleProfilesPublished();
  const { data: reports } = useQuarterlyReports();

  // Set default role when profiles load
  const effectiveRoleKey = selectedRoleKey || roleProfiles?.[0]?.role_key || "";

  // Filter employees by role
  const roleEmployees = employees?.filter(e => 
    e.role_profile?.role_key === effectiveRoleKey
  ) || [];

  const selectedRole = roleProfiles?.find(r => r.role_key === effectiveRoleKey);

  // Calculate average demands from role competencies
  const roleCompetencies = selectedRole?.competencies || [];
  const avgCurrentDemand = roleCompetencies.length > 0
    ? Math.round(roleCompetencies.reduce((sum, c) => sum + (c.demand_weight || 50), 0) / roleCompetencies.length)
    : 50;
  const avgFutureDemand = roleCompetencies.length > 0
    ? Math.round(roleCompetencies.reduce((sum, c) => sum + (c.future_demand_max || 70), 0) / roleCompetencies.length)
    : 70;

  // Loading state
  if (statsLoading || employeesLoading || rolesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 animate-skeleton-pulse">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="bg-card/80 border-border/50 animate-skeleton-pulse" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                  <Skeleton className="w-12 h-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Organization Header */}
      {organization && (
        <div className="flex items-center justify-between animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">{organization.name}</h1>
                {organization.subscription_status && (
                  <Badge variant={organization.subscription_status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {organization.subscription_status === 'active' ? 'Aktiv' : organization.subscription_status === 'trial' ? 'Trial' : organization.subscription_status}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {stats?.employeeCount || 0} Mitarbeiter · {stats?.teamCount || 0} Teams
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Mitarbeiter", value: stats?.employeeCount || 0, icon: Users, iconBg: "bg-primary/20", iconColor: "text-primary" },
          { label: "Teams", value: stats?.teamCount || 0, icon: Building2, iconBg: "bg-secondary/50", iconColor: "text-muted-foreground" },
          { label: "Ø Kompetenzniveau", value: `${stats?.avgCompetencyLevel || 0}%`, icon: TrendingUp, iconBg: "bg-[hsl(var(--skill-very-strong))]/20", iconColor: "text-[hsl(var(--skill-very-strong))]" },
          { label: "Lernpfade", value: stats?.activeLearningPaths || 0, icon: BookOpen, iconBg: "bg-primary/20", iconColor: "text-primary" },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <Card className="bg-card/80 border-border/50 hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-3xl font-bold text-foreground tabular-nums">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg ${stat.iconBg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Growth Journey Overview */}
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <Card className="bg-card/80 border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-foreground">Unternehmens-Entwicklung</CardTitle>
              <p className="text-sm text-muted-foreground">ROI & Wachstums-Journey</p>
            </CardHeader>
            <CardContent>
              <GrowthJourneyChart variant="admin" />
              <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                {teamsLoading ? (
                  <Skeleton className="h-20" />
                ) : teams?.map((team) => (
                  <div 
                    key={team.id} 
                    className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer"
                  >
                    <span className="text-muted-foreground">{team.name}</span>
                    <span className="font-medium text-foreground tabular-nums">
                      {Math.round(team.average_score || 0)}%
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee Development / Skill Gap Analysis */}
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <Card className="bg-card/80 border-border/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground">{selectedRole?.role_title || "Rolle wählen"}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Mitarbeiterentwicklung / Kompetenz-Gap-Analyse
                </p>
              </div>
              <Select value={effectiveRoleKey} onValueChange={setSelectedRoleKey}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select role..." />
                </SelectTrigger>
                <SelectContent>
                  {roleProfiles?.map((role) => (
                    <SelectItem key={role.id} value={role.role_key}>
                      {role.role_title}
                      {role.practice_group ? (
                        <span className="text-muted-foreground ml-1 text-xs">— {role.practice_group}</span>
                      ) : null}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4 pb-3 border-b border-border/50">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded bg-primary" />
                  <span>Kompetenzniveau</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-0.5 h-3 bg-[hsl(var(--skill-moderate))]" />
                  <span>Ø Aktuelle Anforderung ({avgCurrentDemand}%)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-0.5 h-3 bg-[hsl(var(--skill-weak))]" />
                  <span>Ø Zukünftige Anforderung ({avgFutureDemand}%)</span>
                </div>
              </div>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {roleEmployees.length > 0 ? (
                  roleEmployees.map((employee) => (
                    <button
                      key={employee.id}
                      onClick={() => setSelectedEmployee(employee)}
                      className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/30 transition-all duration-200 text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                        {employee.full_name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="w-32 truncate">
                        <span className="text-sm text-foreground">{employee.full_name}</span>
                        <p className="text-xs text-muted-foreground truncate">{employee.role_profile?.role_title}</p>
                      </div>
                      <div className="flex-1">
                        <SkillProgressBar 
                          value={Math.round(employee.overall_score || 0)} 
                          currentDemand={avgCurrentDemand}
                          futureDemand={avgFutureDemand}
                          showLabel={true} 
                        />
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Keine Mitarbeiter in dieser Rolle
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Employee of Tomorrow */}
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <Card className="bg-card/80 border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-foreground text-center">
                The "Employee of Tomorrow"
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                {selectedRole?.role_title || "Role"} - Required Skills
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground mb-3">
                    <span className="col-span-2">Competency</span>
                    <span className="text-center">Current</span>
                    <span className="text-center">Future</span>
                  </div>
                  <div className="space-y-3 max-h-[250px] overflow-y-auto">
                    {roleCompetencies.length > 0 ? (
                      roleCompetencies.map((comp, index) => {
                        const currentLevel = getSkillLevel(comp.demand_weight || 50);
                        const futureLevel = getSkillLevel(comp.future_demand_max || 70);
                        return (
                          <div key={comp.id} className="grid grid-cols-4 gap-2 items-center p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                            <span className="text-sm text-foreground truncate col-span-2">
                              {comp.name}
                            </span>
                            <div className="flex justify-center">
                              <DemandIndicator level={currentLevel} showLabel={false} />
                            </div>
                            <div className="flex justify-center">
                              <DemandIndicator level={futureLevel} showLabel={false} />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-muted-foreground text-center py-4 text-sm">
                        No competencies defined for this role
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Latest Future Skill Reports */}
        <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <Card className="bg-card/80 border-border/50 h-full">
            <CardHeader>
              <CardTitle className="text-foreground text-center">
                Aktuelle Future Skill Berichte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {reports && reports.length > 0 ? (
                reports.slice(0, 4).map((report, index) => (
                  <button 
                    key={report.id}
                    className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                      index === 0 
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                        : 'bg-secondary/50 text-foreground hover:bg-secondary/70'
                    }`}
                  >
                    <span>{report.title}</span>
                    <p className={`text-xs mt-1 ${index === 0 ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      Q{report.quarter} {report.year}
                    </p>
                  </button>
                ))
              ) : (
                <>
                  <button className="w-full p-4 rounded-lg bg-primary text-primary-foreground text-left hover:bg-primary/90 transition-all duration-200">
                    <span>Future Role-Skill-Matrix für Senior Associate</span>
                  </button>
                  <button className="w-full p-4 rounded-lg bg-secondary/50 text-foreground text-left hover:bg-secondary/70 transition-all duration-200">
                    <span>Legal Tech AI Integration - Q1 2025 Update</span>
                  </button>
                  <button className="w-full p-4 rounded-lg bg-secondary/50 text-foreground text-left hover:bg-secondary/70 transition-all duration-200">
                    <span>EU AI Act Compliance Requirements</span>
                  </button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Teams Overview */}
      <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <Card className="bg-card/80 border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground">Team-Übersicht</CardTitle>
          </CardHeader>
          <CardContent>
            {teamsLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : teams && teams.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <div key={team.id} className="p-4 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 hover:bg-secondary/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">{team.name}</h3>
                      <Badge variant="secondary">
                        <span className="tabular-nums">{Math.round(team.average_score || 0)}%</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {team.member_count || 0} Mitglieder
                    </p>
                    <div className="space-y-2">
                      {team.members?.slice(0, 4).map((member) => (
                        <button
                          key={member.id}
                          onClick={() => {
                            const fullEmployee = employees?.find(e => e.id === member.id);
                            if (fullEmployee) setSelectedEmployee(fullEmployee);
                          }}
                          className="w-full flex items-center gap-2 text-sm hover:bg-background/50 p-1 rounded transition-all duration-200"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary">
                            {member.full_name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <span className="text-foreground flex-1 truncate text-left">{member.full_name}</span>
                          <span className="text-muted-foreground tabular-nums">{Math.round(member.overall_score || 0)}%</span>
                        </button>
                      ))}
                      {(team.members?.length || 0) > 4 && (
                        <p className="text-xs text-muted-foreground">
                          +{(team.members?.length || 0) - 4} weitere
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Keine Teams gefunden</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee Profile Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedEmployee && (
            <EmployeeProfile 
              employeeId={selectedEmployee.id}
              onClose={() => setSelectedEmployee(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
