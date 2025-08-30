"use client"

import { useState, useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Users,
  Play,
  Award,
  Activity,
  CheckCircle,
  Plus,
  Save,
  X,
  Dumbbell,
  Timer,
  Heart,
  Zap,
  Star,
  BookOpen,
  BarChart3,
  User,
  Settings,
  Bell,
  MessageSquare,
  HelpCircle,
  ThumbsUp,
  Send,
  Edit,
  Phone,
  Mail,
  UserCheck,
  Bookmark,
  MessageCircle,
} from "lucide-react"
import { MobileWorkoutBreakdown } from "@/components/mobile-workout-breakdown"

interface WorkoutSession {
  id: string
  date: string
  type: string
  duration: number
  calories: number
  completed: boolean
  rating?: number
}

interface ClassRegistration {
  id: string
  name: string
  date: string
  time: string
  instructor: string
  spotsLeft: number
  registered: boolean
  status: "upcoming" | "completed" | "cancelled"
}

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  emergencyContact: {
    name: string
    phone: string
    relationship: string
  }
  memberSince: string
  membershipType: string
  fitnessGoals: string[]
  medicalNotes?: string
}

interface FavoriteClass {
  id: string
  name: string
  instructor: string
  averageRating: number
  timesAttended: number
  lastAttended: string
}

interface Notification {
  id: string
  type: "class" | "event" | "system" | "social"
  title: string
  message: string
  date: string
  read: boolean
  actionUrl?: string
}

interface ClassReview {
  id: string
  classId: string
  className: string
  rating: number
  comment: string
  date: string
  instructor: string
}

interface SupportTicket {
  id: string
  subject: string
  message: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high"
  createdAt: string
  lastUpdated: string
  responses: {
    id: string
    message: string
    sender: "user" | "support"
    timestamp: string
  }[]
}

interface ForumPost {
  id: string
  title: string
  author: string
  category: string
  replies: number
  lastActivity: string
  excerpt: string
}

