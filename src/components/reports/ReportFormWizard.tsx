import { useState, useCallback } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Upload,
  FileText,
  Calendar,
  Globe,
  Eye,
  Save,
  Loader2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { Report, ReportFormData } from '@/hooks/useReports';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];
const PRACTICE_GROUPS = [
  'Corporate Law / M&A',
  'Litigation',
  'Employment Law',
  'Real Estate',
  'IP / Tech',
  'Tax',
  'Banking & Finance',
];
const REGIONS = ['EU', 'US', 'UK', 'APAC', 'LATAM', 'MEA'];

interface ReportFormWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Report | null;
  onSubmit: (data: ReportFormData, publish: boolean) => Promise<void>;
  isSubmitting: boolean;
}

const steps = [
  { id: 1, title: 'Basis-Info', description: 'Grundlegende Report-Informationen' },
  { id: 2, title: 'Executive Summary', description: 'Zusammenfassung des Reports' },
  { id: 3, title: 'Full Report', description: 'Vollständiger Report (optional)' },
  { id: 4, title: 'Review', description: 'Überprüfen und veröffentlichen' },
];

export function ReportFormWizard({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isSubmitting,
}: ReportFormWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ReportFormData>({
    quarter: initialData?.quarter || 'Q1',
    year: initialData?.year || new Date().getFullYear(),
    title: initialData?.title || '',
    practice_group: initialData?.practice_group || 'Corporate Law / M&A',
    regions: initialData?.regions || ['EU', 'US', 'UK'],
    executive_summary: initialData?.executive_summary || '',
    full_report_markdown: initialData?.full_report_markdown || '',
  });

  const updateField = <K extends keyof ReportFormData>(field: K, value: ReportFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleRegion = (region: string) => {
    setFormData(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region],
    }));
  };

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, field: 'executive_summary' | 'full_report_markdown') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    updateField(field, text);
  }, []);

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.quarter && formData.year && formData.title && formData.practice_group && formData.regions.length > 0;
      case 2:
        return formData.executive_summary.trim().length > 0;
      case 3:
        return true; // Optional step
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (publish: boolean) => {
    await onSubmit(formData, publish);
    onOpenChange(false);
    setCurrentStep(1);
    setFormData({
      quarter: 'Q1',
      year: new Date().getFullYear(),
      title: '',
      practice_group: 'Corporate Law / M&A',
      regions: ['EU', 'US', 'UK'],
      executive_summary: '',
      full_report_markdown: '',
    });
  };

  const handleClose = () => {
    onOpenChange(false);
    setCurrentStep(1);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            {initialData ? 'Report bearbeiten' : 'Neuer Quarterly Report'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 rounded-lg mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  currentStep > step.id 
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step.id
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground"
                )}>
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <div className="hidden sm:block">
                  <p className={cn(
                    "text-sm font-medium",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  "w-8 sm:w-16 h-0.5 mx-2",
                  currentStep > step.id ? "bg-primary" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-1">
          {/* Step 1: Basis-Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quarter">Quarter *</Label>
                  <Select value={formData.quarter} onValueChange={(v) => updateField('quarter', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Quarter wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {QUARTERS.map(q => (
                        <SelectItem key={q} value={q}>{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Jahr *</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.year}
                    onChange={(e) => updateField('year', parseInt(e.target.value))}
                    min={2020}
                    max={2030}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder={`${formData.quarter} ${formData.year} Competency Report`}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="practice_group">Practice Group *</Label>
                <Select value={formData.practice_group} onValueChange={(v) => updateField('practice_group', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Practice Group wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRACTICE_GROUPS.map(pg => (
                      <SelectItem key={pg} value={pg}>{pg}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Regionen *</Label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map(region => (
                    <Badge
                      key={region}
                      variant={formData.regions.includes(region) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        formData.regions.includes(region) 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "hover:bg-muted"
                      )}
                      onClick={() => toggleRegion(region)}
                    >
                      {region}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Executive Summary */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Executive Summary *</Label>
                  <p className="text-sm text-muted-foreground">Markdown Format unterstützt</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Markdown hochladen
                      <input
                        type="file"
                        accept=".md,.txt"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'executive_summary')}
                      />
                    </label>
                  </Button>
                </div>
              </div>
              <Textarea
                value={formData.executive_summary}
                onChange={(e) => updateField('executive_summary', e.target.value)}
                placeholder="# Executive Summary&#10;&#10;## Wichtigste Erkenntnisse&#10;&#10;- Punkt 1&#10;- Punkt 2&#10;..."
                className="min-h-[300px] font-mono text-sm"
              />
            </div>
          )}

          {/* Step 3: Full Report */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Vollständiger Report</Label>
                  <p className="text-sm text-muted-foreground">Optional - Markdown oder PDF</p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <label className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Datei hochladen
                    <input
                      type="file"
                      accept=".md,.txt,.pdf"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'full_report_markdown')}
                    />
                  </label>
                </Button>
              </div>
              <Textarea
                value={formData.full_report_markdown || ''}
                onChange={(e) => updateField('full_report_markdown', e.target.value)}
                placeholder="# Vollständiger Report&#10;&#10;Detaillierte Analyse und Erkenntnisse..."
                className="min-h-[300px] font-mono text-sm"
              />
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Zeitraum</span>
                  </div>
                  <p className="font-medium">{formData.quarter} {formData.year}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Regionen</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {formData.regions.map(r => (
                      <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium mb-1">{formData.title}</h4>
                <p className="text-sm text-muted-foreground">{formData.practice_group}</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Executive Summary Vorschau</span>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 max-h-48 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-sans">
                    {formData.executive_summary.slice(0, 500)}
                    {formData.executive_summary.length > 500 && '...'}
                  </pre>
                </div>
              </div>

              {formData.full_report_markdown && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span>Vollständiger Report enthalten</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>

          <div className="flex gap-2">
            {currentStep === steps.length ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleSubmit(false)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Als Entwurf speichern
                </Button>
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
                  Veröffentlichen
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Weiter
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
