// app/api/sponsorship-inquiry/route.ts
import { NextResponse } from "next/server"
import nodemailer from "nodemailer"

export const runtime = "nodejs"

function mustEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      companyName,
      contactName,
      email,
      phone = "",
      packageInterest = "",
      message = "",
      _honeypot = "",
    } = body || {}

    if (_honeypot) return NextResponse.json({ ok: true }) // bot

    if (!companyName || !contactName || !email) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 })
    }

    const GMAIL_USER = mustEnv("GMAIL_USER")
    const GMAIL_PASS = mustEnv("GMAIL_PASS")
    const EMAIL_FROM = mustEnv("EMAIL_FROM") // MUST be same address as GMAIL_USER
    const EMAIL_TO = mustEnv("EMAIL_TO")

    // Guard: From must match the Gmail account we authenticate
    if (!EMAIL_FROM.includes(GMAIL_USER)) {
      throw new Error(`EMAIL_FROM must use the same address as GMAIL_USER (${GMAIL_USER}). Current: ${EMAIL_FROM}`)
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    })

    // Verify SMTP connection
    await transporter.verify()

    const subject = `New Sponsorship Inquiry – ${companyName}${packageInterest ? ` (${packageInterest})` : ""}`

    // 1) Send to admin(s)
    const info1 = await transporter.sendMail({
      from: EMAIL_FROM,
      to: EMAIL_TO, // comma-separated allowed
      replyTo: email,
      subject,
      text: [
        `Company: ${companyName}`,
        `Contact: ${contactName}`,
        `Email: ${email}`,
        `Phone: ${phone || "—"}`,
        `Package: ${packageInterest || "—"}`,
        "",
        `Message:`,
        `${message || "—"}`,
      ].join("\n"),
      html: `
        <h2>New Sponsorship Inquiry</h2>
        <p><strong>Company:</strong> ${escapeHTML(companyName)}</p>
        <p><strong>Contact:</strong> ${escapeHTML(contactName)}</p>
        <p><strong>Email:</strong> ${escapeHTML(email)}</p>
        <p><strong>Phone:</strong> ${escapeHTML(phone)}</p>
        <p><strong>Package:</strong> ${escapeHTML(packageInterest || "—")}</p>
        <p><strong>Message:</strong></p>
        <pre style="white-space:pre-wrap">${escapeHTML(message || "—")}</pre>
      `,
    })

    // 2) Auto-ack to sender
    const info2 = await transporter.sendMail({
      from: EMAIL_FROM,
      to: email,
      subject: "We received your inquiry – ATHLELAND",
      text: `Hi ${contactName}, we’ve received your inquiry and will get back to you within 24 hours. – ATHLELAND`,
      html: `
        <p>Hi ${escapeHTML(contactName)},</p>
        <p>Thanks for reaching out to <b>ATHLELAND</b>. We’ve received your sponsorship inquiry and will get back to you within 24 hours.</p>
        <p>— ATHLELAND Partnerships Team</p>
      `,
    })

    // Helpful logs for diagnostics
    console.log("ADMIN MAIL:", {
      messageId: info1.messageId,
      accepted: info1.accepted,
      rejected: info1.rejected,
      response: info1.response,
      envelope: info1.envelope,
    })
    console.log("ACK MAIL:", {
      messageId: info2.messageId,
      accepted: info2.accepted,
      rejected: info2.rejected,
      response: info2.response,
      envelope: info2.envelope,
    })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Gmail SMTP error:", err?.message || err)
    return NextResponse.json({ error: "Failed to send email. Check server logs." }, { status: 500 })
  }
}

function escapeHTML(s: string) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}
