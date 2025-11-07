// lib/supabase-actions.js
import { Pool } from "pg";

let _pool;
function pool() {
  if (_pool) return _pool;
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  _pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  return _pool;
}

// Tagged template helper: sql`select * from x where id=${123}`
export async function sql(strings, ...values) {
  const text = strings.reduce(
    (acc, s, i) => acc + s + (i < values.length ? `$${i + 1}` : ""),
    ""
  );
  const res = await pool().query(text, values);
  return res.rows;
}

// ---------- Generic helpers ----------
export async function query(text, params = []) {
  const res = await pool().query(text, params);
  return res.rows;
}

export async function tableExists(tableName) {
  const rows = await sql`
    SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema='public' AND table_name=${tableName}
    ) AS exists
  `;
  return rows[0]?.exists === true;
}

// ---------- Drop-in replacements that KEEP old Neon function names ----------
// NOTE: Adjust column sets if your schema differs slightly.

// WORKOUT TEMPLATES
export async function fetchAllWorkoutTemplatesNeon() {
  return await sql`SELECT * FROM workout_templates ORDER BY id DESC`;
}

export async function getWorkoutTemplateByIdNeon(id) {
  const rows = await sql`SELECT * FROM workout_templates WHERE id=${id} LIMIT 1`;
  return rows[0] || null;
}

export async function createWorkoutTemplateNeon(payload) {
  const {
    name,
    description,
    difficulty,
    duration_minutes,
    blocks_json, // JSON or text depending on your schema
  } = payload;

  const rows = await sql`
    INSERT INTO workout_templates (name, description, difficulty, duration_minutes, blocks_json)
    VALUES (${name}, ${description}, ${difficulty}, ${duration_minutes}, ${blocks_json})
    RETURNING *
  `;
  return rows[0];
}

export async function updateWorkoutTemplateNeon(id, patch) {
  // Build dynamic update
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k}=$${idx++}`);
    values.push(v);
  }
  values.push(id);
  const text = `UPDATE workout_templates SET ${fields.join(", ")} WHERE id=$${
    values.length
  } RETURNING *`;
  const res = await pool().query(text, values);
  return res.rows[0] || null;
}

export async function deleteWorkoutTemplateNeon(id) {
  const rows = await sql`DELETE FROM workout_templates WHERE id=${id} RETURNING id`;
  return rows[0]?.id ?? null;
}

// CLASSES
export async function fetchAllClassesNeon(limit = 100) {
  return await sql`
    SELECT * FROM workout_classes
    ORDER BY scheduled_at DESC NULLS LAST, id DESC
    LIMIT ${limit}
  `;
}

export async function getClassByIdNeon(id) {
  const rows = await sql`SELECT * FROM workout_classes WHERE id=${id} LIMIT 1`;
  return rows[0] || null;
}

export async function createClassNeon(payload) {
  const {
    title,
    level,
    coach,
    location,
    scheduled_at,
    capacity,
    notes,
    template_id,
  } = payload;

  const rows = await sql`
    INSERT INTO workout_classes
      (title, level, coach, location, scheduled_at, capacity, notes, template_id)
    VALUES
      (${title}, ${level}, ${coach}, ${location}, ${scheduled_at}, ${capacity}, ${notes}, ${template_id})
    RETURNING *
  `;
  return rows[0];
}

export async function updateClassNeon(id, patch) {
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k}=$${idx++}`);
    values.push(v);
  }
  values.push(id);
  const text = `UPDATE workout_classes SET ${fields.join(", ")} WHERE id=$${
    values.length
  } RETURNING *`;
  const res = await pool().query(text, values);
  return res.rows[0] || null;
}

export async function deleteClassByIdNeon(id) {
  const rows = await sql`DELETE FROM workout_classes WHERE id=${id} RETURNING id`;
  return rows[0]?.id ?? null;
}

// PROGRAMS (+ phases) — only if you use them; safe defaults
export async function fetchAllProgramsNeon() {
  return await sql`SELECT * FROM programs ORDER BY id DESC`;
}

export async function createProgramNeon(payload) {
  const { title, description } = payload;
  const rows = await sql`
    INSERT INTO programs (title, description)
    VALUES (${title}, ${description})
    RETURNING *
  `;
  return rows[0];
}

export async function updateProgramNeon(id, patch) {
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k}=$${idx++}`);
    values.push(v);
  }
  values.push(id);
  const text = `UPDATE programs SET ${fields.join(", ")} WHERE id=$${
    values.length
  } RETURNING *`;
  const res = await pool().query(text, values);
  return res.rows[0] || null;
}

// EVENTS / SPONSORSHIP (optional, follow same pattern if you call them)
export async function fetchAllEventsNeon() {
  return await sql`SELECT * FROM events ORDER BY starts_at DESC NULLS LAST, id DESC`;
}
