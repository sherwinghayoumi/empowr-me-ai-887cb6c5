import { useState, useCallback, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  Globe,
  Save,
  Layers,
  BookOpen,
  Sparkles,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { 
  parseCSV, 
  parseCSVData, 
  importRoleProfile,
  type RoleProfileCSVRow,
  type ParsedCSVData,
} from '@/hooks/useRoleProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

interface CSVUploadWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const steps = [
  { id: 1, title: 'Upload', description: 'CSV-Datei hochladen' },
  { id: 2, title: 'Parsing', description: 'Daten validieren' },
  { id: 3, title: 'Mapping', description: 'Vorschau prüfen' },
  { id: 4, title: 'Import', description: 'Daten importieren' },
];

export function CSVUploadWizard({
  open,
  onOpenChange,
  onSuccess,
}: CSVUploadWizardProps) {
  const { profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [csvRows, setCSVRows] = useState<RoleProfileCSVRow[]>([]);
  const [parsedData, setParsedData] = useState<ParsedCSVData | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [quarter, setQuarter] = useState('Q2');
  const [year, setYear] = useState(new Date().getFullYear());
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.name.endsWith('.csv')
    );
    
    if (droppedFiles.length > 0) {
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []).filter(
      f => f.name.endsWith('.csv')
    );
    
    if (selectedFiles.length > 0) {
      setFiles(prev => [...prev, ...selectedFiles]);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleParseFiles = async () => {
    const errors: string[] = [];
    let allRows: RoleProfileCSVRow[] = [];
    
    for (const file of files) {
      try {
        const text = await file.text();
        const rows = parseCSV(text);
        
        if (rows.length === 0) {
          errors.push(`${file.name}: Keine Daten gefunden`);
        } else {
          allRows = [...allRows, ...rows];
        }
      } catch (error) {
        errors.push(`${file.name}: Fehler beim Lesen`);
      }
    }
    
    setCSVRows(allRows);
    setParseErrors(errors);
    
    if (allRows.length > 0) {
      const parsed = parseCSVData(allRows);
      setParsedData(parsed);
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
  };

  const handleImport = async () => {
    if (!parsedData || !profile?.id) return;
    
    setIsImporting(true);
    setImportProgress(10);
    
    try {
      setImportProgress(30);
      
      const result = await importRoleProfile(
        parsedData,
        quarter,
        year,
        profile.id
      );
      
      setImportProgress(100);
      
      if (result.success) {
        toast.success('Import erfolgreich', {
          description: `${parsedData.totalCompetencies} Kompetenzen importiert`,
        });
        onSuccess();
        handleClose();
      } else {
        toast.error('Import fehlgeschlagen', {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error('Import fehlgeschlagen');
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    // Reset state
    setTimeout(() => {
      setCurrentStep(1);
      setFiles([]);
      setCSVRows([]);
      setParsedData(null);
      setParseErrors([]);
      setImportProgress(0);
    }, 200);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return files.length > 0;
      case 2:
        return csvRows.length > 0 && parseErrors.length === 0;
      case 3:
        return parsedData !== null && parsedData.totalCompetencies > 0;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Role Profile CSV Import
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
          {/* Step 1: Upload */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quarter</Label>
                  <Select value={quarter} onValueChange={setQuarter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUARTERS.map(q => (
                        <SelectItem key={q} value={q}>{q}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Jahr</Label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    min={2020}
                    max={2030}
                  />
                </div>
              </div>

              {/* Drop Zone */}
              <div
                className={cn(
                  "border-2 border-dashed rounded-xl p-8 text-center transition-colors",
                  isDragging 
                    ? "border-primary bg-primary/5" 
                    : "border-border hover:border-primary/50"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">CSV-Dateien hier ablegen</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  oder klicken Sie zum Auswählen
                </p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  Dateien auswählen
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Selected Files */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <Label>Ausgewählte Dateien ({files.length})</Label>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <FileSpreadsheet className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm font-medium">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFile(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Parsing */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {parseErrors.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Fehler beim Parsen</span>
                  </div>
                  <div className="space-y-2">
                    {parseErrors.map((error, i) => (
                      <div key={i} className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              ) : csvRows.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-skill-very-strong">
                    <Check className="w-5 h-5" />
                    <span className="font-medium">{csvRows.length} Zeilen erfolgreich geparst</span>
                  </div>
                  
                  {/* Preview Table */}
                  <div className="rounded-lg border border-border overflow-hidden">
                    <ScrollArea className="h-64">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cluster</TableHead>
                            <TableHead>Kompetenz</TableHead>
                            <TableHead>Subskill</TableHead>
                            <TableHead>Demand</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvRows.slice(0, 20).map((row, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-xs">{row.competency_cluster}</TableCell>
                              <TableCell className="text-xs">{row.competency_name}</TableCell>
                              <TableCell className="text-xs">{row.subskill || '-'}</TableCell>
                              <TableCell className="text-xs">{row.demand_weight || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>
                  {csvRows.length > 20 && (
                    <p className="text-sm text-muted-foreground text-center">
                      ...und {csvRows.length - 20} weitere Zeilen
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin mb-4" />
                  <p>Daten werden geparst...</p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Mapping Preview */}
          {currentStep === 3 && parsedData && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-4 gap-3">
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-2xl font-bold text-primary">{parsedData.clusters.length}</p>
                  <p className="text-xs text-muted-foreground">Clusters</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-2xl font-bold text-primary">{parsedData.totalCompetencies}</p>
                  <p className="text-xs text-muted-foreground">Kompetenzen</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-2xl font-bold text-primary">{parsedData.totalSubskills}</p>
                  <p className="text-xs text-muted-foreground">Subskills</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30 text-center">
                  <p className="text-2xl font-bold text-primary">{parsedData.regions.length}</p>
                  <p className="text-xs text-muted-foreground">Regionen</p>
                </div>
              </div>

              {/* Role Info */}
              <div className="p-4 rounded-lg bg-muted/30">
                <h4 className="font-medium mb-2">{parsedData.roleTitle || 'Unbekannte Rolle'}</h4>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge variant="outline">{parsedData.practiceGroup}</Badge>
                  <Badge variant="outline">{parsedData.experienceLevel}</Badge>
                  {parsedData.regions.map(r => (
                    <Badge key={r} variant="outline">{r}</Badge>
                  ))}
                </div>
              </div>

              {/* Clusters Accordion */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Cluster-Vorschau
                </Label>
                <ScrollArea className="h-64">
                  <Accordion type="multiple" className="space-y-2">
                    {parsedData.clusters.map((cluster, i) => (
                      <AccordionItem key={i} value={`cluster-${i}`} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <span className="font-medium">{cluster.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {cluster.competencies.length} Kompetenzen
                            </Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pl-4">
                            {cluster.competencies.map((comp, j) => (
                              <div key={j} className="flex items-start justify-between py-2 border-b border-border/50 last:border-0">
                                <div className="flex-1">
                                  <p className="text-sm font-medium flex items-center gap-2">
                                    <BookOpen className="w-3 h-3 text-primary" />
                                    {comp.name}
                                  </p>
                                  {comp.subskills.length > 0 && (
                                    <p className="text-xs text-muted-foreground ml-5">
                                      {comp.subskills.length} Subskills
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  {comp.futureDemand && (
                                    <Badge variant="outline" className="text-xs">
                                      <Sparkles className="w-3 h-3 mr-1" />
                                      {comp.futureDemand}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </ScrollArea>
              </div>
            </div>
          )}

          {/* Step 4: Import */}
          {currentStep === 4 && (
            <div className="space-y-6 py-8">
              {isImporting ? (
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                  <h3 className="text-lg font-medium">Import läuft...</h3>
                  <Progress value={importProgress} className="max-w-md mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Bitte warten Sie, bis der Import abgeschlossen ist.
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">Bereit zum Import</h3>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    {parsedData?.totalCompetencies} Kompetenzen und {parsedData?.totalSubskills} Subskills 
                    werden für {parsedData?.roleTitle} ({quarter} {year}) importiert.
                  </p>
                  <div className="flex justify-center gap-4 pt-4">
                    <Button variant="outline" onClick={() => setCurrentStep(3)}>
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Zurück zur Vorschau
                    </Button>
                    <Button onClick={handleImport}>
                      <Upload className="w-4 h-4 mr-2" />
                      Import starten
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep < 4 && (
          <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
            <Button
              variant="outline"
              onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : handleClose()}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              {currentStep === 1 ? 'Abbrechen' : 'Zurück'}
            </Button>

            <Button
              onClick={() => {
                if (currentStep === 1) {
                  handleParseFiles();
                } else {
                  setCurrentStep(currentStep + 1);
                }
              }}
              disabled={!canProceed()}
            >
              Weiter
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
