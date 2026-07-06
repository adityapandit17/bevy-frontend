"use client"

import { useEffect, useMemo, useState } from "react"
import { Building2, Loader2, Search, Users } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { apiRequest, getEndpointUrl } from "@/lib/api"

type ZoneKey = "north" | "center" | "south"
type SeatStatus = "occupied" | "vacant" | "blocked"

type Seat = {
  id: number
  label: string
  zone: ZoneKey
  status: SeatStatus
  employee_id: number | null
  employee_name: string | null
  employee_department: string | null
}

type EmployeeOption = {
  id: number
  name: string
  department: string
}

const ZONES: { key: ZoneKey; label: string; hint: string }[] = [
  { key: "north", label: "North Bay", hint: "Engineering + IT" },
  { key: "center", label: "Central Bay", hint: "HR + Ops" },
  { key: "south", label: "South Bay", hint: "Sales + Support" },
]

function statusClasses(status: SeatStatus) {
  switch (status) {
    case "occupied":
      return "border-emerald-300 bg-emerald-50 hover:bg-emerald-100"
    case "vacant":
      return "border-slate-200 bg-white hover:bg-slate-50"
    case "blocked":
      return "border-slate-200 bg-slate-100 text-slate-400 hover:bg-slate-100"
  }
}

export default function WorkspaceSeatingPage() {
  const [zone, setZone] = useState<ZoneKey | "all">("all")
  const [query, setQuery] = useState("")
  const [seats, setSeats] = useState<Seat[]>([])
  const [employees, setEmployees] = useState<EmployeeOption[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingEmployees, setLoadingEmployees] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null)
  const [editStatus, setEditStatus] = useState<SeatStatus>("vacant")
  const [editEmployeeId, setEditEmployeeId] = useState<string>("")

  useEffect(() => {
    fetchSeats()
  }, [])

  const fetchSeats = async () => {
    setLoading(true)
    try {
      const data = await apiRequest<Seat[]>(getEndpointUrl("WORKSPACE_SEATS"))
      setSeats(Array.isArray(data) ? data : [])
    } catch {
      setSeats([])
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    setLoadingEmployees(true)
    try {
      const response = await apiRequest<{ data?: Array<{
        id: number
        first_name: string
        last_name: string
        department?: { name: string }
      }> }>(`${getEndpointUrl("EMPLOYEES")}?per_page=1000`, { suppressToast: true })

      const employeeList = Array.isArray(response?.data) ? response.data : []
      setEmployees(
        employeeList.map((e) => ({
          id: e.id,
          name: `${e.first_name} ${e.last_name}`.trim(),
          department: e.department?.name ?? "",
        }))
      )
    } catch {
      setEmployees([])
    } finally {
      setLoadingEmployees(false)
    }
  }

  const filteredSeats = useMemo(() => {
    const q = query.trim().toLowerCase()
    return seats.filter((s) => {
      if (zone !== "all" && s.zone !== zone) return false
      if (!q) return true

      const hay = [
        s.label,
        s.zone,
        s.status,
        s.employee_name,
        s.employee_department,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return hay.includes(q)
    })
  }, [query, seats, zone])

  const selectedSeat = useMemo(() => {
    if (selectedSeatId == null) return null
    return seats.find((s) => s.id === selectedSeatId) || null
  }, [seats, selectedSeatId])

  useEffect(() => {
    if (selectedSeat) {
      setEditStatus(selectedSeat.status)
      setEditEmployeeId(selectedSeat.employee_id ? String(selectedSeat.employee_id) : "")
      fetchEmployees()
    }
  }, [selectedSeat])

  const counts = useMemo(() => {
    const scoped = zone === "all" ? seats : seats.filter((s) => s.zone === zone)
    return {
      total: scoped.length,
      occupied: scoped.filter((s) => s.status === "occupied").length,
      vacant: scoped.filter((s) => s.status === "vacant").length,
      blocked: scoped.filter((s) => s.status === "blocked").length,
    }
  }, [seats, zone])

  const handleOpenChange = (open: boolean) => {
    if (!open) setSelectedSeatId(null)
  }

  const handleSaveSeat = async () => {
    if (!selectedSeat) return

    const employeeId =
      editStatus === "occupied" && editEmployeeId ? parseInt(editEmployeeId, 10) : null

    setSaving(true)
    try {
      const updated = await apiRequest<Seat>(
        `${getEndpointUrl("WORKSPACE_SEATS")}/${selectedSeat.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            workspace_seat: {
              status: editStatus,
              employee_id: employeeId,
            },
          }),
        }
      )

      setSeats((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
      setSelectedSeatId(null)
    } catch {
      // toast handled by apiRequest
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-700" />
                <h1 className="text-xl font-semibold text-gray-900">Workspace Seating</h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Top-view seat map. Click any seat to inspect or update allocation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-600">Occupied: {counts.occupied}</Badge>
              <Badge variant="outline">Vacant: {counts.vacant}</Badge>
              <Badge variant="secondary">Blocked: {counts.blocked}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Seat Map
            </CardTitle>
            <CardDescription>
              Use the filters to focus on a zone or search by seat/employee.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Zone</Label>
                <Select value={zone} onValueChange={(v) => setZone(v as ZoneKey | "all")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Zones</SelectItem>
                    {ZONES.map((z) => (
                      <SelectItem key={z.key} value={z.key}>
                        {z.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search seat ID, employee name, department…"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading seats…
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {ZONES.filter((z) => zone === "all" || z.key === zone).map((z) => {
                  const zoneSeats = filteredSeats
                    .filter((s) => s.zone === z.key)
                    .sort((a, b) => a.label.localeCompare(b.label))

                  return (
                    <div key={z.key} className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-medium text-gray-900">{z.label}</div>
                          <div className="text-xs text-gray-500">{z.hint}</div>
                        </div>
                        <Badge variant="outline">{zoneSeats.length} seats</Badge>
                      </div>

                      <div className="rounded-xl border bg-white p-4">
                        <div className="grid grid-cols-6 gap-2">
                          {zoneSeats.map((seat) => {
                            const isSelected = seat.id === selectedSeatId

                            return (
                              <button
                                key={seat.id}
                                type="button"
                                onClick={() => setSelectedSeatId(seat.id)}
                                className={cn(
                                  "relative aspect-square rounded-lg border text-[10px] leading-tight p-1 text-left transition-colors",
                                  statusClasses(seat.status),
                                  isSelected && "ring-2 ring-blue-500",
                                )}
                                title={
                                  seat.employee_name
                                    ? `${seat.label} — ${seat.employee_name}${seat.employee_department ? ` (${seat.employee_department})` : ""}`
                                    : seat.label
                                }
                              >
                                <div className="font-medium text-gray-700">{seat.label}</div>
                                {seat.status === "occupied" && seat.employee_name ? (
                                  <div className="mt-1 text-[9px] text-emerald-800 line-clamp-2">
                                    {seat.employee_name}
                                  </div>
                                ) : seat.status === "blocked" ? (
                                  <div className="mt-1 text-[9px] text-slate-500">Blocked</div>
                                ) : (
                                  <div className="mt-1 text-[9px] text-slate-500">Vacant</div>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              <Badge className="bg-emerald-600">Occupied</Badge>
              <Badge variant="outline">Vacant</Badge>
              <Badge variant="secondary">Blocked</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedSeat} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seat {selectedSeat?.label}</DialogTitle>
            <DialogDescription>
              Update seat status and employee assignment.
            </DialogDescription>
          </DialogHeader>

          {selectedSeat ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-gray-500">Zone</div>
                  <div className="font-medium text-gray-900">
                    {ZONES.find((z) => z.key === selectedSeat.zone)?.label}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-gray-500">Current status</div>
                  <div className="font-medium text-gray-900 capitalize">{selectedSeat.status}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={editStatus}
                  onValueChange={(v) => {
                    const status = v as SeatStatus
                    setEditStatus(status)
                    if (status !== "occupied") setEditEmployeeId("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacant">Vacant</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editStatus === "occupied" && (
                <div className="space-y-2">
                  <Label>Assign employee</Label>
                  <Select
                    value={editEmployeeId || undefined}
                    onValueChange={setEditEmployeeId}
                    disabled={loadingEmployees}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingEmployees ? "Loading employees…" : "Select employee"} />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>
                          {emp.name}{emp.department ? ` — ${emp.department}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedSeat.employee_name && editStatus !== "occupied" && (
                <div className="rounded-lg border p-3 text-sm text-amber-700 bg-amber-50">
                  Saving will unassign {selectedSeat.employee_name}.
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedSeatId(null)} disabled={saving}>
                  Close
                </Button>
                <Button
                  onClick={handleSaveSeat}
                  disabled={saving || (editStatus === "occupied" && !editEmployeeId)}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
