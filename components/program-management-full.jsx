"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Save,
  X,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Target,
  TrendingUp,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { ProgramEditor } from "@/components/program-editor"
import { InteractiveCalendar } from "@/components/interactive-calendar"
import {
  getCurrentProgram,
  updateProgramWeek,
  updateProgramDetails,
  addProgramPhase,
  updateProgramPhase,
  deleteProgramPhase,
  createProgram,
} from "@/app/actions"

export function ProgramManagementFull() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [currentProgram, setCurrentProgram] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editingPhase, setEditingPhase] = useState(null)
  const [isAddingPhase, setIsAddingPhase] = useState(false)
  const [newPhase, setNewPhase] = useState({ name: "", weeks: 4, focus: "" })
  const [isCreatingProgram, setIsCreatingProgram] = useState(false)
  const [programForm, setProgramForm] = useState({
    name: "",
    subtitle: "",
    startDate: "",
    phases: [],
  })
  const [newProgramPhase, setNewProgramPhase] = useState({ name: "", weeks: 4, focus: "" })

  // Load current program
  useEffect(() => {
    loadCurrentProgram()
  }, [])

  // Listen for real-time updates
  useEffect(() => {
    const handleProgramUpdate = () => {
      loadCurrentProgram()
    }

    const handleWeeksUpdate = (event) => {
      if (currentProgram) {
        setCurrentProgram((prev) => (prev ? { ...prev, totalWeeks: event.detail.totalWeeks } : null))
      }
    }

    window.addEventListener("programUpdated", handleProgramUpdate)
    window.addEventListener("programWeeksUpdated", handleWeeksUpdate)

    return () => {
      window.removeEventListener("programUpdated", handleProgramUpdate)
      window.removeEventListener("programWeeksUpdated", handleWeeksUpdate)
    }
  }, [currentProgram])

  const loadCurrentProgram = async () => {
    setIsLoading(true)
    try {
      const program = await getCurrentProgram()
      setCurrentProgram(program)
    } catch (error) {
      console.error("Error loading program:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWeekChange = async (newWeek) => {
    if (!currentProgram) return

    try {
      const result = await updateProgramWeek(newWeek)
      if (result.success) {
        // Update local state immediately
        const updatedPhases = currentProgram.phases.map((phase) => {
          let status = "completed" | "current" | "upcoming"
          if (newWeek > phase.endWeek) {
            status = "completed"
          } else if (newWeek >= phase.startWeek && newWeek <= phase.endWeek) {
            status = "current"
          } else {
            status = "upcoming"
          }
          return { ...phase, status }
        })

        setCurrentProgram((prev) =>
          prev
            ? {
                ...prev,
                currentWeek: newWeek,
                phases: updatedPhases,
              }
            : null,
        )

        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent("programUpdated"))
      }
    } catch (error) {
      console.error("Error updating week:", error)
    }
  }

  const recalculatePhases = (phases) => {
    let currentWeekCounter = 1
    return phases.map((phase) => {
      const startWeek = currentWeekCounter
      const endWeek = currentWeekCounter + phase.weeks - 1
      currentWeekCounter += phase.weeks

      let status = "completed" | "current" | "upcoming"
      if (currentProgram && currentProgram.currentWeek > endWeek) {
        status = "completed"
      } else if (currentProgram && currentProgram.currentWeek >= startWeek && currentProgram.currentWeek <= endWeek) {
        status = "current"
      } else {
        status = "upcoming"
      }

      return { ...phase, startWeek, endWeek, status }
    })
  }

  const handleAddPhase = async () => {
    if (!newPhase.name || !newPhase.focus) return

    try {
      const result = await addProgramPhase(newPhase)
      if (result.success) {
        await loadCurrentProgram()
        setNewPhase({ name: "", weeks: 4, focus: "" })
        setIsAddingPhase(false)

        // Dispatch real-time update
        window.dispatchEvent(new CustomEvent("programUpdated"))
      }
    } catch (error) {
      console.error("Error adding phase:", error)
    }
  }

  const handleUpdatePhase = async (phaseId, updates) => {
    try {
      const result = await updateProgramPhase(phaseId, updates)
      if (result.success) {
        await loadCurrentProgram()
        setEditingPhase(null)

        // Dispatch real-time update
        window.dispatchEvent(new CustomEvent("programUpdated"))
      }
    } catch (error) {
      console.error("Error updating phase:", error)
    }
  }

  const handleDeletePhase = async (phaseId) => {
    if (!confirm("Are you sure you want to delete this phase?")) return

    try {
      const result = await deleteProgramPhase(phaseId)
      if (result.success) {
        await loadCurrentProgram()

        // Dispatch real-time update
        window.dispatchEvent(new CustomEvent("programUpdated"))
      }
    } catch (error) {
      console.error("Error deleting phase:", error)
    }
  }

  const handlePhaseDurationChange = (phaseId, newWeeks) => {
    if (!currentProgram) return

    const updatedPhases = currentProgram.phases.map((phase) =>
      phase.id === phaseId ? { ...phase, weeks: newWeeks } : phase,
    )

    const recalculatedPhases = recalculatePhases(updatedPhases)
    const totalWeeks = recalculatedPhases.reduce((sum, phase) => sum + phase.weeks, 0)

    setCurrentProgram((prev) =>
      prev
        ? {
            ...prev,
            phases: recalculatedPhases,
            totalWeeks,
          }
        : null,
    )

    // Dispatch event for cross-component updates
    window.dispatchEvent(
      new CustomEvent("programWeeksUpdated", {
        detail: { totalWeeks },
      }),
    )
  }

  const getWeekDate = (weekNumber) => {
    if (!currentProgram) return ""
    const startDate = new Date(currentProgram.startDate)
    const weekDate = new Date(startDate)
    weekDate.setDate(startDate.getDate() + (weekNumber - 1) * 7)
    return weekDate.toLocaleDateString()
  }

  const handleCreateProgram = async () => {
    if (!programForm.name || !programForm.startDate || programForm.phases.length === 0) return

    try {
      const result = await createProgram({
        name: programForm.name,
        subtitle: programForm.subtitle,
        startDate: programForm.startDate,
        phases: programForm.phases,
      })

      if (result.success) {
        console.log("Program created successfully:", result.data)
        setIsCreatingProgram(false)
        setProgramForm({ name: "", subtitle: "", startDate: "", phases: [] })
        setNewProgramPhase({ name: "", weeks: 4, focus: "" })
        // Reload programs after creation
        await loadCurrentProgram()
        // Force router refresh to update the UI
        router.refresh()
      } else {
        console.error("Failed to create program:", result.message)
      }
    } catch (error) {
      console.error("Error creating program:", error)
    }
  }

  const calculateTotalWeeks = (phases) => {
    return phases.reduce((total, phase) => total + phase.weeks, 0)
  }

  const addPhaseToNewProgram = () => {
    if (!newProgramPhase.name || !newProgramPhase.focus) return

    setProgramForm((prev) => ({
      ...prev,
      phases: [...prev.phases, { ...newProgramPhase }],
    }))
    setNewProgramPhase({ name: "", weeks: 4, focus: "" })
  }

  const removePhaseFromNewProgram = (index) => {
    setProgramForm((prev) => ({
      ...prev,
      phases: prev.phases.filter((_, i) => i !== index),
    }))
  }

  const updatePhaseInNewProgram = (index, field, value) => {
    setProgramForm((prev) => ({
      ...prev,
      phases: prev.phases.map((phase, i) => (i === index ? { ...phase, [field]: value } : phase)),
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 px-4">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          Loading program...
        </div>
      </div>
    )
  }

  if (isEditing && currentProgram) {
    return (
      <ProgramEditor
        program={currentProgram}
        onSave={async (updatedProgram) => {
          await updateProgramDetails(updatedProgram.id, {
            name: updatedProgram.name,
            subtitle: updatedProgram.subtitle,
            startDate: updatedProgram.startDate,
            totalWeeks: updatedProgram.totalWeeks,
          })
          setCurrentProgram(updatedProgram)
          setIsEditing(false)
          window.dispatchEvent(new CustomEvent("programUpdated"))
        }}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-8">
      {/* Mobile-Optimized Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-thin text-white tracking-wide">Program Management</h2>
          <p className="text-white/60 font-light text-sm sm:text-base">Manage training programs and phases</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={() => setIsCreatingProgram(true)}
            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Program
          </Button>
          {currentProgram && (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-accent hover:bg-accent/90 text-black w-full sm:w-auto"
              size="sm"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Program
            </Button>
          )}
        </div>
      </div>

      {isCreatingProgram && (
        <Card className="glass border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg">Create New Program</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Program Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-white text-sm">Program Name</Label>
                <Input
                  value={programForm.name}
                  onChange={(e) => setProgramForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white mt-2"
                  placeholder="e.g., HYROX Training Program"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Start Date</Label>
                <Input
                  type="date"
                  value={programForm.startDate}
                  onChange={(e) => setProgramForm((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white mt-2"
                />
              </div>
            </div>
            <div>
              <Label className="text-white text-sm">Subtitle</Label>
              <Input
                value={programForm.subtitle}
                onChange={(e) => setProgramForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                className="bg-white/5 border-white/20 text-white mt-2"
                placeholder="e.g., Comprehensive fitness program"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-medium">Program Phases</h4>
                <Badge variant="secondary" className="bg-accent/20 text-accent">
                  Total: {calculateTotalWeeks(programForm.phases)} weeks
                </Badge>
              </div>

              {/* Add New Phase Form */}
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white text-xs">Phase Name</Label>
                      <Input
                        value={newProgramPhase.name}
                        onChange={(e) => setNewProgramPhase((prev) => ({ ...prev, name: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white mt-1"
                        placeholder="e.g., Foundation Phase"
                        size="sm"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-xs">Duration (weeks)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newProgramPhase.weeks}
                        onChange={(e) =>
                          setNewProgramPhase((prev) => ({ ...prev, weeks: Number.parseInt(e.target.value) }))
                        }
                        className="bg-white/5 border-white/20 text-white mt-1"
                        size="sm"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white text-xs">Focus & Goals</Label>
                    <Textarea
                      value={newProgramPhase.focus}
                      onChange={(e) => setNewProgramPhase((prev) => ({ ...prev, focus: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white mt-1"
                      placeholder="Describe the focus and goals..."
                      rows={2}
                    />
                  </div>
                  <Button
                    onClick={addPhaseToNewProgram}
                    className="bg-accent hover:bg-accent/90 text-black w-full"
                    size="sm"
                    disabled={!newProgramPhase.name || !newProgramPhase.focus}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Phase
                  </Button>
                </CardContent>
              </Card>

              {/* Display Added Phases */}
              {programForm.phases.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-white text-sm">Added Phases:</Label>
                  {programForm.phases.map((phase, index) => (
                    <Card key={index} className="bg-white/5 border-white/10">
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                value={phase.name}
                                onChange={(e) => updatePhaseInNewProgram(index, "name", e.target.value)}
                                className="bg-white/5 border-white/20 text-white text-sm"
                                size="sm"
                              />
                              <Input
                                type="number"
                                min="1"
                                value={phase.weeks}
                                onChange={(e) =>
                                  updatePhaseInNewProgram(index, "weeks", Number.parseInt(e.target.value))
                                }
                                className="bg-white/5 border-white/20 text-white text-sm w-20"
                                size="sm"
                              />
                              <span className="text-white/60 text-xs">weeks</span>
                            </div>
                            <Textarea
                              value={phase.focus}
                              onChange={(e) => updatePhaseInNewProgram(index, "focus", e.target.value)}
                              className="bg-white/5 border-white/20 text-white text-sm"
                              rows={2}
                            />
                          </div>
                          <Button
                            onClick={() => removePhaseFromNewProgram(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleCreateProgram}
                className="bg-green-600 hover:bg-green-700 flex-1"
                disabled={!programForm.name || !programForm.startDate || programForm.phases.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Create Program ({calculateTotalWeeks(programForm.phases)} weeks)
              </Button>
              <Button
                onClick={() => {
                  setIsCreatingProgram(false)
                  setProgramForm({ name: "", subtitle: "", startDate: "", phases: [] })
                  setNewProgramPhase({ name: "", weeks: 4, focus: "" })
                }}
                variant="outline"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {!currentProgram ? (
        <Card className="glass border-white/10">
          <CardContent className="p-6 sm:p-8 text-center">
            <Target className="h-8 w-8 sm:h-12 sm:w-12 text-white/40 mx-auto mb-4" />
            <h3 className="text-white text-lg font-medium mb-2">No Active Program</h3>
            <p className="text-white/60 mb-4 text-sm sm:text-base">Create a new training program to get started</p>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Mobile-Optimized Tab List */}
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 h-auto">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-accent data-[state=active]:text-black text-xs sm:text-sm py-2"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="phases"
              className="data-[state=active]:bg-accent data-[state=active]:text-black text-xs sm:text-sm py-2"
            >
              Phases
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-accent data-[state=active]:text-black text-xs sm:text-sm py-2"
            >
              Calendar
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Mobile Optimized */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6">
            {/* Mobile-Optimized Program Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <Card className="glass border-white/10">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-accent/20 text-accent">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">Current Week</p>
                      <p className="text-white/60 text-xs sm:text-sm">{getWeekDate(currentProgram.currentWeek)}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 sm:gap-4">
                    <Button
                      onClick={() => handleWeekChange(Math.max(1, currentProgram.currentWeek - 1))}
                      disabled={currentProgram.currentWeek <= 1}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="text-xl sm:text-2xl font-thin text-white text-center">
                      Week {currentProgram.currentWeek}
                    </div>
                    <Button
                      onClick={() =>
                        handleWeekChange(Math.min(currentProgram.totalWeeks, currentProgram.currentWeek + 1))
                      }
                      disabled={currentProgram.currentWeek >= currentProgram.totalWeeks}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">Total Duration</p>
                      <p className="text-white/60 text-xs sm:text-sm">{currentProgram.totalWeeks} weeks</p>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-thin text-white text-center">
                    {Math.round((currentProgram.currentWeek / currentProgram.totalWeeks) * 100)}%
                  </div>
                  <p className="text-white/60 text-xs sm:text-sm text-center">Complete</p>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-green-600/20 text-green-400">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm sm:text-base">Active Phases</p>
                      <p className="text-white/60 text-xs sm:text-sm">{currentProgram.phases.length} total</p>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-thin text-white text-center">
                    {currentProgram.phases.filter((p) => p.status === "current").length}
                  </div>
                  <p className="text-white/60 text-xs sm:text-sm text-center">Current</p>
                </CardContent>
              </Card>
            </div>

            {/* Mobile-Optimized Progress Bar */}
            <Card className="glass border-white/10">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4">
                  <h3 className="text-white font-medium text-sm sm:text-base">Program Progress</h3>
                  <Badge className="bg-accent/20 text-accent border-accent/30 w-fit">{currentProgram.name}</Badge>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3 sm:h-4 mb-4">
                  <div
                    className="bg-accent h-3 sm:h-4 rounded-full transition-all duration-500"
                    style={{ width: `${(currentProgram.currentWeek / currentProgram.totalWeeks) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-white/60">
                  <span>Week {currentProgram.currentWeek}</span>
                  <span>{currentProgram.totalWeeks} weeks total</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Phases Tab - Mobile Optimized */}
          <TabsContent value="phases" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h3 className="text-white font-medium text-lg sm:text-xl">Program Phases</h3>
              <Button
                onClick={() => setIsAddingPhase(true)}
                className="bg-accent hover:bg-accent/90 text-black w-full sm:w-auto"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Phase
              </Button>
            </div>

            {/* Mobile-Optimized Add Phase Form */}
            {isAddingPhase && (
              <Card className="glass border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Add New Phase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="text-white text-sm">Phase Name</Label>
                      <Input
                        value={newPhase.name}
                        onChange={(e) => setNewPhase((prev) => ({ ...prev, name: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white mt-2"
                        placeholder="e.g., Foundation Phase"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Duration (weeks)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newPhase.weeks}
                        onChange={(e) => setNewPhase((prev) => ({ ...prev, weeks: Number.parseInt(e.target.value) }))}
                        className="bg-white/5 border-white/20 text-white mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white text-sm">Focus & Goals</Label>
                    <Textarea
                      value={newPhase.focus}
                      onChange={(e) => setNewPhase((prev) => ({ ...prev, focus: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white mt-2"
                      placeholder="Describe the focus and goals of this phase..."
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={handleAddPhase} className="bg-green-600 hover:bg-green-700 flex-1">
                      <Save className="h-4 w-4 mr-2" />
                      Save Phase
                    </Button>
                    <Button
                      onClick={() => {
                        setIsAddingPhase(false)
                        setNewPhase({ name: "", weeks: 4, focus: "" })
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mobile-Optimized Phases List */}
            <div className="space-y-4">
              {currentProgram.phases.map((phase, index) => (
                <Card
                  key={phase.id}
                  className={`glass border-white/10 ${
                    phase.status === "current"
                      ? "border-accent/50 bg-accent/5"
                      : phase.status === "completed"
                        ? "border-green-500/50 bg-green-500/5"
                        : ""
                  }`}
                >
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${
                            phase.status === "current"
                              ? "bg-accent/20 text-accent"
                              : phase.status === "completed"
                                ? "bg-green-600/20 text-green-400"
                                : "bg-white/10 text-white/60"
                          }`}
                        >
                          {phase.status === "completed" && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
                          {phase.status === "current" && <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
                          {phase.status === "upcoming" && <PauseCircle className="h-4 w-4 sm:h-5 sm:w-5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-white font-medium text-sm sm:text-base">{phase.name}</h4>
                          <p className="text-white/60 text-xs sm:text-sm mt-1">{phase.focus}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={`text-xs ${
                            phase.status === "current"
                              ? "bg-accent/20 text-accent border-accent/30"
                              : phase.status === "completed"
                                ? "bg-green-600/20 text-green-400 border-green-500/30"
                                : "bg-white/10 text-white/60 border-white/20"
                          }`}
                        >
                          {phase.status}
                        </Badge>
                        <Button
                          onClick={() => setEditingPhase(phase)}
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          onClick={() => handleDeletePhase(phase.id)}
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    {/* Mobile-Optimized Interactive Phase Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/5 rounded-lg p-3">
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-thin text-white mb-1">
                          <Input
                            type="number"
                            min="1"
                            value={phase.weeks}
                            onChange={(e) => handlePhaseDurationChange(phase.id, Number.parseInt(e.target.value))}
                            className="bg-transparent border-none text-center text-lg sm:text-2xl font-thin text-white p-0 h-auto w-full"
                          />
                        </div>
                        <p className="text-white/60 text-xs">Duration (weeks)</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-thin text-white">{phase.startWeek}</div>
                        <p className="text-white/60 text-xs">Start Week</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-thin text-white">{phase.endWeek}</div>
                        <p className="text-white/60 text-xs">End Week</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg sm:text-2xl font-thin text-white">{index + 1}</div>
                        <p className="text-white/60 text-xs">Phase Order</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/60">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {getWeekDate(phase.startWeek)} - {getWeekDate(phase.endWeek)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Mobile-Optimized Edit Phase Modal */}
            {editingPhase && (
              <Card className="glass border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Edit Phase</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="text-white text-sm">Phase Name</Label>
                      <Input
                        value={editingPhase.name}
                        onChange={(e) => setEditingPhase((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                        className="bg-white/5 border-white/20 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Duration (weeks)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={editingPhase.weeks}
                        onChange={(e) =>
                          setEditingPhase((prev) => (prev ? { ...prev, weeks: Number.parseInt(e.target.value) } : null))
                        }
                        className="bg-white/5 border-white/20 text-white mt-2"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white text-sm">Focus & Goals</Label>
                    <Textarea
                      value={editingPhase.focus}
                      onChange={(e) => setEditingPhase((prev) => (prev ? { ...prev, focus: e.target.value } : null))}
                      className="bg-white/5 border-white/20 text-white mt-2"
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={() =>
                        handleUpdatePhase(editingPhase.id, {
                          name: editingPhase.name,
                          weeks: editingPhase.weeks,
                          focus: editingPhase.focus,
                        })
                      }
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button onClick={() => setEditingPhase(null)} variant="outline" className="flex-1">
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Calendar Tab - Mobile Optimized */}
          <TabsContent value="calendar" className="space-y-4">
            <div className="w-full overflow-x-auto">
              <InteractiveCalendar
                classes={Array.isArray(currentProgram?.classes) ? currentProgram.classes : []}
                programs={currentProgram ? [currentProgram] : []}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
