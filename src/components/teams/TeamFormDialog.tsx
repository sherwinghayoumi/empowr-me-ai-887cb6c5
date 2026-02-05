import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, UserPlus, Palette, Tags, Star, Archive, 
  Briefcase, Building, Code, Gavel, Scale, TrendingUp,
  Target, Award, Shield, Zap, Heart, BookOpen,
  X, Plus, Search, GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

const TEAM_COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Green", value: "#22c55e" },
  { name: "Lime", value: "#84cc16" },
  { name: "Yellow", value: "#eab308" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
  { name: "Purple", value: "#a855f7" },
  { name: "Slate", value: "#64748b" },
];

const TEAM_ICONS = [
  { name: "Users", icon: Users },
  { name: "Briefcase", icon: Briefcase },
  { name: "Building", icon: Building },
  { name: "Code", icon: Code },
  { name: "Gavel", icon: Gavel },
  { name: "Scale", icon: Scale },
  { name: "TrendingUp", icon: TrendingUp },
  { name: "Target", icon: Target },
  { name: "Award", icon: Award },
  { name: "Shield", icon: Shield },
  { name: "Zap", icon: Zap },
  { name: "Heart", icon: Heart },
  { name: "BookOpen", icon: BookOpen },
  { name: "Star", icon: Star },
];

const SUGGESTED_TAGS = [
  "Corporate", "M&A", "Litigation", "Real Estate", "IP", "Tax", 
  "Employment", "Banking", "Restructuring", "Private Equity",
  "High Priority", "Pilot Team", "Remote", "Hybrid"
];

const SUGGESTED_ROLES = [
  "Team Lead", "Senior Associate", "Associate", "Junior Associate",
  "Counsel", "Of Counsel", "Specialist", "Trainee", "Projektleiter"
];

interface TeamMember {
  employeeId: string;
  employeeName: string;
  role: string;
}

interface TeamFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  tags: string[];
  priority: number;
  isArchived: boolean;
  members: TeamMember[];
}

interface Employee {
  id: string;
  full_name: string;
  team_id: string | null;
  team_role?: string | null;
  role_profile?: { role_title?: string } | null;
}

