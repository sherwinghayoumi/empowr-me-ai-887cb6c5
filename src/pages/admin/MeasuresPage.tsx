import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Plus, Filter, ClipboardList, Pencil, Trash2, Users, Target, Euro, Clock,
  BookOpen, Route,
} from "lucide-react";
import {
  useMeasures, useCreateMeasure, useUpdateMeasure, useDeleteMeasure,
  MEASURE_TYPES, MEASURE_STATUSES, type Measure, type CreateMeasureData,
} from "@/hooks/useMeasures";
import { useTeams, useEmployees } from "@/hooks/useOrgData";
import { useRoleProfilesPublished } from "@/hooks/useOrgData";
import { EmployeeLearningPathsTab } from "@/components/EmployeeLearningPathsTab";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ─── Helpers ────────────────────────────────────────

function statusBadge(status: string) {
  const s = MEASURE_STATUSES.find((ms) => ms.value === status);
  if (!s) return <Badge variant="outline">{status}</Badge>;
  return (
    <Badge
      className="text-xs"
      style={{
        backgroundColor: `${s.color} / 0.15)`.replace("hsl(", "hsl(").replace(")", " / 0.15)"),
        color: s.color,
        borderColor: `${s.color}`.replace(")", " / 0.3)").replace("hsl(", "hsl("),
      }}
    >
      {s.label}
    </Badge>
  );
}

function typeLabel(type: string) {
  return MEASURE_TYPES.find((t) => t.value === type)?.label || type;
}

// ─── Form Dialog ────────────────────────────────────

interface MeasureFormProps {
  open: boolean;
  onClose: () => void;
  initial?: Measure | null;
}

