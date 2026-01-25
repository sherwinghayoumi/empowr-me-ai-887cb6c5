import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Settings, 
  Shield, 
  Bell, 
  Database, 
  Globe,
  Mail,
  Key,
  Save,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SuperAdminSettings() {
  const { profile } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    // General
    platformName: 'FUTURA TEAMS',
    supportEmail: 'support@futura-teams.com',
    defaultLanguage: 'de',
    
    // Security
    sessionTimeout: 60,
    requireMfa: false,
    passwordMinLength: 8,
    
    // Notifications
    emailNotifications: true,
    gdprAlerts: true,
    trialExpiryAlerts: true,
    
    // Data
    dataRetentionDays: 2555,
    autoBackup: true,
    backupFrequency: 'daily',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Einstellungen gespeichert');
    } catch (error) {
      toast.error('Fehler beim Speichern');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Einstellungen</h1>
          <p className="text-muted-foreground">Systemweite Konfiguration verwalten</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Speichern...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Speichern
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="w-4 h-4" />
            Allgemein
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Sicherheit
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Benachrichtigungen
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="w-4 h-4" />
            Daten
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Allgemeine Einstellungen</CardTitle>
              <CardDescription>Grundlegende Plattform-Konfiguration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="platformName">Plattform Name</Label>
                  <Input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="supportEmail">Support E-Mail</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="defaultLanguage">Standard Sprache</Label>
                  <Select 
                    value={settings.defaultLanguage} 
                    onValueChange={(value) => setSettings({ ...settings, defaultLanguage: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Sicherheitseinstellungen</CardTitle>
              <CardDescription>Authentifizierung und Zugriffskontrolle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (Minuten)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="passwordMinLength">Minimale Passwortlänge</Label>
                  <Input
                    id="passwordMinLength"
                    type="number"
                    value={settings.passwordMinLength}
                    onChange={(e) => setSettings({ ...settings, passwordMinLength: parseInt(e.target.value) })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Multi-Faktor-Authentifizierung</Label>
                    <p className="text-sm text-muted-foreground">
                      MFA für alle Benutzer erzwingen
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireMfa}
                    onCheckedChange={(checked) => setSettings({ ...settings, requireMfa: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Benachrichtigungen</CardTitle>
              <CardDescription>E-Mail und Alert Einstellungen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>E-Mail Benachrichtigungen</Label>
                    <p className="text-sm text-muted-foreground">
                      Systemweite E-Mail Benachrichtigungen aktivieren
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>GDPR Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Benachrichtigung bei neuen GDPR Anfragen
                    </p>
                  </div>
                  <Switch
                    checked={settings.gdprAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, gdprAlerts: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Trial Expiry Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Warnung vor ablaufenden Trial-Perioden
                    </p>
                  </div>
                  <Switch
                    checked={settings.trialExpiryAlerts}
                    onCheckedChange={(checked) => setSettings({ ...settings, trialExpiryAlerts: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Settings */}
        <TabsContent value="data">
          <Card className="glass">
            <CardHeader>
              <CardTitle>Datenverwaltung</CardTitle>
              <CardDescription>Backup und Aufbewahrungsrichtlinien</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="dataRetentionDays">Datenaufbewahrung (Tage)</Label>
                  <Input
                    id="dataRetentionDays"
                    type="number"
                    value={settings.dataRetentionDays}
                    onChange={(e) => setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Standard: 2555 Tage (ca. 7 Jahre)
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatische Backups</Label>
                    <p className="text-sm text-muted-foreground">
                      Regelmäßige Datenbank-Backups erstellen
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoBackup}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoBackup: checked })}
                  />
                </div>

                {settings.autoBackup && (
                  <div className="grid gap-2">
                    <Label htmlFor="backupFrequency">Backup Häufigkeit</Label>
                    <Select 
                      value={settings.backupFrequency} 
                      onValueChange={(value) => setSettings({ ...settings, backupFrequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hourly">Stündlich</SelectItem>
                        <SelectItem value="daily">Täglich</SelectItem>
                        <SelectItem value="weekly">Wöchentlich</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
