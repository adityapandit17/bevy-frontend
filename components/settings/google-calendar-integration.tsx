"use client"

import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, ExternalLink } from "lucide-react"
import { apiRequest, getEndpointUrl } from "@/lib/api"
import { useAuthContext } from "@/lib/auth/auth.context"
import { toast } from "@/hooks/use-toast"

type GoogleCalendarMode = "platform" | "company" | "disconnected"

type GoogleCalendarStatus = {
  connected: boolean
  email: string | null
  connected_at: string | null
  oauth_configured: boolean
  mode: GoogleCalendarMode
  platform_managed?: boolean
}

type ApiSuccess<T> = { success: true; data: T }
type ApiError = { success: false; error: string }

function unwrapData<T>(res: ApiSuccess<T> | ApiError | T): T {
  if (res && typeof res === "object" && "success" in res && (res as ApiSuccess<T>).success) {
    return (res as ApiSuccess<T>).data
  }
  return res as T
}

export function GoogleCalendarIntegration() {
  const { checkPermission } = useAuthContext()
  const searchParams = useSearchParams()
  const canManage = checkPermission("settings.update")

  const [status, setStatus] = useState<GoogleCalendarStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchStatus = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiRequest<ApiSuccess<GoogleCalendarStatus> | ApiError>(
        getEndpointUrl("GOOGLE_CALENDAR_STATUS"),
        { suppressToast: true }
      )
      setStatus(unwrapData(res))
    } catch {
      setStatus(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  useEffect(() => {
    const result = searchParams.get("google_calendar")
    if (!result) return

    if (result === "connected") {
      const email = searchParams.get("email")
      toast({
        title: "Google Calendar connected",
        description: email ? `Connected as ${email}` : "Interview events will sync to your calendar.",
      })
      fetchStatus()
      window.history.replaceState({}, "", "/settings?tab=integrations")
    } else if (result === "error") {
      const message = searchParams.get("message") || "Could not connect Google Calendar"
      toast({
        title: "Connection failed",
        description: message,
        variant: "destructive",
      })
      window.history.replaceState({}, "", "/settings?tab=integrations")
    }
  }, [searchParams, fetchStatus])

  const handleConnect = async () => {
    setActionLoading(true)
    try {
      const res = await apiRequest<ApiSuccess<{ authorization_url: string }> | ApiError>(
        getEndpointUrl("GOOGLE_CALENDAR_AUTHORIZE")
      )
      const data = unwrapData(res)
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      }
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm("Disconnect Google Calendar? New interviews will no longer create calendar events.")) {
      return
    }
    setActionLoading(true)
    try {
      await apiRequest(getEndpointUrl("GOOGLE_CALENDAR_DISCONNECT"), { method: "DELETE" })
      toast({ title: "Google Calendar disconnected" })
      await fetchStatus()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(false)
    }
  }

  const connected = status?.connected ?? false
  const oauthConfigured = status?.oauth_configured ?? false
  const platformMode = status?.mode === "platform"
  const companyMode = status?.mode === "company"

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <span className="text-2xl" aria-hidden>
          📧
        </span>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-gray-900">Google Workspace</h4>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            ) : connected ? (
              <>
                <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                  Connected
                </Badge>
                {platformMode && (
                  <Badge variant="outline">Platform account</Badge>
                )}
              </>
            ) : (
              <Badge variant="secondary">Not connected</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Email and calendar integration — schedule interviews and Google Meet invites from BevyHR.
          </p>
          {connected && status?.email && (
            <p className="text-sm text-gray-600 mt-1">
              Account: <span className="font-medium">{status.email}</span>
              {companyMode && status.connected_at && (
                <span className="text-gray-400">
                  {" "}
                  · Connected {new Date(status.connected_at).toLocaleDateString()}
                </span>
              )}
            </p>
          )}
          {platformMode && !loading && (
            <p className="text-sm text-gray-500 mt-1">
              Configured via server environment (same Gmail as outbound mail). Change tokens in backend `.env`.
            </p>
          )}
          {!oauthConfigured && !loading && (
            <p className="text-sm text-amber-600 mt-1">
              Server OAuth credentials are not configured. Contact your administrator.
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {canManage && connected && (
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://calendar.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open Calendar
            </a>
          </Button>
        )}
        {canManage && platformMode ? (
          <span className="text-xs text-gray-500 max-w-[140px] text-right">
            Server-managed
          </span>
        ) : canManage ? (
          connected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
              disabled={actionLoading || loading}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disconnect"}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleConnect}
              disabled={actionLoading || loading || !oauthConfigured}
            >
              {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
            </Button>
          )
        ) : (
          <span className="text-xs text-gray-500">View only</span>
        )}
      </div>
    </div>
  )
}
