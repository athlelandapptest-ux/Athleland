"use client"

import { useState, useEffect } from "react"

interface CountdownTimerProps {
  initialTime: number // in seconds
  onComplete?: () => void
  className?: string
}

export function CountdownTimer({ initialTime, onComplete, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            setIsActive(false)
            onComplete?.()
            return 0
          }
          return time - 1
        })
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, onComplete])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = () => setIsActive(true)
  const handlePause = () => setIsActive(false)
  const handleReset = () => {
    setTimeLeft(initialTime)
    setIsActive(false)
  }

  return (
    <div className={`text-center space-y-4 ${className}`}>
      <div className="text-6xl font-bold text-purple-400 font-mono">{formatTime(timeLeft)}</div>

      <div className="flex gap-4 justify-center">
        <button
          onClick={isActive ? handlePause : handleStart}
          className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          disabled={timeLeft === 0}
        >
          {isActive ? "Pause" : "Start"}
        </button>

        <button
          onClick={handleReset}
          className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Reset
        </button>
      </div>

      {timeLeft === 0 && <div className="text-green-400 font-semibold">Time's up!</div>}
    </div>
  )
}
