"use client"

import { useState, useEffect } from "react"

const backgroundImages = [
  "/images/sponsorship/gym-pushups-1.jpg",
  "/images/sponsorship/gym-dumbbells.jpg",
  "/images/sponsorship/gym-pushups-2.jpg",
  "/images/sponsorship/gym-ab-wheel.jpg",
  "/images/sponsorship/gym-pushups-3.jpg",
  "/images/sponsorship/gym-leg-press.jpg",
  "/images/sponsorship/gym-rowing-1.jpg",
  "/images/sponsorship/gym-rowing-2.jpg",
]

export function SponsorshipHero() {
  const [currentImage, setCurrentImage] = useState("")

  useEffect(() => {
    // Select random image on component mount
    const randomIndex = Math.floor(Math.random() * backgroundImages.length)
    setCurrentImage(backgroundImages[randomIndex])
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      {currentImage && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${currentImage})` }}
        />
      )}

      {/* Overlay for brand protection and readability */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        {/* Corner Elements */}
        <div className="absolute top-0 left-0 text-xs font-thin tracking-[0.2em] opacity-60">EST. 2025</div>
        <div className="absolute top-0 right-0 text-xs font-thin tracking-[0.2em] opacity-60">KUWAIT</div>

        {/* Main Content */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-thin tracking-[0.1em] leading-tight">
              PARTNERSHIP
              <br />
              OPPORTUNITIES
            </h1>
            <div className="w-24 h-px bg-white mx-auto" />
          </div>

          <p className="text-lg md:text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed opacity-90">
            Join ATHLELAND CONDITIONING CLUB as a strategic partner and connect with Kuwait's most dedicated fitness
            community
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <button className="bg-white hover:bg-gray-200 text-black px-8 py-3 text-sm font-medium tracking-wide transition-colors">
              EXPLORE PACKAGES
            </button>
            <button className="border border-white/30 hover:border-white text-white px-8 py-3 text-sm font-medium tracking-wide transition-colors">
              CONTACT US
            </button>
          </div>
        </div>

        {/* Bottom Elements */}
        <div className="absolute bottom-0 left-0 text-xs font-thin tracking-[0.2em] opacity-60">CONDITIONING</div>
        <div className="absolute bottom-0 right-0 text-xs font-thin tracking-[0.2em] opacity-60">CLUB</div>
      </div>
    </section>
  )
}
