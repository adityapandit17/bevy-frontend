"use client"

import { useState, useEffect, Suspense } from "react"
import { BrandLogoLink } from "@/components/brand-logo-link"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, ArrowRight, Building2, CheckCircle2 } from "lucide-react"
import { getEndpointUrl } from "@/lib/api"
import { AUTH_CONFIG } from "@/config/auth.config"
import { toast } from "@/hooks/use-toast"

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <SignupPageContent />
    </Suspense>
  )
}

function SignupPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    company_name: "",
    industry: "technology",
    employee_count: "1-50",
    plan: "starter",
    admin_first_name: "",
    admin_last_name: "",
    admin_email: "",
    admin_password: "",
    admin_password_confirm: "",
  })

  useEffect(() => {
    const plan = searchParams.get("plan")
    if (plan && ["starter", "professional", "enterprise"].includes(plan)) {
      setForm((prev) => ({ ...prev, plan }))
    }
  }, [searchParams])

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.admin_password !== form.admin_password_confirm) {
      setError("Passwords do not match")
      return
    }
    if (form.admin_password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(getEndpointUrl("TRIAL_SIGNUP"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          company_name: form.company_name,
          industry: form.industry,
          employee_count: form.employee_count,
          plan: form.plan,
          admin_first_name: form.admin_first_name,
          admin_last_name: form.admin_last_name,
          admin_email: form.admin_email,
          admin_password: form.admin_password,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Signup failed")
      }

      const { token, user } = data.data
      const storedUser = {
        ...user,
        roles: ["Super Admin"],
        permissions: [],
      }

      localStorage.setItem(AUTH_CONFIG.tokenKey, token)
      localStorage.setItem(AUTH_CONFIG.userKey, JSON.stringify(storedUser))

      toast({
        title: "Welcome to BevyHR!",
        description: data.data.message || "Your 14-day trial has started.",
      })

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete signup")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <BrandLogoLink imageClassName="h-20 w-auto max-w-[min(100%,28rem)] object-contain" />
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-green-700 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Start your free trial</h1>
              <p className="mt-2 text-gray-600">
                Set up your company workspace in minutes. Full access for 14 days — no credit card required.
              </p>
            </div>
            <ul className="space-y-3">
              {[
                "Unlimited HR modules during trial",
                "Invite your team after setup",
                "Indian payroll & attendance ready",
                "Upgrade anytime from Settings",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Card className="lg:col-span-3 shadow-lg border-green-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-green-600" />
                Company & admin account
              </CardTitle>
              <CardDescription>
                You&apos;ll be the Super Admin for your organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Company</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="company_name">Company name</Label>
                      <Input
                        id="company_name"
                        value={form.company_name}
                        onChange={(e) => update("company_name", e.target.value)}
                        placeholder="Acme Technologies Pvt Ltd"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Select value={form.industry} onValueChange={(v) => update("industry", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="technology">Technology</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="retail">Retail</SelectItem>
                          <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Team size</Label>
                      <Select value={form.employee_count} onValueChange={(v) => update("employee_count", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-50">1–50</SelectItem>
                          <SelectItem value="51-200">51–200</SelectItem>
                          <SelectItem value="201-500">201–500</SelectItem>
                          <SelectItem value="501-1000">501–1000</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label>Plan</Label>
                      <Select value={form.plan} onValueChange={(v) => update("plan", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="starter">Starter — up to 50 employees</SelectItem>
                          <SelectItem value="professional">Professional — up to 200 employees</SelectItem>
                          <SelectItem value="enterprise">Enterprise — unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Your admin account</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="admin_first_name">First name</Label>
                      <Input
                        id="admin_first_name"
                        value={form.admin_first_name}
                        onChange={(e) => update("admin_first_name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin_last_name">Last name</Label>
                      <Input
                        id="admin_last_name"
                        value={form.admin_last_name}
                        onChange={(e) => update("admin_last_name", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="admin_email">Work email</Label>
                      <Input
                        id="admin_email"
                        type="email"
                        value={form.admin_email}
                        onChange={(e) => update("admin_email", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin_password">Password</Label>
                      <Input
                        id="admin_password"
                        type="password"
                        value={form.admin_password}
                        onChange={(e) => update("admin_password", e.target.value)}
                        minLength={8}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="admin_password_confirm">Confirm password</Label>
                      <Input
                        id="admin_password_confirm"
                        type="password"
                        value={form.admin_password_confirm}
                        onChange={(e) => update("admin_password_confirm", e.target.value)}
                        minLength={8}
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? "Creating your workspace…" : "Start 14-day free trial"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <p className="text-xs text-center text-gray-500">
                  By signing up you agree to our{" "}
                  <Link href="/terms" className="text-green-700 font-medium hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-green-700 font-medium hover:underline">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
