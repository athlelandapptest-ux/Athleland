"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Play, Pause, RotateCcw, Maximize, ArrowLeft, Minimize } from "lucide-react"
import Link from "next/link"
import { fetchClassById } from "@/app/actions"
import type { WorkoutClass } from "@/lib/workouts"

export default function TrainingModePage() {
  const params = useParams()
  const classId = params.classId as string

  const [workoutClass, setWorkoutClass] = useState<WorkoutClass | null>(null)
  const [loading, setLoading] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [workoutTime, setWorkoutTime] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const loadClass = async () => {
      try {
        const cls = await fetchClassById(classId)
        setWorkoutClass(cls)
      } catch (error) {
        console.error("Error loading class:", error)
      } finally {
        setLoading(false)
      }
    }

    if (classId) {
      loadClass()
    } else {
      setLoading(false)
    }
  }, [classId])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        setWorkoutTime((prev) => prev + 1)
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handlePlayPause = () => {
    setIsRunning(!isRunning)
  }

  const handleReset = () => {
    setIsRunning(false)
    setWorkoutTime(0)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const renderCombinedTrainingView = () => {
    if (!workoutClass) return null

    // Handle both new workoutBreakdown structure and legacy routine.rounds structure
    const workoutData = workoutClass.workoutBreakdown && workoutClass.workoutBreakdown.length > 0 
      ? workoutClass.workoutBreakdown 
      : workoutClass.routine?.rounds || [];

    if (workoutData.length === 0) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 tv:px-8 4k:px-12">
          <div className="text-center animate-fade-in max-w-sm tv:max-w-2xl 4k:max-w-4xl">
            <h1 className="font-display text-2xl md:text-3xl tv:text-5xl 4k:text-8xl font-thin text-white mb-6 tv:mb-8 4k:mb-12">Invalid Workout Data</h1>
            <p className="text-white/60 mb-8 tv:mb-12 4k:mb-16 font-light text-sm md:text-base tv:text-xl 4k:text-3xl">The workout data is incomplete or invalid.</p>
            <Link href="/">
              <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-medium w-full tv:text-xl tv:py-4 tv:px-8 4k:text-3xl 4k:py-6 4k:px-12">Back to Home</Button>
            </Link>
          </div>
        </div>
      )
    }

    const blockCount = workoutData.length

    return (
      <div className={`min-h-screen bg-black text-white ${isFullscreen ? "fixed inset-0 z-50 overflow-auto" : ""}`}>
        {/* Header */}
        <div className="glass border-b border-white/10 p-4 md:p-6 tv:p-8 4k:p-12 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-3 md:gap-6 tv:gap-8 4k:gap-12 min-w-0 flex-1">
            <Link href="/" className="text-white/70 hover:text-white transition-colors flex-shrink-0">
              <ArrowLeft className="h-5 w-5 md:h-6 md:w-6 tv:h-8 tv:w-8 4k:h-12 4k:w-12" />
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="font-display text-sm md:text-xl tv:text-3xl 4k:text-5xl font-thin text-white truncate">ATHLETELAND CONDITIONING CLUB</h1>
              <p className="text-white/60 text-xs md:text-sm tv:text-lg 4k:text-2xl font-light truncate">
                CLASS #{workoutClass.classNumber || "N/A"} - {workoutClass.title || workoutClass.name || "Unnamed Class"}
              </p>
            </div>
          </div>
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent flex-shrink-0 ml-2 tv:text-lg tv:px-6 tv:py-3 4k:text-2xl 4k:px-8 4k:py-4"
          >
            {isFullscreen ? <Minimize className="h-4 w-4 md:h-5 md:w-5 tv:h-6 tv:w-6 4k:h-8 4k:w-8" /> : <Maximize className="h-4 w-4 md:h-5 md:w-5 tv:h-6 tv:w-6 4k:h-8 4k:w-8" />}
          </Button>
        </div>

        {isFullscreen && (
          <div className="sticky top-[88px] tv:top-[112px] 4k:top-[144px] z-30 bg-black/90 backdrop-blur-sm border-b border-white/10 py-4 tv:py-6 4k:py-8">
            <div className="flex items-center justify-center">
              <div className="glass rounded-xl px-6 py-3 tv:px-10 tv:py-6 4k:px-16 4k:py-10 border border-white/10 flex items-center gap-6 tv:gap-10 4k:gap-16">
                <div className="font-display text-3xl tv:text-6xl 4k:text-9xl font-thin text-[#FF6B35]">{formatTime(workoutTime)}</div>
                <div className="text-white/60 font-light tv:text-2xl 4k:text-4xl">/ {workoutClass.duration || 60}:00</div>
                <div className="flex gap-2 tv:gap-4 4k:gap-6">
                  <Button
                    onClick={handlePlayPause}
                    size="sm"
                    className={`${isRunning ? "bg-green-500 hover:bg-green-600" : "bg-[#FF6B35] hover:bg-[#FF6B35]/90"} text-white font-medium px-4 py-2 rounded-lg tv:px-8 tv:py-4 tv:text-xl 4k:px-12 4k:py-6 4k:text-3xl`}
                  >
                    {isRunning ? <Pause className="h-4 w-4 mr-1 tv:h-6 tv:w-6 tv:mr-2 4k:h-8 4k:w-8 4k:mr-4" /> : <Play className="h-4 w-4 mr-1 tv:h-6 tv:w-6 tv:mr-2 4k:h-8 4k:w-8 4k:mr-4" />}
                    {isRunning ? "Pause" : "Play"}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent px-4 py-2 rounded-lg tv:px-8 tv:py-4 tv:text-xl 4k:px-12 4k:py-6 4k:text-3xl"
                  >
                    <RotateCcw className="h-4 w-4 tv:h-6 tv:w-6 4k:h-8 4k:w-8" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Combined Timer and Workout View */}
        <div className={`flex flex-col items-center ${isFullscreen ? "py-6 tv:py-8 4k:py-12" : "py-12 tv:py-16 4k:py-24"}`}>
          {!isFullscreen && (
            <div className="glass rounded-2xl p-6 md:p-8 tv:p-12 4k:p-16 text-center border border-white/10 mb-8 md:mb-12 tv:mb-16 4k:mb-24">
              <div className="font-display text-4xl md:text-5xl lg:text-6xl tv:text-8xl 4k:text-12xl font-thin text-[#FF6B35] mb-3 md:mb-4 tv:mb-6 4k:mb-8">{formatTime(workoutTime)}</div>
              <div className="text-white/60 mb-4 md:mb-6 tv:mb-8 4k:mb-12 font-light text-sm md:text-base tv:text-2xl 4k:text-4xl">/ {workoutClass.duration || 60}:00</div>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 tv:gap-6 4k:gap-8 justify-center">
                <Button
                  onClick={handlePlayPause}
                  className={`${isRunning ? "bg-green-500 hover:bg-green-600" : "bg-[#FF6B35] hover:bg-[#FF6B35]/90"} text-white font-medium px-4 md:px-6 tv:px-10 4k:px-16 py-2 md:py-3 tv:py-5 4k:py-8 rounded-lg text-sm md:text-base tv:text-2xl 4k:text-4xl w-full sm:w-auto`}
                >
                  {isRunning ? <Pause className="h-4 w-4 md:h-5 md:w-5 tv:h-8 tv:w-8 4k:h-12 4k:w-12 mr-1 md:mr-2 tv:mr-4 4k:mr-6" /> : <Play className="h-4 w-4 md:h-5 md:w-5 tv:h-8 tv:w-8 4k:h-12 4k:w-12 mr-1 md:mr-2 tv:mr-4 4k:mr-6" />}
                  {isRunning ? "Pause" : "Play"}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent px-4 md:px-6 tv:px-10 4k:px-16 py-2 md:py-3 tv:py-5 4k:py-8 rounded-lg text-sm md:text-base tv:text-2xl 4k:text-4xl w-full sm:w-auto"
                >
                  <RotateCcw className="h-4 w-4 md:h-5 md:w-5 tv:h-8 tv:w-8 4k:h-12 4k:w-12 mr-1 md:mr-2 tv:mr-4 4k:mr-6" />
                  Reset
                </Button>
                <Button
                  onClick={toggleFullscreen}
                  variant="outline"
                  className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent px-4 md:px-6 tv:px-10 4k:px-16 py-2 md:py-3 tv:py-5 4k:py-8 rounded-lg text-sm md:text-base tv:text-2xl 4k:text-4xl w-full sm:w-auto"
                >
                  <Maximize className="h-4 w-4 md:h-5 md:w-5 tv:h-8 tv:w-8 4k:h-12 4k:w-12 mr-1 md:mr-2 tv:mr-4 4k:mr-6" />
                  Fullscreen
                </Button>
              </div>
            </div>
          )}

          {/* Workout Breakdown Title */}
          <div className={`text-center ${isFullscreen ? "mb-6 md:mb-8 tv:mb-12 4k:mb-16 mt-4 tv:mt-6 4k:mt-8" : "mb-8 md:mb-12 tv:mb-16 4k:mb-24"}`}>
            <div className="inline-flex items-center gap-2 tv:gap-4 4k:gap-6 text-white/40 text-xs md:text-sm tv:text-xl 4k:text-3xl font-light tracking-wider uppercase mb-4 md:mb-6 tv:mb-8 4k:mb-12">
              <div className="w-6 md:w-8 tv:w-16 4k:w-24 h-px bg-[#FF6B35]"></div>
              Workout Breakdown
              <div className="w-6 md:w-8 tv:w-16 4k:w-24 h-px bg-[#FF6B35]"></div>
            </div>
            <h2 className={`font-display font-thin text-white ${isFullscreen ? "text-2xl md:text-3xl lg:text-4xl tv:text-6xl 4k:text-9xl" : "text-3xl md:text-4xl lg:text-5xl tv:text-7xl 4k:text-12xl"}`}>BREAKDOWN</h2>
          </div>

          <div className={`px-4 md:px-8 lg:px-12 tv:px-16 4k:px-24 pb-8 md:pb-12 tv:pb-16 4k:pb-24 w-full max-w-7xl tv:max-w-none 4k:max-w-none ${isFullscreen ? "mt-0" : ""}`}>
            {blockCount === 1 && (
              <div className="glass rounded-2xl p-6 md:p-8 lg:p-12 tv:p-16 4k:p-24 border border-white/10">
                <h3 className="font-display text-2xl md:text-3xl lg:text-4xl tv:text-6xl 4k:text-9xl font-thin text-white mb-8 md:mb-12 tv:mb-16 4k:mb-24 text-center">
                  {((workoutData[0] as any).title || (workoutData[0] as any).name || "WORKOUT").toUpperCase()}
                </h3>
                <div className="space-y-4 md:space-y-6 tv:space-y-8 4k:space-y-12">
                  {(workoutData[0] as any).exercises?.map((exercise: any, index: number) => {
                    // Handle different exercise data structures
                    const displayValue = exercise.value || exercise.reps || exercise.duration || exercise.distance || 0;
                    const displayUnit = exercise.unit || 
                                      (exercise.reps ? 'reps' : '') ||
                                      (exercise.duration ? 'seconds' : '') ||
                                      (exercise.distance ? 'meters' : '') || 'REPS';
                    
                    return (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-lg md:text-xl tv:text-3xl 4k:text-5xl text-white py-4 md:py-6 tv:py-8 4k:py-12 border-b border-white/10 last:border-b-0 gap-2 sm:gap-4 tv:gap-6 4k:gap-8"
                      >
                        <div className="flex items-center gap-4 md:gap-6 tv:gap-8 4k:gap-12">
                          <div className="w-8 h-8 md:w-10 md:h-10 tv:w-16 tv:h-16 4k:w-24 4k:h-24 bg-[#FF6B35] text-black rounded-full flex items-center justify-center font-medium text-sm md:text-base tv:text-2xl 4k:text-4xl flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="font-light text-sm md:text-lg lg:text-xl tv:text-3xl 4k:text-5xl">{(exercise.name || "Exercise").toUpperCase()}</span>
                          {exercise.weight && <span className="text-[#FF6B35] font-light text-sm md:text-lg tv:text-2xl 4k:text-4xl">@{exercise.weight}</span>}
                        </div>
                        <span className="font-display text-lg md:text-xl lg:text-2xl tv:text-4xl 4k:text-6xl font-thin text-[#FF6B35] ml-12 sm:ml-0">
                          {displayValue} {displayUnit.toUpperCase()}
                        </span>
                      </div>
                    );
                  }) || []}
                </div>
              </div>
            )}

            {blockCount === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 tv:gap-12 4k:gap-16">
                {(workoutData as any[]).map((round: any, blockIndex: number) => (
                  <div key={blockIndex} className="glass rounded-2xl overflow-hidden border border-white/10">
                    <div className="bg-white/5 p-4 md:p-6 tv:p-8 4k:p-12 text-center border-b border-white/10">
                      <h3 className="font-display text-xl md:text-2xl tv:text-4xl 4k:text-6xl font-thin text-white">
                        {["THE PREP", "THE GO"][blockIndex] || `BLOCK ${blockIndex + 1}`}
                      </h3>
                      <p className="text-[#FF6B35] font-light text-xs md:text-sm tv:text-xl 4k:text-3xl mt-2 tv:mt-4 4k:mt-6">{round.rounds || 1} ROUNDS</p>
                    </div>
                    <div className="p-4 md:p-6 tv:p-8 4k:p-12 space-y-3 md:space-y-4 tv:space-y-6 4k:space-y-8">
                      {round.exercises?.map((exercise: any, exerciseIndex: number) => {
                        const displayValue = exercise.value || exercise.reps || exercise.duration || exercise.distance || 0;
                        const displayUnit = exercise.unit || 
                                          (exercise.reps ? 'reps' : '') ||
                                          (exercise.duration ? 'seconds' : '') ||
                                          (exercise.distance ? 'meters' : '') || 'REPS';
                        
                        return (
                          <div
                            key={exerciseIndex}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center glass-light p-3 md:p-4 tv:p-6 4k:p-8 rounded-xl border border-white/5 gap-2 sm:gap-4 tv:gap-6 4k:gap-8"
                          >
                            <div className="flex items-center gap-3 md:gap-4 tv:gap-6 4k:gap-8">
                              <div className="w-6 h-6 md:w-8 md:h-8 tv:w-12 tv:h-12 4k:w-16 4k:h-16 bg-[#FF6B35] text-black rounded-full flex items-center justify-center font-medium text-xs md:text-sm tv:text-xl 4k:text-3xl flex-shrink-0">
                                {exerciseIndex + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-white font-light block text-sm md:text-base tv:text-2xl 4k:text-4xl">
                                  {(exercise.name || "Exercise").toUpperCase()}
                                </span>
                                {exercise.weight && (
                                  <span className="text-white/40 text-xs tv:text-lg 4k:text-2xl font-light">@{exercise.weight}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-left sm:text-right ml-9 sm:ml-0">
                              <span className="text-[#FF6B35] font-light text-base md:text-lg tv:text-3xl 4k:text-5xl">
                                {displayValue} {displayUnit.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        );
                      }) || []}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {blockCount === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 tv:gap-12 4k:gap-16">
                {(workoutData as any[]).map((round: any, blockIndex: number) => (
                  <div key={blockIndex} className="glass rounded-2xl overflow-hidden border border-white/10">
                    <div className="bg-white/5 p-4 md:p-6 tv:p-8 4k:p-12 text-center border-b border-white/10">
                      <h3 className="font-display text-lg md:text-xl lg:text-2xl tv:text-3xl 4k:text-5xl font-thin text-white">
                        {["THE PREP", "THE GO", "THE CORE"][blockIndex] || `BLOCK ${blockIndex + 1}`}
                      </h3>
                      <p className="text-[#FF6B35] font-light text-xs md:text-sm tv:text-lg 4k:text-2xl mt-2 tv:mt-4 4k:mt-6">{round.rounds || 1} ROUNDS</p>
                    </div>
                    <div className="p-3 md:p-4 lg:p-6 tv:p-8 4k:p-12 space-y-3 md:space-y-4 tv:space-y-6 4k:space-y-8">
                      {round.exercises?.map((exercise: any, exerciseIndex: number) => {
                        const displayValue = exercise.value || exercise.reps || exercise.duration || exercise.distance || 0;
                        const displayUnit = exercise.unit || 
                                          (exercise.reps ? 'reps' : '') ||
                                          (exercise.duration ? 'seconds' : '') ||
                                          (exercise.distance ? 'meters' : '') || 'REPS';
                        
                        return (
                          <div
                            key={exerciseIndex}
                            className="flex justify-between items-center glass-light p-4 tv:p-6 4k:p-8 rounded-xl border border-white/5"
                          >
                            <div className="flex items-center gap-4 tv:gap-6 4k:gap-8">
                              <div className="w-8 h-8 tv:w-12 tv:h-12 4k:w-16 4k:h-16 bg-[#FF6B35] text-black rounded-full flex items-center justify-center font-medium text-sm tv:text-xl 4k:text-3xl">
                                {exerciseIndex + 1}
                              </div>
                              <div>
                                <span className="text-white font-light block tv:text-xl 4k:text-3xl">
                                  {(exercise.name || "Exercise").toUpperCase()}
                                </span>
                                {exercise.weight && (
                                  <span className="text-white/40 text-xs tv:text-base 4k:text-xl font-light">@{exercise.weight}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[#FF6B35] font-light text-lg tv:text-2xl 4k:text-4xl">
                                {displayValue} {displayUnit.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        );
                      }) || []}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {blockCount === 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 lg:gap-8 tv:gap-12 4k:gap-16">
                {(workoutData as any[]).map((round: any, blockIndex: number) => (
                  <div key={blockIndex} className="glass rounded-2xl overflow-hidden border border-white/10">
                    <div className="bg-white/5 p-4 md:p-6 tv:p-8 4k:p-12 text-center border-b border-white/10">
                      <h3 className="font-display text-lg md:text-xl lg:text-2xl tv:text-3xl 4k:text-5xl font-thin text-white">
                        {["THE PREP", "THE GO", "THE CORE", "THE FINISHER"][blockIndex] || `BLOCK ${blockIndex + 1}`}
                      </h3>
                      <p className="text-[#FF6B35] font-light text-xs md:text-sm tv:text-lg 4k:text-2xl mt-2 tv:mt-4 4k:mt-6">{round.rounds || 1} ROUNDS</p>
                    </div>
                    <div className="p-3 md:p-4 lg:p-6 tv:p-8 4k:p-12 space-y-3 md:space-y-4 tv:space-y-6 4k:space-y-8">
                      {round.exercises?.map((exercise: any, exerciseIndex: number) => {
                        const displayValue = exercise.value || exercise.reps || exercise.duration || exercise.distance || 0;
                        const displayUnit = exercise.unit || 
                                          (exercise.reps ? 'reps' : '') ||
                                          (exercise.duration ? 'seconds' : '') ||
                                          (exercise.distance ? 'meters' : '') || 'REPS';
                        
                        return (
                          <div
                            key={exerciseIndex}
                            className="flex justify-between items-center glass-light p-4 tv:p-6 4k:p-8 rounded-xl border border-white/5"
                          >
                            <div className="flex items-center gap-4 tv:gap-6 4k:gap-8">
                              <div className="w-8 h-8 tv:w-12 tv:h-12 4k:w-16 4k:h-16 bg-[#FF6B35] text-black rounded-full flex items-center justify-center font-medium text-sm tv:text-xl 4k:text-3xl">
                                {exerciseIndex + 1}
                              </div>
                              <div>
                                <span className="text-white font-light block tv:text-xl 4k:text-3xl">
                                  {(exercise.name || "Exercise").toUpperCase()}
                                </span>
                                {exercise.weight && (
                                  <span className="text-white/40 text-xs tv:text-base 4k:text-xl font-light">@{exercise.weight}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[#FF6B35] font-light text-lg tv:text-2xl 4k:text-4xl">
                                {displayValue} {displayUnit.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        );
                      }) || []}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {blockCount > 4 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 tv:gap-8 4k:gap-12">
                {(workoutData as any[]).map((round: any, blockIndex: number) => (
                  <div key={blockIndex} className="glass rounded-2xl overflow-hidden border border-white/10">
                    <div className="bg-white/5 p-3 md:p-4 tv:p-6 4k:p-8 text-center border-b border-white/10">
                      <h3 className="font-display text-lg md:text-xl tv:text-2xl 4k:text-4xl font-thin text-white">BLOCK {blockIndex + 1}</h3>
                      <p className="text-[#FF6B35] font-light text-xs md:text-sm tv:text-lg 4k:text-2xl mt-1 tv:mt-2 4k:mt-4">{round.rounds || 1} ROUNDS</p>
                    </div>
                    <div className="p-3 md:p-4 tv:p-6 4k:p-8 space-y-2 md:space-y-3 tv:space-y-4 4k:space-y-6">
                      {round.exercises?.map((exercise: any, exerciseIndex: number) => {
                        const displayValue = exercise.value || exercise.reps || exercise.duration || exercise.distance || 0;
                        const displayUnit = exercise.unit || 
                                          (exercise.reps ? 'reps' : '') ||
                                          (exercise.duration ? 'seconds' : '') ||
                                          (exercise.distance ? 'meters' : '') || 'REPS';
                        
                        return (
                          <div
                            key={exerciseIndex}
                            className="flex flex-col sm:flex-row sm:justify-between sm:items-center glass-light p-2 md:p-3 tv:p-4 4k:p-6 rounded-lg border border-white/5 gap-2 sm:gap-3 tv:gap-4 4k:gap-6"
                          >
                            <div className="flex items-center gap-2 md:gap-3 tv:gap-4 4k:gap-6">
                              <div className="w-5 h-5 md:w-6 md:h-6 tv:w-8 tv:h-8 4k:w-12 4k:h-12 bg-[#FF6B35] text-black rounded-full flex items-center justify-center font-medium text-xs tv:text-base 4k:text-2xl flex-shrink-0">
                                {exerciseIndex + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <span className="text-white font-light text-xs md:text-sm tv:text-lg 4k:text-2xl">
                                  {(exercise.name || "Exercise").toUpperCase()}
                                </span>
                                {exercise.weight && (
                                  <div className="text-white/40 text-xs tv:text-sm 4k:text-lg font-light">@{exercise.weight}</div>
                                )}
                              </div>
                            </div>
                            <div className="text-left sm:text-right ml-7 sm:ml-0">
                              <span className="text-[#FF6B35] font-light text-xs md:text-sm tv:text-lg 4k:text-2xl">
                                {displayValue} {displayUnit.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        );
                      }) || []}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom info */}
          <div className="text-center max-w-4xl tv:max-w-6xl 4k:max-w-8xl">
            <p className="text-white/60 font-light text-lg tv:text-2xl 4k:text-4xl mb-4 tv:mb-6 4k:mb-8">
              Class Focus: {workoutClass.classFocus || "General Fitness"}
            </p>
            <p className="text-white/40 font-light leading-relaxed tv:text-xl tv:leading-relaxed 4k:text-3xl 4k:leading-relaxed">
              Perfect for building cardiovascular endurance and functional strength essential for peak athletic
              performance. Focus on maintaining steady pace throughout all movements.
            </p>
          </div>

          {/* Copyright */}
          <div className="mt-12 tv:mt-16 4k:mt-24 text-white/30 text-sm tv:text-lg 4k:text-2xl font-light">@2025 ATHLETELAND. All Rights Reserved</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 tv:px-8 4k:px-12">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 md:w-16 md:h-16 tv:w-24 tv:h-24 4k:w-32 4k:h-32 border-2 tv:border-4 4k:border-6 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-6 tv:mb-8 4k:mb-12"></div>
          <p className="text-white/70 font-light text-sm md:text-base tv:text-xl 4k:text-3xl">Loading training mode...</p>
        </div>
      </div>
    )
  }

  if (!workoutClass) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4 tv:px-8 4k:px-12">
        <div className="text-center animate-fade-in max-w-sm tv:max-w-2xl 4k:max-w-4xl">
          <h1 className="font-display text-2xl md:text-3xl tv:text-5xl 4k:text-8xl font-thin text-white mb-6 tv:mb-8 4k:mb-12">Class Not Found</h1>
          <p className="text-white/60 mb-8 tv:mb-12 4k:mb-16 font-light text-sm md:text-base tv:text-xl 4k:text-3xl">The requested class could not be found.</p>
          <Link href="/">
            <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-medium w-full tv:text-xl tv:py-4 tv:px-8 4k:text-3xl 4k:py-6 4k:px-12">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return renderCombinedTrainingView()
}
