"use client"

import { useEffect, useState } from "react"

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    // Animation sequence
    const timer1 = setTimeout(() => setAnimationPhase(1), 500)
    const timer2 = setTimeout(() => setAnimationPhase(2), 1500)
    const timer3 = setTimeout(() => setAnimationPhase(3), 2500)
    const timer4 = setTimeout(() => setIsVisible(false), 3500)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-px h-40 bg-white/20"></div>
        <div className="absolute top-40 right-32 w-px h-60 bg-white/20"></div>
        <div className="absolute bottom-40 left-1/4 w-px h-32 bg-white/20"></div>
      </div>

      {/* Logo Container with Glass Effect */}
      <div className="relative">
        {/* Glass Background */}
        <div
          className={`absolute inset-0 rounded-3xl transition-all duration-1000 ${
            animationPhase >= 1 ? "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl" : "bg-transparent"
          }`}
          style={{
            transform: animationPhase >= 1 ? "scale(1)" : "scale(0.8)",
            opacity: animationPhase >= 1 ? 1 : 0,
          }}
        />

        {/* Logo Content */}
        <div className="relative p-16 text-center">
          {/* Main Logo */}
          <div
            className={`transition-all duration-1000 ${
              animationPhase >= 0 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h1 className="font-display text-6xl lg:text-8xl font-thin tracking-tight text-white leading-[0.9] mb-4">
              ATHLELAND
            </h1>
          </div>

          {/* Subtitle */}
          <div
            className={`transition-all duration-1000 delay-500 ${
              animationPhase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h2 className="text-2xl lg:text-3xl font-light text-white/80 tracking-wide mb-2">CONDITIONING</h2>
            <h3 className="text-xl lg:text-2xl font-light text-white/60 tracking-wide">CLUB</h3>
          </div>

          {/* Tagline */}
          <div
            className={`transition-all duration-1000 delay-1000 ${
              animationPhase >= 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <p className="text-white/50 font-light mt-6 max-w-md mx-auto">
              Elite fitness programming designed for athletes who demand excellence.
            </p>
          </div>

          {/* Loading Indicator */}
          <div
            className={`transition-all duration-1000 delay-1500 ${animationPhase >= 3 ? "opacity-100" : "opacity-0"}`}
          >
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-white/40 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Glow Effect */}
        <div
          className={`absolute inset-0 rounded-3xl transition-all duration-2000 ${
            animationPhase >= 1 ? "shadow-[0_0_100px_rgba(255,255,255,0.1)]" : "shadow-none"
          }`}
        />
      </div>

      {/* Fade Out Animation */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-1000 ${
          animationPhase >= 3 ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  )
}
