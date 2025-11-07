"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, DollarSign, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SiteHeader } from "@/components/site-header"
import { Footer } from "@/components/footer"

// client-only modal to avoid SSR issues
const EventRegistrationModal = dynamic(
  () =>
    import("@/components/event-registration-modal").then((m) => m.EventRegistrationModal || m.default),
  { ssr: false, loading: () => null }
)

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [filteredEvents, setFilteredEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)

  // Currency formatter (PKR)
  const fmtPKR = useMemo(
    () => new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", maximumFractionDigits: 0 }),
    []
  )

  // Load events
  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch("/api/events", { cache: "no-store" })
        if (!res.ok) throw new Error(`Events API ${res.status}`)
        const json = await safeJson(res)
        const raw = Array.isArray(json?.data) ? json.data : []
        const normalized = raw.map(normalizeEvent)
        setEvents(normalized)
        setFilteredEvents(normalized)
      } catch (err) {
        console.warn("Error loading events:", err)
        setEvents([])
        setFilteredEvents([])
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Client-side filtering
  useEffect(() => {
    let filtered = [...events]

    if (searchTerm) {
      const q = searchTerm.toLowerCase()
      filtered = filtered.filter((e) => {
        const title = (e?.title || "").toLowerCase()
        const desc = (e?.description || "").toLowerCase()
        const loc = (e?.location || "").toLowerCase()
        return title.includes(q) || desc.includes(q) || loc.includes(q)
      })
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((e) => (e?.status || "").toLowerCase() === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((e) => (e?.type || "").toLowerCase() === typeFilter)
    }

    setFilteredEvents(filtered)
  }, [events, searchTerm, statusFilter, typeFilter])

  const handleRegisterClick = (event) => {
    setSelectedEvent(event)
    setIsRegistrationModalOpen(true)
  }

  const handleRegistrationSuccess = async () => {
    try {
      const res = await fetch("/api/events", { cache: "no-store" })
      if (!res.ok) throw new Error(`Events API ${res.status}`)
      const json = await safeJson(res)
      const raw = Array.isArray(json?.data) ? json.data : []
      const normalized = raw.map(normalizeEvent)
      setEvents(normalized)
    } catch (err) {
      console.warn("Error reloading events:", err)
    }
  }

  const getEventStatusBadge = (event) => {
    const isEventFull = (event?.currentParticipants ?? 0) >= (event?.maxParticipants ?? 0)
    const isPastDeadline = safeIsPast(event?.registrationDeadline)

    if ((event?.status || "").toLowerCase() === "draft") {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-none">Draft</Badge>
    }
    if ((event?.status || "").toLowerCase() === "cancelled") {
      return <Badge className="bg-red-500/20 text-red-400 border-none">Cancelled</Badge>
    }
    if (isPastDeadline) {
      return <Badge className="bg-gray-500/20 text-gray-400 border-none">Registration Closed</Badge>
    }
    if (isEventFull && !event?.allowWaitlist) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-none">Full</Badge>
    }
    if (isEventFull && event?.allowWaitlist) {
      return <Badge className="bg-blue-500/20 text-blue-400 border-none">Waitlist Available</Badge>
    }
    return <Badge className="bg-green-500/20 text-green-400 border-none">Open</Badge>
  }

  const canRegister = (event) => {
    const isPastDeadline = safeIsPast(event?.registrationDeadline)
    const isEventFull = (event?.currentParticipants ?? 0) >= (event?.maxParticipants ?? 0)
    return (event?.status || "").toLowerCase() === "published" && !isPastDeadline && (!isEventFull || !!event?.allowWaitlist)
  }

  const getRegistrationButtonText = (event) => {
    const isEventFull = (event?.currentParticipants ?? 0) >= (event?.maxParticipants ?? 0)
    if (isEventFull && event?.allowWaitlist) return "Join Waitlist"
    return "Register Now"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <SiteHeader />
        <div className="container mx-auto px-6 py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-white/60 font-light">Loading events...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />

      {/* Hero */}
      <section className="py-20 bg-gradient-to-b from-black to-black/50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 text-white/40 text-sm font-light tracking-wider uppercase mb-6">
              <div className="w-8 h-px bg-accent" />
              Events & Competitions
              <div className="w-8 h-px bg-accent" />
            </div>
            <h1 className="font-display text-5xl lg:text-6xl font-thin text-white mb-6">Upcoming Events</h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
              Join our community events, competitions, and special training sessions.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-12 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
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

            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v)}>
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
              <div className="mt-6">
                <Link href="/" className="text-accent underline underline-offset-4">
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => (
                <Card
                  key={event?.id || `${event?.title}-${index}`}
                  className="glass border-white/10 hover:border-white/20 transition-all duration-500 animate-fade-in"
                  style={{ animationDelay: `${0.06 * index}s` }}
                >
                  {event?.imageUrl ? (
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      <Image
                        src={event.imageUrl}
                        alt={event?.title || "Event image"}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 hover:scale-110"
                      />
                      <div className="absolute top-4 right-4">{getEventStatusBadge(event)}</div>
                    </div>
                  ) : (
                    <div className="relative h-2" />
                  )}

                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="font-display text-xl font-thin text-white mb-2">
                          {event?.title || "Untitled Event"}
                        </CardTitle>
                        <CardDescription className="text-white/60 font-light line-clamp-3">
                          {event?.description || "—"}
                        </CardDescription>
                      </div>
                      {!event?.imageUrl && <div className="flex-shrink-0">{getEventStatusBadge(event)}</div>}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Event Details */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <Detail icon={<Calendar className="h-4 w-4 text-accent" />}>{safeDate(event?.date)}</Detail>
                      <Detail icon={<Clock className="h-4 w-4 text-accent" />}>{event?.time || "—"}</Detail>
                      <Detail icon={<MapPin className="h-4 w-4 text-accent" />}>
                        <span className="truncate">{event?.location || "—"}</span>
                      </Detail>
                      <Detail icon={<Users className="h-4 w-4 text-accent" />}>
                        {(event?.currentParticipants ?? 0)}/{event?.maxParticipants ?? 0}
                      </Detail>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-accent" />
                        <span className="text-white font-medium">
                          {fmtPKR.format(Math.max(0, Number(event?.price ?? 0)))}
                        </span>
                        {!!event?.memberDiscount && event.memberDiscount > 0 && (
                          <Badge className="bg-accent/20 text-accent text-xs border-none">
                            {event.memberDiscount}% member discount
                          </Badge>
                        )}
                      </div>

                      <Badge variant="outline" className="border-white/20 text-white/70 text-xs capitalize">
                        {event?.type || "other"}
                      </Badge>
                    </div>

                    {/* Registration Deadline */}
                    <div className="text-xs text-white/50">
                      Registration closes: {safeDate(event?.registrationDeadline)}
                    </div>

                    {/* Sponsor */}
                    {event?.sponsor?.name ? (
                      <div className="flex items-center gap-2 text-xs text-white/50">
                        <span>Sponsored by {event.sponsor.name}</span>
                      </div>
                    ) : null}

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
                          {event?.status === "cancelled"
                            ? "Event Cancelled"
                            : safeIsPast(event?.registrationDeadline)
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

      <Footer />

      <div className="bg-black text-center py-6 border-t border-white/5">
        <p className="text-white/30 text-sm font-light">©2025 ATHLELAND. All Rights Reserved</p>
      </div>
    </div>
  )
}

