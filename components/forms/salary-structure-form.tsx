"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Calculator } from "lucide-react"

interface SalaryStructureFormProps {
  onClose: () => void
}

export function SalaryStructureForm({ onClose }: SalaryStructureFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    department_id: "",
    level: "",
    baseSalary: "",
    hra: "",
    allowances: "",
    bonus: "",
    pf: "",
    esi: "",
    professionalTax: "",
    incomeTax: "",
  })
  const [departments, setDepartments] = useState([])

  useEffect(() => {
    fetchDepartments()
  }, [])

  const fetchDepartments = async () => {
    try {
      const res = await fetch("http://localhost:3000/departments", {
        headers: { "Accept": "application/json" }
      })
      const data = await res.json()
      setDepartments(data)
    } catch (err) {
      // handle error
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // send department_id instead of department
    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const calculateTotals = () => {
    const base = Number.parseFloat(formData.baseSalary) || 0
    const hra = Number.parseFloat(formData.hra) || 0
    const allowances = Number.parseFloat(formData.allowances) || 0
    const bonus = Number.parseFloat(formData.bonus) || 0

    const pf = Number.parseFloat(formData.pf) || 0
    const esi = Number.parseFloat(formData.esi) || 0
    const professionalTax = Number.parseFloat(formData.professionalTax) || 0
    const incomeTax = Number.parseFloat(formData.incomeTax) || 0

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
            <CardTitle className="text-gray-900">Add Salary Structure</CardTitle>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">Structure Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., Software Engineer - L2"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department_id} onValueChange={v => handleChange("department_id", v)} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={String(dept.id)}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="level">Level *</Label>
                  <Select onValueChange={(value) => handleChange("level", value)}>
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
                Create Structure
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
