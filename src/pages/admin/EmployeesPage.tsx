import { useState, useMemo } from "react";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import { EmployeeFormDialog, type EmployeeFormData } from "@/components/employees/EmployeeFormDialog";
import { DeleteEmployeeDialog } from "@/components/employees/DeleteEmployeeDialog";
import { ProfileGenerationModal } from "@/components/admin/ProfileGenerationModal";
import { BulkReProfileModal } from "@/components/admin/BulkReProfileModal";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus, Search, MoreVertical, Pencil, Trash2, Eye, Bot, RefreshCw,
  CheckCircle, X,
} from "lucide-react";
import { useEmployees, useTeams, useRoleProfilesPublished } from "@/hooks/useOrgData";
import { useCreateEmployee, useUpdateEmployee, useArchiveEmployee, usePermanentDeleteEmployee } from "@/hooks/useEmployeeMutations";
import { saveProfileToDatabase } from "@/hooks/useProfileSaving";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { GeneratedProfile } from "@/types/profileGeneration";

void supabase;

interface DbEmployee {
  id: string;
  full_name: string;
  email: string | null;
  overall_score: number | null;
  avatar_url: string | null;
  birth_date: string | null;
  education: string | null;
  total_experience_years: number | null;
  firm_experience_years: number | null;
  career_objective: string | null;
  organization_id: string;
  cv_storage_path: string | null;
  self_assessment_path: string | null;
  manager_assessment_path: string | null;
  profile_last_updated_at: string | null;
  role_profile: {
    id: string;
    role_title: string;
    role_key: string;
    practice_group: string | null;
  } | null;
  team: {
    id: string;
    name: string;
  } | null;
}

