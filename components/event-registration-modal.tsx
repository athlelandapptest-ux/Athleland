"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type EventLite = {
  id: string | number
  title?: string
  allowWaitlist?: boolean
  maxParticipants?: number | null
  currentParticipants?: number | null
  price?: number | string | null
}

type Props = {
  event: EventLite | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function EventRegistrationModal({ event, isOpen, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    notes: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const disabled = !event || submitting

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!event?.id) return

    setSubmitting(true)
    setError(null)

    try {
      // Hit your API route. Adjust the path if you keep it elsewhere.
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          ...form,
        }),
      })

      const json = await safeJson(res)
      if (!res.ok || json?.ok === false) {
        throw new Error(json?.error || `Registration failed (${res.status})`)
      }

      // success → refresh parent list + close
      onSuccess?.()
      onClose()
      // reset form
      setForm({ fullName: "", email: "", phone: "", notes: "" })
    } catch (err: any) {
      setError(err?.message || "Something went wrong while registering.")
      console.warn("Registration error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-black border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {event?.title ? `Register for ${event.title}` : "Register"}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            Fill in your details to secure your spot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Your full name"
              className="bg-white/5 border-white/10 text-white"
              required
              disabled={disabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="bg-white/5 border-white/10 text-white"
              required
              disabled={disabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+92..."
              className="bg-white/5 border-white/10 text-white"
              required
              disabled={disabled}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Anything we should know?"
              className="bg-white/5 border-white/10 text-white min-h-[90px]"
              disabled={disabled}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="text-white/80" disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent text-black hover:bg-accent/90"
              disabled={disabled}
            >
              {submitting ? "Submitting..." : "Submit Registration"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

/* ----------------------------- helpers ----------------------------- */
async function safeJson(res: Response) {
  try {
    return await res.json()
  } catch {
    return null
  }
}
