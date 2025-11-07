"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, Layers, Trophy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgramCalendar } from "@/components/program-calendar";

export default function ProgramDetailPage() {
  const { id } = useParams();               // program id from URL
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [programs, setPrograms] = useState([]);
  const [program, setProgram] = useState(null);

  // Reuse your unified loader so no new API is required
  const fetchAllData = async () => {
    const res = await fetch("/api/data", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch /api/data");
    return res.json();
  };

  useEffect(() => {
    (async () => {
      try {
        const json = await fetchAllData();
        const allPrograms = json.programs || [];
        setPrograms(allPrograms);

        // IDs can sometimes be numbers/strings — compare loosely
        const found =
          allPrograms.find((p) => String(p.id) === String(id)) ||
          allPrograms.find((p) => String(p.slug) === String(id)); // fallback if you ever use slugs
        setProgram(found || null);
      } catch (e) {
        console.error("[ProgramDetail] load error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const progressPct = useMemo(() => {
    if (!program?.currentWeek || !program?.totalWeeks) return 0;
    return Math.min(100, Math.round((program.currentWeek / program.totalWeeks) * 100));
  }, [program]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-6 lg:px-12 py-20">
          <div className="w-16 h-16 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-center text-white/60">Loading program…</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="container mx-auto px-6 lg:px-12 py-20">
          <Button variant="outline" className="mb-6" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Card className="glass border-white/10">
            <CardContent className="py-10">
              <h1 className="text-2xl font-light mb-2">Program not found</h1>
              <p className="text-white/60">
                We couldn’t find that program.{" "}
                <Link href="/#programs" className="underline">
                  View all programs
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-6 lg:px-12 py-10 lg:py-14">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Button variant="outline" onClick={() => router.back()} className="bg-transparent border-white/20 hover:bg-white/5">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Link href="/#programs">
            <Button className="bg-accent text-black hover:bg-accent/90">
              All Programs
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-white/40 text-sm font-light tracking-wider uppercase mb-4">
            <div className="w-8 h-px bg-accent" />
            Training Program
            <div className="w-8 h-px bg-accent" />
          </div>
          <h1 className="font-display text-4xl lg:text-5xl font-thin mb-4">{program.name}</h1>
          {program.subtitle && (
            <p className="text-white/60 text-lg max-w-2xl mx-auto font-light">{program.subtitle}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Badge className="bg-accent/20 text-accent border-accent/30">Week {program.currentWeek || 1}</Badge>
            <Badge variant="outline" className="border-white/20 text-white/80">
              {program.totalWeeks || program.total_weeks || 0} Weeks
            </Badge>
            {Array.isArray(program.phases) && program.phases.length > 0 && (
              <Badge variant="outline" className="border-white/20 text-white/80">
                {program.phases.length} Phases
              </Badge>
            )}
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <Card className="glass border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 font-light text-base flex items-center gap-2">
                <Trophy className="h-4 w-4 text-accent" />
                Progress
              </CardTitle>
              <CardDescription className="text-white/50">
                {program.currentWeek || 0} / {program.totalWeeks || program.total_weeks || 0} weeks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-accent to-accent/80 h-3 rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-white/60">{progressPct}% complete</p>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 font-light text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-accent" />
                Phases
              </CardTitle>
              <CardDescription className="text-white/50">
                Structured blocks to guide training focus
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Array.isArray(program.phases) && program.phases.length > 0 ? (
                <ul className="space-y-3">
                  {program.phases.map((ph) => (
                    <li key={ph.id ?? ph.name} className="flex items-start justify-between gap-3 rounded-lg border border-white/10 p-3">
                      <div>
                        <p className="text-white/90 font-light">{ph.name}</p>
                        {ph.focus && <p className="text-white/50 text-sm mt-1">{ph.focus}</p>}
                      </div>
                      {ph.status && (
                        <Badge className={ph.status === "current" ? "bg-accent text-black" : "bg-white/10 text-white"}>
                          {ph.status}
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white/50">No phases configured.</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-white/90 font-light text-base flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                Schedule
              </CardTitle>
              <CardDescription className="text-white/50">
                Visualize weeks & training flow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProgramCalendar program={program} />
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {(program.description || program.overview) && (
          <Card className="glass border-white/10 mb-10">
            <CardHeader>
              <CardTitle className="font-light">Overview</CardTitle>
              {program.tagline && (
                <CardDescription className="text-white/60">{program.tagline}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <p className="text-white/70 leading-relaxed">
                {program.description || program.overview}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Weeks outline (optional) */}
        {Array.isArray(program.weeks) && program.weeks.length > 0 && (
          <Card className="glass border-white/10 mb-14">
            <CardHeader>
              <CardTitle className="font-light">Weekly Outline</CardTitle>
              <CardDescription className="text-white/60">
                A quick glance at your {program.weeks.length}-week progression
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {program.weeks.map((wk, idx) => (
                  <div key={wk.id ?? idx} className="rounded-lg border border-white/10 p-4">
                    <p className="text-white/70 text-sm mb-1">Week {wk.number ?? idx + 1}</p>
                    <p className="text-white/90">{wk.title ?? "Training Block"}</p>
                    {wk.focus && <p className="text-white/50 text-sm mt-1">{wk.focus}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-white/60">
            Ready to start <span className="text-white/90">{program.name}</span>?
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-transparent border-white/20 hover:bg-white/5" onClick={() => router.push("/#classes")}>
              View Classes
            </Button>
            <Button className="bg-accent text-black hover:bg-accent/90">
              Join This Program
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
