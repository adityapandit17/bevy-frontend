export type ReportCategory =
  | "employee"
  | "attendance"
  | "payroll"
  | "leave"
  | "performance"
  | "recruitment"

export interface ReportDefinition {
  slug: string
  name: string
  description: string
  category: ReportCategory
  /** Uses dedicated page with charts instead of generic table viewer */
  customPage?: "hours-compliance"
}

export const REPORT_CATEGORIES: {
  key: ReportCategory
  title: string
  description: string
  icon: string
  color: string
  bgColor: string
}[] = [
  {
    key: "employee",
    title: "Employee Reports",
    description: "Workforce analytics and employee data",
    icon: "Users",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "attendance",
    title: "Attendance Reports",
    description: "Time tracking and attendance analytics",
    icon: "Clock",
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    key: "payroll",
    title: "Payroll Reports",
    description: "Salary and compensation analytics",
    icon: "IndianRupee",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    key: "leave",
    title: "Leave Reports",
    description: "Leave management and analytics",
    icon: "Calendar",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    key: "performance",
    title: "Performance Reports",
    description: "Employee performance and KPI tracking",
    icon: "TrendingUp",
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  {
    key: "recruitment",
    title: "Recruitment Reports",
    description: "Hiring process and candidate analytics",
    icon: "Activity",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
]

export const REPORTS: ReportDefinition[] = [
  {
    slug: "employee-directory",
    name: "Employee Directory",
    description: "Complete employee list with details",
    category: "employee",
  },
  {
    slug: "department-wise",
    name: "Department Wise Report",
    description: "Employee distribution by department",
    category: "employee",
  },
  {
    slug: "new-joiners",
    name: "New Joiners Report",
    description: "Recent hires and onboarding status",
    category: "employee",
  },
  {
    slug: "employee-turnover",
    name: "Employee Turnover",
    description: "Attrition analysis and trends",
    category: "employee",
  },
  {
    slug: "daily-attendance",
    name: "Daily Attendance",
    description: "Today's attendance summary",
    category: "attendance",
  },
  {
    slug: "hours-compliance",
    name: "Hours compliance & attendance",
    description: "Worked vs required hours, behind-schedule chart",
    category: "attendance",
    customPage: "hours-compliance",
  },
  {
    slug: "late-arrivals",
    name: "Late Arrivals Report",
    description: "Employees with frequent late arrivals",
    category: "attendance",
  },
  {
    slug: "overtime",
    name: "Overtime Report",
    description: "Overtime hours and compensation",
    category: "attendance",
  },
  {
    slug: "monthly-payroll",
    name: "Monthly Payroll",
    description: "Complete payroll processing report",
    category: "payroll",
  },
  {
    slug: "salary-structure",
    name: "Salary Structure",
    description: "Department-wise salary analysis",
    category: "payroll",
  },
  {
    slug: "tax-deductions",
    name: "Tax Deduction Report",
    description: "TDS, PF, and ESI deductions",
    category: "payroll",
  },
  {
    slug: "bonus-incentives",
    name: "Bonus & Incentives",
    description: "Performance-based payments",
    category: "payroll",
  },
  {
    slug: "leave-balance",
    name: "Leave Balance",
    description: "Employee leave balances by type",
    category: "leave",
  },
  {
    slug: "leave-trends",
    name: "Leave Trends",
    description: "Seasonal leave patterns",
    category: "leave",
  },
  {
    slug: "pending-approvals",
    name: "Pending Approvals",
    description: "Leave requests awaiting approval",
    category: "leave",
  },
  {
    slug: "leave-utilization",
    name: "Leave Utilization",
    description: "Department-wise leave usage",
    category: "leave",
  },
  {
    slug: "performance-reviews",
    name: "Performance Reviews",
    description: "Quarterly performance evaluations",
    category: "performance",
  },
  {
    slug: "goal-tracking",
    name: "Goal Tracking",
    description: "Employee goal achievement status",
    category: "performance",
  },
  {
    slug: "training-reports",
    name: "Training Reports",
    description: "Employee skill development progress",
    category: "performance",
  },
  {
    slug: "appraisal-summary",
    name: "Appraisal Summary",
    description: "Annual appraisal cycle results",
    category: "performance",
  },
  {
    slug: "hiring-pipeline",
    name: "Hiring Pipeline",
    description: "Current recruitment status",
    category: "recruitment",
  },
  {
    slug: "source-analysis",
    name: "Source Analysis",
    description: "Candidate source effectiveness",
    category: "recruitment",
  },
  {
    slug: "time-to-hire",
    name: "Time to Hire",
    description: "Recruitment process efficiency",
    category: "recruitment",
  },
  {
    slug: "interview-feedback",
    name: "Interview Feedback",
    description: "Candidate evaluation summaries",
    category: "recruitment",
  },
]

export function getReportBySlug(slug: string): ReportDefinition | undefined {
  return REPORTS.find((r) => r.slug === slug)
}

export function reportsByCategory(category: ReportCategory): ReportDefinition[] {
  return REPORTS.filter((r) => r.category === category)
}
