"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Play } from "lucide-react"
import RolePermissionsEditor from "@/components/role-permissions-editor"
import { DemoRouteGuard } from "@/components/demo-route-guard"

export default function RolePermissionsDemo() {
  const [showDemo, setShowDemo] = useState(false)

  return (
    <DemoRouteGuard>
      {!showDemo ? (
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Role Permissions UI Demo</h1>
                <p className="text-sm text-gray-500">Interactive demonstration of the role permissions management interface</p>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Introduction */}
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Role Permissions Management Demo
              </CardTitle>
              <CardDescription>
                Experience the complete role and permissions management interface with interactive features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Features Included:</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">✓</Badge>
                      Role selection and management
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">✓</Badge>
                      Permission toggles with visual feedback
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">✓</Badge>
                      Module-based permission filtering
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">✓</Badge>
                      Create new roles functionality
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">✓</Badge>
                      Permission summary and statistics
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">✓</Badge>
                      Responsive design for all devices
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900">Available Roles:</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">Super Admin</h4>
                        <p className="text-xs text-gray-500">Full system access</p>
                      </div>
                      <Badge variant="default" className="text-xs">2 users</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">HR Manager</h4>
                        <p className="text-xs text-gray-500">HR operations</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">5 users</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">Department Head</h4>
                        <p className="text-xs text-gray-500">Team management</p>
                      </div>
                      <Badge variant="outline" className="text-xs">12 users</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-sm">Employee</h4>
                        <p className="text-xs text-gray-500">Basic access</p>
                      </div>
                      <Badge variant="outline" className="text-xs">229 users</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">Ready to explore?</h4>
                    <p className="text-sm text-gray-500">
                      Click the button below to launch the interactive demo
                    </p>
                  </div>
                  <Button onClick={() => setShowDemo(true)} size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    Launch Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integration Notes</CardTitle>
              <CardDescription>
                This UI is ready to be connected to your backend API
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Backend Integration Points:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Replace mock data with API calls to <code className="bg-blue-100 px-1 rounded">/roles</code> and <code className="bg-blue-100 px-1 rounded">/permissions</code></li>
                  <li>• Implement JWT authentication for API requests</li>
                  <li>• Add error handling and loading states</li>
                  <li>• Connect save functionality to <code className="bg-blue-100 px-1 rounded">PATCH /roles/:id/permissions</code></li>
                </ul>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Navigation Path:</h4>
                <p className="text-sm text-green-800">
                  Settings → Users → "Manage Roles & Permissions" → Role Permissions Editor
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      ) : (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDemo(false)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Demo Info
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Interactive Demo</h1>
                <p className="text-sm text-gray-500">Try editing permissions for different roles</p>
              </div>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <ExternalLink className="w-3 h-3" />
              Demo Mode
            </Badge>
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="py-6">
        <RolePermissionsEditor />
      </div>
    </div>
      )}
    </DemoRouteGuard>
  )
}
