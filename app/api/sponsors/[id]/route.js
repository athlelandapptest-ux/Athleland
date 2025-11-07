// app/api/sponsors/[id]/route.js
import { NextResponse } from "next/server"
import { updateSponsor, fetchAllSponsors } from "@/app/actions"

// GET /api/sponsors/:id  (optional helper)
export async function GET(_req, { params }) {
  try {
    const all = await fetchAllSponsors({ activeOnly: false })
    const row = all.find((s) => s.id === params.id)
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ...row, isActive: !!(row.is_active ?? row.isActive) })
  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed" }, { status: 500 })
  }
}

// PATCH /api/sponsors/:id  body: { isActive: boolean }
export async function PATCH(req, { params }) {
  try {
    const body = (await req.json().catch(() => ({}))) || {}
    // Accept a few shapes
    const desired =
      typeof body.isActive !== "undefined" ? !!body.isActive
      : typeof body.active !== "undefined" ? !!body.active
      : typeof body.is_active !== "undefined" ? !!body.is_active
      : (typeof body.status === "string" ? body.status.toLowerCase() === "active" : undefined)

    if (typeof desired === "undefined") {
      return NextResponse.json({ error: "Provide isActive/active/is_active or status" }, { status: 400 })
    }

    await updateSponsor(params.id, { isActive: desired }) // writes is_active
    // read back a single row
    const all = await fetchAllSponsors({ activeOnly: false })
    const updated = all.find((s) => s.id === params.id)
    if (!updated) return NextResponse.json({ error: "Updated row not found" }, { status: 500 })

    return NextResponse.json({ ...updated, isActive: !!(updated.is_active ?? updated.isActive) })
  } catch (e) {
    console.error("PATCH /api/sponsors/[id] error:", e)
    return NextResponse.json({ error: e.message || "Failed to update sponsor" }, { status: 500 })
  }
}
