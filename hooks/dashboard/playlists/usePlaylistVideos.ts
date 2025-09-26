"use client";
import { useState, useEffect } from "react";

export interface PlaylistVideoDetails {
  video_id: string;
  title: string;
  description: string;
  published_at: string;
  thumbnail_url: string;
  position: number;
  duration: string;
  duration_seconds: number;
  duration_minutes: number;
  privacy_status: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  engagement_rate: number;
  performance_score: number;
  days_since_published: number;
  tags: string[];
  category_id: string;
  // Backend returns `url`; some other endpoints use `youtube_url`.
  url?: string;
  youtube_url?: string;
  performance_level?: string;
  engagement_level?: string;
  content_category?: string;
  content_type?: string;
  growth_potential?: string;
}

// Matches GET /dashboard/playlists/{playlistId}/videos response
export interface PlaylistVideosResponse {
  success: boolean;
  message: string;
  data: PlaylistVideoDetails[];
  count: number;
}

const usePlaylistVideos = (playlistId: string) => {
  const [playlistData, setPlaylistData] = useState<PlaylistVideosResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaylistVideos = async (refresh: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(
        `http://saas-backend.duckdns.org/dashboard/playlists/${playlistId}/videos?refresh=${refresh}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch playlist videos");
      }

      const data: PlaylistVideosResponse = await response.json();
      setPlaylistData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistVideos(false); // Initial load with refresh=false
    }
  }, [playlistId]);

  return { 
    playlistData, 
    isLoading, 
    error,
    refetch: () => fetchPlaylistVideos(true) // Refresh with refresh=true
  };
};

export default usePlaylistVideos;
