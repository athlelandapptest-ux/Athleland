"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventManagement } from "@/components/event-management"
import { SponsorshipManagement } from "@/components/sponsorship-management"
import { ClassManagementFull } from "@/components/class-management-full"
import { ProgramManagementFull } from "@/components/program-management-full"
import { CoachManagement } from "@/components/coach-management"
import { WorkoutTemplates } from "@/components/workout-templates"
import { AdminSettings } from "@/components/admin-settings"
import { AdminAuthProvider, useAdminAuth, AdminLoginForm } from "@/components/admin-auth"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"


function AdminDashboardContent() {
  const [activeTab, setActiveTab] = useState("templates")
  const [activeCategory, setActiveCategory] = useState("content")
  const { isAuthenticated, logout } = useAdminAuth()

  if (!isAuthenticated) {
    return <AdminLoginForm />
  }

  return (
    <div className="min-h-screen bg-black">
      <SiteHeader />

      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-thin text-white mb-2">Admin Dashboard</h1>
            <p className="text-white/60 font-light text-sm sm:text-base">Manage all aspects of ATHLELAND</p>
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            className="text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        <div className="space-y-6">
          {/* Category Selection */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setActiveCategory("content")}
              className={`px-6 py-3 rounded-lg font-light transition-all ${
                activeCategory === "content"
                  ? "bg-white text-black"
                  : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              Content Management
            </button>
            <button
              onClick={() => setActiveCategory("operations")}
              className={`px-6 py-3 rounded-lg font-light transition-all ${
                activeCategory === "operations"
                  ? "bg-white text-black"
                  : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              Operations
            </button>
          </div>

          {/* Content Management Tabs */}
          {activeCategory === "content" && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10 h-auto mb-6">
                <TabsTrigger
                  value="templates"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-sm py-3 px-4"
                >
                  Workout Templates
                </TabsTrigger>
                <TabsTrigger
                  value="classes"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-sm py-3 px-4"
                >
                  Schedule Classes
                </TabsTrigger>
                <TabsTrigger
                  value="programs"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-sm py-3 px-4"
                >
                  Programs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="templates">
                <WorkoutTemplates />
              </TabsContent>

              <TabsContent value="classes">
                <ClassManagementFull />
              </TabsContent>

              <TabsContent value="programs">
                <ProgramManagementFull />
              </TabsContent>
            </Tabs>
          )}

          {/* Operations Tabs */}
          {activeCategory === "operations" && (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 h-auto mb-6">
                <TabsTrigger
                  value="coaches"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-sm py-3 px-4"
                >
                  Coaches
                </TabsTrigger>
                <TabsTrigger
                  value="events"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-sm py-3 px-4"
                >
                  Events
                </TabsTrigger>
                <TabsTrigger
                  value="sponsors"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-sm py-3 px-4"
                >
                  Sponsors
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="data-[state=active]:bg-white data-[state=active]:text-black text-sm py-3 px-4"
                >
                  Music Corner
                </TabsTrigger>
              </TabsList>

              <TabsContent value="coaches">
                <CoachManagement />
              </TabsContent>

              <TabsContent value="events">
                <EventManagement />
              </TabsContent>

              <TabsContent value="sponsors">
                <SponsorshipManagement />
              </TabsContent>

              <TabsContent value="settings">
                <AdminSettings />
              </TabsContent>
            </Tabs>
          )}
        </div>
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

export default function AdminDashboard() {
  return (
    <AdminAuthProvider>
      <AdminDashboardContent />
    </AdminAuthProvider>
  )
}
