"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { WorkoutClass } from "@/lib/workouts"
import Link from "next/link"
import { TvIcon, Star, Share2, Heart, Clock, Users, Zap } from "lucide-react"

interface ModernClassCardProps {
  cls: WorkoutClass
}

export function ModernClassCard({ cls }: ModernClassCardProps) {
  const [showDetails, setShowDetails] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [rating, setRating] = useState(0)
  const [hasRated, setHasRated] = useState(false)
  const [ratingData, setRatingData] = useState({ average: 4.2, count: 15 })

  const safeClass = {
    id: cls?.id || "unknown",
    name: cls?.title || cls?.name || "Untitled Class",
    description: cls?.description || "No description available",
    date: cls?.date || new Date().toISOString().split("T")[0],
    time: cls?.time || "12:00 PM",
    duration: cls?.duration || 60,
    intensity: cls?.intensity || 5,
    classNumber: cls?.classNumber || cls?.id?.slice(-3) || "001",
    classFocus: cls?.classFocus || "General Fitness",
    numberOfBlocks: cls?.numberOfBlocks || 1,
    routine: cls?.routine || { rounds: [] },
    routines: cls?.routines || [],
    workoutBreakdown: cls?.workoutBreakdown || [],
    difficulty: cls?.difficulty || "Intermediate",
    maxParticipants: cls?.maxParticipants || 20,
    instructor: cls?.instructor || "Coach",
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      const favorites = JSON.parse(localStorage.getItem("favorite-classes") || "[]")
      setIsFavorited(favorites.includes(safeClass.id))
    }
  }, [safeClass.id])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedRatingData = localStorage.getItem(`class-rating-data-${safeClass.id}`)
      const savedRating = localStorage.getItem(`class-rating-${safeClass.id}`)

      if (savedRating) {
        setRating(Number.parseInt(savedRating))
        setHasRated(true)
      }

      if (savedRatingData) {
        const data = JSON.parse(savedRatingData)
        setRatingData({
          average: data.average || 0,
          count: data.count || 0,
        })
      } else {
        setRatingData({
          average: Math.random() * 2 + 3,
          count: Math.floor(Math.random() * 50) + 10,
        })
      }
    }
  }, [safeClass.id])

  const handleRating = (newRating: number) => {
    if (hasRated || typeof window === "undefined") return

    setRating(newRating)
    setHasRated(true)

    const newCount = ratingData.count + 1
    const newAverage = (ratingData.average * ratingData.count + newRating) / newCount

    localStorage.setItem(`class-rating-${safeClass.id}`, newRating.toString())
    localStorage.setItem(
      `class-rating-data-${safeClass.id}`,
      JSON.stringify({
        count: newCount,
        average: newAverage,
      }),
    )
  }

  const handleShare = (platform: string) => {
    if (typeof window === "undefined") return

    const classUrl = `${window.location.origin}/training-mode/${safeClass.id}`
    const shareText = `Check out this workout: ${safeClass.name} - ${safeClass.description}`

    switch (platform) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + classUrl)}`)
        break
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(classUrl)}`,
        )
        break
      case "facebook":
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(classUrl)}`)
        break
      case "copy":
        navigator.clipboard.writeText(classUrl)
        alert("Link copied to clipboard!")
        break
    }
    setShowShareMenu(false)
  }

  const toggleFavorite = () => {
    if (typeof window === "undefined") return

    setIsFavorited(!isFavorited)
    const favorites = JSON.parse(localStorage.getItem("favorite-classes") || "[]")
    if (!isFavorited) {
      favorites.push(safeClass.id)
    } else {
      const index = favorites.indexOf(safeClass.id)
      if (index > -1) favorites.splice(index, 1)
    }
    localStorage.setItem("favorite-classes", JSON.stringify(favorites))
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "text-green-400 border-green-400/30 bg-green-400/10"
      case "intermediate":
        return "text-accent border-accent/30 bg-accent/10"
      case "advanced":
        return "text-red-400 border-red-400/30 bg-red-400/10"
      default:
        return "text-white/60 border-white/30 bg-white/10"
    }
  }

  return (
    <Card className="glass border-white/10 shadow-2xl rounded-2xl overflow-hidden group hover:border-white/20 transition-all duration-500 animate-fade-in">
      {/* Favorite Button */}
      <button
        onClick={toggleFavorite}
        className="absolute top-6 right-6 z-10 p-2 rounded-full glass-light hover:bg-white/10 transition-all duration-300"
      >
        <Heart
          className={`h-5 w-5 transition-all duration-300 ${isFavorited ? "fill-accent text-accent" : "text-white/60"}`}
        />
      </button>

      <CardHeader className="p-8 pb-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 glass-light rounded-xl flex items-center justify-center border border-white/10">
              <span className="text-accent font-light text-lg">#{safeClass.classNumber}</span>
            </div>
            <div>
              <CardTitle className="text-white text-xl font-light mb-2">{safeClass.name}</CardTitle>
              <p className="text-white/60 text-sm font-light">{safeClass.instructor}</p>
            </div>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full border text-xs font-light ${getDifficultyColor(safeClass.difficulty)}`}
          >
            {safeClass.difficulty}
          </div>
        </div>

        <CardDescription className="text-white/70 text-base font-light leading-relaxed">
          {safeClass.description}
        </CardDescription>

        {/* Rating Display */}
        <div className="flex items-center gap-3 mt-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-accent text-accent" />
            <span className="text-sm font-light text-white">{ratingData.average.toFixed(1)}</span>
          </div>
          <span className="text-xs text-white/50">({ratingData.count} ratings)</span>
        </div>
      </CardHeader>

      <CardContent className="p-8 pt-0">
        {/* Class Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center glass-light rounded-lg p-4 border border-white/5">
            <Clock className="h-5 w-5 text-accent mx-auto mb-2" />
            <div className="text-lg font-light text-white">{safeClass.duration}</div>
            <div className="text-xs text-white/60 font-light">Minutes</div>
          </div>
          <div className="text-center glass-light rounded-lg p-4 border border-white/5">
            <Users className="h-5 w-5 text-accent mx-auto mb-2" />
            <div className="text-lg font-light text-white">{safeClass.maxParticipants}</div>
            <div className="text-xs text-white/60 font-light">Max</div>
          </div>
          <div className="text-center glass-light rounded-lg p-4 border border-white/5">
            <Zap className="h-5 w-5 text-accent mx-auto mb-2" />
            <div className="text-lg font-light text-white">{safeClass.intensity}</div>
            <div className="text-xs text-white/60 font-light">Intensity</div>
          </div>
        </div>

        {/* Class Details */}
        <div className="space-y-3 mb-6 text-sm">
          <div className="flex justify-between items-center text-white/70">
            <span className="font-light">Date:</span>
            <span className="text-white">{safeClass.date}</span>
          </div>
          <div className="flex justify-between items-center text-white/70">
            <span className="font-light">Time:</span>
            <span className="text-white">{safeClass.time}</span>
          </div>
          <div className="flex justify-between items-center text-white/70">
            <span className="font-light">Focus:</span>
            <span className="text-white">{safeClass.classFocus}</span>
          </div>
        </div>

        {showDetails && (
          <div className="space-y-4 mb-6 p-4 glass-light rounded-lg border border-white/5 animate-fade-in">
            <h4 className="text-white font-light">Workout Breakdown</h4>
            {/* Try workoutBreakdown first (new structure), then routine.rounds (legacy) */}
            {(safeClass.workoutBreakdown && safeClass.workoutBreakdown.length > 0 
              ? safeClass.workoutBreakdown 
              : safeClass.routine.rounds || []
            ).map((round: any, roundIdx: number) => (
              <div key={roundIdx} className="space-y-2">
                <h5 className="text-accent text-sm font-light">{round.title || round.name}</h5>
                <ul className="space-y-1 text-xs text-white/70">
                  {round.exercises?.map((exercise: any, exIdx: number) => {
                    // Handle different exercise data structures with proper unit mapping
                    let displayValue = '';
                    let displayUnit = '';
                    
                    if (exercise.unit) {
                      // If unit is explicitly provided, find the corresponding value
                      displayUnit = exercise.unit;
                      
                      switch (exercise.unit.toLowerCase()) {
                        case 'reps':
                          displayValue = exercise.reps || exercise.value || '';
                          break;
                        case 'seconds':
                        case 'sec':
                          displayValue = exercise.duration || exercise.seconds || exercise.value || '';
                          break;
                        case 'meters':
                        case 'm':
                          displayValue = exercise.distance || exercise.meters || exercise.value || '';
                          break;
                        case 'minutes':
                        case 'min':
                          displayValue = exercise.minutes || exercise.duration || exercise.value || '';
                          break;
                        case 'kg':
                        case 'lbs':
                          displayValue = exercise.weight || exercise.value || '';
                          break;
                        default:
                          displayValue = exercise.value || exercise.reps || exercise.duration || exercise.distance || '';
                      }
                    } else {
                      // Fallback to old logic if no unit is provided
                      if (exercise.reps) {
                        displayValue = exercise.reps;
                        displayUnit = 'reps';
                      } else if (exercise.duration) {
                        displayValue = exercise.duration;
                        displayUnit = 'seconds';
                      } else if (exercise.distance) {
                        displayValue = exercise.distance;
                        displayUnit = 'meters';
                      } else if (exercise.value) {
                        displayValue = exercise.value;
                        displayUnit = '';
                      }
                    }
                    
                    return (
                      <li key={exIdx} className="flex justify-between">
                        <span>{exercise.name}</span>
                        <span className="text-white/50">
                          {displayValue} {displayUnit}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Details & Rating Row */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 bg-transparent border-white/20 text-white/80 hover:bg-white/5 hover:text-white hover:border-white/40 font-light"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide Details" : "View Details"}
            </Button>

            {/* Rating Section */}
            <div className="flex items-center gap-2 glass-light rounded-lg px-4 py-2 border border-white/10">
              <span className="text-xs text-white/70 font-light">Rate:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRating(star)}
                    disabled={hasRated}
                    className={`transition-all duration-200 ${
                      hasRated ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"
                    }`}
                  >
                    <Star
                      className={`h-3 w-3 ${
                        star <= rating ? "fill-accent text-accent" : "text-white/40 hover:text-accent/60"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {hasRated && <span className="text-xs text-green-400">✓</span>}
            </div>
          </div>

          {/* Training Mode Button */}
          <Link href={`/training-mode/${safeClass.id}`} passHref>
            <Button className="w-full bg-accent hover:bg-accent/90 text-black font-medium h-12 rounded-xl group">
              <TvIcon className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
              Enter Training Mode
            </Button>
          </Link>

          {/* Share Button */}
          <div className="relative">
            <Button
              onClick={() => setShowShareMenu(!showShareMenu)}
              variant="outline"
              className="w-full bg-transparent border-white/20 text-white/80 hover:bg-white/5 hover:text-white hover:border-white/40 font-light h-10"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share Class
            </Button>

            {showShareMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 glass rounded-xl border border-white/20 shadow-2xl z-50 animate-fade-in">
                <div className="p-2">
                  {[
                    { platform: "whatsapp", label: "WhatsApp", icon: "📱", color: "text-green-400" },
                    { platform: "twitter", label: "Twitter", icon: "🐦", color: "text-blue-400" },
                    { platform: "facebook", label: "Facebook", icon: "📘", color: "text-blue-600" },
                    { platform: "copy", label: "Copy Link", icon: "🔗", color: "text-white/70" },
                  ].map((option) => (
                    <button
                      key={option.platform}
                      onClick={() => handleShare(option.platform)}
                      className="w-full text-left px-4 py-3 text-sm text-white/80 hover:bg-white/5 rounded-lg flex items-center gap-3 transition-all duration-200"
                    >
                      <span className={option.color}>{option.icon}</span>
                      <span className="font-light">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Click outside to close share menu */}
      {showShareMenu && <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />}
    </Card>
  )
}
