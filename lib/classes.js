// lib/classes.js
import { createClient } from "@supabase/supabase-js"

// ---------- setup ----------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
if (!supabaseUrl || !supabaseKey)
  throw new Error("Missing Supabase environment variables")

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
})

// ---------- helpers ----------
export async function fetchAllClasses() {
  const { data, error } = await supabase
    .from("workout_classes")
    .select("*")
    .eq("status", "approved")
    .order("date", { ascending: true })
    .order("time", { ascending: true })

  if (error) {
    console.error("[lib/classes] fetchAllClasses error:", error)
    return []
  }

  return (
    data?.map((r) => ({
      id: r.id,
      title: r.title || r.name,
      description: r.description || "",
      instructor: r.instructor || "",
      duration: Number(r.duration) || 60,
      intensity: r.intensity ?? r.numerical_intensity ?? 8,
      maxParticipants: r.max_participants,
      date: r.date,
      time: r.time,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })) || []
  )
}

// Optional: single class by id
export async function getClassById(id) {
  const { data, error } = await supabase
    .from("workout_classes")
    .select("*")
    .eq("id", id)
    .single()

  if (error) {
    console.error("[lib/classes] getClassById error:", error)
    return null
  }

  return {
    id: data.id,
    title: data.title || data.name,
    description: data.description || "",
    instructor: data.instructor || "",
    duration: Number(data.duration) || 60,
    intensity: data.intensity ?? data.numerical_intensity ?? 8,
    date: data.date,
    time: data.time,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
}
