import { useState } from "react";
import { Header } from "@/components/Header";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Plus, 
  Search,
  Users,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data
const mockRoleProfiles = [
  { 
    id: "1", 
    role_title: "Junior Associate",
    role_key: "junior-associate",
    experience_level: "0-2 Jahre",
    practice_group: "Corporate Law / M&A",
    competency_count: 24,
    is_published: true,
    quarter: "Q1",
    year: 2025
  },
  { 
    id: "2", 
    role_title: "Mid-Level Associate",
    role_key: "mid-level-associate",
    experience_level: "3-5 Jahre",
    practice_group: "Corporate Law / M&A",
    competency_count: 28,
    is_published: true,
    quarter: "Q1",
    year: 2025
  },
  { 
    id: "3", 
    role_title: "Senior Associate",
    role_key: "senior-associate",
    experience_level: "6-8 Jahre",
    practice_group: "Corporate Law / M&A",
    competency_count: 32,
    is_published: true,
    quarter: "Q1",
    year: 2025
  },
  { 
    id: "4", 
    role_title: "Counsel",
    role_key: "counsel",
    experience_level: "8+ Jahre",
    practice_group: "Corporate Law / M&A",
    competency_count: 30,
    is_published: false,
    quarter: "Q1",
    year: 2025
  },
];

const RoleProfiles = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProfiles = mockRoleProfiles.filter(profile =>
    profile.role_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.role_key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Rollenprofile
            </h1>
            <p className="text-muted-foreground">
              Definieren Sie Kompetenzen für verschiedene Karrierestufen
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Neues Profil
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rollenprofil suchen..."
            className="pl-10 bg-background/40 border-border/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Role Profiles */}
        <GlassCard>
          <GlassCardHeader>
            <div className="flex items-center justify-between">
              <GlassCardTitle>Q1 2025 - Corporate Law / M&A</GlassCardTitle>
              <Badge variant="outline">{filteredProfiles.length} Profile</Badge>
            </div>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-3">
              {filteredProfiles.map((profile) => (
                <div 
                  key={profile.id}
                  className="flex items-center justify-between p-4 rounded-xl glass-subtle hover:bg-secondary/30 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{profile.role_title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{profile.experience_level}</span>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {profile.competency_count} Kompetenzen
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={profile.is_published 
                      ? "bg-skill-very-strong/20 text-skill-very-strong border-skill-very-strong/30"
                      : "bg-skill-moderate/20 text-skill-moderate border-skill-moderate/30"
                    }>
                      {profile.is_published ? "Aktiv" : "Entwurf"}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Kompetenzen bearbeiten</DropdownMenuItem>
                        <DropdownMenuItem>Duplizieren</DropdownMenuItem>
                        <DropdownMenuItem>Exportieren</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Archivieren</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </GlassCardContent>
        </GlassCard>
      </main>
    </div>
  );
};

export default RoleProfiles;
