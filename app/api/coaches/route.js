import { NextResponse } from "next/server"
import { getSbServer } from "@/lib/supabase/server"

export async function GET() {
  try {
    const sb = getSbServer()
    const { data, error } = await sb.from("coaches").select("*").order("created_at", { ascending: true })
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to fetch coaches" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json()
    const payload = {
      name: (body.name || "").trim(),
      title: (body.title || "").trim(),
      specialties: Array.isArray(body.specialties) ? body.specialties : [],
      bio: (body.bio || "").trim(),
      image: body.image || "/images/head-coach.jpg",
      experience: (body.experience || "").trim(),
      certifications: Array.isArray(body.certifications) ? body.certifications : [],
      contact_email: (body.contact_email || "").trim(),
      contact_phone: body.contact_phone || null,
      is_active: !!body.is_active,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    const sb = getSbServer()
    const { data, error } = await sb.from("coaches").insert([payload]).select("*").single()
    if (error) throw error
    return NextResponse.json({ data }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to create coach" }, { status: 500 })
  }
}
