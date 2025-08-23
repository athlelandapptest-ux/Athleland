import { NextResponse } from "next/server"

// In-memory storage for demo purposes
const inquiries: any[] = []

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const newInquiry = {
      id: Date.now().toString(),
      ...data,
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    inquiries.push(newInquiry)
    return NextResponse.json(newInquiry, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit inquiry" }, { status: 500 })
  }
}
