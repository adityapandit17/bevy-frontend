"use client"

import { useState, useEffect } from "react"
import { useAuthContext } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Palette,
  Mail,
  Smartphone,
  Shield,
  Save,
  Eye,
  EyeOff
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiRequest, getApiUrl, getEndpointUrl } from "@/lib/api"

export default function UserSettingsPage() {
  const { user, token } = useAuthContext()
  const { toast } = useToast()
  
  // Account Settings
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phone, setPhone] = useState("")
  
  // Password Settings
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  
  // Notification Settings
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [leaveNotifications, setLeaveNotifications] = useState(true)
  const [attendanceNotifications, setAttendanceNotifications] = useState(true)
  const [payrollNotifications, setPayrollNotifications] = useState(false)
  const [systemNotifications, setSystemNotifications] = useState(true)
  
  // Preferences
  const [language, setLanguage] = useState("en")
  const [timezone, setTimezone] = useState("UTC")
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY")
  const [theme, setTheme] = useState("light")
  const [prefsLoading, setPrefsLoading] = useState(true)
  const [savingAccount, setSavingAccount] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)
  const [savingPreferences, setSavingPreferences] = useState(false)

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user?.id) return
      setPrefsLoading(true)
      try {
        const url = getEndpointUrl("USER_PREFERENCES").replace("{id}", String(user.id))
        const prefs = await apiRequest<Record<string, unknown>>(url, { suppressToast: true })
        if (prefs) {
          setEmailNotifications(Boolean(prefs.email_notifications))
          setPushNotifications(Boolean(prefs.push_notifications))
          setLeaveNotifications(Boolean(prefs.leave_notifications))
          setAttendanceNotifications(Boolean(prefs.attendance_notifications))
          setPayrollNotifications(Boolean(prefs.payroll_notifications))
          setSystemNotifications(Boolean(prefs.system_notifications))
          if (typeof prefs.language === "string") setLanguage(prefs.language)
          if (typeof prefs.timezone === "string") setTimezone(prefs.timezone)
          if (typeof prefs.date_format === "string") setDateFormat(prefs.date_format)
          if (typeof prefs.theme === "string") setTheme(prefs.theme)
        }
      } catch (error) {
        console.error("Failed to load preferences", error)
      } finally {
        setPrefsLoading(false)
      }
    }
    loadPreferences()
  }, [user?.id])

  const handleSaveAccount = async () => {
    if (!user?.id) return
    setSavingAccount(true)
    try {
      const parts = name.trim().split(/\s+/)
      const first_name = parts[0] || ""
      const last_name = parts.slice(1).join(" ") || ""
      const url = getEndpointUrl("USER_UPDATE_PROFILE").replace("{id}", String(user.id))
      await apiRequest(url, {
        method: "PATCH",
        body: JSON.stringify({ user: { first_name, last_name } }),
      })
      toast({
        title: "Account updated",
        description: "Your account information has been saved successfully.",
      })
    } catch {
      // apiRequest shows toast
    } finally {
      setSavingAccount(false)
    }
  }

  const handleChangePassword = async () => {
    // Validate current password is provided
    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Current password is required.",
        variant: "destructive",
      })
      return
    }

    // Validate new password is provided
    if (!newPassword) {
      toast({
        title: "Error",
        description: "New password is required.",
        variant: "destructive",
      })
      return
    }

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      })
      return
    }

    // Validate password length
    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)

    try {
      const url = getApiUrl("api/v1/auth/change_password")
      const requestBody = {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      }
      
      console.log("Changing password - URL:", url)
      console.log("Changing password - Request body:", { ...requestBody, current_password: "***", new_password: "***", confirm_password: "***" })
      
      // Use fetch directly for better error handling
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found. Please login again.",
          variant: "destructive",
        })
        setIsChangingPassword(false)
        return
      }
      
      const responseData = await apiRequest<any>(url, {
        method: "POST",
        body: JSON.stringify(requestBody),
      })

      console.log("Change password response data:", responseData)

      if (responseData.success) {
        toast({
          title: "Password changed",
          description: responseData.data?.message || "Your password has been updated successfully.",
        })
        // Clear form fields on success
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        // Handle error response
        const errorMessage = responseData.error || responseData.message || "Failed to change password. Please try again."
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      let errorMessage = "Failed to change password. Please try again."
      
      if (error instanceof Error) {
        errorMessage = error.message
        
        // Try to parse JSON error response if present
        try {
          const jsonMatch = error.message.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const errorData = JSON.parse(jsonMatch[0])
            if (errorData.error) {
              errorMessage = errorData.error
            } else if (errorData.message) {
              errorMessage = errorData.message
            }
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSaveNotifications = async () => {
    if (!user?.id) return
    setSavingNotifications(true)
    try {
      const url = getEndpointUrl("USER_UPDATE_PREFERENCES").replace("{id}", String(user.id))
      await apiRequest(url, {
        method: "PATCH",
        body: JSON.stringify({
          preferences: {
            email_notifications: emailNotifications,
            push_notifications: pushNotifications,
            leave_notifications: leaveNotifications,
            attendance_notifications: attendanceNotifications,
            payroll_notifications: payrollNotifications,
            system_notifications: systemNotifications,
          },
        }),
      })
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been saved.",
      })
    } catch {
      // apiRequest shows toast
    } finally {
      setSavingNotifications(false)
    }
  }

  const handleSavePreferences = async () => {
    if (!user?.id) return
    setSavingPreferences(true)
    try {
      const url = getEndpointUrl("USER_UPDATE_PREFERENCES").replace("{id}", String(user.id))
      await apiRequest(url, {
        method: "PATCH",
        body: JSON.stringify({
          preferences: {
            language,
            timezone,
            date_format: dateFormat,
            theme,
          },
        }),
      })
      toast({
        title: "Preferences saved",
        description: "Your preferences have been saved.",
      })
    } catch {
      // apiRequest shows toast
    } finally {
      setSavingPreferences(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="account" className="space-y-4 sm:space-y-6">
        <TabsList className="hrms-tabs-scroll">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Account
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
              <CardDescription>
                Update your account information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                />
              </div>
              <Separator />
              <Button onClick={handleSaveAccount} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Change Password
              </CardTitle>
              <CardDescription>
                Update your password to keep your account secure
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              <Separator />
              <Button 
                onClick={handleChangePassword} 
                className="w-full sm:w-auto"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about updates and activities
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>
              <Separator />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <Label htmlFor="push-notifications">Push Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={pushNotifications}
                  onCheckedChange={setPushNotifications}
                />
              </div>
              <Separator />
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Notification Types</h4>
                <div className="space-y-4 pl-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <Label htmlFor="leave-notifications">Leave Requests</Label>
                      <p className="text-sm text-gray-500">
                        Notifications about leave applications and approvals
                      </p>
                    </div>
                    <Switch
                      id="leave-notifications"
                      checked={leaveNotifications}
                      onCheckedChange={setLeaveNotifications}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <Label htmlFor="attendance-notifications">Attendance</Label>
                      <p className="text-sm text-gray-500">
                        Notifications about attendance records
                      </p>
                    </div>
                    <Switch
                      id="attendance-notifications"
                      checked={attendanceNotifications}
                      onCheckedChange={setAttendanceNotifications}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <Label htmlFor="payroll-notifications">Payroll</Label>
                      <p className="text-sm text-gray-500">
                        Notifications about payroll and salary updates
                      </p>
                    </div>
                    <Switch
                      id="payroll-notifications"
                      checked={payrollNotifications}
                      onCheckedChange={setPayrollNotifications}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <Label htmlFor="system-notifications">System Updates</Label>
                      <p className="text-sm text-gray-500">
                        Important system announcements and updates
                      </p>
                    </div>
                    <Switch
                      id="system-notifications"
                      checked={systemNotifications}
                      onCheckedChange={setSystemNotifications}
                    />
                  </div>
                </div>
              </div>
              <Separator />
              <Button onClick={handleSaveNotifications} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                User Preferences
              </CardTitle>
              <CardDescription>
                Customize your application experience
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="Europe/London">London (GMT)</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <select
                  id="date-format"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD MMM YYYY">DD MMM YYYY</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <select
                  id="theme"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>
              <Separator />
              <Button onClick={handleSavePreferences} className="w-full sm:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

