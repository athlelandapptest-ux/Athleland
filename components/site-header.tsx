"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MenuIcon, Search, Home, Calendar, Users, CalendarDays, Music, ChevronDown } from "lucide-react"
import { getAppSettings } from "@/app/actions"

interface Playlist {
  id: string
  name: string
  category: string
  url: string
  isDefault: boolean
}

export function SiteHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const settings = await getAppSettings()
        setPlaylists(settings.playlists || [])
      } catch (error) {
        console.error("Failed to load app settings:", error)
      }
    }
    loadPlaylists()

    const interval = setInterval(loadPlaylists, 30000)
    return () => clearInterval(interval)
  }, [])

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/#classes", label: "Classes", icon: Calendar },
    { href: "/events", label: "Events", icon: CalendarDays },
    { href: "/sponsorship", label: "Sponsorship", icon: Users },
    { href: "/about", label: "About", icon: Users },
  ]

  const isActive = (href: string) => {
    if (href.startsWith("/#")) {
      return pathname === "/" && href === "#classes"
    }
    return pathname === href
  }

  const defaultPlaylist = playlists.find((p) => p.isDefault) || playlists[0]
  const groupedPlaylists = playlists.reduce(
    (acc, playlist) => {
      if (!acc[playlist.category]) {
        acc[playlist.category] = []
      }
      acc[playlist.category].push(playlist)
      return acc
    },
    {} as Record<string, Playlist[]>,
  )

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-gray-800">
        <div className="container mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center justify-center animate-fade-in">
            <div className="flex flex-col items-start">
              <div className="font-display text-2xl lg:text-3xl font-bold tracking-wider text-white">ATHLELAND</div>
              <div className="font-display text-xs lg:text-sm font-light italic text-gray-400 -mt-1">
                CONDITIONING CLUB
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-12">
            {navItems.map((item, index) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 text-sm font-light transition-all duration-300 ${
                    isActive(item.href) ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span className="relative">
                    {item.label}
                    {isActive(item.href) && (
                      <div className="absolute -bottom-2 left-0 w-full h-px bg-white animate-fade-in"></div>
                    )}
                  </span>
                </Link>
              )
            })}

            {playlists.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <Music className="h-5 w-5" />
                    <span className="text-sm">Music Corner</span>
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black border-gray-800 text-white min-w-48">
                  {Object.entries(groupedPlaylists).map(([category, categoryPlaylists]) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {category}
                      </div>
                      {categoryPlaylists.map((playlist) => (
                        <DropdownMenuItem key={playlist.id} asChild>
                          <a
                            href={playlist.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-2 py-2 hover:bg-white/10 cursor-pointer"
                          >
                            <Music className="h-4 w-4" />
                            <span className="flex-1">{playlist.name}</span>
                            {playlist.isDefault && <span className="text-xs bg-white/20 px-1 rounded">Default</span>}
                          </a>
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-black border-gray-800 text-white">
                <nav className="flex flex-col gap-8 pt-12">
                  {navItems.map((item, index) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={`flex items-center gap-4 text-lg font-light transition-all duration-300 animate-slide-in ${
                          isActive(item.href) ? "text-white" : "text-gray-400 hover:text-white"
                        }`}
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    )
                  })}

                  <div className="mt-8 pt-8 border-t border-gray-800">
                    {playlists.length > 0 && (
                      <div className="mb-4">
                        <div className="text-sm font-semibold text-gray-400 mb-2">Music Corner</div>
                        {Object.entries(groupedPlaylists).map(([category, categoryPlaylists]) => (
                          <div key={category} className="mb-3">
                            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{category}</div>
                            {categoryPlaylists.map((playlist) => (
                              <Button
                                key={playlist.id}
                                variant="ghost"
                                className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5 mb-1"
                                asChild
                              >
                                <a
                                  href={playlist.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={() => setIsOpen(false)}
                                >
                                  <Music className="h-4 w-4 mr-3" />
                                  {playlist.name}
                                  {playlist.isDefault && <span className="ml-auto text-xs">Default</span>}
                                </a>
                              </Button>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      <Search className="h-5 w-5 mr-3" />
                      Search
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}
