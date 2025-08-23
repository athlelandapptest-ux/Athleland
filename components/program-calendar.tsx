"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ProgramCalendarProps {
  program: any
}

export function ProgramCalendar({ program }: ProgramCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthNames = [
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
  ]

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"]

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }

    return days
  }

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const isCurrentWeek = (day: number | null) => {
    if (!day || !program) return false

    const today = new Date()
    const currentWeekStart = program.currentWeek || 1

    // Simple logic to highlight current week (can be enhanced based on actual program data)
    return day >= currentWeekStart && day < currentWeekStart + 7
  }

  const days = getDaysInMonth(currentDate)

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
              onClick={() => navigateMonth("prev")}
              className="text-white/60 hover:text-white hover:bg-white/5 p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="text-white/80 font-light text-lg min-w-[140px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateMonth("next")}
              className="text-white/60 hover:text-white hover:bg-white/5 p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center text-white/40 text-sm font-light py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`
                aspect-square flex items-center justify-center text-sm font-light rounded-lg transition-all duration-200
                ${
                  day === null
                    ? ""
                    : isCurrentWeek(day)
                      ? "bg-accent text-black font-medium"
                      : "text-white/80 hover:bg-white/5 cursor-pointer"
                }
              `}
            >
              {day}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
