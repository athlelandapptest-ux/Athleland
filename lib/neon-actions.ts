import { getNeonSql, isNeonAvailable } from "./database"
import type { Event, EventRegistration } from "@/lib/events"
import type { SponsorshipRequest } from "@/lib/sponsorship"
import type { TrainingProgram } from "@/lib/workouts"
import type { ActionResult } from "@/app/actions"

export async function testNeonConnection() {
  if (!isNeonAvailable()) {
    return {
      success: false,
      message: "DATABASE_URL not configured - Neon database features disabled",
    }
  }

  const sql = getNeonSql()
  if (!sql) {
    return {
      success: false,
      message: "Neon connection not available",
    }
  }

  try {
    const result = await sql`SELECT NOW() as current_time, 'Neon connection successful' as message`
    return {
      success: true,
      data: {
        timestamp: result[0].current_time,
        message: result[0].message,
      },
      message: "Neon database connection verified",
    }
  } catch (error) {
    console.error("Neon connection failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Neon connection failed",
    }
  }
}

export async function createEventNeon(
  eventData: Omit<Event, "id" | "createdAt" | "updatedAt">,
): Promise<ActionResult<Event>> {
  const sql = getNeonSql()
  if (!sql) {
    return {
      success: false,
      message: "Neon database not configured - please set DATABASE_URL",
    }
  }

  try {
    const eventId = `event-${Date.now()}`

    const result = await sql`
      INSERT INTO events (
        id, name, description, date, time, duration, location, 
        max_participants, current_participants, price, member_discount,
        registration_deadline, status, allow_waitlist, image_url, cancellation_policy
      ) VALUES (
        ${eventId}, ${eventData.name}, ${eventData.description}, ${eventData.date}, 
        ${eventData.time}, ${eventData.duration}, ${eventData.location},
        ${eventData.maxParticipants}, ${eventData.currentParticipants || 0}, 
        ${eventData.price}, ${eventData.memberDiscount || 0},
        ${eventData.registrationDeadline}, ${eventData.status}, 
        ${eventData.allowWaitlist ?? true}, ${eventData.imageUrl || null},
        ${JSON.stringify(
          eventData.cancellationPolicy || {
            fullRefundHours: 48,
            partialRefundHours: 24,
            partialRefundPercentage: 50,
          },
        )}
      )
      RETURNING *
    `

    const newEvent = result[0] as any
    return {
      success: true,
      data: {
        id: newEvent.id,
        name: newEvent.name,
        description: newEvent.description,
        date: newEvent.date,
        time: newEvent.time,
        duration: newEvent.duration,
        location: newEvent.location,
        maxParticipants: newEvent.max_participants,
        currentParticipants: newEvent.current_participants,
        price: Number.parseFloat(newEvent.price),
        memberDiscount: Number.parseFloat(newEvent.member_discount),
        registrationDeadline: newEvent.registration_deadline,
        status: newEvent.status,
        allowWaitlist: newEvent.allow_waitlist,
        imageUrl: newEvent.image_url,
        cancellationPolicy: newEvent.cancellation_policy,
        createdAt: newEvent.created_at,
        updatedAt: newEvent.updated_at,
      },
      message: "Event created successfully in Neon database",
    }
  } catch (error) {
    console.error("Error creating event in Neon:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create event in Neon",
    }
  }
}

export async function fetchAllEventsNeon(): Promise<Event[]> {
  const sql = getNeonSql()
  if (!sql) {
    console.warn("Neon database not available - falling back to in-memory storage")
    return []
  }

  try {
    const result = await sql`
      SELECT * FROM events 
      ORDER BY date ASC, time ASC
    `

    return result.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      date: row.date,
      time: row.time,
      duration: row.duration,
      location: row.location,
      maxParticipants: row.max_participants,
      currentParticipants: row.current_participants,
      price: Number.parseFloat(row.price),
      memberDiscount: Number.parseFloat(row.member_discount),
      registrationDeadline: row.registration_deadline,
      status: row.status,
      allowWaitlist: row.allow_waitlist,
      imageUrl: row.image_url,
      cancellationPolicy: row.cancellation_policy,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  } catch (error) {
    console.error("Error fetching events from Neon:", error)
    return []
  }
}

