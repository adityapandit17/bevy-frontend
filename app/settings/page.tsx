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
import Image from "next/image"
import { Building2, Users, Shield, Bell, Database, Globe, Save, Download, Calendar, Upload, Trash2, LayoutPanelLeft, Plus, PartyPopper } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { TimePicker } from "@/components/ui/time-picker"
import { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { IntegrationsTab } from "@/components/settings/integrations-tab"
import { DepartmentsTab } from "@/components/settings/departments-tab"
import { BillingTab } from "@/components/settings/billing-tab"
import { apiRequest, apiFormRequest, getEndpointUrl, getApiUrl } from "@/lib/api"
import { cn } from "@/lib/utils"
import { ResourceGuard } from "@/lib/auth/auth.guards"
import { AUTH_CONFIG } from "@/config/auth.config"
import { useAuthContext } from "@/lib/auth"
import type { DashboardLayout } from "@/types/auth.types"

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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-medium text-gray-900">Current Year Policy ({new Date().getFullYear()})</h4>
            <p className="text-sm text-gray-500">Configure leave allocations and holidays for the current year</p>
          </div>
          <Button onClick={editing ? handleSave : () => setEditing(true)} disabled={loading} className="w-full sm:w-auto">
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

interface HolidayItem {
  id: number
  date: string
  name: string
  reason?: string
}

function HolidayCalendarTab() {
  const [holidays, setHolidays] = useState<HolidayItem[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [formData, setFormData] = useState({
    date: "",
    name: "",
    reason: "",
  })
  const [editingId, setEditingId] = useState<number | null>(null)

  const fetchHolidays = async () => {
    setLoading(true)
    try {
      const url = `${getEndpointUrl("HOLIDAYS")}?year=${selectedYear}`
      const data = await apiRequest<HolidayItem[]>(url, { suppressToast: true })
      setHolidays(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching holidays:", err)
      setHolidays([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHolidays()
  }, [selectedYear])

  const resetForm = () => {
    setFormData({ date: "", name: "", reason: "" })
    setEditingId(null)
  }

  const handleSave = async () => {
    if (!formData.date || !formData.name.trim()) {
      toast({
        title: "Missing fields",
        description: "Please provide a date and holiday name.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const payload = {
        holiday: {
          date: formData.date,
          name: formData.name.trim(),
          reason: formData.reason.trim() || undefined,
        },
      }

      if (editingId) {
        await apiRequest(getEndpointUrl("HOLIDAY").replace("{id}", String(editingId)), {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
        toast({ title: "Holiday updated" })
      } else {
        await apiRequest(getEndpointUrl("HOLIDAYS"), {
          method: "POST",
          body: JSON.stringify(payload),
        })
        toast({ title: "Holiday added" })
      }

      resetForm()
      await fetchHolidays()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save holiday"
      toast({ title: "Error", description: message, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (holiday: HolidayItem) => {
    setEditingId(holiday.id)
    setFormData({
      date: holiday.date,
      name: holiday.name,
      reason: holiday.reason || "",
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this holiday from the calendar?")) return
    try {
      await apiRequest(getEndpointUrl("HOLIDAY").replace("{id}", String(id)), {
        method: "DELETE",
      })
      toast({ title: "Holiday removed" })
      if (editingId === id) resetForm()
      await fetchHolidays()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete holiday"
      toast({ title: "Error", description: message, variant: "destructive" })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PartyPopper className="w-5 h-5" />
          Holiday Calendar
        </CardTitle>
        <CardDescription>
          Configure company holidays with dates and reasons. These appear on the company calendar for all employees.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="space-y-2">
            <Label htmlFor="holiday-year">Year</Label>
            <Select
              value={String(selectedYear)}
              onValueChange={(value) => setSelectedYear(parseInt(value, 10))}
            >
              <SelectTrigger id="holiday-year" className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2].map((offset) => {
                  const year = new Date().getFullYear() + offset
                  return (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          <p className="text-sm text-gray-500">
            {holidays.length} holiday{holidays.length === 1 ? "" : "s"} configured for {selectedYear}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-gray-50">
          <div className="space-y-2">
            <Label htmlFor="holiday-date">Date</Label>
            <Input
              id="holiday-date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="holiday-name">Holiday name</Label>
            <Input
              id="holiday-name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Independence Day"
            />
          </div>
          <div className="space-y-2 md:col-span-1">
            <Label htmlFor="holiday-reason">Reason / description</Label>
            <Input
              id="holiday-reason"
              value={formData.reason}
              onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
              placeholder="Why is this a holiday?"
            />
          </div>
          <div className="md:col-span-3 flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={saving}>
              <Plus className="w-4 h-4 mr-2" />
              {editingId ? "Update holiday" : "Add holiday"}
            </Button>
            {editingId && (
              <Button variant="outline" onClick={resetForm} disabled={saving}>
                Cancel edit
              </Button>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Loading holidays...</p>
        ) : holidays.length === 0 ? (
          <p className="text-sm text-gray-500">No holidays configured for {selectedYear} yet.</p>
        ) : (
          <div className="space-y-2">
            {holidays.map((holiday) => (
              <div
                key={holiday.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      {holiday.date}
                    </Badge>
                    <h4 className="font-medium text-gray-900">{holiday.name}</h4>
                  </div>
                  {holiday.reason && (
                    <p className="text-sm text-gray-500 mt-1">{holiday.reason}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(holiday)}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(holiday.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SettingsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { setDashboardLayout } = useAuthContext()
  const tabFromUrl = searchParams.get("tab")
  const [activeTab, setActiveTab] = useState(tabFromUrl || "company")

  useEffect(() => {
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl)
    }
  }, [tabFromUrl, activeTab])

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value === "company") {
      params.delete("tab")
    } else {
      params.set("tab", value)
    }
    const query = params.toString()
    router.replace(query ? `/settings?${query}` : "/settings")
  }

  const defaultCompany = {
    name: "",
    code: "",
    industry: "technology",
    employee_count: "201-500",
    address: "",
    timezone: "asia-kolkata",
    currency: "inr",
    country_code: "IN",
    dashboard_layout: "top_nav" as DashboardLayout,
  }
  
  const [company, setCompany] = useState(defaultCompany)
  const [loading, setLoading] = useState(false)
  const [edit, setEdit] = useState(false)
  const [workStartTime, setWorkStartTime] = useState<string>("09:00")
  const [workEndTime, setWorkEndTime] = useState<string>("18:00")
  const [weeklyWorkingHours, setWeeklyWorkingHours] = useState<string>("40")
  const [lunchDuration, setLunchDuration] = useState<string>("60")
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null)
  const [pendingLogoPreview, setPendingLogoPreview] = useState<string | null>(null)
  const [removeLogoOnSave, setRemoveLogoOnSave] = useState(false)

  useEffect(() => {
    fetchCompany()
  }, [])

  const fetchCompany = async () => {
    setLoading(true)
    try {
      const res = await apiRequest<any>(getEndpointUrl('COMPANY'))
      setCompany(res as any)
      if (res?.work_start_time) setWorkStartTime(res.work_start_time)
      if (res?.work_end_time) setWorkEndTime(res.work_end_time)
      if (res?.weekly_working_hours != null) setWeeklyWorkingHours(String(res.weekly_working_hours))
      if (res?.lunch_duration_minutes != null) setLunchDuration(String(res.lunch_duration_minutes))
      if (res?.dashboard_layout) handleChange("dashboard_layout", res.dashboard_layout)
    } catch (err) {
      console.error("Error fetching company data:", err)
      // Keep the default state if fetch fails
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setCompany((prev) => ({ ...prev, [field]: value }))
  }

  const clearPendingLogo = () => {
    if (pendingLogoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(pendingLogoPreview)
    }
    setPendingLogoFile(null)
    setPendingLogoPreview(null)
    setRemoveLogoOnSave(false)
  }

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ""
    if (pendingLogoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(pendingLogoPreview)
    }
    setPendingLogoFile(file)
    setPendingLogoPreview(URL.createObjectURL(file))
    setRemoveLogoOnSave(false)
  }

  const handleLogoRemovePending = () => {
    clearPendingLogo()
    setRemoveLogoOnSave(true)
  }

  const appendCompanyToFormData = (form: FormData) => {
    const c = safeCompany
    form.append("company[name]", c.name || "")
    form.append("company[code]", c.code || "")
    form.append("company[industry]", c.industry || "")
    form.append("company[employee_count]", c.employee_count || "")
    form.append("company[address]", c.address || "")
    form.append("company[timezone]", c.timezone || "")
    form.append("company[currency]", c.currency || "")
    form.append("company[country_code]", (c as { country_code?: string }).country_code || "IN")
    form.append("company[work_start_time]", workStartTime)
    form.append("company[work_end_time]", workEndTime)
    form.append("company[weekly_working_hours]", String(parseFloat(weeklyWorkingHours) || 40))
    form.append("company[lunch_duration_minutes]", String(parseInt(lunchDuration, 10) || 60))
    form.append("company[dashboard_layout]", (c as { dashboard_layout?: string }).dashboard_layout || "top_nav")
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const useMultipart = Boolean(pendingLogoFile || removeLogoOnSave)

      if (useMultipart) {
        const form = new FormData()
        appendCompanyToFormData(form)
        if (pendingLogoFile) form.append("logo", pendingLogoFile)
        if (removeLogoOnSave) form.append("remove_logo", "true")
        await apiFormRequest<any>(getEndpointUrl("COMPANY"), form, { method: "PATCH" })
      } else {
        await apiRequest<any>(getEndpointUrl("COMPANY"), {
          method: "PATCH",
          body: JSON.stringify({
            company: {
              name: safeCompany.name,
              code: safeCompany.code,
              industry: safeCompany.industry,
              employee_count: safeCompany.employee_count,
              address: safeCompany.address,
              timezone: safeCompany.timezone,
              currency: safeCompany.currency,
              country_code: (safeCompany as { country_code?: string }).country_code,
              work_start_time: workStartTime,
              work_end_time: workEndTime,
              weekly_working_hours: parseFloat(weeklyWorkingHours) || 40,
              lunch_duration_minutes: parseInt(lunchDuration, 10) || 60,
              dashboard_layout: (safeCompany as { dashboard_layout?: DashboardLayout }).dashboard_layout || "top_nav",
            },
          }),
        })
      }

      clearPendingLogo()
      setEdit(false)
      await fetchCompany()
      const layout = ((safeCompany as { dashboard_layout?: DashboardLayout }).dashboard_layout || "top_nav") as DashboardLayout
      setDashboardLayout(layout)
      toast({ title: "Company settings saved" })
    } catch (err) {
      toast({
        title: "Could not save",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    clearPendingLogo()
    setEdit(false)
    fetchCompany()
  }

  // Ensure company is never null
  const safeCompany = company || defaultCompany

  return (
    <ResourceGuard resourceKeys={["settings"]} requiredRoles={["Super Admin", "HR Manager"]} pageName="Settings">
      <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-2xl sm:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your BevyHR system configuration</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {edit && (
            <Button variant="outline" onClick={handleCancelEdit} disabled={loading} className="w-full sm:w-auto">
              Cancel
            </Button>
          )}
          <Button onClick={edit ? handleSave : () => setEdit(true)} disabled={loading} className="w-full sm:w-auto">
            <Save className="w-4 h-4 mr-2" />
            {edit ? "Save Changes" : "Edit"}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="hrms-tabs-scroll">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="leave-policies">Leave Policies</TabsTrigger>
          <TabsTrigger value="holiday-calendar">Holiday Calendar</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="space-y-2 lg:col-span-8 flex flex-col">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={safeCompany.address || ""}
                    onChange={e => handleChange("address", e.target.value)}
                    rows={3}
                    disabled={!edit}
                    className="min-h-[88px] flex-1 resize-none"
                  />
                </div>
                <div className="space-y-2 lg:col-span-4 flex flex-col">
                  <Label htmlFor="company-logo">
                    Company Logo{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  {(() => {
                    const logoPreview =
                      removeLogoOnSave
                        ? null
                        : pendingLogoPreview ||
                          (safeCompany as { logo_url?: string | null }).logo_url ||
                          null
                    const hasLogo = Boolean(logoPreview)

                    return (
                      <div
                        className={cn(
                          "flex min-h-[88px] w-full flex-1 items-center gap-3 rounded-md border border-input bg-background px-3 py-2 ring-offset-background",
                          !edit && "cursor-not-allowed opacity-50"
                        )}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-input bg-muted/40">
                          {logoPreview ? (
                            <Image
                              src={logoPreview}
                              alt={`${safeCompany.name} logo`}
                              width={40}
                              height={40}
                              className="h-full w-full object-contain"
                              unoptimized
                            />
                          ) : (
                            <span className="text-sm font-medium text-muted-foreground">
                              {safeCompany.name?.charAt(0)?.toUpperCase() || "—"}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          {edit ? (
                            <>
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="h-9"
                                  disabled={loading}
                                  asChild
                                >
                                  <label htmlFor="company-logo" className="cursor-pointer">
                                    <Upload className="mr-2 h-4 w-4" />
                                    {hasLogo ? "Change file" : "Choose file"}
                                    <input
                                      id="company-logo"
                                      type="file"
                                      accept="image/png,image/jpeg,image/webp,image/svg+xml,.png,.jpg,.jpeg,.webp,.svg"
                                      className="sr-only"
                                      onChange={handleLogoSelect}
                                      disabled={loading}
                                    />
                                  </label>
                                </Button>
                                {hasLogo && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 text-muted-foreground"
                                    onClick={handleLogoRemovePending}
                                    disabled={loading}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove
                                  </Button>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {pendingLogoFile || removeLogoOnSave
                                  ? "Save company settings to apply logo changes."
                                  : "PNG, JPG, WEBP, or SVG · max 2MB"}
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-muted-foreground md:text-sm">
                              {hasLogo ? "Logo uploaded" : "No logo uploaded, Edit to change"}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={safeCompany.timezone} onValueChange={v => handleChange("timezone", v)} disabled={!edit}>
                    <SelectTrigger id="timezone">
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
                    <SelectTrigger id="currency">
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
                  <Label htmlFor="country_code">Country</Label>
                  <Select value={(safeCompany as any).country_code || "IN"} onValueChange={v => handleChange("country_code", v)} disabled={!edit}>
                    <SelectTrigger id="country_code">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="AE">United Arab Emirates</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="SG">Singapore</SelectItem>
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
                  <TimePicker value={workStartTime} onChange={setWorkStartTime} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="work-end">Work End Time</Label>
                  <TimePicker value={workEndTime} onChange={setWorkEndTime} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lunch-duration">Lunch Duration (minutes)</Label>
                  <Input
                    id="lunch-duration"
                    type="number"
                    value={lunchDuration}
                    onChange={(e) => setLunchDuration(e.target.value)}
                    disabled={!edit}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekly-hours">Weekly Working Hours</Label>
                  <Input
                    id="weekly-hours"
                    type="number"
                    min={1}
                    max={80}
                    value={weeklyWorkingHours}
                    onChange={(e) => setWeeklyWorkingHours(e.target.value)}
                    disabled={!edit}
                  />
                  <p className="text-xs text-gray-500">Used for attendance compliance and hours-behind calculations</p>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutPanelLeft className="w-5 h-5" />
                Dashboard Layout
              </CardTitle>
              <CardDescription>
                Choose how navigation appears for everyone in your company. This applies company-wide.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  disabled={!edit}
                  onClick={() => handleChange("dashboard_layout", "top_nav")}
                  className={cn(
                    "rounded-lg border-2 p-4 text-left transition-colors",
                    (safeCompany as { dashboard_layout?: string }).dashboard_layout !== "sidebar"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-gray-300",
                    !edit && "cursor-default opacity-80"
                  )}
                >
                  <p className="font-medium text-gray-900">Top Navigation</p>
                  <p className="mt-1 text-sm text-gray-500">Horizontal menu across the top of the screen (default).</p>
                </button>
                <button
                  type="button"
                  disabled={!edit}
                  onClick={() => handleChange("dashboard_layout", "sidebar")}
                  className={cn(
                    "rounded-lg border-2 p-4 text-left transition-colors",
                    (safeCompany as { dashboard_layout?: string }).dashboard_layout === "sidebar"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 hover:border-gray-300",
                    !edit && "cursor-default opacity-80"
                  )}
                >
                  <p className="font-medium text-gray-900">Sidebar (Dashboard v2)</p>
                  <p className="mt-1 text-sm text-gray-500">Vertical sidebar with full navigation on the left.</p>
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Other users will see the updated layout after they refresh or navigate to a new page.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments */}
        <TabsContent value="departments" className="space-y-6">
          <DepartmentsTab />
        </TabsContent>

        {/* Leave Policies */}
        <TabsContent value="leave-policies" className="space-y-6">
          <LeavePoliciesTab />
        </TabsContent>

        {/* Holiday Calendar */}
        <TabsContent value="holiday-calendar" className="space-y-6">
          <HolidayCalendarTab />
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
                  <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{role.role}</h4>
                      <p className="text-sm text-gray-500">{role.permissions}</p>
                      <p className="text-xs text-gray-400">{role.users} users assigned</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => window.location.href = '/settings/role-permissions'}>
                      Edit Permissions
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-medium text-gray-900">Advanced Role Management</h4>
                    <p className="text-sm text-gray-500">Create custom roles and manage detailed permissions</p>
                  </div>
                  <Button className="w-full sm:w-auto" onClick={() => window.location.href = '/settings/role-permissions'}>
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
          <IntegrationsTab />
        </TabsContent>

        {/* Billing & subscription */}
        <TabsContent value="billing" className="space-y-6">
          <BillingTab />
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
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Database className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto">
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

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-6 text-gray-500">Loading settings…</div>}>
      <SettingsPageContent />
    </Suspense>
  )
}
