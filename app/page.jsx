"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Target, Heart, TrendingUp, ArrowRight } from "lucide-react";
import { photos } from "@/lib/photos";
import { SiteHeader } from "@/components/site-header";
import { ModernClassCard } from "@/components/modern-class-card";
import { FeatureHighlights } from "@/components/feature-highlights";
import { PartnerBrands } from "@/components/partner-brands";
import { Testimonials } from "@/components/testimonials";
import { CallToAction } from "@/components/call-to-action";
import { Footer } from "@/components/footer";
import { HeroSection } from "@/components/hero-section";
import { ProgramCalendar } from "@/components/program-calendar";
import { VisitorWorkoutBreakdown } from "@/components/visitor-workout-breakdown";
import ClassCounter from "@/components/ClassCounter";
import { normalizeWorkoutBreakdown } from "@/lib/normalize";

/* ---------- Helpers: numbering + timezone-correct today (pure JS) ---------- */
function pad3(n) {
  return String(n).padStart(3, "0");
}

function sortAndNumber(list) {
  const copy = [...(list || [])];
  copy.sort((a, b) => {
    const da = a && a.date ? a.date : "";
    const db = b && b.date ? b.date : "";
    if (da < db) return -1;
    if (da > db) return 1;

    const ta = a && a.time ? a.time : "";
    const tb = b && b.time ? b.time : "";
    if (ta < tb) return -1;
    if (ta > tb) return 1;

    const ia = a && a.id != null ? Number(a.id) : 0;
    const ib = b && b.id != null ? Number(b.id) : 0;
    return ia - ib;
  });

  return copy.map((c, i) => ({
    ...c,
    display_no: i + 1,
    display_no_padded: pad3(i + 1),
  }));
}

function todayYMD(timeZone = "Asia/Karachi") {
  // outputs YYYY-MM-DD in given TZ
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}
/* ------------------------------------------------------------------------- */

