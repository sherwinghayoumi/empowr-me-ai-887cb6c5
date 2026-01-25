import { useState } from 'react';
import { 
  FileText, 
  Calendar,
  Download,
  Eye,
  MoreVertical,
  Pencil,
  Trash2,
  Globe,
  Lock,
  History,
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
import { Skeleton } from '@/components/ui/skeleton';
import type { Report } from '@/hooks/useReports';

interface ReportsListProps {
  reports: Report[] | undefined;
  isLoading: boolean;
  onView: (report: Report) => void;
  onEdit: (report: Report) => void;
  onDelete: (id: string) => void;
  onPublish: (report: Report) => void;
  onUnpublish: (id: string) => void;
}

export function ReportsList({
  reports,
  isLoading,
  onView,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
}: ReportsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setReportToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (reportToDelete) {
      onDelete(reportToDelete);
    }
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
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
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Keine Reports vorhanden</h3>
        <p className="text-muted-foreground">Erstellen Sie Ihren ersten Quarterly Report.</p>
      </div>
    );
  }

  // Group reports by year
  const reportsByYear = reports.reduce((acc, report) => {
    const year = report.year;
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(report);
    return acc;
  }, {} as Record<number, Report[]>);

  const sortedYears = Object.keys(reportsByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <>
      <div className="space-y-8">
        {sortedYears.map((year) => (
          <div key={year}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {year}
            </h3>
            <div className="space-y-3">
              {reportsByYear[year].map((report) => (
                <div 
                  key={report.id}
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-foreground truncate">{report.title}</h4>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {report.quarter} {report.year}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{report.practice_group}</span>
                        {report.regions && report.regions.length > 0 && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">
                              {report.regions.join(', ')}
                            </span>
                          </>
                        )}
                        {report.version && report.version > 1 && (
                          <>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <History className="w-3 h-3" />
                              v{report.version}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {report.published_at && (
                      <span className="text-xs text-muted-foreground hidden sm:block">
                        {new Date(report.published_at).toLocaleDateString('de-DE')}
                      </span>
                    )}
                    <Badge className={report.is_published 
                      ? "bg-skill-very-strong/20 text-skill-very-strong border-skill-very-strong/30"
                      : "bg-muted text-muted-foreground border-border"
                    }>
                      {report.is_published ? (
                        <><Globe className="w-3 h-3 mr-1" /> Veröffentlicht</>
                      ) : (
                        <><Lock className="w-3 h-3 mr-1" /> Entwurf</>
                      )}
                    </Badge>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onView(report)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Anzeigen
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(report)}>
                          <Pencil className="w-4 h-4 mr-2" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Herunterladen
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {report.is_published ? (
                          <DropdownMenuItem onClick={() => onUnpublish(report.id)}>
                            <Lock className="w-4 h-4 mr-2" />
                            Zurückziehen
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onPublish(report)}>
                            <Globe className="w-4 h-4 mr-2" />
                            Veröffentlichen
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => handleDeleteClick(report.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Der Report und alle zugehörigen Daten werden dauerhaft gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
