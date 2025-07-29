"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, Users, Shield, Bell, Database, Globe, Save, Download } from "lucide-react"
import { useEffect, useState } from "react"

export default function SettingsPage() {
  const [company, setCompany] = useState({
    name: "",
    code: "",
    industry: "technology",
    employee_count: "201-500",
    address: "",
    timezone: "asia-kolkata",
    currency: "inr"
  })
  const [loading, setLoading] = useState(false)
  const [edit, setEdit] = useState(false)

  useEffect(() => {
    fetchCompany()
  }, [])

  const fetchCompany = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:3000/company")
      const data = await res.json()
      setCompany(data)
    } catch (err) {
      // handle error
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
      const res = await fetch("http://localhost:3000/company", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company })
      })
      if (res.ok) {
        setEdit(false)
        fetchCompany()
      } else {
        // handle error
      }
    } catch (err) {
      // handle error
    } finally {
      setLoading(false)
    }
  }

  return (
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
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
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
                  <Input id="company-name" value={company.name} onChange={e => handleChange("name", e.target.value)} disabled={!edit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-code">Company Code</Label>
                  <Input id="company-code" value={company.code} onChange={e => handleChange("code", e.target.value)} disabled={!edit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={company.industry} onValueChange={v => handleChange("industry", v)} disabled={!edit}>
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
                  <Select value={company.employee_count} onValueChange={v => handleChange("employee_count", v)} disabled={!edit}>
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
                <Textarea id="address" value={company.address} onChange={e => handleChange("address", e.target.value)} rows={3} disabled={!edit} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={company.timezone} onValueChange={v => handleChange("timezone", v)} disabled={!edit}>
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
                  <Select value={company.currency} onValueChange={v => handleChange("currency", v)} disabled={!edit}>
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
                    <Button variant="outline" size="sm">
                      Edit Permissions
                    </Button>
                  </div>
                ))}
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
  )
}
