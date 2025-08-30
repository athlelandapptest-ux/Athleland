"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, DollarSign, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { fetchAllEvents } from "@/app/actions"
import { EventRegistrationModal } from "@/components/event-registration-modal"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"
import { Event } from "@/lib/events"

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const eventsData = await fetchAllEvents()
        setEvents(eventsData)
        setFilteredEvents(eventsData)
      } catch (error) {
        console.error("Error loading events:", error)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  useEffect(() => {
    let filtered = events

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter)
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((event) => event.type === typeFilter)
    }

    setFilteredEvents(filtered)
  }, [events, searchTerm, statusFilter, typeFilter])

  const handleRegisterClick = (event) => {
    setSelectedEvent(event)
    setIsRegistrationModalOpen(true)
  }

  const handleRegistrationSuccess = () => {
    // Refresh events data to update participant counts
    const loadEvents = async () => {
      try {
        const eventsData = await fetchAllEvents()
        setEvents(eventsData)
      } catch (error) {
        console.error("Error reloading events:", error)
      }
    }
    loadEvents()
  }

  const getEventStatusBadge = (event) => {
    const isEventFull = event.currentParticipants >= event.maxParticipants
    const isPastDeadline = new Date() > new Date(event.registrationDeadline)

    if (event.status === "draft") {
      return (
        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400">
          Draft
        </Badge>
      )
    }
    if (event.status === "cancelled") {
      return (
        <Badge variant="destructive" className="bg-red-500/20 text-red-400">
          Cancelled
        </Badge>
      )
    }
    if (isPastDeadline) {
      return (
        <Badge variant="secondary" className="bg-gray-500/20 text-gray-400">
          Registration Closed
        </Badge>
      )
    }
    if (isEventFull && !event.allowWaitlist) {
      return (
        <Badge variant="secondary" className="bg-orange-500/20 text-orange-400">
          Full
        </Badge>
      )
    }
    if (isEventFull && event.allowWaitlist) {
      return (
        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
          Waitlist Available
        </Badge>
      )
    }
    return <Badge className="bg-green-500/20 text-green-400">Open</Badge>
  }

  const canRegister = (event) => {
    const isPastDeadline = new Date() > new Date(event.registrationDeadline)
    const isEventFull = event.currentParticipants >= event.maxParticipants

    return event.status === "published" && !isPastDeadline && (!isEventFull || (isEventFull && event.allowWaitlist))
  }

  const getRegistrationButtonText = (event) => {
    const isEventFull = event.currentParticipants >= event.maxParticipants

    if (isEventFull && event.allowWaitlist) {
      return "Join Waitlist"
    }
    return "Register Now"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <SiteHeader />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-white/60 font-light">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-black to-black/50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 text-white/40 text-sm font-light tracking-wider uppercase mb-6">
              <div className="w-8 h-px bg-accent"></div>
              Events & Competitions
              <div className="w-8 h-px bg-accent"></div>
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-thin text-white mb-6">Upcoming Events</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
              Join our community events, competitions, and special training sessions
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/10">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full lg:w-48 bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-black border-white/10">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="competition">Competition</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="training">Training</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-6 lg:px-12">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <p className="text-white/60 text-lg font-light">
                {events.length === 0 ? "No events available at the moment." : "No events match your filters."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <Card
                  key={event.id}
                  className="glass border-white/10 hover:border-white/20 transition-all duration-500 animate-fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  {event.imageUrl && (
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <Image
                        src={event.imageUrl || "/placeholder.svg"}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-110"
                      />
                      <div className="absolute top-4 right-4">{getEventStatusBadge(event)}</div>
                    </div>
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="font-display text-xl font-thin text-white mb-2">{event.title}</CardTitle>
                        <CardDescription className="text-white/60 font-light">{event.description}</CardDescription>
                      </div>
                      {!event.imageUrl && <div className="flex-shrink-0">{getEventStatusBadge(event)}</div>}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Event Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-white/70">
                        <Calendar className="h-4 w-4 text-accent" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <Clock className="h-4 w-4 text-accent" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <MapPin className="h-4 w-4 text-accent" />
                        <span className="truncate">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <Users className="h-4 w-4 text-accent" />
                        <span>
                          {event.currentParticipants}/{event.maxParticipants}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-accent" />
                        <span className="text-white font-medium">${event.price}</span>
                        {event.memberDiscount && event.memberDiscount > 0 && (
                          <Badge className="bg-accent/20 text-accent text-xs">
                            {event.memberDiscount}% member discount
                          </Badge>
                        )}
                      </div>

                      <Badge variant="outline" className="border-white/20 text-white/70 text-xs">
                        {event.type}
                      </Badge>
                    </div>

                    {/* Registration Deadline */}
                    <div className="text-xs text-white/50">
                      Registration closes: {new Date(event.registrationDeadline).toLocaleDateString()}
                    </div>

                    {/* Sponsor */}
                    {event.sponsor && (
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <span>Sponsored by {event.sponsor.name}</span>
                      </div>
                    )}

                    {/* Action Button */}
                    <div className="pt-4">
                      {canRegister(event) ? (
                        <Button
                          onClick={() => handleRegisterClick(event)}
                          className="w-full bg-accent hover:bg-accent/90 text-black font-medium"
                        >
                          {getRegistrationButtonText(event)}
                        </Button>
                      ) : (
                        <Button disabled className="w-full bg-white/10 text-white/40 cursor-not-allowed">
                          {event.status === "cancelled"
                            ? "Event Cancelled"
                            : new Date() > new Date(event.registrationDeadline)
                              ? "Registration Closed"
                              : "Event Full"}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Registration Modal */}
      <EventRegistrationModal
        event={selectedEvent}
        isOpen={isRegistrationModalOpen}
        onClose={() => {
          setIsRegistrationModalOpen(false)
          setSelectedEvent(null)
        }}
        onSuccess={handleRegistrationSuccess}
      />

      {/* Footer */}
      <Footer />

      {/* Footer Copyright */}
      <div className="bg-black text-center py-6 border-t border-white/5">
        <p className="text-white/30 text-sm font-light">@2025 ATHLETELAND. All Rights Reserved</p>
      </div>
    </div>
  )
}
