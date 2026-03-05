import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { 
  Building2, 
  Search, 
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Users,
  Pause,
  Play,
  Trash2,
  Calendar,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Shield,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Tables } from '@/integrations/supabase/types';

const ITEMS_PER_PAGE = 10;

type Organization = Tables<'organizations'>;

interface CreateOrgFormData {
  name: string;
  slug: string;
  maxEmployees: number;
  subscriptionStatus: 'trial' | 'active';
  trialEndDays: number;
  adminEmail: string;
  adminName: string;
  dpaSigned: boolean;
}

interface EditOrgFormData {
  name: string;
  slug: string;
  maxEmployees: number;
  subscriptionStatus: 'trial' | 'active' | 'paused' | 'cancelled';
  dpaSigned: boolean;
  dataRetentionDays: number;
}

const initialFormData: CreateOrgFormData = {
  name: '',
  slug: '',
  maxEmployees: 50,
  subscriptionStatus: 'trial',
  trialEndDays: 14,
  adminEmail: '',
  adminName: '',
  dpaSigned: false,
};

export default function SuperAdminOrganizations() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateOrgFormData>(initialFormData);
  const [deleteOrgId, setDeleteOrgId] = useState<string | null>(null);
  const [detailOrg, setDetailOrg] = useState<Organization | null>(null);
  const [editOrg, setEditOrg] = useState<Organization | null>(null);
  const [editFormData, setEditFormData] = useState<EditOrgFormData | null>(null);

  // Fetch organizations
  const { data: organizations, isLoading } = useQuery({
    queryKey: ['super-admin-organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;
      return data;
    },
  });

  // Fetch employee counts
  const { data: employeeCounts } = useQuery({
    queryKey: ['super-admin-org-employee-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('organization_id')
        .eq('is_active', true);

      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(emp => {
        counts[emp.organization_id] = (counts[emp.organization_id] || 0) + 1;
      });
      return counts;
    },
  });

  // Fetch admin counts
  const { data: adminCounts } = useQuery({
    queryKey: ['super-admin-org-admin-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('organization_id')
        .eq('role', 'org_admin');

      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(user => {
        if (user.organization_id) {
          counts[user.organization_id] = (counts[user.organization_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  // Create organization mutation
  const createOrgMutation = useMutation({
    mutationFn: async (data: CreateOrgFormData) => {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + data.trialEndDays);

      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.name,
          slug: data.slug,
          max_employees: data.maxEmployees,
          subscription_status: data.subscriptionStatus,
          subscription_ends_at: data.subscriptionStatus === 'trial' ? trialEndDate.toISOString() : null,
          data_processing_agreement_signed_at: data.dpaSigned ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      await supabase.rpc('log_audit_event', {
        p_action: 'organization_created',
        p_entity_type: 'organization',
        p_entity_id: newOrg.id,
        p_old_values: null,
        p_new_values: {
          name: data.name,
          slug: data.slug,
          admin_email: data.adminEmail,
          admin_name: data.adminName,
        },
      });

      return newOrg;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-organizations'] });
      setIsCreateModalOpen(false);
      setFormData(initialFormData);
      toast.success('Organisation erfolgreich erstellt');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Erstellen der Organisation', {
        description: error.message,
      });
    },
  });

  // Update organization mutation
  const updateOrgMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Tables<'organizations'>> }) => {
      const { error } = await supabase
        .from('organizations')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-organizations'] });
      setEditOrg(null);
      setEditFormData(null);
      toast.success('Organisation aktualisiert');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Aktualisieren', { description: error.message });
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('organizations')
        .update({ 
          subscription_status: status as 'trial' | 'active' | 'paused' | 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-organizations'] });
      toast.success('Status aktualisiert');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Aktualisieren', { description: error.message });
    },
  });

  // Soft delete mutation
  const deleteOrgMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('organizations')
        .update({ 
          deleted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      await supabase.rpc('log_audit_event', {
        p_action: 'organization_deleted',
        p_entity_type: 'organization',
        p_entity_id: id,
        p_old_values: null,
        p_new_values: { deleted_at: new Date().toISOString() },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-organizations'] });
      setDeleteOrgId(null);
      toast.success('Organisation gelöscht');
    },
    onError: (error: Error) => {
      toast.error('Fehler beim Löschen', { description: error.message });
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[äöüß]/g, (match) => {
        const map: Record<string, string> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };
        return map[match] || match;
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, name, slug: generateSlug(name) }));
  };

  const openEditDialog = (org: Organization) => {
    setEditOrg(org);
    setEditFormData({
      name: org.name,
      slug: org.slug,
      maxEmployees: org.max_employees || 50,
      subscriptionStatus: (org.subscription_status || 'trial') as EditOrgFormData['subscriptionStatus'],
      dpaSigned: !!org.data_processing_agreement_signed_at,
      dataRetentionDays: org.data_retention_days || 2555,
    });
  };

  const handleSaveEdit = () => {
    if (!editOrg || !editFormData) return;
    updateOrgMutation.mutate({
      id: editOrg.id,
      updates: {
        name: editFormData.name,
        slug: editFormData.slug,
        max_employees: editFormData.maxEmployees,
        subscription_status: editFormData.subscriptionStatus,
        data_processing_agreement_signed_at: editFormData.dpaSigned
          ? (editOrg.data_processing_agreement_signed_at || new Date().toISOString())
          : null,
        data_retention_days: editFormData.dataRetentionDays,
      },
    });
  };

  const handleViewUsers = (orgId: string) => {
    // Navigate to users page with org filter as search param
    navigate(`/super-admin/users?org=${orgId}`);
  };

  // Filter and paginate
  const filteredOrgs = organizations?.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || org.subscription_status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const totalPages = Math.ceil(filteredOrgs.length / ITEMS_PER_PAGE);
  const paginatedOrgs = filteredOrgs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Aktiv</Badge>;
      case 'trial':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Trial</Badge>;
      case 'paused':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Pausiert</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-muted-foreground">Gekündigt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('de-DE');
  };

  const stats = {
    total: organizations?.length || 0,
    active: organizations?.filter(o => o.subscription_status === 'active').length || 0,
    trial: organizations?.filter(o => o.subscription_status === 'trial').length || 0,
    paused: organizations?.filter(o => o.subscription_status === 'paused').length || 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Organisationen</h1>
          <p className="text-muted-foreground">Kunden und deren Abonnements verwalten</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Neue Organisation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Neue Organisation erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie eine neue Organisation und laden Sie einen Admin ein.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="org-name">Name *</Label>
                  <Input
                    id="org-name"
                    placeholder="z.B. Müller & Partner"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="org-slug">Slug *</Label>
                  <Input
                    id="org-slug"
                    placeholder="mueller-partner"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Wird in URLs verwendet</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="max-employees">Max. Mitarbeiter</Label>
                    <Input
                      id="max-employees"
                      type="number"
                      value={formData.maxEmployees}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxEmployees: parseInt(e.target.value) || 50 }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="subscription-status">Status</Label>
                    <Select 
                      value={formData.subscriptionStatus} 
                      onValueChange={(value: 'trial' | 'active') => setFormData(prev => ({ ...prev, subscriptionStatus: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="active">Aktiv</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.subscriptionStatus === 'trial' && (
                  <div className="grid gap-2">
                    <Label htmlFor="trial-days">Trial-Dauer (Tage)</Label>
                    <Input
                      id="trial-days"
                      type="number"
                      value={formData.trialEndDays}
                      onChange={(e) => setFormData(prev => ({ ...prev, trialEndDays: parseInt(e.target.value) || 14 }))}
                    />
                  </div>
                )}
                <div className="border-t pt-4 mt-2">
                  <p className="text-sm font-medium mb-3">Admin-Benutzer</p>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="admin-name">Admin Name *</Label>
                      <Input
                        id="admin-name"
                        placeholder="Max Mustermann"
                        value={formData.adminName}
                        onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="admin-email">Admin E-Mail *</Label>
                      <Input
                        id="admin-email"
                        type="email"
                        placeholder="admin@example.com"
                        value={formData.adminEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 pt-2">
                  <Checkbox 
                    id="dpa-signed"
                    checked={formData.dpaSigned}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, dpaSigned: checked === true }))}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="dpa-signed" className="cursor-pointer">
                      Auftragsverarbeitungsvertrag (DPA) unterzeichnet
                    </Label>
                    <p className="text-xs text-muted-foreground">DSGVO-Konformität bestätigt</p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Abbrechen</Button>
              <Button 
                onClick={() => createOrgMutation.mutate(formData)}
                disabled={!formData.name || !formData.slug || !formData.adminEmail || !formData.adminName || createOrgMutation.isPending}
              >
                {createOrgMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Erstellen...</>
                ) : 'Organisation erstellen'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Gesamt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Play className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Aktiv</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.trial}</p>
                <p className="text-xs text-muted-foreground">Trial</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Pause className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.paused}</p>
                <p className="text-xs text-muted-foreground">Pausiert</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card className="glass">
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Organisation suchen..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => { setStatusFilter(value); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="paused">Pausiert</SelectItem>
                <SelectItem value="cancelled">Gekündigt</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Organisation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Mitarbeiter</TableHead>
                <TableHead className="hidden lg:table-cell">Admins</TableHead>
                <TableHead className="hidden xl:table-cell">Abo-Ende</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Lade Organisationen...
                  </TableCell>
                </TableRow>
              ) : paginatedOrgs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Keine Organisationen gefunden
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrgs.map((org) => {
                  const empCount = employeeCounts?.[org.id] || 0;
                  const adminCount = adminCounts?.[org.id] || 0;
                  const usagePercent = org.max_employees ? Math.round((empCount / org.max_employees) * 100) : 0;
                  
                  return (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={org.logo_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {org.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{org.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{org.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(org.subscription_status)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{empCount}</span>
                            <span className="text-xs text-muted-foreground">/ {org.max_employees}</span>
                          </div>
                          <Progress value={usagePercent} className="w-24 h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline">{adminCount}</Badge>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell text-muted-foreground text-sm">
                        {formatDate(org.subscription_ends_at)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setDetailOrg(org)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Details anzeigen
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(org)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Bearbeiten
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewUsers(org.id)}>
                              <Users className="w-4 h-4 mr-2" />
                              Benutzer verwalten
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {org.subscription_status === 'paused' ? (
                              <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: org.id, status: 'active' })}>
                                <Play className="w-4 h-4 mr-2" />
                                Aktivieren
                              </DropdownMenuItem>
                            ) : org.subscription_status === 'active' || org.subscription_status === 'trial' ? (
                              <DropdownMenuItem onClick={() => updateStatusMutation.mutate({ id: org.id, status: 'paused' })}>
                                <Pause className="w-4 h-4 mr-2" />
                                Pausieren
                              </DropdownMenuItem>
                            ) : null}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteOrgId(org.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Zeige {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrgs.length)} von {filteredOrgs.length}
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(1)} disabled={currentPage === 1}>
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="px-3 text-sm">Seite {currentPage} von {totalPages}</span>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}>
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!detailOrg} onOpenChange={() => setDetailOrg(null)}>
        <DialogContent className="max-w-lg">
          {detailOrg && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={detailOrg.logo_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {detailOrg.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {detailOrg.name}
                </DialogTitle>
                <DialogDescription>Organisation Details & Konfiguration</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    {getStatusBadge(detailOrg.subscription_status)}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Slug</p>
                    <p className="text-sm font-mono">{detailOrg.slug}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Mitarbeiter</p>
                    <p className="text-sm font-medium">{employeeCounts?.[detailOrg.id] || 0} / {detailOrg.max_employees}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Admins</p>
                    <p className="text-sm font-medium">{adminCounts?.[detailOrg.id] || 0}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Abo-Start</p>
                    <p className="text-sm">{formatDate(detailOrg.subscription_started_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Abo-Ende</p>
                    <p className="text-sm">{formatDate(detailOrg.subscription_ends_at)}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">DPA unterzeichnet</p>
                    <p className="text-sm">
                      {detailOrg.data_processing_agreement_signed_at ? (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <Shield className="w-3 h-3 mr-1" />
                          {formatDate(detailOrg.data_processing_agreement_signed_at)}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Ausstehend</Badge>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Datenaufbewahrung</p>
                    <p className="text-sm">{detailOrg.data_retention_days} Tage</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Erstellt am</p>
                    <p className="text-sm">{formatDate(detailOrg.created_at)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Zuletzt aktualisiert</p>
                    <p className="text-sm">{formatDate(detailOrg.updated_at)}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailOrg(null)}>Schließen</Button>
                <Button onClick={() => { setDetailOrg(null); openEditDialog(detailOrg); }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Bearbeiten
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editOrg} onOpenChange={() => { setEditOrg(null); setEditFormData(null); }}>
        <DialogContent className="max-w-lg">
          {editOrg && editFormData && (
            <>
              <DialogHeader>
                <DialogTitle>Organisation bearbeiten</DialogTitle>
                <DialogDescription>{editOrg.name}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => prev ? { ...prev, name: e.target.value } : prev)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Slug</Label>
                  <Input
                    value={editFormData.slug}
                    onChange={(e) => setEditFormData(prev => prev ? { ...prev, slug: e.target.value } : prev)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Max. Mitarbeiter</Label>
                    <Input
                      type="number"
                      value={editFormData.maxEmployees}
                      onChange={(e) => setEditFormData(prev => prev ? { ...prev, maxEmployees: parseInt(e.target.value) || 50 } : prev)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select 
                      value={editFormData.subscriptionStatus} 
                      onValueChange={(value: EditOrgFormData['subscriptionStatus']) => setEditFormData(prev => prev ? { ...prev, subscriptionStatus: value } : prev)}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="trial">Trial</SelectItem>
                        <SelectItem value="active">Aktiv</SelectItem>
                        <SelectItem value="paused">Pausiert</SelectItem>
                        <SelectItem value="cancelled">Gekündigt</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Datenaufbewahrung (Tage)</Label>
                  <Input
                    type="number"
                    value={editFormData.dataRetentionDays}
                    onChange={(e) => setEditFormData(prev => prev ? { ...prev, dataRetentionDays: parseInt(e.target.value) || 2555 } : prev)}
                  />
                </div>
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    id="edit-dpa"
                    checked={editFormData.dpaSigned}
                    onCheckedChange={(checked) => setEditFormData(prev => prev ? { ...prev, dpaSigned: checked === true } : prev)}
                  />
                  <Label htmlFor="edit-dpa" className="cursor-pointer">DPA unterzeichnet</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => { setEditOrg(null); setEditFormData(null); }}>Abbrechen</Button>
                <Button 
                  onClick={handleSaveEdit}
                  disabled={!editFormData.name || !editFormData.slug || updateOrgMutation.isPending}
                >
                  {updateOrgMutation.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Speichern...</>
                  ) : 'Speichern'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteOrgId} onOpenChange={() => setDeleteOrgId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Organisation löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Organisation wird 
              als gelöscht markiert und ist nicht mehr zugänglich.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOrgId && deleteOrgMutation.mutate(deleteOrgId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteOrgMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Löschen...</>
              ) : 'Löschen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
