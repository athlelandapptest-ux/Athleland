"use client"

import { useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Program = {
  startDate?: string // ISO string e.g. "2025-11-01"
  currentWeek?: number // 1-based
  // ...anything else you store
}

interface ProgramCalendarProps {
  program: Program | null
}

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function ProgramCalendar({ program }: ProgramCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => startOfDay(new Date()))

  const monthNames = useMemo(
    () => [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    []
  )

  // Use index as key to avoid duplicate-letter keys like S / T
  const daysOfWeek = useMemo(
    () => ["S", "M", "T", "W", "T", "F", "S"],
    []
  )

  // Compute a grid of days for the visible month (with leading nulls for offset)
  const days = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const grid: (number | null)[] = []
    for (let i = 0; i < startingDayOfWeek; i++) grid.push(null)
    for (let day = 1; day <= daysInMonth; day++) grid.push(day)
    return { grid, year, month }
  }, [currentDate])

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const next = new Date(prev)
      next.setDate(1) // normalize to avoid DST edge-cases when crossing months
      next.setMonth(prev.getMonth() + (direction === "prev" ? -1 : 1))
      return startOfDay(next)
    })
  }

  // Compute current program week date range (inclusive)
  const currentWeekRange = useMemo(() => {
    if (!program?.startDate || !program?.currentWeek || program.currentWeek < 1) {
      return null
    }
    const start = startOfDay(new Date(program.startDate))
    if (isNaN(start.getTime())) return null

    const weekStart = addDays(start, (program.currentWeek - 1) * 7)
    const weekEnd = addDays(weekStart, 6)
    return { weekStart, weekEnd }
  }, [program?.startDate, program?.currentWeek])

  const isInCurrentWeek = (year: number, month: number, day: number | null) => {
    if (!day || !currentWeekRange) return false
    const d = startOfDay(new Date(year, month, day))
    return d >= currentWeekRange.weekStart && d <= currentWeekRange.weekEnd
  }

  const today = startOfDay(new Date())

  return (
    <Card className="bg-black border-white/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-white/60" />
            <h3 className="text-white font-light text-lg">Program Calendar</h3>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => navigateMonth("prev")}
              className="text-white/60 hover:text-white hover:bg-white/5 p-2"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-white/80 font-light text-lg min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>

            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => navigateMonth("next")}
              className="text-white/60 hover:text-white hover:bg-white/5 p-2"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {daysOfWeek.map((label, idx) => (
            <div
              key={`dow-${idx}`}
              className="text-center text-white/40 text-sm font-light py-2 select-none"
              aria-hidden
            >
              {label}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.grid.map((day, idx) => {
            const isCell = day !== null
            const cellDate =
              isCell ? new Date(days.year, days.month, day as number) : null
            const isToday = isCell && sameDay(cellDate!, today)
            const inProgWeek =
              isCell && isInCurrentWeek(days.year, days.month, day)

            return (
              <div
                key={`cell-${days.year}-${days.month}-${idx}`}
                className={[
                  "aspect-square flex items-center justify-center text-sm font-light rounded-lg transition-all duration-200 select-none",
                  !isCell
                    ? "opacity-0"
                    : inProgWeek
                    ? "bg-accent text-black font-medium"
                    : "text-white/80 hover:bg-white/5 cursor-default",
                  isToday && !inProgWeek ? "ring-1 ring-white/30" : "",
                ].join(" ")}
                aria-current={isToday ? "date" : undefined}
                aria-label={
                  isCell
                    ? cellDate!.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : undefined
                }
                role={isCell ? "gridcell" : "presentation"}
              >
                {day}
              </div>
            )
          })}
        </div>

        {/* Subtle legend */}
        <div className="mt-4 flex items-center gap-3 text-xs text-white/50">
          <span className="inline-block h-3 w-3 rounded bg-accent" />
          <span>Current program week</span>
          <span className="ml-4 inline-block h-3 w-3 rounded ring-1 ring-white/30" />
          <span>Today</span>
        </div>
      </CardContent>
    </Card>
  )
}
