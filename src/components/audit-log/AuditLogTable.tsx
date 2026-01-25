import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Building2,
  Clock,
  Plus,
  Edit,
  Trash2,
  Shield,
  FileText,
  Eye,
} from 'lucide-react';
import { AuditLogEntry } from '@/hooks/useAuditLogs';

interface AuditLogTableProps {
  logs: AuditLogEntry[];
  isLoading: boolean;
}

export function AuditLogTable({ logs, isLoading }: AuditLogTableProps) {
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const getActionIcon = (action: string) => {
    if (action?.includes('create') || action?.includes('insert')) return <Plus className="w-4 h-4 text-emerald-500" />;
    if (action?.includes('update') || action?.includes('edit')) return <Edit className="w-4 h-4 text-sky-500" />;
    if (action?.includes('delete') || action?.includes('remove')) return <Trash2 className="w-4 h-4 text-destructive" />;
    if (action?.includes('gdpr') || action?.includes('consent')) return <Shield className="w-4 h-4 text-primary" />;
    return <FileText className="w-4 h-4 text-muted-foreground" />;
  };

  const getActionBadge = (action: string) => {
    if (action?.includes('create') || action?.includes('insert')) {
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">CREATE</Badge>;
    }
    if (action?.includes('update') || action?.includes('edit')) {
      return <Badge className="bg-sky-500/20 text-sky-400 border-sky-500/30">UPDATE</Badge>;
    }
    if (action?.includes('delete') || action?.includes('remove')) {
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30">DELETE</Badge>;
    }
    if (action?.includes('login')) {
      return <Badge className="bg-primary/20 text-primary border-primary/30">LOGIN</Badge>;
    }
    if (action?.includes('gdpr') || action?.includes('consent')) {
      return <Badge className="bg-primary/20 text-primary border-primary/30">GDPR</Badge>;
    }
    return <Badge variant="outline">{action?.toUpperCase()}</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('de-DE'),
      time: date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  };

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Lade Audit Logs...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Keine Logs gefunden
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[160px]">Zeitpunkt</TableHead>
            <TableHead className="w-[200px]">Benutzer</TableHead>
            <TableHead className="hidden lg:table-cell">Organisation</TableHead>
            <TableHead className="w-[120px]">Aktion</TableHead>
            <TableHead className="hidden md:table-cell">Entity</TableHead>
            <TableHead className="w-[80px]">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => {
            const time = formatTimestamp(log.created_at || '');
            return (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{time.date}</p>
                      <p className="text-xs text-muted-foreground">{time.time}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm truncate">
                        {log.user_profiles?.full_name || 'System'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {log.user_profiles?.email || ''}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-sm truncate">
                      {log.organizations?.name || '-'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    {getActionBadge(log.action)}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant="outline" className="font-mono text-xs">
                    {log.entity_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSelectedLog(log)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getActionIcon(selectedLog.action)}
              Log Details
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Zeitpunkt</p>
                  <p className="text-sm">
                    {new Date(selectedLog.created_at).toLocaleString('de-DE')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aktion</p>
                  <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Benutzer</p>
                  <p className="text-sm">
                    {selectedLog.user_profiles?.full_name || 'System'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedLog.user_profiles?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Organisation</p>
                  <p className="text-sm">{selectedLog.organizations?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entity Type</p>
                  <Badge variant="outline" className="font-mono text-xs mt-1">
                    {selectedLog.entity_type}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Entity ID</p>
                  <p className="text-xs font-mono text-muted-foreground">
                    {selectedLog.entity_id || '-'}
                  </p>
                </div>
                {selectedLog.ip_address && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">IP Adresse</p>
                    <p className="text-sm font-mono">{selectedLog.ip_address}</p>
                  </div>
                )}
              </div>

              {selectedLog.old_values && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Alte Werte</p>
                  <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-40 border">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Neue Werte</p>
                  <pre className="text-xs bg-muted/50 p-3 rounded-lg overflow-auto max-h-40 border">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.user_agent && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">User Agent</p>
                  <p className="text-xs text-muted-foreground break-all">
                    {selectedLog.user_agent}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
