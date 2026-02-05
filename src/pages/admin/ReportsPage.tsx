import { useState } from "react";
import { Header } from "@/components/Header";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  FileText, 
  TrendingUp, 
  Calendar, 
  Star,
  Search,
  Globe,
  Building2,
  Clock,
  ChevronRight,
  BookOpen,
  X,
  ArrowLeft,
} from "lucide-react";
import { useReports, type Report } from "@/hooks/useReports";
import { cn } from "@/lib/utils";
import { MarkdownRenderer } from "@/components/reports/MarkdownRenderer";

const ReportsPage = () => {
  const { reports, isLoading } = useReports();
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Filter only published reports for org admins
  const publishedReports = reports?.filter(r => r.is_published) || [];
  
  // Apply filters
  const filteredReports = publishedReports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.practice_group?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.executive_summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = yearFilter === "all" || report.year.toString() === yearFilter;
    return matchesSearch && matchesYear;
  });

  // Get unique years for filter
  const years = [...new Set(publishedReports.map(r => r.year))].sort((a, b) => b - a);

  // Find the latest/main report
  const mainReport = filteredReports.length > 0 ? filteredReports[0] : null;
  const otherReports = filteredReports.slice(1);

  // Stats
  const totalReports = publishedReports.length;
  const thisYearReports = publishedReports.filter(r => r.year === new Date().getFullYear()).length;

  if (selectedReport) {
    return <ReportReader report={selectedReport} onBack={() => setSelectedReport(null)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      <main className="container py-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Reports</h1>
              <p className="text-muted-foreground mt-1">
                Quarterly Skill-Analysen und Future-Role-Skill-Matrices
              </p>
            </div>
          </div>
        </ScrollReveal>
        
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <ScrollReveal delay={0}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group">
                  <FileText className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : <AnimatedCounter value={totalReports} duration={1500} />}
                  </p>
                  <p className="text-sm text-muted-foreground">Verfügbare Reports</p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
          
          <ScrollReveal delay={100}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[hsl(var(--skill-very-strong))]/20 flex items-center justify-center group">
                  <TrendingUp className="w-6 h-6 text-[hsl(var(--skill-very-strong))] transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : <AnimatedCounter value={thisYearReports} duration={1500} delay={100} />}
                  </p>
                  <p className="text-sm text-muted-foreground">Reports {new Date().getFullYear()}</p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <GlassCard className="hover-lift">
              <GlassCardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center group">
                  <Calendar className="w-6 h-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {isLoading ? <Skeleton className="h-8 w-12" /> : years[0] || "-"}
                  </p>
                  <p className="text-sm text-muted-foreground">Aktuellstes Jahr</p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </ScrollReveal>
        </div>

        {/* Filters */}
        <ScrollReveal delay={250}>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Reports durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Jahr" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Jahre</SelectItem>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : filteredReports.length === 0 ? (
          <GlassCard>
            <GlassCardContent className="py-16 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Keine Reports gefunden</h3>
              <p className="text-muted-foreground">
                {searchQuery || yearFilter !== "all" 
                  ? "Versuchen Sie andere Suchkriterien."
                  : "Es sind noch keine veröffentlichten Reports verfügbar."}
              </p>
            </GlassCardContent>
          </GlassCard>
        ) : (
          <>
            {/* Main/Latest Report - Highlighted */}
            {mainReport && (
              <ScrollReveal delay={300}>
                <GlassCard 
                  className="border-2 border-primary/50 mb-6 hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 cursor-pointer group"
                  onClick={() => setSelectedReport(mainReport)}
                >
                  <GlassCardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Star className="w-7 h-7 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className="bg-primary text-primary-foreground">{mainReport.quarter} {mainReport.year}</Badge>
                          {mainReport.practice_group && (
                            <Badge variant="outline">{mainReport.practice_group}</Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {mainReport.title}
                        </h3>
                        {mainReport.executive_summary && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {mainReport.executive_summary}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          {mainReport.published_at && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(mainReport.published_at).toLocaleDateString('de-DE')}
                            </span>
                          )}
                          {mainReport.regions && mainReport.regions.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              {mainReport.regions.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  </GlassCardContent>
                </GlassCard>
              </ScrollReveal>
            )}

            {/* Other Reports */}
            {otherReports.length > 0 && (
              <ScrollReveal delay={400}>
                <GlassCard>
                  <GlassCardHeader>
                    <GlassCardTitle className="text-foreground flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Weitere Reports ({otherReports.length})
                    </GlassCardTitle>
                  </GlassCardHeader>
                  <GlassCardContent className="space-y-3">
                    {otherReports.map((report, index) => (
                      <ScrollReveal key={report.id} delay={index * 50}>
                        <div 
                          className="flex items-center gap-4 p-4 rounded-lg bg-secondary/30 backdrop-blur hover:bg-secondary/50 transition-all duration-200 cursor-pointer group"
                          onClick={() => setSelectedReport(report)}
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
                              {report.title}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {report.quarter} {report.year}
                              </Badge>
                              {report.practice_group && (
                                <span className="text-xs">{report.practice_group}</span>
                              )}
                              {report.published_at && (
                                <>
                                  <span>•</span>
                                  <span className="text-xs">
                                    {new Date(report.published_at).toLocaleDateString('de-DE')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                        </div>
                      </ScrollReveal>
                    ))}
                  </GlassCardContent>
                </GlassCard>
              </ScrollReveal>
            )}
          </>
        )}
      </main>
    </div>
  );
};

// Full Report Reader Component
interface ReportReaderProps {
  report: Report;
  onBack: () => void;
}

function ReportReader({ report, onBack }: ReportReaderProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      <main className="container py-8">
        {/* Back Button & Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zu Reports
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <FileText className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">{report.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-primary text-primary-foreground">{report.quarter} {report.year}</Badge>
                  {report.practice_group && (
                    <Badge variant="outline">{report.practice_group}</Badge>
                  )}
                  {report.version && report.version > 1 && (
                    <Badge variant="outline" className="text-xs">v{report.version}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meta Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <GlassCard>
            <GlassCardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Erstellt</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {report.created_at ? new Date(report.created_at).toLocaleDateString('de-DE') : '-'}
              </p>
            </GlassCardContent>
          </GlassCard>
          <GlassCard>
            <GlassCardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Veröffentlicht</span>
              </div>
              <p className="text-sm font-medium text-foreground">
                {report.published_at ? new Date(report.published_at).toLocaleDateString('de-DE') : '-'}
              </p>
            </GlassCardContent>
          </GlassCard>
          <GlassCard>
            <GlassCardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Globe className="w-4 h-4" />
                <span className="text-xs">Regionen</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {report.regions && report.regions.length > 0 ? (
                  report.regions.map(r => (
                    <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>
          <GlassCard>
            <GlassCardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Building2 className="w-4 h-4" />
                <span className="text-xs">Practice Group</span>
              </div>
              <p className="text-sm font-medium text-foreground truncate">
                {report.practice_group || '-'}
              </p>
            </GlassCardContent>
          </GlassCard>
        </div>

        {/* Report Content with Tabs */}
        <GlassCard>
          <Tabs defaultValue="summary" className="w-full">
            <GlassCardHeader className="pb-0">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="summary" className="flex-1 sm:flex-none">
                  Executive Summary
                </TabsTrigger>
                <TabsTrigger value="full" className="flex-1 sm:flex-none">
                  Vollständiger Report
                </TabsTrigger>
              </TabsList>
            </GlassCardHeader>
            
            <GlassCardContent className="pt-6">
              <TabsContent value="summary" className="mt-0">
                {report.executive_summary ? (
                  <div className="p-6 rounded-lg bg-muted/30">
                    <MarkdownRenderer content={report.executive_summary} />
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Keine Executive Summary vorhanden.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="full" className="mt-0">
                {report.full_report_markdown ? (
                  <ScrollArea className="h-[calc(100vh-400px)] min-h-[400px]">
                    <div className="p-6 rounded-lg bg-muted/30">
                      <MarkdownRenderer content={report.full_report_markdown} />
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Kein vollständiger Report vorhanden.</p>
                  </div>
                )}
              </TabsContent>
            </GlassCardContent>
          </Tabs>
        </GlassCard>
      </main>
    </div>
  );
}

export default ReportsPage;
