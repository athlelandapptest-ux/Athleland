import { Zap, Users, CalendarIcon, Globe, Heart } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Total Body Conditioning",
    description: "Develop strength, stamina, agility, mobility, and power",
  },
  { icon: Users, title: "Team of Two Format", description: "Paired workouts for motivation and accountability" },
  { icon: CalendarIcon, title: "Transparent Training", description: "Every class plan published in advance" },
  { icon: Globe, title: "Expert Coaching", description: "Science-backed conditioning with real-world experience" },
  { icon: Heart, title: "Supportive Community", description: "Like-minded individuals who share your drive" },
]

export function FeatureHighlights() {
  return (
    <section className="py-20 bg-black border-t border-white/5">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 text-white/40 text-sm font-light tracking-wider uppercase mb-6">
            <div className="w-8 h-px bg-accent"></div>
            Why Choose Us
            <div className="w-8 h-px bg-accent"></div>
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-thin text-white mb-6">Why Choose ATHLELAND</h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
            Experience the difference with our comprehensive approach to fitness
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="text-center space-y-6 glass border border-white/5 rounded-2xl p-8 hover:border-white/20 transition-all duration-500 animate-fade-in group"
              style={{ animationDelay: `${0.1 * index}s` }}
            >
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-accent/20 border border-accent/30 rounded-full flex items-center justify-center group-hover:bg-accent/30 transition-all duration-500">
                  <feature.icon className="h-8 w-8 text-accent" />
                </div>
              </div>
              <h3 className="text-white font-light text-xl">{feature.title}</h3>
              <p className="text-white/60 leading-relaxed font-light">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
