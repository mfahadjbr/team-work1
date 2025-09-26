import { useState, useCallback, useEffect, useMemo } from 'react'
import axios from 'axios'
import useAuth from '../auth/useAuth'
import { useToast } from '../common/useToast'

interface YouTubeCredentials {
  id: number
  user_id: string
  access_token: string
  refresh_token: string
  token_type: string
  expires_in: number
  scope: string
  expires_at: string
  refresh_token_expires_in: number
  created_at: string
  updated_at: string
}

export interface YouTubeCredentialsState {
  isLoading: boolean
  isChecking: boolean
  error: string | null
  hasCredentials: boolean
  credentials: YouTubeCredentials | null
  lastChecked: number | null
}

const API_BASE_URL = 'http://saas-backend.duckdns.org'

// Create axios instance for YouTube credentials API calls
const credentialsApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  },
})

// Add request interceptor for logging
credentialsApi.interceptors.request.use(
  (config) => {
    console.log('🔑 YouTube Credentials API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      headers: config.headers,
    })
    return config
  },
  (error) => {
    console.error('❌ YouTube Credentials API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for logging
credentialsApi.interceptors.response.use(
  (response) => {
    console.log('✅ YouTube Credentials API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      hasData: !!response.data,
      dataKeys: response.data ? Object.keys(response.data) : [],
    })
    return response
  },
  (error) => {
    console.error('❌ YouTube Credentials API Response Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    })
    return Promise.reject(error)
  }
)

export default function useYouTubeCredentials() {
  const { getAuthHeaders, user } = useAuth()
  const { toast } = useToast()
  const [credentialsState, setCredentialsState] = useState<YouTubeCredentialsState>({
    isLoading: false,
    isChecking: false,
    error: null,
    hasCredentials: false,
    credentials: null,
    lastChecked: null,
  })

  const maskToken = useCallback((token?: string) => {
    if (!token || typeof token !== 'string') return 'none'
    if (token.length <= 14) return token
    return `${token.slice(0, 8)}...${token.slice(-6)}`
  }, [])

  const userId = useMemo(() => {
    if (user?.id) return user.id
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_id') || JSON.parse(localStorage.getItem('user_data') || '{}')?.id
    }
    return null
  }, [user])

  const checkYouTubeCredentials = useCallback(async (showSuccessToast = false): Promise<YouTubeCredentials | null> => {
    if (!userId) {
      console.log('🔍 No user ID found, cannot check YouTube credentials')
      setCredentialsState(prev => ({
        ...prev,
        hasCredentials: false,
        credentials: null,
        error: 'No user ID found. Please login first.',
      }))
      return null
    }

    console.log('🔍 Checking YouTube credentials for user:', userId)
    
    setCredentialsState(prev => ({
      ...prev,
      isChecking: true,
      error: null,
    }))

    try {
      const headers = getAuthHeaders()
      const url = `/youtube/status`
      
      console.log('[YouTube][Check Credentials] Request', {
        userId,
        url: `${API_BASE_URL}${url}`,
        hasAuthHeader: !!(headers as any)?.Authorization,
      })

      const response = await credentialsApi.get(url, { headers })
      
      console.log('[YouTube][Check Credentials] Response', {
        status: response.status,
        hasCredentials: !!response.data,
        responseStatus: response.data?.status,
        message: response.data?.message,
        hasAccessTo: response.data?.has_access_to,
      })

      // Since backend handles token refresh automatically, just check if token exists
      const hasValidToken = !!response.data && response.data.status === 'valid'
      
      console.log('[YouTube][Check Credentials] Token Status', {
        hasData: !!response.data,
        status: response.data?.status,
        message: response.data?.message,
        willSetHasCredentials: hasValidToken,
      })
      
      setCredentialsState(prev => ({
        ...prev,
        isChecking: false,
        isLoading: false,
        error: null,
        hasCredentials: hasValidToken,
        credentials: response.data || null,
        lastChecked: Date.now(),
      }))

      if (showSuccessToast && response.data) {
        toast({ 
          title: 'YouTube Connected', 
          description: 'YouTube credentials are active and valid.' 
        })
      }

      return response.data || null

    } catch (error: any) {
      console.error('[YouTube][Check Credentials] Error:', error)
      
      let errorMessage = 'Failed to check YouTube credentials'
      let hasCredentials = false
      let shouldSetError = true

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          errorMessage = 'Authentication failed. Please login again.'
        } else if (error.response?.status === 404) {
          errorMessage = 'No YouTube credentials found'
          hasCredentials = false
          shouldSetError = false // Don't treat 404 as an error - it's expected when no credentials exist
        } else if (error.response?.status === 403) {
          errorMessage = 'Access denied to YouTube credentials'
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.'
        } else {
          errorMessage = `Request failed: ${error.response?.status} ${error.response?.statusText}`
        }
      } else if (error.message) {
        errorMessage = error.message
      }

      setCredentialsState(prev => ({
        ...prev,
        isChecking: false,
        isLoading: false,
        error: shouldSetError ? errorMessage : null,
        hasCredentials,
        credentials: null,
        lastChecked: Date.now(),
      }))

      // Don't show toast for 404 (no credentials found) as it's expected
      if (error.response?.status !== 404) {
        toast({ 
          title: 'Failed to check credentials', 
          description: errorMessage,
          variant: 'destructive'
        })
      }

      return null
    }
  }, [userId, getAuthHeaders, maskToken, toast])

  const clearCredentials = useCallback(() => {
    console.log('🗑️ Clearing YouTube credentials state')
    
    setCredentialsState({
      isLoading: false,
      isChecking: false,
      error: null,
      hasCredentials: false,
      credentials: null,
      lastChecked: null,
    })
  }, [])

  const refreshCredentialsCheck = useCallback(async () => {
    console.log('🔄 Refreshing YouTube credentials check')
    return checkYouTubeCredentials(false)
  }, [checkYouTubeCredentials])

  // Auto-check credentials when userId becomes available
  useEffect(() => {
    if (userId && !credentialsState.lastChecked) {
      console.log('🚀 Auto-checking YouTube credentials for newly loaded user')
      checkYouTubeCredentials(false)
    }
  }, [userId, credentialsState.lastChecked, checkYouTubeCredentials])

  // Log state changes for debugging
  useEffect(() => {
    console.log('🔄 YouTube Credentials State Updated:', {
      isChecking: credentialsState.isChecking,
      isLoading: credentialsState.isLoading,
      hasCredentials: credentialsState.hasCredentials,
      hasError: !!credentialsState.error,
      hasCredentialsData: !!credentialsState.credentials,
      credentialsKeys: credentialsState.credentials ? Object.keys(credentialsState.credentials) : [],
      expires_at: credentialsState.credentials?.expires_at,
      lastChecked: credentialsState.lastChecked ? new Date(credentialsState.lastChecked).toISOString() : null,
      error: credentialsState.error,
    })
  }, [credentialsState])

  return {
    // State
    ...credentialsState,
    
    // Actions
    checkYouTubeCredentials,
    refreshCredentialsCheck,
    clearCredentials,
  }
}
