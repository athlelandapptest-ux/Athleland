export interface SponsorshipRequest {
  id: string
  contactName: string
  email: string
  company: string
  phone?: string
  packageType: string
  industry?: string
  message?: string
  newsletter: boolean
  submittedAt: string
  status: "pending" | "contacted" | "approved" | "rejected"
}

export interface SponsorshipPackage {
  id: string
  name: string
  price: string
  icon: string
  popular: boolean
  features: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// In-memory storage for sponsorship requests
export const inMemorySponsorshipRequests: SponsorshipRequest[] = []

// In-memory storage for sponsorship packages
export const inMemorySponsorshipPackages: SponsorshipPackage[] = [
  {
    id: "main-sponsor",
    name: "Main Sponsor",
    price: "7,000 KD",
    icon: "Crown",
    popular: true,
    features: [
      "Largest logo on center chest (front) and upper back of apparel",
      "Prime booth placement at venue entrance",
      "Exclusive banner on main training area and center backdrop",
      "Featured video content on facility screens (priority timing)",
      "Top placement in all social media content and press releases",
      "5 Instagram posts + 10 stories monthly",
      "Logo on trophies, certificates, and awards",
      "Logo on website homepage and registration pages",
      "Opening ceremony speaking opportunity",
      "10 VIP passes to all events",
      "Quarterly performance reports",
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "platinum-sponsor",
    name: "Platinum Sponsor",
    price: "4,000 KD",
    icon: "Trophy",
    popular: false,
    features: [
      "Logo on right chest (front) and lower back of apparel",
      "Booth in secondary prime area",
      "Shared banner placement in training areas",
      "Rotational ad slots on facility screens",
      "Logo on website and registration pages",
      "3 Instagram posts + 6 stories monthly",
      "Social media campaign integration",
      "7 VIP passes to all events",
      "Bi-annual performance reports",
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "gold-sponsor",
    name: "Gold Sponsor",
    price: "2,500 KD",
    icon: "Award",
    popular: false,
    features: [
      "Logo on bottom hem of apparel (front & back)",
      "Logo on side banners throughout facility",
      "Logo in facility screen sponsor rotation",
      "Logo on website sponsor page",
      "2 Instagram posts + 4 stories monthly",
      "Event newsletter inclusion",
      "5 VIP passes to major events",
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "silver-sponsor",
    name: "Silver Sponsor",
    price: "1,000 KD",
    icon: "Star",
    popular: false,
    features: [
      "Logo on sleeves of training apparel",
      "Logo on shared 'Thank You Sponsors' banner",
      "Logo rotation on facility screens (standard priority)",
      "Logo on website sponsor page",
      "1 Instagram post + 2 stories monthly",
      "3 VIP passes to select events",
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]
