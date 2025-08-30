"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, Zap, Plus, Eye, Edit, Trash2 } from "lucide-react"
import { 
  fetchAllClassesAdmin, 
  getAllRoutineKeys, 
  generateClassPreview, 
  saveApprovedClass,
  updateClass,
  deleteClassById,
  getClassById,
  fetchAllWorkoutTemplates
} from "@/app/actions"
import { WorkoutClass } from "@/lib/workouts"

export function ClassManagementFull() {
  const [activeTab, setActiveTab] = useState("overview")
  const [classes, setClasses] = useState([])
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [editingClass, setEditingClass] = useState(null)

  const [scheduleForm, setScheduleForm] = useState({
    templateKey: "",
    instructor: "",
    date: "",
    time: "",
    intensity: 8,
    duration: 60,
    maxParticipants: 20,
  })

  const [classPreview, setClassPreview] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [classesData, templatesData] = await Promise.all([
        fetchAllClassesAdmin(), 
        fetchAllWorkoutTemplates()
      ])
      setClasses(classesData)
      setTemplates(templatesData)
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const instructorDefaults = ["Sarah Johnson", "Mike Chen", "Alex Rodriguez", "Emma Thompson"]
  const popularTimes = ["06:00", "07:00", "12:00", "17:00", "18:00", "19:00"]

  const handleGeneratePreview = async () => {
    try {
      const result = await generateClassPreview(
        [scheduleForm.templateKey],
        scheduleForm.date,
        scheduleForm.time,
        scheduleForm.intensity,
        scheduleForm.duration,
        1, // numberOfBlocks
        scheduleForm.maxParticipants,
        scheduleForm.instructor,
        editingClass?.id,
      )

      if (result.success && result.data) {
        setClassPreview(result.data)
      }
    } catch (error) {
      console.error("Error generating preview:", error)
    }
  }

  const handleScheduleClass = async () => {
    if (!classPreview) return

    try {
      let result
      if (editingClass) {
        result = await updateClass(editingClass.id, classPreview)
      } else {
        result = await saveApprovedClass(classPreview)
      }

      if (result.success) {
        await loadData()
        resetForm()
        setActiveTab("overview")

        // Dispatch real-time update
        window.dispatchEvent(new CustomEvent("classUpdated"))
      }
    } catch (error) {
      console.error("Error scheduling class:", error)
    }
  }

  const handleEditClass = async (classItem) => {
    setEditingClass(classItem)
    
    // Find the template key based on the class routine
    const matchingTemplate = templates.find(t => t.title === classItem.routine?.title)
    
    setScheduleForm({
      templateKey: matchingTemplate?.id || "",
      instructor: classItem.instructor,
      date: classItem.date,
      time: classItem.time,
      intensity: classItem.intensity || classItem.numericalIntensity || 8,
      duration: classItem.duration,
      maxParticipants: classItem.maxParticipants,
    })
    
    setCurrentStep(1)
    setActiveTab("schedule")
  }

  const handleDeleteClass = async (classId) => {
    if (window.confirm("Are you sure you want to delete this class?")) {
      try {
        const result = await deleteClassById(classId)
        if (result.success) {
          await loadData()
        }
      } catch (error) {
        console.error("Error deleting class:", error)
      }
    }
  }

  const resetForm = () => {
    setScheduleForm({
      templateKey: "",
      instructor: "",
      date: "",
      time: "",
      intensity: 8,
      duration: 60,
      maxParticipants: 20,
    })
    setClassPreview(null)
    setCurrentStep(1)
    setEditingClass(null)
  }

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-light text-white">Schedule Classes</h2>
          <p className="text-white/60 text-sm">Schedule classes using your workout templates</p>
        </div>
        <Button
          onClick={() => setActiveTab("schedule")}
          className="bg-accent hover:bg-accent/90 text-black w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule New Class
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-accent data-[state=active]:text-black">
            Class Schedule
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-accent data-[state=active]:text-black">
            {editingClass ? "Edit Class" : "Schedule New"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white font-light">Scheduled Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-white/60 text-center py-8">Loading classes...</div>
              ) : classes.length === 0 ? (
                <div className="text-white/60 text-center py-8">
                  No classes scheduled yet. Schedule your first class to get started!
                </div>
              ) : (
                <div className="space-y-4">
                  {classes.map((cls) => (
                    <Card key={cls.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-2">{cls.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-white/70">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {cls.date}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {cls.time}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {cls.maxParticipants} max
                              </div>
                              <div className="flex items-center gap-1">
                                <Zap className="h-4 w-4" />
                                {cls.intensity}/15
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge
                              variant={cls.status === "approved" ? "default" : "secondary"}
                              className={cls.status === "approved" ? "bg-green-600" : "bg-yellow-600"}
                            >
                              {cls.status}
                            </Badge>
                            <div className="text-white/60 text-sm">{cls.instructor}</div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white/60 hover:text-white p-2"
                                onClick={() => handleEditClass(cls)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-500/80 hover:text-red-500 p-2"
                                onClick={() => handleDeleteClass(cls.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
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

        <TabsContent value="schedule" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white font-light">
                  {editingClass ? "Edit Class" : "Schedule New Class"}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3].map((step) => (
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
                {currentStep === 1 && "Step 1: Choose workout template and instructor"}
                {currentStep === 2 && "Step 2: Set schedule and class details"}
                {currentStep === 3 && "Step 3: Preview and confirm"}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <Label className="text-white text-sm">Select Workout Template</Label>
                    <Select
                      value={scheduleForm.templateKey}
                      onValueChange={(value) => setScheduleForm((prev) => ({ ...prev, templateKey: value }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/20 text-white mt-2">
                        <SelectValue placeholder="Choose a workout template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {templates.length === 0 && (
                      <p className="text-yellow-400 text-sm mt-2">
                        No workout templates available. Create templates first in the "Workout Templates" tab.
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-white text-sm">Instructor</Label>
                    <div className="mt-2 space-y-2">
                      <Input
                        value={scheduleForm.instructor}
                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, instructor: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white"
                        placeholder="Enter instructor name"
                      />
                      <div className="flex flex-wrap gap-2">
                        {instructorDefaults.map((instructor) => (
                          <Button
                            key={instructor}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-accent hover:text-black text-xs bg-transparent"
                            onClick={() => setScheduleForm((prev) => ({ ...prev, instructor }))}
                          >
                            {instructor}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white text-sm">Date</Label>
                      <Input
                        type="date"
                        value={scheduleForm.date}
                        onChange={(e) => setScheduleForm((prev) => ({ ...prev, date: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Time</Label>
                      <div className="mt-2 space-y-2">
                        <Input
                          type="time"
                          value={scheduleForm.time}
                          onChange={(e) => setScheduleForm((prev) => ({ ...prev, time: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white"
                        />
                        <div className="flex flex-wrap gap-1">
                          {popularTimes.map((time) => (
                            <Button
                              key={time}
                              variant="outline"
                              size="sm"
                              className="border-white/20 text-white hover:bg-accent hover:text-black text-xs px-2 py-1 bg-transparent"
                              onClick={() => setScheduleForm((prev) => ({ ...prev, time }))}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white text-sm">Intensity (1-15)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="15"
                        value={scheduleForm.intensity}
                        onChange={(e) =>
                          setScheduleForm((prev) => ({ ...prev, intensity: Number.parseInt(e.target.value) }))
                        }
                        className="bg-white/5 border-white/20 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Duration (min)</Label>
                      <Input
                        type="number"
                        min="15"
                        max="120"
                        value={scheduleForm.duration}
                        onChange={(e) =>
                          setScheduleForm((prev) => ({ ...prev, duration: Number.parseInt(e.target.value) }))
                        }
                        className="bg-white/5 border-white/20 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Max Participants</Label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={scheduleForm.maxParticipants}
                        onChange={(e) =>
                          setScheduleForm((prev) => ({ ...prev, maxParticipants: Number.parseInt(e.target.value) }))
                        }
                        className="bg-white/5 border-white/20 text-white mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  {!classPreview ? (
                    <div className="text-center">
                      <Button
                        onClick={handleGeneratePreview}
                        className="bg-accent hover:bg-accent/90 text-black"
                        disabled={
                          !scheduleForm.templateKey ||
                          !scheduleForm.instructor ||
                          !scheduleForm.date ||
                          !scheduleForm.time
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Generate Class Preview
                      </Button>
                    </div>
                  ) : (
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white font-light">Class Preview</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="text-white font-medium text-lg">{classPreview.title}</h3>
                          <p className="text-white/70">{classPreview.description}</p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-accent" />
                            <span className="text-white text-sm">{classPreview.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-accent" />
                            <span className="text-white text-sm">{classPreview.time}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-accent" />
                            <span className="text-white text-sm">{classPreview.maxParticipants} max</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-accent" />
                            <span className="text-white text-sm">{classPreview.intensity}/15</span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-white font-medium mb-2">Workout Breakdown</h4>
                          {classPreview.workoutBreakdown && (
                            <div className="space-y-2">
                              {classPreview.workoutBreakdown.map((block, index) => (
                                <Card key={index} className="bg-gray-800/50 border-gray-700">
                                  <CardContent className="p-3">
                                    <h5 className="text-accent font-medium text-sm mb-2">{block.title}</h5>
                                    <div className="space-y-1">
                                      {block.exercises.map((exercise, exerciseIndex) => (
                                        <div key={exerciseIndex} className="text-white/70 text-sm">
                                          {exercise.name} - {exercise.reps} {exercise.unit.toLowerCase()}
                                          {exercise.weight && ` @ ${exercise.weight}`}
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                          <p className="text-blue-400 text-sm">
                            Review the class details above. If everything looks good, click "Schedule Class" to make it
                            available in Upcoming Classes.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
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
                  {currentStep < 3 ? (
                    <Button
                      onClick={nextStep}
                      className="bg-accent hover:bg-accent/90 text-black"
                      disabled={
                        (currentStep === 1 && (!scheduleForm.templateKey || !scheduleForm.instructor)) ||
                        (currentStep === 2 && (!scheduleForm.date || !scheduleForm.time))
                      }
                    >
                      Next
                    </Button>
                  ) : (
                    <Button
                      onClick={handleScheduleClass}
                      className="bg-accent hover:bg-accent/90 text-black"
                      disabled={!classPreview}
                    >
                      {editingClass ? "Update Class" : "Schedule Class"}
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
