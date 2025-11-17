"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Users, Shield, Bell, Database, Globe, Save, Download, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { apiRequest, getEndpointUrl, getApiUrl } from "@/lib/api"
import { ResourceGuard } from "@/lib/auth/auth.guards"
import { AUTH_CONFIG } from "@/config/auth.config"

// Leave Policies Tab Component
function LeavePoliciesTab() {
  const [policies, setPolicies] = useState<any[]>([])
  const [currentPolicy, setCurrentPolicy] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    holidays_per_year: 10,
    annual_leave: 21,
    sick_leave: 12,
    personal_leave: 5,
    maternity_leave: 90,
    paternity_leave: 15,
    unpaid_leave: 30,
    other_leave: 5,
    active: true
  })

  useEffect(() => {
    fetchPolicies()
    fetchCurrentPolicy()
  }, [])

  const fetchPolicies = async () => {
    try {
      const data = await apiRequest<any[]>(getApiUrl('/leave_policies'))
      setPolicies(data)
    } catch (err) {
      console.error('Error fetching policies:', err)
    }
  }

  const fetchCurrentPolicy = async () => {
    try {
      const data = await apiRequest<any>(getApiUrl('/leave_policies/current'))
      setCurrentPolicy(data)
      if (data) {
        setFormData({
          year: data.year || new Date().getFullYear(),
          holidays_per_year: data.holidays_per_year || 10,
          annual_leave: data.annual_leave || 21,
          sick_leave: data.sick_leave || 12,
          personal_leave: data.personal_leave || 5,
          maternity_leave: data.maternity_leave || 90,
          paternity_leave: data.paternity_leave || 15,
          unpaid_leave: data.unpaid_leave || 30,
          other_leave: data.other_leave || 5,
          active: data.active !== false
        })
      }
    } catch (err) {
      console.error('Error fetching current policy:', err)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      if (currentPolicy?.id) {
        // Update existing policy
        await apiRequest<any>(getApiUrl(`/leave_policies/${currentPolicy.id}`), {
          method: 'PATCH',
          body: JSON.stringify({ leave_policy: formData })
        })
      } else {
        // Create new policy
        await apiRequest<any>(getApiUrl('/leave_policies'), {
          method: 'POST',
          body: JSON.stringify({ leave_policy: formData })
        })
      }

      setEditing(false)
      await fetchPolicies()
      await fetchCurrentPolicy()
    } catch (err) {
      console.error('Error saving policy:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save policy'
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Leave Policies Configuration
        </CardTitle>
        <CardDescription>
          Configure the number of holidays per year and leave allocations for employees
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Current Year Policy ({new Date().getFullYear()})</h4>
            <p className="text-sm text-gray-500">Configure leave allocations and holidays for the current year</p>
          </div>
          <Button onClick={editing ? handleSave : () => setEditing(true)} disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {editing ? "Save Changes" : "Edit Policy"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) || new Date().getFullYear() })}
              disabled={!editing}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="holidays_per_year">Holidays Per Year</Label>
            <Input
              id="holidays_per_year"
              type="number"
              value={formData.holidays_per_year}
              onChange={(e) => setFormData({ ...formData, holidays_per_year: parseInt(e.target.value) || 0 })}
              disabled={!editing}
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Leave Allocations (Days)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="annual_leave">Annual Leave</Label>
              <Input
                id="annual_leave"
                type="number"
                value={formData.annual_leave}
                onChange={(e) => setFormData({ ...formData, annual_leave: parseInt(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sick_leave">Sick Leave</Label>
              <Input
                id="sick_leave"
                type="number"
                value={formData.sick_leave}
                onChange={(e) => setFormData({ ...formData, sick_leave: parseInt(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personal_leave">Personal Leave</Label>
              <Input
                id="personal_leave"
                type="number"
                value={formData.personal_leave}
                onChange={(e) => setFormData({ ...formData, personal_leave: parseInt(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maternity_leave">Maternity Leave</Label>
              <Input
                id="maternity_leave"
                type="number"
                value={formData.maternity_leave}
                onChange={(e) => setFormData({ ...formData, maternity_leave: parseInt(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paternity_leave">Paternity Leave</Label>
              <Input
                id="paternity_leave"
                type="number"
                value={formData.paternity_leave}
                onChange={(e) => setFormData({ ...formData, paternity_leave: parseInt(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unpaid_leave">Unpaid Leave</Label>
              <Input
                id="unpaid_leave"
                type="number"
                value={formData.unpaid_leave}
                onChange={(e) => setFormData({ ...formData, unpaid_leave: parseInt(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="other_leave">Other Leave</Label>
              <Input
                id="other_leave"
                type="number"
                value={formData.other_leave}
                onChange={(e) => setFormData({ ...formData, other_leave: parseInt(e.target.value) || 0 })}
                disabled={!editing}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="space-y-0.5">
            <Label>Active Policy</Label>
            <p className="text-sm text-gray-500">This policy will be used for leave calculations</p>
          </div>
          <Switch
            checked={formData.active}
            onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
            disabled={!editing}
          />
        </div>

        {policies.length > 0 && (
          <div className="pt-6 border-t">
            <h4 className="font-medium text-gray-900 mb-4">Previous Policies</h4>
            <div className="space-y-2">
              {policies.slice(0, 5).map((policy) => (
                <div key={policy.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{policy.year} Policy</p>
                    <p className="text-sm text-gray-500">
                      {policy.holidays_per_year} holidays, {policy.annual_leave} annual, {policy.sick_leave} sick
                    </p>
                  </div>
                  <Badge variant={policy.active ? "default" : "secondary"}>
                    {policy.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function SettingsPage() {
  const defaultCompany = {
    name: "",
    code: "",
    industry: "technology",
    employee_count: "201-500",
    address: "",
    timezone: "asia-kolkata",
    currency: "inr"
  }
  
  const [company, setCompany] = useState(defaultCompany)
  const [loading, setLoading] = useState(false)
  const [edit, setEdit] = useState(false)

  useEffect(() => {
    fetchCompany()
  }, [])

  const fetchCompany = async () => {
    setLoading(true)
    try {
      const res = await apiRequest<any>(getEndpointUrl('COMPANY'))
      setCompany(res as any)
    } catch (err) {
      console.error("Error fetching company data:", err)
      // Keep the default state if fetch fails
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setCompany((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Get JWT token from localStorage
      await apiRequest<any>(getEndpointUrl('COMPANY'), {
        method: "PATCH",
        body: JSON.stringify({ company })
      })

      setEdit(false)
      fetchCompany()
      console.log("Company data saved successfully")
    } catch (err) {
      console.error("Error saving company data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Ensure company is never null
  const safeCompany = company || defaultCompany

  return (
    <ResourceGuard resourceKeys={["settings"]} requiredRoles={["Super Admin", "HR Manager"]} pageName="Settings">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your HRMS system configuration</p>
        </div>
        <Button onClick={edit ? handleSave : () => setEdit(true)} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {edit ? "Save Changes" : "Edit"}
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-7">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="leave-policies">Leave Policies</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Company Information
              </CardTitle>
              <CardDescription>Update your organization's basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input id="company-name" value={safeCompany.name} onChange={e => handleChange("name", e.target.value)} disabled={!edit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-code">Company Code</Label>
                  <Input id="company-code" value={safeCompany.code} onChange={e => handleChange("code", e.target.value)} disabled={!edit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={safeCompany.industry} onValueChange={v => handleChange("industry", v)} disabled={!edit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee-count">Employee Count</Label>
                  <Select value={safeCompany.employee_count} onValueChange={v => handleChange("employee_count", v)} disabled={!edit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-50">1-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-500">201-500</SelectItem>
                      <SelectItem value="501-1000">501-1000</SelectItem>
                      <SelectItem value="1000+">1000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={safeCompany.address} onChange={e => handleChange("address", e.target.value)} rows={3} disabled={!edit} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={safeCompany.timezone} onValueChange={v => handleChange("timezone", v)} disabled={!edit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="america-new_york">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={safeCompany.currency} onValueChange={v => handleChange("currency", v)} disabled={!edit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="usd">US Dollar ($)</SelectItem>
                      <SelectItem value="eur">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Working Hours & Policies</CardTitle>
              <CardDescription>Configure work schedules and company policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="work-start">Work Start Time</Label>
                  <Input id="work-start" type="time" defaultValue="09:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work-end">Work End Time</Label>
                  <Input id="work-end" type="time" defaultValue="18:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunch-duration">Lunch Duration (minutes)</Label>
                  <Input id="lunch-duration" type="number" defaultValue="60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekly-hours">Weekly Working Hours</Label>
                  <Input id="weekly-hours" type="number" defaultValue="40" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Flexible Working Hours</Label>
                    <p className="text-sm text-gray-500">Allow employees to have flexible start/end times</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Remote Work Policy</Label>
                    <p className="text-sm text-gray-500">Enable work from home options</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Overtime Tracking</Label>
                    <p className="text-sm text-gray-500">Track and compensate overtime hours</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Policies */}
        <TabsContent value="leave-policies" className="space-y-6">
          <LeavePoliciesTab />
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                User Roles & Permissions
              </CardTitle>
              <CardDescription>Manage user access levels and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { role: "Super Admin", users: 2, permissions: "Full system access" },
                  { role: "HR Manager", users: 5, permissions: "Employee management, payroll, reports" },
                  { role: "Department Head", users: 12, permissions: "Team management, attendance approval" },
                  { role: "Employee", users: 229, permissions: "Self-service portal access" },
                ].map((role, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{role.role}</h4>
                      <p className="text-sm text-gray-500">{role.permissions}</p>
                      <p className="text-xs text-gray-400">{role.users} users assigned</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.location.href = '/settings/role-permissions'}>
                      Edit Permissions
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Advanced Role Management</h4>
                    <p className="text-sm text-gray-500">Create custom roles and manage detailed permissions</p>
                  </div>
                  <Button onClick={() => window.location.href = '/settings/role-permissions'}>
                    <Users className="w-4 h-4 mr-2" />
                    Manage Roles & Permissions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Authentication
              </CardTitle>
              <CardDescription>Configure security policies and authentication methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-500">Require 2FA for all users</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Single Sign-On (SSO)</Label>
                    <p className="text-sm text-gray-500">Enable SSO integration</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-gray-500">Auto-logout after inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Password Policy</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min-length">Minimum Length</Label>
                    <Input id="min-length" type="number" defaultValue="8" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-expiry">Password Expiry (days)</Label>
                    <Input id="password-expiry" type="number" defaultValue="90" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Require uppercase letters</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Require numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch defaultChecked />
                    <Label>Require special characters</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                {[
                  { label: "New Employee Onboarding", description: "Notify when new employees join" },
                  { label: "Leave Requests", description: "Alert managers about leave applications" },
                  { label: "Payroll Processing", description: "Notify about payroll completion" },
                  { label: "Birthday Reminders", description: "Send birthday notifications" },
                  { label: "Performance Reviews", description: "Remind about pending reviews" },
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{notification.label}</Label>
                      <p className="text-sm text-gray-500">{notification.description}</p>
                    </div>
                    <Switch defaultChecked={index < 3} />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">SMS Notifications</h4>
                {[
                  { label: "Emergency Alerts", description: "Critical system notifications" },
                  { label: "Attendance Reminders", description: "Daily check-in reminders" },
                  { label: "Leave Approvals", description: "Leave request status updates" },
                ].map((notification, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>{notification.label}</Label>
                      <p className="text-sm text-gray-500">{notification.description}</p>
                    </div>
                    <Switch defaultChecked={index === 0} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Third-party Integrations
              </CardTitle>
              <CardDescription>Connect with external services and applications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {[
                  {
                    name: "Slack",
                    description: "Team communication and notifications",
                    icon: "💬",
                    connected: true,
                  },
                  {
                    name: "Google Workspace",
                    description: "Email and calendar integration",
                    icon: "📧",
                    connected: true,
                  },
                  {
                    name: "Zoom",
                    description: "Video conferencing for interviews",
                    icon: "📹",
                    connected: false,
                  },
                  {
                    name: "Banking API",
                    description: "Automated salary transfers",
                    icon: "🏦",
                    connected: true,
                  },
                  {
                    name: "Biometric System",
                    description: "Fingerprint attendance tracking",
                    icon: "👆",
                    connected: false,
                  },
                ].map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{integration.icon}</span>
                      <div>
                        <h4 className="font-medium text-gray-900">{integration.name}</h4>
                        <p className="text-sm text-gray-500">{integration.description}</p>
                      </div>
                    </div>
                    <Button variant={integration.connected ? "outline" : "default"} size="sm">
                      {integration.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Manage system-wide settings and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="asia-kolkata">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asia-kolkata">Asia/Kolkata (IST)</SelectItem>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="america-new_york">America/New_York (EST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select defaultValue="inr">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inr">Indian Rupee (₹)</SelectItem>
                      <SelectItem value="usd">US Dollar ($)</SelectItem>
                      <SelectItem value="eur">Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="dd-mm-yyyy">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd-mm-yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="mm-dd-yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="english">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="hindi">हिंदी</SelectItem>
                      <SelectItem value="tamil">தமிழ்</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Data & Backup</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Automatic Backups</Label>
                    <p className="text-sm text-gray-500">Daily automated data backups</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Data Retention</Label>
                    <p className="text-sm text-gray-500">Keep deleted records for 90 days</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-gray-500">Track all system activities</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex gap-4">
                  <Button variant="outline">
                    <Database className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Backup
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    </ResourceGuard>
  )
}
