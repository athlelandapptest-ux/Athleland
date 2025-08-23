import { NextResponse } from "next/server"

// In-memory storage for demo purposes
const inquiries: any[] = []

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const index = inquiries.findIndex((i) => i.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 })
    }

    inquiries[index] = { ...inquiries[index], ...data }
    return NextResponse.json(inquiries[index])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update inquiry" }, { status: 500 })
  }
}
