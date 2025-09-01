"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Calendar, Users, Clock } from "lucide-react"
import { WorkoutClass, TrainingProgram } from "@/lib/workouts"

export function InteractiveCalendar({ classes, programs, onEventClick, onDateSelect }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)

  const today = new Date()
  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1)
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0)
  const firstDayWeekday = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()

  // Generate calendar days
  const calendarDays = []

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Convert classes and programs to events
  const events = [

    ...(Array.isArray(classes) ? classes : []).map((cls) => ({
      id: cls.id,
      title: cls.title || cls.name || "Untitled Class",
      date: typeof cls.date === 'string' ? cls.date : '',
      time: typeof cls.time === 'string' ? cls.time : '',
      type: "class",
      status: cls.status,
      participants: cls.currentParticipants || 0,
      maxParticipants: cls.maxParticipants,
    })),
    ...(Array.isArray(programs) ? programs : []).map((prog) => ({
      id: prog.id,
      title: typeof prog.name === 'string' ? prog.name : '',
      date: typeof prog.startDate === 'string' ? prog.startDate : '',
      type: "program",
    })),
  ]

  // Get events for a specific date
  const getEventsForDate = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return events.filter((event) => event.date === dateStr)
  }

  // Navigate months
  const navigateMonth = (direction) => {
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

  // Handle date click
  const handleDateClick = (day  ) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    setSelectedDate(dateStr)
    onDateSelect?.(dateStr)
  }

  // Handle event click
  const handleEventClick = (event , e) => {
    e.stopPropagation()
    onEventClick?.(event)
  }

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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <Card className="glass border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white font-light flex items-center gap-3">
            <Calendar className="h-5 w-5 text-accent" />
            {monthNames[currentMonth]} {currentYear}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => navigateMonth("prev")}
              size="sm"
              variant="outline"
              className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => navigateMonth("next")}
              size="sm"
              variant="outline"
              className="border-white/20 text-white/80 hover:bg-white/5 bg-transparent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Day headers */}
          {dayNames.map((day) => (
            <div key={day} className="p-2 text-center text-white/60 text-sm font-light">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={index} className="p-2 h-24" />
            }

            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
            const dayEvents = getEventsForDate(day)
            const isToday =
              today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear
            const isSelected = selectedDate === dateStr

            return (
              <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={`p-2 h-24 border border-white/10 cursor-pointer transition-all duration-200 hover:border-white/20 ${
                  isToday ? "ring-2 ring-accent ring-opacity-50" : ""
                } ${isSelected ? "bg-accent/20 border-accent" : "hover:bg-white/5"}`}
              >
                <div className={`text-sm font-light mb-1 ${isToday ? "text-accent font-medium" : "text-white"}`}>
                  {day}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => handleEventClick(event, e)}
                      className={`text-xs p-1 rounded cursor-pointer transition-colors ${
                        event.type === "class"
                          ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                          : "bg-purple-600/20 text-purple-400 hover:bg-purple-600/30"
                      }`}
                    >
                      <div className="truncate font-medium">{event.title}</div>
                      {event.time && (
                        <div className="flex items-center gap-1 opacity-80">
                          <Clock className="h-2 w-2" />
                          {event.time}
                        </div>
                      )}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-white/60 text-center">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Selected Date Events */}
        {selectedDate && (
          <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
            <h4 className="text-white font-medium mb-3">Events for {new Date(selectedDate).toLocaleDateString()}</h4>
            <div className="space-y-2">
              {getEventsForDate(Number.parseInt((selectedDate || '').split("-")[2] || '0')).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        event.type === "class"
                          ? "bg-blue-600/20 text-blue-400 border-blue-600/30"
                          : "bg-purple-600/20 text-purple-400 border-purple-600/30"
                      }
                    >
                      {event.type}
                    </Badge>
                    <div>
                      <div className="text-white font-medium">{event.title}</div>
                      {event.time && (
                        <div className="text-white/60 text-sm flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {event.time}
                        </div>
                      )}
                    </div>
                  </div>
                  {event.participants !== undefined && (
                    <div className="flex items-center gap-1 text-white/60 text-sm">
                      <Users className="h-3 w-3" />
                      {event.participants}/{event.maxParticipants}
                    </div>
                  )}
                </div>
              ))}
              {getEventsForDate(Number.parseInt((selectedDate || '').split("-")[2] || '0')).length === 0 && (
                <div className="text-center py-4 text-white/60">No events scheduled for this date</div>
              )}
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600/40 rounded"></div>
            <span className="text-white/60 text-sm">Classes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600/40 rounded"></div>
            <span className="text-white/60 text-sm">Programs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-accent rounded"></div>
            <span className="text-white/60 text-sm">Today</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
