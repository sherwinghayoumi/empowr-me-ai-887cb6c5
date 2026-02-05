import { useState } from 'react';
import { 
  UserPlus,
  Mail,
  Building2,
  Shield,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { supabase } from '@/integrations/supabase/client';
import { useOrganizations, type UserRole } from '@/hooks/useUsers';
import { toast } from 'sonner';

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CreateUserForm {
  email: string;
  full_name: string;
  role: UserRole;
  organization_id: string | null;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  const { data: organizations } = useOrganizations();
  
  const [formData, setFormData] = useState<CreateUserForm>({
    email: '',
    full_name: '',
    role: 'employee',
    organization_id: null,
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    
    // Validation
    if (!formData.email || !formData.email.includes('@')) {
      setError('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }
    
    if (!formData.full_name) {
      setError('Bitte geben Sie einen Namen ein');
      return;
    }
    
    if (formData.role !== 'super_admin' && !formData.organization_id) {
      setError('Bitte wählen Sie eine Organisation');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Call edge function to create user and send invitation
      const { data, error: fnError } = await supabase.functions.invoke('create-user-invitation', {
        body: {
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
          organization_id: formData.organization_id,
          invite_url: `${window.location.origin}/reset-password`,
        },
      });
      
      if (fnError) throw fnError;
      
      toast.success('Benutzer erstellt', {
        description: `Einladung wurde an ${formData.email} gesendet`,
      });
      
      onSuccess();
      handleClose();
    } catch (error: any) {
      setError(error.message || 'Fehler beim Erstellen des Benutzers');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormData({
      email: '',
      full_name: '',
      role: 'employee',
      organization_id: null,
    });
    setError(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Neuen Benutzer erstellen
          </DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen Benutzer und senden Sie eine Einladungs-E-Mail.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">
              <Mail className="w-4 h-4 inline mr-2" />
              E-Mail *
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="benutzer@unternehmen.de"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="Max Mustermann"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>
              <Shield className="w-4 h-4 inline mr-2" />
              Rolle *
            </Label>
            <Select
              value={formData.role}
              onValueChange={(v) => setFormData({ ...formData, role: v as UserRole })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="org_admin">Org Admin</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role !== 'super_admin' && (
            <div className="space-y-2">
              <Label>
                <Building2 className="w-4 h-4 inline mr-2" />
                Organisation *
              </Label>
              <Select
                value={formData.organization_id || 'none'}
                onValueChange={(v) => setFormData({ ...formData, organization_id: v === 'none' ? null : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Organisation wählen" />
                </SelectTrigger>
                <SelectContent>
                  {organizations?.map(org => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Abbrechen
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            Erstellen & Einladen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
