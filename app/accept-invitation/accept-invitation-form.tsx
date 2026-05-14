"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react"
import { useAuthContext } from "@/lib/auth"

export function AcceptInvitationForm() {
  const searchParams = useSearchParams()
  const tokenFromUrl = searchParams.get("invitation_token") ?? ""

  const { acceptInvitation, isLoading, error, clearError } = useAuthContext()

  const [formData, setFormData] = useState({
    invitation_token: tokenFromUrl,
    password: "",
    password_confirmation: "",
    first_name: "",
    last_name: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData((prev) => ({ ...prev, invitation_token: tokenFromUrl }))
  }, [tokenFromUrl])

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (error) clearError()
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!formData.invitation_token.trim()) {
      next.invitation_token = "Invitation link is missing or invalid. Open the link from your email."
    }
    if (!formData.password) {
      next.password = "Password is required"
    } else if (formData.password.length < 6) {
      next.password = "Password must be at least 6 characters"
    }
    if (formData.password !== formData.password_confirmation) {
      next.password_confirmation = "Passwords do not match"
    }
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || isLoading || !validate()) return

    setIsSubmitting(true)
    try {
      await acceptInvitation({
        invitation_token: formData.invitation_token.trim(),
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        ...(formData.first_name.trim() ? { first_name: formData.first_name.trim() } : {}),
        ...(formData.last_name.trim() ? { last_name: formData.last_name.trim() } : {}),
      })
    } catch {
      // Error surfaced via context
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Image src="/bevyhr-logo.png" alt="BevyHR" width={64} height={64} className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete your account</h1>
          <p className="text-gray-600">Set a password to finish joining BevyHR</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">Account setup</CardTitle>
            <CardDescription className="text-center">
              Use the same link from your welcome email. Do not share this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invitation_token">Invitation token</Label>
                <Input
                  id="invitation_token"
                  name="invitation_token"
                  type="text"
                  autoComplete="off"
                  value={formData.invitation_token}
                  onChange={(e) => handleChange("invitation_token", e.target.value)}
                  placeholder="Pasted from your email link"
                  className={fieldErrors.invitation_token ? "border-red-500" : ""}
                />
                {fieldErrors.invitation_token && (
                  <p className="text-sm text-red-600">{fieldErrors.invitation_token}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First name (optional)</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    autoComplete="given-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last name (optional)</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`pl-10 pr-10 ${fieldErrors.password ? "border-red-500" : ""}`}
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-sm text-red-600">{fieldErrors.password}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirmation">Confirm password</Label>
                <Input
                  id="password_confirmation"
                  type={showPassword ? "text" : "password"}
                  value={formData.password_confirmation}
                  onChange={(e) => handleChange("password_confirmation", e.target.value)}
                  autoComplete="new-password"
                  className={fieldErrors.password_confirmation ? "border-red-500" : ""}
                />
                {fieldErrors.password_confirmation && (
                  <p className="text-sm text-red-600">{fieldErrors.password_confirmation}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                {isSubmitting || isLoading ? "Saving…" : "Complete setup"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-green-700 hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
