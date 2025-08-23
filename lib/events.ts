export interface EventSponsor {
  id: string
  name: string
  logo: string
  website: string
  tier: "platinum" | "gold" | "silver" | "bronze"
  isActive: boolean
}

export interface EventRegistration {
  id: string
  eventId: string
  participantName: string
  participantEmail: string
  participantPhone: string
  registrationDate: string
  status: "pending" | "confirmed" | "cancelled" | "waitlisted"
  paymentStatus: "pending" | "paid" | "refunded"
  fitnessLevel: "beginner" | "intermediate" | "advanced"
  medicalNotes?: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  specialRequests?: string
}

export interface Event {
  id: string
  title: string
  description: string
  fullDescription: string
  date: string
  time: string
  duration: number
  location: string
  category: "workshop" | "competition" | "seminar" | "training"
  maxParticipants: number
  currentParticipants: number
  price: number
  instructor: string
  difficulty: "Beginner" | "Intermediate" | "Advanced"
  image: string
  gallery: string[]
  tags: string[]
  featured: boolean
  status: "draft" | "published" | "cancelled" | "completed"
  requirements: string[]
  whatToBring: string[]
  isSponsored: boolean
  sponsor?: EventSponsor
  registrationDeadline: string
  createdAt: string
  updatedAt: string
  // Registration settings
  allowWaitlist: boolean
  memberDiscount: number // percentage discount for members
  cancellationPolicy: {
    fullRefundHours: number // hours before event for full refund
    partialRefundHours: number // hours before event for partial refund
    partialRefundPercentage: number // percentage refunded
  }
}

// Sample sponsors data
export const inMemorySponsors: EventSponsor[] = [
  {
    id: "sponsor-1",
    name: "Nike Training",
    logo: "/placeholder.svg?height=100&width=200",
    website: "https://nike.com",
    tier: "platinum",
    isActive: true,
  },
  {
    id: "sponsor-2",
    name: "Under Armour",
    logo: "/placeholder.svg?height=100&width=200",
    website: "https://underarmour.com",
    tier: "gold",
    isActive: true,
  },
  {
    id: "sponsor-3",
    name: "Reebok CrossFit",
    logo: "/placeholder.svg?height=100&width=200",
    website: "https://reebok.com",
    tier: "silver",
    isActive: true,
  },
  {
    id: "sponsor-4",
    name: "Rogue Fitness",
    logo: "/placeholder.svg?height=100&width=200",
    website: "https://roguefitness.com",
    tier: "bronze",
    isActive: true,
  },
]

// In-memory storage for registrations
export const inMemoryRegistrations: EventRegistration[] = []

