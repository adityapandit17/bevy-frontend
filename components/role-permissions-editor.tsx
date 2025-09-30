"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  Users, 
  Shield, 
  Edit, 
  Save, 
  X, 
  Plus, 
  Search, 
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings,
  UserCheck,
  Lock,
  Unlock
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

// Mock data - this will be replaced with actual API calls
const mockRoles = [
  {
    id: 1,
    name: "Super Admin",
    description: "Full system access with all permissions",
    userCount: 2,
    permissions: [
      { id: 1, name: "employees.index", resource: "employees", action: "index", description: "View employees list", granted: true },
      { id: 2, name: "employees.create", resource: "employees", action: "create", description: "Create new employees", granted: true },
      { id: 3, name: "employees.update", resource: "employees", action: "update", description: "Update employee information", granted: true },
      { id: 4, name: "employees.destroy", resource: "employees", action: "destroy", description: "Delete employees", granted: true },
      { id: 5, name: "payrolls.index", resource: "payrolls", action: "index", description: "View payroll list", granted: true },
      { id: 6, name: "payrolls.create", resource: "payrolls", action: "create", description: "Create payroll records", granted: true },
      { id: 7, name: "permissions.index", resource: "permissions", action: "index", description: "View permissions list", granted: true },
      { id: 8, name: "permissions.update", resource: "permissions", action: "update", description: "Update permissions", granted: true },
    ]
  },
  {
    id: 2,
    name: "HR Manager",
    description: "Human resources management and employee oversight",
    userCount: 5,
    permissions: [
      { id: 1, name: "employees.index", resource: "employees", action: "index", description: "View employees list", granted: true },
      { id: 2, name: "employees.create", resource: "employees", action: "create", description: "Create new employees", granted: true },
      { id: 3, name: "employees.update", resource: "employees", action: "update", description: "Update employee information", granted: true },
      { id: 4, name: "employees.destroy", resource: "employees", action: "destroy", description: "Delete employees", granted: false },
      { id: 5, name: "payrolls.index", resource: "payrolls", action: "index", description: "View payroll list", granted: true },
      { id: 6, name: "payrolls.create", resource: "payrolls", action: "create", description: "Create payroll records", granted: true },
      { id: 7, name: "permissions.index", resource: "permissions", action: "index", description: "View permissions list", granted: false },
      { id: 8, name: "permissions.update", resource: "permissions", action: "update", description: "Update permissions", granted: false },
    ]
  },
  {
    id: 3,
    name: "Department Head",
    description: "Team management and department oversight",
    userCount: 12,
    permissions: [
      { id: 1, name: "employees.index", resource: "employees", action: "index", description: "View employees list", granted: true },
      { id: 2, name: "employees.create", resource: "employees", action: "create", description: "Create new employees", granted: false },
      { id: 3, name: "employees.update", resource: "employees", action: "update", description: "Update employee information", granted: true },
      { id: 4, name: "employees.destroy", resource: "employees", action: "destroy", description: "Delete employees", granted: false },
      { id: 5, name: "payrolls.index", resource: "payrolls", action: "index", description: "View payroll list", granted: false },
      { id: 6, name: "payrolls.create", resource: "payrolls", action: "create", description: "Create payroll records", granted: false },
      { id: 7, name: "permissions.index", resource: "permissions", action: "index", description: "View permissions list", granted: false },
      { id: 8, name: "permissions.update", resource: "permissions", action: "update", description: "Update permissions", granted: false },
    ]
  },
  {
    id: 4,
    name: "Employee",
    description: "Basic employee access and self-service portal",
    userCount: 229,
    permissions: [
      { id: 1, name: "employees.index", resource: "employees", action: "index", description: "View employees list", granted: false },
      { id: 2, name: "employees.create", resource: "employees", action: "create", description: "Create new employees", granted: false },
      { id: 3, name: "employees.update", resource: "employees", action: "update", description: "Update employee information", granted: false },
      { id: 4, name: "employees.destroy", resource: "employees", action: "destroy", description: "Delete employees", granted: false },
      { id: 5, name: "payrolls.index", resource: "payrolls", action: "index", description: "View payroll list", granted: false },
      { id: 6, name: "payrolls.create", resource: "payrolls", action: "create", description: "Create payroll records", granted: false },
      { id: 7, name: "permissions.index", resource: "permissions", action: "index", description: "View permissions list", granted: false },
      { id: 8, name: "permissions.update", resource: "permissions", action: "update", description: "Update permissions", granted: false },
    ]
  }
]

