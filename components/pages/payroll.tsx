"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Download, Play, MoreHorizontal, Calculator, FileText, CreditCard } from "lucide-react"
import { SalaryStructureForm } from "@/components/forms/salary-structure-form"

const payrollRuns = [
  {
    id: 1,
    period: "December 2024",
    status: "Processing",
    employees: 1247,
    totalAmount: "₹2,45,00,000",
    processedDate: null,
    dueDate: "2024-12-28",
  },
  {
    id: 2,
    period: "November 2024",
    status: "Completed",
    employees: 1245,
    totalAmount: "₹2,42,00,000",
    processedDate: "2024-11-30",
    dueDate: "2024-11-28",
  },
  {
    id: 3,
    period: "October 2024",
    status: "Completed",
    employees: 1240,
    totalAmount: "₹2,38,00,000",
    processedDate: "2024-10-31",
    dueDate: "2024-10-28",
  },
]

const salaryStructures = [
  {
    id: 1,
    name: "Software Engineer - L1",
    department: "Engineering",
    level: "Junior",
    baseSalary: "₹8,00,000",
    hra: "₹3,20,000",
    allowances: "₹1,20,000",
    pf: "₹96,000",
    tax: "₹45,000",
    netSalary: "₹10,99,000",
    employees: 45,
  },
  {
    id: 2,
    name: "Software Engineer - L2",
    department: "Engineering",
    level: "Mid-level",
    baseSalary: "₹12,00,000",
    hra: "₹4,80,000",
    allowances: "₹1,80,000",
    pf: "₹1,44,000",
    tax: "₹1,20,000",
    netSalary: "₹15,96,000",
    employees: 32,
  },
  {
    id: 3,
    name: "Product Manager",
    department: "Product",
    level: "Senior",
    baseSalary: "₹18,00,000",
    hra: "₹7,20,000",
    allowances: "₹2,70,000",
    pf: "₹2,16,000",
    tax: "₹2,85,000",
    netSalary: "₹22,89,000",
    employees: 8,
  },
]

const taxSettings = [
  { component: "Professional Tax", rate: "₹200/month", applicable: "All employees" },
  { component: "TDS", rate: "As per IT Act", applicable: "Salary > ₹2.5L" },
  { component: "PF", rate: "12% of Basic", applicable: "All employees" },
  { component: "ESI", rate: "0.75% of Gross", applicable: "Salary < ₹21K" },
]

export function PayrollPage() {
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState("payroll")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll Management</h1>
          <p className="text-gray-600 mt-1">Process payroll and manage salary structures</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50 bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export Reports
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Salary Structure
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Payroll Runs
          </TabsTrigger>
          <TabsTrigger value="structures" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Salary Structures
          </TabsTrigger>
          <TabsTrigger value="slips" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Salary Slips
          </TabsTrigger>
          <TabsTrigger value="tax" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Tax Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payroll" className="space-y-6">
          <div className="grid gap-6">
            {payrollRuns.map((run) => (
              <Card key={run.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-gray-900">{run.period}</h3>
                        <Badge
                          className={
                            run.status === "Completed"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : run.status === "Processing"
                                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                          }
                        >
                          {run.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="text-gray-500">Employees</p>
                          <p className="font-medium text-gray-900">{run.employees}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Amount</p>
                          <p className="font-medium text-gray-900">{run.totalAmount}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Due Date</p>
                          <p className="font-medium text-gray-900">{run.dueDate}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Processed</p>
                          <p className="font-medium text-gray-900">{run.processedDate || "In Progress"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      {run.status === "Processing" && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Play className="w-4 h-4 mr-2" />
                          Complete Processing
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 bg-transparent">
                        View Details
                      </Button>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="structures" className="space-y-6">
          <div className="grid gap-6">
            {salaryStructures.map((structure) => (
              <Card key={structure.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{structure.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {structure.department}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {structure.level}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Base Salary</p>
                          <p className="font-medium text-gray-900">{structure.baseSalary}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">HRA</p>
                          <p className="font-medium text-gray-900">{structure.hra}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Allowances</p>
                          <p className="font-medium text-gray-900">{structure.allowances}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">PF Deduction</p>
                          <p className="font-medium text-red-600">-{structure.pf}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Tax Deduction</p>
                          <p className="font-medium text-red-600">-{structure.tax}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Net Salary</p>
                          <p className="font-semibold text-green-600">{structure.netSalary}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          {structure.employees} employees
                        </Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="slips" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Generate Salary Slips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Salary Slip Generator</h3>
                  <p className="text-gray-600 mb-4">Generate and download salary slips for employees</p>
                  <div className="flex gap-2 justify-center">
                    <Button className="bg-green-600 hover:bg-green-700">Generate All Slips</Button>
                    <Button variant="outline" className="border-gray-200 text-gray-600 bg-transparent">
                      Generate Individual
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax" className="space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-gray-900">Tax & Deduction Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {taxSettings.map((setting, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900">{setting.component}</h3>
                      <p className="text-sm text-gray-600">{setting.applicable}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{setting.rate}</p>
                      <Button variant="outline" size="sm" className="mt-2 border-gray-200 text-gray-600 bg-transparent">
                        Configure
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showForm && <SalaryStructureForm onClose={() => setShowForm(false)} />}
    </div>
  )
}
