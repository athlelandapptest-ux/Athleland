"use client"

import { Check } from "lucide-react"

export function SponsorshipBenefits() {
  const benefits = [
    {
      title: "Brand Visibility",
      description: "Premium placement across our facility and digital platforms",
      features: [
        "Logo placement in main training areas",
        "Website and social media features",
        "Event co-branding opportunities",
      ],
    },
    {
      title: "Community Access",
      description: "Direct connection to Kuwait's fitness enthusiasts",
      features: ["Member networking events", "Product demonstration opportunities", "Exclusive member discounts"],
    },
    {
      title: "Content Partnership",
      description: "Collaborative content creation and marketing",
      features: ["Joint social media campaigns", "Fitness content collaboration", "Athlete endorsement opportunities"],
    },
  ]

  return (
    <section className="bg-gray-900 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-thin tracking-[0.1em] text-white mb-4">PARTNERSHIP BENEFITS</h2>
          <div className="w-16 h-px bg-white mx-auto mb-6" />
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            Unlock exclusive opportunities to connect with our dedicated fitness community
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="bg-black/50 p-8 border border-gray-800">
              <h3 className="text-xl font-medium text-white mb-4 tracking-wide">{benefit.title}</h3>
              <p className="text-white/70 mb-6 leading-relaxed">{benefit.description}</p>
              <ul className="space-y-3">
                {benefit.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3 text-sm text-white/80">
                    <Check className="w-4 h-4 text-white mt-0.5 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
