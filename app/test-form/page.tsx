"use client"

import { useState } from "react"
import { useAuthContext } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function TestFormPage() {
  const { login, isLoading, error, clearError } = useAuthContext()
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })
  const [submitCount, setSubmitCount] = useState(0)
  const [lastSubmitTime, setLastSubmitTime] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) {
      clearError()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const now = new Date().toLocaleTimeString()
    setLastSubmitTime(now)
    setSubmitCount(prev => prev + 1)
    
    console.log('🔧 Form submitted at:', now)
    console.log('🔧 Submit count:', submitCount + 1)
    
    try {
      await login(formData)
    } catch (error) {
      console.error('🔧 Login error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Form Submission Test</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Login Form Test</CardTitle>
            <CardDescription>
              This form should NOT reload the page when submitted with wrong credentials.
              Check the console for logs and watch the submit counter.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Display */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Submit Count</h4>
                <p className="text-2xl font-bold text-blue-600">{submitCount}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Last Submit</h4>
                <p className="text-sm text-gray-600">{lastSubmitTime || 'Never'}</p>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-red-800 mb-1">Login Failed</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Test Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  'Test Login'
                )}
              </Button>
            </form>

            {/* Instructions */}
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Test Instructions</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Enter wrong credentials (e.g., wrong@email.com / wrongpassword)</li>
                <li>2. Click "Test Login"</li>
                <li>3. Watch the submit counter - it should increase</li>
                <li>4. Check that the page doesn't reload</li>
                <li>5. Error message should appear without page reload</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

