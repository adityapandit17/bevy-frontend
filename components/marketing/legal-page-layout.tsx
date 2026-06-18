"use client"

import Link from "next/link"
import { MarketingShell } from "@/components/marketing/marketing-shell"

export interface LegalSection {
  id: string
  title: string
  paragraphs: string[]
  list?: string[]
}

interface LegalPageLayoutProps {
  title: string
  lastUpdated: string
  intro: string
  sections: LegalSection[]
}

export function LegalPageLayout({ title, lastUpdated, intro, sections }: LegalPageLayoutProps) {
  return (
    <MarketingShell>
      <div className="bg-gradient-to-b from-green-50/80 to-white border-b border-green-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
          <p className="text-sm font-medium text-green-700 mb-2">Legal</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{title}</h1>
          <p className="mt-3 text-sm text-gray-500">Last updated: {lastUpdated}</p>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">{intro}</p>
        </div>
      </div>

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-24">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                ))}
                {section.list && (
                  <ul className="list-disc pl-6 space-y-2">
                    {section.list.map((item) => (
                      <li key={item.slice(0, 48)}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
          <Link href="/terms" className="text-green-700 font-medium hover:underline">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-green-700 font-medium hover:underline">
            Privacy Policy
          </Link>
          <Link href="/signup" className="text-gray-600 hover:text-gray-900 hover:underline">
            Back to signup
          </Link>
        </div>
      </article>
    </MarketingShell>
  )
}
