"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Check,
  HelpCircle,
  Building2,
  Sparkles,
  Crown,
} from "lucide-react"
import { MarketingShell } from "@/components/marketing/marketing-shell"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const plans = [
  {
    id: "starter",
    name: "Starter",
    icon: Sparkles,
    description: "For small teams getting started with core HR",
    price: "₹2,999",
    period: "per month",
    employeeNote: "Up to 50 employees",
    highlighted: false,
    cta: "Start free trial",
    features: [
      "Employee directory & profiles",
      "Attendance & leave management",
      "Basic payroll & payslips",
      "Document storage",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    icon: Building2,
    description: "For growing companies that need the full HR suite",
    price: "₹7,999",
    period: "per month",
    employeeNote: "Up to 250 employees",
    highlighted: true,
    badge: "Most popular",
    cta: "Start free trial",
    features: [
      "Everything in Starter",
      "Recruitment & ATS",
      "Performance reviews & goals",
      "Advanced analytics & reports",
      "Org chart & team assignment",
      "Chat & notifications",
      "Priority support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    icon: Crown,
    description: "For large organizations with advanced needs",
    price: "Custom",
    period: "tailored pricing",
    employeeNote: "Unlimited employees",
    highlighted: false,
    cta: "Contact sales",
    features: [
      "Everything in Professional",
      "Custom roles & permissions",
      "SSO & advanced security",
      "Dedicated account manager",
      "Custom integrations & API",
      "SLA & onboarding assistance",
      "Multi-location & compliance",
    ],
  },
]

const comparisonRows = [
  { feature: "Employee management", starter: true, professional: true, enterprise: true },
  { feature: "Attendance & leave", starter: true, professional: true, enterprise: true },
  { feature: "Payroll processing", starter: true, professional: true, enterprise: true },
  { feature: "Recruitment / ATS", starter: false, professional: true, enterprise: true },
  { feature: "Performance management", starter: false, professional: true, enterprise: true },
  { feature: "Hours compliance reports", starter: false, professional: true, enterprise: true },
  { feature: "Asset management", starter: false, professional: true, enterprise: true },
  { feature: "Custom permissions", starter: false, professional: false, enterprise: true },
  { feature: "SSO / SAML", starter: false, professional: false, enterprise: true },
]

const faqs = [
  {
    q: "Is there a free trial?",
    a: "Yes. Every plan includes a 14-day free trial with full access. No credit card required to start.",
  },
  {
    q: "Can I change plans later?",
    a: "You can upgrade or downgrade at any time. Changes apply on your next billing cycle.",
  },
  {
    q: "How is pricing calculated for more employees?",
    a: "Starter and Professional include employee limits. Above that, contact us for volume pricing or move to Enterprise.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes. Annual plans receive a 15% discount compared to monthly billing.",
  },
]

export default function PricingPage() {
  const router = useRouter()

  return (
    <MarketingShell>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="mb-4 bg-green-100 text-green-800 border-green-200">Simple, transparent pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Plans that scale with your <span className="text-green-600">workforce</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Choose the right BevyHR plan for your team. All plans include attendance, leave, payroll basics, and
            secure employee data management.
          </p>
          <p className="text-sm text-gray-500">14-day free trial · Cancel anytime · GST invoicing available</p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`flex flex-col border-2 transition-shadow ${
                  plan.highlighted
                    ? "border-green-500 shadow-xl shadow-green-100 relative"
                    : "border-gray-200 shadow-lg hover:shadow-xl"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-600 text-white px-3 py-1">{plan.badge}</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <plan.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.price !== "Custom" && (
                      <span className="text-gray-500 ml-2 text-sm">{plan.period}</span>
                    )}
                    {plan.price === "Custom" && (
                      <p className="text-gray-500 text-sm mt-1">{plan.period}</p>
                    )}
                  </div>
                  <p className="text-sm text-green-700 font-medium mt-2">{plan.employeeNote}</p>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-green-600 hover:bg-green-700"
                        : plan.id === "enterprise"
                          ? "bg-gray-900 hover:bg-gray-800"
                          : ""
                    }`}
                    variant={plan.highlighted || plan.id === "enterprise" ? "default" : "outline"}
                    onClick={() =>
                      plan.id === "enterprise"
                        ? (window.location.href = "mailto:sales@bevyhr.com?subject=BevyHR Enterprise")
                        : router.push("/login")
                    }
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Compare plans</h2>
            <p className="text-gray-600">See what&apos;s included in each tier</p>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-4 font-semibold text-gray-900">Feature</th>
                  <th className="p-4 font-semibold text-gray-900 text-center">Starter</th>
                  <th className="p-4 font-semibold text-green-700 text-center">Professional</th>
                  <th className="p-4 font-semibold text-gray-900 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b last:border-0">
                    <td className="p-4 text-gray-700">{row.feature}</td>
                    {(["starter", "professional", "enterprise"] as const).map((tier) => (
                      <td key={tier} className="p-4 text-center">
                        {row[tier] ? (
                          <Check className="w-5 h-5 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
              <HelpCircle className="w-8 h-8 text-green-600" />
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-6">
            {faqs.map((item) => (
              <Card key={item.q} className="border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{item.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{item.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Still deciding?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Start your 14-day trial on any plan, or talk to our team about Enterprise requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-3"
              onClick={() => router.push("/login")}
            >
              Start free trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white bg-transparent text-white hover:bg-white hover:text-green-600 text-lg px-8 py-3"
              asChild
            >
              <Link href="/home">Explore features</Link>
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
