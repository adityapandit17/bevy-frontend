"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  Users,
  BarChart3,
  Shield,
  Clock,
  Smartphone,
  Globe,
  Star,
  TrendingUp,
  Zap,
  Calendar,
  FileText,
  DollarSign,
  GraduationCap,
  Briefcase,
  Network,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { MarketingShell } from "@/components/marketing/marketing-shell"
import { TypewriterHeadline } from "@/components/marketing/typewriter-headline"
import { BrandLogoLink } from "@/components/brand-logo-link"

export default function HomePage() {
  const router = useRouter()

  const features = [
    {
      icon: Users,
      title: "Employee Management",
      description: "Complete employee lifecycle management from onboarding to offboarding",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Comprehensive insights and real-time analytics for better decision making",
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with GDPR compliance and data protection",
    },
    {
      icon: Clock,
      title: "Time & Attendance",
      description: "Advanced time tracking with flexible scheduling and leave management",
    },
    {
      icon: Smartphone,
      title: "Mobile App",
      description: "Native mobile apps for iOS and Android with offline capabilities",
    },
    {
      icon: Globe,
      title: "Multi-location Support",
      description: "Manage multiple offices and remote teams from a single platform",
    },
  ]

  const stats = [
    { number: "100+", label: "Companies Trust Us" },
    { number: "2M+", label: "Employees Managed" },
    { number: "99.9%", label: "Uptime Guarantee" },
    { number: "24/7", label: "Customer Support" },
  ]

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "HR Director",
      company: "TechCorp",
      content: "BevyHR has transformed how we manage our workforce. The analytics are incredible!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "CEO",
      company: "StartupXYZ",
      content: "The mobile app is a game-changer. Our remote team loves the flexibility.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "People Operations",
      company: "Global Inc",
      content: "Implementation was seamless. The support team is outstanding.",
      rating: 5,
    },
  ]

  const modules = [
    { icon: Users, title: "Employee Directory", description: "Centralized employee database with advanced search and filtering" },
    { icon: Briefcase, title: "Recruitment", description: "End-to-end recruitment pipeline with ATS integration" },
    { icon: DollarSign, title: "Payroll", description: "Automated payroll processing with tax compliance" },
    { icon: Calendar, title: "Attendance", description: "Flexible time tracking and leave management system" },
    { icon: TrendingUp, title: "Performance", description: "Goal setting, reviews, and performance analytics" },
    { icon: GraduationCap, title: "Learning", description: "Training management and skill development tracking" },
    { icon: FileText, title: "Documents", description: "Secure document management with version control" },
    { icon: Network, title: "Org Chart", description: "Interactive organizational structure visualization" },
  ]

  return (
    <MarketingShell>
      <section className="relative bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-6 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <BrandLogoLink
                className="inline-flex items-center justify-center"
                imageClassName="h-28 md:h-40 w-auto object-contain"
                priority
              />
            </div>
            <Badge className="mb-6 bg-green-100 text-green-800 border-green-200">
              <Zap className="w-3 h-3 mr-1" />
              Trusted by 100+ Companies
            </Badge>
            <TypewriterHeadline className="mb-6" />
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Streamline your HR operations with our comprehensive platform.
            </p>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              From recruitment to retirement, manage your entire workforce with powerful tools and insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
                onClick={() => router.push("/signup")}
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3" onClick={() => router.push("/pricing")}>
                View Pricing
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-4">No credit card required · 14-day free trial · Cancel anytime</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything You Need to Manage Your Workforce</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive HR platform provides all the tools you need to manage, engage, and grow your team
              effectively.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="modules" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Complete HR Suite</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              All the modules you need in one integrated platform. No more juggling multiple tools.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {modules.map((module, index) => (
              <Card key={index} className="border border-gray-200 hover:border-green-300 hover:shadow-lg transition-all">
                <CardHeader className="pb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
                    <module.icon className="w-5 h-5 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm text-gray-600">{module.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by HR Teams Worldwide</h2>
            <p className="text-xl text-gray-600">See what our customers have to say about BevyHR</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">&quot;{testimonial.content}&quot;</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Transform Your HR Operations?</h2>
          <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
            Join thousands of companies that trust BevyHR to manage their workforce. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-3"
              onClick={() => router.push("/signup")}
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white bg-transparent text-white hover:bg-white hover:text-green-600 text-lg px-8 py-3"
              onClick={() => router.push("/pricing")}
            >
              See pricing
            </Button>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
