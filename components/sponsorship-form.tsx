"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export function SponsorshipForm() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    packageInterest: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      if (!formData.companyName || !formData.contactName || !formData.email) {
        setErrorMsg("Please fill the required fields.")
        setIsSubmitting(false)
        return
      }

      const response = await fetch("https://formspree.io/f/xgvppqqg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          ...formData,
          _subject: `New Sponsorship Inquiry – ${formData.companyName}${formData.packageInterest ? ` (${formData.packageInterest})` : ""}`,
          _replyto: formData.email, // lets you reply directly to the sender
        }),
      })

      if (response.ok) {
        setSubmitted(true)
        setFormData({
          companyName: "",
          contactName: "",
          email: "",
          phone: "",
          packageInterest: "",
          message: "",
        })
      } else {
        const data = await response.json().catch(() => ({} as any))
        setErrorMsg(data?.error || "Error submitting form. Please try again.")
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      setErrorMsg("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  if (submitted) {
    return (
      <section className="bg-black py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-gray-900 border border-gray-800 p-12">
            <div className="text-orange-500 text-5xl mb-6">✓</div>
            <h3 className="text-2xl font-thin text-white mb-4 tracking-wide">INQUIRY SUBMITTED</h3>
            <p className="text-white/70 mb-8">
              Thank you for your interest in partnering with ATHLELAND. Our team will contact you within 24 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="border border-gray-600 hover:border-orange-500 text-white px-8 py-3 text-sm font-medium tracking-wide transition-colors"
            >
              SUBMIT ANOTHER INQUIRY
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-black py-20">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-thin tracking-[0.1em] text-white mb-4">START YOUR PARTNERSHIP</h2>
          <div className="w-16 h-px bg-orange-500 mx-auto mb-6" />
          <p className="text-lg text-white/70">
            Ready to connect with Kuwait's fitness community? Let's discuss your partnership goals.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot to reduce spam */}
            <input type="text" name="_honeypot" className="hidden" tabIndex={-1} autoComplete="off" />

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="companyName" className="text-white/80 text-sm tracking-wide">
                  COMPANY NAME *
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className="bg-black border-gray-700 text-white mt-2"
                />
              </div>
              <div>
                <Label htmlFor="contactName" className="text-white/80 text-sm tracking-wide">
                  CONTACT NAME *
                </Label>
                <Input
                  id="contactName"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleChange}
                  required
                  className="bg-black border-gray-700 text-white mt-2"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="email" className="text-white/80 text-sm tracking-wide">
                  EMAIL ADDRESS *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-black border-gray-700 text-white mt-2"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-white/80 text-sm tracking-wide">
                  PHONE NUMBER
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-black border-gray-700 text-white mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="packageInterest" className="text-white/80 text-sm tracking-wide">
                PACKAGE INTEREST
              </Label>
              <select
                id="packageInterest"
                name="packageInterest"
                value={formData.packageInterest}
                onChange={handleChange}
                className="w-full bg-black border border-gray-700 text-white mt-2 px-3 py-2 text-sm"
              >
                <option value="">Select a package</option>
                <option value="Bronze Partner">Bronze Partner</option>
                <option value="Silver Partner">Silver Partner</option>
                <option value="Gold Partner">Gold Partner</option>
                <option value="Custom">Custom Partnership</option>
              </select>
            </div>

            <div>
              <Label htmlFor="message" className="text-white/80 text-sm tracking-wide">
                MESSAGE
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="bg-black border-gray-700 text-white mt-2"
                placeholder="Tell us about your partnership goals and how we can work together..."
              />
            </div>

            {errorMsg && <p className="text-red-400 text-sm">{errorMsg}</p>}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 text-sm font-medium tracking-wide"
            >
              {isSubmitting ? "SUBMITTING..." : "SUBMIT INQUIRY"}
            </Button>
          </form>
        </div>

        <div className="text-center mt-8 text-white/60 text-sm">© 2025 ATHLELAND. All Rights Reserved</div>
      </div>
    </section>
  )
}
