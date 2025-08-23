"use client"

export function SponsorshipTestimonials() {
  const testimonials = [
    {
      quote:
        "Partnering with ATHLELAND has significantly increased our brand visibility in Kuwait's fitness community.",
      author: "Sarah Al-Rashid",
      company: "FitGear Kuwait",
      role: "Marketing Director",
    },
    {
      quote: "The collaboration opportunities and member engagement have exceeded our expectations.",
      author: "Ahmed Hassan",
      company: "Nutrition Plus",
      role: "Brand Manager",
    },
    {
      quote: "ATHLELAND's professional approach to partnerships has made our collaboration seamless and effective.",
      author: "Maria Santos",
      company: "ActiveWear Co.",
      role: "Partnership Lead",
    },
  ]

  return (
    <section className="bg-gray-900 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-thin tracking-[0.1em] text-white mb-4">PARTNER TESTIMONIALS</h2>
          <div className="w-16 h-px bg-white mx-auto" />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-black/50 p-8 border border-gray-800">
              <div className="text-white text-4xl mb-4">"</div>
              <p className="text-white/80 mb-6 leading-relaxed">{testimonial.quote}</p>
              <div className="border-t border-gray-800 pt-4">
                <div className="text-white font-medium">{testimonial.author}</div>
                <div className="text-white text-sm">{testimonial.company}</div>
                <div className="text-white/60 text-sm">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