/* ------------------------------- Helpers ------------------------------- */

async function safeJson(res) {
  try {
    return await res.json()
  } catch {
    return null
  }
}

function safeDate(d) {
  const dt = d ? new Date(d) : null
  return dt && !Number.isNaN(dt.valueOf()) ? dt.toLocaleDateString() : "—"
}

function safeIsPast(d) {
  const dt = d ? new Date(d) : null
  if (!dt || Number.isNaN(dt.valueOf())) return false
  return new Date() > dt
}

function Detail({ icon, children }) {
  return (
    <div className="flex items-center gap-2 text-white/70">
      {icon}
      <span>{children}</span>
    </div>
  )
}

/* ------------------------------- Normalizer ------------------------------- */

function normalizeEvent(e) {
  return {
    id: e?.id || e?.event_id || cryptoRandomId(),
    title: e?.title || "",
    description: e?.description || e?.full_description || "",
    date: e?.date || e?.event_date || null,
    time: e?.time || e?.event_time || null,
    location: e?.location || "",
    price: Number(e?.price ?? 0),
    imageUrl: e?.imageUrl || e?.image || e?.cover_image || "",
    type: (e?.type || e?.category || "other").toLowerCase(),
    status: (e?.status || "draft").toLowerCase(),
    currentParticipants: e?.currentParticipants ?? e?.current_participants ?? 0,
    maxParticipants: e?.maxParticipants ?? e?.max_participants ?? 0,
    registrationDeadline: e?.registrationDeadline ?? e?.registration_deadline ?? e?.date ?? null,
    allowWaitlist: !!(e?.allowWaitlist ?? e?.allow_waitlist ?? false),
    memberDiscount: Number(e?.memberDiscount ?? e?.member_discount ?? 0),
    sponsor:
      e?.sponsor ||
      (e?.sponsors && typeof e.sponsors === "object" ? { name: e.sponsors.name } : null),
    isPublic: e?.isPublic ?? e?.is_public ?? true,
    isCancelled: !!(e?.isCancelled ?? e?.is_cancelled ?? false),
  }
}

function cryptoRandomId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return `id_${Math.random().toString(36).slice(2)}`
}
