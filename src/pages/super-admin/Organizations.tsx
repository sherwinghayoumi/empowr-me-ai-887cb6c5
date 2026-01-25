import { useState } from "react";
import { Header } from "@/components/Header";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Plus, 
  Search, 
  Users, 
  Calendar,
  MoreVertical,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data - wird später durch Supabase ersetzt
const mockOrganizations = [
  { 
    id: "1", 
    name: "Hengeler Mueller", 
    slug: "hengeler-mueller",
    subscription_status: "active",
    max_employees: 200,
    employee_count: 156,
    created_at: "2024-01-15"
  },
  { 
    id: "2", 
    name: "Freshfields Bruckhaus", 
    slug: "freshfields",
    subscription_status: "active",
    max_employees: 300,
    employee_count: 234,
    created_at: "2024-02-20"
  },
  { 
    id: "3", 
    name: "Gleiss Lutz", 
    slug: "gleiss-lutz",
    subscription_status: "trial",
    max_employees: 50,
    employee_count: 28,
    created_at: "2024-06-01"
  },
  { 
    id: "4", 
    name: "CMS Hasche Sigle", 
    slug: "cms",
    subscription_status: "paused",
    max_employees: 150,
    employee_count: 112,
    created_at: "2023-11-10"
  },
];

const Organizations = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrgs = mockOrganizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-skill-very-strong/20 text-skill-very-strong border-skill-very-strong/30">Aktiv</Badge>;
      case "trial":
        return <Badge className="bg-primary/20 text-primary border-primary/30">Trial</Badge>;
      case "paused":
        return <Badge className="bg-skill-moderate/20 text-skill-moderate border-skill-moderate/30">Pausiert</Badge>;
      case "cancelled":
        return <Badge className="bg-destructive/20 text-destructive border-destructive/30">Gekündigt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Organisationen
            </h1>
            <p className="text-muted-foreground">
              Verwalten Sie alle Kunden-Organisationen
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Neue Organisation
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Organisation suchen..."
            className="pl-10 bg-background/40 border-border/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Organizations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrgs.map((org) => (
            <GlassCard key={org.id} className="hover-lift">
              <GlassCardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl glass-subtle flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Öffnen
                      </DropdownMenuItem>
                      <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                      <DropdownMenuItem>Benutzer verwalten</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Deaktivieren</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <h3 className="text-lg font-semibold text-foreground mb-1">{org.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">/{org.slug}</p>

                <div className="flex items-center gap-2 mb-4">
                  {getStatusBadge(org.subscription_status)}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{org.employee_count} / {org.max_employees}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(org.created_at).toLocaleDateString('de-DE')}</span>
                  </div>
                </div>
              </GlassCardContent>
            </GlassCard>
          ))}
        </div>

        {filteredOrgs.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Keine Organisationen gefunden</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Organizations;
