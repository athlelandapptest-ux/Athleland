"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Target, TrendingUp, User, Settings, Heart, LogOut, Home } from "lucide-react"
import { fetchAllClasses } from "@/app/actions"
import type { WorkoutClass } from "@/lib/workouts"
import Link from "next/link"

export default function ClientDashboardPage() {
  const [classes, setClasses] = useState<WorkoutClass[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const classesData = await fetchAllClasses()
        setClasses(classesData)
      } catch (error) {
        console.error("Error loading classes:", error)
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [])

  const upcomingClasses = classes.filter((cls) => new Date(cls.date) >= new Date())
  const todaysClasses = classes.filter((cls) => cls.date === new Date().toISOString().split("T")[0])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-display font-thin text-white hover:text-accent transition-colors">
                ATHLELAND
              </Link>
              <Badge className="bg-accent/20 text-accent border-accent/30">Client Dashboard</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent border-white/20 text-white hover:bg-white/5"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent border-white/20 text-white hover:bg-white/5"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-thin text-white mb-2">Welcome Back!</h1>
          <p className="text-white/60 font-light">Ready to crush your fitness goals today?</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 mb-8">
            <TabsTrigger value="overview" className="data-[state=active]:bg-accent data-[state=active]:text-black">
              <Target className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="classes" className="data-[state=active]:bg-accent data-[state=active]:text-black">
              <Calendar className="h-4 w-4 mr-2" />
              My Classes
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-accent data-[state=active]:text-black">
              <TrendingUp className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-accent data-[state=active]:text-black">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Today's Classes */}
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white font-light flex items-center gap-2">
                  <Clock className="h-5 w-5 text-accent" />
                  Today's Classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todaysClasses.length > 0 ? (
                  <div className="space-y-4">
                    {todaysClasses.map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div>
                          <h3 className="text-white font-medium">{cls.name}</h3>
                          <p className="text-white/60 text-sm">
                            {cls.time} • {cls.instructor}
                          </p>
                        </div>
                        <Button className="bg-accent hover:bg-accent/90 text-black">Enter Training Mode</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60">No classes scheduled for today. Time to rest!</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="glass border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-thin text-accent mb-2">12</div>
                  <p className="text-white/60 text-sm">Classes This Month</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-thin text-accent mb-2">850</div>
                  <p className="text-white/60 text-sm">Calories Burned</p>
                </CardContent>
              </Card>
              <Card className="glass border-white/10">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-thin text-accent mb-2">4.8</div>
                  <p className="text-white/60 text-sm">Average Rating</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white font-light">Upcoming Classes</CardTitle>
                <CardDescription className="text-white/60">Book and manage your training sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white/60">Loading classes...</p>
                  </div>
                ) : upcomingClasses.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingClasses.slice(0, 5).map((cls) => (
                      <div
                        key={cls.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div className="flex-1">
                          <h3 className="text-white font-medium">{cls.name}</h3>
                          <p className="text-white/60 text-sm">
                            {cls.date} • {cls.time} • {cls.instructor}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="border-accent/30 text-accent">
                              Intensity: {cls.intensity}/15
                            </Badge>
                            <Badge variant="outline" className="border-white/20 text-white/60">
                              {cls.duration} min
                            </Badge>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-white/20 text-white hover:bg-white/5 bg-transparent"
                          >
                            <Heart className="h-4 w-4" />
                          </Button>
                          <Button className="bg-accent hover:bg-accent/90 text-black">Book Class</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/60 text-center py-8">No upcoming classes available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white font-light">Your Progress</CardTitle>
                <CardDescription className="text-white/60">Track your fitness journey and achievements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/80">Monthly Goal</span>
                      <span className="text-accent">12/15 classes</span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className="bg-accent h-2 rounded-full" style={{ width: "80%" }}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-thin text-white mb-1">24</div>
                      <p className="text-white/60 text-sm">Total Classes</p>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-lg">
                      <div className="text-2xl font-thin text-white mb-1">18h</div>
                      <p className="text-white/60 text-sm">Training Time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="text-white font-light">Profile Settings</CardTitle>
                <CardDescription className="text-white/60">
                  Manage your account information and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Personal Information</h3>
                      <p className="text-white/60 text-sm">Update your name, email, and contact details</p>
                    </div>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 bg-transparent">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Fitness Goals</h3>
                      <p className="text-white/60 text-sm">Set and track your fitness objectives</p>
                    </div>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 bg-transparent">
                      <Target className="h-4 w-4 mr-2" />
                      Manage
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <h3 className="text-white font-medium">Notifications</h3>
                      <p className="text-white/60 text-sm">Configure your notification preferences</p>
                    </div>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/5 bg-transparent">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="bg-black text-center py-6 border-t border-white/5">
        <p className="text-white/30 text-sm font-light">@2025 ATHLETELAND. All Rights Reserved</p>
      </div>
    </div>
  )
}
