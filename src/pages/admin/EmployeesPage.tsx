import { useState } from "react";
import { Header } from "@/components/Header";
import { EmployeeProfile } from "@/components/EmployeeProfile";
import { EmployeeFormDialog, type EmployeeFormData } from "@/components/employees/EmployeeFormDialog";
import { DeleteEmployeeDialog } from "@/components/employees/DeleteEmployeeDialog";
import { ProfileGenerationModal } from "@/components/admin/ProfileGenerationModal";
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
import { UserPlus, Search, MoreVertical, Pencil, Trash2, Eye, Bot } from "lucide-react";
import { useEmployees, useTeams, useRoleProfilesPublished } from "@/hooks/useOrgData";
import { useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from "@/hooks/useEmployeeMutations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { GeneratedProfile } from "@/types/profileGeneration";

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

  // Data hooks
  const { data: employees, isLoading: employeesLoading, refetch } = useEmployees();
  const { data: teams } = useTeams();
  const { data: roleProfiles } = useRoleProfilesPublished();

  // Mutations
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  // Save generated profile to database
  const saveProfileToDatabase = async (employeeId: string, profile: GeneratedProfile) => {
    // Update employee overall_score and promotion_readiness
    const { error } = await supabase
      .from("employees")
      .update({
        overall_score: profile.analysis.overallScore,
        promotion_readiness: profile.analysis.promotionReadiness.readinessPercentage,
        gdpr_consent_given_at: profile.compliance.gdprConsentVerified ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", employeeId);

    if (error) {
      console.error("Error saving profile:", error);
      throw new Error("Fehler beim Speichern des Profils");
    }

    // Update employee_competencies with current_level from AI ratings
    // First, get all competencies for this employee
    const { data: existingCompetencies, error: fetchError } = await supabase
      .from("employee_competencies")
      .select("id, competency:competencies(id, name)")
      .eq("employee_id", employeeId);

    if (fetchError) {
      console.error("Error fetching competencies:", fetchError);
    } else if (existingCompetencies) {
      // Build a map of competency name -> AI rating
      const ratingMap = new Map<string, { rating: number; selfRating: number | null; managerRating: number | null }>();
      
      for (const cluster of profile.competencyProfile.clusters) {
        for (const comp of cluster.competencies) {
          // Convert 1-5 rating to 0-100 scale (1=20, 2=40, 3=60, 4=80, 5=100)
          const rating = comp.rating === 'NB' ? 0 : (comp.rating as number) * 20;
          const selfRating = comp.selfRating ? comp.selfRating * 20 : null;
          const managerRating = comp.managerRating ? comp.managerRating * 20 : null;
          ratingMap.set(comp.name.toLowerCase(), { rating, selfRating, managerRating });
        }
      }

      // Update each employee_competency with the AI-derived current_level
      for (const ec of existingCompetencies) {
        const competencyName = ec.competency?.name?.toLowerCase();
        if (competencyName && ratingMap.has(competencyName)) {
          const ratings = ratingMap.get(competencyName)!;
          await supabase
            .from("employee_competencies")
            .update({
              current_level: ratings.rating,
              self_rating: ratings.selfRating,
              manager_rating: ratings.managerRating,
              rated_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", ec.id);
        }
      }
    }

    // Log audit event
    await supabase.rpc("log_audit_event", {
      p_action: "ai_profile_generated",
      p_entity_type: "employee",
      p_entity_id: employeeId,
      p_new_values: {
        overall_score: profile.analysis.overallScore,
        promotion_readiness: profile.analysis.promotionReadiness.readinessPercentage,
        strengths: profile.analysis.topStrengths.map((s) => s.competency),
        development_areas: profile.analysis.developmentAreas.map((d) => d.competency),
      },
    });
  };

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

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;
    await deleteEmployee.mutateAsync(deletingEmployee.id);
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
            <Button onClick={openCreateDialog} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Neuer Mitarbeiter
            </Button>
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
        onConfirm={handleDeleteEmployee}
        isLoading={deleteEmployee.isPending}
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
            role_profile: selectedEmployeeForProfile.role_profile,
          }}
          onProfileGenerated={async (profile) => {
            try {
              await saveProfileToDatabase(selectedEmployeeForProfile.id, profile);
              toast.success("Profil erfolgreich gespeichert!");
              setShowProfileModal(false);
              setSelectedEmployeeForProfile(null);
              refetch();
            } catch (error) {
              toast.error(error instanceof Error ? error.message : "Fehler beim Speichern");
            }
          }}
        />
      )}
    </div>
  );
};

export default EmployeesPage;
