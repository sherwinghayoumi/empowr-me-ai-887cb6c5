import { useState } from "react";
import { Header } from "@/components/Header";
import { SkillRadialChart } from "@/components/SkillRadialChart";
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
import { Users, TrendingUp, BookOpen } from "lucide-react";
import {
  employees,
  roles,
  teams,
  getEmployeesByRole,
  getRoleById,
  roleSkillTemplates,
  getSkillById,
  getSkillLevel,
  type Employee,
} from "@/data/mockData";

const AdminDashboard = () => {
  const [selectedRoleId, setSelectedRoleId] = useState("junior-associate");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Calculate overall company skill level
  const overallScore = Math.round(
    employees.reduce((sum, e) => sum + e.overallScore, 0) / employees.length
  );

  // Get employees by selected role
  const roleEmployees = getEmployeesByRole(selectedRoleId);
  const selectedRole = getRoleById(selectedRoleId);

  // Get role skill template for "Employee of Tomorrow"
  const roleTemplate = roleSkillTemplates[selectedRoleId] || [];

  // Calculate average current and future demand for the role
  const avgCurrentDemand = roleTemplate.length > 0
    ? Math.round(roleTemplate.reduce((sum, t) => sum + t.currentBenchmark, 0) / roleTemplate.length)
    : 0;
  const avgFutureDemand = roleTemplate.length > 0
    ? Math.round(roleTemplate.reduce((sum, t) => sum + t.futureBenchmark, 0) / roleTemplate.length)
    : 0;

  // Active learning paths count
  const activeLearningPaths = employees.reduce(
    (sum, e) => sum + e.learningPaths.filter((lp) => lp.progress < 100).length,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />

      <main className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <ScrollReveal delay={0}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Employees</p>
                    <p className="text-3xl font-bold text-foreground">
                      <AnimatedCounter value={employees.length} duration={1500} />
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
                    <p className="text-sm text-muted-foreground">Avg. Competency Level</p>
                    <p className="text-3xl font-bold text-foreground">
                      <AnimatedCounter value={overallScore} duration={1500} />
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[hsl(var(--skill-very-strong))]/20 flex items-center justify-center group">
                    <TrendingUp className="w-6 h-6 text-[hsl(var(--skill-very-strong))] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1" />
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
                    <p className="text-sm text-muted-foreground">Learning Paths</p>
                    <p className="text-3xl font-bold text-foreground">
                      <AnimatedCounter value={activeLearningPaths} duration={1500} delay={300} />
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
                  {teams.map((team) => (
                    <div 
                      key={team.id} 
                      className="flex items-center justify-between text-sm p-2 rounded-lg hover:bg-secondary/30 transition-colors cursor-pointer group"
                    >
                      <span className="text-muted-foreground group-hover:text-foreground transition-colors">{team.name}</span>
                      <span className="font-medium text-foreground">
                        {team.averageScore}%
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
                  <GlassCardTitle className="text-foreground">{selectedRole?.name || "Role"}</GlassCardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Employee Development / Competency Gap Analysis
                  </p>
                </div>
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger className="w-48 glass">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass">
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
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
                <div className="space-y-4">
                  {roleEmployees.length > 0 ? (
                    roleEmployees.map((employee, index) => (
                      <ScrollReveal key={employee.id} delay={index * 50} direction="left">
                        <button
                          onClick={() => setSelectedEmployee(employee)}
                          className="w-full flex items-center gap-4 p-2 rounded-lg hover:bg-secondary/30 hover:scale-[1.01] transition-all duration-200 text-left group"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary transition-transform duration-200 group-hover:scale-110">
                            {employee.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div className="w-32 truncate">
                            <span className="text-sm text-foreground">{employee.name}</span>
                          </div>
                          <div className="flex-1">
                            <SkillProgressBar 
                              value={employee.overallScore} 
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
                  {selectedRole?.name || "Role"} - Required Skills
                </p>
              </GlassCardHeader>
              <GlassCardContent>
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center group">
                    <Users className="w-8 h-8 text-primary transition-transform duration-300 group-hover:scale-110" />
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground mb-3">
                      <span className="col-span-2">Skill</span>
                      <span className="text-center">Current Demand</span>
                      <span className="text-center">Future Demand</span>
                    </div>
                    <div className="space-y-3">
                      {roleTemplate.map((item, index) => {
                        const skill = getSkillById(item.skillId);
                        const currentLevel = getSkillLevel(item.currentBenchmark);
                        const futureLevel = getSkillLevel(item.futureBenchmark);
                        return (
                          <ScrollReveal key={item.skillId} delay={index * 50}>
                            <div className="grid grid-cols-4 gap-2 items-center p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                              <span className="text-sm text-foreground truncate col-span-2">
                                {skill?.name || item.skillId}
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
                      })}
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
                <button className="w-full p-4 rounded-lg bg-primary text-primary-foreground text-left hover:bg-primary/90 hover:translate-x-1 transition-all duration-200 group">
                  <span className="group-hover:ml-1 transition-all duration-200">Future Role-Skill-Matrix für Senior Associate</span>
                </button>
                <button className="w-full p-4 rounded-lg bg-secondary/50 backdrop-blur text-foreground text-left hover:bg-secondary/70 hover:translate-x-1 transition-all duration-200 group">
                  <span className="group-hover:ml-1 transition-all duration-200">Legal Tech AI Integration - Q1 2025 Update</span>
                </button>
                <button className="w-full p-4 rounded-lg bg-secondary/50 backdrop-blur text-foreground text-left hover:bg-secondary/70 hover:translate-x-1 transition-all duration-200 group">
                  <span className="group-hover:ml-1 transition-all duration-200">EU AI Act Compliance Requirements</span>
                </button>
                <button className="w-full p-4 rounded-lg bg-secondary/50 backdrop-blur text-foreground text-left hover:bg-secondary/70 hover:translate-x-1 transition-all duration-200 group">
                  <span className="group-hover:ml-1 transition-all duration-200">ESG Due Diligence - New Standards 2025</span>
                </button>
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
              <div className="grid md:grid-cols-3 gap-6">
                {teams.map((team, teamIndex) => {
                  const teamLeader = employees.find((e) => e.id === team.leaderId);
                  const teamMembers = employees.filter((e) => team.memberIds.includes(e.id));
                  return (
                    <ScrollReveal key={team.id} delay={teamIndex * 100}>
                      <div className="p-4 rounded-lg bg-secondary/30 backdrop-blur border border-border/50 hover:border-primary/30 hover:bg-secondary/50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-foreground">{team.name}</h3>
                          <Badge variant="secondary" className="backdrop-blur">
                            {team.averageScore}%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Lead: {teamLeader?.name || "N/A"}
                        </p>
                        <div className="space-y-2">
                          {teamMembers.slice(0, 4).map((member) => (
                            <button
                              key={member.id}
                              onClick={() => setSelectedEmployee(member)}
                              className="w-full flex items-center gap-2 text-sm hover:bg-background/50 p-1 rounded transition-all duration-200 group"
                            >
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary transition-transform duration-200 group-hover:scale-110">
                                {member.name.split(" ").map(n => n[0]).join("")}
                              </div>
                              <span className="text-foreground flex-1 truncate text-left">{member.name}</span>
                              <span className="text-muted-foreground">{member.overallScore}%</span>
                            </button>
                          ))}
                          {teamMembers.length > 4 && (
                            <p className="text-xs text-muted-foreground">
                              +{teamMembers.length - 4} more
                            </p>
                          )}
                        </div>
                      </div>
                    </ScrollReveal>
                  );
                })}
              </div>
            </GlassCardContent>
          </GlassCard>
        </ScrollReveal>
      </main>

      {/* Employee Profile Dialog */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass">
          {selectedEmployee && (
            <EmployeeProfile 
              employee={selectedEmployee} 
              onClose={() => setSelectedEmployee(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
