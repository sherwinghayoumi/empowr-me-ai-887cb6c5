import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLogFilters {
  organizationId: string | null;
  userId: string | null;
  action: string | null;
  entityType: string | null;
  dateFrom: Date | null;
  dateTo: Date | null;
}

export interface AuditLogEntry {
  id: string;
  created_at: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  user_id: string | null;
  organization_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  user_profiles: {
    full_name: string | null;
    email: string;
  } | null;
  organizations: {
    name: string;
  } | null;
}

const PAGE_SIZE = 50;

export function useAuditLogs(filters: AuditLogFilters, page: number = 0) {
  return useQuery({
    queryKey: ['audit-logs', filters, page],
    queryFn: async () => {
      let query = supabase
        .from('audit_log')
        .select(`
          *,
          user_profiles (full_name, email),
          organizations (name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

      // Apply filters
      if (filters.organizationId) {
        query = query.eq('organization_id', filters.organizationId);
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.action) {
        query = query.ilike('action', `%${filters.action}%`);
      }
      if (filters.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        const endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error, count } = await query;

      if (error) throw error;
      
      return {
        logs: data as AuditLogEntry[],
        totalCount: count ?? 0,
        pageSize: PAGE_SIZE,
        totalPages: Math.ceil((count ?? 0) / PAGE_SIZE),
      };
    },
  });
}

export function useAuditLogFilterOptions() {
  const orgsQuery = useQuery({
    queryKey: ['audit-log-orgs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const usersQuery = useQuery({
    queryKey: ['audit-log-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email')
        .order('full_name');
      if (error) throw error;
      return data;
    },
  });

  const entityTypesQuery = useQuery({
    queryKey: ['audit-log-entity-types'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_log')
        .select('entity_type')
        .order('entity_type');
      if (error) throw error;
      // Get unique entity types
      const uniqueTypes = [...new Set(data?.map(d => d.entity_type))].filter(Boolean);
      return uniqueTypes;
    },
  });

  return {
    organizations: orgsQuery.data ?? [],
    users: usersQuery.data ?? [],
    entityTypes: entityTypesQuery.data ?? [],
    isLoading: orgsQuery.isLoading || usersQuery.isLoading || entityTypesQuery.isLoading,
  };
}

export function exportAuditLogsToCSV(logs: AuditLogEntry[]): void {
  const headers = ['Timestamp', 'User', 'Email', 'Organization', 'Action', 'Entity Type', 'Entity ID', 'Old Values', 'New Values', 'IP Address'];
  
  const rows = logs.map(log => [
    log.created_at ? new Date(log.created_at).toLocaleString('de-DE') : '',
    log.user_profiles?.full_name || 'System',
    log.user_profiles?.email || '',
    log.organizations?.name || '',
    log.action || '',
    log.entity_type || '',
    log.entity_id || '',
    log.old_values ? JSON.stringify(log.old_values) : '',
    log.new_values ? JSON.stringify(log.new_values) : '',
    log.ip_address || '',
  ]);

  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `audit-log-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
