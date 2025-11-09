"use server";

// SINGLE import set (no duplicates anywhere else in the file)
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";


// ===== Safe hoisted flags (never undefined anywhere in this file) =====
// Use `var` so references later in the file never crash due to TDZ/hoisting.
var USE_NEON_FOR_EVENTS = false;
var USE_NEON_FOR_REGISTRATIONS = false;
var USE_NEON_FOR_SPONSORSHIP = false;
var USE_NEON_FOR_PROGRAMS = false;
var USE_NEON_FOR_TEMPLATES = false;
var USE_NEON_FOR_CLASSES = false;


// helper: Supabase client for server actions
function getSb() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || // preferred for admin writes with RLS
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) throw new Error("supabaseUrl / supabaseKey is required.");
  return createClient(url, key, { auth: { persistSession: false } });
}


/* =========================
   Supabase helpers (server)
   ========================= */
function getSbAnon() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return createClient(url, key, { auth: { persistSession: false } });
}

// Use service-role for server writes if available; otherwise fall back to anon (works if you've relaxed RLS)
function getSbAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase server key(s)");
  return createClient(url, key, { auth: { persistSession: false } });
}

/* ========= SPONSORS ========= */

// maps a sponsor row into a consistent shape
function mapSponsorRow(r) {
  const active = !!r.is_active
  return {
    id: r.id,
    name: r.name,
    logo_url: r.logo_url ?? null,
    website: r.website ?? null,
    tier: r.tier ?? null,
    is_active: active,   // DB field
    isActive: active,    // mirror for UI
    created_at: r.created_at,
  }
}

export async function fetchAllSponsors({ activeOnly = false } = {}) {
  const sb = getSb()
  let q = sb
    .from("sponsors")
    .select("*")
    .order("tier", { ascending: true })
    .order("name", { ascending: true })

  if (activeOnly) q = q.eq("is_active", true)

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data || []).map(mapSponsorRow)
}

export async function createSponsor(payload) {
  const sb = getSbAdmin() // use server key for writes
  const row = {
    id: `sponsor-${Date.now()}`,
    name: payload.name,
    logo_url: payload.logoUrl ?? null,
    website: payload.website ?? null,
    tier: payload.tier ?? "bronze",
    is_active: payload.isActive ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const { error } = await sb.from("sponsors").insert(row)
  if (error) throw new Error(error.message)
  revalidatePath("/admin")
  revalidatePath("/events")
  return { success: true, id: row.id }
}

export async function updateSponsor(id, patch) {
  const sb = getSbAdmin() // ✅ service-role client so RLS won’t block

  const updates = {
    name: patch.name,
    logo_url: patch.logoUrl,
    website: patch.website,
    tier: patch.tier,
    is_active: typeof patch.isActive === "boolean" ? patch.isActive : undefined,
    updated_at: new Date().toISOString(),
  }
  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k])

  const { error } = await sb.from("sponsors").update(updates).eq("id", id)
  if (error) throw new Error(error.message)

  // return fresh row so callers can re-coerce
  const { data: row, error: getErr } = await sb.from("sponsors").select("*").eq("id", id).single()
  if (getErr) throw new Error(getErr.message)

  return { success: true, data: mapSponsorRow(row) }
}

export async function deleteSponsor(id) {
  const sb = getSbAdmin() // server key for deletes too
  const { error } = await sb.from("sponsors").delete().eq("id", id)
  if (error) throw new Error(error.message)
  revalidatePath("/admin")
  revalidatePath("/events")
  return { success: true }
}


/* ========= EVENTS ========= */

