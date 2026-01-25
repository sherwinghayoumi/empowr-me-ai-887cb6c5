import { useState, useMemo } from 'react';
import { 
  Plus, 
  Upload, 
  Search, 
  Shield,
  Globe,
  Calendar,
  Filter,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/GlassCard';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleProfileCard } from '@/components/role-profiles/RoleProfileCard';
import { CSVUploadWizard } from '@/components/role-profiles/CSVUploadWizard';
import { PublishDialog } from '@/components/role-profiles/PublishDialog';
import { useRoleProfiles, type RoleProfile } from '@/hooks/useRoleProfiles';
import { toast } from 'sonner';

const RoleProfiles = () => {
  const { roleProfiles, competencyCounts, isLoading, deleteRoleProfile } = useRoleProfiles();

  const [searchQuery, setSearchQuery] = useState('');
  const [quarterFilter, setQuarterFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [uploadWizardOpen, setUploadWizardOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  // Get unique quarters for filter
  const quarters = useMemo(() => {
    const set = new Set<string>();
    roleProfiles?.forEach(rp => set.add(`${rp.quarter} ${rp.year}`));
    return Array.from(set).sort().reverse();
  }, [roleProfiles]);

  // Current quarter/year for publishing
  const currentQuarter = useMemo(() => {
    if (quarterFilter !== 'all') {
      const [q, y] = quarterFilter.split(' ');
      return { quarter: q, year: parseInt(y) };
    }
    // Default to latest quarter with drafts
    const drafts = roleProfiles?.filter(rp => !rp.is_published);
    if (drafts?.length) {
      return { quarter: drafts[0].quarter, year: drafts[0].year };
    }
    return { quarter: 'Q2', year: new Date().getFullYear() };
  }, [quarterFilter, roleProfiles]);

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    return roleProfiles?.filter(profile => {
      const matchesSearch = 
        profile.role_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.role_key.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesQuarter = quarterFilter === 'all' || 
        `${profile.quarter} ${profile.year}` === quarterFilter;
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'published' && profile.is_published) ||
        (statusFilter === 'draft' && !profile.is_published);
      return matchesSearch && matchesQuarter && matchesStatus;
    }) || [];
  }, [roleProfiles, searchQuery, quarterFilter, statusFilter]);

  // Group by quarter/year
  const groupedProfiles = useMemo(() => {
    const groups: Record<string, RoleProfile[]> = {};
    filteredProfiles.forEach(profile => {
      const key = `${profile.quarter} ${profile.year}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(profile);
    });
    return groups;
  }, [filteredProfiles]);

  // Count drafts for current filter
  const draftCount = useMemo(() => {
    if (quarterFilter === 'all') {
      return roleProfiles?.filter(rp => !rp.is_published).length || 0;
    }
    return filteredProfiles.filter(rp => !rp.is_published).length;
  }, [roleProfiles, filteredProfiles, quarterFilter]);

  const handleView = (profile: RoleProfile) => {
    toast.info('Detail-Ansicht', { description: `${profile.role_title} wird angezeigt` });
  };

  const handleEdit = (profile: RoleProfile) => {
    toast.info('Bearbeiten', { description: `${profile.role_title} wird bearbeitet` });
  };

  const handleDelete = (id: string) => {
    setProfileToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (profileToDelete) {
      deleteRoleProfile.mutate(profileToDelete);
    }
    setDeleteDialogOpen(false);
    setProfileToDelete(null);
  };

  const handleDuplicate = (profile: RoleProfile) => {
    toast.info('Duplizieren', { description: `${profile.role_title} wird dupliziert` });
  };

  const handleExport = (profile: RoleProfile) => {
    toast.info('Export', { description: `${profile.role_title} wird exportiert` });
  };

  const handleUploadSuccess = () => {
    toast.success('Import erfolgreich');
  };

  const handlePublishSuccess = () => {
    // Refresh data
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Role Profiles</h1>
          <p className="text-muted-foreground">
            Definieren Sie Kompetenzen für verschiedene Karrierestufen
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setUploadWizardOpen(true)}>
            <Upload className="w-4 h-4 mr-2" />
            CSV Import
          </Button>
          {draftCount > 0 && (
            <Button onClick={() => setPublishDialogOpen(true)}>
              <Globe className="w-4 h-4 mr-2" />
              Veröffentlichen ({draftCount})
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-muted/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-xs">Gesamt</span>
          </div>
          <p className="text-2xl font-bold">{roleProfiles?.length || 0}</p>
          <p className="text-xs text-muted-foreground">Role Profiles</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Globe className="w-4 h-4" />
            <span className="text-xs">Aktiv</span>
          </div>
          <p className="text-2xl font-bold text-skill-very-strong">
            {roleProfiles?.filter(rp => rp.is_published).length || 0}
          </p>
          <p className="text-xs text-muted-foreground">Veröffentlicht</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Layers className="w-4 h-4" />
            <span className="text-xs">Entwürfe</span>
          </div>
          <p className="text-2xl font-bold text-skill-moderate">
            {roleProfiles?.filter(rp => !rp.is_published).length || 0}
          </p>
          <p className="text-xs text-muted-foreground">Zu veröffentlichen</p>
        </div>
        <div className="p-4 rounded-xl bg-muted/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">Quarters</span>
          </div>
          <p className="text-2xl font-bold">{quarters.length}</p>
          <p className="text-xs text-muted-foreground">Zeiträume</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Role Profiles durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={quarterFilter} onValueChange={setQuarterFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Quarter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Quarters</SelectItem>
            {quarters.map(q => (
              <SelectItem key={q} value={q}>{q}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            <SelectItem value="published">Veröffentlicht</SelectItem>
            <SelectItem value="draft">Entwurf</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Role Profiles List */}
      {isLoading ? (
        <GlassCard>
          <GlassCardContent className="py-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-muted/30">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      ) : Object.keys(groupedProfiles).length === 0 ? (
        <GlassCard>
          <GlassCardContent className="py-12 text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Keine Role Profiles gefunden</h3>
            <p className="text-muted-foreground mb-4">
              Importieren Sie CSV-Dateien, um Role Profiles zu erstellen.
            </p>
            <Button onClick={() => setUploadWizardOpen(true)}>
              <Upload className="w-4 h-4 mr-2" />
              CSV Import starten
            </Button>
          </GlassCardContent>
        </GlassCard>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedProfiles)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([quarter, profiles]) => (
              <GlassCard key={quarter}>
                <GlassCardHeader>
                  <div className="flex items-center justify-between">
                    <GlassCardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      {quarter}
                    </GlassCardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{profiles.length} Profile</Badge>
                      {profiles.some(p => !p.is_published) && (
                        <Badge className="bg-skill-moderate/20 text-skill-moderate border-skill-moderate/30">
                          {profiles.filter(p => !p.is_published).length} Entwürfe
                        </Badge>
                      )}
                    </div>
                  </div>
                </GlassCardHeader>
                <GlassCardContent>
                  <div className="space-y-3">
                    {profiles.map((profile) => (
                      <RoleProfileCard
                        key={profile.id}
                        profile={profile}
                        competencyCount={competencyCounts?.[profile.id] || 0}
                        onView={() => handleView(profile)}
                        onEdit={() => handleEdit(profile)}
                        onDelete={() => handleDelete(profile.id)}
                        onDuplicate={() => handleDuplicate(profile)}
                        onExport={() => handleExport(profile)}
                      />
                    ))}
                  </div>
                </GlassCardContent>
              </GlassCard>
            ))}
        </div>
      )}

      {/* CSV Upload Wizard */}
      <CSVUploadWizard
        open={uploadWizardOpen}
        onOpenChange={setUploadWizardOpen}
        onSuccess={handleUploadSuccess}
      />

      {/* Publish Dialog */}
      <PublishDialog
        open={publishDialogOpen}
        onOpenChange={setPublishDialogOpen}
        quarter={currentQuarter.quarter}
        year={currentQuarter.year}
        draftCount={draftCount}
        onSuccess={handlePublishSuccess}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Role Profile löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Alle zugehörigen Kompetenzen und Subskills werden ebenfalls gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RoleProfiles;
