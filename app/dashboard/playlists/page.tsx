"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { List, RefreshCw, Eye, ThumbsUp, MessageCircle, Video, Clock, TrendingUp, TrendingDown, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import usePlaylistAnalytics from "@/hooks/dashboard/playlists/usePlaylistAnalytics"
import RefreshButton from "@/components/ui/refresh-button"
import Link from "next/link"
  
// ===== Helpers =====
const brand = {
  primary: "#FD1D1D",
  primaryDark: "#FF6B35",
  grid: "#374151",
  axis: "#9CA3AF",
}

const asNumber = (v: any, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

const healthColor = (level?: string) => {
  switch ((level || "").toLowerCase()) {
    case "excellent":
      return "crypto-profit"
    case "good":
      return "text-blue-600"
    case "fair":
      return "crypto-text-secondary"
    case "poor":
      return "text-red-600"
    default:
      return "text-muted-foreground"
  }
}

const healthBadge = (level?: string) => {
  switch ((level || "").toLowerCase()) {
    case "excellent":
      return "bg-profit/10 text-profit"
    case "good":
      return "bg-blue-100 text-blue-800"
    case "fair":
      return "bg-brand-10 crypto-text-primary"
    case "poor":
      return "bg-red-100 text-red-800"
    default:
      return "bg-secondary text-secondary-foreground"
  }
}

const growthIcon = (trend?: string) => {
  switch ((trend || "").toLowerCase()) {
    case "growing":
    case "increasing":
      return <TrendingUp className="w-4 h-4 crypto-profit" />
    case "decreasing":
      return <TrendingDown className="w-4 h-4 text-red-600" />
    default:
      return <BarChart3 className="w-4 h-4 text-blue-600" />
  }
}

export default function PlaylistsPage() {
  const searchParams = useSearchParams()
  const playlistId = searchParams.get('id')
  const [showAll, setShowAll] = useState(false)
  
  if (!playlistId) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center space-y-6">
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <List className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">YouTube Playlists</h1>
          <p className="text-lg text-muted-foreground max-w-md">
            Select a playlist from the sidebar dropdown to view its data and analytics.
          </p>
        </div>
      </div>
    )
  }

  return <PlaylistData playlistId={playlistId} />
}

function PlaylistData({ playlistId }: { playlistId: string }) {
  const { playlistData, isLoading, error, refetch } = usePlaylistAnalytics(playlistId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !playlistData?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-center">
        <h2 className="text-2xl font-bold text-destructive mb-2">Failed to load playlist</h2>
        <p className="text-muted-foreground mb-4">{error || 'No playlist data available'}</p>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  const playlist = playlistData.data.analytics
  const playlistInfo = playlistData.data.playlist_info

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{playlistInfo.title}</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Playlist Analytics and Performance Overview
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button asChild size="sm">
            <Link href={`/dashboard/playlists/${playlistInfo.playlist_id}?view=all`}>
              View all videos
            </Link>
          </Button>
          <RefreshButton 
            onRefresh={refetch}
            variant="outline"
            size="sm"
          />
        </div>
      </div>

      {/* Main Info */}
            <Card className="border-2 border-primary/20">
              <CardContent className="p-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 lg:gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <div>
                <div className="font-medium">{asNumber(playlist.total_views).toLocaleString()}</div>
                          <div className="text-muted-foreground text-xs">total views</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ThumbsUp className="w-4 h-4 text-muted-foreground" />
                        <div>
                <div className="font-medium">{asNumber(playlist.total_likes).toLocaleString()}</div>
                          <div className="text-muted-foreground text-xs">total likes</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-muted-foreground" />
                        <div>
                <div className="font-medium">{asNumber(playlist.total_comments).toLocaleString()}</div>
                          <div className="text-muted-foreground text-xs">comments</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-muted-foreground" />
                        <div>
                <div className="font-medium">{asNumber(playlist.total_videos)}</div>
                          <div className="text-muted-foreground text-xs">videos</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                <div className="font-medium">{asNumber(playlist.total_watch_time_hours).toFixed(2)}</div>
                          <div className="text-muted-foreground text-xs">watch time (hrs)</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

      {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              <Card>
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 lg:h-4 lg:w-4 text-blue-500" />
                    <div className="text-xs lg:text-sm text-muted-foreground">Health Score</div>
                  </div>
            <div className={`text-lg lg:text-2xl font-bold ${healthColor(playlist.playlist_health?.health_level)}`}>
              {asNumber(playlist.playlist_health?.health_score)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
              {playlist.playlist_health?.health_level || "—"}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 lg:h-4 lg:w-4 crypto-profit" />
                    <div className="text-xs lg:text-sm text-muted-foreground">Performance</div>
                  </div>
                  <div className="text-lg lg:text-2xl font-bold crypto-profit">
              {asNumber(playlist.performance_score).toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Overall Score</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-3 lg:h-4 lg:w-4 text-purple-500" />
                    <div className="text-xs lg:text-sm text-muted-foreground">Avg Duration</div>
                  </div>
                  <div className="text-lg lg:text-2xl font-bold text-purple-600">
              {asNumber(playlist.avg_duration_minutes).toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">minutes per video</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center gap-2 mb-2">
              {growthIcon(playlist.growth_metrics?.growth_trend)}
                    <div className="text-xs lg:text-sm text-muted-foreground">Consistency</div>
                  </div>
                  <div className="text-lg lg:text-2xl font-bold text-blue-600">
              {asNumber(playlist.growth_metrics?.consistency_score).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
              Growth: {playlist.growth_metrics?.growth_trend || "—"}
                  </div>
                </CardContent>
              </Card>
            </div>

      {/* Top Performing Videos */}
      {playlist.top_performing_videos && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base lg:text-lg">Top Performing Videos</CardTitle>
                  <CardDescription className="text-sm">Best by views & engagement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {playlist.top_performing_videos.top_by_views && (
                      <TopVideoCard
                        label="Top by Views"
                  data={playlist.top_performing_videos.top_by_views}
                      />
                    )}
              {playlist.top_performing_videos.top_by_engagement && (
                      <TopVideoCard
                        label="Top by Engagement"
                  data={playlist.top_performing_videos.top_by_engagement}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
      
    </div>
  )
}

function TopVideoCard({ label, data }: { label: string; data: any }) {
  return (
    <div className="p-3 sm:p-4 border rounded-lg">
      <div className="text-xs mb-2 text-muted-foreground">{label}</div>
      <div className="flex flex-col sm:flex-row items-start gap-3">
        <img
          src={data.thumbnail_url}
          alt={data.title}
          className="w-full sm:w-20 h-32 sm:h-20 object-cover rounded-lg"
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-2 mb-2">{data.title}</h4>
          <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
            <div>
              <div className="font-medium">{asNumber(data.views).toLocaleString()}</div>
              <div>Views</div>
            </div>
            <div>
              <div className="font-medium">{asNumber(data.likes).toLocaleString()}</div>
              <div>Likes</div>
            </div>
            <div>
              <div className="font-medium">{asNumber(data.engagement_rate).toFixed(2)}%</div>
              <div>Engagement</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}