export async function fetchAllEvents() {
  const sb = getSb();
  const { data, error } = await sb
    .from("events")
    .select("*")
    .order("date", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}


export async function createEvent(event) {
  try {
    const supabase = getSbAdmin();
    if (!event.title?.trim()) throw new Error("Event title is required");

    const payload = {
      // ✨ no id here – DB will generate it
      title: event.title,
      description: event.description || "",
      full_description: event.fullDescription || "",
      date: event.date || null,
      time: event.time || null,
      duration: event.duration || 0,
      location: event.location || "",
      category: event.category || "workshop",
      max_participants: event.maxParticipants || 0,
      current_participants: event.currentParticipants || 0,
      price: event.price || 0,
      instructor: event.instructor || "",
      difficulty: event.difficulty || "",
      image: event.image || "",
      gallery: event.gallery || [],
      tags: event.tags || [],
      featured: !!event.featured,
      status: event.status || "draft",
      requirements: event.requirements || [],
      what_to_bring: event.whatToBring || [],
      is_sponsored: !!event.isSponsored,
      sponsor_id: event.sponsor?.id || null,
      registration_deadline: event.registrationDeadline || null,
      allow_waitlist: !!event.allowWaitlist,
      member_discount: event.memberDiscount || 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("events")
      .insert([payload])
      .select("*");

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error("Error creating event:", err);
    return { success: false, message: err.message };
  }
}




export async function updateEvent(eventId, patch) {
  const sb = getSb();
  const updates = {
    name: patch.name,
    description: patch.description,
    date: patch.date,
    time: patch.time,
    duration: patch.duration,
    location: patch.location,
    max_participants: patch.maxParticipants,
    price: patch.price,
    member_discount: patch.memberDiscount,
    registration_deadline: patch.registrationDeadline,
    status: patch.status,
    allow_waitlist: patch.allowWaitlist,
    image_url: patch.imageUrl,
    cancellation_policy: patch.cancellationPolicy ?? null,
    instructor: patch.instructor,
    difficulty: patch.difficulty,
    tags: patch.tags,
    featured: typeof patch.featured === "boolean" ? patch.featured : undefined,
    updated_at: new Date().toISOString(),
  };
  Object.keys(updates).forEach((k) => updates[k] === undefined && delete updates[k]);
  const { error } = await sb.from("events").update(updates).eq("id", eventId);
  if (error) throw new Error(error.message);
  revalidatePath("/events");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteEvent(eventId) {
  const sb = getSb();
  const { error } = await sb.from("events").delete().eq("id", eventId);
  if (error) throw new Error(error.message);
  revalidatePath("/events");
  revalidatePath("/admin");
  return { success: true };
}

/** 🔧 NEW: This is what your UI is importing */
export async function toggleEventStatus(eventId, newStatus) {
  const sb = getSb();
  const { error } = await sb.from("events").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", eventId);
  if (error) throw new Error(error.message);
  revalidatePath("/events");
  revalidatePath("/admin");
  return { success: true };
}

/* ==========================
   IMAGE UPLOADS (unchanged)
   ========================== */

// server-side admin client

export async function uploadEventImage(file) {
  try {
    if (!file) throw new Error("No file provided for upload");

    const supabase = getSb(); // your getSb() already defined earlier
    const bucket = "events"; // ✅ bucket name must match exactly
    const fileName = `${Date.now()}-${file.name}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw error;
    }

    // Generate the public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(fileName);

    console.log("✅ Uploaded image URL:", publicUrl);
    return { success: true, url: publicUrl };
  } catch (err) {
    console.error("uploadEventImage failed:", err.message);
    return { success: false, message: err.message };
  }
}
export async function uploadSponsorLogo(file) {
  const sb = getSb();
  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await sb.storage
    .from("events") // or "sponsors" if you have a separate bucket
    .upload(fileName, file);

  if (error) throw error;

  const {
    data: { publicUrl },
  } = sb.storage.from("events").getPublicUrl(fileName);
  return { success: true, url: publicUrl };
}



// ---------- Routines ----------
export async function createWorkoutRoutine(formData) {
  try {
    const title = formData.get("title");
    const description = formData.get("description");
    const roundsData = formData.get("roundsData");
    const hyroxReasoning = formData.get("hyroxReasoning");
    const otherHyroxPrepNotes = formData.get("otherHyroxPrepNotes");

    if (!title || !description || !roundsData) return { success: false, message: "Missing required fields" };

    const rounds = JSON.parse(roundsData);
    const hyroxPrepTypes = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith("hyroxPrepTypes-") && value === "on") hyroxPrepTypes.push(key.replace("hyroxPrepTypes-", ""));
    }

    const key = `routine-${Date.now()}`;
    inMemoryRoutines.push({ key, title, description, rounds, hyroxPrepTypes, hyroxReasoning, otherHyroxPrepNotes });

    revalidatePath("/admin");
    return { success: true, message: "Routine created successfully!" };
  } catch (e) {
    console.error("Error creating routine:", e);
    return { success: false, message: "Failed to create routine" };
  }
}
export async function getAllRoutineKeys() {
  return inMemoryRoutines.map((r) => ({ key: r.key, title: r.title }));
}
export async function getRoutineByKey(key) {
  return inMemoryRoutines.find((r) => r.key === key) || null;
}

/// =======================
// Classes (workout_classes)
// =======================



/* ---------- Small local helpers ---------- */
function ensureArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === "string") {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizeTime(t) {
  // Accept "07:00" or "07:00:00" and always return HH:MM:SS
  if (!t) return null;
  const s = String(t).trim();
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return s;
  if (/^\d{2}:\d{2}$/.test(s)) return `${s}:00`;
  return s; // fallback (DB will reject if invalid)
}

function normalizeDate(d) {
  // Accept Date, ISO date, or "YYYY-MM-DD". Return "YYYY-MM-DD" or null.
  if (!d) return null;
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return null;
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const dd = String(dt.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function safeParse(s) {
  try { return JSON.parse(s); } catch { return s; }
}

/* ---------- Generate Class Preview ---------- */
export async function generateClassPreview(
  templateKeys,
  className,
  date,
  time,
  intensity,
  duration = 60,
  numberOfBlocks = 1,
  maxParticipants = 20,
  instructor = "",
  editingClassId
) {
  try {
    // Figure out next class_number
    const existing = await fetchAllClassesAdmin(/* includeDrafts */ true);
    let nextClassNumber = 1;
    if (existing.length > 0) {
      const nums = existing
        .map((c) => parseInt(c.classNumber) || 0)
        .filter((n) => !isNaN(n));
      nextClassNumber = (nums.length ? Math.max(...nums) : 0) + 1;
      if (editingClassId) {
        const found = existing.find((c) => c.id === editingClassId);
        if (found?.classNumber != null) nextClassNumber = found.classNumber;
      }
    }

    // Load referenced templates
    const templates = [];
    for (const templateId of templateKeys || []) {
      const t = await getWorkoutTemplateById(templateId);
      if (t) templates.push(t);
    }
    if (!templates.length) {
      return { success: false, message: "No valid workout templates found" };
    }

    const primaryTemplate = templates[0];
    const finalClassName = (className || "").trim() || primaryTemplate.title || "Workout Class";
    const classDescription = primaryTemplate.description || "High-intensity workout session";

    // Build workoutBreakdown from template.rounds
    const workoutBreakdown = [];
    try {
      const rounds =
        typeof primaryTemplate.rounds === "string"
          ? JSON.parse(primaryTemplate.rounds)
          : primaryTemplate.rounds;

      if (Array.isArray(rounds)) {
        rounds.forEach((round, idx) => {
          if (Array.isArray(round?.exercises)) {
            workoutBreakdown.push({
              title: round.title || `Round ${idx + 1}`,
              rounds: round.rounds || round.roundsPerBlock || 1,
              exercises: round.exercises.map((ex) => {
                // normalize exercise to common shape
                let unit = "reps";
                let value =
                  ex.reps ?? ex.value ?? ex.duration ?? ex.distance ?? ex.rounds ?? ex.laps ?? 0;

                if (ex.unit) {
                  const u = String(ex.unit).toUpperCase();
                  if (u === "REPS") {
                    unit = "reps";
                    value = Number(ex.reps ?? ex.value ?? 0);
                  } else if (u === "SECONDS") {
                    unit = "seconds";
                    value = Number(ex.duration ?? ex.value ?? 0);
                  } else if (u === "MINUTES") {
                    unit = "seconds";
                    value = Number(ex.duration ?? ex.value ?? 0) * 60;
                  } else if (u === "METERS") {
                    unit = "meters";
                    value = Number(ex.distance ?? ex.value ?? 0);
                  } else if (u === "KM") {
                    unit = "meters";
                    value = Number(ex.distance ?? ex.value ?? 0) * 1000;
                  } else if (u === "ROUNDS") {
                    unit = "rounds";
                    value = Number(ex.rounds ?? ex.value ?? 0);
                  } else if (u === "LAPS") {
                    unit = "laps";
                    value = Number(ex.laps ?? ex.value ?? 0);
                  } else {
                    unit = String(ex.unit).toLowerCase();
                  }
                }

                const out = {
                  name: ex.name,
                  unit,
                  weight: ex.weight ?? "",
                };
                if (unit === "seconds") out.duration = value;
                if (unit === "reps") out.reps = value;
                if (unit === "meters") out.distance = value;
                if (unit === "rounds") out.rounds = value;
                if (unit === "laps") out.laps = value;

                return out;
              }),
            });
          }
        });
      }
    } catch (e) {
      console.error("[generateClassPreview] parse rounds error:", e);
    }

    // Fallback if template didn’t provide
    const finalWB = ensureArray(workoutBreakdown).length ? workoutBreakdown : [
      { title: "Main Workout", exercises: [{ name: "Full Body Circuit", unit: "seconds", duration: Math.max(10, Number(duration) - 10) }] },
    ];

    const classPreview = {
      id: editingClassId || `class-${Date.now()}`,
      classNumber: nextClassNumber,
      numberOfBlocks,
      title: finalClassName,
      name: finalClassName,
      description: classDescription,
      date: normalizeDate(date),
      time: normalizeTime(time),
      duration: Number(duration),
      intensity: Number(intensity),
      numericalIntensity: Number(intensity),
      maxParticipants: Number(maxParticipants),
      instructor,
      routine: {
        title: primaryTemplate.title,
        description: primaryTemplate.description,
        key: primaryTemplate.id,
      },
      workoutBreakdown: finalWB,
      status: editingClassId ? "approved" : "draft",
    };

    return { success: true, data: classPreview };
  } catch (e) {
    console.error("[generateClassPreview] error:", e);
    return { success: false, message: "Failed to generate class preview" };
  }
}

/* ---------- Save (Insert) ---------- */
export async function saveApprovedClass(input) {
  const sb = getSb();

  const row = {
    id: input.id || `class-${Date.now()}`,
    class_number: input.classNumber ?? null,
    number_of_blocks: input.numberOfBlocks ?? 1,

    title: input.title || input.name || "Untitled Class",
    name: input.name || input.title || "Untitled Class",
    description: input.description ?? null,

    date: normalizeDate(input.date),                // YYYY-MM-DD
    time: normalizeTime(input.time),                // HH:MM:SS
    duration: Number(input.duration ?? 60),

    intensity: Number(input.intensity ?? input.numerical_intensity ?? 8),
    numerical_intensity: Number(input.numerical_intensity ?? input.intensity ?? 8),

    max_participants: Number(input.max_participants ?? input.maxParticipants ?? 20),
    instructor: input.instructor ?? null,
    class_focus: input.class_focus ?? input.focus ?? "General Fitness",

    status: input.status || "approved",

    routine: typeof input.routine === "string" ? input.routine : (input.routine ?? null),
    workout_breakdown: ensureArray(input.workout_breakdown ?? input.workoutBreakdown),

    created_at: input.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!Array.isArray(row.workout_breakdown)) row.workout_breakdown = [];

  const { data, error } = await sb
    .from("workout_classes")
    .insert([row])
    .select("*")
    .single();

  if (error) {
    console.error("[saveApprovedClass] Supabase insert error:", error);
    return { success: false, message: error.message };
  }

  // ✅ Revalidate public readers
  revalidatePath("/");
  revalidatePath("/api/data");

  return { success: true, data };
}

/* ---------- Update ---------- */
export async function updateClass(id, input) {
  const sb = getSb();

  const patch = {
    class_number:
      input.classNumber != null ? Number(input.classNumber) : undefined,
    number_of_blocks:
      input.numberOfBlocks != null ? Number(input.numberOfBlocks) : undefined,

    title: input.title ?? undefined,
    name: input.name ?? undefined,
    description: input.description ?? undefined,
    date: input.date != null ? normalizeDate(input.date) : undefined,
    time: input.time != null ? normalizeTime(input.time) : undefined,
    duration: input.duration != null ? Number(input.duration) : undefined,

    intensity:
      input.intensity != null
        ? Number(input.intensity)
        : input.numerical_intensity != null
        ? Number(input.numerical_intensity)
        : undefined,

    numerical_intensity:
      input.numerical_intensity != null
        ? Number(input.numerical_intensity)
        : input.intensity != null
        ? Number(input.intensity)
        : undefined,

    max_participants:
      input.max_participants != null
        ? Number(input.max_participants)
        : input.maxParticipants != null
        ? Number(input.maxParticipants)
        : undefined,

    instructor: input.instructor ?? undefined,
    class_focus: input.class_focus ?? input.focus ?? undefined,
    status: input.status ?? undefined,

    routine:
      input.routine != null
        ? (typeof input.routine === "string" ? input.routine : input.routine)
        : undefined,

    workout_breakdown:
      input.workout_breakdown != null || input.workoutBreakdown != null
        ? ensureArray(input.workout_breakdown ?? input.workoutBreakdown)
        : undefined,

    updated_at: new Date().toISOString(),
  };

  // strip undefined keys so Supabase doesn't overwrite with null
  Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k]);

  if (patch.workout_breakdown && !Array.isArray(patch.workout_breakdown)) {
    patch.workout_breakdown = [];
  }

  const { data, error } = await sb
    .from("workout_classes")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[updateClass] Supabase update error:", error);
    return { success: false, message: error.message };
  }

  // ✅ Revalidate public readers
  revalidatePath("/");
  revalidatePath("/api/data");

  return { success: true, data };
}

/* ---------- Delete ---------- */
export async function deleteClassById(id) {
  try {
    const sb = getSb();
    const { error } = await sb.from("workout_classes").delete().eq("id", id);
    if (error) throw error;

    // ✅ Revalidate public readers
    revalidatePath("/");
    revalidatePath("/api/data");

    return { success: true, message: "Class deleted successfully!" };
  } catch (e) {
    console.error("[deleteClassById] error:", e);
    return { success: false, message: "Failed to delete class" };
  }
}

/* ---------- Fetch All (Admin) ---------- */
export async function fetchAllClassesAdmin(includeDrafts = false) {
  const sb = getSb();

  let q = sb.from("workout_classes").select("*");
  if (!includeDrafts) q = q.eq("status", "approved");

  const { data, error } = await q
    .order("date", { ascending: true })
    .order("time", { ascending: true });

  if (error) {
    console.error("[fetchAllClassesAdmin] error:", error);
    return [];
  }

  return (data || []).map((r) => ({
    id: r.id,
    classNumber: r.class_number ?? null,
    numberOfBlocks: r.number_of_blocks ?? 1,

    title: r.title || r.name,
    name: r.name || r.title,
    description: r.description || "",

    date: r.date,
    time: r.time, // HH:MM:SS
    duration: r.duration ?? 60,

    instructor: r.instructor || "",
    intensity: r.intensity ?? r.numerical_intensity ?? 8,
    numericalIntensity: r.numerical_intensity ?? r.intensity ?? 8,

    maxParticipants: r.max_participants ?? 20,
    status: r.status || "approved",

    routine: typeof r.routine === "string" ? safeParse(r.routine) : r.routine,
    workoutBreakdown: Array.isArray(r.workout_breakdown) ? r.workout_breakdown : ensureArray(r.workout_breakdown),

    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

/* ---------- Get by ID (Public/Admin) ---------- */
export async function getClassById(classId) {
  try {
    const sb = getSb();
    const { data, error } = await sb
      .from("workout_classes")
      .select("*")
      .eq("id", classId)
      .limit(1)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      classNumber: data.class_number,
      numberOfBlocks: data.number_of_blocks,

      title: data.title || data.name,
      name: data.name || data.title,
      description: data.description || "",

      date: data.date,
      time: data.time,
      duration: data.duration,

      instructor: data.instructor || "",
      intensity: data.intensity ?? data.numerical_intensity ?? 8,
      numericalIntensity: data.numerical_intensity ?? data.intensity ?? 8,

      maxParticipants: data.max_participants,
      status: data.status,

      routine: typeof data.routine === "string" ? safeParse(data.routine) : data.routine,
      workoutBreakdown: Array.isArray(data.workout_breakdown) ? data.workout_breakdown : ensureArray(data.workout_breakdown),

      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  } catch (e) {
    console.error("[getClassById] error:", e);
    return null;
  }
}

/* ---------- Fetch All (Public list) ---------- */
export async function fetchAllClasses() {
  try {
    const sb = getSb();
    const { data, error } = await sb
      .from("workout_classes")
      .select("*")
      .eq("status", "approved")
      .order("date", { ascending: true })
      .order("time", { ascending: true });

    if (error) throw error;

    return (data || []).map((r) => ({
      id: r.id,
      classNumber: r.class_number,
      numberOfBlocks: r.number_of_blocks,

      title: r.title || r.name,
      name: r.name || r.title,
      description: r.description || "",

      date: r.date,
      time: r.time,
      duration: r.duration,

      instructor: r.instructor || "",
      intensity: r.intensity ?? r.numerical_intensity ?? 8,
      numericalIntensity: r.numerical_intensity ?? r.intensity ?? 8,

      maxParticipants: r.max_participants,
      status: r.status,

      routine: typeof r.routine === "string" ? safeParse(r.routine) : r.routine,
      workoutBreakdown: Array.isArray(r.workout_breakdown) ? r.workout_breakdown : ensureArray(r.workout_breakdown),

      created_at: r.created_at,
      updated_at: r.updated_at,
    }));
  } catch (e) {
    console.error("[fetchAllClasses] error:", e);
    return [];
  }
}

/* ---------- AI Tone (unchanged logic, slightly hardened) ---------- */
export async function generateClassTone(routineData) {
  try {
    const { title, hyroxPrepTypes = [], rounds = [] } = routineData || {};
    const totalExercises = rounds.reduce((acc, r) => acc + ((r.exercises || []).length), 0);

    const hasCardio = rounds.some((r) =>
      (r.exercises || []).some((ex) => {
        const n = (ex.name || "").toLowerCase();
        return n.includes("run") || n.includes("row") || n.includes("bike");
      })
    );
    const hasStrength = rounds.some((r) =>
      (r.exercises || []).some((ex) => ex.isWeightBased || ex.weight)
    );

    let reasoning = `This ${String(title || "").toLowerCase()} routine is designed to `;
    reasoning += hyroxPrepTypes.includes("Hyrox Preparation")
      ? "prepare athletes for Hyrox competition demands through "
      : "develop comprehensive fitness through ";

    if (hasCardio && hasStrength)
      reasoning += "a balanced blend of cardiovascular conditioning and functional strength. ";
    else if (hasCardio)
      reasoning += "intensive cardiovascular conditioning and metabolic challenges. ";
    else if (hasStrength)
      reasoning += "focused strength development and power-based movements. ";
    else
      reasoning += "functional movement patterns and athletic conditioning. ";

    reasoning += `With ${totalExercises} carefully selected exercises across ${rounds.length} rounds, `;
    if (hyroxPrepTypes.includes("Sprint Conditioning"))
      reasoning += "the session emphasizes high-intensity intervals that mirror race conditions. ";
    else if (hyroxPrepTypes.includes("Strength Endurance"))
      reasoning += "it builds the muscular endurance essential for sustained performance. ";
    else if (hyroxPrepTypes.includes("General Endurance"))
      reasoning += "it develops the aerobic base crucial for long-term success. ";
    reasoning += "The progressive structure ensures adaptation while maintaining safety and effectiveness.";

    await new Promise((r) => setTimeout(r, 100));
    return { success: true, data: reasoning };
  } catch (e) {
    console.error("[generateClassTone] error:", e);
    return { success: false, message: "Failed to generate AI tone" };
  }
}




/// =======================
// Programs (Supabase-backed) - JS version
// =======================



/** Helpers **/
function nowIso() {
  return new Date().toISOString();
}
function safeArray(a) {
  if (!a) return [];
  if (Array.isArray(a)) return a;
  try {
    const p = JSON.parse(a);
    return Array.isArray(p) ? p : [];
  } catch {
    return [];
  }
}
function mapRowToProgram(p) {
  return {
    id: p.id,
    name: p.name,
    subtitle: p.subtitle,
    description: p.description,
    startDate: p.start_date ?? null,
    totalWeeks: p.total_weeks,
    currentWeek: p.current_week,
    status: p.status,
    isActive: !!p.is_active,
    phases: safeArray(p.phases),
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}
function mapProgramToRow(obj) {
  return {
    id: obj.id,
    name: obj.name,
    subtitle: obj.subtitle ?? null,
    description: obj.description ?? null,
    start_date: obj.startDate ?? null,
    total_weeks: Number(obj.totalWeeks),
    current_week: Number(obj.currentWeek ?? 1),
    status: obj.status ?? (obj.isActive ? "active" : "inactive"),
    is_active: !!obj.isActive,
    phases: Array.isArray(obj.phases) ? obj.phases : [],
    updated_at: nowIso(),
    created_at: obj.createdAt ?? nowIso(),
  };
}

/** Phase utilities **/
function recomputePhaseRanges(phases) {
  let cursor = 1;
  return (phases || []).map((ph, i) => {
    const weeks = Number(ph.weeks || 1);
    const startWeek = cursor;
    const endWeek = cursor + weeks - 1;
    cursor = endWeek + 1;
    return {
      id: ph.id ?? `phase-${Date.now()}-${i}`,
      name: ph.name,
      weeks,
      focus: ph.focus,
      order: i + 1,
      startWeek,
      endWeek,
      status: ph.status ?? "upcoming",
    };
  });
}
function applyPhaseStatuses(phases, currentWeek) {
  return (phases || []).map((ph) => {
    let status = "upcoming";
    if (currentWeek > ph.endWeek) status = "completed";
    else if (currentWeek >= ph.startWeek && currentWeek <= ph.endWeek) status = "current";
    return { ...ph, status };
  });
}

/** Read current program (website uses this) **/
export async function getCurrentProgram() {
  const sb = getSb();
  const { data, error } = await sb
    .from("programs")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[getCurrentProgram] error:", error);
    return null;
  }
  if (!data) return null;
  return mapRowToProgram(data);
}

/** Get a program by ID (useful for details) **/
export async function getProgramById(programId) {
  try {
    const sb = getSb();
    const { data, error } = await sb.from("programs").select("*").eq("id", programId).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return mapRowToProgram(data);
  } catch (e) {
    console.error("[getProgramById] error:", e);
    return null;
  }
}

/** List all programs (admin) **/
export async function fetchAllPrograms() {
  const sb = getSb();
  const { data, error } = await sb.from("programs").select("*").order("created_at", { ascending: false });
  if (error) {
    console.error("[fetchAllPrograms] error:", error);
    return [];
  }
  return (data || []).map(mapRowToProgram);
}

/** Create program (admin) **/
export async function createProgram(programData) {
  try {
    const sb = getSbAdmin?.() || getSb();

    // compute phases ranges and totalWeeks
    const rawPhases = Array.isArray(programData.phases) ? programData.phases : [];
    const phasesWithRanges = recomputePhaseRanges(rawPhases);
    const totalWeeks = phasesWithRanges.reduce((acc, p) => acc + Number(p.weeks || 0), 0) || 1;

    // deactivate others
    const deact = await sb
      .from("programs")
      .update({ is_active: false, status: "inactive", updated_at: nowIso() })
      .eq("is_active", true);
    if (deact.error) console.warn("[createProgram] deactivation warning:", deact.error.message);

    const newProgram = {
      id: `program-${Date.now()}`,
      name: programData.name,
      subtitle: programData.subtitle,
      description: programData.description ?? "",
      startDate: programData.startDate ?? null,
      currentWeek: 1,
      totalWeeks,
      isActive: true,
      status: "active",
      phases: applyPhaseStatuses(phasesWithRanges, 1),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };

    const row = mapProgramToRow(newProgram);
    const { data, error } = await sb.from("programs").insert([row]).select("*").single();

    if (error) {
      console.error("[createProgram] insert error:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, data: mapRowToProgram(data), message: "Program created successfully!" };
  } catch (e) {
    console.error("[createProgram] unexpected:", e);
    return { success: false, message: "Failed to create program" };
  }
}

/** Update current week (admin) **/
export async function updateProgramWeek(newWeek) {
  try {
    const sb = getSbAdmin?.() || getSb();
    const current = await getCurrentProgram();
    if (!current) return { success: false, message: "No active program found" };

    if (newWeek < 1 || newWeek > current.totalWeeks) {
      return { success: false, message: "Invalid week number" };
    }

    const phases = applyPhaseStatuses(recomputePhaseRanges(current.phases), newWeek);
    const patch = { current_week: newWeek, phases, updated_at: nowIso() };

    const { error } = await sb.from("programs").update(patch).eq("id", current.id);
    if (error) {
      console.error("[updateProgramWeek] error:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, message: `Program updated to week ${newWeek}` };
  } catch (e) {
    console.error("[updateProgramWeek] unexpected:", e);
    return { success: false, message: "Failed to update program week" };
  }
}

/** Update program details (admin) **/
export async function updateProgramDetails(programId, updates) {
  try {
    const sb = getSbAdmin?.() || getSb();

    // fetch existing
    const { data: existing, error: getErr } = await sb.from("programs").select("*").eq("id", programId).single();
    if (getErr) return { success: false, message: "Program not found" };

    const current = mapRowToProgram(existing);

    // Recompute phases/totalWeeks if phases or totalWeeks change
    let phases = current.phases;
    if (Array.isArray(updates.phases)) {
      phases = applyPhaseStatuses(recomputePhaseRanges(updates.phases), current.currentWeek);
    } else {
      phases = applyPhaseStatuses(recomputePhaseRanges(phases), current.currentWeek);
    }

    let totalWeeks =
      typeof updates.totalWeeks === "number" ? updates.totalWeeks : phases.reduce((acc, p) => acc + Number(p.weeks || 0), 0);

    const patch = {
      name: updates.name ?? current.name,
      subtitle: updates.subtitle ?? current.subtitle,
      description: updates.description ?? current.description,
      start_date: updates.startDate ?? current.startDate ?? null,
      total_weeks: Number(totalWeeks),
      current_week: Number(current.currentWeek), // unchanged
      status: updates.status ?? current.status,
      is_active: typeof updates.isActive === "boolean" ? updates.isActive : current.isActive,
      phases,
      updated_at: nowIso(),
    };

    // If we flip this to active, deactivate others
    if (patch.is_active) {
      await sb.from("programs").update({ is_active: false, status: "inactive", updated_at: nowIso() }).neq("id", programId);
    }

    const { error } = await sb.from("programs").update(patch).eq("id", programId);
    if (error) {
      console.error("[updateProgramDetails] error:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, message: "Program details updated successfully" };
  } catch (e) {
    console.error("[updateProgramDetails] unexpected:", e);
    return { success: false, message: "Failed to update program details" };
  }
}

/** Add phase (admin) **/
export async function addProgramPhase(phaseData) {
  try {
    const sb = getSbAdmin?.() || getSb();
    const current = await getCurrentProgram();
    if (!current) return { success: false, message: "No active program found" };

    const phases = [
      ...current.phases,
      {
        id: `phase-${Date.now()}`,
        name: phaseData.name,
        weeks: Number(phaseData.weeks),
        focus: phaseData.focus,
      },
    ];

    const normalized = recomputePhaseRanges(phases);
    const totalWeeks = normalized.reduce((acc, p) => acc + Number(p.weeks || 0), 0);
    const withStatus = applyPhaseStatuses(normalized, current.currentWeek);

    const patch = {
      phases: withStatus,
      total_weeks: totalWeeks,
      updated_at: nowIso(),
    };

    const { error } = await sb.from("programs").update(patch).eq("id", current.id);
    if (error) {
      console.error("[addProgramPhase] error:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    return { success: true, message: "Phase added successfully" };
  } catch (e) {
    console.error("[addProgramPhase] unexpected:", e);
    return { success: false, message: "Failed to add program phase" };
  }
}

/** Update phase (admin) **/
export async function updateProgramPhase(phaseId, updates) {
  try {
    const sb = getSbAdmin?.() || getSb();
    const current = await getCurrentProgram();
    if (!current) return { success: false, message: "No active program found" };

    const next = current.phases.map((ph) =>
      ph.id === phaseId ? { ...ph, ...updates, weeks: updates.weeks != null ? Number(updates.weeks) : ph.weeks } : ph
    );

    const normalized = recomputePhaseRanges(next);
    const totalWeeks = normalized.reduce((acc, p) => acc + Number(p.weeks || 0), 0);
    const withStatus = applyPhaseStatuses(normalized, current.currentWeek);

    const patch = {
      phases: withStatus,
      total_weeks: totalWeeks,
      updated_at: nowIso(),
    };

    const { error } = await sb.from("programs").update(patch).eq("id", current.id);
    if (error) {
      console.error("[updateProgramPhase] error:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    return { success: true, message: "Phase updated successfully" };
  } catch (e) {
    console.error("[updateProgramPhase] unexpected:", e);
    return { success: false, message: "Failed to update program phase" };
  }
}

/** Delete phase (admin) **/
export async function deleteProgramPhase(phaseId) {
  try {
    const sb = getSbAdmin?.() || getSb();
    const current = await getCurrentProgram();
    if (!current) return { success: false, message: "No active program found" };

    const kept = current.phases.filter((ph) => ph.id !== phaseId);
    const normalized = recomputePhaseRanges(kept);
    const totalWeeks = normalized.reduce((acc, p) => acc + Number(p.weeks || 0), 0);
    const withStatus = applyPhaseStatuses(normalized, current.currentWeek);

    const patch = {
      phases: withStatus,
      total_weeks: totalWeeks,
      updated_at: nowIso(),
    };

    const { error } = await sb.from("programs").update(patch).eq("id", current.id);
    if (error) {
      console.error("[deleteProgramPhase] error:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    return { success: true, message: "Phase deleted successfully" };
  } catch (e) {
    console.error("[deleteProgramPhase] unexpected:", e);
    return { success: false, message: "Failed to delete program phase" };
  }
}

/** Reorder phases (admin) **/
export async function reorderProgramPhases(newPhaseOrderIds) {
  try {
    const sb = getSbAdmin?.() || getSb();
    const current = await getCurrentProgram();
    if (!current) return { success: false, message: "No active program found" };

    // order by incoming id array
    const reordered = newPhaseOrderIds.map((id) => {
      const ph = current.phases.find((p) => p.id === id);
      if (!ph) throw new Error(`Phase with id ${id} not found`);
      return ph;
    });

    const normalized = recomputePhaseRanges(reordered);
    const withStatus = applyPhaseStatuses(normalized, current.currentWeek);

    const patch = {
      phases: withStatus,
      updated_at: nowIso(),
    };

    const { error } = await sb.from("programs").update(patch).eq("id", current.id);
    if (error) {
      console.error("[reorderProgramPhases] error:", error);
      return { success: false, message: error.message };
    }

    revalidatePath("/admin");
    return { success: true, message: "Phases reordered successfully" };
  } catch (e) {
    console.error("[reorderProgramPhases] unexpected:", e);
    return { success: false, message: "Failed to reorder program phases" };
  }
}

/** Set a program as active (deactivate all others) **/
export async function setActiveProgram(programId) {
  const sb = getSbAdmin?.() || getSb();

  try {
    // Deactivate others
    const deact = await sb
      .from("programs")
      .update({ is_active: false, status: "inactive", updated_at: nowIso() })
      .neq("id", programId);
    if (deact.error) throw deact.error;

    // Activate selected
    const { error } = await sb
      .from("programs")
      .update({ is_active: true, status: "active", updated_at: nowIso() })
      .eq("id", programId);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("[setActiveProgram] error:", e);
    return { success: false, message: e.message || "Failed to set active program" };
  }
}

/** Delete a program (hard delete) **/
export async function deleteProgram(programId) {
  const sb = getSbAdmin?.() || getSb();
  try {
    // If you don't have ON DELETE CASCADE for related tables, delete/update dependents here:
    // await sb.from("program_phases").delete().eq("program_id", programId);
    // await sb.from("workout_classes").update({ program_id: null }).eq("program_id", programId); // or delete()

    const { error } = await sb.from("programs").delete().eq("id", programId);
    if (error) throw error;

    revalidatePath("/admin");
    revalidatePath("/");
    revalidatePath("/programs");
    return { success: true };
  } catch (e) {
    console.error("[deleteProgram] error:", e);
    return { success: false, message: e.message || "Failed to delete program" };
  }
}


// ---------- Workout Templates ----------
export async function createWorkoutTemplate(templateData) {
  if (USE_NEON_FOR_TEMPLATES) return await createWorkoutTemplateNeon(templateData);

  try {
    const { inMemoryWorkoutTemplates } = await import("@/lib/workouts");
    const newTemplate = {
      ...templateData,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemoryWorkoutTemplates.push(newTemplate);
    revalidatePath("/admin");
    return { success: true, data: newTemplate, message: "Template created successfully!" };
  } catch (e) {
    console.error("Error creating workout template:", e);
    return { success: false, message: "Failed to create template" };
  }
}

export async function fetchAllWorkoutTemplates() {
  if (USE_NEON_FOR_TEMPLATES) return await fetchAllWorkoutTemplatesNeon();
  const { inMemoryWorkoutTemplates } = await import("@/lib/workouts");
  return [...inMemoryWorkoutTemplates];
}

export async function getWorkoutTemplateById(templateId) {
  if (USE_NEON_FOR_TEMPLATES) {
    try {
      const sql = await sqlClient();
      const rows = await sql`
        SELECT id, title, description, rounds, hyrox_prep_types, hyrox_reasoning, other_hyrox_prep_notes
        FROM workout_templates 
        WHERE id = ${templateId}
      `;
      if (!rows.length) return null;
      const t = rows[0];
      return { ...t, rounds: typeof t.rounds === "string" ? JSON.parse(t.rounds) : t.rounds };
    } catch (e) {
      console.error("Error fetching workout template by ID:", e);
      return null;
    }
  }
  const { inMemoryWorkoutTemplates } = await import("@/lib/workouts");
  return inMemoryWorkoutTemplates.find((t) => t.id === templateId) || null;
}

export async function updateWorkoutTemplate(templateId, updates) {
  if (USE_NEON_FOR_TEMPLATES) {
    const result = await updateWorkoutTemplateNeon(templateId, updates);
    if (result?.success) revalidatePath("/admin");
    return result;
  }

  try {
    const { inMemoryWorkoutTemplates } = await import("@/lib/workouts");
    const idx = inMemoryWorkoutTemplates.findIndex((t) => t.id === templateId);
    if (idx === -1) return { success: false, message: "Template not found" };
    inMemoryWorkoutTemplates[idx] = {
      ...inMemoryWorkoutTemplates[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    revalidatePath("/admin");
    return { success: true, data: inMemoryWorkoutTemplates[idx], message: "Template updated successfully!" };
  } catch (e) {
    console.error("Error updating workout template:", e);
    return { success: false, message: "Failed to update template" };
  }
}

export async function deleteWorkoutTemplate(templateId) {
  if (USE_NEON_FOR_TEMPLATES) {
    const result = await deleteWorkoutTemplateNeon(templateId);
    if (result?.success) revalidatePath("/admin");
    return result;
  }

  try {
    const { inMemoryWorkoutTemplates } = await import("@/lib/workouts");
    const idx = inMemoryWorkoutTemplates.findIndex((t) => t.id === templateId);
    if (idx === -1) return { success: false, message: "Template not found" };
    inMemoryWorkoutTemplates.splice(idx, 1);
    revalidatePath("/admin");
    return { success: true, message: "Template deleted successfully!" };
  } catch (e) {
    console.error("Error deleting workout template:", e);
    return { success: false, message: "Failed to delete template" };
  }
}

// ---------- Sponsorship ----------
export async function submitSponsorshipRequest(formData) {
  if (USE_NEON_FOR_SPONSORSHIP) return await submitSponsorshipRequestNeon(formData);

  try {
    const contactName = formData.get("contactName");
    const email = formData.get("email");
    const company = formData.get("company");
    const phone = formData.get("phone");
    const packageType = formData.get("packageType");
    const industry = formData.get("industry");
    const message = formData.get("message");
    const newsletter = formData.get("newsletter") === "on";

    if (!contactName || !email || !company || !packageType) {
      return { success: false, message: "Missing required fields" };
    }

    const newRequest = {
      id: `sponsor-req-${Date.now()}`,
      contactName,
      email,
      company,
      phone: phone || undefined,
      packageType,
      industry: industry || undefined,
      message: message || undefined,
      newsletter,
      submittedAt: new Date().toISOString(),
      status: "pending",
    };

    const { inMemorySponsorshipRequests } = await import("@/lib/sponsorship");
    inMemorySponsorshipRequests.push(newRequest);
    revalidatePath("/admin");
    return { success: true, data: newRequest, message: "Sponsorship request submitted successfully!" };
  } catch (e) {
    console.error("Error submitting sponsorship request:", e);
    return { success: false, message: "Failed to submit sponsorship request" };
  }
}

export async function getAllSponsorshipRequests() {
  const { inMemorySponsorshipRequests } = await import("@/lib/sponsorship");
  return [...inMemorySponsorshipRequests];
}

export async function updateSponsorshipRequestStatus(requestId, status) {
  try {
    const { inMemorySponsorshipRequests } = await import("@/lib/sponsorship");
    const idx = inMemorySponsorshipRequests.findIndex((r) => r.id === requestId);
    if (idx === -1) return { success: false, message: "Sponsorship request not found" };
    inMemorySponsorshipRequests[idx].status = status;
    revalidatePath("/admin");
    return { success: true, message: "Status updated successfully" };
  } catch (e) {
    console.error("Error updating sponsorship request status:", e);
    return { success: false, message: "Failed to update status" };
  }
}

export async function fetchAllSponsorshipPackages() {
  const { inMemorySponsorshipPackages } = await import("@/lib/sponsorship");
  return [...inMemorySponsorshipPackages];
}

export async function createSponsorshipPackage(packageData) {
  try {
    const { inMemorySponsorshipPackages } = await import("@/lib/sponsorship");
    const newPackage = {
      ...packageData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    inMemorySponsorshipPackages.push(newPackage);
    revalidatePath("/admin");
    revalidatePath("/sponsorship");
    return { success: true, data: newPackage, message: "Package created successfully!" };
  } catch (e) {
    console.error("Error creating sponsorship package:", e);
    return { success: false, message: "Failed to create package" };
  }
}

export async function updateSponsorshipPackage(packageId, updates) {
  try {
    const { inMemorySponsorshipPackages } = await import("@/lib/sponsorship");
    const idx = inMemorySponsorshipPackages.findIndex((p) => p.id === packageId);
    if (idx === -1) return { success: false, message: "Package not found" };

    inMemorySponsorshipPackages[idx] = {
      ...inMemorySponsorshipPackages[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    revalidatePath("/admin");
    revalidatePath("/sponsorship");
    return { success: true, data: inMemorySponsorshipPackages[idx], message: "Package updated successfully!" };
  } catch (e) {
    console.error("Error updating sponsorship package:", e);
    return { success: false, message: "Failed to update package" };
  }
}

export async function deleteSponsorshipPackage(packageId) {
  try {
    const { inMemorySponsorshipPackages } = await import("@/lib/sponsorship");
    const idx = inMemorySponsorshipPackages.findIndex((p) => p.id === packageId);
    if (idx === -1) return { success: false, message: "Package not found" };
    inMemorySponsorshipPackages.splice(idx, 1);
    revalidatePath("/admin");
    revalidatePath("/sponsorship");
    return { success: true, message: "Package deleted successfully!" };
  } catch (e) {
    console.error("Error deleting sponsorship package:", e);
    return { success: false, message: "Failed to delete package" };
  }
}

// ---------- App Settings ----------
let inMemoryAppSettings = {
  playlists: [
    {
      id: "1",
      name: "HIIT Power Mix",
      category: "HIIT",
      url: "https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd",
      isDefault: true,
    },
    {
      id: "2",
      name: "Strength Training",
      category: "Strength",
      url: "https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP",
      isDefault: false,
    },
    {
      id: "3",
      name: "Cardio Blast",
      category: "Cardio",
      url: "https://open.spotify.com/playlist/37i9dQZF1DX3ZAkJuqTfGX",
      isDefault: false,
    },
  ],
};

export async function getAppSettings() {
  await new Promise((r) => setTimeout(r, 200));
  return { ...inMemoryAppSettings };
}

export async function updateAppSettings(settings) {
  try {
    inMemoryAppSettings = { ...settings };
    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true, message: "App settings updated successfully!" };
  } catch (e) {
    console.error("Error updating app settings:", e);
    return { success: false, message: "Failed to update app settings" };
  }
}

/* ========= COACHES ========= */

function mapCoachRow(r) {
  const active = !!r.is_active
  return {
    id: r.id,
    name: r.name,
    title: r.title,
    specialties: r.specialties ?? [],
    bio: r.bio ?? "",
    image: r.image ?? "",
    experience: r.experience ?? "",
    certifications: r.certifications ?? [],
    contact: { email: r.contact_email ?? "", phone: r.contact_phone ?? undefined },
    isActive: active,          // ✅ fixed (was undefined variable)
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export async function fetchAllCoachesAdmin() {
  const sb = getSb()
  const { data, error } = await sb.from("coaches").select("*").order("created_at", { ascending: true })
  if (error) throw new Error(error.message)
  return (data || []).map(mapCoachRow)
}

export async function createCoachAdmin(input) {
  const sb = getSbAdmin() // service-role for writes
  const row = {
    name: input.name,
    title: input.title,
    specialties: input.specialties ?? [],
    bio: input.bio ?? "",
    image: input.image ?? "/images/head-coach.jpg",
    experience: input.experience ?? "",
    certifications: input.certifications ?? [],
    contact_email: input.email,
    contact_phone: input.phone ?? null,
    is_active: !!input.isActive,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await sb.from("coaches").insert(row).select("*").single()
  if (error) throw new Error(error.message)
  return { success: true, data: mapCoachRow(data) }
}

export async function updateCoachAdmin(id, input) {
  const sb = getSbAdmin()
  const patch = {
    name: input.name,
    title: input.title,
    specialties: input.specialties,
    bio: input.bio,
    image: input.image,
    experience: input.experience,
    certifications: input.certifications,
    contact_email: input.email,
    contact_phone: input.phone ?? null,
    is_active: typeof input.isActive === "boolean" ? input.isActive : undefined,
    updated_at: new Date().toISOString(),
  }
  Object.keys(patch).forEach((k) => patch[k] === undefined && delete patch[k])
  const { data, error } = await sb.from("coaches").update(patch).eq("id", id).select("*").single()
  if (error) throw new Error(error.message)
  return { success: true, data: mapCoachRow(data) }
}

export async function deleteCoachAdmin(id) {
  const sb = getSbAdmin()
  const { error } = await sb.from("coaches").delete().eq("id", id)
  if (error) throw new Error(error.message)
  return { success: true }
}
