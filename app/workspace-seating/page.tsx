"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Building2, Download, Plus, Save, Search, Trash2, Upload, Users } from "lucide-react"

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

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

type LayoutArea = {
  id: string
  name: string
  x: number
  y: number
  w: number
  h: number
  color: string
}

type LayoutSeat = {
  id: string
  label: string
  x: number
  y: number
  status: SeatStatus
  employeeId?: string
}

type SeatingLayout = {
  version: 1
  canvas: { w: number; h: number }
  areas: LayoutArea[]
  seats: LayoutSeat[]
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

const LAYOUT_STORAGE_KEY = "hrms_workspace_seating_layout_v1"

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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2, 10)}`
}

function defaultLayout(): SeatingLayout {
  // A starter layout so the editor has something visible.
  return {
    version: 1,
    canvas: { w: 1100, h: 650 },
    areas: [
      { id: "a_north", name: "North Bay", x: 40, y: 40, w: 1020, h: 170, color: "#E0F2FE" },
      { id: "a_center", name: "Central Bay", x: 40, y: 240, w: 1020, h: 170, color: "#ECFDF5" },
      { id: "a_south", name: "South Bay", x: 40, y: 440, w: 1020, h: 170, color: "#FEF9C3" },
    ],
    seats: Array.from({ length: 18 }).map((_, i) => {
      const row = Math.floor(i / 6)
      const col = i % 6
      return {
        id: `seat_${i + 1}`,
        label: `S-${String(i + 1).padStart(2, "0")}`,
        x: 120 + col * 150,
        y: 85 + row * 200,
        status: i % 7 === 0 ? "occupied" : "vacant",
        employeeId: i % 7 === 0 ? MOCK_EMPLOYEES[i % MOCK_EMPLOYEES.length].id : undefined,
      } satisfies LayoutSeat
    }),
  }
}

export default function WorkspaceSeatingPage() {
  const [zone, setZone] = useState<ZoneKey | "all">("all")
  const [query, setQuery] = useState("")
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null)

  const employeesById = useMemo(() => new Map(MOCK_EMPLOYEES.map((e) => [ e.id, e ])), [])
  const seats = useMemo(() => buildMockSeats(), [])

  // Custom layout (UI-only)
  const [layout, setLayout] = useState<SeatingLayout | null>(null)
  const [layoutJson, setLayoutJson] = useState<string>("")
  const canvasRef = useRef<HTMLDivElement | null>(null)
  const [selectedEntity, setSelectedEntity] = useState<{ type: "area" | "seat"; id: string } | null>(null)
  const dragRef = useRef<
    | null
    | {
        type: "area" | "seat" | "area_resize"
        id: string
        startX: number
        startY: number
        origX: number
        origY: number
        origW?: number
        origH?: number
      }
  >(null)

  useEffect(() => {
    // Load from localStorage (UI-only persistence)
    try {
      const raw = localStorage.getItem(LAYOUT_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as SeatingLayout
        if (parsed && parsed.version === 1) {
          setLayout(parsed)
          setLayoutJson(JSON.stringify(parsed, null, 2))
          return
        }
      }
    } catch {
      // ignore
    }
    const d = defaultLayout()
    setLayout(d)
    setLayoutJson(JSON.stringify(d, null, 2))
  }, [])

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
    // If using custom layout, seat ids differ; dialog is for both modes.
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

  const filteredLayoutSeats = useMemo(() => {
    if (!layout) return []
    const q = query.trim().toLowerCase()
    return layout.seats.filter((s) => {
      if (!q) return true
      const emp = s.employeeId ? employeesById.get(s.employeeId) : undefined
      const hay = [ s.label, s.status, emp?.name, emp?.department ].filter(Boolean).join(" ").toLowerCase()
      return hay.includes(q)
    })
  }, [employeesById, layout, query])

  const selectedLayoutSeat = useMemo(() => {
    if (!layout || !selectedSeatId) return null
    return layout.seats.find((s) => s.id === selectedSeatId) || null
  }, [layout, selectedSeatId])
  const selectedLayoutEmployee = selectedLayoutSeat?.employeeId ? employeesById.get(selectedLayoutSeat.employeeId) : null

  const layoutCounts = useMemo(() => {
    if (!layout) return { total: 0, occupied: 0, vacant: 0, blocked: 0 }
    return {
      total: layout.seats.length,
      occupied: layout.seats.filter((s) => s.status === "occupied").length,
      vacant: layout.seats.filter((s) => s.status === "vacant").length,
      blocked: layout.seats.filter((s) => s.status === "blocked").length,
    }
  }, [layout])

  const saveLayoutToLocal = () => {
    if (!layout) return
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout))
    toast({ title: "Saved", description: "Layout saved locally (UI-only)" })
  }

  const exportLayoutJson = () => {
    if (!layout) return
    setLayoutJson(JSON.stringify(layout, null, 2))
    toast({ title: "Export ready", description: "Layout JSON generated below" })
  }

  const importLayoutJson = () => {
    try {
      const parsed = JSON.parse(layoutJson) as SeatingLayout
      if (!parsed || parsed.version !== 1) {
        toast({ title: "Error", description: "Invalid layout JSON (version mismatch)", variant: "destructive" })
        return
      }
      setLayout(parsed)
      toast({ title: "Imported", description: "Layout loaded from JSON" })
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "Invalid JSON", variant: "destructive" })
    }
  }

  const deleteSelected = () => {
    if (!layout || !selectedEntity) return
    if (selectedEntity.type === "area") {
      setLayout({ ...layout, areas: layout.areas.filter((a) => a.id !== selectedEntity.id) })
    } else {
      setLayout({ ...layout, seats: layout.seats.filter((s) => s.id !== selectedEntity.id) })
    }
    setSelectedEntity(null)
  }

  const addArea = () => {
    if (!layout) return
    const a: LayoutArea = {
      id: genId("area"),
      name: `Area ${layout.areas.length + 1}`,
      x: 60,
      y: 60,
      w: 300,
      h: 160,
      color: "#F3F4F6",
    }
    setLayout({ ...layout, areas: [ ...layout.areas, a ] })
    setSelectedEntity({ type: "area", id: a.id })
  }

  const addSeat = () => {
    if (!layout) return
    const s: LayoutSeat = {
      id: genId("seat"),
      label: `Seat ${layout.seats.length + 1}`,
      x: 100,
      y: 100,
      status: "vacant",
    }
    setLayout({ ...layout, seats: [ ...layout.seats, s ] })
    setSelectedEntity({ type: "seat", id: s.id })
  }

  const getCanvasLocalPoint = (clientX: number, clientY: number) => {
    const el = canvasRef.current
    if (!el) return { x: 0, y: 0 }
    const rect = el.getBoundingClientRect()
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const onPointerDownSeat = (e: React.PointerEvent, id: string) => {
    if (!layout) return
    e.preventDefault()
    e.stopPropagation()
    const pt = getCanvasLocalPoint(e.clientX, e.clientY)
    const seat = layout.seats.find((s) => s.id === id)
    if (!seat) return
    setSelectedEntity({ type: "seat", id })
    dragRef.current = { type: "seat", id, startX: pt.x, startY: pt.y, origX: seat.x, origY: seat.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerDownArea = (e: React.PointerEvent, id: string) => {
    if (!layout) return
    e.preventDefault()
    e.stopPropagation()
    const pt = getCanvasLocalPoint(e.clientX, e.clientY)
    const area = layout.areas.find((a) => a.id === id)
    if (!area) return
    setSelectedEntity({ type: "area", id })
    dragRef.current = { type: "area", id, startX: pt.x, startY: pt.y, origX: area.x, origY: area.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerDownAreaResize = (e: React.PointerEvent, id: string) => {
    if (!layout) return
    e.preventDefault()
    e.stopPropagation()
    const pt = getCanvasLocalPoint(e.clientX, e.clientY)
    const area = layout.areas.find((a) => a.id === id)
    if (!area) return
    setSelectedEntity({ type: "area", id })
    dragRef.current = {
      type: "area_resize",
      id,
      startX: pt.x,
      startY: pt.y,
      origX: area.x,
      origY: area.y,
      origW: area.w,
      origH: area.h,
    }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMoveCanvas = (e: React.PointerEvent) => {
    if (!layout || !dragRef.current) return
    const pt = getCanvasLocalPoint(e.clientX, e.clientY)
    const dx = pt.x - dragRef.current.startX
    const dy = pt.y - dragRef.current.startY
    const cW = layout.canvas.w
    const cH = layout.canvas.h

    if (dragRef.current.type === "seat") {
      const id = dragRef.current.id
      setLayout((prev) => {
        if (!prev) return prev
        const seat = prev.seats.find((s) => s.id === id)
        if (!seat) return prev
        const nextX = clamp(dragRef.current!.origX + dx, 0, cW - 24)
        const nextY = clamp(dragRef.current!.origY + dy, 0, cH - 24)
        return {
          ...prev,
          seats: prev.seats.map((s) => (s.id === id ? { ...s, x: nextX, y: nextY } : s)),
        }
      })
    } else if (dragRef.current.type === "area") {
      const id = dragRef.current.id
      setLayout((prev) => {
        if (!prev) return prev
        const area = prev.areas.find((a) => a.id === id)
        if (!area) return prev
        const nextX = clamp(dragRef.current!.origX + dx, 0, cW - area.w)
        const nextY = clamp(dragRef.current!.origY + dy, 0, cH - area.h)
        return {
          ...prev,
          areas: prev.areas.map((a) => (a.id === id ? { ...a, x: nextX, y: nextY } : a)),
        }
      })
    } else if (dragRef.current.type === "area_resize") {
      const id = dragRef.current.id
      const ow = dragRef.current.origW || 0
      const oh = dragRef.current.origH || 0
      setLayout((prev) => {
        if (!prev) return prev
        const area = prev.areas.find((a) => a.id === id)
        if (!area) return prev
        const nextW = clamp(ow + dx, 80, cW - area.x)
        const nextH = clamp(oh + dy, 60, cH - area.y)
        return {
          ...prev,
          areas: prev.areas.map((a) => (a.id === id ? { ...a, w: nextW, h: nextH } : a)),
        }
      })
    }
  }

  const onPointerUpCanvas = () => {
    dragRef.current = null
  }

  const onCanvasBackgroundClick = () => setSelectedEntity(null)

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
              <Badge className="bg-emerald-600">Occupied: {layout?.seats?.length ? layoutCounts.occupied : counts.occupied}</Badge>
              <Badge variant="outline">Vacant: {layout?.seats?.length ? layoutCounts.vacant : counts.vacant}</Badge>
              <Badge variant="secondary">Blocked: {layout?.seats?.length ? layoutCounts.blocked : counts.blocked}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 space-y-6">
        <Tabs defaultValue="view" className="space-y-6">
          <TabsList>
            <TabsTrigger value="view">View</TabsTrigger>
            <TabsTrigger value="editor">Layout editor</TabsTrigger>
          </TabsList>

          <TabsContent value="view" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Seat Map
                </CardTitle>
                <CardDescription>
                  View mode renders your custom layout (if saved). Click any seat to inspect it.
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
                    <div className="text-xs text-gray-500">
                      Zone filter currently applies to the old grid view only.
                    </div>
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

                {/* Custom layout view */}
                {layout ? (
                  <div className="rounded-xl border bg-white p-4 overflow-auto">
                    <div
                      className="relative bg-slate-50 rounded-lg border"
                      style={{ width: layout.canvas.w, height: layout.canvas.h }}
                    >
                      {layout.areas.map((a) => (
                        <div
                          key={a.id}
                          className="absolute rounded-lg border border-slate-200"
                          style={{
                            left: a.x,
                            top: a.y,
                            width: a.w,
                            height: a.h,
                            background: a.color,
                          }}
                        >
                          <div className="px-2 py-1 text-xs font-medium text-slate-700 truncate">
                            {a.name}
                          </div>
                        </div>
                      ))}

                      {filteredLayoutSeats.map((s) => {
                        const emp = s.employeeId ? employeesById.get(s.employeeId) : null
                        const isSelected = s.id === selectedSeatId
                        const base =
                          s.status === "occupied"
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                            : s.status === "blocked"
                              ? "bg-slate-200 border-slate-300 text-slate-500"
                              : "bg-white border-slate-200 text-slate-900"

                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedSeatId(s.id)}
                            className={cn(
                              "absolute w-10 h-10 rounded-full border text-[10px] leading-tight flex flex-col items-center justify-center shadow-sm hover:bg-slate-50",
                              base,
                              isSelected && "ring-2 ring-blue-500",
                            )}
                            style={{ left: s.x, top: s.y }}
                            title={emp ? `${s.label} — ${emp.name}` : s.label}
                          >
                            <div className="font-semibold">{s.label}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

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
          </TabsContent>

          <TabsContent value="editor" className="space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Custom layout creator
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={addArea} disabled={!layout}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add area
                    </Button>
                    <Button variant="outline" size="sm" onClick={addSeat} disabled={!layout}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add seat
                    </Button>
                    <Button size="sm" onClick={saveLayoutToLocal} disabled={!layout}>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  Drag areas and seats anywhere. Resize areas from the bottom-right handle. This is UI-only and saves to your browser.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {layout ? (
                  <div className="rounded-xl border bg-white p-4 overflow-auto">
                    <div
                      ref={canvasRef}
                      className="relative bg-slate-50 rounded-lg border select-none"
                      style={{ width: layout.canvas.w, height: layout.canvas.h }}
                      onPointerMove={onPointerMoveCanvas}
                      onPointerUp={onPointerUpCanvas}
                      onPointerCancel={onPointerUpCanvas}
                      onMouseDown={onCanvasBackgroundClick}
                    >
                      {layout.areas.map((a) => {
                        const isSel = selectedEntity?.type === "area" && selectedEntity.id === a.id
                        return (
                          <div
                            key={a.id}
                            onPointerDown={(e) => onPointerDownArea(e, a.id)}
                            className={cn(
                              "absolute rounded-lg border border-slate-200",
                              isSel && "ring-2 ring-blue-500",
                            )}
                            style={{
                              left: a.x,
                              top: a.y,
                              width: a.w,
                              height: a.h,
                              background: a.color,
                            }}
                          >
                            <div className="px-2 py-1 text-xs font-medium text-slate-700 truncate">
                              {a.name}
                            </div>
                            <button
                              type="button"
                              onPointerDown={(e) => onPointerDownAreaResize(e, a.id)}
                              className="absolute right-1 bottom-1 w-3 h-3 rounded-sm border bg-white/80"
                              title="Resize"
                            />
                          </div>
                        )
                      })}

                      {layout.seats.map((s) => {
                        const emp = s.employeeId ? employeesById.get(s.employeeId) : null
                        const isSel = selectedEntity?.type === "seat" && selectedEntity.id === s.id
                        const base =
                          s.status === "occupied"
                            ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                            : s.status === "blocked"
                              ? "bg-slate-200 border-slate-300 text-slate-500"
                              : "bg-white border-slate-200 text-slate-900"

                        return (
                          <div
                            key={s.id}
                            onPointerDown={(e) => onPointerDownSeat(e, s.id)}
                            className={cn(
                              "absolute w-10 h-10 rounded-full border text-[10px] leading-tight flex flex-col items-center justify-center shadow-sm",
                              base,
                              isSel && "ring-2 ring-blue-500",
                            )}
                            style={{ left: s.x, top: s.y }}
                            title={emp ? `${s.label} — ${emp.name}` : s.label}
                          >
                            <div className="font-semibold">{s.label}</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-1">
                    <CardHeader>
                      <CardTitle className="text-base">Properties</CardTitle>
                      <CardDescription>
                        Select an area/seat to edit. Delete removes it from layout.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {layout && selectedEntity?.type === "area" ? (
                        (() => {
                          const a = layout.areas.find((x) => x.id === selectedEntity.id)
                          if (!a) return null
                          return (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label>Area name</Label>
                                <Input
                                  value={a.name}
                                  onChange={(e) =>
                                    setLayout((prev) =>
                                      !prev
                                        ? prev
                                        : {
                                            ...prev,
                                            areas: prev.areas.map((x) =>
                                              x.id === a.id ? { ...x, name: e.target.value } : x
                                            ),
                                          }
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Color (hex)</Label>
                                <Input
                                  value={a.color}
                                  onChange={(e) =>
                                    setLayout((prev) =>
                                      !prev
                                        ? prev
                                        : {
                                            ...prev,
                                            areas: prev.areas.map((x) =>
                                              x.id === a.id ? { ...x, color: e.target.value } : x
                                            ),
                                          }
                                    )
                                  }
                                  placeholder="#F3F4F6"
                                />
                              </div>
                              <Button variant="destructive" size="sm" onClick={deleteSelected}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete area
                              </Button>
                            </div>
                          )
                        })()
                      ) : layout && selectedEntity?.type === "seat" ? (
                        (() => {
                          const s = layout.seats.find((x) => x.id === selectedEntity.id)
                          if (!s) return null
                          return (
                            <div className="space-y-3">
                              <div className="space-y-2">
                                <Label>Seat label</Label>
                                <Input
                                  value={s.label}
                                  onChange={(e) =>
                                    setLayout((prev) =>
                                      !prev
                                        ? prev
                                        : {
                                            ...prev,
                                            seats: prev.seats.map((x) =>
                                              x.id === s.id ? { ...x, label: e.target.value } : x
                                            ),
                                          }
                                    )
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Status</Label>
                                <Select
                                  value={s.status}
                                  onValueChange={(v) =>
                                    setLayout((prev) =>
                                      !prev
                                        ? prev
                                        : {
                                            ...prev,
                                            seats: prev.seats.map((x) =>
                                              x.id === s.id ? { ...x, status: v as SeatStatus } : x
                                            ),
                                          }
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="vacant">vacant</SelectItem>
                                    <SelectItem value="occupied">occupied</SelectItem>
                                    <SelectItem value="blocked">blocked</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button variant="destructive" size="sm" onClick={deleteSelected}>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete seat
                              </Button>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="text-sm text-gray-600">
                          Select an area or seat on the canvas.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>Layout JSON</span>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={exportLayoutJson} disabled={!layout}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                          </Button>
                          <Button variant="outline" size="sm" onClick={importLayoutJson}>
                            <Upload className="w-4 h-4 mr-2" />
                            Import
                          </Button>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        Optional: copy/paste layout for sharing. Import will replace the current layout.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Textarea value={layoutJson} onChange={(e) => setLayoutJson(e.target.value)} rows={14} />
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div>Saved key: <code>{LAYOUT_STORAGE_KEY}</code></div>
                        <div>Total seats: {layoutCounts.total}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedLayoutSeat || !!selectedSeat} onOpenChange={(open) => !open && setSelectedSeatId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seat {selectedLayoutSeat?.label || selectedSeat?.label}</DialogTitle>
            <DialogDescription>
              UI-only preview. Allocation actions will be wired later.
            </DialogDescription>
          </DialogHeader>

          {(selectedLayoutSeat || selectedSeat) ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-gray-500">Zone</div>
                  <div className="font-medium text-gray-900">
                    {selectedLayoutSeat ? "Custom layout" : ZONES.find((z) => z.key === selectedSeat?.zone)?.label}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-gray-500">Status</div>
                  <div className="font-medium text-gray-900">{selectedLayoutSeat?.status || selectedSeat?.status}</div>
                </div>
              </div>

              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500">Assigned employee</div>
                {selectedLayoutEmployee || selectedEmployee ? (
                  <div className="mt-1">
                    <div className="font-medium text-gray-900">{(selectedLayoutEmployee || selectedEmployee)?.name}</div>
                    <div className="text-sm text-gray-600">{(selectedLayoutEmployee || selectedEmployee)?.department}</div>
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

