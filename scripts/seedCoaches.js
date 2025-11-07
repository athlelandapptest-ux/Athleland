const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

// NOTE: if your in-memory file is TS, make a tiny JS copy:
// module.exports = { inMemoryCoaches: [...] }
const { inMemoryCoaches } = require("../lib/coaches.js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const sb = createClient(url, key, { auth: { persistSession: false } });

(async () => {
  try {
    console.log("Seeding coaches…");
    const rows = inMemoryCoaches.map((c) => ({
      name: c.name,
      title: c.title,
      specialties: c.specialties,
      bio: c.bio,
      image: c.image,
      experience: c.experience,
      certifications: c.certifications,
      contact_email: c.contact.email,
      contact_phone: c.contact.phone ?? null,
      is_active: c.isActive,
    }));
    const { data, error } = await sb.from("coaches").insert(rows).select("id,name");
    if (error) throw error;
    console.log(`✅ Seeded ${data?.length ?? 0} coaches.`);
  } catch (e) {
    console.error("❌ Seed failed:", e.message || e);
    process.exit(1);
  }
})();
