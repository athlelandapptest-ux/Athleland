"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, Users, Zap } from "lucide-react";

/* ------------ Types ------------ */
type ClassType = {
  id?: string | number;
  display_no_padded?: string;
  display_no?: number;

  title?: string;
  name?: string;

  coach?: string;
  instructor?: string;
  trainer?: string;
  created_by?: string;

  description?: string;

  duration?: number;
  maxParticipants?: number;
  max?: number;

  intensity?: number;
  numericalIntensity?: number;

  date?: string;
  time?: string;
  focus?: string;

  rating?: number;
  ratingsCount?: number;

  difficulty?: string;
};

type Props = {
  cls: ClassType;
  index?: number; // pass from parent map for stable fallback numbering
};
/* -------------------------------- */

export function ModernClassCard({ cls, index = 0 }: Props) {
  // Prefer stamped number from list → fallback to index (1-based)
  const displayNo =
    cls.display_no_padded ??
    String((cls.display_no ?? index + 1)).padStart(3, "0");

  const title = cls.title ?? cls.name ?? "Untitled Class";

  // No mixing of || and ?? — wrap the nullish-coalescing chain, then fallback to ""
  const coach =
    (cls.coach ?? cls.instructor ?? cls.trainer ?? cls.created_by) ?? "";

  const description =
    cls.description ??
    "Build muscle and increase strength with compound movements";

  const minutes = cls.duration ?? 60;
  const max = (cls.maxParticipants ?? cls.max) ?? 20;
  const intensity = (cls.intensity ?? cls.numericalIntensity) ?? 8;

  const date = cls.date ?? "—";
  const time = cls.time ?? "—";
  const focus = cls.focus ?? "General Fitness";

  const rating = Number(cls.rating ?? 0);
  const ratingsCount = Number(cls.ratingsCount ?? 0);

  const difficulty =
    cls.difficulty ??
    (intensity <= 5 ? "Beginner" : intensity <= 10 ? "Intermediate" : "Advanced");

  return (
    <Card className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Counter badge */}
          <span className="rounded-lg bg-zinc-900/80 border border-white/10 px-2 py-1 text-xs text-white/80">
            #{displayNo}
          </span>

          <div>
            <CardTitle className="text-white font-light text-xl">{title}</CardTitle>
            {coach ? <p className="text-white/50 text-sm mt-1">{coach}</p> : null}
          </div>
        </div>

        <Badge className="bg-white/10 text-white border-white/20 font-light">
          {difficulty}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rating */}
        <div className="flex items-center gap-2 text-white/70 text-sm">
          <Star className="h-4 w-4" />
          <span>{rating > 0 ? rating.toFixed(1) : "—"}</span>
          <span className="text-white/40">
            ({ratingsCount || 0} {ratingsCount === 1 ? "rating" : "ratings"})
          </span>
        </div>

        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed">{description}</p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center rounded-xl border border-white/10 bg-white/5 p-4">
            <Clock className="mx-auto h-5 w-5 text-white/70 mb-1" />
            <div className="text-white text-lg font-light">{minutes}</div>
            <div className="text-white/50 text-xs mt-0.5">Minutes</div>
          </div>
          <div className="text-center rounded-xl border border-white/10 bg-white/5 p-4">
            <Users className="mx-auto h-5 w-5 text-white/70 mb-1" />
            <div className="text-white text-lg font-light">{max}</div>
            <div className="text-white/50 text-xs mt-0.5">Max</div>
          </div>
          <div className="text-center rounded-xl border border-white/10 bg-white/5 p-4">
            <Zap className="mx-auto h-5 w-5 text-white/70 mb-1" />
            <div className="text-white text-lg font-light">{intensity}</div>
            <div className="text-white/50 text-xs mt-0.5">Intensity</div>
          </div>
        </div>

        {/* Meta */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-white/60">
            <span className="text-white/40">Date:</span>
            <span>{date}</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span className="text-white/40">Time:</span>
            <span>{time}</span>
          </div>
          <div className="flex justify-between text-white/60">
            <span className="text-white/40">Focus:</span>
            <span>{focus}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {cls.id !== undefined && cls.id !== null ? (
            <Link href={`/classes/${cls.id}`} className="w-full">
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                View Details
              </Button>
            </Link>
          ) : (
            <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
              View Details
            </Button>
          )}
          <Button className="w-full bg-white text-black hover:bg-white/90">
            Enter Training Mode
          </Button>
        </div>

        <Button variant="ghost" className="w-full text-white/70 hover:bg-white/5">
          Share Class
        </Button>
      </CardContent>
    </Card>
  );
}
