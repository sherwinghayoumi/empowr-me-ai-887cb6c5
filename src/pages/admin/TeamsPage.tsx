import { useState } from "react";
import { Header } from "@/components/Header";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus } from "lucide-react";
import { useTeams, useCreateTeam } from "@/hooks/useOrgData";
import { toast } from "sonner";

const TeamsPage = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [addTeamDialogOpen, setAddTeamDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const { data: teams, isLoading } = useTeams();
  const createTeam = useCreateTeam();

  const handleAddTeam = async () => {
    if (!newTeamName.trim()) {
      toast.error("Bitte geben Sie einen Team-Namen ein");
      return;
    }
    
    try {
      await createTeam.mutateAsync({
        name: newTeamName.trim(),
        description: newTeamDescription.trim() || null,
      });
      setAddTeamDialogOpen(false);
      setNewTeamName("");
      setNewTeamDescription("");
    } catch (error) {
      // Error handled by mutation
    }
  };

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
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">Teams</h1>
            <Button onClick={() => setAddTeamDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Team hinzufügen
            </Button>
          </div>
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
      {/* Employee Profile Dialog */}
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

      {/* Add Team Dialog */}
      <Dialog open={addTeamDialogOpen} onOpenChange={setAddTeamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neues Team erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="team-name">Team Name *</Label>
              <Input
                id="team-name"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="z.B. Corporate Advisory"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-description">Beschreibung (optional)</Label>
              <Textarea
                id="team-description"
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
                placeholder="Kurze Beschreibung des Teams..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddTeamDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleAddTeam} disabled={createTeam.isPending}>
              {createTeam.isPending ? "Erstelle..." : "Team erstellen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamsPage;
