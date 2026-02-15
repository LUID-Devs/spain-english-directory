import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * DashboardSkeleton - Loading state for the Mission Control Dashboard
 * Provides a skeleton layout that matches the actual dashboard structure
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="container h-full w-full bg-background p-4 sm:p-6 lg:p-8">
      {/* Header Section Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-1">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      {/* Welcome Section Skeleton */}
      <Card className="mb-4 sm:mb-6 border-primary/10">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-2 sm:gap-3">
            <Skeleton className="h-8 w-8 rounded-lg flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4 max-w-md" />
              <Skeleton className="h-3 w-full max-w-lg" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview Skeleton */}
      <div className="grid gap-2 sm:gap-4 grid-cols-2 lg:grid-cols-4 mb-4 sm:mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-12" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
                <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Section Skeleton */}
      <Card className="overflow-hidden">
        <CardHeader className="p-4 sm:p-6 pb-0">
          {/* Tabs Skeleton */}
          <div className="w-full h-auto flex flex-wrap sm:flex-nowrap gap-1 p-1 bg-muted/50 rounded-md">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton 
                key={i} 
                className="flex-1 sm:flex-none h-10 sm:h-11 rounded-sm min-w-[80px]" 
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-4">
          {/* Agents Grid Skeleton */}
          <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="relative overflow-hidden">
                {/* Status indicator bar */}
                <Skeleton className="absolute top-0 left-0 right-0 h-1" />
                
                <div className="p-3 sm:p-6 pb-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-5 w-20 rounded-sm" />
                    </div>
                    <Skeleton className="h-7 w-7 sm:h-8 sm:w-8 rounded-md flex-shrink-0" />
                  </div>
                </div>

                <div className="px-3 sm:px-6 pb-4 sm:pb-6 pt-0 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-28" />
                  <div className="pt-1.5 sm:pt-2 border-t flex gap-4">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSkeleton;
