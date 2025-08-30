"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calendar,
  Users,
  Clock,
  DollarSign,
  Star,
  Eye,
  EyeOff,
  Building2,
  Award,
  Upload,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"
import { Event, EventSponsor } from "@/lib/events"
import {
  fetchAllEvents,
  fetchAllSponsors,
  createEvent,
  updateEvent,
  deleteEvent,
  toggleEventStatus,
  createSponsor,
  updateSponsor,
  deleteSponsor,
  uploadEventImage,
  uploadSponsorLogo,
} from "@/app/actions"

export function EventManagement() {
  const [events, setEvents] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [editingEvent, setEditingEvent] = useState(null)
  const [editingSponsor, setEditingSponsor] = useState(null)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [isCreatingSponsor, setIsCreatingSponsor] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("events")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadMessage, setUploadMessage] = useState(null)
  const fileInputRef = useRef(null)
  const logoInputRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [eventsData, sponsorsData] = await Promise.all([fetchAllEvents(), fetchAllSponsors()])
      setEvents(eventsData)
      setSponsors(sponsorsData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Real image upload using Vercel Blob
  const handleImageUpload = async (file, type) => {
    setUploadingImage(true)
    setUploadMessage(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      let result
      if (type === "event") {
        result = await uploadEventImage(formData)
      } else {
        result = await uploadSponsorLogo(formData)
      }

      if (result.success && result.data) {
        if (type === "event" && editingEvent) {
          updateEditingEvent({ image: result.data })
        } else if (type === "sponsor" && editingSponsor) {
          updateEditingSponsor({ logo: result.data })
        }
        setUploadMessage(result.message || "Upload successful!")
      } else {
        setUploadMessage(result.message || "Upload failed")
      }
    } catch (error) {
      console.error("Upload error:", error)
      setUploadMessage("Upload failed. Please try again.")
    } finally {
      setUploadingImage(false)
      // Clear message after 3 seconds
      setTimeout(() => setUploadMessage(null), 3000)
    }
  }

  const triggerImageUpload = (type) => {
    if (type === "event") {
      fileInputRef.current?.click()
    } else {
      logoInputRef.current?.click()
    }
  }

  // Event Management Functions
  const handleCreateEvent = () => {
    const newEvent = {
      id: "",
      title: "",
      description: "",
      fullDescription: "",
      date: new Date().toISOString().split("T")[0],
      time: "09:00",
      duration: 60,
      location: "ATHLELAND Main Facility",
      category: "workshop",
      maxParticipants: 20,
      currentParticipants: 0,
      price: 0,
      instructor: "",
      difficulty: "Intermediate",
      image: "",
      gallery: [],
      tags: [],
      featured: false,
      status: "draft",
      requirements: [],
      whatToBring: [],
      isSponsored: false,
      registrationDeadline: new Date().toISOString().split("T")[0],
      createdAt: "",
      updatedAt: "",
    }
    setEditingEvent(newEvent)
    setIsCreatingEvent(true)
  }

  const handleEditEvent = (event) => {
    setEditingEvent({ ...event })
    setIsCreatingEvent(false)
  }

  const handleSaveEvent = async () => {
    if (!editingEvent) return

    try {
      if (isCreatingEvent) {
        const result = await createEvent(editingEvent)
        if (result.success) {
          await loadData()
          setEditingEvent(null)
          setIsCreatingEvent(false)
          onEventUpdate?.()
        }
      } else {
        const result = await updateEvent(editingEvent.id, editingEvent)
        if (result.success) {
          await loadData()
          setEditingEvent(null)
          onEventUpdate?.()
        }
      }
    } catch (error) {
      console.error("Error saving event:", error)
    }
  }

  const handleDeleteEvent = async (id) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        const result = await deleteEvent(id)
        if (result.success) {
          await loadData()
          onEventUpdate?.()
        }
      } catch (error) {
        console.error("Error deleting event:", error)
      }
    }
  }

  const handleToggleEventStatus = async (id, status) => {
    try {
      const result = await toggleEventStatus(id, status)
      if (result.success) {
        await loadData()
        onEventUpdate?.()
      }
    } catch (error) {
      console.error("Error updating event status:", error)
    }
  }

  // Sponsor Management Functions
  const handleCreateSponsor = () => {
    const newSponsor = {
      id: "",
      name: "",
      logo: "",
      website: "",
      tier: "bronze",
      isActive: true,
    }
    setEditingSponsor(newSponsor)
    setIsCreatingSponsor(true)
  }

  const handleEditSponsor = (sponsor) => {
    setEditingSponsor({ ...sponsor })
    setIsCreatingSponsor(false)
  }

  const handleSaveSponsor = async () => {
    if (!editingSponsor) return

    try {
      if (isCreatingSponsor) {
        const result = await createSponsor(editingSponsor)
        if (result.success) {
          await loadData()
          setEditingSponsor(null)
          setIsCreatingSponsor(false)
        }
      } else {
        const result = await updateSponsor(editingSponsor.id, editingSponsor)
        if (result.success) {
          await loadData()
          setEditingSponsor(null)
        }
      }
    } catch (error) {
      console.error("Error saving sponsor:", error)
    }
  }

  const handleDeleteSponsor = async (id) => {
    if (confirm("Are you sure you want to delete this sponsor?")) {
      try {
        const result = await deleteSponsor(id)
        if (result.success) {
          await loadData()
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error("Error deleting sponsor:", error)
      }
    }
  }

  const updateEditingEvent = (updates) => {
    if (editingEvent) {
      setEditingEvent({ ...editingEvent, ...updates })
    }
  }

  const updateEditingSponsor = (updates) => {
    if (editingSponsor) {
      setEditingSponsor({ ...editingSponsor, ...updates })
    }
  }

  const getCategoryColor = (category) => {
    switch (category) {
      case "workshop":
        return "bg-purple-600/20 text-purple-400 border-purple-600/30"
      case "competition":
        return "bg-accent/20 text-accent border-accent/30"
      case "seminar":
        return "bg-blue-600/20 text-blue-400 border-blue-600/30"
      case "training":
        return "bg-green-600/20 text-green-400 border-green-600/30"
      default:
        return "bg-white/10 text-white/80 border-white/20"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-600/20 text-green-400 border-green-600/30"
      case "draft":
        return "bg-yellow-600/20 text-yellow-400 border-yellow-600/30"
      case "cancelled":
        return "bg-red-600/20 text-red-400 border-red-600/30"
      case "completed":
        return "bg-gray-600/20 text-gray-400 border-gray-600/30"
      default:
        return "bg-white/10 text-white/80 border-white/20"
    }
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case "platinum":
        return "bg-gray-300/20 text-gray-300 border-gray-300/30"
      case "gold":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
      case "silver":
        return "bg-gray-400/20 text-gray-400 border-gray-400/30"
      case "bronze":
        return "bg-orange-600/20 text-orange-400 border-orange-600/30"
      default:
        return "bg-white/10 text-white/80 border-white/20"
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <p className="text-white/70 font-light">Loading event management...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageUpload(file, "event")
        }}
      />
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageUpload(file, "sponsor")
        }}
      />

      {/* Upload Message */}
      {uploadMessage && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm ${
            uploadMessage.type === "success"
              ? "bg-green-600/20 text-green-400 border-green-600/30"
              : "bg-red-600/20 text-red-400 border-red-600/30"
          }`}
        >
          {uploadMessage.type === "success" ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-light">{uploadMessage.text}</span>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
          <TabsTrigger value="events" className="data-[state=active]:bg-accent data-[state=active]:text-black">
            Events ({events.length})
          </TabsTrigger>
          <TabsTrigger value="sponsors" className="data-[state=active]:bg-accent data-[state=active]:text-black">
            Sponsors ({sponsors.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          {/* Events Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-2xl font-thin text-white">Event Management</h3>
              <p className="text-white/60 font-light">Create and manage workshops, competitions, and seminars</p>
            </div>
            <Button onClick={handleCreateEvent} className="bg-accent hover:bg-accent/90 text-black font-medium">
              <Plus className="h-5 w-5 mr-2" />
              Create Event
            </Button>
          </div>

          {/* Event Editor */}
          {editingEvent && (
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white font-light">
                    {isCreatingEvent ? "Create New Event" : "Edit Event"}
                  </CardTitle>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSaveEvent}
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-black font-medium"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingEvent(null)
                        setIsCreatingEvent(false)
                      }}
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent font-light"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label className="text-white font-light">Event Title</Label>
                    <Input
                      value={editingEvent.title}
                      onChange={(e) => updateEditingEvent({ title: e.target.value })}
                      className="bg-white/5 border-white/20 text-white font-light"
                      placeholder="Enter event title"
                    />
                  </div>

                  <div>
                    <Label className="text-white font-light">Category</Label>
                    <Select
                      value={editingEvent.category}
                      onValueChange={(value) => updateEditingEvent({ category: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white font-light">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/20">
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white font-light">Difficulty</Label>
                    <Select
                      value={editingEvent.difficulty}
                      onValueChange={(value) => updateEditingEvent({ difficulty: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white font-light">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/20">
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white font-light">Date</Label>
                    <Input
                      type="date"
                      value={editingEvent.date}
                      onChange={(e) => updateEditingEvent({ date: e.target.value })}
                      className="bg-white/5 border-white/20 text-white font-light"
                    />
                  </div>

                  <div>
                    <Label className="text-white font-light">Time</Label>
                    <Input
                      type="time"
                      value={editingEvent.time}
                      onChange={(e) => updateEditingEvent({ time: e.target.value })}
                      className="bg-white/5 border-white/20 text-white font-light"
                    />
                  </div>

                  <div>
                    <Label className="text-white font-light">Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={editingEvent.duration}
                      onChange={(e) => updateEditingEvent({ duration: Number.parseInt(e.target.value) })}
                      className="bg-white/5 border-white/20 text-white font-light"
                    />
                  </div>

                  <div>
                    <Label className="text-white font-light">Price ($)</Label>
                    <Input
                      type="number"
                      value={editingEvent.price}
                      onChange={(e) => updateEditingEvent({ price: Number.parseInt(e.target.value) })}
                      className="bg-white/5 border-white/20 text-white font-light"
                    />
                  </div>

                  <div>
                    <Label className="text-white font-light">Max Participants</Label>
                    <Input
                      type="number"
                      value={editingEvent.maxParticipants}
                      onChange={(e) => updateEditingEvent({ maxParticipants: Number.parseInt(e.target.value) })}
                      className="bg-white/5 border-white/20 text-white font-light"
                    />
                  </div>

                  <div>
                    <Label className="text-white font-light">Instructor</Label>
                    <Input
                      value={editingEvent.instructor}
                      onChange={(e) => updateEditingEvent({ instructor: e.target.value })}
                      className="bg-white/5 border-white/20 text-white font-light"
                      placeholder="Instructor name"
                    />
                  </div>

                  <div>
                    <Label className="text-white font-light">Location</Label>
                    <Input
                      value={editingEvent.location}
                      onChange={(e) => updateEditingEvent({ location: e.target.value })}
                      className="bg-white/5 border-white/20 text-white font-light"
                      placeholder="Event location"
                    />
                  </div>

                  <div>
                    <Label className="text-white font-light">Registration Deadline</Label>
                    <Input
                      type="date"
                      value={editingEvent.registrationDeadline}
                      onChange={(e) => updateEditingEvent({ registrationDeadline: e.target.value })}
                      className="bg-white/5 border-white/20 text-white font-light"
                    />
                  </div>

                  <div>
                    <Label className="text-white font-light">Status</Label>
                    <Select
                      value={editingEvent.status}
                      onValueChange={(value) => updateEditingEvent({ status: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white font-light">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/20">
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Descriptions */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-white font-light">Short Description</Label>
                    <Textarea
                      value={editingEvent.description}
                      onChange={(e) => updateEditingEvent({ description: e.target.value })}
                      className="bg-white/5 border-white/20 text-white font-light"
                      rows={3}
                      placeholder="Brief description for event cards"
                    />
                  </div>

                  <div>
                    <Label className="text-white font-light">Full Description</Label>
                    <Textarea
                      value={editingEvent.fullDescription}
                      onChange={(e) => updateEditingEvent({ fullDescription: e.target.value })}
                      className="bg-white/5 border-white/20 text-white font-light"
                      rows={5}
                      placeholder="Detailed description for event page"
                    />
                  </div>
                </div>

                {/* Sponsor Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={editingEvent.isSponsored}
                      onCheckedChange={(checked) => updateEditingEvent({ isSponsored: checked })}
                    />
                    <Label className="text-white font-light">This event is sponsored</Label>
                  </div>

                  {editingEvent.isSponsored && (
                    <div>
                      <Label className="text-white font-light">Select Sponsor</Label>
                      <Select
                        value={editingEvent.sponsor?.id || ""}
                        onValueChange={(value) => {
                          const selectedSponsor = sponsors.find((s) => s.id === value)
                          updateEditingEvent({ sponsor: selectedSponsor })
                        }}
                      >
                        <SelectTrigger className="bg-white/5 border-white/20 text-white font-light">
                          <SelectValue placeholder="Choose a sponsor" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/20">
                          {sponsors
                            .filter((s) => s.isActive)
                            .map((sponsor) => (
                              <SelectItem key={sponsor.id} value={sponsor.id}>
                                <div className="flex items-center gap-3">
                                  <Badge className={`${getTierColor(sponsor.tier)} text-xs`}>{sponsor.tier}</Badge>
                                  {sponsor.name}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {/* Event Settings */}
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={editingEvent.featured}
                      onCheckedChange={(checked) => updateEditingEvent({ featured: checked })}
                    />
                    <Label className="text-white font-light">Featured Event</Label>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label className="text-white font-light">Tags (comma separated)</Label>
                  <Input
                    value={editingEvent.tags.join(", ")}
                    onChange={(e) =>
                      updateEditingEvent({
                        tags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter(Boolean),
                      })
                    }
                    className="bg-white/5 border-white/20 text-white font-light"
                    placeholder="e.g., HYROX, Competition, Strategy"
                  />
                </div>

                {/* Requirements and What to Bring */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white font-light">Requirements (one per line)</Label>
                    <Textarea
                      value={editingEvent.requirements.join("\n")}
                      onChange={(e) => updateEditingEvent({ requirements: e.target.value.split("\n").filter(Boolean) })}
                      className="bg-white/5 border-white/20 text-white font-light"
                      rows={4}
                      placeholder="List event requirements"
                    />
                  </div>

                  <div>
                    <Label className="text-white font-light">What to Bring (one per line)</Label>
                    <Textarea
                      value={editingEvent.whatToBring.join("\n")}
                      onChange={(e) => updateEditingEvent({ whatToBring: e.target.value.split("\n").filter(Boolean) })}
                      className="bg-white/5 border-white/20 text-white font-light"
                      rows={4}
                      placeholder="List what participants should bring"
                    />
                  </div>
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <Label className="text-white font-light">Event Image</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      value={editingEvent.image}
                      onChange={(e) => updateEditingEvent({ image: e.target.value })}
                      className="bg-white/5 border-white/20 text-white font-light flex-1"
                      placeholder="Image URL or upload an image"
                    />
                    <Button
                      onClick={() => triggerImageUpload("event")}
                      variant="outline"
                      className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {uploadingImage ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                  {editingEvent.image && (
                    <div className="w-48 h-32 bg-white/5 rounded-lg overflow-hidden border border-white/10">
                      <Image
                        src={editingEvent.image || "/placeholder.svg"}
                        alt="Event preview"
                        width={192}
                        height={128}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Events List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="glass border-white/10 group hover:border-white/20 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg font-light mb-2">{event.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className={`${getCategoryColor(event.category)} text-xs font-light`}>
                          {event.category}
                        </Badge>
                        <Badge className={`${getStatusColor(event.status)} text-xs font-light`}>{event.status}</Badge>
                        {event.featured && (
                          <Badge className="bg-accent text-black text-xs font-medium">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {event.isSponsored && event.sponsor && (
                          <Badge className={`${getTierColor(event.sponsor.tier)} text-xs font-light`}>
                            <Building2 className="h-3 w-3 mr-1" />
                            {event.sponsor.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditEvent(event)}
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDeleteEvent(event.id)} size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-white/60 text-sm font-light line-clamp-2">{event.description}</p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-white/70">
                        <Calendar className="h-4 w-4 text-accent" />
                        <span className="font-light">{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <Clock className="h-4 w-4 text-accent" />
                        <span className="font-light">{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <Users className="h-4 w-4 text-accent" />
                        <span className="font-light">
                          {event.currentParticipants}/{event.maxParticipants}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <DollarSign className="h-4 w-4 text-accent" />
                        <span className="font-light">${event.price}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm font-light">{event.instructor}</span>
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            handleToggleEventStatus(event.id, event.status === "published" ? "draft" : "published")
                          }
                          size="sm"
                          variant="ghost"
                          className="text-white/60 hover:text-white hover:bg-white/5"
                        >
                          {event.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 font-light">No events created yet</p>
              <Button onClick={handleCreateEvent} className="mt-4 bg-accent hover:bg-accent/90 text-black font-medium">
                Create Your First Event
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="sponsors" className="space-y-6">
          {/* Sponsors Header */}
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display text-2xl font-thin text-white">Sponsor Management</h3>
              <p className="text-white/60 font-light">Manage event sponsors and partnerships</p>
            </div>
            <Button onClick={handleCreateSponsor} className="bg-accent hover:bg-accent/90 text-black font-medium">
              <Plus className="h-5 w-5 mr-2" />
              Add Sponsor
            </Button>
          </div>

          {/* Sponsor Editor */}
          {editingSponsor && (
            <Card className="glass border-white/10">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white font-light">
                    {isCreatingSponsor ? "Add New Sponsor" : "Edit Sponsor"}
                  </CardTitle>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSaveSponsor}
                      size="sm"
                      className="bg-accent hover:bg-accent/90 text-black font-medium"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        setEditingSponsor(null)
                        setIsCreatingSponsor(false)
                      }}
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent font-light"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white font-light">Sponsor Name</Label>
                    <Input
                      value={editingSponsor.name}
                      onChange={(e) => updateEditingSponsor({ name: e.target.value })}
                      className="bg-white/5 border-white/20 text-white font-light"
                      placeholder="Enter sponsor name"
                    />
                  </div>

                  <div>
                    <Label className="text-white font-light">Website</Label>
                    <Input
                      value={editingSponsor.website}
                      onChange={(e) => updateEditingSponsor({ website: e.target.value })}
                      className="bg-white/5 border-white/20 text-white font-light"
                      placeholder="https://sponsor-website.com"
                    />
                  </div>

                  <div>
                    <Label className="text-white font-light">Sponsorship Tier</Label>
                    <Select
                      value={editingSponsor.tier}
                      onValueChange={(value) => updateEditingSponsor({ tier: value })}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white font-light">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-black border-white/20">
                        <SelectItem value="platinum">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-gray-300" />
                            Platinum
                          </div>
                        </SelectItem>
                        <SelectItem value="gold">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-yellow-500" />
                            Gold
                          </div>
                        </SelectItem>
                        <SelectItem value="silver">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-gray-400" />
                            Silver
                          </div>
                        </SelectItem>
                        <SelectItem value="bronze">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-orange-400" />
                            Bronze
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={editingSponsor.isActive}
                      onCheckedChange={(checked) => updateEditingSponsor({ isActive: checked })}
                    />
                    <Label className="text-white font-light">Active Sponsor</Label>
                  </div>
                </div>

                <div>
                  <Label className="text-white font-light">Logo</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      value={editingSponsor.logo}
                      onChange={(e) => updateEditingSponsor({ logo: e.target.value })}
                      className="bg-white/5 border-white/20 text-white font-light flex-1"
                      placeholder="Logo image URL or upload an image"
                    />
                    <Button
                      onClick={() => triggerImageUpload("sponsor")}
                      variant="outline"
                      className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent"
                      disabled={uploadingImage}
                    >
                      {uploadingImage ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white/80 rounded-full animate-spin mr-2" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      {uploadingImage ? "Uploading..." : "Upload"}
                    </Button>
                  </div>
                  {editingSponsor.logo && (
                    <div className="mt-4 w-48 h-24 bg-white/5 rounded-lg overflow-hidden border border-white/10">
                      <Image
                        src={editingSponsor.logo || "/placeholder.svg"}
                        alt="Sponsor logo preview"
                        width={192}
                        height={96}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sponsors List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsors.map((sponsor) => (
              <Card
                key={sponsor.id}
                className="glass border-white/10 group hover:border-white/20 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 overflow-hidden">
                          {sponsor.logo ? (
                            <Image
                              src={sponsor.logo || "/placeholder.svg"}
                              alt={sponsor.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <Building2 className="h-6 w-6 text-white/40" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-white text-lg font-light">{sponsor.name}</CardTitle>
                          <Badge className={`${getTierColor(sponsor.tier)} text-xs font-light mt-1`}>
                            <Award className="h-3 w-3 mr-1" />
                            {sponsor.tier}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEditSponsor(sponsor)}
                        size="sm"
                        variant="outline"
                        className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button onClick={() => handleDeleteSponsor(sponsor.id)} size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <span className="font-light">Website:</span>
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent/80 font-light"
                      >
                        {sponsor.website.replace("https://", "").replace("http://", "")}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white/70 font-light">Status:</span>
                      <Badge
                        className={
                          sponsor.isActive
                            ? "bg-green-600/20 text-green-400 border-green-600/30"
                            : "bg-red-600/20 text-red-400 border-red-600/30"
                        }
                      >
                        {sponsor.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="text-sm text-white/60 font-light">
                      Events using this sponsor: {events.filter((e) => e.sponsor?.id === sponsor.id).length}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {sponsors.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/60 font-light">No sponsors added yet</p>
              <Button
                onClick={handleCreateSponsor}
                className="mt-4 bg-accent hover:bg-accent/90 text-black font-medium"
              >
                Add Your First Sponsor
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
