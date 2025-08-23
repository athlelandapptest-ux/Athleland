"use client"

export function SponsorshipStats() {
  const stats = [
    { number: "500+", label: "Active Members" },
    { number: "50+", label: "Weekly Classes" },
    { number: "12+", label: "Monthly Events" },
    { number: "95%", label: "Member Retention" },
  ]

  return (
    <section className="bg-black py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-thin tracking-[0.1em] text-white mb-4">OUR IMPACT</h2>
          <div className="w-16 h-px bg-white mx-auto" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-thin text-white mb-2">{stat.number}</div>
              <div className="text-sm font-light tracking-wide text-white/70">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
