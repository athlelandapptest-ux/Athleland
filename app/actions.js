"use server"

import { put } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { Event, EventRegistration, EventSponsor } from "@/lib/events"
import { inMemoryEvents, inMemoryRegistrations, inMemorySponsors } from "@/lib/events"
import {
  WorkoutClass,
  TrainingProgram,
  WorkoutRoutine,
  ProgramPhase,
  inMemoryRoutines,
  inMemoryClasses,
  inMemoryPrograms,
  adjustRoutineForIntensity,
  getPrimaryClassFocus,
  getIntensityLabel,
} from "@/lib/workouts"
import { SponsorshipRequest, SponsorshipPackage } from "@/lib/sponsorship"
import { getNeonSql } from "@/lib/database"

// Import Neon functions for gradual migration
import {
  createEventNeon,
  fetchAllEventsNeon,
  registerForEventNeon,
  submitSponsorshipRequestNeon,
  getCurrentProgramNeon,
  createProgramNeon,
  testNeonConnection,
  createWorkoutTemplateNeon,
  fetchAllWorkoutTemplatesNeon,
  updateWorkoutTemplateNeon,
  deleteWorkoutTemplateNeon,
} from "@/lib/neon-actions"

// Action result type


// Feature flag to enable Neon gradually
const USE_NEON_FOR_EVENTS = process.env.USE_NEON_FOR_EVENTS === "true"
const USE_NEON_FOR_REGISTRATIONS = process.env.USE_NEON_FOR_REGISTRATIONS === "true"
const USE_NEON_FOR_SPONSORSHIP = process.env.USE_NEON_FOR_SPONSORSHIP === "true"
const USE_NEON_FOR_PROGRAMS = process.env.USE_NEON_FOR_PROGRAMS === "true"
const USE_NEON_FOR_TEMPLATES = process.env.USE_NEON_FOR_TEMPLATES === "true"

// Test Neon connection function
export async function testDatabaseConnection() {
  try {
    // Test basic connection
    const connectionResult = await testNeonConnection()

    if (!connectionResult.success) {
      return connectionResult
    }

    // Test feature flags
    const featureFlags = {
      events: USE_NEON_FOR_EVENTS,
      registrations: USE_NEON_FOR_REGISTRATIONS,
      sponsorship: USE_NEON_FOR_SPONSORSHIP,
      programs: USE_NEON_FOR_PROGRAMS,
      templates: USE_NEON_FOR_TEMPLATES,
    }

    return {
      success: true,
      data: {
        ...connectionResult.data,
        featureFlags,
      },
      message: "Database connection and feature flags verified successfully",
    }
  } catch (error) {
    console.error("Database test error:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Database test failed",
    }
  }
}

// Event management actions with Neon migration
export async function createEvent(eventData) {
  if (USE_NEON_FOR_EVENTS) {
    return await createEventNeon(eventData)
  }

  // Fallback to existing in-memory implementation
  try {
    const newEvent = {
      ...eventData,
      id: `event-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      allowWaitlist: eventData.allowWaitlist ?? true,
      memberDiscount: eventData.memberDiscount ?? 0,
      cancellationPolicy: eventData.cancellationPolicy ?? {
        fullRefundHours: 48,
        partialRefundHours: 24,
        partialRefundPercentage: 50,
      },
    }

    inMemoryEvents.push(newEvent)
    revalidatePath("/admin")
    revalidatePath("/events")

    return { success: true, data: newEvent }
  } catch (error) {
    console.error("Error creating event:", error)
    return { success: false, message: "Failed to create event" }
  }
}

export async function updateEvent(eventId, eventData) {
  try {
    const eventIndex = inMemoryEvents.findIndex((event) => event.id === eventId)
    if (eventIndex === -1) {
      return { success: false, message: "Event not found" }
    }

    if (eventData.cancellationPolicy) {
      eventData.cancellationPolicy = {
        fullRefundHours: eventData.cancellationPolicy.fullRefundHours ?? 48,
        partialRefundHours: eventData.cancellationPolicy.partialRefundHours ?? 24,
        partialRefundPercentage: eventData.cancellationPolicy.partialRefundPercentage ?? 50,
      }
    }

    inMemoryEvents[eventIndex] = {
      ...inMemoryEvents[eventIndex],
      ...eventData,
      updatedAt: new Date().toISOString(),
    }

    revalidatePath("/admin")
    revalidatePath("/events")

    return { success: true, data: inMemoryEvents[eventIndex] }
  } catch (error) {
    console.error("Error updating event:", error)
    return { success: false, message: "Failed to update event" }
  }
}

export async function deleteEvent(eventId) {
  try {
    const hasRegistrations = inMemoryRegistrations.some((reg) => reg.eventId === eventId)
    if (hasRegistrations) {
      return { success: false, message: "Cannot delete event with existing registrations" }
    }

    const eventIndex = inMemoryEvents.findIndex((event) => event.id === eventId)
    if (eventIndex === -1) {
      return { success: false, message: "Event not found" }
    }

    inMemoryEvents.splice(eventIndex, 1)
    revalidatePath("/admin")
    revalidatePath("/events")

    return { success: true, message: "Event deleted successfully" }
  } catch (error) {
    console.error("Error deleting event:", error)
    return { success: false, message: "Failed to delete event" }
  }
}

export async function toggleEventStatus(eventId, status) {
  try {
    const eventIndex = inMemoryEvents.findIndex((event) => event.id === eventId)
    if (eventIndex === -1) {
      return { success: false, message: "Event not found" }
    }

    inMemoryEvents[eventIndex] = {
      ...inMemoryEvents[eventIndex],
      status,
      updatedAt: new Date().toISOString(),
    }

    revalidatePath("/admin")
    revalidatePath("/events")

    return { success: true, message: `Event status updated to ${status}` }
  } catch (error) {
    console.error("Error updating event status:", error)
    return { success: false, message: "Failed to update event status" }
  }
}

export async function fetchAllEvents() {
  if (USE_NEON_FOR_EVENTS) {
    return await fetchAllEventsNeon()
  }

  // Fallback to existing in-memory implementation
  try {
    return inMemoryEvents.map((event) => ({
      ...event,
      allowWaitlist: event.allowWaitlist ?? true,
      memberDiscount: event.memberDiscount ?? 0,
      cancellationPolicy: event.cancellationPolicy ?? {
        fullRefundHours: 48,
        partialRefundHours: 24,
        partialRefundPercentage: 50,
      },
    }))
  } catch (error) {
    console.error("Error fetching events:", error)
    return []
  }
}

export async function fetchEventById(eventId) {
  try {
    const event = inMemoryEvents.find((event) => event.id === eventId)
    if (!event) return null

    return {
      ...event,
      allowWaitlist: event.allowWaitlist ?? true,
      memberDiscount: event.memberDiscount ?? 0,
      cancellationPolicy: event.cancellationPolicy ?? {
        fullRefundHours: 48,
        partialRefundHours: 24,
        partialRefundPercentage: 50,
      },
    }
  } catch (error) {
    console.error("Error fetching event:", error)
    return null
  }
}

// Registration management actions
export async function registerForEvent(
  registrationData,
) {
  if (USE_NEON_FOR_REGISTRATIONS) {
    return await registerForEventNeon(registrationData)
  }

  // Fallback to existing in-memory implementation
  try {
    const event = inMemoryEvents.find((e) => e.id === registrationData.eventId)
    if (!event) {
      return { success: false, message: "Event not found" }
    }

    if (event.status !== "published") {
      return { success: false, message: "Event is not available for registration" }
    }

    const now = new Date()
    const deadline = new Date(event.registrationDeadline)
    if (now > deadline) {
      return { success: false, message: "Registration deadline has passed" }
    }

    const existingRegistration = inMemoryRegistrations.find(
      (r) => r.eventId === registrationData.eventId && r.participantEmail === registrationData.participantEmail,
    )

    if (existingRegistration) {
      return { success: false, message: "You are already registered for this event" }
    }

    const currentRegistrations = inMemoryRegistrations.filter(
      (r) => r.eventId === registrationData.eventId && (r.status === "confirmed" || r.status === "pending"),
    ).length

    const isEventFull = currentRegistrations >= event.maxParticipants
    const status = isEventFull && event.allowWaitlist ? "waitlisted" : isEventFull ? "cancelled" : "pending"

    if (isEventFull && !event.allowWaitlist) {
      return { success: false, message: "Event is full and waitlist is not available" }
    }

    const newRegistration = {
      id: `reg-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      registrationDate: new Date().toISOString(),
      status,
      ...registrationData,
    }

    inMemoryRegistrations.push(newRegistration)

    if (status === "pending" || status === "confirmed") {
      const eventIndex = inMemoryEvents.findIndex((e) => e.id === registrationData.eventId)
      if (eventIndex !== -1) {
        inMemoryEvents[eventIndex].currentParticipants += 1
      }
    }

    revalidatePath("/events")
    revalidatePath("/admin")

    const message =
      status === "waitlisted"
        ? "You've been added to the waitlist. We'll notify you if a spot opens up."
        : "Registration successful! Check your email for confirmation details."

    return {
      success: true,
      data: newRegistration,
      message,
    }
  } catch (error) {
    console.error("Error registering for event:", error)
    return { success: false, message: "Registration failed. Please try again." }
  }
}

