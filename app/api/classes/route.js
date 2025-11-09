// app/api/classes/route.js
import { NextResponse } from "next/server"
import { fetchAllClasses } from "@/app/actions"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  try {
    const classes = await fetchAllClasses() // Supabase (approved only)
    return NextResponse.json({ classes })
  } catch (e) {
    console.error("[/api/classes] error:", e)
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 })
  }
}
