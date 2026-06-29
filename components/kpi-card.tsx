import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon?: React.ReactNode
  accent?: boolean
}

export function KpiCard({ title, value, change, changeLabel, icon, accent }: KpiCardProps) {
  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0
  const isNeutral = change === undefined || change === 0

  return (
    <Card className={cn(
      "rounded-2xl border transition-colors",
      accent && "border-accent/40 bg-accent/5"
    )}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-muted-foreground tracking-[0.15em] uppercase font-body mb-2">
              {title}
            </p>
            <p className="font-sans text-2xl font-semibold text-foreground tracking-tight leading-none">
              {value}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1.5 mt-2.5">
                <span className={cn(
                  "flex items-center gap-0.5 text-[11px] font-medium",
                  isPositive && "text-emerald-600 dark:text-emerald-400",
                  isNegative && "text-destructive",
                  isNeutral && "text-muted-foreground"
                )}>
                  {isPositive && <TrendingUp className="h-3 w-3" />}
                  {isNegative && <TrendingDown className="h-3 w-3" />}
                  {isNeutral && <Minus className="h-3 w-3" />}
                  {isPositive && "+"}
                  {change}%
                </span>
                {changeLabel && (
                  <span className="text-[11px] text-muted-foreground">{changeLabel}</span>
                )}
              </div>
            )}
          </div>
          {icon && (
            <div className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center shrink-0",
              accent ? "bg-accent/20 text-accent" : "bg-muted text-muted-foreground"
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
