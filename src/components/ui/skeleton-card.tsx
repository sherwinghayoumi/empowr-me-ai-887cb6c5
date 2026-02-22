import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  className?: string;
  lines?: number;
  hasAvatar?: boolean;
  hasHeader?: boolean;
  hasProgress?: boolean;
}

/**
 * Rich skeleton loading placeholder that mimics card layouts.
 * Used across all pages for consistent loading states.
 */
export function SkeletonCard({
  className,
  lines = 2,
  hasAvatar = false,
  hasHeader = true,
  hasProgress = false,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "glass-card p-4 space-y-3 animate-skeleton-pulse",
        className,
      )}
    >
      {hasHeader && (
        <div className="flex items-center gap-3">
          {hasAvatar && <Skeleton className="w-10 h-10 rounded-full shrink-0" />}
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      )}
      {hasProgress && (
        <div className="space-y-1.5">
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      )}
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")}
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </div>
  );
}

/**
 * Grid of skeleton cards for loading states.
 */
export function SkeletonGrid({
  count = 3,
  columns = 3,
  className,
  ...cardProps
}: { count?: number; columns?: number; className?: string } & Omit<SkeletonCardProps, "className">) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 && "md:grid-cols-2",
        columns === 3 && "md:grid-cols-3",
        columns === 4 && "sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} {...cardProps} className="stagger-skeleton" style-delay={i * 100} />
      ))}
    </div>
  );
}