export async function cancelEventRegistration(registrationId) {
  try {
    const registrationIndex = inMemoryRegistrations.findIndex((r) => r.id === registrationId)
    if (registrationIndex === -1) {
      return { success: false, message: "Registration not found" }
    }

    const registration = inMemoryRegistrations[registrationIndex]
    const event = inMemoryEvents.find((e) => e.id === registration.eventId)

    if (!event) {
      return { success: false, message: "Event not found" }
    }

    const eventDate = new Date(`${event.date}T${event.time}`)
    const now = new Date()
    const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    const policy = event.cancellationPolicy || {
      fullRefundHours: 48,
      partialRefundHours: 24,
      partialRefundPercentage: 50,
    }

    let refundPercentage = 0
    if (hoursUntilEvent >= policy.fullRefundHours) {
      refundPercentage = 100
    } else if (hoursUntilEvent >= policy.partialRefundHours) {
      refundPercentage = policy.partialRefundPercentage
    }

    inMemoryRegistrations[registrationIndex].status = "cancelled"
    inMemoryRegistrations[registrationIndex].paymentStatus = refundPercentage > 0 ? "refunded" : "paid"

    const eventIndex = inMemoryEvents.findIndex((e) => e.id === registration.eventId)
    if (eventIndex !== -1 && registration.status !== "waitlisted") {
      inMemoryEvents[eventIndex].currentParticipants = Math.max(0, inMemoryEvents[eventIndex].currentParticipants - 1)
    }

    const waitlistedRegistrations = inMemoryRegistrations
      .filter((r) => r.eventId === registration.eventId && r.status === "waitlisted")
      .sort((a, b) => new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime())

    if (waitlistedRegistrations.length > 0 && registration.status !== "waitlisted") {
      const nextRegistration = waitlistedRegistrations[0]
      const nextIndex = inMemoryRegistrations.findIndex((r) => r.id === nextRegistration.id)
      if (nextIndex !== -1) {
        inMemoryRegistrations[nextIndex].status = "pending"
        inMemoryEvents[eventIndex].currentParticipants += 1
      }
    }

    revalidatePath("/events")
    revalidatePath("/admin")

    const refundMessage =
      refundPercentage === 100
        ? "Full refund will be processed."
        : refundPercentage > 0
          ? `${refundPercentage}% refund will be processed.`
          : "No refund available due to cancellation policy."

    return {
      success: true,
      message: `Registration cancelled successfully. ${refundMessage}`,
    }
  } catch (error) {
    console.error("Error cancelling registration:", error)
    return { success: false, message: "Failed to cancel registration" }
  }
}

export async function getEventRegistrations(eventId) {
  return inMemoryRegistrations.filter((r) => r.eventId === eventId)
}

export async function getAllRegistrations() {
  return [...inMemoryRegistrations]
}

