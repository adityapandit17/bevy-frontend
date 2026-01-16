"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Activity,
  Database,
  Shield,
  Users,
  HardDrive,
  Cpu,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  Server,
  Lock,
  RefreshCw,
} from "lucide-react"
import { useAuthContext } from "@/lib/auth"
import { apiRequest, getApiUrl } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface DashboardStats {
  total_users: number
  active_users: number
  total_employees: number
  total_roles: number
  total_permissions: number
  recent_logins: number
  system_uptime: string
  database_size: string
  last_backup: string | null
}

interface SystemHealth {
  database: { status: string; message: string }
  redis: { status: string; message: string }
  storage: { status: string; message: string }
  memory: { status: string; message: string }
  cpu: { status: string; message: string }
  disk_space: { status: string; message: string }
  overall_status: string
}

export default function SuperAdminDashboard() {
  const { checkRole } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [systemLogs, setSystemLogs] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!checkRole("Super Admin")) {
      return
    }
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Load dashboard stats
      const statsResponse = await apiRequest<{ stats: DashboardStats; recent_activities: any[]; system_alerts: any[] }>(
        getApiUrl("super_admin/dashboard")
      )
      setStats(statsResponse.stats)

      // Load system health
      try {
        const healthResponse = await apiRequest<{ health_status: SystemHealth; overall_status: string; recommendations: any[] }>(
          getApiUrl("super_admin/system_health")
        )
        setHealth({
          ...healthResponse.health_status,
          overall_status: healthResponse.overall_status,
        })
      } catch (error) {
        console.error("Failed to load system health:", error)
      }

      // Load system logs
      try {
        const logsResponse = await apiRequest<{ logs: any[] }>(
          getApiUrl("super_admin/system_logs?limit=50")
        )
        setSystemLogs(logsResponse.logs || [])
      } catch (error) {
        console.error("Failed to load system logs:", error)
      }
    } catch (error: any) {
      console.error("Failed to load dashboard data:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to load dashboard data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "healthy":
      case "ok":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "error":
      case "critical":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getHealthStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "healthy":
      case "ok":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "error":
      case "critical":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Activity className="h-5 w-5 text-gray-500" />
    }
  }

  if (!checkRole("Super Admin")) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need Super Admin role to access this page</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">System overview and management</p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.active_users || 0} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employees</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.total_employees || 0}</div>
                <p className="text-xs text-muted-foreground">Total employees</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Roles & Permissions</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.total_roles || 0} / {stats?.total_permissions || 0}
                </div>
                <p className="text-xs text-muted-foreground">Roles / Permissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Logins</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.recent_logins || 0}</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>
          </div>

          {/* System Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="text-sm font-medium">{stats?.system_uptime || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Database Size</span>
                  <span className="text-sm font-medium">{stats?.database_size || "Unknown"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Backup</span>
                  <span className="text-sm font-medium">
                    {stats?.last_backup || "Never"}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("health")}>
                  <Activity className="h-4 w-4 mr-2" />
                  View System Health
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("logs")}>
                  <FileText className="h-4 w-4 mr-2" />
                  View System Logs
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => setActiveTab("settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Health Status</CardTitle>
                {health && (
                  <Badge
                    variant={health.overall_status === "healthy" ? "default" : "destructive"}
                    className="flex items-center gap-2"
                  >
                    {getHealthStatusIcon(health.overall_status)}
                    {health.overall_status || "Unknown"}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {health ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      <span className="font-medium">Database</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getHealthStatusIcon(health.database?.status)}
                      <span className={getHealthStatusColor(health.database?.status)}>
                        {health.database?.status || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      <span className="font-medium">Redis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getHealthStatusIcon(health.redis?.status)}
                      <span className={getHealthStatusColor(health.redis?.status)}>
                        {health.redis?.status || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5" />
                      <span className="font-medium">Storage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getHealthStatusIcon(health.storage?.status)}
                      <span className={getHealthStatusColor(health.storage?.status)}>
                        {health.storage?.status || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-5 w-5" />
                      <span className="font-medium">CPU</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getHealthStatusIcon(health.cpu?.status)}
                      <span className={getHealthStatusColor(health.cpu?.status)}>
                        {health.cpu?.status || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      <span className="font-medium">Memory</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getHealthStatusIcon(health.memory?.status)}
                      <span className={getHealthStatusColor(health.memory?.status)}>
                        {health.memory?.status || "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <HardDrive className="h-5 w-5" />
                      <span className="font-medium">Disk Space</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getHealthStatusIcon(health.disk_space?.status)}
                      <span className={getHealthStatusColor(health.disk_space?.status)}>
                        {health.disk_space?.status || "Unknown"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Health data not available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Recent system activity and errors</CardDescription>
            </CardHeader>
            <CardContent>
              {systemLogs.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {systemLogs.map((log, index) => (
                    <div
                      key={index}
                      className="p-3 border rounded-lg text-sm font-mono"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold">{log.level || "INFO"}</span>
                        <span className="text-xs text-muted-foreground">
                          {log.timestamp || log.created_at || "Unknown time"}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{log.message || JSON.stringify(log)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No logs available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Manage system configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Security Settings</h3>
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="h-4 w-4 mr-2" />
                  Configure Security Settings
                </Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Database Management</h3>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="h-4 w-4 mr-2" />
                  Manage Database
                </Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Backup & Restore</h3>
                <Button variant="outline" className="w-full justify-start">
                  <HardDrive className="h-4 w-4 mr-2" />
                  Backup & Restore
                </Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Maintenance Mode</h3>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Maintenance Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
