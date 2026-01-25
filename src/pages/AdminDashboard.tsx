import { useState } from "react";
import { Header } from "@/components/Header";
import { SkillProgressBar } from "@/components/SkillProgressBar";
import { DemandIndicator } from "@/components/DemandIndicator";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GrowthJourneyChart } from "@/components/GrowthJourneyChart";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
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
import { getSkillLevel } from "@/data/mockData";

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
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <main className="container py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl lg:col-span-2" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />

      <main className="container py-8">
        {/* Organization Header */}
        {organization && (
          <ScrollReveal>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{organization.name}</h1>
                <p className="text-sm text-muted-foreground">Admin Dashboard</p>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <ScrollReveal delay={0}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Employees</p>
                    <p className="text-3xl font-bold text-foreground">
                      <AnimatedCounter value={stats?.employeeCount || 0} duration={1500} />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group">
                    <Users className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>

          <ScrollReveal delay={100}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Teams</p>
                    <p className="text-3xl font-bold text-foreground">
                      <AnimatedCounter value={stats?.teamCount || 0} duration={1500} />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-secondary/50 flex items-center justify-center group">
                    <Building2 className="w-6 h-6 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Competency Level</p>
                    <p className="text-3xl font-bold text-foreground">
                      <AnimatedCounter value={stats?.avgCompetencyLevel || 0} duration={1500} />%
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[hsl(var(--skill-very-strong))]/20 flex items-center justify-center group">
                    <TrendingUp className="w-6 h-6 text-[hsl(var(--skill-very-strong))] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1" />
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Learning Paths</p>
                    <p className="text-3xl font-bold text-foreground">
                      <AnimatedCounter value={stats?.activeLearningPaths || 0} duration={1500} delay={300} />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group">
                    <BookOpen className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Growth Journey Overview */}
          <ScrollReveal delay={100} direction="left">
            <GlassCard className="hover-glow h-full">
              <GlassCardHeader>
                <GlassCardTitle className="text-foreground">Unternehmens-Entwicklung</GlassCardTitle>
                <p className="text-sm text-muted-foreground">ROI & Wachstums-Journey</p>
              </GlassCardHeader>
              <GlassCardContent>
                <GrowthJourneyChart variant="admin" />
                <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                  {teamsLoading ? (
                    <Skeleton className="h-20" />
                  ) : teams?.map((team) => (
                    <div 
                      key={team.id} 
                      className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer group"
                    >
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">{team.name}</span>
                      <span className="font-medium text-foreground">
                        {Math.round(team.average_score || 0)}%
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>

          {/* Employee Development / Skill Gap Analysis */}
          <ScrollReveal delay={200} direction="right" className="lg:col-span-2">
            <GlassCard className="hover-glow h-full">
              <GlassCardHeader className="flex flex-row items-center justify-between">
                <div>
                  <GlassCardTitle className="text-foreground">{selectedRole?.role_title || "Select Role"}</GlassCardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Employee Development / Competency Gap Analysis
                  </p>
                </div>
                <Select value={effectiveRoleKey} onValueChange={setSelectedRoleKey}>
                  <SelectTrigger className="w-48 glass">
                    <SelectValue placeholder="Select role..." />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {roleProfiles?.map((role) => (
                      <SelectItem key={role.id} value={role.role_key}>
                        {role.role_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </GlassCardHeader>
              <GlassCardContent>
                {/* Legend */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground mb-4 pb-3 border-b border-border/50">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-primary" />
                    <span>Competency Level</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-0.5 h-3 bg-[hsl(var(--skill-moderate))]" />
                    <span>Ø Current Demand ({avgCurrentDemand}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-0.5 h-3 bg-[hsl(var(--skill-weak))]" />
                    <span>Ø Future Demand ({avgFutureDemand}%)</span>
                  </div>
                </div>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {roleEmployees.length > 0 ? (
                    roleEmployees.map((employee, index) => (
                      <ScrollReveal key={employee.id} delay={index * 50} direction="left">
                        <button
                          onClick={() => setSelectedEmployee(employee)}
                          className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/30 hover:scale-[1.01] transition-all duration-200 text-left group"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary transition-transform duration-200 group-hover:scale-110">
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
                      </ScrollReveal>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No employees in this role
                    </p>
                  )}
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Employee of Tomorrow */}
          <ScrollReveal delay={300} direction="up">
            <GlassCard className="hover-glow h-full">
              <GlassCardHeader>
                <GlassCardTitle className="text-foreground text-center">
                  The "Employee of Tomorrow"
                </GlassCardTitle>
                <p className="text-sm text-muted-foreground text-center">
                  {selectedRole?.role_title || "Role"} - Required Skills
                </p>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group">
                    <Users className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
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
                            <ScrollReveal key={comp.id} delay={index * 50}>
                              <div className="grid grid-cols-4 gap-2 items-center p-2 rounded-lg hover:bg-secondary/30 transition-colors">
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
                            </ScrollReveal>
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
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>

          {/* Latest Future Skill Reports */}
          <ScrollReveal delay={400} direction="up">
            <GlassCard className="hover-glow h-full">
              <GlassCardHeader>
                <GlassCardTitle className="text-foreground text-center">
                  Latest Future Skill Reports
                </GlassCardTitle>
              </GlassCardHeader>
              <GlassCardContent className="space-y-3">
                {reports && reports.length > 0 ? (
                  reports.slice(0, 4).map((report, index) => (
                    <button 
                      key={report.id}
                      className={`w-full p-4 rounded-lg text-left hover:translate-x-1 transition-all duration-200 group ${
                        index === 0 
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                          : 'bg-secondary/50 backdrop-blur text-foreground hover:bg-secondary/70'
                      }`}
                    >
                      <span className="group-hover:ml-1 transition-all duration-200">{report.title}</span>
                      <p className={`text-xs mt-1 ${index === 0 ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        Q{report.quarter} {report.year}
                      </p>
                    </button>
                  ))
                ) : (
                  <>
                    <button className="w-full p-4 rounded-lg bg-primary text-primary-foreground text-left hover:bg-primary/90 hover:translate-x-1 transition-all duration-200 group">
                      <span className="group-hover:ml-1 transition-all duration-200">Future Role-Skill-Matrix für Senior Associate</span>
                    </button>
                    <button className="w-full p-4 rounded-lg bg-secondary/50 backdrop-blur text-foreground text-left hover:bg-secondary/70 hover:translate-x-1 transition-all duration-200 group">
                      <span className="group-hover:ml-1 transition-all duration-200">Legal Tech AI Integration - Q1 2025 Update</span>
                    </button>
                    <button className="w-full p-4 rounded-lg bg-secondary/50 backdrop-blur text-foreground text-left hover:bg-secondary/70 hover:translate-x-1 transition-all duration-200 group">
                      <span className="group-hover:ml-1 transition-all duration-200">EU AI Act Compliance Requirements</span>
                    </button>
                  </>
                )}
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        </div>

        {/* Teams Overview */}
        <ScrollReveal delay={500} direction="up">
          <GlassCard className="mt-6">
            <GlassCardHeader>
              <GlassCardTitle className="text-foreground">Teams Overview</GlassCardTitle>
            </GlassCardHeader>
            <GlassCardContent>
              {teamsLoading ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-48 rounded-xl" />
                  ))}
                </div>
              ) : teams && teams.length > 0 ? (
                <div className="grid md:grid-cols-3 gap-6">
                  {teams.map((team, teamIndex) => (
                    <ScrollReveal key={team.id} delay={teamIndex * 100}>
                      <div className="p-4 rounded-lg bg-secondary/30 backdrop-blur border border-border/50 hover:border-primary/30 hover:bg-secondary/50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-foreground">{team.name}</h3>
                          <Badge variant="secondary" className="backdrop-blur">
                            {Math.round(team.average_score || 0)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {team.member_count || 0} Members
                        </p>
                        <div className="space-y-2">
                          {team.members?.slice(0, 4).map((member) => (
                            <button
                              key={member.id}
                              onClick={() => {
                                const fullEmployee = employees?.find(e => e.id === member.id);
                                if (fullEmployee) setSelectedEmployee(fullEmployee);
                              }}
                              className="w-full flex items-center gap-2 text-sm hover:bg-background/50 p-1 rounded transition-all duration-200 group"
                            >
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary transition-transform duration-200 group-hover:scale-110">
                                {member.full_name.split(" ").map(n => n[0]).join("")}
                              </div>
                              <span className="text-foreground flex-1 truncate text-left">{member.full_name}</span>
                              <span className="text-muted-foreground">{Math.round(member.overall_score || 0)}%</span>
                            </button>
                          ))}
                          {(team.members?.length || 0) > 4 && (
                            <p className="text-xs text-muted-foreground">
                              +{(team.members?.length || 0) - 4} more
                            </p>
                          )}
                        </div>
                      </div>
                    </ScrollReveal>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No teams found</p>
              )}
            </GlassCardContent>
          </GlassCard>
        </ScrollReveal>
      </main>

      {/* Employee Profile Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass">
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