export async function registerForEventNeon(
  registrationData: Omit<EventRegistration, "id" | "registrationDate">,
): Promise<ActionResult<EventRegistration>> {
  const sql = getNeonSql()
  if (!sql) {
    return {
      success: false,
      message: "Neon database not configured - please set DATABASE_URL",
    }
  }

  try {
    // Check if event exists and is published
    const eventResult = await sql`
      SELECT * FROM events WHERE id = ${registrationData.eventId} AND status = 'published'
    `

    if (eventResult.length === 0) {
      return { success: false, message: "Event not found or not available for registration" }
    }

    const event = eventResult[0]

    // Check registration deadline
    const now = new Date()
    const deadline = new Date(event.registration_deadline)
    if (now > deadline) {
      return { success: false, message: "Registration deadline has passed" }
    }

    // Check if user is already registered
    const existingResult = await sql`
      SELECT id FROM event_registrations 
      WHERE event_id = ${registrationData.eventId} AND participant_email = ${registrationData.participantEmail}
    `

    if (existingResult.length > 0) {
      return { success: false, message: "You are already registered for this event" }
    }

    // Check capacity
    const capacityResult = await sql`
      SELECT COUNT(*) as count FROM event_registrations 
      WHERE event_id = ${registrationData.eventId} AND status IN ('confirmed', 'pending')
    `

    const currentRegistrations = Number.parseInt(capacityResult[0].count)
    const isEventFull = currentRegistrations >= event.max_participants
    const status = isEventFull && event.allow_waitlist ? "waitlisted" : isEventFull ? "cancelled" : "pending"

    if (isEventFull && !event.allow_waitlist) {
      return { success: false, message: "Event is full and waitlist is not available" }
    }

    // Create registration
    const registrationId = `reg-${Date.now()}-${Math.random().toString(36).substring(2)}`

    const result = await sql`
      INSERT INTO event_registrations (
        id, event_id, participant_name, participant_email, participant_phone,
        emergency_contact, emergency_phone, dietary_restrictions, medical_conditions, status
      ) VALUES (
        ${registrationId}, ${registrationData.eventId}, ${registrationData.participantName},
        ${registrationData.participantEmail}, ${registrationData.participantPhone || null},
        ${registrationData.emergencyContact || null}, ${registrationData.emergencyPhone || null},
        ${registrationData.dietaryRestrictions || null}, ${registrationData.medicalConditions || null}, ${status}
      )
      RETURNING *
    `

    // Update event participant count if confirmed
    if (status === "pending" || status === "confirmed") {
      await sql`
        UPDATE events 
        SET current_participants = current_participants + 1 
        WHERE id = ${registrationData.eventId}
      `
    }

    const newRegistration = result[0] as any
    const message =
      status === "waitlisted"
        ? "You've been added to the waitlist. We'll notify you if a spot opens up."
        : "Registration successful! Check your email for confirmation details."

    return {
      success: true,
      data: {
        id: newRegistration.id,
        eventId: newRegistration.event_id,
        participantName: newRegistration.participant_name,
        participantEmail: newRegistration.participant_email,
        participantPhone: newRegistration.participant_phone,
        emergencyContact: newRegistration.emergency_contact,
        emergencyPhone: newRegistration.emergency_phone,
        dietaryRestrictions: newRegistration.dietary_restrictions,
        medicalConditions: newRegistration.medical_conditions,
        status: newRegistration.status,
        paymentStatus: newRegistration.payment_status,
        registrationDate: newRegistration.registration_date,
      },
      message,
    }
  } catch (error) {
    console.error("Error registering for event in Neon:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Registration failed. Please try again.",
    }
  }
}