interface TeamFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TeamFormData) => Promise<void>;
  initialData?: Partial<TeamFormData> & { id?: string };
  employees?: Employee[];
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function TeamFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  employees = [],
  isLoading = false,
  mode
}: TeamFormDialogProps) {
  const [formData, setFormData] = useState<TeamFormData>({
    name: "",
    description: "",
    color: "#6366f1",
    icon: "Users",
    tags: [],
    priority: 0,
    isArchived: false,
    members: []
  });
  
  const [newTag, setNewTag] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedTab, setSelectedTab] = useState("basic");

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        color: initialData.color || "#6366f1",
        icon: initialData.icon || "Users",
        tags: initialData.tags || [],
        priority: initialData.priority || 0,
        isArchived: initialData.isArchived || false,
        members: initialData.members || []
      });
    } else {
      setFormData({
        name: "",
        description: "",
        color: "#6366f1",
        icon: "Users",
        tags: [],
        priority: 0,
        isArchived: false,
        members: []
      });
    }
  }, [initialData, open]);

  const handleSubmit = async () => {
    await onSubmit(formData);
  };

  const addTag = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setNewTag("");
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const toggleMember = (employee: Employee, role: string = "") => {
    const exists = formData.members.find(m => m.employeeId === employee.id);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        members: prev.members.filter(m => m.employeeId !== employee.id)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        members: [...prev.members, {
          employeeId: employee.id,
          employeeName: employee.full_name,
          role: role || employee.role_profile?.role_title || ""
        }]
      }));
    }
  };

  const updateMemberRole = (employeeId: string, role: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map(m => 
        m.employeeId === employeeId ? { ...m, role } : m
      )
    }));
  };

  const filteredEmployees = employees.filter(emp => 
    emp.full_name.toLowerCase().includes(employeeSearch.toLowerCase())
  );

  const availableEmployees = filteredEmployees.filter(emp => 
    !emp.team_id || formData.members.some(m => m.employeeId === emp.id)
  );

  const SelectedIcon = TEAM_ICONS.find(i => i.name === formData.icon)?.icon || Users;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: `${formData.color}20` }}
            >
              <SelectedIcon className="w-5 h-5" style={{ color: formData.color }} />
            </div>
            {mode === "create" ? "Neues Team erstellen" : "Team bearbeiten"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create" 
              ? "Erstelle ein neues Team und weise direkt Mitarbeiter zu."
              : "Bearbeite die Team-Einstellungen und Mitgliedschaften."
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Basis
            </TabsTrigger>
            <TabsTrigger value="style" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Design
            </TabsTrigger>
            <TabsTrigger value="tags" className="flex items-center gap-2">
              <Tags className="w-4 h-4" />
              Tags
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              Mitglieder
              {formData.members.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {formData.members.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-4">
            <TabsContent value="basic" className="space-y-4 mt-0 px-1">
              <div className="space-y-2">
                <Label htmlFor="team-name">Team Name *</Label>
                <Input
                  id="team-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="z.B. Corporate Advisory"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="team-description">Beschreibung</Label>
                <Textarea
                  id="team-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Kurze Beschreibung des Teams..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Priorität</Label>
                <div className="flex items-center gap-2">
                  {[0, 1, 2, 3].map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant={formData.priority === p ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                      className="flex items-center gap-1"
                    >
                      {Array.from({ length: p }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                      {p === 0 && "Normal"}
                    </Button>
                  ))}
                </div>
              </div>

              {mode === "edit" && (
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="archived"
                    checked={formData.isArchived}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, isArchived: !!checked }))
                    }
                  />
                  <Label htmlFor="archived" className="flex items-center gap-2 cursor-pointer">
                    <Archive className="w-4 h-4" />
                    Team archivieren
                  </Label>
                </div>
              )}
            </TabsContent>

            <TabsContent value="style" className="space-y-6 mt-0 px-1">
              <div className="space-y-3">
                <Label>Team-Farbe</Label>
                <div className="grid grid-cols-6 gap-2">
                  {TEAM_COLORS.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={cn(
                        "w-full aspect-square rounded-lg transition-all hover:scale-105",
                        formData.color === color.value && "ring-2 ring-offset-2 ring-primary"
                      )}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="custom-color" className="text-sm text-muted-foreground">
                    Oder eigene Farbe:
                  </Label>
                  <Input
                    id="custom-color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-8 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-24 font-mono text-sm"
                    placeholder="#6366f1"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Team-Icon</Label>
                <div className="grid grid-cols-7 gap-2">
                  {TEAM_ICONS.map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon: name }))}
                      className={cn(
                        "p-3 rounded-lg border transition-all hover:bg-secondary/50",
                        formData.icon === name 
                          ? "border-primary bg-primary/10" 
                          : "border-border"
                      )}
                      title={name}
                    >
                      <Icon 
                        className="w-5 h-5 mx-auto" 
                        style={{ color: formData.icon === name ? formData.color : undefined }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-2">
                <Label>Vorschau</Label>
                <div 
                  className="p-4 rounded-xl border-2 flex items-center gap-3"
                  style={{ borderColor: `${formData.color}40`, backgroundColor: `${formData.color}10` }}
                >
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: `${formData.color}30` }}
                  >
                    <SelectedIcon className="w-6 h-6" style={{ color: formData.color }} />
                  </div>
                  <div>
                    <p className="font-semibold">{formData.name || "Team Name"}</p>
                    <p className="text-sm text-muted-foreground">
                      {formData.members.length} Mitglieder
                    </p>
                  </div>
                  {formData.priority > 0 && (
                    <div className="ml-auto flex">
                      {Array.from({ length: formData.priority }).map((_, i) => (
                        <Star key={i} className="w-4 h-4" style={{ color: formData.color, fill: formData.color }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tags" className="space-y-4 mt-0 px-1">
              <div className="space-y-2">
                <Label>Aktive Tags</Label>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-lg border bg-secondary/20">
                  {formData.tags.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Noch keine Tags hinzugefügt</span>
                  ) : (
                    formData.tags.map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="flex items-center gap-1 pr-1"
                        style={{ backgroundColor: `${formData.color}20`, color: formData.color }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-secondary rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-tag">Neuen Tag hinzufügen</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="z.B. High Priority"
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag(newTag))}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => addTag(newTag)}
                    disabled={!newTag}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vorschläge</Label>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TAGS.filter(t => !formData.tags.includes(t)).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary transition-colors"
                      onClick={() => addTag(tag)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="members" className="space-y-4 mt-0 px-1">
              {/* Selected Members */}
              <div className="space-y-2">
                <Label>Ausgewählte Mitglieder ({formData.members.length})</Label>
                <div className="space-y-2 min-h-[60px]">
                  {formData.members.length === 0 ? (
                    <div className="p-4 rounded-lg border border-dashed text-center text-muted-foreground">
                      Noch keine Mitglieder hinzugefügt
                    </div>
                  ) : (
                    formData.members.map((member) => (
                      <div 
                        key={member.employeeId}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-secondary/20 group"
                      >
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                          style={{ backgroundColor: `${formData.color}30`, color: formData.color }}
                        >
                          {member.employeeName.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{member.employeeName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            value={member.role}
                            onChange={(e) => updateMemberRole(member.employeeId, e.target.value)}
                            placeholder="Rolle im Team..."
                            className="w-40 h-8 text-sm"
                            list="role-suggestions"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => toggleMember({ id: member.employeeId, full_name: member.employeeName, team_id: null })}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <datalist id="role-suggestions">
                  {SUGGESTED_ROLES.map(role => (
                    <option key={role} value={role} />
                  ))}
                </datalist>
              </div>

              {/* Available Employees */}
              <div className="space-y-2">
                <Label>Verfügbare Mitarbeiter</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={employeeSearch}
                    onChange={(e) => setEmployeeSearch(e.target.value)}
                    placeholder="Mitarbeiter suchen..."
                    className="pl-9"
                  />
                </div>
                <div className="max-h-[200px] overflow-y-auto space-y-1 border rounded-lg p-2">
                  {availableEmployees.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      {employeeSearch ? "Keine Mitarbeiter gefunden" : "Alle Mitarbeiter sind bereits Teams zugewiesen"}
                    </p>
                  ) : (
                    availableEmployees.map((emp) => {
                      const isSelected = formData.members.some(m => m.employeeId === emp.id);
                      return (
                        <div
                          key={emp.id}
                          onClick={() => toggleMember(emp)}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                            isSelected 
                              ? "bg-primary/10 border border-primary/30" 
                              : "hover:bg-secondary/50"
                          )}
                        >
                          <Checkbox checked={isSelected} />
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium">
                            {emp.full_name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{emp.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {emp.role_profile?.role_title || "Keine Rolle"}
                            </p>
                          </div>
                          {emp.team_id && !isSelected && (
                            <Badge variant="outline" className="text-xs">
                              Bereits in Team
                            </Badge>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !formData.name.trim()}
            style={{ backgroundColor: formData.color }}
          >
            {isLoading ? "Speichern..." : mode === "create" ? "Team erstellen" : "Änderungen speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
