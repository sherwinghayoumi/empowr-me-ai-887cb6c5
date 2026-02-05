import { 
  FileText, 
  Calendar,
  Globe,
  Building2,
  Users,
  History,
  Pencil,
  Download,
  ExternalLink,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import type { Report } from '@/hooks/useReports';
import { useReportChangelog } from '@/hooks/useReports';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ReportDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report | null;
  onEdit: () => void;
}

export function ReportDetailDialog({
  open,
  onOpenChange,
  report,
  onEdit,
}: ReportDetailDialogProps) {
  const { data: changelog, isLoading: changelogLoading } = useReportChangelog(report?.id);

  if (!report) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">{report.title}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{report.quarter} {report.year}</Badge>
                  <Badge className={report.is_published 
                    ? "bg-skill-very-strong/20 text-skill-very-strong border-skill-very-strong/30"
                    : "bg-muted text-muted-foreground border-border"
                  }>
                    {report.is_published ? 'Veröffentlicht' : 'Entwurf'}
                  </Badge>
                  {report.version && report.version > 1 && (
                    <Badge variant="outline" className="text-xs">
                      <History className="w-3 h-3 mr-1" />
                      v{report.version}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button size="sm" onClick={onEdit}>
                <Pencil className="w-4 h-4 mr-2" />
                Bearbeiten
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Meta Info */}
        <div className="grid grid-cols-4 gap-4 py-4 shrink-0">
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Erstellt</span>
            </div>
            <p className="text-sm font-medium">
              {report.created_at ? new Date(report.created_at).toLocaleDateString('de-DE') : '-'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-xs">Veröffentlicht</span>
            </div>
            <p className="text-sm font-medium">
              {report.published_at ? new Date(report.published_at).toLocaleDateString('de-DE') : '-'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Globe className="w-4 h-4" />
              <span className="text-xs">Regionen</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {report.regions?.map(r => (
                <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
              ))}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building2 className="w-4 h-4" />
              <span className="text-xs">Practice Group</span>
            </div>
            <p className="text-sm font-medium truncate">{report.practice_group}</p>
          </div>
        </div>

        <Separator />

        {/* Content Tabs */}
        <Tabs defaultValue="summary" className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="shrink-0">
            <TabsTrigger value="summary">Executive Summary</TabsTrigger>
            <TabsTrigger value="full">Vollständiger Report</TabsTrigger>
            <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
            <TabsTrigger value="history">Versions-History</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full">
              <div className="p-4 bg-muted/20 rounded-lg">
                {report.executive_summary ? (
                  <MarkdownRenderer content={report.executive_summary} />
                ) : (
                  <p className="text-muted-foreground italic">Keine Executive Summary vorhanden.</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="full" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full">
              <div className="p-4 bg-muted/20 rounded-lg">
                {report.full_report_markdown ? (
                  <MarkdownRenderer content={report.full_report_markdown} />
                ) : (
                  <p className="text-muted-foreground italic">Kein vollständiger Report vorhanden.</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="impact" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-6 p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-6 rounded-xl bg-muted/30 text-center">
                    <Building2 className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="text-3xl font-bold text-foreground">--</p>
                    <p className="text-sm text-muted-foreground">Betroffene Organisationen</p>
                  </div>
                  <div className="p-6 rounded-xl bg-muted/30 text-center">
                    <Users className="w-8 h-8 mx-auto text-primary mb-2" />
                    <p className="text-3xl font-bold text-foreground">--</p>
                    <p className="text-sm text-muted-foreground">Betroffene Mitarbeiter</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Die Impact-Analyse wird nach Veröffentlichung des Reports berechnet.
                </p>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-4 p-4">
                {changelogLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-start gap-3">
                        <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : changelog && changelog.length > 0 ? (
                  <div className="space-y-4">
                    {changelog.map((entry, index) => (
                      <div key={entry.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <History className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{entry.change_summary}</p>
                          <p className="text-xs text-muted-foreground">
                            {entry.created_at ? new Date(entry.created_at).toLocaleString('de-DE') : '-'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Keine Änderungshistorie vorhanden.
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
