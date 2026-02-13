import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskCardSkeletonProps {
  count?: number;
}

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
