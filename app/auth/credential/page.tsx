"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Key, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { useCreateYouTubeCredentials } from '@/hooks/youtube'
import { useYouTubeCredentials } from '@/hooks/youtube'
import { useAuth } from '@/hooks/auth'

export default function CredentialPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { createCredentials, isLoading, error, clearError } = useCreateYouTubeCredentials()
  const { 
    checkYouTubeCredentials, 
    hasCredentials, 
    isChecking, 
    error: credentialsError 
  } = useYouTubeCredentials()
  
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [showSecret, setShowSecret] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{
    clientId?: string
    clientSecret?: string
  }>({})

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Check for existing credentials when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      console.log('🔍 Checking for existing YouTube credentials...')
      checkYouTubeCredentials(false)
    }
  }, [isAuthenticated, checkYouTubeCredentials])

  // Auto-redirect to YouTube connect if credentials already exist
  useEffect(() => {
    if (hasCredentials && !isChecking) {
      console.log('✅ Credentials found, redirecting to YouTube connect...')
      router.push('/auth/youtube-connect')
    }
  }, [hasCredentials, isChecking, router])

  // Clear error when form changes
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [clientId, clientSecret, error, clearError])

  const validateForm = () => {
    const errors: { clientId?: string; clientSecret?: string } = {}
    
    if (!clientId.trim()) {
      errors.clientId = 'Client ID is required'
    } else if (clientId.trim().length < 10) {
      errors.clientId = 'Client ID must be at least 10 characters'
    }
    
    if (!clientSecret.trim()) {
      errors.clientSecret = 'Client Secret is required'
    } else if (clientSecret.trim().length < 10) {
      errors.clientSecret = 'Client Secret must be at least 10 characters'
    }
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await createCredentials({
        client_id: clientId.trim(),
        client_secret: clientSecret.trim()
      })
      
      // Redirect to YouTube connect page after successful creation
      router.push('/auth/youtube-connect')
    } catch (err) {
      // Error is already handled by the hook
      console.error('Failed to create credentials:', err)
    }
  }

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center crypto-gradient-bg">
        <Loader2 className="h-8 w-8 animate-spin crypto-profit text-[#fd1d1d]" />
      </div>
    )
  }

  // Show loading while checking credentials
  if (isChecking) {
    return (
      <div className="min-h-screen crypto-gradient-bg flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin crypto-profit mx-auto text-[#fd1d1d]" />
          <p className="crypto-text-primary text-base font-medium">Checking for existing credentials...</p>
          <p className="crypto-text-secondary text-sm">Please wait while we verify your setup</p>
        </div>
      </div>
    )
  }

  // Show credentials already exist message (briefly before redirect)
  if (hasCredentials) {
    return (
      <div className="min-h-screen crypto-gradient-bg flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 bg-profit/10 rounded-full flex items-center justify-center crypto-glow">
            <CheckCircle className="w-6 h-6 crypto-profit" />
          </div>
          <h2 className="text-xl font-bold crypto-text-primary">Credentials Found!</h2>
          <p className="crypto-text-secondary text-sm">Redirecting to YouTube connect...</p>
          <Loader2 className="h-5 w-5 animate-spin crypto-profit mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen crypto-gradient-bg flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="shadow-2xl border-0 bg-card/95 backdrop-blur-sm crypto-card-enhanced">
          <CardHeader className="text-center space-y-3 pb-6">
            <div className="mx-auto w-16 h-16 crypto-primary-gradient rounded-xl flex items-center justify-center crypto-glow-pulse">
              <Key className="w-8 h-8 text-white" />
            </div>
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold crypto-text-primary">
                YouTube Credentials
              </CardTitle>
              <CardDescription className="text-base crypto-text-secondary">
                Enter your YouTube API credentials to continue
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Client ID Field */}
              <div className="space-y-2">
                <Label htmlFor="clientId" className="text-sm font-semibold crypto-text-primary">
                  Client ID
                </Label>
                <Input
                  id="clientId"
                  type="text"
                  placeholder="Enter your YouTube Client ID"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={`crypto-input-enhanced text-sm py-2.5 px-3 ${validationErrors.clientId ? 'border-loss focus:border-loss focus:ring-loss' : ''}`}
                  disabled={isLoading}
                />
                {validationErrors.clientId && (
                  <p className="text-xs crypto-loss">{validationErrors.clientId}</p>
                )}
              </div>

              {/* Client Secret Field */}
              <div className="space-y-2">
                <Label htmlFor="clientSecret" className="text-sm font-semibold crypto-text-primary">
                  Client Secret
                </Label>
                <div className="relative">
                  <Input
                    id="clientSecret"
                    type={showSecret ? 'text' : 'password'}
                    placeholder="Enter your YouTube Client Secret"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className={`pr-10 crypto-input-enhanced text-sm py-2.5 px-3 ${validationErrors.clientSecret ? 'border-loss focus:border-loss focus:ring-loss' : ''}`}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-brand-10 crypto-text-tertiary hover:crypto-text-primary"
                    onClick={() => setShowSecret(!showSecret)}
                    disabled={isLoading}
                  >
                    {showSecret ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
                {validationErrors.clientSecret && (
                  <p className="text-xs crypto-loss">{validationErrors.clientSecret}</p>
                )}
              </div>

              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="border-loss/20 bg-loss/10 crypto-card">
                  <AlertDescription className="crypto-loss">{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full crypto-button-enhanced text-base py-3 font-semibold"
                disabled={isLoading || !clientId.trim() || !clientSecret.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin crypto-spinner" />
                    Creating Credentials...
                  </>
                ) : (
                  'Create Credentials'
                )}
              </Button>
            </form>

            {/* Help Text */}
            <div className="mt-6 text-center">
              <p className="text-sm crypto-text-secondary">
                Don't have credentials?{' '}
                <a
                  href="https://developers.google.com/youtube/v3/getting-started"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="crypto-text-primary hover:crypto-text-secondary underline font-semibold transition-colors"
                >
                  Learn how to get them
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
