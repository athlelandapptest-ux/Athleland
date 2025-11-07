import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function fetchClassById(id) {
  const { data, error } = await supabase
    .from("classes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("fetchClassById error:", error.message);
    return null;
  }

  return data;
}
