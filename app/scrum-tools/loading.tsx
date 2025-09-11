import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ScrumToolsLoading() {
  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-full max-w-md">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Story Skeleton */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <div className="space-y-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Skeleton className="h-4 w-4 mt-0.5" />
                            <Skeleton className="h-4 w-full" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Status Skeleton */}
            <div>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-24" />
                          <div className="flex items-center gap-1">
                            <Skeleton className="h-3 w-3" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Poker Cards Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="h-6 w-40" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-13 gap-3">
                {Array.from({ length: 13 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
