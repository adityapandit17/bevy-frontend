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
import { API_ENDPOINTS, getApiUrl } from "@/lib/api"
import { useAuthContext } from "@/lib/auth"

// Backend-driven; UI will fetch roles and permissions

interface PermissionModule {
  name: string
  label: string
  icon: string
  singlePermission?: boolean
}

const permissionModules: PermissionModule[] = [
  { name: "employees", label: "Employee Management", icon: "👥" },
  { name: "payrolls", label: "Payroll", icon: "💰" },
  { name: "attendance_records", label: "Attendance", icon: "⏰" },
  { name: "leave_requests", label: "Leave Requests", icon: "🏖️" },
  { name: "leave_management", label: "Leave Management", icon: "📋", singlePermission: true },
  { name: "candidates", label: "Recruitment", icon: "🎯" },
  { name: "job_openings", label: "Job Openings", icon: "📝" },
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
  userCount?: number
  permissions?: Permission[]
}

export default function RolePermissionsEditor() {
  const { token } = useAuthContext()
  const [roles, setRoles] = useState<Role[]>([])
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
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([])

  // Load roles from backend and auto-select first
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)
        const res = await fetch(getApiUrl(API_ENDPOINTS.ROLES), { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
        const json = await res.json()
        const list: Role[] = (json.roles || []).map((r: any) => ({ id: r.id, name: r.name, description: r.description, userCount: r.user_count }))
        setRoles(list)
        if (list.length > 0) {
          await handleRoleSelect(list[0])
        }
      } catch (e) {
        toast({ title: "Error", description: "Failed to load roles", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchRoles()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Filter roles based on search term
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Build a master permission template from all roles so every possible permission is visible
  const getAllPermissionsTemplate = (): Permission[] => {
    const byName = new Map<string, Permission>()
    rolePermissions.forEach(p => {
      if (!byName.has(p.name)) byName.set(p.name, { ...p, granted: false })
    })
    return Array.from(byName.values())
  }

  // Merge selected role permissions with the master template, defaulting missing to not granted
  const getMergedPermissionsForSelectedRole = (): Permission[] => {
    return rolePermissions
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
    rolePermissions.forEach((p) => { if (p.id > maxId) maxId = p.id })
    return maxId + 1
  }

  const getDefaultPermissionsForModule = (module: string): Permission[] => {
    const moduleInfo = permissionModules.find(m => m.name === module)
    // If it's a single permission module, only return index action
    if (moduleInfo?.singlePermission) {
      return [{
        id: getNextPermissionId(),
        name: `${module}.index`,
        resource: module,
        action: "index",
        description: `Access ${moduleInfo.label || module}`,
        granted: false,
      }]
    }
    // Otherwise, return CRUD actions
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
    const existingNames = new Set((role.permissions || []).map(p => p.name))
    const merged: Permission[] = [ ...(role.permissions || []) ]
    permissionsToAdd.forEach((p) => {
      if (!existingNames.has(p.name)) merged.push(p)
    })
    return { ...role, permissions: merged }
  }

  const addDefaultPermissionsForModule = async (module: string) => {
    if (!selectedRole) return
    try {
      setLoading(true)
      const url = getApiUrl(API_ENDPOINTS.ROLE_ADD_DEFAULTS.replace('{id}', String(selectedRole.id)))
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ resource: module }) })
      if (!res.ok) throw new Error('add defaults failed')
      await handleRoleSelect(selectedRole)
    } catch (e) {
      toast({ title: "Error", description: "Failed to add default permissions", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const addCustomPermissionForModule = async () => {
    if (!selectedRole || !addPermissionForModule) return
    try {
      setLoading(true)
      const url = getApiUrl(API_ENDPOINTS.ROLE_ADD_PERMISSION.replace('{id}', String(selectedRole.id)))
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify({ resource: addPermissionForModule, action_name: newPermissionAction, description: newPermissionDescription }) })
      if (!res.ok) throw new Error('add permission failed')
      await handleRoleSelect(selectedRole)
      setAddPermissionForModule(null)
      setNewPermissionAction('index')
      setNewPermissionDescription('')
    } catch (e) {
      toast({ title: "Error", description: "Failed to add permission", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Handle permission toggle by name (adds missing permission entries if needed)
  const handlePermissionToggle = async (roleId: number, permissionName: string, permissionId?: number) => {
    if (!selectedRole) return
    try {
      setLoading(true)
      const url = getApiUrl(API_ENDPOINTS.ROLE_TOGGLE_PERMISSION.replace('{id}', String(roleId)))
      const body = permissionId ? { permission_id: permissionId } : { resource: permissionName.split('.')[0], action_name: permissionName.split('.')[1] }
      const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) })
      if (!res.ok) throw new Error('toggle failed')
      const json = await res.json()
      const toggledId = json.permission_id
      const granted = json.granted
      setRolePermissions(prev => prev.map(p => p.id === toggledId ? { ...p, granted } : p))
    } catch (e) {
      toast({ title: "Error", description: "Failed to toggle permission", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Handle role selection
  const handleRoleSelect = async (role: Role) => {
    setSelectedRole(role)
    setIsEditing(false)
    try {
      setLoading(true)
      const url = getApiUrl(API_ENDPOINTS.ROLE_PERMISSIONS_MATRIX.replace('{id}', String(role.id)))
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : undefined })
      const json = await res.json()
      const perms: Permission[] = (json.permissions || []).map((p: any) => ({ id: p.id, name: p.name, resource: p.resource, action: p.action, description: p.description, granted: !!p.granted }))
      // Debug: Check if job_openings permissions are in the response
      const jobOpeningsPerms = perms.filter(p => p.resource === 'job_openings')
      if (jobOpeningsPerms.length > 0) {
        console.log('✅ Job openings permissions found:', jobOpeningsPerms.length, jobOpeningsPerms.map(p => p.name))
      } else {
        console.warn('⚠️ No job_openings permissions in API response. Total permissions:', perms.length, 'Resources:', [...new Set(perms.map(p => p.resource))])
      }
      setRolePermissions(perms)
    } catch (e) {
      toast({ title: "Error", description: "Failed to load permissions", variant: "destructive" })
    } finally {
      setLoading(false)
    }
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

  // Get permission count for currently loaded matrix (role param unused)
  const getPermissionCount = (_role: Role) => {
    return rolePermissions.filter(p => p.granted).length
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
                        // Build modules dynamically from loaded permissions
                        const mergedAll = rolePermissions
                        const modulesFromTemplate = Array.from(new Set(mergedAll.map(p => p.resource))).sort()
                        const modulesToShow = selectedModule === "all" ? modulesFromTemplate : [selectedModule]
                        const mergedForRole = rolePermissions

                        // Debug: Log modules being rendered
                        console.log('📋 All modules from permissions:', modulesFromTemplate)
                        if (modulesFromTemplate.includes('job_openings')) {
                          console.log('✅ job_openings found in modulesFromTemplate at index:', modulesFromTemplate.indexOf('job_openings'))
                        } else {
                          console.warn('⚠️ job_openings NOT in modulesFromTemplate. Available modules:', modulesFromTemplate)
                          console.warn('⚠️ job_openings permissions in rolePermissions:', mergedAll.filter(p => p.resource === 'job_openings').map(p => p.name))
                        }

                        return modulesToShow.map((module) => {
                          const moduleInfo = permissionModules.find(m => m.name === module)
                          const isSinglePermission = moduleInfo?.singlePermission || false
                          // For single permission modules, only show the index permission (or first one if no index)
                          let permissions = mergedForRole.filter(p => p.resource === module)
                          
                          // Debug: Log job_openings module rendering
                          if (module === 'job_openings') {
                            console.log('🔍 Rendering job_openings module:', {
                              moduleInfo,
                              permissionsCount: permissions.length,
                              permissions: permissions.map(p => p.name),
                              isSinglePermission
                            })
                          }
                          
                          if (isSinglePermission) {
                            // Filter to only show index permission, or first permission if no index exists
                            const indexPermission = permissions.find(p => p.action === "index")
                            permissions = indexPermission ? [indexPermission] : (permissions.length > 0 ? [permissions[0]] : [])
                          }
                          
                          // Don't render if no permissions (shouldn't happen, but safety check)
                          if (permissions.length === 0) {
                            console.warn(`⚠️ Module ${module} has no permissions, skipping render`)
                            return null
                          }
                          
                          return (
                            <div key={module} className="border rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-lg">{moduleInfo?.icon || "📋"}</span>
                                <h4 className="font-medium text-gray-900">{moduleInfo?.label || module.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h4>
                                {!isSinglePermission && (
                                  <Badge variant="outline" className="text-xs">
                                    {permissions.filter(p => p.granted).length}/{permissions.length} granted
                                  </Badge>
                                )}
                              </div>
                              {permissions.length > 0 ? (
                                isSinglePermission ? (
                                  // Single permission display - full width, more prominent (no module header, no action name)
                                  <div className="space-y-3">
                                    {permissions.map((permission) => {
                                      // Clean description - remove any "index" references
                                      const cleanDescription = permission.description
                                        ?.replace(/^\s*index\s*/i, '')
                                        ?.replace(/\s*index\s*$/i, '')
                                        ?.replace(/\s*\(index\)\s*/i, '')
                                        ?.trim() || `Access to ${moduleInfo?.label || module} module`
                                      
                                      return (
                                        <div
                                          key={permission.name}
                                          className={`flex items-center justify-between p-4 border-2 rounded-lg transition-colors ${
                                            permission.granted 
                                              ? "border-green-300 bg-green-50 shadow-sm" 
                                              : "border-gray-200 bg-white"
                                          }`}
                                        >
                                          <div className="flex-1">
                                            <div className="flex items-center gap-3">
                                              {permission.granted ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                              ) : (
                                                <XCircle className="w-5 h-5 text-gray-400" />
                                              )}
                                              <div>
                                                <h5 className="font-semibold text-base text-gray-900">
                                                  {moduleInfo?.label || module}
                                                </h5>
                                                <p className="text-sm text-gray-600 mt-1">
                                                  {cleanDescription}
                                                </p>
                                              </div>
                                            </div>
                                          </div>
                                          {isEditing && (
                                            <Switch
                                              checked={permission.granted}
                                              onCheckedChange={() => handlePermissionToggle(selectedRole.id, permission.name, permission.id)}
                                              className="ml-4"
                                            />
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                ) : (
                                  // CRUD permissions display - grid layout
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
                                            onCheckedChange={() => handlePermissionToggle(selectedRole.id, permission.name, permission.id)}
                                          />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )
                              ) : (
                                <div className="p-4 rounded-lg border border-dashed text-sm text-gray-700 space-y-3">
                                  <div className="text-gray-600">
                                    {isSinglePermission 
                                      ? `No permission defined for ${moduleInfo?.label || module} yet.` 
                                      : "No permissions defined for this module yet."}
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    <Button variant="outline" size="sm" onClick={() => addDefaultPermissionsForModule(module)}>
                                      {isSinglePermission ? "Add permission" : "Add default permissions"}
                                    </Button>
                                    {!isSinglePermission && (
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
                                    )}
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
