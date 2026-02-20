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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
import {
  UserPlus, Search, MoreVertical, Pencil, Trash2, Eye, Bot, RefreshCw,
  CheckCircle, FolderOpen, LayoutGrid, List, Columns2, Folder, ChevronDown, ChevronRight, X,
} from "lucide-react";
import { useEmployees, useTeams, useRoleProfilesPublished } from "@/hooks/useOrgData";
import { useCreateEmployee, useUpdateEmployee, useArchiveEmployee, usePermanentDeleteEmployee } from "@/hooks/useEmployeeMutations";
import { saveProfileToDatabase } from "@/hooks/useProfileSaving";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { GeneratedProfile } from "@/types/profileGeneration";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

// suppress unused import warning
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
  } | null;
  team: {
    id: string;
    name: string;
  } | null;
}

type ViewMode = "folder" | "grid2" | "grid4" | "list";

// ─── Employee Card (reusable) ────────────────────────────────────────────────
function EmployeeCard({
  emp,
  onView,
  onProfileModal,
  onEdit,
  onDelete,
  employeeMissingSkills,
  compact = false,
}: {
  emp: DbEmployee;
  onView: () => void;
  onProfileModal: () => void;
  onEdit: () => void;
  onDelete: () => void;
  employeeMissingSkills: Map<string, number>;
  compact?: boolean;
}) {
  const docCount = [emp.cv_storage_path, emp.self_assessment_path, emp.manager_assessment_path].filter(Boolean).length;

  if (compact) {
    // List view
    return (
      <GlassCard className="hover-lift">
        <GlassCardContent className="p-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onView}
              className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary transition-transform duration-300 hover:scale-110 shrink-0"
            >
              {emp.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
            </button>
            <div className="flex-1 min-w-0 grid grid-cols-3 gap-2 items-center">
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate text-sm">{emp.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-foreground truncate">{emp.role_profile?.role_title || "—"}</p>
                <p className="text-xs text-muted-foreground truncate">{emp.team?.name || "Kein Team"}</p>
              </div>
              <div className="flex items-center gap-2 justify-end">
                {employeeMissingSkills.has(emp.id) ? (
                  <Badge variant="outline" className="text-xs gap-1 bg-amber-500/15 text-amber-500 border-amber-500/30">
                    <RefreshCw className="w-3 h-3" />Update
                  </Badge>
                ) : emp.overall_score != null && emp.overall_score > 0 ? (
                  <Badge variant="outline" className="text-xs gap-1 bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                    <CheckCircle className="w-3 h-3" />Aktuell
                  </Badge>
                ) : null}
                {docCount > 0 && (
                  <Badge variant="outline" className={cn("text-xs", docCount === 3 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-amber-500/15 text-amber-500 border-amber-500/30")}>
                    {docCount}/3
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant={(emp.overall_score || 0) >= 75 ? "default" : "secondary"}>
                {Math.round(emp.overall_score || 0)}%
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onProfileModal}>
                      <Bot className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>KI-Profil erstellen</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onView}><Eye className="w-4 h-4 mr-2" />Profil anzeigen</DropdownMenuItem>
                  <DropdownMenuItem onClick={onProfileModal}><Bot className="w-4 h-4 mr-2" />KI-Profil erstellen</DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}><Pencil className="w-4 h-4 mr-2" />Bearbeiten</DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" />Archivieren</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="hover-lift">
      <GlassCardContent className="p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onView}
            className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary transition-transform duration-300 hover:scale-110"
          >
            {emp.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </button>
          <div className="flex-1 min-w-0">
            <button onClick={onView} className="text-left w-full">
              <p className="font-medium text-foreground truncate hover:text-primary transition-colors">
                {emp.full_name}
              </p>
              <p className="text-sm text-muted-foreground truncate">{emp.role_profile?.role_title}</p>
              <p className="text-xs text-muted-foreground truncate">{emp.team?.name || "Kein Team"}</p>
            </button>
            {emp.overall_score != null && emp.overall_score > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {employeeMissingSkills.has(emp.id) ? (
                      <Badge variant="outline" className="text-xs gap-1 mt-1 bg-amber-500/15 text-amber-500 border-amber-500/30">
                        <RefreshCw className="w-3 h-3" />Update verfügbar
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs gap-1 mt-1 bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                        <CheckCircle className="w-3 h-3" />Aktuell
                      </Badge>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{employeeMissingSkills.has(emp.id) ? `${employeeMissingSkills.get(emp.id)} Kompetenzen ohne Bewertung` : 'Alle Kompetenzen bewertet'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {docCount > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className={cn("text-xs gap-1 mt-1", docCount === 3 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-amber-500/15 text-amber-500 border-amber-500/30")}>
                      <FolderOpen className="w-3 h-3" />{docCount}/3 Dok.
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{docCount === 3 ? 'Alle Dokumente gespeichert' : `${docCount} von 3 Dokumenten gespeichert`}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={(emp.overall_score || 0) >= 75 ? "default" : "secondary"} className="backdrop-blur">
              {Math.round(emp.overall_score || 0)}%
            </Badge>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onProfileModal}>
                    <Bot className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p>KI-Profil erstellen</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}><Eye className="w-4 h-4 mr-2" />Profil anzeigen</DropdownMenuItem>
                <DropdownMenuItem onClick={onProfileModal}><Bot className="w-4 h-4 mr-2" />KI-Profil erstellen</DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}><Pencil className="w-4 h-4 mr-2" />Bearbeiten</DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="w-4 h-4 mr-2" />Archivieren</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
const EmployeesPage = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid2");

  // Filters
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterScore, setFilterScore] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Open folder state
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

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

  // Build a map of role_profile_id -> Set of competency IDs
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

  const needsBulkUpdate = useMemo(() => employeeMissingSkills.size > 0, [employeeMissingSkills]);

  // Unique teams & roles for filter dropdowns
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

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return (employees as DbEmployee[] | undefined)?.filter((emp) => {
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

      if (filterStatus !== "all") {
        if (filterStatus === "update" && !employeeMissingSkills.has(emp.id)) return false;
        if (filterStatus === "current" && employeeMissingSkills.has(emp.id)) return false;
      }

      return true;
    });
  }, [employees, searchQuery, filterTeam, filterRole, filterScore, filterStatus, employeeMissingSkills]);

  const hasActiveFilters = filterTeam !== "all" || filterRole !== "all" || filterScore !== "all" || filterStatus !== "all";

  const clearFilters = () => {
    setFilterTeam("all");
    setFilterRole("all");
    setFilterScore("all");
    setFilterStatus("all");
  };

  // Folder view: group by role
  const byRole = useMemo(() => {
    const grouped: Record<string, DbEmployee[]> = {};
    filteredEmployees?.forEach((emp) => {
      const key = emp.role_profile?.role_title || "Ohne Rolle";
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(emp);
    });
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredEmployees]);

  const openProfileModal = (employee: DbEmployee) => {
    setSelectedEmployeeForProfile(employee);
    setShowProfileModal(true);
  };

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

  // Mutations
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const archiveEmployee = useArchiveEmployee();
  const permanentDeleteEmployee = usePermanentDeleteEmployee();

  if (employeesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <main className="container py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        </main>
      </div>
    );
  }

  const viewButtons: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: "folder", icon: <Folder className="w-4 h-4" />, label: "Ordner" },
    { mode: "grid2", icon: <Columns2 className="w-4 h-4" />, label: "2 pro Reihe" },
    { mode: "grid4", icon: <LayoutGrid className="w-4 h-4" />, label: "4 pro Reihe" },
    { mode: "list", icon: <List className="w-4 h-4" />, label: "Liste" },
  ];

  const renderCards = (emps: DbEmployee[], compact = false) =>
    emps.map((emp) => (
      <EmployeeCard
        key={emp.id}
        emp={emp}
        onView={() => setSelectedEmployeeId(emp.id)}
        onProfileModal={() => openProfileModal(emp)}
        onEdit={() => openEditDialog(emp)}
        onDelete={() => openDeleteDialog(emp)}
        employeeMissingSkills={employeeMissingSkills}
        compact={compact}
      />
    ));

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      <main className="container py-8">
        {/* Header */}
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              Mitarbeiter (<AnimatedCounter value={employees?.length || 0} duration={1000} />)
            </h1>
            <div className="flex gap-2">
              {needsBulkUpdate && (
                <Button variant="outline" onClick={() => setShowBulkModal(true)} className="gap-2">
                  <RefreshCw className="w-4 h-4" />Profile aktualisieren
                </Button>
              )}
              <Button onClick={openCreateDialog} className="gap-2">
                <UserPlus className="w-4 h-4" />Neuer Mitarbeiter
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Search + View switcher */}
        <ScrollReveal delay={80}>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Name, E-Mail, Rolle oder Team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* View mode buttons */}
            <div className="flex gap-1 bg-secondary/30 rounded-lg p-1">
              {viewButtons.map(({ mode, icon, label }) => (
                <TooltipProvider key={mode}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === mode ? "default" : "ghost"}
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => setViewMode(mode)}
                      >
                        {icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{label}</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal delay={120}>
          <div className="flex flex-wrap gap-2 mb-6">
            <Select value={filterTeam} onValueChange={setFilterTeam}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Teams</SelectItem>
                {uniqueTeams.map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-48 h-8 text-xs">
                <SelectValue placeholder="Rolle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Rollen</SelectItem>
                {uniqueRoles.map(([id, title]) => (
                  <SelectItem key={id} value={id}>{title}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterScore} onValueChange={setFilterScore}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Scores</SelectItem>
                <SelectItem value="high">Hoch (≥75%)</SelectItem>
                <SelectItem value="medium">Mittel (50–74%)</SelectItem>
                <SelectItem value="low">Niedrig (&lt;50%)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="current">Aktuell</SelectItem>
                <SelectItem value="update">Update verfügbar</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground" onClick={clearFilters}>
                <X className="w-3 h-3" />Filter zurücksetzen
              </Button>
            )}

            {filteredEmployees && (
              <span className="text-xs text-muted-foreground self-center ml-auto">
                {filteredEmployees.length} Mitarbeiter
              </span>
            )}
          </div>
        </ScrollReveal>

        {/* ── Folder View ── */}
        {viewMode === "folder" && (
          <div className="space-y-3">
            {byRole.map(([roleName, emps]) => {
              const isOpen = openFolders[roleName] ?? false;
              return (
                <Collapsible key={roleName} open={isOpen} onOpenChange={(v) => setOpenFolders(prev => ({ ...prev, [roleName]: v }))}>
                  <CollapsibleTrigger asChild>
                    <GlassCard className="cursor-pointer hover-lift">
                      <GlassCardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <Folder className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{roleName}</p>
                            <p className="text-xs text-muted-foreground">{emps.length} Mitarbeiter</p>
                          </div>
                          <Badge variant="secondary">{emps.length}</Badge>
                          {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </GlassCardContent>
                    </GlassCard>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 ml-6 grid md:grid-cols-2 gap-3">
                      {renderCards(emps)}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        )}

        {/* ── Grid 2 View ── */}
        {viewMode === "grid2" && (
          <div className="grid md:grid-cols-2 gap-4">
            {renderCards(filteredEmployees || [])}
          </div>
        )}

        {/* ── Grid 4 View ── */}
        {viewMode === "grid4" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {renderCards(filteredEmployees || [])}
          </div>
        )}

        {/* ── List View ── */}
        {viewMode === "list" && (
          <div className="space-y-2">
            {renderCards(filteredEmployees || [], true)}
          </div>
        )}

        {/* Empty state */}
        {filteredEmployees?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchQuery || hasActiveFilters ? "Keine Mitarbeiter gefunden" : "Noch keine Mitarbeiter angelegt"}
            </p>
            {!searchQuery && !hasActiveFilters && (
              <Button onClick={openCreateDialog} variant="outline" className="mt-4">
                <UserPlus className="w-4 h-4 mr-2" />Ersten Mitarbeiter anlegen
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Employee Profile Dialog */}
      <Dialog open={!!selectedEmployeeId} onOpenChange={() => setSelectedEmployeeId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass">
          {selectedEmployeeId && (
            <EmployeeProfile employeeId={selectedEmployeeId} onClose={() => setSelectedEmployeeId(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Employee Dialog */}
      <EmployeeFormDialog
        open={formDialogOpen}
        onOpenChange={(open) => { setFormDialogOpen(open); if (!open) setEditingEmployee(null); }}
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
        onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setDeletingEmployee(null); }}
        onArchive={handleArchiveEmployee}
        onPermanentDelete={handlePermanentDeleteEmployee}
        isLoading={archiveEmployee.isPending || permanentDeleteEmployee.isPending}
        employeeName={deletingEmployee?.full_name || ""}
      />

      {/* Profile Generation Modal */}
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
