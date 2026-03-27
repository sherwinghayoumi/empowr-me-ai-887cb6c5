import { useState } from "react";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
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

  const handleOpenCreate = () => { setSelectedTeam(null); setFormDialogOpen(true); };
  const handleEdit = (team: TeamData) => { setSelectedTeam(team); setFormDialogOpen(true); };

  const handleArchive = async (team: TeamData) => {
    await archiveTeam.mutateAsync({ teamId: team.id, archive: !team.is_archived });
  };

  const handleDeleteClick = (team: TeamData) => { setSelectedTeam(team); setDeleteDialogOpen(true); };

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
      await updateTeam.mutateAsync({ ...payload, id: selectedTeam.id, isArchived: data.isArchived });
    } else {
      await createTeam.mutateAsync(payload);
    }
    setFormDialogOpen(false);
    setSelectedTeam(null);
  };

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

  const displayedTeams = teams?.filter(t => showArchived ? t.is_archived : !t.is_archived) || [];
  const archivedCount = teams?.filter(t => t.is_archived).length || 0;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-10 w-44" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-card/80 border-border/50 animate-skeleton-pulse" style={{ animationDelay: `${i * 150}ms` }}>
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex gap-2">
                  {[1,2,3].map(j => <Skeleton key={j} className="w-8 h-8 rounded-full" />)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-foreground tracking-tight">Teams</h1>
            <Tabs value={showArchived ? "archived" : "active"} onValueChange={(v) => setShowArchived(v === "archived")}>
              <TabsList className="h-8">
                <TabsTrigger value="active" className="flex items-center gap-1.5 text-xs h-7 px-2.5">
                  <Users className="w-3.5 h-3.5" />
                  Aktiv
                </TabsTrigger>
                <TabsTrigger value="archived" className="flex items-center gap-1.5 text-xs h-7 px-2.5">
                  <Archive className="w-3.5 h-3.5" />
                  Archiviert
                  {archivedCount > 0 && (
                    <span className="ml-1 text-[10px] bg-secondary px-1.5 py-0.5 rounded-full tabular-nums">
                      {archivedCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Teams organisieren und Budget zuweisen</p>
        </div>
        <Button size="sm" onClick={handleOpenCreate} className="h-8 text-xs">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Team hinzufügen
        </Button>
      </div>

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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTeams.map((team, index) => (
            <div key={team.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
              <TeamCard
                team={team}
                index={index}
                onMemberClick={setSelectedEmployeeId}
                onEdit={handleEdit}
                onArchive={handleArchive}
                onDelete={handleDeleteClick}
              />
            </div>
          ))}
        </div>
      )}

      {/* Employee Profile Dialog */}
      <Dialog open={!!selectedEmployeeId} onOpenChange={() => setSelectedEmployeeId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedEmployeeId && (
            <EmployeeProfile 
              employeeId={selectedEmployeeId} 
              onClose={() => setSelectedEmployeeId(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

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