// Sample events data with registration settings
export const inMemoryEvents: Event[] = [
  {
    id: "event-1",
    title: "HYROX Competition Prep Workshop",
    description: "Master the 8 stations of HYROX with expert coaching and personalized strategy sessions.",
    fullDescription:
      "Join us for an intensive HYROX preparation workshop designed to elevate your competition performance. This comprehensive session covers all 8 HYROX stations with detailed technique breakdowns, pacing strategies, and personalized coaching feedback. Whether you're preparing for your first HYROX or looking to improve your time, this workshop provides the tools and knowledge you need to succeed.",
    date: "2025-02-15",
    time: "09:00",
    duration: 180,
    location: "ATHLELAND Main Facility",
    category: "workshop",
    maxParticipants: 16,
    currentParticipants: 12,
    price: 85,
    instructor: "Coach Sarah Miller",
    difficulty: "Intermediate",
    image: "/placeholder.svg?height=400&width=600",
    gallery: [
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    tags: ["HYROX", "Competition", "Strategy", "Technique"],
    featured: true,
    status: "published",
    requirements: ["Basic fitness level required", "Previous gym experience recommended", "Comfortable athletic wear"],
    whatToBring: ["Water bottle", "Towel", "Athletic shoes", "Notebook for strategy notes"],
    isSponsored: true,
    sponsor: inMemorySponsors[0],
    registrationDeadline: "2025-02-13",
    createdAt: "2025-01-15T10:00:00Z",
    updatedAt: "2025-01-20T14:30:00Z",
    allowWaitlist: true,
    memberDiscount: 15,
    cancellationPolicy: {
      fullRefundHours: 48,
      partialRefundHours: 24,
      partialRefundPercentage: 50,
    },
  },
  {
    id: "event-2",
    title: "Functional Movement Seminar",
    description: "Learn the fundamentals of functional movement patterns for injury prevention and performance.",
    fullDescription:
      "This educational seminar focuses on the seven fundamental movement patterns that form the foundation of all athletic performance. Led by certified movement specialists, you'll learn proper biomechanics, common movement dysfunctions, and corrective strategies to optimize your training and reduce injury risk.",
    date: "2025-02-22",
    time: "14:00",
    duration: 120,
    location: "ATHLELAND Education Center",
    category: "seminar",
    maxParticipants: 25,
    currentParticipants: 8,
    price: 45,
    instructor: "Dr. Mike Johnson",
    difficulty: "Beginner",
    image: "/placeholder.svg?height=400&width=600",
    gallery: [],
    tags: ["Movement", "Education", "Injury Prevention", "Biomechanics"],
    featured: false,
    status: "published",
    requirements: ["No prior experience necessary", "Interest in movement quality"],
    whatToBring: ["Comfortable clothing for movement", "Notebook", "Open mind"],
    isSponsored: true,
    sponsor: inMemorySponsors[1],
    registrationDeadline: "2025-02-20",
    createdAt: "2025-01-18T09:00:00Z",
    updatedAt: "2025-01-18T09:00:00Z",
    allowWaitlist: true,
    memberDiscount: 20,
    cancellationPolicy: {
      fullRefundHours: 24,
      partialRefundHours: 12,
      partialRefundPercentage: 75,
    },
  },
  {
    id: "event-3",
    title: "Monthly Fitness Challenge",
    description: "Test your limits in our monthly fitness competition with prizes and community recognition.",
    fullDescription:
      "Join our monthly fitness challenge featuring a unique workout designed to test different aspects of your fitness. This month's challenge combines strength, endurance, and skill-based movements in a fun, competitive format. All fitness levels welcome with scaled options available.",
    date: "2025-03-01",
    time: "10:00",
    duration: 90,
    location: "ATHLELAND Competition Floor",
    category: "competition",
    maxParticipants: 30,
    currentParticipants: 18,
    price: 25,
    instructor: "Coach Team",
    difficulty: "Intermediate",
    image: "/placeholder.svg?height=400&width=600",
    gallery: [],
    tags: ["Competition", "Community", "Challenge", "Prizes"],
    featured: true,
    status: "published",
    requirements: ["Basic fitness level", "Ability to perform scaled movements", "Competitive spirit"],
    whatToBring: ["Water bottle", "Towel", "Athletic gear", "Positive attitude"],
    isSponsored: false,
    registrationDeadline: "2025-02-27",
    createdAt: "2025-01-20T11:00:00Z",
    updatedAt: "2025-01-25T16:00:00Z",
    allowWaitlist: false,
    memberDiscount: 0,
    cancellationPolicy: {
      fullRefundHours: 12,
      partialRefundHours: 6,
      partialRefundPercentage: 25,
    },
  },
  {
    id: "event-4",
    title: "Strength Training Fundamentals",
    description: "Master the basics of strength training with proper form, programming, and progression strategies.",
    fullDescription:
      "This comprehensive training session covers the fundamental principles of strength training. Learn proper lifting techniques for major compound movements, understand programming basics, and discover how to progress safely and effectively. Perfect for beginners or those looking to refine their technique.",
    date: "2025-03-08",
    time: "11:00",
    duration: 150,
    location: "ATHLELAND Strength Zone",
    category: "training",
    maxParticipants: 12,
    currentParticipants: 5,
    price: 65,
    instructor: "Coach John Doe",
    difficulty: "Beginner",
    image: "/placeholder.svg?height=400&width=600",
    gallery: [],
    tags: ["Strength", "Fundamentals", "Technique", "Programming"],
    featured: false,
    status: "published",
    requirements: ["No prior strength training experience required", "Medical clearance for exercise"],
    whatToBring: ["Athletic clothing", "Closed-toe shoes", "Water bottle", "Willingness to learn"],
    isSponsored: true,
    sponsor: inMemorySponsors[2],
    registrationDeadline: "2025-03-06",
    createdAt: "2025-01-22T13:00:00Z",
    updatedAt: "2025-01-22T13:00:00Z",
    allowWaitlist: true,
    memberDiscount: 10,
    cancellationPolicy: {
      fullRefundHours: 48,
      partialRefundHours: 24,
      partialRefundPercentage: 60,
    },
  },
]