export async function updateRegistrationStatus(
  registrationId ,
  status,
) {
  try {
    const registrationIndex = inMemoryRegistrations.findIndex((r) => r.id === registrationId)
    if (registrationIndex === -1) {
      return { success: false, message: "Registration not found" }
    }

    const oldStatus = inMemoryRegistrations[registrationIndex].status
    inMemoryRegistrations[registrationIndex].status = status

    const registration = inMemoryRegistrations[registrationIndex]
    const eventIndex = inMemoryEvents.findIndex((e) => e.id === registration.eventId)

    if (eventIndex !== -1) {
      if ((oldStatus === "confirmed" || oldStatus === "pending") && status !== "confirmed" && status !== "pending") {
        inMemoryEvents[eventIndex].currentParticipants = Math.max(0, inMemoryEvents[eventIndex].currentParticipants - 1)
      } else if (
        oldStatus !== "confirmed" &&
        oldStatus !== "pending" &&
        (status === "confirmed" || status === "pending")
      ) {
        inMemoryEvents[eventIndex].currentParticipants += 1
      }
    }

    revalidatePath("/events")
    revalidatePath("/admin")

    return { success: true, message: "Registration status updated successfully" }
  } catch (error) {
    console.error("Error updating registration status:", error)
    return { success: false, message: "Failed to update registration status" }
  }
}

// Image upload actions
export async function uploadEventImage(formData) {
  try {
    const file = formData.get("file")

    if (!file) {
      return { success: false, message: "No file provided" }
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, message: "File must be an image" }
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, message: "File size must be less than 5MB" }
    }

    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const filename = `events/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`

    const blob = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return { success: true, data: blob.url, message: "Image uploaded successfully" }
  } catch (error) {
    console.error("Error uploading event image:", error)
    return { success: false, message: "Failed to upload image" }
  }
}

export async function uploadSponsorLogo(formData) {
  try {
    const file = formData.get("file")

    if (!file) {
      return { success: false, message: "No file provided" }
    }

    if (!file.type.startsWith("image/")) {
      return { success: false, message: "File must be an image" }
    }

    if (file.size > 2 * 1024 * 1024) {
      return { success: false, message: "Logo size must be less than 2MB" }
    }

    const timestamp = Date.now()
    const extension = file.name.split(".").pop()
    const filename = `sponsors/${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`

    const blob = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    return { success: true, data: blob.url, message: "Logo uploaded successfully" }
  } catch (error) {
    console.error("Error uploading sponsor logo:", error)
    return { success: false, message: "Failed to upload logo" }
  }
}

// Sponsor management actions
export async function fetchAllSponsors() {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return [...inMemorySponsors]
}

export async function createSponsor(sponsorData) {
  try {
    const newSponsor = {
      ...sponsorData,
      id: `sponsor-${Date.now()}`,
    }

    inMemorySponsors.push(newSponsor)

    revalidatePath("/admin")
    return { success: true, data: newSponsor, message: "Sponsor created successfully!" }
  } catch (error) {
    console.error("Error creating sponsor:", error)
    return { success: false, message: "Failed to create sponsor" }
  }
}

export async function updateSponsor(id, updates) {
  try {
    const sponsorIndex = inMemorySponsors.findIndex((sponsor) => sponsor.id === id)
    if (sponsorIndex === -1) {
      return { success: false, message: "Sponsor not found" }
    }

    const updatedSponsor = {
      ...inMemorySponsors[sponsorIndex],
      ...updates,
    }

    inMemorySponsors[sponsorIndex] = updatedSponsor

    revalidatePath("/admin")
    return { success: true, data: updatedSponsor, message: "Sponsor updated successfully!" }
  } catch (error) {
    console.error("Error updating sponsor:", error)
    return { success: false, message: "Failed to update sponsor" }
  }
}

export async function deleteSponsor(id) {
  try {
    const sponsorIndex = inMemorySponsors.findIndex((sponsor) => sponsor.id === id)
    if (sponsorIndex === -1) {
      return { success: false, message: "Sponsor not found" }
    }

    const eventsUsingSponsor = inMemoryEvents.filter((event) => event.sponsor?.id === id)
    if (eventsUsingSponsor.length > 0) {
      return {
        success: false,
        message: `Cannot delete sponsor. It is being used by ${eventsUsingSponsor.length} event(s).`,
      }
    }

    inMemorySponsors.splice(sponsorIndex, 1)

    revalidatePath("/admin")
    return { success: true, message: "Sponsor deleted successfully!" }
  } catch (error) {
    console.error("Error deleting sponsor:", error)
    return { success: false, message: "Failed to delete sponsor" }
  }
}

// Routine management actions
export async function createWorkoutRoutine(formData) {
  try {
    const title = formData.get("title")
    const description = formData.get("description")
    const roundsData = formData.get("roundsData")
    const hyroxReasoning = formData.get("hyroxReasoning")
    const otherHyroxPrepNotes = formData.get("otherHyroxPrepNotes")

    if (!title || !description || !roundsData) {
      return { success: false, message: "Missing required fields" }
    }

    const rounds = JSON.parse(roundsData)

    const hyroxPrepTypes = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("hyroxPrepTypes-") && value === "on") {
        const type = key.replace("hyroxPrepTypes-", "")
        hyroxPrepTypes.push(type)
      }
    }

    const key = `routine-${Date.now()}`

    const newRoutine = {
      key,
      title,
      description,
      rounds,
      hyroxPrepTypes,
      hyroxReasoning,
      otherHyroxPrepNotes,
    }

    inMemoryRoutines.push(newRoutine)

    revalidatePath("/admin")
    return { success: true, message: "Routine created successfully!" }
  } catch (error) {
    console.error("Error creating routine:", error)
    return { success: false, message: "Failed to create routine" }
  }
}

export async function getAllRoutineKeys() {
  return inMemoryRoutines.map((routine) => ({
    key: routine.key,
    title: routine.title,
  }))
}

export async function getRoutineByKey(key) {
  return inMemoryRoutines.find((routine) => routine.key === key) || null
}

