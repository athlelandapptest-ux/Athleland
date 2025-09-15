import { Card, CardContent } from "@/components/ui/card"

const testimonials = [
  {
    name: "Shaikha Al-Tukhaim",
    role: "",
    content:
      "I had an amazing time in this class! It's fun, intense, and keeps you engaged from start to finish. The coach is fantastic – super motivating and really knows how to get everyone involved. The energy is high, and you can tell they genuinely care about helping you improve. Definitely worth a try if you're looking for a great workout experience!",
    rating: 5,
  },
  {
    name: "Fahad Aljaser",
    role: "",
    content: "Great coach with great classes, uplifting spirit, and awesome music playlist. The classes have a nice mixture of strength and cardio sessions. Highly recommended.",
    rating: 5,
  },
  {
    name: "Reem Al-Taweel",
    role: "",
    content: "Great variety of workouts. Explains every movement in detail and focuses a lot on posture and how every movement should be done properly. Always motivating to do more.",
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-16 bg-gray-800/50">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-light text-white mb-4">
            Community <span className="text-gray-400">Success</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Real experiences from athletes who've transformed their performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gray-700/30 border-gray-600 backdrop-blur-sm">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }, (_, i) => (
                    <div key={i} className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  ))}
                </div>
                <p className="text-gray-300 font-light leading-relaxed">"{testimonial.content}"</p>
                <div className="space-y-1">
                  <p className="text-white font-medium">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm font-light">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
