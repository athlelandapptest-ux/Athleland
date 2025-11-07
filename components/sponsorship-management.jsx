// @ts-nocheck
"use client"

import React, { useEffect, useState } from "react"
import { Plus, Edit, Trash2, Mail, Phone, Building, Star, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SponsorshipManagement() {
  const [packages, setPackages] = useState([])
  const [inquiries, setInquiries] = useState([])
  const [sponsors, setSponsors] = useState([])
  const [editingPackage, setEditingPackage] = useState(null)
  const [showPackageForm, setShowPackageForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ---- helpers ----
  const coerceActive = (row) => {
    if (!row) return false
    if (typeof row.isActive !== "undefined") return !!row.isActive
    if (typeof row.active !== "undefined") return !!row.active
    if (typeof row.is_active !== "undefined") return !!row.is_active
    if (typeof row.status === "string") return row.status.toLowerCase() === "active"
    return false
  }
  const normalizeSponsor = (s) => ({ ...s, isActive: coerceActive(s) })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    setError("")
    try {
      const [packagesRes, inquiriesRes, sponsorsRes] = await Promise.all([
        fetch("/api/sponsorship-packages"),
        fetch("/api/sponsorship-inquiries"),
        fetch("/api/sponsors"),
      ])

      if (!packagesRes.ok) throw new Error("Failed to load packages")
      if (!inquiriesRes.ok) throw new Error("Failed to load inquiries")
      if (!sponsorsRes.ok) throw new Error("Failed to load sponsors")

      const pkgs = await packagesRes.json()
      const inqs = await inquiriesRes.json()
      const sps = await sponsorsRes.json()

      setPackages(Array.isArray(pkgs) ? pkgs : [])
      setInquiries(Array.isArray(inqs) ? inqs : [])
      setSponsors(Array.isArray(sps) ? sps.map(normalizeSponsor) : [])
    } catch (e) {
      console.error(e)
      setError(e.message || "Failed to load data")
      setPackages((prev) => prev || [])
      setInquiries((prev) => prev || [])
      setSponsors((prev) => prev || [])
    } finally {
      setLoading(false)
    }
  }

  // Toggle sponsor active (optimistic UI + PATCH + rollback + re-sync)
  async function handleToggleSponsor(s, newValue) {
    const nextValue = !!newValue
    setSponsors((prev) => prev.map((x) => (x.id === s.id ? { ...x, isActive: nextValue } : x)))

    try {
      const res = await fetch(`/api/sponsors/${encodeURIComponent(s.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextValue }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "Failed to update sponsor")

      // re-coerce from server reply (covers status-only schemas)
      setSponsors((prev) =>
        prev.map((x) => (x.id === s.id ? { ...x, isActive: coerceActive(json) } : x))
      )
    } catch (e) {
      // rollback
      setSponsors((prev) => prev.map((x) => (x.id === s.id ? { ...x, isActive: !nextValue } : x)))
      alert(e.message || "Could not update sponsor")
    }
  }

  async function handleSavePackage(packageData) {
    try {
      const isEdit = !!editingPackage
      const url = isEdit
        ? `/api/sponsorship-packages/${encodeURIComponent(editingPackage.id)}`
        : "/api/sponsorship-packages"
      const method = isEdit ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(packageData),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "Failed to save package")

      await fetchData()
      setEditingPackage(null)
      setShowPackageForm(false)
    } catch (e) {
      console.error("Error saving package:", e)
      alert(e.message || "Error saving package")
    }
  }

  async function handleDeletePackage(id) {
    if (!confirm("Are you sure you want to delete this package?")) return
    try {
      const res = await fetch(`/api/sponsorship-packages/${encodeURIComponent(id)}`, { method: "DELETE" })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "Failed to delete package")
      await fetchData()
    } catch (e) {
      console.error("Error deleting package:", e)
      alert(e.message || "Error deleting package")
    }
  }

  async function handleToggleField(pkg, field) {
    const newValue = !pkg[field]
    setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, [field]: newValue } : p)))

    try {
      const res = await fetch(`/api/sponsorship-packages/${encodeURIComponent(pkg.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: newValue }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || `Failed to update ${field}`)
    } catch (e) {
      console.error(`Error toggling ${field}:`, e)
      alert(e.message || `Error updating ${field}`)
      setPackages((prev) => prev.map((p) => (p.id === pkg.id ? { ...p, [field]: pkg[field] } : p)))
    }
  }

  async function handleUpdateInquiryStatus(id, status) {
    try {
      const res = await fetch(`/api/sponsorship-inquiries/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "Failed to update inquiry")
      await fetchData()
    } catch (e) {
      console.error("Error updating inquiry status:", e)
      alert(e.message || "Error updating inquiry status")
    }
  }

  function getStatusColor(status) {
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
          {error ? <span className="text-red-400 text-sm">{error}</span> : null}
        </div>
      </div>

      <Tabs defaultValue="sponsors" className="w-full">
        <TabsList className="bg-gray-900/50 border border-gray-800">
          <TabsTrigger value="packages" className="data-[state=active]:bg-orange-500">
            Packages ({packages.length})
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="data-[state=active]:bg-orange-500">
            Inquiries ({inquiries.length})
          </TabsTrigger>
          <TabsTrigger value="sponsors" className="data-[state=active]:bg-orange-500">
            Sponsors ({sponsors.length})
          </TabsTrigger>
        </TabsList>

        {/* Sponsors */}
        <TabsContent value="sponsors" className="space-y-6">
          {sponsors.length === 0 ? (
            <div className="text-center py-12 text-white/60">No sponsors yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsors.map((sponsor) => {
                const active = !!sponsor.isActive // guaranteed boolean
                return (
                  <div key={sponsor.id} className="bg-gray-900/50 border border-gray-800 p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-medium text-white mb-1">
                          {sponsor.name || sponsor.companyName || "Unnamed Sponsor"}
                        </h3>
                        <div className="text-xs text-white/50">
                          {sponsor.created_at
                            ? new Date(sponsor.created_at).toLocaleDateString()
                            : sponsor.createdAt
                            ? new Date(sponsor.createdAt).toLocaleDateString()
                            : ""}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={active}
                          onCheckedChange={(checked) => handleToggleSponsor(sponsor, checked)}
                          aria-label="Activate sponsor"
                        />
                        <Badge
                          className={
                            active
                              ? "bg-green-600/20 text-green-400 border-green-500/30"
                              : "bg-red-600/20 text-red-400 border-red-500/30"
                          }
                        >
                          {active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>

                    {sponsor.website ? (
                      <div className="text-sm text-white/70">Website: {sponsor.website}</div>
                    ) : null}

                    <div className="mt-3 text-sm">
                      <span className="text-white/60">Status: </span>
                      <Badge
                        className={
                          active
                            ? "bg-green-600/20 text-green-400 border-green-500/30"
                            : "bg-red-600/20 text-red-400 border-red-500/30"
                        }
                      >
                        {active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Packages */}
        <TabsContent value="packages" className="space-y-6">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingPackage(null)
                setShowPackageForm(true)
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
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
                    <div className="text-2xl font-thin text-orange-500">
                      {typeof pkg.price === "number" ? `$${pkg.price.toLocaleString()}` : `$${pkg.price}`}
                    </div>
                    <div className="text-sm text-white/60">{pkg.duration}</div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Star className={`w-4 h-4 ${pkg.highlighted ? "text-orange-500" : "text-white/30"}`} />
                      <Switch
                        checked={!!pkg.highlighted}
                        onCheckedChange={() => handleToggleField(pkg, "highlighted")}
                        aria-label="Highlight package"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/60">Available</span>
                      <Switch
                        checked={!!pkg.available}
                        onCheckedChange={() => handleToggleField(pkg, "available")}
                        aria-label="Available package"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {(pkg.features || []).slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-white/70">
                      <Check className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </div>
                  ))}
                  {(pkg.features || []).length > 3 && (
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

        {/* Inquiries */}
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
                        {inquiry.phone ? (
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {inquiry.phone}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <Badge className={getStatusColor(inquiry.status)}>
                      {inquiry.status ? inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1) : ""}
                    </Badge>
                  </div>

                  {inquiry.packageInterest ? (
                    <div className="mb-3">
                      <span className="text-sm text-white/60">Package Interest: </span>
                      <span className="text-sm text-orange-400">{inquiry.packageInterest}</span>
                    </div>
                  ) : null}

                  {inquiry.message ? (
                    <div className="mb-4">
                      <p className="text-sm text-white/70 bg-black/30 p-3 rounded border border-gray-800">
                        {inquiry.message}
                      </p>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-white/50">
                      {inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : ""}
                    </div>
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

      {showPackageForm && (
        <PackageForm
          pkg={editingPackage}
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

/* ---------------- Package Form (JS only) ---------------- */
function PackageForm({ pkg, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: pkg && pkg.name ? pkg.name : "",
    price: pkg && typeof pkg.price === "number" ? pkg.price : Number((pkg && pkg.price) || 0),
    duration: (pkg && pkg.duration) || "per year",
    features: Array.isArray(pkg && pkg.features) ? pkg.features : [""],
    highlighted: !!(pkg && pkg.highlighted),
    available: pkg && pkg.available !== undefined ? !!pkg.available : true,
  })

  function updateFeature(index, value) {
    setFormData((prev) => {
      const next = [...prev.features]
      next[index] = value
      return { ...prev, features: next }
    })
  }

  function addFeature() {
    setFormData((prev) => ({ ...prev, features: [...prev.features, ""] }))
  }

  function removeFeature(index) {
    setFormData((prev) => ({ ...prev, features: prev.features.filter((_, i) => i !== index) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const payload = {
      name: String(formData.name || "").trim(),
      price: Number(formData.price) || 0,
      duration: String(formData.duration || "").trim(),
      features: (formData.features || []).filter((f) => String(f).trim() !== ""),
      highlighted: !!formData.highlighted,
      available: !!formData.available,
    }
    onSave(payload)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-thin tracking-wide text-white mb-6">
          {pkg ? "Edit Package" : "Add New Package"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-white/80 text-sm tracking-wide">PACKAGE NAME</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="bg-black border-gray-700 text-white mt-2"
                required
              />
            </div>
            <div>
              <Label className="text-white/80 text-sm tracking-wide">PRICE</Label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData((p) => ({ ...p, price: Number(e.target.value) }))}
                className="bg-black border-gray-700 text-white mt-2"
                required
              />
            </div>
          </div>

          <div>
            <Label className="text-white/80 text-sm tracking-wide">DURATION</Label>
            <Input
              value={formData.duration}
              onChange={(e) => setFormData((p) => ({ ...p, duration: e.target.value }))}
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
                checked={!!formData.highlighted}
                onCheckedChange={(checked) => setFormData((p) => ({ ...p, highlighted: checked }))}
              />
              <Label className="text-white/80 text-sm">Highlight as popular</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={!!formData.available}
                onCheckedChange={(checked) => setFormData((p) => ({ ...p, available: checked }))}
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