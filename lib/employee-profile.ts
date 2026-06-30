export function mapEmployeeHeader(data: Record<string, unknown>) {
  const emp = (data.employee || data) as Record<string, unknown>
  return {
    id: String(emp.id ?? ""),
    name: String(emp.name ?? ""),
    email: String(emp.email ?? ""),
    phone: String(emp.phone ?? ""),
    position: String(emp.position ?? ""),
    department: String(emp.department ?? ""),
    hireDate: String(emp.hire_date ?? emp.formatted_hire_date ?? ""),
    status: String(emp.status ?? ""),
    avatar: String(emp.avatar_url ?? emp.avatar ?? ""),
    manager: String(emp.manager ?? ""),
    location: String(emp.location ?? "—"),
    salary: Number(emp.salary ?? 0),
    employeeId: String(emp.display_id ?? emp.employee_id ?? ""),
    employeeNumber: Number(emp.employee_number ?? 0),
    emergencyContact: emp.emergency_contact as EmployeeHeader["emergencyContact"],
  }
}

export interface EmployeeHeader {
  id: string
  name: string
  email: string
  phone: string
  position: string
  department: string
  hireDate: string
  status: string
  avatar?: string
  manager?: string
  location: string
  salary: number
  employeeId: string
  employeeNumber: number
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

export function mapJobDetails(data: Record<string, unknown> | null) {
  if (!data) return null
  const basic = (data.basic_info || {}) as Record<string, unknown>
  const contact = (data.contact_info || {}) as Record<string, unknown>
  const history = Array.isArray(data.employment_history) ? data.employment_history : []
  const current = (history[0] || {}) as Record<string, unknown>

  return {
    position: String(basic.position ?? current.position ?? ""),
    department: String(basic.department ?? current.department ?? ""),
    manager: String(data.manager ?? ""),
    hireDate: String(basic.hire_date ?? current.start_date ?? ""),
    employmentType: String(basic.status ?? current.status ?? "—"),
    workLocation: String(data.work_location ?? "—"),
    workSchedule: String(data.work_schedule ?? "—"),
    probationEndDate: undefined,
    contractEndDate: undefined,
    reportingTo: String(data.manager ?? "—"),
    subordinates: [] as string[],
    skills: [] as string[],
    certifications: [] as string[],
    tenure: String(basic.tenure ?? ""),
    email: String(contact.email ?? ""),
    phone: String(contact.phone ?? ""),
  }
}

export function mapTimeOff(data: Record<string, unknown> | null) {
  const requests = Array.isArray(data?.leave_requests)
    ? data.leave_requests
    : Array.isArray(data)
      ? data
      : []

  return requests.map((r: Record<string, unknown>) => ({
    id: String(r.id ?? ""),
    type: String(r.leave_type ?? r.type ?? ""),
    startDate: String(r.start_date ?? r.startDate ?? ""),
    endDate: String(r.end_date ?? r.endDate ?? ""),
    days: Number(r.days ?? 0),
    status: String(r.status ?? ""),
    reason: String(r.reason ?? ""),
    approvedBy: r.approved_by ? String(r.approved_by) : undefined,
  }))
}

export function mapPayInfo(data: Record<string, unknown> | null) {
  if (!data) return null
  const structure = (data.salary_structure || {}) as Record<string, unknown>

  const basic = Number(data.current_salary ?? structure.basic ?? 0)
  const hra = Number(structure.hra ?? 0)
  const allowances = Number(structure.allowances ?? 0)
  const bonus = Number(structure.bonus ?? 0)
  const tax = Number(structure.income_tax ?? 0)
  const insurance = Number(structure.esi ?? 0)
  const pension = Number(structure.pf ?? 0)
  const otherDeduction = Number(structure.professional_tax ?? structure.deductions ?? 0)
  const net = Number(structure.monthly_ctc ?? data.current_salary ?? basic + hra + allowances + bonus - tax - insurance - pension - otherDeduction)

  return {
    basicSalary: basic,
    allowances: { housing: hra, transport: 0, meal: allowances, other: bonus },
    deductions: { tax, insurance, pension, other: otherDeduction },
    netSalary: net,
    bankDetails: { bankName: "—", accountNumber: "—", ifscCode: "—" },
    paySchedule: "Monthly",
    lastPayDate: "",
    nextPayDate: "",
    payrollHistory: Array.isArray(data.payroll_history) ? data.payroll_history : [],
  }
}

export function mapDocuments(data: Record<string, unknown> | null) {
  const docs = Array.isArray(data?.documents)
    ? data.documents
    : Array.isArray(data)
      ? data
      : []

  return docs.map((d: Record<string, unknown>) => ({
    id: String(d.id ?? ""),
    name: String(d.name ?? ""),
    type: String(d.document_type ?? d.type ?? ""),
    uploadDate: String(d.upload_date ?? d.uploadDate ?? ""),
    expiryDate: d.expiry_date ? String(d.expiry_date) : undefined,
    status: String(d.status ?? ""),
    size: String(d.file_size ?? d.size ?? "—"),
    uploadedBy: String(d.uploaded_by ?? d.uploadedBy ?? "—"),
  }))
}

export function mapPerformance(data: Record<string, unknown> | null) {
  if (!data) return null
  const summary = (data.summary || {}) as Record<string, unknown>
  const goals = (Array.isArray(data.goals) ? data.goals : []).map((g: Record<string, unknown>) => ({
    id: String(g.id ?? ""),
    title: String(g.title ?? ""),
    description: String(g.description ?? ""),
    target: String(g.due_date ?? ""),
    progress: Number(g.progress ?? 0),
    status: String(g.status ?? ""),
  }))
  const reviews = (Array.isArray(data.reviews) ? data.reviews : []).map((r: Record<string, unknown>) => ({
    id: String(r.id ?? ""),
    reviewer: String(r.reviewer ?? ""),
    date: String(r.review_date ?? r.date ?? ""),
    rating: Number(r.rating ?? 0),
    comments: String(r.comments ?? ""),
  }))

  return {
    id: "performance",
    period: String(summary.latest_review ?? "—"),
    rating: Number(summary.average_rating ?? 0),
    goals,
    reviews,
    achievements: [] as string[],
    areasForImprovement: [] as string[],
  }
}

export function mapTimesheets(data: Record<string, unknown> | null) {
  const entries = Array.isArray(data?.timesheets)
    ? data.timesheets
    : Array.isArray(data)
      ? data
      : []

  return entries.map((t: Record<string, unknown>) => ({
    id: String(t.id ?? ""),
    date: String(t.date ?? ""),
    hours: typeof t.hours === "number" ? t.hours : parseFloat(String(t.hours ?? "0")) || 0,
    project: String(t.project ?? ""),
    task: String(t.task ?? ""),
    status: String(t.status ?? ""),
    approvedBy: t.approved_by ? String(t.approved_by) : undefined,
    notes: t.notes ? String(t.notes) : undefined,
  }))
}

export function mapBenefits(data: Record<string, unknown> | null) {
  const items = Array.isArray(data?.benefits)
    ? data.benefits
    : Array.isArray(data)
      ? data
      : []

  return items.map((b: Record<string, unknown>) => ({
    id: String(b.id ?? ""),
    name: String(b.name ?? ""),
    type: String(b.benefit_type ?? b.type ?? ""),
    provider: String(b.provider ?? ""),
    coverage: String(b.coverage ?? ""),
    startDate: String(b.start_date ?? b.startDate ?? ""),
    endDate: b.end_date ? String(b.end_date) : undefined,
    status: String(b.status ?? ""),
    cost: parseFloat(String(b.cost ?? "0").replace(/[^\d.]/g, "")) || 0,
  }))
}

export function mapTraining(data: Record<string, unknown> | null) {
  const items = Array.isArray(data?.trainings)
    ? data.trainings
    : Array.isArray(data?.training)
      ? data.training
      : Array.isArray(data)
        ? data
        : []

  return items.map((t: Record<string, unknown>) => ({
    id: String(t.id ?? ""),
    name: String(t.name ?? ""),
    type: String(t.training_type ?? t.type ?? ""),
    provider: String(t.provider ?? ""),
    startDate: String(t.start_date ?? t.startDate ?? ""),
    endDate: String(t.end_date ?? t.endDate ?? ""),
    status: String(t.status ?? ""),
    progress: Number(t.progress ?? 0),
    certificate: t.certificate ? String(t.certificate) : undefined,
    cost: parseFloat(String(t.cost ?? "0").replace(/[^\d.]/g, "")) || 0,
    skills: Array.isArray(t.skills) ? t.skills.map(String) : [],
  }))
}

export function mapAssets(data: Record<string, unknown> | null) {
  const items = Array.isArray(data?.assets)
    ? data.assets
    : Array.isArray(data)
      ? data
      : []

  return items.map((asset: Record<string, unknown>) => ({
    id: String(asset.id ?? ""),
    name: String(asset.name ?? ""),
    assetType: String(asset.asset_type ?? asset.assetType ?? ""),
    serialNumber: String(asset.serial_number ?? asset.serialNumber ?? ""),
    brand: String(asset.brand ?? ""),
    model: String(asset.model ?? ""),
    status: String(asset.status ?? ""),
    statusColor: asset.status_color ? String(asset.status_color) : undefined,
    condition: String(asset.condition ?? ""),
    location: String(asset.location ?? ""),
    purchaseDate: asset.purchase_date ? String(asset.purchase_date) : undefined,
    currentValue: asset.current_value != null ? Number(asset.current_value) : undefined,
  }))
}

export const PROFILE_TAB_ENDPOINTS: Record<string, string> = {
  "job-details": "job_details",
  "time-off": "time_off",
  "pay-info": "pay_info",
  documents: "documents",
  performance: "performance",
  timesheets: "timesheets",
  benefits: "benefits",
  training: "training",
  assets: "assets",
}
