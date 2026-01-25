import { Header } from "@/components/Header";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Calendar,
  Download,
  Eye,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data
const mockReports = [
  { 
    id: "1", 
    title: "Q1 2025 Competency Report",
    quarter: "Q1",
    year: 2025,
    is_published: true,
    created_at: "2025-01-15",
    practice_group: "Corporate Law / M&A"
  },
  { 
    id: "2", 
    title: "Q4 2024 Competency Report",
    quarter: "Q4",
    year: 2024,
    is_published: true,
    created_at: "2024-10-20",
    practice_group: "Corporate Law / M&A"
  },
  { 
    id: "3", 
    title: "Q3 2024 Competency Report",
    quarter: "Q3",
    year: 2024,
    is_published: true,
    created_at: "2024-07-15",
    practice_group: "Corporate Law / M&A"
  },
];

const Reports = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Quartalsberichte
            </h1>
            <p className="text-muted-foreground">
              Verwalten Sie Kompetenz-Reports und Analysen
            </p>
          </div>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            Neuer Report
          </Button>
        </div>

        {/* Reports List */}
        <GlassCard>
          <GlassCardHeader>
            <GlassCardTitle>Alle Reports</GlassCardTitle>
          </GlassCardHeader>
          <GlassCardContent>
            <div className="space-y-4">
              {mockReports.map((report) => (
                <div 
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-xl glass-subtle hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">{report.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-muted-foreground">{report.practice_group}</span>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {new Date(report.created_at).toLocaleDateString('de-DE')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={report.is_published 
                      ? "bg-skill-very-strong/20 text-skill-very-strong border-skill-very-strong/30"
                      : "bg-skill-moderate/20 text-skill-moderate border-skill-moderate/30"
                    }>
                      {report.is_published ? "Veröffentlicht" : "Entwurf"}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Herunterladen
                        </DropdownMenuItem>
                        <DropdownMenuItem>Bearbeiten</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Löschen</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

export default Reports;
