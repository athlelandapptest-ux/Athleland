"use client"

import { useState, useEffect } from "react"
import { Check, Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SponsorshipPackage {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
  highlighted: boolean
  available: boolean
}

export function SponsorshipPackages() {
  const [packages, setPackages] = useState<SponsorshipPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showPrices, setShowPrices] = useState(false)

  useEffect(() => {
    fetchPackages()
    const checkAdminStatus = () => {
      const isAdminUser = window.location.pathname.includes("/admin") || localStorage.getItem("userRole") === "admin"
      setIsAdmin(isAdminUser)
    }
    checkAdminStatus()
  }, [])

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/sponsorship-packages")
      if (response.ok) {
        const data = await response.json()
        setPackages(data)
      }
    } catch (error) {
      console.error("Error fetching packages:", error)
      setPackages([
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
          features: [
            "Logo in training areas",
            "Event co-branding",
            "Quarterly member events",
            "Website partnership page",
          ],
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
      ])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="bg-black py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="text-white">Loading packages...</div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-black py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-3xl md:text-4xl font-thin tracking-[0.1em] text-white mb-4">PARTNERSHIP PACKAGES</h2>
              <div className="w-16 h-px bg-white mx-auto mb-6" />
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Choose the partnership level that aligns with your brand objectives
              </p>
            </div>
            {isAdmin && (
              <Button
                onClick={() => setShowPrices(!showPrices)}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
                size="sm"
              >
                {showPrices ? "Hide Prices" : "Show Prices"}
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {packages
            .filter((pkg) => pkg.available)
            .map((pkg) => (
              <div
                key={pkg.id}
                className={`relative bg-gray-900 border ${pkg.highlighted ? "border-white" : "border-gray-800"} p-8`}
              >
                {pkg.highlighted && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-white text-black px-4 py-1 text-xs font-medium tracking-wide flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      MOST POPULAR
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-xl font-medium text-white mb-4 tracking-wide">{pkg.name}</h3>
                  {isAdmin && showPrices && (
                    <div>
                      <div className="text-3xl font-thin text-white mb-2">${pkg.price.toLocaleString()}</div>
                      <div className="text-sm text-white/60 tracking-wide">{pkg.duration}</div>
                    </div>
                  )}
                </div>

                <ul className="space-y-4 mb-8">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-sm text-white/80">
                      <Check className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 text-sm font-medium tracking-wide transition-colors ${
                    pkg.highlighted
                      ? "bg-white hover:bg-gray-200 text-black"
                      : "border border-gray-600 hover:border-white text-white"
                  }`}
                >
                  GET STARTED
                </button>
              </div>
            ))}
        </div>
      </div>
    </section>
  )
}
