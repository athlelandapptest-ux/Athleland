"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Phone } from "lucide-react"

import type { Coach } from "@/lib/coaches"
import { inMemoryCoaches } from "@/lib/coaches"

// ---- small browser Supabase helper ----
function getSbBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined
  if (!url || !key) return null
  return createClient(url, key, {
    auth: { persistSession: false, storageKey: "athleland-public" },
  })
}

type DbCoach = {
  id: string
  name: string
  title: string
  specialties: string[] | null
  bio: string | null
  image: string | null
  experience: string | null
  certifications: string[] | null
  contact_email: string | null
  contact_phone: string | null
  is_active: boolean | null
  created_at?: string | null
  updated_at?: string | null
}

export default function AboutPage() {
  // ✅ Fix #1: give useState a generic type
  const [dbCoaches, setDbCoaches] = useState<Coach[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const sb = getSbBrowser()
    if (!sb) {
      setLoading(false)
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await sb
          .from("coaches")
          .select("*")
          .eq("is_active", true)
          .order("name", { ascending: true })

        if (error) throw error

        // ✅ Fix #2: explicitly type the mapped result as Coach[]
        const mapped: Coach[] = ((data as DbCoach[] | null) ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          title: c.title,
          specialties: c.specialties ?? [],
          bio: c.bio ?? "",
          image: c.image ?? "/placeholder.svg",
          experience: c.experience ?? "",
          certifications: c.certifications ?? [],
          contact: { email: c.contact_email ?? "", phone: c.contact_phone ?? undefined },
          isActive: !!c.is_active,
          createdAt: c.created_at ?? "",
          updatedAt: c.updated_at ?? "",
        }))

        if (!cancelled) setDbCoaches(mapped)
      } catch {
        if (!cancelled) {
          setDbCoaches([])
          setError("Could not load coaches from server.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const coaches: Coach[] = useMemo<Coach[]>(() => {
    const source =
      dbCoaches.length > 0 ? dbCoaches : (inMemoryCoaches || []).filter((c) => c.isActive)
    return [...source].sort((a, b) => a.name.localeCompare(b.name))
  }, [dbCoaches])

  return (
    <div className="min-h-screen bg-black">
      <SiteHeader />

      <main className="pt-20">
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
                World-class coaches with years of experience in athletic performance and competition preparation.
              </p>
            </div>

            {loading ? (
              <p className="text-center text-gray-500">Loading coaches…</p>
            ) : error ? (
              <p className="text-center text-red-400">{error}</p>
            ) : coaches.length === 0 ? (
              <p className="text-center text-gray-500">No active coaches yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {coaches.map((coach, index) => (
                  <Card
                    key={coach.id}
                    className="bg-gray-900/50 border-gray-700/50 group hover:border-gray-600/50 transition-all duration-500 animate-slide-up"
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    <CardContent className="p-0">
                      <div className="relative aspect-square overflow-hidden rounded-t-lg">
                        <Image
                          src={coach.image || "/placeholder.svg"}
                          alt={coach.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        {coach.specialties?.[0] && (
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-white/20 text-white border-gray-500/30 text-xs font-light">
                              {coach.specialties[0]}
                            </Badge>
                          </div>
                        )}
                      </div>

                      <div className="p-6 space-y-5">
                        <div className="space-y-1">
                          <h3 className="font-display text-xl font-light text-white">{coach.name}</h3>
                          <p className="text-gray-400 font-light">{coach.title}</p>
                        </div>

                        {coach.bio && (
                          <p className="text-gray-400 font-light text-sm leading-relaxed">{coach.bio}</p>
                        )}

                        <div className="flex flex-wrap gap-2 items-center">
                          {coach.experience && (
                            <Badge className="bg-white/10 text-white border-gray-500/20 text-xs font-light">
                              {coach.experience} experience
                            </Badge>
                          )}
                          {coach.specialties?.slice(0, 3).map((spec: string) => (
                            <Badge key={spec} className="bg-white/10 text-white border-gray-500/20 text-xs font-light">
                              {spec}
                            </Badge>
                          ))}
                        </div>

                        {coach.certifications?.length ? (
                          <div className="flex flex-wrap gap-2">
                            {coach.certifications.slice(0, 3).map((cert: string) => (
                              <Badge key={cert} className="bg-white/10 text-white border-gray-500/20 text-xs font-light">
                                {cert}
                              </Badge>
                            ))}
                          </div>
                        ) : null}

                        <div className="flex items-center gap-3 pt-1">
                          {coach.contact?.email && (
                            <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5 px-3" asChild>
                              <Link href={`mailto:${coach.contact.email}`}>
                                <Mail className="h-4 w-4 mr-2" />
                                Email
                              </Link>
                            </Button>
                          )}
                          {coach.contact?.phone && (
                            <Button size="sm" variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5 px-3" asChild>
                              <Link href={`tel:${coach.contact.phone}`}>
                                <Phone className="h-4 w-4 mr-2" />
                                Call
                              </Link>
                            </Button>
                          )}
                        </div>

                        <div className="hidden lg:flex justify-between text-[11px] text-gray-500/70">
                          <span>Added: {formatDate(coach.createdAt)}</span>
                          <span>Updated: {formatDate(coach.updatedAt)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <div className="bg-black text-center py-6 border-t border-white/5">
        <p className="text-white/30 text-sm font-light">©2025 ATHLELAND. All Rights Reserved</p>
      </div>
    </div>
  )
}

// ✅ Fix #3: give `iso` a type
function formatDate(iso?: string): string {
  if (!iso) return "—"
  const d = new Date(iso)
  return isNaN(d.valueOf()) ? "—" : d.toLocaleDateString()
}
