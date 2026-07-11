import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Wrench,
  CreditCard,
  AlertCircle,
  RotateCcw,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ElementType
  trend?: {
    value: string
    isPositive: boolean
  }
  variant?: "default" | "success" | "warning" | "danger"
}

function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  const variantStyles = {
    default: "bg-action-updated/10 text-action-updated",
    success: "bg-action-resolved/10 text-action-resolved",
    warning: "bg-action-reopened/10 text-action-reopened",
    danger: "bg-destructive/10 text-destructive",
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm">
              {title}
            </p>
            <p className="mt-1 text-lg font-bold sm:text-2xl">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div
                className={cn(
                  "mt-2 flex items-center gap-1 text-xs font-medium",
                  trend.isPositive ? "text-action-resolved" : "text-destructive"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {trend.value}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              variantStyles[variant]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardStatsGridProps {
  totalRevenue: number
  ordersRevenue: number
  servicesRevenue: number
  ordersCount: number
  servicesCount: number
  paidAmount: number
  unpaidAmount: number
  refundedAmount: number
}

export function DashboardStatsGrid({
  totalRevenue,
  ordersRevenue,
  servicesRevenue,
  ordersCount,
  servicesCount,
  paidAmount,
  unpaidAmount,
  refundedAmount,
}: DashboardStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Revenue"
        value={`EGP${totalRevenue.toLocaleString()}`}
        subtitle={`${ordersCount + servicesCount} transactions`}
        icon={DollarSign}
        variant="success"
      />
      <StatsCard
        title="Orders Revenue"
        value={`EGP${ordersRevenue.toLocaleString()}`}
        subtitle={`${ordersCount} orders`}
        icon={ShoppingCart}
        variant="default"
      />
      <StatsCard
        title="Services Revenue"
        value={`EGP${servicesRevenue.toLocaleString()}`}
        subtitle={`${servicesCount} services`}
        icon={Wrench}
        variant="default"
      />
      <StatsCard
        title="Paid"
        value={`EGP${paidAmount.toLocaleString()}`}
        icon={CreditCard}
        variant="success"
      />
      <StatsCard
        title="Unpaid"
        value={`EGP${unpaidAmount.toLocaleString()}`}
        icon={AlertCircle}
        variant="warning"
      />
      <StatsCard
        title="Refunded"
        value={`EGP${refundedAmount.toLocaleString()}`}
        icon={RotateCcw}
        variant="danger"
      />
    </div>
  )
}