const EmployeesPage = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterScore, setFilterScore] = useState("all");
  const [sortKey, setSortKey] = useState<'name' | 'score' | 'role' | 'team'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<DbEmployee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<DbEmployee | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmployeeForProfile, setSelectedEmployeeForProfile] = useState<DbEmployee | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);

  const { data: employees, isLoading: employeesLoading, refetch } = useEmployees();
  const { data: teams } = useTeams();
  const { data: roleProfiles } = useRoleProfilesPublished();

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const archiveEmployee = useArchiveEmployee();
  const permanentDeleteEmployee = usePermanentDeleteEmployee();

  const roleProfileCompetencyMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    if (!roleProfiles?.length) return map;
    for (const rp of roleProfiles) {
      const compIds = new Set<string>();
      for (const comp of (rp as any).competencies || []) {
        if (comp.status === 'active') compIds.add(comp.id);
      }
      map.set(rp.id, compIds);
    }
    return map;
  }, [roleProfiles]);

  const employeeMissingSkills = useMemo(() => {
    const missing = new Map<string, number>();
    if (!employees?.length || roleProfileCompetencyMap.size === 0) return missing;
    for (const emp of employees as any[]) {
      const rpId = emp.role_profile?.id;
      if (!rpId) continue;
      const requiredCompIds = roleProfileCompetencyMap.get(rpId);
      if (!requiredCompIds || requiredCompIds.size === 0) continue;
      const empCompIds = new Set<string>();
      for (const ec of emp.competencies || []) {
        if (ec.competency?.id && ec.current_level != null) empCompIds.add(ec.competency.id);
      }
      const missingCount = [...requiredCompIds].filter(id => !empCompIds.has(id)).length;
      if (missingCount > 0) missing.set(emp.id, missingCount);
    }
    return missing;
  }, [employees, roleProfileCompetencyMap]);

  const needsBulkUpdate = employeeMissingSkills.size > 0;

  const uniqueTeams = useMemo(() => {
    const set = new Map<string, string>();
    (employees as DbEmployee[] | undefined)?.forEach((e) => {
      if (e.team) set.set(e.team.id, e.team.name);
    });
    return [...set.entries()];
  }, [employees]);

  const uniqueRoles = useMemo(() => {
    const set = new Map<string, string>();
    (employees as DbEmployee[] | undefined)?.forEach((e) => {
      if (e.role_profile) set.set(e.role_profile.id, e.role_profile.role_title);
    });
    return [...set.entries()];
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return (employees as DbEmployee[] | undefined)
      ?.filter((emp) => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
          emp.full_name.toLowerCase().includes(q) ||
          emp.email?.toLowerCase().includes(q) ||
          emp.role_profile?.role_title.toLowerCase().includes(q) ||
          emp.team?.name.toLowerCase().includes(q);
        if (!matchSearch) return false;
        if (filterTeam !== "all" && emp.team?.id !== filterTeam) return false;
        if (filterRole !== "all" && emp.role_profile?.id !== filterRole) return false;
        if (filterScore !== "all") {
          const s = emp.overall_score || 0;
          if (filterScore === "high" && s < 75) return false;
          if (filterScore === "medium" && (s < 50 || s >= 75)) return false;
          if (filterScore === "low" && s >= 50) return false;
        }
        return true;
      })
      ?.sort((a, b) => {
        let cmp = 0;
        if (sortKey === 'name') cmp = a.full_name.localeCompare(b.full_name);
        else if (sortKey === 'score') cmp = (a.overall_score || 0) - (b.overall_score || 0);
        else if (sortKey === 'role') cmp = (a.role_profile?.role_title || '').localeCompare(b.role_profile?.role_title || '');
        else if (sortKey === 'team') cmp = (a.team?.name || '').localeCompare(b.team?.name || '');
        return sortAsc ? cmp : -cmp;
      });
  }, [employees, searchQuery, filterTeam, filterRole, filterScore, sortKey, sortAsc]);

  const hasActiveFilters = filterTeam !== "all" || filterRole !== "all" || filterScore !== "all";

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const sortIndicator = (key: typeof sortKey) =>
    sortKey === key ? (sortAsc ? ' ↑' : ' ↓') : '';

  const handleCreateEmployee = async (data: EmployeeFormData) => {
    await createEmployee.mutateAsync(data);
    setFormDialogOpen(false);
  };

  const handleUpdateEmployee = async (data: EmployeeFormData) => {
    if (!editingEmployee) return;
    await updateEmployee.mutateAsync({ id: editingEmployee.id, data });
    setEditingEmployee(null);
    setFormDialogOpen(false);
  };

  const handleArchiveEmployee = async () => {
    if (!deletingEmployee) return;
    await archiveEmployee.mutateAsync(deletingEmployee.id);
    setDeletingEmployee(null);
    setDeleteDialogOpen(false);
  };

  const handlePermanentDeleteEmployee = async () => {
    if (!deletingEmployee) return;
    await permanentDeleteEmployee.mutateAsync(deletingEmployee.id);
    setDeletingEmployee(null);
    setDeleteDialogOpen(false);
  };

  const openCreateDialog = () => { setEditingEmployee(null); setFormDialogOpen(true); };
  const openEditDialog = (employee: DbEmployee) => { setEditingEmployee(employee); setFormDialogOpen(true); };
  const openDeleteDialog = (employee: DbEmployee) => { setDeletingEmployee(employee); setDeleteDialogOpen(true); };
  const openProfileModal = (employee: DbEmployee) => { setSelectedEmployeeForProfile(employee); setShowProfileModal(true); };

  if (employeesLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-8 w-48" />
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-0">
            <div className="space-y-2 p-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <h1 className="text-lg font-semibold">
          Anwälte <span className="text-muted-foreground font-normal text-sm tabular-nums">({employees?.length || 0})</span>
        </h1>
        <div className="flex gap-2">
          {needsBulkUpdate && (
            <Button variant="outline" size="sm" onClick={() => setShowBulkModal(true)} className="h-8 text-xs gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" />Profile aktualisieren
            </Button>
          )}
          <Button size="sm" onClick={openCreateDialog} className="h-8 text-xs gap-1.5">
            <UserPlus className="w-3.5 h-3.5" />Neuer Anwalt
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Input
          placeholder="Name suchen…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-48 h-8 text-xs bg-card/80 border-border/50"
        />
        <Select value={filterTeam} onValueChange={setFilterTeam}>
          <SelectTrigger className="w-44 h-8 text-xs bg-card/80 border-border/50">
            <SelectValue placeholder="Team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Teams</SelectItem>
            {uniqueTeams.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-44 h-8 text-xs bg-card/80 border-border/50">
            <SelectValue placeholder="Rolle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Rollen</SelectItem>
            {uniqueRoles.map(([id, title]) => <SelectItem key={id} value={id}>{title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterScore} onValueChange={setFilterScore}>
          <SelectTrigger className="w-40 h-8 text-xs bg-card/80 border-border/50">
            <SelectValue placeholder="Score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Scores</SelectItem>
            <SelectItem value="high">≥75%</SelectItem>
            <SelectItem value="medium">50–74%</SelectItem>
            <SelectItem value="low">&lt;50%</SelectItem>
          </SelectContent>
        </Select>
        {hasActiveFilters && (
          <button onClick={() => { setFilterTeam("all"); setFilterRole("all"); setFilterScore("all"); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3 h-3" />zurücksetzen
          </button>
        )}
      </div>

      {/* Table */}
      <Card className="bg-card/80 border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-xs cursor-pointer hover:text-primary" onClick={() => toggleSort('name')}>
                  Name{sortIndicator('name')}
                </TableHead>
                <TableHead className="text-xs cursor-pointer hover:text-primary" onClick={() => toggleSort('role')}>
                  Rolle{sortIndicator('role')}
                </TableHead>
                <TableHead className="text-xs cursor-pointer hover:text-primary" onClick={() => toggleSort('team')}>
                  Team{sortIndicator('team')}
                </TableHead>
                <TableHead className="text-xs text-right cursor-pointer hover:text-primary" onClick={() => toggleSort('score')}>
                  Score{sortIndicator('score')}
                </TableHead>
                <TableHead className="text-xs text-center">Status</TableHead>
                <TableHead className="text-xs text-center">Dok.</TableHead>
                <TableHead className="text-xs text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees?.map((emp, i) => {
                const docCount = [emp.cv_storage_path, emp.self_assessment_path, emp.manager_assessment_path].filter(Boolean).length;
                const hasUpdate = employeeMissingSkills.has(emp.id);
                const score = Math.round(emp.overall_score || 0);

                return (
                  <TableRow
                    key={emp.id}
                    className="cursor-pointer border-border/30 hover:bg-muted/30 transition-colors duration-150 animate-fade-in-up opacity-0"
                    style={{ animationDelay: `${Math.min(i, 15) * 0.03}s` }}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                  >
                    <TableCell className="text-xs py-2 font-medium">{emp.full_name}</TableCell>
                    <TableCell className="text-xs py-2 text-muted-foreground">{emp.role_profile?.role_title || '—'}</TableCell>
                    <TableCell className="text-xs py-2 text-muted-foreground">{emp.team?.name || '—'}</TableCell>
                    <TableCell className="text-xs py-2 text-right tabular-nums">
                      <span className={score >= 75 ? 'text-[hsl(var(--severity-low))]' : score >= 50 ? 'text-foreground' : score > 0 ? 'text-[hsl(var(--severity-critical))]' : 'text-muted-foreground'}>
                        {score > 0 ? `${score}%` : '—'}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs py-2 text-center">
                      {hasUpdate ? (
                        <Badge variant="outline" className="text-[10px] bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))] border-[hsl(var(--severity-medium))]/30">
                          Update
                        </Badge>
                      ) : score > 0 ? (
                        <CheckCircle className="w-3.5 h-3.5 text-[hsl(var(--severity-low))] mx-auto" />
                      ) : null}
                    </TableCell>
                    <TableCell className="text-xs py-2 text-center tabular-nums text-muted-foreground">
                      {docCount}/3
                    </TableCell>
                    <TableCell className="text-xs py-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedEmployeeId(emp.id)}>
                            <Eye className="w-3.5 h-3.5 mr-2" />Profil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openProfileModal(emp)}>
                            <Bot className="w-3.5 h-3.5 mr-2" />KI-Profil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(emp)}>
                            <Pencil className="w-3.5 h-3.5 mr-2" />Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(emp)} className="text-destructive focus:text-destructive">
                            <Trash2 className="w-3.5 h-3.5 mr-2" />Archivieren
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">{filteredEmployees?.length || 0} von {employees?.length || 0} Anwälten</p>

      {/* Employee Profile Dialog */}
      <Dialog open={!!selectedEmployeeId} onOpenChange={() => setSelectedEmployeeId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedEmployeeId && (
            <EmployeeProfile employeeId={selectedEmployeeId} onClose={() => setSelectedEmployeeId(null)} />
          )}
        </DialogContent>
      </Dialog>

      <EmployeeFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => { setFormDialogOpen(open); if (!open) setEditingEmployee(null); }}
        onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
        isLoading={createEmployee.isPending || updateEmployee.isPending}
        roleProfiles={roleProfiles?.map((r) => ({ id: r.id, role_title: r.role_title, role_key: r.role_key, practice_group: r.practice_group })) || []}
        teams={teams?.map((t) => ({ id: t.id, name: t.name })) || []}
        editingEmployee={editingEmployee}
        mode={editingEmployee ? "edit" : "create"}
      />

      <DeleteEmployeeDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setDeletingEmployee(null); }}
        onArchive={handleArchiveEmployee}
        onPermanentDelete={handlePermanentDeleteEmployee}
        isLoading={archiveEmployee.isPending || permanentDeleteEmployee.isPending}
        employeeName={deletingEmployee?.full_name || ""}
      />

      {showProfileModal && selectedEmployeeForProfile && (
        <ProfileGenerationModal
          open={showProfileModal}
          onClose={() => { setShowProfileModal(false); setSelectedEmployeeForProfile(null); }}
          employee={{
            id: selectedEmployeeForProfile.id,
            full_name: selectedEmployeeForProfile.full_name,
            organization_id: selectedEmployeeForProfile.organization_id,
            role_profile: selectedEmployeeForProfile.role_profile,
            cv_storage_path: selectedEmployeeForProfile.cv_storage_path,
            self_assessment_path: selectedEmployeeForProfile.self_assessment_path,
            manager_assessment_path: selectedEmployeeForProfile.manager_assessment_path,
          }}
          onProfileGenerated={async (profile: GeneratedProfile) => {
            try {
              const result = await saveProfileToDatabase(selectedEmployeeForProfile.id, profile);
              if (result.unmatched.length > 0) {
                toast.warning(`Profil gespeichert! ${result.matched} Kompetenzen aktualisiert, ${result.unmatched.length} konnten nicht zugeordnet werden.`, { duration: 5000 });
              } else {
                toast.success(`Profil erfolgreich gespeichert! ${result.matched} Kompetenzen aktualisiert.`);
              }
              setShowProfileModal(false);
              setSelectedEmployeeForProfile(null);
              refetch();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Fehler beim Speichern");
            }
          }}
        />
      )}

      <BulkReProfileModal
        open={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        employees={(filteredEmployees || []).map(emp => ({
          id: emp.id,
          full_name: emp.full_name,
          cv_storage_path: emp.cv_storage_path,
          self_assessment_path: emp.self_assessment_path,
          manager_assessment_path: emp.manager_assessment_path,
          role_profile: emp.role_profile,
        }))}
        onComplete={() => refetch()}
      />
    </div>
  );
};

export default EmployeesPage;
