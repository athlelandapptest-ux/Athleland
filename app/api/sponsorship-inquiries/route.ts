import { NextResponse } from "next/server"

// In-memory storage for demo purposes
const inquiries: any[] = []

export async function GET() {
  return NextResponse.json(inquiries)
}