export async function submitSponsorshipRequestNeon(formData: FormData): Promise<ActionResult<SponsorshipRequest>> {
  const sql = getNeonSql()
  if (!sql) {
    return {
      success: false,
      message: "Neon database not configured - please set DATABASE_URL",
    }
  }

  try {
    const contactName = formData.get("contactName") as string
    const email = formData.get("email") as string
    const company = formData.get("company") as string
    const phone = formData.get("phone") as string
    const packageType = formData.get("packageType") as string
    const industry = formData.get("industry") as string
    const message = formData.get("message") as string
    const newsletter = formData.get("newsletter") === "on"

    if (!contactName || !email || !company || !packageType) {
      return { success: false, message: "Missing required fields" }
    }

    const requestId = `sponsor-req-${Date.now()}`

    const result = await sql`
      INSERT INTO sponsorship_inquiries (
        id, contact_name, email, company, phone, package_type, 
        industry, message, newsletter, status
      ) VALUES (
        ${requestId}, ${contactName}, ${email}, ${company}, ${phone || null},
        ${packageType}, ${industry || null}, ${message || null}, ${newsletter}, 'pending'
      )
      RETURNING *
    `

    const newRequest = result[0] as any

    return {
      success: true,
      data: {
        id: newRequest.id,
        contactName: newRequest.contact_name,
        email: newRequest.email,
        company: newRequest.company,
        phone: newRequest.phone,
        packageType: newRequest.package_type,
        industry: newRequest.industry,
        message: newRequest.message,
        newsletter: newRequest.newsletter,
        submittedAt: newRequest.submitted_at,
        status: newRequest.status,
      },
      message: "Sponsorship request submitted successfully to Neon database!",
    }
  } catch (error) {
    console.error("Error submitting sponsorship request to Neon:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit sponsorship request to Neon",
    }
  }
}

export async function getCurrentProgramNeon(): Promise<TrainingProgram | null> {
  const sql = getNeonSql()
  if (!sql) {
    console.warn("Neon database not available - falling back to in-memory storage")
    return null
  }

  try {
    const result = await sql`
      SELECT * FROM programs WHERE is_active = true LIMIT 1
    `

    if (result.length === 0) {
      return null
    }

    const program = result[0] as any

    return {
      id: program.id,
      name: program.name,
      subtitle: program.subtitle,
      startDate: program.start_date,
      currentWeek: program.current_week,
      totalWeeks: program.total_weeks,
      isActive: program.is_active,
      phases: program.phases || [],
      updatedAt: program.updated_at,
    }
  } catch (error) {
    console.error("Error fetching current program from Neon:", error)
    return null
  }
}

export async function createProgramNeon(programData: {
  name: string
  subtitle: string
  startDate: string
  phases: Array<{ name: string; weeks: number; focus: string }>
}): Promise<ActionResult<TrainingProgram>> {
  const sql = getNeonSql()
  if (!sql) {
    return {
      success: false,
      message: "Neon database not configured - please set DATABASE_URL",
    }
  }

  try {
    // Calculate total weeks from phases
    const totalWeeks = programData.phases.reduce((total, phase) => total + phase.weeks, 0)

    // Deactivate all existing programs
    await sql`UPDATE programs SET is_active = false WHERE is_active = true`

    // Create new program
    const programId = `program-${Date.now()}`

    // Calculate phases with start/end weeks and status
    let currentWeekCounter = 1
    const phasesWithDetails = programData.phases.map((phase, index) => {
      const startWeek = currentWeekCounter
      const endWeek = currentWeekCounter + phase.weeks - 1
      currentWeekCounter += phase.weeks

      return {
        id: `phase-${Date.now()}-${index}`,
        name: phase.name,
        weeks: phase.weeks,
        focus: phase.focus,
        order: index + 1,
        startWeek,
        endWeek,
        status: index === 0 ? "current" : "upcoming",
      }
    })

    const result = await sql`
      INSERT INTO programs (
        id, name, subtitle, start_date, current_week, total_weeks, 
        is_active, phases, created_at, updated_at
      ) VALUES (
        ${programId}, ${programData.name}, ${programData.subtitle}, ${programData.startDate},
        1, ${totalWeeks}, true, ${JSON.stringify(phasesWithDetails)}, NOW(), NOW()
      )
      RETURNING *
    `

    const newProgram = result[0] as any
    return {
      success: true,
      data: {
        id: newProgram.id,
        name: newProgram.name,
        subtitle: newProgram.subtitle,
        startDate: newProgram.start_date,
        currentWeek: newProgram.current_week,
        totalWeeks: newProgram.total_weeks,
        isActive: newProgram.is_active,
        phases: newProgram.phases || [],
        updatedAt: newProgram.updated_at,
      },
      message: "Program created successfully and is now active!",
    }
  } catch (error) {
    console.error("Error creating program in Neon:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create program in Neon",
    }
  }
}
