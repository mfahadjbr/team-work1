"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/Sidebar"
import { DashboardHeader } from "@/components/DashboardHeader"
import { useAuth } from "@/hooks/auth"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log('🏠 Dashboard Layout useEffect triggered');
    console.log('🔐 Authentication status:', isAuthenticated);
    console.log('🔄 Auth loading status:', authLoading);
    console.log('🎫 Token exists:', !!localStorage.getItem('auth_token'));
    console.log('👤 User data exists:', !!localStorage.getItem('user_data'));
    
    if (!authLoading && !isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      router.push("/auth/login")
      return
    }
    
    if (!authLoading && isAuthenticated) {
      console.log('✅ Authenticated, setting loading to false');
      setIsLoading(false)
    }
  }, [isAuthenticated, authLoading, router])

  console.log('🏠 Dashboard Layout render - isLoading:', isLoading);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen crypto-gradient-bg">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 crypto-navbar">
        <DashboardHeader />
      </div>
      
      {/* Main Content Area */}
      <div className="flex pt-16 h-screen"> {/* Full height container */}
        <Sidebar />
        <main className="flex-1 w-full min-w-0 p-3 sm:p-4 lg:p-6 xl:p-8 lg:ml-64 overflow-y-auto">
          <div className="max-w-7xl mx-auto pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}