// Class management actions
export async function generateClassPreview(
  templateKeys,
  date,
  time,
  intensity,
  duration = 60,
  numberOfBlocks = 1,
  maxParticipants = 20,
  instructor = "",
  editingClassId,
) {
  try {
    const existingClasses = await fetchAllClassesAdmin()

    let nextClassNumber = 0
    if (existingClasses.length > 0) {
      const maxClassNumber = Math.max(...existingClasses.map((cls) => cls.classNumber || 0))
      nextClassNumber = editingClassId
        ? existingClasses.find((cls) => cls.id === editingClassId)?.classNumber || 0
        : maxClassNumber + 1
    }

    // Get workout templates instead of routines
    const templates = []
    for (const templateId of templateKeys) {
      const template = await getWorkoutTemplateById(templateId)
      if (template) {
        templates.push(template)
      }
    }

    if (templates.length === 0) {
      return { success: false, message: "No valid workout templates found" }
    }

    const primaryTemplate = templates[0]
    const className = primaryTemplate.title
    const classDescription = primaryTemplate.description || `High-intensity workout session`

    // Convert template rounds to workout breakdown format
    const workoutBreakdown = []
    
    try {
      const rounds = typeof primaryTemplate.rounds === 'string' 
        ? JSON.parse(primaryTemplate.rounds) 
        : primaryTemplate.rounds
      
      if (Array.isArray(rounds)) {
        rounds.forEach((round, index) => {
          if (round.exercises && Array.isArray(round.exercises)) {
            workoutBreakdown.push({
              title: `Round ${index + 1}`,
              exercises: round.exercises.map(exercise => ({
                name: exercise.name,
                reps: exercise.reps,
                duration: exercise.duration,
                distance: exercise.distance,
                weight: exercise.weight,
                unit: exercise.type === 'reps' ? 'reps' : 
                      exercise.type === 'time' ? 'seconds' :
                      exercise.type === 'distance' ? (exercise.unit || 'meters') :
                      'reps'
              }))
            })
          }
        })
      }
    } catch (parseError) {
      console.error("Error parsing template rounds:", parseError)
      // Fallback workout breakdown
      workoutBreakdown.push({
        title: "Main Workout",
        exercises: [
          { name: "Full Body Circuit", duration: duration - 10, unit: "minutes" }
        ]
      })
    }

    const classPreview = {
      id: editingClassId || `class-${Date.now()}`,
      classNumber: nextClassNumber,
      title: className,
      description: classDescription,
      date,
      time,
      duration,
      intensity: intensity,
      numericalIntensity: intensity,
      numberOfBlocks,
      maxParticipants,
      instructor,
      routine: {
        title: primaryTemplate.title,
        description: primaryTemplate.description,
        key: primaryTemplate.id
      },
      workoutBreakdown,
      status: editingClassId ? "approved" : "draft", // Keep existing classes approved, new ones start as draft
    }

    return { success: true, data: classPreview }
  } catch (error) {
    console.error("Error generating class preview:", error)
    return { success: false, message: "Failed to generate class preview" }
  }
}

export async function saveApprovedClass(classData) {
  try {
    const useNeon = process.env.USE_NEON_FOR_CLASSES === 'true'
    
    const approvedClass = {
      ...classData,
      status: "approved",
      intensity: classData.intensity,
      numericalIntensity: classData.intensity,
    }

    if (useNeon) {
      const sql = getNeonSql()
      
      // Check if class already exists (for updates)
      const existingClass = await sql`
        SELECT id FROM classes WHERE id = ${classData.id}
      `
      
      if (existingClass.length > 0) {
        // Update existing class
        await sql`
          UPDATE classes SET 
            title = ${approvedClass.title},
            description = ${approvedClass.description || ''},
            routine = ${JSON.stringify(approvedClass.routine)}::jsonb,
            instructor = ${approvedClass.instructor},
            date = ${approvedClass.date},
            time = ${approvedClass.time},
            duration = ${approvedClass.duration || 60},
            intensity = ${approvedClass.intensity || 8},
            status = ${approvedClass.status},
            maxParticipants = ${approvedClass.maxParticipants || 20},
            workoutBreakdown = ${JSON.stringify(approvedClass.workoutBreakdown || [])}::jsonb,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ${classData.id}
        `
      } else {
        // Insert new class
        await sql`
          INSERT INTO classes (
            id, title, description, routine, instructor, date, time, 
            duration, intensity, status, maxParticipants, workoutBreakdown
          ) VALUES (
            ${approvedClass.id},
            ${approvedClass.title},
            ${approvedClass.description || ''},
            ${JSON.stringify(approvedClass.routine)}::jsonb,
            ${approvedClass.instructor},
            ${approvedClass.date},
            ${approvedClass.time},
            ${approvedClass.duration || 60},
            ${approvedClass.intensity || 8},
            ${approvedClass.status},
            ${approvedClass.maxParticipants || 20},
            ${JSON.stringify(approvedClass.workoutBreakdown || [])}::jsonb
          )
        `
      }
      
      console.log("[Neon] Class saved successfully to database:", approvedClass.id)
    } else {
      // Fallback to in-memory storage
      const existingIndex = inMemoryClasses.findIndex((cls) => cls.id === classData.id)

      if (existingIndex >= 0) {
        inMemoryClasses[existingIndex] = approvedClass
      } else {
        inMemoryClasses.push(approvedClass)
      }

      console.log("[Memory] Class saved successfully. Total inMemoryClasses:", inMemoryClasses.length)
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("adminDataUpdated", {
          detail: { type: "class", action: "save", data: approvedClass },
        }),
      )
    }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true, message: "Class approved and saved successfully!" }
  } catch (error) {
    console.error("Error saving class:", error)
    return { success: false, message: "Failed to save class" }
  }
}

export async function deleteClassById(id) {
  try {
    const useNeon = process.env.USE_NEON_FOR_CLASSES === 'true'
    
    if (useNeon) {
      const sql = getNeonSql()
      
      const result = await sql`
        DELETE FROM classes WHERE id = ${id}
      `
      
      if (result.count === 0) {
        return { success: false, message: "Class not found" }
      }
      
      console.log("[Neon] Class deleted successfully from database:", id)
    } else {
      // Fallback to in-memory storage
      const index = inMemoryClasses.findIndex((cls) => cls.id === id)
      if (index === -1) {
        return { success: false, message: "Class not found" }
      }

      inMemoryClasses.splice(index, 1)
      console.log("[Memory] Class deleted successfully from memory:", id)
    }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true, message: "Class deleted successfully!" }
  } catch (error) {
    console.error("Error deleting class:", error)
    return { success: false, message: "Failed to delete class" }
  }
}

export async function fetchAllClassesAdmin() {
  try {
    const useNeon = process.env.USE_NEON_FOR_CLASSES === 'true'
    
    if (useNeon) {
      const sql = getNeonSql()
      
      const classes = await sql`
        SELECT 
          id, title, description, routine, instructor, date, time,
          duration, intensity, status, maxParticipants, workoutBreakdown,
          created_at, updated_at
        FROM classes 
        ORDER BY date ASC, time ASC
      `
      
      const formattedClasses = classes.map(cls => ({
        ...cls,
        routine: typeof cls.routine === 'string' ? JSON.parse(cls.routine) : cls.routine,
        workoutBreakdown: typeof cls.workoutBreakdown === 'string' ? JSON.parse(cls.workoutBreakdown) : cls.workoutBreakdown,
        numericalIntensity: cls.intensity
      }))
      
      console.log("[Neon] Fetched classes from database:", formattedClasses.length)
      return formattedClasses
    } else {
      // Fallback to in-memory storage
      console.log("[Memory] Fetched classes from memory:", inMemoryClasses.length)
      return [...inMemoryClasses]
    }
  } catch (error) {
    console.error("Error fetching classes:", error)
    return []
  }
}

