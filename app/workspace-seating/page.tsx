"use client"

import { useMemo, useState } from "react"
import { Building2, Search, Users } from "lucide-react"

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

type ZoneKey = "north" | "center" | "south"
type SeatStatus = "occupied" | "vacant" | "blocked"

type EmployeeLite = {
  id: string
  name: string
  department: string
}

type Seat = {
  id: string
  label: string
  zone: ZoneKey
  status: SeatStatus
  employeeId?: string
}

const ZONES: { key: ZoneKey; label: string; hint: string }[] = [
  { key: "north", label: "North Bay", hint: "Engineering + IT" },
  { key: "center", label: "Central Bay", hint: "HR + Ops" },
  { key: "south", label: "South Bay", hint: "Sales + Support" },
]

const MOCK_EMPLOYEES: EmployeeLite[] = [
  { id: "e1", name: "Aarav Sharma", department: "Engineering" },
  { id: "e2", name: "Neha Iyer", department: "IT" },
  { id: "e3", name: "Kabir Verma", department: "HR" },
  { id: "e4", name: "Priya Singh", department: "Operations" },
  { id: "e5", name: "Rohan Gupta", department: "Sales" },
  { id: "e6", name: "Meera Nair", department: "Support" },
]

function buildMockSeats(): Seat[] {
  // Simple top-view: 3 zones, each 5x6 = 30 seats => 90 seats
  const rows = 5
  const cols = 6
  const seats: Seat[] = []

  const occupiedAssignments: Record<string, string> = {
    "N-01": "e1",
    "N-03": "e2",
    "C-08": "e3",
    "C-10": "e4",
    "S-02": "e5",
    "S-06": "e6",
  }

  const blockedIds = new Set([ "N-12", "C-01", "S-29" ])

  for (const zone of ZONES) {
    for (let r = 1; r <= rows; r++) {
      for (let c = 1; c <= cols; c++) {
        const idx = (r - 1) * cols + c
        const prefix = zone.key === "north" ? "N" : zone.key === "center" ? "C" : "S"
        const id = `${prefix}-${String(idx).padStart(2, "0")}`
        const employeeId = occupiedAssignments[id]

        const status: SeatStatus = blockedIds.has(id) ? "blocked" : employeeId ? "occupied" : "vacant"
        seats.push({
          id,
          label: id,
          zone: zone.key,
          status,
          employeeId,
        })
      }
    }
  }

  return seats
}

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
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null)

  const employeesById = useMemo(() => new Map(MOCK_EMPLOYEES.map((e) => [ e.id, e ])), [])
  const seats = useMemo(() => buildMockSeats(), [])

  const filteredSeats = useMemo(() => {
    const q = query.trim().toLowerCase()
    return seats.filter((s) => {
      if (zone !== "all" && s.zone !== zone) return false
      if (!q) return true

      const emp = s.employeeId ? employeesById.get(s.employeeId) : undefined
      const hay = [
        s.label,
        s.zone,
        s.status,
        emp?.name,
        emp?.department,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return hay.includes(q)
    })
  }, [employeesById, query, seats, zone])

  const selectedSeat = useMemo(() => {
    if (!selectedSeatId) return null
    return seats.find((s) => s.id === selectedSeatId) || null
  }, [seats, selectedSeatId])

  const selectedEmployee = selectedSeat?.employeeId ? employeesById.get(selectedSeat.employeeId) : null

  const counts = useMemo(() => {
    const scoped = zone === "all" ? seats : seats.filter((s) => s.zone === zone)
    return {
      total: scoped.length,
      occupied: scoped.filter((s) => s.status === "occupied").length,
      vacant: scoped.filter((s) => s.status === "vacant").length,
      blocked: scoped.filter((s) => s.status === "blocked").length,
    }
  }, [seats, zone])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-5">
          <div className="flex items-start justify-between gap-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-gray-700" />
                <h1 className="text-xl font-semibold text-gray-900">Workspace Seating</h1>
                <Badge variant="secondary">UI-only</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Top-view seat map. Click any seat to inspect it (allocation is a placeholder for now).
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
                <Select value={zone} onValueChange={(v) => setZone(v as any)}>
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {ZONES.filter((z) => zone === "all" || z.key === zone).map((z) => {
                const zoneSeats = filteredSeats.filter((s) => s.zone === z.key)
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
                          const emp = seat.employeeId ? employeesById.get(seat.employeeId) : null
                          const disabled = seat.status === "blocked"

                          return (
                            <button
                              key={seat.id}
                              type="button"
                              disabled={disabled}
                              onClick={() => setSelectedSeatId(seat.id)}
                              className={cn(
                                "relative aspect-square rounded-lg border text-[10px] leading-tight p-1 text-left transition-colors",
                                statusClasses(seat.status),
                                isSelected && "ring-2 ring-blue-500",
                                disabled && "cursor-not-allowed",
                              )}
                              title={emp ? `${seat.label} — ${emp.name} (${emp.department})` : seat.label}
                            >
                              <div className="font-medium text-gray-700">{seat.label}</div>
                              {seat.status === "occupied" && emp ? (
                                <div className="mt-1 text-[9px] text-emerald-800 line-clamp-2">
                                  {emp.name}
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

            <div className="flex flex-wrap gap-2 text-sm text-gray-600">
              <Badge className="bg-emerald-600">Occupied</Badge>
              <Badge variant="outline">Vacant</Badge>
              <Badge variant="secondary">Blocked</Badge>
              <span className="text-xs text-gray-500 ml-1">
                Next step: click a seat → allocate / unassign interactively.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedSeat} onOpenChange={(open) => !open && setSelectedSeatId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seat {selectedSeat?.label}</DialogTitle>
            <DialogDescription>
              UI-only preview. Allocation actions will be wired later.
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
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="font-medium text-gray-900">{selectedSeat.status}</div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500">Assigned employee</div>
                {selectedEmployee ? (
                  <div className="mt-1">
                    <div className="font-medium text-gray-900">{selectedEmployee.name}</div>
                    <div className="text-sm text-gray-600">{selectedEmployee.department}</div>
                  </div>
                ) : (
                  <div className="mt-1 text-sm text-gray-600">None</div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedSeatId(null)}>
                  Close
                </Button>
                <Button disabled>
                  Allocate seat (coming soon)
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}

