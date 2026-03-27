import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { 
  Users, MoreVertical, Pencil, Archive, Trash2,
  ArchiveRestore
} from "lucide-react";

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

export function TeamCard({ team, index, onMemberClick, onEdit, onArchive, onDelete }: TeamCardProps) {
  const memberCount = team.member_count || team.members?.length || 0;
  const isArchived = team.is_archived;
  const avgScore = Math.round(team.average_score || 0);

  return (
    <Card className={`bg-card/80 border-border/50 ${isArchived ? 'opacity-60' : ''}`}>
      <CardHeader className="py-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            {team.name}
            {isArchived && <Badge variant="outline" className="text-[10px]">Archiviert</Badge>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tabular-nums text-primary">{avgScore}%</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <MoreVertical className="w-3.5 h-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(team)}><Pencil className="w-3.5 h-3.5 mr-2" />Bearbeiten</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onArchive(team)}>
                  {isArchived ? <><ArchiveRestore className="w-3.5 h-3.5 mr-2" />Wiederherstellen</> : <><Archive className="w-3.5 h-3.5 mr-2" />Archivieren</>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(team)} className="text-destructive focus:text-destructive"><Trash2 className="w-3.5 h-3.5 mr-2" />Löschen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{memberCount} Mitglieder</p>
      </CardHeader>
      <CardContent className="p-0">
        {team.members && team.members.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50">
                <TableHead className="text-xs">Name</TableHead>
                <TableHead className="text-xs">Rolle</TableHead>
                <TableHead className="text-xs text-right">Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team.members.map(member => (
                <TableRow
                  key={member.id}
                  className="cursor-pointer border-border/30 hover:bg-muted/30"
                  onClick={() => onMemberClick(member.id)}
                >
                  <TableCell className="text-xs py-1.5 font-medium">{member.full_name}</TableCell>
                  <TableCell className="text-xs py-1.5 text-muted-foreground">{member.team_role || member.role_profile?.role_title || '—'}</TableCell>
                  <TableCell className="text-xs py-1.5 text-right tabular-nums">{Math.round(member.overall_score || 0)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-xs text-muted-foreground text-center py-4">Keine Mitglieder</p>
        )}
      </CardContent>
    </Card>
  );
}
