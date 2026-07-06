import { cn } from "@/lib/utils"

interface StatGridProps {
  children: React.ReactNode
  className?: string
  columns?: 2 | 3 | 4
}

const columnClasses = {
  2: "grid-cols-2",
  3: "grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
}

/** KPI / stat cards — 2 columns on mobile, full grid on desktop */
export function StatGrid({ children, className, columns = 4 }: StatGridProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:gap-4 lg:gap-6",
        columnClasses[columns],
        className
      )}
    >
      {children}
    </div>
  )
}
