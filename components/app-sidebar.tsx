"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  TrendingUp,
  ShoppingBag,
  RotateCcw,
  Package,
  Users,
  DollarSign,
  BarChart3,
  BookOpen,
  LifeBuoy,
  Wrench,
  Users2,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  RefreshCcw,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

function NavSection({
  label,
  icon: Icon,
  children,
  defaultOpen = false,
  href,
  isActive,
  onNavigate,
}: {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  children?: React.ReactNode
  defaultOpen?: boolean
  href?: string
  isActive?: boolean
  onNavigate?: () => void
}) {
  const [open, setOpen] = useState(defaultOpen)

  if (!children) {
    return (
      <Link
        href={href || "#"}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-[#e8e4da] hover:bg-sidebar-accent hover:text-white"
        )}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        <span className="flex-1">{label}</span>
      </Link>
    )
  }

  const rowClasses = cn(
    "flex items-center w-full rounded-xl text-sm font-medium transition-colors",
    isActive
      ? "bg-sidebar-accent/60 text-sidebar-accent-foreground"
      : "text-[#e8e4da] hover:bg-sidebar-accent hover:text-white"
  )

  return (
    <div>
      {href ? (
        <div className={rowClasses}>
          <Link href={href} onClick={onNavigate} className="flex items-center gap-3 flex-1 px-3 py-2">
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            <span className="flex-1">{label}</span>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="px-2 py-2 hover:opacity-100 opacity-70"
            aria-label={open ? "Collapse" : "Expand"}
          >
            {open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          </button>
        </div>
      ) : (
        <button onClick={() => setOpen(!open)} className={cn(rowClasses, "px-3 py-2 justify-between")}>
          <span className="flex items-center gap-3 flex-1">
            {Icon && <Icon className="h-4 w-4 shrink-0" />}
            {label}
          </span>
          {open ? <ChevronDown className="h-3.5 w-3.5 text-[#e8e4da]/60" /> : <ChevronRight className="h-3.5 w-3.5 text-[#e8e4da]/60" />}
        </button>
      )}
      {open && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-[#e8e4da]/15 pl-2">
          {children}
        </div>
      )}
    </div>
  )
}

function NavChild({
  label, href, icon: Icon, isActive, onNavigate,
}: {
  label: string; href: string; icon?: React.ComponentType<{ className?: string }>; isActive?: boolean; onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors",
        isActive
          ? "text-white bg-sidebar-accent/40"
          : "text-[#e8e4da]/70 hover:text-white hover:bg-sidebar-accent/30"
      )}
    >
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      <span className="flex-1">{label}</span>
    </Link>
  )
}

function NavSubSection({
  label, children, defaultOpen = false, isActive,
}: {
  label: string; children: React.ReactNode; defaultOpen?: boolean; isActive?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-1.5 rounded-xl font-medium transition-colors text-[14px]",
          isActive
            ? "text-white bg-sidebar-accent/30"
            : "text-[#e8e4da]/80 hover:text-white hover:bg-sidebar-accent/20"
        )}
      >
        <span className="flex-1 text-left">{label}</span>
        {open ? <ChevronDown className="h-3 w-3 text-[#e8e4da]/50 shrink-0" /> : <ChevronRight className="h-3 w-3 text-[#e8e4da]/50 shrink-0" />}
      </button>
      {open && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-[#e8e4da]/10 pl-2">
          {children}
        </div>
      )}
    </div>
  )
}

function NavLeaf({ label, href, isActive, onNavigate }: { label: string; href: string; isActive?: boolean; onNavigate?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center px-3 py-1 rounded-xl text-[11px] font-normal transition-colors leading-tight",
        isActive
          ? "text-white bg-sidebar-accent/30"
          : "text-[#e8e4da]/55 hover:text-white hover:bg-sidebar-accent/20"
      )}
    >
      <span className="flex-1">{label}</span>
    </Link>
  )
}

