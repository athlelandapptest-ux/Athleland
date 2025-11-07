export const runtime = "nodejs";
import "server-only";
import { NextResponse } from "next/server";
import {
  fetchAllClasses,
  fetchAllPrograms,
  getCurrentProgram,
} from "@/app/actions";

export async function GET() {
  try {
    const [classes, currentProgram, programs] = await Promise.all([
      fetchAllClasses(),
      getCurrentProgram(),
      fetchAllPrograms(),
    ]);
    return NextResponse.json({ ok: true, classes, currentProgram, programs });
  } catch (error) {
    console.error("API /api/data error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to load data" },
      { status: 500 }
    );
  }
}

// Central place to normalize workouts/classes/programs

export function normalizeExercise(ex) {
  const unit = (ex.unit || ex.units || "").toString().toLowerCase();
  const distance = ex.distance ?? (unit.includes("meter") ? 100 : undefined);
  const duration = ex.duration ?? undefined;
  const reps = ex.reps ?? undefined;
  const weight = ex.weight ?? undefined;
  return { ...ex, unit, distance, duration, reps, weight };
}

export function normalizeRound(r) {
  return {
    ...r,
    exercises: (r.exercises || r.items || []).map(normalizeExercise),
  };
}

export function normalizeClass(cls) {
  return {
    ...cls,
    workoutBreakdown: (cls.workoutBreakdown || cls.rounds || []).map(normalizeRound),
  };
}

export function normalizeProgram(p) {
  return { ...p };
}
