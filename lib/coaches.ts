export interface Coach {
  id: string
  name: string
  title: string
  specialties: string[]
  bio: string
  image: string
  experience: string
  certifications: string[]
  contact: {
    email: string
    phone?: string
  }
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// In-memory storage for coaches
export const inMemoryCoaches: Coach[] = [
  {
    id: "coach-001",
    name: "Sarah Mitchell",
    title: "Head Performance Coach",
    specialties: ["HYROX Training", "Functional Fitness", "Olympic Lifting"],
    bio: "Sarah brings over 8 years of experience in high-performance coaching, specializing in HYROX preparation and functional fitness. She has coached athletes to multiple podium finishes in international competitions.",
    image: "/images/head-coach.jpg",
    experience: "8+ years",
    certifications: ["NSCA-CSCS", "CrossFit Level 3", "HYROX Master Trainer"],
    contact: {
      email: "sarah@athleland.com",
      phone: "+1 (555) 123-4567",
    },
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "coach-002",
    name: "Mike Johnson",
    title: "Strength & Conditioning Coach",
    specialties: ["Powerlifting", "Strength Training", "Athletic Performance"],
    bio: "Mike is a former competitive powerlifter with extensive experience in strength and conditioning. He focuses on building raw power and athletic performance through progressive training methodologies.",
    image: "/images/head-coach.jpg",
    experience: "6+ years",
    certifications: ["NSCA-CSCS", "USA Powerlifting", "FMS Level 2"],
    contact: {
      email: "mike@athleland.com",
      phone: "+1 (555) 234-5678",
    },
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
  {
    id: "coach-003",
    name: "Lisa Chen",
    title: "Metabolic Conditioning Specialist",
    specialties: ["HIIT Training", "Cardio Conditioning", "Weight Loss"],
    bio: "Lisa specializes in high-intensity metabolic conditioning and has helped hundreds of clients achieve their fitness goals through innovative training protocols and nutritional guidance.",
    image: "/images/head-coach.jpg",
    experience: "5+ years",
    certifications: ["NASM-CPT", "Precision Nutrition", "Metabolic Conditioning"],
    contact: {
      email: "lisa@athleland.com",
      phone: "+1 (555) 345-6789",
    },
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
  },
]
