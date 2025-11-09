export const runtime = "nodejs";
export const dynamic = "force-dynamic";   // no ISR
export const revalidate = 0;              // disable revalidate

import "server-only";
import { NextResponse } from "next/server";
import {
  fetchAllClasses,
  fetchAllPrograms,
  getCurrentProgram,
} from "@/app/actions";

// ---- Normalizers ----
function normalizeExercise(ex = {}) {
  const unit = (ex.unit || ex.units || "").toString().toLowerCase();
  const distance = ex.distance ?? (unit.includes("meter") ? 100 : undefined);
  const duration = ex.duration ?? undefined;
  const reps = ex.reps ?? undefined;
  const weight = ex.weight ?? undefined;
  return { ...ex, unit, distance, duration, reps, weight };
}

function normalizeRound(r = {}) {
  const list = Array.isArray(r.exercises) ? r.exercises : (r.items || []);
  return { ...r, exercises: list.map(normalizeExercise) };
}

function normalizeClass(cls = {}) {
  const rounds = Array.isArray(cls.workoutBreakdown)
    ? cls.workoutBreakdown
    : (cls.rounds || []);
  return { ...cls, workoutBreakdown: rounds.map(normalizeRound) };
}

function normalizeProgram(p = {}) {
  return { ...p };
}

// ---- Handler ----
export async function GET() {
  try {
    const [classesRaw, currentProgramRaw, programsRaw] = await Promise.all([
      fetchAllClasses(),     // Supabase: workout_classes (approved)
      getCurrentProgram(),   // Supabase: programs is_active=true
      fetchAllPrograms(),    // Supabase: all programs (admin list)
    ]);

    const classes = (classesRaw || []).map(normalizeClass);
    const programs = (programsRaw || []).map(normalizeProgram);
    const currentProgram = currentProgramRaw ? normalizeProgram(currentProgramRaw) : null;

    const res = NextResponse.json({ ok: true, classes, currentProgram, programs }, { status: 200 });
    // extra belt & suspenders cache busting
    res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.headers.set("Pragma", "no-cache");
    res.headers.set("Expires", "0");
    return res;
  } catch (error) {
    console.error("API /api/data error:", error);
    return NextResponse.json({ ok: false, error: "Failed to load data" }, { status: 500 });
  }
}
