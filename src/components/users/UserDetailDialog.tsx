import { useState } from 'react';
import { 
  User,
  Mail,
  Building2,
  Shield,
  Calendar,
  Clock,
  FileText,
  Key,
  LogIn,
  Loader2,
  UserCheck,
  UserX,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  useUser, 
  useOrganizations, 
  useUserGDPRRequests,
  startImpersonation,
  type UserWithOrg,
  type UserRole,
} from '@/hooks/useUsers';

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | null;
  onUpdate: (id: string, updates: Partial<UserWithOrg>) => Promise<void>;
  onImpersonate: (user: UserWithOrg) => void;
}

export function UserDetailDialog({
  open,
  onOpenChange,
  userId,
  onUpdate,
  onImpersonate,
}: UserDetailDialogProps) {
  const { data: user, isLoading } = useUser(userId || undefined);
  const { data: organizations } = useOrganizations();
  const { data: gdprRequests, isLoading: gdprLoading } = useUserGDPRRequests(userId || undefined);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserWithOrg>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleEdit = () => {
    setEditData({
      full_name: user?.full_name || '',
      role: user?.role,
      organization_id: user?.organization_id,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!userId) return;
    setIsSaving(true);
    try {
      await onUpdate(userId, editData);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendPasswordReset = async () => {
    if (!user?.email) return;
    
    setIsSendingReset(true);
    try {
      const { error } = await supabase.functions.invoke('send-password-reset', {
        body: {
          email: user.email,
          resetUrl: `${window.location.origin}/reset-password`,
        },
      });
      
      if (error) throw error;
      
      toast.success('Password Reset E-Mail gesendet', {
        description: `E-Mail wurde an ${user.email} gesendet`,
      });
      setResetPasswordOpen(false);
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('Fehler beim Senden', {
        description: 'Password Reset E-Mail konnte nicht gesendet werden',
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge className="bg-primary/20 text-primary border-primary/30">Super Admin</Badge>;
      case 'org_admin':
        return <Badge variant="secondary">Org Admin</Badge>;
      case 'employee':
        return <Badge variant="outline">Employee</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (!userId) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Benutzer Details
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-16 h-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-32 w-full" />
            </div>
          ) : user ? (
            <>
              {/* Header */}
              <div className="flex items-start justify-between py-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {user.full_name?.charAt(0) || user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{user.full_name || 'Unbekannt'}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(user.role)}
                      {user.gdpr_consent_given_at ? (
                        <Badge variant="outline" className="text-skill-very-strong border-skill-very-strong/30 text-xs">
                          <UserCheck className="w-3 h-3 mr-1" />
                          GDPR OK
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">
                          <UserX className="w-3 h-3 mr-1" />
                          GDPR Pending
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => onImpersonate(user as unknown as UserWithOrg)}>
                    <LogIn className="w-4 h-4 mr-2" />
                    Impersonate
                  </Button>
                  <Button size="sm" onClick={isEditing ? handleSave : handleEdit} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? 'Speichern' : 'Bearbeiten'}
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Tabs */}
              <Tabs defaultValue="profile" className="flex-1 overflow-hidden flex flex-col">
                <TabsList className="shrink-0">
                  <TabsTrigger value="profile">Profil</TabsTrigger>
                  <TabsTrigger value="security">Sicherheit</TabsTrigger>
                  <TabsTrigger value="gdpr">GDPR Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="flex-1 overflow-hidden mt-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 pr-4">
                      {isEditing ? (
                        <>
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={editData.full_name || ''}
                              onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Rolle</Label>
                            <Select
                              value={editData.role}
                              onValueChange={(v) => setEditData({ ...editData, role: v as UserRole })}
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
                          <div className="space-y-2">
                            <Label>Organisation</Label>
                            <Select
                              value={editData.organization_id || 'none'}
                              onValueChange={(v) => setEditData({ ...editData, organization_id: v === 'none' ? null : v })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Keine Organisation" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">Keine Organisation</SelectItem>
                                {organizations?.map(org => (
                                  <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              <Mail className="w-4 h-4" />
                              <span className="text-xs">E-Mail</span>
                            </div>
                            <p className="text-sm font-medium">{user.email}</p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              <Building2 className="w-4 h-4" />
                              <span className="text-xs">Organisation</span>
                            </div>
                            <p className="text-sm font-medium">
                              {(user as any).organizations?.name || 'Keine'}
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              <Calendar className="w-4 h-4" />
                              <span className="text-xs">Erstellt</span>
                            </div>
                            <p className="text-sm font-medium">
                              {user.created_at ? new Date(user.created_at).toLocaleDateString('de-DE') : '-'}
                            </p>
                          </div>
                          <div className="p-4 rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 text-muted-foreground mb-1">
                              <Clock className="w-4 h-4" />
                              <span className="text-xs">Letzter Login</span>
                            </div>
                            <p className="text-sm font-medium">
                              {user.last_login_at ? new Date(user.last_login_at).toLocaleString('de-DE') : 'Noch nie'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="security" className="flex-1 overflow-hidden mt-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 pr-4">
                      <div className="p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Key className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">Passwort zurücksetzen</p>
                              <p className="text-sm text-muted-foreground">
                                Sendet eine E-Mail mit Reset-Link
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" onClick={() => setResetPasswordOpen(true)}>
                            Reset senden
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/30">
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">Berechtigungen</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Super Admin</span>
                            <Badge variant={(user as any).is_super_admin ? 'default' : 'outline'}>
                              {(user as any).is_super_admin ? 'Ja' : 'Nein'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">GDPR Consent Version</span>
                            <span>{user.gdpr_consent_version || '-'}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Marketing Consent</span>
                            <Badge variant={user.marketing_consent ? 'default' : 'outline'}>
                              {user.marketing_consent ? 'Erteilt' : 'Nicht erteilt'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="gdpr" className="flex-1 overflow-hidden mt-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4 pr-4">
                      {gdprLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-16 w-full" />
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ) : gdprRequests && gdprRequests.length > 0 ? (
                        gdprRequests.map((request) => (
                          <div key={request.id} className="p-4 rounded-lg bg-muted/30">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-primary mt-0.5" />
                                <div>
                                  <p className="font-medium">{request.request_type}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {request.requester_email}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {request.created_at ? new Date(request.created_at).toLocaleString('de-DE') : '-'}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={
                                request.status === 'completed' ? 'default' :
                                request.status === 'pending' ? 'secondary' : 'outline'
                              }>
                                {request.status}
                              </Badge>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <FileText className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Keine GDPR Requests</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Benutzer nicht gefunden
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Password Reset Confirmation */}
      <AlertDialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Passwort Reset senden?</AlertDialogTitle>
            <AlertDialogDescription>
              Eine E-Mail mit einem Link zum Zurücksetzen des Passworts wird an{' '}
              <strong>{user?.email}</strong> gesendet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleSendPasswordReset} disabled={isSendingReset}>
              {isSendingReset ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              E-Mail senden
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
