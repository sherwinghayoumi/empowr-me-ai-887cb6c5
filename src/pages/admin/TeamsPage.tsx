import { useState } from "react";
import { Header } from "@/components/Header";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import { ScrollReveal } from "@/components/ScrollReveal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Archive, Users } from "lucide-react";
import { useTeams, useCreateTeam, useUpdateTeam, useDeleteTeam, useArchiveTeam, useEmployees } from "@/hooks/useOrgData";
import { TeamFormDialog } from "@/components/teams/TeamFormDialog";
import { TeamCard } from "@/components/teams/TeamCard";
import { DeleteTeamDialog } from "@/components/teams/DeleteTeamDialog";

interface TeamFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  tags: string[];
  priority: number;
  isArchived: boolean;
  members: { employeeId: string; employeeName: string; role: string }[];
}

interface TeamData {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  tags?: string[] | null;
  priority?: number | null;
  is_archived?: boolean | null;
  average_score?: number | null;
  member_count?: number | null;
  members?: Array<{
    id: string;
    full_name: string;
    avatar_url?: string | null;
    overall_score?: number | null;
    team_role?: string | null;
    role_profile?: { role_title?: string } | null;
  }> | null;
}

const TeamsPage = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  
  const { data: teams, isLoading } = useTeams(showArchived);
  const { data: employees } = useEmployees();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();
  const archiveTeam = useArchiveTeam();

  const handleOpenCreate = () => {
    setSelectedTeam(null);
    setFormDialogOpen(true);
  };

  const handleEdit = (team: TeamData) => {
    setSelectedTeam(team);
    setFormDialogOpen(true);
  };

  const handleArchive = async (team: TeamData) => {
    await archiveTeam.mutateAsync({ 
      teamId: team.id, 
      archive: !team.is_archived 
    });
  };

  const handleDeleteClick = (team: TeamData) => {
    setSelectedTeam(team);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedTeam) {
      await deleteTeam.mutateAsync(selectedTeam.id);
      setDeleteDialogOpen(false);
      setSelectedTeam(null);
    }
  };

  const handleFormSubmit = async (data: TeamFormData) => {
    const payload = {
      name: data.name,
      description: data.description || null,
      color: data.color,
      icon: data.icon,
      tags: data.tags,
      priority: data.priority,
      members: data.members.map(m => ({ employeeId: m.employeeId, role: m.role })),
    };

    if (selectedTeam) {
      await updateTeam.mutateAsync({ 
        ...payload, 
        id: selectedTeam.id,
        isArchived: data.isArchived 
      });
    } else {
      await createTeam.mutateAsync(payload);
    }
    setFormDialogOpen(false);
    setSelectedTeam(null);
  };

  // Prepare initial data for edit mode
  const getInitialFormData = (): Partial<TeamFormData> & { id?: string } | undefined => {
    if (!selectedTeam) return undefined;
    return {
      id: selectedTeam.id,
      name: selectedTeam.name,
      description: selectedTeam.description || "",
      color: selectedTeam.color || "#6366f1",
      icon: selectedTeam.icon || "Users",
      tags: selectedTeam.tags || [],
      priority: selectedTeam.priority || 0,
      isArchived: selectedTeam.is_archived || false,
      members: selectedTeam.members?.map(m => ({
        employeeId: m.id,
        employeeName: m.full_name,
        role: m.team_role || ""
      })) || []
    };
  };

  // Filter teams based on archive status
  const displayedTeams = teams?.filter(t => showArchived ? t.is_archived : !t.is_archived) || [];
  const archivedCount = teams?.filter(t => t.is_archived).length || 0;

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
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-foreground">Teams</h1>
              <Tabs value={showArchived ? "archived" : "active"} onValueChange={(v) => setShowArchived(v === "archived")}>
                <TabsList>
                  <TabsTrigger value="active" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Aktiv
                  </TabsTrigger>
                  <TabsTrigger value="archived" className="flex items-center gap-2">
                    <Archive className="w-4 h-4" />
                    Archiviert
                    {archivedCount > 0 && (
                      <span className="ml-1 text-xs bg-secondary px-1.5 py-0.5 rounded-full">
                        {archivedCount}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Button onClick={handleOpenCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Team hinzufügen
            </Button>
          </div>
        </ScrollReveal>

        {displayedTeams.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary/50 flex items-center justify-center">
              {showArchived ? <Archive className="w-8 h-8 text-muted-foreground" /> : <Users className="w-8 h-8 text-muted-foreground" />}
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {showArchived ? "Keine archivierten Teams" : "Noch keine Teams erstellt"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {showArchived 
                ? "Archivierte Teams werden hier angezeigt."
                : "Erstellen Sie Ihr erstes Team, um Mitarbeiter zu organisieren."
              }
            </p>
            {!showArchived && (
              <Button onClick={handleOpenCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Erstes Team erstellen
              </Button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTeams.map((team, index) => (
              <ScrollReveal key={team.id} delay={index * 100}>
                <TeamCard
                  team={team}
                  index={index}
                  onMemberClick={setSelectedEmployeeId}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onDelete={handleDeleteClick}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
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

      {/* Team Form Dialog (Create/Edit) */}
      <TeamFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={handleFormSubmit}
        initialData={getInitialFormData()}
        employees={employees?.map(e => ({
          id: e.id,
          full_name: e.full_name,
          team_id: e.team?.id || null,
          team_role: (e as any).team_role,
          role_profile: e.role_profile
        })) || []}
        isLoading={createTeam.isPending || updateTeam.isPending}
        mode={selectedTeam ? "edit" : "create"}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteTeamDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        teamName={selectedTeam?.name || ""}
        memberCount={selectedTeam?.members?.length || 0}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteTeam.isPending}
      />
    </div>
  );
};

export default TeamsPage;
