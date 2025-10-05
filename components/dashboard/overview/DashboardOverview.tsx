
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth"
import { useDashboardOverview } from "@/hooks/dashboard/overview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardOverview() {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const { overviewData, isLoading: dataLoading, error, refetch } = useDashboardOverview()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login")
      return
    }
    
    if (!authLoading && isAuthenticated) {
      setIsLoading(false)
    }
  }, [isAuthenticated, authLoading, router])

  const handleRefresh = useCallback(async () => {
    if (refetch) {
      await refetch()
    }
  }, [refetch])

  if (isLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  if (!overviewData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-muted-foreground">Unable to load dashboard data</p>
        </div>
      </div>
    )
  }

  const mp = overviewData.monetization_progress
  const cd = overviewData.content_distributions

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
        <button
          onClick={handleRefresh}
          className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          Refresh
        </button>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Videos</CardTitle>
            <CardDescription>All uploaded videos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overviewData.total_videos}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total Views</CardTitle>
            <CardDescription>Channel lifetime views</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overviewData.total_views}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscribers</CardTitle>
            <CardDescription>Current subscribers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overviewData.subscriber_count}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Engagement Rate</CardTitle>
            <CardDescription>Overall engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overviewData.engagement_rate?.toFixed(2)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Monetization Progress */}
      {mp && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monetization Progress</CardTitle>
            <CardDescription>Progress towards program requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Subscribers</span>
                <span>{mp.subscriber_progress_percentage.toFixed(1)}% of {mp.requirements.subscriber_requirement}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min(mp.subscriber_progress_percentage, 100)}%` }} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Watch time</span>
                <span>{mp.watch_time_progress_percentage.toFixed(1)}% of {mp.requirements.watch_time_requirement} hrs</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${Math.min(mp.watch_time_progress_percentage, 100)}%` }} />
              </div>
            </div>

            <div className="text-sm">Eligible: {mp.monetization_eligible ? "Yes" : "No"} • Watch time: {mp.watch_time_hours.toFixed(2)} hrs</div>
          </CardContent>
        </Card>
      )}

      {/* Content Distributions */}
      {cd && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">View Distribution</CardTitle>
              <CardDescription>Recent viewing activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl">Total views: <span className="font-semibold">{cd.view_distribution.total_views}</span></div>
              <div className="text-sm text-muted-foreground">Avg/day: {cd.view_distribution.avg_views_per_day}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Duration Distribution</CardTitle>
              <CardDescription>Watch time summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-xl">Avg duration: <span className="font-semibold">{cd.duration_distribution.avg_duration_seconds}s</span></div>
              <div className="text-sm text-muted-foreground">Total watch time: {cd.duration_distribution.total_watch_time_minutes} min</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}