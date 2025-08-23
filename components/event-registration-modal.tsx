"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Clock, MapPin, Users, CreditCard, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { registerForEvent } from "@/app/actions"
import type { Event } from "@/lib/events"

interface EventRegistrationModalProps {
  event: Event | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface RegistrationFormData {
  participantName: string
  participantEmail: string
  participantPhone: string
  fitnessLevel: string
  emergencyContactName: string
  emergencyContactPhone: string
  medicalNotes: string
  agreeToTerms: boolean
  isMember: boolean
}

export function EventRegistrationModal({ event, isOpen, onClose, onSuccess }: EventRegistrationModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const [formData, setFormData] = useState<RegistrationFormData>({
    participantName: "",
    participantEmail: "",
    participantPhone: "",
    fitnessLevel: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    medicalNotes: "",
    agreeToTerms: false,
    isMember: false,
  })

  if (!event) return null

  const handleInputChange = (field: keyof RegistrationFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.participantName &&
          formData.participantEmail &&
          formData.participantPhone &&
          formData.fitnessLevel
        )
      case 2:
        return !!(formData.emergencyContactName && formData.emergencyContactPhone)
      case 3:
        return formData.agreeToTerms
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const calculatePrice = () => {
    const basePrice = event.price
    const memberDiscount = formData.isMember ? event.memberDiscount || 0 : 0
    const discountAmount = basePrice * (memberDiscount / 100)
    return {
      basePrice,
      memberDiscount,
      discountAmount,
      finalPrice: basePrice - discountAmount,
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return

    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      const result = await registerForEvent({
        eventId: event.id,
        participantName: formData.participantName,
        participantEmail: formData.participantEmail,
        participantPhone: formData.participantPhone,
        fitnessLevel: formData.fitnessLevel as any,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        medicalNotes: formData.medicalNotes,
        paymentStatus: "pending",
        status: "pending",
      })

      if (result.success) {
        setSubmitMessage({ type: "success", text: result.message || "Registration successful!" })
        setTimeout(() => {
          onSuccess?.()
          onClose()
          resetForm()
        }, 2000)
      } else {
        setSubmitMessage({ type: "error", text: result.message || "Registration failed" })
      }
    } catch (error) {
      setSubmitMessage({ type: "error", text: "An unexpected error occurred" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setCurrentStep(1)
    setFormData({
      participantName: "",
      participantEmail: "",
      participantPhone: "",
      fitnessLevel: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      medicalNotes: "",
      agreeToTerms: false,
      isMember: false,
    })
    setSubmitMessage(null)
  }

  const handleClose = () => {
    onClose()
    resetForm()
  }

  const pricing = calculatePrice()
  const policy = event.cancellationPolicy || {
    fullRefundHours: 48,
    partialRefundHours: 24,
    partialRefundPercentage: 50,
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display font-thin text-white mb-4">
            Register for {event.title}
          </DialogTitle>
        </DialogHeader>

        {/* Event Summary */}
        <div className="glass-light rounded-xl p-6 border border-white/5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-white/70">
              <Calendar className="h-4 w-4 text-accent" />
              <span>{new Date(event.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Clock className="h-4 w-4 text-accent" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <MapPin className="h-4 w-4 text-accent" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-white/70">
              <Users className="h-4 w-4 text-accent" />
              <span>
                {event.currentParticipants}/{event.maxParticipants} registered
              </span>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step <= currentStep ? "bg-accent text-black" : "bg-white/10 text-white/40"
                }`}
              >
                {step}
              </div>
              {step < 3 && <div className={`w-12 h-px ${step < currentStep ? "bg-accent" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">Personal Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-white/70">
                    Full Name *
                  </Label>
                  <Input
                    id="name"
                    value={formData.participantName}
                    onChange={(e) => handleInputChange("participantName", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-white/70">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.participantEmail}
                    onChange={(e) => handleInputChange("participantEmail", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-white/70">
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    value={formData.participantPhone}
                    onChange={(e) => handleInputChange("participantPhone", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="fitness" className="text-white/70">
                    Fitness Level *
                  </Label>
                  <Select
                    value={formData.fitnessLevel}
                    onValueChange={(value) => handleInputChange("fitnessLevel", value)}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="Select fitness level" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border-white/10">
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="elite">Elite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="member"
                  checked={formData.isMember}
                  onCheckedChange={(checked) => handleInputChange("isMember", !!checked)}
                  className="border-white/20"
                />
                <Label htmlFor="member" className="text-white/70">
                  I am an ATHLELAND member
                  {event.memberDiscount && event.memberDiscount > 0 && (
                    <Badge className="ml-2 bg-accent/20 text-accent">{event.memberDiscount}% discount</Badge>
                  )}
                </Label>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-white mb-4">Safety Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emergencyName" className="text-white/70">
                    Emergency Contact Name *
                  </Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContactName}
                    onChange={(e) => handleInputChange("emergencyContactName", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Emergency contact name"
                  />
                </div>

                <div>
                  <Label htmlFor="emergencyPhone" className="text-white/70">
                    Emergency Contact Phone *
                  </Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyContactPhone}
                    onChange={(e) => handleInputChange("emergencyContactPhone", e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Emergency contact phone"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="medical" className="text-white/70">
                  Medical Notes (Optional)
                </Label>
                <Textarea
                  id="medical"
                  value={formData.medicalNotes}
                  onChange={(e) => handleInputChange("medicalNotes", e.target.value)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Any medical conditions, injuries, or special considerations..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-white mb-4">Review & Payment</h3>

              {/* Pricing Breakdown */}
              <div className="glass-light rounded-xl p-6 border border-white/5">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-5 w-5 text-accent" />
                  <h4 className="font-medium text-white">Pricing</h4>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white/70">
                    <span>Event Price</span>
                    <span>${pricing.basePrice}</span>
                  </div>

                  {formData.isMember && pricing.memberDiscount > 0 && (
                    <div className="flex justify-between text-accent">
                      <span>Member Discount ({pricing.memberDiscount}%)</span>
                      <span>-${pricing.discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <Separator className="bg-white/10" />

                  <div className="flex justify-between text-white font-medium text-base">
                    <span>Total</span>
                    <span>${pricing.finalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="glass-light rounded-xl p-6 border border-white/5">
                <h4 className="font-medium text-white mb-3">Cancellation Policy</h4>
                <div className="space-y-2 text-sm text-white/70">
                  <p>• Full refund: {policy.fullRefundHours}+ hours before event</p>
                  <p>
                    • {policy.partialRefundPercentage}% refund: {policy.partialRefundHours}-{policy.fullRefundHours}{" "}
                    hours before event
                  </p>
                  <p>• No refund: Less than {policy.partialRefundHours} hours before event</p>
                </div>
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", !!checked)}
                  className="border-white/20 mt-1"
                />
                <Label htmlFor="terms" className="text-white/70 text-sm leading-relaxed">
                  I agree to the terms and conditions, understand the cancellation policy, and acknowledge that I
                  participate at my own risk. I confirm that the information provided is accurate and complete.
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Submit Message */}
        {submitMessage && (
          <div
            className={`flex items-center gap-2 p-4 rounded-lg ${
              submitMessage.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {submitMessage.type === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm">{submitMessage.text}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <div>
            {currentStep > 1 && (
              <Button
                onClick={handlePrevious}
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/5"
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleClose}
              variant="outline"
              className="bg-transparent border-white/20 text-white hover:bg-white/5"
            >
              Cancel
            </Button>

            {currentStep < 3 ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(currentStep)}
                className="bg-accent hover:bg-accent/90 text-black font-medium"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(3) || isSubmitting}
                className="bg-accent hover:bg-accent/90 text-black font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Register - $${pricing.finalPrice.toFixed(2)}`
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t border-white/5">
          <p className="text-white/30 text-sm">@2025 ATHLETELAND. All Rights Reserved</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
