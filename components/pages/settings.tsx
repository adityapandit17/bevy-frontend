"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Users, Bell, Zap, Shield, Database, Download, Building2 } from "lucide-react"

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "company", label: "Company", icon: Building2 },
    { id: "departments", label: "Departments", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "security", label: "Security", icon: Shield },
    { id: "data", label: "Data & Backup", icon: Database },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Configure your HRMS system preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">System Preferences</CardTitle>
              <CardDescription className="text-gray-600">Configure general system behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Auto-approve leave requests</Label>
                  <p className="text-sm text-gray-500">Automatically approve certain types of leave requests</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Send welcome emails</Label>
                  <p className="text-sm text-gray-500">Email new employees upon onboarding</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Enable time tracking</Label>
                  <p className="text-sm text-gray-500">Track employee work hours and attendance</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Multi-language support</Label>
                  <p className="text-sm text-gray-500">Enable multiple language options</p>
                </div>
                <Select defaultValue="english">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="hindi">Hindi</SelectItem>
                    <SelectItem value="tamil">Tamil</SelectItem>
                    <SelectItem value="bengali">Bengali</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="company" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Company Information</CardTitle>
              <CardDescription className="text-gray-600">Update your organization details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input id="companyName" defaultValue="TechCorp Solutions Pvt Ltd" />
                </div>
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select defaultValue="technology">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="employeeCount">Employee Count</Label>
                  <Select defaultValue="1000-5000">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-50">1-50</SelectItem>
                      <SelectItem value="51-200">51-200</SelectItem>
                      <SelectItem value="201-1000">201-1000</SelectItem>
                      <SelectItem value="1000-5000">1000-5000</SelectItem>
                      <SelectItem value="5000+">5000+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="founded">Founded Year</Label>
                  <Input id="founded" defaultValue="2015" />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Headquarters Address</Label>
                <Input id="address" defaultValue="123 Tech Park, Bangalore, Karnataka 560001, India" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+91 80 1234 5678" />
                </div>
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" defaultValue="https://techcorp.com" />
                </div>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-gray-900">Departments & Roles</CardTitle>
                  <CardDescription className="text-gray-600">Manage organizational structure</CardDescription>
                </div>
                <Button className="bg-green-600 hover:bg-green-700">Add Department</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Engineering", head: "Priya Sharma", employees: 45, budget: "₹2.1Cr" },
                  { name: "Product Management", head: "Vikram Singh", employees: 12, budget: "₹85L" },
                  { name: "Sales & Marketing", head: "Kavya Nair", employees: 28, budget: "₹1.2Cr" },
                  { name: "Human Resources", head: "Rohit Mehta", employees: 8, budget: "₹45L" },
                  { name: "Finance & Operations", head: "Sneha Gupta", employees: 15, budget: "₹65L" },
                ].map((dept) => (
                  <div
                    key={dept.name}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{dept.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>Head: {dept.head}</span>
                        <span>•</span>
                        <span>{dept.employees} employees</span>
                        <span>•</span>
                        <span>Budget: {dept.budget}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 bg-transparent">
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Notification Preferences</CardTitle>
              <CardDescription className="text-gray-600">Configure when and how to send notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Leave request notifications</Label>
                      <p className="text-sm text-gray-500">Notify managers of new leave requests</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Birthday reminders</Label>
                      <p className="text-sm text-gray-500">Send birthday notifications to team</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Performance review reminders</Label>
                      <p className="text-sm text-gray-500">Remind managers of upcoming reviews</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Payroll processing alerts</Label>
                      <p className="text-sm text-gray-500">Notify HR team about payroll deadlines</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">System Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">New employee onboarding</Label>
                      <p className="text-sm text-gray-500">Notify relevant teams about new joiners</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Document expiry alerts</Label>
                      <p className="text-sm text-gray-500">Alert when employee documents are expiring</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Third-party Integrations</CardTitle>
              <CardDescription className="text-gray-600">Connect with external services and tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Slack",
                    description: "Team communication and notifications",
                    connected: true,
                    icon: "💬",
                  },
                  {
                    name: "Google Workspace",
                    description: "Email, calendar, and document management",
                    connected: true,
                    icon: "📧",
                  },
                  {
                    name: "Microsoft Teams",
                    description: "Video conferencing and collaboration",
                    connected: false,
                    icon: "📹",
                  },
                  {
                    name: "Zoom",
                    description: "Video meetings and webinars",
                    connected: false,
                    icon: "🎥",
                  },
                  {
                    name: "Jira",
                    description: "Project management and issue tracking",
                    connected: false,
                    icon: "📋",
                  },
                  {
                    name: "Biometric Devices",
                    description: "Fingerprint and face recognition attendance",
                    connected: true,
                    icon: "👆",
                  },
                ].map((integration) => (
                  <div
                    key={integration.name}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{integration.icon}</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{integration.name}</h4>
                        <p className="text-sm text-gray-600">{integration.description}</p>
                      </div>
                    </div>
                    <Button
                      variant={integration.connected ? "outline" : "default"}
                      size="sm"
                      className={
                        integration.connected
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "bg-green-600 hover:bg-green-700"
                      }
                    >
                      {integration.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Security Settings</CardTitle>
              <CardDescription className="text-gray-600">Manage security and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Two-factor authentication</Label>
                  <p className="text-sm text-gray-500">Require 2FA for all admin users</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Session timeout</Label>
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
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Password requirements</Label>
                  <p className="text-sm text-gray-500">Enforce strong password policies</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Login attempt limits</Label>
                  <p className="text-sm text-gray-500">Lock account after failed attempts</p>
                </div>
                <Select defaultValue="5">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 attempts</SelectItem>
                    <SelectItem value="5">5 attempts</SelectItem>
                    <SelectItem value="10">10 attempts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Data Management & Backup</CardTitle>
              <CardDescription className="text-gray-600">Configure data retention and backup settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Automatic backups</Label>
                  <p className="text-sm text-gray-500">Daily system and database backups</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Data retention period</Label>
                  <p className="text-sm text-gray-500">How long to keep employee data after termination</p>
                </div>
                <Select defaultValue="7">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 year</SelectItem>
                    <SelectItem value="3">3 years</SelectItem>
                    <SelectItem value="5">5 years</SelectItem>
                    <SelectItem value="7">7 years</SelectItem>
                    <SelectItem value="10">10 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Export Data</Label>
                  <p className="text-sm text-gray-500 mb-4">Download all system data for compliance or migration</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-gray-200 text-gray-600 bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Export Employee Data
                    </Button>
                    <Button variant="outline" className="border-gray-200 text-gray-600 bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Export Payroll Data
                    </Button>
                    <Button variant="outline" className="border-gray-200 text-gray-600 bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Export All Data
                    </Button>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="p-4 bg-yellow-50 rounded-lg">
                <h3 className="font-medium text-yellow-800 mb-2">Data Privacy Compliance</h3>
                <p className="text-sm text-yellow-700">
                  This system complies with data protection regulations including GDPR and local privacy laws. Employee
                  data is encrypted and access is logged for audit purposes.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
