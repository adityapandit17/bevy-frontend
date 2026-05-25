"use client"

import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Globe } from "lucide-react"
import { GoogleCalendarIntegration } from "@/components/settings/google-calendar-integration"

const COMING_SOON_INTEGRATIONS = [
  {
    name: "Slack",
    description: "Team communication and notifications",
    icon: "💬",
  },
  {
    name: "Zoom",
    description: "Video conferencing for interviews",
    icon: "📹",
  },
  {
    name: "Banking API",
    description: "Automated salary transfers",
    icon: "🏦",
  },
  {
    name: "Biometric System",
    description: "Fingerprint attendance tracking",
    icon: "👆",
  },
] as const

function ComingSoonIntegrationRow({
  name,
  description,
  icon,
}: {
  name: string
  description: string
  icon: string
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50/50">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          {icon}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-gray-900">{name}</h4>
            <Badge variant="secondary">Coming soon</Badge>
          </div>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <Button variant="outline" size="sm" disabled>
        Connect
      </Button>
    </div>
  )
}

function IntegrationsContent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Third-party Integrations
        </CardTitle>
        <CardDescription>
          Connect with external services and applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4">
          <GoogleCalendarIntegration />
          {COMING_SOON_INTEGRATIONS.map((integration) => (
            <ComingSoonIntegrationRow key={integration.name} {...integration} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function IntegrationsTab() {
  return (
    <Suspense
      fallback={
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Third-party Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="py-8 text-center text-gray-500">
            Loading integrations…
          </CardContent>
        </Card>
      }
    >
      <IntegrationsContent />
    </Suspense>
  )
}
