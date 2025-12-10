"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getEndpointUrl, apiRequest } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Calculator } from "lucide-react"

interface SalaryStructureFormProps {
  onClose: () => void
  onSubmit: (payload: any) => Promise<void> | void
  employees?: any[]
  departments?: any[]
  initialData?: any
}

export function SalaryStructureForm({ onClose, onSubmit, employees = [], departments = [], initialData }: SalaryStructureFormProps) {
  const isEditMode = !!initialData
  
  const [formData, setFormData] = useState({
    employee_id: initialData?.employee_id ? String(initialData.employee_id) : "",
    department_id: initialData?.department_id ? String(initialData.department_id) : "",
    level: initialData?.level || "",
    baseSalary: initialData?.basic ? String(initialData.basic) : "",
    hra: initialData?.hra ? String(initialData.hra) : "",
    allowances: initialData?.allowances ? String(initialData.allowances) : "",
    bonus: "",
    pf: "",
    esi: "",
    professionalTax: "",
    incomeTax: "",
    effective_from: initialData?.effective_from || "",
  })
  const [departmentOptions, setDepartmentOptions] = useState<any[]>(Array.isArray(departments) ? departments : [])
  const [employeeOptions, setEmployeeOptions] = useState<any[]>(Array.isArray(employees) ? employees : [])

  useEffect(() => {
    // If the caller passed options, sync them into local state.
    setDepartmentOptions(Array.isArray(departments) ? departments : [])
    setEmployeeOptions(Array.isArray(employees) ? employees : [])

    // Fallback fetch in case options were not provided.
    if (!Array.isArray(departments) || departments.length === 0) {
      fetchDepartments()
    }
    if (!Array.isArray(employees) || employees.length === 0) {
      fetchEmployees()
    }
  }, [departments, employees])

  // When initialData or employeeOptions changes, update form data
  useEffect(() => {
    if (initialData) {
      // Get employee to fetch department_id
      const employee = employeeOptions.find(emp => String(emp.id) === String(initialData.employee_id))
      // Try to get department_id from initialData first, then from employee, or from employee's department object
      const departmentId = initialData.department_id 
        ? String(initialData.department_id) 
        : (employee?.department_id ? String(employee.department_id) : (employee?.department?.id ? String(employee.department.id) : ""))
      
      // Extract all fields from initialData - now they should all be stored in the database
      const pf = initialData.pf ? String(initialData.pf) : ""
      const esi = initialData.esi ? String(initialData.esi) : ""
      const professionalTax = initialData.professional_tax ? String(initialData.professional_tax) : ""
      const incomeTax = initialData.income_tax ? String(initialData.income_tax) : ""
      const bonus = initialData.bonus ? String(initialData.bonus) : ""
      
      setFormData(prev => {
        // Only update department if we found one and it's different from current
        const newDepartmentId = departmentId || (initialData.department_id ? String(initialData.department_id) : prev.department_id)
        
        return {
          employee_id: initialData.employee_id ? String(initialData.employee_id) : prev.employee_id,
          department_id: newDepartmentId,
          level: initialData.level || prev.level,
          baseSalary: initialData.basic ? String(initialData.basic) : prev.baseSalary,
          hra: initialData.hra ? String(initialData.hra) : prev.hra,
          allowances: initialData.allowances ? String(initialData.allowances) : prev.allowances,
          bonus: bonus || prev.bonus,
          pf: pf || prev.pf,
          esi: esi || prev.esi,
          professionalTax: professionalTax || prev.professionalTax,
          incomeTax: incomeTax || prev.incomeTax,
          effective_from: initialData.effective_from || prev.effective_from,
        }
      })
    }
  }, [initialData, employeeOptions])

  const fetchDepartments = async () => {
    try {
      const res = await fetch(getEndpointUrl('DEPARTMENTS'), {
        headers: { "Accept": "application/json" }
      })
      const data = await res.json()
      setDepartmentOptions(Array.isArray(data) ? data : [])
    } catch {
      setDepartmentOptions([])
    }
  }

  const fetchEmployees = async () => {
    try {
      const data = await apiRequest(`${getEndpointUrl('EMPLOYEES')}?per_page=500`)
      const list = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : []
      setEmployeeOptions(list)
    } catch {
      setEmployeeOptions([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      employee_id: formData.employee_id,
      department_id: formData.department_id,
      level: formData.level,
      baseSalary: formData.baseSalary,
      hra: formData.hra,
      allowances: formData.allowances,
      bonus: formData.bonus,
      pf: formData.pf,
      esi: formData.esi,
      professionalTax: formData.professionalTax,
      incomeTax: formData.incomeTax,
      effective_from: formData.effective_from,
    }
    await onSubmit(payload)
    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }
      // Auto-fill department when employee is selected
      if (field === "employee_id" && value) {
        const selectedEmployee = employeeOptions.find(emp => String(emp.id) === value)
        if (selectedEmployee && selectedEmployee.department_id) {
          updated.department_id = String(selectedEmployee.department_id)
        }
      }
      return updated
    })
  }

  const calculateTotals = () => {
    const base = Number.parseFloat(String(formData.baseSalary || "")) || 0
    const hra = Number.parseFloat(String(formData.hra || "")) || 0
    const allowances = Number.parseFloat(String(formData.allowances || "")) || 0
    const bonus = Number.parseFloat(String(formData.bonus || "")) || 0

    const pf = Number.parseFloat(String(formData.pf || "")) || 0
    const esi = Number.parseFloat(String(formData.esi || "")) || 0
    const professionalTax = Number.parseFloat(String(formData.professionalTax || "")) || 0
    const incomeTax = Number.parseFloat(String(formData.incomeTax || "")) || 0

    const grossSalary = base + hra + allowances + bonus
    const totalDeductions = pf + esi + professionalTax + incomeTax
    const netSalary = grossSalary - totalDeductions

    return { grossSalary, totalDeductions, netSalary }
  }

  const { grossSalary, totalDeductions, netSalary } = calculateTotals()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-gray-900">{isEditMode ? "Edit Salary Structure" : "Add Salary Structure"}</CardTitle>
            <CardDescription className="text-gray-600">Define compensation structure for a role</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Structure Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="employee">Employee *</Label>
                  <Select value={formData.employee_id} onValueChange={v => handleChange("employee_id", v)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(employeeOptions) && employeeOptions.map((emp) => (
                        <SelectItem key={emp.id} value={String(emp.id)}>
                          {emp.first_name} {emp.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department_id} onValueChange={v => handleChange("department_id", v)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(departmentOptions) && departmentOptions.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level">Level *</Label>
                  <Select value={formData.level} onValueChange={(value) => handleChange("level", value)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="mid-level">Mid-level</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="director">Director</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="effective_from">Effective From *</Label>
                  <Input
                    id="effective_from"
                    type="date"
                    value={formData.effective_from}
                    onChange={(e) => handleChange("effective_from", e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Earnings */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 text-green-600">Earnings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="baseSalary">Base Salary (₹/year) *</Label>
                  <Input
                    id="baseSalary"
                    type="number"
                    value={formData.baseSalary}
                    onChange={(e) => handleChange("baseSalary", e.target.value)}
                    placeholder="800000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="hra">HRA (₹/year)</Label>
                  <Input
                    id="hra"
                    type="number"
                    value={formData.hra}
                    onChange={(e) => handleChange("hra", e.target.value)}
                    placeholder="320000"
                  />
                </div>
                <div>
                  <Label htmlFor="allowances">Other Allowances (₹/year)</Label>
                  <Input
                    id="allowances"
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => handleChange("allowances", e.target.value)}
                    placeholder="120000"
                  />
                </div>
                <div>
                  <Label htmlFor="bonus">Annual Bonus (₹)</Label>
                  <Input
                    id="bonus"
                    type="number"
                    value={formData.bonus}
                    onChange={(e) => handleChange("bonus", e.target.value)}
                    placeholder="100000"
                  />
                </div>
              </div>
            </div>

            {/* Deductions */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 text-red-600">Deductions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pf">Provident Fund (₹/year)</Label>
                  <Input
                    id="pf"
                    type="number"
                    value={formData.pf}
                    onChange={(e) => handleChange("pf", e.target.value)}
                    placeholder="96000"
                  />
                </div>
                <div>
                  <Label htmlFor="esi">ESI (₹/year)</Label>
                  <Input
                    id="esi"
                    type="number"
                    value={formData.esi}
                    onChange={(e) => handleChange("esi", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="professionalTax">Professional Tax (₹/year)</Label>
                  <Input
                    id="professionalTax"
                    type="number"
                    value={formData.professionalTax}
                    onChange={(e) => handleChange("professionalTax", e.target.value)}
                    placeholder="2400"
                  />
                </div>
                <div>
                  <Label htmlFor="incomeTax">Income Tax (₹/year)</Label>
                  <Input
                    id="incomeTax"
                    type="number"
                    value={formData.incomeTax}
                    onChange={(e) => handleChange("incomeTax", e.target.value)}
                    placeholder="45000"
                  />
                </div>
              </div>
            </div>

            {/* Calculation Summary */}
            <div className="p-6 bg-gray-50 rounded-lg space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Salary Calculation</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Gross Salary</p>
                  <p className="text-2xl font-bold text-green-600">₹{grossSalary.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Total Deductions</p>
                  <p className="text-2xl font-bold text-red-600">₹{totalDeductions.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Net Salary</p>
                  <p className="text-2xl font-bold text-blue-600">₹{netSalary.toLocaleString()}</p>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600">
                <p>Monthly Net Salary: ₹{Math.round(netSalary / 12).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">
                {isEditMode ? "Update Structure" : "Create Structure"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
