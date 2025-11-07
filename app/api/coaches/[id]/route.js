import { NextResponse } from "next/server"
import { getSbServer } from "@/lib/supabase/server"

export async function PATCH(req, { params }) {
  try {
    const id = params?.id
    const body = await req.json()
    const update = {
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
      updated_at: new Date().toISOString(),
    }
    const sb = getSbServer()
    const { data, error } = await sb.from("coaches").update(update).eq("id", id).select("*").single()
    if (error) throw error
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to update coach" }, { status: 500 })
  }
}

export async function DELETE(_req, { params }) {
  try {
    const id = params?.id
    const sb = getSbServer()
    const { error } = await sb.from("coaches").delete().eq("id", id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to delete coach" }, { status: 500 })
  }
}
