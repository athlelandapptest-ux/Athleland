// lib/supabase/server.js
import { createClient } from "@supabase/supabase-js"

let _serverClient = null

// SERVER-ONLY Supabase client that uses the SERVICE ROLE key (bypasses RLS)
export function getSbServer() {
  if (_serverClient) return _serverClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }

  _serverClient = createClient(url, key, {
    auth: { persistSession: false },
  })

  return _serverClient
}