export async function updateClass(classId, updates) {
  try {
    const useNeon = process.env.USE_NEON_FOR_CLASSES === 'true'
    
    if (useNeon) {
      const sql = getNeonSql()
      
      const updatedClass = {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      
      await sql`
        UPDATE classes SET 
          title = ${updatedClass.title},
          description = ${updatedClass.description || ''},
          routine = ${JSON.stringify(updatedClass.routine)}::jsonb,
          instructor = ${updatedClass.instructor},
          date = ${updatedClass.date},
          time = ${updatedClass.time},
          duration = ${updatedClass.duration || 60},
          intensity = ${updatedClass.intensity || 8},
          status = ${updatedClass.status || 'approved'},
          maxParticipants = ${updatedClass.maxParticipants || 20},
          workoutBreakdown = ${JSON.stringify(updatedClass.workoutBreakdown || [])}::jsonb,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${classId}
      `
      
      console.log("[Neon] Class updated successfully in database:", classId)
      return { success: true, data: updatedClass, message: "Class updated successfully!" }
    } else {
      // Fallback to in-memory storage
      const classIndex = inMemoryClasses.findIndex((cls) => cls.id === classId)
      if (classIndex === -1) {
        return { success: false, message: "Class not found" }
      }

      const updatedClass = {
        ...inMemoryClasses[classIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      inMemoryClasses[classIndex] = updatedClass
      console.log("[Memory] Class updated successfully in memory:", classId)
      return { success: true, data: updatedClass, message: "Class updated successfully!" }
    }
  } catch (error) {
    console.error("Error updating class:", error)
    return { success: false, message: "Failed to update class" }
  }
}

export async function getClassById(classId) {
  try {
    const useNeon = process.env.USE_NEON_FOR_CLASSES === 'true'
    
    if (useNeon) {
      const sql = getNeonSql()
      
      const classes = await sql`
        SELECT 
          id, title, description, routine, instructor, date, time,
          duration, intensity, status, maxParticipants, workoutBreakdown,
          created_at, updated_at
        FROM classes 
        WHERE id = ${classId}
      `
      
      if (classes.length === 0) {
        return null
      }
      
      const cls = classes[0]
      return {
        ...cls,
        routine: typeof cls.routine === 'string' ? JSON.parse(cls.routine) : cls.routine,
        workoutBreakdown: typeof cls.workoutBreakdown === 'string' ? JSON.parse(cls.workoutBreakdown) : cls.workoutBreakdown,
        numericalIntensity: cls.intensity
      }
    } else {
      // Fallback to in-memory storage
      const classItem = inMemoryClasses.find((cls) => cls.id === classId)
      return classItem || null
    }
  } catch (error) {
    console.error("Error fetching class:", error)
    return null
  }
}

// Main classes data for the public-facing app - now empty, only show admin-created classes
let classesData = []

export async function fetchAllClasses() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  console.log("Fetching classes - inMemoryClasses:", inMemoryClasses.length)
  console.log("Approved classes:", inMemoryClasses.filter((cls) => cls.status === "approved").length)
  const allClasses = [...classesData, ...inMemoryClasses.filter((cls) => cls.status === "approved")]
  console.log("Total classes returned:", allClasses.length)
  return allClasses
}

export async function fetchClassById(id) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  const allClasses = [...classesData, ...inMemoryClasses.filter((cls) => cls.status === "approved")]
  return allClasses.find((cls) => cls.id === id) || null
}

export async function saveClass(workoutClass) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const existingIndex = classesData.findIndex((cls) => cls.id === workoutClass.id)
  if (existingIndex >= 0) {
    classesData[existingIndex] = workoutClass
  } else {
    classesData.push(workoutClass)
  }
}

export async function deleteClassByIdSimulated(id) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  classesData = classesData.filter((cls) => cls.id !== id)
}

export async function deleteClass(id) {
  try {
    const index = classesData.findIndex((cls) => cls.id === id)
    if (index === -1) {
      return { success: false, message: "Class not found" }
    }

    classesData = classesData.filter((cls) => cls.id !== id)

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true, message: "Class deleted successfully!" }
  } catch (error) {
    console.error("Error deleting class:", error)
    return { success: false, message: "Failed to delete class" }
  }
}

// AI-Powered Features
export async function generateClassTone(routineData) {
  try {
    const { title, description, hyroxPrepTypes, rounds } = routineData

    const totalExercises = rounds.reduce((acc, round) => acc + round.exercises.length, 0)
    const hasCardio = rounds.some((round) =>
      round.exercises.some((ex) => ex.name.toLowerCase().includes("run") || ex.name.toLowerCase().includes("row")),
    )
    const hasStrength = rounds.some((round) => round.exercises.some((ex) => ex.isWeightBased || ex.weight))

    let reasoning = `This ${title.toLowerCase()} routine is specifically designed to `

    if (hyroxPrepTypes.includes("Hyrox Preparation")) {
      reasoning += "prepare athletes for Hyrox competition demands through "
    } else {
      reasoning += "develop comprehensive fitness through "
    }

    if (hasCardio && hasStrength) {
      reasoning += "a balanced combination of cardiovascular endurance and functional strength training. "
    } else if (hasCardio) {
      reasoning += "intensive cardiovascular conditioning and metabolic challenges. "
    } else if (hasStrength) {
      reasoning += "focused strength development and power-based movements. "
    } else {
      reasoning += "functional movement patterns and athletic conditioning. "
    }

    reasoning += `With ${totalExercises} carefully selected exercises across ${rounds.length} rounds, `

    if (hyroxPrepTypes.includes("Sprint Conditioning")) {
      reasoning += "this workout emphasizes high-intensity intervals that mirror race conditions. "
    } else if (hyroxPrepTypes.includes("Strength Endurance")) {
      reasoning += "this session builds the muscular endurance essential for sustained performance. "
    } else if (hyroxPrepTypes.includes("General Endurance")) {
      reasoning += "this routine develops the aerobic base crucial for long-term athletic success. "
    }

    reasoning += "The progressive structure ensures optimal adaptation while maintaining safety and effectiveness."

    await new Promise((resolve) => setTimeout(resolve, 1500))

    return { success: true, data: reasoning }
  } catch (error) {
    console.error("Error generating tone:", error)
    return { success: false, message: "Failed to generate AI tone" }
  }
}

