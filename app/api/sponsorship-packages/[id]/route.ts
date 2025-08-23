import { NextResponse } from "next/server"

// In-memory storage for demo purposes
const packages = [
  {
    id: "1",
    name: "Bronze Partner",
    price: 2500,
    duration: "per year",
    features: ["Logo in reception area", "Social media mentions", "Member newsletter inclusion"],
    highlighted: false,
    available: true,
  },
  {
    id: "2",
    name: "Silver Partner",
    price: 5000,
    duration: "per year",
    features: ["Logo in training areas", "Event co-branding", "Quarterly member events", "Website partnership page"],
    highlighted: true,
    available: true,
  },
  {
    id: "3",
    name: "Gold Partner",
    price: 10000,
    duration: "per year",
    features: [
      "Premium logo placement",
      "Exclusive member discounts",
      "Monthly events",
      "Content collaboration",
      "Athlete partnerships",
    ],
    highlighted: false,
    available: true,
  },
]

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()
    const index = packages.findIndex((p) => p.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    packages[index] = { ...packages[index], ...data }
    return NextResponse.json(packages[index])
  } catch (error) {
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const index = packages.findIndex((p) => p.id === params.id)

    if (index === -1) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 })
    }

    packages.splice(index, 1)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 })
  }
}
