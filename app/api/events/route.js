// app/api/events/route.js
import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// no caching for this endpoint
export const dynamic = "force-dynamic"
export const revalidate = 0

function getSb() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL // fallback if you use this name
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error("Missing Supabase env vars (URL and KEY).")
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

// sanitize any image value from DB to a usable public URL
function toAbsImage(url) {
  if (!url) return null
  const trimmed = String(url).trim()

  // already absolute
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  // ignore local placeholders like /images/...
  if (trimmed.startsWith("/images/")) return null

  // treat as object path inside events bucket
  const base =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  if (!base) return null

  const objectPath = trimmed.replace(/^\/+/, "") // remove leading slashes
  return `${base}/storage/v1/object/public/events/${objectPath}`
}

export async function GET() {
  try {
    const sb = getSb()

    const { data, error } = await sb
      .from("events")
      .select("*")
      .order("date", { ascending: true })
      .order("created_at", { ascending: false })

    if (error) throw error

    const rows = Array.isArray(data) ? data : []

    const normalized = rows.map((r) => ({
      id: r.id,
      title: r.title || r.name || "Untitled Event",
      description: r.description || "",
      fullDescription: r.full_description || "",
      date: r.date || null,
      time: r.time || null,
      duration: r.duration || 0,
      location: r.location || "",
      type: r.category || r.type || "other",
      maxParticipants: r.max_participants || 0,
      currentParticipants: r.current_participants || 0,
      price: r.price || 0,
      instructor: r.instructor || "",
      difficulty: r.difficulty || "",
      imageUrl: toAbsImage(r.image || r.image_url),
      tags: r.tags || [],
      featured: !!r.featured,
      status: r.status || "draft",
      isSponsored: !!r.is_sponsored,
      sponsor: r.sponsor_id ? { id: r.sponsor_id, name: r.sponsor_name || "" } : null,
      registrationDeadline: r.registration_deadline || null,
      allowWaitlist: !!r.allow_waitlist,
      memberDiscount: r.member_discount || 0,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    }))

    return NextResponse.json({ ok: true, data: normalized }, { status: 200 })
  } catch (e) {
    console.error("[/api/events] error:", e?.message || e)
    // keep 200 with empty list so UI doesn't crash
    return NextResponse.json({ ok: false, data: [] }, { status: 200 })
  }
}