// Program management actions
export async function getCurrentProgram() {
  if (USE_NEON_FOR_PROGRAMS) {
    return await getCurrentProgramNeon()
  }

  // Fallback to existing in-memory implementation
  await new Promise((resolve) => setTimeout(resolve, 400))
  const activeProgram = inMemoryPrograms.find((program) => program.isActive)
  return activeProgram || null
}

export async function fetchAllPrograms() {
  if (USE_NEON_FOR_PROGRAMS) {
    // TODO: Add getAllProgramsNeon() function when database is ready
    try {
      const { Pool } = await import('@neondatabase/serverless')
      const pool = new Pool({ connectionString: process.env.DATABASE_URL })
      
      const result = await pool.query(`
        SELECT 
          p.id,
          p.name,
          p.subtitle,
          p.description,
          p.total_weeks,
          p.current_week,
          p.status,
          p.created_at,
          CASE WHEN p.status = 'active' THEN true ELSE false END as "isActive"
        FROM programs p
        ORDER BY p.created_at DESC
      `)
      
      return result.rows
    } catch (error) {
      console.error('Error fetching all programs from Neon:', error)
      // Fallback to in-memory
    }
  }

  // Fallback to existing in-memory implementation
  await new Promise((resolve) => setTimeout(resolve, 200))
  return inMemoryPrograms
}

export async function updateProgramWeek(newWeek) {
  try {
    const programIndex = inMemoryPrograms.findIndex((program) => program.isActive)
    if (programIndex === -1) {
      return { success: false, message: "No active program found" }
    }

    const program = inMemoryPrograms[programIndex]
    if (newWeek < 1 || newWeek > program.totalWeeks) {
      return { success: false, message: "Invalid week number" }
    }

    const updatedPhases = program.phases.map((phase) => {
      let status = "completed" | "current" | "upcoming"
      if (newWeek > phase.endWeek) {
        status = "completed"
      } else if (newWeek >= phase.startWeek && newWeek <= phase.endWeek) {
        status = "current"
      } else {
        status = "upcoming"
      }
      return { ...phase, status }
    })

    inMemoryPrograms[programIndex] = {
      ...program,
      currentWeek: newWeek,
      phases: updatedPhases,
      updatedAt: new Date().toISOString(),
    }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true, message: `Program updated to week ${newWeek}` }
  } catch (error) {
    console.error("Error updating program week:", error)
    return { success: false, message: "Failed to update program week" }
  }
}

export async function createProgram(programData) {
  if (USE_NEON_FOR_PROGRAMS) {
    const result = await createProgramNeon(programData)
    if (result.success) {
      revalidatePath("/admin")
      revalidatePath("/")
    }
    return result
  }

  // Fallback to existing in-memory implementation
  try {
    const totalWeeks = programData.phases.reduce((total, phase) => total + phase.weeks, 0)

    inMemoryPrograms.forEach((program) => {
      program.isActive = false
    })

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

    const newProgram = {
      id: `program-${Date.now()}`,
      name: programData.name,
      subtitle: programData.subtitle,
      startDate: programData.startDate,
      currentWeek: 1,
      totalWeeks,
      isActive: true,
      phases: phasesWithDetails,
      updatedAt: new Date().toISOString(),
    }

    inMemoryPrograms.push(newProgram)

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true, data: newProgram, message: "Program created successfully!" }
  } catch (error) {
    console.error("Error creating program:", error)
    return { success: false, message: "Failed to create program" }
  }
}

