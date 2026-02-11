import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import { EmployeeFormDialog, type EmployeeFormData } from "@/components/employees/EmployeeFormDialog";
import { DeleteEmployeeDialog } from "@/components/employees/DeleteEmployeeDialog";
import { ProfileGenerationModal } from "@/components/admin/ProfileGenerationModal";
import { BulkReProfileModal } from "@/components/admin/BulkReProfileModal";
import { GlassCard, GlassCardContent } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserPlus, Search, MoreVertical, Pencil, Trash2, Eye, Bot, RefreshCw, CheckCircle, FolderOpen } from "lucide-react";
import { useEmployees, useTeams, useRoleProfilesPublished } from "@/hooks/useOrgData";
import { useCreateEmployee, useUpdateEmployee, useArchiveEmployee, usePermanentDeleteEmployee } from "@/hooks/useEmployeeMutations";
import { saveProfileToDatabase } from "@/hooks/useProfileSaving";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { GeneratedProfile } from "@/types/profileGeneration";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DbEmployee {
  id: string;
  full_name: string;
  email: string | null;
  overall_score: number | null;
  avatar_url: string | null;
  age: number | null;
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
  } | null;
  team: {
    id: string;
    name: string;
  } | null;
}

const EmployeesPage = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form dialog state
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<DbEmployee | null>(null);
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEmployee, setDeletingEmployee] = useState<DbEmployee | null>(null);

  // Profile generation modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmployeeForProfile, setSelectedEmployeeForProfile] = useState<DbEmployee | null>(null);

  // Bulk re-profile modal state
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Data hooks
  const { data: employees, isLoading: employeesLoading, refetch } = useEmployees();
  const { data: teams } = useTeams();
  const { data: roleProfiles } = useRoleProfilesPublished();

  // Mutations
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const archiveEmployee = useArchiveEmployee();
  const permanentDeleteEmployee = usePermanentDeleteEmployee();

  // Build a map of role_profile_id -> Set of competency IDs from the latest role profiles
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

  // Check per employee if they are missing competencies from their role profile
  const employeeMissingSkills = useMemo(() => {
    const missing = new Map<string, number>(); // employee_id -> count of missing competencies
    if (!employees?.length || roleProfileCompetencyMap.size === 0) return missing;

    for (const emp of employees as any[]) {
      const rpId = emp.role_profile?.id;
      if (!rpId) continue;
      const requiredCompIds = roleProfileCompetencyMap.get(rpId);
      if (!requiredCompIds || requiredCompIds.size === 0) continue;

      // Get the competency IDs the employee already has ratings for
      const empCompIds = new Set<string>();
      for (const ec of emp.competencies || []) {
        if (ec.competency?.id && ec.current_level != null) {
          empCompIds.add(ec.competency.id);
        }
      }

      const missingCount = [...requiredCompIds].filter(id => !empCompIds.has(id)).length;
      if (missingCount > 0) {
        missing.set(emp.id, missingCount);
      }
    }
    return missing;
  }, [employees, roleProfileCompetencyMap]);

  const needsBulkUpdate = useMemo(() => {
    return employeeMissingSkills.size > 0;
  }, [employeeMissingSkills]);

  const openProfileModal = (employee: DbEmployee) => {
    setSelectedEmployeeForProfile(employee);
    setShowProfileModal(true);
  };

  // Filter employees by search query
  const filteredEmployees = employees?.filter((emp) => {
    const query = searchQuery.toLowerCase();
    return (
      emp.full_name.toLowerCase().includes(query) ||
      emp.email?.toLowerCase().includes(query) ||
      emp.role_profile?.role_title.toLowerCase().includes(query) ||
      emp.team?.name.toLowerCase().includes(query)
    );
  }) as DbEmployee[] | undefined;

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

  const openCreateDialog = () => {
    setEditingEmployee(null);
    setFormDialogOpen(true);
  };

  const openEditDialog = (employee: DbEmployee) => {
    setEditingEmployee(employee);
    setFormDialogOpen(true);
  };

  const openDeleteDialog = (employee: DbEmployee) => {
    setDeletingEmployee(employee);
    setDeleteDialogOpen(true);
  };

  if (employeesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <main className="container py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
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
        {/* Header with actions */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Mitarbeiter (<AnimatedCounter value={employees?.length || 0} duration={1000} />)
            </h1>
            <div className="flex gap-2">
              {needsBulkUpdate && (
                <Button variant="outline" onClick={() => setShowBulkModal(true)} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Profile aktualisieren
                </Button>
              )}
              <Button onClick={openCreateDialog} className="gap-2">
                <UserPlus className="w-4 h-4" />
                Neuer Mitarbeiter
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Search */}
        <ScrollReveal delay={100}>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Suchen nach Name, E-Mail, Rolle oder Team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </ScrollReveal>

        {/* Employee grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees?.map((emp, index) => (
            <ScrollReveal key={emp.id} delay={index * 50}>
              <GlassCard className="hover-lift">
                <GlassCardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setSelectedEmployeeId(emp.id)}
                      className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary transition-transform duration-300 hover:scale-110"
                    >
                      {emp.full_name.split(" ").map((n) => n[0]).join("")}
                    </button>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => setSelectedEmployeeId(emp.id)}
                        className="text-left w-full"
                      >
                        <p className="font-medium text-foreground truncate hover:text-primary transition-colors">
                          {emp.full_name}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {emp.role_profile?.role_title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {emp.team?.name || "Kein Team"}
                        </p>
                      </button>
                      {/* Update badge: show orange if missing skills, green if complete */}
                      {emp.overall_score != null && emp.overall_score > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {employeeMissingSkills.has(emp.id) ? (
                                <Badge variant="outline" className="text-xs gap-1 mt-1 bg-amber-500/15 text-amber-500 border-amber-500/30">
                                  <RefreshCw className="w-3 h-3" />
                                  Update verfügbar
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="text-xs gap-1 mt-1 bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                                  <CheckCircle className="w-3 h-3" />
                                  Aktuell
                                </Badge>
                              )}
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                {employeeMissingSkills.has(emp.id)
                                  ? `${employeeMissingSkills.get(emp.id)} Kompetenzen ohne Bewertung — Profil aktualisieren`
                                  : 'Alle Kompetenzen bewertet'}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      {/* Document status badge */}
                      {(() => {
                        const docCount = [emp.cv_storage_path, emp.self_assessment_path, emp.manager_assessment_path].filter(Boolean).length;
                        if (docCount === 0) return null;
                        return (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className={cn("text-xs gap-1 mt-1", docCount === 3 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-amber-500/15 text-amber-500 border-amber-500/30")}>
                                  <FolderOpen className="w-3 h-3" />
                                  {docCount}/3 Dok.
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{docCount === 3 ? 'Alle Dokumente gespeichert (CV, Self-Assessment, Manager-Assessment)' : `${docCount} von 3 Dokumenten gespeichert`}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={(emp.overall_score || 0) >= 75 ? "default" : "secondary"}
                        className="backdrop-blur"
                      >
                        {Math.round(emp.overall_score || 0)}%
                      </Badge>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => openProfileModal(emp)}
                            >
                              <Bot className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>KI-Profil erstellen</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedEmployeeId(emp.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Profil anzeigen
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openProfileModal(emp)}>
                            <Bot className="w-4 h-4 mr-2" />
                            KI-Profil erstellen
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEditDialog(emp)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(emp)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Archivieren
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </GlassCardContent>
              </GlassCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Empty state */}
        {filteredEmployees?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery ? "Keine Mitarbeiter gefunden" : "Noch keine Mitarbeiter angelegt"}
            </p>
            {!searchQuery && (
              <Button onClick={openCreateDialog} variant="outline" className="mt-4">
                <UserPlus className="w-4 h-4 mr-2" />
                Ersten Mitarbeiter anlegen
              </Button>
            )}
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

      {/* Create/Edit Employee Dialog */}
      <EmployeeFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => {
          setFormDialogOpen(open);
          if (!open) setEditingEmployee(null);
        }}
        onSubmit={editingEmployee ? handleUpdateEmployee : handleCreateEmployee}
        isLoading={createEmployee.isPending || updateEmployee.isPending}
        roleProfiles={roleProfiles?.map((r) => ({ id: r.id, role_title: r.role_title, role_key: r.role_key })) || []}
        teams={teams?.map((t) => ({ id: t.id, name: t.name })) || []}
        editingEmployee={editingEmployee}
        mode={editingEmployee ? "edit" : "create"}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteEmployeeDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) setDeletingEmployee(null);
        }}
        onArchive={handleArchiveEmployee}
        onPermanentDelete={handlePermanentDeleteEmployee}
        isLoading={archiveEmployee.isPending || permanentDeleteEmployee.isPending}
        employeeName={deletingEmployee?.full_name || ""}
      />

      {/* Profile Generation Modal */}
      {showProfileModal && selectedEmployeeForProfile && (
        <ProfileGenerationModal
          open={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedEmployeeForProfile(null);
          }}
           employee={{
             id: selectedEmployeeForProfile.id,
             full_name: selectedEmployeeForProfile.full_name,
             organization_id: selectedEmployeeForProfile.organization_id,
             role_profile: selectedEmployeeForProfile.role_profile,
             cv_storage_path: selectedEmployeeForProfile.cv_storage_path,
             self_assessment_path: selectedEmployeeForProfile.self_assessment_path,
             manager_assessment_path: selectedEmployeeForProfile.manager_assessment_path,
           }}
          onProfileGenerated={async (profile) => {
            try {
              const result = await saveProfileToDatabase(selectedEmployeeForProfile.id, profile);
              
              // Show success with matching info
              if (result.unmatched.length > 0) {
                toast.warning(
                  `Profil gespeichert! ${result.matched} Kompetenzen aktualisiert, ${result.unmatched.length} konnten nicht zugeordnet werden.`,
                  { duration: 5000 }
                );
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

      {/* Bulk Re-Profile Modal */}
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
