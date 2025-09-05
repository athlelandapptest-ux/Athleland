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
        console.log("🎯 Training Mode: Loading class with ID:", classId)
        console.log("🎯 Training Mode: Class ID type:", typeof classId)
        console.log("🎯 Training Mode: Class ID length:", classId?.length)
        
        const cls = await fetchClassById(classId)
        console.log("🎯 Training Mode: fetchClassById returned:", cls)
        setWorkoutClass(cls)
      } catch (error) {
        console.error("🎯 Training Mode: Error loading class:", error)
      } finally {
        setLoading(false)
      }
    }

    if (classId) {
      loadClass()
    } else {
      console.log("🎯 Training Mode: No classId provided")
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
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center animate-fade-in">
            <h1 className="font-display text-3xl font-thin text-white mb-6">Invalid Workout Data</h1>
            <p className="text-white/60 mb-8 font-light">The workout data is incomplete or invalid.</p>
            <Link href="/">
              <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-medium">Back to Home</Button>
            </Link>
          </div>
        </div>
      )
    }

    const blockCount = workoutData.length

    return (
      <div className={`min-h-screen bg-black text-white ${isFullscreen ? "fixed inset-0 z-50 overflow-auto" : ""}`}>
        {/* Header */}
        <div className="glass border-b border-white/10 p-6 flex justify-between items-center sticky top-0 z-40">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="font-display text-xl font-thin text-white">ATHLETELAND CONDITIONING CLUB</h1>
              <p className="text-white/60 text-sm font-light">
                CLASS #{workoutClass.classNumber || "N/A"} - {workoutClass.title || workoutClass.name || "Unnamed Class"}
              </p>
            </div>
          </div>
          <Button
            onClick={toggleFullscreen}
            variant="outline"
            size="sm"
            className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent"
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>

        {isFullscreen && (
          <div className="sticky top-[88px] z-30 bg-black/90 backdrop-blur-sm border-b border-white/10 py-4">
            <div className="flex items-center justify-center">
              <div className="glass rounded-xl px-6 py-3 border border-white/10 flex items-center gap-6">
                <div className="font-display text-3xl font-thin text-[#FF6B35]">{formatTime(workoutTime)}</div>
                <div className="text-white/60 font-light">/ {workoutClass.duration || 60}:00</div>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePlayPause}
                    size="sm"
                    className={`${isRunning ? "bg-green-500 hover:bg-green-600" : "bg-[#FF6B35] hover:bg-[#FF6B35]/90"} text-white font-medium px-4 py-2 rounded-lg`}
                  >
                    {isRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                    {isRunning ? "Pause" : "Play"}
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent px-4 py-2 rounded-lg"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Combined Timer and Workout View */}
        <div className={`flex flex-col items-center ${isFullscreen ? "py-6" : "py-12"}`}>
          {!isFullscreen && (
            <div className="glass rounded-2xl p-8 text-center border border-white/10 mb-12">
              <div className="font-display text-6xl font-thin text-[#FF6B35] mb-4">{formatTime(workoutTime)}</div>
              <div className="text-white/60 mb-6 font-light">/ {workoutClass.duration || 60}:00</div>
              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handlePlayPause}
                  className={`${isRunning ? "bg-green-500 hover:bg-green-600" : "bg-[#FF6B35] hover:bg-[#FF6B35]/90"} text-white font-medium px-6 py-3 rounded-lg`}
                >
                  {isRunning ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
                  {isRunning ? "Pause" : "Play"}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent px-6 py-3 rounded-lg"
                >
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={toggleFullscreen}
                  variant="outline"
                  className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent px-6 py-3 rounded-lg"
                >
                  <Maximize className="h-5 w-5 mr-2" />
                  Fullscreen
                </Button>
              </div>
            </div>
          )}

          {/* Workout Breakdown Title */}
          <div className={`text-center ${isFullscreen ? "mb-8 mt-4" : "mb-12"}`}>
            <div className="inline-flex items-center gap-2 text-white/40 text-sm font-light tracking-wider uppercase mb-6">
              <div className="w-8 h-px bg-[#FF6B35]"></div>
              Workout Breakdown
              <div className="w-8 h-px bg-[#FF6B35]"></div>
            </div>
            <h2 className={`font-display font-thin text-white ${isFullscreen ? "text-4xl" : "text-5xl"}`}>BREAKDOWN</h2>
          </div>

          <div className={`px-12 pb-12 w-full max-w-7xl ${isFullscreen ? "mt-0" : ""}`}>
            {blockCount === 1 && (
              <div className="glass rounded-2xl p-12 border border-white/10">
                <h3 className="font-display text-4xl font-thin text-white mb-12 text-center">
                  {((workoutData[0] as any).title || (workoutData[0] as any).name || "WORKOUT").toUpperCase()}
                </h3>
                <div className="space-y-6">
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
                        className="flex justify-between items-center text-xl text-white py-6 border-b border-white/10 last:border-b-0"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-10 h-10 bg-[#FF6B35] text-black rounded-full flex items-center justify-center font-medium">
                            {index + 1}
                          </div>
                          <span className="font-light">{(exercise.name || "Exercise").toUpperCase()}</span>
                          {exercise.weight && <span className="text-[#FF6B35] font-light">@{exercise.weight}</span>}
                        </div>
                        <span className="font-display text-2xl font-thin text-[#FF6B35]">
                          {displayValue} {displayUnit.toUpperCase()}
                        </span>
                      </div>
                    );
                  }) || []}
                </div>
              </div>
            )}

            {blockCount === 2 && (
              <div className="grid grid-cols-2 gap-8">
                {(workoutData as any[]).map((round: any, blockIndex: number) => (
                  <div key={blockIndex} className="glass rounded-2xl overflow-hidden border border-white/10">
                    <div className="bg-white/5 p-6 text-center border-b border-white/10">
                      <h3 className="font-display text-2xl font-thin text-white">
                        {["THE PREP", "THE GO"][blockIndex] || `BLOCK ${blockIndex + 1}`}
                      </h3>
                      <p className="text-[#FF6B35] font-light text-sm mt-2">{round.rounds || 1} ROUNDS</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {round.exercises?.map((exercise: any, exerciseIndex: number) => {
                        const displayValue = exercise.value || exercise.reps || exercise.duration || exercise.distance || 0;
                        const displayUnit = exercise.unit || 
                                          (exercise.reps ? 'reps' : '') ||
                                          (exercise.duration ? 'seconds' : '') ||
                                          (exercise.distance ? 'meters' : '') || 'REPS';
                        
                        return (
                          <div
                            key={exerciseIndex}
                            className="flex justify-between items-center glass-light p-4 rounded-xl border border-white/5"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-[#FF6B35] text-black rounded-full flex items-center justify-center font-medium text-sm">
                                {exerciseIndex + 1}
                              </div>
                              <div>
                                <span className="text-white font-light block">
                                  {(exercise.name || "Exercise").toUpperCase()}
                                </span>
                                {exercise.weight && (
                                  <span className="text-white/40 text-xs font-light">@{exercise.weight}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[#FF6B35] font-light text-lg">
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
              <div className="grid grid-cols-3 gap-8">
                {(workoutData as any[]).map((round: any, blockIndex: number) => (
                  <div key={blockIndex} className="glass rounded-2xl overflow-hidden border border-white/10">
                    <div className="bg-white/5 p-6 text-center border-b border-white/10">
                      <h3 className="font-display text-2xl font-thin text-white">
                        {["THE PREP", "THE GO", "THE CORE"][blockIndex] || `BLOCK ${blockIndex + 1}`}
                      </h3>
                      <p className="text-[#FF6B35] font-light text-sm mt-2">{round.rounds || 1} ROUNDS</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {round.exercises?.map((exercise: any, exerciseIndex: number) => {
                        const displayValue = exercise.value || exercise.reps || exercise.duration || exercise.distance || 0;
                        const displayUnit = exercise.unit || 
                                          (exercise.reps ? 'reps' : '') ||
                                          (exercise.duration ? 'seconds' : '') ||
                                          (exercise.distance ? 'meters' : '') || 'REPS';
                        
                        return (
                          <div
                            key={exerciseIndex}
                            className="flex justify-between items-center glass-light p-4 rounded-xl border border-white/5"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-[#FF6B35] text-black rounded-full flex items-center justify-center font-medium text-sm">
                                {exerciseIndex + 1}
                              </div>
                              <div>
                                <span className="text-white font-light block">
                                  {(exercise.name || "Exercise").toUpperCase()}
                                </span>
                                {exercise.weight && (
                                  <span className="text-white/40 text-xs font-light">@{exercise.weight}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[#FF6B35] font-light text-lg">
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
              <div className="grid grid-cols-2 gap-8">
                {(workoutData as any[]).map((round: any, blockIndex: number) => (
                  <div key={blockIndex} className="glass rounded-2xl overflow-hidden border border-white/10">
                    <div className="bg-white/5 p-6 text-center border-b border-white/10">
                      <h3 className="font-display text-2xl font-thin text-white">
                        {["THE PREP", "THE GO", "THE CORE", "THE FINISHER"][blockIndex] || `BLOCK ${blockIndex + 1}`}
                      </h3>
                      <p className="text-[#FF6B35] font-light text-sm mt-2">{round.rounds || 1} ROUNDS</p>
                    </div>
                    <div className="p-6 space-y-4">
                      {round.exercises?.map((exercise: any, exerciseIndex: number) => {
                        const displayValue = exercise.value || exercise.reps || exercise.duration || exercise.distance || 0;
                        const displayUnit = exercise.unit || 
                                          (exercise.reps ? 'reps' : '') ||
                                          (exercise.duration ? 'seconds' : '') ||
                                          (exercise.distance ? 'meters' : '') || 'REPS';
                        
                        return (
                          <div
                            key={exerciseIndex}
                            className="flex justify-between items-center glass-light p-4 rounded-xl border border-white/5"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 bg-[#FF6B35] text-black rounded-full flex items-center justify-center font-medium text-sm">
                                {exerciseIndex + 1}
                              </div>
                              <div>
                                <span className="text-white font-light block">
                                  {(exercise.name || "Exercise").toUpperCase()}
                                </span>
                                {exercise.weight && (
                                  <span className="text-white/40 text-xs font-light">@{exercise.weight}</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[#FF6B35] font-light text-lg">
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
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {(workoutData as any[]).map((round: any, blockIndex: number) => (
                  <div key={blockIndex} className="glass rounded-2xl overflow-hidden border border-white/10">
                    <div className="bg-white/5 p-4 text-center border-b border-white/10">
                      <h3 className="font-display text-xl font-thin text-white">BLOCK {blockIndex + 1}</h3>
                      <p className="text-[#FF6B35] font-light text-sm mt-1">{round.rounds || 1} ROUNDS</p>
                    </div>
                    <div className="p-4 space-y-3">
                      {round.exercises?.map((exercise: any, exerciseIndex: number) => {
                        const displayValue = exercise.value || exercise.reps || exercise.duration || exercise.distance || 0;
                        const displayUnit = exercise.unit || 
                                          (exercise.reps ? 'reps' : '') ||
                                          (exercise.duration ? 'seconds' : '') ||
                                          (exercise.distance ? 'meters' : '') || 'REPS';
                        
                        return (
                          <div
                            key={exerciseIndex}
                            className="flex justify-between items-center glass-light p-3 rounded-lg border border-white/5"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-[#FF6B35] text-black rounded-full flex items-center justify-center font-medium text-xs">
                                {exerciseIndex + 1}
                              </div>
                              <div>
                                <span className="text-white font-light text-sm">
                                  {(exercise.name || "Exercise").toUpperCase()}
                                </span>
                                {exercise.weight && (
                                  <div className="text-white/40 text-xs font-light">@{exercise.weight}</div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[#FF6B35] font-light text-sm">
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
          <div className="text-center max-w-4xl">
            <p className="text-white/60 font-light text-lg mb-4">
              Class Focus: {workoutClass.classFocus || "General Fitness"}
            </p>
            <p className="text-white/40 font-light leading-relaxed">
              Perfect for building cardiovascular endurance and functional strength essential for peak athletic
              performance. Focus on maintaining steady pace throughout all movements.
            </p>
          </div>

          {/* Copyright */}
          <div className="mt-12 text-white/30 text-sm font-light">@2025 ATHLETELAND. All Rights Reserved</div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 border-2 border-[#FF6B35] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white/70 font-light">Loading training mode...</p>
        </div>
      </div>
    )
  }

  if (!workoutClass) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <h1 className="font-display text-3xl font-thin text-white mb-6">Class Not Found</h1>
          <p className="text-white/60 mb-8 font-light">The requested class could not be found.</p>
          <Link href="/">
            <Button className="bg-[#FF6B35] hover:bg-[#FF6B35]/90 text-white font-medium">Back to Home</Button>
          </Link>
        </div>
      </div>
    )
  }

  return renderCombinedTrainingView()
}
