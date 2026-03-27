import { useState } from 'react';
import {
  Settings,
  HelpCircle,
  Send,
  DollarSign,
  Building2,
  Bell,
  Shield,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  User,
  Mail,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useOrgData } from '@/hooks/useOrgData';
import { toast } from 'sonner';

type SupportRequest = {
  id: string;
  type: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
};

const SettingsPage = () => {
  const { profile, organization } = useAuth();
  const { teams } = useOrgData();

  // Support request state
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [supportType, setSupportType] = useState('general');
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([
    {
      id: '1',
      type: 'password_reset',
      subject: 'Passwort zurücksetzen',
      message: 'Ich benötige ein neues Passwort für meinen Account.',
      status: 'resolved',
      created_at: '2026-03-20T10:00:00Z',
    },
  ]);

  // Organization settings
  const [orgSettings, setOrgSettings] = useState({
    defaultBudgetPerTeam: organization?.settings?.defaultBudgetPerTeam || 50000,
    fiscalYearStart: organization?.settings?.fiscalYearStart || 'Q1',
    currentQuarter: 'Q1',
    currentYear: new Date().getFullYear(),
    costPerCompetencyPoint: organization?.settings?.costPerCompetencyPoint || 850,
    gapThresholdCritical: organization?.settings?.gapThresholdCritical || 30,
    gapThresholdWarning: organization?.settings?.gapThresholdWarning || 15,
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    budgetWarnings: true,
    measureReminders: true,
    quarterlyReports: true,
    criticalGapAlerts: true,
    weeklyDigest: false,
  });

  const handleSubmitSupportRequest = () => {
    if (!supportSubject.trim() || !supportMessage.trim()) {
      toast.error('Bitte füllen Sie alle Felder aus');
      return;
    }

    const newRequest: SupportRequest = {
      id: crypto.randomUUID(),
      type: supportType,
      subject: supportSubject,
      message: supportMessage,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    setSupportRequests(prev => [newRequest, ...prev]);
    setSupportDialogOpen(false);
    setSupportSubject('');
    setSupportMessage('');
    setSupportType('general');
    toast.success('Support-Anfrage gesendet', {
      description: 'Wir melden uns in Kürze bei Ihnen.',
    });
  };

  const handleSaveOrgSettings = () => {
    toast.success('Einstellungen gespeichert', {
      description: 'Die Organisationseinstellungen wurden aktualisiert.',
    });
  };

  const handleSaveNotifications = () => {
    toast.success('Benachrichtigungen aktualisiert');
  };

  const supportTypeLabels: Record<string, string> = {
    general: 'Allgemein',
    password_reset: 'Passwort ändern',
    bug_report: 'Fehler melden',
    feature_request: 'Feature-Wunsch',
    data_request: 'Datenanfrage (DSGVO)',
    billing: 'Abrechnung',
  };

  const statusConfig: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
    pending: {
      label: 'Offen',
      className: 'bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]',
      icon: Clock,
    },
    in_progress: {
      label: 'In Bearbeitung',
      className: 'bg-[hsl(var(--chart-4))]/15 text-[hsl(var(--chart-4))]',
      icon: AlertTriangle,
    },
    resolved: {
      label: 'Erledigt',
      className: 'bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))]',
      icon: CheckCircle,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            Einstellungen
          </h1>
          <p className="text-muted-foreground">
            Konfigurieren Sie Ihre Organisation und erhalten Sie Support
          </p>
        </div>
        <Button onClick={() => setSupportDialogOpen(true)}>
          <HelpCircle className="w-4 h-4 mr-2" />
          Support-Anfrage
        </Button>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList className="bg-muted/30 border border-border/50">
          <TabsTrigger value="organization" className="gap-2">
            <Building2 className="w-4 h-4" />
            Organisation
          </TabsTrigger>
          <TabsTrigger value="support" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Support
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Benachrichtigungen
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Shield className="w-4 h-4" />
            Daten & DSGVO
          </TabsTrigger>
        </TabsList>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          {/* Organization Info */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Organisationsdaten
              </CardTitle>
              <CardDescription>
                Grundlegende Informationen zu Ihrer Organisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Organisation</Label>
                  <p className="font-medium text-foreground">{organization?.name || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Slug</Label>
                  <p className="font-medium text-foreground font-mono text-sm">{organization?.slug || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Abonnement</Label>
                  <Badge variant="outline" className="mt-1">
                    {organization?.subscription_status === 'active' ? 'Aktiv' : 
                     organization?.subscription_status === 'trial' ? 'Testversion' : 
                     organization?.subscription_status || '—'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Max. Mitarbeiter</Label>
                  <p className="font-medium text-foreground">{organization?.max_employees || 50}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Budget & Financial Settings */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Budget & Finanzen
              </CardTitle>
              <CardDescription>
                Legen Sie Standard-Budgets und Kostenkennzahlen fest
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultBudget">Standard-Budget pro Team (€)</Label>
                  <Input
                    id="defaultBudget"
                    type="number"
                    value={orgSettings.defaultBudgetPerTeam}
                    onChange={(e) => setOrgSettings(s => ({ ...s, defaultBudgetPerTeam: Number(e.target.value) }))}
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Wird als Vorschlag beim Erstellen neuer Teams verwendet
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costPerPoint">Ziel: €/Kompetenzpunkt</Label>
                  <Input
                    id="costPerPoint"
                    type="number"
                    value={orgSettings.costPerCompetencyPoint}
                    onChange={(e) => setOrgSettings(s => ({ ...s, costPerCompetencyPoint: Number(e.target.value) }))}
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Benchmark für die ROI-Berechnung
                  </p>
                </div>
              </div>

              <Separator className="opacity-30" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Geschäftsjahr beginnt</Label>
                  <Select
                    value={orgSettings.fiscalYearStart}
                    onValueChange={(v) => setOrgSettings(s => ({ ...s, fiscalYearStart: v }))}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1 (Januar)</SelectItem>
                      <SelectItem value="Q2">Q2 (April)</SelectItem>
                      <SelectItem value="Q3">Q3 (Juli)</SelectItem>
                      <SelectItem value="Q4">Q4 (Oktober)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Aktuelles Quarter</Label>
                  <Select
                    value={orgSettings.currentQuarter}
                    onValueChange={(v) => setOrgSettings(s => ({ ...s, currentQuarter: v }))}
                  >
                    <SelectTrigger className="bg-background/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Q1">Q1</SelectItem>
                      <SelectItem value="Q2">Q2</SelectItem>
                      <SelectItem value="Q3">Q3</SelectItem>
                      <SelectItem value="Q4">Q4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={handleSaveOrgSettings} className="mt-2">
                Einstellungen speichern
              </Button>
            </CardContent>
          </Card>

          {/* Gap Thresholds */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                Schwellenwerte
              </CardTitle>
              <CardDescription>
                Ab welchen Gap-Werten sollen Warnungen ausgelöst werden?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gapCritical">Kritischer Gap (≥ Punkte)</Label>
                  <Input
                    id="gapCritical"
                    type="number"
                    value={orgSettings.gapThresholdCritical}
                    onChange={(e) => setOrgSettings(s => ({ ...s, gapThresholdCritical: Number(e.target.value) }))}
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Gaps ab diesem Wert werden als <span className="text-[hsl(var(--severity-critical))]">kritisch</span> markiert
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gapWarning">Warnung ab (≥ Punkte)</Label>
                  <Input
                    id="gapWarning"
                    type="number"
                    value={orgSettings.gapThresholdWarning}
                    onChange={(e) => setOrgSettings(s => ({ ...s, gapThresholdWarning: Number(e.target.value) }))}
                    className="bg-background/50"
                  />
                  <p className="text-xs text-muted-foreground">
                    Gaps ab diesem Wert lösen eine <span className="text-[hsl(var(--severity-medium))]">Warnung</span> aus
                  </p>
                </div>
              </div>
              <Button onClick={handleSaveOrgSettings}>
                Schwellenwerte speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support" className="space-y-6">
          <Card className="bg-card/80 border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Support-Anfragen
                  </CardTitle>
                  <CardDescription>
                    Stellen Sie Anfragen für Passwortänderungen, technischen Support oder Feature-Wünsche
                  </CardDescription>
                </div>
                <Button onClick={() => setSupportDialogOpen(true)} size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  Neue Anfrage
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {supportRequests.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    Keine Anfragen
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Sie haben noch keine Support-Anfragen gestellt.
                  </p>
                  <Button onClick={() => setSupportDialogOpen(true)}>
                    <Send className="w-4 h-4 mr-2" />
                    Erste Anfrage stellen
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {supportRequests.map((req) => {
                    const status = statusConfig[req.status];
                    const StatusIcon = status.icon;
                    return (
                      <div
                        key={req.id}
                        className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-border/30"
                      >
                        <div className="p-2 rounded-lg bg-primary/10">
                          <MessageSquare className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-foreground text-sm">{req.subject}</h4>
                            <Badge className={status.className} variant="outline">
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">
                            {supportTypeLabels[req.type]} · {new Date(req.created_at).toLocaleDateString('de-DE')}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2">{req.message}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card
              className="bg-card/80 border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => {
                setSupportType('password_reset');
                setSupportSubject('Passwort ändern');
                setSupportDialogOpen(true);
              }}
            >
              <CardContent className="pt-6 text-center">
                <div className="p-3 rounded-xl bg-primary/10 w-fit mx-auto mb-3">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-medium text-foreground text-sm">Passwort ändern</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Anfrage zur Passwortänderung stellen
                </p>
              </CardContent>
            </Card>
            <Card
              className="bg-card/80 border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => {
                setSupportType('bug_report');
                setSupportSubject('');
                setSupportDialogOpen(true);
              }}
            >
              <CardContent className="pt-6 text-center">
                <div className="p-3 rounded-xl bg-[hsl(var(--severity-critical))]/10 w-fit mx-auto mb-3">
                  <AlertTriangle className="w-6 h-6 text-[hsl(var(--severity-critical))]" />
                </div>
                <h3 className="font-medium text-foreground text-sm">Fehler melden</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Technische Probleme berichten
                </p>
              </CardContent>
            </Card>
            <Card
              className="bg-card/80 border-border/50 cursor-pointer hover:border-primary/30 transition-colors"
              onClick={() => {
                setSupportType('feature_request');
                setSupportSubject('');
                setSupportDialogOpen(true);
              }}
            >
              <CardContent className="pt-6 text-center">
                <div className="p-3 rounded-xl bg-[hsl(var(--severity-low))]/10 w-fit mx-auto mb-3">
                  <FileText className="w-6 h-6 text-[hsl(var(--severity-low))]" />
                </div>
                <h3 className="font-medium text-foreground text-sm">Feature-Wunsch</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Neue Funktionen vorschlagen
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Benachrichtigungseinstellungen
              </CardTitle>
              <CardDescription>
                Wählen Sie, welche Benachrichtigungen Sie erhalten möchten
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { key: 'emailAlerts', label: 'E-Mail-Benachrichtigungen', desc: 'Erhalten Sie wichtige Updates per E-Mail', icon: Mail },
                { key: 'criticalGapAlerts', label: 'Kritische Gaps', desc: 'Sofortige Warnung bei neuen kritischen Skill-Gaps', icon: AlertTriangle },
                { key: 'budgetWarnings', label: 'Budget-Warnungen', desc: 'Warnung bei Budget-Überschreitung (>80%)', icon: DollarSign },
                { key: 'measureReminders', label: 'Maßnahmen-Erinnerungen', desc: 'Erinnerung an auslaufende oder überfällige Maßnahmen', icon: Calendar },
                { key: 'quarterlyReports', label: 'Quartals-Reports', desc: 'Automatische Benachrichtigung bei neuen Q-Reports', icon: FileText },
                { key: 'weeklyDigest', label: 'Wöchentliche Zusammenfassung', desc: 'Kompakte Übersicht jeden Montag per E-Mail', icon: Clock },
              ].map(({ key, label, desc, icon: Icon }) => (
                <div key={key} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted/30">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications[key as keyof typeof notifications]}
                    onCheckedChange={(checked) =>
                      setNotifications(n => ({ ...n, [key]: checked }))
                    }
                  />
                </div>
              ))}
              <Separator className="opacity-30" />
              <Button onClick={handleSaveNotifications}>
                Benachrichtigungen speichern
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data & GDPR Tab */}
        <TabsContent value="data" className="space-y-6">
          <Card className="bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Datenschutz & DSGVO
              </CardTitle>
              <CardDescription>
                Informationen zur Datenverarbeitung und DSGVO-Compliance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <Label className="text-muted-foreground text-xs">Aufbewahrungsfrist</Label>
                  <p className="font-medium text-foreground text-lg">
                    {organization?.data_retention_days || 2555} Tage
                  </p>
                  <p className="text-xs text-muted-foreground">≈ {Math.round((organization?.data_retention_days || 2555) / 365)} Jahre</p>
                </div>
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30">
                  <Label className="text-muted-foreground text-xs">AVV Status</Label>
                  {organization?.data_processing_agreement_signed_at ? (
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="w-4 h-4 text-[hsl(var(--severity-low))]" />
                      <span className="font-medium text-foreground text-sm">Unterzeichnet</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <AlertTriangle className="w-4 h-4 text-[hsl(var(--severity-medium))]" />
                      <span className="font-medium text-foreground text-sm">Ausstehend</span>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Auftragsverarbeitungsvertrag
                  </p>
                </div>
              </div>

              <Separator className="opacity-30" />

              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">DSGVO-Anfragen</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Stellen Sie eine Anfrage zur Datenauskunft, -löschung oder -portierung.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSupportType('data_request');
                    setSupportSubject('DSGVO-Anfrage');
                    setSupportDialogOpen(true);
                  }}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  DSGVO-Anfrage stellen
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Mein Account
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Name</Label>
                  <p className="font-medium text-foreground">{profile?.full_name || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">E-Mail</Label>
                  <p className="font-medium text-foreground">{profile?.email || '—'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Rolle</Label>
                  <Badge variant="outline" className="mt-1">
                    {profile?.role === 'org_admin' ? 'Organisation Admin' :
                     profile?.role === 'super_admin' ? 'Super Admin' : 'Mitarbeiter'}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Letzter Login</Label>
                  <p className="font-medium text-foreground text-sm">
                    {profile?.last_login_at
                      ? new Date(profile.last_login_at).toLocaleDateString('de-DE', {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })
                      : '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Support Request Dialog */}
      <Dialog open={supportDialogOpen} onOpenChange={setSupportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Support-Anfrage
            </DialogTitle>
            <DialogDescription>
              Beschreiben Sie Ihr Anliegen. Unser Team wird sich schnellstmöglich bei Ihnen melden.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kategorie</Label>
              <Select value={supportType} onValueChange={setSupportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(supportTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Betreff</Label>
              <Input
                id="subject"
                value={supportSubject}
                onChange={(e) => setSupportSubject(e.target.value)}
                placeholder="Kurze Beschreibung des Anliegens"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Nachricht</Label>
              <Textarea
                id="message"
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                placeholder="Beschreiben Sie Ihr Anliegen ausführlich..."
                rows={5}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSupportDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSubmitSupportRequest}>
              <Send className="w-4 h-4 mr-2" />
              Absenden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsPage;
