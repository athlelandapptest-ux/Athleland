"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Play, RotateCcw, Timer } from "lucide-react"

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

interface WorkoutBreakdownProps {
  rounds: Round[]
  className?: string
}

export function MobileWorkoutBreakdown({ rounds, className = "" }: WorkoutBreakdownProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set())
  const [currentBlock, setCurrentBlock] = useState<number | null>(null)
  const [isWorkoutActive, setIsWorkoutActive] = useState(false)
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set())

  const toggleBlock = (index: number) => {
    const newExpanded = new Set(expandedBlocks)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedBlocks(newExpanded)
  }

  const getBlockTitle = (index: number) => {
    const blockNames = ["THE PREP", "THE GO", "THE CORE", "THE FINISH", "THE POWER", "THE ENDURANCE"]
    return blockNames[index] || `BLOCK ${index + 1}`
  }

  const startWorkout = () => {
    setIsWorkoutActive(true)
    setCurrentBlock(0)
    setExpandedBlocks(new Set([0]))
  }

  const nextBlock = () => {
    if (currentBlock !== null && currentBlock < rounds.length - 1) {
      const nextBlockIndex = currentBlock + 1
      setCurrentBlock(nextBlockIndex)
      setExpandedBlocks(new Set([nextBlockIndex]))
    }
  }

  const toggleExerciseComplete = (blockIndex: number, exerciseIndex: number) => {
    const exerciseKey = `${blockIndex}-${exerciseIndex}`
    const newCompleted = new Set(completedExercises)
    if (newCompleted.has(exerciseKey)) {
      newCompleted.delete(exerciseKey)
    } else {
      newCompleted.add(exerciseKey)
    }
    setCompletedExercises(newCompleted)
  }

  const resetWorkout = () => {
    setIsWorkoutActive(false)
    setCurrentBlock(null)
    setCompletedExercises(new Set())
    setExpandedBlocks(new Set())
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-center mb-6">
        <div className="text-xs text-white/60 tracking-[0.2em] mb-2">WORKOUT BREAKDOWN</div>
        <h2 className="text-2xl font-display font-thin text-white tracking-[0.1em]">BREAKDOWN</h2>
      </div>

      {/* Workout Controls */}
      <Card className="glass border-white/10 mb-4">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {!isWorkoutActive ? (
              <Button onClick={startWorkout} className="bg-accent hover:bg-accent/90 text-black flex-1">
                <Play className="h-4 w-4 mr-2" />
                Start Workout
              </Button>
            ) : (
              <>
                <Button
                  onClick={nextBlock}
                  disabled={currentBlock === null || currentBlock >= rounds.length - 1}
                  className="bg-accent hover:bg-accent/90 text-black flex-1"
                >
                  Next Block
                </Button>
                <Button onClick={resetWorkout} variant="outline" className="flex-1 bg-transparent">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </>
            )}
          </div>
          {isWorkoutActive && currentBlock !== null && (
            <div className="mt-3 text-center">
              <Badge className="bg-accent/20 text-accent border-accent/30">
                Block {currentBlock + 1} of {rounds.length}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {rounds.map((round, roundIndex) => {
        const isCurrentBlock = currentBlock === roundIndex
        const isBlockCompleted = currentBlock !== null && roundIndex < currentBlock

        return (
          <Card
            key={roundIndex}
            className={`glass border-white/10 overflow-hidden ${
              isCurrentBlock ? "border-accent/50 bg-accent/5" : ""
            } ${isBlockCompleted ? "opacity-60" : ""}`}
          >
            <div className="cursor-pointer" onClick={() => toggleBlock(roundIndex)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-medium text-base tracking-wide">{getBlockTitle(roundIndex)}</h3>
                      {isCurrentBlock && (
                        <div className="flex items-center gap-1 text-accent">
                          <Timer className="h-3 w-3" />
                          <span className="text-xs">ACTIVE</span>
                        </div>
                      )}
                      {isBlockCompleted && <Badge className="bg-green-600/20 text-green-400 text-xs">COMPLETED</Badge>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-accent/20 text-accent border-accent/30 text-xs">
                        {round.rounds || 3} ROUNDS
                      </Badge>
                      <span className="text-white/60 text-xs">{round.exercises.length} exercises</span>
                    </div>
                  </div>
                  <div className="text-white/60">
                    {expandedBlocks.has(roundIndex) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </CardContent>
            </div>

            {expandedBlocks.has(roundIndex) && (
              <div className="border-t border-white/10">
                <CardContent className="p-4 space-y-3">
                  {round.exercises.map((exercise, exerciseIndex) => {
                    const exerciseKey = `${roundIndex}-${exerciseIndex}`
                    const isCompleted = completedExercises.has(exerciseKey)

                    return (
                      <div
                        key={exerciseIndex}
                        className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                          isCompleted ? "bg-green-600/10 border border-green-600/20" : "bg-white/5"
                        }`}
                      >
                        <button
                          onClick={() => toggleExerciseComplete(roundIndex, exerciseIndex)}
                          className={`flex items-center justify-center w-8 h-8 rounded-full font-medium text-sm flex-shrink-0 transition-all ${
                            isCompleted ? "bg-green-600 text-white" : "bg-accent text-black hover:bg-accent/80"
                          }`}
                        >
                          {isCompleted ? "✓" : exerciseIndex + 1}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <h4
                              className={`font-medium text-sm truncate transition-all ${
                                isCompleted ? "text-green-400 line-through" : "text-white"
                              }`}
                            >
                              {exercise.name}
                            </h4>
                            <div
                              className={`flex items-center gap-2 transition-all ${
                                isCompleted ? "text-green-400" : "text-accent"
                              }`}
                            >
                              <span className="text-lg font-medium">{exercise.value}</span>
                              <span className="text-xs opacity-80">{exercise.unit}</span>
                            </div>
                          </div>
                          {(exercise.weight || exercise.equipment) && (
                            <div className="flex items-center gap-2 text-xs text-white/60 mt-1">
                              {exercise.weight && <span>@{exercise.weight}</span>}
                              {exercise.equipment && <span>{exercise.equipment}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </div>
            )}
          </Card>
        )
      })}

      {/* Workout Summary */}
      {isWorkoutActive && (
        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-white font-medium mb-2">Workout Progress</h3>
              <div className="flex justify-center gap-6 text-sm">
                <div>
                  <span className="text-white/60">Completed: </span>
                  <span className="text-accent font-medium">{completedExercises.size}</span>
                </div>
                <div>
                  <span className="text-white/60">Total: </span>
                  <span className="text-white font-medium">
                    {rounds.reduce((total, round) => total + round.exercises.length, 0)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
