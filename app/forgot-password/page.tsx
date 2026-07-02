"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react"
import { AuthService, AuthServiceError } from "@/lib/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [fieldError, setFieldError] = useState("")
  const [apiError, setApiError] = useState("")
  const [sent, setSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = () => {
    if (!email.trim()) {
      setFieldError("Email is required")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(email.trim())) {
      setFieldError("Please enter a valid email address")
      return false
    }
    setFieldError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !validate()) return

    setIsSubmitting(true)
    setApiError("")

    try {
      await AuthService.getInstance().forgotPassword(email.trim().toLowerCase())
      setSent(true)
    } catch (error) {
      const message =
        error instanceof AuthServiceError
          ? error.message
          : "Could not send reset instructions. Please try again."
      setApiError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <Image
              src="/bevyhr-logo.png"
              alt="BevyHR Logo"
              width={1024}
              height={455}
              className="h-36 w-auto max-w-full object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset your password</h1>
          <p className="text-gray-600">
            Enter your work email and we&apos;ll send you a secure link to choose a new password.
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold text-center">
              {sent ? "Check your inbox" : "Forgot password"}
            </CardTitle>
            <CardDescription className="text-center">
              {sent
                ? "If an account exists for that email, reset instructions are on the way."
                : "We'll email you a link that expires in 6 hours."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiError && (
              <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {sent ? (
              <div className="space-y-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  If <span className="font-medium text-gray-900">{email.trim()}</span> is registered with
                  BevyHR, you&apos;ll receive an email shortly. Open the link in that email to set a new
                  password.
                </p>
                <p className="text-xs text-gray-500">
                  In local development, check Letter Opener at{" "}
                  <span className="font-mono text-gray-700">http://localhost:3000</span> after submitting.
                </p>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (fieldError) setFieldError("")
                        if (apiError) setApiError("")
                      }}
                      className={`pl-10 ${fieldError ? "border-red-500" : ""}`}
                      autoComplete="email"
                      disabled={isSubmitting}
                    />
                  </div>
                  {fieldError && (
                    <p className="flex items-center gap-1 text-sm text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      {fieldError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending…" : "Send reset link"}
                </Button>

                <Button asChild variant="ghost" className="w-full text-gray-600">
                  <Link href="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to sign in
                  </Link>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Link href="/login" className="inline-flex items-center justify-center">
            <Image src="/bevyhr-logo.png" alt="BevyHR" width={1024} height={455} className="h-20 w-auto opacity-80 object-contain" />
          </Link>
        </div>
      </div>
    </div>
  )
}
