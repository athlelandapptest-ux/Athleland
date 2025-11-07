// app/api/sponsors/route.js
import { NextResponse } from "next/server"
import { fetchAllSponsors } from "@/app/actions"

// GET /api/sponsors?activeOnly=true|false   (default false for Admin)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnlyParam = searchParams.get("activeOnly")
    const activeOnly = activeOnlyParam === "true" // default false

    // actions.js returns rows with is_active; map to a consistent isActive boolean
    const rows = await fetchAllSponsors({ activeOnly })
    const normalized = rows.map((r) => ({
      ...r,
      // keep original for admin views, but provide a guaranteed boolean too
      isActive: typeof r.is_active !== "undefined" ? !!r.is_active : !!r.isActive,
    }))
    return NextResponse.json(normalized)
  } catch (e) {
    console.error("GET /api/sponsors error:", e)
    return NextResponse.json({ error: e.message || "Failed to fetch sponsors" }, { status: 500 })
  }
}