function MeasureFormDialog({ open, onClose, initial }: MeasureFormProps) {
  const createMutation = useCreateMeasure();
  const updateMutation = useUpdateMeasure();
  const { data: teams } = useTeams();
  const { data: employees } = useEmployees();
  const { data: roleProfiles } = useRoleProfilesPublished();

  const allCompetencies = useMemo(() => {
    if (!roleProfiles) return [];
    const map = new Map<string, { id: string; name: string }>();
    for (const rp of roleProfiles) {
      for (const c of rp.competencies || []) {
        if (!map.has(c.id)) map.set(c.id, { id: c.id, name: c.name });
      }
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [roleProfiles]);

  const [form, setForm] = useState<CreateMeasureData>({
    title: initial?.title || "",
    description: initial?.description || "",
    measure_type: initial?.measure_type || "seminar",
    provider: initial?.provider || "",
    cost: initial?.cost || 0,
    duration_hours: initial?.duration_hours || undefined,
    status: initial?.status || "planned",
    assigned_team_id: initial?.assigned_team_id || null,
    assigned_employee_ids: initial?.assigned_employee_ids || [],
    linked_competency_ids: initial?.linked_competency_ids || [],
    start_date: initial?.start_date || "",
    end_date: initial?.end_date || "",
  });

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    if (initial) {
      await updateMutation.mutateAsync({ ...form, id: initial.id });
    } else {
      await createMutation.mutateAsync(form);
    }
    onClose();
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Maßnahme bearbeiten" : "Neue Maßnahme"}</DialogTitle>
          <DialogDescription>
            {initial ? "Änderungen an der Maßnahme vornehmen." : "Neue Weiterbildungsmaßnahme anlegen und mit Skill-Gaps verknüpfen."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Titel *</Label>
            <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="z.B. AI in Legal Practice Seminar" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Typ</Label>
              <Select value={form.measure_type} onValueChange={(v) => setForm((f) => ({ ...f, measure_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MEASURE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MEASURE_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Anbieter</Label>
              <Input value={form.provider || ""} onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))} placeholder="z.B. Bucerius Law School" />
            </div>
            <div className="space-y-1.5">
              <Label>Kosten (€)</Label>
              <Input type="number" value={form.cost || ""} onChange={(e) => setForm((f) => ({ ...f, cost: Number(e.target.value) }))} placeholder="0" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Dauer (Std.)</Label>
              <Input type="number" value={form.duration_hours || ""} onChange={(e) => setForm((f) => ({ ...f, duration_hours: Number(e.target.value) || undefined }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Start</Label>
              <Input type="date" value={form.start_date || ""} onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Ende</Label>
              <Input type="date" value={form.end_date || ""} onChange={(e) => setForm((f) => ({ ...f, end_date: e.target.value }))} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Team</Label>
            <Select value={form.assigned_team_id || "none"} onValueChange={(v) => setForm((f) => ({ ...f, assigned_team_id: v === "none" ? null : v }))}>
              <SelectTrigger><SelectValue placeholder="Kein Team" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Kein Team</SelectItem>
                {teams?.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Verknüpfte Kompetenzen (Skill-Gaps)</Label>
            <div className="max-h-32 overflow-y-auto space-y-1 border border-border/50 rounded-lg p-2">
              {allCompetencies.length > 0 ? allCompetencies.map((c) => {
                const selected = form.linked_competency_ids?.includes(c.id);
                return (
                  <button key={c.id} type="button" onClick={() => setForm((f) => ({ ...f, linked_competency_ids: selected ? f.linked_competency_ids?.filter((id) => id !== c.id) : [...(f.linked_competency_ids || []), c.id] }))}
                    className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${selected ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
                  >
                    {c.name}
                  </button>
                );
              }) : (
                <p className="text-xs text-muted-foreground py-2 text-center">Keine Kompetenzen verfügbar</p>
              )}
            </div>
            {(form.linked_competency_ids?.length || 0) > 0 && (
              <p className="text-xs text-muted-foreground">{form.linked_competency_ids?.length} ausgewählt</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Beschreibung</Label>
            <Textarea value={form.description || ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} placeholder="Details zur Maßnahme..." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Abbrechen</Button>
          <Button onClick={handleSubmit} disabled={isPending || !form.title.trim()}>
            {isPending ? "Speichern..." : initial ? "Aktualisieren" : "Erstellen"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Learning Paths Overview (all employees) ────────

function AllLearningPathsTab() {
  const { organization } = useAuth();
  const { data: employees } = useEmployees();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("all");

  // Fetch learning paths for all org employees
  const { data: allPaths, isLoading } = useQuery({
    queryKey: ['all-learning-paths', organization?.id],
    queryFn: async () => {
      if (!employees?.length) return [];
      const empIds = employees.map((e: any) => e.id);
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*, modules:learning_modules(*)')
        .in('employee_id', empIds)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!employees?.length,
  });

  const employeeMap = useMemo(() => {
    const m = new Map<string, { id: string; full_name: string }>();
    (employees as any[] || []).forEach((e: any) => m.set(e.id, { id: e.id, full_name: e.full_name }));
    return m;
  }, [employees]);

  // Group paths by employee
  const pathsByEmployee = useMemo(() => {
    if (!allPaths) return [];
    const map = new Map<string, typeof allPaths>();
    allPaths.forEach((p: any) => {
      if (selectedEmployeeId !== "all" && p.employee_id !== selectedEmployeeId) return;
      if (!map.has(p.employee_id)) map.set(p.employee_id, []);
      map.get(p.employee_id)!.push(p);
    });
    return [...map.entries()]
      .map(([empId, paths]) => ({
        employee: employeeMap.get(empId) || { id: empId, full_name: 'Unbekannt' },
        paths,
      }))
      .sort((a, b) => a.employee.full_name.localeCompare(b.employee.full_name));
  }, [allPaths, employeeMap, selectedEmployeeId]);

  const employeeOptions = useMemo(() => {
    if (!allPaths) return [];
    const ids = new Set(allPaths.map((p: any) => p.employee_id));
    return [...ids].map(id => employeeMap.get(id)).filter(Boolean).sort((a, b) => a!.full_name.localeCompare(b!.full_name)) as { id: string; full_name: string }[];
  }, [allPaths, employeeMap]);

  if (isLoading) return <Skeleton className="h-64" />;

  if (!allPaths?.length) {
    return (
      <Card className="bg-card/80 border-border/50">
        <CardContent className="py-12 text-center">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium">Keine Lernpfade vorhanden</p>
          <p className="text-xs text-muted-foreground mt-1">Lernpfade können über das Mitarbeiterprofil generiert werden.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Employee filter */}
      <div className="flex items-center gap-2">
        <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
          <SelectTrigger className="w-52 h-8 text-xs bg-card/80 border-border/50"><SelectValue placeholder="Mitarbeiter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Mitarbeiter</SelectItem>
            {employeeOptions.map(e => <SelectItem key={e.id} value={e.id}>{e.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">{allPaths.length} Lernpfade gesamt</span>
      </div>

      {/* Render per employee */}
      {pathsByEmployee.map(({ employee, paths }) => (
        <div key={employee.id} className="space-y-2">
          <h3 className="text-xs font-semibold text-foreground border-b border-border/30 pb-1">{employee.full_name}</h3>
          <EmployeeLearningPathsTab
            learningPaths={paths as any}
            employeeName={employee.full_name}
            employeeId={employee.id}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────

const MeasuresPage = () => {
  const { data: measures, isLoading } = useMeasures();
  const { data: teams } = useTeams();
  const { data: roleProfiles } = useRoleProfilesPublished();
  const deleteMutation = useDeleteMeasure();
  const createMutation = useCreateMeasure();

  const [activeTab, setActiveTab] = useState("measures");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editMeasure, setEditMeasure] = useState<Measure | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const competencyNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const rp of roleProfiles || []) {
      for (const c of rp.competencies || []) {
        map.set(c.id, c.name);
      }
    }
    return map;
  }, [roleProfiles]);

  const filtered = useMemo(() => {
    if (!measures) return [];
    return measures.filter((m) => {
      if (filterStatus !== "all" && m.status !== filterStatus) return false;
      if (filterType !== "all" && m.measure_type !== filterType) return false;
      if (filterTeam !== "all" && m.assigned_team_id !== filterTeam) return false;
      return true;
    });
  }, [measures, filterStatus, filterType, filterTeam]);

  const totalCost = useMemo(() => filtered.reduce((s, m) => s + (m.cost || 0), 0), [filtered]);
  const completedCount = useMemo(() => filtered.filter((m) => m.status === "completed").length, [filtered]);

  const handleSaveAsLearningPathMeasure = (title: string, description: string, employeeIds: string[]) => {
    createMutation.mutate({
      title,
      description,
      measure_type: 'learning-path',
      status: 'planned',
      assigned_employee_ids: employeeIds,
    });
    setActiveTab("measures");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-6"><Skeleton className="h-64" /></CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h1 className="text-lg font-semibold text-foreground tracking-tight">Entwicklungsmaßnahmen & Lernpfade</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Verwalte Trainings, Coachings und individuelle Entwicklungspfade
          </p>
        </div>
        <Button size="sm" onClick={() => { setEditMeasure(null); setFormOpen(true); }} className="h-8 text-xs">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Neue Maßnahme
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-8">
          <TabsTrigger value="measures" className="text-xs h-7 px-3 gap-1.5">
            <ClipboardList className="w-3.5 h-3.5" />
            Maßnahmen
            {measures && measures.length > 0 && <span className="ml-1 text-[10px] bg-secondary px-1.5 py-0.5 rounded-full tabular-nums">{measures.length}</span>}
          </TabsTrigger>
          <TabsTrigger value="learning-paths" className="text-xs h-7 px-3 gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Lernpfade
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Maßnahmen ─────────────────────────── */}
        <TabsContent value="measures" className="mt-4 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: "80ms" }}>
            <KpiCard label="Gesamt" value={filtered.length} icon={ClipboardList} color="text-primary" index={0} />
            <KpiCard label="Abgeschlossen" value={completedCount} icon={Target} color="text-[hsl(var(--severity-low))]" index={1} />
            <KpiCard label="Gesamtkosten" value={`${totalCost.toLocaleString("de-DE")} €`} icon={Euro} color="text-primary" index={2} />
            <KpiCard label="Ø Dauer" value={filtered.length > 0 ? `${Math.round(filtered.reduce((s, m) => s + (m.duration_hours || 0), 0) / filtered.length)} Std.` : "—"} icon={Clock} color="text-muted-foreground" index={3} />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: "140ms" }}>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="w-4 h-4" />Filter:
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                {MEASURE_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Typ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Typen</SelectItem>
                {MEASURE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterTeam} onValueChange={setFilterTeam}>
              <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="Team" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Teams</SelectItem>
                {teams?.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-0">
                {filtered.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/30 hover:bg-transparent">
                        <TableHead className="text-xs">Titel</TableHead>
                        <TableHead className="text-xs">Typ</TableHead>
                        <TableHead className="text-xs">Anbieter</TableHead>
                        <TableHead className="text-xs">Team</TableHead>
                        <TableHead className="text-xs text-right">Kosten</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Gaps</TableHead>
                        <TableHead className="text-xs w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((m) => (
                        <TableRow key={m.id} className="border-border/20 hover:bg-muted/30 transition-colors">
                          <TableCell className="font-medium text-xs py-2">
                            <div>
                              {m.title}
                              {m.duration_hours && (
                                <span className="text-xs text-muted-foreground ml-2">{m.duration_hours} Std.</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground py-3">{typeLabel(m.measure_type)}</TableCell>
                          <TableCell className="text-sm text-muted-foreground py-3">{m.provider || "—"}</TableCell>
                          <TableCell className="text-sm text-muted-foreground py-3">{m.team?.name || "—"}</TableCell>
                          <TableCell className="text-sm font-mono tabular-nums text-right py-3">
                            {m.cost ? `${m.cost.toLocaleString("de-DE")} €` : "—"}
                          </TableCell>
                          <TableCell className="py-3">{statusBadge(m.status)}</TableCell>
                          <TableCell className="py-3">
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {m.linked_competency_ids && m.linked_competency_ids.length > 0 ? (
                                m.linked_competency_ids.slice(0, 2).map((cid) => (
                                  <Badge key={cid} variant="outline" className="text-[10px] max-w-[80px] truncate">
                                    {competencyNames.get(cid) || "…"}
                                  </Badge>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                              {(m.linked_competency_ids?.length || 0) > 2 && (
                                <Badge variant="outline" className="text-[10px]">+{m.linked_competency_ids.length - 2}</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex gap-1">
                              {(m.status === 'planned' || m.status === 'active') && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-primary"
                                  title="Lernpfad generieren"
                                  onClick={() => setActiveTab("learning-paths")}
                                >
                                  <Route className="w-3.5 h-3.5" />
                                </Button>
                              )}
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditMeasure(m); setFormOpen(true); }}>
                                <Pencil className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteId(m.id)}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <ClipboardList className="w-10 h-10 mb-3 opacity-50" />
                    <p className="text-sm font-medium">Keine Maßnahmen vorhanden</p>
                    <p className="text-xs mt-1">Erstellen Sie eine neue Maßnahme, um loszulegen</p>
                    <Button className="mt-4" size="sm" onClick={() => { setEditMeasure(null); setFormOpen(true); }}>
                      <Plus className="w-4 h-4 mr-2" />Erste Maßnahme erstellen
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Tab 2: Lernpfade ─────────────────────────── */}
        <TabsContent value="learning-paths" className="mt-4 space-y-4">
          <AllLearningPathsTab />
        </TabsContent>
      </Tabs>

      {/* Form Dialog */}
      {formOpen && (
        <MeasureFormDialog
          open={formOpen}
          onClose={() => { setFormOpen(false); setEditMeasure(null); }}
          initial={editMeasure}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(v) => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Maßnahme löschen?</AlertDialogTitle>
            <AlertDialogDescription>Diese Aktion kann nicht rückgängig gemacht werden.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteId) deleteMutation.mutate(deleteId); setDeleteId(null); }}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MeasuresPage;
