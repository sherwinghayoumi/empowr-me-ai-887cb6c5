import { useState } from "react";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { 
  Users, MoreVertical, Pencil, Archive, Trash2, Star,
  Briefcase, Building, Code, Gavel, Scale, TrendingUp,
  Target, Award, Shield, Zap, Heart, BookOpen, ArchiveRestore
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Users, Briefcase, Building, Code, Gavel, Scale, TrendingUp,
  Target, Award, Shield, Zap, Heart, BookOpen, Star
};

interface TeamMember {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  overall_score?: number | null;
  team_role?: string | null;
  role_profile?: { role_title?: string } | null;
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
  members?: TeamMember[] | null;
}

interface TeamCardProps {
  team: TeamData;
  index: number;
  onMemberClick: (memberId: string) => void;
  onEdit: (team: TeamData) => void;
  onArchive: (team: TeamData) => void;
  onDelete: (team: TeamData) => void;
}

export function TeamCard({ 
  team, 
  index, 
  onMemberClick, 
  onEdit, 
  onArchive, 
  onDelete 
}: TeamCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const color = team.color || "#6366f1";
  const IconComponent = ICON_MAP[team.icon || "Users"] || Users;
  const memberCount = team.member_count || team.members?.length || 0;
  const isArchived = team.is_archived;

  return (
    <GlassCard 
      className={`hover-lift h-full transition-all duration-300 ${isArchived ? 'opacity-60' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        borderColor: isHovered ? `${color}40` : undefined,
        boxShadow: isHovered ? `0 8px 32px ${color}20` : undefined
      }}
    >
      <GlassCardHeader>
        <div className="flex items-center justify-between">
          <GlassCardTitle className="text-foreground flex items-center gap-2">
            <div 
              className="p-2 rounded-lg transition-transform duration-300"
              style={{ 
                backgroundColor: `${color}20`,
                transform: isHovered ? 'scale(1.1)' : 'scale(1)'
              }}
            >
              <IconComponent 
                className="w-5 h-5 transition-transform duration-300" 
                style={{ color }}
              />
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-2">
                {team.name}
                {isArchived && (
                  <Badge variant="outline" className="text-xs">
                    <Archive className="w-3 h-3 mr-1" />
                    Archiviert
                  </Badge>
                )}
              </span>
              {(team.priority || 0) > 0 && (
                <div className="flex mt-0.5">
                  {Array.from({ length: team.priority || 0 }).map((_, i) => (
                    <Star key={i} className="w-3 h-3" style={{ color, fill: color }} />
                  ))}
                </div>
              )}
            </div>
          </GlassCardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              className="backdrop-blur"
              style={{ backgroundColor: `${color}20`, color }}
            >
              <AnimatedCounter 
                value={Math.round(team.average_score || 0)} 
                suffix="%" 
                duration={1500} 
                delay={index * 100} 
              />
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(team)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Bearbeiten
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(team)}>
                  {isArchived ? (
                    <>
                      <ArchiveRestore className="w-4 h-4 mr-2" />
                      Wiederherstellen
                    </>
                  ) : (
                    <>
                      <Archive className="w-4 h-4 mr-2" />
                      Archivieren
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => onDelete(team)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {memberCount} Mitglieder
        </p>
        {team.tags && team.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {team.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="outline" 
                className="text-xs"
                style={{ borderColor: `${color}40`, color }}
              >
                {tag}
              </Badge>
            ))}
            {team.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{team.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </GlassCardHeader>
      <GlassCardContent className="space-y-2">
        {team.members?.map((member) => (
          <button
            key={member.id}
            onClick={() => onMemberClick(member.id)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-all duration-200 text-left group"
          >
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-transform duration-200 group-hover:scale-110"
              style={{ backgroundColor: `${color}20`, color }}
            >
              {member.full_name.split(" ").map(n => n[0]).join("")}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{member.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {member.team_role || member.role_profile?.role_title || "—"}
              </p>
            </div>
            <span 
              className="text-sm font-medium"
              style={{ color }}
            >
              {Math.round(member.overall_score || 0)}%
            </span>
          </button>
        ))}
        {(!team.members || team.members.length === 0) && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Keine Mitglieder in diesem Team
          </p>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}
