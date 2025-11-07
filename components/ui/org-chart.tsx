"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Mail, 
  Phone, 
  MapPin,
  Building2,
  User,
  MoreHorizontal
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface Employee {
  id: string
  name: string
  title: string
  department: string
  email: string
  phone?: string
  location?: string
  avatar?: string
  status: "active" | "inactive"
  reportsTo?: string
  subordinates?: Employee[]
}

interface OrgChartProps {
  data: Employee[]
  onEmployeeClick?: (employee: Employee) => void
  onEditEmployee?: (employee: Employee) => void
  onViewProfile?: (employee: Employee) => void
}

interface EmployeeCardProps {
  employee: Employee
  isExpanded?: boolean
  onToggle?: () => void
  onEmployeeClick?: (employee: Employee) => void
  onEditEmployee?: (employee: Employee) => void
  onViewProfile?: (employee: Employee) => void
  hasSubordinates?: boolean
  level?: number
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  isExpanded = true,
  onToggle,
  onEmployeeClick,
  onEditEmployee,
  onViewProfile,
  hasSubordinates = false,
  level = 0
}) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="flex flex-col items-center">
      {/* Employee Card */}
      <Card 
        className={cn(
          "w-64 cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
          isHovered ? "border-primary shadow-md" : "border-gray-200",
          level === 0 ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300" : "bg-white"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onEmployeeClick?.(employee)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={employee.avatar} alt={employee.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                  {employee.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{employee.name}</h3>
                <p className="text-sm text-gray-600 truncate">{employee.title}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => onViewProfile?.(employee)}>
                  <User className="mr-2 h-4 w-4" />
                  View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEditEmployee?.(employee)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Phone className="mr-2 h-4 w-4" />
                  Contact
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{employee.department}</span>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-3 w-3" />
              <span className="truncate">{employee.email}</span>
            </div>

            {employee.location && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{employee.location}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <Badge 
                variant={employee.status === "active" ? "default" : "secondary"}
                className={cn(
                  "text-xs",
                  employee.status === "active" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {employee.status === "active" ? "Active" : "Inactive"}
              </Badge>

              {hasSubordinates && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggle?.()
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connection Line */}
      {hasSubordinates && (
        <div className="w-px h-6 bg-gray-300 my-2" />
      )}
    </div>
  )
}

const OrgChartLevel: React.FC<{
  employees: Employee[]
  level: number
  onEmployeeClick?: (employee: Employee) => void
  onEditEmployee?: (employee: Employee) => void
  onViewProfile?: (employee: Employee) => void
}> = ({ employees, level, onEmployeeClick, onEditEmployee, onViewProfile }) => {
  const [expandedEmployees, setExpandedEmployees] = useState<Set<string>>(new Set())

  const toggleEmployee = (employeeId: string) => {
    const newExpanded = new Set(expandedEmployees)
    if (newExpanded.has(employeeId)) {
      newExpanded.delete(employeeId)
    } else {
      newExpanded.add(employeeId)
    }
    setExpandedEmployees(newExpanded)
  }

  return (
    <div className="flex flex-col items-center space-y-8">
      <div className="flex items-center justify-center space-x-8">
        {employees.map((employee, index) => {
          const hasSubordinates = employee.subordinates && employee.subordinates.length > 0
          const isExpanded = expandedEmployees.has(employee.id)

          return (
            <div key={employee.id} className="flex flex-col items-center">
              <EmployeeCard
                employee={employee}
                isExpanded={isExpanded}
                onToggle={() => toggleEmployee(employee.id)}
                onEmployeeClick={onEmployeeClick}
                onEditEmployee={onEditEmployee}
                onViewProfile={onViewProfile}
                hasSubordinates={hasSubordinates}
                level={level}
              />

              {/* Subordinates */}
              {hasSubordinates && isExpanded && (
                <div className="mt-8">
                  <OrgChartLevel
                    employees={employee.subordinates || []}
                    level={level + 1}
                    onEmployeeClick={onEmployeeClick}
                    onEditEmployee={onEditEmployee}
                    onViewProfile={onViewProfile}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const OrgChart: React.FC<OrgChartProps> = ({
  data,
  onEmployeeClick,
  onEditEmployee,
  onViewProfile
}) => {
  // Find root employees (those who don't report to anyone)
  const rootEmployees = data.filter(emp => !emp.reportsTo || emp.reportsTo === undefined || emp.reportsTo === "")

  return (
    <div className="w-full overflow-auto">
      <div className="min-w-max p-8">
        {rootEmployees.length > 0 ? (
          <OrgChartLevel
            employees={rootEmployees}
            level={0}
            onEmployeeClick={onEmployeeClick}
            onEditEmployee={onEditEmployee}
            onViewProfile={onViewProfile}
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            No top-level employees found. All employees have managers assigned.
          </div>
        )}
      </div>
    </div>
  )
}

// Helper function to build hierarchical structure from flat data
export const buildOrgHierarchy = (employees: Employee[]): Employee[] => {
  const employeeMap = new Map<string, Employee>()
  const rootEmployees: Employee[] = []

  // Create a map of all employees
  employees.forEach(emp => {
    employeeMap.set(emp.id, { ...emp, subordinates: [] })
  })

  // Build the hierarchy
  employees.forEach(emp => {
    const employee = employeeMap.get(emp.id)!
    
    if (emp.reportsTo && employeeMap.has(emp.reportsTo)) {
      const manager = employeeMap.get(emp.reportsTo)!
      if (!manager.subordinates) {
        manager.subordinates = []
      }
      manager.subordinates.push(employee)
    } else {
      rootEmployees.push(employee)
    }
  })

  return rootEmployees
} 