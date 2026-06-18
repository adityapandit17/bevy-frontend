import { LegalPageLayout } from "@/components/marketing/legal-page-layout"

const LAST_UPDATED = "June 17, 2026"

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout
      title="Privacy Policy"
      lastUpdated={LAST_UPDATED}
      intro="This Privacy Policy explains how BevyHR collects, uses, shares, and protects personal information when you visit our website, sign up for a trial, or use our HR management platform."
      sections={[
        {
          id: "scope",
          title: "1. Who this policy applies to",
          paragraphs: [
            "This policy covers visitors to bevyhr.com, trial signups, account administrators, and end users whose employers have provisioned BevyHR accounts.",
            "When a company uses BevyHR, that company is typically the data controller for employee and candidate information. BevyHR acts as a data processor on the company's instructions, except for account and billing data we collect directly from administrators.",
          ],
        },
        {
          id: "collection",
          title: "2. Information we collect",
          paragraphs: ["We collect information in the following categories:"],
          list: [
            "Account data: name, work email, company name, plan selection, and authentication credentials.",
            "Usage data: log files, device and browser information, IP address, and feature usage for security and product improvement.",
            "Customer content: employee profiles, attendance, leave, payroll, documents, and other HR records uploaded by your organization.",
            "Support and communications: messages you send to our support or sales teams.",
            "Payment data: billing contact details; payment card processing is handled by our payment providers.",
          ],
        },
        {
          id: "use",
          title: "3. How we use information",
          paragraphs: ["We use personal information to:"],
          list: [
            "Provide, secure, and maintain the BevyHR platform.",
            "Authenticate users and administer subscriptions.",
            "Respond to support requests and communicate service updates.",
            "Analyze aggregated usage to improve reliability and features.",
            "Comply with legal obligations and enforce our Terms of Service.",
            "Send product or marketing communications where permitted; you may opt out of promotional emails.",
          ],
        },
        {
          id: "sharing",
          title: "4. How we share information",
          paragraphs: [
            "We do not sell personal information. We share data only as described below or with your direction.",
          ],
          list: [
            "Service providers: hosting, email, analytics, payment, and customer support vendors bound by confidentiality obligations.",
            "Your organization: administrators and authorized users within your company account.",
            "Legal and safety: when required by law, court order, or to protect rights, safety, and security.",
            "Business transfers: in connection with a merger, acquisition, or sale of assets, subject to continued protection of personal data.",
          ],
        },
        {
          id: "retention",
          title: "5. Data retention",
          paragraphs: [
            "We retain account and customer content for as long as your subscription is active and for a reasonable period afterward to allow export and comply with legal obligations.",
            "Backup copies may persist for a limited time before automatic deletion. You may request deletion of administrator account data by contacting support@bevyhr.com.",
          ],
        },
        {
          id: "security",
          title: "6. Security",
          paragraphs: [
            "We implement administrative, technical, and organizational measures designed to protect personal information, including encryption in transit, access controls, and monitoring.",
            "No method of transmission or storage is completely secure. You are responsible for safeguarding credentials and configuring appropriate access within your organization.",
          ],
        },
        {
          id: "rights",
          title: "7. Your rights and choices",
          paragraphs: [
            "Depending on your location, you may have rights to access, correct, delete, restrict, or port personal information, and to object to certain processing.",
            "Employees and candidates should generally contact their employer to exercise rights related to HR records stored in BevyHR. Administrators may contact us at privacy@bevyhr.com for account-related requests.",
          ],
        },
        {
          id: "international",
          title: "8. International transfers",
          paragraphs: [
            "BevyHR may process data in India and other countries where we or our service providers operate. We take steps to ensure appropriate safeguards when data is transferred across borders.",
          ],
        },
        {
          id: "children",
          title: "9. Children's privacy",
          paragraphs: [
            "BevyHR is a business service not directed to children under 16. We do not knowingly collect personal information from children.",
          ],
        },
        {
          id: "changes",
          title: "10. Changes and contact",
          paragraphs: [
            "We may update this policy from time to time. Material changes will be posted on this page with an updated effective date. Continued use of the service after changes constitutes acceptance where permitted by law.",
            "For privacy questions or requests, contact privacy@bevyhr.com or write to BevyHR Technologies, Bengaluru, India.",
          ],
        },
      ]}
    />
  )
}
