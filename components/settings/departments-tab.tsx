"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Building2, Plus, Trash2, Sparkles } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { apiRequest, getEndpointUrl } from "@/lib/api"

interface Department {
  id: number
  name: string
  employee_count: number
}

interface DepartmentDefaults {
  default_names: string[]
  existing: string[]
  missing: string[]
}

export function DepartmentsTab() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [defaults, setDefaults] = useState<DepartmentDefaults | null>(null)
  const [loading, setLoading] = useState(false)
  const [newName, setNewName] = useState("")
  const [adding, setAdding] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)

  useEffect(() => {
    fetchDepartments()
    fetchDefaults()
  }, [])

  const fetchDepartments = async () => {
    setLoading(true)
    try {
      const data = await apiRequest<Department[]>(getEndpointUrl("DEPARTMENTS"))
      setDepartments(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error fetching departments:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchDefaults = async () => {
    try {
      const data = await apiRequest<DepartmentDefaults>(getEndpointUrl("DEPARTMENTS_DEFAULTS"))
      setDefaults(data)
    } catch (err) {
      console.error("Error fetching department defaults:", err)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = newName.trim()
    if (!name) return

    setAdding(true)
    try {
      await apiRequest(getEndpointUrl("DEPARTMENTS"), {
        method: "POST",
        body: JSON.stringify({ department: { name } }),
      })
      setNewName("")
      await fetchDepartments()
      await fetchDefaults()
      toast({ title: "Department added", description: `"${name}" is now available.` })
    } catch (err) {
      toast({
        title: "Could not add department",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setAdding(false)
    }
  }

  const handleSeedDefaults = async () => {
    setSeeding(true)
    try {
      await apiRequest(getEndpointUrl("DEPARTMENTS_SEED_DEFAULTS"), { method: "POST" })
      await fetchDepartments()
      await fetchDefaults()
      toast({ title: "Default departments added" })
    } catch (err) {
      toast({
        title: "Could not add defaults",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive",
      })
    } finally {
      setSeeding(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    try {
      await apiRequest(getEndpointUrl("DEPARTMENTS") + `/${deleteTarget.id}`, {
        method: "DELETE",
        suppressToast: true,
      })
      setDeleteTarget(null)
      await fetchDepartments()
      await fetchDefaults()
      toast({ title: "Department removed", description: `"${deleteTarget.name}" was deleted.` })
    } catch (err) {
      toast({
        title: "Could not delete department",
        description: err instanceof Error ? err.message : "It may have employees assigned.",
        variant: "destructive",
      })
    }
  }

  const missingDefaults = defaults?.missing ?? []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Departments
          </CardTitle>
          <CardDescription>
            Manage your organization&apos;s departments. These appear when adding employees, job openings, and reports.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="new-department">Add department</Label>
              <Input
                id="new-department"
                placeholder="e.g. Customer Success"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={adding}
              />
            </div>
            <Button type="submit" disabled={adding || !newName.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </form>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading departments…</p>
          ) : departments.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">No departments yet. Add one above or use the defaults below.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-32">Employees</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>{dept.employee_count}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={dept.employee_count > 0}
                        onClick={() => setDeleteTarget(dept)}
                        title={dept.employee_count > 0 ? "Reassign employees before deleting" : "Delete department"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Default Departments
          </CardTitle>
          <CardDescription>
            Standard departments used across BevyHR. Add any that are missing from your company.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(defaults?.default_names ?? []).map((name) => {
              const exists = defaults?.existing.includes(name)
              return (
                <Badge key={name} variant={exists ? "default" : "outline"}>
                  {name}
                  {exists ? "" : " (missing)"}
                </Badge>
              )
            })}
          </div>

          {missingDefaults.length > 0 ? (
            <Button onClick={handleSeedDefaults} disabled={seeding}>
              <Sparkles className="w-4 h-4 mr-2" />
              {seeding ? "Adding…" : `Add ${missingDefaults.length} missing default${missingDefaults.length === 1 ? "" : "s"}`}
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">All default departments are already set up.</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete department?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove &quot;{deleteTarget?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
