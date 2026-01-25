import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Shield, FileText, Clock, Mail, UserCheck, Brain } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface GDPRConsentModalProps {
  open: boolean;
  onConsentGiven: () => void;
}

export function GDPRConsentModal({ open, onConsentGiven }: GDPRConsentModalProps) {
  const { profile, signOut, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dataConsent, setDataConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const handleAccept = async () => {
    if (!dataConsent) {
      toast.error('Bitte stimmen Sie der Datenverarbeitung zu.');
      return;
    }

    if (!profile) return;

    setIsSubmitting(true);
    try {
      // Update user profile with consent
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          gdpr_consent_given_at: new Date().toISOString(),
          gdpr_consent_version: '1.0',
          marketing_consent: marketingConsent,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // Create audit log entry
      const { error: auditError } = await supabase.rpc('log_audit_event', {
        p_action: 'gdpr_consent_given',
        p_entity_type: 'user_profile',
        p_entity_id: profile.id,
        p_old_values: null,
        p_new_values: {
          gdpr_consent_version: '1.0',
          marketing_consent: marketingConsent,
          consent_timestamp: new Date().toISOString(),
        },
      });

      if (auditError) {
        console.error('Audit log error:', auditError);
        // Don't fail the consent process for audit log errors
      }

      await refreshProfile();
      toast.success('Einwilligung erfolgreich gespeichert');
      onConsentGiven();
    } catch (error) {
      console.error('Error saving consent:', error);
      toast.error('Fehler beim Speichern der Einwilligung');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    toast.info('Sie wurden abgemeldet, da die Datenschutz-Einwilligung erforderlich ist.');
    await signOut();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl h-[90vh] p-0 gap-0 overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Fixed Header */}
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <DialogTitle className="text-xl">Datenschutz-Einwilligung</DialogTitle>
          </div>
          <DialogDescription>
            Bevor Sie FUTURA TEAMS nutzen können, benötigen wir Ihre Einwilligung zur Datenverarbeitung gemäß DSGVO.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Data Processing Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <FileText className="h-4 w-4 text-primary" />
                <span>Verarbeitete Daten</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-2 ml-6 list-disc">
                <li>Persönliche Daten (Name, E-Mail, Abteilung)</li>
                <li>Berufliche Qualifikationen und Zertifikate</li>
                <li>Kompetenzbewertungen und Skill-Level</li>
                <li>Lernfortschritte und Entwicklungsziele</li>
                <li>Von Managern erstellte Bewertungen</li>
              </ul>
            </div>

            <Separator />

            {/* Purpose Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <UserCheck className="h-4 w-4 text-primary" />
                <span>Zweck der Verarbeitung</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Ihre Daten werden für folgende Zwecke verarbeitet:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-6 list-disc">
                <li>Analyse Ihrer aktuellen Kompetenzen und Skill-Gaps</li>
                <li>Erstellung personalisierter Lernempfehlungen</li>
                <li>Abgleich mit zukünftigen Marktanforderungen</li>
                <li>Unterstützung Ihrer beruflichen Entwicklung</li>
              </ul>
            </div>

            <Separator />

            {/* AI Processing Notice */}
            <div className="space-y-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Brain className="h-4 w-4 text-primary" />
                <span>KI-gestützte Analyse</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Zur Analyse Ihrer Kompetenzen und zur Erstellung von Lernempfehlungen 
                setzen wir künstliche Intelligenz (Claude von Anthropic) ein. Die KI 
                verarbeitet Ihre Daten ausschließlich zur Generierung von Analysen und 
                Empfehlungen. Es werden keine personenbezogenen Daten dauerhaft bei 
                Drittanbietern gespeichert.
              </p>
            </div>

            <Separator />

            {/* Retention Period */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Clock className="h-4 w-4 text-primary" />
                <span>Speicherdauer</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Ihre Daten werden für maximal <strong>7 Jahre</strong> gespeichert, sofern 
                keine gesetzlichen Aufbewahrungspflichten eine längere Speicherung erfordern. 
                Nach Beendigung des Arbeitsverhältnisses werden Ihre Daten gemäß den 
                Datenschutzrichtlinien Ihrer Organisation gelöscht.
              </p>
            </div>

            <Separator />

            {/* Rights Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Shield className="h-4 w-4 text-primary" />
                <span>Ihre Rechte</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Sie haben jederzeit das Recht auf:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 ml-6 list-disc">
                <li><strong>Auskunft:</strong> Welche Daten über Sie gespeichert sind</li>
                <li><strong>Berichtigung:</strong> Korrektur unrichtiger Daten</li>
                <li><strong>Löschung:</strong> Löschung Ihrer Daten ("Recht auf Vergessenwerden")</li>
                <li><strong>Widerruf:</strong> Widerruf dieser Einwilligung mit Wirkung für die Zukunft</li>
                <li><strong>Datenübertragbarkeit:</strong> Export Ihrer Daten in einem gängigen Format</li>
                <li><strong>Beschwerde:</strong> Beschwerderecht bei einer Aufsichtsbehörde</li>
              </ul>
            </div>

            <Separator />

            {/* Contact Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-foreground font-medium">
                <Mail className="h-4 w-4 text-primary" />
                <span>Kontakt für Datenschutzanfragen</span>
              </div>
              <p className="text-sm text-muted-foreground ml-6">
                Für alle Fragen zum Datenschutz oder zur Ausübung Ihrer Rechte 
                wenden Sie sich bitte an:<br />
                <strong>datenschutz@futura-teams.com</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Fixed Footer */}
        <div className="border-t border-border p-6 pt-4 bg-background">
          {/* Consent Checkboxes */}
          <div className="space-y-4 mb-4">
            <div className="flex items-start space-x-3">
              <Checkbox 
                id="data-consent" 
                checked={dataConsent}
                onCheckedChange={(checked) => setDataConsent(checked === true)}
                className="mt-0.5"
              />
              <Label 
                htmlFor="data-consent" 
                className="text-sm font-normal cursor-pointer leading-relaxed"
              >
                <span className="text-destructive">*</span> Ich stimme der Verarbeitung meiner Daten 
                gemäß der oben beschriebenen Zwecke zu und habe die Datenschutzhinweise 
                gelesen und verstanden.
              </Label>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="marketing-consent" 
                checked={marketingConsent}
                onCheckedChange={(checked) => setMarketingConsent(checked === true)}
                className="mt-0.5"
              />
              <Label 
                htmlFor="marketing-consent" 
                className="text-sm font-normal cursor-pointer leading-relaxed text-muted-foreground"
              >
                Ich möchte über Produkt-Updates, neue Funktionen und Tipps zur 
                Kompetenzentwicklung per E-Mail informiert werden. (Optional)
              </Label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Button 
              variant="outline" 
              onClick={handleDecline}
              disabled={isSubmitting}
              className="flex-1"
            >
              Ablehnen & Abmelden
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={isSubmitting || !dataConsent}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Wird gespeichert...
                </>
              ) : (
                'Zustimmen'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
