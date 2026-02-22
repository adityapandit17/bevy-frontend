"use client"

import { Badge } from "@/components/ui/badge"
import { Star, Zap, Trophy, Award, CheckCircle, Sparkles } from "lucide-react"

interface EmployeeBadgeProps {
  badgeLevel?: string | null
  className?: string
}

const badgeConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  rockstar: {
    label: "Rockstar",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: Star
  },
  ninja: {
    label: "Ninja",
    color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    icon: Zap
  },
  champion: {
    label: "Champion",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Trophy
  },
  expert: {
    label: "Expert",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: Award
  },
  pro: {
    label: "Pro",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle
  },
  rookie: {
    label: "Rookie",
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: Sparkles
  }
}

export function EmployeeBadge({ badgeLevel, className = "" }: EmployeeBadgeProps) {
  if (!badgeLevel) return null

  const config = badgeConfig[badgeLevel.toLowerCase()]
  if (!config) return null

  const Icon = config.icon

  return (
    <Badge 
      variant="outline" 
      className={`${config.color} border font-semibold flex items-center gap-1.5 ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </Badge>
  )
}
