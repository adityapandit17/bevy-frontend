"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAuthContext } from "@/lib/auth"
import { apiRequest, getEndpointUrl } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { Loader2, Building2, RefreshCw } from "lucide-react"

interface CompanyRow {
  id: number
  name: string
  code: string
  industry?: string
  timezone?: string
  currency?: string
}

interface MembershipRow {
  id: number
  company_id: number
  user_id: number
  status: string
  company_name?: string
  user_email?: string
}

export default function SuperAdminWorkspacesPage() {
  const { checkRole } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [companies, setCompanies] = useState<CompanyRow[]>([])
  const [memberships, setMemberships] = useState<MembershipRow[]>([])
  const [newCompany, setNewCompany] = useState({ name: "", code: "", industry: "General", timezone: "UTC", currency: "USD" })
  const [newMembership, setNewMembership] = useState({ company_id: "", user_id: "", status: "active" })

  const load = useCallback(async () => {
    if (!checkRole("Super Admin")) return
    try {
      setLoading(true)
      const [coRes, mRes] = await Promise.all([
        apiRequest<{ success: boolean; data: CompanyRow[] }>(getEndpointUrl("SUPER_ADMIN_COMPANIES")),
        apiRequest<{ success: boolean; data: MembershipRow[] }>(
          getEndpointUrl("SUPER_ADMIN_COMPANY_MEMBERSHIPS")
        ),
      ])
      setCompanies(coRes.data ?? [])
      setMemberships(mRes.data ?? [])
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to load workspaces",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [checkRole])

  useEffect(() => {
    load()
  }, [load])

  const createCompany = async () => {
    try {
      await apiRequest(getEndpointUrl("SUPER_ADMIN_COMPANIES"), {
        method: "POST",
        body: JSON.stringify({
          company: {
            name: newCompany.name,
            code: newCompany.code.toUpperCase().slice(0, 10),
            industry: newCompany.industry,
            employee_count: "0",
            timezone: newCompany.timezone,
            currency: newCompany.currency,
          },
        }),
      })
      toast({ title: "Workspace created" })
      setNewCompany({ name: "", code: "", industry: "General", timezone: "UTC", currency: "USD" })
      load()
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Create failed",
        variant: "destructive",
      })
    }
  }

  const createMembership = async () => {
    try {
      await apiRequest(getEndpointUrl("SUPER_ADMIN_COMPANY_MEMBERSHIPS"), {
        method: "POST",
        body: JSON.stringify({
          company_membership: {
            company_id: Number(newMembership.company_id),
            user_id: Number(newMembership.user_id),
            status: newMembership.status,
          },
        }),
      })
      toast({ title: "Membership added" })
      setNewMembership({ company_id: "", user_id: "", status: "active" })
      load()
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "Failed to add membership",
        variant: "destructive",
      })
    }
  }

  if (!checkRole("Super Admin")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Super Admin role required.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Building2 className="h-8 w-8" />
            Workspaces
          </h1>
          <p className="text-muted-foreground mt-1">Create companies (tenants) and assign users.</p>
        </div>
        <Button onClick={load} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create workspace</CardTitle>
          <CardDescription>Each workspace is a separate tenant; data is isolated by company.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={newCompany.name} onChange={(e) => setNewCompany((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Code (2–10 chars)</Label>
            <Input value={newCompany.code} onChange={(e) => setNewCompany((p) => ({ ...p, code: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Timezone</Label>
            <Input value={newCompany.timezone} onChange={(e) => setNewCompany((p) => ({ ...p, timezone: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Currency (ISO)</Label>
            <Input value={newCompany.currency} onChange={(e) => setNewCompany((p) => ({ ...p, currency: e.target.value }))} />
          </div>
          <div className="md:col-span-4">
            <Button onClick={createCompany} disabled={!newCompany.name.trim() || newCompany.code.length < 2}>
              Create workspace
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add user to workspace</CardTitle>
          <CardDescription>Grant a user access to a company (membership).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <Label>Company ID</Label>
            <Input
              value={newMembership.company_id}
              onChange={(e) => setNewMembership((p) => ({ ...p, company_id: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label>User ID</Label>
            <Input
              value={newMembership.user_id}
              onChange={(e) => setNewMembership((p) => ({ ...p, user_id: e.target.value }))}
            />
          </div>
          <Button
            onClick={createMembership}
            disabled={!newMembership.company_id || !newMembership.user_id}
          >
            Add membership
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All workspaces</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Timezone</TableHead>
                <TableHead>Currency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.id}</TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.code}</TableCell>
                  <TableCell>{c.timezone}</TableCell>
                  <TableCell>{c.currency}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Memberships</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.id}</TableCell>
                  <TableCell>{m.company_name ?? m.company_id}</TableCell>
                  <TableCell>{m.user_email ?? m.user_id}</TableCell>
                  <TableCell>{m.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
