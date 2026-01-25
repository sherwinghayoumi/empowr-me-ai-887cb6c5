import { useState } from 'react';
import { Plus, FileText, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from '@/components/GlassCard';
import { ReportsList } from '@/components/reports/ReportsList';
import { ReportFormWizard } from '@/components/reports/ReportFormWizard';
import { ReportDetailDialog } from '@/components/reports/ReportDetailDialog';
import { useReports, type Report, type ReportFormData, uploadReportFile } from '@/hooks/useReports';
import { useAuth } from '@/contexts/AuthContext';

const Reports = () => {
  const { profile } = useAuth();
  const { 
    reports, 
    isLoading, 
    createReport, 
    updateReport, 
    deleteReport, 
    publishReport,
    unpublishReport,
  } = useReports();

  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter reports
  const filteredReports = reports?.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.practice_group?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = yearFilter === 'all' || report.year.toString() === yearFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && report.is_published) ||
                         (statusFilter === 'draft' && !report.is_published);
    return matchesSearch && matchesYear && matchesStatus;
  });

  // Get unique years for filter
  const years = [...new Set(reports?.map(r => r.year) || [])].sort((a, b) => b - a);

  const handleCreateNew = () => {
    setEditingReport(null);
    setWizardOpen(true);
  };

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    setWizardOpen(true);
  };

  const handleView = (report: Report) => {
    setViewingReport(report);
    setDetailOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteReport.mutate(id);
  };

  const handlePublish = (report: Report) => {
    publishReport.mutate({
      reportId: report.id,
      quarter: report.quarter,
      year: report.year,
    });
  };

  const handleUnpublish = (id: string) => {
    unpublishReport.mutate(id);
  };

  const handleFormSubmit = async (data: ReportFormData, publish: boolean) => {
    setIsSubmitting(true);
    try {
      if (editingReport) {
        // Update existing report
        await updateReport.mutateAsync({
          id: editingReport.id,
          updates: {
            ...data,
            is_published: publish,
            published_at: publish ? new Date().toISOString() : null,
            version: (editingReport.version || 1) + 1,
          },
        });
      } else {
        // Create new report
        const newReport = await createReport.mutateAsync({
          ...data,
          is_published: publish,
          published_at: publish ? new Date().toISOString() : null,
          created_by: profile?.id,
          version: 1,
        });

        // If publishing, create changelog entry
        if (publish && newReport) {
          publishReport.mutate({
            reportId: newReport.id,
            quarter: data.quarter,
            year: data.year,
          });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Quarterly Reports</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Kompetenz-Reports und Analysen
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="w-4 h-4 mr-2" />
          Neuer Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
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

      {/* Reports List */}
      <GlassCard>
        <GlassCardHeader>
          <GlassCardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Reports ({filteredReports?.length || 0})
          </GlassCardTitle>
        </GlassCardHeader>
        <GlassCardContent>
          <ReportsList
            reports={filteredReports}
            isLoading={isLoading}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPublish={handlePublish}
            onUnpublish={handleUnpublish}
          />
        </GlassCardContent>
      </GlassCard>

      {/* Wizard Dialog */}
      <ReportFormWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        initialData={editingReport}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Detail Dialog */}
      <ReportDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        report={viewingReport}
        onEdit={() => {
          setDetailOpen(false);
          if (viewingReport) {
            handleEdit(viewingReport);
          }
        }}
      />
    </div>
  );
};

export default Reports;