export default function ClientDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isCreatingProgram, setIsCreatingProgram] = useState(false)
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSession[]>([])
  const [registeredClasses, setRegisteredClasses] = useState<ClassRegistration[]>([])
  const [programForm, setProgramForm] = useState({
    name: "",
    subtitle: "",
    startDate: "",
    totalWeeks: 12,
    goals: "",
  })

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "user-123",
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    phone: "+1 (555) 123-4567",
    emergencyContact: {
      name: "Sarah Johnson",
      phone: "+1 (555) 987-6543",
      relationship: "Spouse",
    },
    memberSince: "January 2024",
    membershipType: "Premium",
    fitnessGoals: ["Weight Loss", "Strength Building", "HYROX Competition"],
    medicalNotes: "Previous knee injury - avoid high impact exercises",
  })

  const [favoriteClasses, setFavoriteClasses] = useState<FavoriteClass[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [classReviews, setClassReviews] = useState<ClassReview[]>([])
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [forumPosts, setForumPosts] = useState<ForumPost[]>([])
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [newTicket, setNewTicket] = useState({ subject: "", message: "", priority: "medium" as const })
  const [newReview, setNewReview] = useState({ classId: "", rating: 5, comment: "" })

  // Sample user stats and data
  const userStats = {
    classesCompleted: 24,
    currentStreak: 5,
    weeklyGoal: 3,
    thisWeekAttended: 2,
    totalWorkouts: 47,
    avgCaloriesPerSession: 385,
    favoriteWorkout: "HYROX Prep",
    memberSince: "January 2024",
    nextClass: {
      name: "Metabolic Conditioning",
      date: "Today",
      time: "6:00 PM",
      instructor: "Coach Lisa",
    },
  }

  // Initialize workout sessions
  useEffect(() => {
    const sessions: WorkoutSession[] = [
      {
        id: "1",
        date: "2025-01-29",
        type: "HYROX Prep",
        duration: 45,
        calories: 420,
        completed: true,
        rating: 5,
      },
      {
        id: "2",
        date: "2025-01-27",
        type: "Strength Training",
        duration: 60,
        calories: 380,
        completed: true,
        rating: 4,
      },
      {
        id: "3",
        date: "2025-01-25",
        type: "Metabolic Conditioning",
        duration: 40,
        calories: 450,
        completed: true,
        rating: 5,
      },
      {
        id: "4",
        date: "2025-01-30",
        type: "Recovery Session",
        duration: 30,
        calories: 200,
        completed: false,
      },
    ]
    setWorkoutSessions(sessions)
  }, [])

  // Initialize class registrations
  useEffect(() => {
    const classes: ClassRegistration[] = [
      {
        id: "1",
        name: "Metabolic Conditioning",
        date: "2025-01-30",
        time: "6:00 PM",
        instructor: "Coach Lisa",
        spotsLeft: 3,
        registered: true,
        status: "upcoming",
      },
      {
        id: "2",
        name: "HYROX Prep Session",
        date: "2025-01-31",
        time: "6:00 AM",
        instructor: "Coach Sarah",
        spotsLeft: 5,
        registered: false,
        status: "upcoming",
      },
      {
        id: "3",
        name: "Strength & Conditioning",
        date: "2025-02-01",
        time: "7:30 AM",
        instructor: "Coach Mike",
        spotsLeft: 2,
        registered: true,
        status: "upcoming",
      },
      {
        id: "4",
        name: "HYROX Prep",
        date: "2025-01-29",
        time: "6:00 PM",
        instructor: "Coach Sarah",
        spotsLeft: 0,
        registered: true,
        status: "completed",
      },
    ]
    setRegisteredClasses(classes)
  }, [])

  // Initialize favorite classes, notifications, reviews, and support tickets
  useEffect(() => {
    // Initialize favorite classes
    const favorites: FavoriteClass[] = [
      {
        id: "fav-1",
        name: "HYROX Prep Session",
        instructor: "Coach Sarah",
        averageRating: 4.8,
        timesAttended: 12,
        lastAttended: "2025-01-29",
      },
      {
        id: "fav-2",
        name: "Metabolic Conditioning",
        instructor: "Coach Lisa",
        averageRating: 4.6,
        timesAttended: 8,
        lastAttended: "2025-01-27",
      },
    ]
    setFavoriteClasses(favorites)

    // Initialize notifications
    const notifs: Notification[] = [
      {
        id: "notif-1",
        type: "class",
        title: "Class Reminder",
        message: "Your Metabolic Conditioning class starts in 2 hours",
        date: "Today, 4:00 PM",
        read: false,
      },
      {
        id: "notif-2",
        type: "event",
        title: "New Event Available",
        message: "HYROX Competition Prep Workshop - Register now!",
        date: "Yesterday",
        read: false,
      },
      {
        id: "notif-3",
        type: "system",
        title: "Profile Updated",
        message: "Your emergency contact information has been updated",
        date: "2 days ago",
        read: true,
      },
    ]
    setNotifications(notifs)

    // Initialize reviews
    const reviews: ClassReview[] = [
      {
        id: "review-1",
        classId: "class-001",
        className: "HYROX Prep Session",
        rating: 5,
        comment:
          "Excellent class! Coach Sarah really knows how to push us while keeping it safe. The workout structure was perfect for building endurance.",
        date: "2025-01-29",
        instructor: "Coach Sarah",
      },
      {
        id: "review-2",
        classId: "class-002",
        className: "Strength & Conditioning",
        rating: 4,
        comment: "Great strength focus. Would love to see more variety in the accessory exercises.",
        date: "2025-01-27",
        instructor: "Coach Mike",
      },
    ]
    setClassReviews(reviews)

    // Initialize support tickets
    const tickets: SupportTicket[] = [
      {
        id: "ticket-1",
        subject: "Class Booking Issue",
        message:
          "I'm having trouble booking the 6 AM HYROX class. The system shows it's full but I can see spots available.",
        status: "resolved",
        priority: "medium",
        createdAt: "2025-01-25T10:00:00Z",
        lastUpdated: "2025-01-26T14:30:00Z",
        responses: [
          {
            id: "resp-1",
            message:
              "Hi Alex, I've checked the system and there was a sync issue. I've manually added you to the class. You should receive a confirmation email shortly.",
            sender: "support",
            timestamp: "2025-01-26T14:30:00Z",
          },
        ],
      },
    ]
    setSupportTickets(tickets)

    // Initialize forum posts
    const posts: ForumPost[] = [
      {
        id: "post-1",
        title: "Best warm-up routine for HYROX?",
        author: "FitnessFan23",
        category: "Training Tips",
        replies: 12,
        lastActivity: "2025-08-30T08:30:00Z",
        excerpt: "Looking for advice on the most effective warm-up routine before HYROX training sessions..."
      },
      {
        id: "post-2",
        title: "Nutrition timing for morning workouts",
        author: "EarlyBird",
        category: "Nutrition",
        replies: 8,
        lastActivity: "2025-08-30T10:15:00Z",
        excerpt: "What's the best approach for fueling 6 AM classes? Should I eat before or after?"
      },
    ]
    setForumPosts(posts)
  }, [])

  // Add these handler functions after the existing handlers:

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
  }

  const toggleFavoriteClass = (classId: string, className: string, instructor: string) => {
    const isCurrentlyFavorite = favoriteClasses.some((fav) => fav.id === classId)

    if (isCurrentlyFavorite) {
      setFavoriteClasses((prev) => prev.filter((fav) => fav.id !== classId))
      alert(`Removed ${className} from favorites`)
    } else {
      const newFavorite: FavoriteClass = {
        id: classId,
        name: className,
        instructor: instructor,
        averageRating: 4.5,
        timesAttended: 1,
        lastAttended: new Date().toISOString().split("T")[0],
      }
      setFavoriteClasses((prev) => [...prev, newFavorite])
      alert(`Added ${className} to favorites`)
    }
  }

  const createSupportTicket = () => {
    const subject = prompt("What's the subject of your ticket?")
    const message = prompt("Please describe your issue in detail:")
    const priorityInput = prompt("Priority level (low/medium/high):", "medium")

    if (subject && message) {
      const priority = priorityInput === "high" || priorityInput === "low" ? priorityInput : "medium"
      const newTicket: SupportTicket = {
        id: `ticket-${Date.now()}`,
        subject,
        message,
        status: "open",
        priority: priority as "low" | "medium" | "high",
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        responses: [],
      }
      setSupportTickets((prev) => [newTicket, ...prev])
      alert("Support ticket created successfully! Our team will respond within 24 hours.")
    }
  }

  const submitClassReview = () => {
    const className = prompt("Which class would you like to review?")
    const ratingInput = prompt("Rate the class (1-5 stars):")
    const comment = prompt("Share your experience:")

    if (className && ratingInput && comment) {
      const rating = Math.max(1, Math.min(5, Number.parseInt(ratingInput) || 5))
      const newReview: ClassReview = {
        id: `review-${Date.now()}`,
        classId: `class-${Date.now()}`,
        className,
        rating,
        comment,
        date: new Date().toISOString().split("T")[0],
        instructor: "Coach",
      }
      setClassReviews((prev) => [newReview, ...prev])
      alert("Thank you for your review! It helps us improve our classes.")
    }
  }

  const updateProfile = () => {
    setIsEditingProfile(false)
    alert("Profile updated successfully! Your information has been saved.")
  }

  const sendMessage = (recipient: string) => {
    const message = prompt(`Send a message to ${recipient}:`)
    if (message) {
      alert(`Message sent to ${recipient}: "${message}"`)
    }
  }

  const joinForumDiscussion = (category: string) => {
    alert(`Joining ${category} discussion! You'll receive notifications for new posts.`)
  }

  const handleCreateProgram = async () => {
    console.log("Creating program:", programForm)
    setProgramForm({
      name: "",
      subtitle: "",
      startDate: "",
      totalWeeks: 12,
      goals: "",
    })
    setIsCreatingProgram(false)
    alert("Program created successfully! A coach will review and customize it for you.")
  }

  const handleClassRegistration = (classId: string, register: boolean) => {
    setRegisteredClasses((prev) =>
      prev.map((cls) =>
        cls.id === classId
          ? { ...cls, registered: register, spotsLeft: register ? cls.spotsLeft - 1 : cls.spotsLeft + 1 }
          : cls,
      ),
    )
  }

  const completeWorkout = (sessionId: string, rating: number) => {
    setWorkoutSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, completed: true, rating } : session)),
    )
  }

  const weeklyProgress = Math.round((userStats.thisWeekAttended / userStats.weeklyGoal) * 100)
  const completedWorkouts = workoutSessions.filter((w) => w.completed).length
  const upcomingWorkouts = workoutSessions.filter((w) => !w.completed).length

  const sampleWorkout = {
    rounds: [
      {
        name: "Block 1 - Warm-up",
        exercises: [
          { name: "Dynamic Stretching", value: 5, unit: "MINS" },
          { name: "Joint Mobility", value: 10, unit: "REPS" },
          { name: "Light Cardio", value: 3, unit: "MINS" },
        ],
        rounds: 1,
      },
      {
        name: "Block 2 - Main Set",
        exercises: [
          { name: "Box Jumps", value: 10, unit: "REPS", equipment: '24" Box' },
          { name: "Push-ups", value: 15, unit: "REPS", equipment: "Body Weight" },
          { name: "Kettlebell Swings", value: 20, unit: "REPS", weight: "24kg" },
          { name: "Burpees", value: 8, unit: "REPS", equipment: "Body Weight" },
        ],
        rounds: 3,
      },
      {
        name: "Block 3 - Conditioning",
        exercises: [
          { name: "Mountain Climbers", value: 30, unit: "SECS" },
          { name: "Plank Hold", value: 45, unit: "SECS" },
          { name: "Jump Squats", value: 12, unit: "REPS" },
        ],
        rounds: 2,
      },
      {
        name: "Block 4 - Cool Down",
        exercises: [
          { name: "Static Stretching", value: 5, unit: "MINS" },
          { name: "Foam Rolling", value: 5, unit: "MINS" },
        ],
        rounds: 1,
      },
    ],
  }

  return (
    <div className="min-h-screen bg-black">
      <SiteHeader />

      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-thin text-white mb-2">My Dashboard</h1>
            <p className="text-white/60 font-light text-sm sm:text-base">Track your fitness journey with ATHLELAND</p>
          </div>
          <Button
            onClick={() => setIsCreatingProgram(true)}
            className="bg-accent hover:bg-accent/90 text-black w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Program
          </Button>
        </div>

        {/* Create Program Modal */}
        {isCreatingProgram && (
          <Card className="glass border-white/10 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-white font-light text-lg">Create Your Training Program</CardTitle>
              <p className="text-white/60 text-sm">
                Tell us about your fitness goals and we'll create a personalized program
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label className="text-white text-sm">Program Name</Label>
                  <Input
                    value={programForm.name}
                    onChange={(e) => setProgramForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white mt-2"
                    placeholder="e.g., My HYROX Journey, Summer Shred, Marathon Prep"
                  />
                </div>
                <div>
                  <Label className="text-white text-sm">Program Description</Label>
                  <Input
                    value={programForm.subtitle}
                    onChange={(e) => setProgramForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white mt-2"
                    placeholder="e.g., Get ready for my first HYROX competition"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-white text-sm">Start Date</Label>
                    <Input
                      type="date"
                      value={programForm.startDate}
                      onChange={(e) => setProgramForm((prev) => ({ ...prev, startDate: e.target.value }))}
                      className="bg-white/5 border-white/20 text-white mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-sm">Duration (weeks)</Label>
                    <Input
                      type="number"
                      min="4"
                      max="52"
                      value={programForm.totalWeeks}
                      onChange={(e) =>
                        setProgramForm((prev) => ({ ...prev, totalWeeks: Number.parseInt(e.target.value) }))
                      }
                      className="bg-white/5 border-white/20 text-white mt-2"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white text-sm">Your Goals & Preferences</Label>
                  <Textarea
                    value={programForm.goals}
                    onChange={(e) => setProgramForm((prev) => ({ ...prev, goals: e.target.value }))}
                    className="bg-white/5 border-white/20 text-white mt-2"
                    placeholder="Tell us about your fitness goals, current level, preferred workout types, any limitations, etc..."
                    rows={4}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleCreateProgram}
                  disabled={!programForm.name || !programForm.startDate || !programForm.goals}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Program
                </Button>
                <Button
                  onClick={() => {
                    setIsCreatingProgram(false)
                    setProgramForm({ name: "", subtitle: "", startDate: "", totalWeeks: 12, goals: "" })
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                <p className="text-accent text-sm font-medium mb-2">How it works:</p>
                <ul className="text-white/60 text-sm space-y-1">
                  <li>• Submit your program request with your goals</li>
                  <li>• Our coaches will review and create a personalized plan</li>
                  <li>• You'll receive your custom program within 24-48 hours</li>
                  <li>• Track your progress and get ongoing support</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 bg-white/5 border border-white/10 h-auto mb-6">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-accent data-[state=active]:text-black text-xs sm:text-sm py-2"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="workouts"
              className="data-[state=active]:bg-accent data-[state=active]:text-black text-xs sm:text-sm py-2"
            >
              Workouts
            </TabsTrigger>
            <TabsTrigger
              value="classes"
              className="data-[state=active]:bg-accent data-[state=active]:text-black text-xs sm:text-sm py-2"
            >
              Classes
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="data-[state=active]:bg-accent data-[state=active]:text-black text-xs sm:text-sm py-2"
            >
              Progress
            </TabsTrigger>
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-accent data-[state=active]:text-black text-xs sm:text-sm py-2"
            >
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/20 text-accent">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Classes</p>
                      <p className="text-xl font-thin text-white">{userStats.classesCompleted}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-600/20 text-green-400">
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Streak</p>
                      <p className="text-xl font-thin text-white">{userStats.currentStreak}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Week Goal</p>
                      <p className="text-xl font-thin text-white">
                        {userStats.thisWeekAttended}/{userStats.weeklyGoal}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-600/20 text-purple-400">
                      <Dumbbell className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">Workouts</p>
                      <p className="text-xl font-thin text-white">{userStats.totalWorkouts}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-light text-lg">Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm">Classes this week</span>
                    <span className="text-white font-medium">
                      {userStats.thisWeekAttended}/{userStats.weeklyGoal}
                    </span>
                  </div>
                  <Progress value={weeklyProgress} className="h-2 bg-white/10" />
                  <p className="text-white/60 text-xs">
                    {weeklyProgress >= 100 ? "🎉 Goal achieved!" : `${100 - weeklyProgress}% to go`}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Next Class */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-light text-lg">Next Class</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-accent/10 rounded-lg border border-accent/20">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-accent/20 text-accent">
                      <Play className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">{userStats.nextClass.name}</h3>
                      <div className="flex items-center gap-4 text-white/60 text-sm mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {userStats.nextClass.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {userStats.nextClass.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {userStats.nextClass.instructor}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button className="bg-accent hover:bg-accent/90 text-black w-full sm:w-auto">View Workout</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workouts" className="space-y-4">
            {/* Workout Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="glass border-white/10">
                <CardContent className="p-4 text-center">
                  <Dumbbell className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-thin text-white">{completedWorkouts}</p>
                  <p className="text-white/60 text-sm">Completed</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/10">
                <CardContent className="p-4 text-center">
                  <Timer className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-thin text-white">{upcomingWorkouts}</p>
                  <p className="text-white/60 text-sm">Upcoming</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/10">
                <CardContent className="p-4 text-center">
                  <Heart className="h-8 w-8 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-thin text-white">{userStats.avgCaloriesPerSession}</p>
                  <p className="text-white/60 text-sm">Avg Calories</p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Workout */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-light text-lg">Today's Workout</CardTitle>
              </CardHeader>
              <CardContent>
                <MobileWorkoutBreakdown rounds={sampleWorkout.rounds} />
              </CardContent>
            </Card>

            {/* Workout History */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-light text-lg">Recent Workouts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {workoutSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white/5 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${session.completed ? "bg-green-600/20 text-green-400" : "bg-accent/20 text-accent"}`}
                      >
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">{session.type}</h4>
                        <div className="flex items-center gap-4 text-white/60 text-xs mt-1">
                          <span>{session.date}</span>
                          <span>{session.duration} mins</span>
                          <span>{session.calories} cal</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.completed ? (
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-600/20 text-green-400">Completed</Badge>
                          {session.rating && (
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${i < session.rating! ? "text-yellow-400 fill-current" : "text-white/20"}`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => completeWorkout(session.id, 5)}
                          className="bg-accent hover:bg-accent/90 text-black"
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes" className="space-y-4">
            {/* Class Registration Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Card className="glass border-white/10">
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-thin text-white">
                    {registeredClasses.filter((c) => c.registered && c.status === "upcoming").length}
                  </p>
                  <p className="text-white/60 text-sm">Registered</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/10">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-thin text-white">
                    {registeredClasses.filter((c) => c.status === "completed").length}
                  </p>
                  <p className="text-white/60 text-sm">Attended</p>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Classes */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-light text-lg">Available Classes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {registeredClasses
                  .filter((c) => c.status === "upcoming")
                  .map((classItem) => (
                    <div
                      key={classItem.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-accent/20 text-accent">
                          <Activity className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-sm">{classItem.name}</h4>
                          <div className="flex items-center gap-4 text-white/60 text-xs mt-1">
                            <span>{classItem.date}</span>
                            <span>{classItem.time}</span>
                            <span>{classItem.instructor}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            classItem.registered ? "bg-green-600/20 text-green-400" : "bg-white/10 text-white/60"
                          }
                        >
                          {classItem.registered ? "Registered" : `${classItem.spotsLeft} spots`}
                        </Badge>
                        <Button
                          size="sm"
                          variant={classItem.registered ? "outline" : "default"}
                          className={classItem.registered ? "" : "bg-accent hover:bg-accent/90 text-black"}
                          onClick={() => handleClassRegistration(classItem.id, !classItem.registered)}
                        >
                          {classItem.registered ? "Cancel" : "Register"}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleFavoriteClass(classItem.id, classItem.name, classItem.instructor)}
                          className={`p-2 ${favoriteClasses.some((fav) => fav.id === classItem.id) ? "text-red-400" : "text-white/40 hover:text-red-400"}`}
                        >
                          <Heart
                            className={`h-4 w-4 ${favoriteClasses.some((fav) => fav.id === classItem.id) ? "fill-current" : ""}`}
                          />
                        </Button>
                      </div>
                    </div>
                  ))}
              </CardContent>
            </Card>

            {/* Class History */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-light text-lg">Class History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {registeredClasses
                  .filter((c) => c.status === "completed")
                  .map((classItem) => (
                    <div key={classItem.id} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg opacity-75">
                      <div className="p-2 rounded-lg bg-green-600/20 text-green-400">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-sm">{classItem.name}</h4>
                        <div className="flex items-center gap-4 text-white/60 text-xs mt-1">
                          <span>{classItem.date}</span>
                          <span>{classItem.time}</span>
                          <span>{classItem.instructor}</span>
                        </div>
                      </div>
                      <Badge className="bg-green-600/20 text-green-400 ml-auto">Completed</Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            {/* Progress Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="glass border-white/10">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-thin text-white">{userStats.totalWorkouts}</p>
                  <p className="text-white/60 text-sm">Total Workouts</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/10">
                <CardContent className="p-4 text-center">
                  <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-thin text-white">{userStats.currentStreak}</p>
                  <p className="text-white/60 text-sm">Day Streak</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/10">
                <CardContent className="p-4 text-center">
                  <Award className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-thin text-white">{userStats.classesCompleted}</p>
                  <p className="text-white/60 text-sm">Classes Done</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/10">
                <CardContent className="p-4 text-center">
                  <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-thin text-white">12</p>
                  <p className="text-white/60 text-sm">Months Active</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Progress */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-light text-lg">Fitness Journey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/60 text-sm">Weekly Goal Progress</span>
                    <span className="text-white font-medium">{weeklyProgress}%</span>
                  </div>
                  <Progress value={weeklyProgress} className="h-2 bg-white/10" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/60 text-sm">Monthly Attendance</span>
                    <span className="text-white font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2 bg-white/10" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/60 text-sm">Strength Progress</span>
                    <span className="text-white font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-2 bg-white/10" />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-white/60 text-sm">Cardio Endurance</span>
                    <span className="text-white font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-2 bg-white/10" />
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-light text-lg">Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-4 p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <Award className="h-6 w-6 text-accent" />
                  <div>
                    <h4 className="text-white font-medium text-sm">5-Day Streak!</h4>
                    <p className="text-white/60 text-xs">Completed workouts 5 days in a row</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-green-600/10 rounded-lg border border-green-600/20">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <div>
                    <h4 className="text-white font-medium text-sm">First HYROX Class</h4>
                    <p className="text-white/60 text-xs">Completed your first HYROX preparation session</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-purple-600/10 rounded-lg border border-purple-600/20">
                  <Target className="h-6 w-6 text-purple-400" />
                  <div>
                    <h4 className="text-white font-medium text-sm">Weekly Goal Achieved</h4>
                    <p className="text-white/60 text-xs">Met your weekly workout target</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            {/* Profile Header */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-white font-light text-xl">{userProfile.name}</CardTitle>
                      <p className="text-white/60 text-sm">
                        {userProfile.membershipType} Member since {userProfile.memberSince}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {isEditingProfile ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Profile Settings */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-light text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Profile Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white text-sm">Full Name</Label>
                        <Input
                          value={userProfile.name}
                          onChange={(e) => setUserProfile((prev) => ({ ...prev, name: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Email</Label>
                        <Input
                          type="email"
                          value={userProfile.email}
                          onChange={(e) => setUserProfile((prev) => ({ ...prev, email: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Phone</Label>
                        <Input
                          value={userProfile.phone}
                          onChange={(e) => setUserProfile((prev) => ({ ...prev, phone: e.target.value }))}
                          className="bg-white/5 border-white/20 text-white mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Emergency Contact Name</Label>
                        <Input
                          value={userProfile.emergencyContact.name}
                          onChange={(e) =>
                            setUserProfile((prev) => ({
                              ...prev,
                              emergencyContact: { ...prev.emergencyContact, name: e.target.value },
                            }))
                          }
                          className="bg-white/5 border-white/20 text-white mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Emergency Contact Phone</Label>
                        <Input
                          value={userProfile.emergencyContact.phone}
                          onChange={(e) =>
                            setUserProfile((prev) => ({
                              ...prev,
                              emergencyContact: { ...prev.emergencyContact, phone: e.target.value },
                            }))
                          }
                          className="bg-white/5 border-white/20 text-white mt-2"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-sm">Relationship</Label>
                        <Input
                          value={userProfile.emergencyContact.relationship}
                          onChange={(e) =>
                            setUserProfile((prev) => ({
                              ...prev,
                              emergencyContact: { ...prev.emergencyContact, relationship: e.target.value },
                            }))
                          }
                          className="bg-white/5 border-white/20 text-white mt-2"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-white text-sm">Medical Notes</Label>
                      <Textarea
                        value={userProfile.medicalNotes || ""}
                        onChange={(e) => setUserProfile((prev) => ({ ...prev, medicalNotes: e.target.value }))}
                        className="bg-white/5 border-white/20 text-white mt-2"
                        placeholder="Any medical conditions, injuries, or limitations coaches should know about..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button onClick={updateProfile} className="bg-green-600 hover:bg-green-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button onClick={() => setIsEditingProfile(false)} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-accent" />
                        <div>
                          <p className="text-white/60 text-xs">Email</p>
                          <p className="text-white text-sm">{userProfile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-accent" />
                        <div>
                          <p className="text-white/60 text-xs">Phone</p>
                          <p className="text-white text-sm">{userProfile.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <UserCheck className="h-4 w-4 text-accent" />
                        <div>
                          <p className="text-white/60 text-xs">Emergency Contact</p>
                          <p className="text-white text-sm">{userProfile.emergencyContact.name}</p>
                          <p className="text-white/60 text-xs">{userProfile.emergencyContact.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Target className="h-4 w-4 text-accent" />
                        <div>
                          <p className="text-white/60 text-xs">Fitness Goals</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {userProfile.fitnessGoals.map((goal, index) => (
                              <Badge key={index} className="bg-accent/20 text-accent text-xs">
                                {goal}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    {userProfile.medicalNotes && (
                      <div className="p-3 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
                        <p className="text-yellow-400 text-xs font-medium mb-1">Medical Notes</p>
                        <p className="text-white/80 text-sm">{userProfile.medicalNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Favorite Classes */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-light text-lg flex items-center gap-2">
                  <Bookmark className="h-5 w-5" />
                  Favorite Classes
                  <Badge className="bg-accent/20 text-accent text-xs">{favoriteClasses.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {favoriteClasses.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-sm">No favorite classes yet</p>
                    <p className="text-white/40 text-xs mt-1">Heart classes you love to see them here</p>
                    <Button
                      onClick={() => toggleFavoriteClass("demo-class", "Demo Class", "Coach Demo")}
                      className="bg-accent hover:bg-accent/90 text-black mt-4"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Add Demo Favorite
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {favoriteClasses.map((cls) => (
                      <div key={cls.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleFavoriteClass(cls.id, cls.name, cls.instructor)}
                            className="p-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors"
                          >
                            <Heart className="h-4 w-4 fill-current" />
                          </button>
                          <div>
                            <h4 className="text-white font-medium text-sm">{cls.name}</h4>
                            <p className="text-white/60 text-xs">{cls.instructor}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                <span className="text-white/60 text-xs">{cls.averageRating}</span>
                              </div>
                              <span className="text-white/60 text-xs">{cls.timesAttended} times attended</span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="bg-accent hover:bg-accent/90 text-black">
                          Book Again
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-light text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <Badge className="bg-red-600/20 text-red-400 text-xs">
                      {notifications.filter((n) => !n.read).length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-sm">No notifications</p>
                    <p className="text-white/40 text-xs mt-1">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          notification.read
                            ? "bg-white/5 border-white/10 opacity-60"
                            : "bg-accent/10 border-accent/20 hover:bg-accent/15"
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="text-white font-medium text-sm">{notification.title}</h4>
                            <p className="text-white/60 text-xs mt-1">{notification.message}</p>
                            <p className="text-white/40 text-xs mt-2">{notification.date}</p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0 mt-2"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Support Tickets */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-light text-lg flex items-center gap-2">
                    <HelpCircle className="h-5 w-5" />
                    Support Tickets
                    <Badge className="bg-blue-600/20 text-blue-400 text-xs">{supportTickets.length}</Badge>
                  </CardTitle>
                  <Button size="sm" onClick={createSupportTicket} className="bg-accent hover:bg-accent/90 text-black">
                    <Plus className="h-4 w-4 mr-2" />
                    New Ticket
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {supportTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <HelpCircle className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-sm">No support tickets</p>
                    <p className="text-white/40 text-xs mt-1">Need help? Create a support ticket</p>
                    <Button onClick={createSupportTicket} className="bg-accent hover:bg-accent/90 text-black mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Ticket
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {supportTickets.map((ticket) => (
                      <div key={ticket.id} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h4 className="text-white font-medium text-sm">{ticket.subject}</h4>
                            <p className="text-white/60 text-xs mt-1">{ticket.message}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                ticket.status === "open"
                                  ? "bg-red-600/20 text-red-400"
                                  : ticket.status === "in-progress"
                                    ? "bg-yellow-600/20 text-yellow-400"
                                    : "bg-green-600/20 text-green-400"
                              }
                            >
                              {ticket.status}
                            </Badge>
                            <Badge
                              className={
                                ticket.priority === "high"
                                  ? "bg-red-600/20 text-red-400"
                                  : ticket.priority === "medium"
                                    ? "bg-yellow-600/20 text-yellow-400"
                                    : "bg-green-600/20 text-green-400"
                              }
                            >
                              {ticket.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-white/40">
                          <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                          <span>Updated: {new Date(ticket.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        {ticket.responses.length > 0 && (
                          <div className="mt-3 p-3 bg-green-600/10 border border-green-600/20 rounded-lg">
                            <p className="text-green-400 text-xs font-medium mb-1">Latest Response:</p>
                            <p className="text-white/80 text-xs">{ticket.responses[0].message}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Class Reviews */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white font-light text-lg flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5" />
                    My Reviews
                    <Badge className="bg-purple-600/20 text-purple-400 text-xs">{classReviews.length}</Badge>
                  </CardTitle>
                  <Button size="sm" onClick={submitClassReview} className="bg-accent hover:bg-accent/90 text-black">
                    <Plus className="h-4 w-4 mr-2" />
                    Write Review
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {classReviews.length === 0 ? (
                  <div className="text-center py-8">
                    <ThumbsUp className="h-12 w-12 text-white/20 mx-auto mb-4" />
                    <p className="text-white/60 text-sm">No reviews yet</p>
                    <p className="text-white/40 text-xs mt-1">Share your experience with classes</p>
                    <Button onClick={submitClassReview} className="bg-accent hover:bg-accent/90 text-black mt-4">
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Write First Review
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {classReviews.map((review) => (
                      <div key={review.id} className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <h4 className="text-white font-medium text-sm">{review.className}</h4>
                            <p className="text-white/60 text-xs">{review.instructor}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < review.rating ? "text-yellow-400 fill-current" : "text-white/20"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-white/80 text-sm mb-2">{review.comment}</p>
                        <p className="text-white/40 text-xs">{new Date(review.date).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Community Forum */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-light text-lg flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Community Forum
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <h4 className="text-white font-medium text-sm mb-2">💪 Training Tips & Techniques</h4>
                    <p className="text-white/60 text-xs mb-3">Share and discover effective training methods</p>
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <span>24 posts • 156 members</span>
                      <Button
                        size="sm"
                        onClick={() => joinForumDiscussion("Training Tips & Techniques")}
                        className="bg-accent hover:bg-accent/90 text-black"
                      >
                        Join Discussion
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium text-sm mb-2">🏆 HYROX Competition Prep</h4>
                    <p className="text-white/60 text-xs mb-3">Connect with fellow HYROX athletes</p>
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <span>18 posts • 89 members</span>
                      <Button size="sm" variant="outline" onClick={() => joinForumDiscussion("HYROX Competition Prep")}>
                        View Posts
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium text-sm mb-2">🥗 Nutrition & Recovery</h4>
                    <p className="text-white/60 text-xs mb-3">Discuss nutrition strategies and recovery tips</p>
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <span>31 posts • 203 members</span>
                      <Button size="sm" variant="outline" onClick={() => joinForumDiscussion("Nutrition & Recovery")}>
                        View Posts
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <h4 className="text-white font-medium text-sm mb-2">🎯 Goal Setting & Motivation</h4>
                    <p className="text-white/60 text-xs mb-3">Share your fitness journey and inspire others</p>
                    <div className="flex items-center justify-between text-xs text-white/40">
                      <span>42 posts • 267 members</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => joinForumDiscussion("Goal Setting & Motivation")}
                      >
                        View Posts
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="glass border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white font-light text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Messages
                  <Badge className="bg-green-600/20 text-green-400 text-xs">2 new</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium text-sm">Coach Sarah Miller</h4>
                      <span className="text-white/40 text-xs">2 hours ago</span>
                    </div>
                    <p className="text-white/80 text-sm mb-3">
                      Great job in today's HYROX prep session! I noticed improvement in your sled push technique. Keep
                      focusing on that low body position we practiced.
                    </p>
                    <Button
                      size="sm"
                      onClick={() => sendMessage("Coach Sarah Miller")}
                      className="bg-accent hover:bg-accent/90 text-black"
                    >
                      <Send className="h-3 w-3 mr-2" />
                      Reply
                    </Button>
                  </div>

                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium text-sm">ATHLELAND Support</h4>
                      <span className="text-white/40 text-xs">1 day ago</span>
                    </div>
                    <p className="text-white/80 text-sm mb-3">
                      Welcome to ATHLELAND! We're excited to have you as part of our community. Don't hesitate to reach
                      out if you have any questions.
                    </p>
                    <Button size="sm" variant="outline" onClick={() => alert("Message marked as read!")}>
                      Mark as Read
                    </Button>
                  </div>

                  <div className="text-center py-4">
                    <Button
                      onClick={() => alert("Opening full message center...")}
                      className="bg-accent hover:bg-accent/90 text-black"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      View All Messages
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 py-6 mt-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-white/40 text-sm font-light">@2025 ATHLELAND. All Rights Reserved</p>
        </div>
      </div>
    </div>
  )
}