export default function HomePage() {
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [currentProgram, setCurrentProgram] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [todaysWorkout, setTodaysWorkout] = useState(null);

  async function fetchAllData() {
    const res = await fetch("/api/data", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch /api/data");
    return res.json();
  }

  async function refreshClasses() {
    try {
      console.log("[HomePage] refreshClasses...");
      const json = await fetchAllData();

      const classesDataRaw = json.classes || [];
      const normalized = classesDataRaw.map((c) => ({
        ...c,
        workoutBreakdown: normalizeWorkoutBreakdown(c.workoutBreakdown),
      }));

      const numbered = sortAndNumber(normalized);
      setClasses(numbered);

      const today = todayYMD();
      const todayClass = numbered.find((cls) => cls.date === today);
      setTodaysWorkout(todayClass || null);
    } catch (error) {
      console.error("Error refreshing classes:", error);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        console.log("[HomePage] initial data load...");
        const json = await fetchAllData();

        const classesDataRaw = json.classes || [];
        const normalized = classesDataRaw.map((c) => ({
          ...c,
          workoutBreakdown: normalizeWorkoutBreakdown(c.workoutBreakdown),
        }));

        const programData = json.currentProgram || null;
        const allProgramsData = json.programs || [];

        const numbered = sortAndNumber(normalized);
        if (!mounted) return;

        setClasses(numbered);
        setCurrentProgram(programData);
        setPrograms(allProgramsData);

        const today = todayYMD();
        const todayClass = numbered.find((cls) => cls.date === today);
        setTodaysWorkout(todayClass || null);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();

    function handleAdminUpdate(event) {
      console.log("[HomePage] Admin update received:", event.detail);
      if (event.detail && event.detail.type === "class") {
        refreshClasses();
      }
    }

    window.addEventListener("adminDataUpdated", handleAdminUpdate);
    const interval = setInterval(refreshClasses, 10000);

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener("adminDataUpdated", handleAdminUpdate);
    };
  }, []);

  // Keep global numbering (no renumbering after filter).
  const filteredClasses = classes.filter((cls) => {
    if (selectedFilter === "all") return true;
    const intensity = cls.intensity ?? cls.numericalIntensity ?? 5;
    if (selectedFilter === "beginner") return intensity <= 5;
    if (selectedFilter === "intermediate") return intensity > 5 && intensity <= 10;
    if (selectedFilter === "advanced") return intensity > 10;
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white">
      <SiteHeader />

      {/* Hero Section */}
      <HeroSection />

      {/* Membership / Class Counter */}
      <section className="py-12 bg-black border-t border-white/5">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mx-auto">
            <ClassCounter />
          </div>
        </div>
      </section>

      {/* Current Program Section */}
      {currentProgram && (
        <section className="py-20 bg-black/50 border-t border-white/5">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 text-white/40 text-sm font-light tracking-wider uppercase mb-6">
                <div className="w-8 h-px bg-accent"></div>
                Current Program
                <div className="w-8 h-px bg-accent"></div>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-thin text-white mb-6">Training Program</h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
                Follow our structured program designed to maximize your fitness potential
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Program Details */}
              <Card className="glass border-white/10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                      <CardTitle className="font-display text-2xl font-thin text-white mb-3">
                        {currentProgram.name}
                      </CardTitle>
                      <CardDescription className="text-white/60 text-lg font-light">
                        {currentProgram.subtitle}
                      </CardDescription>
                    </div>
                    <Badge className="bg-accent/20 text-accent border-accent/30 text-sm px-4 py-2 w-fit font-light">
                      Week {currentProgram.currentWeek} of {currentProgram.totalWeeks}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="text-center glass-light rounded-xl p-6 border border-white/5">
                      <div className="font-display text-3xl font-thin text-accent mb-2">
                        {currentProgram.currentWeek}
                      </div>
                      <p className="text-white/60 font-light text-sm">Current Week</p>
                    </div>
                    <div className="text-center glass-light rounded-xl p-6 border border-white/5">
                      <div className="font-display text-3xl font-thin text-white mb-2">
                        {currentProgram.totalWeeks}
                      </div>
                      <p className="text-white/60 font-light text-sm">Total Weeks</p>
                    </div>
                    <div className="text-center glass-light rounded-xl p-6 border border-white/5">
                      <div className="font-display text-3xl font-thin text-accent mb-2">
                        {Math.round((currentProgram.currentWeek / currentProgram.totalWeeks) * 100)}%
                      </div>
                      <p className="text-white/60 font-light text-sm">Complete</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/10 rounded-full h-3 mb-8">
                    <div
                      className="bg-gradient-to-r from-accent to-accent/80 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(currentProgram.currentWeek / currentProgram.totalWeeks) * 100}%` }}
                    ></div>
                  </div>

                  {/* Current Phase */}
                  {currentProgram.phases && (
                    <div className="glass-light rounded-xl p-6 border border-white/5">
                      <h4 className="text-white font-light mb-4 text-lg">Current Phase</h4>
                      {currentProgram.phases
                        .filter((phase) => phase.status === "current")
                        .map((phase) => (
                          <div key={phase.id}>
                            <p className="text-accent font-light text-lg">{phase.name}</p>
                            <p className="text-white/60 text-sm font-light mt-2">{phase.focus}</p>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* View Current Program */}
                  {currentProgram?.id && (
                    <div className="mt-6">
                      <Link href={`/programs/${currentProgram.id}`}>
                        <Button className="bg-accent hover:bg-accent/90 text-black font-medium px-6 py-3 group">
                          View Current Program
                          <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Program Calendar */}
              <div className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <ProgramCalendar program={currentProgram} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Today's Workout Section */}
      {todaysWorkout ? (
        <section className="py-20 bg-black border-t border-white/5">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center mb-16 animate-fade-in">
              <div className="inline-flex items-center gap-2 text-white/40 text-sm font-light tracking-wider uppercase mb-6">
                <div className="w-8 h-px bg-accent"></div>
                {"Today's Workout"}
                <div className="w-8 h-px bg-accent"></div>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-thin text-white mb-6">
                {todaysWorkout.title || todaysWorkout.name || "Today's Workout"}
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">{todaysWorkout.description}</p>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <VisitorWorkoutBreakdown
                date={todaysWorkout.date}
                time={todaysWorkout.time}
                focus={todaysWorkout.focus || "Functional Fitness"}
                rounds={todaysWorkout.workoutBreakdown || []}
              />
            </div>

            <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <Button className="bg-accent hover:bg-accent/90 text-black font-medium px-8 py-3 group mr-4">
                Join Today's Class
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                variant="outline"
                className="bg-transparent text-white border-white/20 hover:bg-white/5 px-8 py-3"
              >
                Client Login
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <section className="py-20 bg-black border-t border-white/5">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="text-center animate-fade-in">
              <div className="inline-flex items-center gap-2 text-white/40 text-sm font-light tracking-wider uppercase mb-6">
                <div className="w-8 h-px bg-accent"></div>
                No Workout Today
                <div className="w-8 h-px bg-accent"></div>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-thin text-white mb-6">Rest Day</h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto font-light mb-8">
                No classes scheduled for today. Check out our upcoming classes to plan your next workout.
              </p>
              <Button
                onClick={() => document.getElementById("classes")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-accent hover:bg-accent/90 text-black font-medium px-8 py-3 group"
              >
                View Upcoming Classes
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* All Programs Section */}
      <section className="py-20 bg-black/50 border-t border-white/5" id="programs">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 text-white/40 text-sm font-light tracking-wider uppercase mb-6">
              <div className="w-8 h-px bg-accent"></div>
              Training Programs
              <div className="w-8 h-px bg-accent"></div>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-thin text-white mb-6">Available Programs</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
              Choose from our comprehensive training programs
            </p>
          </div>

          {loading ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-16 h-16 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white/60 font-light">Loading programs...</p>
            </div>
          ) : programs.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <p className="text-white/60 text-lg font-light">No training programs available.</p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              {programs.map((program, index) => (
                <Card
                  key={program.id}
                  className="glass border-white/10 animate-fade-in"
                  style={{ animationDelay: `${0.1 * index}s` }}
                >
                  <CardHeader>
                    <CardTitle className="font-display text-2xl font-thin text-white mb-3">
                      {program.name}
                    </CardTitle>
                    <CardDescription className="text-white/60 text-lg font-light">
                      {program.subtitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/70 text-sm font-light mb-6">{program.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center glass-light rounded-xl p-4 border border-white/5">
                        <div className="font-display text-2xl font-thin text-accent mb-1">
                          {program.totalWeeks || program.total_weeks}
                        </div>
                        <p className="text-white/60 font-light text-sm">Weeks</p>
                      </div>
                      <div className="text-center glass-light rounded-xl p-4 border border-white/5">
                        <div className="font-display text-2xl font-thin text-white mb-1">
                          {program.phases?.length || 0}
                        </div>
                        <p className="text-white/60 font-light text-sm">Phases</p>
                      </div>
                    </div>

                    {program?.id && (
                      <Link href={`/programs/${program.id}`}>
                        <Button className="w-full bg-accent hover:bg-accent/90 text-black font-medium px-6 py-3 group">
                          View Program
                          <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Classes Section */}
      <section className="py-20 bg-black border-t border-white/5" id="classes">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 text-white/40 text-sm font-light tracking-wider uppercase mb-6">
              <div className="w-8 h-px bg-accent"></div>
              Training Classes
              <div className="w-8 h-px bg-accent"></div>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-thin text-white mb-6">Upcoming Classes</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
              Join our next training sessions and push your limits
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-16 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {[
              { key: "all", label: "All Classes", icon: Target },
              { key: "beginner", label: "Beginner", icon: Heart },
              { key: "intermediate", label: "Intermediate", icon: TrendingUp },
              { key: "advanced", label: "Advanced", icon: Zap },
            ].map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.key}
                  onClick={() => setSelectedFilter(filter.key)}
                  variant={selectedFilter === filter.key ? "default" : "outline"}
                  className={`${
                    selectedFilter === filter.key
                      ? "bg-accent hover:bg-accent/90 text-black font-medium"
                      : "bg-transparent text-white/70 border-white/20 hover:bg-white/5 hover:text-white font-light"
                  } transition-all duration-300 px-6 py-3`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {filter.label}
                </Button>
              );
            })}
            <Button
              onClick={refreshClasses}
              variant="outline"
              className="bg-transparent text-white/70 border-white/20 hover:bg-white/5 hover:text-white font-light transition-all duration-300 px-6 py-3"
            >
              Refresh Classes
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-20 animate-fade-in">
              <div className="w-16 h-16 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white/60 font-light">Loading classes...</p>
            </div>
          ) : filteredClasses.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <p className="text-white/60 text-lg font-light">No classes found for the selected filter.</p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              {filteredClasses.map((cls, index) => (
                <div key={cls.id} className="animate-fade-in" style={{ animationDelay: `${0.1 * index}s` }}>
                  {/* To show the number above the card, uncomment:
                  <div className="mb-2">
                    <span className="rounded bg-zinc-900/80 border border-white/10 px-2 py-1 text-xs text-white/80">
                      #{cls.display_no_padded ?? pad3(cls.display_no ?? index + 1)}
                    </span>
                  </div> */}
                  <ModernClassCard cls={cls} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-20 bg-black/50 border-t border-white/5" id="photos">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 text-white/40 text-sm font-light tracking-wider uppercase mb-6">
              <div className="w-8 h-px bg-accent"></div>
              Training Gallery
              <div className="w-8 h-px bg-accent"></div>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-thin text-white mb-6">Experience Excellence</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">
              Experience the intensity and community of ATHLELAND
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            {photos.slice(0, 8).map((photo, index) => (
              <div
                key={index}
                className="relative aspect-square overflow-hidden rounded-2xl group cursor-pointer glass border border-white/5 hover:border-white/20 transition-all duration-500 animate-fade-in"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <Image
                  src={photo.src || "/placeholder.svg"}
                  alt={photo.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <p className="text-white text-sm font-light text-center px-4">{photo.alt}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <Button className="bg-accent hover:bg-accent/90 text-black font-medium px-8 py-3 group">
              View Full Gallery
              <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <FeatureHighlights />

      {/* Partner Brands */}
      <PartnerBrands />

      {/* Testimonials */}
      <Testimonials />

      {/* Call to Action */}
      <CallToAction />

      {/* Footer */}
      <Footer />

      {/* Footer Copyright */}
      <div className="bg-black text-center py-6 border-t border-white/5">
        <p className="text-white/30 text-sm font-light">@2025 ATHLETELAND. All Rights Reserved</p>
      </div>
    </div>
  );
}
