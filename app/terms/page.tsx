import { LegalPageLayout } from "@/components/marketing/legal-page-layout"

const LAST_UPDATED = "June 17, 2026"

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      lastUpdated={LAST_UPDATED}
      intro="These Terms of Service govern your access to and use of BevyHR, our cloud-based human resources management platform. By creating an account or using the service, you agree to these terms on behalf of yourself and your organization."
      sections={[
        {
          id: "acceptance",
          title: "1. Acceptance of terms",
          paragraphs: [
            "BevyHR is operated by BevyHR Technologies. When you register for a trial or paid subscription, you represent that you have authority to bind your company to this agreement.",
            "If you do not agree to these terms, you may not use the platform.",
          ],
        },
        {
          id: "service",
          title: "2. The service",
          paragraphs: [
            "BevyHR provides tools for employee records, attendance, leave, payroll, recruitment, and related HR workflows. Features available to you depend on your subscription plan.",
            "We may update, improve, or discontinue features with reasonable notice when changes materially affect your use of the service.",
          ],
        },
        {
          id: "accounts",
          title: "3. Accounts and security",
          paragraphs: [
            "You are responsible for maintaining the confidentiality of login credentials and for all activity under your organization's accounts.",
            "You must provide accurate registration information and keep company and administrator details up to date.",
          ],
          list: [
            "Notify us promptly at support@bevyhr.com if you suspect unauthorized access.",
            "Do not share passwords or use the service for unlawful purposes.",
            "Ensure users within your organization comply with your internal policies and applicable law.",
          ],
        },
        {
          id: "customer-data",
          title: "4. Customer data",
          paragraphs: [
            "You retain ownership of employee and company data you upload to BevyHR. You grant us a limited license to host, process, and display that data solely to provide and support the service.",
            "You are responsible for obtaining any consents required to collect and process personal data of your employees and candidates through the platform.",
          ],
        },
        {
          id: "acceptable-use",
          title: "5. Acceptable use",
          paragraphs: ["You agree not to misuse BevyHR. Prohibited activities include:"],
          list: [
            "Reverse engineering, scraping, or attempting to bypass security controls.",
            "Uploading malware, infringing content, or data you do not have the right to process.",
            "Interfering with service availability or other customers' use of the platform.",
            "Using BevyHR in violation of employment, privacy, or other applicable laws.",
          ],
        },
        {
          id: "subscriptions",
          title: "6. Trials, billing, and cancellation",
          paragraphs: [
            "Free trials are offered for a limited period and may convert to a paid subscription unless cancelled before the trial ends. Pricing and plan limits are described on our pricing page.",
            "Fees are billed in advance according to your selected billing cycle. You may cancel or change plans through your account settings or by contacting support. Refunds are handled according to your order form or applicable law.",
          ],
        },
        {
          id: "availability",
          title: "7. Availability and support",
          paragraphs: [
            "We strive for high availability but do not guarantee uninterrupted access. Scheduled maintenance and factors outside our control may cause temporary downtime.",
            "Support channels and response times vary by plan. Critical security issues should be reported to support@bevyhr.com.",
          ],
        },
        {
          id: "liability",
          title: "8. Disclaimers and limitation of liability",
          paragraphs: [
            "BevyHR is provided on an \"as is\" and \"as available\" basis to the maximum extent permitted by law. We disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement.",
            "To the extent permitted by law, our total liability arising from these terms or your use of the service is limited to the fees you paid to us in the twelve months before the claim. We are not liable for indirect, incidental, or consequential damages.",
          ],
        },
        {
          id: "termination",
          title: "9. Termination",
          paragraphs: [
            "You may stop using the service at any time. We may suspend or terminate access if you materially breach these terms or if required by law.",
            "Upon termination, your right to access the service ends. We will retain or delete your data according to our Privacy Policy and any applicable data processing agreement.",
          ],
        },
        {
          id: "governing-law",
          title: "10. Governing law and contact",
          paragraphs: [
            "These terms are governed by the laws of India, without regard to conflict-of-law principles. Disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka, unless otherwise required by mandatory law.",
            "Questions about these terms may be sent to legal@bevyhr.com or support@bevyhr.com.",
          ],
        },
      ]}
    />
  )
}
