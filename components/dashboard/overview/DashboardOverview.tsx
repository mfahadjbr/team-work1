
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/auth"
import { useDashboardOverview } from "@/hooks/dashboard/overview"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts"

// Import separated components
import DashboardHeader from "./components/DashboardHeader"
import KeyMetricsCards from "./components/KeyMetricsCards"
import MonetizationProgress from "./components/MonetizationProgress"
import TopPerformingContent from "./components/TopPerformingContent"
import ChannelInsightsGrid from "./components/ChannelInsightsGrid"
import QuickActions from "./components/QuickActions"
import ContentTypeChart from "./charts/ContentTypeChart"
import ViewDistributionChart from "./charts/ViewDistributionChart"
import DurationDistributionChart from "./charts/DurationDistributionChart"

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

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header Section */}
      <DashboardHeader 
        channelInfo={overviewData.channel_info}
        channelStatus={overviewData.channel_status}
        competitiveAnalysis={overviewData.competitive_analysis}
        onRefresh={handleRefresh}
      />

      {/* Key Metrics Cards */}
      <KeyMetricsCards 
        channelInfo={overviewData.channel_info}
        performanceMetrics={overviewData.performance_metrics}
      />

      {/* Monetization Progress */}
      <MonetizationProgress 
        channelInfo={overviewData.channel_info}
        summaryStats={overviewData.summary_stats}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Type Distribution Chart */}
        {overviewData.advanced_analytics?.content_type_breakdown && (
          <ContentTypeChart 
            contentTypeBreakdown={overviewData.advanced_analytics.content_type_breakdown}
          />
        )}
        
        {/* View Distribution Chart */}
        {overviewData.content_analysis?.view_distribution && (
          <ViewDistributionChart 
            viewDistribution={overviewData.content_analysis.view_distribution}
          />
        )}
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Duration Distribution Chart */}
        {overviewData.advanced_analytics?.duration_distribution && (
          <DurationDistributionChart 
            durationDistribution={overviewData.advanced_analytics.duration_distribution}
          />
        )}
        
        {/* Engagement Distribution Chart */}
        {overviewData.advanced_analytics?.engagement_distribution && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Engagement Distribution</CardTitle>
              <CardDescription>Breakdown of videos by engagement rate</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(overviewData.advanced_analytics.engagement_distribution).map(([range, count]) => ({
                  range,
                  count,
                  color: range === '0-1%' ? '#FD1D1D' : range === '1-3%' ? '#FF6B35' : range === '3-5%' ? '#F7931E' : '#FFA500'
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#f9fafb' 
                    }}
                  />
                  <Bar dataKey="count" fill="#FD1D1D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Monthly Analytics Chart */}
      {overviewData.monthly_analytics?.chart_data && overviewData.monthly_analytics.chart_data.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Analytics Overview</CardTitle>
              <CardDescription>Views, videos, and engagement trends over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={overviewData.monthly_analytics.chart_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#f9fafb' 
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#FD1D1D"
                    strokeWidth={3}
                    dot={{ fill: "#FD1D1D", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#FD1D1D", strokeWidth: 2 }}
                    name="Views"
                  />
                  <Line
                    type="monotone"
                    dataKey="videos"
                    stroke="#FF6B35"
                    strokeWidth={3}
                    dot={{ fill: "#FF6B35", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#FF6B35", strokeWidth: 2 }}
                    name="Videos"
                  />
                  <Line
                    type="monotone"
                    dataKey="engagement_rate"
                    stroke="#F7931E"
                    strokeWidth={3}
                    dot={{ fill: "#F7931E", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#F7931E", strokeWidth: 2 }}
                    name="Engagement Rate"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Monetization Progress Chart */}
      {(overviewData as any).monetization_data?.monetization_requirements && (
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monetization Progress</CardTitle>
              <CardDescription>Progress towards YouTube monetization requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Subscribers Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {(overviewData as any).monetization_data.monetization_requirements.current_subscribers} / {(overviewData as any).monetization_data.monetization_requirements.subscriber_count_required}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(((overviewData as any).monetization_data.monetization_requirements.current_subscribers / (overviewData as any).monetization_data.monetization_requirements.subscriber_count_required) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(((overviewData as any).monetization_data.monetization_requirements.current_subscribers / (overviewData as any).monetization_data.monetization_requirements.subscriber_count_required) * 100).toFixed(1)}% Complete
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Watch Time Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {(((overviewData as any).monetization_data.monetization_requirements.current_watch_time / 1000).toFixed(2))}k / {(((overviewData as any).monetization_data.monetization_requirements.watch_time_required / 1000).toFixed(0))}k hours
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-brand-primary h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(((overviewData as any).monetization_data.monetization_requirements.current_watch_time / (overviewData as any).monetization_data.monetization_requirements.watch_time_required) * 100, 100)}%` 
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {(((overviewData as any).monetization_data.monetization_requirements.current_watch_time / (overviewData as any).monetization_data.monetization_requirements.watch_time_required) * 100).toFixed(3)}% Complete
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <Badge variant={(overviewData as any).monetization_data.is_monetized ? "default" : "secondary"}>
                  {(overviewData as any).monetization_data.monetization_status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Scoring Chart */}
      {overviewData.performance_scoring?.top_videos_by_score && overviewData.performance_scoring.top_videos_by_score.length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance Scoring</CardTitle>
              <CardDescription>Top videos ranked by performance score</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={overviewData.performance_scoring.top_videos_by_score} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis 
                    dataKey="title" 
                    type="category" 
                    width={120} 
                    stroke="#9CA3AF" 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#f9fafb' 
                    }}
                  />
                  <Bar dataKey="score" fill="#FD1D1D" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Retention Analysis Chart */}
      {overviewData.advanced_analytics?.retention_analysis && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Retention Analysis</CardTitle>
              <CardDescription>Video retention performance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(overviewData.advanced_analytics.retention_analysis).map(([key, value]) => ({
                  category: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  value: typeof value === 'number' ? value : 0
                })).filter(item => item.category !== 'Avg Retention Rate')}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9CA3AF" fontSize={10} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#f9fafb' 
                    }}
                  />
                  <Bar dataKey="value" fill="#FF6B35" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Growth Trajectory Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Growth Trajectory</CardTitle>
              <CardDescription>Content growth and trend analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(overviewData.advanced_analytics.growth_trajectory).map(([key, value]) => ({
                  category: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                  value: typeof value === 'number' ? value : 0
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9CA3AF" fontSize={10} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1f2937', 
                      border: 'none', 
                      borderRadius: '8px',
                      color: '#f9fafb' 
                    }}
                  />
                  <Bar dataKey="value" fill="#F7931E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Charts Available Message */}
      {!overviewData.advanced_analytics?.content_type_breakdown && 
       !overviewData.content_analysis?.view_distribution && 
       !overviewData.advanced_analytics?.duration_distribution && 
       !overviewData.advanced_analytics?.engagement_distribution && 
       !overviewData.monthly_analytics?.chart_data && 
       !overviewData.performance_scoring?.top_videos_by_score && 
       !overviewData.advanced_analytics?.retention_analysis && 
       !(overviewData as any).monetization_data?.monetization_requirements && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="text-muted-foreground">
              <p className="text-lg mb-2">No chart data available</p>
              <p className="text-sm">Charts will appear here when analytics data is available</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Content */}
      {overviewData.top_performing_content && (
        <TopPerformingContent 
          topPerformingContent={overviewData.top_performing_content}
        />
      )}

      {/* Channel Insights Grid */}
      {overviewData.performance_metrics && (
        <ChannelInsightsGrid 
          performanceMetrics={overviewData.performance_metrics}
          channelStatus={overviewData.channel_status}
          competitiveAnalysis={overviewData.competitive_analysis}
          summaryStats={overviewData.summary_stats}
        />
      )}

      {/* Quick Actions */}
      <QuickActions />
    </div>
  )
}