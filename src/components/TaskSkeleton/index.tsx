import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskCardSkeletonProps {
  count?: number;
}

/**
 * Individual task card skeleton for list/table views
 */
export function TaskCardSkeleton({ count = 1 }: TaskCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-border/50">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-6 rounded-full shrink-0" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Description lines */}
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            
            {/* Tags */}
            <div className="flex gap-1 pt-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            
            {/* Footer with avatar, dates, comments */}
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

/**
 * Table row skeleton for task tables
 */
export function TaskTableRowSkeleton() {
  return (
    <tr className="border-b border-border/50">
      <td className="p-4">
        <Skeleton className="h-4 w-4" />
      </td>
      <td className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </td>
      <td className="p-4">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
      <td className="p-4">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      <td className="p-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="p-4">
        <Skeleton className="h-8 w-16" />
      </td>
    </tr>
  );
}

/**
 * Full table skeleton with header
 */
export function TaskTableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between pb-4 border-b">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Table */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4"><Skeleton className="h-4 w-4" /></th>
              <th className="p-4"><Skeleton className="h-4 w-16" /></th>
              <th className="p-4"><Skeleton className="h-4 w-16" /></th>
              <th className="p-4"><Skeleton className="h-4 w-16" /></th>
              <th className="p-4"><Skeleton className="h-4 w-16" /></th>
              <th className="p-4"><Skeleton className="h-4 w-16" /></th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <TaskTableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function TaskColumnSkeleton({ taskCount = 3 }: { taskCount?: number }) {
  return (
    <Card className="w-[85vw] sm:w-80 flex-shrink-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <TaskCardSkeleton count={taskCount} />
      </CardContent>
    </Card>
  );
}

export function BoardSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:p-6 overflow-x-auto">
      <div className="flex gap-2 sm:gap-6 pb-4">
        {Array.from({ length: columns }).map((_, i) => (
          <TaskColumnSkeleton key={i} taskCount={3} />
        ))}
      </div>
    </div>
  );
}