const permissionModules = [
  { name: "employees", label: "Employee Management", icon: "👥" },
  { name: "payrolls", label: "Payroll", icon: "💰" },
  { name: "attendance_records", label: "Attendance", icon: "⏰" },
  { name: "leave_requests", label: "Leave Management", icon: "🏖️" },
  { name: "candidates", label: "Recruitment", icon: "🎯" },
  { name: "interviews", label: "Interviews", icon: "💼" },
  { name: "performance_reviews", label: "Performance", icon: "📊" },
  { name: "assets", label: "Asset Management", icon: "🏢" },
  { name: "reports", label: "Reports", icon: "📈" },
  { name: "users", label: "User Management", icon: "👤" },
  { name: "roles", label: "Role Management", icon: "🔐" },
  { name: "permissions", label: "Permissions", icon: "⚙️" },
  { name: "settings", label: "System Settings", icon: "🔧" }
]

interface Permission {
  id: number
  name: string
  resource: string
  action: string
  description: string
  granted: boolean
}

interface Role {
  id: number
  name: string
  description: string
  userCount: number
  permissions: Permission[]
}

export default function RolePermissionsEditor() {
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedModule, setSelectedModule] = useState<string>("all")
  const [loading, setLoading] = useState(false)
  const [showCreateRole, setShowCreateRole] = useState(false)
  const [newRole, setNewRole] = useState({ name: "", description: "" })
  const [addPermissionForModule, setAddPermissionForModule] = useState<string | null>(null)
  const [newPermissionAction, setNewPermissionAction] = useState<string>("index")
  const [newPermissionDescription, setNewPermissionDescription] = useState<string>("")

  // Auto-select first role on load for better UX
  useEffect(() => {
    if (!selectedRole && roles.length > 0) {
      setSelectedRole(roles[0])
    }
  }, [roles, selectedRole])

  // Filter roles based on search term
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Build a master permission template from all roles so every possible permission is visible
  const getAllPermissionsTemplate = (): Permission[] => {
    const nameToPermission = new Map<string, Permission>()
    roles.forEach(role => {
      role.permissions.forEach(p => {
        if (!nameToPermission.has(p.name)) {
          nameToPermission.set(p.name, { ...p, granted: false })
        }
      })
    })
    return Array.from(nameToPermission.values())
  }

  // Merge selected role permissions with the master template, defaulting missing to not granted
  const getMergedPermissionsForSelectedRole = (): Permission[] => {
    if (!selectedRole) return []
    const template = getAllPermissionsTemplate()
    const byName = new Map(selectedRole.permissions.map(p => [p.name, p]))
    return template.map(base => byName.get(base.name) || base)
  }

  // Group permissions by module
  const getPermissionsByModule = (permissions: Permission[]) => {
    const grouped: { [key: string]: Permission[] } = {}
    permissions.forEach(permission => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = []
      }
      grouped[permission.resource].push(permission)
    })
    return grouped
  }

  // Get filtered permissions based on selected module
  const getFilteredPermissions = (permissions: Permission[]) => {
    if (selectedModule === "all") return permissions
    return permissions.filter(p => p.resource === selectedModule)
  }

  // Helpers to add permissions dynamically
  const getNextPermissionId = (): number => {
    let maxId = 0
    roles.forEach(r => r.permissions.forEach(p => { if (p.id > maxId) maxId = p.id }))
    return maxId + 1
  }

  const getDefaultPermissionsForModule = (module: string): Permission[] => {
    const actions = ["index", "create", "update", "destroy"] as const
    return actions.map((action, idx) => ({
      id: getNextPermissionId() + idx,
      name: `${module}.${action}`,
      resource: module,
      action,
      description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.replace('_', ' ')}`,
      granted: false,
    }))
  }

  const upsertPermissionsForRole = (role: Role, permissionsToAdd: Permission[]): Role => {
    const existingNames = new Set(role.permissions.map(p => p.name))
    const merged = [...role.permissions]
    permissionsToAdd.forEach(p => {
      if (!existingNames.has(p.name)) merged.push(p)
    })
    return { ...role, permissions: merged }
  }

  const addDefaultPermissionsForModule = (module: string) => {
    if (!selectedRole) return
    const defaults = getDefaultPermissionsForModule(module)
    const updatedRole = upsertPermissionsForRole(selectedRole, defaults)
    setRoles(prev => prev.map(r => (r.id === updatedRole.id ? updatedRole : r)))
    setSelectedRole(updatedRole)
  }

  const addCustomPermissionForModule = () => {
    if (!selectedRole || !addPermissionForModule) return
    const name = `${addPermissionForModule}.${newPermissionAction}`
    const exists = selectedRole.permissions.some(p => p.name === name)
    const perm: Permission = {
      id: getNextPermissionId(),
      name,
      resource: addPermissionForModule,
      action: newPermissionAction,
      description: newPermissionDescription || `${newPermissionAction} ${addPermissionForModule.replace('_', ' ')}`,
      granted: false,
    }
    const updatedRole = exists ? selectedRole : upsertPermissionsForRole(selectedRole, [perm])
    setRoles(prev => prev.map(r => (r.id === updatedRole.id ? updatedRole : r)))
    setSelectedRole(updatedRole)
    setAddPermissionForModule(null)
    setNewPermissionAction("index")
    setNewPermissionDescription("")
  }

  // Handle permission toggle by name (adds missing permission entries if needed)
  const handlePermissionToggle = (roleId: number, permissionName: string) => {
    setRoles(prevRoles =>
      prevRoles.map(role =>
        role.id === roleId
          ? {
              ...role,
              permissions: (() => {
                const existing = role.permissions.find(p => p.name === permissionName)
                if (existing) {
                  return role.permissions.map(permission =>
                    permission.name === permissionName
                      ? { ...permission, granted: !permission.granted }
                      : permission
                  )
                }
                // Add missing permission using template default, toggled to granted=true
                const template = getAllPermissionsTemplate().find(p => p.name === permissionName)
                if (template) {
                  return [
                    ...role.permissions,
                    { ...template, granted: true },
                  ]
                }
                return role.permissions
              })()
            }
          : role
      )
    )

    // Update selected role if it's the one being edited
    if (selectedRole && selectedRole.id === roleId) {
      setSelectedRole(prev => {
        if (!prev) return null
        const exists = prev.permissions.some(p => p.name === permissionName)
        if (exists) {
          return {
            ...prev,
            permissions: prev.permissions.map(permission =>
              permission.name === permissionName
                ? { ...permission, granted: !permission.granted }
                : permission
            )
          }
        }
        const template = getAllPermissionsTemplate().find(p => p.name === permissionName)
        if (template) {
          return {
            ...prev,
            permissions: [
              ...prev.permissions,
              { ...template, granted: true },
            ]
          }
        }
        return prev
      })
    }
  }

  // Handle role selection
  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role)
    setIsEditing(false)
  }

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!selectedRole) return

    setLoading(true)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Success",
        description: `Permissions updated for ${selectedRole.name}`,
      })
      
      setIsEditing(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle create new role
  const handleCreateRole = async () => {
    if (!newRole.name.trim()) return

    setLoading(true)
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const role: Role = {
        id: roles.length + 1,
        name: newRole.name,
        description: newRole.description,
        userCount: 0,
        permissions: mockRoles[0].permissions.map(p => ({ ...p, granted: false }))
      }

      setRoles(prev => [...prev, role])
      setNewRole({ name: "", description: "" })
      setShowCreateRole(false)
      
      toast({
        title: "Success",
        description: `Role "${role.name}" created successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create role",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Get permission count for a role
  const getPermissionCount = (role: Role) => {
    const template = getAllPermissionsTemplate()
    const byName = new Map(role.permissions.map(p => [p.name, p]))
    return template
      .map(base => byName.get(base.name) || base)
      .filter(p => p.granted).length
  }

  // Get total permissions count
  const getTotalPermissions = () => {
    return getAllPermissionsTemplate().length
  }

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Role Permissions</h1>
          <p className="text-gray-600">Manage user roles and their access permissions</p>
        </div>
        <Dialog open={showCreateRole} onOpenChange={setShowCreateRole}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>
                Create a new role with custom permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role-name">Role Name</Label>
                <Input
                  id="role-name"
                  value={newRole.name}
                  onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter role name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role-description">Description</Label>
                <Textarea
                  id="role-description"
                  value={newRole.description}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter role description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateRole(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRole} disabled={loading || !newRole.name.trim()}>
                  {loading ? "Creating..." : "Create Role"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Roles
              </CardTitle>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search roles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredRoles.map((role) => (
                <div
                  key={role.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRole?.id === role.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleRoleSelect(role)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{role.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {role.userCount} users
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {getPermissionCount(role)}/{getTotalPermissions()} permissions
                        </Badge>
                      </div>
                    </div>
                    {selectedRole?.id === role.id && (
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <Badge variant="default" className="text-xs">
                            <Edit className="w-3 h-3 mr-1" />
                            Editing
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Selected
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Role Details & Permissions */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      {selectedRole.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {selectedRole.description}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button onClick={handleSaveChanges} disabled={loading}>
                          <Save className="w-4 h-4 mr-2" />
                          {loading ? "Saving..." : "Save Changes"}
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => setIsEditing(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Permissions
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="permissions" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="users">Users ({selectedRole.userCount})</TabsTrigger>
                    <TabsTrigger value="details">Role Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="permissions" className="space-y-4">
                    {/* Module Filter */}
                    <div className="flex items-center gap-4">
                      <Label>Filter by module:</Label>
                      <Select value={selectedModule} onValueChange={setSelectedModule}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Modules</SelectItem>
                          {permissionModules.map((module) => (
                            <SelectItem key={module.name} value={module.name}>
                              {module.icon} {module.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Permissions Grid */}
                    <div className="space-y-4">
                      {(() => {
                        // Build modules dynamically from the merged template
                        const mergedAll = getAllPermissionsTemplate()
                        const modulesFromTemplate = Array.from(new Set(mergedAll.map(p => p.resource)))
                        const modulesToShow = selectedModule === "all" ? modulesFromTemplate : [selectedModule]
                        const mergedForRole = getMergedPermissionsForSelectedRole()

                        return modulesToShow.map((module) => {
                          const moduleInfo = permissionModules.find(m => m.name === module)
                          const permissions = mergedForRole.filter(p => p.resource === module)
                          return (
                            <div key={module} className="border rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">{moduleInfo?.icon}</span>
                                <h4 className="font-medium text-gray-900">{moduleInfo?.label || module}</h4>
                                <Badge variant="outline" className="text-xs">
                                  {permissions.filter(p => p.granted).length}/{permissions.length} granted
                                </Badge>
                              </div>
                              {permissions.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {permissions.map((permission) => (
                                    <div
                                      key={permission.name}
                                      className={`flex items-center justify-between p-3 border rounded-lg ${
                                        permission.granted ? "border-green-200 bg-green-50" : "border-gray-200"
                                      }`}
                                    >
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                          <h5 className="font-medium text-sm text-gray-900">
                                            {permission.action.charAt(0).toUpperCase() + permission.action.slice(1)}
                                          </h5>
                                          {permission.granted ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                          ) : (
                                            <XCircle className="w-4 h-4 text-gray-400" />
                                          )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                                      </div>
                                      {isEditing && (
                                        <Switch
                                          checked={permission.granted}
                                          onCheckedChange={() => handlePermissionToggle(selectedRole.id, permission.name)}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="p-4 rounded-lg border border-dashed text-sm text-gray-700 space-y-3">
                                  <div className="text-gray-600">No permissions defined for this module yet.</div>
                                  <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" size="sm" onClick={() => addDefaultPermissionsForModule(module)}>
                                      Add default permissions
                                    </Button>
                                    <Dialog open={addPermissionForModule === module} onOpenChange={(open) => setAddPermissionForModule(open ? module : null)}>
                                      <DialogTrigger asChild>
                                        <Button variant="outline" size="sm">Add custom permission</Button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>Add Permission</DialogTitle>
                                          <DialogDescription>
                                            Create a permission for the {module} module
                                          </DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                          <div className="space-y-2">
                                            <Label>Action</Label>
                                            <Select value={newPermissionAction} onValueChange={setNewPermissionAction}>
                                              <SelectTrigger className="w-full">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="index">Index (read/list)</SelectItem>
                                                <SelectItem value="create">Create</SelectItem>
                                                <SelectItem value="update">Update</SelectItem>
                                                <SelectItem value="destroy">Destroy</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                          <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input
                                              placeholder="Optional description"
                                              value={newPermissionDescription}
                                              onChange={(e) => setNewPermissionDescription(e.target.value)}
                                            />
                                          </div>
                                          <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setAddPermissionForModule(null)}>Cancel</Button>
                                            <Button onClick={addCustomPermissionForModule}>Add</Button>
                                          </div>
                                        </div>
                                      </DialogContent>
                                    </Dialog>
                                  </div>
                                </div>
                              )}
                            </div>
                          )
                        })
                      })()}
                    </div>

                    {/* Permission Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">Permission Summary</h4>
                          <p className="text-sm text-gray-500">
                            {getPermissionCount(selectedRole)} of {getTotalPermissions()} permissions granted
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {Math.round((getPermissionCount(selectedRole) / getTotalPermissions()) * 100)}%
                          </div>
                          <p className="text-xs text-gray-500">Access Level</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="users" className="space-y-4">
                    <div className="text-center py-8">
                      <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Users with this role</h3>
                      <p className="text-gray-500 mb-4">
                        {selectedRole.userCount} users currently have the {selectedRole.name} role
                      </p>
                      <Button variant="outline">
                        View All Users
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Role Name</Label>
                        <p className="text-gray-900">{selectedRole.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <p className="text-gray-900">{selectedRole.description}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">User Count</Label>
                        <p className="text-gray-900">{selectedRole.userCount} users</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">Permissions</Label>
                        <p className="text-gray-900">
                          {getPermissionCount(selectedRole)} of {getTotalPermissions()} permissions granted
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Role</h3>
                <p className="text-gray-500">
                  Choose a role from the list to view and edit its permissions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
