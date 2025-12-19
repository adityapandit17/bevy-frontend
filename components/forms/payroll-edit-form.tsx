"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

interface PayrollEditFormProps {
  payroll: any
  month: string
  onSave: (data: any) => Promise<void>
  onCancel: () => void
}

export function PayrollEditForm({ payroll, month, onSave, onCancel }: PayrollEditFormProps) {
  const [formData, setFormData] = useState({
    gross_salary: payroll?.gross_salary || 0,
    net_salary: payroll?.net_salary || 0,
    leave_deduction: payroll?.leave_deduction || 0,
    unpaid_days: payroll?.unpaid_days || 0,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (payroll) {
      setFormData({
        gross_salary: payroll.gross_salary || 0,
        net_salary: payroll.net_salary || 0,
        leave_deduction: payroll.leave_deduction || 0,
        unpaid_days: payroll.unpaid_days || 0,
      })
    }
  }, [payroll])

  const handleChange = (field: string, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setFormData((prev) => {
      const updated = { ...prev, [field]: numValue }
      
      // Auto-calculate net salary if gross or leave deduction changes
      if (field === "gross_salary" || field === "leave_deduction") {
        // Net = Gross - Leave Deduction (statutory deductions are already included in gross calculation)
        updated.net_salary = Math.max(0, updated.gross_salary - updated.leave_deduction)
      }
      
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        ...payroll,
        ...formData,
      })
    } finally {
      setSaving(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="gross_salary">Gross Salary (₹)</Label>
            <Input
              id="gross_salary"
              type="number"
              step="0.01"
              value={formData.gross_salary}
              onChange={(e) => handleChange("gross_salary", e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Total earnings before deductions. Changes will adjust allowances only (basic salary remains locked).</p>
          </div>
          
          <div>
            <Label htmlFor="leave_deduction">Leave Deduction (₹)</Label>
            <Input
              id="leave_deduction"
              type="number"
              step="0.01"
              value={formData.leave_deduction}
              onChange={(e) => handleChange("leave_deduction", e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Deduction for unpaid days/leaves</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="unpaid_days">Unpaid Days</Label>
            <Input
              id="unpaid_days"
              type="number"
              step="0.1"
              value={formData.unpaid_days}
              onChange={(e) => handleChange("unpaid_days", e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Number of unpaid days</p>
          </div>
          
          <div>
            <Label htmlFor="net_salary">Net Salary (₹)</Label>
            <Input
              id="net_salary"
              type="number"
              step="0.01"
              value={formData.net_salary}
              onChange={(e) => handleChange("net_salary", e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Final payable amount (auto-calculated)</p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Gross Salary:</span>
              <span className="font-medium">{formatCurrency(formData.gross_salary)}</span>
            </div>
            <div className="flex justify-between text-red-600">
              <span>Leave Deduction:</span>
              <span className="font-medium">-{formatCurrency(formData.leave_deduction)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-lg">
              <span className="font-semibold">Net Salary:</span>
              <span className="font-bold text-green-600">{formatCurrency(formData.net_salary)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}

