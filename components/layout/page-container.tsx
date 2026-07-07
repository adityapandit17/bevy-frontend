import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  /** Use "container" for narrower max-width pages */
  size?: "default" | "narrow" | "wide" | "full"
}

const sizeClasses = {
  default: "max-w-7xl",
  narrow: "max-w-4xl",
  wide: "max-w-[90rem]",
  full: "max-w-full",
}

/** Standard authenticated page wrapper — mobile padding, desktop unchanged */
export function PageContainer({
  children,
  className,
  size = "default",
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 overflow-x-hidden p-4 sm:p-5 lg:p-6 space-y-4 sm:space-y-5 lg:space-y-6",
        sizeClasses[size],
        className
      )}
    >
      {children}
    </div>
  )
}
