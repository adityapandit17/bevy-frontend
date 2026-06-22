"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { getReportBySlug } from "@/lib/reports/config"
import { ReportViewer } from "@/components/reports/report-viewer"
import AttendanceComplianceReportPage from "../attendance/page"

interface ReportPageProps {
  params: Promise<{ slug: string }>
}

export default function ReportSlugPage({ params }: ReportPageProps) {
  const { slug } = use(params)
  const definition = getReportBySlug(slug)

  if (!definition) {
    notFound()
  }

  if (definition.customPage === "hours-compliance") {
    return <AttendanceComplianceReportPage />
  }

  return <ReportViewer definition={definition} />
}
