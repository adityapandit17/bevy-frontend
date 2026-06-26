"use client"

import { CallProvider } from "@/providers/call-provider"

export function CallProviderRoot({ children }: { children: React.ReactNode }) {
  return <CallProvider>{children}</CallProvider>
}
