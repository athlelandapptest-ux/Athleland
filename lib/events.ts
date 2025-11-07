// lib/events.ts
// Supabase-backed Events (works in App/Pages routers; no 'server-only' at module top)

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/* ---------------------------- Helpers / Clients ---------------------------- */

type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

function must(v: string | undefined, name: string) {
  if (!v) throw new Error(`${name} is required.`)
  return v
}

/** Public (browser-safe) client — uses NEXT_PUBLIC_* only */
function getPublic(): SupabaseClient {
  const url = must(process.env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL")
  const anon = must(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, "NEXT_PUBLIC_SUPABASE_ANON_KEY")
  return createClient(url, anon)
}

/**
 * Admin (server-only) client.
 * - Guarded so it throws if called in the browser.
 * - Reads env via indexed access so the secret is NOT inlined in client bundles.
 */
function getAdmin(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("Admin Supabase client is server-only. Call this from server actions / route handlers.")
  }
  const env: any = (process as any)?.env ?? {}
  const url = must(env.NEXT_PUBLIC_SUPABASE_URL, "NEXT_PUBLIC_SUPABASE_URL")
  const serviceKey = must(env.SUPABASE_SERVICE_ROLE_KEY, "SUPABASE_SERVICE_ROLE_KEY")
  return createClient(url, serviceKey, { auth: { persistSession: false } })
}

/* --------------------------------- API ------------------------------------ */

export async function testNeonConnection() {
  // Try RPC 'now' (if exists); else ping a trivial select
  try {
    const supabase = getPublic()
    const { error } = await supabase.rpc("now" as any)
    if (error) {
      const ping = await supabase.from("events").select("id").limit(1)
      if (ping.error) return { success: false, message: "Supabase connection failed: " + ping.error.message }
    }
    return { success: true, message: "Supabase connection verified" }
  } catch (e: any) {
    return { success: false, message: e?.message || "Supabase connection failed" }
  }
}

