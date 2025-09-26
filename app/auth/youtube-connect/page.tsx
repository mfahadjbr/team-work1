"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Play, Youtube, Loader2, CheckCircle, AlertCircle, ExternalLink, RefreshCw } from "lucide-react"
import useCredential from "@/hooks/ai/useCredential"
import useYouTubeCredentials from "@/hooks/youtube/useYouTubeCredentials"

export default function YouTubeConnectPage() {
  const [isConnecting, setIsConnecting] = useState(false)
  const router = useRouter()
  
  // Existing credential management
  const { 
    createYouTubeToken, 
    openAuthUrl, 
    resetTokenState,
    isLoading, 
    error, 
    authUrl, 
    message 
  } = useCredential()

  // New credentials check functionality
  const {
    isChecking,
    hasCredentials,
    credentials,
    error: credentialsError,
    checkYouTubeCredentials,
    refreshCredentialsCheck,
    lastChecked
  } = useYouTubeCredentials()

  const handleYouTubeConnect = async () => {
    console.log('🎬 User initiated YouTube connection...')
    setIsConnecting(true)
    
    try {
      // Create YouTube OAuth token
      const tokenResponse = await createYouTubeToken()
      console.log('✅ Token creation completed, opening OAuth URL...')
      
      // Open the OAuth URL in a new window
      const authWindow = openAuthUrl(tokenResponse.auth_url)
      
      if (authWindow) {
        console.log('🌐 OAuth window opened, waiting for user completion...')
        
        // OAuth window opened successfully
        // Note: In a real implementation, you would:
        // 1. Listen for OAuth completion via webhook or polling
        // 2. Check OAuth status from backend
        // 3. Redirect to dashboard only after confirmed OAuth success
        
        // For now, we'll show success message and provide manual redirect
        console.log('🌐 OAuth window opened, waiting for user completion...')
        
        // Show success message and manual redirect button
        // The user will need to complete OAuth in the opened window
        // and then manually proceed to dashboard
      }
      
    } catch (err: any) {
      console.error('❌ YouTube connection failed:', err)
      // Error state is already handled by the hook
    } finally {
      setIsConnecting(false)
    }
  }

  const handleRetry = () => {
    console.log('🔄 User requested retry...')
    resetTokenState()
  }

  const handleProceedToDashboard = () => {
    console.log('🚀 User proceeding to dashboard after OAuth...')
    
    // Check if there's a stored redirect URL
    const redirectUrl = localStorage.getItem('youtube_redirect_after_auth')
    if (redirectUrl) {
      console.log('🔄 Redirecting back to stored URL:', redirectUrl)
      localStorage.removeItem('youtube_redirect_after_auth')
      router.push(redirectUrl)
    } else {
      router.push("/dashboard")
    }
  }

  const handleRefreshCheck = async () => {
    console.log('🔄 User requested credentials refresh check...')
    await refreshCredentialsCheck()
  }

  const handleReconnect = () => {
    console.log('🔄 User requested YouTube reconnection...')
    resetTokenState()
    // Clear any existing error states
  }

  // Check for existing credentials on component mount
  useEffect(() => {
    console.log('🎬 YouTube Connect page mounted, checking for existing credentials...')
    checkYouTubeCredentials(false)
  }, [checkYouTubeCredentials])

  // Determine the current state and what UI to show
  const isLoadingAny = isLoading || isConnecting || isChecking
  const hasAnyError = error || credentialsError
  const hasCredentialsData = !!credentials
  const showCredentialsFound = hasCredentials && !authUrl
  const showNoCredentials = !hasCredentials && !authUrl && !hasAnyError
  const showOAuthFlow = authUrl && !hasAnyError

  // Auto-initiate OAuth if user doesn't have credentials (after initial check completes)
  useEffect(() => {
    const shouldAutoConnect = 
      !isLoadingAny && 
      !hasCredentials && 
      !authUrl && 
      !hasAnyError && 
      lastChecked && // Only after we've completed the initial check
      showNoCredentials // Ensure we're in the "no credentials" state

    if (shouldAutoConnect) {
      console.log('🚀 Auto-initiating YouTube OAuth for user without credentials...')
      
      // Add a small delay to ensure UI has updated and to prevent double-calls
      const timeoutId = setTimeout(() => {
        handleYouTubeConnect()
      }, 2000) // 2 second delay to show the "no credentials" state briefly

      return () => clearTimeout(timeoutId)
    }
  }, [isLoadingAny, hasCredentials, authUrl, hasAnyError, lastChecked, showNoCredentials, handleYouTubeConnect])

  // Debug logging for UI state
  console.log('🎬 YouTube Connect UI State:', {
    hasCredentials,
    hasCredentialsData,
    isLoadingAny,
    hasAnyError,
    showCredentialsFound,
    showNoCredentials,
    showOAuthFlow,
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:opacity-90 transition-opacity crypto-primary-gradient crypto-glow">
              <Play className="h-5 w-5 text-white fill-current" />
            </div>
            <span className="text-2xl font-bold text-foreground">YouTube Automator</span>
          </Link>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <Youtube className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl">
              {showCredentialsFound ? 'YouTube Already Connected!' : 'Connect Your YouTube Channel'}
            </CardTitle>
            <CardDescription>
              {showCredentialsFound ? 'Your YouTube account is connected and ready to use' :
               'Connect your YouTube account to start automating your video content with AI'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Auto-redirect Message */}
            {typeof window !== 'undefined' && localStorage.getItem('youtube_redirect_after_auth') && !isLoadingAny && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>🔗 YouTube connection required to continue.</p>
                    <p className="text-sm text-muted-foreground">
                      You'll be redirected back to your previous page after connecting your YouTube account.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {isLoadingAny && (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>
                  {isChecking ? 'Checking YouTube credentials...' :
                   isLoading ? 'Creating OAuth token...' :
                   isConnecting ? 'Connecting to YouTube...' :
                   'Loading...'}
                </AlertDescription>
              </Alert>
            )}

            {/* Credentials Found - Valid */}
            {showCredentialsFound && !isLoadingAny && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>✅ YouTube channel is connected and active!</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Token type: {credentials?.token_type || 'Unknown'}</p>
                      <p>• Connected: {credentials?.created_at ? new Date(credentials.created_at).toLocaleDateString() : 'Unknown'}</p>
                      <p>• Backend will automatically refresh tokens as needed</p>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => {
                          // Check if there's a stored redirect URL for immediate redirect
                          const redirectUrl = localStorage.getItem('youtube_redirect_after_auth')
                          if (redirectUrl) {
                            console.log('🔄 Found stored redirect URL, going to:', redirectUrl)
                            localStorage.removeItem('youtube_redirect_after_auth')
                            router.push(redirectUrl)
                          } else {
                            handleProceedToDashboard()
                          }
                        }}
                        className="crypto-button-primary"
                        size="sm"
                      >
                        {localStorage.getItem('youtube_redirect_after_auth') ? 'Continue to Previous Page' : 'Go to Dashboard'}
                      </Button>
                      <Button
                        onClick={handleRefreshCheck}
                        variant="outline"
                        size="sm"
                        disabled={isChecking}
                      >
                        <RefreshCw className={`h-4 w-4 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
                        Refresh Check
                      </Button>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Error Display */}
            {hasAnyError && !isLoadingAny && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error || credentialsError}</AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {message && !error && !credentialsError && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{message}</p>
                    <p className="text-sm text-muted-foreground">
                      Please complete the OAuth process in the opened window, then return here to proceed to the dashboard.
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Auth URL Display */}
            {showOAuthFlow && (
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <p className="text-sm text-muted-foreground">
                  OAuth URL received. If the window didn't open automatically, click below:
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openAuthUrl(authUrl)}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open YouTube OAuth
                </Button>
                
                <div className="pt-3 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    After completing OAuth in the opened window, click below to proceed:
                  </p>
                  <Button
                    onClick={handleProceedToDashboard}
                    className="w-full crypto-button-primary"
                  >
                    Proceed to Dashboard
                  </Button>
                </div>
              </div>
            )}

            {/* Features List - Only show when no credentials */}
            {showNoCredentials && !isLoadingAny && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 crypto-profit" />
                  <span className="text-sm">Generate AI-powered titles and descriptions</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 crypto-profit" />
                  <span className="text-sm">Create custom thumbnails automatically</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 crypto-profit" />
                  <span className="text-sm">Schedule and publish videos seamlessly</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {showNoCredentials && !isLoadingAny && (
              <Button
                onClick={handleYouTubeConnect}
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                disabled={isLoadingAny}
                size="lg"
              >
                <Youtube className="mr-2 h-5 w-5" />
                Connect with YouTube
              </Button>
            )}

            {/* Retry Button */}
            {hasAnyError && !isLoadingAny && (
              <Button
                onClick={handleRetry}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Try Again
              </Button>
            )}

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                By connecting, you agree to YouTube's Terms of Service and our Privacy Policy
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  )
}
