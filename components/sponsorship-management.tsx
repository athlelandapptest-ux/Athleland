"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Mail, Phone, Building, Star, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SponsorshipPackage {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
  highlighted: boolean
  available: boolean
}

interface SponsorshipInquiry {
  id: string
  companyName: string
  contactName: string
  email: string
  phone: string
  packageInterest: string
  message: string
  status: "pending" | "contacted" | "approved" | "rejected"
  createdAt: string
}

export function SponsorshipManagement() {
  const [packages, setPackages] = useState<SponsorshipPackage[]>([])
  const [inquiries, setInquiries] = useState<SponsorshipInquiry[]>([])
  const [editingPackage, setEditingPackage] = useState<SponsorshipPackage | null>(null)
  const [showPackageForm, setShowPackageForm] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [packagesRes, inquiriesRes] = await Promise.all([
        fetch("/api/sponsorship-packages"),
        fetch("/api/sponsorship-inquiries"),
      ])

      if (packagesRes.ok) {
        const packagesData = await packagesRes.json()
        setPackages(packagesData)
      }

      if (inquiriesRes.ok) {
        const inquiriesData = await inquiriesRes.json()
        setInquiries(inquiriesData)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      // Set default data
      setPackages([
        {
          id: "1",
          name: "Bronze Partner",
          price: 2500,
          duration: "per year",
          features: ["Logo in reception area", "Social media mentions", "Member newsletter inclusion"],
          highlighted: false,
          available: true,
        },
        {
          id: "2",
          name: "Silver Partner",
          price: 5000,
          duration: "per year",
          features: [
            "Logo in training areas",
            "Event co-branding",
            "Quarterly member events",
            "Website partnership page",
          ],
          highlighted: true,
          available: true,
        },
        {
          id: "3",
          name: "Gold Partner",
          price: 10000,
          duration: "per year",
          features: [
            "Premium logo placement",
            "Exclusive member discounts",
            "Monthly events",
            "Content collaboration",
            "Athlete partnerships",
          ],
          highlighted: false,
          available: true,
        },
      ])
      setInquiries([])
    } finally {
      setLoading(false)
    }
  }

  const handleSavePackage = async (packageData: Omit<SponsorshipPackage, "id">) => {
    try {
      const method = editingPackage ? "PUT" : "POST"
      const url = editingPackage ? `/api/sponsorship-packages/${editingPackage.id}` : "/api/sponsorship-packages"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packageData),
      })

      if (response.ok) {
        await fetchData()
        setEditingPackage(null)
        setShowPackageForm(false)
      }
    } catch (error) {
      console.error("Error saving package:", error)
    }
  }

  const handleDeletePackage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return

    try {
      const response = await fetch(`/api/sponsorship-packages/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error("Error deleting package:", error)
    }
  }

  const handleUpdateInquiryStatus = async (id: string, status: SponsorshipInquiry["status"]) => {
    try {
      const response = await fetch(`/api/sponsorship-inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchData()
      }
    } catch (error) {
      console.error("Error updating inquiry status:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "contacted":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-white/60">Loading sponsorship data...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-thin tracking-[0.1em]">Sponsorship Management</h2>
        <div className="flex gap-3">
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            {inquiries.filter((i) => i.status === "pending").length} Pending
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="packages" className="w-full">
        <TabsList className="bg-gray-900/50 border border-gray-800">
          <TabsTrigger value="packages" className="data-[state=active]:bg-orange-500">
            Packages ({packages.length})
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="data-[state=active]:bg-orange-500">
            Inquiries ({inquiries.length})
          </TabsTrigger>
        </TabsList>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setShowPackageForm(true)} className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Package
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-gray-900/50 border border-gray-800 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white mb-1">{pkg.name}</h3>
                    <div className="text-2xl font-thin text-orange-500">${pkg.price.toLocaleString()}</div>
                    <div className="text-sm text-white/60">{pkg.duration}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pkg.highlighted && <Star className="w-4 h-4 text-orange-500" />}
                    <Switch checked={pkg.available} />
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {pkg.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-white/70">
                      <Check className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                  {pkg.features.length > 3 && (
                    <div className="text-xs text-white/50">+{pkg.features.length - 3} more features</div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingPackage(pkg)
                      setShowPackageForm(true)
                    }}
                    className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                  >
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePackage(pkg.id)}
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Inquiries Tab */}
        <TabsContent value="inquiries" className="space-y-6">
          <div className="space-y-4">
            {inquiries.length === 0 ? (
              <div className="text-center py-12 text-white/60">No sponsorship inquiries yet.</div>
            ) : (
              inquiries.map((inquiry) => (
                <div key={inquiry.id} className="bg-gray-900/50 border border-gray-800 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-1">{inquiry.companyName}</h3>
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          {inquiry.contactName}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {inquiry.email}
                        </div>
                        {inquiry.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {inquiry.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(inquiry.status)}>
                      {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                    </Badge>
                  </div>

                  {inquiry.packageInterest && (
                    <div className="mb-3">
                      <span className="text-sm text-white/60">Package Interest: </span>
                      <span className="text-sm text-orange-400">{inquiry.packageInterest}</span>
                    </div>
                  )}

                  {inquiry.message && (
                    <div className="mb-4">
                      <p className="text-sm text-white/70 bg-black/30 p-3 rounded border border-gray-800">
                        {inquiry.message}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-white/50">{new Date(inquiry.createdAt).toLocaleDateString()}</div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateInquiryStatus(inquiry.id, "contacted")}
                        disabled={inquiry.status !== "pending"}
                        className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                      >
                        Mark Contacted
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateInquiryStatus(inquiry.id, "approved")}
                        disabled={inquiry.status === "approved"}
                        className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateInquiryStatus(inquiry.id, "rejected")}
                        disabled={inquiry.status === "rejected"}
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Package Form Modal */}
      {showPackageForm && (
        <PackageForm
          package={editingPackage}
          onSave={handleSavePackage}
          onCancel={() => {
            setShowPackageForm(false)
            setEditingPackage(null)
          }}
        />
      )}
    </div>
  )
}

// Package Form Component
function PackageForm({
  package: pkg,
  onSave,
  onCancel,
}: {
  package: SponsorshipPackage | null
  onSave: (data: Omit<SponsorshipPackage, "id">) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: pkg?.name || "",
    price: pkg?.price || 0,
    duration: pkg?.duration || "per year",
    features: pkg?.features || [""],
    highlighted: pkg?.highlighted || false,
    available: pkg?.available || true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      features: formData.features.filter((f) => f.trim() !== ""),
    })
  }

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ""],
    }))
  }

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const updateFeature = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((f, i) => (i === index ? value : f)),
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-thin tracking-wide text-white mb-6">{pkg ? "Edit Package" : "Add New Package"}</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-white/80 text-sm tracking-wide">PACKAGE NAME</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="bg-black border-gray-700 text-white mt-2"
                required
              />
            </div>
            <div>
              <Label className="text-white/80 text-sm tracking-wide">PRICE</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))}
                className="bg-black border-gray-700 text-white mt-2"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-white/80 text-sm tracking-wide">DURATION</Label>
            <Input
              value={formData.duration}
              onChange={(e) => setFormData((prev) => ({ ...prev, duration: e.target.value }))}
              className="bg-black border-gray-700 text-white mt-2"
              placeholder="e.g., per year, per month"
              required
            />
          </div>

          <div>
            <Label className="text-white/80 text-sm tracking-wide mb-3 block">FEATURES</Label>
            <div className="space-y-3">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="bg-black border-gray-700 text-white"
                    placeholder="Enter feature"
                  />
                  <Button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                onClick={addFeature}
                className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.highlighted}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, highlighted: checked }))}
              />
              <Label className="text-white/80 text-sm">Highlight as popular</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.available}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, available: checked }))}
              />
              <Label className="text-white/80 text-sm">Available for purchase</Label>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white flex-1">
              {pkg ? "Update Package" : "Create Package"}
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              className="border border-gray-700 text-white hover:bg-gray-800 flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
