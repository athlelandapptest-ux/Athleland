"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, X, Plus, Edit, Trash2, Calendar } from "lucide-react"

interface Phase {
  id: string
  name: string
  weeks: number
  focus: string
  startWeek: number
  endWeek: number
  status: "completed" | "current" | "upcoming"
}

interface Program {
  id: string
  name: string
  subtitle: string
  startDate: string
  currentWeek: number
  totalWeeks: number
  phases: Phase[]
}

interface ProgramEditorProps {
  program: Program
  onSave: (program: Program) => void
  onCancel: () => void
}

export function ProgramEditor({ program, onSave, onCancel }: ProgramEditorProps) {
  const [editingProgram, setEditingProgram] = useState<Program>({ ...program })
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null)
  const [isAddingPhase, setIsAddingPhase] = useState(false)

  // Recalculate phases when program details change
  useEffect(() => {
    recalculatePhases()
  }, [editingProgram.startDate, editingProgram.currentWeek])

  const recalculatePhases = () => {
    let currentWeekCounter = 1
    const updatedPhases = editingProgram.phases.map((phase) => {
      const startWeek = currentWeekCounter
      const endWeek = currentWeekCounter + phase.weeks - 1 // Fix: subtract 1 for correct end week
      currentWeekCounter += phase.weeks

      // Determine status based on current week
      let status: "completed" | "current" | "upcoming"
      if (editingProgram.currentWeek > endWeek) {
        status = "completed"
      } else if (editingProgram.currentWeek >= startWeek && editingProgram.currentWeek <= endWeek) {
        status = "current"
      } else {
        status = "upcoming"
      }

      return {
        ...phase,
        startWeek,
        endWeek,
        status,
      }
    })

    // Update total weeks
    const totalWeeks = updatedPhases.reduce((sum, phase) => sum + phase.weeks, 0)

    setEditingProgram((prev) => ({
      ...prev,
      phases: updatedPhases,
      totalWeeks,
    }))

    // Dispatch event for cross-component updates
    window.dispatchEvent(
      new CustomEvent("programWeeksUpdated", {
        detail: { totalWeeks },
      }),
    )
  }

  const updateProgram = (updates: Partial<Program>) => {
    setEditingProgram((prev) => ({ ...prev, ...updates }))
  }

  const addPhase = () => {
    const newPhase: Phase = {
      id: `phase-${Date.now()}`,
      name: "New Phase",
      weeks: 4,
      focus: "General training focus",
      startWeek: 1,
      endWeek: 4,
      status: "upcoming",
    }
    setEditingPhase(newPhase)
    setIsAddingPhase(true)
  }

  const editPhase = (phase: Phase) => {
    setEditingPhase({ ...phase })
    setIsAddingPhase(false)
  }

  const savePhase = () => {
    if (!editingPhase) return

    if (isAddingPhase) {
      setEditingProgram((prev) => ({
        ...prev,
        phases: [...prev.phases, editingPhase],
      }))
    } else {
      setEditingProgram((prev) => ({
        ...prev,
        phases: prev.phases.map((phase) => (phase.id === editingPhase.id ? editingPhase : phase)),
      }))
    }

    setEditingPhase(null)
    setIsAddingPhase(false)
  }

  const deletePhase = (phaseId: string) => {
    if (confirm("Are you sure you want to delete this phase?")) {
      setEditingProgram((prev) => ({
        ...prev,
        phases: prev.phases.filter((phase) => phase.id !== phaseId),
      }))
    }
  }

  const cancelPhaseEdit = () => {
    setEditingPhase(null)
    setIsAddingPhase(false)
  }

  const handleSave = () => {
    onSave(editingProgram)
  }

  const getWeekDate = (weekNumber: number) => {
    const startDate = new Date(editingProgram.startDate)
    const weekDate = new Date(startDate)
    weekDate.setDate(startDate.getDate() + (weekNumber - 1) * 7)
    return weekDate.toLocaleDateString()
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white">Edit Program</CardTitle>
          <div className="flex gap-2">
            <Button onClick={handleSave} size="sm" className="bg-green-600 hover:bg-green-700">
              <Save className="h-4 w-4 mr-2" />
              Save Program
            </Button>
            <Button onClick={onCancel} size="sm" variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Program Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="programName" className="text-white">
              Program Name
            </Label>
            <Input
              id="programName"
              value={editingProgram.name}
              onChange={(e) => updateProgram({ name: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="startDate" className="text-white">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              value={editingProgram.startDate}
              onChange={(e) => updateProgram({ startDate: e.target.value })}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
          <div>
            <Label htmlFor="currentWeek" className="text-white">
              Current Week
            </Label>
            <Input
              id="currentWeek"
              type="number"
              min="1"
              max={editingProgram.totalWeeks}
              value={editingProgram.currentWeek}
              onChange={(e) => updateProgram({ currentWeek: Number.parseInt(e.target.value) })}
              className="bg-gray-700 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">Week of {getWeekDate(editingProgram.currentWeek)}</p>
          </div>
          <div>
            <Label className="text-white">Total Weeks</Label>
            <div className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white">
              {editingProgram.totalWeeks} weeks
            </div>
            <p className="text-xs text-gray-400 mt-1">Auto-calculated from phases</p>
          </div>
        </div>

        <div>
          <Label htmlFor="subtitle" className="text-white">
            Program Description
          </Label>
          <Textarea
            id="subtitle"
            value={editingProgram.subtitle}
            onChange={(e) => updateProgram({ subtitle: e.target.value })}
            className="bg-gray-700 border-gray-600 text-white"
            rows={2}
          />
        </div>

        {/* Progress Overview */}
        <div className="bg-gray-700/50 rounded-lg p-4">
          <h4 className="text-white font-medium mb-3">Program Progress</h4>
          <div className="w-full bg-gray-600 rounded-full h-3 mb-2">
            <div
              className="bg-purple-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(editingProgram.currentWeek / editingProgram.totalWeeks) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-300">
            <span>Week {editingProgram.currentWeek}</span>
            <span>{Math.round((editingProgram.currentWeek / editingProgram.totalWeeks) * 100)}% Complete</span>
            <span>{editingProgram.totalWeeks} weeks total</span>
          </div>
        </div>

        {/* Phases Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-white font-medium">Program Phases</h4>
            <Button onClick={addPhase} size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Phase
            </Button>
          </div>

          {/* Phase Editor */}
          {editingPhase && (
            <Card className="bg-gray-700 border-gray-600 mb-4">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white text-lg">{isAddingPhase ? "Add New Phase" : "Edit Phase"}</CardTitle>
                  <div className="flex gap-2">
                    <Button onClick={savePhase} size="sm" className="bg-green-600 hover:bg-green-700">
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button onClick={cancelPhaseEdit} size="sm" variant="outline">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white">Phase Name</Label>
                    <Input
                      value={editingPhase.name}
                      onChange={(e) => setEditingPhase({ ...editingPhase, name: e.target.value })}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Duration (weeks)</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editingPhase.weeks}
                      onChange={(e) => setEditingPhase({ ...editingPhase, weeks: Number.parseInt(e.target.value) })}
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Focus & Goals</Label>
                  <Textarea
                    value={editingPhase.focus}
                    onChange={(e) => setEditingPhase({ ...editingPhase, focus: e.target.value })}
                    className="bg-gray-600 border-gray-500 text-white"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phases List */}
          <div className="space-y-3">
            {editingProgram.phases.map((phase, index) => (
              <div
                key={phase.id}
                className={`p-4 rounded-lg border ${
                  phase.status === "current"
                    ? "bg-purple-600/20 border-purple-500"
                    : phase.status === "completed"
                      ? "bg-green-600/20 border-green-500"
                      : "bg-gray-700/50 border-gray-600"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h5 className="text-white font-medium">{phase.name}</h5>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          phase.status === "current"
                            ? "bg-purple-600/20 text-purple-400"
                            : phase.status === "completed"
                              ? "bg-green-600/20 text-green-400"
                              : "bg-gray-600/20 text-gray-400"
                        }`}
                      >
                        {phase.status}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{phase.focus}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{phase.weeks} weeks</span>
                      <span>
                        Weeks {phase.startWeek}-{phase.endWeek}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {getWeekDate(phase.startWeek)} - {getWeekDate(phase.endWeek)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => editPhase(phase)} size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => deletePhase(phase.id)} size="sm" variant="destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {editingProgram.phases.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>No phases added yet. Click "Add Phase" to get started.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
