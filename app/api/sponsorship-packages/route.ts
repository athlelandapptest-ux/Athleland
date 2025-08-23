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

export async function GET() {
  return NextResponse.json(packages)
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const newPackage = {
      id: Date.now().toString(),
      ...data,
    }
    packages.push(newPackage)
    return NextResponse.json(newPackage, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 })
  }
}
