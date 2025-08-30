"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Save, X, Plus, Edit, Trash2, User, Mail, Phone, Award, Clock, CheckCircle, XCircle } from "lucide-react"
import { type Coach, inMemoryCoaches } from "@/lib/coaches"

export function CoachManagement() {
  const [coaches, setCoaches] = useState<Coach[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingCoach, setEditingCoach] = useState<Coach | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    specialties: "",
    bio: "",
    experience: "",
    certifications: "",
    email: "",
    phone: "",
    isActive: true,
  })

  useEffect(() => {
    loadCoaches()
  }, [])

  const loadCoaches = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))
      setCoaches(inMemoryCoaches)
    } catch (error) {
      console.error("Error loading coaches:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCoach = async () => {
    try {
      const newCoach: Coach = {
        id: editingCoach?.id || `coach-${Date.now()}`,
        name: formData.name,
        title: formData.title,
        specialties: formData.specialties.split(",").map((s) => s.trim()),
        bio: formData.bio,
        image: "/images/head-coach.jpg",
        experience: formData.experience,
        certifications: formData.certifications.split(",").map((s) => s.trim()),
        contact: {
          email: formData.email,
          phone: formData.phone || undefined,
        },
        isActive: formData.isActive,
        createdAt: editingCoach?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (editingCoach) {
        // Update existing
        const index = coaches.findIndex((c) => c.id === editingCoach.id)
        const updatedCoaches = [...coaches]
        updatedCoaches[index] = newCoach
        setCoaches(updatedCoaches)
      } else {
        // Add new
        setCoaches([...coaches, newCoach])
      }

      resetForm()
    } catch (error) {
      console.error("Error saving coach:", error)
    }
  }

  const handleEditCoach = (coach: Coach) => {
    setEditingCoach(coach)
    setFormData({
      name: coach.name,
      title: coach.title,
      specialties: coach.specialties.join(", "),
      bio: coach.bio,
      experience: coach.experience,
      certifications: coach.certifications.join(", "),
      email: coach.contact.email,
      phone: coach.contact.phone || "",
      isActive: coach.isActive,
    })
    
    setIsCreating(true)
  }

  const handleDeleteCoach = async (coachId: string) => {
    if (!confirm("Are you sure you want to delete this coach?")) return

    try {
      setCoaches(coaches.filter((c) => c.id !== coachId))
    } catch (error) {
      console.error("Error deleting coach:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      specialties: "",
      bio: "",
      experience: "",
      certifications: "",
      email: "",
      phone: "",
      isActive: true,
    })
    setEditingCoach(null)
    setIsCreating(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 px-4">
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          Loading coaches...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 sm:px-6 lg:px-8">
      {/* Mobile-Optimized Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-thin text-white tracking-wide">Coach Management</h2>
          <p className="text-white/60 font-light text-sm sm:text-base">Manage performance coaches and staff</p>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          className="bg-accent hover:bg-accent/90 text-black w-full sm:w-auto"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Coach
        </Button>
      </div>

      {/* Mobile-Optimized Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20 text-accent">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Total Coaches</p>
                <p className="text-xl font-thin text-white">{coaches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-600/20 text-green-400">
                <CheckCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Active Coaches</p>
                <p className="text-xl font-thin text-white">{coaches.filter((c) => c.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Specialties</p>
                <p className="text-xl font-thin text-white">{new Set(coaches.flatMap((c) => c.specialties)).size}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Form */}
      {isCreating && (
        <Card className="glass border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-white font-light text-lg">
              {editingCoach ? "Edit Coach" : "Add New Coach"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-white text-sm">Full Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white mt-2"
                  placeholder="e.g., Sarah Mitchell"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white mt-2"
                  placeholder="e.g., Head Performance Coach"
                />
              </div>
            </div>

            <div>
              <Label className="text-white text-sm">Specialties (comma separated)</Label>
              <Input
                value={formData.specialties}
                onChange={(e) => setFormData((prev) => ({ ...prev, specialties: e.target.value }))}
                className="bg-white/5 border-white/20 text-white mt-2"
                placeholder="e.g., HYROX Training, Functional Fitness"
              />
            </div>

            <div>
              <Label className="text-white text-sm">Bio</Label>
              <Textarea
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                className="bg-white/5 border-white/20 text-white mt-2"
                placeholder="Coach biography and background..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-white text-sm">Experience</Label>
                <Input
                  value={formData.experience}
                  onChange={(e) => setFormData((prev) => ({ ...prev, experience: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white mt-2"
                  placeholder="e.g., 5+ years"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white mt-2"
                  placeholder="coach@athleland.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-white text-sm">Phone (optional)</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white mt-2"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label className="text-white text-sm">Certifications (comma separated)</Label>
                <Input
                  value={formData.certifications}
                  onChange={(e) => setFormData((prev) => ({ ...prev, certifications: e.target.value }))}
                  className="bg-white/5 border-white/20 text-white mt-2"
                  placeholder="e.g., NSCA-CSCS, CrossFit Level 3"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
              />
              <Label className="text-white text-sm">Active Coach</Label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSaveCoach}
                disabled={!formData.name || !formData.email}
                className="bg-green-600 hover:bg-green-700 flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingCoach ? "Update Coach" : "Create Coach"}
              </Button>
              <Button onClick={resetForm} variant="outline" className="flex-1 bg-transparent">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile-Optimized Coaches List */}
      <Card className="glass border-white/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-white font-light text-lg">Performance Coaches</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {coaches.map((coach) => (
            <div
              key={coach.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white/5 rounded-lg"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-white font-medium text-sm sm:text-base truncate">{coach.name}</h4>
                    {coach.isActive ? (
                      <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-white/60 text-xs sm:text-sm mb-2">{coach.title}</p>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {coach.specialties.slice(0, 2).map((specialty, index) => (
                      <Badge key={index} className="bg-accent/20 text-accent border-accent/30 text-xs">
                        {specialty}
                      </Badge>
                    ))}
                    {coach.specialties.length > 2 && (
                      <Badge className="bg-white/10 text-white/60 border-white/20 text-xs">
                        +{coach.specialties.length - 2} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {coach.experience}
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {coach.contact.email}
                    </span>
                    {coach.contact.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {coach.contact.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  className={`text-xs ${
                    coach.isActive
                      ? "bg-green-600/20 text-green-400 border-green-500/30"
                      : "bg-red-600/20 text-red-400 border-red-500/30"
                  }`}
                >
                  {coach.isActive ? "Active" : "Inactive"}
                </Badge>
                <Button onClick={() => handleEditCoach(coach)} size="sm" variant="outline" className="h-8 w-8 p-0">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  onClick={() => handleDeleteCoach(coach.id)}
                  size="sm"
                  variant="destructive"
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
