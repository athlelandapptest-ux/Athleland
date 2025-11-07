"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Users, Zap, Plus, Eye, Edit, Trash2 } from "lucide-react";
import {
  fetchAllClassesAdmin,
  fetchAllWorkoutTemplates,
  generateClassPreview,
  saveApprovedClass,
  updateClass,
  deleteClassById,
} from "@/app/actions";

export function ClassManagementFull() {
  const [activeTab, setActiveTab] = useState("overview");
  const [classes, setClasses] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [editingClass, setEditingClass] = useState(null);
  const [classPreview, setClassPreview] = useState(null);

  const [scheduleForm, setScheduleForm] = useState({
    templateKey: "",
    className: "",
    instructor: "",
    date: "",
    time: "",
    intensity: 8,
    duration: 60,
    maxParticipants: 20,
  });

  const instructorDefaults = ["Sarah Johnson", "Mike Chen", "Alex Rodriguez", "Emma Thompson"];
  const popularTimes = ["06:00", "07:00", "12:00", "17:00", "18:00", "19:00"];

  // Load classes + templates
  useEffect(() => {
    (async () => {
      try {
        const [cls, tmpl] = await Promise.all([fetchAllClassesAdmin(), fetchAllWorkoutTemplates()]);
        setClasses(cls || []);
        setTemplates(tmpl || []);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // 🧠 Generate class preview
  const handleGeneratePreview = async () => {
    try {
      console.log("🔄 Generating class preview...", scheduleForm);

      const result = await generateClassPreview(
        [scheduleForm.templateKey],
        scheduleForm.className,
        scheduleForm.date,
        scheduleForm.time,
        scheduleForm.intensity,
        scheduleForm.duration,
        1,
        scheduleForm.maxParticipants,
        scheduleForm.instructor,
        editingClass?.id
      );

      if (!result?.success || !result?.data) {
        console.error("❌ Preview generation failed:", result.message);
        return alert(`Failed to generate preview: ${result.message || "Unknown error"}`);
      }

      // Normalize workoutBreakdown (ensure array)
      const normalized = {
        ...result.data,
        workoutBreakdown: Array.isArray(result.data.workoutBreakdown)
          ? result.data.workoutBreakdown
          : (() => {
              try {
                return JSON.parse(result.data.workoutBreakdown || "[]");
              } catch {
                return [];
              }
            })(),
      };

      setClassPreview(normalized);
      console.log("✅ Preview generated successfully:", normalized);
    } catch (err) {
      console.error("❌ Error generating preview:", err);
      alert(`Error generating preview: ${err.message}`);
    }
  };

  // 💾 Save / Update Class
  const handleScheduleClass = async () => {
    if (!classPreview) return;

    try {
      const approvedClassData = {
        id: editingClass?.id || `class-${Date.now()}`,
        title: classPreview.title || scheduleForm.className,
        name: classPreview.name || scheduleForm.className,
        description: classPreview.description || "No description provided",
        date: classPreview.date,
        time: classPreview.time,
        instructor: classPreview.instructor || scheduleForm.instructor,
        duration: Number(classPreview.duration) || scheduleForm.duration,
        intensity: Number(classPreview.intensity) || scheduleForm.intensity,
        numerical_intensity: Number(classPreview.intensity) || scheduleForm.intensity,
        class_focus: classPreview.focus || "General Fitness",
        max_participants: Number(classPreview.maxParticipants) || scheduleForm.maxParticipants,
        status: "approved",
        workout_breakdown: Array.isArray(classPreview.workoutBreakdown)
          ? classPreview.workoutBreakdown
          : (() => {
              try {
                return JSON.parse(classPreview.workoutBreakdown || "[]");
              } catch {
                return [];
              }
            })(),
        created_at: classPreview.created_at || new Date().toISOString(),
      };

      console.log("📤 Scheduling class:", approvedClassData);

      const result = editingClass
        ? await updateClass(editingClass.id, approvedClassData)
        : await saveApprovedClass(approvedClassData);

      console.log("Supabase result:", result);

      if (!result?.success) throw new Error(result?.message || "Unknown insert error");

      console.log("✅ Class scheduled successfully!");
      await reload();
      resetForm();
      setActiveTab("overview");
    } catch (err) {
      console.error("❌ Error scheduling class:", err);
      alert(`Failed to schedule class: ${err.message}`);
    }
  };

  const reload = async () => {
    setIsLoading(true);
    const cls = await fetchAllClassesAdmin();
    setClasses(cls || []);
    setIsLoading(false);
  };

  // ✏️ Edit
  const handleEditClass = (cls) => {
    setEditingClass(cls);
    const t = templates.find((t) => t.title === cls.routine?.title);
    setScheduleForm({
      templateKey: t?.id || "",
      className: cls.title || cls.name,
      instructor: cls.instructor,
      date: cls.date,
      time: cls.time,
      intensity: cls.intensity || cls.numericalIntensity || 8,
      duration: cls.duration,
      maxParticipants: cls.maxParticipants,
    });
    setActiveTab("schedule");
    setCurrentStep(1);
  };

  // ❌ Delete
  const handleDeleteClass = async (id) => {
    if (!confirm("Delete this class?")) return;
    try {
      const r = await deleteClassById(id);
      if (r?.success) await reload();
    } catch (err) {
      console.error("Error deleting class:", err);
    }
  };

  // Reset
  const resetForm = () => {
    setScheduleForm({
      templateKey: "",
      className: "",
      instructor: "",
      date: "",
      time: "",
      intensity: 8,
      duration: 60,
      maxParticipants: 20,
    });
    setEditingClass(null);
    setClassPreview(null);
    setCurrentStep(1);
  };

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  // ==========================
  // 🖥️ UI
  // ==========================
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-light text-white">Schedule Classes</h2>
          <p className="text-white/60 text-sm">Schedule classes using your workout templates</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setActiveTab("schedule");
          }}
          className="bg-accent hover:bg-accent/90 text-black w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" /> Schedule New Class
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
          <TabsTrigger
            value="overview"
            className="data-[state=active]:bg-accent data-[state=active]:text-black"
          >
            Class Schedule
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-accent data-[state=active]:text-black"
          >
            {editingClass ? "Edit Class" : "Schedule New"}
          </TabsTrigger>
        </TabsList>

        {/* 🗓 Overview */}
        <TabsContent value="overview" className="space-y-4">
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white font-light">Scheduled Classes</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-white/60 text-center py-8">Loading classes...</div>
              ) : !classes.length ? (
                <div className="text-white/60 text-center py-8">
                  No classes scheduled yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {classes.map((cls) => (
                    <Card key={cls.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-white font-medium mb-2">
                            {cls.title || cls.name}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-white/70">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" /> {cls.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" /> {cls.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" /> {cls.max_participants} max
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap className="h-4 w-4" />{" "}
                              {cls.intensity || cls.numerical_intensity}/15
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge
                            className={
                              cls.status === "approved"
                                ? "bg-green-600"
                                : "bg-yellow-600"
                            }
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
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 🧾 Schedule/Edit Steps */}
        <TabsContent value="schedule" className="space-y-6">
          <Card className="glass border-white/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white font-light">
                  {editingClass ? "Edit Class" : "Schedule New Class"}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3].map((s) => (
                    <div
                      key={s}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        s <= currentStep
                          ? "bg-accent text-black"
                          : "bg-white/10 text-white/60"
                      }`}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-white/60 text-sm mt-1">
                {currentStep === 1 && "Step 1: Choose workout template and instructor"}
                {currentStep === 2 && "Step 2: Set schedule and class details"}
                {currentStep === 3 && "Step 3: Preview and confirm"}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* === STEP 1 === */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <Label className="text-white text-sm">Class Name</Label>
                  <Input
                    value={scheduleForm.className}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, className: e.target.value })
                    }
                    placeholder="Enter custom class name"
                    className="bg-white/5 border-white/20 text-white mt-2"
                  />

                  <Label className="text-white text-sm">Select Workout Template</Label>
                  <Select
                    value={scheduleForm.templateKey}
                    onValueChange={(value) =>
                      setScheduleForm({ ...scheduleForm, templateKey: value })
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white mt-2">
                      <SelectValue placeholder="Choose a workout template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Label className="text-white text-sm mt-3">Instructor</Label>
                  <Input
                    value={scheduleForm.instructor}
                    onChange={(e) =>
                      setScheduleForm({ ...scheduleForm, instructor: e.target.value })
                    }
                    placeholder="Enter instructor name"
                    className="bg-white/5 border-white/20 text-white mt-2"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {instructorDefaults.map((i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setScheduleForm({ ...scheduleForm, instructor: i })
                        }
                        className="border-white/20 text-white hover:bg-accent hover:text-black text-xs"
                      >
                        {i}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* === STEP 2 === */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white text-sm">Date</Label>
                      <Input
                        type="date"
                        value={scheduleForm.date}
                        onChange={(e) =>
                          setScheduleForm({ ...scheduleForm, date: e.target.value })
                        }
                        className="bg-white/5 border-white/20 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Time</Label>
                      <Input
                        type="time"
                        value={scheduleForm.time}
                        onChange={(e) =>
                          setScheduleForm({ ...scheduleForm, time: e.target.value })
                        }
                        className="bg-white/5 border-white/20 text-white mt-2"
                      />
                      <div className="flex flex-wrap gap-1 mt-2">
                        {popularTimes.map((t) => (
                          <Button
                            key={t}
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-accent hover:text-black text-xs"
                            onClick={() =>
                              setScheduleForm({ ...scheduleForm, time: t })
                            }
                          >
                            {t}
                          </Button>
                        ))}
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
                          setScheduleForm({
                            ...scheduleForm,
                            intensity: Number(e.target.value),
                          })
                        }
                        className="bg-white/5 border-white/20 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Duration (min)</Label>
                      <Input
                        type="number"
                        value={scheduleForm.duration}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            duration: Number(e.target.value),
                          })
                        }
                        className="bg-white/5 border-white/20 text-white mt-2"
                      />
                    </div>
                    <div>
                      <Label className="text-white text-sm">Max Participants</Label>
                      <Input
                        type="number"
                        value={scheduleForm.maxParticipants}
                        onChange={(e) =>
                          setScheduleForm({
                            ...scheduleForm,
                            maxParticipants: Number(e.target.value),
                          })
                        }
                        className="bg-white/5 border-white/20 text-white mt-2"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* === STEP 3 === */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  {!classPreview ? (
                    <div className="text-center">
                      <Button
                        onClick={handleGeneratePreview}
                        className="bg-accent hover:bg-accent/90 text-black"
                        disabled={
                          !scheduleForm.templateKey ||
                          !scheduleForm.className ||
                          !scheduleForm.instructor ||
                          !scheduleForm.date ||
                          !scheduleForm.time
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" /> Generate Class Preview
                      </Button>
                    </div>
                  ) : (
                    <Card className="bg-white/5 border-white/10">
                      <CardHeader>
                        <CardTitle className="text-white font-light">
                          Class Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <h3 className="text-white font-medium text-lg">
                          {classPreview.title}
                        </h3>
                        <p className="text-white/70">{classPreview.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <span className="flex items-center gap-2 text-white text-sm">
                            <Calendar className="h-4 w-4 text-accent" /> {classPreview.date}
                          </span>
                          <span className="flex items-center gap-2 text-white text-sm">
                            <Clock className="h-4 w-4 text-accent" /> {classPreview.time}
                          </span>
                          <span className="flex items-center gap-2 text-white text-sm">
                            <Users className="h-4 w-4 text-accent" />{" "}
                            {classPreview.maxParticipants} max
                          </span>
                          <span className="flex items-center gap-2 text-white text-sm">
                            <Zap className="h-4 w-4 text-accent" />{" "}
                            {classPreview.intensity}/15
                          </span>
                        </div>

                        <div>
                          <h4 className="text-white font-medium mb-2">
                            Workout Breakdown
                          </h4>
                          {Array.isArray(classPreview.workoutBreakdown) &&
                            classPreview.workoutBreakdown.map((block, i) => (
                              <Card
                                key={i}
                                className="bg-gray-800/50 border-gray-700 mb-2"
                              >
                                <CardContent className="p-3">
                                  <h5 className="text-accent font-medium text-sm mb-2">
                                    {block.title}
                                  </h5>
                                  {block.exercises.map((ex, idx) => (
                                    <div
                                      key={idx}
                                      className="text-white/70 text-sm"
                                    >
                                      {ex.name} - {ex.reps} {ex.unit}
                                      {ex.weight && ` @ ${ex.weight}`}
                                    </div>
                                  ))}
                                </CardContent>
                              </Card>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
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
                        (currentStep === 1 &&
                          (!scheduleForm.templateKey || !scheduleForm.instructor)) ||
                        (currentStep === 2 &&
                          (!scheduleForm.date || !scheduleForm.time))
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
  );
}