/** CREATE (Admin) */
export async function createEventNeon(eventData: any) {
  try {
    const supabase = getAdmin()

    const eventId = `event-${Date.now()}`
    const payload = {
      id: eventId,
      title: eventData?.title || eventData?.name,
      description: eventData?.description ?? null,
      date: eventData?.date, // ISO date (YYYY-MM-DD) or timestamp
      time_text: eventData?.time ?? null,
      duration: eventData?.duration ?? null,
      location: eventData?.location ?? null,
      max_participants: eventData?.maxParticipants ?? 0,
      current_participants: eventData?.currentParticipants ?? 0,
      price: eventData?.price ?? 0,
      member_discount: eventData?.memberDiscount ?? 0,
      registration_deadline: eventData?.registrationDeadline ?? null,
      status: eventData?.status ?? "draft",
      allow_waitlist: eventData?.allowWaitlist ?? true,
      image_url: eventData?.imageUrl ?? null,
      cancellation_policy:
        (eventData?.cancellationPolicy as Json) ?? {
          fullRefundHours: 48,
          partialRefundHours: 24,
          partialRefundPercentage: 50,
        },
    }

    const { data, error } = await supabase.from("events").insert(payload).select("*").single()
    if (error) throw error

    return {
      success: true,
      data: {
        id: data.id,
        title: data.title,
        description: data.description,
        date: data.date,
        time: data.time_text,
        duration: data.duration,
        location: data.location,
        maxParticipants: data.max_participants,
        currentParticipants: data.current_participants,
        price: Number(data.price || 0),
        memberDiscount: Number(data.member_discount || 0),
        registrationDeadline: data.registration_deadline,
        status: data.status,
        allowWaitlist: data.allow_waitlist,
        imageUrl: data.image_url,
        cancellationPolicy: data.cancellation_policy,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      message: "Event created successfully (Supabase)",
    }
  } catch (error: any) {
    console.error("Error creating event (Supabase):", error)
    return { success: false, message: error?.message || "Failed to create event" }
  }
}

/** READ ALL (Admin list or general) */
export async function fetchAllEventsNeon() {
  try {
    // ok to use admin (server) or public (browser) for reads; prefer public to be safe everywhere
    const supabase = getPublic()
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .order("time_text", { ascending: true })
    if (error) throw error

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      date: row.date,
      time: row.time_text,
      duration: row.duration,
      location: row.location,
      maxParticipants: row.max_participants,
      currentParticipants: row.current_participants,
      price: Number(row.price || 0),
      memberDiscount: Number(row.member_discount || 0),
      registrationDeadline: row.registration_deadline,
      status: row.status,
      allowWaitlist: row.allow_waitlist,
      imageUrl: row.image_url,
      cancellationPolicy: row.cancellation_policy,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    console.error("Error fetching events (Supabase):", error)
    return []
  }
}

/** REGISTER (uses public for reads + admin for insert) */
export async function registerForEventNeon(reg: {
  eventId: string
  participantName: string
  participantEmail: string
  participantPhone?: string
  emergencyContact?: string
  emergencyPhone?: string
  dietaryRestrictions?: string
  medicalConditions?: string
}) {
  try {
    const pub = getPublic()

    // 1) Event must be published
    const { data: events, error: e1 } = await pub
      .from("events")
      .select("*")
      .eq("id", reg.eventId)
      .eq("status", "published")
      .limit(1)
    if (e1) throw e1
    if (!events?.length) return { success: false, message: "Event not found or not available for registration" }

    const event = events[0]

    // 2) Deadline
    if (event.registration_deadline && new Date() > new Date(event.registration_deadline)) {
      return { success: false, message: "Registration deadline has passed" }
    }

    const admin = getAdmin()

    // 3) Already registered?
    const { data: existing, error: e2 } = await admin
      .from("event_registrations")
      .select("id")
      .eq("event_id", reg.eventId)
      .eq("participant_email", reg.participantEmail)
      .limit(1)
    if (e2) throw e2
    if (existing?.length) return { success: false, message: "You are already registered for this event" }

    // 4) Capacity check
    const { count, error: e3 } = await admin
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", reg.eventId)
      .in("status", ["confirmed", "pending"])
    if (e3) throw e3

    const current = count ?? 0
    const isFull = current >= (event.max_participants || 0)
    const status: "pending" | "waitlisted" | "cancelled" =
      isFull ? (event.allow_waitlist ? "waitlisted" : "cancelled") : "pending"

    if (isFull && !event.allow_waitlist) {
      return { success: false, message: "Event is full and waitlist is not available" }
    }

    // 5) Create registration
    const registrationId = `reg-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const { data: regRow, error: e4 } = await admin
      .from("event_registrations")
      .insert({
        id: registrationId,
        event_id: reg.eventId,
        participant_name: reg.participantName,
        participant_email: reg.participantEmail,
        participant_phone: reg.participantPhone ?? null,
        emergency_contact: reg.emergencyContact ?? null,
        emergency_phone: reg.emergencyPhone ?? null,
        dietary_restrictions: reg.dietaryRestrictions ?? null,
        medical_conditions: reg.medicalConditions ?? null,
        status,
      })
      .select("*")
      .single()
    if (e4) throw e4

    // 6) Increment participants only if taking a slot
    if (status === "pending") {
      try {
        const { error: rpcErr } = await admin.rpc("increment_event_participants", { p_event_id: reg.eventId })
        if (rpcErr) throw rpcErr
      } catch {
        await admin
          .from("events")
          .update({ current_participants: (event.current_participants || 0) + 1 })
          .eq("id", reg.eventId)
      }
    }

    const message =
      status === "waitlisted"
        ? "You've been added to the waitlist. We'll notify you if a spot opens up."
        : "Registration successful! Check your email for confirmation."

    return {
      success: true,
      data: {
        id: regRow.id,
        eventId: regRow.event_id,
        participantName: regRow.participant_name,
        participantEmail: regRow.participant_email,
        participantPhone: regRow.participant_phone,
        emergencyContact: regRow.emergency_contact,
        emergencyPhone: regRow.emergency_phone,
        dietaryRestrictions: regRow.dietary_restrictions,
        medicalConditions: regRow.medical_conditions,
        status: regRow.status,
        paymentStatus: regRow.payment_status,
        registrationDate: regRow.registration_date,
      },
      message,
    }
  } catch (error: any) {
    // If this was accidentally invoked from the browser, you'll see the guard message here.
    console.error("Error registering (Supabase):", error)
    return { success: false, message: error?.message || "Registration failed. Please try again." }
  }
}

/** ADMIN: update/delete helpers */
export async function updateEventNeon(id: string, patch: any) {
  try {
    const supabase = getAdmin()
    const map: Record<string, string> = {
      time: "time_text",
      imageUrl: "image_url",
      memberDiscount: "member_discount",
      registrationDeadline: "registration_deadline",
      maxParticipants: "max_participants",
      currentParticipants: "current_participants",
      allowWaitlist: "allow_waitlist",
      cancellationPolicy: "cancellation_policy",
    }
    const dbPatch: Record<string, any> = {}
    Object.keys(patch).forEach((k) => (dbPatch[map[k] || k] = patch[k]))
    const { error } = await supabase.from("events").update(dbPatch).eq("id", id)
    if (error) throw error
    return { success: true }
  } catch (e: any) {
    console.error("Error updating event (Supabase):", e)
    return { success: false, message: e?.message || "Failed to update event" }
  }
}

export async function deleteEventNeon(id: string) {
  try {
    const supabase = getAdmin()
    await supabase.from("event_registrations").delete().eq("event_id", id)
    const { error } = await supabase.from("events").delete().eq("id", id)
    if (error) throw error
    return { success: true }
  } catch (e: any) {
    console.error("Error deleting event (Supabase):", e)
    return { success: false, message: e?.message || "Failed to delete event" }
  }
}
