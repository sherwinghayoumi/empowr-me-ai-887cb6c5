import { useState, useMemo } from 'react';
import { Download, ScrollText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { AuditLogFilters } from '@/components/audit-log/AuditLogFilters';
import { AuditLogTable } from '@/components/audit-log/AuditLogTable';
import { 
  useAuditLogs, 
  exportAuditLogsToCSV, 
  AuditLogFilters as FiltersType 
} from '@/hooks/useAuditLogs';

export default function SuperAdminAuditLog() {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FiltersType>({
    organizationId: null,
    userId: null,
    action: null,
    entityType: null,
    dateFrom: null,
    dateTo: null,
  });

  const { data, isLoading } = useAuditLogs(filters, page);

  // Client-side search filtering (for quick search across loaded data)
  const filteredLogs = useMemo(() => {
    if (!data?.logs || !searchQuery.trim()) return data?.logs ?? [];
    
    const query = searchQuery.toLowerCase();
    return data.logs.filter(log => 
      log.action?.toLowerCase().includes(query) ||
      log.entity_type?.toLowerCase().includes(query) ||
      log.user_profiles?.full_name?.toLowerCase().includes(query) ||
      log.user_profiles?.email?.toLowerCase().includes(query) ||
      log.organizations?.name?.toLowerCase().includes(query)
    );
  }, [data?.logs, searchQuery]);

  const handleExport = () => {
    if (filteredLogs.length > 0) {
      exportAuditLogsToCSV(filteredLogs);
    }
  };

  const handleFiltersChange = (newFilters: FiltersType) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filters change
  };

  // Generate pagination items
  const renderPaginationItems = () => {
    const totalPages = data?.totalPages ?? 0;
    const items = [];
    
    // Always show first page
    items.push(
      <PaginationItem key={0}>
        <PaginationLink 
          onClick={() => setPage(0)}
          isActive={page === 0}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i < totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              onClick={() => setPage(i)}
              isActive={page === i}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // Show ellipsis pattern for many pages
      if (page > 2) {
        items.push(<PaginationItem key="ellipsis-start"><PaginationEllipsis /></PaginationItem>);
      }

      // Pages around current
      const start = Math.max(1, page - 1);
      const end = Math.min(totalPages - 2, page + 1);
      
      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink 
              onClick={() => setPage(i)}
              isActive={page === i}
            >
              {i + 1}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (page < totalPages - 3) {
        items.push(<PaginationItem key="ellipsis-end"><PaginationEllipsis /></PaginationItem>);
      }

      // Always show last page
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages - 1}>
            <PaginationLink 
              onClick={() => setPage(totalPages - 1)}
              isActive={page === totalPages - 1}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ScrollText className="w-6 h-6 text-primary" />
            Audit Log
          </h1>
          <p className="text-muted-foreground">
            Alle Systemaktivitäten überwachen • {data?.totalCount ?? 0} Einträge
          </p>
        </div>
        <Button 
          onClick={handleExport} 
          disabled={filteredLogs.length === 0}
          className="gap-2"
        >
          <Download className="w-4 h-4" />
          CSV Export
        </Button>
      </div>

      {/* Filters */}
      <Card className="glass">
        <CardHeader className="pb-4">
          <AuditLogFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </CardHeader>
        <CardContent className="p-0">
          <AuditLogTable logs={filteredLogs} isLoading={isLoading} />
        </CardContent>
      </Card>

      {/* Pagination */}
      {(data?.totalPages ?? 0) > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setPage(p => Math.max(0, p - 1))}
                className={page === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            
            {renderPaginationItems()}

            <PaginationItem>
              <PaginationNext 
                onClick={() => setPage(p => Math.min((data?.totalPages ?? 1) - 1, p + 1))}
                className={page >= (data?.totalPages ?? 1) - 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
