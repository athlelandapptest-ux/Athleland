"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SiteHeader } from "@/components/site-header"
import { User, Mail, Lock, Phone, UserPlus, LogIn } from "lucide-react"

export default function ClientAuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: "", password: "" })
  const [signupForm, setSignupForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // TODO: Implement client login logic
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to client dashboard
      window.location.href = "/client-dashboard"
    }, 2000)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (signupForm.password !== signupForm.confirmPassword) {
      alert("Passwords don't match")
      return
    }
    setIsLoading(true)
    // TODO: Implement client signup logic
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to client dashboard
      window.location.href = "/client-dashboard"
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-display text-4xl font-thin text-white mb-4">Client Access</h1>
              <p className="text-white/60 font-light">Access your personal training dashboard and book classes</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
                <TabsTrigger value="login" className="data-[state=active]:bg-accent data-[state=active]:text-black">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:bg-accent data-[state=active]:text-black">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white font-light">Welcome Back</CardTitle>
                    <CardDescription className="text-white/60">Sign in to your ATHLELAND account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white/80">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="your@email.com"
                            value={loginForm.email}
                            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-white/80">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={loginForm.password}
                            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-accent hover:bg-accent/90 text-black font-medium"
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing In..." : "Sign In"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="signup">
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white font-light">Join ATHLELAND</CardTitle>
                    <CardDescription className="text-white/60">
                      Create your account to start your fitness journey
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName" className="text-white/80">
                            First Name
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                            <Input
                              id="firstName"
                              placeholder="John"
                              value={signupForm.firstName}
                              onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                              className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName" className="text-white/80">
                            Last Name
                          </Label>
                          <Input
                            id="lastName"
                            placeholder="Doe"
                            value={signupForm.lastName}
                            onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                            className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signupEmail" className="text-white/80">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                          <Input
                            id="signupEmail"
                            type="email"
                            placeholder="your@email.com"
                            value={signupForm.email}
                            onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white/80">
                          Phone
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                          <Input
                            id="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={signupForm.phone}
                            onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="signupPassword" className="text-white/80">
                          Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                          <Input
                            id="signupPassword"
                            type="password"
                            placeholder="••••••••"
                            value={signupForm.password}
                            onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-white/80">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={signupForm.confirmPassword}
                            onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                            className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        className="w-full bg-accent hover:bg-accent/90 text-black font-medium"
                        disabled={isLoading}
                      >
                        {isLoading ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="text-center mt-6">
              <p className="text-white/40 text-sm">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-black text-center py-6 border-t border-white/5">
        <p className="text-white/30 text-sm font-light">@2025 ATHLETELAND. All Rights Reserved</p>
      </div>
    </div>
  )
}
