"use client"

import { useState } from "react"
import { useAuthContext } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function TestLoginPage() {
  const { login, isLoading, error, clearError } = useAuthContext()
  const [testCredentials, setTestCredentials] = useState({
    email: "",
    password: ""
  })

  const testCases = [
    {
      name: "Wrong Email",
      credentials: { email: "wrong@email.com", password: "password123" },
      description: "Should show 'Invalid email or password'"
    },
    {
      name: "Wrong Password", 
      credentials: { email: "admin@hrms.com", password: "wrongpassword" },
      description: "Should show 'Invalid email or password'"
    },
    {
      name: "Empty Email",
      credentials: { email: "", password: "password123" },
      description: "Should show 'Email and password are required'"
    },
    {
      name: "Empty Password",
      credentials: { email: "admin@hrms.com", password: "" },
      description: "Should show 'Email and password are required'"
    },
    {
      name: "Correct Credentials",
      credentials: { email: "admin@hrms.com", password: "admin123" },
      description: "Should login successfully"
    }
  ]

  const handleTestLogin = async (credentials: any) => {
    clearError()
    setTestCredentials(credentials)
    try {
      await login(credentials)
    } catch (error) {
      // Error is handled by the auth context
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Login Error Testing</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Test Cases */}
          <Card>
            <CardHeader>
              <CardTitle>Test Cases</CardTitle>
              <CardDescription>Click any button to test different login scenarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testCases.map((testCase, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">{testCase.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{testCase.description}</p>
                  <div className="text-xs text-gray-500 mb-2">
                    Email: {testCase.credentials.email || "(empty)"}<br/>
                    Password: {testCase.credentials.password || "(empty)"}
                  </div>
                  <Button 
                    onClick={() => handleTestLogin(testCase.credentials)}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                  >
                    Test Login
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Error Display */}
          <Card>
            <CardHeader>
              <CardTitle>Error Display</CardTitle>
              <CardDescription>Current error state and messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current State</h4>
                <p className="text-sm text-gray-600">Loading: {isLoading ? 'Yes' : 'No'}</p>
                <p className="text-sm text-gray-600">Error: {error ? 'Yes' : 'No'}</p>
              </div>

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

              {testCredentials.email && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Last Test Credentials</h4>
                  <p className="text-sm text-blue-700">Email: {testCredentials.email}</p>
                  <p className="text-sm text-blue-700">Password: {testCredentials.password}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

