import { useState } from "react";
import { Header } from "@/components/Header";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { teams, employees, getRoleById, type Employee } from "@/data/mockData";

const TeamsPage = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      <main className="container py-8">
        <ScrollReveal>
          <h1 className="text-3xl font-bold text-foreground mb-8">Teams</h1>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team, index) => {
            const teamMembers = employees.filter((e) => team.memberIds.includes(e.id) || e.id === team.leaderId);
            const leader = employees.find((e) => e.id === team.leaderId);
            return (
              <ScrollReveal key={team.id} delay={index * 100}>
                <GlassCard className="hover-lift h-full">
                  <GlassCardHeader>
                    <div className="flex items-center justify-between">
                      <GlassCardTitle className="text-foreground flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/20 group">
                          <Users className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                        </div>
                        {team.name}
                      </GlassCardTitle>
                      <Badge className="backdrop-blur">
                        <AnimatedCounter value={team.averageScore} suffix="%" duration={1500} delay={index * 100} />
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Lead: {leader?.name}</p>
                  </GlassCardHeader>
                  <GlassCardContent className="space-y-2">
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => setSelectedEmployee(member)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-all duration-200 text-left group"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary transition-transform duration-200 group-hover:scale-110">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{getRoleById(member.roleId)?.name}</p>
                        </div>
                        <span className="text-sm text-muted-foreground">{member.overallScore}%</span>
                      </button>
                    ))}
                  </GlassCardContent>
                </GlassCard>
              </ScrollReveal>
            );
          })}
        </div>
      </main>
      <Dialog open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass">
          {selectedEmployee && <EmployeeProfile employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamsPage;
