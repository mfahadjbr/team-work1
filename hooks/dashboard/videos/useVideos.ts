"use client";

import { useState, useEffect, useMemo } from 'react';
import { DashboardVideosResponse, VideoStats } from '@/types/dashboard/videos';

const useVideos = () => {
  const [data, setData] = useState<DashboardVideosResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (refresh: boolean = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`https://saas-backend.duckdns.org/videos/my-videos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch dashboard videos');
      }

      const raw = await response.json();
      const videos = Array.isArray(raw?.data?.videos) ? raw.data.videos : [];

      // Map backend uploads to dashboard video shape with safe defaults
      const mappedVideos = videos.map((v: any) => {
        const publishedAt = v.published_at || v.created_at || new Date().toISOString();
        const youtubeId = v.youtube_video_id || v.video_id || null;
        const daysSince = (() => {
          const then = new Date(publishedAt).getTime();
          const now = Date.now();
          const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
          return Number.isFinite(diffDays) ? diffDays : 0;
        })();

        return {
          video_id: youtubeId || v.id || String(Math.random()),
          title: v.title || "Untitled",
          description: v.description || "",
          published_at: publishedAt,
          thumbnail_url: v.thumbnail_url || "",
          channel_title: "",
          tags: [],
          view_count: v.view_count ?? 0,
          like_count: v.like_count ?? 0,
          comment_count: v.comment_count ?? 0,
          duration: v.duration || "PT0S",
          duration_seconds: v.duration_seconds ?? 0,
          privacy_status: v.privacy_status || v.video_status || "private",
          analytics: {
            view_count: v.view_count ?? 0,
            like_count: v.like_count ?? 0,
            comment_count: v.comment_count ?? 0,
            duration: v.duration || "PT0S",
            duration_seconds: v.duration_seconds ?? 0,
            privacy_status: v.privacy_status || v.video_status || "private",
            published_at: publishedAt,
            title: v.title || "Untitled",
            description: v.description || "",
            tags: [],
            category_id: "",
            default_language: null as any,
            default_audio_language: null as any,
          },
          engagement_rate: v.engagement_rate ?? 0,
          performance_score: v.performance_score ?? 0,
          days_since_published: daysSince,
        };
      });

      const result: DashboardVideosResponse = {
        success: !!raw?.success,
        message: raw?.message || "",
        data: mappedVideos,
        count: mappedVideos.length,
      };

      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(false); // Initial load with refresh=false
  }, []);

  // Calculate video stats
  const videoStats: VideoStats = useMemo(() => {
    if (!data?.data) {
      return {
        totalVideos: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0,
        avgEngagement: 0,
        avgPerformanceScore: 0,
      };
    }

    const videos = data.data;
    const totalVideos = videos.length;
    const totalViews = videos.reduce((sum, video) => sum + video.view_count, 0);
    const totalLikes = videos.reduce((sum, video) => sum + video.like_count, 0);
    const totalComments = videos.reduce((sum, video) => sum + video.comment_count, 0);
    
    const avgEngagement = totalVideos > 0 
      ? videos.reduce((sum, video) => sum + video.engagement_rate, 0) / totalVideos 
      : 0;
    
    const avgPerformanceScore = totalVideos > 0 
      ? videos.reduce((sum, video) => sum + video.performance_score, 0) / totalVideos 
      : 0;

    return {
      totalVideos,
      totalViews,
      totalLikes,
      totalComments,
      avgEngagement: parseFloat(avgEngagement.toFixed(2)),
      avgPerformanceScore: parseFloat(avgPerformanceScore.toFixed(2)),
    };
  }, [data]);

  return { 
    data, 
    videos: data?.data || [], 
    videoStats, 
    isLoading, 
    error,
    refetch: () => fetchData(true) // Refresh with refresh=true
  };
};

export default useVideos;
