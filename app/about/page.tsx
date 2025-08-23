import { inMemoryCoaches } from "@/lib/coaches"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Instagram, Linkedin, Mail } from "lucide-react"
import { SiteHeader } from "@/components/site-header"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black">
      <SiteHeader />

      <div className="pt-20">
        {/* Team Section */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-800/20 to-black" />
          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <Badge className="bg-white/10 text-white border-gray-500/20 px-4 py-2 text-sm font-light">
                Expert Team
              </Badge>
              <h2 className="font-display text-4xl md:text-5xl font-thin text-white">
                Meet Your
                <span className="block text-white">Performance Coaches</span>
              </h2>
              <p className="text-gray-400 font-light text-lg max-w-2xl mx-auto">
                World-class coaches with decades of combined experience in athletic performance and competition
                preparation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {inMemoryCoaches
                .filter((coach) => coach.isActive)
                .map((coach, index) => (
                  <Card
                    key={coach.id}
                    className="bg-gray-900/50 border-gray-700/50 group hover:border-gray-600/50 transition-all duration-500 animate-slide-up"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden rounded-t-lg">
                        <Image
                          src={coach.image || "/placeholder.svg"}
                          alt={coach.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <Badge className="bg-white/20 text-white border-gray-500/30 text-xs font-light">
                            {coach.specialties[0]}
                          </Badge>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="space-y-2">
                          <h3 className="font-display text-xl font-light text-white">{coach.name}</h3>
                          <p className="text-gray-400 font-light">{coach.title}</p>
                        </div>

                        <p className="text-gray-400 font-light text-sm leading-relaxed">{coach.bio}</p>

                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {coach.certifications.slice(0, 3).map((cert) => (
                              <Badge
                                key={cert}
                                className="bg-white/10 text-white border-gray-500/20 text-xs font-light"
                              >
                                {cert}
                              </Badge>
                            ))}
                          </div>

                          <div className="flex gap-3 pt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-white hover:bg-white/5 p-2"
                            >
                              <Instagram className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-white hover:bg-white/5 p-2"
                            >
                              <Linkedin className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-gray-400 hover:text-white hover:bg-white/5 p-2"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
