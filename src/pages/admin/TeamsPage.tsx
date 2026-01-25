import { useState } from "react";
import { Header } from "@/components/Header";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { useTeams } from "@/hooks/useOrgData";

const TeamsPage = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const { data: teams, isLoading } = useTeams();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <main className="container py-8">
          <Skeleton className="h-10 w-32 mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      <main className="container py-8">
        <ScrollReveal>
          <h1 className="text-3xl font-bold text-foreground mb-8">Teams</h1>
        </ScrollReveal>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams?.map((team, index) => (
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
                      <AnimatedCounter value={Math.round(team.average_score || 0)} suffix="%" duration={1500} delay={index * 100} />
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {team.member_count || team.members?.length || 0} Mitglieder
                  </p>
                </GlassCardHeader>
                <GlassCardContent className="space-y-2">
                  {team.members?.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedEmployeeId(member.id)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-all duration-200 text-left group"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary transition-transform duration-200 group-hover:scale-110">
                        {member.full_name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{member.full_name}</p>
                        <p className="text-xs text-muted-foreground">{(member as any).role_profile?.role_title}</p>
                      </div>
                      <span className="text-sm text-muted-foreground">{Math.round(member.overall_score || 0)}%</span>
                    </button>
                  ))}
                  {(!team.members || team.members.length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Keine Mitglieder in diesem Team
                    </p>
                  )}
                </GlassCardContent>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>
      </main>
      <Dialog open={!!selectedEmployeeId} onOpenChange={() => setSelectedEmployeeId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass">
          {selectedEmployeeId && (
            <EmployeeProfile 
              employeeId={selectedEmployeeId} 
              onClose={() => setSelectedEmployeeId(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamsPage;
