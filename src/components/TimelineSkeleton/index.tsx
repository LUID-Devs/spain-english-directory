import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Timeline activity item skeleton
 */
export function TimelineActivitySkeleton() {
  return (
    <div className="relative pl-8 pb-8 border-l border-border last:pb-0">
      {/* Dot */}
      <div className="absolute left-0 top-0 -translate-x-1/2">
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      
      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

/**
 * Timeline day group skeleton
 */
export function TimelineDaySkeleton({ activityCount = 3 }: { activityCount?: number }) {
  return (
    <div className="space-y-4">
      {/* Day header */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-8 rounded-full" />
      </div>
      
      {/* Activities */}
      <div className="space-y-0">
        {Array.from({ length: activityCount }).map((_, i) => (
          <TimelineActivitySkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Timeline stats skeleton
 */
export function TimelineStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="space-y-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Complete timeline page skeleton
 */
export function TimelinePageSkeleton() {
  return (
    <div className="container h-full w-full bg-background px-4 py-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 bg-card border border-border rounded-lg p-4 sm:p-6 shadow">
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start lg:items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 sm:h-6 sm:w-6" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-64" />
          </div>
          
          <Skeleton className="h-10 w-full sm:w-64" />
        </div>
        
        {/* Stats */}
        <div className="mt-4 sm:mt-6">
          <TimelineStatsSkeleton />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-md" />
        ))}
      </div>

      {/* Timeline content */}
      <div className="space-y-8">
        <TimelineDaySkeleton activityCount={4} />
        <TimelineDaySkeleton activityCount={3} />
        <TimelineDaySkeleton activityCount={2} />
      </div>
    </div>
  );
}

/**
 * Simple loading spinner with text for inline loading states
 */
export function TimelineLoadingSpinner({ text = "Loading activity timeline..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground text-sm sm:text-base">{text}</p>
      </div>
    </div>
  );
}
