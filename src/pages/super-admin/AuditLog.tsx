import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { 
  ScrollText, 
  Search, 
  Filter,
  User,
  Building2,
  Shield,
  FileText,
  Trash2,
  Edit,
  Plus,
  Clock,
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export default function SuperAdminAuditLog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['super-admin-audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select(`
          *,
          user_profiles (full_name, email),
          organizations (name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const filteredLogs = auditLogs?.filter(log => {
    const matchesSearch = 
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.user_profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action?.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

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
    if (action?.includes('gdpr') || action?.includes('consent')) {
      return <Badge className="bg-primary/20 text-primary border-primary/30">GDPR</Badge>;
    }
    return <Badge variant="outline">{action?.toUpperCase()}</Badge>;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('de-DE'),
      time: date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="text-muted-foreground">Alle Systemaktivitäten überwachen</p>
      </div>

      {/* Filters */}
      <Card className="glass">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Suche in Logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Aktion filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Aktionen</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="gdpr">GDPR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Zeitpunkt</TableHead>
                <TableHead>Aktion</TableHead>
                <TableHead className="hidden md:table-cell">Benutzer</TableHead>
                <TableHead className="hidden lg:table-cell">Entity</TableHead>
                <TableHead className="hidden xl:table-cell">Organisation</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Lade Audit Logs...
                  </TableCell>
                </TableRow>
              ) : filteredLogs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Keine Logs gefunden
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs?.map((log) => {
                  const time = formatTimestamp(log.created_at || '');
                  return (
                    <Collapsible key={log.id} asChild>
                      <>
                        <TableRow className="group">
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <p className="text-sm font-medium">{time.date}</p>
                                <p className="text-xs text-muted-foreground">{time.time}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              {getActionBadge(log.action)}
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm">
                                {log.user_profiles?.full_name || log.user_profiles?.email || 'System'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant="outline" className="font-mono text-xs">
                              {log.entity_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {log.organizations?.name || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </CollapsibleTrigger>
                          </TableCell>
                        </TableRow>
                        <CollapsibleContent asChild>
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={6} className="p-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {log.old_values && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Alte Werte:</p>
                                    <pre className="text-xs bg-background p-3 rounded-lg overflow-auto max-h-32">
                                      {JSON.stringify(log.old_values, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.new_values && (
                                  <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Neue Werte:</p>
                                    <pre className="text-xs bg-background p-3 rounded-lg overflow-auto max-h-32">
                                      {JSON.stringify(log.new_values, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.entity_id && (
                                  <div className="md:col-span-2">
                                    <p className="text-xs text-muted-foreground">
                                      Entity ID: <span className="font-mono">{log.entity_id}</span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
