import { Calendar, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AuditLogFilters as FiltersType, useAuditLogFilterOptions } from '@/hooks/useAuditLogs';

interface AuditLogFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const ACTION_OPTIONS = [
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'login', label: 'Login' },
];

export function AuditLogFilters({
  filters,
  onFiltersChange,
  searchQuery,
  onSearchChange,
}: AuditLogFiltersProps) {
  const { organizations, users, entityTypes, isLoading } = useAuditLogFilterOptions();

  const hasActiveFilters = 
    filters.organizationId || 
    filters.userId || 
    filters.action || 
    filters.entityType || 
    filters.dateFrom || 
    filters.dateTo;

  const clearFilters = () => {
    onFiltersChange({
      organizationId: null,
      userId: null,
      action: null,
      entityType: null,
      dateFrom: null,
      dateTo: null,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Suche in Logs..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3">
        {/* Organization Filter */}
        <Select
          value={filters.organizationId ?? 'all'}
          onValueChange={(value) => 
            onFiltersChange({ ...filters, organizationId: value === 'all' ? null : value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Organisation" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Organisationen</SelectItem>
            {organizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* User Filter */}
        <Select
          value={filters.userId ?? 'all'}
          onValueChange={(value) => 
            onFiltersChange({ ...filters, userId: value === 'all' ? null : value })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Benutzer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Benutzer</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.full_name || user.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Action Filter */}
        <Select
          value={filters.action ?? 'all'}
          onValueChange={(value) => 
            onFiltersChange({ ...filters, action: value === 'all' ? null : value })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Aktion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Aktionen</SelectItem>
            {ACTION_OPTIONS.map((action) => (
              <SelectItem key={action.value} value={action.value}>
                {action.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Entity Type Filter */}
        <Select
          value={filters.entityType ?? 'all'}
          onValueChange={(value) => 
            onFiltersChange({ ...filters, entityType: value === 'all' ? null : value })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Entity Typ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Entity Types</SelectItem>
            {entityTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date From */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {filters.dateFrom ? format(filters.dateFrom, 'dd.MM.yyyy', { locale: de }) : 'Von'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateFrom ?? undefined}
              onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date ?? null })}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Date To */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
              <Calendar className="mr-2 h-4 w-4" />
              {filters.dateTo ? format(filters.dateTo, 'dd.MM.yyyy', { locale: de }) : 'Bis'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <CalendarComponent
              mode="single"
              selected={filters.dateTo ?? undefined}
              onSelect={(date) => onFiltersChange({ ...filters, dateTo: date ?? null })}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            <X className="w-4 h-4 mr-1" />
            Filter löschen
          </Button>
        )}
      </div>
    </div>
  );
}
