import { 
  Shield, 
  Users, 
  MoreVertical,
  ChevronRight,
  Globe,
  Lock,
  History,
  Eye,
  Pencil,
  Trash2,
  Download,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { RoleProfile } from '@/hooks/useRoleProfiles';

interface RoleProfileCardProps {
  profile: RoleProfile;
  competencyCount: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onExport: () => void;
}

export function RoleProfileCard({
  profile,
  competencyCount,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onExport,
}: RoleProfileCardProps) {
  return (
    <div 
      className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
      onClick={onView}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-foreground truncate">{profile.role_title}</h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {profile.quarter} {profile.year}
            </Badge>
            {profile.experience_level && (
              <span className="text-sm text-muted-foreground">{profile.experience_level}</span>
            )}
            <span className="text-muted-foreground">•</span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Users className="w-3 h-3" />
              {competencyCount} Kompetenzen
            </div>
            {profile.version && profile.version > 1 && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <History className="w-3 h-3" />
                  v{profile.version}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <Badge className={profile.is_published 
          ? "bg-skill-very-strong/20 text-skill-very-strong border-skill-very-strong/30"
          : "bg-muted text-muted-foreground border-border"
        }>
          {profile.is_published ? (
            <><Globe className="w-3 h-3 mr-1" /> Aktiv</>
          ) : (
            <><Lock className="w-3 h-3 mr-1" /> Entwurf</>
          )}
        </Badge>

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(); }}>
              <Eye className="w-4 h-4 mr-2" />
              Anzeigen
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              <Pencil className="w-4 h-4 mr-2" />
              Bearbeiten
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
              <Copy className="w-4 h-4 mr-2" />
              Duplizieren
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onExport(); }}>
              <Download className="w-4 h-4 mr-2" />
              Exportieren
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Löschen
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </div>
  );
}
