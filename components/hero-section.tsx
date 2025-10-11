"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

const features = [
  "Total Body Conditioning",
  "Team Format Training",
  "Transparent Programming",
  "Expert Coaching",
  "Elite Community",
]

const heroStripImages = [
  {
    src: "/images/excellence/img1 (1).jpeg",
    alt: "",
  },
  {
    src: "/images/excellence/img1 (2).jpeg",
    alt: "",
  },
  {
    src: "/images/excellence/img1 (3).jpeg",
    alt: "",
  },
  {
    src: "/images/excellence/img1 (4).jpeg",
    alt: "",
  },
  {
    src: "/images/excellence/img1 (5).jpeg",
    alt: "",
  },
]

export function HeroSection() {
  return (
    <>
      {/* Main Hero Section */}
      <section className="min-h-screen bg-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-px h-40 bg-white/20"></div>
          <div className="absolute top-40 right-32 w-px h-60 bg-white/20"></div>
          <div className="absolute bottom-40 left-1/4 w-px h-32 bg-white/20"></div>
        </div>

        <div className="container mx-auto px-6 lg:px-12 pt-32 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh] mb-16">
            {/* Left Content */}
            <div className="space-y-12 animate-fade-in">
              {/* Category Label */}
              <div className="inline-flex items-center gap-2 text-white/60 text-sm font-light tracking-wider uppercase">
                <div className="w-8 h-px bg-accent"></div>
                Elite Performance
              </div>

              {/* Main Heading */}
              <div className="space-y-6">
                <h1 className="font-display text-6xl lg:text-8xl xl:text-9xl font-thin tracking-tight text-white leading-[0.9]">
                  ATHLELAND
                </h1>
                <div className="space-y-2">
                  <h2 className="text-2xl lg:text-3xl font-light text-white/80 tracking-wide">CONDITIONING</h2>
                  <h3 className="text-xl lg:text-2xl font-light text-white/60 tracking-wide">CLUB</h3>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-6 max-w-lg">
                <p className="text-lg text-white/70 font-light leading-relaxed">
                  Purpose-built for athletes and fitness enthusiasts seeking the pinnacle of structured,
                  high-performance group training.
                </p>
                <p className="text-white/50 font-light">
                  Experience transparent training where every session is published in advance. Our Conditioning Club
                  sets a new standard in Kuwait.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-accent hover:bg-accent/90 text-black font-medium px-8 py-4 h-auto group"
                >
                  Start Training
                  <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
  size="lg"
  variant="outline"
  className="border-white/20 text-white hover:bg-white/5 hover:border-white/40 px-8 py-4 h-auto group bg-transparent"
  onClick={() =>
    window.open(
      "https://www.instagram.com/reel/DOjCl40DU8q/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA%3D%3D",
      "_blank"
    )
  }
>
  <Play className="h-5 w-5 mr-2 transition-transform group-hover:scale-110" />
  Watch Demo
</Button>
              </div>

              {/* Feature List */}
              <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 pt-8">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-white/60 text-sm animate-fade-in"
                    style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                  >
                    <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0"></div>
                    <span className="font-light">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div
              className="relative lg:h-[80vh] flex items-center justify-center animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="relative">
                {/* Main Image */}
                <div className="relative z-10">
                  <Image
                    src="/images/gym-training-timer.jpg"
                    alt="Elite athlete training with professional equipment"
                    width={600}
                    height={700}
                    className="rounded-2xl object-cover mb-40 lg:mb-0"
                  />

                  {/* Floating Stats Card */}
                  <div
                    className="absolute top-8 right-8 glass rounded-xl p-4 text-white animate-fade-in"
                    style={{ animationDelay: "1s" }}
                  >
                    <div className="text-3xl font-light text-accent">00:38</div>
                    <div className="text-xs text-white/60 flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-accent rounded-full"></div>
                        <span>Rest 0:45</span>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                        <span>Round 1</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Background Elements */}
                <div className="absolute -top-20 -left-20 w-40 h-40 border border-white/5 rounded-full"></div>
                <div className="absolute -bottom-16 -right-16 w-32 h-32 border border-white/5 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="absolute bottom-0 left-0 right-0 glass-light border-t border-white/5">
          <div className="container mx-auto px-6 lg:px-12 py-8">
            <div className="grid grid-cols-3 lg:grid-cols-5 gap-8 text-center">
              {[
                { number: "500+", label: "Athletes" },
                { number: "50+", label: "Classes" },
                { number: "12", label: "Weeks Program" },
                { number: "15+", label: "Coaches" },
                { number: "5★", label: "Rating" },
              ].map((stat, index) => (
                <div key={index} className="animate-fade-in" style={{ animationDelay: `${1.2 + index * 0.1}s` }}>
                  <div className="text-2xl lg:text-3xl font-light text-white mb-1">{stat.number}</div>
                  <div className="text-xs text-white/60 font-light uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Strip Section */}
      <section className="bg-black/95 py-16 border-t border-white/5">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-white/40 text-xs font-light tracking-wider uppercase mb-4">
              <div className="w-6 h-px bg-white/20"></div>
              Training Gallery
              <div className="w-6 h-px bg-white/20"></div>
            </div>
            <h2 className="font-display text-3xl lg:text-4xl font-thin text-white mb-4">Experience Excellence</h2>
          </div>

          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-4">
            {heroStripImages.map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer flex-shrink-0 animate-fade-in"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="relative overflow-hidden rounded-xl glass border border-white/5 transition-all duration-500 hover:border-white/20">
                  <Image
                    src={image.src || "/placeholder.svg"}
                    alt={image.alt}
                    width={280}
                    height={200}
                    className="object-cover transition-all duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <p className="text-white text-sm font-light">{image.alt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
              {heroStripImages.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-500 ${
                    index === 0 ? "bg-accent" : "bg-white/20"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </section>
    </>
  )
}
