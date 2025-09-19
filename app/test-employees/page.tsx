"use client"

import { useEffect, useState } from "react"
import { getEndpointUrl } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Employee {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  department_id: number
  designation: string
  date_of_joining: string
  status: string
  created_at: string
  updated_at: string
  date_of_birth?: string
}

interface Department {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export default function TestEmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [employeesRes, departmentsRes] = await Promise.all([
        fetch(getEndpointUrl('EMPLOYEES')),
        fetch(getEndpointUrl('DEPARTMENTS'))
      ])

      const employeesData = await employeesRes.json()
      const departmentsData = await departmentsRes.json()

      setEmployees(employeesData)
      setDepartments(departmentsData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Generate dynamic department stats
  const departmentStats = departments.map((dept, index) => {
    const count = employees.filter(emp => emp.department_id === dept.id).length
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", 
      "bg-orange-500", "bg-pink-500", "bg-indigo-500", 
      "bg-red-500", "bg-yellow-500"
    ]
    return {
      name: dept.name,
      count: count,
      color: colors[index % colors.length]
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Loading Employee Data...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dynamic Employee Data Test</h1>
        
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{employees.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Departments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{departments.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Active Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                {employees.filter(emp => emp.status === 'active' || emp.status === 'Active').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Department Statistics */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Department Statistics (Dynamic)</CardTitle>
            <CardDescription>
              Real-time data from the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {departmentStats.map((dept, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${dept.color}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{dept.name}</p>
                    <p className="text-lg font-bold text-gray-700">{dept.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Details */}
        <Card>
          <CardHeader>
            <CardTitle>Department Details</CardTitle>
            <CardDescription>
              Complete list of departments and their employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departments.map((dept) => {
                const deptEmployees = employees.filter(emp => emp.department_id === dept.id)
                return (
                  <div key={dept.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{dept.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {deptEmployees.length} employee{deptEmployees.length !== 1 ? 's' : ''}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {deptEmployees.map((emp) => (
                        <div key={emp.id} className="text-sm bg-gray-50 p-2 rounded">
                          <p className="font-medium">{emp.first_name} {emp.last_name}</p>
                          <p className="text-gray-600">{emp.designation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
