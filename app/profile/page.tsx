"use client"

import { useEffect, useState } from "react"
import { useAuthContext } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Shield, 
  Building2, 
  Calendar, 
  Phone,
  MapPin,
  Edit,
  Briefcase,
  Award
} from "lucide-react"
import { getApiUrl } from "@/lib/api"
import { apiRequest } from "@/lib/api"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface Employee {
  id: number
  name: string
  email: string
  phone?: string
  date_of_birth?: string
  address?: string
  department?: {
    id: number
    name: string
  }
  position?: string
  manager?: {
    id: number
    name: string
  }
  hire_date?: string
  designation?: string
  department_name?: string
  manager_name?: string
}

export default function ProfilePage() {
  const { user } = useAuthContext()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [nameDraft, setNameDraft] = useState({ first_name: "", last_name: "" })

  useEffect(() => {
    if (user?.employee_id) {
      fetchEmployeeData()
    } else {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    const fullName = (user?.name || "").trim()
    const parts = fullName.split(/\s+/).filter(Boolean)
    const first = parts[0] || ""
    const last = parts.slice(1).join(" ") || ""
    setNameDraft({ first_name: first, last_name: last })
  }, [user?.name])

  const fetchEmployeeData = async () => {
    try {
      const data = await apiRequest<Employee>(
        getApiUrl(`employees/${user?.employee_id}`)
      )
      setEmployee(data)
    } catch (error) {
      console.error("Failed to fetch employee data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const saveProfile = async () => {
    if (!user?.id) return
    if (!nameDraft.first_name.trim()) {
      toast({ title: "Error", description: "First name is required", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      await apiRequest(getApiUrl(`users/${user.id}/update_profile`), {
        method: "PATCH",
        body: JSON.stringify({ user: { first_name: nameDraft.first_name.trim(), last_name: nameDraft.last_name.trim() } }),
      })

      toast({ title: "Saved", description: "Profile updated. Refreshing…" })
      setEditOpen(false)

      // Auth context doesn't expose a setter; simplest is to refresh so updated name is re-hydrated.
      if (typeof window !== "undefined") window.location.reload()
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Failed to update profile", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">View and manage your profile information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <Avatar className="w-32 h-32">
                  <AvatarImage src="/placeholder-user.jpg" alt={user?.name || "User"} />
                  <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-3xl">
                    {getInitials(user?.name || "User")}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-xl">{user?.name || "User"}</CardTitle>
              <CardDescription className="mt-2">
                {employee?.designation || "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">{user?.email}</span>
                </div>
                {employee?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">{employee.phone}</span>
                  </div>
                )}
                {employee?.address && (
                  <div className="flex items-start gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <span className="text-gray-700">{employee.address}</span>
                  </div>
                )}
              </div>
              <Separator className="my-4" />
              <Button className="w-full" variant="outline" onClick={() => setEditOpen(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Roles & Permissions Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Roles & Permissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user?.roles && user.roles.length > 0 ? (
                  user.roles.map((role) => (
                    <Badge key={`${role.id}-${role.name}`} variant="secondary" className="mr-2">
                      {role.display_name || role.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No roles assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Full Name</label>
                  <p className="text-gray-900 mt-1">{user?.name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 mt-1">{user?.email || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900 mt-1">{employee?.phone || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900 mt-1">{formatDate(employee?.date_of_birth)}</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900 mt-1">{employee?.address || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Employment Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  <p className="text-gray-900 mt-1">{employee?.designation || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900 mt-1">
                    {employee?.department_name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hire Date</label>
                  <p className="text-gray-900 mt-1">{formatDate(employee?.hire_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Manager</label>
                  <p className="text-gray-900 mt-1">
                    {employee?.manager_name || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">User ID</label>
                  <p className="text-gray-900 mt-1">#{user?.id || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Status</label>
                  <div className="mt-1">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Updates your account name (UI supports more fields later).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  value={nameDraft.first_name}
                  onChange={(e) => setNameDraft((p) => ({ ...p, first_name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  value={nameDraft.last_name}
                  onChange={(e) => setNameDraft((p) => ({ ...p, last_name: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
              <Button variant="outline" onClick={() => setEditOpen(false)} disabled={saving} className="flex-1 sm:flex-none">
                Cancel
              </Button>
              <Button onClick={saveProfile} disabled={saving} className="flex-1 sm:flex-none">
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

