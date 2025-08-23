"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Music, Save, ExternalLink, Plus, Trash2 } from "lucide-react"
import { getAppSettings, updateAppSettings } from "@/app/actions"

interface Playlist {
  id: string
  name: string
  category: string
  url: string
  isDefault: boolean
}

interface AppSettings {
  playlists: Playlist[]
}

export function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    playlists: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const currentSettings = await getAppSettings()
      setSettings(currentSettings)
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateAppSettings(settings)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 2000)
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addPlaylist = () => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: "",
      category: "Workout",
      url: "",
      isDefault: settings.playlists.length === 0,
    }
    setSettings((prev) => ({
      ...prev,
      playlists: [...prev.playlists, newPlaylist],
    }))
  }

  const updatePlaylist = (id: string, field: keyof Playlist, value: string | boolean) => {
    setSettings((prev) => ({
      ...prev,
      playlists: prev.playlists.map((playlist) => (playlist.id === id ? { ...playlist, [field]: value } : playlist)),
    }))
  }

  const removePlaylist = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      playlists: prev.playlists.filter((playlist) => playlist.id !== id),
    }))
  }

  const setDefaultPlaylist = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      playlists: prev.playlists.map((playlist) => ({
        ...playlist,
        isDefault: playlist.id === id,
      })),
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-thin text-white mb-2">App Settings</h2>
          <p className="text-white/60 font-light text-sm">Configure global app settings and integrations</p>
        </div>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white font-display font-thin flex items-center gap-2">
            <Music className="h-5 w-5" />
            Music Corner - Playlist Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {settings.playlists.map((playlist) => (
              <div key={playlist.id} className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="Playlist Name"
                      value={playlist.name}
                      onChange={(e) => updatePlaylist(playlist.id, "name", e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/40 w-48"
                    />
                    <Select
                      value={playlist.category}
                      onValueChange={(value) => updatePlaylist(playlist.id, "category", value)}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/20">
                        <SelectItem value="Workout">Workout</SelectItem>
                        <SelectItem value="HIIT">HIIT</SelectItem>
                        <SelectItem value="Strength">Strength</SelectItem>
                        <SelectItem value="Cardio">Cardio</SelectItem>
                        <SelectItem value="Recovery">Recovery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={playlist.isDefault ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDefaultPlaylist(playlist.id)}
                      className={
                        playlist.isDefault ? "bg-white text-black" : "border-white/20 text-white hover:bg-white/10"
                      }
                    >
                      {playlist.isDefault ? "Default" : "Set Default"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removePlaylist(playlist.id)}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="https://open.spotify.com/playlist/YOUR_PLAYLIST_ID"
                    value={playlist.url}
                    onChange={(e) => updatePlaylist(playlist.id, "url", e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/40 flex-1"
                  />
                  {playlist.url && (
                    <Button
                      variant="outline"
                      size="icon"
                      asChild
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      <a href={playlist.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button
              onClick={addPlaylist}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Playlist
            </Button>
          </div>

          <Button onClick={handleSave} disabled={isLoading} className="bg-white text-black hover:bg-white/90">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Saving..." : isSaved ? "Saved!" : "Save Settings"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
