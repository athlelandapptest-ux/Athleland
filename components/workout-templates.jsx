"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Trash2, Edit, Save, X, Zap } from "lucide-react"
import {
  createWorkoutTemplate,
  fetchAllWorkoutTemplates,
  updateWorkoutTemplate,
  deleteWorkoutTemplate,
  generateClassTone,
} from "@/app/actions"
import { WorkoutTemplate as WorkoutTemplateType, Round, Exercise } from "@/lib/workouts"

// ---------------------------------------------------------------------
// Helpers (ids, normalization, equipment)
// ---------------------------------------------------------------------

const uid = (p = "") => `${p}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

const normalizeExercise = (e = {}) => ({
  id: e.id ?? uid("ex-"),
  name: e.name ?? "",
  value: typeof e.value === "number" ? e.value : (e.value ?? null), // keep null to allow empty number input
  unit: e.unit ?? "",
  weight: e.weight ?? "",
  equipment: e.equipment ?? "Body Weight",
  rounds: e.rounds ?? 1,
  laps: e.laps ?? 1,
  distance: e.distance ?? null,
  distanceUnit: e.distanceUnit ?? "meters",
})

const normalizeRound = (r = {}) => ({
  id: r.id ?? uid("round-"),
  name: r.name ?? "Block",
  exercises: Array.isArray(r.exercises) ? r.exercises.map(normalizeExercise) : [],
  roundsPerBlock: r.roundsPerBlock ?? 3,
})

const normalizeTemplate = (t = {}) => ({
  id: t.id ?? uid("template-"),
  title: t.title ?? "",
  description: t.description ?? "",
  rounds: Array.isArray(t.rounds) ? t.rounds.map(normalizeRound) : [],
  hyroxPrepTypes: Array.isArray(t.hyroxPrepTypes) ? t.hyroxPrepTypes : [],
  hyroxReasoning: t.hyroxReasoning ?? "",
  otherHyroxPrepNotes: t.otherHyroxPrepNotes ?? "",
  createdAt: t.createdAt ?? null,
  updatedAt: t.updatedAt ?? null,
})

// Smart equipment detection (kept your placeholder, expanded base list)
const BASE_EQUIPMENT = ["Body Weight", "Dumbbells", "Kettlebells", "Barbells"]
const detectEquipment = (name) => {
  const equipmentList = BASE_EQUIPMENT
  const n = (name || "").toLowerCase()
  return equipmentList.filter((eq) => n.includes(eq.toLowerCase()))
}
const equipmentOptionsFor = (exercise) => {
  const detected = detectEquipment(exercise?.name || "")
  const current = exercise?.equipment ?? "Body Weight"
  // Merge current + detected + base; ensure current always available
  return Array.from(new Set([current, ...detected, ...BASE_EQUIPMENT]))
}

// ---------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------

export function WorkoutTemplates() {
  const [activeTab, setActiveTab] = useState("library")
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [isGeneratingTone, setIsGeneratingTone] = useState(false)

  // Initial state uses fully controlled values (no undefined)
  const [newTemplate, setNewTemplate] = useState(() =>
    normalizeTemplate({
      title: "",
      description: "",
      rounds: [
        normalizeRound({
          name: "Block 1",
          exercises: [
            normalizeExercise({
              name: "",
              value: 10,
              unit: "REPS",
              weight: "",
              equipment: "Body Weight",
              rounds: 1,
              laps: 1,
              distance: 100,
              distanceUnit: "meters",
            }),
          ],
          roundsPerBlock: 3,
        }),
      ],
      hyroxPrepTypes: [],
      hyroxReasoning: "",
      otherHyroxPrepNotes: "",
    })
  )

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    setIsLoading(true)
    try {
      const templatesData = await fetchAllWorkoutTemplates()
      setTemplates((templatesData || []).map(normalizeTemplate))
    } catch (error) {
      console.error("Error loading templates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const workoutTypeDefaults = {
    HIIT: {
      hyroxPrepTypes: ["Sprint Conditioning"],
      description: "High-intensity interval training for maximum calorie burn",
      intensity: 12,
    },
    Strength: {
      hyroxPrepTypes: ["Strength Endurance"],
      description: "Build muscle and increase strength with compound movements",
      intensity: 8,
    },
    Cardio: {
      hyroxPrepTypes: ["General Endurance"],
      description: "Improve cardiovascular fitness and endurance",
      intensity: 10,
    },
    HYROX: {
      hyroxPrepTypes: ["Hyrox Preparation"],
      description: "Specific preparation for HYROX competition events",
      intensity: 13,
    },
  }

  const applyWorkoutTypeDefaults = (type) => {
    const defaults = workoutTypeDefaults[type]
    if (!defaults) return
    setNewTemplate((prev) => ({
      ...prev,
      hyroxPrepTypes: defaults.hyroxPrepTypes ?? [],
      description: defaults.description ?? "",
    }))
  }

  // ----------------------------
  // Template Builder Functions
  // ----------------------------

  const addRound = () => {
    const newRound = normalizeRound({
      name: `Block ${newTemplate.rounds.length + 1}`,
      exercises: [
        normalizeExercise({
          name: "",
          value: 10,
          unit: "REPS",
          weight: "",
          equipment: "Body Weight",
          rounds: 1,
          laps: 1,
          distance: 100,
          distanceUnit: "meters",
        }),
      ],
      roundsPerBlock: 3,
    })

    setNewTemplate((prev) => ({
      ...prev,
      rounds: [...prev.rounds, newRound],
    }))
  }

  const removeRound = (roundId) => {
    setNewTemplate((prev) => ({
      ...prev,
      rounds: prev.rounds.filter((round) => round.id !== roundId),
    }))
  }

  const addExercise = (roundId) => {
    const newExercise = normalizeExercise({
      name: "",
      value: 10,
      unit: "REPS",
      weight: "",
      equipment: "Body Weight",
      rounds: 1,
      laps: 1,
      distance: 100,
      distanceUnit: "meters",
    })

    setNewTemplate((prev) => ({
      ...prev,
      rounds: prev.rounds.map((round) =>
        round.id === roundId ? { ...round, exercises: [...round.exercises, newExercise] } : round
      ),
    }))
  }

  const removeExercise = (roundId, exerciseId) => {
    setNewTemplate((prev) => ({
      ...prev,
      rounds: prev.rounds.map((round) =>
        round.id === roundId
          ? { ...round, exercises: round.exercises.filter((ex) => ex.id !== exerciseId) }
          : round
      ),
    }))
  }

  const updateExercise = (roundId, exerciseId, updates) => {
    setNewTemplate((prev) => ({
      ...prev,
      rounds: prev.rounds.map((round) =>
        round.id === roundId
          ? {
              ...round,
              exercises: round.exercises.map((ex) => (ex.id === exerciseId ? { ...ex, ...updates } : ex)),
            }
          : round
      ),
    }))
  }

  // Smart equipment detection on name change
  const handleExerciseNameChange = (roundId, exerciseId, name) => {
    const suggestions = detectEquipment(name)
    updateExercise(roundId, exerciseId, {
      name,
      equipment: suggestions[0] || "Body Weight",
    })
  }

  const handleGenerateTone = async () => {
    setIsGeneratingTone(true)
    try {
      const result = await generateClassTone({
        title: newTemplate.title,
        description: newTemplate.description,
        hyroxPrepTypes: newTemplate.hyroxPrepTypes,
        rounds: newTemplate.rounds,
      })

      if (result?.success && result?.data) {
        setNewTemplate((prev) => ({ ...prev, hyroxReasoning: result.data }))
      }
    } catch (error) {
      console.error("Error generating tone:", error)
    } finally {
      setIsGeneratingTone(false)
    }
  }

  const handleSaveTemplate = async () => {
    try {
      const templateData = {
        title: newTemplate.title ?? "",
        description: newTemplate.description ?? "",
        rounds: newTemplate.rounds ?? [],
        hyroxPrepTypes: newTemplate.hyroxPrepTypes ?? [],
        hyroxReasoning: newTemplate.hyroxReasoning ?? "",
        otherHyroxPrepNotes: newTemplate.otherHyroxPrepNotes ?? "",
      }

      let result
      if (editingTemplate?.id) {
        result = await updateWorkoutTemplate(editingTemplate.id, templateData)
      } else {
        result = await createWorkoutTemplate(templateData)
      }

      if (result?.success) {
        await loadTemplates()
        resetForm()
        setActiveTab("library")
      }
    } catch (error) {
      console.error("Error saving template:", error)
    }
  }

  const handleEdit = (template) => {
    const t = normalizeTemplate(template)
    setEditingTemplate(t)
    setNewTemplate({
      title: t.title,
      description: t.description,
      rounds: t.rounds,
      hyroxPrepTypes: t.hyroxPrepTypes || [],
      hyroxReasoning: t.hyroxReasoning || "",
      otherHyroxPrepNotes: t.otherHyroxPrepNotes || "",
    })
    setCurrentStep(1)
    setActiveTab("create")
  }

  const handleDelete = async (templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      try {
        const result = await deleteWorkoutTemplate(templateId)
        if (result?.success) {
          loadTemplates()
        }
      } catch (error) {
        console.error("Error deleting template:", error)
      }
    }
  }

  const resetForm = () => {
    setNewTemplate(
      normalizeTemplate({
        title: "",
        description: "",
        rounds: [
          normalizeRound({
            name: "Block 1",
            exercises: [
              normalizeExercise({
                name: "",
                value: 10,               // IMPORTANT: value, not reps
                unit: "REPS",
                weight: "",
                equipment: "Body Weight",
                rounds: 1,
                laps: 1,
                distance: 100,
                distanceUnit: "meters",
              }),
            ],
            roundsPerBlock: 3,
          }),
        ],
        hyroxPrepTypes: [],
        hyroxReasoning: "",
        otherHyroxPrepNotes: "",
      })
    )
    setCurrentStep(1)
    setEditingTemplate(null)
  }

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-light text-white">Workout Templates</h2>
          <p className="text-white/60 text-sm">Create reusable workout templates for your classes</p>
        </div>
        <Button
          onClick={() => setActiveTab("create")}
          className="bg-accent hover:bg-accent/90 text-black w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
          <TabsTrigger value="library" className="data-[state=active]:bg-accent data-[state=active]:text-black">
            Template Library
          </TabsTrigger>
          <TabsTrigger value="create" className="data-[state=active]:bg-accent data-[state=active]:text-black">
            {editingTemplate ? "Edit Template" : "Create New"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-4">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white font-light">Available Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-white/60 text-center py-8">Loading templates...</div>
              ) : templates.length === 0 ? (
                <div className="text-white/60 text-center py-8">
                  No templates created yet. Create your first template to get started!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <Card key={template.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                      <CardContent className="p-4">
                        <h3 className="text-white font-medium mb-2">{template.title}</h3>
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary" className="bg-accent/20 text-accent">
                            Template
                          </Badge>
                          <div className="flex items-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white/60 hover:text-white"
                              onClick={() => handleEdit(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-500/80 hover:text-red-500"
                              onClick={() => handleDelete(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white font-light">
                  {editingTemplate ? "Edit Workout Template" : "Create Workout Template"}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        step <= currentStep ? "bg-accent text-black" : "bg-white/10 text-white/60"
                      }`}
                    >
                      {step}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-white/60 text-sm">
                {currentStep === 1 && "Step 1: Choose workout type and basic info"}
                {currentStep === 2 && "Step 2: Build your workout structure"}
                {currentStep === 3 && "Step 3: Add routine reasoning"}
                {currentStep === 4 && "Step 4: Review and save"}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-white mb-3 block">Quick Start - Choose Workout Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.keys(workoutTypeDefaults).map((type) => (
                        <Button
                          key={type}
                          variant="outline"
                          className="border-white/20 text-white hover:bg-accent hover:text-black bg-transparent"
                          onClick={() => applyWorkoutTypeDefaults(type)}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label className="text-white text-sm">Template Name</Label>
                      <Input
                        value={newTemplate.title ?? ""}
                        onChange={(e) => setNewTemplate((prev) => ({ ...prev, title: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white mt-2"
                        placeholder="e.g., HIIT Cardio Blast"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Description</Label>
                      <Textarea
                        value={newTemplate.description ?? ""}
                        onChange={(e) => setNewTemplate((prev) => ({ ...prev, description: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white mt-2"
                        placeholder="Brief description of the workout template"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white mb-3 block text-sm">Workout Categories</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {["Hyrox Preparation", "Sprint Conditioning", "Strength Endurance", "General Endurance"].map(
                        (type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={type}
                              checked={newTemplate.hyroxPrepTypes?.includes(type) ?? false}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setNewTemplate((prev) => ({
                                    ...prev,
                                    hyroxPrepTypes: [...(prev.hyroxPrepTypes ?? []), type],
                                  }))
                                } else {
                                  setNewTemplate((prev) => ({
                                    ...prev,
                                    hyroxPrepTypes: (prev.hyroxPrepTypes ?? []).filter((t) => t !== type),
                                  }))
                                }
                              }}
                              className="border-white/20"
                            />
                            <Label htmlFor={type} className="text-white text-sm">
                              {type}
                            </Label>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-white font-medium">Workout Structure</h3>
                    <Button onClick={addRound} className="bg-accent hover:bg-accent/90 text-black" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Block
                    </Button>
                  </div>

                  {newTemplate.rounds.map((round, roundIndex) => (
                    <Card key={round.id} className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-white font-medium">Block {roundIndex + 1}</h4>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <label className="text-white/70 text-sm">Rounds:</label>
                              <Input
                                type="number"
                                value={round.roundsPerBlock ?? ""} // controlled
                                onChange={(e) => {
                                  const v = e.target.value === "" ? null : Number(e.target.value)
                                  setNewTemplate((prev) => ({
                                    ...prev,
                                    rounds: prev.rounds.map((r) =>
                                      r.id === round.id ? { ...r, roundsPerBlock: v } : r
                                    ),
                                  }))
                                }}
                                className="bg-gray-700 border-gray-600 text-white w-16 text-sm"
                                min="1"
                              />
                            </div>
                            <Button
                              onClick={() => removeRound(round.id)}
                              size="sm"
                              variant="destructive"
                              disabled={newTemplate.rounds.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {round.exercises.map((exercise) => (
                            <div key={exercise.id} className="space-y-2">
                              <div className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-4">
                                  <Input
                                    value={exercise.name ?? ""}
                                    onChange={(e) =>
                                      handleExerciseNameChange(round.id, exercise.id, e.target.value)
                                    }
                                    placeholder="Exercise name"
                                    className="bg-gray-700 border-gray-600 text-white text-sm"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <Input
                                    type="number"
                                    value={exercise.value ?? ""} // controlled numeric
                                    onChange={(e) => {
                                      const v = e.target.value
                                      updateExercise(round.id, exercise.id, {
                                        value: v === "" ? null : Number(v),
                                      })
                                    }}
                                    className="bg-gray-700 border-gray-600 text-white text-sm"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <select
                                    value={exercise.unit ?? ""} // controlled
                                    onChange={(e) =>
                                      updateExercise(round.id, exercise.id, { unit: e.target.value })
                                    }
                                    className="w-full bg-gray-700 border-gray-600 text-white text-sm rounded px-2 py-1"
                                  >
                                    <option value="">Select unit</option>
                                    <option value="REPS">Reps</option>
                                    <option value="SECONDS">Sec</option>
                                    <option value="MINUTES">Min</option>
                                    <option value="ROUNDS">Rounds</option>
                                    <option value="LAPS">Laps</option>
                                    <option value="METERS">Meters</option>
                                    <option value="KM">KM</option>
                                  </select>
                                </div>
                                <div className="col-span-3">
                                  <Input
                                    value={exercise.weight ?? ""}
                                    onChange={(e) =>
                                      updateExercise(round.id, exercise.id, { weight: e.target.value })
                                    }
                                    placeholder="Weight"
                                    className="bg-gray-700 border-gray-600 text-white text-sm"
                                  />
                                </div>
                                <div className="col-span-1">
                                  <Button
                                    onClick={() => removeExercise(round.id, exercise.id)}
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-400 hover:text-red-300 p-1"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-4">
                                  <select
                                    value={exercise.equipment ?? "Body Weight"} // controlled
                                    onChange={(e) =>
                                      updateExercise(round.id, exercise.id, { equipment: e.target.value })
                                    }
                                    className="w-full bg-gray-700 border-gray-600 text-white text-sm rounded px-2 py-1"
                                  >
                                    {equipmentOptionsFor(exercise).map((eq) => (
                                      <option key={eq} value={eq}>
                                        {eq}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="col-span-8">
                                  <div className="text-xs text-white/50 px-2 py-1">
                                    Smart detected: {detectEquipment(exercise.name || "").join(", ") || "—"}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          <Button
                            onClick={() => addExercise(round.id)}
                            variant="outline"
                            size="sm"
                            className="border-gray-600 text-white hover:bg-gray-700 w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Exercise
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-white text-sm">Routine Reasoning</Label>
                      <Button
                        onClick={handleGenerateTone}
                        disabled={isGeneratingTone}
                        className="bg-accent hover:bg-accent/90 text-black"
                        size="sm"
                      >
                        {isGeneratingTone ? (
                          "Generating..."
                        ) : (
                          <>
                            <Zap className="h-4 w-4 mr-2" />
                            Generate AI Reasoning
                          </>
                        )}
                      </Button>
                    </div>
                    <Textarea
                      value={newTemplate.hyroxReasoning ?? ""}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({ ...prev, hyroxReasoning: e.target.value }))
                      }
                      className="bg-white/5 border-white/20 text-white min-h-[120px]"
                      placeholder="Explain the reasoning behind this workout structure..."
                    />
                  </div>

                  <div>
                    <Label className="text-white text-sm">Additional Notes</Label>
                    <Textarea
                      value={newTemplate.otherHyroxPrepNotes ?? ""}
                      onChange={(e) =>
                        setNewTemplate((prev) => ({ ...prev, otherHyroxPrepNotes: e.target.value }))
                      }
                      className="bg-white/5 border-white/20 text-white mt-2"
                      placeholder="Any additional notes or modifications..."
                    />
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-white font-medium">Review Your Template</h3>
                  <Card className="bg-white/5 border-white/10">
                    <CardContent className="p-4">
                      <h4 className="text-white font-medium mb-2">{newTemplate.title ?? ""}</h4>
                      <p className="text-white/70 text-sm mb-3">{newTemplate.description ?? ""}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {(newTemplate.hyroxPrepTypes ?? []).map((type) => (
                          <Badge key={type} variant="secondary" className="bg-accent/20 text-accent">
                            {type}
                          </Badge>
                        ))}
                      </div>
                      <div className="text-white/60 text-sm">
                        {(newTemplate.rounds ?? []).length} workout blocks with{" "}
                        {(newTemplate.rounds ?? []).reduce((total, round) => total + (round.exercises?.length || 0), 0)}{" "}
                        total exercises
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <div className="flex justify-between pt-4">
                <Button
                  onClick={prevStep}
                  variant="outline"
                  disabled={currentStep === 1}
                  className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  Previous
                </Button>
                <div className="flex gap-2">
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    Reset
                  </Button>
                  {currentStep < 4 ? (
                    <Button
                      onClick={nextStep}
                      className="bg-accent hover:bg-accent/90 text-black"
                      disabled={currentStep === 1 && !(newTemplate.title ?? "").trim()}
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSaveTemplate}
                      className="bg-accent hover:bg-accent/90 text-black"
                      disabled={!(newTemplate.title ?? "").trim()}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingTemplate ? "Save Changes" : "Save Template"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
