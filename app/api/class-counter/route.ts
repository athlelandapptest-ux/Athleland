import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

const BodySchema = z.object({
  action: z.enum(["checkin", "undo"]).optional(),
});

export async function GET() {
  const supabase = getSupabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  let user: User | null = userRes?.user ?? null;

  // ✅ Guest fallback (type-safe)
  if (!user) {
    console.warn("[ClassCounter] No Supabase auth found — using guest ID");
    user = { id: "00000000-0000-0000-0000-000000000001" } as User;
  }

  const userId = user.id;

  const { data, error } = await supabase
    .from("memberships")
    .select("total_sessions, sessions_used")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ✅ Auto-create membership if missing
  if (!data) {
    console.warn("[ClassCounter] Membership not found — creating default row");
    const { data: newData, error: insertErr } = await supabase
      .from("memberships")
      .insert({
        user_id: userId,
        total_sessions: 12,
        sessions_used: 0,
      })
      .select("total_sessions, sessions_used")
      .maybeSingle();

    if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

    const total = Number(newData?.total_sessions ?? 0);
    const used = Number(newData?.sessions_used ?? 0);
    return NextResponse.json({ total, used, remaining: total - used });
  }

  const total = Number(data.total_sessions);
  const used = Number(data.sessions_used);
  return NextResponse.json({ total, used, remaining: Math.max(total - used, 0) });
}

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  let user: User | null = userRes?.user ?? null;

  // ✅ Guest fallback (type-safe)
  if (!user) {
    console.warn("[ClassCounter] No Supabase auth found — using guest ID");
    user = { id: "00000000-0000-0000-0000-000000000001" } as User;
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

  const action = parsed.data.action ?? "checkin";
  const delta = action === "undo" ? -1 : 1;

  const { data: rpcData, error: rpcErr } = await supabase.rpc(
    "class_counter_update",
    { uid: user.id, delta }
  );

  if (rpcErr) return NextResponse.json({ error: rpcErr.message }, { status: 500 });

  const total = Number(rpcData?.[0]?.total ?? 0);
  const used = Number(rpcData?.[0]?.used ?? 0);
  return NextResponse.json({
    total,
    used,
    remaining: Math.max(total - used, 0),
  });
}
