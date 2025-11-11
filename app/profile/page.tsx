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
}

export default function ProfilePage() {
  const { user } = useAuthContext()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.employee?.id) {
      fetchEmployeeData()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchEmployeeData = async () => {
    try {
      const data = await apiRequest<Employee>(
        getApiUrl(`employees/${user?.employee?.id}`)
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">View and manage your profile information</p>
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
                {employee?.position || "Employee"}
              </CardDescription>
              {employee?.department && (
                <Badge variant="outline" className="mt-2">
                  {employee.department.name}
                </Badge>
              )}
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
              <Button className="w-full" variant="outline">
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
                    <Badge key={role.id} variant="secondary" className="mr-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="md:col-span-2">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Position</label>
                  <p className="text-gray-900 mt-1">{employee?.position || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900 mt-1">
                    {employee?.department?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Hire Date</label>
                  <p className="text-gray-900 mt-1">{formatDate(employee?.hire_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Manager</label>
                  <p className="text-gray-900 mt-1">
                    {employee?.manager?.name || "N/A"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  )
}

