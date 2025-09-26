"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Upload, Video, BarChart3, Menu, X, List, ChevronDown, ChevronRight } from "lucide-react"
import useTemp from "@/hooks/common/useTemp"
import { useChannelPlaylists } from "@/hooks/dashboard/playlists/useChannelPlaylists"

const sidebarItems = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Upload Video",
    href: "/dashboard/upload",
    icon: Upload,
  },
  {
    title: "YouTube Videos",
    href: "/dashboard/videos",
    icon: Video,
  },
  {
    title: "YouTube Studio",
    href: "/youtube-studio-dashboard",
    icon: BarChart3,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isPlaylistsOpen, setIsPlaylistsOpen] = useState(false)
  const { getYouTubeToken, refreshYouTubeToken, isLoading } = useTemp()
  const { playlists, isLoading: playlistsLoading } = useChannelPlaylists()
  const playlistsRef = useRef<HTMLDivElement>(null)

  // Close playlists dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (playlistsRef.current && !playlistsRef.current.contains(event.target as Node)) {
        setIsPlaylistsOpen(false)
      }
    }

    if (isPlaylistsOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isPlaylistsOpen])

  // Auto-select first playlist when on playlists page without specific playlist
  useEffect(() => {
    if (pathname === '/dashboard/playlists' && playlists.length > 0) {
      const urlParams = new URLSearchParams(window.location.search)
      const playlistId = urlParams.get('id')
      
      if (!playlistId) {
        // If no playlist is selected, automatically select the first one
        const firstPlaylist = playlists[0]
        if (firstPlaylist) {
          window.history.replaceState(
            null, 
            '', 
            `/dashboard/playlists?id=${firstPlaylist.id}`
          )
        }
      }
    }
  }, [pathname, playlists])

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-20 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-64 border-r border-primary bg-secondary transition-transform duration-300 ease-in-out crypto-glow",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex-1 overflow-auto py-6">
            <nav className="space-y-2 px-4">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "crypto" : "cryptoGhost"}
                      className={cn(
                        "w-full justify-start gap-4 h-12 crypto-hover-glow",
                        isActive && "crypto-glow",
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </Button>
                  </Link>
                )
              })}

              {/* YouTube Playlists Dropdown */}
              <div className="space-y-4" ref={playlistsRef}>
                <Button
                  variant={pathname === '/dashboard/playlists' ? "crypto" : "cryptoGhost"}
                  className={cn(
                    "w-full justify-between h-12 px-3 cursor-pointer gap-3 mb-2 crypto-hover-glow",
                    pathname === '/dashboard/playlists' && "crypto-glow"
                  )}
                  onClick={() => setIsPlaylistsOpen(!isPlaylistsOpen)}
                >
                  <div className="flex items-center gap-4">
                    <List className="h-5 w-5" />
                    <span>YouTube Playlists</span>
                  </div>
                  {isPlaylistsOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
                
                {isPlaylistsOpen && (
                  <div className="ml-6 space-y-2">
                    {playlistsLoading ? (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Loading playlists...
                      </div>
                    ) : playlists.length > 0 ? (
                      playlists.map((playlist) => (
                        <Link key={playlist.id} href={`/dashboard/playlists?id=${playlist.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                                                         className={cn(
                               "w-full justify-start h-10 px-3 text-sm cursor-pointer mb-2",
                               pathname === `/dashboard/playlists?id=${playlist.id}` && 
                               "bg-brand-primary text-white hover:bg-brand-primary-dark crypto-glow"
                             )}
                            onClick={() => {
                              setIsMobileMenuOpen(false)
                              // Don't close the playlists dropdown when clicking on a playlist
                              // This allows users to browse and select playlists
                            }}
                          >
                            <span className="truncate max-w-[180px]" title={playlist.name}>
                              {playlist.name}
                            </span>
                          </Button>
                        </Link>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        No playlists found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Bottom section */}
          <div className="border-t border-primary p-4">
            <div className="crypto-card rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium crypto-text-primary">YouTube Token (temp)</h4>
              <div className="grid grid-cols-1 gap-2">
                <Button size="sm" variant="cryptoSecondary" disabled={isLoading} onClick={() => getYouTubeToken()}>
                  Get Token
                </Button>
                <Button size="sm" variant="cryptoGhost" disabled={isLoading} onClick={() => refreshYouTubeToken()}>
                  Refresh Token
                </Button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  )
}
