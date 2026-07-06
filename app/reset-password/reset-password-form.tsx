"use client"

import { useState } from "react"
import { BrandLogoLink } from "@/components/brand-logo-link"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react"
import { useAuthContext } from "@/lib/auth"

export function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const resetPasswordToken = searchParams.get("reset_password_token")?.trim() ?? ""

  const { resetPassword, isLoading, error, clearError } = useAuthContext()

  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const clearFieldError = (key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const validate = () => {
    const next: Record<string, string> = {}
    if (!resetPasswordToken) {
      next.reset_password_token =
        "This link is invalid or incomplete. Open the reset link from your email."
    }
    if (!password) {
      next.password = "Password is required"
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters"
    }
    if (password !== passwordConfirmation) {
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
      await resetPassword({
        reset_password_token: resetPasswordToken,
        password,
        password_confirmation: passwordConfirmation,
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
            <BrandLogoLink
              className="inline-flex items-center justify-center"
              imageClassName="h-36 w-auto max-w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Choose a new password</h1>
          <p className="text-gray-600">Set a strong password for your BevyHR account</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">Reset password</CardTitle>
            <CardDescription className="text-center">
              Use the link from your email. Do not share this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {!resetPasswordToken && (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  This page needs a valid reset link. Request a new one from the{" "}
                  <Link href="/forgot-password" className="font-medium underline">
                    forgot password
                  </Link>{" "}
                  page.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="hidden"
                name="reset_password_token"
                value={resetPasswordToken}
                readOnly
                aria-hidden
              />

              {fieldErrors.reset_password_token && (
                <p className="text-sm text-red-600">{fieldErrors.reset_password_token}</p>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`pl-10 pr-10 ${fieldErrors.password ? "border-red-500" : ""}`}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      clearFieldError("password")
                      if (error) clearError()
                    }}
                    autoComplete="new-password"
                    disabled={isSubmitting || isLoading}
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
                <Label htmlFor="password_confirmation">Confirm new password</Label>
                <Input
                  id="password_confirmation"
                  type={showPassword ? "text" : "password"}
                  value={passwordConfirmation}
                  onChange={(e) => {
                    setPasswordConfirmation(e.target.value)
                    clearFieldError("password_confirmation")
                    if (error) clearError()
                  }}
                  autoComplete="new-password"
                  className={fieldErrors.password_confirmation ? "border-red-500" : ""}
                  disabled={isSubmitting || isLoading}
                />
                {fieldErrors.password_confirmation && (
                  <p className="text-sm text-red-600">{fieldErrors.password_confirmation}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={isSubmitting || isLoading || !resetPasswordToken}
              >
                {isSubmitting || isLoading ? "Saving…" : "Update password"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Remember your password?{" "}
              <Link href="/login" className="font-medium text-green-700 hover:underline">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <BrandLogoLink
            className="inline-flex items-center justify-center mx-auto opacity-80"
            imageClassName="h-20 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  )
}
