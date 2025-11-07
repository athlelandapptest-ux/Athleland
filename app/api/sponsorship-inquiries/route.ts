// app/api/sponsorship-inquiries/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/** Build a server-side Supabase client (service-role preferred, falls back to anon) */
function sbAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!url || !key) {
    throw new Error("Supabase env vars are missing");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

/** GET: list inquiries (admin view). Keep RLS to “no public read” if you want; this uses service key. */
export async function GET() {
  try {
    const sb = sbAdmin();
    const { data, error } = await sb
      .from("sponsorship_inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

/** Helper: send email via Resend REST API (no SDK needed) */
async function sendInquiryEmailViaResend(payload: {
  id: string;
  companyName?: string;
  contactName?: string;
  email: string;
  phone?: string;
  packageInterest?: string;
  message?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM; // e.g., "Athleland <noreply@your-domain>"
  const to = "partnerships@your-domain"; // <- change this to your team inbox

  if (!apiKey || !from) return; // silently skip if email isn't configured

  const subject = `New Sponsorship Inquiry – ${payload.companyName || payload.id}`;
  const html = `
    <h2>New Sponsorship Inquiry</h2>
    <p><b>Company:</b> ${payload.companyName || "-"}</p>
    <p><b>Contact:</b> ${payload.contactName || "-"}</p>
    <p><b>Email:</b> ${payload.email}</p>
    <p><b>Phone:</b> ${payload.phone || "-"}</p>
    <p><b>Package:</b> ${payload.packageInterest || "-"}</p>
    <p><b>Message:</b><br/>${(payload.message || "").replace(/\n/g, "<br/>")}</p>
    <p><b>Inquiry ID:</b> ${payload.id}</p>
  `;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
    }),
  }).catch((err) => {
    // don’t fail the request if email send has issues
    console.warn("[sponsorship-inquiries] email send skipped:", err?.message);
  });
}

/** POST: create inquiry + optional email notification via Resend (REST) */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const id = `inq-${Date.now()}`;

    const sb = sbAdmin();
    const { error } = await sb.from("sponsorship_inquiries").insert([
      {
        id,
        company_name: body.companyName ?? null,
        contact_name: body.contactName ?? null,
        email: body.email,
        phone: body.phone ?? null,
        package_interest: body.packageInterest ?? null,
        message: body.message ?? null,
        status: "pending",
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fire-and-forget email (if configured)
    sendInquiryEmailViaResend({
      id,
      companyName: body.companyName,
      contactName: body.contactName,
      email: body.email,
      phone: body.phone,
      packageInterest: body.packageInterest,
      message: body.message,
    }).catch(() => { /* ignore */ });

    return NextResponse.json({ id, status: "pending" }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
