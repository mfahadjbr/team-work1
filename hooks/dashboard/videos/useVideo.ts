"use client";

import { useState, useEffect } from 'react';
import { SingleVideoResponse } from '@/types/dashboard/videos';

const useVideo = (videoId: string) => {
  const [data, setData] = useState<SingleVideoResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (refresh: boolean = false) => {
    console.log('🚀 Starting fetchData function', { refresh });
    
    if (!videoId) {
      console.log('❌ No videoId provided');
      setIsLoading(false);
      return;
    }

    console.log('📡 Setting loading to true and starting fetch');
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      console.log('🎫 Token retrieved:', token ? 'exists' : 'missing');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('📞 Making API call to:', `https://saas-backend.duckdns.org/videos/${videoId}`);
      const response = await fetch(`https://saas-backend.duckdns.org/videos/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
        },
      });
      
      console.log('📋 API Response:', response);
      console.log('✅ Response status:', response.status);
      console.log('📊 Response ok:', response.ok);
      if (!response.ok) {
        const errorData = await response.json();
        console.log('❌ API Error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch video details');
      }

      const raw = await response.json();
      // Map to SingleVideoResponse shape from backend response
      const mapped: SingleVideoResponse = {
        success: !!raw?.success,
        message: raw?.message || '',
        data: {
          video_id: raw?.data?.video?.id || raw?.data?.video_id,
          title: raw?.data?.video?.title || '',
          description: raw?.data?.video?.description || '',
          published_at: raw?.data?.video?.published_at || raw?.data?.video?.created_at || new Date().toISOString(),
          youtube_url: raw?.data?.video?.youtube_video_id ? `https://www.youtube.com/watch?v=${raw.data.video.youtube_video_id}` : '',
          thumbnail_url: raw?.data?.video?.thumbnail_url || '',
          privacy_status: raw?.data?.video?.privacy_status || raw?.data?.video?.video_status || 'private',
          view_count: raw?.data?.video?.view_count ?? 0,
          like_count: raw?.data?.video?.like_count ?? 0,
          comment_count: raw?.data?.video?.comment_count ?? 0,
          duration: raw?.data?.video?.duration || 'PT0S',
          duration_seconds: raw?.data?.video?.duration_seconds ?? 0,
          duration_minutes: raw?.data?.video?.duration_minutes ?? 0,
          engagement_rate: raw?.data?.video?.engagement_rate ?? 0,
          performance_score: raw?.data?.video?.performance_score ?? 0,
          days_since_published: 0,
          likes_per_view_percentage: 0,
          comments_per_view_percentage: 0,
          views_per_day: 0,
          watch_time_hours: 0,
          performance_level: '',
          engagement_level: '',
          content_type: '',
          content_category: raw?.data?.video?.playlist_name || '',
          growth_potential: '',
          tags: [],
          category_id: '',
          default_language: '',
          default_audio_language: '',
          analytics_summary: {
            total_engagement: 0,
            engagement_breakdown: {
              likes_percentage: 0,
              comments_percentage: 0,
            },
            performance_indicators: {
              is_high_performing: false,
              is_viral_potential: false,
              is_high_engagement: false,
            },
          },
          recommendations: [],
        }
      };
      console.log('🎬 Mapped Video Result:', mapped);
      setData(mapped);
    } catch (err: any) {
      console.log('💥 Error caught:', err);
      setError(err.message);
    } finally {
      console.log('🏁 Setting loading to false');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🎯 useVideo useEffect triggered with videoId:', videoId);
    console.log('🔄 Calling fetchData function');
    fetchData(false); // Initial load with refresh=false
  }, [videoId]);

  return { 
    data, 
    video: data?.data || null, 
    isLoading, 
    error,
    refetch: () => fetchData(true) // Refresh with refresh=true
  };
};

export default useVideo;
