import { TabsList } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

type ScrollableTabsListProps = React.ComponentProps<typeof TabsList>

/** Horizontally scrollable tab bar for mobile — desktop appearance unchanged when tabs fit */
export function ScrollableTabsList({ className, ...props }: ScrollableTabsListProps) {
  return (
    <TabsList
      className={cn(
        "flex h-auto w-full max-w-full flex-nowrap justify-start gap-1 overflow-x-auto p-1",
        className
      )}
      {...props}
    />
  )
}