export async function updateProgramDetails(programId, updates) {
  try {
    const programIndex = inMemoryPrograms.findIndex((program) => program.id === programId)
    if (programIndex === -1) {
      return { success: false, message: "Program not found" }
    }

    const program = inMemoryPrograms[programIndex]

    if (updates.totalWeeks && updates.totalWeeks !== program.totalWeeks) {
      const updatedPhases = program.phases.map((phase) => {
        let status = "completed" | "current" | "upcoming"
        if (program.currentWeek > phase.endWeek) {
          status = "completed"
        } else if (program.currentWeek >= phase.startWeek && program.currentWeek <= phase.endWeek) {
          status = "current"
        } else {
          status = "upcoming"
        }
        return { ...phase, status }
      })

      inMemoryPrograms[programIndex] = {
        ...program,
        ...updates,
        phases: updatedPhases,
        totalWeeks: updates.totalWeeks,
        updatedAt: new Date().toISOString(),
      }
    } else {
      inMemoryPrograms[programIndex] = {
        ...program,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    }

    revalidatePath("/admin")
    return { success: true, message: "Program details updated successfully" }
  } catch (error) {
    console.error("Error updating program details:", error)
    return { success: false, message: "Failed to update program details" }
  }
}

export async function addProgramPhase(phaseData) {
  try {
    const programIndex = inMemoryPrograms.findIndex((program) => program.isActive)
    if (programIndex === -1) {
      return { success: false, message: "No active program found" }
    }

    const program = inMemoryPrograms[programIndex]
    const newPhase = {
      id: `phase-${Date.now()}`,
      name: phaseData.name,
      weeks: phaseData.weeks,
      focus: phaseData.focus,
      order: program.phases.length + 1,
      status: "upcoming",
      startWeek: 1,
      endWeek: phaseData.weeks,
    }

    inMemoryPrograms[programIndex] = {
      ...program,
      phases: [...program.phases, newPhase],
      totalWeeks: program.totalWeeks + phaseData.weeks,
      updatedAt: new Date().toISOString(),
    }

    revalidatePath("/admin")
    return { success: true, message: "Phase added successfully" }
  } catch (error) {
    console.error("Error adding program phase:", error)
    return { success: false, message: "Failed to add program phase" }
  }
}

export async function updateProgramPhase(phaseId, updates) {
  try {
    const programIndex = inMemoryPrograms.findIndex((program) => program.isActive)
    if (programIndex === -1) {
      return { success: false, message: "No active program found" }
    }

    const program = inMemoryPrograms[programIndex]
    const phaseIndex = program.phases.findIndex((phase) => phase.id === phaseId)
    if (phaseIndex === -1) {
      return { success: false, message: "Phase not found" }
    }

    const oldWeeks = program.phases[phaseIndex].weeks
    const weeksDifference = updates.weeks - oldWeeks

    program.phases[phaseIndex] = {
      ...program.phases[phaseIndex],
      ...updates,
    }

    inMemoryPrograms[programIndex] = {
      ...program,
      totalWeeks: program.totalWeeks + weeksDifference,
      updatedAt: new Date().toISOString(),
    }

    revalidatePath("/admin")
    return { success: true, message: "Phase updated successfully" }
  } catch (error) {
    console.error("Error updating program phase:", error)
    return { success: false, message: "Failed to update program phase" }
  }
}

export async function deleteProgramPhase(phaseId) {
  try {
    const programIndex = inMemoryPrograms.findIndex((program) => program.isActive)
    if (programIndex === -1) {
      return { success: false, message: "No active program found" }
    }

    const program = inMemoryPrograms[programIndex]
    const phaseIndex = program.phases.findIndex((phase) => phase.id === phaseId)
    if (phaseIndex === -1) {
      return { success: false, message: "Phase not found" }
    }

    const deletedPhase = program.phases[phaseIndex]
    const updatedPhases = program.phases.filter((phase) => phase.id !== phaseId)

    const reorderedPhases = updatedPhases.map((phase, index) => ({
      ...phase,
      order: index + 1,
    }))

    inMemoryPrograms[programIndex] = {
      ...program,
      phases: reorderedPhases,
      totalWeeks: program.totalWeeks - deletedPhase.weeks,
      updatedAt: new Date().toISOString(),
    }

    revalidatePath("/admin")
    return { success: true, message: "Phase deleted successfully" }
  } catch (error) {
    console.error("Error deleting program phase:", error)
    return { success: false, message: "Failed to delete program phase" }
  }
}

export async function reorderProgramPhases(newPhaseOrderIds) {
  try {
    const programIndex = inMemoryPrograms.findIndex((program) => program.isActive)
    if (programIndex === -1) {
      return { success: false, message: "No active program found" }
    }

    const program = inMemoryPrograms[programIndex]
    const reorderedPhases = newPhaseOrderIds.map((id, index) => {
      const phase = program.phases.find((p) => p.id === id)
      if (!phase) throw new Error(`Phase with id ${id} not found`)
      return { ...phase, order: index + 1 }
    })

    inMemoryPrograms[programIndex] = {
      ...program,
      phases: reorderedPhases,
      updatedAt: new Date().toISOString(),
    }

    revalidatePath("/admin")
    return { success: true, message: "Phases reordered successfully" }
  } catch (error) {
    console.error("Error reordering program phases:", error)
    return { success: false, message: "Failed to reorder program phases" }
  }
}

// Workout template actions
export async function createWorkoutTemplate(templateData) {
  if (USE_NEON_FOR_TEMPLATES) {
    return await createWorkoutTemplateNeon(templateData)
  }

  // Fallback to existing in-memory implementation
  try {
    const { inMemoryWorkoutTemplates } = await import("@/lib/workouts")

    const newTemplate = {
      ...templateData,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    inMemoryWorkoutTemplates.push(newTemplate)

    revalidatePath("/admin")
    return { success: true, data: newTemplate, message: "Template created successfully!" }
  } catch (error) {
    console.error("Error creating workout template:", error)
    return { success: false, message: "Failed to create template" }
  }
}

export async function fetchAllWorkoutTemplates() {
  if (USE_NEON_FOR_TEMPLATES) {
    return await fetchAllWorkoutTemplatesNeon()
  }

  // Fallback to existing in-memory implementation
  const { inMemoryWorkoutTemplates } = await import("@/lib/workouts")
  return [...inMemoryWorkoutTemplates]
}

export async function getWorkoutTemplateById(templateId) {
  if (USE_NEON_FOR_TEMPLATES) {
    try {
      const sql = getNeonSql()
      
      const templates = await sql`
        SELECT id, title, description, rounds, hyrox_prep_types, hyrox_reasoning, other_hyrox_prep_notes
        FROM workout_templates 
        WHERE id = ${templateId}
      `
      
      if (templates.length === 0) {
        return null
      }
      
      const template = templates[0]
      return {
        ...template,
        rounds: typeof template.rounds === 'string' ? JSON.parse(template.rounds) : template.rounds
      }
    } catch (error) {
      console.error("Error fetching workout template by ID:", error)
      return null
    }
  }

  // Fallback to existing in-memory implementation
  const { inMemoryWorkoutTemplates } = await import("@/lib/workouts")
  return inMemoryWorkoutTemplates.find(template => template.id === templateId) || null
}

export async function updateWorkoutTemplate(templateId, updates) {
  if (USE_NEON_FOR_TEMPLATES) {
    const result = await updateWorkoutTemplateNeon(templateId, updates)
    if (result.success) {
      revalidatePath("/admin")
    }
    return result
  }

  // Fallback to existing in-memory implementation
  try {
    const { inMemoryWorkoutTemplates } = await import("@/lib/workouts")
    const templateIndex = inMemoryWorkoutTemplates.findIndex((template) => template.id === templateId)

    if (templateIndex === -1) {
      return { success: false, message: "Template not found" }
    }

    const updatedTemplate = {
      ...inMemoryWorkoutTemplates[templateIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    inMemoryWorkoutTemplates[templateIndex] = updatedTemplate

    revalidatePath("/admin")
    return { success: true, data: updatedTemplate, message: "Template updated successfully!" }
  } catch (error) {
    console.error("Error updating workout template:", error)
    return { success: false, message: "Failed to update template" }
  }
}

export async function deleteWorkoutTemplate(templateId) {
  if (USE_NEON_FOR_TEMPLATES) {
    const result = await deleteWorkoutTemplateNeon(templateId)
    if (result.success) {
      revalidatePath("/admin")
    }
    return result
  }

  // Fallback to existing in-memory implementation
  try {
    const { inMemoryWorkoutTemplates } = await import("@/lib/workouts")
    const templateIndex = inMemoryWorkoutTemplates.findIndex((template) => template.id === templateId)

    if (templateIndex === -1) {
      return { success: false, message: "Template not found" }
    }

    inMemoryWorkoutTemplates.splice(templateIndex, 1)

    revalidatePath("/admin")
    return { success: true, message: "Template deleted successfully!" }
  } catch (error) {
    console.error("Error deleting workout template:", error)
    return { success: false, message: "Failed to delete template" }
  }
}

// Sponsorship management actions
export async function submitSponsorshipRequest(formData) {
  if (USE_NEON_FOR_SPONSORSHIP) {
    return await submitSponsorshipRequestNeon(formData)
  }

  // Fallback to existing in-memory implementation
  try {
    const contactName = formData.get("contactName")
    const email = formData.get("email")
    const company = formData.get("company")
    const phone = formData.get("phone")
    const packageType = formData.get("packageType")
    const industry = formData.get("industry")
    const message = formData.get("message")
    const newsletter = formData.get("newsletter") === "on"

    if (!contactName || !email || !company || !packageType) {
      return { success: false, message: "Missing required fields" }
    }

    const newRequest = {
      id: `sponsor-req-${Date.now()}`,
      contactName,
      email,
      company,
      phone: phone || undefined,
      packageType,
      industry: industry || undefined,
      message: message || undefined,
      newsletter,
      submittedAt: new Date().toISOString(),
      status: "pending",
    }

    const { inMemorySponsorshipRequests } = await import("@/lib/sponsorship")
    inMemorySponsorshipRequests.push(newRequest)

    revalidatePath("/admin")

    return {
      success: true,
      data: newRequest,
      message: "Sponsorship request submitted successfully!",
    }
  } catch (error) {
    console.error("Error submitting sponsorship request:", error)
    return { success: false, message: "Failed to submit sponsorship request" }
  }
}

export async function getAllSponsorshipRequests() {
  const { inMemorySponsorshipRequests } = await import("@/lib/sponsorship")
  return [...inMemorySponsorshipRequests]
}

export async function updateSponsorshipRequestStatus(requestId, status) {
  try {
    const { inMemorySponsorshipRequests } = await import("@/lib/sponsorship")
    const requestIndex = inMemorySponsorshipRequests.findIndex((req) => req.id === requestId)

    if (requestIndex === -1) {
      return { success: false, message: "Sponsorship request not found" }
    }

    inMemorySponsorshipRequests[requestIndex].status = status

    revalidatePath("/admin")
    return { success: true, message: "Status updated successfully" }
  } catch (error) {
    console.error("Error updating sponsorship request status:", error)
    return { success: false, message: "Failed to update status" }
  }
}

export async function fetchAllSponsorshipPackages() {
  const { inMemorySponsorshipPackages } = await import("@/lib/sponsorship")
  return [...inMemorySponsorshipPackages]
}

export async function createSponsorshipPackage(packageData) {
  try {
    const { inMemorySponsorshipPackages } = await import("@/lib/sponsorship")

    const newPackage = {
      ...packageData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    inMemorySponsorshipPackages.push(newPackage)

    revalidatePath("/admin")
    revalidatePath("/sponsorship")
    return { success: true, data: newPackage, message: "Package created successfully!" }
  } catch (error) {
    console.error("Error creating sponsorship package:", error)
    return { success: false, message: "Failed to create package" }
  }
}

export async function updateSponsorshipPackage(packageId, updates) {
  try {
    const { inMemorySponsorshipPackages } = await import("@/lib/sponsorship")
    const packageIndex = inMemorySponsorshipPackages.findIndex((pkg) => pkg.id === packageId)

    if (packageIndex === -1) {
      return { success: false, message: "Package not found" }
    }

    const updatedPackage = {
      ...inMemorySponsorshipPackages[packageIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    inMemorySponsorshipPackages[packageIndex] = updatedPackage

    revalidatePath("/admin")
    revalidatePath("/sponsorship")
    return { success: true, data: updatedPackage, message: "Package updated successfully!" }
  } catch (error) {
    console.error("Error updating sponsorship package:", error)
    return { success: false, message: "Failed to update package" }
  }
}

export async function deleteSponsorshipPackage(packageId) {
  try {
    const { inMemorySponsorshipPackages } = await import("@/lib/sponsorship")
    const packageIndex = inMemorySponsorshipPackages.findIndex((pkg) => pkg.id === packageId)

    if (packageIndex === -1) {
      return { success: false, message: "Package not found" }
    }

    inMemorySponsorshipPackages.splice(packageIndex, 1)

    revalidatePath("/admin")
    revalidatePath("/sponsorship")
    return { success: true, message: "Package deleted successfully!" }
  } catch (error) {
    console.error("Error deleting sponsorship package:", error)
    return { success: false, message: "Failed to delete package" }
  }
}

// App settings management for Spotify playlist and other global settings
let AppSettings = {
  playlists: [
    {
    id: "string",
    name: "string",
    category: "string",
    url: "string",
    isDefault: "boolean",
  }
]
}

// In-memory storage for app settings
let inMemoryAppSettings = {
  playlists: [
    {
      id: "1",
      name: "HIIT Power Mix",
      category: "HIIT",
      url: "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd",
      isDefault: true,
    },
    {
      id: "2",
      name: "Strength Training",
      category: "Strength",
      url: "https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP",
      isDefault: false,
    },
    {
      id: "3",
      name: "Cardio Blast",
      category: "Cardio",
      url: "https://open.spotify.com/playlist/37i9dQZF1DX3ZAkJuqTfGX",
      isDefault: false,
    },
  ],
}

export async function getAppSettings() {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return { ...inMemoryAppSettings }
}

export async function updateAppSettings(settings) {
  try {
    inMemoryAppSettings = { ...settings }

    revalidatePath("/admin")
    revalidatePath("/")
    return { success: true, message: "App settings updated successfully!" }
  } catch (error) {
    console.error("Error updating app settings:", error)
    return { success: false, message: "Failed to update app settings" }
  }
}

// export async function createClasses(classData) {
//   try {
//     const { inMemoryClasses } = await import("@/lib/classes")

//     const newClass = {
//       ...classData,
//       createdAt: new Date().toISOString(),
//       updatedAt: new Date().toISOString(),
//     }

//     inMemoryClasses.push(newClass)

//     revalidatePath("/admin")
//     revalidatePath("/classes")
//     return { success: true, data: newClass, message: "Class created successfully!" }
//   } catch (error) {
//     console.error("Error creating class:", error)
//     return { success: false, message: "Failed to create class" }
//   }
// }
