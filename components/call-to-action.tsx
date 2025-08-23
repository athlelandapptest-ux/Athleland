import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"

export function CallToAction() {
  return (
    <section className="py-20 bg-black border-t border-white/5">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <div className="inline-flex items-center gap-2 text-white/40 text-sm font-light tracking-wider uppercase mb-6">
            <div className="w-8 h-px bg-accent"></div>
            Get Started
            <div className="w-8 h-px bg-accent"></div>
          </div>

          <h2 className="font-display text-4xl lg:text-6xl font-thin text-white mb-8">
            Ready to Transform Your <span className="text-accent">Fitness Journey</span>?
          </h2>

          <p className="text-white/60 text-lg lg:text-xl max-w-3xl mx-auto mb-12 font-light leading-relaxed">
            Join our community of dedicated athletes and experience the difference that structured, high-intensity
            training can make.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <Button className="bg-accent hover:bg-accent/90 text-black font-medium px-8 py-4 text-lg group">
              <Zap className="h-5 w-5 mr-2" />
              Start Your Journey
              <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>

            <Button
              variant="outline"
              className="bg-transparent text-white border-white/20 hover:bg-white/5 hover:border-white/40 px-8 py-4 text-lg font-light"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