function NavDivider() {
  return (
    <div className="pt-3 pb-1">
      <div className="border-t border-[#e8e4da]/15" />
    </div>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const close = () => setMobileOpen(false)

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="px-6 py-5 border-b border-[#e8e4da]/12">
        <Link href="/dashboard" onClick={close} className="block">
          <p className="text-[10px] text-[#e8e4da]/60 tracking-[0.18em] uppercase">
            Welcome to
          </p>
          <h1 className="text-lg font-semibold text-white tracking-tight leading-[1.15] mt-1">
            The Finance<br />Fold
          </h1>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-hide p-3 space-y-0.5">

        <NavSection
          label="Overview"
          icon={LayoutDashboard}
          href="/dashboard"
          isActive={pathname === "/dashboard"}
          onNavigate={close}
        />

        <NavDivider />

        <NavSection
          label="Daily Sales"
          icon={TrendingUp}
          href="/dashboard/daily-sales"
          isActive={pathname.startsWith("/dashboard/daily-sales")}
          onNavigate={close}
        />

        <NavSection
          label="Orders"
          icon={ShoppingBag}
          defaultOpen={pathname.startsWith("/dashboard/orders")}
          isActive={pathname.startsWith("/dashboard/orders")}
        >
          <NavChild label="All Orders" href="/dashboard/orders" isActive={pathname === "/dashboard/orders"} onNavigate={close} />
          <NavChild label="Pending" href="/dashboard/orders/pending" isActive={pathname === "/dashboard/orders/pending"} onNavigate={close} />
          <NavChild label="Fulfilled" href="/dashboard/orders/fulfilled" isActive={pathname === "/dashboard/orders/fulfilled"} onNavigate={close} />
          <NavChild label="Cancelled" href="/dashboard/orders/cancelled" isActive={pathname === "/dashboard/orders/cancelled"} onNavigate={close} />
        </NavSection>

        <NavSection
          label="Returns"
          icon={RotateCcw}
          defaultOpen={pathname.startsWith("/dashboard/returns")}
          isActive={pathname.startsWith("/dashboard/returns")}
        >
          <NavChild label="Overview" href="/dashboard/returns" isActive={pathname === "/dashboard/returns"} onNavigate={close} />
          <NavChild label="Return Reasons" href="/dashboard/returns/reasons" isActive={pathname.startsWith("/dashboard/returns/reasons")} onNavigate={close} />
          <NavChild label="Refunds & Credits" href="/dashboard/returns/refunds" isActive={pathname.startsWith("/dashboard/returns/refunds")} onNavigate={close} />
          <NavChild label="Return Rate Trends" href="/dashboard/returns/trends" isActive={pathname.startsWith("/dashboard/returns/trends")} onNavigate={close} />
        </NavSection>

        <NavSection
          label="Inventory & Product"
          icon={Package}
          defaultOpen={pathname.startsWith("/dashboard/inventory")}
          isActive={pathname.startsWith("/dashboard/inventory")}
        >
          <NavChild label="Stock Levels" href="/dashboard/inventory" isActive={pathname === "/dashboard/inventory"} onNavigate={close} />
          <NavChild label="Product Catalogue" href="/dashboard/inventory/catalogue" isActive={pathname.startsWith("/dashboard/inventory/catalogue")} onNavigate={close} />
          <NavChild label="Low Stock Alerts" href="/dashboard/inventory/alerts" isActive={pathname.startsWith("/dashboard/inventory/alerts")} onNavigate={close} />
          <NavChild label="Inventory Valuation" href="/dashboard/inventory/valuation" isActive={pathname.startsWith("/dashboard/inventory/valuation")} onNavigate={close} />
        </NavSection>

        <NavSection
          label="Customers"
          icon={Users}
          defaultOpen={pathname.startsWith("/dashboard/customers")}
          isActive={pathname.startsWith("/dashboard/customers")}
        >
          <NavChild label="All Customers" href="/dashboard/customers" isActive={pathname === "/dashboard/customers"} onNavigate={close} />
          <NavChild label="Segments" href="/dashboard/customers/segments" isActive={pathname.startsWith("/dashboard/customers/segments")} onNavigate={close} />
          <NavChild label="Lifetime Value" href="/dashboard/customers/ltv" isActive={pathname.startsWith("/dashboard/customers/ltv")} onNavigate={close} />
          <NavChild label="Retention" href="/dashboard/customers/retention" isActive={pathname.startsWith("/dashboard/customers/retention")} onNavigate={close} />
        </NavSection>

        <NavDivider />

        <NavSection
          label="Finance & Reporting"
          icon={DollarSign}
          defaultOpen={pathname.startsWith("/dashboard/finance")}
          isActive={pathname.startsWith("/dashboard/finance")}
        >
          <NavSubSection
            label="P&L"
            defaultOpen={pathname.startsWith("/dashboard/finance/pl")}
            isActive={pathname.startsWith("/dashboard/finance/pl")}
          >
            <NavLeaf label="Monthly P&L" href="/dashboard/finance/pl/monthly" isActive={pathname === "/dashboard/finance/pl/monthly"} onNavigate={close} />
            <NavLeaf label="Annual P&L" href="/dashboard/finance/pl/annual" isActive={pathname === "/dashboard/finance/pl/annual"} onNavigate={close} />
          </NavSubSection>
          <NavSubSection
            label="Reconciliation"
            defaultOpen={pathname.startsWith("/dashboard/finance/recon")}
            isActive={pathname.startsWith("/dashboard/finance/recon")}
          >
            <NavLeaf label="Month End" href="/dashboard/finance/recon/month-end" isActive={pathname === "/dashboard/finance/recon/month-end"} onNavigate={close} />
            <NavLeaf label="Year End" href="/dashboard/finance/recon/year-end" isActive={pathname === "/dashboard/finance/recon/year-end"} onNavigate={close} />
          </NavSubSection>
          <NavChild label="Invoices" href="/dashboard/finance/invoices" isActive={pathname.startsWith("/dashboard/finance/invoices")} onNavigate={close} />
          <NavChild label="Expenses" href="/dashboard/finance/expenses" isActive={pathname.startsWith("/dashboard/finance/expenses")} onNavigate={close} />
          <NavChild label="Cash Flow" href="/dashboard/finance/cashflow" isActive={pathname.startsWith("/dashboard/finance/cashflow")} onNavigate={close} />
        </NavSection>

        <NavSection
          label="Reporting"
          icon={BarChart3}
          defaultOpen={pathname.startsWith("/dashboard/reporting")}
          isActive={pathname.startsWith("/dashboard/reporting")}
        >
          <NavChild label="Sales Analysis" href="/dashboard/reporting/sales" isActive={pathname.startsWith("/dashboard/reporting/sales")} onNavigate={close} />
          <NavChild label="Margin Analysis" href="/dashboard/reporting/margin" isActive={pathname.startsWith("/dashboard/reporting/margin")} onNavigate={close} />
          <NavChild label="Regional Breakdown" href="/dashboard/reporting/regional" isActive={pathname.startsWith("/dashboard/reporting/regional")} onNavigate={close} />
          <NavChild label="Custom Reports" href="/dashboard/reporting/custom" isActive={pathname.startsWith("/dashboard/reporting/custom")} onNavigate={close} />
        </NavSection>

        <NavSection
          label="Data Sync"
          icon={RefreshCcw}
          href="/dashboard/sync"
          isActive={pathname.startsWith("/dashboard/sync")}
          onNavigate={close}
        />

        <NavDivider />

        <NavSection
          label="Knowledge Library"
          icon={BookOpen}
          defaultOpen={pathname.startsWith("/dashboard/knowledge")}
          isActive={pathname.startsWith("/dashboard/knowledge")}
        >
          <NavChild label="Documents & SOPs" href="/dashboard/knowledge" isActive={pathname === "/dashboard/knowledge"} onNavigate={close} />
          <NavChild label="Flowcharts" href="/dashboard/knowledge/flowcharts" isActive={pathname.startsWith("/dashboard/knowledge/flowcharts")} onNavigate={close} />
          <NavChild label="Templates" href="/dashboard/knowledge/templates" isActive={pathname.startsWith("/dashboard/knowledge/templates")} onNavigate={close} />
        </NavSection>

        <NavSection
          label="Support Tickets"
          icon={LifeBuoy}
          defaultOpen={pathname.startsWith("/dashboard/support")}
          isActive={pathname.startsWith("/dashboard/support")}
        >
          <NavChild label="Inbox" href="/dashboard/support" isActive={pathname === "/dashboard/support"} onNavigate={close} />
          <NavChild label="Open Tickets" href="/dashboard/support/open" isActive={pathname.startsWith("/dashboard/support/open")} onNavigate={close} />
          <NavChild label="Resolved" href="/dashboard/support/resolved" isActive={pathname.startsWith("/dashboard/support/resolved")} onNavigate={close} />
        </NavSection>

        <NavSection
          label="Operations"
          icon={Wrench}
          defaultOpen={pathname.startsWith("/dashboard/operations")}
          isActive={pathname.startsWith("/dashboard/operations")}
        >
          <NavChild label="Overview" href="/dashboard/operations" isActive={pathname === "/dashboard/operations"} onNavigate={close} />
          <NavChild label="Logistics" href="/dashboard/operations/logistics" isActive={pathname.startsWith("/dashboard/operations/logistics")} onNavigate={close} />
          <NavChild label="Suppliers" href="/dashboard/operations/suppliers" isActive={pathname.startsWith("/dashboard/operations/suppliers")} onNavigate={close} />
          <NavChild label="Procurement" href="/dashboard/operations/procurement" isActive={pathname.startsWith("/dashboard/operations/procurement")} onNavigate={close} />
        </NavSection>

        <NavSection
          label="People & Culture"
          icon={Users2}
          defaultOpen={pathname.startsWith("/dashboard/people")}
          isActive={pathname.startsWith("/dashboard/people")}
        >
          <NavChild label="Team Directory" href="/dashboard/people" isActive={pathname === "/dashboard/people"} onNavigate={close} />
          <NavChild label="Learning" href="/dashboard/people/learning" isActive={pathname.startsWith("/dashboard/people/learning")} onNavigate={close} />
          <NavChild label="Onboarding" href="/dashboard/people/onboarding" isActive={pathname.startsWith("/dashboard/people/onboarding")} onNavigate={close} />
          <NavChild label="Leave Calendar" href="/dashboard/people/leave" isActive={pathname.startsWith("/dashboard/people/leave")} onNavigate={close} />
        </NavSection>

      </nav>

      <div className="p-3 border-t border-[#e8e4da]/12">
        <p className="text-[10px] text-[#e8e4da]/40 text-center tracking-wide">
          The Finance Fold · v1.0
        </p>
      </div>
    </div>
  )

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden h-8 w-8 text-foreground"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={close} />
          <div className="absolute left-0 top-0 h-full w-64">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-3 right-3 z-50 h-8 w-8 text-[#e8e4da]"
              onClick={close}
            >
              <X className="h-5 w-5" />
            </Button>
            <SidebarContent />
          </div>
        </div>
      )}

      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-64 flex-col z-30">
        <SidebarContent />
      </aside>
    </>
  )
}
