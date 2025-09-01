"use client"

import { Card, CardContent } from "@/components/ui/card"

interface Exercise {
  name: string
  value: number
  unit: string
  equipment?: string
  weight?: string
}

interface Round {
  name: string
  exercises: Exercise[]
  rounds?: number
}

interface VisitorWorkoutBreakdownProps {
  date?: string
  time?: string
  focus?: string
  rounds: Round[]
  className?: string
}

export function VisitorWorkoutBreakdown({
  date = "2025-01-30",
  time = "6:00 AM",
  focus = "Functional Fitness",
  rounds,
  className = "",
}: VisitorWorkoutBreakdownProps) {
  const formatDistance = (value: number, unit: string) => {
    if (unit.toLowerCase().includes("meter") || unit.toLowerCase().includes("m")) {
      if (value >= 1000) {
        return `${value} meters`
      }
      return `${value} meters`
    }
    if (unit.toLowerCase().includes("km")) {
      return `${value} km`
    }
    return `${value} ${unit.toLowerCase()}`
  }

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Header Information */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between items-center text-white/80">
          <span className="text-lg">Date:</span>
          <span className="text-lg font-medium">{date}</span>
        </div>
        <div className="flex justify-between items-center text-white/80">
          <span className="text-lg">Time:</span>
          <span className="text-lg font-medium">{time}</span>
        </div>
        <div className="flex justify-between items-center text-white/80">
          <span className="text-lg">Focus:</span>
          <span className="text-lg font-medium">{focus}</span>
        </div>
      </div>

      {/* Workout Breakdown Container */}
      <Card className="bg-black/40 border border-white/20 rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <h2 className="text-white text-2xl font-medium mb-8">Workout Breakdown</h2>

          <div className="space-y-8">
            {(rounds || []).map((round, roundIndex) => (
              <div key={roundIndex} className="space-y-4">
                {/* Block Title */}
                <h3 className="text-[#FF6B35] text-xl font-medium">
                  Block {roundIndex + 1} - {(round.name || '').replace(/^Block \d+ - /, "")}
                </h3>

                {/* Exercises */}
                <div className="space-y-3 ml-0">
                  {(round.exercises || []).map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="flex justify-between items-center">
                      <span className="text-white/90 text-lg">{exercise.name || 'Unknown Exercise'}</span>
                      <span className="text-white/60 text-lg">{formatDistance(exercise.value || 0, exercise.unit || '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
